import Service from '../models/Service.js';
import SiteSettings from '../models/SiteSettings.js';
import { teamInquiryEmail, teamQuoteEmail, visitorConfirmationEmail } from './emailTemplates.js';
import { sendMail, teamAddress } from './mail.service.js';

// The company name comes from the settings an admin edits in the dashboard (with a safe fallback)
async function companyNameFromSettings() {
  const settings = await SiteSettings.findOne({ key: 'main' }).select('companyName').lean();
  return settings?.companyName ?? 'Stackwell';
}

// Two emails per lead: one to the team (Reply-To is the visitor, so "Reply" answers them),
// and a short confirmation to the visitor (Reply-To is the team).
// Promise.allSettled: if one of them fails, the other is still sent.

export async function notifyQuote(quote) {
  const [companyName, services] = await Promise.all([
    companyNameFromSettings(),
    quote.services?.length ? Service.find({ _id: { $in: quote.services } }).select('title').lean() : [],
  ]);
  await Promise.allSettled([
    sendMail({ to: teamAddress, replyTo: quote.email, ...teamQuoteEmail({ quote, serviceTitles: services.map((s) => s.title), companyName }) }),
    sendMail({ to: quote.email, replyTo: teamAddress, ...visitorConfirmationEmail({ name: quote.name, kind: 'quote', companyName }) }),
  ]);
}

export async function notifyInquiry(inquiry) {
  const companyName = await companyNameFromSettings();
  await Promise.allSettled([
    sendMail({ to: teamAddress, replyTo: inquiry.email, ...teamInquiryEmail({ inquiry, companyName }) }),
    sendMail({ to: inquiry.email, replyTo: teamAddress, ...visitorConfirmationEmail({ name: inquiry.name, kind: 'inquiry', companyName }) }),
  ]);
}
