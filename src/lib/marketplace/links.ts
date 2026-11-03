/**
 * Plain links to marketplace pages (no API, no automation): the user opens them and acts themselves.
 * The Vinted domain is configurable for other countries (www.vinted.fr, www.vinted.es, …).
 */
const VINTED_DOMAIN = (process.env.NEXT_PUBLIC_VINTED_DOMAIN || 'www.vinted.it')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');

/** Vinted "Vendi" page where a new listing is created. */
export function vintedSellUrl() {
  return `https://${VINTED_DOMAIN}/items/new`;
}

/** Vinted catalog search, e.g. to compare prices of similar items. */
export function vintedSearchUrl(query: string, opts: { maxPrice?: number } = {}) {
  const params = new URLSearchParams({ search_text: query.trim().slice(0, 100) });
  if (opts.maxPrice !== undefined && opts.maxPrice > 0)
    params.set('price_to', String(Math.round(opts.maxPrice)));
  return `https://${VINTED_DOMAIN}/catalog?${params}`;
}
