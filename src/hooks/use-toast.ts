import { toast, ToastOptions } from "react-toastify";

// Types
export type ToastProps = React.ComponentProps<typeof toast>;

// Re-export the toast function from react-toastify for direct usage
export const toastFunction = toast;

type ToastType = "success" | "error" | "info" | "warning";

// Hook for using toast
export const useToast = () => {
  const showToast = (type: ToastType, message: string, options?: ToastOptions) => {
    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "info":
        toast.info(message, options);
        break;
      case "warning":
        toast.warning(message, options);
        break;
      default:
        toast(message, options);
    }
  };

  return {
    toast: (message: string, options?: ToastOptions) => showToast("success", message, options),
    success: (message: string, options?: ToastOptions) => showToast("success", message, options),
    error: (message: string, options?: ToastOptions) => showToast("error", message, options),
    warning: (message: string, options?: ToastOptions) => showToast("warning", message, options),
    info: (message: string, options?: ToastOptions) => showToast("info", message, options),
    dismiss: (toastId: string | number) => toast.dismiss(toastId),
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
