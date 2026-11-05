import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../features/settings/useSettings.js';

// The public address of the site. Set VITE_SITE_URL when you deploy (e.g. https://stackwell.dev);
// until then the address the page is opened on is used.
const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL ?? window.location.origin).replace(/\/$/, '');

// Search engines cut descriptions at about 160 characters
const MAX_DESCRIPTION = 160;
const truncate = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);

// Everything a page tells search engines and link-preview bots about itself, in ONE place:
//   title          - "Services" becomes "Services | Stackwell"
//   absoluteTitle  - use instead of `title` when the page needs the exact title (the home page)
//   description    - shown under the title in search results
//   path           - the page's own address (e.g. "/services"), used for the canonical URL
//   noindex        - ask search engines not to list this page (not-found pages)
//   children       - extra head tags, such as a JSON-LD <script>
export default function Seo({ title, absoluteTitle, description, path, noindex = false, type = 'website', children }) {
  const { companyName } = useSettings();

  // index.html ships default tags for crawlers that do not run JavaScript (like most link-preview bots).
  // Once React is running, this page's own tags replace them, so the head never has two descriptions.
  useEffect(() => {
    document.querySelectorAll('[data-static-seo]').forEach((element) => element.remove());
  }, []);

  const fullTitle = absoluteTitle ?? `${title} | ${companyName}`;
  const text = description ? truncate(description, MAX_DESCRIPTION) : undefined;
  // The canonical URL says "this is the one true address of this page", even if it is also
  // reachable with extra query parameters like ?page=2
  const canonical = path === undefined ? undefined : `${SITE_ORIGIN}${path}`;

  return (
    <Helmet>
      {/* Helmet needs ONE string inside <title>, so it is built before it gets here */}
      <title>{fullTitle}</title>
      {text && <meta name="description" content={text} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex" />}

      {/* Open Graph + Twitter: what LinkedIn, Slack, WhatsApp and X show when the link is shared */}
      <meta property="og:site_name" content={companyName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {text && <meta property="og:description" content={text} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta name="twitter:card" content="summary" />
      {children}
    </Helmet>
  );
}
