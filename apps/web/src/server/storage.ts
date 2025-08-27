import {promises as fs} from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ICONS_DIR = process.env.ICONS_DIR ?? path.join(ROOT, '.data', 'icons');

export function iconsDir(tenant = 'default') {
  return path.join(ICONS_DIR, tenant);
}

export function originalIconPath(tenant = 'default') {
  return path.join(iconsDir(tenant), 'original');
}

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, {recursive: true});
}

export async function saveOriginalIcon(buffer: Buffer, tenant = 'default') {
  await ensureDir(iconsDir(tenant));
  await fs.writeFile(originalIconPath(tenant), buffer);
}

export async function deleteOriginalIcon(tenant = 'default') {
  try {
    await fs.unlink(originalIconPath(tenant));
  } catch {}
}

export async function hasOriginalIcon(tenant = 'default') {
  try {
    await fs.access(originalIconPath(tenant));
    return true;
  } catch {
    return false;
  }
}

export async function readOriginalIcon(tenant = 'default') {
  return fs.readFile(originalIconPath(tenant));
}