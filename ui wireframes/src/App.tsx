import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import RoleSelection from './pages/onboarding/RoleSelection';
import CreatorDashboard from './pages/dashboard/CreatorDashboard';
import CompleterDashboard from './pages/dashboard/CompleterDashboard';
import TimeLinePage from './pages/timeline/TimeLine';
import ProjectsPage from './pages/projects/ProjectsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
const App: React.FC = () => {
  useEffect(() => {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Mock authentication state - replace with your auth logic
  const isAuthenticated = true;
  const hasSelectedRole = true;
  const userRole = 'creator'; // or 'completer', depending on the user's role

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              hasSelectedRole ? (
                <Navigate
                  to={userRole === 'creator' ? '/dashboard' : '/tasks'}
                  replace
                />
              ) : (
                <Navigate to="/role-selection" replace />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes */}
        <Route
          path="/role-selection"
          element={
            isAuthenticated ? (
              <RoleSelection />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated && hasSelectedRole && userRole === 'creator' ? (
              <CreatorDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/tasks"
          element={
            isAuthenticated && hasSelectedRole && userRole === 'completer' ? (
              <CompleterDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
         <Route
          path="/timeline"
          element={
            <TimeLinePage/>
          }
        />

        <Route
          path="/projects"
          element={
            <ProjectsPage/>
          }
        />

        <Route
          path="/notifications"
          element={
            <NotificationsPage/>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App; 