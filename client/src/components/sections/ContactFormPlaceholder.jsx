import { Mail } from 'lucide-react';
import Card from '../ui/Card.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

// PHASE 4: this component is replaced by the real <ContactForm /> (validation, submit, spam protection).
// Until then it points visitors at the one thing that already works: email.
export default function ContactFormPlaceholder() {
  const { email } = useSettings();

  return (
    <Card>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Mail className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-h3">Send us a message</h2>
      <p className="mt-3 text-lg text-slate-600">
        Our online contact form is almost ready. Until it launches, the quickest way to reach us is by email
        {email ? (
          <>
            {': '}
            <a href={`mailto:${email}`} className="font-semibold text-brand-700 hover:underline">
              {email}
            </a>
            .
          </>
        ) : (
          '.'
        )}
      </p>
      <p className="mt-4 text-slate-600">
        Tell us a little about your project, your timeline and any deadlines. We reply within one business day.
      </p>
    </Card>
  );
}
