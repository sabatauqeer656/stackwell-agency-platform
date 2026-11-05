import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Container from '../layout/Container.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';

// The closing band: gives the visitor a clear next step after reading the page.
export default function CallToAction() {
  return (
    <section aria-labelledby="cta-heading" className="bg-linear-to-br from-brand-800 to-accent-800 py-16 text-white sm:py-24">
      <Container size="md">
        <SectionHeading
          id="cta-heading"
          onDark
          title="Ready to build something great?"
          description="Tell us about your project. We reply within one business day with honest advice and a clear next step."
        />
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button as={Link} to="/quote" size="lg" variant="light">
            Get a Quote
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button as={Link} to="/contact" size="lg" variant="outline-light">
            Contact us
          </Button>
        </div>
      </Container>
    </section>
  );
}
