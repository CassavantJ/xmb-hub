/**
 * Scaffolds a new app next to the hub, sharing its look, tooling and security headers:
 *
 *   pnpm new-app <id> ["Title"] ["One-line description"]
 *
 * Creates ../<id> (a sibling of this repo), fills in templates/app, copies the hub's theme,
 * icons and editor settings, pins the hub's dependency versions and makes the first commit.
 * ADDING_AN_APP.md covers putting it online and adding it to the hub.
 *
 * `--into <folder>` creates it somewhere else (used to test the template).
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import * as prettier from 'prettier';

import { site, siteUrl } from '../src/data/site.ts';

interface PackageJson {
  packageManager: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const hubDir = fileURLToPath(new URL('../', import.meta.url));
const templateDir = join(hubDir, 'templates', 'app');

/** Hub files every app shares, as [source in the hub, destination in the app]. */
const SHARED_FILES: [string, string][] = [
  ['.gitignore', '.gitignore'],
  ['.gitattributes', '.gitattributes'],
  ['.editorconfig', '.editorconfig'],
  ['.node-version', '.node-version'],
  ['.prettierrc.json', '.prettierrc.json'],
  ['.vscode/extensions.json', '.vscode/extensions.json'],
  ['.vscode/settings.json', '.vscode/settings.json'],
  ['public/favicon.svg', 'public/favicon.svg'],
  ['public/favicon.ico', 'public/favicon.ico'],
  ['public/apple-touch-icon.png', 'public/apple-touch-icon.png'],
  ['src/theme/palette.ts', 'src/hub/palette.ts'],
  ['src/theme/color.ts', 'src/hub/color.ts'],
];

/** Files in the template that can contain placeholders. Everything else is copied as-is. */
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.css', '.html', '.json', '.md', '.yml']);

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const titleFromId = (id: string) =>
  id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { into: { type: 'string' } },
});
const [id = '', title = titleFromId(id), description = `${titleFromId(id)}, by ${site.name}.`] =
  positionals;

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  fail(
    'Usage: pnpm new-app <id> ["Title"] ["Description"]\nThe id must be kebab-case, e.g. lift-log.',
  );
}

const target = join(values.into ?? join(hubDir, '..'), id);
if (existsSync(target)) fail(`${target} already exists; pick another id or remove it first.`);

const hubPackage = JSON.parse(await readFile(join(hubDir, 'package.json'), 'utf8')) as PackageJson;
const githubOwner = new URL(site.repo).pathname.split('/')[1] ?? '';

const tokens: Record<string, string> = {
  __APP_ID__: id,
  __APP_TITLE__: title,
  __APP_DESCRIPTION__: description,
  __DOMAIN__: site.domain,
  __HUB_NAME__: site.name,
  __HUB_URL__: siteUrl,
  __PACKAGE_MANAGER__: hubPackage.packageManager,
};
const fill = (text: string) =>
  Object.entries(tokens).reduce((result, [token, value]) => result.replaceAll(token, value), text);

// The app gets the hub's Prettier settings (copied below), so format with them: a long title or
// description can push a filled-in line past the print width.
const prettierOptions = await prettier.resolveConfig(join(hubDir, 'package.json'));
async function format(path: string, text: string): Promise<string> {
  const { inferredParser } = await prettier.getFileInfo(path);
  return inferredParser ? prettier.format(text, { ...prettierOptions, filepath: path }) : text;
}

async function copyTemplate(from: string, to: string): Promise<void> {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    const source = join(from, entry.name);
    const destination = join(to, entry.name);
    if (entry.isDirectory()) await copyTemplate(source, destination);
    else if (TEXT_EXTENSIONS.has(extname(entry.name)) || entry.name === '_headers') {
      await writeFile(destination, await format(destination, fill(await readFile(source, 'utf8'))));
    } else await copyFile(source, destination);
  }
}

// 1. The template, with placeholders filled in.
await copyTemplate(templateDir, target);

// 2. Dependencies pinned to the versions the hub uses, so every app starts on the same stack.
const appPackagePath = join(target, 'package.json');
const appPackage = JSON.parse(await readFile(appPackagePath, 'utf8')) as PackageJson;
const hubVersions = { ...hubPackage.dependencies, ...hubPackage.devDependencies };
for (const group of [appPackage.dependencies, appPackage.devDependencies]) {
  for (const name of Object.keys(group)) {
    const version = hubVersions[name];
    if (version === undefined) fail(`templates/app needs ${name}, but the hub doesn't use it.`);
    group[name] = version;
  }
}
await writeFile(appPackagePath, `${JSON.stringify(appPackage, null, 2)}\n`);

// 3. Files shared with the hub (theme, icons, editor and format settings).
for (const [from, to] of SHARED_FILES) {
  const destination = join(target, to);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(hubDir, from), destination);
}

// 4. A git repo with the hub's commit identity and a first commit.
const git = (args: string[], cwd: string) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const hubIdentity = (key: string) => {
  try {
    return git(['config', key], hubDir);
  } catch {
    return '';
  }
};
git(['init', '-q', '-b', 'main'], target);
for (const key of ['user.name', 'user.email']) {
  const value = hubIdentity(key);
  if (value) git(['config', key, value], target);
}
git(['add', '-A'], target);
git(['commit', '-q', '-m', 'chore: scaffold from the xmb-hub app template'], target);

console.log(`
Created ${target}

Next:
  cd ${target}
  pnpm install
  pnpm dev

Then follow ADDING_AN_APP.md: GitHub repo, Pages project, ${id}.${site.domain}, and this
registry entry in the hub's src/data/apps.ts:

  {
    id: '${id}',
    title: '${title}',
    description: '${description}',
    category: 'apps',
    icon: 'rocket',
    url: subdomain('${id}'),
    openMode: 'new-tab',
    status: 'coming-soon',
    repo: 'https://github.com/${githubOwner}/${id}',
  },
`);
