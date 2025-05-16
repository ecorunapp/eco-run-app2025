
import React from 'react';

interface ActivityStatProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  iconColor?: string;
}

const ActivityStat: React.FC<ActivityStatProps> = ({ icon: Icon, value, label, iconColor = "text-eco-accent" }) => {
  return (
    <div className="flex flex-col items-center text-center bg-eco-dark-secondary p-4 rounded-xl shadow">
      <Icon size={24} className={`${iconColor} mb-2`} />
      <div className="text-xl font-bold text-eco-light">{value}</div>
      <div className="text-xs text-eco-gray">{label}</div>
    </div>
  );
};

export default ActivityStat;
