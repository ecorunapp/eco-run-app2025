
import React from 'react';
import { Flame, CheckCircle, Circle } from '@/components/icons'; // Changed CheckCircle2 to CheckCircle
import { Progress } from '@/components/ui/progress';

interface MiniChallengeStatusProps {
  currentSteps: number;
  goalSteps: number;
  streakDays?: number; // Optional, static for now
  // For simplicity, let's represent weekly progress as an array of booleans for 7 days
  weeklyProgressPreview?: boolean[]; 
}

const MiniChallengeStatus: React.FC<MiniChallengeStatusProps> = ({
  currentSteps,
  goalSteps,
  streakDays = 7, // Static placeholder
  weeklyProgressPreview = [true, true, true, false, false, false, false], // Mon, Tue, Wed done
}) => {
  const percentage = goalSteps > 0 ? Math.min(100, (currentSteps / goalSteps) * 100) : 0;
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="fixed bottom-16 left-0 right-0 mx-auto w-full max-w-md p-3 bg-slate-800/90 backdrop-blur-sm text-white rounded-lg shadow-xl md:bottom-4 animate-fade-in-up z-50">
      <div className="flex items-center justify-between space-x-3">
        {/* Left: Flame Icon and Streak */}
        <div className="flex flex-col items-center text-center">
          <Flame size={36} className="text-pink-500" />
          <div className="text-xs mt-1">
            <span className="font-semibold">{streakDays} days</span>
            <p className="text-slate-400 text-xxs">Streak</p>
          </div>
        </div>

        {/* Center: Progress Bar and Steps */}
        <div className="flex-grow">
          <div className="text-sm font-semibold text-center mb-1">
            {currentSteps.toLocaleString()} / {goalSteps.toLocaleString()}
          </div>
          <Progress value={percentage} className="h-2.5 bg-slate-700 [&>div]:bg-pink-400" />
          
          {/* Simplified Weekly Progress */}
          <div className="flex justify-center space-x-1.5 mt-2.5">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                {weeklyProgressPreview[index] ? (
                  <CheckCircle size={16} className="text-pink-500" /> // Changed CheckCircle2 to CheckCircle
                ) : (
                  <Circle size={16} className="text-slate-600" />
                )}
                <span className="text-xxs text-slate-400 mt-0.5">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniChallengeStatus;
