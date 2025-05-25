
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '@/data/challenges';
import { Button } from '@/components/ui/button';
import { ArrowRight, Coins, Lock } from '@/components/icons';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const navigate = useNavigate();
  const isLocked = challenge.isLockedInitially; // In a real app, this might derive from user status
  const isUltimateEcotabChallenge = challenge.id === 'challenge_20k_ecotab_300aed';

  let cardBgClass = '';
  let cardTextColorClass = challenge.textColor; // Default text color from challenge data
  let buttonClass = '';
  let titleIconClass = ''; // For the Lock icon next to the title
  let unlockDescBgClass = 'bg-black/30'; // Default for unlock description box
  let unlockDescTextClass = 'text-yellow-300'; // Default for unlock description text

  if (isLocked) {
    if (isUltimateEcotabChallenge) {
      // Golden theme for the special locked "Ultimate Ecotab Challenge"
      cardBgClass = 'bg-gradient-to-br from-yellow-400 to-amber-600';
      cardTextColorClass = 'text-black'; // Override text color for better contrast on gold
      buttonClass = 'bg-yellow-400 text-amber-900 hover:bg-yellow-500 cursor-not-allowed'; // Golden button
      titleIconClass = 'text-black'; // Lock icon next to title on golden background
      unlockDescBgClass = 'bg-black/40'; // Slightly darker overlay for readability on gold
      unlockDescTextClass = 'text-yellow-200'; // Adjusted text color for unlock description
    } else {
      // Default style for other locked cards
      cardBgClass = 'bg-gray-500 opacity-70';
      // cardTextColorClass remains challenge.textColor, applied over the semi-transparent gray
      buttonClass = 'bg-gray-600 text-white cursor-not-allowed'; // Default locked button
      titleIconClass = 'text-yellow-400'; // Default Lock icon color for locked cards
    }
  } else {
    // Style for unlocked cards (uses data from challenges.ts)
    cardBgClass = challenge.primaryColor;
    cardTextColorClass = challenge.textColor;
    buttonClass = `${challenge.buttonBgColor} ${challenge.buttonTextColor} hover:${challenge.buttonBgColor}/90`;
    // No titleIconClass needed for unlocked cards as the Lock icon isn't shown
  }

  const handleJoinChallenge = () => {
    navigate('/activities', { state: { challengeId: challenge.id } });
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg ${cardBgClass} ${cardTextColorClass} flex flex-col justify-between animate-fade-in-up`}>
      <div>
        <div className="flex items-center mb-2">
          {isLocked && <Lock size={28} className={`mr-3 ${titleIconClass}`} />}
          {!isLocked && <challenge.icon size={28} className="mr-3" />} {/* Icon color will be cardTextColorClass */}
          <h3 className="text-2xl font-bold">{challenge.title}</h3>
        </div>
        <p className="text-sm mb-4 opacity-90">{challenge.description}</p>
        
        {isLocked && challenge.unlockDescription && (
          <div className={`mb-4 p-3 ${unlockDescBgClass} rounded-md`}>
            <p className={`text-sm font-semibold ${unlockDescTextClass}`}>{challenge.unlockDescription}</p>
          </div>
        )}

        {!isLocked && (
          <div className="flex items-center text-sm font-semibold mb-4">
            <Coins size={18} className="mr-2 opacity-90" />
            <span>Reward: {challenge.rewardCoins} EcoCoins</span>
          </div>
        )}
      </div>
      <Button
        onClick={handleJoinChallenge}
        disabled={isLocked}
        className={`${buttonClass} w-full font-semibold`}
      >
        {isLocked ? (
          <>
            <Lock size={20} className="mr-2" /> {/* Icon color from button's text color */}
            Challenge Locked
          </>
        ) : (
          <>
            Join Challenge
            <ArrowRight size={20} className="ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default ChallengeCard;
