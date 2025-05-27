import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Play, X, Footprints, Zap } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import ActivityTracker, { ActivitySummary, LiveProgressData } from '@/components/ActivityTracker';
import LastActivityGraph from '@/components/LastActivityGraph';
import { useToast } from "@/hooks/use-toast";
import { Challenge, getChallengeById } from '@/data/challenges';
import ChallengeWonModal from '@/components/ChallengeWonModal';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import StepCoinClaimModal from '@/components/StepCoinClaimModal';
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
  const [currentUserGiftCardId, setCurrentUserGiftCardId] = useState<string | null>(null);
  
  const [pendingStepCoins, setPendingStepCoins] = useState<number | null>(null);
  const [showStepCoinClaimModal, setShowStepCoinClaimModal] = useState(false);
  
  const [liveProgress, setLiveProgress] = useState<LiveProgressData | null>(null);

  // New states for mode selection
  const [activityStartOptions, setActivityStartOptions] = useState<{ challenge: Challenge | null, isGeneric: boolean } | null>(null);
  const [selectedActivityMode, setSelectedActivityMode] = useState<'walk' | 'run' | null>(null);

  useEffect(() => {
    if (location.state && location.state.challengeId && !activityStartOptions && !isTracking) {
      const challengeId = location.state.challengeId as string;
      const challenge = getChallengeById(challengeId);
      if (challenge) {
        setActiveChallenge(challenge);
        setActivityStartOptions({ challenge, isGeneric: false });
        // Clear other states that might persist from a previous activity
        setLastActivitySummary(null);
        setShowChallengeWonModal(false);
        setCompletedChallengeDetails(null);
        setCurrentUserGiftCardId(null);
        setPendingStepCoins(null);
        setShowStepCoinClaimModal(false);
        // Don't set liveProgress here yet, do it after mode selection
        navigate(location.pathname, { replace: true, state: {} }); // Clear location state
        toast({
          title: "Challenge Ready!",
          description: `Select mode for: ${challenge.title}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not find the selected challenge.",
          variant: "destructive",
        });
      }
    }
  }, [location.state, navigate, toast, activityStartOptions, isTracking]);

  const handleStartGenericActivity = () => {
    setActiveChallenge(null);
    setActivityStartOptions({ challenge: null, isGeneric: true });
    // Clear other states
    setLastActivitySummary(null);
    setShowChallengeWonModal(false);
    setCompletedChallengeDetails(null);
    setCurrentUserGiftCardId(null);
    setPendingStepCoins(null);
    setShowStepCoinClaimModal(false);
  };

  const handleModeSelected = (mode: 'walk' | 'run') => {
    setSelectedActivityMode(mode);
    setIsTracking(true);
    
    const goalSteps = activityStartOptions?.challenge?.stepsGoal || 10000;
    setLiveProgress({ currentSteps: 0, goalSteps, elapsedTime: 0 });
    
    setActivityStartOptions(null); // Clear options, activity is starting
  };

  const handleStopTracking = async (activitySummary: ActivitySummary, challengeCompleted?: boolean) => {
    console.log('ActivitiesPage: handleStopTracking called with summary:', activitySummary, 'Challenge Completed:', challengeCompleted);
    setIsTracking(false); 
    setSelectedActivityMode(null); // Reset mode
    setLastActivitySummary(activitySummary);
    setLiveProgress(null);

    // Handle step-based coins FIRST.
    // IMPORTANT CAVEAT: If ActivityTracker.tsx already adds these coins, this new modal might lead to double counting.
    // This flow assumes ActivityTracker.tsx *only reports* activitySummary.coinsEarned for steps.
    if (activitySummary.coinsEarned > 0 && !challengeCompleted) { // Show step coin modal only if not also completing a challenge right now, or if logic for challenge reward is separate.
      setPendingStepCoins(activitySummary.coinsEarned);
      setShowStepCoinClaimModal(true);
    } else if (activitySummary.coinsEarned > 0 && challengeCompleted && activeChallenge) {
        // If challenge completed AND step coins earned, decide how to handle.
        // Option 1: Add step coins silently if challenge modal is shown.
        // Option 2: Show step coin modal first, then challenge modal. (Complex UX)
        // Option 3: Add step coins to challenge reward.
        // For now, let's prioritize challenge completion modal if both occur.
        // If step coins are *already added by ActivityTracker*, this logic might be fine.
        // If they are *not*, they might be missed if a challenge is also completed.
        // This part needs careful thought based on ActivityTracker's actual behavior.
        // For now, if challenge is completed, let challenge reward logic handle coins.
        // The step coins might be reported by ActivityTracker but if we don't show modal here, they aren't "claimed" via this new modal.
    }


    if (activeChallenge) {
      if (challengeCompleted) {
        console.log(`Challenge ${activeChallenge.title} completed!`);
        setCompletedChallengeDetails(activeChallenge); 
        
        const newGiftCardId = await addEarnings(activeChallenge.rewardCoins, `Challenge: ${activeChallenge.title}`, activeChallenge);
        setCurrentUserGiftCardId(newGiftCardId);
        
        setShowChallengeWonModal(true); 
        
        toast({
          title: "Challenge Complete!",
          description: `Awesome! You conquered ${activeChallenge.title} and earned ${activeChallenge.rewardCoins} EcoCoins!`,
        });
      } else { 
        // If challenge was active but not completed, and no step coins to claim via modal (or already handled)
        if (!showStepCoinClaimModal && activitySummary.coinsEarned === 0) {
            toast({
              title: "Challenge Ended",
              description: `You stopped ${activeChallenge.title}. Keep pushing next time!`,
              variant: "default"
            });
        }
      }
    } else { 
      // Generic activity ended, no active challenge
      if (!showStepCoinClaimModal && activitySummary.coinsEarned === 0) {
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
    setCurrentUserGiftCardId(null); 
    setActiveChallenge(null); 
  };

  const handleClaimStepCoins = async (coinsToClaim: number) => {
    if (coinsToClaim > 0) {
      await addEarnings(coinsToClaim, "Activity Step Reward");
      toast({
        title: "Coins Claimed!",
        description: `You earned ${coinsToClaim} EcoCoins from your activity!`,
      });
    }
    setShowStepCoinClaimModal(false);
    setPendingStepCoins(null);
  };

  const handleCloseStepCoinClaimModal = () => {
    setShowStepCoinClaimModal(false);
    setPendingStepCoins(null);
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (activityStartOptions) {
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light justify-center items-center p-4">
        <EcoRunLogo size="large" />
        <h2 className="text-2xl font-semibold text-center my-6">
          Starting: {activityStartOptions.challenge?.title || "New Activity"}
        </h2>
        <p className="text-eco-gray mb-8 text-center">How would you like to track this activity?</p>
        <div className="space-y-4 w-full max-w-xs">
          <Button 
            size="lg" 
            className="w-full bg-eco-accent text-eco-dark hover:bg-eco-accent/90 py-6 text-lg" 
            onClick={() => handleModeSelected('walk')}
          >
            <Footprints size={24} className="mr-3" /> Start Walking
          </Button>
          <Button 
            size="lg" 
            className="w-full bg-eco-purple text-white hover:bg-eco-purple/90 py-6 text-lg" 
            onClick={() => handleModeSelected('run')}
          >
            <Zap size={24} className="mr-3" /> Start Running
          </Button>
        </div>
         <Button 
            variant="ghost" 
            className="mt-8 text-eco-gray hover:text-eco-light"
            onClick={() => {
              setActivityStartOptions(null);
              setActiveChallenge(null); // Also clear active challenge if cancelling
            }}
          >
            Cancel
          </Button>
      </div>
    );
  }

  if (isTracking && selectedActivityMode) {
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
        <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark z-40 shadow-sm">
          <EcoRunLogo size="small" />
          <h1 className="text-xl font-semibold text-eco-light">
            {activeChallenge ? activeChallenge.title : 'Activity Tracker'} ({selectedActivityMode === 'walk' ? 'Walking' : 'Running'})
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-eco-gray hover:text-eco-accent" 
            onClick={() => {
                const challengeGoal = activeChallenge?.stepsGoal;
                const currentSteps = liveProgress?.currentSteps || 0;
                const potentiallyCompleted = activeChallenge && challengeGoal && currentSteps >= challengeGoal;
                // Provide a default for coinsEarned if not available from liveProgress
                const coinsFromTracker = liveProgress && (liveProgress as any).coinsEarned !== undefined ? (liveProgress as any).coinsEarned : 0;
                handleStopTracking(
                    {steps:liveProgress?.currentSteps || 0, elapsedTime:liveProgress?.elapsedTime || 0, calories:0, co2Saved:0, coinsEarned:coinsFromTracker }, 
                    potentiallyCompleted || false
                );
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
            activityMode={selectedActivityMode} // Pass the selected mode
          />
        </main>
        {activeChallenge && liveProgress && (
          <MiniChallengeStatus
            currentSteps={liveProgress.currentSteps}
            goalSteps={liveProgress.goalSteps}
          />
        )}
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

        {/* ... keep existing code for Tabs section ... */}
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

      {/* Replace ActivityRewardCard with StepCoinClaimModal */}
      {pendingStepCoins !== null && pendingStepCoins > 0 && showStepCoinClaimModal && (
        <StepCoinClaimModal
          isOpen={showStepCoinClaimModal}
          onClose={handleCloseStepCoinClaimModal}
          coinsToClaim={pendingStepCoins}
          onClaim={handleClaimStepCoins}
        />
      )}

      {completedChallengeDetails && (
        <ChallengeWonModal
          isOpen={showChallengeWonModal}
          onClose={handleCloseChallengeWonModal}
          challenge={completedChallengeDetails}
          userGiftCardId={currentUserGiftCardId}
        />
      )}
    </div>
  );
};

export default ActivitiesPage;
