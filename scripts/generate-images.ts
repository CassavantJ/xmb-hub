/**
 * Generates the favicon set and the social share image from code, so they stay consistent and
 * can be redrawn after a design change. Run `pnpm images`; the output in public/ is committed.
 *
 * Node runs this TypeScript directly (type stripping), so it only imports source files that have
 * no imports of their own.
 */
import { readFile, writeFile } from 'node:fs/promises';

import { Resvg } from '@resvg/resvg-js';
import { FolderGit2, Gamepad2, LayoutGrid, Settings, User, Wrench, type IconNode } from 'lucide';
import satori from 'satori';

import { site } from '../src/data/site.ts';
import { oklchToRgb, toHex } from '../src/theme/color.ts';

const publicDir = new URL('../public/', import.meta.url);
const fontDir = new URL('../node_modules/@fontsource/inter/files/', import.meta.url);

// Brand colors: the Violet theme's background ramp (see src/theme/palette.ts and global.css).
const THEME = { l: 0.44, c: 0.12, h: 295 };
const TOP = toHex(oklchToRgb(THEME.l, THEME.c, THEME.h));
const MID = toHex(oklchToRgb(THEME.l * 0.62, THEME.c * 0.85, THEME.h));
const BOTTOM = toHex(oklchToRgb(THEME.l * 0.35, THEME.c * 0.6, THEME.h));
const WAVE = toHex(oklchToRgb(0.93, THEME.c * 0.35, THEME.h));

// ---------------------------------------------------------------------------------------------
// Icons: a wave mark on the theme gradient.

interface MarkOptions {
  /** Rounded corners for browser tabs; full-bleed where the OS applies its own mask. */
  rounded: boolean;
  /** Scale of the artwork inside the square, so maskable icons keep it in the safe zone. */
  scale: number;
}

