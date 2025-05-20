
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ActivityDetailsModal, { ActivityDataPoint } from './ActivityDetailsModal';

// Enhanced mock data
const data: ActivityDataPoint[] = [
  { name: 'Mon', date: '2025-05-12', points: 75, steps: 8000, duration: 60, calories: 300, co2Saved: 150, type: 'walk' },
  { name: 'Tue', date: '2025-05-13', points: 120, steps: 10000, duration: 75, calories: 450, co2Saved: 200, type: 'run' },
  { name: 'Wed', date: '2025-05-14', points: 90, steps: 7500, duration: 50, calories: 250, co2Saved: 120, type: 'walk' },
  { name: 'Thu', date: '2025-05-15', points: 150, steps: 12000, duration: 90, calories: 600, co2Saved: 250, type: 'run' },
  { name: 'Fri', date: '2025-05-16', points: 200, steps: 15000, duration: 120, calories: 700, co2Saved: 300, type: 'cycle' },
  { name: 'Sat', date: '2025-05-17', points: 250, steps: 18000, duration: 150, calories: 800, co2Saved: 400, type: 'run' },
  { name: 'Sun', date: '2025-05-18', points: 100, steps: 9000, duration: 70, calories: 350, co2Saved: 180, type: 'walk' },
];

const WeeklyActivityChart: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityDataPoint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChartClick = (event: any) => {
    if (event && event.activePayload && event.activePayload.length > 0) {
      // The payload contains the data for the point near the click
      const clickedData = event.activePayload[0].payload as ActivityDataPoint;
      setSelectedActivity(clickedData);
      setIsModalOpen(true);
      console.log("Chart point clicked:", clickedData);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  return (
    <div className="bg-eco-dark-secondary p-4 rounded-xl shadow h-64 sm:h-72">
      <h3 className="text-lg font-semibold text-eco-light mb-4">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart 
          data={data} 
          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          onClick={handleChartClick} // Add onClick handler to the chart
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,240,240,0.1)" />
          <XAxis dataKey="name" tick={{ fill: '#8E9196', fontSize: 12 }} axisLine={{ stroke: '#8E9196' }} tickLine={{ stroke: '#8E9196' }} />
          <YAxis tick={{ fill: '#8E9196', fontSize: 12 }} axisLine={{ stroke: '#8E9196' }} tickLine={{ stroke: '#8E9196' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12121A', border: '1px solid #00F5D4', borderRadius: '8px' }}
            labelStyle={{ color: '#00F5D4', fontWeight: 'bold' }}
            itemStyle={{ color: '#F0F0F0' }}
          />
          <Legend wrapperStyle={{ color: '#F0F0F0', fontSize: '12px' }} />
          <Line 
            type="monotone" 
            dataKey="points" 
            name="EcoPoints" 
            stroke="#00F5D4" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#00F5D4', cursor: 'pointer' }} // Add cursor pointer to dots
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }} 
          />
        </LineChart>
      </ResponsiveContainer>
      <ActivityDetailsModal isOpen={isModalOpen} onClose={closeModal} activity={selectedActivity} />
    </div>
  );
};

export default WeeklyActivityChart;
