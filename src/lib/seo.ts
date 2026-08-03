import type { SiteConfig } from '../config/site';

export function organizationJsonLd(site: SiteConfig, origin: string) {
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.domain || origin,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(site: SiteConfig, origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.domain || origin,
    inLanguage: site.locale,
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
