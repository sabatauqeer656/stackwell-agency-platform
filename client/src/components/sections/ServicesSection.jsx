import { Inbox, TriangleAlert } from 'lucide-react';
import Section from '../layout/Section.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import ServiceCard from './ServiceCard.jsx';
import { useServices } from '../../features/services/useServices.js';

const skeletonKeys = [0, 1, 2, 3, 4, 5]; // six placeholder cards while loading

function ServicesSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      <p role="status" className="sr-only">
        Loading services
      </p>
      {skeletonKeys.map((key) => (
        <Card key={key} className="space-y-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
      ))}
    </div>
  );
}

// Handles every state the data can be in: loading, error, empty, success.
export default function ServicesSection() {
  const { data: services, isPending, isError, refetch, isFetching } = useServices();

  let content;
  if (isPending) {
    content = <ServicesSkeleton />;
  } else if (isError) {
    content = (
      <EmptyState
        icon={TriangleAlert}
        title="We could not load our services"
        description="Something went wrong on our side. Please check your connection and try again."
        action={
          <Button variant="outline" loading={isFetching} onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    );
  } else if (services.length === 0) {
    content = <EmptyState icon={Inbox} title="No services yet" description="Check back soon." />;
  } else {
    content = (
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service._id} className="flex">
            <ServiceCard service={service} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Section tone="muted" aria-labelledby="services-heading">
      <SectionHeading
        eyebrow="What we do"
        title="Services built around your goals"
        description="From the first idea to a product people use every day, we cover design, development and support."
        id="services-heading"
      />
      <div className="mt-12">{content}</div>
    </Section>
  );
}
