import { Inbox, TriangleAlert } from 'lucide-react';
import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';

// Picks what to show for a TanStack Query result, so every section handles all four states
// (loading, error, empty, success) the same way:
//
//   <QueryState query={useServices()} skeleton={<SkeletonGrid />} emptyTitle="No services yet">
//     {(services) => <ServiceList services={services} />}
//   </QueryState>
//
// `children` is a function that receives the loaded data and returns the success markup.
export default function QueryState({
  query,
  skeleton,
  errorTitle = 'We could not load this',
  errorDescription = 'Something went wrong on our side. Please check your connection and try again.',
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Check back soon.',
  children,
}) {
  const { data, isPending, isError, isFetching, refetch } = query;

  if (isPending) return skeleton;

  if (isError) {
    return (
      <EmptyState
        icon={TriangleAlert}
        title={errorTitle}
        description={errorDescription}
        action={
          <Button variant="outline" loading={isFetching} onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (Array.isArray(data) && data.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />;
  }

  return children(data);
}
