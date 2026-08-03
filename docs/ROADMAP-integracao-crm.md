# Roadmap — Integração CRM (sites Astro P4)

> **Cliente referência (cliente 1):** Tetê Santos · `sites-clientes/tete-santos`.
> **Princípio:** `lib/listings.ts` + CI de fetch viram **template reutilizável** no scaffold; cada cliente novo = env + token + deploy hook, não fork de lógica.
> **Par CRM:** `Codigo-CRM/radiant-crm-dev/docs/ROADMAP-integracao-site-publico.md`

---

## Arquitetura V1 (todos os clientes P4 imob)

```
CRM feed XML (token) ──▶ CI build (secret) ──▶ Astro static ──▶ Cloudflare Pages (conta cliente)
                              │
                              └── fallback: public/data/listings-mock.xml (dev local)
```

| Decisão | Valor |
|---|---|
| Host site | Cloudflare Pages Free (conta **do cliente**) |
| Sync catálogo | Build-time fetch XML (não runtime) |
| Atraso vitrine | ~15–30 min (rebuild após editar CRM) |
| Leads V1 | WhatsApp (CTA no detalhe) |
| Leads V2 | Form → CRM/Supabase + LGPD |
| Endereço | Número **nunca**; logradouro vs só bairro = config CRM `address_display` |

---

## Contrato XML v1 (canônico)

Fonte: `sites-clientes/tete-santos/public/data/listings-mock.xml` (não o doc OneDrive de 23/06).

Parser de referência: `sites-clientes/tete-santos/src/lib/listings.ts`.

**Promover para scaffold (Fase S2):** copiar `listings.ts`, `listings-filters.ts`, componentes `ListingCard`, `ListingDetail`, `ListingsCatalog`, mock XML, página `[slug].astro`.

---

## Fases (lado site)

### Fase S0 — Tetê (piloto, em curso)

| # | Entrega | Status |
|---|---|---|
| S0.1 | Páginas + mock XML local | ✅ |
| S0.2 | Preview GitHub Pages | ✅ |
| S0.3 | Arquitetura V1 travada (handoff) | ✅ |
| S0.4 | Aprovação visual Tetê | aguardando |
| S0.5 | CF Pages produção `tetesantos.com.br` | pendente |
| S0.6 | CI fetch feed CRM real | pendente |
| S0.7 | Lighthouse QA pós-ok Tetê | pendente |

---

### Fase S1 — Template reutilizável (extrair do Tetê → scaffold)

| # | Entrega | Benefício cliente 2+ |
|---|---|---|
| S1.1 | `src/lib/listings.ts` genérico | `LISTINGS_FEED_URL` env; fallback mock |
| S1.2 | `src/lib/listings-config.ts` | WhatsApp, slug strategy, locale |
| S1.3 | Componentes listings no scaffold | Copy-paste zero |
| S1.4 | `public/data/listings-mock.xml` exemplo | Dev offline |
| S1.5 | Páginas `imoveis.astro` + `[slug].astro` opt-in P4 | SKU checklist |

---

### Fase S2 — CI/CD padrão (multi-cliente)

| # | Entrega | Notas |
|---|---|---|
| S2.1 | Workflow `.github/workflows/build-with-crm-feed.yml` | Secret `CRM_FEED_URL` |
| S2.2 | Step pre-build: `curl -fsS "$CRM_FEED_URL" -o public/data/listings.xml` | Falha build se feed 404 |
| S2.3 | Variáveis: `PUBLIC_SITE_URL`, `PUBLIC_DEPLOY_TARGET` | Já usado Tetê preview |
| S2.4 | Documentar secrets CF Pages | `CRM_FEED_URL` em dashboard |
| S2.5 | Playbook onboarding 1 página | Hub + link CRM runbook |

**Novo cliente P4 imob (~30 min ops):**
1. Copiar scaffold → `sites-clientes/<slug>`
2. `apply-brand` + `site.ts`
3. CRM: criar row `site_feeds` → colar URL no secret CI
4. CF Pages: conectar repo + custom domain
5. CRM: colar deploy hook URL
6. QA checklist P4

---

### Fase S3 — Qualidade e escala

| # | Entrega | |
|---|---|---|
| S3.1 | Validação XSD ou zod pós-parse | Falha build cedo |
| S3.2 | `srcset` nos cards (3 widths) | Briefing original |
| S3.3 | Fallback imagem quebrada | Já no Tetê |
| S3.4 | Teste e2e: N listings → N static paths | Regressão |
| S3.5 | Monitor externo: feed 200 + build OK | MRR P4 |

---

### Fase S4 — Leads V2 (pós-LGPD)

| # | Entrega | |
|---|---|---|
| S4.1 | Form contato/detalhe | Supabase ou API CRM |
| S4.2 | Termo LGPD + cookie se necessário | A20 |
| S4.3 | UTM/origem no payload lead | Analytics |

Supabase permanece **opcional** até demanda comercial P4 fechada; catálogo não depende dele.

---

## Variáveis de ambiente (padrão P4)

| Env | Onde | Obrigatório prod |
|---|---|---|
| `LISTINGS_FEED_URL` | CI / CF build | sim (URL completa com token) |
| `PUBLIC_SITE_URL` | build | sim |
| `PUBLIC_GA4_ID` | build | opcional |
| `CRM_FEED_URL` | alias aceito no workflow | sim |

**Nunca commitar** token do feed no repo.

---

## Próximos passos imediatos (site Dev)

1. **S0.5–S0.6** — Tetê: CF Pages + CI fetch quando CRM Fase 1 pronta.
2. **S1.1–S1.3** — Extrair listings para scaffold após Tetê validar UI.
3. **S2.1–S2.2** — Workflow template no scaffold.
4. Atualizar `sites-scaffold/README.md` e `.env.example` com `LISTINGS_FEED_URL`.
5. Alinhar `integracao-crm-xml.md` (OneDrive Tetê) ao contrato mock v1.

---

## Referências

| Recurso | Caminho |
|---|---|
| CRM roadmap (exportador) | `Codigo-CRM/radiant-crm-dev/docs/ROADMAP-integracao-site-publico.md` |
| Hub P4 comercial | `OneDrive/_hub/base-conhecimento/sites/integracao-crm-p4.md` |
| Implementação piloto | `sites-clientes/tete-santos/` |

*Última atualização: 2026-06-29*
