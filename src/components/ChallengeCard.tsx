
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '@/data/challenges';
import { Button } from '@/components/ui/button';
import { ArrowRight, Coins, Lock } from '@/components/icons';
import EcotabActivationModal from './EcotabActivationModal';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ECOTAB_CHALLENGE_ID = 'challenge_20k_ecotab_300aed';

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const navigate = useNavigate();
  const [showEcotabModal, setShowEcotabModal] = useState(false);

  const isLocked = challenge.isLockedInitially;
  const isUltimateEcotabChallenge = challenge.id === ECOTAB_CHALLENGE_ID;

  let cardBgClass = '';
  let cardTextColorClass = challenge.textColor; // Default text color from challenge data
  let buttonClass = '';
  let titleIconClass = ''; // For the Lock icon next to the title
  let unlockDescBgClass = 'bg-black/30'; // Default for unlock description box
  let unlockDescTextClass = 'text-yellow-300'; // Default for unlock description text

  if (isLocked) {
    if (isUltimateEcotabChallenge) {
      // Golden theme for the special "Ultimate Ecotab Challenge"
      // This card is "locked" in terms of rewards but its button is active for Ecotab activation
      cardBgClass = 'bg-gradient-to-br from-yellow-400 to-amber-600';
      cardTextColorClass = 'text-black'; // Override text color for better contrast on gold
      buttonClass = 'bg-yellow-400 text-amber-900 hover:bg-yellow-500'; // Golden button (no cursor-not-allowed)
      titleIconClass = 'text-black'; // Lock icon next to title on golden background
      unlockDescBgClass = 'bg-black/40'; // Slightly darker overlay for readability on gold
      unlockDescTextClass = 'text-yellow-200'; // Adjusted text color for unlock description
    } else {
      // Default style for other locked cards
      cardBgClass = 'bg-gray-500 opacity-70';
      buttonClass = 'bg-gray-600 text-white'; // Default locked button (disabled prop will handle cursor)
      titleIconClass = 'text-yellow-400'; // Default Lock icon color for locked cards
    }
  } else {
    // Style for unlocked cards (uses data from challenges.ts)
    cardBgClass = challenge.primaryColor;
    cardTextColorClass = challenge.textColor;
    buttonClass = `${challenge.buttonBgColor} ${challenge.buttonTextColor} hover:${challenge.buttonBgColor}/90`;
  }

  const handleJoinChallenge = () => {
    if (isUltimateEcotabChallenge) {
      setShowEcotabModal(true);
    } else if (!isLocked) {
      // For other challenges, only navigate if they are not locked
      navigate('/activities', { state: { challengeId: challenge.id } });
    }
    // If a non-Ecotab challenge is locked, the button is disabled, so this function isn't called.
  };

  return (
    <>
      <div className={`p-6 rounded-xl shadow-lg ${cardBgClass} ${cardTextColorClass} flex flex-col justify-between animate-fade-in-up`}>
        <div>
          <div className="flex items-center mb-2">
            {isLocked && <Lock size={28} className={`mr-3 ${titleIconClass}`} />}
            {!isLocked && challenge.icon && <challenge.icon size={28} className="mr-3" />}
            <h3 className="text-2xl font-bold">{challenge.title}</h3>
          </div>
          <p className="text-sm mb-4 opacity-90">{challenge.description}</p>
          
          {isLocked && challenge.unlockDescription && (
            <div className={`mb-4 p-3 ${unlockDescBgClass} rounded-md`}>
              <p className={`text-sm font-semibold ${unlockDescTextClass}`}>{challenge.unlockDescription}</p>
            </div>
          )}

          {!isLocked && ( // Show reward coins only if the challenge is generally unlocked
            <div className="flex items-center text-sm font-semibold mb-4">
              <Coins size={18} className="mr-2 opacity-90" />
              <span>Reward: {challenge.rewardCoins} EcoCoins</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleJoinChallenge}
          // Disable button if challenge is locked AND it's NOT the Ultimate Ecotab Challenge
          disabled={isLocked && !isUltimateEcotabChallenge}
          className={`${buttonClass} w-full font-semibold`}
        >
          {isUltimateEcotabChallenge ? (
            <>
             Activate Your EcoTab Card
              <ArrowRight size={20} className="ml-2" />
            </>
          ) : isLocked ? (
            <>
              <Lock size={20} className="mr-2" />
              Challenge Locked
            </>
          )
          : (
            <>
              Join Challenge
              <ArrowRight size={20} className="ml-2" />
            </>
          )}
        </Button>
      </div>
      {isUltimateEcotabChallenge && (
        <EcotabActivationModal
          isOpen={showEcotabModal}
          onClose={() => setShowEcotabModal(false)}
          challengeTitle={challenge.title}
        />
      )}
    </>
  );
};

export default ChallengeCard;

