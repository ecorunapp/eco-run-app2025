
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Challenge } from '@/types/Challenge';
import { challengesData as initialChallengeDefs } from '@/data/challengesData';

type ChallengeStatus = 'not-started' | 'completed';

interface ChallengeState extends Challenge {
  status: ChallengeStatus;
}

interface ChallengesContextType {
  challenges: ChallengeState[];
  completeChallenge: (challengeId: string) => void;
  isLoading: boolean;
}

const ChallengesContext = createContext<ChallengesContextType | null>(null);

const CHALLENGES_STORAGE_KEY = 'ecoRunChallengesStatus';

export const ChallengesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [challenges, setChallenges] = useState<ChallengeState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedStatusesRaw = localStorage.getItem(CHALLENGES_STORAGE_KEY);
      const storedStatuses = storedStatusesRaw ? JSON.parse(storedStatusesRaw) : {};
      
      const initializedChallenges = initialChallengeDefs.map(def => ({
        ...def,
        status: storedStatuses[def.id] || 'not-started',
      }));
      setChallenges(initializedChallenges);
    } catch (error) {
      console.error("Failed to load challenge statuses from localStorage", error);
      // Fallback to default statuses if localStorage fails
      const defaultChallenges = initialChallengeDefs.map(def => ({
        ...def,
        status: 'not-started' as ChallengeStatus,
      }));
      setChallenges(defaultChallenges);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeChallenge = useCallback((challengeId: string) => {
    setChallenges(prevChallenges => {
      const newChallenges = prevChallenges.map(c => 
        c.id === challengeId ? { ...c, status: 'completed' as ChallengeStatus } : c
      );
      
      // Persist to localStorage
      const statusesToStore = newChallenges.reduce((acc, curr) => {
        if (curr.status === 'completed') {
          acc[curr.id] = 'completed';
        }
        return acc;
      }, {} as Record<string, ChallengeStatus>);
      
      try {
        localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(statusesToStore));
      } catch (error) {
        console.error("Failed to save challenge statuses to localStorage", error);
      }
      
      return newChallenges;
    });
  }, []);

  return (
    <ChallengesContext.Provider value={{ challenges, completeChallenge, isLoading }}>
      {children}
    </ChallengesContext.Provider>
  );
};

export const useChallenges = (): ChallengesContextType => {
  const context = useContext(ChallengesContext);
  if (!context) {
    throw new Error('useChallenges must be used within a ChallengesProvider');
  }
  return context;
};

