import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Vote, Trophy, Users } from 'lucide-react';

interface ThankYouPageProps {
  userEmail: string;
  onViewResults: () => void;
  onLogout: () => void;
}

export function ThankYouPage({ userEmail, onViewResults, onLogout }: ThankYouPageProps) {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Animation */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gradient-success rounded-full flex items-center justify-center shadow-floating animate-scale-in">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-success bg-clip-text text-transparent">
              Vote Submitted Successfully!
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for participating in the GCN Class of 2009 Election
            </p>
            <Badge variant="outline" className="text-sm">
              Voter: {userEmail}
            </Badge>
          </div>
        </div>

        {/* Confirmation Details */}
        <Card className="shadow-card-election">
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Vote className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Vote Recorded</h3>
                <p className="text-sm text-muted-foreground">
                  Your votes for all 8 positions have been securely recorded
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold">Anonymous & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your vote is completely anonymous and cannot be traced back to you
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-semibold">Results Coming</h3>
                <p className="text-sm text-muted-foreground">
                  Election results will be announced after voting closes
                </p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-center">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Your votes have been added to the election tally</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>You will receive confirmation via email</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Results will be published when voting closes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Winners will be notified and announced to the class</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onViewResults}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Trophy className="mr-2 h-4 w-4" />
            View Live Results
          </Button>
          
          <Button
            onClick={onLogout}
            className="flex-1 bg-gradient-primary text-white border-none shadow-election"
            size="lg"
          >
            Exit Platform
          </Button>
        </div>

        {/* Additional Info */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Questions or Issues?</p>
              <p className="text-xs text-muted-foreground">
                Contact the election administrators if you experience any problems
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}