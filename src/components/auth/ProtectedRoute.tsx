/**
 * NEXUS - Protected Route Wrapper
 * 
 * Purpose: Ensures user is authenticated before accessing protected routes
 * 
 * Usage:
 *   <Route 
 *     path="/assessment" 
 *     element={
 *       <ProtectedRoute>
 *         <Assessment />
 *       </ProtectedRoute>
 *     } 
 *   />
 * 
 * Behavior:
 * - Shows loading spinner while checking session
 * - Redirects to /auth if not authenticated
 * - Renders children if authenticated
 * 
 * Security:
 * - Checks Supabase session (not just localStorage)
 * - Subscribes to auth state changes for real-time updates
 * - Prevents access to protected content until verified
 * 
 * Dependencies: react-router-dom, useAuth hook
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected route component that guards against unauthenticated access
 * 
 * @param children - The protected content to render when authenticated
 * @returns Loading spinner, redirect, or children based on auth state
 * 
 * Process:
 * 1. Check loading state - show spinner if still checking
 * 2. Check session - redirect to /auth if no session
 * 3. Render children if session exists
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-muted-foreground text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  // Preserve the attempted URL for post-login redirect
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
