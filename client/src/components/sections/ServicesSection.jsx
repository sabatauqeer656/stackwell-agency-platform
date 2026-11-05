import Section from '../layout/Section.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';
import QueryState from '../ui/QueryState.jsx';
import SkeletonGrid from '../ui/SkeletonGrid.jsx';
import ServicesGrid from './ServicesGrid.jsx';
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
          {(services) => <ServicesGrid services={services} />}
        </QueryState>
      </div>
    </Section>
  );
}
