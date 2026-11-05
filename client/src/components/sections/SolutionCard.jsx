import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from '../ui/Card.jsx';
import DynamicIcon from '../ui/DynamicIcon.jsx';

// One industry as a card. The whole card links to the industry page.
// (Similar to ServiceCard on purpose: the two differ in link target and label, and keeping
// them separate means a change to one can never accidentally change the other.)
export default function SolutionCard({ solution }) {
  return (
    <Card as={Link} to={`/solutions/${solution.slug}`} hover className="group w-full">
      <div className="flex h-full flex-col">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
          <DynamicIcon name={solution.icon} className="h-6 w-6" />
        </span>
        <h3 className="mt-5 text-h3">{solution.title}</h3>
        <p className="mt-2 flex-1 text-slate-600">{solution.summary}</p>
        <span className="mt-5 inline-flex items-center gap-1 font-semibold text-brand-600">
          Explore {solution.title}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </span>
      </div>
    </Card>
  );
}
