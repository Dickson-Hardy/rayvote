import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Mail, Hash, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ElectionService } from '@/integrations/supabase/service';

interface LoginFormProps {
  onLogin: (email: string, uniqueId: string) => void;
  onAdminAccess: () => void;
}

export function LoginForm({ onLogin, onAdminAccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !uniqueId) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Validate unique ID against the database
      const validation = await ElectionService.validateUniqueId(uniqueId);
      
      if (!validation.isValid) {
        setError(validation.message || 'Invalid unique ID');
        setIsLoading(false);
        return;
      }

      if (!validation.isAvailable) {
        setError(validation.message || 'This ID has already been used');
        setIsLoading(false);
        return;
      }

      // Call the login handler
      onLogin(email, uniqueId);
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-floating">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GCN Election 2025
            </h1>
            <p className="text-muted-foreground">
              Class of 2009 Leadership Election
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-card-election">
          <CardHeader>
            <CardTitle>Voter Authentication</CardTitle>
            <CardDescription>
              Enter your email and unique ID to access the voting platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueId">Unique ID</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="uniqueId"
                    type="text"
                    placeholder="Your unique identifier"
                    value={uniqueId}
                    onChange={(e) => setUniqueId(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary border-none text-white shadow-election hover:shadow-floating"
                disabled={isLoading}
              >
                {isLoading ? "Validating..." : "Enter Voting Platform"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={onAdminAccess}
                disabled={isLoading}
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin Access
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Important Notes:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Each voter can only vote once</li>
                <li>• Voting is completely anonymous</li>
                <li>• You must complete all positions to submit</li>
                <li>• Contact admin if you encounter issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}