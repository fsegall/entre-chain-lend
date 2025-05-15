
// Importing the Sonner toast library
import { toast as sonnerToast } from "sonner";

// Types
export type ToastProps = React.ComponentProps<typeof sonnerToast>;

// Re-export the toast function from sonner for direct usage
export const toast = sonnerToast;

// Hook for using toast
export const useToast = () => {
  return {
    toast: sonnerToast,
    // For compatibility with existing code that expects the toasts array
    toasts: [],
  };
};

// Utility function to handle API errors gracefully
export const handleApiError = (error: unknown, fallbackMessage = "An unexpected error occurred") => {
  console.error("API Error:", error);
  
  let message = fallbackMessage;
  
  if (error instanceof Error) {
    // If it's a standard error object, use its message
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  // Display error toast
  toast.error(message, {
    description: "Please try again or contact support if the problem persists."
  });
  
  return null;
};
