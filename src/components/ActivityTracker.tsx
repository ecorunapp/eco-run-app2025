import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Coins, Clock, Flame, Play, Pause, StopCircle, MapPin, RefreshCw, Trophy } from '@/components/icons'; // Added Trophy
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import ActivityRewardCard from './ActivityRewardCard'; // This is for general activity, might be different for challenges
import LiveActivityMap from './LiveActivityMap';
import Co2SavedPopup from './Co2SavedPopup';
import { useToast } from "@/hooks/use-toast"; // Added toast

export interface ActivitySummary {
  steps: number;
  elapsedTime: number;
  calories: number;
  co2Saved: number;
  coinsEarned: number;
}
interface ActivityTrackerProps {
  onStopTracking: (activitySummary: ActivitySummary, challengeCompleted?: boolean) => void;
  challengeGoalSteps?: number; // New prop for challenge specific goal
}
const DEFAULT_GOAL_STEPS = 10000; // Default daily goal if no challenge
const CO2_MILESTONES = [20, 50, 100, 200, 300, 400, 500, 700, 800, 900, 1000];
const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  onStopTracking,
  challengeGoalSteps
}) => {
  const {
    toast
  } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // This state is for the generic ActivityRewardCard, not the challenge won modal
  const [showGenericRewardCard, setShowGenericRewardCard] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState(false); // General activity completion, not challenge

  const [showCo2Popup, setShowCo2Popup] = useState(false);
  const [currentCo2Milestone, setCurrentCo2Milestone] = useState<number | null>(null);
  const achievedCo2MilestonesRef = useRef<Set<number>>(new Set());
  const currentGoalSteps = challengeGoalSteps || DEFAULT_GOAL_STEPS;
  const resetTrackerStates = useCallback((keepActivitySettings = false) => {
    if (!keepActivitySettings) {
      // Only reset if not just a pause/resume cycle
      setIsTracking(false);
      setActivityCompleted(false);
      setShowGenericRewardCard(false);
    }
    setIsPaused(false); // Always unpause on reset/start
    setStartTime(null); // Will be set on first tick if tracking starts
    setElapsedTime(0);
    setSteps(0);
    setCalories(0);
    setCo2Saved(0);
    // coinsEarned is usually tied to steps/challenge, so reset too.
    // If it's from a challenge, it will be handled by challenge completion logic.
    setCoinsEarned(0);
    achievedCo2MilestonesRef.current.clear();
    setShowCo2Popup(false);
    setCurrentCo2Milestone(null);
  }, []);

  // Auto-start if challengeGoalSteps is provided (implies it's a challenge)
  useEffect(() => {
    if (challengeGoalSteps && !isTracking && !activityCompleted) {
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeGoalSteps]); // Only run when challengeGoalSteps changes or on initial mount

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined;
    let stepInterval: NodeJS.Timeout | undefined;
    if (isTracking && !isPaused) {
      if (!startTime) {
        setStartTime(new Date()); // Set start time only once when tracking begins
      }
      timerInterval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
      stepInterval = setInterval(() => {
        setSteps(prevSteps => {
          const newSteps = prevSteps + Math.floor(Math.random() * 10) + 5; // Simulate step increase
          const newCo2Saved = parseFloat((newSteps * 0.0008).toFixed(2));
          setCalories(Math.floor(newSteps * 0.04));
          setCo2Saved(newCo2Saved);

          // Coins earned from general steps, not challenge specific reward
          // Challenge reward is handled by parent component (ActivitiesPage)
          setCoinsEarned(Math.floor(newSteps / 100));

          // Check for CO2 milestones
          for (const milestone of CO2_MILESTONES) {
            if (newCo2Saved >= milestone && !achievedCo2MilestonesRef.current.has(milestone)) {
              setCurrentCo2Milestone(milestone);
              setShowCo2Popup(true);
              achievedCo2MilestonesRef.current.add(milestone);
              break;
            }
          }

          // Check for challenge completion
          if (challengeGoalSteps && newSteps >= challengeGoalSteps) {
            // Stop tracking and notify parent that challenge is complete
            // Parent (ActivitiesPage) will handle the reward and modal
            // We don't call handleStop directly here to avoid race conditions with state updates.
            // Instead, we set a flag or the parent can check steps against goal in onStopTracking.
            // For now, let onStopTracking logic in ActivitiesPage handle this.
            // This interval will be cleared by handleStop if called by user or automatically.
            // To make it more robust, we could call a specific challenge complete handler.
            // For now, let's assume handleStop will be called and check completion.
            // If we automatically stop, the user might not see the final stats.
            // Let the user stop, or add an auto-stop feature with a prompt.
            // For now, we'll rely on manual stop and `onStopTracking` in parent checking `challengeCompleted`.
          }
          return newSteps;
        });
      }, 2000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [isTracking, isPaused, startTime, challengeGoalSteps]);
  const handleStart = () => {
    resetTrackerStates();
    setIsTracking(true);
    // startTime will be set in the useEffect when tracking truly starts
  };
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (!isPaused && isTracking) {
      // Resuming
      if (!startTime) {
        // If starting from a paused state where it never truly started
        setStartTime(new Date());
      }
    }
  };
  const handleStop = () => {
    // if (!isTracking && !startTime && !activityCompleted) return; 

    const challengeWasCompleted = !!(challengeGoalSteps && steps >= challengeGoalSteps);
    setIsTracking(false);
    setIsPaused(true); // Effectively stops intervals
    setActivityCompleted(true); // Mark this tracking session as completed

    const summary: ActivitySummary = {
      steps,
      elapsedTime,
      calories,
      co2Saved,
      coinsEarned // This is coins from steps, not the challenge reward itself
    };
    onStopTracking(summary, challengeWasCompleted);

    // If it's not a challenge, or if it is a challenge but it wasn't completed, show generic reward card (if applicable)
    // The parent (ActivitiesPage) will show the ChallengeWonModal if challengeWasCompleted is true.
    if (!challengeGoalSteps && steps > 0) {
      // Only show generic reward for generic activities with some effort
      setShowGenericRewardCard(true);
    } else if (challengeGoalSteps && !challengeWasCompleted && steps > 0) {
      toast({
        title: "Challenge Incomplete",
        description: "You stopped before completing the challenge goal.",
        variant: "default"
      });
    }
  };
  const handleCloseGenericReward = () => {
    setShowGenericRewardCard(false);
    // The parent's onStopTracking has already been called.
    // resetTrackerStates(); // Optionally reset fully here
  };
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const percentage = currentGoalSteps > 0 ? Math.min(100, steps / currentGoalSteps * 100) : 0;
  const radialData = [{
    name: 'Steps',
    value: percentage,
    fill: 'url(#activityGradient)'
  }];

  // Calculate endAngle based on currentGoalSteps. If percentage is 100, endAngle should make a full circle from startAngle.
  // RadialBarChart starts at 90 degrees (top). A positive endAngle moves counter-clockwise.
  // So, to fill clockwise, endAngle should be 90 - (percentage/100 * 360)
  // If percentage is 0, endAngle is 90 (no fill). If 100, endAngle is 90 - 360 = -270, which is equivalent to 90.
  const endAngle = 90 + percentage / 100 * 360; // Corrected for clockwise fill when startAngle=90

  const mapboxAccessToken = "pk.eyJ1IjoicGFyaXNhdXJhIiwiYSI6ImNtYXA3eHA1NzBmdHgya3M2YXBqdnhmOHAifQ.kYY2uhGtf6O2HGBDhvamIA"; // Sensitive data, should be an env var

  return <>
      <div className="flex flex-col items-center space-y-6 p-4 text-foreground animate-fade-in-up bg-slate-900">
        {challengeGoalSteps && <Card className="w-full max-w-md bg-primary/10 border-primary mb-4">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-primary">
                <Trophy size={20} className="mr-2" />
                <p className="font-semibold">Challenge Goal: {challengeGoalSteps.toLocaleString()} steps</p>
              </div>
            </CardContent>
          </Card>}
        {/* Circular Progress Display */}
        <div className="relative w-60 h-60 sm:w-72 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20} data={radialData} startAngle={90} // Start from the top
          endAngle={endAngle} // End angle calculated for clockwise fill
          >
              <defs>
                <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-eco-accent, #00F5D4)" />
                  <stop offset="100%" stopColor="var(--color-eco-purple, #8A4FFF)" />
                </linearGradient>
              </defs>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              {/* Background full circle */}
              <RadialBar background dataKey="value" angleAxisId={0} fill="hsla(var(--muted) / 0.2)" cornerRadius={10} data={[{
              value: 100
            }]} />
              {/* Actual progress */}
              <RadialBar dataKey="value" angleAxisId={0} cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-extrabold text-foreground">{steps.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Steps</div>
          </div>
        </div>

        {/* CO2 Saved and Coins */}
        <div className="flex justify-around w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <Leaf size={24} className="text-green-400 mb-1" />
            <span className="text-lg font-semibold text-foreground">{co2Saved.toLocaleString()} g</span>
            <span className="text-xs text-muted-foreground">CO₂ Saved</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Coins size={24} className="text-yellow-400 mb-1" />
            <span className="text-lg font-semibold text-foreground">{coinsEarned.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">Coins from Steps</span>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="w-full max-w-md bg-slate-900 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-card-foreground text-lg flex justify-between items-center">
              Activity Stats
              <span className="text-xs text-muted-foreground">Goal: {Math.round(percentage)}%</span>
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
        <div className="flex space-x-4 w-full max-w-md">
          {!isTracking && !activityCompleted ?
        // Show Start if not tracking and not completed
        <Button onClick={handleStart} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Play size={20} className="mr-2" /> Start Tracking
              </Button> : isTracking ?
        // Show Pause/Resume if actively tracking
        <Button onClick={handlePauseResume} variant="outline" className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-primary-foreground">
                  {isPaused ? <Play size={20} className="mr-2" /> : <Pause size={20} className="mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
              </Button> : null /* Activity completed or never started, other buttons handle this */}
          
          {/* Restart button always available if tracking has started or completed, but not if it's currently active & unpaused */}
          {(startTime || activityCompleted) && (isPaused || !isTracking) && <Button onClick={handleStart} // Restart is essentially a new start
        variant="outline" className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-background">
                <RefreshCw size={20} className="mr-2" /> Restart
            </Button>}
        </div>
         <Button onClick={handleStop} variant="destructive" className="w-full max-w-md mt-2"
      // Disable if activity is completed and generic reward card is shown (or if no tracking was ever started)
      disabled={!isTracking && !startTime || activityCompleted && showGenericRewardCard}>
           <StopCircle size={20} className="mr-2" /> Stop & End Activity
         </Button>

        {/* Map Display */}
        <Card className="w-full max-w-md bg-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-card-foreground text-lg flex items-center">
              <MapPin size={20} className="mr-2 text-primary" /> Live Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(isTracking || startTime) && !activityCompleted ? <LiveActivityMap accessToken={mapboxAccessToken} /> : <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center p-4">
                <p className="text-muted-foreground text-sm">
                  {activityCompleted ? "Activity ended." : "Start tracking to see your live location."}
                </p>
              </div>}
          </CardContent>
        </Card>
      </div>

      {showGenericRewardCard && !challengeGoalSteps &&
    // Only show generic reward if not a challenge
    <ActivityRewardCard coinsEarned={coinsEarned} // coins from steps
    onClose={handleCloseGenericReward} />}

      {currentCo2Milestone !== null && <Co2SavedPopup isOpen={showCo2Popup} onClose={() => setShowCo2Popup(false)} co2Saved={currentCo2Milestone} />}
    </>;
};
export default ActivityTracker;
