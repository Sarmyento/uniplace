/**
 * Stack Astro 7 — capacidade do scaffold vs decisão de construção.
 *
 * O template já declara as deps oficiais. Ligar cada peça é decisão de
 * produto/construção por cliente (brief, SKU, host), não limitação do molde.
 *
 * Default = estático Cloudflare Pages (padrão A23 P1–P4).
 *
 * @typedef {'static' | 'server'} AstroOutput
 * @typedef {false | 'memory' | 'cloudflare'} AstroCacheMode
 *
 * @type {{
 *   output: AstroOutput,
 *   mdx: boolean,
 *   cloudflare: boolean,
 *   cache: AstroCacheMode,
 *   routeRules: Record<string, { maxAge?: number, swr?: number, tags?: string[] }>,
 *   jsonLogger: boolean,
 *   markdownUnified: boolean,
 * }}
 */
export const astroStack = {
  /** static = Pages estático; server = SSR/edge (exige cloudflare: true no host CF) */
  output: 'static',

  /** @astrojs/mdx — páginas/coleções .mdx (Sätteri + MDX) */
  mdx: true,

  /** @astrojs/cloudflare — SSR, Actions, middleware edge, CDN cache */
  cloudflare: false,

  /**
   * Route caching (Astro 7 stable).
   * - false: desligado
   * - 'memory': memoryCache() (dev/preview / Node)
   * - 'cloudflare': cacheCloudflare() (exige cloudflare: true; Workers Cache beta CF)
   */
  cache: false,

  /**
   * Regras de cache por rota (só aplicam se cache !== false).
   * Ex.: { '/blog/[...path]': { maxAge: 300, swr: 60 } }
   */
  routeRules: {},

  /** Logger JSON (CI / coding agents). CLI: também `astro dev --json` */
  jsonLogger: false,

  /**
   * Processador Markdown legado unified/remark (em vez do Sätteri default).
   * Só ligue se o projeto depender de remark/rehype plugins.
   * Pacote: optionalDependency `@astrojs/markdown-remark` (já no scaffold).
   */
  markdownUnified: false,
};
