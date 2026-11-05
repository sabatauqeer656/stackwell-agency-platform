import { ChevronDown } from 'lucide-react';

// One question that opens to show its answer.
//
// This uses the browser's own <details>/<summary> elements instead of a hand-built accordion.
// The browser then provides, with no JavaScript: Enter/Space to toggle, the "expanded" state
// for screen readers, and find-in-page that searches closed answers too.
// A custom ARIA accordion (button + aria-expanded + aria-controls) would be more code
// and easier to get wrong.
export default function FaqItem({ faq }) {
  return (
    <details className="group rounded-card border border-slate-200 bg-white shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card p-5 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {faq.question}
        <ChevronDown
          className="h-5 w-5 shrink-0 text-brand-600 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div className="px-5 pb-5 text-slate-600">
        <p className="whitespace-pre-line">{faq.answer}</p>
      </div>
    </details>
  );
}
