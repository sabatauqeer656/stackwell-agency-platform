import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Email is only SENT when all four settings exist. Otherwise (a fresh clone, tests, a quiet laptop)
// the message is still composed by Nodemailer, but handed to its "JSON transport", which sends nothing:
// it just returns the finished message. We keep the last few in memory and write a one-line note to the log.
export const mailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.MAIL_FROM);

// Port 465 speaks SSL from the first byte ("secure"); 587 starts plain and upgrades (STARTTLS).
export function buildTransport({ host, port, user, pass }) {
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

// `mailer.transport` is a property (not a constant) so a test can swap it for a broken one
export const mailer = {
  transport: mailConfigured
    ? buildTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, user: env.SMTP_USER, pass: env.SMTP_PASS })
    : nodemailer.createTransport({ jsonTransport: true }),
};

// The most recent emails that were composed but NOT sent (only filled when email is not configured)
const outbox = [];
export const getOutbox = () => outbox;
export const clearOutbox = () => {
  outbox.length = 0;
};

// Where the team's alerts go: MAIL_TO, or the sending account itself
export const teamAddress = env.MAIL_TO ?? env.SMTP_USER ?? 'team@stackwell.example';

// A header value (subject, name...) must be ONE line. A line break inside it would let an attacker add
// their own headers, for example a hidden Bcc, to a mail we send ("header injection").
export const headerSafe = (value, max = 150) =>
  String(value)
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    // Unicode "line separator" and "paragraph separator" count as line breaks too
    .replaceAll(String.fromCharCode(0x2028), ' ')
    .replaceAll(String.fromCharCode(0x2029), ' ')
    .trim()
    .slice(0, max);

// Sends one email and NEVER throws. An email problem must not break the form the visitor just submitted:
// their message is already saved, so we log the problem and carry on. (Nodemailer errors never contain the password.)
export async function sendMail({ to, replyTo, subject, text, html }) {
  const message = {
    from: env.MAIL_FROM ?? 'Stackwell <no-reply@stackwell.example>',
    to,
    ...(replyTo && { replyTo }),
    subject: headerSafe(subject, 200),
    text,
    html,
  };

  try {
    const info = await mailer.transport.sendMail(message);
    if (!mailConfigured) {
      outbox.push(JSON.parse(info.message));
      if (outbox.length > 50) outbox.shift();
      if (env.NODE_ENV !== 'test') console.log(`[mail] email is not configured, so nothing was sent: "${message.subject}" -> ${to}`);
    }
    return true;
  } catch (error) {
    console.error('Email could not be sent:', error.message);
    return false;
  }
}
