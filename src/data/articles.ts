export interface Article {
  title: { pt: string; en: string };
  date: string;
  excerpt: { pt: string; en: string };
  url: string;
  cover?: string;
}

// No articles were provided in the shared material — kept empty on purpose
// rather than invented. Add entries here (title, date, excerpt, url, cover)
// whenever real articles are ready to publish.
export const articles: Article[] = [];
