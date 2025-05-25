
import { LucideIcon, Footprints, Award } from '@/components/icons'; // Using our icons.tsx

export interface Challenge {
  id: string;
  title: string;
  description: string;
  stepsGoal: number;
  rewardCoins: number;
  icon: LucideIcon;
  prizeImageUrl?: string; // Placeholder for actual Noon gift card image
  prizePromoCode?: string; // Placeholder for promo code
  primaryColor: string; // e.g., 'bg-orange-500'
  textColor: string; // e.g., 'text-white'
  buttonBgColor: string; // e.g., 'bg-white'
  buttonTextColor: string; // e.g., 'text-orange-600'
}

export const challenges: Challenge[] = [
  {
    id: 'challenge_2k_steps',
    title: 'Quick Sprint',
    description: 'Complete 2,000 steps today!',
    stepsGoal: 2000,
    rewardCoins: 100,
    icon: Footprints,
    prizeImageUrl: '/placeholder-noon-card-front.png', // You'll need to upload this image
    prizePromoCode: 'NOON-SPRINT-123',
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
    prizeImageUrl: '/placeholder-noon-card-front.png', // You'll need to upload this image
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
    icon: Award, // Using Award for the biggest challenge
    prizeImageUrl: '/placeholder-noon-card-front.png', // You'll need to upload this image
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
