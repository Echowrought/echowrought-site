# echowrought.com

The website for **Echowrought Games**. It's a plain static site: HTML, CSS and a little JavaScript, with no build step.

```
public/            everything that goes live
  index.html       the homepage
  404.html         the "page not found" page
  css/site.css     all styles (colours and fonts are at the top)
  js/site.js       tabs + scroll fade-ins
  assets/          images, favicon, share image
wrangler.jsonc     Cloudflare settings (serves ./public)
```

## How changes go live

1. Someone opens a **pull request** with their change.
2. The studio owner reviews and approves it.
3. When it's merged into `main`, Cloudflare publishes it to echowrought.com automatically.

Nobody can push straight to `main`. Every change needs the owner's approval first.

## Contributing (for helpers)

- Fork this repo, make your change on a branch in your fork, then open a pull request here.
- Keep changes small and say what you changed and why in the PR description.
- Don't add tracking scripts, third-party embeds or new external services without asking first.
- Never commit passwords, API keys or tokens. This repo is public.

## Brand quick reference

| Colour | Hex | Used for |
| --- | --- | --- |
| Void Slate | `#0B0F17` | page background |
| Nightfall | `#152238` | panels |
| Aster Violet | `#5A4B8A` | glows, fills |
| Antique Gold | `#C9A66B` | mark, main buttons |
| Parchment | `#E6D9B8` | headings |
| Moonlit | `#C8D4E8` | body text |

Fonts: Cinzel (titles), Cormorant Garamond (headlines), Inter (body).

## Open TODOs

- Covenant Codex links (`data-todo="codex-url"` in `index.html`) need the public Codex URL.
