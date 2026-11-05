import { Link } from 'react-router-dom';
import Section from '../layout/Section.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';
import Button from '../ui/Button.jsx';
import QueryState from '../ui/QueryState.jsx';
import SkeletonGrid from '../ui/SkeletonGrid.jsx';
import ProjectCard from './ProjectCard.jsx';
import { useFeaturedProjects } from '../../features/projects/useFeaturedProjects.js';

export default function FeaturedProjectsSection() {
  const query = useFeaturedProjects();

  return (
    <Section aria-labelledby="projects-heading">
      <SectionHeading
        id="projects-heading"
        eyebrow="Our work"
        title="Projects we are proud of"
        description="Real problems, practical solutions and results you can measure."
      />
      <div className="mt-12">
        <QueryState
          query={query}
          skeleton={<SkeletonGrid count={3} label="Loading projects" />}
          errorTitle="We could not load our projects"
          emptyTitle="No featured projects yet"
        >
          {(projects) => (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <li key={project._id} className="flex">
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </div>
      <div className="mt-10 text-center">
        <Button as={Link} to="/projects" variant="outline" size="lg">
          View all projects
        </Button>
      </div>
    </Section>
  );
}
