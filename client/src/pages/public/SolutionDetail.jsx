import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CircleCheck } from 'lucide-react';
import Breadcrumbs from '../../components/layout/Breadcrumbs.jsx';
import Container from '../../components/layout/Container.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import IndustryProjects from '../../components/sections/IndustryProjects.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import DynamicIcon from '../../components/ui/DynamicIcon.jsx';
import { useSettings } from '../../features/settings/useSettings.js';
import { useSolution } from '../../features/solutions/useSolution.js';
import { useSolutions } from '../../features/solutions/useSolutions.js';

// "<" is escaped so text typed into the admin dashboard can never close the <script> tag early.
const toJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

export default function SolutionDetail() {
  const { slug } = useParams();
  const { companyName } = useSettings();
  const query = useSolution(slug);
  const allSolutions = useSolutions(); // already cached from the list: used for "Other industries"

  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading industry"
      errorTitle="We could not load this industry"
      notFound={{
        title: 'Industry not found',
        description: 'We could not find that industry. It may have been renamed or removed.',
        backTo: '/solutions',
        backLabel: 'See all industries',
      }}
    >
      {(solution) => {
        const otherSolutions = (allSolutions.data ?? []).filter((item) => item.slug !== solution.slug);
        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${solution.title} software`,
          description: solution.summary,
          about: { '@type': 'Thing', name: solution.title },
          publisher: { '@type': 'Organization', name: companyName },
        };

        return (
          <>
            <Helmet>
              <title>{`${solution.title} | ${companyName}`}</title>
              <meta name="description" content={solution.summary} />
              <script type="application/ld+json">{toJsonLd(jsonLd)}</script>
            </Helmet>

            <div className="bg-brand-50">
              <Container className="pt-6">
                <Breadcrumbs
                  items={[{ label: 'Home', to: '/' }, { label: 'Solutions', to: '/solutions' }, { label: solution.title }]}
                />
              </Container>
            </div>
            <PageHeader eyebrow="Industry" title={solution.title} description={solution.summary} className="pt-8 sm:pt-10" />

            <Section aria-label={`About ${solution.title}`} className="pt-4 sm:pt-8">
              <div className="grid gap-12 lg:grid-cols-3">
                <div className="space-y-10 lg:col-span-2">
                  <div>
                    <h2 className="text-h3">About this industry</h2>
                    <p className="mt-4 whitespace-pre-line text-lg text-slate-600">{solution.description}</p>
                  </div>

                  {solution.challenges.length > 0 && (
                    <div>
                      <h2 className="text-h3">Challenges we solve</h2>
                      <ul className="mt-4 space-y-3">
                        {solution.challenges.map((challenge) => (
                          <li key={challenge} className="flex items-start gap-3 text-slate-700">
                            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                  <Card>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                      <DynamicIcon name={solution.icon} className="h-6 w-6" />
                    </span>
                    <h2 className="mt-4 text-xl">Building for {solution.title}?</h2>
                    <p className="mt-2 text-slate-600">
                      Tell us about your project and get a clear quote within two business days.
                    </p>
                    <div className="mt-5 flex flex-col gap-3">
                      <Button as={Link} to="/quote">
                        Get a quote
                      </Button>
                      <Button as={Link} to="/contact" variant="outline">
                        Talk to us
                      </Button>
                    </div>
                  </Card>

                  {otherSolutions.length > 0 && (
                    <nav aria-label="Other industries">
                      <h2 className="text-lg">Other industries</h2>
                      <ul className="mt-3 space-y-2">
                        {otherSolutions.map((item) => (
                          <li key={item.slug}>
                            <Link to={`/solutions/${item.slug}`} className="font-medium text-brand-700 hover:underline">
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

            {/* key: a new industry gets a fresh component, so another industry's projects never flash up first */}
            <IndustryProjects key={solution.slug} slug={solution.slug} title={solution.title} />

            <CallToAction />
          </>
        );
      }}
    </DetailPageState>
  );
}
