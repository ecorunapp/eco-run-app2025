import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, User, LogOut, Edit3, CreditCard, Bell, ShieldCheck, Palette, Mail, ChevronRight, Weight, Zap as HeightIcon, Loader2, TrendingUp, Star, MapPin, Coins } from '@/components/icons'; // Added Coins
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile'; // Import the hook
import { supabase } from '@/integrations/supabase/client'; // For logout
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading, user: authUser } = useUserProfile();

  // Placeholder user data - will be overridden by fetched profile
  const placeholderUser = {
    name: 'Loading...',
    email: authUser?.email || 'Loading...',
    avatarUrl: '/placeholder.svg',
    joinDate: 'Member since...', // This could be fetched or stored if needed
    weight: null,
    height: null,
  };

  const displayUser = profile ? {
    name: profile.full_name || 'N/A',
    email: profile.username || authUser?.email || 'N/A', // Profile username is email
    avatarUrl: profile.avatar_url || '/placeholder.svg',
    joinDate: authUser ? `Member since ${new Date(authUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}` : 'Member since...',
    weight: profile.weight_kg,
    height: profile.height_cm,
  } : placeholderUser;


  const handleLogout = async () => {
    console.log("User logging out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Logout failed: ${error.message}`);
    } else {
      toast.success("Logged out successfully!");
      navigate('/welcome'); // Navigate to welcome screen after logout
    }
  };

  const profileMenuItems = [
    { title: 'Edit Profile', icon: Edit3, action: () => navigate('/edit-profile') }, // TODO: Create EditProfilePage
    { title: 'Payment Methods', icon: CreditCard, action: () => console.log('Payment Methods clicked') },
    { title: 'Notification Settings', icon: Bell, action: () => console.log('Notifications clicked') },
    { title: 'Privacy & Security', icon: ShieldCheck, action: () => console.log('Privacy clicked') },
    { title: 'Appearance', icon: Palette, action: () => console.log('Appearance clicked (Note: Dark mode is default)') },
  ];

  // Placeholder stats - to be implemented later
  const achievements = {
    totalKm: 0, // Placeholder
    totalCoins: 0, // Placeholder
    activeStreaks: 0, // Placeholder
  };

  if (profileLoading && !profile) { // Show loader only on initial load
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-eco-accent" />
        <p className="mt-4 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark/80 backdrop-blur-md z-40 shadow-sm">
        <EcoRunLogo size="small" />
        <h1 className="text-xl font-semibold text-eco-light">Profile</h1>
        <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent" onClick={() => navigate('/settings')}> {/* TODO: Create SettingsPage */}
          <Settings size={24} />
        </Button>
      </header>

      <main className="flex-grow p-4 space-y-6 overflow-y-auto pb-24 animate-fade-in-up">
        {/* User Info Card */}
        <Card className="bg-eco-dark-secondary border-transparent shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-2 border-eco-accent">
              <AvatarImage src={displayUser.avatarUrl} alt={displayUser.name} />
              <AvatarFallback className="bg-eco-accent text-eco-dark text-3xl">
                {displayUser.name?.split(' ').map(n => n[0]).join('') || <User size={40} />}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold text-eco-light">{displayUser.name}</h2>
            <p className="text-eco-gray flex items-center">
              <Mail size={16} className="mr-1.5" /> {displayUser.email}
            </p>
            <p className="text-xs text-eco-gray mt-1">{displayUser.joinDate}</p>
            
            { (displayUser.weight || displayUser.height) && (
                <div className="flex space-x-4 mt-3 text-sm text-eco-gray">
                    {displayUser.weight && (
                        <span className="flex items-center">
                            <Weight size={16} className="mr-1 text-eco-accent" /> {displayUser.weight} kg
                        </span>
                    )}
                    {displayUser.height && (
                        <span className="flex items-center">
                            <HeightIcon size={16} className="mr-1 text-eco-accent" /> {displayUser.height} cm
                        </span>
                    )}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements/Stats Card - Placeholder for now */}
        <Card className="bg-eco-dark-secondary border-transparent shadow-lg">
          <CardHeader>
            <CardTitle className="text-eco-light text-lg">Activity Snapshot</CardTitle>
            <CardDescription className="text-eco-gray text-xs">Your progress at a glance. More details soon!</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-eco-dark rounded-lg">
              <MapPin size={24} className="mx-auto mb-1 text-eco-accent" />
              <p className="text-xl font-semibold text-eco-light">{achievements.totalKm.toLocaleString()}</p>
              <p className="text-xs text-eco-gray">KM Run</p>
            </div>
            <div className="p-3 bg-eco-dark rounded-lg">
              <Coins size={24} className="mx-auto mb-1 text-yellow-400" />
              <p className="text-xl font-semibold text-eco-light">{achievements.totalCoins.toLocaleString()}</p>
              <p className="text-xs text-eco-gray">EcoCoins</p>
            </div>
            <div className="p-3 bg-eco-dark rounded-lg">
              <Star size={24} className="mx-auto mb-1 text-eco-pink" />
              <p className="text-xl font-semibold text-eco-light">{achievements.activeStreaks}</p>
              <p className="text-xs text-eco-gray">Active Streaks</p>
            </div>
            {/* Add more stats later like "Interests" if applicable */}
          </CardContent>
        </Card>

        {/* Menu Items Card */}
        <Card className="bg-eco-dark-secondary border-transparent shadow-lg">
          <CardHeader>
            <CardTitle className="text-eco-light text-lg">Account & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {profileMenuItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                className="w-full justify-start text-eco-light hover:bg-eco-dark hover:text-eco-accent py-3 px-4"
                onClick={item.action}
              >
                <item.icon size={20} className="mr-3" />
                {item.title}
                <ChevronRight size={18} className="ml-auto text-eco-gray" />
              </Button>
            ))}
          </CardContent>
        </Card>
        
        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full bg-red-600/80 hover:bg-red-500 text-white py-3"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-2" />
          Log Out
        </Button>

        <p className="text-center text-xs text-eco-gray mt-4">App Version 1.0.0</p>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
