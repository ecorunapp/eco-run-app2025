
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EcoRunLogo from '@/components/EcoRunLogo';
import { LayoutDashboard, Users, Gift, UserCog, LogOut, ShieldCheck, AlertTriangle, Loader2, Edit3, Trash2, CheckCircle, XCircle } from '@/components/icons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, roles, isLoading: profileLoading, updateProfile } = useUserProfile();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const checkAuthorizationAndFetchUsers = async () => {
      if (profileLoading) return;

      if (!user) {
        toast.error("Please log in to access the admin dashboard.");
        navigate('/auth');
        setIsAuthorized(false);
        return;
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
      // Fetch all users if authorized as admin
      setIsLoadingUsers(true);
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*');

        if (usersError) {
          throw usersError;
        }
        setAllUsers(usersData as UserProfile[]);
      } catch (error: any) {
        toast.error(`Failed to fetch users: ${error.message}`);
        setAllUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    checkAuthorizationAndFetchUsers();
  }, [user, roles, profile, profileLoading, navigate]);

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
    
    // Optimistic update
    setAllUsers(prevUsers => 
        prevUsers.map(u => 
            u.id === targetUser.id ? { ...u, is_banned: newBanStatus } : u
        )
    );

    try {
        const updatedProfile = await updateProfile(targetUser.id, { is_banned: newBanStatus });
        if (updatedProfile) {
            toast.success(`User ${targetUser.username || targetUser.id} has been ${action}ned.`);
        } else {
            // Revert optimistic update on failure
            setAllUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === targetUser.id ? { ...u, is_banned: targetUser.is_banned } : u
                )
            );
            toast.error(`Failed to ${action} user.`)
        }
    } catch (error: any) {
        // Revert optimistic update on error
        setAllUsers(prevUsers => 
            prevUsers.map(u => 
                u.id === targetUser.id ? { ...u, is_banned: targetUser.is_banned } : u
            )
        );
        toast.error(`Error ${action}ning user: ${error.message}`);
    }
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
    // Navigation is handled in useEffect, so this primarily handles the brief moment before navigation occurs
    // or if navigation fails for some reason.
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
          <h2 className="text-2xl font-semibold text-eco-accent mb-4 flex items-center"><Users size={24} className="mr-2"/>User Management</h2>
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
                      <TableCell className="text-eco-light">{supabase.auth.getUser().then(res => res.data.user?.id === u.id ? res.data.user.email : 'N/A (Other User)')}</TableCell> {/* Note: This is a placeholder way to get email, will need adjustment based on how you store/fetch email */}
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
                                className="text-eco-yellow border-eco-yellow hover:bg-eco-yellow/10"
                                onClick={() => toast.info("Edit user functionality coming soon!")}
                            >
                                <Edit3 size={14} />
                            </Button>
                            <Button 
                                variant={u.is_banned ? "outline" : "destructive"}
                                size="sm"
                                className={u.is_banned ? "text-green-400 border-green-400 hover:bg-green-400/10" : "text-red-400 border-red-400 hover:bg-red-400/10"}
                                onClick={() => toggleBanStatus(u)}
                                disabled={u.id === user?.id} // Prevent admin from banning themselves
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
            <h2 className="text-2xl font-semibold text-eco-accent mb-4 flex items-center"><Gift size={24} className="mr-2"/>Gift Card Management</h2>
            <div className="bg-eco-dark-secondary p-6 rounded-lg shadow-lg">
                <p className="text-eco-gray text-sm">Add, replace, and assign gift cards. (Coming Soon)</p>
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
    </div>
  );
};

export default AdminDashboardPage;

