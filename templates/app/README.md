# __APP_TITLE__

__APP_DESCRIPTION__

Part of [__HUB_NAME__'s hub](__HUB_URL__). Scaffolded from the hub's app template, so it shares
the hub's theme, font and "back to the hub" bar (see `src/hub/`).

## Develop

```bash
pnpm install
pnpm dev
```

`pnpm check` runs the typecheck, lint and format check; CI runs it on every push.

## Deploy

Hosted as its own Cloudflare Pages project at `https://__APP_ID__.__DOMAIN__`. The full steps
(GitHub repo, Pages project, subdomain and hub registry entry) are in the hub's
`ADDING_AN_APP.md`.

`public/_headers` lets the hub embed this app (`frame-ancestors`). If the app calls an API or
loads anything from another origin, add that origin to the Content-Security-Policy there.
