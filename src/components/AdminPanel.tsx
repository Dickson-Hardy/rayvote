import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Trophy, 
  Users, 
  Vote, 
  Download, 
  RefreshCw, 
  Shield,
  LogOut,
  Crown,
  Mail,
  Settings
} from 'lucide-react';
import { ELECTION_POSITIONS } from '@/types/election';
import { EmailTestingPanel } from './EmailTestingPanel';

interface AdminPanelProps {
  votes: Record<string, Record<string, number>>;
  onLogout: () => void;
  onResetVotes: () => void;
  onRefreshData: () => void;
  isLoading?: boolean;
  isResetting?: boolean;
  isRefreshing?: boolean;
}

const COLORS = ['hsl(217 91% 60%)', 'hsl(142 76% 45%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)', 'hsl(270 95% 75%)'];

export function AdminPanel({ 
  votes, 
  onLogout, 
  onResetVotes, 
  onRefreshData, 
  isLoading = false,
  isResetting = false,
  isRefreshing = false 
}: AdminPanelProps) {
  const [selectedPosition, setSelectedPosition] = useState(ELECTION_POSITIONS[0].id);

  // Calculate total votes across all positions
  const totalVotes = Object.values(votes).reduce((sum, positionVotes) => {
    return sum + Object.values(positionVotes).reduce((posSum, count) => posSum + count, 0);
  }, 0);

  // Calculate unique voters (assuming each voter votes for all positions)
  const uniqueVoters = Math.max(...Object.values(votes).map(positionVotes => 
    Object.values(positionVotes).reduce((sum, count) => sum + count, 0)
  ), 0);

  // Get results for selected position
  const getPositionResults = (positionId: string) => {
    const position = ELECTION_POSITIONS.find(p => p.id === positionId);
    const positionVotes = votes[positionId] || {};
    
    return position?.candidates.map(candidate => ({
      name: candidate.name,
      votes: positionVotes[candidate.id] || 0,
      percentage: uniqueVoters > 0 ? Math.round(((positionVotes[candidate.id] || 0) / uniqueVoters) * 100) : 0
    })).sort((a, b) => b.votes - a.votes) || [];
  };

  // Get winner for a position
  const getWinner = (positionId: string) => {
    const results = getPositionResults(positionId);
    return results.length > 0 ? results[0] : null;
  };

  // Export results as CSV
  const exportResults = () => {
    // Create CSV header
    let csvContent = 'Position,Candidate,Votes,Percentage\n';
    
    // Add data for each position
    ELECTION_POSITIONS.forEach(position => {
      const results = getPositionResults(position.id);
      results.forEach(candidate => {
        csvContent += `"${position.title}","${candidate.name}",${candidate.votes},${candidate.percentage}%\n`;
      });
      // Add empty line between positions for readability
      csvContent += '\n';
    });
    
    // Add summary section
    csvContent += '\n--- SUMMARY ---\n';
    csvContent += 'Position,Winner,Votes\n';
    ELECTION_POSITIONS.forEach(position => {
      const winner = getWinner(position.id);
      if (winner) {
        csvContent += `"${position.title}","${winner.name}",${winner.votes}\n`;
      }
    });
    
    // Add election metadata
    csvContent += '\n--- ELECTION INFO ---\n';
    csvContent += `Export Date,${new Date().toLocaleString()}\n`;
    csvContent += `Total Votes Cast,${Object.values(votes).reduce((sum, positionVotes) => 
      sum + Object.values(positionVotes).reduce((posSum, count) => posSum + count, 0), 0)}\n`;
    csvContent += `Total Positions,${ELECTION_POSITIONS.length}\n`;
    
    // Create and download CSV file
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gcn-election-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedPositionResults = getPositionResults(selectedPosition);
  const selectedPositionTitle = ELECTION_POSITIONS.find(p => p.id === selectedPosition)?.title || '';

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Election Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground">
                  GCN Class of 2009 - Real-time Results
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Exit Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-card-election">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueVoters}</p>
                  <p className="text-muted-foreground">Total Voters</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card-election">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Vote className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalVotes}</p>
                  <p className="text-muted-foreground">Total Votes Cast</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card-election">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ELECTION_POSITIONS.length}</p>
                  <p className="text-muted-foreground">Positions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Winners Summary */}
        <Card className="shadow-card-election">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-warning" />
              <span>Current Leaders</span>
            </CardTitle>
            <CardDescription>
              Leading candidates for each position (live results)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ELECTION_POSITIONS.map(position => {
                const winner = getWinner(position.id);
                return (
                  <div key={position.id} className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">{position.title}</h4>
                    {winner ? (
                      <div className="space-y-1">
                        <p className="font-medium">{winner.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {winner.votes} votes
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {winner.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No votes yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Tabs value={selectedPosition} onValueChange={setSelectedPosition}>
          <Card className="shadow-card-election">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Detailed Results</CardTitle>
                  <CardDescription>
                    View comprehensive results for each position
                  </CardDescription>
                </div>
                <Button onClick={exportResults} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
                {ELECTION_POSITIONS.map(position => (
                  <TabsTrigger 
                    key={position.id} 
                    value={position.id}
                    className="text-xs"
                  >
                    {position.title.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {ELECTION_POSITIONS.map(position => (
                <TabsContent key={position.id} value={position.id} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">{position.title}</h3>
                    
                    {/* Bar Chart */}
                    <div className="h-64 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getPositionResults(position.id)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="votes" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Detailed Results */}
                    <div className="space-y-3">
                      {getPositionResults(position.id).map((candidate, index) => (
                        <div key={candidate.name} className="flex items-center space-x-4">
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{candidate.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {candidate.votes} votes ({candidate.percentage}%)
                              </span>
                            </div>
                            <Progress 
                              value={candidate.percentage} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </CardContent>
          </Card>
        </Tabs>

        {/* Admin Controls & Email Testing */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Controls */}
          <Card className="shadow-card-election border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-warning flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Admin Controls</span>
              </CardTitle>
              <CardDescription>
                Election management and data operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading vote data...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRefreshData}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onResetVotes}
                    disabled={isResetting}
                  >
                    {isResetting ? 'Resetting...' : 'Reset All Votes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Testing Panel */}
          <EmailTestingPanel />
        </div>
      </div>
    </div>
  );
}