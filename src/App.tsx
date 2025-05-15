
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
      setAppError("An unexpected error occurred. Please check the console for details.");
    };
    
    window.addEventListener('error', handleError);
    
    // Simple initialization check
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => window.removeEventListener('error', handleError);
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
