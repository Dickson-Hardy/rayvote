import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

export function EmailTestingPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<{
    resendConfigured: boolean;
    adminEmailConfigured: boolean;
  }>({
    resendConfigured: !!import.meta.env.VITE_RESEND_API_KEY,
    adminEmailConfigured: !!import.meta.env.VITE_ADMIN_EMAIL
  });

  const { sendTestEmail, isResendingEmail } = useEmailNotifications();

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      return;
    }
    
    await sendTestEmail(testEmail);
  };

  const isEmailFullyConfigured = emailStatus.resendConfigured && emailStatus.adminEmailConfigured;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Email Configuration & Testing</span>
        </CardTitle>
        <CardDescription>
          Test email notifications and verify configuration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Configuration Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              {emailStatus.resendConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Resend API Key</span>
              <Badge variant={emailStatus.resendConfigured ? "default" : "destructive"}>
                {emailStatus.resendConfigured ? "Configured" : "Missing"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {emailStatus.adminEmailConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Admin Email</span>
              <Badge variant={emailStatus.adminEmailConfigured ? "default" : "destructive"}>
                {emailStatus.adminEmailConfigured ? "Configured" : "Missing"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Configuration Instructions */}
        {!isEmailFullyConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Email Setup Required:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                {!emailStatus.resendConfigured && (
                  <li>• Add VITE_RESEND_API_KEY to your .env.local file</li>
                )}
                {!emailStatus.adminEmailConfigured && (
                  <li>• Add VITE_ADMIN_EMAIL to your .env.local file</li>
                )}
                <li>• Get your Resend API key from: <code>https://resend.com/api-keys</code></li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Test Email Section */}
        {isEmailFullyConfigured && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={isResendingEmail}
                />
                <Button
                  onClick={handleSendTestEmail}
                  disabled={!testEmail || !testEmail.includes('@') || isResendingEmail}
                  size="sm"
                >
                  {isResendingEmail ? (
                    <>
                      <Mail className="mr-2 h-4 w-4 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This will send a sample thank you email to test your configuration.
              </p>
            </div>

            {/* Email Features Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">📧 Automated Email Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ <strong>Voter Thank You:</strong> Sent automatically after vote submission</li>
                <li>✅ <strong>Admin Notification:</strong> Sent to admin when someone votes</li>
                <li>✅ <strong>Vote Summary:</strong> Includes complete voting choices</li>
                <li>✅ <strong>Professional Design:</strong> HTML emails with GCN branding</li>
                <li>✅ <strong>Error Handling:</strong> Voting works even if emails fail</li>
              </ul>
            </div>
          </div>
        )}

        {/* Current Configuration Values */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Current Config:</strong></p>
          <p>• Resend API: {emailStatus.resendConfigured ? '✓ Configured' : '✗ Not set'}</p>
          <p>• Admin Email: {import.meta.env.VITE_ADMIN_EMAIL || 'Not configured'}</p>
          <p>• From Email: GCN Election &lt;noreply@gcn2009.com&gt;</p>
        </div>
      </CardContent>
    </Card>
  );
}
