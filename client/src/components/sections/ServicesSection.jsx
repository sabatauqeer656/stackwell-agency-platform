import Section from '../layout/Section.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';
import QueryState from '../ui/QueryState.jsx';
import SkeletonGrid from '../ui/SkeletonGrid.jsx';
import ServiceCard from './ServiceCard.jsx';
import { useServices } from '../../features/services/useServices.js';

export default function ServicesSection() {
  const query = useServices();

  return (
    <Section tone="muted" aria-labelledby="services-heading">
      <SectionHeading
        id="services-heading"
        eyebrow="What we do"
        title="Services built around your goals"
        description="From the first idea to a product people use every day, we cover design, development and support."
      />
      <div className="mt-12">
        <QueryState
          query={query}
          skeleton={<SkeletonGrid count={6} label="Loading services" withIcon />}
          errorTitle="We could not load our services"
          emptyTitle="No services yet"
        >
          {(services) => (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <li key={service._id} className="flex">
                  <ServiceCard service={service} />
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </div>
    </Section>
  );
}
