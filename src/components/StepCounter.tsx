
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
// Removed Leaf and Coins icons as they are no longer used in this component
// Removed Zap icon as it's not in the new design for the center of the chart

interface StepCounterProps {
  currentSteps: number;
  goalSteps: number;
  // co2Saved and coinsEarned are removed from props as they are no longer displayed
}

const StepCounter: React.FC<StepCounterProps> = ({ currentSteps, goalSteps }) => {
  const percentage = goalSteps > 0 ? Math.min(100, (currentSteps / goalSteps) * 100) : 0;
  const data = [
    {
      name: 'Steps',
      value: percentage,
      fill: 'url(#stepsActivityGradient)', // Updated gradient ID
    },
  ];

  const displayPercentage = Math.min(100, percentage);
  const endAngle = 90 - (displayPercentage / 100) * 360;

  return (
    // Adjusted height to match the chart since CO2/Coins section is removed
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto animate-fade-in-up flex flex-col items-center">
      <div className="relative w-full h-full"> {/* Changed to w-full h-full to match parent */}
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={20}
            data={data}
            startAngle={90}
            endAngle={endAngle}
          >
            <defs>
              {/* Updated gradient colors to match the provided image */}
              <linearGradient id="stepsActivityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00F5D4" /> {/* Teal/Accent color */}
                <stop offset="100%" stopColor="#A3E635" /> {/* Lime Green color */}
              </linearGradient>
            </defs>
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              angleAxisId={0}
              fill="hsla(var(--muted) / 0.2)"
              cornerRadius={10}
              data={[{ value: 100 }]}
            />
            <RadialBar
              dataKey="value"
              angleAxisId={0}
              cornerRadius={10}
              animationDuration={1500}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {/* Updated text content and styling */}
          <div className="text-5xl font-extrabold text-eco-light">
            {Math.round(displayPercentage)}%
          </div>
          <div className="text-sm text-eco-gray mt-1 px-4"> {/* Added px-4 for padding if text is long */}
            To discover a new achievement
          </div>
        </div>
      </div>

      {/* Removed CO2 Saved and Coins Earned section */}
    </div>
  );
};

export default StepCounter;
