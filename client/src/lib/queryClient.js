import { QueryClient } from '@tanstack/react-query';

// Default behaviour for every query in the app.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // data counts as fresh for 1 minute (no refetch)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
