import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Container from '../../components/layout/Container.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

// An /admin address that does not exist (shown only to signed-in users)
export default function AdminNotFound() {
  return (
    <Container size="md" className="py-20">
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        icon={SearchX}
        title="This dashboard page does not exist"
        description="Check the address, or go back to the dashboard."
        action={
          <Button as={Link} to="/admin" variant="outline">
            Back to the dashboard
          </Button>
        }
      />
    </Container>
  );
}
