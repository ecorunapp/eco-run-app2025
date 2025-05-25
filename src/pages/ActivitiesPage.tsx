
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import BottomNav from '@/components/BottomNav'; // Now part of child views
// import EcoRunLogo from '@/components/EcoRunLogo'; // Now part of child views
// import { Button } from '@/components/ui/button'; // Potentially unused here directly
// import { Settings, Play, X } from '@/components/icons'; // Now part of child views
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Now part of child views
// import WeeklyActivityChart from '@/components/WeeklyActivityChart'; // Now part of ActivityDashboardView
import { ActivitySummary, LiveProgressData } from '@/components/ActivityTracker';
// import LastActivityGraph from '@/components/LastActivityGraph'; // Now part of ActivityDashboardView
import { useToast } from "@/hooks/use-toast";
import { Challenge, getChallengeById } from '@/data/challenges';
import ChallengeWonModal from '@/components/ChallengeWonModal';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import StepCoinClaimModal from '@/components/StepCoinClaimModal';
// import MiniChallengeStatus from '@/components/MiniChallengeStatus'; // Now part of ActivityTrackingView
import { supabase } from '@/integrations/supabase/client';

import ActivityTrackingView from '@/components/activities/ActivityTrackingView';
import ActivityDashboardView from '@/components/activities/ActivityDashboardView';

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
        setPendingStepCoins(null);
        setShowStepCoinClaimModal(false);
        setLiveProgress({ currentSteps: 0, goalSteps: challenge.stepsGoal, elapsedTime: 0 });
        navigate(location.pathname, { replace: true, state: {} }); // Clear location state
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
    setPendingStepCoins(null);
    setShowStepCoinClaimModal(false);
    setLiveProgress({ currentSteps: 0, goalSteps: 10000, elapsedTime: 0 }); // Default goal for generic activity
  };

  const handleStopTracking = async (activitySummary: ActivitySummary, challengeCompletedDuringActivity?: boolean) => {
    console.log('ActivitiesPage: handleStopTracking called with summary:', activitySummary, 'Challenge Completed During Activity:', challengeCompletedDuringActivity);
    setIsTracking(false); 
    setLastActivitySummary(activitySummary);
    setLiveProgress(null); // Clear live progress

    // Check if this stop completes an active challenge based on summary steps
    const challengeWasActuallyCompleted = activeChallenge && activeChallenge.stepsGoal && activitySummary.steps >= activeChallenge.stepsGoal;
    // Use challengeCompletedDuringActivity if provided (e.g. from X button), otherwise use challengeWasActuallyCompleted
    const finalChallengeCompletedStatus = challengeCompletedDuringActivity !== undefined ? challengeCompletedDuringActivity : challengeWasActuallyCompleted;


    if (activitySummary.coinsEarned > 0 && !finalChallengeCompletedStatus && !activeChallenge) { // Only show step coin modal for generic activities, or if challenge wasn't completed
      setPendingStepCoins(activitySummary.coinsEarned);
      setShowStepCoinClaimModal(true);
    }

    if (activeChallenge) {
      if (finalChallengeCompletedStatus) {
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
        // Challenge was active but not completed
        if (!showStepCoinClaimModal && activitySummary.coinsEarned === 0 && activitySummary.steps > 0) { // Only show this if no other modal is shown
            toast({
              title: "Challenge Ended",
              description: `You stopped ${activeChallenge.title}. Keep pushing next time!`,
              variant: "default"
            });
        } else if (activitySummary.coinsEarned > 0){ // Challenge not completed, but individual step coins earned
            setPendingStepCoins(activitySummary.coinsEarned);
            setShowStepCoinClaimModal(true);
        }
      }
    } else { // No active challenge (generic activity)
      if (!showStepCoinClaimModal && activitySummary.coinsEarned === 0) { // only show if step coin modal isn't triggered
        if (activitySummary.steps > 0) {
          toast({
            title: "Activity Ended",
            description: "Great effort! Keep going to earn EcoCoins.",
            variant: "default"
          });
        } else if (activitySummary.steps === 0 && !activitySummary.elapsedTime) {
          // No toast for immediate stop with no activity
        } else if (activitySummary.steps === 0 && activitySummary.elapsedTime > 0) {
           toast({
            title: "Tracking Stopped",
            description: "Ready when you are for the next activity!",
            variant: "default"
          });
        }
      }
    }
    // setActiveChallenge(null); // Reset active challenge after processing stop, regardless of completion for challenges
    // This was causing issues if a challenge was stopped but not completed, then starting generic activity immediately.
    // Let's only reset activeChallenge if it was completed or explicitly reset elsewhere (e.g., when starting a new one).
    // Or, when ChallengeWonModal is closed.
  };
  
  const handleLiveProgressUpdate = useCallback((progress: LiveProgressData) => {
    setLiveProgress(progress);
  }, []);

  const handleCloseChallengeWonModal = () => {
    setShowChallengeWonModal(false);
    setCompletedChallengeDetails(null); 
    setCurrentUserGiftCardId(null); 
    setActiveChallenge(null); // Reset active challenge when modal is closed
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
    setActiveChallenge(null); // Reset active challenge if any, after step coins are claimed/modal closed
  };

  const handleCloseStepCoinClaimModal = () => {
    setShowStepCoinClaimModal(false);
    setPendingStepCoins(null);
    setActiveChallenge(null); // Reset active challenge if any, when step coin modal is simply closed
  };
  
  // Removed formatTime as it's no longer directly used in this component's JSX

  if (isTracking) {
    return (
      <ActivityTrackingView
        activeChallenge={activeChallenge}
        liveProgress={liveProgress}
        onStopTracking={handleStopTracking}
        onLiveProgressUpdate={handleLiveProgressUpdate}
      />
    );
  }

  return (
    <>
      <ActivityDashboardView
        lastActivitySummary={lastActivitySummary}
        onStartGenericActivity={handleStartGenericActivity}
      />

      {/* Modals remain here, managed by the main ActivitiesPage component */}
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
    </>
  );
};

export default ActivitiesPage;
