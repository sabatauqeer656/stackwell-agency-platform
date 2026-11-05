import { useState } from 'react';
import { cn } from '../../lib/utils.js';

// Full class names (not built dynamically) so Tailwind can detect them.
const sizes = {
  md: 'h-12 w-12 text-base',
  lg: 'h-20 w-20 text-2xl',
};

const colors = [
  'bg-brand-100 text-brand-700',
  'bg-accent-100 text-accent-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
];

// "Amara Hughes" -> "AH", "Madonna" -> "M"
const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

// The same name always gets the same colour, so a person looks the same everywhere.
const colorFor = (name) => colors[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];

// A round picture of a person. Shows the photo when there is one and it loads;
// otherwise their initials on a coloured background.
// It is decorative: the person's name is always written next to it, so screen readers skip it.
export default function Avatar({ name, src, size = 'md', className }) {
  // Remember WHICH url failed (not just "failed"), so a new url gets a fresh chance to load
  const [failedSrc, setFailedSrc] = useState(null);
  const showPhoto = Boolean(src) && failedSrc !== src;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
        sizes[size],
        !showPhoto && colorFor(name),
        className
      )}
    >
      {showPhoto ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailedSrc(src)} className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
