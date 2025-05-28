import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EcoRunLogo from '@/components/EcoRunLogo';
import { LayoutDashboard, Users, Gift, UserCog, LogOut, ShieldCheck, AlertTriangle, Loader2, Edit3, CheckCircle, XCircle, PlusCircle } from '@/components/icons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import EditUserForm from '@/components/admin/EditUserForm';
import AssignGiftCardForm, { GiftCard } from '@/components/admin/AssignGiftCardForm'; // Added GiftCard type import

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, roles, isLoading: profileLoading, updateProfile, fetchUserProfile } = useUserProfile();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  const [availableGiftCards, setAvailableGiftCards] = useState<GiftCard[]>([]);
  const [isLoadingGiftCards, setIsLoadingGiftCards] = useState(false);
  const [isAssignGiftCardModalOpen, setIsAssignGiftCardModalOpen] = useState(false);


  const fetchAllUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*'); 

      if (usersError) throw usersError;
      setAllUsers(usersData as UserProfile[]);
    } catch (error: any) {
      toast.error(`Failed to fetch users: ${error.message}`);
      setAllUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchAvailableGiftCards = useCallback(async () => {
    setIsLoadingGiftCards(true);
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('id, title, value_coins, image_url, monetary_value_aed, card_key, is_active')
        .eq('is_active', true); // Fetch only active gift cards
      if (error) throw error;
      setAvailableGiftCards(data as GiftCard[]);
    } catch (error: any) {
      toast.error(`Failed to fetch gift cards: ${error.message}`);
      setAvailableGiftCards([]);
    } finally {
      setIsLoadingGiftCards(false);
    }
  }, []);


  useEffect(() => {
    const checkAuthorization = async () => {
      if (profileLoading) return;

      if (!user) {
        toast.error("Please log in to access the admin dashboard.");
        navigate('/auth');
        setIsAuthorized(false);
        return;
      }

      // Re-fetch profile to ensure latest roles are considered, especially if roles can change.
      // This is a simplified approach; for more robust role management, consider how roles are updated and propagated.
      if (user?.id) { // ensure user.id exists
        await fetchUserProfile(user); // fetchUserProfile from the hook updates roles
      }


      if (!roles.includes('admin')) {
        toast.error("Access denied. You are not an admin.");
        navigate('/dashboard');
        setIsAuthorized(false);
        return;
      }

      if (profile?.is_banned) {
        toast.error("Your account has been banned.");
        await supabase.auth.signOut();
        navigate('/auth');
        setIsAuthorized(false);
        return;
      }
      
      setIsAuthorized(true);
      fetchAllUsers();
      fetchAvailableGiftCards(); // Fetch gift cards when authorized
    };

    checkAuthorization();
  }, [user, roles, profile, profileLoading, navigate, fetchAllUsers, fetchAvailableGiftCards, fetchUserProfile]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      toast.success('Logged out successfully.');
      navigate('/auth');
    }
  };

  const toggleBanStatus = async (targetUser: UserProfile) => {
    if (!profile || !roles.includes('admin')) {
        toast.error("You are not authorized to perform this action.");
        return;
    }
    if (targetUser.id === user?.id) {
        toast.error("Admins cannot ban themselves.");
        return;
    }

    const newBanStatus = !targetUser.is_banned;
    const action = newBanStatus ? 'ban' : 'unban';
    
    const originalUsers = [...allUsers]; // Store original state for optimistic revert
    setAllUsers(prevUsers => 
        prevUsers.map(u => 
            u.id === targetUser.id ? { ...u, is_banned: newBanStatus } : u
        )
    );

    try {
        const updatedProfileResult = await updateProfile(targetUser.id, { is_banned: newBanStatus });
        if (updatedProfileResult) {
            toast.success(`User ${targetUser.username || targetUser.id} has been ${action}ned.`);
            // Optimistic update is already applied, no need to setAllUsers again if successful.
            // However, ensure the updated user from backend reflects in `allUsers` if there are other changes
            setAllUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === targetUser.id ? { ...u, ...updatedProfileResult } : u
                )
            );

        } else {
            setAllUsers(originalUsers); // Revert optimistic update
            // Error toast handled by updateProfile, or add a generic one here
            toast.error(`Failed to ${action} user. updateProfile might have handled specific error.`);
        }
    } catch (error: any) {
        setAllUsers(originalUsers); // Revert optimistic update
        toast.error(`Error ${action}ning user: ${error.message}`);
    }
  };

  const handleOpenEditUserModal = (userToEdit: UserProfile) => {
    setUserToEdit(userToEdit);
    setIsEditUserModalOpen(true);
  };

  const handleUserUpdate = async (userId: string, data: Partial<UserProfile>) => {
    const updatedUser = await updateProfile(userId, data);
    if (updatedUser) {
      // Refresh the user list to show changes
      setAllUsers(prevUsers => 
        prevUsers.map(u => (u.id === userId ? { ...u, ...updatedUser } : u))
      );
    }
    return updatedUser; // Return for EditUserForm to handle specific toast
  };
  
  const handleOpenAssignGiftCardModal = () => {
    setIsAssignGiftCardModalOpen(true);
  };


  if (profileLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-eco-dark text-eco-light">
        <Loader2 className="h-8 w-8 animate-spin text-eco-accent mr-2" />
        Loading Admin Dashboard...
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
        <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light justify-center items-center p-4 text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h2>
            <p className="text-eco-gray">You are not authorized to view this page.</p>
            <Button onClick={() => navigate('/')} className="mt-6 bg-eco-accent text-eco-dark hover:bg-eco-accent/80">
            Go to Homepage
            </Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-eco-dark text-eco-light flex flex-col">
      <header className="bg-eco-dark-secondary p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <EcoRunLogo size="small" />
            <h1 className="text-xl font-semibold text-eco-light flex items-center">
              <ShieldCheck size={24} className="mr-2 text-eco-accent" /> Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-eco-gray">Welcome, {profile?.full_name || user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-eco-accent hover:text-eco-accent-secondary">
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6 space-y-6">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-eco-accent flex items-center"><Users size={24} className="mr-2"/>User Management</h2>
            {/* Add button or mechanism to trigger user creation if needed */}
          </div>
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-eco-accent mr-2" /> Loading users...
            </div>
          ) : allUsers.length > 0 ? (
            <div className="bg-eco-dark-secondary p-2 rounded-lg shadow-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-eco-light">ID</TableHead>
                    <TableHead className="text-eco-light">Username</TableHead>
                    <TableHead className="text-eco-light">Full Name</TableHead>
                    <TableHead className="text-eco-light">Email</TableHead>
                    <TableHead className="text-eco-light">Total Steps</TableHead>
                    <TableHead className="text-eco-light">Banned?</TableHead>
                    <TableHead className="text-eco-light">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-eco-dark-tertiary">
                      <TableCell className="text-eco-gray text-xs">{u.id}</TableCell>
                      <TableCell className="text-eco-light">{u.username || 'N/A'}</TableCell>
                      <TableCell className="text-eco-light">{u.full_name || 'N/A'}</TableCell>
                      <TableCell className="text-eco-light">{u.email || 'N/A'}</TableCell>
                      <TableCell className="text-eco-light">{u.total_steps ?? 0}</TableCell>
                      <TableCell>
                        {u.is_banned ? (
                            <span className="text-red-400 flex items-center"><XCircle size={16} className="mr-1"/> Yes</span>
                        ) : (
                            <span className="text-green-400 flex items-center"><CheckCircle size={16} className="mr-1"/> No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-eco-yellow border-eco-yellow hover:bg-eco-yellow/10 hover:text-eco-yellow"
                                onClick={() => handleOpenEditUserModal(u)}
                            >
                                <Edit3 size={14} />
                            </Button>
                            <Button 
                                variant={u.is_banned ? "outline" : "destructive"}
                                size="sm"
                                className={u.is_banned 
                                    ? "text-green-400 border-green-400 hover:bg-green-400/10 hover:text-green-400" 
                                    : "text-red-400 border-red-400 hover:bg-red-400/10 hover:text-red-400"}
                                onClick={() => toggleBanStatus(u)}
                                disabled={u.id === user?.id} 
                            >
                                {u.is_banned ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-eco-gray">No users found or failed to load users.</p>
          )}
        </section>
        
        <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-eco-accent flex items-center"><Gift size={24} className="mr-2"/>Gift Card Management</h2>
              <Button 
                onClick={handleOpenAssignGiftCardModal} 
                className="bg-eco-accent text-eco-dark hover:bg-eco-accent/80"
                disabled={isLoadingGiftCards || availableGiftCards.length === 0}
              >
                <PlusCircle size={18} className="mr-2" />
                Assign Gift Card
              </Button>
            </div>
            <div className="bg-eco-dark-secondary p-6 rounded-lg shadow-lg">
                {isLoadingGiftCards ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-eco-accent mr-2" /> Loading gift card data...
                    </div>
                ) : availableGiftCards.length > 0 ? (
                    <p className="text-eco-gray text-sm">Admins can assign available gift cards to users. Click "Assign Gift Card" to begin.</p>
                    // Potentially list assigned gift cards here in the future
                ) : (
                    <p className="text-eco-gray text-sm">No active gift cards available to assign. Add gift cards via Supabase Studio or an import mechanism.</p>
                )}
            </div>
        </section>

        <section>
            <h2 className="text-2xl font-semibold text-eco-accent mb-4 flex items-center"><UserCog size={24} className="mr-2"/>App Settings</h2>
            <div className="bg-eco-dark-secondary p-6 rounded-lg shadow-lg">
                <p className="text-eco-gray text-sm">Configure application-wide settings. (Coming Soon)</p>
            </div>
        </section>

        <div className="mt-8 p-4 bg-eco-dark-secondary rounded-lg shadow">
          <h3 className="text-md font-semibold text-eco-light mb-2">Admin Actions Log (Placeholder)</h3>
          <p className="text-sm text-eco-gray">Future: Display a log of important admin actions taken.</p>
        </div>
      </main>

      <footer className="bg-eco-dark-secondary text-center p-4 text-sm text-eco-gray mt-auto">
        EcoRun Admin Panel &copy; {new Date().getFullYear()}
      </footer>

      {isEditUserModalOpen && userToEdit && (
        <EditUserForm
          userToEdit={userToEdit}
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setUserToEdit(null);
          }}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {isAssignGiftCardModalOpen && (
        <AssignGiftCardForm
          users={allUsers}
          giftCards={availableGiftCards}
          isOpen={isAssignGiftCardModalOpen}
          onClose={() => setIsAssignGiftCardModalOpen(false)}
          onAssignmentSuccess={() => {
            // Potentially refresh assigned gift cards list if displayed on this page
            toast.info("Gift card assignment successful. You may need to refresh related views if applicable.");
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
