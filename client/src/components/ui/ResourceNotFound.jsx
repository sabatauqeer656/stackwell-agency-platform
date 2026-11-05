import { Link } from 'react-router-dom';
import Seo from '../Seo.jsx';
import { ArrowLeft, SearchX } from 'lucide-react';
import Button from './Button.jsx';
import Container from '../layout/Container.jsx';
import EmptyState from './EmptyState.jsx';

// Shown when a page exists but the thing it asks for does not (e.g. /services/typo).
// The page needs an <h1>, and EmptyState only renders an <h3>, so the heading is added here.
export default function ResourceNotFound({ title, description, backTo, backLabel }) {
  return (
    <Container size="md" className="py-20">
      {/* noindex: tells search engines not to list this address */}
      <Seo title={title} noindex />
      <h1 className="sr-only">{title}</h1>
      <EmptyState
        icon={SearchX}
        title={title}
        description={description}
        action={
          <Button as={Link} to={backTo} variant="outline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Button>
        }
      />
    </Container>
  );
}
