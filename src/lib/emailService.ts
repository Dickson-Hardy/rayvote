import { Resend } from 'resend';
import { ELECTION_POSITIONS } from '@/types/election';

// Initialize Resend with API key from environment variables
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  fromEmail: 'GCN Election <noreply@gcn2009.com>',
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || 'admin@gcn2009.com',
  replyTo: import.meta.env.VITE_ADMIN_EMAIL || 'admin@gcn2009.com',
};

export interface VoteSubmissionData {
  voterEmail: string;
  uniqueId: string;
  votes: Record<string, string>;
  submittedAt: Date;
}

export class EmailService {
  // Send thank you email to voter
  static async sendThankYouEmail(data: VoteSubmissionData): Promise<boolean> {
    try {
      const { voterEmail, uniqueId, votes, submittedAt } = data;
      
      // Create a summary of votes for the email
      const voteSummary = ELECTION_POSITIONS.map(position => {
        const candidateId = votes[position.id];
        const candidate = position.candidates.find(c => c.id === candidateId);
        return {
          position: position.title,
          candidate: candidate?.name || 'No vote recorded'
        };
      });

      const { error } = await resend.emails.send({
        from: EMAIL_CONFIG.fromEmail,
        to: voterEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: '✅ Your Vote Has Been Submitted - GCN Election 2025',
        html: this.generateThankYouEmailHTML({
          voterEmail,
          uniqueId,
          voteSummary,
          submittedAt
        })
      });

      if (error) {
        console.error('Error sending thank you email:', error);
        return false;
      }

      console.log('Thank you email sent successfully to:', voterEmail);
      return true;
    } catch (error) {
      console.error('Error in sendThankYouEmail:', error);
      return false;
    }
  }

  // Send notification email to admin
  static async sendAdminNotification(data: VoteSubmissionData): Promise<boolean> {
    try {
      const { voterEmail, uniqueId, votes, submittedAt } = data;
      
      // Create detailed vote information for admin
      const voteDetails = ELECTION_POSITIONS.map(position => {
        const candidateId = votes[position.id];
        const candidate = position.candidates.find(c => c.id === candidateId);
        return {
          position: position.title,
          candidate: candidate?.name || 'No vote',
          candidateId: candidateId || 'none'
        };
      });

      const { error } = await resend.emails.send({
        from: EMAIL_CONFIG.fromEmail,
        to: EMAIL_CONFIG.adminEmail,
        replyTo: EMAIL_CONFIG.replyTo,
        subject: `🗳️ New Vote Submitted - ${voterEmail}`,
        html: this.generateAdminNotificationHTML({
          voterEmail,
          uniqueId,
          voteDetails,
          submittedAt
        })
      });

      if (error) {
        console.error('Error sending admin notification:', error);
        return false;
      }

      console.log('Admin notification sent successfully');
      return true;
    } catch (error) {
      console.error('Error in sendAdminNotification:', error);
      return false;
    }
  }

  // Send both emails (voter thank you + admin notification)
  static async sendVoteSubmissionEmails(data: VoteSubmissionData): Promise<{ voterEmailSent: boolean; adminEmailSent: boolean }> {
    const [voterEmailSent, adminEmailSent] = await Promise.all([
      this.sendThankYouEmail(data),
      this.sendAdminNotification(data)
    ]);

    return {
      voterEmailSent,
      adminEmailSent
    };
  }

  // Generate HTML for thank you email
  private static generateThankYouEmailHTML(data: {
    voterEmail: string;
    uniqueId: string;
    voteSummary: Array<{ position: string; candidate: string }>;
    submittedAt: Date;
  }): string {
    const { voterEmail, uniqueId, voteSummary, submittedAt } = data;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vote Confirmation - GCN Election 2025</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #2563eb; margin-bottom: 30px; }
            .success-badge { background-color: #10b981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
            .vote-summary { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .vote-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .vote-item:last-child { border-bottom: none; }
            .position { font-weight: bold; color: #374151; }
            .candidate { color: #2563eb; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .cta-button { background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 GCN Election 2025</h1>
                <h2>Thank You for Voting!</h2>
            </div>
            
            <div class="success-badge">
                ✅ Your vote has been successfully submitted
            </div>
            
            <p>Dear GCN Class of 2009 Alumni,</p>
            
            <p>Thank you for participating in the GCN Class of 2009 Leadership Election. Your vote has been securely recorded and will be counted in the final results.</p>
            
            <div class="vote-summary">
                <h3>📋 Your Vote Summary</h3>
                ${voteSummary.map(vote => `
                    <div class="vote-item">
                        <span class="position">${vote.position}</span>
                        <span class="candidate">${vote.candidate}</span>
                    </div>
                `).join('')}
            </div>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📊 Next Steps:</strong></p>
                <ul>
                    <li>Your votes are final and cannot be changed</li>
                    <li>Results will be announced after the voting period ends</li>
                    <li>You will receive an email with the final results</li>
                </ul>
            </div>
            
            <div class="footer">
                <p><strong>Voting Details:</strong></p>
                <p>Email: ${voterEmail}</p>
                <p>ID: ${uniqueId}</p>
                <p>Submitted: ${submittedAt.toLocaleString()}</p>
                <hr style="margin: 20px 0;">
                <p>If you have any questions, please contact the election administrator.</p>
                <p>&copy; 2025 GCN Class of 2009. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate HTML for admin notification email
  private static generateAdminNotificationHTML(data: {
    voterEmail: string;
    uniqueId: string;
    voteDetails: Array<{ position: string; candidate: string; candidateId: string }>;
    submittedAt: Date;
  }): string {
    const { voterEmail, uniqueId, voteDetails, submittedAt } = data;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Vote Submission - Admin Notification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #dc2626; margin-bottom: 30px; }
            .notification-badge { background-color: #f59e0b; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
            .vote-details { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .vote-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .vote-item:last-child { border-bottom: none; }
            .position { font-weight: bold; color: #374151; flex: 1; }
            .candidate { color: #2563eb; flex: 1; }
            .candidate-id { color: #6b7280; font-size: 12px; flex: 1; text-align: right; }
            .voter-info { background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛡️ GCN Election Admin</h1>
                <h2>New Vote Notification</h2>
            </div>
            
            <div class="notification-badge">
                🗳️ New vote submitted
            </div>
            
            <div class="voter-info">
                <h3>👤 Voter Information</h3>
                <p><strong>Email:</strong> ${voterEmail}</p>
                <p><strong>Unique ID:</strong> ${uniqueId}</p>
                <p><strong>Submitted:</strong> ${submittedAt.toLocaleString()}</p>
            </div>
            
            <div class="vote-details">
                <h3>📊 Vote Details</h3>
                ${voteDetails.map(vote => `
                    <div class="vote-item">
                        <span class="position">${vote.position}</span>
                        <span class="candidate">${vote.candidate}</span>
                        <span class="candidate-id">(${vote.candidateId})</span>
                    </div>
                `).join('')}
            </div>
            
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📈 Admin Actions:</strong></p>
                <ul>
                    <li>Vote has been recorded in the database</li>
                    <li>Voter has been marked as "voted"</li>
                    <li>Real-time results have been updated</li>
                    <li>Thank you email sent to voter</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>This is an automated notification from the GCN Election System.</p>
                <p>Login to the admin panel to view detailed results and analytics.</p>
                <hr style="margin: 20px 0;">
                <p>&copy; 2025 GCN Election System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export default EmailService;
