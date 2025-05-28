
import { useState, useEffect } from 'react';
import { Challenge, challenges } from '@/data/challenges';
import { useUserProfile } from './useUserProfile';

interface PersonalizedChallenge extends Challenge {
  assignedAt: string;
  expiresAt: string;
}

export const usePersonalizedChallenges = () => {
  const { profile } = useUserProfile();
  const [dailyChallenges, setDailyChallenges] = useState<PersonalizedChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateDailyChallenges = (userId: string): PersonalizedChallenge[] => {
    // Create a seed based on user ID and current date
    const today = new Date().toISOString().split('T')[0];
    const seed = `${userId}-${today}`;
    
    // Simple hash function to generate consistent random numbers
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    };

    const baseHash = hashCode(seed);
    
    // Filter out the locked EcoTab challenge for daily selection
    const availableChallenges = challenges.filter(challenge => 
      challenge.id !== 'challenge_20k_ecotab_300aed'
    );

    // Select 3 different challenges using the hash
    const selectedChallenges: Challenge[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < 3; i++) {
      let index = (baseHash + i * 7) % availableChallenges.length;
      
      // Ensure we don't select the same challenge twice
      while (usedIndices.has(index)) {
        index = (index + 1) % availableChallenges.length;
      }
      
      usedIndices.add(index);
      selectedChallenges.push(availableChallenges[index]);
    }

    // Convert to PersonalizedChallenge with timestamps
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Reset to midnight

    return selectedChallenges.map(challenge => ({
      ...challenge,
      assignedAt: now.toISOString(),
      expiresAt: tomorrow.toISOString(),
    }));
  };

  const getLockedEcotabChallenge = (): PersonalizedChallenge => {
    const ecotabChallenge = challenges.find(c => c.id === 'challenge_20k_ecotab_300aed')!;
    const now = new Date();
    
    return {
      ...ecotabChallenge,
      assignedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    };
  };

  useEffect(() => {
    if (profile?.id) {
      setIsLoading(true);
      
      const storedChallenges = localStorage.getItem(`dailyChallenges-${profile.id}`);
      const today = new Date().toISOString().split('T')[0];
      
      if (storedChallenges) {
        const parsed = JSON.parse(storedChallenges);
        const challengeDate = new Date(parsed.assignedAt).toISOString().split('T')[0];
        
        // Check if challenges are from today
        if (challengeDate === today) {
          setDailyChallenges(parsed.challenges);
          setIsLoading(false);
          return;
        }
      }

      // Generate new daily challenges
      const newDailyChallenges = generateDailyChallenges(profile.id);
      const lockedChallenge = getLockedEcotabChallenge();
      
      const allChallenges = [...newDailyChallenges, lockedChallenge];
      
      // Store in localStorage
      localStorage.setItem(`dailyChallenges-${profile.id}`, JSON.stringify({
        challenges: allChallenges,
        assignedAt: new Date().toISOString(),
      }));
      
      setDailyChallenges(allChallenges);
      setIsLoading(false);
    }
  }, [profile?.id]);

  const isExpired = (challenge: PersonalizedChallenge): boolean => {
    return new Date() > new Date(challenge.expiresAt);
  };

  const getTimeRemaining = (challenge: PersonalizedChallenge): string => {
    const now = new Date();
    const expiry = new Date(challenge.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return {
    dailyChallenges,
    isLoading,
    isExpired,
    getTimeRemaining,
  };
};
