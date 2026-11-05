import { useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Layers, Menu, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Container from './Container.jsx';
import { cn } from '../../lib/utils.js';
import { useSettings } from '../../features/settings/useSettings.js';
import { mainLinks, quoteLink } from './navLinks.js';

const linkClass = ({ isActive }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
  );

const mobileLinkClass = ({ isActive }) =>
  cn(
    'block rounded-lg px-3 py-3 text-base font-medium',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
  );

export default function Navbar() {
  const { companyName } = useSettings();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);

  const closeMenu = () => setOpen(false);

  // Escape closes the mobile menu and returns focus to the button that opened it
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      menuButtonRef.current?.focus();
    }
  };

  return (
    <header onKeyDown={handleKeyDown} className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-brand-600 to-accent-500 text-white">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">{companyName}</span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* The wrapper is hidden (not the Button): the Button's own display class would override `hidden` */}
          <div className="hidden sm:block">
            <Button as={Link} to={quoteLink.to} size="sm">
              {quoteLink.label}
            </Button>
          </div>

          {/* Mobile menu button: only visible below the lg breakpoint */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </Container>

      {/* Mobile panel. Always in the DOM so aria-controls always points at something. */}
      <div id="mobile-menu" hidden={!open} className="border-t border-slate-200 bg-white lg:hidden">
        <Container as="nav" aria-label="Mobile" className="space-y-1 py-4">
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={closeMenu} className={mobileLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <Button as={Link} to={quoteLink.to} onClick={closeMenu} className="mt-3 w-full">
            {quoteLink.label}
          </Button>
        </Container>
      </div>
    </header>
  );
}
