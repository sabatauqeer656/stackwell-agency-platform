import { BUDGET_LABELS, PROJECT_TYPE_LABELS, TIMELINE_LABELS } from '../constants/leadLabels.js';
import { headerSafe } from './mail.service.js';

// Everything a visitor typed is UNTRUSTED. Put raw into HTML it could add links, images or scripts to an
// email that lands in the team's inbox. So every value is escaped: < > & " ' become harmless text.
export const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// The confirmation goes to whatever address a visitor typed, which may not be theirs. So it must not carry anything
// they wrote, or the form becomes a way to send spam through us. Only a plain first name is allowed, else "there".
export const firstNameOf = (name) => {
  const token = String(name).trim().split(/\s+/)[0] ?? '';
  return /^[\p{L}][\p{L}'-]{0,29}$/u.test(token) ? token : 'there';
};

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

// A simple, widely supported HTML layout (tables and inline styles: email clients ignore modern CSS)
function layout({ heading, intro, rows = [], footer }) {
  const rowHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;color:#64748b;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:8px 12px;color:#0f172a">${escapeHtml(value).replaceAll('\n', '<br>')}</td></tr>`
    )
    .join('');

  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px">
<tr><td style="padding:24px 24px 8px"><h1 style="margin:0;font-size:20px;color:#0f172a">${escapeHtml(heading)}</h1></td></tr>
<tr><td style="padding:0 24px 16px;color:#334155;font-size:15px;line-height:1.5">${intro}</td></tr>
${rowHtml ? `<tr><td style="padding:0 12px 16px"><table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #e2e8f0">${rowHtml}</table></td></tr>` : ''}
<tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px">${escapeHtml(footer)}</td></tr>
</table></td></tr></table></body></html>`;
}

const toText = (rows) => rows.map(([label, value]) => `${label}: ${value}`).join('\n');

// ---------- To the team ----------

export function teamQuoteEmail({ quote, serviceTitles, companyName }) {
  const rows = [
    ['Name', quote.name],
    ['Email', quote.email],
    ...(quote.phone ? [['Phone', quote.phone]] : []),
    ...(quote.company ? [['Company', quote.company]] : []),
    ['Project type', PROJECT_TYPE_LABELS[quote.projectType] ?? quote.projectType],
    ['Services', serviceTitles.length > 0 ? serviceTitles.join(', ') : 'None chosen'],
    ['Budget', BUDGET_LABELS[quote.budgetRange] ?? quote.budgetRange],
    ['Timeline', TIMELINE_LABELS[quote.timeline] ?? quote.timeline],
    ['Attachments', quote.attachments?.length ? `${plural(quote.attachments.length, 'file')} attached (open the quote in the dashboard to download)` : 'None'],
    ['Description', quote.description],
    ['Reference', String(quote._id)],
  ];
  const intro = 'A new quote request just arrived. Reply to this email to answer the visitor directly.';
  return {
    subject: `New quote request: ${headerSafe(quote.name, 60)} (${PROJECT_TYPE_LABELS[quote.projectType] ?? 'project'})`,
    text: `${intro}\n\n${toText(rows)}\n`,
    html: layout({ heading: 'New quote request', intro: escapeHtml(intro), rows, footer: `${companyName} notification` }),
  };
}

export function teamInquiryEmail({ inquiry, companyName }) {
  const rows = [
    ['Name', inquiry.name],
    ['Email', inquiry.email],
    ...(inquiry.phone ? [['Phone', inquiry.phone]] : []),
    ...(inquiry.company ? [['Company', inquiry.company]] : []),
    ['Subject', inquiry.subject],
    ['Message', inquiry.message],
    ['Reference', String(inquiry._id)],
  ];
  const intro = 'A new message arrived through the contact form. Reply to this email to answer the visitor directly.';
  return {
    subject: `New message: ${headerSafe(inquiry.subject, 80)} (from ${headerSafe(inquiry.name, 40)})`,
    text: `${intro}\n\n${toText(rows)}\n`,
    html: layout({ heading: 'New contact message', intro: escapeHtml(intro), rows, footer: `${companyName} notification` }),
  };
}

// ---------- To the visitor ----------

export function visitorConfirmationEmail({ name, kind, companyName }) {
  const isQuote = kind === 'quote';
  const what = isQuote ? 'quote request' : 'message';
  const when = isQuote ? 'within 2 business days' : 'within 24 hours';
  const greeting = `Hi ${firstNameOf(name)},`;
  const body = `Thanks for getting in touch with ${companyName}. We received your ${what} and will reply ${when}.`;
  const note = 'If you did not send this, you can safely ignore this email.';
  return {
    subject: `We received your ${what}`,
    text: `${greeting}\n\n${body}\n\n${note}\n\n${companyName}\n`,
    html: layout({
      heading: `We received your ${what}`,
      intro: `${escapeHtml(greeting)}<br><br>${escapeHtml(body)}<br><br>${escapeHtml(note)}`,
      footer: companyName,
    }),
  };
}
