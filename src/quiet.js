// Quiet pages: a few private addresses show a one-line page instead of the 404.
//
// Which addresses, and what they say, is never in this repository. It all
// lives in the Cloudflare secret ECHO_TABLE (Settings > Variables and Secrets):
//   {"s": "<salt>", "h": {"<sha256 hex>": ["<id>", "<line of text>"], ...}}
// An address matches when sha256(salt + ":" + normalised path) is a key of "h".
// Anything else gets the site's ordinary 404, untouched.
//
// Optional picture: put an image in the KV namespace bound as ECHO_MEDIA under
// the entry's <id> (with metadata {"type": "image/png"} or similar). It is only
// ever served from the page's own address, so it has no public path.

const MAX_LEN = 48;
let cachedRaw = null;
let cachedTable = null;

function table(env) {
  const raw = env.ECHO_TABLE;
  if (!raw) return null;
  if (raw !== cachedRaw) {
    try { cachedTable = JSON.parse(raw); } catch { cachedTable = null; }
    cachedRaw = raw;
  }
  return cachedTable && cachedTable.s && cachedTable.h ? cachedTable : null;
}

function normalise(pathname) {
  let p;
  try { p = decodeURIComponent(pathname); } catch { return ""; }
  return p.toLowerCase().replace(/[\/\s-]+/g, "");
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function pageHtml(line) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Echowrought</title>
<style>
  html, body { margin: 0; height: 100%; background: #08070a; }
  body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; padding: 32px; box-sizing: border-box; }
  p { margin: 0; max-width: 34em; text-align: center; color: #8a7a9a; font: italic 400 clamp(18px, 2.4vw, 24px)/1.7 "Cormorant Garamond", Georgia, "Times New Roman", serif; letter-spacing: .02em; opacity: 0; animation: in 2.2s ease .4s forwards; }
  img { max-width: min(90vw, 560px); max-height: 60vh; opacity: 0; animation: in 2.2s ease 1.6s forwards; }
  @keyframes in { to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { p, img { animation: none; opacity: 1; } }
</style>
</head>
<body>
<p>${escapeHtml(line)}</p>
<img src="?v" alt="" onerror="this.remove()">
</body>
</html>`;
}

// `miss` is the ordinary 404 response from the static site.
export async function quietPage(request, env, miss) {
  if (miss.status !== 404 || (request.method !== "GET" && request.method !== "HEAD")) return miss;
  const t = table(env);
  if (!t) return miss;

  const url = new URL(request.url);
  const word = normalise(url.pathname);
  if (!word || word.length > MAX_LEN) return miss;

  // Rate limit guesses per visitor; over the limit, everything looks like a miss.
  if (env.ECHO_LIMIT) {
    const who = request.headers.get("cf-connecting-ip") || "unknown";
    try {
      const { success } = await env.ECHO_LIMIT.limit({ key: who });
      if (!success) return miss;
    } catch { /* limiter unavailable: carry on */ }
  }

  const entry = t.h[await sha256Hex(t.s + ":" + word)];
  if (!Array.isArray(entry)) return miss;
  const [id, line] = entry;
  const head = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "referrer-policy": "no-referrer" };

  if (url.searchParams.has("v")) {
    if (!env.ECHO_MEDIA || !id) return miss;
    const { value, metadata } = await env.ECHO_MEDIA.getWithMetadata(String(id), { type: "arrayBuffer" });
    if (!value) return miss;
    return new Response(request.method === "HEAD" ? null : value, {
      headers: { ...head, "content-type": (metadata && metadata.type) || "image/png" },
    });
  }

  return new Response(request.method === "HEAD" ? null : pageHtml(line || ""), {
    headers: { ...head, "content-type": "text/html; charset=utf-8" },
  });
}
