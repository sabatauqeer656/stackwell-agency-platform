import { Link, useMatches } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

// A stand-in for dashboard sections that are built in the next steps. The title comes from the route's `handle`.
export default function ComingSoon() {
  const matches = useMatches();
  const title = matches.at(-1)?.handle?.title ?? 'This section';

  return (
    <>
      <Seo title={title} noindex />
      <h1 className="text-h2">{title}</h1>
      <div className="mt-8">
        <EmptyState
          icon={Hammer}
          title="Coming in an upcoming step"
          description="This section of the dashboard is being built. Everything else already works."
          action={
            <Button as={Link} to="/admin" variant="outline">
              Back to the dashboard
            </Button>
          }
        />
      </div>
    </>
  );
}
