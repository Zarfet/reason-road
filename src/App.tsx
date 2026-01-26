/**
 * NEXUS - Main Application Router
 * 
 * Purpose: Root component that sets up routing, providers, and global state
 * 
 * Route Structure:
 * - Public: /, /auth (Landing, Authentication)
 * - Protected: /assessment, /results, /profile (require authentication)
 * 
 * Providers:
 * - QueryClientProvider: React Query for data fetching
 * - TooltipProvider: shadcn/ui tooltips
 * - AssessmentProvider: Assessment wizard state management
 * 
 * Auth Flow:
 * 1. User visits protected route (e.g., /assessment)
 * 2. ProtectedRoute checks session via useAuth hook
 * 3. No session → redirect to /auth
 * 4. User logs in → redirect back to intended page
 * 
 * Lazy Loading:
 * - All route components are lazy-loaded to reduce initial bundle size
 * - PageLoader shown during component loading
 * 
 * Dependencies: react-router-dom, @tanstack/react-query, AssessmentContext
 */

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssessmentProvider } from "@/context/AssessmentContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load route components to reduce initial bundle size
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Results = lazy(() => import("./pages/Results"));
const SavedResults = lazy(() => import("./pages/SavedResults"));
const SharedResults = lazy(() => import("./pages/SharedResults"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

/**
 * Minimal loading fallback to prevent layout shift
 * Shows spinner centered on screen while route components load
 */
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
  </div>
);

/**
 * Main App component
 * Sets up all providers and routes
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AssessmentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes - require authentication */}
              <Route 
                path="/assessment" 
                element={
                  <ProtectedRoute>
                    <Assessment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/results" 
                element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/results/:id" 
                element={
                  <ProtectedRoute>
                    <SavedResults />
                  </ProtectedRoute>
                } 
              />
              
              {/* Public shared results route */}
              <Route path="/shared/:token" element={<SharedResults />} />
              
              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AssessmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
