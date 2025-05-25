
import React from 'react';
import { useLocation } from 'react-router-dom';
import ActivityTracker, { ActivitySummary } from '@/components/ActivityTracker';
import BottomNav from '@/components/BottomNav';
import { useToast } from "@/hooks/use-toast"; // Keep useToast if needed elsewhere
import { toast as sonnerToast } from "sonner"; // Using sonner for general notifications
import type { Challenge } from '@/types/Challenge';

const ActivitiesPage: React.FC = () => {
  const location = useLocation();
  const activeChallenge = location.state?.activeChallenge as (Challenge & { status: 'not-started' | 'completed' }) | undefined;

  console.info("ActivitiesPage: component mounted");
  if(activeChallenge) {
    console.info("ActivitiesPage: Active challenge received:", activeChallenge);
    sonnerToast.info(`Challenge Mode: Tracking for ${activeChallenge.title}`);
  }

  const handleStopTracking = (summary: ActivitySummary) => {
    // This callback might still be useful for overall summary if not challenge-specific
    // Or could be enhanced to show challenge completion status too.
    // For now, challenge completion is handled within ActivityTracker.
    console.info("ActivitiesPage: Activity stopped. Summary:", summary);
    sonnerToast.success("Activity Ended", {
      description: `You saved ${summary.co2Saved}g CO₂ and earned ${summary.coinsEarned} general EcoCoins.`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 sticky top-0 bg-background z-10 shadow-sm border-b">
        <h1 className="text-2xl font-bold text-center text-primary">
          {activeChallenge ? `Challenge: ${activeChallenge.title}` : "Track Activity"}
        </h1>
      </header>
      <main className="flex-grow p-0 sm:p-4 overflow-y-auto pb-20"> {/* pb-20 for BottomNav */}
        <ActivityTracker 
          onStopTracking={handleStopTracking}
          activeChallenge={activeChallenge} // Pass activeChallenge here
        />
      </main>
      <BottomNav />
    </div>
  );
};

export default ActivitiesPage;

