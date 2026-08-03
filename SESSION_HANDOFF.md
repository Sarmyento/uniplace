# Uniplace site · SESSION_HANDOFF

Repo: https://github.com/Sarmyento/uniplace  
Path: `C:\Users\sarmy\Dev\Sarmy\sites-clientes\uniplace`

## Feito 2026-08-02 / 03

- Scaffold + brand + Sprint 1 routes
- Blog F1 (24 posts) importado
- **Feed CRM vivo:** `site_feeds` Uniplace no tenant Roberto · `.env` local com `LISTINGS_FEED_URL`
- Build com ~132 imóveis → 167 páginas

## Pendente

- Número WhatsApp Maria real em `src/config/site.ts`
- Secret `LISTINGS_FEED_URL` no Cloudflare Pages / CI (quando houver deploy)
- `deploy_hook_url` no `site_feeds` (rebuild ao editar imóvel)
- IDs GTM / Stape `v1.uniplace.com.br`
- Hero com foto real BH

## Ops CRM

- Branch: `ops/uniplace-site-feed` em sarmy-crm
- Diag: `scripts/ops/diag-uniplace-roberto-site.sql`
- Seed: `scripts/ops/seed-uniplace-site-feed.sql` (já aplicado PROD)

Docs: OneDrive `clientes/uniplace/marca/KICKOFF-DEV.md`
