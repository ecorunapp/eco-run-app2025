import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Coins, Clock, Flame, Play, Pause, StopCircle, MapPin, RefreshCw, CheckCircle } from '@/components/icons';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import ActivityRewardCard from './ActivityRewardCard';
import LiveActivityMap from './LiveActivityMap';
import Co2SavedPopup from './Co2SavedPopup';
import type { Challenge as ActiveChallengeType } from '@/types/Challenge';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import { useChallenges } from '@/context/ChallengesContext';
import { toast as sonnerToast } from "sonner";
import ScratchRewardModal from './ScratchRewardModal';
import { useUserProfile } from '@/hooks/useUserProfile'; // Import useUserProfile

export interface ActivitySummary {
  steps: number;
  elapsedTime: number;
  calories: number;
  co2Saved: number;
  coinsEarned: number;
  distanceCovered?: number;
}
interface ActivityTrackerProps {
  onStopTracking: (activitySummary: ActivitySummary) => void;
  activeChallenge?: ActiveChallengeType & {
    status: 'not-started' | 'completed';
  };
}
const GOAL_STEPS = 10000;
const CO2_MILESTONES = [20, 50, 100, 200, 300, 400, 500, 700, 800, 900, 1000];
const AVERAGE_STEP_LENGTH_KM = 0.0007;
// Updated image URL to the newly uploaded one
const NOON_GIFT_CARD_IMAGE_URL = '/lovable-uploads/c812bce0-0038-43c0-b61d-9ca59428b893.png';

