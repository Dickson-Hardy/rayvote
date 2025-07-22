import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { Position } from '@/types/election';

interface VotingProgressProps {
  positions: Position[];
  currentPosition: number;
  votes: Record<string, string>;
}

export function VotingProgress({ positions, currentPosition, votes }: VotingProgressProps) {
  const progress = ((currentPosition) / positions.length) * 100;
  const completedVotes = Object.keys(votes).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Voting Progress</h3>
        <Badge variant="secondary">
          {completedVotes} of {positions.length} positions
        </Badge>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {positions.map((position, index) => {
          const isCompleted = votes[position.id];
          const isCurrent = index === currentPosition;
          
          return (
            <div
              key={position.id}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isCurrent ? 'bg-primary/10 border border-primary/20' : 
                isCompleted ? 'bg-accent/10' : 'bg-muted/50'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
              ) : (
                <Circle className={`h-4 w-4 flex-shrink-0 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <span className={`text-xs font-medium truncate ${
                isCurrent ? 'text-primary' : isCompleted ? 'text-accent' : 'text-muted-foreground'
              }`}>
                {position.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}