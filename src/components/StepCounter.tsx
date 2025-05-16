
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Zap, Leaf, Coins } from '@/components/icons'; // Using Zap icon as a placeholder for steps or energy

interface StepCounterProps {
  currentSteps: number;
  goalSteps: number;
  co2Saved?: number; // Optional: CO2 saved in grams or kg
  coinsEarned?: number; // Optional: Coins earned
}

const StepCounter: React.FC<StepCounterProps> = ({ currentSteps, goalSteps, co2Saved, coinsEarned }) => {
  const percentage = goalSteps > 0 ? (currentSteps / goalSteps) * 100 : 0;
  const data = [
    {
      name: 'Steps',
      value: percentage,
      fill: 'url(#stepsGradient)',
    },
  ];

  // Ensure currentSteps doesn't exceed goalSteps for visual representation
  const displayPercentage = Math.min(100, percentage);
  const endAngle = 90 - (displayPercentage / 100) * 360; // Start from top and go clockwise

  return (
    <div className="relative w-64 h-72 sm:w-72 sm:h-80 md:w-80 md:h-96 mx-auto animate-fade-in-up flex flex-col items-center">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={20}
            data={data}
            startAngle={90} // Start from the top
            endAngle={endAngle} // End angle based on percentage
          >
            <defs>
              <linearGradient id="stepsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-eco-pink, #FF89BB)" />
                <stop offset="50%" stopColor="var(--color-eco-purple, #8A4FFF)" />
                <stop offset="100%" stopColor="var(--color-eco-accent, #00F5D4)" />
              </linearGradient>
            </defs>
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            {/* Background track */}
            <RadialBar
              background
              dataKey="value" // This will draw a full circle if a value of 100 is given
              angleAxisId={0}
              fill="hsla(var(--muted) / 0.2)" // Use a muted background color from theme
              cornerRadius={10}
              data={[{ value: 100 }]} // Static data for background full circle
            />
            {/* Foreground progress */}
            <RadialBar
              dataKey="value"
              angleAxisId={0}
              cornerRadius={10}
              animationDuration={1500}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <Zap size={32} className="text-eco-accent mb-1" />
          <div className="text-4xl sm:text-5xl font-extrabold text-eco-light">
            {currentSteps.toLocaleString()}
          </div>
          <div className="text-sm text-eco-gray">Steps</div>
        </div>
      </div>

      {(co2Saved !== undefined || coinsEarned !== undefined) && (
        <div className="mt-4 flex space-x-4 justify-center text-eco-light w-full px-4">
          {co2Saved !== undefined && (
            <div className="flex flex-col items-center text-center bg-eco-dark-secondary p-3 rounded-lg shadow">
              <Leaf size={20} className="text-green-400 mb-1" />
              <span className="text-sm font-semibold">{co2Saved.toLocaleString()} g</span>
              <span className="text-xs text-eco-gray">CO₂ Saved</span>
            </div>
          )}
          {coinsEarned !== undefined && (
            <div className="flex flex-col items-center text-center bg-eco-dark-secondary p-3 rounded-lg shadow">
              <Coins size={20} className="text-yellow-400 mb-1" />
              <span className="text-sm font-semibold">{coinsEarned.toLocaleString()}</span>
              <span className="text-xs text-eco-gray">Coins</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepCounter;
