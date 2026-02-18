/**
 * NEXUS - Authentication Page — Tech-Minimalist
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/assessment';

  useEffect(() => {
    if (session) {
      navigate(from, { replace: true });
    }
  }, [session, navigate, from]);

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return false;
    }
    if (!password || password.length < 6) {
      toast({ title: 'Invalid password', description: 'Password must be at least 6 characters long.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) errorMessage = 'Invalid email or password. Please try again.';
        else if (error.message.includes('User already registered')) errorMessage = 'This email is already registered. Try logging in instead.';
        else if (error.message.includes('Email not confirmed')) errorMessage = 'Please check your email to confirm your account.';
        toast({ title: isLogin ? 'Login failed' : 'Signup failed', description: errorMessage, variant: 'destructive' });
      } else {
        toast({
          title: isLogin ? 'Welcome back!' : 'Account created!',
          description: isLogin ? 'You have been logged in successfully.' : 'Your account has been created. You are now logged in.',
        });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="nexus-container py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <Target className="h-4 w-4 text-background" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">NEXUS</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="nexus-container py-16">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="nexus-card">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-medium tracking-tight">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </CardTitle>
              <CardDescription>
                {isLogin ? 'Sign in to access your assessments' : 'Sign up to save your assessment results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isSubmitting} autoComplete="email" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" disabled={isSubmitting} autoComplete={isLogin ? 'current-password' : 'new-password'} />
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-muted-foreground font-mono">Min. 6 characters</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-foreground text-background hover:bg-foreground/80"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}