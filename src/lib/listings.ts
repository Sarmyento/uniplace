import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface Listing {
  id: string;
  slug: string;
  title: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  price: string;
  priceValue: number;
  condominioFee: string;
  iptuFee: string;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  area: number;
  parking: number;
  type: string;
  image: string;
  images: string[];
  featured: boolean;
  description: string;
  features: string[];
  amenities: string[];
}

function readXml(): string {
  const primary = resolve(process.cwd(), 'public/data/listings.xml');
  const fallback = resolve(process.cwd(), 'public/data/listings-mock.xml');
  const path = existsSync(primary) ? primary : fallback;
  return readFileSync(path, 'utf8');
}

function getTag(block: string, tag: string): string {
  return block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1]?.trim() ?? '';
}

function parseListings(xml: string): Listing[] {
  return [...xml.matchAll(/<listing>([\s\S]*?)<\/listing>/g)].map((match) => {
    const block = match[1];
    const id = getTag(block, 'id');
    const slugRaw = getTag(block, 'slug') || id;
    const image = getTag(block, 'image');
    const gallery = getTag(block, 'images');
    const galleryItems = gallery
      ? gallery
          .split('|')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    const images = galleryItems.length
      ? galleryItems[0] === image
        ? galleryItems
        : image
          ? [image, ...galleryItems.filter((item) => item !== image)]
          : galleryItems
      : image
        ? [image]
        : [];
    const priceValue =
      Number(getTag(block, 'price_value')) || Number(getTag(block, 'priceValue')) || 0;
    const featuresRaw = getTag(block, 'features');
    const amenitiesRaw = getTag(block, 'amenities');

    return {
      id,
      slug: slugRaw.toLowerCase(),
      title: getTag(block, 'title'),
      street: getTag(block, 'street'),
      neighborhood: getTag(block, 'neighborhood'),
      city: getTag(block, 'city'),
      state: getTag(block, 'state') || 'MG',
      price: getTag(block, 'price') || (priceValue ? formatPrice(priceValue) : 'Sob consulta'),
      priceValue,
      condominioFee: getTag(block, 'condominio_fee'),
      iptuFee: getTag(block, 'iptu_fee'),
      bedrooms: Number(getTag(block, 'bedrooms')) || 0,
      bathrooms:
        Number(getTag(block, 'bathrooms')) ||
        Number(getTag(block, 'banheiros')) ||
        0,
      suites: Number(getTag(block, 'suites')) || 0,
      area: Number(getTag(block, 'area')) || 0,
      parking: Number(getTag(block, 'parking')) || 0,
      type: getTag(block, 'type') || 'Imóvel',
      image: image || images[0] || '',
      images,
      featured: getTag(block, 'featured') === 'true',
      description: getTag(block, 'description'),
      features: featuresRaw
        ? featuresRaw
            .split('|')
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      amenities: amenitiesRaw
        ? amenitiesRaw
            .split('|')
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };
  });
}

export function getListings(options?: { limit?: number; featuredOnly?: boolean }): Listing[] {
  let listings = parseListings(readXml());
  if (options?.featuredOnly) {
    listings = listings.filter((item) => item.featured);
  }
  listings.sort((a, b) => b.priceValue - a.priceValue);
  if (options?.limit) {
    listings = listings.slice(0, options.limit);
  }
  return listings;
}

export function getListingBySlug(slug: string): Listing | undefined {
  return getListings().find((item) => item.slug === slug.toLowerCase());
}

export function getListingSlugs(): string[] {
  return getListings().map((item) => item.slug);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatListingAddress(listing: Listing): string {
  const parts = [listing.street, listing.neighborhood, listing.city].filter(Boolean);
  return parts.join(', ');
}

export function getListingMapEmbedUrl(listing: Listing): string {
  const query = formatListingAddress(listing);
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=pt&z=15&output=embed`;
}

export function getListingMapExternalUrl(listing: Listing): string {
  const query = formatListingAddress(listing);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function isMockFeed(): boolean {
  const listings = getListings();
  if (!listings.length) return true;
  return listings.every((l) => l.id.startsWith('ex-'));
}

export function getListingFilterOptions(
  listings: { city: string; neighborhood: string; type: string; amenities: string[] }[],
) {
  const cities = [...new Set(listings.map((item) => item.city).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
  const types = [...new Set(listings.map((item) => item.type).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
  const amenities = [
    ...new Set(listings.flatMap((item) => item.amenities).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const neighborhoodCity = new Map<string, string>();
  for (const item of listings) {
    if (!item.neighborhood) continue;
    if (!neighborhoodCity.has(item.neighborhood)) {
      neighborhoodCity.set(item.neighborhood, item.city || '');
    }
  }

  const neighborhoods = [...neighborhoodCity.entries()]
    .map(([name, city]) => ({ name, city }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return { cities, neighborhoods, types, amenities };
}
