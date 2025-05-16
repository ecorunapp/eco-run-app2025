
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Zap } from '@/components/icons'; // Using Zap icon as a placeholder for steps or energy

interface StepCounterProps {
  currentSteps: number;
  goalSteps: number;
}

const StepCounter: React.FC<StepCounterProps> = ({ currentSteps, goalSteps }) => {
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
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto animate-fade-in-up">
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
            minAngle={15} // Ensures a small bar is visible even for small values
            // fill prop is set in data array
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
  );
};

export default StepCounter;
