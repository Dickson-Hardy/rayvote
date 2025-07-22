import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, CheckCircle, Vote, LogOut } from 'lucide-react';
import { VotingCard } from './VotingCard';
import { VotingProgress } from './VotingProgress';
import { ELECTION_POSITIONS } from '@/types/election';
import { useToast } from '@/hooks/use-toast';

interface VotingInterfaceProps {
  userEmail: string;
  onLogout: () => void;
  onSubmitVotes: (votes: Record<string, string>) => void;
  isSubmitting?: boolean;
}

export function VotingInterface({ userEmail, onLogout, onSubmitVotes, isSubmitting = false }: VotingInterfaceProps) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const handleVote = (candidateId: string) => {
    const positionId = ELECTION_POSITIONS[currentPosition].id;
    setVotes(prev => ({
      ...prev,
      [positionId]: candidateId
    }));

    toast({
      title: "Vote recorded",
      description: `Your vote for ${ELECTION_POSITIONS[currentPosition].title} has been recorded`,
    });

    // Auto-advance to next position after a short delay
    setTimeout(() => {
      if (currentPosition < ELECTION_POSITIONS.length - 1) {
        setCurrentPosition(prev => prev + 1);
      }
    }, 500);
  };

  const handleNext = () => {
    if (currentPosition < ELECTION_POSITIONS.length - 1) {
      setCurrentPosition(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPosition > 0) {
      setCurrentPosition(prev => prev - 1);
    }
  };

  const handleSubmitAllVotes = () => {
    onSubmitVotes(votes);
    setShowConfirmation(false);
  };

  const isCurrentPositionVoted = votes[ELECTION_POSITIONS[currentPosition].id];
  const allPositionsVoted = ELECTION_POSITIONS.every(position => votes[position.id]);
  const completedCount = Object.keys(votes).length;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GCN Election 2025
              </h1>
              <p className="text-sm text-muted-foreground">
                Logged in as: {userEmail}
              </p>
            </div>
            <Button variant="outline" onClick={onLogout} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Progress Section */}
        <Card className="shadow-card-election">
          <CardContent className="p-6">
            <VotingProgress
              positions={ELECTION_POSITIONS}
              currentPosition={currentPosition}
              votes={votes}
            />
          </CardContent>
        </Card>

        {/* Current Position Voting */}
        <div className="animate-slide-up">
          <VotingCard
            position={ELECTION_POSITIONS[currentPosition]}
            selectedCandidate={votes[ELECTION_POSITIONS[currentPosition].id] || null}
            onVote={handleVote}
          />
        </div>

        {/* Navigation */}
        <Card className="shadow-card-election">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPosition === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {currentPosition + 1} of {ELECTION_POSITIONS.length}
                </Badge>
                {isCurrentPositionVoted && (
                  <Badge variant="default" className="bg-gradient-success text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Voted
                  </Badge>
                )}
              </div>

              {currentPosition === ELECTION_POSITIONS.length - 1 ? (
                <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleSubmitAllVotes}
                      className="bg-gradient-success text-white border-none shadow-election"
                      disabled={!allPositionsVoted || isSubmitting}
                    >
                      <Vote className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Submitting...' : 'Submit All Votes'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Your Votes</DialogTitle>
                      <DialogDescription>
                        You have completed voting for all {ELECTION_POSITIONS.length} positions. 
                        Once submitted, you cannot change your votes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <h4 className="font-semibold">Vote Summary:</h4>
                        {ELECTION_POSITIONS.map(position => {
                          const candidateId = votes[position.id];
                          const candidate = position.candidates.find(c => c.id === candidateId);
                          return (
                            <div key={position.id} className="flex justify-between text-sm">
                              <span className="font-medium">{position.title}:</span>
                              <span>{candidate?.name || 'No vote'}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirmation(false)}
                          className="flex-1"
                        >
                          Review Votes
                        </Button>
                        <Button
                          onClick={handleSubmitAllVotes}
                          className="flex-1 bg-gradient-success text-white border-none"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={currentPosition === ELECTION_POSITIONS.length - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        {completedCount === 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">How to Vote:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Click on any candidate card to cast your vote for that position</li>
                  <li>• You can change your vote for each position until you submit</li>
                  <li>• Complete all {ELECTION_POSITIONS.length} positions before submitting</li>
                  <li>• Use navigation buttons to move between positions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}