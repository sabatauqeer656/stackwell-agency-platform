import ContentList from '../../components/admin/ContentList.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useAdminProjects } from '../../features/admin/projects.js';

export default function Projects() {
  return (
    <ContentList
      title="Projects"
      intro="Case studies shown in the portfolio. Featured projects also appear on the home page."
      noun="project"
      plural="projects"
      useData={useAdminProjects}
      adminPath="/admin/projects"
      searchHint="Project title"
      emptyHint="Add your first case study. Create a solution (industry) first, because every project belongs to one."
      renderBadges={(project) => (project.isFeatured ? <Badge variant="brand">Featured</Badge> : null)}
      renderRow={(project) => (
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink">{project.title}</span>
          <span className="block truncate text-sm text-slate-500">
            {project.clientName}
            {project.solution?.title ? ` · ${project.solution.title}` : ''}
          </span>
          <span className="block truncate text-xs text-slate-500">/projects/{project.slug}</span>
        </span>
      )}
    />
  );
}
