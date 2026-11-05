import { Helmet } from 'react-helmet-async';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import SolutionsGrid from '../../components/sections/SolutionsGrid.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import SkeletonGrid from '../../components/ui/SkeletonGrid.jsx';
import { useSettings } from '../../features/settings/useSettings.js';
import { useSolutions } from '../../features/solutions/useSolutions.js';

export default function Solutions() {
  const { companyName } = useSettings();
  const query = useSolutions();

  return (
    <>
      <Helmet>
        <title>{`Solutions by Industry | ${companyName}`}</title>
        <meta
          name="description"
          content={`Software for fintech, healthcare, retail and education teams: how ${companyName} solves the problems each industry faces.`}
        />
      </Helmet>

      <PageHeader
        eyebrow="Industries"
        title="Solutions by Industry"
        description="Every industry has its own rules, risks and customers. Here is how we help teams in the ones we know best."
      />

      <Section aria-label="All industries" className="pt-4 sm:pt-8">
        <QueryState
          query={query}
          skeleton={<SkeletonGrid count={4} label="Loading industries" gridClass="sm:grid-cols-2" withIcon />}
          errorTitle="We could not load our industries"
          emptyTitle="No industries yet"
        >
          {(solutions) => <SolutionsGrid solutions={solutions} />}
        </QueryState>
      </Section>

      <CallToAction />
    </>
  );
}
