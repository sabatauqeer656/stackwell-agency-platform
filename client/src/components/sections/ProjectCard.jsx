import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Card from '../ui/Card.jsx';

const MAX_TAGS = 4;

// One portfolio project as a card. The whole card links to the case study.
export default function ProjectCard({ project }) {
  const tags = project.techStack.slice(0, MAX_TAGS);
  const hiddenTags = project.techStack.length - tags.length;

  return (
    <Card as={Link} to={`/projects/${project.slug}`} hover className="group w-full">
      <div className="flex h-full flex-col">
        {/* `solution` is the industry, filled in by the API (populate) */}
        {project.solution && (
          <div>
            <Badge variant="brand">{project.solution.title}</Badge>
          </div>
        )}
        <h3 className="mt-4 text-h3">{project.title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">for {project.clientName}</p>
        <p className="mt-3 flex-1 text-slate-600">{project.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies used">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
          {hiddenTags > 0 && (
            <li>
              <Badge>+{hiddenTags} more</Badge>
            </li>
          )}
        </ul>

        <span className="mt-5 inline-flex items-center gap-1 font-semibold text-brand-600">
          View case study
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </span>
      </div>
    </Card>
  );
}
