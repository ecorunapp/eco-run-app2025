
import type { LucideProps } from 'lucide-react';
import React from 'react';

export interface Challenge {
  id: string;
  type: 'walk' | 'run';
  distance: number; // in km
  reward: number; // EcoCoins
  title: string;
  description: string;
  status?: 'not-started' | 'completed'; // This will be managed by ChallengesContext
  icon: React.FC<LucideProps>;
}

