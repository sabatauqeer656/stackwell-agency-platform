import Card from '../ui/Card.jsx';
import StarRating from '../ui/StarRating.jsx';

// A client quote. <figure>, <blockquote> and <figcaption> tell browsers and screen readers
// "this is a quotation, and here is who said it".
export default function TestimonialCard({ testimonial }) {
  const { clientName, clientRole, company, quote, rating } = testimonial;

  return (
    <Card as="figure" className="flex h-full w-full flex-col">
      <StarRating rating={rating} />
      <blockquote className="mt-4 flex-1 text-lg text-slate-700">&ldquo;{quote}&rdquo;</blockquote>
      <figcaption className="mt-6 border-t border-slate-100 pt-4">
        <p className="font-semibold text-ink">{clientName}</p>
        <p className="text-sm text-slate-500">
          {clientRole}
          {company && `, ${company}`}
        </p>
      </figcaption>
    </Card>
  );
}
