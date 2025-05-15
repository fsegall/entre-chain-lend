
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { Web3AuthProvider } from "@/hooks/useWeb3Auth";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// Configure the query client with simple configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000
    }
  },
});

const App = () => {
  const [appError, setAppError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Add a global error handler for unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      
      // ALWAYS allow app to continue loading regardless of error type
      // We'll handle specific errors in the Web3Auth provider
      console.log("Error detected, but allowing app to continue loading:", event.error?.message);
      
      // Don't set app error for Web3Auth-related errors
      if (event.error?.message?.includes("could not validate redirect") || 
          event.error?.message?.includes("whitelist your domain")) {
        console.log("Web3Auth domain error detected, app will continue loading");
      } else if (event.error?.message?.includes("Web3Auth")) {
        console.log("Other Web3Auth error detected, app will continue loading");
      } else {
        // Only set app error for non-Web3Auth errors
        setAppError("An unexpected error occurred. Please check the console for details.");
      }
      
      // Prevent the error from crashing the app
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    
    // Simple initialization check
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // Handle unhandled promise rejections (which might not trigger the 'error' event)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      
      // ALWAYS allow app to continue loading regardless of error type
      console.log("Promise rejection detected, but allowing app to continue loading:", 
                 event.reason?.message || "Unknown promise rejection");
      
      // Don't set app error for Web3Auth-related errors
      if (event.reason?.message?.includes("could not validate redirect") || 
          event.reason?.message?.includes("whitelist your domain")) {
        console.log("Web3Auth domain error in promise, app will continue loading");
      } else if (event.reason?.message?.includes("Web3Auth")) {
        console.log("Other Web3Auth error in promise, app will continue loading");
      } else {
        // Only set app error for non-Web3Auth errors
        setAppError("An unexpected error occurred. Please check the console for details.");
      }
      
      // Prevent the promise rejection from crashing the app
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);
  
  // If there's a critical error, show a minimal error UI
  if (appError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
        <p className="mb-4">{appError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Application
        </button>
      </div>
    );
  }
  
  // Show a loading state during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner position="top-center" />
        <BrowserRouter>
          <AuthProvider>
            <Web3AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Web3AuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
