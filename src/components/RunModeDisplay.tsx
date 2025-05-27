import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RefreshCw, StopCircle, MapPin, Leaf, Coins, Activity, Route } from '@/components/icons'; // Added Activity, Route
import LiveActivityMap from './LiveActivityMap';

interface RunModeDisplayProps {
  elapsedTime: number;
  calories: number;
  co2Saved: number;
  coinsEarned: number;
  isPaused: boolean;
  activityCompleted: boolean;
  startTime: Date | null;
  mapboxAccessToken: string;
  formatTime: (totalSeconds: number) => string;
  handlePauseResume: () => void;
  handleStop: () => void;
  handleStart: () => void; // For restart

  // Run-specific metrics
  distanceDisplay: string; // e.g., "5.23" km
  avgPaceDisplay: string;  // e.g., "05:30" min/km
  // currentPaceDisplay: string; // Optional for future: "05:15" min/km
  // heartRateDisplay: string; // Optional for future: "160 BPM"
}

const RunModeDisplay: React.FC<RunModeDisplayProps> = ({
  elapsedTime,
  calories,
  co2Saved,
  coinsEarned,
  isPaused,
  activityCompleted,
  startTime,
  mapboxAccessToken,
  formatTime,
  handlePauseResume,
  handleStop,
  handleStart,
  distanceDisplay,
  avgPaceDisplay,
}) => {
  return (
    <div className="flex flex-col items-center space-y-6 p-4 text-foreground animate-fade-in-up bg-slate-900">
      {/* Main Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md text-center">
        <div className="col-span-2 p-4 bg-slate-800 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Distance</div>
          <div className="text-6xl font-extrabold text-primary">{distanceDisplay} <span className="text-2xl">km</span></div>
        </div>
        <div className="p-3 bg-slate-800 rounded-lg">
          <div className="text-xs text-muted-foreground mb-0.5">Time</div>
          <div className="text-3xl font-bold text-eco-accent">{formatTime(elapsedTime)}</div>
        </div>
        <div className="p-3 bg-slate-800 rounded-lg">
          <div className="text-xs text-muted-foreground mb-0.5">Avg Pace</div>
          <div className="text-3xl font-bold text-eco-accent">{avgPaceDisplay} <span className="text-base">min/km</span></div>
        </div>
         {/* Placeholder for Current Pace & Heart Rate - can be added later */}
        {/* <div className="p-3 bg-slate-800 rounded-lg">
          <div className="text-xs text-muted-foreground mb-0.5">Current Pace</div>
          <div className="text-3xl font-bold text-eco-accent">00:00 <span className="text-base">min/km</span></div>
        </div>
        <div className="p-3 bg-slate-800 rounded-lg">
          <div className="text-xs text-muted-foreground mb-0.5">Heart Rate</div>
          <div className="text-3xl font-bold text-eco-accent">-- <span className="text-base">BPM</span></div>
        </div> */}
      </div>
      
      {/* Other stats: Calories, CO2, Coins */}
      <div className="flex justify-around w-full max-w-md pt-4">
        <div className="flex flex-col items-center text-center">
          <Activity size={24} className="text-orange-400 mb-1" />
          <span className="text-lg font-semibold text-foreground">{calories.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">Calories</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Leaf size={24} className="text-green-400 mb-1" />
          <span className="text-lg font-semibold text-foreground">{co2Saved.toLocaleString()} g</span>
          <span className="text-xs text-muted-foreground">CO₂ Saved</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Coins size={24} className="text-yellow-400 mb-1" />
          <span className="text-lg font-semibold text-foreground">{coinsEarned.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">Coins Earned</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-4 w-full max-w-md pt-2">
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
            disabled={activityCompleted && !isPaused}
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

      {/* Map */}
      <Card className="w-full max-w-md bg-card border-border overflow-hidden mt-4">
        <CardHeader>
          <CardTitle className="text-card-foreground text-lg flex items-center">
            <Route size={20} className="mr-2 text-primary" /> Live Route Tracking
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

export default RunModeDisplay;
