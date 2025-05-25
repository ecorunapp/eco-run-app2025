
import { LucideIcon, Footprints, Award, Lock } from '@/components/icons';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  stepsGoal: number;
  rewardCoins: number; // EcoCoins initially awarded upon completion
  icon: LucideIcon;
  prizeImageUrl?: string;
  prizePromoCode?: string; // Generic promo code for display
  primaryColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  isLockedInitially?: boolean;
  unlockDescription?: string;
  giftCardKey?: string; // Key to link to the 'gift_cards' table for specific card details
  // associatedClaimCost is implicitly rewardCoins for gift card challenges
}

export const challenges: Challenge[] = [
  {
    id: 'challenge_100_steps_5aed',
    title: 'Quick 5 AED Dash',
    description: 'Complete 100 steps & win a 5 AED Noon Card!',
    stepsGoal: 100,
    rewardCoins: 25, // 5 AED card = 25 EcoCoins
    icon: Footprints,
    prizeImageUrl: '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png', // Updated from placeholder
    prizePromoCode: 'NOON05-QUICKDASH',
    primaryColor: 'bg-cyan-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-cyan-600',
    giftCardKey: 'NOON_5_AED', // A new key for the 5 AED card
  },
  {
    id: 'challenge_2k_steps',
    title: 'Noon 10 AED Sprint',
    description: 'Complete 2,000 steps & win a 10 AED Noon Card!',
    stepsGoal: 2000,
    rewardCoins: 50, // 10 AED card = 50 EcoCoins
    icon: Footprints,
    prizeImageUrl: '/lovable-uploads/32e6c504-08cb-4a94-9cef-b68a4b9f65bb.png', // Kept as updated
    prizePromoCode: 'NOON10-SPRINT',
    primaryColor: 'bg-orange-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-orange-600',
    giftCardKey: 'NOON_10_AED',
  },
  {
    id: 'challenge_5k_steps',
    title: 'Daily 5K Grind (10 AED)',
    description: 'Push yourself to 5,000 steps today & win a 10 AED Noon Card!',
    stepsGoal: 5000,
    rewardCoins: 50, // 10 AED card = 50 EcoCoins
    icon: Footprints,
    prizeImageUrl: '/lovable-uploads/32e6c504-08cb-4a94-9cef-b68a4b9f65bb.png', // Kept as updated
    prizePromoCode: 'NOON10-DAILYGRIND',
    primaryColor: 'bg-blue-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-blue-600',
    giftCardKey: 'NOON_10_AED',
  },
  {
    id: 'challenge_5k_noon_10aed',
    title: '5K Steps for 10 AED',
    description: 'Achieve 5,000 steps and get a 10 AED Noon Card!',
    stepsGoal: 5000,
    rewardCoins: 50, // 10 AED card = 50 EcoCoins
    icon: Footprints,
    prizeImageUrl: '/lovable-uploads/32e6c504-08cb-4a94-9cef-b68a4b9f65bb.png', // Kept as updated
    prizePromoCode: 'NOON10-5KSTEP',
    primaryColor: 'bg-green-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-green-600',
    giftCardKey: 'NOON_10_AED',
  },
  {
    id: 'challenge_7.5k_noon_20aed',
    title: 'Power Walk for 20 AED',
    description: 'Complete 7,500 steps for a 20 AED Noon Card!',
    stepsGoal: 7500,
    rewardCoins: 100, // 20 AED card = 100 EcoCoins
    icon: Award,
    prizeImageUrl: '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png', // Updated from placeholder
    prizePromoCode: 'NOON20-POWER',
    primaryColor: 'bg-purple-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-purple-600',
    giftCardKey: 'NOON_20_AED',
  },
  {
    id: 'challenge_10k_steps',
    title: 'Marathon Prep (20 AED)',
    description: 'Conquer 10,000 steps today & win a 20 AED Noon Card!', // Assuming 20 AED prize
    stepsGoal: 10000,
    rewardCoins: 100, // 20 AED card = 100 EcoCoins
    icon: Award,
    prizeImageUrl: '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png', // Updated from placeholder
    prizePromoCode: 'NOON20-MARATHON-PRO',
    primaryColor: 'bg-teal-500',
    textColor: 'text-white',
    buttonBgColor: 'bg-white',
    buttonTextColor: 'text-teal-600',
    giftCardKey: 'NOON_20_AED',
  },
  {
    id: 'challenge_20k_ecotab_300aed',
    title: 'Ultimate 20K Ecotab Challenge',
    description: 'Conquer 20,000 steps & win a 300 AED Noon Card! Requires Ecotab activation.',
    stepsGoal: 20000,
    rewardCoins: 1500, // 300 AED card = 1500 EcoCoins (30 * 50)
    icon: Award,
    prizeImageUrl: '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png', // Updated from placeholder
    prizePromoCode: 'NOON300-ULTIMATE',
    primaryColor: 'bg-gray-700',
    textColor: 'text-yellow-300',
    buttonBgColor: 'bg-yellow-400',
    buttonTextColor: 'text-gray-800',
    isLockedInitially: true,
    unlockDescription: 'Activate your Ecotab card to unlock this challenge.',
    giftCardKey: 'NOON_300_AED_ULTIMATE',
  },
];

export const getChallengeById = (id: string): Challenge | undefined => {
  return challenges.find(challenge => challenge.id === id);
};
