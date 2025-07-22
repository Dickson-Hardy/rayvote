import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import EmailService, { type VoteSubmissionData } from '@/lib/emailService';

export function useEmailNotifications() {
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const { toast } = useToast();

  const resendThankYouEmail = async (data: VoteSubmissionData) => {
    setIsResendingEmail(true);
    try {
      const success = await EmailService.sendThankYouEmail(data);
      
      if (success) {
        toast({
          title: "Email sent successfully",
          description: `Thank you email resent to ${data.voterEmail}`,
        });
      } else {
        toast({
          title: "Failed to send email",
          description: "Please check your email configuration and try again.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error resending email:', error);
      toast({
        title: "Error sending email",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsResendingEmail(false);
    }
  };

  const sendTestEmail = async (testEmail: string) => {
    setIsResendingEmail(true);
    try {
      const testData: VoteSubmissionData = {
        voterEmail: testEmail,
        uniqueId: 'TEST-123',
        votes: {
          'president': 'raphael-iyama',
          'vice-president': 'usman-ali'
        },
        submittedAt: new Date()
      };

      const success = await EmailService.sendThankYouEmail(testData);
      
      if (success) {
        toast({
          title: "Test email sent",
          description: `Test email sent to ${testEmail}`,
        });
      } else {
        toast({
          title: "Failed to send test email",
          description: "Please check your email configuration.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error sending test email",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsResendingEmail(false);
    }
  };

  return {
    resendThankYouEmail,
    sendTestEmail,
    isResendingEmail
  };
}

export default useEmailNotifications;
