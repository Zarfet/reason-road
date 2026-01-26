/**
 * NEXUS - Navigation Bar Component
 * 
 * Purpose: Main navigation header shown across the application
 * 
 * Features:
 * - NEXUS logo/brand link to home
 * - Conditional rendering based on auth state:
 *   - Not logged in: Sign In / Sign Up buttons
 *   - Logged in: User menu dropdown with Profile and Logout
 * 
 * Behavior:
 * - Subscribes to auth state changes
 * - Shows loading state briefly while checking auth
 * - Dropdown menu for authenticated users
 * 
 * Dependencies: react-router-dom, shadcn/ui, useAuth hook
 */

import { Link, useNavigate } from 'react-router-dom';
import { Target, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Navbar component with auth-aware rendering
 */
export function Navbar() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been logged out successfully.',
      });
      navigate('/');
    }
  };

  return (
    <header className="nexus-container py-6">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <Target className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">NEXUS</span>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {loading ? (
            // Loading state - show placeholder
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            // Logged in: Show user menu dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 px-2 hover:text-accent-foreground"
                >
                  <Avatar className="h-8 w-8 bg-accent/10">
                    <AvatarFallback className="text-sm font-medium text-accent">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-muted-foreground group-hover:text-accent-foreground">
                    {user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  My Assessments
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Not logged in: Show auth buttons
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => navigate('/auth')}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
