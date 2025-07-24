import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ElectionService } from '@/integrations/supabase/service';
import { useToast } from '@/hooks/use-toast';

// Query Keys
export const ELECTION_QUERY_KEYS = {
  voteCounts: ['vote-counts'],
  user: (email: string, uniqueId: string) => ['user', email, uniqueId],
} as const;

// User Management Hooks
export function useUser(email: string, uniqueId: string) {
  return useQuery({
    queryKey: ELECTION_QUERY_KEYS.user(email, uniqueId),
    queryFn: () => ElectionService.findOrCreateUser(email, uniqueId),
    enabled: !!email && !!uniqueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubmitVotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, votes }: { userId: string; votes: Record<string, string> }) => {
      const success = await ElectionService.submitVotes(userId, votes);
      if (!success) {
        throw new Error('Failed to submit votes');
      }
      return success;
    },
    onSuccess: () => {
      // Invalidate vote counts to trigger refresh
      queryClient.invalidateQueries({ queryKey: ELECTION_QUERY_KEYS.voteCounts });
      toast({
        title: "Votes submitted successfully",
        description: "Thank you for participating in the election!",
      });
    },
    onError: (error) => {
      console.error('Error submitting votes:', error);
      toast({
        title: "Error submitting votes",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive"
      });
    },
  });
}

// Vote Count Management Hooks
export function useVoteCounts() {
  return useQuery({
    queryKey: ELECTION_QUERY_KEYS.voteCounts,
    queryFn: ElectionService.getVoteCounts,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

export function useVoteCountsRealtime() {
  const queryClient = useQueryClient();
  const { data: voteCounts, ...queryResult } = useVoteCounts();

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = ElectionService.subscribeToVoteUpdates((updatedVotes) => {
      queryClient.setQueryData(ELECTION_QUERY_KEYS.voteCounts, updatedVotes);
    });

    return unsubscribe;
  }, [queryClient]);

  return { data: voteCounts, ...queryResult };
}

// Admin Hooks
export function useResetVotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ElectionService.resetAllVotes,
    onSuccess: (success) => {
      if (success) {
        // Clear all cached data
        queryClient.invalidateQueries({ queryKey: ELECTION_QUERY_KEYS.voteCounts });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        toast({
          title: "Votes reset successfully",
          description: "All votes and voting records have been cleared.",
        });
      } else {
        throw new Error('Failed to reset votes');
      }
    },
    onError: (error) => {
      console.error('Error resetting votes:', error);
      toast({
        title: "Error resetting votes",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive"
      });
    },
  });
}

export function useDeleteUserVotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ElectionService.deleteUserVotes,
    onSuccess: (success) => {
      if (success) {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ELECTION_QUERY_KEYS.voteCounts });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['voter-status'] });
        
        toast({
          title: "User votes deleted successfully",
          description: "The user's votes have been removed and they can vote again.",
        });
      } else {
        throw new Error('Failed to delete user votes');
      }
    },
    onError: (error) => {
      console.error('Error deleting user votes:', error);
      toast({
        title: "Error deleting votes",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive"
      });
    },
  });
}

export function useDeleteUserAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ElectionService.deleteUserAccount,
    onSuccess: (success) => {
      if (success) {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ELECTION_QUERY_KEYS.voteCounts });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['voter-status'] });
        
        toast({
          title: "User account deleted successfully",
          description: "The user account has been completely removed and the ID is available again.",
        });
      } else {
        throw new Error('Failed to delete user account');
      }
    },
    onError: (error) => {
      console.error('Error deleting user account:', error);
      toast({
        title: "Error deleting account",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive"
      });
    },
  });
}

export function useRefreshData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refreshMutation = useMutation({
    mutationFn: async () => {
      // Invalidate all queries to force refresh
      await queryClient.invalidateQueries();
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Data refreshed",
        description: "Latest voting data has been loaded.",
      });
    },
    onError: (error) => {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error refreshing data",
        description: "Could not load voting data.",
        variant: "destructive"
      });
    },
  });

  return {
    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
  };
}

// Validation Hooks
export function useCheckUniqueId(uniqueId: string, currentEmail?: string) {
  return useQuery({
    queryKey: ['unique-id-check', uniqueId, currentEmail],
    queryFn: () => ElectionService.checkUniqueIdUsage(uniqueId, currentEmail),
    enabled: !!uniqueId && uniqueId.length > 0,
    staleTime: 0, // Always fresh for validation
  });
}
