/**
 * NEXUS - User Profile Page
 * 
 * Purpose: Display user information and past assessments
 * 
 * Features:
 * - Display user email and account info
 * - List all user's completed assessments
 * - Navigate to view past results
 * - Logout functionality
 * 
 * Security:
 * - Protected route (requires authentication)
 * - RLS ensures only user's own assessments are fetched
 * 
 * Data Flow:
 * 1. Get current user from auth session
 * 2. Query assessments table filtered by user_id
 * 3. RLS policy enforces auth.uid() = user_id
 * 4. Display results sorted by date
 * 
 * Dependencies: react-router-dom, supabase client, shadcn/ui
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowLeft, User, Calendar, LogOut, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PARADIGM_LABELS, type ParadigmScores } from '@/types/assessment';

interface AssessmentRecord {
  id: string;
  responses: unknown;
  paradigm_results: unknown;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Profile page component showing user info and assessment history
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user's assessments from database
   * RLS ensures only the user's own assessments are returned
   */
  useEffect(() => {
    async function loadAssessments() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching assessments:', error);
          toast({
            title: 'Error loading assessments',
            description: 'Could not load your assessment history.',
            variant: 'destructive',
          });
        } else {
          setAssessments(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAssessments();
  }, [user, toast]);

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

  /**
   * Get the primary paradigm from results
   */
  const getPrimaryParadigm = (results: unknown): string => {
    if (!results || typeof results !== 'object') return 'Not completed';
    
    // Handle different result structures - cast to access properties safely
    const resultsObj = results as Record<string, unknown>;
    const allScores = resultsObj.allScores as Record<keyof ParadigmScores, number> | undefined;
    if (allScores) {
      const sorted = Object.entries(allScores).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        return PARADIGM_LABELS[sorted[0][0] as keyof ParadigmScores] || sorted[0][0];
      }
    }
    
    return 'Completed';
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="nexus-container py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Target className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">NEXUS</span>
          </Link>
          <Link to="/assessment">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </header>

      {/* Profile Content */}
      <main className="nexus-container py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* User Info Card */}
          <Card className="nexus-card mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 bg-accent/10">
                    <AvatarFallback className="text-xl font-semibold text-accent">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">{user?.email}</h1>
                    <p className="text-muted-foreground">
                      {assessments.filter(a => a.is_completed).length} assessments completed
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assessments List */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Assessment History
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : assessments.length === 0 ? (
              <Card className="nexus-card">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-2">No assessments yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first assessment to get paradigm recommendations
                  </p>
                  <Button 
                    onClick={() => navigate('/assessment')}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {assessments.map((assessment, index) => (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="nexus-card hover:border-accent/30 transition-colors cursor-pointer">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">
                                {(assessment.responses as Record<string, unknown>)?.projectName as string || 'Assessment'}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(assessment.created_at)}
                                </span>
                                <span>•</span>
                                <span>
                                  {assessment.is_completed 
                                    ? getPrimaryParadigm(assessment.paradigm_results)
                                    : 'In progress'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {assessment.is_completed && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/results/${assessment.id}`)}
                            >
                              View Results
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
