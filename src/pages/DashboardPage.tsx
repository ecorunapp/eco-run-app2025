import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Settings, Heart, Clock, Flame, Zap, AlertTriangle } from '@/components/icons';
import ActivityStat from '@/components/ActivityStat';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import StepCounter from '@/components/StepCounter';
import { Button } from '@/components/ui/button';
import ChallengeCard from '@/components/ChallengeCard';
import { challenges, Challenge } from '@/data/challenges';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LatLngTuple } from 'leaflet';
import { useChallengeProgress, UserChallengeProgress } from '@/hooks/useChallengeProgress';
import MotivationalMessageCard from '@/components/MotivationalMessageCard';
import { AnimatePresence } from 'framer-motion';

// Define an extended type for challenges that might have operational state
interface OperationalChallenge extends Challenge {
  activityStatus?: 'not_started' | 'active' | 'paused' | 'completed';
  currentSteps?: number | null;
  pausedLocationName?: string | null;
  pausedLocationCoords?: LatLngTuple | null;
  kilometersCoveredAtPause?: number | null;
  completedLocationName?: string | null;
  completedLocationCoords?: LatLngTuple | null;
}

const motivationalMessages = [
  "Every step you take is a step towards a healthier you. Keep going!",
  "The only bad workout is the one that didn't happen. Lace up those shoes!",
  "Push yourself, because no one else is going to do it for you. You've got this!",
  "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
  "Today's actions are tomorrow's results. Make today count!",
  "Don't limit your challenges. Challenge your limits. Let's run!",
  "The journey of a thousand miles begins with a single step. Take it now!",
  "Sweat is just fat crying. Make it pour!",
  "Wake up with determination. Go to bed with satisfaction. Your activity today matters!"
];

