import Section from '../layout/Section.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';
import QueryState from '../ui/QueryState.jsx';
import SkeletonGrid from '../ui/SkeletonGrid.jsx';
import TestimonialCard from './TestimonialCard.jsx';
import { useTestimonials } from '../../features/testimonials/useTestimonials.js';

export default function TestimonialsSection() {
  const query = useTestimonials();

  return (
    <Section tone="muted" aria-labelledby="testimonials-heading">
      <SectionHeading
        id="testimonials-heading"
        eyebrow="Client stories"
        title="Teams that trust us with their software"
        description="Here is what our clients say after working with us."
      />
      <div className="mt-12">
        <QueryState
          query={query}
          skeleton={<SkeletonGrid count={4} label="Loading testimonials" gridClass="md:grid-cols-2" />}
          errorTitle="We could not load our testimonials"
          emptyTitle="No testimonials yet"
        >
          {(testimonials) => (
            <ul className="grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <li key={testimonial._id} className="flex">
                  <TestimonialCard testimonial={testimonial} />
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </div>
    </Section>
  );
}
