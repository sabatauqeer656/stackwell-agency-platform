import { useRef } from 'react';
import Seo from '../../components/Seo.jsx';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import ProjectsGrid from '../../components/sections/ProjectsGrid.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FilterChips from '../../components/ui/FilterChips.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import SkeletonGrid from '../../components/ui/SkeletonGrid.jsx';
import { cn } from '../../lib/utils.js';
import { useProjects } from '../../features/projects/useProjects.js';
import { useSettings } from '../../features/settings/useSettings.js';
import { useSolutions } from '../../features/solutions/useSolutions.js';

const PAGE_SKELETONS = 6; // placeholder cards shown while the first page loads

// ?page=abc, ?page=0 or ?page=-3 all fall back to page 1
const parsePage = (value) => {
  const number = Number.parseInt(value ?? '', 10);
  return Number.isInteger(number) && number >= 1 ? number : 1;
};

export default function Projects() {
  const { companyName } = useSettings();
  const resultsRef = useRef(null);

  // The filter and the page live in the URL: /projects?industry=fintech&page=2
  // That makes a filtered view shareable and bookmarkable, and keeps the Back button working.
  const [searchParams, setSearchParams] = useSearchParams();
  const industry = searchParams.get('industry') ?? '';
  const page = parsePage(searchParams.get('page'));

  const solutions = useSolutions();
  const query = useProjects({ industry, page });

  // Change some URL parameters and keep the rest. An empty value removes the parameter.
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next); // pushes a new history entry, so Back returns to the previous view
  };

  const changeIndustry = (value) => updateParams({ industry: value, page: '' }); // new filter -> back to page 1
  const changePage = (value) => {
    updateParams({ page: value > 1 ? String(value) : '' });
    resultsRef.current?.scrollIntoView(); // bring the new results into view
  };

  const industries = solutions.data ?? [];
  const chips = [{ value: '', label: 'All' }, ...industries.map((item) => ({ value: item.slug, label: item.title }))];
  const industryTitle = industries.find((item) => item.slug === industry)?.title;

  // A short sentence for screen readers (and sighted users) that updates when the results change
  let summary = '';
  if (query.data) {
    const { items, meta } = query.data;
    const first = (meta.page - 1) * meta.limit + 1;
    summary = items.length
      ? `Showing ${first}-${first + items.length - 1} of ${meta.total} ${meta.total === 1 ? 'project' : 'projects'}`
      : 'No projects found';
  }

  const renderResults = ({ items, meta }) => {
    if (items.length === 0) {
      const onLaterPage = page > 1;
      return (
        <EmptyState
          title={onLaterPage ? 'No projects on this page' : 'No projects found'}
          description={
            onLaterPage
              ? 'That page does not exist (any more).'
              : industry
                ? 'We have no projects in this industry yet.'
                : 'Check back soon.'
          }
          action={
            onLaterPage ? (
              <Button variant="outline" onClick={() => changePage(1)}>
                Go to the first page
              </Button>
            ) : industry ? (
              <Button variant="outline" onClick={() => changeIndustry('')}>
                Show all projects
              </Button>
            ) : null
          }
        />
      );
    }

    return (
      <>
        {/* While the next page loads, the previous results stay visible but dimmed */}
        <div aria-busy={query.isPlaceholderData} className={cn('transition-opacity', query.isPlaceholderData && 'opacity-60')}>
          <ProjectsGrid projects={items} />
        </div>
        <div className="mt-10">
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={changePage} />
        </div>
      </>
    );
  };

  return (
    <>
      {/* The canonical address is always /projects: the filter and page are just views of the same list */}
      <Seo
        title={industryTitle ? `${industryTitle} projects` : 'Projects'}
        description={`Case studies from ${companyName}: real problems, practical solutions and measurable results.`}
        path="/projects"
      />

      <PageHeader
        eyebrow="Our work"
        title="Our Projects"
        description="Case studies from fintech, healthcare, retail and education: the problem, our approach and the results."
      />

      <Section aria-label="All projects" className="pt-4 sm:pt-8">
        <FilterChips label="Filter by industry" options={chips} value={industry} onChange={changeIndustry} />

        <div ref={resultsRef} className="mt-8 scroll-mt-24">
          <p aria-live="polite" className="mb-4 min-h-6 text-sm text-slate-500">
            {summary}
          </p>
          <QueryState
            query={query}
            skeleton={<SkeletonGrid count={PAGE_SKELETONS} label="Loading projects" gridClass="md:grid-cols-2 lg:grid-cols-3" />}
            errorTitle="We could not load our projects"
          >
            {renderResults}
          </QueryState>
        </div>
      </Section>

      <CallToAction />
    </>
  );
}
