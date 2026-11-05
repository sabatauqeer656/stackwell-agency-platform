import Seo from '../../components/Seo.jsx';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/layout/Section.jsx';
import CallToAction from '../../components/sections/CallToAction.jsx';
import FaqList from '../../components/sections/FaqList.jsx';
import FilterChips from '../../components/ui/FilterChips.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useFaqs } from '../../features/faqs/useFaqs.js';
import { useSettings } from '../../features/settings/useSettings.js';
import { slugify } from '../../lib/utils.js';

// "<" is escaped so text typed into the admin dashboard can never close the <script> tag early.
const toJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

// [{ category: 'General' }, { category: 'Pricing' }, { category: 'General' }]
//   -> [{ category: 'General', items: [...2] }, { category: 'Pricing', items: [...1] }]
// Categories keep the order in which they first appear (the API already sorts them).
function groupByCategory(faqs) {
  const groups = new Map();
  for (const faq of faqs) {
    if (!groups.has(faq.category)) groups.set(faq.category, []);
    groups.get(faq.category).push(faq);
  }
  return [...groups].map(([category, items]) => ({ category, items }));
}

function FaqSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <p role="status" className="sr-only">
        Loading questions
      </p>
      {[0, 1, 2, 3, 4].map((key) => (
        <Skeleton key={key} className="h-16 w-full rounded-card" />
      ))}
    </div>
  );
}

export default function Faq() {
  const { companyName } = useSettings();
  const query = useFaqs();

  // The chosen category lives in the URL: /faq?category=pricing (shareable, Back button works)
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('category') ?? '';

  const groups = groupByCategory(query.data ?? []);
  const chips = [{ value: '', label: 'All' }, ...groups.map((group) => ({ value: slugify(group.category), label: group.category }))];
  const selected = chips.some((chip) => chip.value === requested) ? requested : ''; // unknown category -> All
  const visibleGroups = selected ? groups.filter((group) => slugify(group.category) === selected) : groups;

  const changeCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('category', value);
    else next.delete('category');
    setSearchParams(next);
  };

  // FAQPage structured data lets search engines show these questions in their results.
  // It describes exactly the questions currently on screen.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: visibleGroups.flatMap((group) =>
      group.items.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      }))
    ),
  };

  return (
    <>
      <Seo
        title="FAQ"
        description={`Answers to common questions about pricing, process, support and working with ${companyName}.`}
        path="/faq"
      >
        {visibleGroups.length > 0 && <script type="application/ld+json">{toJsonLd(jsonLd)}</script>}
      </Seo>

      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Straight answers about pricing, how we work and what happens after launch."
      />

      <Section aria-label="Questions and answers" className="pt-4 sm:pt-8" containerSize="md">
        {chips.length > 2 && (
          <div className="mb-10">
            <FilterChips label="Filter by topic" options={chips} value={selected} onChange={changeCategory} />
          </div>
        )}
        <QueryState
          query={query}
          skeleton={<FaqSkeleton />}
          errorTitle="We could not load the questions"
          emptyTitle="No questions yet"
          emptyDescription="Have one of your own? Send us a message and we will answer it."
        >
          {() => <FaqList groups={visibleGroups} />}
        </QueryState>
      </Section>

      <CallToAction
        title="Still have questions?"
        description="We are happy to help. Send us a message and we will reply within one business day."
        primary={{ to: '/contact', label: 'Contact us' }}
        secondary={{ to: '/quote', label: 'Get a Quote' }}
      />
    </>
  );
}
