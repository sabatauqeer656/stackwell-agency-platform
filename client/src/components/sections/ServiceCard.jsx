import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from '../ui/Card.jsx';
import DynamicIcon from '../ui/DynamicIcon.jsx';

// One service as a card. The whole card is a single link to the service's page.
// Card's hover style already sets display:block, so the flex layout lives on an inner div
// (two display classes on one element would fight each other).
export default function ServiceCard({ service }) {
  return (
    <Card as={Link} to={`/services/${service.slug}`} hover className="group w-full">
      <div className="flex h-full flex-col">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <DynamicIcon name={service.icon} className="h-6 w-6" />
        </span>
        <h3 className="mt-5 text-h3">{service.title}</h3>
        <p className="mt-2 flex-1 text-slate-600">{service.summary}</p>
        <span className="mt-5 inline-flex items-center gap-1 font-semibold text-brand-600">
          Learn more
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </span>
      </div>
    </Card>
  );
}
