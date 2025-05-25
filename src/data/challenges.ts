import { LucideIcon, Footprints, Award, Lock } from '@/components/icons'; // Using our icons.tsx // Added Lock icon

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
  isLockedInitially?: boolean; // New property for initial lock state
  unlockDescription?: string; // New property for unlock instructions
}

export const challenges: Challenge[] = [
  {
    id: 'challenge_2k_steps',
    title: 'Noon 10 AED Sprint',
    description: 'Complete 2,000 steps & win a 10 AED Noon Card!',
    stepsGoal: 2000,
    rewardCoins: 50,
    icon: Footprints,
    prizeImageUrl: '/noon-10aed-card-front.png',
    prizePromoCode: 'NOON10-SPRINT',
    primaryColor: 'bg-orange-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-orange-600',
  },
  {
    id: 'challenge_5k_steps',
    title: 'Daily 5K Grind',
    description: 'Push yourself to 5,000 steps today & win a 10 AED Noon Card!',
    stepsGoal: 5000,
    rewardCoins: 75,
    icon: Footprints,
    prizeImageUrl: '/noon-10aed-card-front.png',
    prizePromoCode: 'NOON10-DAILYGRIND',
    primaryColor: 'bg-blue-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-blue-600',
  },
  {
    id: 'challenge_5k_noon_10aed', 
    title: '5K Steps for 10 AED',
    description: 'Achieve 5,000 steps and get a 10 AED Noon Card!',
    stepsGoal: 5000,
    rewardCoins: 75, 
    icon: Footprints,
    prizeImageUrl: '/noon-10aed-card-front.png', 
    prizePromoCode: 'NOON10-5KSTEP',
    primaryColor: 'bg-green-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-green-600',
  },
  {
    id: 'challenge_7.5k_noon_20aed', 
    title: 'Power Walk for 20 AED',
    description: 'Complete 7,500 steps for a 20 AED Noon Card!',
    stepsGoal: 7500,
    rewardCoins: 120, 
    icon: Award, 
    prizeImageUrl: '/placeholder-noon-card-front.png', 
    prizePromoCode: 'NOON20-POWER',
    primaryColor: 'bg-purple-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-purple-600',
  },
  {
    id: 'challenge_10k_steps',
    title: 'Marathon Prep',
    description: 'Conquer 10,000 steps today!',
    stepsGoal: 10000,
    rewardCoins: 150,
    icon: Award,
    prizeImageUrl: '/placeholder-noon-card-front.png', // Assuming still placeholder
    prizePromoCode: 'NOON-MARATHON-PRO', // Assuming still placeholder code
    primaryColor: 'bg-teal-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-teal-600',
  },
  {
    id: 'challenge_20k_ecotab_300aed',
    title: 'Ultimate 20K Ecotab Challenge',
    description: 'Conquer 20,000 steps & win a 300 AED Noon Card! Requires Ecotab activation.',
    stepsGoal: 20000,
    rewardCoins: 1500, // Significant reward for a big challenge + prize
    icon: Award, // Or a new "epic" icon if available
    prizeImageUrl: '/placeholder-noon-card-300aed.png', // You'll need to upload this image
    prizePromoCode: 'NOON300-ULTIMATE',
    primaryColor: 'bg-gray-700', // Distinct color for this special challenge
    textColor: 'text-yellow-300',
    buttonBgColor: 'bg-yellow-400',
    buttonTextColor: 'text-gray-800',
    isLockedInitially: true,
    unlockDescription: 'Activate your Ecotab card to unlock this challenge.',
  },
];

export const getChallengeById = (id: string): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === id);
};
