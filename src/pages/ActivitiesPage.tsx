
import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings } from '@/components/icons';

const ActivitiesPage: React.FC = () => {
  console.log('ActivitiesPage: component mounted');
  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark z-40 shadow-sm">
        <EcoRunLogo size="small" />
        <h1 className="text-xl font-semibold text-eco-light">Activity</h1>
        <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent">
          <Settings size={24} />
        </Button>
      </header>
      <main className="flex-grow p-4 space-y-6 overflow-y-auto pb-24"> {/* pb-24 for bottom nav space */}
        <section className="text-center animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-eco-accent mb-4">Your Activities</h2>
          <p className="text-eco-gray mb-4">Track your runs, walks, and cycling sessions here.</p>
          {/* Placeholder for activity list or charts */}
          <div className="bg-eco-dark-secondary p-6 rounded-xl shadow-lg">
            <p className="text-lg text-eco-light">No activities recorded yet.</p>
            <p className="text-sm text-eco-gray mt-2">Start tracking to see your progress!</p>
          </div>
        </section>
         <section className="bg-eco-dark-secondary p-4 rounded-xl shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-eco-light mb-2">Activity Tip</h3>
          <p className="text-sm text-eco-gray">Try to vary your activities to keep things interesting and work different muscle groups!</p>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default ActivitiesPage;

