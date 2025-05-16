
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Mon', points: Math.floor(Math.random() * 100) + 50 },
  { name: 'Tue', points: Math.floor(Math.random() * 100) + 70 },
  { name: 'Wed', points: Math.floor(Math.random() * 100) + 60 },
  { name: 'Thu', points: Math.floor(Math.random() * 100) + 90 },
  { name: 'Fri', points: Math.floor(Math.random() * 100) + 120 },
  { name: 'Sat', points: Math.floor(Math.random() * 100) + 150 },
  { name: 'Sun', points: Math.floor(Math.random() * 100) + 80 },
];

const WeeklyActivityChart: React.FC = () => {
  return (
    <div className="bg-eco-dark-secondary p-4 rounded-xl shadow h-64 sm:h-72">
      <h3 className="text-lg font-semibold text-eco-light mb-4">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,240,240,0.1)" />
          <XAxis dataKey="name" tick={{ fill: '#8E9196', fontSize: 12 }} axisLine={{ stroke: '#8E9196' }} tickLine={{ stroke: '#8E9196' }} />
          <YAxis tick={{ fill: '#8E9196', fontSize: 12 }} axisLine={{ stroke: '#8E9196' }} tickLine={{ stroke: '#8E9196' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#12121A', border: '1px solid #00F5D4', borderRadius: '8px' }}
            labelStyle={{ color: '#00F5D4', fontWeight: 'bold' }}
            itemStyle={{ color: '#F0F0F0' }}
          />
          <Legend wrapperStyle={{ color: '#F0F0F0', fontSize: '12px' }} />
          <Line type="monotone" dataKey="points" name="EcoPoints" stroke="#00F5D4" strokeWidth={3} dot={{ r: 4, fill: '#00F5D4' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyActivityChart;
