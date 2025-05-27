import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Keep Card for challenge goal
import { Trophy } from '@/components/icons';
import Co2SavedPopup from './Co2SavedPopup';
import { useToast } from "@/hooks/use-toast";
import WalkModeDisplay from './WalkModeDisplay';
import RunModeDisplay from './RunModeDisplay';

export interface ActivitySummary {
  steps: number;
  elapsedTime: number;
  calories: number;
  co2Saved: number;
  coinsEarned: number;
  distanceKm?: number; // Added for run mode summary
  avgPaceMinPerKm?: string; // Added for run mode summary
}

export interface LiveProgressData {
  currentSteps: number;
  goalSteps: number;
  elapsedTime: number;
  // Potentially add run-specific live data if needed by MiniChallengeStatus for running
}

interface ActivityTrackerProps {
  onStopTracking: (activitySummary: ActivitySummary, challengeCompleted?: boolean) => void;
  challengeGoalSteps?: number;
  onLiveProgressUpdate?: (progress: LiveProgressData) => void;
  activityMode: 'walk' | 'run'; // New prop
}
const DEFAULT_GOAL_STEPS = 10000;
const CO2_MILESTONES = [20, 50, 100, 200, 300, 400, 500, 700, 800, 900, 1000];
const METERS_PER_WALKING_STEP = 0.762; // Average for walking
const METERS_PER_RUNNING_STEP = 1.2;   // Simplified average for running