const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  onStopTracking,
  activeChallenge
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [steps, setSteps] = useState(0);
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [calories, setCalories] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [showRewardCard, setShowRewardCard] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState(false);

  // CO2 Popup states
  const [showCo2Popup, setShowCo2Popup] = useState(false);
  const [currentCo2Milestone, setCurrentCo2Milestone] = useState<number | null>(null);
  const achievedCo2MilestonesRef = useRef<Set<number>>(new Set());
  
  const { addEarnings: addEcoCoins } = useEcoCoins();
  const { completeChallenge: markChallengeAsCompleted } = useChallenges();
  const { profile } = useUserProfile(); // Fetch user profile

  // State for the scratch reward modal
  const [showScratchModal, setShowScratchModal] = useState(false);
  const [scratchPrizeDetails, setScratchPrizeDetails] = useState<{
    name: string;
    imageUrl: string;
    code: string;
  } | null>(null);
  
  const generateMockGiftCode = () => `NOON${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  const resetTracker = useCallback(() => {
    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setSteps(0);
    setDistanceCovered(0);
    setCalories(0);
    setCo2Saved(0);
    setCoinsEarned(0);
    setActivityCompleted(false);
    setShowRewardCard(false);
    achievedCo2MilestonesRef.current.clear();
    setShowCo2Popup(false);
    setCurrentCo2Milestone(null);
    setShowScratchModal(false); // Reset scratch modal state
    setScratchPrizeDetails(null);
  }, []);
  
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    let stepInterval: NodeJS.Timeout;
    if (isTracking && !isPaused) {
      if (!startTime) {
        setStartTime(new Date());
      }
      timerInterval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
      stepInterval = setInterval(() => {
        setSteps(prevSteps => {
          const newSteps = prevSteps + Math.floor(Math.random() * 10) + 5;
          const newCo2Saved = parseFloat((newSteps * 0.0008).toFixed(2));
          const newDistanceCovered = parseFloat((newSteps * AVERAGE_STEP_LENGTH_KM).toFixed(3));
          setDistanceCovered(newDistanceCovered); // Update distance
          setCalories(Math.floor(newSteps * 0.04));
          setCo2Saved(newCo2Saved);
          // General coins earned, challenge coins are separate
          setCoinsEarned(Math.floor(newSteps / 100));

          // Check for CO2 milestones
          for (const milestone of CO2_MILESTONES) {
            if (newCo2Saved >= milestone && !achievedCo2MilestonesRef.current.has(milestone)) {
              setCurrentCo2Milestone(milestone);
              setShowCo2Popup(true);
              achievedCo2MilestonesRef.current.add(milestone);
              break; // Show one popup at a time
            }
          }
          return newSteps;
        });
      }, 2000);
    }
    return () => {
      clearInterval(timerInterval);
      clearInterval(stepInterval);
    };
  }, [isTracking, isPaused, startTime]);
  
  const handleStart = () => {
    resetTracker();
    setIsTracking(true);
    setIsPaused(false);
    setStartTime(new Date());
  };
  
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      if (elapsedTime === 0 && steps === 0) {
        setStartTime(new Date());
      }
    }
  };
  
  const handleStop = () => {
    if (!isTracking && !startTime && !activityCompleted) return;
    setIsTracking(false);
    setIsPaused(true);
    setActivityCompleted(true);
    let challengeRewardTriggered = false;
    if (activeChallenge && activeChallenge.status === 'not-started') {
      if (distanceCovered >= activeChallenge.distance) {
        addEcoCoins(activeChallenge.reward, `Challenge: ${activeChallenge.title}`);
        markChallengeAsCompleted(activeChallenge.id);
        sonnerToast.success(`+${activeChallenge.reward} EcoCoins!`, {
          description: `For completing ${activeChallenge.title}.`,
          icon: <Coins className="text-yellow-400" />
        });

        setScratchPrizeDetails({
          name: "10 AED Noon Gift Card",
          imageUrl: NOON_GIFT_CARD_IMAGE_URL,
          code: generateMockGiftCode()
        });
        setShowScratchModal(true);
        challengeRewardTriggered = true;
      } else {
        sonnerToast.info("Challenge Incomplete", {
          description: `You didn't quite meet the ${activeChallenge.distance}km goal for ${activeChallenge.title}. Keep trying!`
        });
      }
    }

    if (!challengeRewardTriggered) {
      if (coinsEarned > 0) {
        setShowRewardCard(true);
      } else {
        const finalSummary = {
          steps,
          elapsedTime,
          calories,
          co2Saved,
          coinsEarned,
          distanceCovered
        };
        onStopTracking(finalSummary);
      }
    }
  };
  
  const handleCloseScratchModal = () => {
    setShowScratchModal(false);
    if (coinsEarned > 0) {
      setShowRewardCard(true);
    } else {
      const finalSummary = {
        steps,
        elapsedTime,
        calories,
        co2Saved,
        coinsEarned,
        distanceCovered
      };
      onStopTracking(finalSummary);
    }
  };
  
  const handleCloseReward = () => {
    setShowRewardCard(false);
    const finalSummary = {
      steps,
      elapsedTime,
      calories,
      co2Saved,
      coinsEarned,
      distanceCovered
    };
    onStopTracking(finalSummary);
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const percentage = GOAL_STEPS > 0 ? Math.min(100, steps / GOAL_STEPS * 100) : 0;
  const radialData = [{
    name: 'Steps',
    value: percentage,
    fill: 'url(#activityGradient)'
  }];
  const endAngle = 90 - percentage / 100 * 360;
  const mapboxAccessToken = "pk.eyJ1IjoicGFyaXNhdXJhIiwiYSI6ImNtYXA3eHA1NzBmdHgya3M2YXBqdnhmOHAifQ.kYY2uhGtf6O2HGBDhvamIA";

  return <>
      <div className="flex flex-col items-center space-y-6 p-4 text-foreground animate-fade-in-up bg-slate-900">
        {/* ... keep existing code (activeChallenge Card display) */}
        {activeChallenge && <Card className="w-full max-w-md bg-primary/10 border-primary/20 mb-4">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-primary text-md flex items-center">
                <activeChallenge.icon size={20} className="mr-2" />
                Active Challenge: {activeChallenge.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-primary/80 pb-3">
              Goal: {activeChallenge.distance} km for {activeChallenge.reward} EcoCoins.
              Current: {distanceCovered.toFixed(2)} km
            </CardContent>
          </Card>}

        {/* Circular Progress Display */}
        {/* ... keep existing code (RadialBarChart display) */}
        <div className="relative w-60 h-60 sm:w-72 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={radialData} startAngle={90} endAngle={endAngle}>
              <defs>
                <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
              </defs>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background dataKey="value" angleAxisId={0} fill="hsla(var(--muted) / 0.2)" cornerRadius={10} data={[{
              value: 100
            }]} />
              <RadialBar dataKey="value" angleAxisId={0} cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-extrabold text-foreground">{steps.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Steps</div>
          </div>
        </div>

        {/* CO2 Saved and Coins */}
        {/* ... keep existing code (CO2, Distance, Coins display) */}
        <div className="flex justify-around w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <Leaf size={24} className="text-foreground mb-1" />
            <span className="text-lg font-semibold text-foreground">{co2Saved.toLocaleString()} g</span>
            <span className="text-xs text-muted-foreground">CO₂ Saved</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <MapPin size={24} className="text-foreground mb-1" />
            <span className="text-lg font-semibold text-foreground">{distanceCovered.toFixed(2)} km</span>
            <span className="text-xs text-muted-foreground">Distance</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Coins size={24} className="text-foreground mb-1" />
            <span className="text-lg font-semibold text-foreground">{coinsEarned.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">General Coins</span>
          </div>
        </div>

        {/* Stats Card */}
        {/* ... keep existing code (Activity Stats Card display) */}
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-card-foreground text-lg flex justify-between items-center">
              Activity Stats
              <span className="text-xs text-muted-foreground">Daily Goal: {Math.round(percentage)}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-primary">{steps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Steps</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">{formatTime(elapsedTime)}</p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">{calories.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        {/* ... keep existing code (Control buttons display) */}
        <div className="flex space-x-4 w-full max-w-md">
          {!isTracking && !startTime && !activityCompleted ? <Button onClick={handleStart} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Play size={20} className="mr-2" /> Start Tracking
              </Button> : <>
                  <Button onClick={handlePauseResume} variant="outline" className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-primary-foreground disabled:opacity-50" disabled={activityCompleted}>
                      {isPaused ? <Play size={20} className="mr-2" /> : <Pause size={20} className="mr-2" />}
                      {isPaused ? elapsedTime > 0 ? 'Resume' : 'Start' : 'Pause'}
                  </Button>
                  <Button onClick={handleStart} variant="outline" className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-background">
                      <RefreshCw size={20} className="mr-2" /> Restart
                  </Button>
              </>}
        </div>
         <Button onClick={handleStop} variant="destructive" className="w-full max-w-md mt-2" disabled={activityCompleted && !showRewardCard && !showScratchModal}>
           <StopCircle size={20} className="mr-2" /> Stop & End Activity
         </Button>

        {/* Map Display */}
        {/* ... keep existing code (LiveActivityMap display) */}
        <Card className="w-full max-w-md bg-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-card-foreground text-lg flex items-center">
              <MapPin size={20} className="mr-2 text-primary" /> Live Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(isTracking || startTime) && !activityCompleted ? <LiveActivityMap accessToken={mapboxAccessToken} /> : <div className="h-64 rounded-md flex items-center justify-center p-4 bg-gray-900">
                <p className="text-muted-foreground text-sm">
                  {activityCompleted ? "Activity ended." : "Start tracking to see your live location."}
                </p>
              </div>}
          </CardContent>
        </Card>
      </div>

      {scratchPrizeDetails && <ScratchRewardModal 
        isOpen={showScratchModal} 
        onClose={handleCloseScratchModal} 
        prize={scratchPrizeDetails}
        userName={profile?.full_name || undefined} // Pass user's full name
      />}

      {showRewardCard && <ActivityRewardCard coinsEarned={coinsEarned} onClose={handleCloseReward} />}

      {currentCo2Milestone !== null && <Co2SavedPopup isOpen={showCo2Popup} onClose={() => setShowCo2Popup(false)} co2Saved={currentCo2Milestone} />}
    </>;
};
export default ActivityTracker;
