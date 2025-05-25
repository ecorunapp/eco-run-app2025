import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Play, X } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import ActivityTracker, { ActivitySummary, LiveProgressData } from '@/components/ActivityTracker';
import LastActivityGraph from '@/components/LastActivityGraph';
import { useToast } from "@/hooks/use-toast";
import { Challenge, getChallengeById } from '@/data/challenges';
import ChallengeWonModal from '@/components/ChallengeWonModal';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import ActivityRewardCard from '@/components/ActivityRewardCard';
import MiniChallengeStatus from '@/components/MiniChallengeStatus';

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
  
  const [activityStepCoinsReward, setActivityStepCoinsReward] = useState<number | null>(null);
  
  const [liveProgress, setLiveProgress] = useState<LiveProgressData | null>(null);

  useEffect(() => {
    if (location.state && location.state.challengeId) {
      const challengeId = location.state.challengeId as string;
      const challenge = getChallengeById(challengeId);
      if (challenge) {
        setActiveChallenge(challenge);
        setIsTracking(true); 
        setLastActivitySummary(null); 
        setShowChallengeWonModal(false);
        setCompletedChallengeDetails(null);
        setLiveProgress({ currentSteps: 0, goalSteps: challenge.stepsGoal, elapsedTime: 0 }); // Initialize live progress for challenge
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
    setActiveChallenge(null);
    setIsTracking(true);
    setLastActivitySummary(null);
    setShowChallengeWonModal(false);
    setCompletedChallengeDetails(null);
    setActivityStepCoinsReward(null);
    setLiveProgress({ currentSteps: 0, goalSteps: 10000, elapsedTime: 0 }); // Default goal for generic activity
  };

  const handleStopTracking = (activitySummary: ActivitySummary, challengeCompleted?: boolean) => {
    console.log('ActivitiesPage: handleStopTracking called with summary:', activitySummary, 'Challenge Completed:', challengeCompleted);
    setIsTracking(false); 
    setLastActivitySummary(activitySummary);
    setLiveProgress(null); // Clear live progress when tracking stops

    if (activitySummary.coinsEarned > 0) {
      setActivityStepCoinsReward(activitySummary.coinsEarned);
    }

    if (activeChallenge) {
      if (challengeCompleted) {
        console.log(`Challenge ${activeChallenge.title} completed!`);
        setCompletedChallengeDetails(activeChallenge); 
        setShowChallengeWonModal(true); 
        addEarnings(activeChallenge.rewardCoins, `Challenge: ${activeChallenge.title}`);
        toast({
          title: "Challenge Complete!",
          description: `Awesome! You conquered ${activeChallenge.title} and earned ${activeChallenge.rewardCoins} EcoCoins! (Step coins, if any, shown separately)`,
        });
      } else { 
        if (activitySummary.coinsEarned === 0) {
            toast({
              title: "Challenge Ended",
              description: `You stopped ${activeChallenge.title}. Keep pushing next time!`,
              variant: "default"
            });
        }
      }
    } else { 
      if (activitySummary.coinsEarned === 0) {
        if (activitySummary.steps > 0) {
          toast({
            title: "Activity Ended",
            description: "Great effort! Keep going to earn EcoCoins.",
            variant: "default"
          });
        } else if (activitySummary.steps === 0 && !activitySummary.elapsedTime) {
          // No toast
        } else if (activitySummary.steps === 0 && activitySummary.elapsedTime > 0) {
           toast({
            title: "Tracking Stopped",
            description: "Ready when you are for the next activity!",
            variant: "default"
          });
        }
      }
    }
  };
  
  const handleLiveProgressUpdate = useCallback((progress: LiveProgressData) => {
    setLiveProgress(progress);
  }, []);

  const handleCloseChallengeWonModal = () => {
    setShowChallengeWonModal(false);
    setCompletedChallengeDetails(null); 
    setActiveChallenge(null); 
  };

  const handleCloseStepRewardModal = () => {
    setActivityStepCoinsReward(null);
    // If a challenge was active but not won, and step reward modal is closed, clear active challenge
    // if (activeChallenge && !completedChallengeDetails) { // This logic was commented out before, keeping as is
        // setActiveChallenge(null); 
    // }
  };

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
            onClick={() => {
                // Call handleStopTracking with placeholder summary if user exits early
                // The actual step count will be 0 or whatever ActivityTracker has internally before full stop.
                // For simplicity, using 0 here as the primary effect is to stop tracking.
                handleStopTracking({steps:liveProgress?.currentSteps || 0, elapsedTime:liveProgress?.elapsedTime || 0, calories:0, co2Saved:0, coinsEarned:0}, false)
            }}
          >
             <X size={24} />
          </Button>
        </header>
        <main className="flex-grow overflow-y-auto pb-24">
          <ActivityTracker 
            onStopTracking={handleStopTracking} 
            challengeGoalSteps={activeChallenge?.stepsGoal}
            onLiveProgressUpdate={handleLiveProgressUpdate}
          />
        </main>
        <MiniChallengeStatus
          currentSteps={liveProgress?.currentSteps}
          goalSteps={liveProgress?.goalSteps}
          // streakDays and weeklyProgressPreview will use defaults in MiniChallengeStatus
        />
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
      {activityStepCoinsReward !== null && activityStepCoinsReward > 0 && (
        <ActivityRewardCard
          coinsEarned={activityStepCoinsReward}
          onClose={handleCloseStepRewardModal}
        />
      )}
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
