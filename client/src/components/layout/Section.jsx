import { cn } from '../../lib/utils.js';
import Container from './Container.jsx';

const tones = {
  white: 'bg-white',
  muted: 'bg-slate-50',
  dark: 'bg-ink text-white',
};

// A full-width band: the background runs edge to edge, the content stays in a Container.
export default function Section({ tone = 'white', containerSize = 'lg', className, children, ...props }) {
  return (
    <section className={cn('py-16 sm:py-24', tones[tone], className)} {...props}>
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}
