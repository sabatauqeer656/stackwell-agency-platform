import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Container from '../layout/Container.jsx';
import SectionHeading from '../layout/SectionHeading.jsx';

// The closing band: gives the visitor a clear next step after reading the page.
// Every prop is optional, so most pages use it as-is and a few (like the FAQ) change the wording.
export default function CallToAction({
  title = 'Ready to build something great?',
  description = 'Tell us about your project. We reply within one business day with honest advice and a clear next step.',
  primary = { to: '/quote', label: 'Get a Quote' },
  secondary = { to: '/contact', label: 'Contact us' },
}) {
  return (
    <section aria-labelledby="cta-heading" className="bg-linear-to-br from-brand-800 to-accent-800 py-16 text-white sm:py-24">
      <Container size="md">
        <SectionHeading id="cta-heading" onDark title={title} description={description} />
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button as={Link} to={primary.to} size="lg" variant="light">
            {primary.label}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button as={Link} to={secondary.to} size="lg" variant="outline-light">
            {secondary.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
