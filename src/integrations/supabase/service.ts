import { supabase } from './client';
import type { Database } from './types';
import EmailService from '@/lib/emailService';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Vote = Tables['votes']['Row'];
type VoteCount = Database['public']['Views']['vote_counts']['Row'];

export class ElectionService {
  // Validation helpers
  static async validateUniqueId(uniqueId: string): Promise<{ isValid: boolean; isAvailable: boolean; message?: string }> {
    try {
      // Check if the ID exists in valid_voter_ids and is active
      const { data: validId, error: validError } = await supabase
        .from('valid_voter_ids')
        .select('unique_id, is_active')
        .eq('unique_id', uniqueId)
        .eq('is_active', true)
        .single();

      if (validError && validError.code !== 'PGRST116') {
        console.error('Error validating unique ID:', validError);
        return { isValid: false, isAvailable: false, message: 'Error validating ID' };
      }

      if (!validId) {
        return { isValid: false, isAvailable: false, message: 'Invalid ID - not found in voter registry' };
      }

      // Check if ID has already been used
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('unique_id')
        .eq('unique_id', uniqueId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking ID usage:', userError);
        return { isValid: false, isAvailable: false, message: 'Error checking ID usage' };
      }

      if (existingUser) {
        return { isValid: true, isAvailable: false, message: 'This ID has already been used' };
      }

      return { isValid: true, isAvailable: true };
    } catch (error) {
      console.error('Error in validateUniqueId:', error);
      return { isValid: false, isAvailable: false, message: 'Validation error' };
    }
  }

  // User Management
  static async findOrCreateUser(email: string, uniqueId: string): Promise<User | null> {
    try {
      // Validate the unique ID first
      const validation = await this.validateUniqueId(uniqueId);
      if (!validation.isValid || !validation.isAvailable) {
        throw new Error(validation.message || 'Invalid or unavailable ID');
      }

      // First, try to find existing user
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('unique_id', uniqueId)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding user:', findError);
        throw findError;
      }

      if (existingUser) {
        return existingUser;
      }

      // Create new user if not found
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          unique_id: uniqueId,
          has_voted: false
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      return newUser;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      return null;
    }
  }

  static async markUserAsVoted(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ has_voted: true })
        .eq('id', userId);

      if (error) {
        console.error('Error marking user as voted:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markUserAsVoted:', error);
      return false;
    }
  }

  // Vote Management
  static async submitVotes(userId: string, userVotes: Record<string, string>): Promise<boolean> {
    try {
      // Get user information for email notifications
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, unique_id')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return false;
      }

      // Convert votes to array format for database insertion
      const votesToInsert = Object.entries(userVotes).map(([positionId, candidateId]) => ({
        user_id: userId,
        position_id: positionId,
        candidate_id: candidateId
      }));

      const { error } = await supabase
        .from('votes')
        .insert(votesToInsert);

      if (error) {
        console.error('Error submitting votes:', error);
        return false;
      }

      // Mark user as voted
      const markVotedSuccess = await this.markUserAsVoted(userId);
      if (!markVotedSuccess) {
        console.error('Error marking user as voted');
        // Don't return false here as votes were submitted successfully
      }

      // Send email notifications asynchronously (don't block vote submission)
      this.sendVoteNotificationEmails({
        voterEmail: userData.email,
        uniqueId: userData.unique_id,
        votes: userVotes,
        submittedAt: new Date()
      }).catch(error => {
        console.error('Error sending email notifications:', error);
        // Don't fail the vote submission if emails fail
      });

      return true;
    } catch (error) {
      console.error('Error in submitVotes:', error);
      return false;
    }
  }

  // Send email notifications for vote submission
  private static async sendVoteNotificationEmails(data: {
    voterEmail: string;
    uniqueId: string;
    votes: Record<string, string>;
    submittedAt: Date;
  }): Promise<void> {
    try {
      console.log('Sending email notifications for vote submission...');
      
      const emailResults = await EmailService.sendVoteSubmissionEmails(data);
      
      if (emailResults.voterEmailSent) {
        console.log('✅ Thank you email sent to voter');
      } else {
        console.error('❌ Failed to send thank you email to voter');
      }
      
      if (emailResults.adminEmailSent) {
        console.log('✅ Admin notification email sent');
      } else {
        console.error('❌ Failed to send admin notification email');
      }
    } catch (error) {
      console.error('Error in sendVoteNotificationEmails:', error);
    }
  }

  static async getVoteCounts(): Promise<Record<string, Record<string, number>>> {
    try {
      const { data: voteCounts, error } = await supabase
        .from('vote_counts')
        .select('*');

      if (error) {
        console.error('Error fetching vote counts:', error);
        return {};
      }

      // Convert to the format expected by the UI
      const formattedCounts: Record<string, Record<string, number>> = {};
      
      voteCounts?.forEach(({ position_id, candidate_id, vote_count }) => {
        if (!formattedCounts[position_id]) {
          formattedCounts[position_id] = {};
        }
        formattedCounts[position_id][candidate_id] = vote_count;
      });

      return formattedCounts;
    } catch (error) {
      console.error('Error in getVoteCounts:', error);
      return {};
    }
  }

  // Admin Functions
  static async resetAllVotes(): Promise<boolean> {
    try {
      // Delete all votes
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (votesError) {
        console.error('Error deleting votes:', votesError);
        return false;
      }

      // Reset all users' voted status
      const { error: usersError } = await supabase
        .from('users')
        .update({ has_voted: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

      if (usersError) {
        console.error('Error resetting users:', usersError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in resetAllVotes:', error);
      return false;
    }
  }

  static async getVoterStatus(): Promise<Database['public']['Views']['voter_status']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('voter_status')
        .select('*')
        .order('unique_id');

      if (error) {
        console.error('Error fetching voter status:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVoterStatus:', error);
      return [];
    }
  }

  static async addValidVoterId(uniqueId: string, voterName?: string, issuedBy?: string, notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('valid_voter_ids')
        .insert({
          unique_id: uniqueId,
          voter_name: voterName,
          issued_by: issuedBy,
          notes: notes,
          is_active: true
        });

      if (error) {
        console.error('Error adding voter ID:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addValidVoterId:', error);
      return false;
    }
  }

  static async toggleVoterIdStatus(uniqueId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('valid_voter_ids')
        .update({ is_active: isActive })
        .eq('unique_id', uniqueId);

      if (error) {
        console.error('Error toggling voter ID status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in toggleVoterIdStatus:', error);
      return false;
    }
  }

  // Real-time subscriptions
  static subscribeToVoteUpdates(callback: (votes: Record<string, Record<string, number>>) => void) {
    const channel = supabase
      .channel('vote-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes'
        },
        async () => {
          // Fetch updated vote counts
          const voteCounts = await this.getVoteCounts();
          callback(voteCounts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Validation helpers
  static async checkUniqueIdUsage(uniqueId: string, currentEmail?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('email')
        .eq('unique_id', uniqueId);

      if (currentEmail) {
        query = query.neq('email', currentEmail);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking unique ID usage:', error);
        return false;
      }

      return data.length === 0;
    } catch (error) {
      console.error('Error in checkUniqueIdUsage:', error);
      return false;
    }
  }
}

export default ElectionService;
