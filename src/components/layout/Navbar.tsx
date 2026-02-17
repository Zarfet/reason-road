/**
 * NEXUS - Navigation Bar — Swiss Style / Clean SaaS
 * White/transparent header, slate-900 logo, emerald icon, subtle nav links
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

export function Navbar() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

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
        {/* Logo — dark grey text, emerald icon */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center">
            <Target className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">NEXUS</span>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="group flex items-center gap-2 px-2 hover:bg-secondary"
                >
                  <Avatar className="h-8 w-8 bg-accent/10">
                    <AvatarFallback className="text-sm font-medium text-accent">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-muted-foreground group-hover:text-foreground transition-colors">
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
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl"
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
