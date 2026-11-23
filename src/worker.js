// Runs in front of the static site in ./public.
// If the Cloudflare variable `maintenance` is "true", every page shows the
// "Down for Maintenance" screen. Anything else (or not set) = site as normal.
// Pages that aren't found go through quietPage (see src/quiet.js).
import { quietPage } from "./quiet.js";

const HIDDEN = new Set([
  "/maintenance",
  "/maintenance/",
  "/maintenance.html",
  "/assets/maintenance-peon.webp",
]);

export default {
  async fetch(request, env) {
    const on = String(env.maintenance ?? "").trim().toLowerCase() === "true";
    const url = new URL(request.url);

    if (!on) {
      // Hide the maintenance page and its image while maintenance is off.
      if (HIDDEN.has(url.pathname)) {
        return env.ASSETS.fetch(new Request(new URL("/__not-found__", url), { method: request.method }));
      }
      return quietPage(request, env, await env.ASSETS.fetch(request));
    }

    // The maintenance page's own image still needs to load.
    if (url.pathname === "/assets/maintenance-peon.webp") return env.ASSETS.fetch(request);

    const page = await env.ASSETS.fetch(new Request(new URL("/maintenance", url)));
    return new Response(request.method === "HEAD" ? null : page.body, {
      status: 503, // tells search engines it's temporary
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "retry-after": "3600",
      },
    });
  },
};
