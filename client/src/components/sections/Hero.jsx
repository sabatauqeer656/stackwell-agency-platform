import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CircleCheck } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Container from '../layout/Container.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

const trustPoints = ['Fixed-price quotes', 'Demos every two weeks', 'You own the code'];

// Each piece fades up a little after the previous one. MotionConfig (in providers.jsx) switches
// the movement off for visitors who asked their system for reduced motion.
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

export default function Hero() {
  const { companyName } = useSettings();

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-brand-900 via-brand-800 to-accent-800 text-white">
      {/* Decorative glows: hidden from screen readers, pure decoration */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-500/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

      <Container className="relative py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          <motion.p {...fadeUp(0)} className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-200">
            {companyName} &middot; Custom software agency
          </motion.p>

          <motion.h1 {...fadeUp(0.1)} className="text-4xl font-extrabold tracking-tight text-white sm:text-display">
            We design and build software your customers will love
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="mt-6 max-w-2xl text-lg text-brand-100 sm:text-xl">
            Web apps, mobile apps and online stores, delivered in short iterations so you see real progress every two
            weeks, not just a plan.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/quote" size="lg" variant="light">
              Get a Quote
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button as={Link} to="/projects" size="lg" variant="outline-light">
              See our work
            </Button>
          </motion.div>

          <motion.ul {...fadeUp(0.4)} className="mt-10 flex flex-col gap-3 text-brand-100 sm:flex-row sm:gap-8">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm font-medium">
                <CircleCheck className="h-5 w-5 text-accent-300" aria-hidden="true" />
                {point}
              </li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}
