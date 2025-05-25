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
import StepCoinClaimModal from '@/components/StepCoinClaimModal';
import MiniChallengeStatus from '@/components/MiniChallengeStatus';
import { supabase } from '@/integrations/supabase/client';

const ActivitiesPage: React.FC = () => {
  console.log('ActivitiesPage: component mounted');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addEcoCoins, assignGiftCardToUser } = useEcoCoins();

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastActivitySummary, setLastActivitySummary] = useState<ActivitySummary | null>(null);
  
  const [showChallengeWonModal, setShowChallengeWonModal] = useState(false);
  const [completedChallengeDetails, setCompletedChallengeDetails] = useState<Challenge | null>(null);
  const [currentUserGiftCardId, setCurrentUserGiftCardId] = useState<string | null>(null);
  
  const [pendingStepCoins, setPendingStepCoins] = useState<number | null>(null);
  const [showStepCoinClaimModal, setShowStepCoinClaimModal] = useState(false);
  
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
        setCurrentUserGiftCardId(null);
        setPendingStepCoins(null); // Reset pending step coins
        setShowStepCoinClaimModal(false);
        setLiveProgress({ currentSteps: 0, goalSteps: challenge.stepsGoal, elapsedTime: 0 });
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
    setCurrentUserGiftCardId(null);
    setPendingStepCoins(null); // Reset pending step coins
    setShowStepCoinClaimModal(false);
    setLiveProgress({ currentSteps: 0, goalSteps: 10000, elapsedTime: 0 });
  };

  const handleStopTracking = async (activitySummary: ActivitySummary, challengeCompleted?: boolean) => {
    console.log('ActivitiesPage: handleStopTracking called with summary:', activitySummary, 'Challenge Completed:', challengeCompleted);
    setIsTracking(false); 
    setLastActivitySummary(activitySummary);
    setLiveProgress(null);

    if (activitySummary.coinsEarned > 0 && !challengeCompleted) {
      setPendingStepCoins(activitySummary.coinsEarned);
      setShowStepCoinClaimModal(true);
    }

    if (activeChallenge) {
      if (challengeCompleted) {
        console.log(`Challenge ${activeChallenge.title} completed!`);
        setCompletedChallengeDetails(activeChallenge); 
        
        await addEcoCoins(activeChallenge.rewardCoins, `Challenge: ${activeChallenge.title}`);
        
        let newGiftCardId: string | null = null;
        if (activeChallenge.giftCardKey) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error("Error getting session for gift card assignment:", sessionError);
            toast({ title: "Error", description: "Could not verify user session to assign gift card.", variant: "destructive" });
          } else if (session?.user) {
            newGiftCardId = await assignGiftCardToUser(activeChallenge, session.user.id);
          } else {
            toast({ title: "Error", description: "User not logged in. Cannot assign gift card.", variant: "destructive" });
          }
        }
        setCurrentUserGiftCardId(newGiftCardId);
        
        setShowChallengeWonModal(true); 
        
        toast({
          title: "Challenge Complete!",
          description: `Awesome! You conquered ${activeChallenge.title} and earned ${activeChallenge.rewardCoins} EcoCoins!`,
        });
      } else { 
        if (!showStepCoinClaimModal && activitySummary.coinsEarned === 0) {
            toast({
              title: "Challenge Ended",
              description: `You stopped ${activeChallenge.title}. Keep pushing next time!`,
              variant: "default"
            });
        }
      }
    } else { 
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
      await addEcoCoins(coinsToClaim, "Activity Step Reward");
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
                const challengeGoal = activeChallenge?.stepsGoal;
                const currentSteps = liveProgress?.currentSteps || 0;
                const potentiallyCompleted = activeChallenge && challengeGoal && currentSteps >= challengeGoal;
                handleStopTracking(
                    {steps:liveProgress?.currentSteps || 0, elapsedTime:liveProgress?.elapsedTime || 0, calories:0, co2Saved:0, coinsEarned:0 }, 
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
