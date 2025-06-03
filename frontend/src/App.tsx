import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginSignupForm from './components/ui/LoginSignupForm';
import Dashboard from './components/ui/Dashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginSignupForm />;
  }

  return <>{children}</>;
};

// Main App Content
const AppContent: React.FC = () => {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
};

export default App;