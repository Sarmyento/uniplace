// @ts-check
import { defineConfig, memoryCache, logHandlers } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { astroStack } from './src/config/astro-stack.mjs';

const previewSite = 'https://sarmyento.github.io/uniplace';
const previewBase = '/uniplace/';
const isPreviewBuild = process.env.PUBLIC_DEPLOY_TARGET === 'github-pages';

/** @type {string} */
const siteUrl =
  process.env.PUBLIC_SITE_URL ?? (isPreviewBuild ? previewSite : 'https://uniplace.com.br');
const base = process.env.PUBLIC_BASE_PATH ?? (isPreviewBuild ? previewBase : undefined);

if (astroStack.cloudflare && astroStack.output === 'static') {
  console.warn(
    '[astro-stack] cloudflare: true com output: static — adapter CF costuma exigir output: server. Confirme o modo de deploy.',
  );
}

if (astroStack.cache === 'cloudflare' && !astroStack.cloudflare) {
  throw new Error(
    '[astro-stack] cache: "cloudflare" exige cloudflare: true (ver src/config/astro-stack.mjs).',
  );
}

if (astroStack.output === 'server' && !astroStack.cloudflare) {
  throw new Error(
    '[astro-stack] output: "server" exige um adapter. Ligue cloudflare: true ou ajuste o host.',
  );
}

/** @type {import('astro').AstroIntegration[]} */
const integrations = [sitemap()];

if (astroStack.mdx) {
  const { default: mdx } = await import('@astrojs/mdx');
  integrations.push(mdx());
}

/** @type {import('astro').AstroUserConfig} */
const config = {
  site: siteUrl,
  base,
  trailingSlash: 'never',
  output: astroStack.output,
  integrations,
  build: {
    assets: '_astro',
    // Sites leves: evita CSS render-blocking no PageSpeed (A23 defaults-perf-seo-astro)
    inlineStylesheets: 'always',
  },
  vite: {
    css: {
      devSourcemap: true,
    },
  },
};

if (astroStack.cloudflare) {
  const { default: cloudflare } = await import('@astrojs/cloudflare');
  config.adapter = cloudflare();
}

if (astroStack.cache === 'memory') {
  config.cache = { provider: memoryCache() };
} else if (astroStack.cache === 'cloudflare') {
  const { cacheCloudflare } = await import('@astrojs/cloudflare/cache');
  config.cache = { provider: cacheCloudflare() };
}

if (astroStack.cache && Object.keys(astroStack.routeRules).length > 0) {
  config.routeRules = astroStack.routeRules;
}

if (astroStack.jsonLogger) {
  config.logger = logHandlers.json();
}

if (astroStack.markdownUnified) {
  const { unified } = await import('@astrojs/markdown-remark');
  config.markdown = { processor: unified() };
}

export default defineConfig(config);
