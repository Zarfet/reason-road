/**
 * Profile Page — Tech-Minimalist
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, LogOut, FileText, Loader2, Trash2 } from 'lucide-react';
import { NexusLogo } from '@/components/layout/NexusLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          toast({ title: 'Error loading assessments', description: 'Could not load your assessment history.', variant: 'destructive' });
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

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: 'Error signing out', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Signed out', description: 'You have been logged out successfully.' });
      navigate('/');
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    setDeletingId(assessmentId);
    try {
      const { error } = await supabase.from('assessments').delete().eq('id', assessmentId);
      if (error) {
        console.error('Error deleting assessment:', error);
        toast({ title: 'Error', description: 'Could not delete the assessment.', variant: 'destructive' });
      } else {
        setAssessments(prev => prev.filter(a => a.id !== assessmentId));
        toast({ title: 'Deleted', description: 'Assessment deleted successfully.' });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getPrimaryParadigm = (results: unknown): string => {
    if (!results || typeof results !== 'object') return 'Not completed';
    const resultsObj = results as Record<string, unknown>;
    const allScores = resultsObj.allScores as Record<keyof ParadigmScores, number> | undefined;
    if (allScores) {
      const sorted = Object.entries(allScores).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) return PARADIGM_LABELS[sorted[0][0] as keyof ParadigmScores] || sorted[0][0];
    }
    return 'Completed';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="nexus-container py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="hover:opacity-70 transition-opacity">
            <NexusLogo />
          </Link>
          <Link to="/assessment">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </header>

      <main className="nexus-container py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* User Info */}
          <Card className="nexus-card mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-border">
                    <AvatarFallback className="text-xl font-mono font-semibold text-foreground bg-secondary">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl font-medium text-foreground tracking-tight">{user?.email}</h1>
                    <p className="text-muted-foreground font-mono text-sm">
                      {assessments.filter(a => a.is_completed).length} assessments completed
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout} className="gap-2 border-border hover:bg-secondary">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assessments List */}
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4 tracking-tight">Assessment History</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : assessments.length === 0 ? (
              <Card className="nexus-card">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-foreground mb-2">No assessments yet</h3>
                  <p className="text-muted-foreground mb-4">Start your first assessment to get interface recommendations</p>
                  <Button onClick={() => navigate('/assessment')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {assessments.map((assessment, index) => (
                  <motion.div key={assessment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card 
                      className="nexus-card hover:border-foreground/20 transition-colors cursor-pointer"
                      onClick={() => assessment.is_completed && navigate(`/results/${assessment.id}`)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg border border-border flex items-center justify-center">
                              <FileText className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">
                                {(assessment.responses as Record<string, unknown>)?.projectName as string || 'Assessment'}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(assessment.created_at)}
                                </span>
                                <span>·</span>
                                <span>
                                  {assessment.is_completed ? getPrimaryParadigm(assessment.paradigm_results) : 'In progress'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" size="sm"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingId === assessment.id}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {deletingId === assessment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAssessment(assessment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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