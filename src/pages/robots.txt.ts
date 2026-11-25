import type { APIRoute } from 'astro';
import { site } from '../config/site';

/**
 * robots.txt gerado no build.
 * Preview (GitHub Pages) fica fechado para buscadores; produção libera e aponta o sitemap do domínio real.
 */
const isPreview = import.meta.env.PUBLIC_DEPLOY_TARGET === 'github-pages';

export const GET: APIRoute = () => {
  const body = isPreview
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
