
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // Using sonner for notifications
import { UserSearch, Send, XCircle, UserCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
}

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | undefined;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ isOpen, onClose, currentUserId }) => {
  const [searchedUsername, setSearchedUsername] = useState('');
  const [foundUser, setFoundUser] = useState<Profile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleSearchUser = async () => {
    if (!searchedUsername.trim()) {
      setSearchError('Please enter a username to search.');
      setFoundUser(null);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setFoundUser(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('username', searchedUsername.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // "PGRST116" implies "single row not found"
          setSearchError(`User "${searchedUsername}" not found.`);
        } else {
          setSearchError(`Error searching for user: ${error.message}`);
        }
        setFoundUser(null);
      } else if (data) {
        if (data.id === currentUserId) {
            setSearchError("You cannot invite yourself.");
            setFoundUser(null);
        } else {
            setFoundUser(data as Profile);
        }
      }
    } catch (e: any) {
      setSearchError(`An unexpected error occurred: ${e.message}`);
      setFoundUser(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async () => {
    if (!foundUser || !currentUserId) {
      toast.error('Cannot send invite. User not selected or you are not logged in.');
      return;
    }

    if (foundUser.id === currentUserId) {
      toast.error("You cannot invite yourself.");
      return;
    }
    
    setIsSendingInvite(true);
    try {
      // Check if an active or pending invite already exists between these two users
      const { data: existingSession, error: existingSessionError } = await supabase
        .from('meet_and_run_sessions')
        .select('id, status')
        .or(`and(inviter_id.eq.${currentUserId},invitee_id.eq.${foundUser.id}),and(inviter_id.eq.${foundUser.id},invitee_id.eq.${currentUserId})`)
        .in('status', ['PENDING_INVITE', 'INVITE_ACCEPTED', 'MEETING_TIME_LOCATION_SET', 'AWAITING_ARRIVAL', 'INVITER_ARRIVED', 'INVITEE_ARRIVED', 'BOTH_ARRIVED', 'CHALLENGE_IN_PROGRESS'])
        .maybeSingle();

      if (existingSessionError) {
        throw existingSessionError;
      }

      if (existingSession) {
        toast.error(`You already have an active or pending session with ${foundUser.username}.`);
        setIsSendingInvite(false);
        return;
      }

      const { error } = await supabase
        .from('meet_and_run_sessions')
        .insert({
          inviter_id: currentUserId,
          invitee_id: foundUser.id,
          status: 'PENDING_INVITE',
        });

      if (error) {
        throw error;
      }

      toast.success(`Invite sent to ${foundUser.username || 'user'}!`);
      queryClient.invalidateQueries({ queryKey: ['meetAndRunSessions'] }); // To refetch sessions on the main page
      resetModal();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to send invite: ${error.message}`);
    } finally {
      setIsSendingInvite(false);
    }
  };
  
  const resetModal = () => {
    setSearchedUsername('');
    setFoundUser(null);
    setSearchError(null);
    setIsSearching(false);
    setIsSendingInvite(false);
  };

  const handleCloseDialog = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-purple-700">Invite a Friend to Run</DialogTitle>
          <DialogDescription>
            Find a user by their username and send them an invitation for a "Meet & Run" session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-purple-600">
              Friend's Username
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="username"
                value={searchedUsername}
                onChange={(e) => setSearchedUsername(e.target.value)}
                placeholder="e.g., runlover99"
                className="flex-grow"
                disabled={isSearching || isSendingInvite}
              />
              <Button type="button" onClick={handleSearchUser} disabled={isSearching || isSendingInvite || !searchedUsername.trim()} className="bg-purple-600 hover:bg-purple-700">
                <UserSearch className="mr-2 h-4 w-4" /> {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {searchError && (
            <div className="flex items-center text-sm text-red-500 p-2 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="mr-2 h-5 w-5" /> 
              <span>{searchError}</span>
            </div>
          )}

          {foundUser && (
            <div className="flex items-center text-sm text-green-600 p-3 bg-green-50 border border-green-200 rounded-md">
              <UserCheck className="mr-2 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">User Found: {foundUser.username}</p>
                {foundUser.full_name && <p className="text-xs text-gray-700">Full Name: {foundUser.full_name}</p>}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDialog} disabled={isSendingInvite}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSendInvite} disabled={!foundUser || isSendingInvite || isSearching} className="bg-green-600 hover:bg-green-700">
             <Send className="mr-2 h-4 w-4" /> {isSendingInvite ? 'Sending...' : 'Send Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendModal;

