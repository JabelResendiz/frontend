import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/context/AuthContext";
import { isAuditMode } from "@/app/config/audit";

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // If audit mode is enabled, bypass route protection entirely.
  if (isAuditMode()) return children;

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0) {
    if (!user || !roles.includes(user.role)) {
      // user is authenticated but not authorized for this route
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
