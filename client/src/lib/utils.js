// Joins class names, skipping falsy values: cn('a', false && 'b', 'c') -> 'a c'
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// "Getting started" -> "getting-started". Used to turn a category name into a clean URL value.
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
