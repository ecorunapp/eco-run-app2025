
import React from 'react';
import { Footprints } from '@/components/icons'; // Using Footprints as a placeholder

interface AnimatedProgressIconProps {
  progressPercentage: number;
}

const AnimatedProgressIcon: React.FC<AnimatedProgressIconProps> = ({ progressPercentage }) => {
  // Ensure the icon doesn't go beyond 100% or too far left if progress is 0
  const leftPosition = Math.max(0, Math.min(100, progressPercentage));

  return (
    <div
      className="absolute transition-all duration-300 ease-linear"
      style={{
        left: `${leftPosition}%`,
        bottom: '2px', // Adjust to position icon nicely above/on the progress bar
        transform: 'translateX(-50%)', // Center the icon
      }}
    >
      <Footprints size={20} className="text-white" />
    </div>
  );
};

export default AnimatedProgressIcon;
