import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Play, X } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import ActivityTracker, { ActivitySummary } from '@/components/ActivityTracker';
import LastActivityGraph from '@/components/LastActivityGraph';
import { useToast } from "@/hooks/use-toast";
import { Challenge, getChallengeById } from '@/data/challenges';
import ChallengeWonModal from '@/components/ChallengeWonModal';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import ActivityRewardCard from '@/components/ActivityRewardCard';

const ActivitiesPage: React.FC = () => {
  console.log('ActivitiesPage: component mounted');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addEarnings } = useEcoCoins();

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastActivitySummary, setLastActivitySummary] = useState<ActivitySummary | null>(null);
  
  const [showChallengeWonModal, setShowChallengeWonModal] = useState(false);
  const [completedChallengeDetails, setCompletedChallengeDetails] = useState<Challenge | null>(null);
  
  // New state to manage the reward card for step-based coins
  const [activityStepCoinsReward, setActivityStepCoinsReward] = useState<number | null>(null);

  useEffect(() => {
    // Check if a challengeId was passed in route state (from ChallengeCard)
    if (location.state && location.state.challengeId) {
      const challengeId = location.state.challengeId as string;
      const challenge = getChallengeById(challengeId);
      if (challenge) {
        setActiveChallenge(challenge);
        setIsTracking(true); // Automatically start tracking for the challenge
        // Clear previous state to avoid showing old data
        setLastActivitySummary(null); 
        setShowChallengeWonModal(false);
        setCompletedChallengeDetails(null);
        // Clear the state from location to prevent re-triggering on refresh/navigation
        navigate(location.pathname, { replace: true, state: {} });
        toast({
          title: "Challenge Started!",
          description: `Tracking for: ${challenge.title}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not find the selected challenge.",
          variant: "destructive",
        });
      }
    }
  }, [location.state, navigate, toast]);

  const handleStartGenericActivity = () => {
    setActiveChallenge(null); // Ensure no challenge is active for generic tracking
    setIsTracking(true);
    setLastActivitySummary(null);
    setShowChallengeWonModal(false);
    setCompletedChallengeDetails(null);
    setActivityStepCoinsReward(null); // Reset step coins reward
  };

  const handleStopTracking = (activitySummary: ActivitySummary, challengeCompleted?: boolean) => {
    console.log('ActivitiesPage: handleStopTracking called with summary:', activitySummary, 'Challenge Completed:', challengeCompleted);
    setIsTracking(false); 
    setLastActivitySummary(activitySummary);

    // 1. Handle coins earned from steps - Show ActivityRewardCard if coins were earned
    // The ActivityRewardCard itself will call addEarnings.
    if (activitySummary.coinsEarned > 0) {
      setActivityStepCoinsReward(activitySummary.coinsEarned);
      // The toast for step coins is now implicitly handled by the card.
      // No direct addEarnings call here for step coins; ActivityRewardCard handles it.
    }

    // 2. Handle challenge-specific outcomes
    if (activeChallenge) {
      if (challengeCompleted) {
        console.log(`Challenge ${activeChallenge.title} completed!`);
        setCompletedChallengeDetails(activeChallenge); // Store completed challenge details
        setShowChallengeWonModal(true); // Show the win modal
        // Add main challenge reward coins
        addEarnings(activeChallenge.rewardCoins, `Challenge: ${activeChallenge.title}`);
        toast({
          title: "Challenge Complete!",
          description: `Awesome! You conquered ${activeChallenge.title} and earned ${activeChallenge.rewardCoins} EcoCoins! (Step coins, if any, shown separately)`,
        });
      } else { // Challenge was active but not completed
        // Only show this toast if no step coins were earned (otherwise ActivityRewardCard shows first)
        if (activitySummary.coinsEarned === 0) {
            toast({
              title: "Challenge Ended",
              description: `You stopped ${activeChallenge.title}. Keep pushing next time!`,
              variant: "default"
            });
        }
      }
    } else { // Generic activity (not a challenge)
      // If activitySummary.coinsEarned > 0, ActivityRewardCard will show.
      // These toasts are for generic activities with NO step coins.
      if (activitySummary.coinsEarned === 0) {
        if (activitySummary.steps > 0) {
          toast({
            title: "Activity Ended",
            description: "Great effort! Keep going to earn EcoCoins.",
            variant: "default"
          });
        } else if (activitySummary.steps === 0 && !activitySummary.elapsedTime) {
          // No toast for immediate stop with no effort.
        } else if (activitySummary.steps === 0 && activitySummary.elapsedTime > 0) {
           toast({
            title: "Tracking Stopped",
            description: "Ready when you are for the next activity!",
            variant: "default"
          });
        }
      }
    }
    // setActiveChallenge(null); // Reset active challenge should happen after modals are closed
  };
  
  const handleCloseChallengeWonModal = () => {
    setShowChallengeWonModal(false);
    setCompletedChallengeDetails(null); // Clear details after modal is closed
    setActiveChallenge(null); // Also clear the active challenge from the page state
  };

  const handleCloseStepRewardModal = () => {
    setActivityStepCoinsReward(null);
    // If a challenge was active but not won, and step reward modal is closed, clear active challenge
    if (activeChallenge && !completedChallengeDetails) {
        // setActiveChallenge(null); // Consider if this is the right place
    }
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
          <h1 className="text-xl font-semibold text-eco-light">
            {activeChallenge ? activeChallenge.title : 'Activity Tracker'}
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-eco-gray hover:text-eco-accent" 
            onClick={() => handleStopTracking({steps:0, elapsedTime:0, calories:0, co2Saved:0, coinsEarned:0}, false)}
          >
             <X size={24} />
          </Button>
        </header>
        <main className="flex-grow overflow-y-auto pb-24">
          <ActivityTracker 
            onStopTracking={handleStopTracking} 
            challengeGoalSteps={activeChallenge?.stepsGoal}
          />
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
            onClick={handleStartGenericActivity}
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
      {/* Modal for step-based coins earned */}
      {activityStepCoinsReward !== null && activityStepCoinsReward > 0 && (
        <ActivityRewardCard
          coinsEarned={activityStepCoinsReward}
          onClose={handleCloseStepRewardModal}
        />
      )}
      {/* Modal for completed challenge */}
      {completedChallengeDetails && (
        <ChallengeWonModal
          isOpen={showChallengeWonModal}
          onClose={handleCloseChallengeWonModal}
          challenge={completedChallengeDetails}
        />
      )}
    </div>
  );
};

export default ActivitiesPage;
