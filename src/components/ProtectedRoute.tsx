import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-uno-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-uno-red"></div>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
