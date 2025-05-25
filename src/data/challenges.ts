
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
    id: 'challenge_5k_steps', // This ID is reused for the "replaced" challenge
    title: 'Daily 5K Grind', // Replaced "Steady Pace"
    description: 'Push yourself to 5,000 steps today!',
    stepsGoal: 5000,
    rewardCoins: 100, // Standard coin reward
    icon: Footprints,
    prizeImageUrl: '/placeholder-noon-card-front.png', // Generic placeholder
    prizePromoCode: 'NOON-GRIND-5K',
    primaryColor: 'bg-blue-500', // New color scheme
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-blue-600',
  },
  {
    id: 'challenge_5k_noon_10aed', // New challenge
    title: '5K Steps for 10 AED',
    description: 'Achieve 5,000 steps and get a 10 AED Noon Card!',
    stepsGoal: 5000,
    rewardCoins: 75, // Adjusted coins due to card prize
    icon: Footprints,
    prizeImageUrl: '/noon-10aed-card-front.png', // Specific 10 AED card image
    prizePromoCode: 'NOON10-5KSTEP',
    primaryColor: 'bg-green-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-green-600',
  },
  {
    id: 'challenge_7.5k_noon_20aed', // New challenge
    title: 'Power Walk for 20 AED',
    description: 'Complete 7,500 steps for a 20 AED Noon Card!',
    stepsGoal: 7500,
    rewardCoins: 120, // Higher reward for more steps & bigger prize
    icon: Award, // Using Award icon for a tougher challenge
    prizeImageUrl: '/placeholder-noon-card-front.png', // Placeholder, user can upload specific 20 AED card image
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
    rewardCoins: 150, // Slightly increased rewardCoins for 10k
    icon: Award,
    prizeImageUrl: '/placeholder-noon-card-front.png',
    prizePromoCode: 'NOON-MARATHON-PRO',
    primaryColor: 'bg-teal-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-teal-600',
  },
];

export const getChallengeById = (id: string): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === id);
};
