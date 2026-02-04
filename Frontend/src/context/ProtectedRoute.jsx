import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protected Route Component for Role-Based Access Control
 * @param {object} element - The component to render
 * @param {boolean} isPublic - If true, no authentication required
 * @param {string|string[]} requiredRoles - Role(s) required to access (e.g., "student", "administrator")
 * @param {JSX.Element} fallback - Component to show while loading (default: Loading...)
 */
export const ProtectedRoute = ({
  element,
  isPublic = false,
  requiredRoles = null,
  fallback = <div>Loading...</div>,
}) => {
  const { isAuthenticated, loading, hasAnyRole } = useAuth();

  // If still loading auth state, show fallback
  if (loading) {
    return fallback;
  }

  // Public routes - no auth needed
  if (isPublic) {
    return element;
  }

  // User not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRoles) {
    const rolesArray = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];

    if (!hasAnyRole(rolesArray)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
