/**
 * NEXUS - Authentication Hook
 * 
 * Purpose: Manages user authentication state throughout the application
 * 
 * Features:
 * - Tracks current user and session
 * - Provides login, signup, and logout functions
 * - Listens to auth state changes
 * - Auto-refreshes tokens via Supabase
 * 
 * Usage:
 *   const { user, session, signIn, signUp, signOut, loading } = useAuth()
 * 
 * Security:
 * - Session stored in localStorage (handled by Supabase)
 * - Tokens refreshed automatically
 * - Session cleared on signOut
 * 
 * Dependencies: @supabase/supabase-js, supabase client
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthResult {
  error: AuthError | null;
}

/**
 * Custom hook for managing authentication state
 * 
 * @returns Object containing user, session, loading state, and auth methods
 * 
 * Process:
 * 1. On mount, sets up auth state listener
 * 2. Fetches existing session
 * 3. Updates state on any auth changes (login, logout, token refresh)
 * 
 * Error handling: Errors returned from auth methods, not thrown
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // IMPORTANT: Set up auth state listener FIRST
    // This ensures we catch any auth events during initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous state updates here - no async Supabase calls
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
        
        // Debug logging for development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✓ Auth state changed: ${event}`, session?.user?.email);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Object with error (null on success)
   */
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && process.env.NODE_ENV === 'development') {
      console.log('✓ User logged in:', email);
    }
    
    return { error };
  }, []);

  /**
   * Sign up with email and password
   * 
   * CRITICAL: emailRedirectTo must be set for email confirmation flow
   * Using window.location.origin ensures it works in all environments
   * 
   * @param email - User's email address
   * @param password - User's password (min 6 chars)
   * @returns Object with error (null on success)
   */
  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    
    if (!error && process.env.NODE_ENV === 'development') {
      console.log('✓ User signed up:', email);
    }
    
    return { error };
  }, []);

  /**
   * Sign out the current user
   * 
   * @returns Object with error (null on success)
   */
  const signOut = useCallback(async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut();
    
    if (!error && process.env.NODE_ENV === 'development') {
      console.log('✓ User logged out');
    }
    
    return { error };
  }, []);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    signIn,
    signUp,
    signOut,
  };
}
