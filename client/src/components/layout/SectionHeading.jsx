import { cn } from '../../lib/utils.js';

// Opens a section: small label (eyebrow), big title, optional description.
// Set onDark when the heading sits on a dark Section so the text stays readable.
export default function SectionHeading({
  as: Heading = 'h2',
  eyebrow,
  title,
  description,
  align = 'center',
  onDark = false,
  id, // lets a parent <section aria-labelledby="..."> point at this heading
  className,
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 text-sm font-semibold uppercase tracking-wider',
            onDark ? 'text-brand-300' : 'text-brand-600'
          )}
        >
          {eyebrow}
        </p>
      )}
      <Heading id={id} className={cn('text-3xl sm:text-h2', onDark && 'text-white')}>{title}</Heading>
      {description && (
        <p className={cn('mt-4 text-lg', onDark ? 'text-slate-300' : 'text-slate-600')}>{description}</p>
      )}
    </div>
  );
}
