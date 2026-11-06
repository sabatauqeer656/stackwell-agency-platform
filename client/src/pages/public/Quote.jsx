import { Link } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import QuoteWizard from '../../components/forms/QuoteWizard.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

export default function Quote() {
  const { companyName } = useSettings();

  return (
    <>
      <Seo
        title="Request a quote"
        description={`Describe your project in four short steps and get a clear, fixed-price quote from ${companyName} within two business days.`}
        path="/quote"
      />

      <PageHeader
        eyebrow="Get a quote"
        title="Request a quote"
        description="Four short steps. We reply with a clear scope, timeline and fixed price within two business days. No obligation."
      />

      <Section aria-label="Quote request form" className="pt-4 sm:pt-8" containerSize="md">
        <QuoteWizard />
        <p className="mt-6 text-center text-slate-600">
          Prefer to talk first?{' '}
          <Link to="/contact" className="font-semibold text-brand-700 hover:underline">
            Contact us
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
