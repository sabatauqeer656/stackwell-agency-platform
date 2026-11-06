import { Link, useParams } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import { ExternalLink, TrendingUp } from 'lucide-react';
import Breadcrumbs from '../../components/layout/Breadcrumbs.jsx';
import Container from '../../components/layout/Container.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import SafeImage from '../../components/ui/SafeImage.jsx';
import { useProject } from '../../features/projects/useProject.js';
import { useProjects } from '../../features/projects/useProjects.js';
import { useSettings } from '../../features/settings/useSettings.js';

// "<" is escaped so text typed into the admin dashboard can never close the <script> tag early.
const toJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

// "2025-06-30T00:00:00.000Z" -> "June 2025". UTC keeps the month from shifting with the visitor's timezone.
const formatMonth = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function ProjectDetail() {
  const { slug } = useParams();
  const { companyName } = useSettings();
  const query = useProject(slug);
  const firstPage = useProjects(); // already cached from /projects: used for "More case studies"

  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading project"
      errorTitle="We could not load this project"
      notFound={{
        title: 'Project not found',
        description: 'We could not find that project. It may have been renamed or removed.',
        backTo: '/projects',
        backLabel: 'See all projects',
      }}
    >
      {(project) => {
        const moreProjects = (firstPage.data?.items ?? []).filter((item) => item.slug !== project.slug).slice(0, 3);
        const jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.summary,
          creator: { '@type': 'Organization', name: companyName },
          ...(project.completedAt && { dateCreated: project.completedAt }),
        };

        return (
          <>
            <Seo title={project.title} description={project.summary} path={`/projects/${project.slug}`}>
              <script type="application/ld+json">{toJsonLd(jsonLd)}</script>
            </Seo>

            <div className="bg-brand-50">
              <Container className="pt-6">
                <Breadcrumbs
                  items={[{ label: 'Home', to: '/' }, { label: 'Projects', to: '/projects' }, { label: project.title }]}
                />
              </Container>
            </div>
            <PageHeader
              eyebrow={project.solution?.title ?? 'Case study'}
              title={project.title}
              description={project.summary}
              className="pt-8 sm:pt-10"
            >
              {/* A description list: label/value pairs about the project */}
              <dl className="flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <dt className="text-sm text-slate-500">Client</dt>
                  <dd className="font-semibold text-ink">{project.clientName}</dd>
                </div>
                {project.solution && (
                  <div>
                    <dt className="text-sm text-slate-500">Industry</dt>
                    <dd className="font-semibold text-ink">{project.solution.title}</dd>
                  </div>
                )}
                {project.completedAt && (
                  <div>
                    <dt className="text-sm text-slate-500">Completed</dt>
                    <dd className="font-semibold text-ink">{formatMonth(project.completedAt)}</dd>
                  </div>
                )}
                {project.liveUrl && (
                  <div>
                    <dt className="text-sm text-slate-500">Live site</dt>
                    <dd>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
                      >
                        Visit site
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </PageHeader>

            <Section aria-label={`${project.title} case study`} className="pt-4 sm:pt-8">
              <SafeImage src={project.coverImage} alt={`${project.title} project preview`} className="mb-12 aspect-video w-full rounded-card object-cover" />
              <div className="grid gap-12 lg:grid-cols-3">
                <div className="space-y-10 lg:col-span-2">
                  <div>
                    <h2 className="text-h3">The challenge</h2>
                    <p className="mt-4 whitespace-pre-line text-lg text-slate-600">{project.challenge}</p>
                  </div>
                  <div>
                    <h2 className="text-h3">Our approach</h2>
                    <p className="mt-4 whitespace-pre-line text-lg text-slate-600">{project.approach}</p>
                  </div>
                  {project.results.length > 0 && (
                    <div>
                      <h2 className="text-h3">Results</h2>
                      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                        {project.results.map((result) => (
                          <li key={result} className="flex">
                            <Card className="flex w-full items-start gap-3 bg-brand-50/50">
                              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                              <p className="font-medium text-ink">{result}</p>
                            </Card>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.images?.length > 0 && (
                    <div>
                      <h2 className="text-h3">Gallery</h2>
                      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                        {project.images.map((src, index) => (
                          <li key={src}>
                            <SafeImage src={src} alt={`${project.title} image ${index + 1}`} className="aspect-video w-full rounded-card object-cover" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                  {project.techStack.length > 0 && (
                    <Card>
                      <h2 className="text-lg">Tech stack</h2>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <li key={tech}>
                            <Badge variant="brand">{tech}</Badge>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  <Card>
                    <h2 className="text-lg">Want results like these?</h2>
                    <p className="mt-2 text-slate-600">Tell us about your project and get a clear quote.</p>
                    <Button as={Link} to="/quote" className="mt-4 w-full">
                      Get a quote
                    </Button>
                  </Card>

                  {moreProjects.length > 0 && (
                    <nav aria-label="More case studies">
                      <h2 className="text-lg">More case studies</h2>
                      <ul className="mt-3 space-y-2">
                        {moreProjects.map((item) => (
                          <li key={item.slug}>
                            <Link to={`/projects/${item.slug}`} className="font-medium text-brand-700 hover:underline">
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
      }}
    </DetailPageState>
  );
}