const DashboardPage: React.FC = () => {
  const { balance: userEcoPoints, isLoading: ecoCoinsLoading } = useEcoCoins();
  const { profile: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { 
    challengeProgressList, 
    isLoading: progressLoading, 
    error: challengeProgressError,
    upsertProgress
  } = useChallengeProgress();

  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [showDailyMessage, setShowDailyMessage] = useState(false);
  const [hiddenChallenges, setHiddenChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastDismissedDate = localStorage.getItem('motivationDismissedDate');

    if (lastDismissedDate !== todayStr) {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 0);
      const diff = today.getTime() - startOfYear.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      const messageIndex = dayOfYear % motivationalMessages.length;
      setDailyMessage(motivationalMessages[messageIndex]);
      setShowDailyMessage(true);
    } else {
      setShowDailyMessage(false);
    }
  }, []);

  const handleDismissMotivationalMessage = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('motivationDismissedDate', todayStr);
    setShowDailyMessage(false);
  };

  const handleRemoveCompletedChallenge = async (challengeId: string) => {
    try {
      // Hide the challenge immediately in UI
      setHiddenChallenges(prev => new Set(prev).add(challengeId));
      
      // Update the challenge status to 'not_started' to effectively reset it
      await upsertProgress({
        challenge_id: challengeId,
        status: 'not_started',
        current_steps: 0,
        paused_location_name: null,
        paused_location_lat: null,
        paused_location_lng: null,
        kilometers_covered_at_pause: null,
        completed_location_name: null,
        completed_location_lat: null,
        completed_location_lng: null,
      });
    } catch (error) {
      console.error('Error removing completed challenge:', error);
      // Revert the UI change if the database update fails
      setHiddenChallenges(prev => {
        const newSet = new Set(prev);
        newSet.delete(challengeId);
        return newSet;
      });
    }
  };

  const currentSteps = userProfile?.total_steps || 0;
  const goalSteps = 10000;

  // Calculate dynamic stats based on user data
  const userHeartRate = userProfile?.total_steps ? Math.min(60 + Math.floor((userProfile.total_steps / 1000) * 2), 180) : 0;
  const userTimeTracked = userProfile?.total_steps ? Math.floor((userProfile.total_steps / 100) * 60) : 0; // seconds
  const userCalories = userProfile?.total_steps ? Math.floor(userProfile.total_steps * 0.04) : 0;

  // Format time for display
  const formatTimeTracked = (seconds: number) => {
    if (seconds === 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  };

  // Map challenges to OperationalChallenge type and filter out hidden ones
  const displayedChallenges: OperationalChallenge[] = challenges
    .slice(0, 3)
    .filter(challenge => !hiddenChallenges.has(challenge.id))
    .map((baseChallenge): OperationalChallenge => {
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
      return { 
          ...baseChallenge,
          activityStatus: 'not_started',
          currentSteps: 0,
      };
    });

  // Simplified loading check - only wait for critical data
  const isLoadingCritical = profileLoading;
  const anyError = profileError || challengeProgressError;

  // Show minimal loading for critical data only
  if (isLoadingCritical) {
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
        <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark z-40 shadow-sm">
          <EcoRunLogo size="small" />
          <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent">
            <Settings size={24} />
          </Button>
        </header>
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <Zap size={32} className="animate-pulse text-eco-accent mx-auto mb-2" />
            <p className="text-eco-gray">Loading...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (anyError) {
    let errorMessage = "An error occurred while loading dashboard data. Please try again later.";
    if (profileError) {
      errorMessage = `Error loading profile: ${profileError.message}`;
    } else if (challengeProgressError) {
      errorMessage = `Error loading challenge progress: ${challengeProgressError.message}`;
    }

     return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light justify-center items-center p-4 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-400 mb-2">Oops! Something went wrong.</h2>
        <p className="text-eco-gray">{errorMessage}</p>
        <Button onClick={() => window.location.reload()} className="mt-6 bg-eco-accent text-eco-dark hover:bg-eco-accent/80">
          Try Again
        </Button>
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
        <AnimatePresence>
          {showDailyMessage && dailyMessage && (
            <MotivationalMessageCard 
              message={dailyMessage} 
              onDismiss={handleDismissMotivationalMessage} 
            />
          )}
        </AnimatePresence>
        
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
                currentSteps={challengeData.currentSteps || 0}
                pausedLocationName={challengeData.pausedLocationName || undefined}
                pausedLocationCoords={challengeData.pausedLocationCoords || undefined}
                kilometersCoveredAtPause={challengeData.kilometersCoveredAtPause || undefined}
                completedLocationName={challengeData.completedLocationName || undefined}
                completedLocationCoords={challengeData.completedLocationCoords || undefined}
                onRemoveCompleted={challengeData.activityStatus === 'completed' ? () => handleRemoveCompletedChallenge(challengeData.id) : undefined}
              />
            ))}
          </div>
        </section>

        <section className="text-center p-6 bg-gradient-to-br from-eco-accent to-eco-purple rounded-2xl shadow-xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm font-medium text-eco-dark-secondary opacity-90">Your EcoPoints</p>
          <h2 className="text-5xl font-extrabold text-white my-2 flex items-center justify-center">
            <Zap size={36} className="mr-2 text-yellow-300" />
            {ecoCoinsLoading ? "..." : userEcoPoints.toLocaleString()}
          </h2>
          <p className="text-xs text-eco-dark-secondary opacity-80">Keep up the great work!</p>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <ActivityStat 
            icon={Heart} 
            value={userHeartRate > 0 ? userHeartRate.toString() : "0"} 
            label="Heart Rate" 
            iconColor="text-eco-pink" 
          />
          <ActivityStat 
            icon={Clock} 
            value={formatTimeTracked(userTimeTracked)} 
            label="Time Track" 
            iconColor="text-eco-purple" 
          />
          <ActivityStat 
            icon={Flame} 
            value={userCalories.toString()} 
            label="Calories" 
            iconColor="text-orange-400" 
          />
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
