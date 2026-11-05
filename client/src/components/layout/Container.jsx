import { cn } from '../../lib/utils.js';

// Full class names (not built dynamically) so Tailwind can detect them.
const sizes = {
  md: 'max-w-4xl', // reading width: articles, forms, legal pages
  lg: 'max-w-7xl', // default page width
};

// Centers content, caps its width and adds side gutters (16px mobile, 24px tablet, 32px desktop).
export default function Container({ as: Component = 'div', size = 'lg', className, children, ...props }) {
  return (
    <Component className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)} {...props}>
      {children}
    </Component>
  );
}
