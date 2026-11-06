import ContentList from '../../components/admin/ContentList.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useAdminFaqs } from '../../features/admin/faqs.js';

export default function Faqs() {
  return (
    <ContentList
      title="FAQs"
      intro="Questions visitors often ask. Published ones appear on the FAQ page, grouped by category."
      noun="FAQ"
      plural="FAQs"
      useData={useAdminFaqs}
      adminPath="/admin/faqs"
      searchHint="Question"
      emptyHint="Add the first question. It appears on the FAQ page once it is published."
      renderBadges={(faq) => <Badge variant="neutral">{faq.category}</Badge>}
      renderRow={(faq) => (
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink">{faq.question}</span>
          <span className="block truncate text-sm text-slate-500">{faq.answer}</span>
        </span>
      )}
    />
  );
}
