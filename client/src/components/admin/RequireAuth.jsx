import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Container from '../layout/Container.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import InitialLoading from '../layout/InitialLoading.jsx';
import { useAuth } from '../../features/auth/useAuth.js';

// Wraps every page that needs a signed-in user:
//   <Route element={<RequireAuth />}> ...pages... </Route>
// Optional `roles` limits it further, e.g. <RequireAuth roles={['admin']} /> for admin-only pages.
// The server checks the role again on every API call: this component only decides what the SCREEN shows.
export default function RequireAuth({ roles }) {
  const { status, user } = useAuth();
  const location = useLocation();

  // Still finding out whether the visitor is signed in (see AuthProvider). Show nothing misleading meanwhile.
  if (status === 'loading') return <InitialLoading />;

  // Not signed in: go to the login page, and remember where they were heading so we can send them back
  if (status === 'unauthenticated') return <Navigate to="/admin/login" replace state={{ from: location }} />;

  // Signed in, but this page is not for their role (403 = "I know who you are, but no")
  if (roles && !roles.includes(user.role)) {
    return (
      <Container size="md" className="py-20">
        <h1 className="sr-only">Not allowed</h1>
        <EmptyState
          icon={ShieldAlert}
          title="You do not have access to this page"
          description="Your account does not have the permission this page needs. Ask an administrator if you think this is a mistake."
          action={
            <Button as={Link} to="/admin" variant="outline">
              Back to the dashboard
            </Button>
          }
        />
      </Container>
    );
  }

  return <Outlet />;
}
