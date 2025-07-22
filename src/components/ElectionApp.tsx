import { useState } from 'react';
import * as React from 'react';
import { LoginForm } from './LoginForm';
import { VotingInterface } from './VotingInterface';
import { ThankYouPage } from './ThankYouPage';
import { AdminPanel } from './AdminPanel';
import { AdminLogin } from './AdminLogin';
import { useToast } from '@/hooks/use-toast';
import { useUser, useVoteCountsRealtime, useSubmitVotes, useResetVotes, useRefreshData } from '@/hooks/useElection';

type AppState = 'login' | 'voting' | 'completed' | 'admin-login' | 'admin' | 'loading';

interface User {
  id: string;
  email: string;
  uniqueId: string;
  hasVoted: boolean;
}

export function ElectionApp() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginCredentials, setLoginCredentials] = useState<{ email: string; uniqueId: string } | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  const { toast } = useToast();
  
  // Hooks for Supabase operations
  const userQuery = useUser(
    loginCredentials?.email || '', 
    loginCredentials?.uniqueId || ''
  );
  const { data: votes = {}, isLoading: votesLoading } = useVoteCountsRealtime();
  const submitVotesMutation = useSubmitVotes();
  const resetVotesMutation = useResetVotes();
  const { refresh: refreshData, isRefreshing } = useRefreshData();

  const handleLogin = async (email: string, uniqueId: string) => {
    // Set loading state and credentials to trigger user query
    setAppState('loading');
    setLoginCredentials({ email, uniqueId });
  };

  // Handle user query result
  React.useEffect(() => {
    if (loginCredentials && userQuery.data) {
      const userData = userQuery.data;
      
      if (userData.has_voted) {
        toast({
          title: "Already voted",
          description: "You have already submitted your votes for this election.",
          variant: "destructive"
        });
        setAppState('login');
        setLoginCredentials(null);
        return;
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        uniqueId: userData.unique_id,
        hasVoted: userData.has_voted
      };
      
      setCurrentUser(user);
      setAppState('voting');
    }

    if (loginCredentials && userQuery.error) {
      toast({
        title: "Login failed",
        description: "Could not verify your credentials. Please try again.",
        variant: "destructive"
      });
      setAppState('login');
      setLoginCredentials(null);
    }
  }, [userQuery.data, userQuery.error, loginCredentials, toast]);

  const handleSubmitVotes = async (userVotes: Record<string, string>) => {
    if (!currentUser) return;

    try {
      await submitVotesMutation.mutateAsync({
        userId: currentUser.id,
        votes: userVotes
      });
      
      // Update user state
      setCurrentUser(prev => prev ? { ...prev, hasVoted: true } : null);
      setAppState('completed');
    } catch (error) {
      console.error('Error submitting votes:', error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginCredentials(null);
    setIsAdminAuthenticated(false);
    setAppState('login');
  };

  const handleViewResults = () => {
    // Remove public access to admin panel
    // Admin access should be through proper authentication only
    toast({
      title: "Results not available",
      description: "Election results will be published after the voting period ends.",
    });
  };

  const handleAdminAccess = () => {
    setAppState('admin-login');
  };

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdminAuthenticated(true);
      setAppState('admin');
    } else {
      setIsAdminAuthenticated(false);
      setAppState('admin-login');
    }
  };

  const handleBackToLogin = () => {
    setIsAdminAuthenticated(false);
    setAppState('login');
  };

  const handleResetVotes = async () => {
    try {
      await resetVotesMutation.mutateAsync();
    } catch (error) {
      console.error('Error resetting votes:', error);
    }
  };

  const handleRefreshData = () => {
    refreshData();
  };

  switch (appState) {
    case 'login':
      return <LoginForm onLogin={handleLogin} onAdminAccess={handleAdminAccess} />;
    
    case 'loading':
      return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Verifying credentials...</p>
          </div>
        </div>
      );
    
    case 'voting':
      return currentUser ? (
        <VotingInterface
          userEmail={currentUser.email}
          onLogout={handleLogout}
          onSubmitVotes={handleSubmitVotes}
          isSubmitting={submitVotesMutation.isPending}
        />
      ) : null;
    
    case 'completed':
      return currentUser ? (
        <ThankYouPage
          userEmail={currentUser.email}
          onViewResults={handleViewResults}
          onLogout={handleLogout}
        />
      ) : null;
    
    case 'admin-login':
      return (
        <AdminLogin
          onAdminLogin={handleAdminLogin}
          onBackToLogin={handleBackToLogin}
        />
      );
    
    case 'admin':
      // Require admin authentication to access admin panel
      return isAdminAuthenticated ? (
        <AdminPanel
          votes={votes}
          onLogout={handleLogout}
          onResetVotes={handleResetVotes}
          onRefreshData={handleRefreshData}
          isLoading={votesLoading}
          isResetting={resetVotesMutation.isPending}
          isRefreshing={isRefreshing}
        />
      ) : (
        <AdminLogin
          onAdminLogin={handleAdminLogin}
          onBackToLogin={handleBackToLogin}
        />
      );
    
    default:
      return <LoginForm onLogin={handleLogin} onAdminAccess={handleAdminAccess} />;
  }
}