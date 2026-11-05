import { Link } from 'react-router-dom';
import Section from '../layout/Section.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import QueryState from '../ui/QueryState.jsx';
import SkeletonGrid from '../ui/SkeletonGrid.jsx';
import ProjectsGrid from './ProjectsGrid.jsx';
import { useProjects } from '../../features/projects/useProjects.js';

// The case studies of ONE industry. It has its own query, so if it fails the rest of the
// industry page still works. It reuses the same hook and grid as the /projects page.
export default function IndustryProjects({ slug, title }) {
  const query = useProjects({ industry: slug, page: 1 });

  return (
    <Section tone="muted" aria-labelledby="industry-projects-heading">
      <SectionHeading
        id="industry-projects-heading"
        eyebrow="Our work"
        title={`Projects in ${title}`}
        description="Real examples of what we have built for teams in this industry."
      />
      <div className="mt-12">
        <QueryState
          query={query}
          skeleton={<SkeletonGrid count={3} label="Loading projects" gridClass="md:grid-cols-2 lg:grid-cols-3" />}
          errorTitle="We could not load these projects"
        >
          {({ items, meta }) =>
            items.length === 0 ? (
              <EmptyState
                title={`No ${title} projects yet`}
                description="We are always working on new things. Tell us about yours."
                action={
                  <Button as={Link} to="/quote">
                    Get a quote
                  </Button>
                }
              />
            ) : (
              <>
                <ProjectsGrid projects={items} />
                {meta.total > items.length && (
                  <div className="mt-10 text-center">
                    <Button as={Link} to={`/projects?industry=${slug}`} variant="outline" size="lg">
                      View all {title} projects
                    </Button>
                  </div>
                )}
              </>
            )
          }
        </QueryState>
      </div>
    </Section>
  );
}
