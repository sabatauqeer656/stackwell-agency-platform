import ContentList from '../../components/admin/ContentList.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import { useAdminTestimonials } from '../../features/admin/testimonials.js';

export default function Testimonials() {
  return (
    <ContentList
      title="Testimonials"
      intro="What clients say about the agency. Published ones appear on the website, in order."
      noun="testimonial"
      plural="testimonials"
      useData={useAdminTestimonials}
      adminPath="/admin/testimonials"
      searchHint="Client name"
      emptyHint="Add the first client quote. It appears on the website once it is published."
      renderRow={(testimonial) => (
        <>
          <Avatar name={testimonial.clientName} src={testimonial.avatar} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">{testimonial.clientName}</span>
            <span className="block truncate text-sm text-slate-500">
              {testimonial.clientRole}
              {testimonial.company ? `, ${testimonial.company}` : ''}
            </span>
            <span className="block truncate text-sm text-slate-600">&ldquo;{testimonial.quote}&rdquo;</span>
            <span className="mt-1 block">
              <StarRating rating={testimonial.rating} />
            </span>
          </span>
        </>
      )}
    />
  );
}
