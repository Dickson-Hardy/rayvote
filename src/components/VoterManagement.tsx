import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Users, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  UserX
} from 'lucide-react';
import { ElectionService } from '@/integrations/supabase/service';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type VoterStatus = Database['public']['Views']['voter_status']['Row'];

export function VoterManagement() {
  const [voterStatuses, setVoterStatuses] = useState<VoterStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingVoter, setIsAddingVoter] = useState(false);
  const [isDeletingVotes, setIsDeletingVotes] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newVoter, setNewVoter] = useState({
    uniqueId: '',
    voterName: '',
    notes: ''
  });
  
  const { toast } = useToast();

  const loadVoterStatuses = async () => {
    setIsLoading(true);
    try {
      const data = await ElectionService.getVoterStatus();
      setVoterStatuses(data);
    } catch (error) {
      console.error('Error loading voter statuses:', error);
      toast({
        title: "Error loading data",
        description: "Could not load voter information.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVoterStatuses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddVoter = async () => {
    if (!newVoter.uniqueId.trim()) {
      toast({
        title: "Missing information",
        description: "Unique ID is required.",
        variant: "destructive"
      });
      return;
    }

    setIsAddingVoter(true);
    try {
      const success = await ElectionService.addValidVoterId(
        newVoter.uniqueId,
        newVoter.voterName || undefined,
        'admin',
        newVoter.notes || undefined
      );

      if (success) {
        toast({
          title: "Voter added successfully",
          description: `ID ${newVoter.uniqueId} has been added to the registry.`,
        });
        setNewVoter({ uniqueId: '', voterName: '', notes: '' });
        setShowAddDialog(false);
        loadVoterStatuses(); // Refresh the list
      } else {
        toast({
          title: "Error adding voter",
          description: "Could not add voter to registry. ID may already exist.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding voter:', error);
      toast({
        title: "Error adding voter",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsAddingVoter(false);
    }
  };

  const handleDeleteVotes = async (uniqueId: string) => {
    setIsDeletingVotes(uniqueId);
    try {
      const success = await ElectionService.deleteUserVotes(uniqueId);
      
      if (success) {
        toast({
          title: "Votes deleted successfully",
          description: `All votes for ID ${uniqueId} have been deleted. The ID is now available for voting again.`,
        });
        loadVoterStatuses(); // Refresh the list
      } else {
        toast({
          title: "Error deleting votes",
          description: "Could not delete votes for this user.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting votes:', error);
      toast({
        title: "Error deleting votes",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingVotes(null);
    }
  };

  const handleDeleteAccount = async (uniqueId: string) => {
    setIsDeletingAccount(uniqueId);
    try {
      const success = await ElectionService.deleteUserAccount(uniqueId);
      
      if (success) {
        toast({
          title: "Account deleted successfully",
          description: `User account for ID ${uniqueId} has been completely removed. The ID is now available for registration again.`,
        });
        loadVoterStatuses(); // Refresh the list
      } else {
        toast({
          title: "Error deleting account",
          description: "Could not delete user account.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error deleting account",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingAccount(null);
    }
  };

  const handleToggleStatus = async (uniqueId: string, currentStatus: boolean) => {
    try {
      const success = await ElectionService.toggleVoterIdStatus(uniqueId, !currentStatus);
      
      if (success) {
        toast({
          title: "Status updated",
          description: `ID ${uniqueId} has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
        });
        loadVoterStatuses(); // Refresh the list
      } else {
        toast({
          title: "Error updating status",
          description: "Could not update voter status.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Error updating status",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const stats = {
    total: voterStatuses.length,
    registered: voterStatuses.filter(v => v.has_registered).length,
    voted: voterStatuses.filter(v => v.has_voted).length,
    active: voterStatuses.filter(v => v.is_active).length
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total IDs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.registered}</p>
                <p className="text-xs text-muted-foreground">Registered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.voted}</p>
                <p className="text-xs text-muted-foreground">Voted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Voter ID Management</CardTitle>
              <CardDescription>
                Manage valid voter IDs and monitor registration status
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={loadVoterStatuses} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Voter ID
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Voter ID</DialogTitle>
                    <DialogDescription>
                      Add a new unique identifier to the voter registry.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="uniqueId">Unique ID *</Label>
                      <Input
                        id="uniqueId"
                        placeholder="e.g., 12345-GCN"
                        value={newVoter.uniqueId}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, uniqueId: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="voterName">Voter Name (Optional)</Label>
                      <Input
                        id="voterName"
                        placeholder="Full name"
                        value={newVoter.voterName}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, voterName: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Any additional information"
                        value={newVoter.notes}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddVoter} disabled={isAddingVoter}>
                        {isAddingVoter ? 'Adding...' : 'Add Voter ID'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading voter data...</span>
            </div>
          ) : voterStatuses.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No voter IDs found. Add some voter IDs to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unique ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Voted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voterStatuses.map((voter) => (
                  <TableRow key={voter.unique_id}>
                    <TableCell className="font-mono text-sm">
                      {voter.unique_id}
                    </TableCell>
                    <TableCell>{voter.voter_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={voter.is_active ? "default" : "secondary"}>
                        {voter.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{voter.email || '—'}</TableCell>
                    <TableCell>
                      {voter.has_registered ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">No</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {voter.has_voted ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">No</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(voter.unique_id, voter.is_active)}
                        >
                          {voter.is_active ? (
                            <>
                              <EyeOff className="mr-1 h-3 w-3" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="mr-1 h-3 w-3" />
                              Activate
                            </>
                          )}
                        </Button>
                        
                        {/* Show delete votes option only if user has voted */}
                        {voter.has_voted && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                disabled={isDeletingVotes === voter.unique_id}
                              >
                                {isDeletingVotes === voter.unique_id ? (
                                  <>
                                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Delete Votes
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Votes for {voter.unique_id}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete all votes cast by this user and reset their voting status. 
                                  The unique ID will become available for voting again. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVotes(voter.unique_id)}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Delete Votes
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        {/* Show delete account option only if user has registered */}
                        {voter.has_registered && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={isDeletingAccount === voter.unique_id}
                              >
                                {isDeletingAccount === voter.unique_id ? (
                                  <>
                                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <UserX className="mr-1 h-3 w-3" />
                                    Delete Account
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Account for {voter.unique_id}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the user account and all associated votes. 
                                  The unique ID will become available for registration again. This action cannot be undone.
                                  {voter.email && (
                                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                                      <strong>Email:</strong> {voter.email}
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAccount(voter.unique_id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
