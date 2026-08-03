/**
 * Converte PNG em public/images/{hero,about} → WebP/AVIF.
 * Idempotente. Em CF Pages (CF_PAGES=1) ou --strip-png, remove PNG após converter.
 *
 * Uso: node scripts/optimize-static-images.mjs
 *      npm run optimize:static
 */
import { unlink, stat } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import sharp from 'sharp';

const root = resolve(process.cwd());
const dirs = [
  resolve(root, 'public/images/hero'),
  resolve(root, 'public/images/about'),
];

/** Variantes por tipo de asset (evita gerar widths inúteis). */
function variantsFor(baseName, dirPath) {
  const norm = dirPath.replace(/\\/g, '/');
  const inAbout = norm.includes('/images/about');
  if (/mobile|vertical|-h5/i.test(baseName)) {
    return [
      { suffix: '', width: null, quality: 72 },
      { suffix: '-768', width: 768, quality: 70 },
    ];
  }
  if (inAbout || /-p\d|portrait|headshot/i.test(baseName)) {
    return [
      { suffix: '-540', width: 540, quality: 70 },
      { suffix: '-320', width: 320, quality: 68 },
      { suffix: '', width: null, quality: 72 },
    ];
  }
  return [
    { suffix: '', width: null, quality: 72 },
    { suffix: '-1280', width: 1280, quality: 72 },
  ];
}

const stripPng =
  process.env.CF_PAGES === '1' ||
  process.env.STRIP_SOURCE_PNG === '1' ||
  process.argv.includes('--strip-png');

async function needsRebuild(src, dest) {
  try {
    const [a, b] = await Promise.all([stat(src), stat(dest)]);
    return a.mtimeMs > b.mtimeMs;
  } catch {
    return true;
  }
}

async function convertPng(srcPath) {
  const dir = dirname(srcPath);
  const base = basename(srcPath, extname(srcPath));
  const meta = await sharp(srcPath).metadata();
  const results = [];
  const variants = variantsFor(base, dir);

  for (const variant of variants) {
    if (variant.width && meta.width && variant.width >= meta.width) continue;

    const webpOut = join(dir, `${base}${variant.suffix}.webp`);
    const avifOut = join(dir, `${base}${variant.suffix}.avif`);
    const pipeline = (format) => {
      let img = sharp(srcPath);
      if (variant.width) {
        img = img.resize({ width: variant.width, withoutEnlargement: true });
      }
      if (format === 'webp') return img.webp({ quality: variant.quality, effort: 4 });
      return img.avif({ quality: Math.max(variant.quality - 8, 45), effort: 4 });
    };

    if (await needsRebuild(srcPath, webpOut)) {
      await pipeline('webp').toFile(webpOut);
      results.push(webpOut);
    }

    if (await needsRebuild(srcPath, avifOut)) {
      await pipeline('avif').toFile(avifOut);
      results.push(avifOut);
    }
  }

  if (stripPng) {
    const webpFull = join(dir, `${base}.webp`);
    try {
      await stat(webpFull);
      await unlink(srcPath);
      console.log(`[optimize-static] stripped ${basename(srcPath)}`);
    } catch {
      // mantém PNG se conversão falhou
    }
  }

  return results;
}

async function main() {
  let created = 0;
  for (const dir of dirs) {
    let files = [];
    try {
      files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'));
    } catch {
      console.warn(`[optimize-static] skip missing dir ${dir}`);
      continue;
    }

    for (const file of files) {
      const src = join(dir, file);
      const out = await convertPng(src);
      created += out.length;
      if (out.length) {
        console.log(`[optimize-static] ${file} → ${out.length} file(s)`);
      }
    }
  }
  console.log(`[optimize-static] done (${created} files written/updated). stripPng=${stripPng}`);
}

main().catch((error) => {
  console.error('[optimize-static]', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
