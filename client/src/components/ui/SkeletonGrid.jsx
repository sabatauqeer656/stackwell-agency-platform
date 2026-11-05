import Card from './Card.jsx';
import Skeleton from './Skeleton.jsx';

// Placeholder cards shown while a list loads. They keep the page from jumping when the data arrives.
// `gridClass` must match the real grid so the placeholders sit where the real cards will appear.
export default function SkeletonGrid({ count = 3, label = 'Loading', gridClass = 'sm:grid-cols-2 lg:grid-cols-3', withIcon = false }) {
  return (
    <div className={`grid gap-6 ${gridClass}`} aria-busy="true">
      {/* The pulsing blocks are hidden from screen readers; this line is what they hear */}
      <p role="status" className="sr-only">
        {label}
      </p>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="space-y-3">
          {withIcon && <Skeleton className="h-12 w-12 rounded-xl" />}
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
      ))}
    </div>
  );
}
