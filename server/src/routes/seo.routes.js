import { Router } from 'express';
import { env } from '../config/env.js';
import Service from '../models/Service.js';
import Solution from '../models/Solution.js';
import Project from '../models/Project.js';
import asyncHandler from '../utils/asyncHandler.js';

// Search engines look for these two files at the site root (not under /api), so they get their own router.
// They are built on request, so new or hidden content shows up without a redeploy.
const router = Router();

// Pages that always exist. Detail pages are added from the database.
const STATIC_PAGES = [
  { path: '/', priority: '1.0' },
  { path: '/services', priority: '0.8' },
  { path: '/solutions', priority: '0.8' },
  { path: '/projects', priority: '0.8' },
  { path: '/about', priority: '0.6' },
  { path: '/faq', priority: '0.5' },
  { path: '/contact', priority: '0.6' },
  { path: '/quote', priority: '0.7' },
];

const siteOrigin = () => new URL(env.CLIENT_URL).origin;

// & < > ' " would break the XML, so they are escaped (slugs are safe, but this stays correct if that changes)
const escapeXml = (text) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

function urlEntry(origin, { path, priority, updatedAt }) {
  const lastmod = updatedAt ? `<lastmod>${new Date(updatedAt).toISOString()}</lastmod>` : '';
  return `  <url><loc>${escapeXml(origin + path)}</loc>${lastmod}<priority>${priority}</priority></url>`;
}

router.get(
  '/sitemap.xml',
  asyncHandler(async (req, res) => {
    // Only published content: a draft must never be advertised to search engines
    const [services, solutions, projects] = await Promise.all(
      [Service, Solution, Project].map((Model) => Model.find({ isPublished: true }).select('slug updatedAt').lean())
    );

    const pages = [
      ...STATIC_PAGES,
      ...services.map((s) => ({ path: `/services/${s.slug}`, priority: '0.7', updatedAt: s.updatedAt })),
      ...solutions.map((s) => ({ path: `/solutions/${s.slug}`, priority: '0.7', updatedAt: s.updatedAt })),
      ...projects.map((p) => ({ path: `/projects/${p.slug}`, priority: '0.7', updatedAt: p.updatedAt })),
    ];

    const origin = siteOrigin();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
      .map((page) => urlEntry(origin, page))
      .join('\n')}\n</urlset>\n`;

    res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(xml);
  })
);

router.get('/robots.txt', (req, res) => {
  const text = [
    'User-agent: *',
    'Allow: /',
    // The dashboard and the JSON API are not pages for search results
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteOrigin()}/sitemap.xml`,
    '',
  ].join('\n');
  res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(text);
});

export default router;
