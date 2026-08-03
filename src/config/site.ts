/**
 * Configuração do site Uniplace.
 * WhatsApp Maria: confirmar número oficial antes do go-live.
 */
export const site = {
  name: 'Uniplace Imóveis',
  tagline: 'Tudo em um só lugar.',
  taglineSecondary: 'Seu imóvel no lugar certo.',
  domain: 'https://uniplace.com.br',
  locale: 'pt-BR',
  whatsapp: {
    /** TODO: número oficial da Maria (E.164 sem +) */
    number: '5531999999999',
    message: 'Olá! Vim pelo site da Uniplace.',
  },
  contact: {
    email: 'robertocorretorbhz@gmail.com',
    phone: '',
    address: 'Rua Rio Grande do Sul, 756, salas 17/18, Barro Preto, Belo Horizonte',
  },
  publicPartner: 'Roberto Fonseca',
  markets: ['Belo Horizonte', 'Nova Lima', 'Contagem'] as const,
  social: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },
} as const;

export type SiteConfig = typeof site;

export function waUrl(message?: string, utmContent?: string) {
  const text = message ?? site.whatsapp.message;
  const base = `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(text)}`;
  if (!utmContent) return base;
  return base;
}

export const nav = [
  { href: '/', label: 'Início' },
  { href: '/imoveis', label: 'Imóveis' },
  { href: '/bairros', label: 'Bairros' },
  { href: '/blog', label: 'Blog' },
  { href: '/anunciar', label: 'Anunciar' },
  { href: '/associar', label: 'Associar' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
] as const;
