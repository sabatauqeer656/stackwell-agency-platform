import { quoteDefaults } from './quoteSchema.js';

// A visitor who refreshes the page by accident should not lose four steps of typing.
// The draft lives in sessionStorage: it is private to this browser tab, vanishes when the tab
// closes, and is deleted after a successful send. It only holds what the visitor typed.
const KEY = 'stackwell:quote-draft';

// Which keys we accept back from storage. Anything else is ignored, so stale or tampered
// data can never put unexpected fields into the form.
const textKeys = Object.keys(quoteDefaults).filter((key) => key !== 'services' && key !== 'website');

export function loadDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return null;

    const values = { ...quoteDefaults };
    for (const key of textKeys) if (typeof saved.values?.[key] === 'string') values[key] = saved.values[key];
    if (Array.isArray(saved.values?.services)) values.services = saved.values.services.filter((s) => typeof s === 'string').slice(0, 6);
    const step = Number.isInteger(saved.step) && saved.step >= 0 && saved.step <= 3 ? saved.step : 0;
    // Files cannot be stored (a File is not text), so only HOW MANY there were is kept.
    // That lets the wizard tell the visitor "please attach your files again" after a refresh.
    const fileCount = Number.isInteger(saved.fileCount) && saved.fileCount > 0 ? Math.min(saved.fileCount, 3) : 0;
    return { values, step, fileCount };
  } catch {
    return null; // storage unavailable (private window) or corrupted: just start fresh
  }
}

export function saveDraft(values, step, fileCount = 0) {
  try {
    const safe = { ...values };
    delete safe.website; // never store the honeypot
    sessionStorage.setItem(KEY, JSON.stringify({ values: safe, step, fileCount }));
  } catch {
    /* storage full or blocked: the wizard still works, it just cannot remember */
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
