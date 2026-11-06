import Button from '../../ui/Button.jsx';
import { budgetRanges, labelOf, projectTypes, timelines } from '../../../features/quotes/quoteOptions.js';

// One block of the summary, with an "Edit" button that jumps back to that step.
function Summary({ title, step, onEdit, children }) {
  return (
    <section className="rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <Button variant="ghost" size="sm" onClick={() => onEdit(step)}>
          Edit<span className="sr-only"> {title.toLowerCase()}</span>
        </Button>
      </div>
      <dl className="mt-3 space-y-3 text-slate-700">{children}</dl>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}

// Step 4: everything the visitor entered, read-only, before it is sent.
export default function ReviewStep({ values, servicesQuery, onEdit }) {
  const serviceTitles = values.services.map(
    (slug) => servicesQuery.data?.find((service) => service.slug === slug)?.title
  ).filter(Boolean);

  return (
    <div className="space-y-4">
      <Summary title="Your project" step={0} onEdit={onEdit}>
        <Row label="Type">{labelOf(projectTypes, values.projectType)}</Row>
        <Row label="Services">{serviceTitles.length > 0 ? serviceTitles.join(', ') : 'No specific service chosen'}</Row>
      </Summary>

      <Summary title="Budget and timeline" step={1} onEdit={onEdit}>
        <Row label="Budget">{labelOf(budgetRanges, values.budgetRange)}</Row>
        <Row label="Start">{labelOf(timelines, values.timeline)}</Row>
      </Summary>

      <Summary title="Your details" step={2} onEdit={onEdit}>
        <Row label="Description">
          <span className="whitespace-pre-line font-normal">{values.description}</span>
        </Row>
        <Row label="Name">{values.name}</Row>
        <Row label="Email">{values.email}</Row>
        {values.phone && <Row label="Phone">{values.phone}</Row>}
        {values.company && <Row label="Company">{values.company}</Row>}
      </Summary>
    </div>
  );
}
