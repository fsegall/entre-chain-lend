import React, { Suspense, useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { UnifiedAuthProvider } from "./contexts/UnifiedAuthProvider";
import { DarkModeProvider } from "@/hooks/useDarkMode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes";

console.log("App.tsx: Module loaded");

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading component
const LoadingFallback = () => {
  console.log("LoadingFallback: Rendering");
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blockloan-teal"></div>
    </div>
  );
};

// Error boundary for app-level errors
class AppErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    console.log("AppErrorBoundary: Error caught", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log("AppErrorBoundary: Rendering error state");
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
            <p className="text-gray-600 mb-4">Please try refreshing the page</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  console.log("App: Component rendering");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("App: useEffect running");
    // Initialize app
    const initialize = async () => {
      console.log("App: Starting initialization");
      try {
        // Add any initialization logic here
        console.log("App: Initialization complete");
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    console.log("App: Not initialized, showing loading");
    return <LoadingFallback />;
  }

  console.log("App: Initialized, rendering main app");
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DarkModeProvider>
            <Router>
              <UnifiedAuthProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <AppRoutes />
                  <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </Suspense>
              </UnifiedAuthProvider>
            </Router>
          </DarkModeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
