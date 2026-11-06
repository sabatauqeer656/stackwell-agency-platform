import { Outlet } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import AuthProvider from '../../features/auth/AuthProvider.jsx';

// The root of everything under /admin. The AuthProvider lives HERE and not around the whole app, so visitors of
// the public website never trigger a login check, and the dashboard code is only downloaded for people who open /admin.
export default function AdminRoot() {
  return (
    <AuthProvider>
      {/* noindex: search engines must not list the dashboard (robots.txt also blocks /admin) */}
      <Seo title="Admin" noindex />
      <Outlet />
    </AuthProvider>
  );
}
