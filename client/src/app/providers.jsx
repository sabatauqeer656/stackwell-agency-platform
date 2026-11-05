import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import { queryClient } from '../lib/queryClient.js';
import ToastProvider from '../components/ui/ToastProvider.jsx';

// Wraps the app with everything that must be available on every page.
export default function Providers({ children }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        {/* reducedMotion="user": every Framer Motion animation respects the visitor's OS setting */}
        <MotionConfig reducedMotion="user">
          <ToastProvider>{children}</ToastProvider>
        </MotionConfig>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
