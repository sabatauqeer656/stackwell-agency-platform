import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from '../lib/queryClient.js';
import ToastProvider from '../components/ui/ToastProvider.jsx';

// Wraps the app with everything that must be available on every page.
export default function Providers({ children }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
