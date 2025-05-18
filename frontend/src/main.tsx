// Import Buffer polyfill first - must be before any other imports
import './utils/bufferPolyfill';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Error boundary for initialization
class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Initialization error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
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

// Verify Buffer is available with all needed methods
console.log("Buffer check in main.tsx:", typeof window.Buffer !== 'undefined' ? "Buffer is available" : "Buffer is NOT available");
console.log("Buffer.from check:", typeof window.Buffer?.from === 'function' ? "Buffer.from is available" : "Buffer.from is NOT available");
console.log("Buffer instanceof check:", window.Buffer ? "Buffer constructor exists" : "Buffer constructor missing");

// Initialize React root only once
let root: ReactDOM.Root | null = null;

const initializeApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  if (!root) {
    root = ReactDOM.createRoot(rootElement);
  }

  try {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    root.render(
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Failed to initialize application</h1>
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
};

// Initialize app
initializeApp();
