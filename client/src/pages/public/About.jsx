import { Helmet } from 'react-helmet-async';
import { Accessibility, Eye, Handshake, Hammer } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import SectionHeading from '../../components/layout/SectionHeading.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import TeamSection from '../../components/sections/TeamSection.jsx';
import Card from '../../components/ui/Card.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

// This text changes rarely and needs no admin dashboard, so it lives here as plain data
// instead of in the database. Not everything has to come from an API.
const story = [
  'Stackwell started with a simple frustration: too many software projects go quiet for months and then arrive late, over budget and not quite what anyone asked for.',
  'So we built our agency around the opposite habit. We work in short iterations, show real progress every two weeks and agree on a clear price before we write a line of code. You always know where the project stands, and you can change direction while it is still cheap to do so.',
  'Today we are a small, senior team of engineers and designers. We take on a limited number of projects at a time, so the people you meet in the first call are the people who build your product.',
];

const values = [
  {
    icon: Handshake,
    title: 'Honest estimates',
    description: 'We tell you what something will really cost and how long it will take, even when it is not what you hoped to hear.',
  },
  {
    icon: Eye,
    title: 'Progress you can see',
    description: 'A working demo every two weeks. No long silences, no big-bang surprises at the end.',
  },
  {
    icon: Hammer,
    title: 'Built to last',
    description: 'Tested, documented code that any developer can pick up. You own it, and you are never locked in.',
  },
  {
    icon: Accessibility,
    title: 'Accessible by default',
    description: 'Good software works for everyone. We build to accessibility standards from the first design, not as an afterthought.',
  },
];

// "<" is escaped so text typed into the admin dashboard can never close the <script> tag early.
const toJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

export default function About() {
  const { companyName, tagline, email } = useSettings();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    description: tagline,
    ...(email && { email }),
  };

  return (
    <>
      <Helmet>
        <title>{`About | ${companyName}`}</title>
        <meta
          name="description"
          content={`Meet the small, senior team at ${companyName}: how we work, what we value and who will build your product.`}
        />
        <script type="application/ld+json">{toJsonLd(jsonLd)}</script>
      </Helmet>

      <PageHeader
        eyebrow="About us"
        title={`We are ${companyName}`}
        description="A small team of engineers and designers who believe software projects should be predictable, transparent and worth the money."
      />

      <Section aria-labelledby="story-heading" className="pt-4 sm:pt-8" containerSize="md">
        <h2 id="story-heading" className="text-h3">
          Our story
        </h2>
        <div className="mt-6 space-y-5 text-lg text-slate-600">
          {story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section tone="muted" aria-labelledby="values-heading">
        <SectionHeading
          id="values-heading"
          eyebrow="What we stand for"
          title="How we work"
          description="Four habits we hold ourselves to on every project."
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex">
              <Card className="w-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-h3">{title}</h3>
                <p className="mt-2 text-slate-600">{description}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <TeamSection />

      <CallToAction />
    </>
  );
}
