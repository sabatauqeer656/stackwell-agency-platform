// Joins class names, skipping falsy values: cn('a', false && 'b', 'c') -> 'a c'
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
