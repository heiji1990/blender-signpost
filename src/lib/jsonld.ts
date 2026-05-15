// Minimal, pragmatic JSON-LD builders. Output is injected via BaseLayout's `jsonLd` prop.
const SITE = 'https://blender-michishirube.com';
const SITE_NAME = 'Blenderの道しるべ';

const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE}${path}`);

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE}/tutorials?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function courseLd(d: { title: string; summary: string; creator: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: d.title,
    description: d.summary,
    provider: { '@type': 'Organization', name: d.creator },
  };
}

export function videoLd(d: {
  title: string;
  summary: string;
  thumbnail: string;
  uploadDate?: string | null;
}) {
  const v: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: d.title,
    description: d.summary,
    thumbnailUrl: d.thumbnail,
  };
  if (d.uploadDate && /^\d{4}-\d{2}-\d{2}$/.test(d.uploadDate)) v.uploadDate = d.uploadDate;
  return v;
}

export function softwareLd(d: {
  title: string;
  summary: string;
  price?: number | null;
}) {
  const s: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: d.title,
    description: d.summary,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Windows, macOS, Linux',
  };
  if (typeof d.price === 'number') {
    s.offers = { '@type': 'Offer', price: d.price, priceCurrency: 'JPY' };
  }
  return s;
}
