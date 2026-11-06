import Faq from '../models/Faq.js';
import Inquiry from '../models/Inquiry.js';
import Project from '../models/Project.js';
import QuoteRequest from '../models/QuoteRequest.js';
import Service from '../models/Service.js';
import Solution from '../models/Solution.js';
import TeamMember from '../models/TeamMember.js';
import Testimonial from '../models/Testimonial.js';
import { INQUIRY_STATUSES, QUOTE_STATUSES } from '../constants/leads.js';

const RECENT_COUNT = 5;

// { new: 3, read: 1, replied: 0, archived: 0 }: every status is present, even when its count is zero
async function countByStatus(Model, statuses) {
  const groups = await Model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
  for (const { _id, count } of groups) if (_id in counts) counts[_id] = count;
  return counts;
}

// { published: 6, draft: 0 }
async function countPublished(Model) {
  const groups = await Model.aggregate([{ $group: { _id: '$isPublished', count: { $sum: 1 } } }]);
  const published = groups.find((group) => group._id === true)?.count ?? 0;
  const draft = groups.find((group) => group._id === false)?.count ?? 0;
  return { published, draft };
}

const recentInquiries = () =>
  Inquiry.find().sort({ createdAt: -1 }).limit(RECENT_COUNT).select('name email subject status createdAt').lean();

const recentQuotes = () =>
  QuoteRequest.find().sort({ createdAt: -1 }).limit(RECENT_COUNT).select('name email projectType status createdAt').lean();

// Everything the dashboard home shows, in one request. All the queries run at the same time.
export async function getDashboardStats() {
  const [inquiries, quotes, services, solutions, projects, testimonials, team, faqs, latestInquiries, latestQuotes] =
    await Promise.all([
      countByStatus(Inquiry, INQUIRY_STATUSES),
      countByStatus(QuoteRequest, QUOTE_STATUSES),
      countPublished(Service),
      countPublished(Solution),
      countPublished(Project),
      countPublished(Testimonial),
      countPublished(TeamMember),
      countPublished(Faq),
      recentInquiries(),
      recentQuotes(),
    ]);

  const sum = (counts) => Object.values(counts).reduce((total, count) => total + count, 0);

  return {
    leads: {
      inquiries: { total: sum(inquiries), byStatus: inquiries },
      quotes: { total: sum(quotes), byStatus: quotes },
    },
    content: { services, solutions, projects, testimonials, team, faqs },
    recent: { inquiries: latestInquiries, quotes: latestQuotes },
  };
}
