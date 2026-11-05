import { cn } from '../../lib/utils.js';

// A white rounded surface. Use hover for clickable cards; as={Link} makes the whole card a link.
export default function Card({
  as: Component = 'div',
  hover = false,
  padded = true,
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        'rounded-card border border-slate-200 bg-white shadow-card',
        padded && 'p-6',
        hover &&
          'block transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
