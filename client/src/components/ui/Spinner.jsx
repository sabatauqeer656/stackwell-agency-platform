import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

// role="status" + sr-only text: screen readers announce "Loading" (the icon alone says nothing).
export default function Spinner({ size = 'md', label = 'Loading', className }) {
  return (
    <span role="status" className={cn('inline-flex text-brand-600', className)}>
      <Loader2 className={cn('animate-spin', sizes[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
