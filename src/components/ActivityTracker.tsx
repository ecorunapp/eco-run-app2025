import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Coins, Clock, Flame, Play, Pause, StopCircle, MapPin, RefreshCw } from '@/components/icons';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ActivitySummary {
  steps: number;
  elapsedTime: number;
  calories: number;
  co2Saved: number;
  coinsEarned: number;
}

interface ActivityTrackerProps {
  onStopTracking: (activitySummary: ActivitySummary) => void;
}

const GOAL_STEPS = 10000; // Example daily goal

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ onStopTracking }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const resetTracker = useCallback(() => {
    setIsTracking(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setSteps(0);
    setCalories(0);
    setCo2Saved(0);
    setCoinsEarned(0);
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
          const newSteps = prevSteps + Math.floor(Math.random() * 10) + 5; // Simulate steps more actively
          setCalories(Math.floor(newSteps * 0.04)); // Approximate calories
          setCo2Saved(parseFloat((newSteps * 0.0008).toFixed(2))); 
          setCoinsEarned(Math.floor(newSteps / 100)); // 1 coin per 100 steps
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
        if(elapsedTime === 0 && steps === 0) { 
            setStartTime(new Date());
        }
    }
  };

  const handleStop = () => {
    setIsTracking(false);
    setIsPaused(true); 
    onStopTracking({ steps, elapsedTime, calories, co2Saved, coinsEarned });
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const percentage = GOAL_STEPS > 0 ? Math.min(100, (steps / GOAL_STEPS) * 100) : 0;
  const radialData = [{ name: 'Steps', value: percentage, fill: 'url(#activityGradient)' }];
  const endAngle = 90 - (percentage / 100) * 360;

  return (
    <div className="flex flex-col items-center space-y-6 p-4 bg-eco-dark text-eco-light animate-fade-in-up">
      {/* Circular Progress Display */}
      <div className="relative w-60 h-60 sm:w-72 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="70%" outerRadius="100%"
            barSize={20} data={radialData}
            startAngle={90} endAngle={endAngle}
          >
            <defs>
              <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-eco-accent, #00F5D4)" />
                <stop offset="100%" stopColor="var(--color-eco-purple, #8A4FFF)" />
              </linearGradient>
            </defs>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background dataKey="value" angleAxisId={0} fill="hsla(var(--muted) / 0.2)" cornerRadius={10} data={[{ value: 100 }]} />
            <RadialBar dataKey="value" angleAxisId={0} cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-extrabold text-eco-light">{steps.toLocaleString()}</div>
          <div className="text-sm text-eco-gray">Steps</div>
        </div>
      </div>

      {/* CO2 Saved and Coins */}
      <div className="flex justify-around w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Leaf size={24} className="text-green-400 mb-1" />
          <span className="text-lg font-semibold">{co2Saved.toLocaleString()} g</span>
          <span className="text-xs text-eco-gray">CO₂ Saved</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Coins size={24} className="text-yellow-400 mb-1" />
          <span className="text-lg font-semibold">{coinsEarned.toLocaleString()}</span>
          <span className="text-xs text-eco-gray">Coins</span>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="w-full max-w-md bg-eco-dark-secondary border-eco-gray/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-eco-light text-lg flex justify-between items-center">
            Activity Stats
            <span className="text-xs text-eco-gray">Daily Goal: {Math.round(percentage)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-eco-accent">{steps.toLocaleString()}</p>
            <p className="text-xs text-eco-gray">Steps</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-eco-accent">{formatTime(elapsedTime)}</p>
            <p className="text-xs text-eco-gray">Time</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-eco-accent">{calories.toLocaleString()}</p>
            <p className="text-xs text-eco-gray">Calories</p>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex space-x-4 w-full max-w-md">
        {!isTracking && !startTime ? ( // Initial state, or after stop and reset
            <Button onClick={handleStart} className="flex-1 bg-eco-accent text-eco-dark hover:bg-eco-accent/90">
                <Play size={20} className="mr-2" /> Start Tracking
            </Button>
        ) : (
            <>
                <Button onClick={handlePauseResume} variant="outline" className="flex-1 border-eco-pink text-eco-pink hover:bg-eco-pink hover:text-eco-dark">
                    {isPaused ? <Play size={20} className="mr-2" /> : <Pause size={20} className="mr-2" />}
                    {isPaused ? (elapsedTime > 0 ? 'Resume' : 'Start') : 'Pause'}
                </Button>
                <Button onClick={handleStart} variant="outline" className="flex-1 border-eco-gray text-eco-gray hover:bg-eco-gray hover:text-eco-dark">
                    <RefreshCw size={20} className="mr-2" /> Restart
                </Button>
            </>
        )}
      </div>
       <Button onClick={handleStop} variant="destructive" className="w-full max-w-md bg-red-500 hover:bg-red-600 text-white mt-2">
         <StopCircle size={20} className="mr-2" /> Stop & End Activity
       </Button>


      {/* Map Placeholder */}
      <Card className="w-full max-w-md bg-eco-dark-secondary border-eco-gray/20 mt-4">
        <CardHeader>
          <CardTitle className="text-eco-light text-lg flex items-center">
            <MapPin size={20} className="mr-2 text-eco-accent" /> Current Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-eco-gray/10 rounded-md flex items-center justify-center">
            <p className="text-eco-gray text-sm">Map preview will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityTracker;
