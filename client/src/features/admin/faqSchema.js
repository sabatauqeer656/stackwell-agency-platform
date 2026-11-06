import { z } from 'zod';
import { orderRule } from './schemaParts.js';

// Mirrors the server's FAQ rules (server/src/validators/faq.validator.js).
export const QUESTION_MAX = 200;
export const ANSWER_MAX = 2000;
export const CATEGORY_MAX = 50;

export const faqFormSchema = z.object({
  question: z.string().trim().min(5, 'Question must be at least 5 characters').max(QUESTION_MAX, `Question can be at most ${QUESTION_MAX} characters`),
  answer: z.string().trim().min(10, 'Answer must be at least 10 characters').max(ANSWER_MAX, `Answer can be at most ${ANSWER_MAX} characters`),
  category: z.string().trim().min(1, 'Enter a category').max(CATEGORY_MAX, `Category can be at most ${CATEGORY_MAX} characters`),
  order: orderRule,
  isPublished: z.boolean(),
});

export const emptyFaq = { question: '', answer: '', category: 'General', order: 0, isPublished: true };

export const toFormValues = (faq) => ({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order, isPublished: faq.isPublished });

// Every field is sent as it is: there are no optional fields to clear
export const toPayload = (values) => ({ ...values });

export const FAQ_FIELD_ERRORS_FROM_SERVER = ['question', 'answer', 'category', 'order'];
