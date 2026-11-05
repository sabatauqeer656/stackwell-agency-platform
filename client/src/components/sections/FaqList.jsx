import FaqItem from './FaqItem.jsx';
import { slugify } from '../../lib/utils.js';

// Questions grouped under a heading per category. `groups` is [{ category, items }].
export default function FaqList({ groups }) {
  return (
    <div className="space-y-12">
      {groups.map((group) => {
        const headingId = `faq-${slugify(group.category)}`;
        return (
          <section key={group.category} aria-labelledby={headingId}>
            <h2 id={headingId} className="text-h3">
              {group.category}
            </h2>
            <ul className="mt-5 space-y-3">
              {group.items.map((faq) => (
                <li key={faq._id}>
                  <FaqItem faq={faq} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
