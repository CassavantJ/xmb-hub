# Adding an app to the hub

Every app lives in its **own repo** and its **own Cloudflare Pages project**, on its own
subdomain: `https://<id>.raylmao.com`. The hub lists it with **one entry** in
[`src/data/apps.ts`](src/data/apps.ts).

Why subdomains rather than paths like `raylmao.com/apps/<id>`: each app deploys on its own and can
use any framework without base-path setup, and a bug in one app can't touch the hub's or another
app's storage or cookies. The trade-off is that apps don't share a login or saved data with the
hub.

Allow about 15 minutes for a new app, most of it waiting on the first deploy.

## 0. Pick an id

A short kebab-case name, for example `lift-log`. It becomes:

- the subdomain: `lift-log.raylmao.com`
- the repo name: `CassavantJ/lift-log`
- the hub address for embedded apps: `raylmao.com/app/lift-log`

## 1. Scaffold it

From the hub folder:

```bash
pnpm new-app lift-log "Lift Log" "Log workouts and watch your lifts trend upward."
```

This creates `../lift-log`, next to the hub (for example `Documents\Claude Apps\lift-log`), with:

- React, TypeScript and Vite at the **same versions as the hub**, plus the same lint, format and
  CI setup
- the hub's **look**: the monthly theme, Inter, and a slim "‹ Jake" bar linking back to the hub
  (hidden automatically when the hub embeds the app)
- **security headers** in `public/_headers` that already allow the hub to embed it
- the hub's favicon, and a first git commit

It also prints the registry entry for step 5. Then start building:

```bash
cd ../lift-log
pnpm install
pnpm dev
```

The app's dev server runs on port 5190 (or the next free port).

**Already built the app another way?** Skip this step. It just needs to be deployed on a
`raylmao.com` subdomain, and, if you want it embedded, allow framing (see step 5).

## 2. Put it on GitHub

From the app's folder:

```bash
gh repo create CassavantJ/lift-log --public --source . --push
```

Use `--private` instead if you'd rather keep the code private; Cloudflare deploys both.

## 3. Create its Cloudflare Pages project

The same flow as the hub:

1. **Workers & Pages → Create application**, then the **Pages** tab (not Workers) →
   **Connect to Git**.
2. Pick the new repo and **Begin setup**:

   | Field                  | Value                     |
   | ---------------------- | ------------------------- |
   | Project name           | `lift-log`                |
   | Production branch      | `main`                    |
   | Framework preset       | None                      |
   | Build command          | `pnpm build`              |
   | Build output directory | `dist`                    |
   | Environment variables  | `PNPM_VERSION` = `12.6.0` |

   `PNPM_VERSION` should match `packageManager` in the app's `package.json`.

3. **Save and Deploy**. It's live at `https://lift-log.pages.dev` in a minute or two.

The free plan allows 100 projects and 500 builds a month across all of them.

## 4. Give it its subdomain

In the new project: **Custom domains → Set up a custom domain** → `lift-log.raylmao.com` →
**Continue** → **Activate domain**. Cloudflare adds the DNS record and HTTPS certificate itself,
usually within a few minutes.

**Don't** add the DNS record by hand first; a record that isn't linked through Custom domains
gives a 522 error.

## 5. Add it to the hub

In the hub, add an entry to `src/data/apps.ts`. `pnpm new-app` printed one to paste:

```ts
{
  id: 'lift-log',
  title: 'Lift Log',
  description: 'Log workouts and watch your lifts trend upward.',
  category: 'apps',
  icon: 'dumbbell',
  url: subdomain('lift-log'),
  openMode: 'new-tab',
  status: 'live',
  tags: ['fitness'],
  repo: 'https://github.com/CassavantJ/lift-log',
},
```

| Field          | Notes                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `id`           | Unique, kebab-case.                                                                                       |
| `title`        | Shown in the menu.                                                                                        |
| `description`  | One line under the selected item, 90 characters at most.                                                  |
| `category`     | `apps`, `games`, `tools` or `projects` (the registry categories in `src/data/categories.ts`).             |
| `icon`         | A name from `src/icons/icons.ts`, or a path to a one-color SVG in `public/` (e.g. `/icons/lift-log.svg`). |
| `url`          | Usually `subdomain('<id>')`.                                                                              |
| `openMode`     | See below.                                                                                                |
| `status`       | `live`, `beta` (shows a badge) or `coming-soon` (listed but dimmed, can't be opened).                     |
| `tags`, `repo` | Optional.                                                                                                 |

Items appear under their category in the order they're listed. A category with no apps is hidden
automatically.

**Open modes**

| Mode       | What happens                                                                     | Use it for                                  |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| `new-tab`  | Opens in a new tab; the hub stays open.                                          | Most apps. The default in the snippet.      |
| `same-tab` | Replaces the hub; the browser's back button returns.                             | Apps you'd rather not open in a new tab.    |
| `embedded` | Opens full-screen inside the hub at `raylmao.com/app/<id>`, under the hub's bar. | Small tools and games that feel part of it. |

Embedded apps must be on a `raylmao.com` subdomain (the hub's security policy only frames those,
and a test enforces it), and must allow the hub to frame them. The template's `public/_headers`
already does this with
`frame-ancestors 'self' https://raylmao.com https://*.xmb-hub.pages.dev`. On a controller, B
belongs to the embedded app, so Select/View/Share returns to the hub.

**Not ready yet?** Add the entry with `status: 'coming-soon'` to show it in the menu before the
app exists.

Then check it and ship it through a pull request:

```bash
pnpm check
git switch -c add-lift-log
git commit -am "feat: add Lift Log"
git push -u origin add-lift-log
gh pr create --fill
```

The pull request gets a preview at `https://add-lift-log.xmb-hub.pages.dev`. Try the new item
there, then merge. `main` deploys to raylmao.com in about a minute.

## Checklist

- [ ] `pnpm new-app <id>` and build the app
- [ ] `gh repo create …` to push it to GitHub
- [ ] Pages project with `pnpm build`, `dist` and `PNPM_VERSION`
- [ ] Custom domain `<id>.raylmao.com` is Active
- [ ] Entry in `src/data/apps.ts`, `pnpm check` passes
- [ ] Pull request preview looks right, then merge

## Updating or removing an app

- **Update:** push to the app's repo; its own Pages project redeploys. The hub doesn't change.
- **Rename, recategorize or retire:** edit or delete its entry in `src/data/apps.ts`.
- **Take it offline:** in the app's Pages project, remove the custom domain, then delete the
  project under **Settings**.

## Troubleshooting

- **`pnpm check` fails in the hub after adding an entry:** the test names the problem, such as an
  id that isn't kebab-case, a description over 90 characters, a URL that isn't https, an embedded
  app that isn't on a `raylmao.com` subdomain, or a custom SVG icon that doesn't exist.
- **An embedded app shows a blank frame:** check the app's `public/_headers` includes
  `frame-ancestors … https://raylmao.com`, that nothing sets `X-Frame-Options: DENY`, and that it
  really is on a `raylmao.com` subdomain.
- **The app calls an API and it's blocked:** add that origin to `connect-src` in the app's
  `public/_headers`.
- **522 on the subdomain:** the DNS record was added by hand. Delete it and add the domain through
  the project's **Custom domains** instead.
- **The build fails while installing:** set `PNPM_VERSION` in the project's settings to match
  `packageManager` in `package.json`, then retry the deployment.
