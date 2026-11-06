import { Link } from 'react-router-dom';
import { ExternalLink, Layers, Mail, MapPin, Phone } from 'lucide-react';
import Container from './Container.jsx';
import { useSettings } from '../../features/settings/useSettings.js';
import { mainLinks, quoteLink } from './navLinks.js';

const socialNames = [
  ['linkedin', 'LinkedIn'],
  ['github', 'GitHub'],
  ['twitter', 'Twitter'],
  ['instagram', 'Instagram'],
];

const currentYear = new Date().getFullYear(); // computed once, not on every render

const linkClass = 'text-sm text-slate-400 transition-colors hover:text-white';

export default function Footer() {
  const settings = useSettings();
  const { companyName, tagline, email, phone, address, footerText } = settings;

  // Only show social links that an admin has actually filled in
  const socials = socialNames.filter(([key]) => settings[key]).map(([key, label]) => ({ label, href: settings[key] }));

  const companyLinks = mainLinks.filter((link) => ['/about', '/projects', '/faq', '/contact'].includes(link.to));
  const offerLinks = [...mainLinks.filter((link) => ['/services', '/solutions'].includes(link.to)), quoteLink];

  return (
    <footer className="bg-ink text-slate-300">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 rounded-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-500 text-white">
                <Layers className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">{companyName}</span>
            </Link>
            <p className="max-w-xs text-sm text-slate-400">{tagline}</p>
          </div>

          <nav aria-label="What we do">
            <h2 className="text-sm font-semibold text-white">What we do</h2>
            <ul className="mt-4 space-y-3">
              {offerLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="text-sm font-semibold text-white">Company</h2>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-white">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {email && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="hover:text-white">
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-white">
                    {phone}
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{address}</span>
                </li>
              )}
            </ul>

            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2" aria-label="Social media">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
                    >
                      {social.label}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <p>
            &copy; {currentYear} {companyName}. All rights reserved.
          </p>
          {footerText && <p>{footerText}</p>}
        </div>
      </Container>
    </footer>
  );
}
