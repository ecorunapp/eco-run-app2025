
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '@/data/challenges';
import { Button } from '@/components/ui/button';
import { ArrowRight, Coins, Lock } from '@/components/icons'; // Added Lock icon

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const navigate = useNavigate();

  const handleJoinChallenge = () => {
    // Navigate to ActivitiesPage and pass challenge id in state
    // This allows ActivitiesPage to know which challenge to start
    navigate('/activities', { state: { challengeId: challenge.id } });
  };

  // For now, we just use isLockedInitially. A real implementation might check user status.
  const isLocked = challenge.isLockedInitially;

  return (
    <div className={`p-6 rounded-xl shadow-lg ${isLocked ? 'bg-gray-500 opacity-70' : challenge.primaryColor} ${challenge.textColor} flex flex-col justify-between animate-fade-in-up`}>
      <div>
        <div className="flex items-center mb-2">
          {isLocked && <Lock size={28} className="mr-3 text-yellow-400" />}
          {!isLocked && <challenge.icon size={28} className="mr-3" />}
          <h3 className="text-2xl font-bold">{challenge.title}</h3>
        </div>
        <p className="text-sm mb-4 opacity-90">{challenge.description}</p>
        
        {isLocked && challenge.unlockDescription && (
          <div className="mb-4 p-3 bg-black/30 rounded-md">
            <p className="text-sm font-semibold text-yellow-300">{challenge.unlockDescription}</p>
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
        className={`${isLocked ? 'bg-gray-600 cursor-not-allowed' : `${challenge.buttonBgColor} ${challenge.buttonTextColor} hover:${challenge.buttonBgColor}/90`} w-full font-semibold`}
      >
        {isLocked ? (
          <>
            <Lock size={20} className="mr-2" />
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

