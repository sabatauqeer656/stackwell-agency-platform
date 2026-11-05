// "Custom Web Apps & Portals!" -> "custom-web-apps-portals"
export const slugify = (text) =>
  text
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // anything that is not a letter/number becomes a dash
    .replace(/^-+|-+$/g, '') // no dashes at the start or end
    .slice(0, 100);

// Returns `base`, or base-2, base-3 ... until no other document of this Model uses it.
// excludeId lets a document keep its own slug when it is updated.
export async function uniqueSlug(Model, base, excludeId) {
  const root = base || 'item';
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug: candidate, ...(excludeId && { _id: { $ne: excludeId } }) })) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}
