
import { LucideIcon, Footprints, Award } from '@/components/icons'; // Using our icons.tsx

export interface Challenge {
  id: string;
  title: string;
  description: string;
  stepsGoal: number;
  rewardCoins: number;
  icon: LucideIcon;
  prizeImageUrl?: string;
  prizePromoCode?: string;
  primaryColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
}

export const challenges: Challenge[] = [
  {
    id: 'challenge_2k_steps',
    title: 'Noon 10 AED Sprint', // Updated title for clarity
    description: 'Complete 2,000 steps & win a 10 AED Noon Card!', // Updated description
    stepsGoal: 2000,
    rewardCoins: 50, // Adjusted coins, as there's a specific card
    icon: Footprints,
    prizeImageUrl: '/noon-10aed-card-front.png', // Specific image for Noon 10 AED card
    prizePromoCode: 'NOON10-SPRINT', // Example promo code
    primaryColor: 'bg-orange-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-orange-600',
  },
  {
    id: 'challenge_5k_steps',
    title: 'Steady Pace',
    description: 'Reach 5,000 steps today!',
    stepsGoal: 5000,
    rewardCoins: 100,
    icon: Footprints,
    prizeImageUrl: '/placeholder-noon-card-front.png', 
    prizePromoCode: 'NOON-PACE-456',
    primaryColor: 'bg-indigo-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-indigo-600',
  },
  {
    id: 'challenge_10k_steps',
    title: 'Marathon Prep',
    description: 'Conquer 10,000 steps today!',
    stepsGoal: 10000,
    rewardCoins: 100,
    icon: Award, 
    prizeImageUrl: '/placeholder-noon-card-front.png', 
    prizePromoCode: 'NOON-MARATHON-789',
    primaryColor: 'bg-teal-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-teal-600',
  },
];

export const getChallengeById = (id: string): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === id);
};
