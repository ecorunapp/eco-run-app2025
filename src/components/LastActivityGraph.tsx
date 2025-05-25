
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySummary } from '@/components/ActivityTracker'; // Import the shared type

interface LastActivityGraphProps {
  summary: ActivitySummary;
}

const LastActivityGraph: React.FC<LastActivityGraphProps> = ({ summary }) => {
  const data = [
    { name: 'Steps', value: summary.steps, fill: '#8884d8' },
    { name: 'Time (min)', value: parseFloat((summary.elapsedTime / 60).toFixed(1)), fill: '#82ca9d' },
    { name: 'Calories', value: summary.calories, fill: '#ffc658' },
    { name: 'CO2 Saved (g)', value: summary.co2Saved, fill: '#00F5D4' },
    // { name: 'Coins', value: summary.coinsEarned, fill: '#FF8042' }, // Optional: Coins might have a very different scale
  ];

  // Format YAxis ticks to prevent long labels from being cut off or overlapping
  const formatYAxisTick = (tick: string) => {
    if (tick.length > 15) { // Adjust length as needed
      return `${tick.substring(0, 12)}...`;
    }
    return tick;
  };

  return (
    <Card className="bg-eco-dark-secondary shadow-lg animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-eco-light text-lg">Last Activity Summary</CardTitle>
      </CardHeader>
      <CardContent className="h-72 sm:h-80"> {/* Adjusted height for better visualization */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,240,240,0.1)" />
            <XAxis 
              type="number" 
              tick={{ fill: '#8E9196', fontSize: 12 }} 
              axisLine={{ stroke: '#8E9196' }} 
              tickLine={{ stroke: '#8E9196' }} 
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#F0F0F0', fontSize: 12 }} 
              axisLine={{ stroke: '#8E9196' }} 
              tickLine={{ stroke: '#8E9196' }} 
              width={100} // Increased width for YAxis labels
              tickFormatter={formatYAxisTick} // Apply tick formatter
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#12121A', border: '1px solid #00F5D4', borderRadius: '8px' }}
              labelStyle={{ color: '#00F5D4', fontWeight: 'bold' }}
              itemStyle={{ color: '#F0F0F0' }}
              cursor={{ fill: 'rgba(142, 145, 150, 0.1)' }} // Adjusted cursor color for better visibility
            />
            <Bar dataKey="value" barSize={25}> {/* Slightly increased barSize */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LastActivityGraph;
