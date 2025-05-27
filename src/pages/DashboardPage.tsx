import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Settings, Heart, Clock, Flame, Zap } from '@/components/icons';
import ActivityStat from '@/components/ActivityStat';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import StepCounter from '@/components/StepCounter';
import { Button } from '@/components/ui/button';
import ChallengeCard from '@/components/ChallengeCard';
import { challenges, Challenge } from '@/data/challenges'; // Import Challenge type
import { useEcoCoins } from '@/context/EcoCoinsContext';
import { useUserProfile } from '@/hooks/useUserProfile';


const DashboardPage: React.FC = () => {
  // Use EcoCoinsContext to get the balance
  const { balance: userEcoPoints, isLoading: ecoCoinsLoading } = useEcoCoins();
  const { profile: userProfile, isLoading: profileLoading } = useUserProfile(); // Get profile for step data if needed

  // Example data for currentSteps and goalSteps - you might want to fetch this from userProfile or other state
  const currentSteps = userProfile?.total_steps || 0; // Example: Use total_steps from profile
  const goalSteps = 10000; // Example goal steps, could be dynamic

  // Display only the first 3 challenges and add example paused state to one
  const displayedChallenges = challenges.slice(0, 3).map((challenge, index) => {
    // Let's make the first non-locked challenge appear as "paused" for demonstration
    // Assuming the first challenge 'Quick 5 AED Dash' (id: 'challenge_100_steps_5aed') is suitable
    if (challenge.id === 'challenge_100_steps_5aed' && !challenge.isLockedInitially) {
      return {
        ...challenge,
        activityStatus: 'paused' as 'paused', // Type assertion
        currentSteps: 50, // Example current steps
        pausedLocationName: 'Downtown Park', // Example location
        kilometersCoveredAtPause: parseFloat((50 * 0.000762).toFixed(2)), // Example KMs
      };
    }
    return challenge;
  });

  if (ecoCoinsLoading || profileLoading) {
    // You can add a more sophisticated loading skeleton here
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light justify-center items-center">
        <Zap size={48} className="animate-ping text-eco-accent" />
        <p className="mt-4">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark z-40 shadow-sm">
        <EcoRunLogo size="small" />
        <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent">
          <Settings size={24} />
        </Button>
      </header>

      <main className="flex-grow p-4 space-y-8 overflow-y-auto pb-24">
        
        {/* Step Counter Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StepCounter 
            currentSteps={currentSteps} 
            goalSteps={goalSteps}
          />
        </section>

        {/* Challenges Section - Now shows only 3 */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-semibold text-eco-light mb-4">Daily Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedChallenges.map((challengeData) => (
              <ChallengeCard 
                key={challengeData.id} 
                challenge={challengeData}
                activityStatus={challengeData.activityStatus as any} // Pass down the status
                currentSteps={challengeData.currentSteps}
                pausedLocationName={challengeData.pausedLocationName}
                kilometersCoveredAtPause={challengeData.kilometersCoveredAtPause}
              />
            ))}
          </div>
        </section>

        {/* EcoPoints Display */}
        <section className="text-center p-6 bg-gradient-to-br from-eco-accent to-eco-purple rounded-2xl shadow-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm font-medium text-eco-dark-secondary opacity-90">Your EcoPoints</p>
          <h2 className="text-5xl font-extrabold text-white my-2 flex items-center justify-center">
            <Zap size={36} className="mr-2 text-yellow-300" />
            {userEcoPoints.toLocaleString()}
          </h2>
          <p className="text-xs text-eco-dark-secondary opacity-80">Keep up the great work!</p>
        </section>

        {/* Key Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <ActivityStat icon={Heart} value="110" label="Heart Rate" iconColor="text-eco-pink" />
          <ActivityStat icon={Clock} value="22:15" label="Time Track" iconColor="text-eco-purple" />
          <ActivityStat icon={Flame} value="350" label="Calories" iconColor="text-orange-400" />
        </section>
        
        {/* Weekly Activity Chart */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <WeeklyActivityChart />
        </section>

        {/* Placeholder for other sections */}
        <section className="bg-eco-dark-secondary p-4 rounded-xl shadow animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
          <h3 className="text-lg font-semibold text-eco-light mb-2">Today's Tip</h3>
          <p className="text-sm text-eco-gray">Remember to stay hydrated during your activities! Drink plenty of water.</p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default DashboardPage;
