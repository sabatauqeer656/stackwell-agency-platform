import { TriangleAlert } from 'lucide-react';
import Container from '../layout/Container.jsx';
import { isMissing } from '../../lib/apiErrors.js';
import Button from './Button.jsx';
import DetailSkeleton from './DetailSkeleton.jsx';
import EmptyState from './EmptyState.jsx';
import ResourceNotFound from './ResourceNotFound.jsx';

// Decides what a detail page shows: loading skeleton, "not found", "something broke", or the page.
//   notFound  - props for ResourceNotFound: { title, description, backTo, backLabel }
//   children  - function that receives the loaded data and returns the page
export default function DetailPageState({ query, loadingLabel, notFound, errorTitle, children }) {
  if (query.isPending) return <DetailSkeleton label={loadingLabel} />;

  // The thing does not exist, is a draft, or the URL is malformed: not a "something broke" error
  if (query.isError && isMissing(query.error)) return <ResourceNotFound {...notFound} />;

  if (query.isError) {
    return (
      <Container size="md" className="py-20">
        <h1 className="sr-only">{errorTitle}</h1>
        <EmptyState
          icon={TriangleAlert}
          title={errorTitle}
          description="Something went wrong on our side. Please check your connection and try again."
          action={
            <Button variant="outline" loading={query.isFetching} onClick={() => query.refetch()}>
              Try again
            </Button>
          }
        />
      </Container>
    );
  }

  return children(query.data);
}
