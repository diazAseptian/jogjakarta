import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  role?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Redirect admin ke /admin kalau akses /dashboard
  if (!role && profile?.role === 'admin') return <Navigate to="/admin" replace />;

  // Redirect non-admin kalau akses /admin
  if (role === 'admin' && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