const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  onStopTracking,
  challengeGoalSteps,
  onLiveProgressUpdate,
  activityMode,
}) => {
  const { toast } = useToast(); // Keep toast if it's used by this component, or remove if fully handled by ActivitiesPage
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Run mode specific state
  const [distanceDisplay, setDistanceDisplay] = useState("0.00"); // km
  const [avgPaceDisplay, setAvgPaceDisplay] = useState("00:00"); // min/km
  const [currentDistanceKm, setCurrentDistanceKm] = useState(0);


  const [activityCompleted, setActivityCompleted] = useState(false);

  const [showCo2Popup, setShowCo2Popup] = useState(false);
  const [currentCo2Milestone, setCurrentCo2Milestone] = useState<number | null>(null);
  const achievedCo2MilestonesRef = useRef<Set<number>>(new Set());
  const currentGoalSteps = challengeGoalSteps || DEFAULT_GOAL_STEPS;

  const resetTrackerStates = useCallback((keepActivitySettings = false) => {
    if (!keepActivitySettings) {
      setIsTracking(false);
      setActivityCompleted(false);
    }
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setSteps(0);
    setCalories(0);
    setCo2Saved(0);
    setCoinsEarned(0);
    setDistanceDisplay("0.00");
    setAvgPaceDisplay("00:00");
    setCurrentDistanceKm(0);
    achievedCo2MilestonesRef.current.clear();
    setShowCo2Popup(false);
    setCurrentCo2Milestone(null);
    if (onLiveProgressUpdate) {
      onLiveProgressUpdate({ currentSteps: 0, goalSteps: currentGoalSteps, elapsedTime: 0 });
    }
  }, [onLiveProgressUpdate, currentGoalSteps]);

  // Auto-start tracking when component mounts if mode is set (e.g. via challenge)
   useEffect(() => {
    // This auto-start logic should ideally be tied to isTracking prop from parent,
    // or a specific prop like `startImmediately`.
    // For now, if activityMode is present, we assume parent wants to start.
    // The parent (ActivitiesPage) now controls `isTracking` via mode selection.
    // This effect might need adjustment based on how `ActivitiesPage` sets `isTracking`.
    // Let's simplify: if `isTracking` is true (controlled by parent), then start internal logic.
    // The initial `handleStart` call logic is moved to parent `ActivitiesPage` `handleModeSelected`.
    // This component just reacts to `isTracking` prop.
    
    // If parent set isTracking to true, and we are not internally tracking, start.
    // This is tricky. Let's manage `isTracking` purely internally for the step/timer intervals.
    // The `handleStart` is now the primary way to begin.
    // Let's call handleStart if component mounts with challengeGoalSteps and not already tracking.
    // This means `ActivitiesPage` should set `isTracking` true when it calls this component.
    // The logic below for `handleStart` effectively sets `isTracking` to true here.
    // Let's assume this component is only rendered when tracking should actually begin.
    if (!isTracking && !activityCompleted) { // if not already tracking and not completed
       handleStart(); // Start internal tracking
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount to initiate tracking if conditions are met

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined;
    let stepInterval: NodeJS.Timeout | undefined;

    if (isTracking && !isPaused && !activityCompleted) {
      if (!startTime) {
        setStartTime(new Date());
      }
      timerInterval = setInterval(() => {
        setElapsedTime(prevTime => {
          const newTime = prevTime + 1;
          if (onLiveProgressUpdate) {
            onLiveProgressUpdate({ currentSteps: steps, goalSteps: currentGoalSteps, elapsedTime: newTime });
          }
          // Update avgPaceDisplay for run mode as time changes
          if (activityMode === 'run' && currentDistanceKm > 0 && newTime > 0) {
            const paceDecimal = (newTime / 60) / currentDistanceKm;
            const paceMinutes = Math.floor(paceDecimal);
            const paceSeconds = Math.round((paceDecimal - paceMinutes) * 60);
            setAvgPaceDisplay(`${String(paceMinutes).padStart(2, '0')}:${String(paceSeconds).padStart(2, '0')}`);
          }
          return newTime;
        });
      }, 1000);

      stepInterval = setInterval(() => {
        setSteps(prevSteps => {
          if (activityCompleted) { 
            clearInterval(stepInterval);
            return prevSteps;
          }

          const stepsToAdd = Math.random() < 0.6 ? (activityMode === 'run' ? 2 : 1) : (activityMode === 'run' ? 3 : 2); // Slightly more steps for running
          const newSteps = prevSteps + stepsToAdd;
          
          const metersPerStep = activityMode === 'run' ? METERS_PER_RUNNING_STEP : METERS_PER_WALKING_STEP;
          const newDistanceKm = parseFloat((newSteps * metersPerStep / 1000).toFixed(2));
          setCurrentDistanceKm(newDistanceKm);

          if (activityMode === 'run') {
            setDistanceDisplay(newDistanceKm.toFixed(2));
            if (newDistanceKm > 0 && elapsedTime > 0) { // elapsedTime from state
              const paceDecimal = (elapsedTime / 60) / newDistanceKm;
              const paceMinutes = Math.floor(paceDecimal);
              const paceSeconds = Math.round((paceDecimal - paceMinutes) * 60);
              setAvgPaceDisplay(`${String(paceMinutes).padStart(2, '0')}:${String(paceSeconds).padStart(2, '0')}`);
            } else {
              setAvgPaceDisplay("00:00");
            }
          }
          
          const newCo2Saved = parseFloat((newSteps * 0.0008).toFixed(2)); // CO2 calc can be refined per mode
          setCalories(Math.floor(newSteps * (activityMode === 'run' ? 0.05 : 0.04))); // Slightly more calories for running
          setCo2Saved(newCo2Saved);
          setCoinsEarned(Math.floor(newSteps / (activityMode === 'run' ? 80 : 100))); // Earn coins faster for running

          if (onLiveProgressUpdate) {
            onLiveProgressUpdate({ currentSteps: newSteps, goalSteps: currentGoalSteps, elapsedTime: elapsedTime });
          }

          for (const milestone of CO2_MILESTONES) {
            if (newCo2Saved >= milestone && !achievedCo2MilestonesRef.current.has(milestone)) {
              setCurrentCo2Milestone(milestone);
              setShowCo2Popup(true);
              achievedCo2MilestonesRef.current.add(milestone);
              break;
            }
          }
          return newSteps;
        });
      }, activityMode === 'run' ? 300 : 400); // Faster step interval for running
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [isTracking, isPaused, startTime, onLiveProgressUpdate, currentGoalSteps, steps, elapsedTime, activityCompleted, activityMode, currentDistanceKm]);

  const handleStart = useCallback(() => {
    resetTrackerStates(); // Reset all states
    setIsTracking(true);   // Set internal tracking to true
    setActivityCompleted(false); // Ensure activity not marked as completed
    if (onLiveProgressUpdate) {
      onLiveProgressUpdate({ currentSteps: 0, goalSteps: currentGoalSteps, elapsedTime: 0 });
    }
  }, [resetTrackerStates, onLiveProgressUpdate, currentGoalSteps]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    if (!isPaused && isTracking) { // Resuming
      if (!startTime) { // If activity was paused right at the start
        setStartTime(new Date());
      }
    }
  };

  const handleStop = useCallback(() => {
    const challengeWasCompleted = !!(challengeGoalSteps && steps >= challengeGoalSteps);
    setIsTracking(false);
    setIsPaused(true); 
    setActivityCompleted(true);

    const summary: ActivitySummary = {
      steps,
      elapsedTime,
      calories,
      co2Saved,
      coinsEarned,
      ...(activityMode === 'run' && { distanceKm: currentDistanceKm, avgPaceMinPerKm: avgPaceDisplay })
    };
    onStopTracking(summary, challengeWasCompleted);
    
    if (onLiveProgressUpdate) {
      onLiveProgressUpdate({ currentSteps: steps, goalSteps: currentGoalSteps, elapsedTime: elapsedTime });
    }
  }, [onStopTracking, challengeGoalSteps, steps, elapsedTime, calories, co2Saved, coinsEarned, activityMode, currentDistanceKm, avgPaceDisplay, onLiveProgressUpdate, currentGoalSteps]);

  useEffect(() => {
    if (isTracking && !isPaused && !activityCompleted && challengeGoalSteps && steps >= challengeGoalSteps) {
      handleStop(); // Auto-stop if goal met
    }
  }, [isTracking, isPaused, activityCompleted, challengeGoalSteps, steps, handleStop]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const mapboxAccessToken = "pk.eyJ1IjoicGFyaXNhdXJhIiwiYSI6ImNtYXA3eHA1NzBmdHgya3M2YXBqdnhmOHAifQ.kYY2uhGtf6O2HGBDhvamIA"; // Replace with your actual token or env var

  return (
    <>
      {challengeGoalSteps && (
        <Card className="w-full max-w-md bg-primary/10 border-primary mb-4 mx-auto mt-4">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center text-primary">
              <Trophy size={20} className="mr-2" />
              <p className="font-semibold">Challenge Goal: {challengeGoalSteps.toLocaleString()} {activityMode === 'walk' ? 'steps' : 'steps (approx)'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activityMode === 'walk' ? (
        <WalkModeDisplay
          steps={steps}
          elapsedTime={elapsedTime}
          calories={calories}
          co2Saved={co2Saved}
          coinsEarned={coinsEarned}
          currentGoalSteps={currentGoalSteps}
          isPaused={isPaused}
          activityCompleted={activityCompleted}
          startTime={startTime}
          mapboxAccessToken={mapboxAccessToken}
          formatTime={formatTime}
          handlePauseResume={handlePauseResume}
          handleStop={handleStop}
          handleStart={handleStart}
        />
      ) : ( // activityMode === 'run'
        <RunModeDisplay
          elapsedTime={elapsedTime}
          calories={calories}
          co2Saved={co2Saved}
          coinsEarned={coinsEarned}
          isPaused={isPaused}
          activityCompleted={activityCompleted}
          startTime={startTime}
          mapboxAccessToken={mapboxAccessToken}
          formatTime={formatTime}
          handlePauseResume={handlePauseResume}
          handleStop={handleStop}
          handleStart={handleStart}
          distanceDisplay={distanceDisplay}
          avgPaceDisplay={avgPaceDisplay}
        />
      )}

      {currentCo2Milestone !== null && <Co2SavedPopup isOpen={showCo2Popup} onClose={() => setShowCo2Popup(false)} co2Saved={currentCo2Milestone} />}
    </>
  );
};
export default ActivityTracker;
