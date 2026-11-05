import Seo from '../../components/Seo.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import ServicesGrid from '../../components/sections/ServicesGrid.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import SkeletonGrid from '../../components/ui/SkeletonGrid.jsx';
import { useServices } from '../../features/services/useServices.js';
import { useSettings } from '../../features/settings/useSettings.js';

export default function Services() {
  const { companyName } = useSettings();
  const query = useServices();

  return (
    <>
      <Seo
        title="Services"
        description={`Web applications, mobile apps, e-commerce, UI/UX design, APIs and ongoing support from ${companyName}.`}
        path="/services"
      />

      <PageHeader
        eyebrow="What we do"
        title="Our Services"
        description="Everything you need to take a software product from idea to launch, and keep it healthy afterwards."
      />

      <Section aria-label="All services" className="pt-4 sm:pt-8">
        <QueryState
          query={query}
          skeleton={<SkeletonGrid count={6} label="Loading services" withIcon />}
          errorTitle="We could not load our services"
          emptyTitle="No services yet"
        >
          {(services) => <ServicesGrid services={services} />}
        </QueryState>
      </Section>

      <CallToAction />
    </>
  );
}
