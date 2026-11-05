import { Link } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import ContactDetails from '../../components/sections/ContactDetails.jsx';
import ContactFormPlaceholder from '../../components/sections/ContactFormPlaceholder.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

// Plain page content (not from the database): what the visitor can expect after getting in touch.
const nextSteps = [
  { title: 'We read your message', description: 'A senior team member reads every message and replies within one business day.' },
  { title: 'A short call', description: 'If it looks like a good fit, we book a 30-minute call to understand your goals.' },
  { title: 'A clear proposal', description: 'You receive a written scope, timeline and fixed price. No obligation.' },
];

// "<" is escaped so text typed into the admin dashboard can never close the <script> tag early.
const toJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

export default function Contact() {
  const { companyName, email, phone } = useSettings();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${companyName}`,
    mainEntity: {
      '@type': 'Organization',
      name: companyName,
      ...(email && { email }),
      ...(phone && { telephone: phone }),
    },
  };

  return (
    <>
      <Seo
        title="Contact"
        description={`Get in touch with ${companyName}. Tell us about your project and we will reply within one business day.`}
        path="/contact"
      >
        <script type="application/ld+json">{toJsonLd(jsonLd)}</script>
      </Seo>

      <PageHeader
        eyebrow="Contact"
        title="Let's talk about your project"
        description="Have an idea, a problem to solve or a project that needs rescuing? Tell us about it. We reply within one business day."
      />

      <Section aria-label="Get in touch" className="pt-4 sm:pt-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactFormPlaceholder />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <ContactDetails />

            <Card>
              <h2 className="text-xl">What happens next</h2>
              <ol className="mt-5 space-y-5">
                {nextSteps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white"
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-ink">{step.title}</h3>
                      <p className="mt-1 text-slate-600">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="bg-brand-50/60">
              <h2 className="text-xl">Want a price first?</h2>
              <p className="mt-2 text-slate-600">Describe your project in a few steps and get a clear quote within two business days.</p>
              <Button as={Link} to="/quote" variant="outline" className="mt-4 w-full">
                Request a quote
              </Button>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
