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
import { useChallengeProgress, UserChallengeProgress } from '@/hooks/useChallengeProgress';
import MotivationalMessageCard from '@/components/MotivationalMessageCard';
import { AnimatePresence } from 'framer-motion';

const motivationalMessages = [
  "Every step you take is a step towards a healthier you. Keep going!",
  "The only bad workout is the one that didn't happen. Lace up those shoes!",
  "Push yourself, because no one else is going to do it for you. You've got this!",
  "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
  "Today's actions are tomorrow's results. Make today count!",
  "Don't limit your challenges. Challenge your limits. Let's run!",
  "The journey of a thousand miles begins with a single step. Take it now!",
  "Sweat is just fat crying. Make it pour!",
  "Wake up with determination. Go to bed with satisfaction. Your activity today matters!"
];

const ActivitiesPage: React.FC = () => {
  console.log('ActivitiesPage: component mounted');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addEarnings } = useEcoCoins();
  const { upsertProgress, getProgressByChallengeId } = useChallengeProgress();

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastActivitySummary, setLastActivitySummary] = useState<ActivitySummary | null>(null);
  
  const [showChallengeWonModal, setShowChallengeWonModal] = useState(false);
  const [completedChallengeDetails, setCompletedChallengeDetails] = useState<Challenge | null>(null);
  const [currentUserGiftCardId, setCurrentUserGiftCardId] = useState<string | null>(null);
  
  const [pendingStepCoins, setPendingStepCoins] = useState<number | null>(null);
  const [showStepCoinClaimModal, setShowStepCoinClaimModal] = useState(false);
  
  const [liveProgress, setLiveProgress] = useState<LiveProgressData | null>(null);

  const [activityStartOptions, setActivityStartOptions] = useState<{ challenge: Challenge | null, isGeneric: boolean, resume?: boolean, initialSteps?: number } | null>(null);
  const [selectedActivityMode, setSelectedActivityMode] = useState<'walk' | 'run' | null>(null);

  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [showDailyMessage, setShowDailyMessage] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastDismissedDate = localStorage.getItem('motivationDismissedDate');

    if (lastDismissedDate !== todayStr) {
      const today = new Date();
      // Simple way to get a "day index" to pick a message.
      // Using day of year ensures it changes daily.
      const startOfYear = new Date(today.getFullYear(), 0, 0);
      const diff = today.getTime() - startOfYear.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      const messageIndex = dayOfYear % motivationalMessages.length;
      setDailyMessage(motivationalMessages[messageIndex]);
      setShowDailyMessage(true);
    } else {
      setShowDailyMessage(false);
    }
  }, []);

  const handleDismissMotivationalMessage = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('motivationDismissedDate', todayStr);
    setShowDailyMessage(false);
  };

  useEffect(() => {
    if (location.state && location.state.challengeId && !activityStartOptions && !isTracking) {
      const challengeId = location.state.challengeId as string;
      const shouldResume = location.state.resume as boolean | undefined;
      
      const challenge = getChallengeById(challengeId);
      if (challenge) {
        setActiveChallenge(challenge);
        
        let stepsForResume = 0;
        if (shouldResume) {
          const existingProgress = getProgressByChallengeId(challengeId);
          if (existingProgress && existingProgress.status === 'paused' && existingProgress.current_steps) {
            stepsForResume = existingProgress.current_steps;
          }
        }

        setActivityStartOptions({ 
          challenge, 
          isGeneric: false, 
          resume: shouldResume,
          initialSteps: stepsForResume 
        });
        setLastActivitySummary(null);
        setShowChallengeWonModal(false);
        setCompletedChallengeDetails(null);
        setCurrentUserGiftCardId(null);
        setPendingStepCoins(null);
        setShowStepCoinClaimModal(false);
        navigate(location.pathname, { replace: true, state: {} }); 
        toast({
          title: shouldResume ? "Resuming Challenge!" : "Challenge Ready!",
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
  }, [location.state, navigate, toast, activityStartOptions, isTracking, getProgressByChallengeId]);

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

  const handleModeSelected = async (mode: 'walk' | 'run') => {
    setSelectedActivityMode(mode);
    
    let initialStepsForTracking = activityStartOptions?.initialSteps || 0;
    const currentChallenge = activityStartOptions?.challenge;
    setActiveChallenge(currentChallenge); // Ensure activeChallenge is set here

    if (currentChallenge) {
      const existingProgress = getProgressByChallengeId(currentChallenge.id);
      if (activityStartOptions?.resume && existingProgress?.status === 'paused' && typeof existingProgress.current_steps === 'number') {
        initialStepsForTracking = existingProgress.current_steps;
      }
      
      try {
        await upsertProgress({
          challenge_id: currentChallenge.id,
          status: 'active',
          current_steps: initialStepsForTracking, 
        });
        console.log(`ActivityPage: Challenge ${currentChallenge.id} status set to active with ${initialStepsForTracking} steps.`);
      } catch (error) {
        console.error("Failed to update challenge progress to active:", error);
        toast({ title: "Error", description: "Could not start challenge tracking.", variant: "destructive" });
        setIsTracking(false); // Prevent tracking from starting if DB update fails
        setSelectedActivityMode(null);
        setActivityStartOptions(null);
        setActiveChallenge(null);
        return;
      }
    }
    
    const goalSteps = currentChallenge?.stepsGoal || 10000; 
    setLiveProgress({ currentSteps: initialStepsForTracking, goalSteps, elapsedTime: 0 });
    
    setIsTracking(true); // Set isTracking to true only after successful setup
    setActivityStartOptions(null); 
  };

  const handleStopTracking = async (activitySummary: ActivitySummary, challengeCompleted?: boolean) => {
    console.log('ActivitiesPage: handleStopTracking called with summary:', activitySummary, 'Challenge Completed:', challengeCompleted);
    setIsTracking(false); 
    setSelectedActivityMode(null); 
    setLastActivitySummary(activitySummary);
    setLiveProgress(null); // Clear live progress when tracking stops

    const totalStepsForChallenge = activitySummary.steps; 
    const kilometersCovered = parseFloat((totalStepsForChallenge * 0.000762).toFixed(2));

    if (activeChallenge) {
      try {
        if (challengeCompleted) {
          console.log(`Challenge ${activeChallenge.title} completed!`);
          await upsertProgress({
            challenge_id: activeChallenge.id,
            status: 'completed',
            current_steps: totalStepsForChallenge,
            kilometers_covered_at_pause: kilometersCovered, 
          });
          setCompletedChallengeDetails(activeChallenge); 
          const newGiftCardId = await addEarnings(activeChallenge.rewardCoins, `Challenge: ${activeChallenge.title}`, activeChallenge);
          setCurrentUserGiftCardId(newGiftCardId);
          setShowChallengeWonModal(true); 
          toast({
            title: "Challenge Complete!",
            description: `Awesome! You conquered ${activeChallenge.title} and earned ${activeChallenge.rewardCoins} EcoCoins!`,
          });
        } else { 
          await upsertProgress({
            challenge_id: activeChallenge.id,
            status: 'paused',
            current_steps: totalStepsForChallenge,
            kilometers_covered_at_pause: kilometersCovered,
            paused_location_name: "Paused Activity", 
          });
          toast({
            title: "Challenge Paused",
            description: `${activeChallenge.title} has been paused. You can resume it later.`,
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Failed to update challenge progress:", error);
        toast({ title: "Error", description: "Could not save challenge progress.", variant: "destructive" });
      }
    }

    if (activitySummary.coinsEarned > 0 && !challengeCompleted) { 
      setPendingStepCoins(activitySummary.coinsEarned);
      setShowStepCoinClaimModal(true);
    } else if (activitySummary.coinsEarned > 0 && challengeCompleted && activeChallenge) {
      // Handled by challenge reward
    }

    if (!activeChallenge || (activeChallenge && !challengeCompleted && !showStepCoinClaimModal && activitySummary.coinsEarned === 0)) {
        if (activitySummary.steps > 0 && !activeChallenge) { 
          toast({
            title: "Activity Ended",
            description: "Great effort! Keep going to earn EcoCoins.",
            variant: "default"
          });
        } else if (activitySummary.steps === 0 && !activitySummary.elapsedTime && !activeChallenge) {
          // No toast
        } else if (activitySummary.steps === 0 && activitySummary.elapsedTime > 0 && !activeChallenge) {
           toast({
            title: "Tracking Stopped",
            description: "Ready when you are for the next activity!",
            variant: "default"
          });
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
          {activityStartOptions.resume ? "Resuming: " : "Starting: "} 
          {activityStartOptions.challenge?.title || "New Activity"}
        </h2>
        {activityStartOptions.resume && activityStartOptions.initialSteps && activityStartOptions.challenge && (
          <p className="text-eco-gray mb-2 text-center">
            Resuming from {activityStartOptions.initialSteps.toLocaleString()} / {activityStartOptions.challenge.stepsGoal.toLocaleString()} steps.
          </p>
        )}
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
              setActiveChallenge(null); 
            }}
          >
            Cancel
          </Button>
      </div>
    );
  }

  if (isTracking && selectedActivityMode) {
    const initialStepsForTracker = liveProgress?.currentSteps || 0;

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
            onClick={async () => { 
                const challengeGoal = activeChallenge?.stepsGoal;
                const currentTotalSteps = liveProgress?.currentSteps || 0; 
                const potentiallyCompleted = activeChallenge && challengeGoal && currentTotalSteps >= challengeGoal;
                
                const coinsFromTracker = 0; 
                
                if (activeChallenge && !potentiallyCompleted) {
                    try {
                        const kilometers = parseFloat((currentTotalSteps * 0.000762).toFixed(2));
                        await upsertProgress({
                            challenge_id: activeChallenge.id,
                            status: 'paused', 
                            current_steps: currentTotalSteps,
                            kilometers_covered_at_pause: kilometers,
                            paused_location_name: "Paused via X button", 
                        });
                        console.log("Challenge progress saved as paused via X button click.");
                    } catch (error) {
                        console.error("Failed to save paused state on X click:", error);
                        toast({ title: "Error", description: "Could not save pause state.", variant: "destructive" });
                    }
                }
                handleStopTracking(
                    {steps:currentTotalSteps, elapsedTime:liveProgress?.elapsedTime || 0, calories:0, co2Saved:0, coinsEarned:coinsFromTracker }, 
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
            activityMode={selectedActivityMode}
            initialSteps={initialStepsForTracker} 
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
      
      <AnimatePresence>
        {showDailyMessage && dailyMessage && (
          <MotivationalMessageCard 
            message={dailyMessage} 
            onDismiss={handleDismissMotivationalMessage} 
          />
        )}
      </AnimatePresence>

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
