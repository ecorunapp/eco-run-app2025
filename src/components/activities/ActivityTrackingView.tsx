
import React from 'react';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { X } from '@/components/icons';
import ActivityTracker, { ActivitySummary, LiveProgressData } from '@/components/ActivityTracker';
import MiniChallengeStatus from '@/components/MiniChallengeStatus';
import BottomNav from '@/components/BottomNav';
import { Challenge } from '@/data/challenges';

interface ActivityTrackingViewProps {
  activeChallenge: Challenge | null;
  liveProgress: LiveProgressData | null;
  onStopTracking: (activitySummary: ActivitySummary, challengeCompleted?: boolean) => void;
  onLiveProgressUpdate: (progress: LiveProgressData) => void;
}

const ActivityTrackingView: React.FC<ActivityTrackingViewProps> = ({
  activeChallenge,
  liveProgress,
  onStopTracking,
  onLiveProgressUpdate,
}) => {
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
            // Provide a basic summary; ActivityTracker provides a more detailed one via its own stop.
            // The coinsEarned here is 0 because it's calculated upon actual stop/completion.
            onStopTracking(
              { steps: liveProgress?.currentSteps || 0, elapsedTime: liveProgress?.elapsedTime || 0, calories: 0, co2Saved: 0, coinsEarned: 0 },
              potentiallyCompleted || false
            );
          }}
        >
          <X size={24} />
        </Button>
      </header>
      <main className="flex-grow overflow-y-auto pb-24">
        <ActivityTracker
          onStopTracking={onStopTracking}
          challengeGoalSteps={activeChallenge?.stepsGoal}
          onLiveProgressUpdate={onLiveProgressUpdate}
        />
      </main>
      {activeChallenge && liveProgress && (
        <MiniChallengeStatus
          currentSteps={liveProgress.currentSteps}
          goalSteps={liveProgress.goalSteps} // goalSteps should come from liveProgress if it's dynamic, or activeChallenge
        />
      )}
      <BottomNav />
    </div>
  );
};

export default ActivityTrackingView;
