import { createContext } from 'react';

// Holds the { success, error, info, dismiss } API. Provided by ToastProvider, read by useToast.
export const ToastContext = createContext(null);
