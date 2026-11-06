import { useId, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigation } from 'react-router-dom';
import { ExternalLink, Layers, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth.js';
import { useSettings } from '../../features/settings/useSettings.js';
import { cn } from '../../lib/utils.js';
import Badge from '../ui/Badge.jsx';
import { NavigationProgress, RouteEffects } from '../layout/RouteChange.jsx';
import { navFor } from './adminNav.js';

const linkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
  );

// The menu. Used twice (sidebar on desktop, panel on phones), so each use gets its own accessible name.
function NavLinks({ groups, label, onNavigate }) {
  const idBase = useId();
  return (
    <nav aria-label={label} className="space-y-6">
      {groups.map((group, index) => (
        <div key={group.label ?? 'main'}>
          {group.label && (
            <p id={`${idBase}-${index}`} className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {group.label}
            </p>
          )}
          <ul aria-labelledby={group.label ? `${idBase}-${index}` : undefined} className={cn('space-y-1', group.label && 'mt-2')}>
            {group.items.map(({ to, label: itemLabel, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} onClick={onNavigate} className={linkClass}>
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {itemLabel}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// Who is signed in, and the two things you do from here: look at the site, sign out
function UserBox({ user, onSignOut, onNavigate }) {
  return (
    <div className="border-t border-slate-200 pt-4">
      <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
      <p className="truncate text-sm text-slate-500">{user.email}</p>
      <div className="mt-2">
        <Badge variant="brand">{user.role}</Badge>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <ExternalLink className="h-5 w-5" aria-hidden="true" />
          View website
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}

// The frame around every dashboard page: a sidebar on large screens, a top bar with a menu button on phones.
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { companyName } = useSettings();
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef(null);
  const announcerRef = useRef(null);
  const menuButtonRef = useRef(null);

  const groups = navFor(user.role); // only what this role may see
  const closeMenu = () => setMenuOpen(false);

  // Escape closes the phone menu and gives focus back to the button that opened it
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  };

  const brand = (
    <Link to="/admin" onClick={closeMenu} className="flex items-center gap-2 rounded-lg">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-brand-600 to-accent-500 text-white">
        <Layers className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="font-bold tracking-tight text-ink">{companyName}</span>
    </Link>
  );

  return (
    <div onKeyDown={handleKeyDown} className="min-h-screen bg-slate-50 lg:flex">
      <RouteEffects mainRef={mainRef} announcerRef={announcerRef} />
      <NavigationProgress />
      <div ref={announcerRef} role="status" aria-live="polite" className="sr-only" />
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-700 shadow-card focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* Large screens: a fixed sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
        <div className="space-y-8">
          <div className="px-1 pt-1">{brand}</div>
          <NavLinks groups={groups} label="Dashboard" />
        </div>
        <UserBox user={user} onSignOut={logout} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Phones: a top bar, and the menu opens as a panel under it */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            {brand}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
          <div id="admin-mobile-menu" hidden={!menuOpen} className="max-h-[calc(100vh-4rem)] space-y-6 overflow-y-auto border-t border-slate-200 bg-white p-4">
            <NavLinks groups={groups} label="Dashboard menu" onNavigate={closeMenu} />
            <UserBox user={user} onSignOut={logout} onNavigate={closeMenu} />
          </div>
        </header>

        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          aria-busy={navigation.state === 'loading'}
          className="flex-1 px-4 py-8 focus:outline-none sm:px-6 lg:px-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
