
import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, LogOut, Edit3, CreditCard, Bell, ShieldCheck, Palette, Mail, ChevronRight } from '@/components/icons';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  // Placeholder user data
  const user = {
    name: 'Alex Green',
    email: 'alex.green@ecorun.app',
    avatarUrl: '/placeholder.svg', // Replace with actual avatar URL or use fallback
    joinDate: 'Member since May 2024',
  };

  const handleLogout = () => {
    console.log("User logging out...");
    // Add actual logout logic here
    navigate('/welcome'); // Navigate to welcome screen after logout
  };

  const profileMenuItems = [
    { title: 'Edit Profile', icon: Edit3, action: () => console.log('Edit Profile clicked') },
    { title: 'Payment Methods', icon: CreditCard, action: () => console.log('Payment Methods clicked') },
    { title: 'Notification Settings', icon: Bell, action: () => console.log('Notifications clicked') },
    { title: 'Privacy & Security', icon: ShieldCheck, action: () => console.log('Privacy clicked') },
    { title: 'Appearance', icon: Palette, action: () => console.log('Appearance clicked (Note: Dark mode is default)') },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark z-40 shadow-sm">
        <EcoRunLogo size="small" />
        <h1 className="text-xl font-semibold text-eco-light">Profile</h1>
        <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent">
          <Settings size={24} />
        </Button>
      </header>

      <main className="flex-grow p-4 space-y-6 overflow-y-auto pb-24 animate-fade-in-up">
        {/* User Info Card */}
        <Card className="bg-eco-dark-secondary border-transparent shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-2 border-eco-accent">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-eco-accent text-eco-dark text-3xl">
                {user.name.split(' ').map(n => n[0]).join('') || <User size={40} />}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold text-eco-light">{user.name}</h2>
            <p className="text-eco-gray flex items-center">
              <Mail size={16} className="mr-1.5" /> {user.email}
            </p>
            <p className="text-xs text-eco-gray mt-1">{user.joinDate}</p>
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
