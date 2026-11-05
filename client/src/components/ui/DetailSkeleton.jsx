import Container from '../layout/Container.jsx';
import Skeleton from './Skeleton.jsx';

// Placeholder for a detail page (service, project) while it loads.
export default function DetailSkeleton({ label = 'Loading' }) {
  return (
    <Container className="py-16" aria-busy="true">
      <p role="status" className="sr-only">
        {label}
      </p>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-8 h-10 w-2/3" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </Container>
  );
}
