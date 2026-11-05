import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import Breadcrumbs from '../../components/layout/Breadcrumbs.jsx';
import Container from '../../components/layout/Container.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import DynamicIcon from '../../components/ui/DynamicIcon.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ResourceNotFound from '../../components/ui/ResourceNotFound.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { isMissing, useService } from '../../features/services/useService.js';
import { useServices } from '../../features/services/useServices.js';
import { useSettings } from '../../features/settings/useSettings.js';

// Structured data (JSON-LD) tells search engines what this page is about.
// "<" is escaped so text typed into the admin dashboard can never close the <script> tag early.
const toJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

function DetailSkeleton() {
  return (
    <Container className="py-16" aria-busy="true">
      <p role="status" className="sr-only">
        Loading service
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

export default function ServiceDetail() {
  const { slug } = useParams();
  const { companyName } = useSettings();
  const query = useService(slug);
  const allServices = useServices(); // already cached from the list: used for "Other services"

  if (query.isPending) return <DetailSkeleton />;

  // The service does not exist, is a draft, or the URL is malformed. Not a "something broke" error.
  if (query.isError && isMissing(query.error)) {
    return (
      <ResourceNotFound
        title="Service not found"
        description="We could not find that service. It may have been renamed or removed."
        backTo="/services"
        backLabel="See all services"
      />
    );
  }

  if (query.isError) {
    return (
      <Container size="md" className="py-20">
        <h1 className="sr-only">Service unavailable</h1>
        <EmptyState
          icon={TriangleAlert}
          title="We could not load this service"
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

  const service = query.data;
  const otherServices = (allServices.data ?? []).filter((item) => item.slug !== service.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    provider: { '@type': 'Organization', name: companyName },
  };

  return (
    <>
      <Helmet>
        <title>{`${service.title} | ${companyName}`}</title>
        <meta name="description" content={service.summary} />
        <script type="application/ld+json">{toJsonLd(jsonLd)}</script>
      </Helmet>

      {/* Same background colour as the top of the page header below, so the two blend together */}
      <div className="bg-brand-50">
        <Container className="pt-6">
          <Breadcrumbs
            items={[{ label: 'Home', to: '/' }, { label: 'Services', to: '/services' }, { label: service.title }]}
          />
        </Container>
      </div>
      <PageHeader eyebrow="Service" title={service.title} description={service.summary} className="pt-8 sm:pt-10" />

      <Section aria-label={`About ${service.title}`} className="pt-4 sm:pt-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <div>
              <h2 className="text-h3">About this service</h2>
              {/* pre-line keeps paragraph breaks typed in the admin dashboard */}
              <p className="mt-4 whitespace-pre-line text-lg text-slate-600">{service.description}</p>
            </div>

            {service.features.length > 0 && (
              <div>
                <h2 className="text-h3">What is included</h2>
                <ul className="mt-4 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-slate-700">
                      <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <DynamicIcon name={service.icon} className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-xl">Interested in this service?</h2>
              <p className="mt-2 text-slate-600">Tell us about your project and get a clear quote within two business days.</p>
              <div className="mt-5 flex flex-col gap-3">
                {/* The wizard (Phase 4) will read ?service= to pre-select this service */}
                <Button as={Link} to={`/quote?service=${service.slug}`}>
                  Get a quote
                </Button>
                <Button as={Link} to="/contact" variant="outline">
                  Ask a question
                </Button>
              </div>
            </Card>

            {otherServices.length > 0 && (
              <nav aria-label="Other services">
                <h2 className="text-lg">Other services</h2>
                <ul className="mt-3 space-y-2">
                  {otherServices.map((item) => (
                    <li key={item.slug}>
                      <Link to={`/services/${item.slug}`} className="font-medium text-brand-700 hover:underline">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </Section>

      <CallToAction />
    </>
  );
}
