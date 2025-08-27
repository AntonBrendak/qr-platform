export const runtime = 'nodejs';

import sharp from 'sharp';
import {hasOriginalIcon, readOriginalIcon} from '../../../../../src/server/storage';

const ALLOWED = new Set([192, 512, 96, 144, 180, 256, 384]);

function placeholderSvg(size: number, text = 'QC', bg = '#0d6efd', fg = '#ffffff', scale = 0.6) {
  const fontSize = Math.round(size * scale);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="100%" height="100%" rx="${Math.round(size * 0.12)}" fill="${bg}"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        font-size="${fontSize}" font-weight="700" fill="${fg}">${text}</text>
    </svg>`
  );
}

async function makePngFromBuffer(src: Buffer, size: number, {maskable = false}: {maskable?: boolean}) {
  if (!maskable) {
    return sharp(src).resize(size, size, {fit: 'cover', position: 'centre'}).png().toBuffer();
  }
  const inner = Math.round(size * 0.8);
  const margin = Math.round((size - inner) / 2);
  const resized = await sharp(src).resize(inner, inner, {fit: 'cover'}).png().toBuffer();

  const canvas = sharp({
    create: {width: size, height: size, channels: 4, background: {r: 0, g: 0, b: 0, alpha: 0}}
  });

  return canvas.composite([{input: resized, top: margin, left: margin}]).png().toBuffer();
}

export async function GET(req: Request, {params}: {params: {size: string}}) {
  try {
    const size = Number(params.size);
    const url = new URL(req.url);
    const maskable = url.searchParams.get('maskable') === '1';
    const tenant = url.searchParams.get('tenant') || 'default';

    const finalSize = ALLOWED.has(size) ? size : 192;

    let png: Buffer;
    if (await hasOriginalIcon(tenant)) {
      const original = await readOriginalIcon(tenant);
      png = await makePngFromBuffer(original, finalSize, {maskable});
    } else {
      const svg = placeholderSvg(finalSize);
      png = await sharp(svg).png().toBuffer();
      if (maskable) {
        png = await makePngFromBuffer(png, finalSize, {maskable: true});
      }
    }

    // ВАЖНО: отдать Uint8Array (BodyInit) вместо Buffer, чтобы не ругался TypeScript
    const bytes = new Uint8Array(png);

    return new Response(bytes, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ok: false, error: e?.message ?? 'icon_failed'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'}
    });
  }
}