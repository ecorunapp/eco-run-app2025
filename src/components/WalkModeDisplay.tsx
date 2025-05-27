
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Coins, Play, Pause, RefreshCw, MapPin, StopCircle } from '@/components/icons';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import LiveActivityMap from './LiveActivityMap';

interface WalkModeDisplayProps {
  steps: number;
  elapsedTime: number;
  calories: number;
  co2Saved: number;
  coinsEarned: number;
  currentGoalSteps: number;
  isPaused: boolean;
  activityCompleted: boolean;
  startTime: Date | null;
  mapboxAccessToken: string;
  formatTime: (totalSeconds: number) => string;
  handlePauseResume: () => void;
  handleStop: () => void;
  handleStart: () => void; // For restart
}

const WalkModeDisplay: React.FC<WalkModeDisplayProps> = ({
  steps,
  elapsedTime,
  calories,
  co2Saved,
  coinsEarned,
  currentGoalSteps,
  isPaused,
  activityCompleted,
  startTime,
  mapboxAccessToken,
  formatTime,
  handlePauseResume,
  handleStop,
  handleStart,
}) => {
  const percentage = currentGoalSteps > 0 ? Math.min(100, (steps / currentGoalSteps) * 100) : 0;
  const radialData = [{ name: 'Steps', value: percentage, fill: 'url(#activityGradient)' }];
  const endAngle = 90 + (percentage / 100) * 360;

  return (
    <div className="flex flex-col items-center space-y-6 p-4 text-foreground animate-fade-in-up bg-slate-900">
      <div className="relative w-60 h-60 sm:w-72 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={20}
            data={radialData}
            startAngle={90}
            endAngle={endAngle}
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
          <div className="text-5xl font-extrabold text-foreground">{steps.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Steps</div>
        </div>
      </div>

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

      <div className="flex space-x-4 w-full max-w-md">
        {!activityCompleted ? (
          <Button onClick={handlePauseResume} variant="outline" className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-primary-foreground">
            {isPaused ? <Play size={20} className="mr-2" /> : <Pause size={20} className="mr-2" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        ) : null}
        
        {((isPaused && !activityCompleted) || activityCompleted || (!startTime && !activityCompleted) ) && (
          <Button 
            onClick={handleStart} // This is the Restart action
            variant="outline" 
            className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-background"
            disabled={activityCompleted && !isPaused} // Disable restart if activity completed but not explicitly stopped/paused by user action that would enable stopping
          >
            <RefreshCw size={20} className="mr-2" /> Restart
          </Button>
        )}
      </div>
       <Button 
          onClick={handleStop} 
          variant="destructive" 
          className="w-full max-w-md mt-2"
          disabled={activityCompleted} 
       >
         <StopCircle size={20} className="mr-2" /> Stop & End Activity
       </Button>

      <Card className="w-full max-w-md bg-card border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-card-foreground text-lg flex items-center">
            <MapPin size={20} className="mr-2 text-primary" /> Live Location Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(!activityCompleted) ? <LiveActivityMap accessToken={mapboxAccessToken} /> : 
            <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center p-4">
              <p className="text-muted-foreground text-sm">Activity ended.</p>
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
};

export default WalkModeDisplay;

