
import React, { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Check } from '@/components/icons';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  // Example state, eventually this would come from user preferences (e.g., Supabase)
  const [generalNotifications, setGeneralNotifications] = useState(true);
  const [activityAlerts, setActivityAlerts] = useState(true);
  const [rewardUpdates, setRewardUpdates] = useState(true);

  const handleSaveSettings = () => {
    // Placeholder for saving settings
    console.log({ generalNotifications, activityAlerts, rewardUpdates });
    toast.success("Notification settings saved (placeholder).");
    // navigate(-1); // Optionally navigate back
  };

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark/80 backdrop-blur-md z-40 shadow-sm">
        <Button variant="ghost" size="icon" className="text-eco-light hover:text-eco-accent" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-semibold text-eco-light">Notification Settings</h1>
        <EcoRunLogo size="small" />
      </header>

      <main className="flex-grow p-4 overflow-y-auto pb-24 animate-fade-in-up">
        <Card className="bg-eco-dark-secondary border-transparent shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <Bell size={32} className="mx-auto text-eco-accent mb-3" />
            <CardTitle className="text-eco-light text-xl text-center">Manage Your Notifications</CardTitle>
            <CardDescription className="text-eco-gray text-center">
              Choose what updates you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-eco-dark rounded-lg">
              <Label htmlFor="general-notifications" className="text-eco-light flex-grow">General App Updates</Label>
              <Switch
                id="general-notifications"
                checked={generalNotifications}
                onCheckedChange={setGeneralNotifications}
                className="data-[state=checked]:bg-eco-accent"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-eco-dark rounded-lg">
              <Label htmlFor="activity-alerts" className="text-eco-light flex-grow">Activity Alerts & Reminders</Label>
              <Switch
                id="activity-alerts"
                checked={activityAlerts}
                onCheckedChange={setActivityAlerts}
                className="data-[state=checked]:bg-eco-accent"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-eco-dark rounded-lg">
              <Label htmlFor="reward-updates" className="text-eco-light flex-grow">New Rewards & Offers</Label>
              <Switch
                id="reward-updates"
                checked={rewardUpdates}
                onCheckedChange={setRewardUpdates}
                className="data-[state=checked]:bg-eco-accent"
              />
            </div>
            <Button onClick={handleSaveSettings} className="w-full bg-eco-accent text-eco-dark hover:bg-eco-accent/90 mt-4">
              <Check size={18} className="mr-2" /> Save Preferences
            </Button>
            <p className="text-xs text-eco-gray text-center mt-2">
              Note: The complex feature of showing an on-screen counter during tracking based on these settings will be implemented separately.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default NotificationSettingsPage;
