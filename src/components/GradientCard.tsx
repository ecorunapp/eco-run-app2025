import React from 'react';

interface GradientCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string;
  gradient: string;
  change?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  icon,
  title,
  value,
  gradient,
  change,
}) => (
  <div
    className={`rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between min-w-[180px] min-h-[120px] ${gradient}`}
  >
    <div className="flex items-center justify-between">
      <div className="text-2xl">{icon}</div>
      {change && (
        <span className="text-xs bg-white/20 rounded-full px-2 py-1 ml-2">{change}</span>
      )}
    </div>
    <div className="mt-4">
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  </div>
); 