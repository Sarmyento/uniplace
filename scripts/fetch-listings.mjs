/**
 * Busca feed XML de listings (P4 CRM) → public/data/listings.xml.
 * Sem LISTINGS_FEED_URL: copia listings-mock.xml se existir.
 *
 * Uso: node scripts/fetch-listings.mjs
 * Local: coloque LISTINGS_FEED_URL em `.env` (gitignored).
 */
import { copyFile, mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

async function loadDotEnv() {
  try {
    const raw = await readFile(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    /* .env opcional */
  }
}

await loadDotEnv();

const destinationPath = resolve(process.cwd(), 'public/data/listings.xml');
const mockPath = resolve(process.cwd(), 'public/data/listings-mock.xml');
const feedUrl = process.env.LISTINGS_FEED_URL?.trim();

async function ensureOutputDir() {
  await mkdir(dirname(destinationPath), { recursive: true });
}

async function useMock(reason) {
  await ensureOutputDir();
  try {
    await access(mockPath);
  } catch {
    console.warn(`[listings] ${reason}. Mock ausente (${mockPath}); skip.`);
    return;
  }
  await copyFile(mockPath, destinationPath);
  console.warn(`[listings] ${reason}. Using mock feed at public/data/listings-mock.xml.`);
}

async function fetchRemoteFeed(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
  }

  const xmlContent = await response.text();
  if (!xmlContent.trim()) {
    throw new Error('Empty feed response');
  }

  await ensureOutputDir();
  await writeFile(destinationPath, xmlContent, 'utf8');
  console.log('[listings] Feed fetched successfully to public/data/listings.xml.');
}

async function main() {
  if (!feedUrl) {
    await useMock('LISTINGS_FEED_URL not set');
    return;
  }

  try {
    await fetchRemoteFeed(feedUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await useMock(`Failed to fetch remote feed (${message})`);
  }
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[listings] Unexpected error: ${message}`);
  process.exitCode = 1;
});
