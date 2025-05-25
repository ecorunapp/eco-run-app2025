
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EcoRunLogo from '@/components/EcoRunLogo';
import { LayoutDashboard, Users, Gift, UserCog, LogOut, ShieldCheck, AlertTriangle, Loader2 } from '@/components/icons'; // Added Loader2

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, roles, isLoading: profileLoading } = useUserProfile();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      // Wait for profile data to load
      if (profileLoading) return;
      
      // Check if user is logged in
      if (!user) {
        console.log("Admin dashboard: No user found");
        toast.error("Please log in to access the admin dashboard.");
        navigate('/login');
        setIsAuthorized(false);
        return;
      }
      
      // Check if user is admin
      if (!roles.includes('admin')) {
        console.log("Admin dashboard: User is not admin", roles);
        toast.error("Access denied. You are not an admin.");
        navigate('/dashboard');
        setIsAuthorized(false);
        return;
      }
      
      // Check if user is banned
      if (profile?.is_banned) {
        console.log("Admin dashboard: User is banned");
        toast.error("Your account has been banned.");
        supabase.auth.signOut();
        navigate('/login');
        setIsAuthorized(false);
        return;
      }
      
      // User is authorized
      console.log("Admin dashboard: Access granted");
      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [user, roles, profile, profileLoading, navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      toast.success('Logged out successfully.');
      navigate('/login');
    }
  };

  // Show loading while checking authorization
  if (profileLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-eco-dark text-eco-light">
        <Loader2 className="h-8 w-8 animate-spin text-eco-accent mr-2" /> 
        Loading Admin Dashboard...
      </div>
    );
  }
  
  // Show access denied if not authorized
  if (isAuthorized === false) {
    return null; // Will redirect anyway
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

      <main className="flex-grow container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for admin features */}
          <div className="bg-eco-dark-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-eco-accent mb-3 flex items-center"><Users size={20} className="mr-2"/>User Management</h2>
            <p className="text-eco-gray text-sm">View, edit, and ban users.</p>
            {/* TODO: Link to user management section/page */}
          </div>
          <div className="bg-eco-dark-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-eco-accent mb-3 flex items-center"><Gift size={20} className="mr-2"/>Gift Card Management</h2>
            <p className="text-eco-gray text-sm">Add, replace, and assign gift cards.</p>
            {/* TODO: Link to gift card management section/page */}
          </div>
          <div className="bg-eco-dark-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-eco-accent mb-3 flex items-center"><UserCog size={20} className="mr-2"/>App Settings</h2>
            <p className="text-eco-gray text-sm">Configure application-wide settings.</p>
            {/* TODO: Link to app settings section/page */}
          </div>
        </div>
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
