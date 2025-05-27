import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Settings, Heart, Clock, Flame, Zap } from '@/components/icons';
import ActivityStat from '@/components/ActivityStat';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import StepCounter from '@/components/StepCounter';
import { Button } from '@/components/ui/button';
import ChallengeCard from '@/components/ChallengeCard';
import { challenges, Challenge } from '@/data/challenges';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LatLngTuple } from 'leaflet';
import { useChallengeProgress, UserChallengeProgress } from '@/hooks/useChallengeProgress'; // Import the hook and type

// Define an extended type for challenges that might have operational state
interface OperationalChallenge extends Challenge {
  activityStatus?: 'not_started' | 'active' | 'paused' | 'completed';
  currentSteps?: number | null; // Allow null from DB
  pausedLocationName?: string | null; // Allow null
  pausedLocationCoords?: LatLngTuple | null; // Allow null
  kilometersCoveredAtPause?: number | null; // Allow null
  completedLocationName?: string | null; // Allow null
  completedLocationCoords?: LatLngTuple | null; // Allow null
}

const DashboardPage: React.FC = () => {
  const { balance: userEcoPoints, isLoading: ecoCoinsLoading } = useEcoCoins();
  const { profile: userProfile, isLoading: profileLoading } = useUserProfile();
  const { 
    challengeProgressList, 
    isLoading: progressLoading, 
    error: progressError 
  } = useChallengeProgress();

  const currentSteps = userProfile?.total_steps || 0;
  const goalSteps = 10000;

  // Map challenges to OperationalChallenge type
  // Removed hardcoded statuses for new user experience.
  // Challenges will now default to 'not_started' or their initial locked state.
  // Specific progress (currentSteps, completedLocation etc.) will be undefined
  // and ChallengeCard will use its defaults (0 steps, 'not_started').
  const displayedChallenges: OperationalChallenge[] = challenges.slice(0, 3).map((baseChallenge): OperationalChallenge => {
    const progress = challengeProgressList.find(p => p.challenge_id === baseChallenge.id);

    if (progress) {
      let pausedCoords: LatLngTuple | null = null;
      if (progress.paused_location_lat != null && progress.paused_location_lng != null) {
        pausedCoords = [progress.paused_location_lat, progress.paused_location_lng];
      }
      let completedCoords: LatLngTuple | null = null;
      if (progress.completed_location_lat != null && progress.completed_location_lng != null) {
        completedCoords = [progress.completed_location_lat, progress.completed_location_lng];
      }

      return {
        ...baseChallenge,
        activityStatus: progress.status,
        currentSteps: progress.current_steps,
        pausedLocationName: progress.paused_location_name,
        pausedLocationCoords: pausedCoords,
        kilometersCoveredAtPause: progress.kilometers_covered_at_pause,
        completedLocationName: progress.completed_location_name,
        completedLocationCoords: completedCoords,
      };
    }
    // If no progress in DB, return base challenge (will default to 'not_started' in ChallengeCard)
    return { 
        ...baseChallenge,
        activityStatus: 'not_started', // Explicitly set for clarity, though ChallengeCard might default
        currentSteps: 0,
    };
  });

  if (ecoCoinsLoading || profileLoading || progressLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light justify-center items-center">
        <Zap size={48} className="animate-ping text-eco-accent" />
        <p className="mt-4">Loading Dashboard...</p>
      </div>
    );
  }

  if (progressError) {
     return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light justify-center items-center">
        <Zap size={48} className="text-red-500" />
        <p className="mt-4 text-red-400">Error loading challenge progress: {progressError.message}</p>
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
        
        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StepCounter 
            currentSteps={currentSteps} 
            goalSteps={goalSteps}
          />
        </section>

        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-semibold text-eco-light mb-4">Daily Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedChallenges.map((challengeData) => (
              <ChallengeCard 
                key={challengeData.id} 
                challenge={challengeData} 
                activityStatus={challengeData.activityStatus}
                currentSteps={challengeData.currentSteps || 0} // Ensure currentSteps is number
                pausedLocationName={challengeData.pausedLocationName || undefined}
                pausedLocationCoords={challengeData.pausedLocationCoords || undefined}
                kilometersCoveredAtPause={challengeData.kilometersCoveredAtPause || undefined}
                completedLocationName={challengeData.completedLocationName || undefined}
                completedLocationCoords={challengeData.completedLocationCoords || undefined}
              />
            ))}
          </div>
        </section>

        <section className="text-center p-6 bg-gradient-to-br from-eco-accent to-eco-purple rounded-2xl shadow-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm font-medium text-eco-dark-secondary opacity-90">Your EcoPoints</p>
          <h2 className="text-5xl font-extrabold text-white my-2 flex items-center justify-center">
            <Zap size={36} className="mr-2 text-yellow-300" />
            {userEcoPoints.toLocaleString()}
          </h2>
          <p className="text-xs text-eco-dark-secondary opacity-80">Keep up the great work!</p>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <ActivityStat icon={Heart} value="110" label="Heart Rate" iconColor="text-eco-pink" />
          <ActivityStat icon={Clock} value="22:15" label="Time Track" iconColor="text-eco-purple" />
          <ActivityStat icon={Flame} value="350" label="Calories" iconColor="text-orange-400" />
        </section>
        
        <section className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <WeeklyActivityChart />
        </section>

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
