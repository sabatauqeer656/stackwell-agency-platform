import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import { cn } from '../../lib/utils.js';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// A single-page app never reloads, so after a link click the browser would keep the old scroll
// position and screen reader users would not know the page changed. On every real page change:
//   1. scroll to the top
//   2. move keyboard focus to the main content (so Tab continues from the new page)
//   3. announce the new page title to screen readers
function RouteEffects({ mainRef, announcerRef }) {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    // Skip the first load, and changes that stay on the same page (?filter=, #anchor)
    if (previousPath.current === pathname) return undefined;
    previousPath.current = pathname;

    if (!hash) window.scrollTo(0, 0); // links like /page#section keep their anchor behavior
    mainRef.current?.focus({ preventScroll: true });

    // The page sets its <title> a moment after it renders, so wait briefly before reading it
    const timer = setTimeout(() => {
      if (announcerRef.current) announcerRef.current.textContent = document.title;
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname, hash, mainRef, announcerRef]);

  return null;
}

// A thin bar at the top of the screen while the next page's code is downloading
function NavigationProgress() {
  const navigation = useNavigation();
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-brand-500 transition-opacity duration-200',
        navigation.state === 'loading' ? 'opacity-100 motion-safe:animate-pulse' : 'opacity-0'
      )}
    />
  );
}

// Wraps every public page: skip link, Navbar, the page itself (<Outlet />), Footer.
export default function PublicLayout() {
  const mainRef = useRef(null);
  const announcerRef = useRef(null);
  const navigation = useNavigation();

  return (
    <div className="flex min-h-screen flex-col">
      <RouteEffects mainRef={mainRef} announcerRef={announcerRef} />
      <NavigationProgress />
      {/* Screen-reader-only: says "Services | Stackwell" after each page change */}
      <div ref={announcerRef} role="status" aria-live="polite" className="sr-only" />
      {/* First focusable element: lets keyboard users jump past the navigation */}
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-700 shadow-card focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        aria-busy={navigation.state === 'loading'}
        className="flex-1 focus:outline-none"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