function markSvg({ rounded, scale }: MarkOptions): string {
  const offset = (64 * (1 - scale)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${TOP}"/>
      <stop offset="0.55" stop-color="${MID}"/>
      <stop offset="1" stop-color="${BOTTOM}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${rounded ? 14 : 0}" fill="url(#bg)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="#fff" stroke-linecap="round">
    <path d="M9 29c7-9 15-9 22-2s15 7 24-3" stroke-width="4.5"/>
    <path d="M9 38c7-7 15-7 22-1.5s15 5.5 24-2.5" stroke-width="2.5" opacity=".55"/>
  </g>
</svg>
`;
}

function png(svg: string, size: number): Buffer {
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
}

/** An .ico that simply wraps PNG images (supported by every current browser). */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;
  images.forEach(({ size, data }, index) => {
    const entry = index * 16;
    directory.writeUInt8(size % 256, entry); // 0 means 256
    directory.writeUInt8(size % 256, entry + 1);
    directory.writeUInt16LE(1, entry + 4); // color planes
    directory.writeUInt16LE(32, entry + 6); // bits per pixel
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, directory, ...images.map(({ data }) => data)]);
}

// ---------------------------------------------------------------------------------------------
// Share image: the menu's look, 1200×630.

const W = 1200;
const H = 630;

/**
 * The same ribbons as the WebGL shader (src/components/Background/waves.frag.glsl), frozen at
 * one moment and drawn as SVG paths. They sit lower than on the site, in the bottom third, so
 * they pass under the text instead of through it.
 */
function wavesSvg(): string {
  const moment = 14;
  const lower = 0.24;
  const ribbons = [
    { base: 0.4 - lower, phase: 0, amplitude: 0.055, thickness: 0.075, speed: 0.1 },
    { base: 0.36 - lower, phase: 2.4, amplitude: 0.045, thickness: 0.05, speed: 0.07 },
    { base: 0.44 - lower, phase: 4.1, amplitude: 0.065, thickness: 0.03, speed: 0.13 },
  ];
  const paths = ribbons.map(({ base, phase, amplitude, thickness, speed }) => {
    const top: string[] = [];
    const bottom: string[] = [];
    for (let x = 0; x <= W; x += 6) {
      const p = x / H;
      const t = moment * speed;
      const center =
        base +
        amplitude * Math.sin(p * 2.2 + t + phase) +
        amplitude * 0.45 * Math.sin(p * 4.3 - t * 1.3 + phase * 1.7);
      const half = thickness * (0.6 + 0.4 * Math.sin(p * 1.1 - t * 0.6 + phase * 2.3));
      top.push(`${x},${(H * (1 - center - half)).toFixed(1)}`);
      bottom.push(`${x},${(H * (1 - center + half)).toFixed(1)}`);
    }
    const band = `M${top.join('L')}L${[...bottom].reverse().join('L')}Z`;
    return `<path d="${band}" fill="url(#body)"/>
    <path d="M${top.join('L')}" stroke="${WAVE}" stroke-opacity=".75" stroke-width="1.8" fill="none" filter="url(#glow)"/>
    <path d="M${bottom.join('L')}" stroke="${WAVE}" stroke-opacity=".3" stroke-width="1" fill="none"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="glow" x="-5%" y="-100%" width="110%" height="300%">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${WAVE}" stop-opacity=".12"/>
      <stop offset="1" stop-color="${WAVE}" stop-opacity=".02"/>
    </linearGradient>
  </defs>
  ${paths.join('\n  ')}
</svg>`;
}

/** A Lucide icon as a standalone SVG, optionally with the menu's glow. */
function iconSvg(node: IconNode, glow: boolean): string {
  const children = node
    .map(([tag, attributes]) => {
      const attrs = Object.entries(attributes)
        .map(([name, value]) => `${name}="${String(value)}"`)
        .join(' ');
      return `<${tag} ${attrs}/>`;
    })
    .join('');
  const filter = glow
    ? `<defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${filter}<g${glow ? ' filter="url(#g)"' : ''}>${children}</g></svg>`;
}

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

/** Minimal element factory for satori (it takes React-shaped objects; React isn't needed). */
type Node = { type: string; props: Record<string, unknown> } | string;
const h = (type: string, props: Record<string, unknown>, ...children: Node[]): Node => ({
  type,
  // A lone child must not be wrapped in an array, or satori counts it as a list.
  props: { ...props, children: children.length === 1 ? children[0] : children },
});

async function shareImage(): Promise<Buffer> {
  const categories = [User, LayoutGrid, Gamepad2, Wrench, FolderGit2, Settings];
  const selected = 1;
  const anchorX = 300;
  const gap = 150;

  const icons = categories.map((node, index) => {
    const isSelected = index === selected;
    const size = isSelected ? 84 : 58;
    return h('img', {
      src: dataUri(iconSvg(node, isSelected)),
      width: size,
      height: size,
      style: {
        position: 'absolute',
        left: anchorX + (index - selected) * gap - size / 2,
        top: 150 - size / 2,
        opacity: isSelected ? 1 : 0.6,
      },
    });
  });

  const root = h(
    'div',
    {
      style: {
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
        fontFamily: 'Inter',
        color: '#fff',
        backgroundImage: `linear-gradient(172deg, ${TOP} 0%, ${MID} 48%, ${BOTTOM} 100%)`,
      },
    },
    h('img', {
      src: dataUri(wavesSvg()),
      width: W,
      height: H,
      style: { position: 'absolute', left: 0, top: 0 },
    }),
    ...icons,
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: anchorX - 60,
          top: 206,
          width: 120,
          display: 'flex',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 400,
        },
      },
      'Apps',
    ),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: anchorX - 42,
          top: 262,
          display: 'flex',
          flexDirection: 'column',
        },
      },
      h(
        'div',
        {
          style: {
            fontSize: 104,
            fontWeight: 300,
            letterSpacing: -2,
            lineHeight: 1,
            textShadow: '0 0 24px rgba(255,255,255,0.45)',
          },
        },
        site.name,
      ),
      h(
        'div',
        {
          style: { marginTop: 22, fontSize: 34, fontWeight: 300, color: 'rgba(255,255,255,0.85)' },
        },
        'Apps · Games · Tools · Projects',
      ),
    ),
    // Where the clock sits on the site: top right, over a hairline.
    h(
      'div',
      {
        style: {
          position: 'absolute',
          right: 56,
          top: 40,
          paddingBottom: 8,
          fontSize: 26,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.35)',
        },
      },
      site.domain,
    ),
  );

  const [light, regular] = await Promise.all([
    readFile(new URL('inter-latin-300-normal.woff', fontDir)),
    readFile(new URL('inter-latin-400-normal.woff', fontDir)),
  ]);
  const svg = await satori(root as unknown as Parameters<typeof satori>[0], {
    width: W,
    height: H,
    fonts: [
      { name: 'Inter', data: light, weight: 300, style: 'normal' },
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
    ],
  });
  return png(svg, W);
}

// ---------------------------------------------------------------------------------------------

async function main() {
  const tab = markSvg({ rounded: true, scale: 1 });
  const fullBleed = markSvg({ rounded: false, scale: 0.86 });
  const maskable = markSvg({ rounded: false, scale: 0.7 });

  const outputs: [string, string | Buffer][] = [
    ['favicon.svg', tab],
    ['favicon.ico', ico([16, 32, 48].map((size) => ({ size, data: png(tab, size) })))],
    ['apple-touch-icon.png', png(fullBleed, 180)],
    ['icon-192.png', png(tab, 192)],
    ['icon-512.png', png(tab, 512)],
    ['icon-maskable-512.png', png(maskable, 512)],
    ['og.png', await shareImage()],
  ];

  for (const [name, data] of outputs) {
    await writeFile(new URL(name, publicDir), data);
    const bytes = typeof data === 'string' ? Buffer.byteLength(data) : data.length;
    console.log(`public/${name}  ${(bytes / 1024).toFixed(1)} KB`);
  }
}

await main();
