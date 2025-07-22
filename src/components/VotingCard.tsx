import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, User } from 'lucide-react';
import { Candidate, Position } from '@/types/election';
import { cn } from '@/lib/utils';

interface VotingCardProps {
  position: Position;
  selectedCandidate: string | null;
  onVote: (candidateId: string) => void;
}

export function VotingCard({ position, selectedCandidate, onVote }: VotingCardProps) {
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);

  const handleVote = (candidateId: string) => {
    setAnimatingCard(candidateId);
    setTimeout(() => {
      onVote(candidateId);
      setAnimatingCard(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="text-sm font-medium">
          Position
        </Badge>
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {position.title}
        </h2>
        <p className="text-muted-foreground">
          Select one candidate to cast your vote
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {position.candidates.map((candidate) => (
          <Card
            key={candidate.id}
            className={cn(
              "group cursor-pointer transition-all duration-300 hover:shadow-card-election hover:scale-[1.02]",
              selectedCandidate === candidate.id && "ring-2 ring-primary shadow-floating",
              animatingCard === candidate.id && "animate-vote-submit"
            )}
            onClick={() => handleVote(candidate.id)}
          >
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center">
                <Avatar className="h-16 w-16 border-2 border-muted">
                  <AvatarImage src={candidate.photo} alt={candidate.name} />
                  <AvatarFallback className="bg-gradient-primary text-white text-lg">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-center text-lg leading-tight">
                  {candidate.name}
                </CardTitle>
                {candidate.bio && (
                  <p className="text-sm text-muted-foreground text-center line-clamp-2">
                    {candidate.bio}
                  </p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <Button
                variant={selectedCandidate === candidate.id ? "default" : "outline"}
                className={cn(
                  "w-full transition-all duration-200",
                  selectedCandidate === candidate.id 
                    ? "bg-gradient-primary border-none text-white shadow-election" 
                    : "hover:bg-secondary"
                )}
                size="sm"
              >
                {selectedCandidate === candidate.id ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Selected
                  </>
                ) : (
                  "Vote"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}