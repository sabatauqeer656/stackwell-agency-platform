import ProjectCard from './ProjectCard.jsx';

// The grid of project cards. Used by the home page and by the /projects page.
export default function ProjectsGrid({ projects }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project._id} className="flex">
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
