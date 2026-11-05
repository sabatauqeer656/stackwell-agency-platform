import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { queryClient } from '../lib/queryClient.js';
import ToastProvider from '../components/ui/ToastProvider.jsx';

// Downloads Framer Motion's animation engine after the page is already showing.
// Components use the light `m` element instead of `motion`, so the engine is not in the first file.
const loadMotionFeatures = () => import('../lib/motionFeatures.js').then((module) => module.default);

// Wraps the app with everything that must be available on every page.
export default function Providers({ children }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        {/* reducedMotion="user": every animation respects the visitor's OS setting */}
        <MotionConfig reducedMotion="user">
          <LazyMotion features={loadMotionFeatures} strict>
            <ToastProvider>{children}</ToastProvider>
          </LazyMotion>
        </MotionConfig>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
