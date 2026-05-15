// Single source of truth for outbound content links.
// Affiliate links get rel="nofollow sponsored ..." per Google's paid-link policy.

export interface LinkSource {
  url: string;
  affiliateUrl?: string | null;
  isAffiliate?: boolean | null;
}

export interface ResolvedLink {
  href: string;
  rel: string;
}

export function resolveLink({ url, affiliateUrl, isAffiliate }: LinkSource): ResolvedLink {
  const affiliate = Boolean(isAffiliate && affiliateUrl);
  return {
    href: affiliate ? (affiliateUrl as string) : url,
    rel: affiliate
      ? 'nofollow sponsored noopener noreferrer'
      : 'noopener noreferrer',
  };
}
