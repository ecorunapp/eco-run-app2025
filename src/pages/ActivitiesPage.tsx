import React, { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Play } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import ActivityTracker, { ActivitySummary } from '@/components/ActivityTracker'; // Import ActivitySummary
import LastActivityGraph from '@/components/LastActivityGraph'; // Import new graph component
import { useToast } from "@/hooks/use-toast";

// ActivitySummary interface is now imported from ActivityTracker

const ActivitiesPage: React.FC = () => {
  console.log('ActivitiesPage: component mounted');
  const [isTracking, setIsTracking] = useState(false);
  const [lastActivitySummary, setLastActivitySummary] = useState<ActivitySummary | null>(null); // New state
  const { toast } = useToast();

  const handleStartTracking = () => {
    setIsTracking(true);
    setLastActivitySummary(null); // Clear previous summary when starting a new activity
  };

  const handleStopTracking = (activitySummary: ActivitySummary) => {
    console.log('ActivitiesPage: handleStopTracking called with summary:', activitySummary);
    setLastActivitySummary(activitySummary);
    setIsTracking(false); // This will hide the ActivityTracker and show the main page content
    console.log('ActivitiesPage: isTracking set to false.');
  };
  
  // Helper function to format time, can be moved to utils if used elsewhere
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };


  if (isTracking) {
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
        <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark z-40 shadow-sm">
          <EcoRunLogo size="small" />
          <h1 className="text-xl font-semibold text-eco-light">Activity Tracker</h1>
          {/* Changed Settings button to simply stop tracking for now if user wants to exit tracker view */}
          <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent" onClick={() => handleStopTracking({steps:0, elapsedTime:0, calories:0, co2Saved:0, coinsEarned:0}) /* Pass a dummy summary or fetch current tracker state */}>
             <Settings size={24} /> {/* Or use X icon for closing tracker view */}
          </Button>
        </header>
        <main className="flex-grow overflow-y-auto pb-24"> {/* pb-24 for bottom nav space */}
          <ActivityTracker onStopTracking={handleStopTracking} />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark z-40 shadow-sm">
        <EcoRunLogo size="small" />
        <h1 className="text-xl font-semibold text-eco-light">Activity</h1>
        <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent">
          <Settings size={24} />
        </Button>
      </header>
      <main className="flex-grow p-4 space-y-6 overflow-y-auto pb-24">
        <section className="animate-fade-in-up text-center mb-6">
          <Button 
            size="lg" 
            className="bg-eco-accent text-eco-dark hover:bg-eco-accent/90 shadow-lg"
            onClick={handleStartTracking}
          >
            <Play size={20} className="mr-2"/> Start New Activity
          </Button>
        </section>

        {/* Display Last Activity Graph if available and meaningful */}
        {lastActivitySummary && (lastActivitySummary.steps > 0 || lastActivitySummary.elapsedTime > 0 || lastActivitySummary.calories > 0) && (
          <section className="animate-fade-in-up mb-6">
            <LastActivityGraph summary={lastActivitySummary} />
          </section>
        )}

        <section className="animate-fade-in-up">
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-eco-dark-secondary mb-4">
              <TabsTrigger value="daily" className="data-[state=active]:bg-eco-accent data-[state=active]:text-eco-dark">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="data-[state=active]:bg-eco-accent data-[state=active]:text-eco-dark">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:bg-eco-accent data-[state=active]:text-eco-dark">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <div className="bg-eco-dark-secondary p-6 rounded-xl shadow-lg text-center">
                <h2 className="text-xl font-semibold text-eco-accent mb-2">Daily Report</h2>
                <p className="text-lg text-eco-light">Daily activity data will be shown here.</p>
                <p className="text-sm text-eco-gray mt-2">Check back soon for updates!</p>
              </div>
            </TabsContent>
            <TabsContent value="weekly">
              <WeeklyActivityChart />
            </TabsContent>
            <TabsContent value="monthly">
              <div className="bg-eco-dark-secondary p-6 rounded-xl shadow-lg text-center">
                <h2 className="text-xl font-semibold text-eco-accent mb-2">Monthly Report</h2>
                <p className="text-lg text-eco-light">Monthly activity data will be shown here.</p>
                <p className="text-sm text-eco-gray mt-2">Check back soon for updates!</p>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="text-center animate-fade-in-up mt-6">
          <p className="text-eco-gray mb-4">Track your runs, walks, and cycling sessions to see your progress across different timeframes.</p>
        </section>
        
         <section className="bg-eco-dark-secondary p-4 rounded-xl shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-eco-light mb-2">Activity Tip</h3>
          <p className="text-sm text-eco-gray">Try to vary your activities to keep things interesting and work different muscle groups!</p>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default ActivitiesPage;
