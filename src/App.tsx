
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useState } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import { toast } from "@/hooks/use-toast";

// Configure the query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      meta: {
        // Use meta for configuration that can be accessed in onError
        errorHandler: (error) => {
          console.error("Query error:", error);
          toast.error("Network error", { 
            description: "There was a problem connecting to the server" 
          });
        }
      }
    },
    mutations: {
      meta: {
        errorHandler: (error) => {
          console.error("Mutation error:", error);
          toast.error("Operation failed", { 
            description: "There was a problem processing your request" 
          });
        }
      }
    },
  },
});

// Add global error handler for queries
queryClient.setDefaultOptions({
  queries: {
    onError: (error) => {
      const handler = queryClient.getDefaultOptions()?.queries?.meta?.errorHandler;
      if (handler && typeof handler === 'function') {
        handler(error);
      }
    }
  },
  mutations: {
    onError: (error) => {
      const handler = queryClient.getDefaultOptions()?.mutations?.meta?.errorHandler;
      if (handler && typeof handler === 'function') {
        handler(error);
      }
    }
  }
});

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner position="top-center" />
        <BrowserRouter>
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
