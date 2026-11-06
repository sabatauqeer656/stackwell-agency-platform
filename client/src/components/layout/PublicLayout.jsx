import { useRef } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { NavigationProgress, RouteEffects } from './RouteChange.jsx';

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
