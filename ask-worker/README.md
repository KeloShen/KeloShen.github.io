# ask-worker: the backend for the `ask` command

A Cloudflare Worker that keeps the DeepSeek key secret, rate-limits visitors and answers as Kunxiang's digital self.

## How it answers
- **Always in the prompt:** `persona.md` (tone and boundaries), the website profile (`content/profile.en.md`), and a one-line catalogue of the documents in `content/ask/`.
- **On demand:** when a question needs details, the model calls `load_docs` and the full documents are added. Small talk loads nothing.
- Website content is fetched live (cached 10 min). Adding or editing a file in `content/ask/` needs **no redeploy**; a GitHub Action rebuilds `content/ask/index.json`.
- Only `persona.md` and the code are bundled into the worker. Change those → redeploy.

## Deploy (one time, about 10 minutes)
You need Node.js 18+ and your Cloudflare account.

```bash
cd ask-worker
npx wrangler login                 # opens the browser: log in to Cloudflare and allow access
npx wrangler secret put API_KEY    # paste your DeepSeek API key when asked
npx wrangler deploy                # prints a URL like https://digital-self.<your-subdomain>.workers.dev
```

Send that URL back (or put it into `askEndpoint` in `js/config.js` yourself). Done.

## Costs and safety
- Each visitor IP: at most 8 questions per minute; questions are capped at 500 characters.
- Set a spending limit or keep a small balance in the DeepSeek console.
- Only the website origin can call the worker (`ALLOWED_ORIGINS` in `wrangler.toml`).
- Everything in `content/ask/` is public because the repo is public.

## Settings (`wrangler.toml`)
| Var | Meaning |
|---|---|
| `MODEL` | `deepseek-flash` (fast, cheap) or `deepseek-v4-pro` (stronger, pricier) |
| `OPENAI_BASE_URL` | `https://api.deepseek.com` (any OpenAI-compatible API works) |
| `SITE_URL` | where the profile and documents are read from |
| `ALLOWED_ORIGINS` | sites allowed to call the worker |

Logs while testing: `npx wrangler tail`
