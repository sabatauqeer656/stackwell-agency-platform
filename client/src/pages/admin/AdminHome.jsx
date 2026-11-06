import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Container from '../../components/layout/Container.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import api from '../../lib/axios.js';

// TEMPORARY landing page: the real dashboard layout and statistics arrive in the next step.
// It already makes one PROTECTED request (/auth/me), which proves the login token is attached to API calls
// and that an expired token is renewed without the user noticing.
export default function AdminHome() {
  const { user, logout } = useAuth();
  const serverView = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async () => (await api.get('/auth/me')).data.data.user,
  });

  return (
    <Container size="md" className="py-16">
      <h1 className="text-h2">Welcome, {user.name}</h1>
      <p className="mt-2 text-slate-600">
        Signed in as {user.email} ({user.role}).
      </p>

      <Card className="mt-8">
        <h2 className="text-lg">Checking your login with the server</h2>
        <p aria-live="polite" className="mt-2 text-slate-600">
          {serverView.isPending && 'Asking the server...'}
          {serverView.isError && 'The server could not confirm your login.'}
          {serverView.data && `The server confirms you are an ${serverView.data.role}. Your session is working.`}
        </p>
      </Card>

      <p className="mt-6 text-slate-600">The full dashboard (leads, content and settings) is built in the next steps.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
        <Button as={Link} to="/" variant="ghost">
          View the website
        </Button>
      </div>
    </Container>
  );
}
