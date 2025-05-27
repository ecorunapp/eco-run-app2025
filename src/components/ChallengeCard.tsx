import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '@/data/challenges';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Coins, Lock, MapPin, Play, CheckCircle } from '@/components/icons';
import EcotabActivationModal from './EcotabActivationModal';
import StaticChallengeMap from './StaticChallengeMap';
import { LatLngTuple } from 'leaflet';

interface ChallengeCardProps {
  challenge: Challenge;
  activityStatus?: 'active' | 'paused' | 'not_started' | 'completed';
  currentSteps?: number;
  pausedLocationName?: string;
  kilometersCoveredAtPause?: number;
  completedLocationName?: string;
  completedLocationCoords?: LatLngTuple;
}

const ECOTAB_CHALLENGE_ID = 'challenge_20k_ecotab_300aed';

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  activityStatus = 'not_started',
  currentSteps = 0,
  pausedLocationName,
  kilometersCoveredAtPause,
  completedLocationName,
  completedLocationCoords,
}) => {
  const navigate = useNavigate();
  const [showEcotabModal, setShowEcotabModal] = useState(false);

  const isLocked = challenge.isLockedInitially && 
                   activityStatus !== 'paused' && 
                   activityStatus !== 'active' && 
                   activityStatus !== 'completed';
  const isUltimateEcotabChallenge = challenge.id === ECOTAB_CHALLENGE_ID;

  let cardBgClass = '';
  let cardTextColorClass = challenge.textColor;
  let buttonClass = '';
  let titleIconClass = '';
  let unlockDescBgClass = 'bg-black/30';
  let unlockDescTextClass = 'text-yellow-300';

  if (isLocked) {
    if (isUltimateEcotabChallenge) {
      cardBgClass = 'bg-gradient-to-br from-yellow-400 to-amber-600';
      cardTextColorClass = 'text-black';
      buttonClass = 'bg-yellow-400 text-amber-900 hover:bg-yellow-500';
      titleIconClass = 'text-black';
      unlockDescBgClass = 'bg-black/40';
      unlockDescTextClass = 'text-yellow-200';
    } else {
      cardBgClass = 'bg-gray-500 opacity-70';
      buttonClass = 'bg-gray-600 text-white';
      titleIconClass = 'text-yellow-400';
    }
  } else if (activityStatus === 'completed') {
    cardBgClass = 'bg-green-600';
    cardTextColorClass = 'text-white';
    buttonClass = `bg-green-700 text-white hover:bg-green-800`;
    titleIconClass = 'text-white';
  } else if (activityStatus === 'paused') {
    cardBgClass = challenge.primaryColor; 
    cardTextColorClass = challenge.textColor;
    buttonClass = `bg-eco-accent text-eco-dark hover:bg-eco-accent/80`;
  } else {
    cardBgClass = challenge.primaryColor;
    cardTextColorClass = challenge.textColor;
    buttonClass = `${challenge.buttonBgColor} ${challenge.buttonTextColor} hover:${challenge.buttonBgColor}/90`;
  }

  const handleChallengeAction = () => {
    if (activityStatus === 'completed') {
      console.log("Challenge already completed:", challenge.title);
      return;
    }
    if (isUltimateEcotabChallenge && activityStatus !== 'paused') {
      setShowEcotabModal(true);
    } else if (activityStatus === 'paused') {
      navigate('/activities', {
        state: {
          challengeId: challenge.id,
          resume: true,
          initialSteps: currentSteps,
        }
      });
    } else if (!isLocked) {
      navigate('/activities', { state: { challengeId: challenge.id } });
    }
  };

  const progressPercentage = challenge.stepsGoal > 0 && currentSteps > 0 && (activityStatus === 'paused' || activityStatus === 'active')
    ? Math.min(100, (currentSteps / challenge.stepsGoal) * 100)
    : (activityStatus === 'completed' ? 100 : 0);

  const remainingSteps = (activityStatus === 'paused' && challenge.stepsGoal > currentSteps)
    ? challenge.stepsGoal - currentSteps
    : 0;
  
  const kilometersToGoal = remainingSteps > 0 && activityStatus === 'paused' 
    ? parseFloat((remainingSteps * 0.000762).toFixed(2)) 
    : 0;

  return (
    <>
      <div className={`p-6 rounded-xl shadow-lg ${cardBgClass} ${cardTextColorClass} flex flex-col justify-between animate-fade-in-up`}>
        <div>
          <div className="flex items-center mb-2">
            {isLocked && <Lock size={28} className={`mr-3 ${titleIconClass}`} />}
            {activityStatus === 'completed' && <CheckCircle size={28} className="mr-3" />}
            {!isLocked && activityStatus !== 'completed' && challenge.icon && <challenge.icon size={28} className="mr-3" />}
            <h3 className="text-2xl font-bold">{challenge.title}</h3>
          </div>
          <p className="text-sm mb-4 opacity-90">{challenge.description}</p>
          
          {isLocked && challenge.unlockDescription && (
            <div className={`mb-4 p-3 ${unlockDescBgClass} rounded-md`}>
              <p className={`text-sm font-semibold ${unlockDescTextClass}`}>{challenge.unlockDescription}</p>
            </div>
          )}

          {(activityStatus === 'paused' || activityStatus === 'active') && challenge.stepsGoal > 0 && (
            <div className="mb-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 opacity-80">
                  <span>Progress</span>
                  <span>{currentSteps.toLocaleString()} / {challenge.stepsGoal.toLocaleString()} steps</span>
                </div>
                <Progress value={progressPercentage} className={`h-2.5 ${activityStatus === 'paused' ? '[&>div]:bg-yellow-400 bg-white/30' : '[&>div]:bg-green-400 bg-white/30'}`} />
                {remainingSteps > 0 && activityStatus === 'paused' && (
                   <p className="text-xs text-right mt-1 opacity-80">{remainingSteps.toLocaleString()} steps ({kilometersToGoal} km) to go</p>
                )}
              </div>
              {activityStatus === 'paused' && pausedLocationName && (
                <div className="flex items-center text-xs p-2 bg-black/20 rounded-md">
                  <MapPin size={16} className="mr-2 text-yellow-400" />
                  Paused near: {pausedLocationName}
                </div>
              )}
              {activityStatus === 'paused' && kilometersCoveredAtPause !== undefined && kilometersCoveredAtPause > 0 && (
                 <div className="text-xs opacity-80">
                  Distance covered: {kilometersCoveredAtPause.toLocaleString()} km
                </div>
              )}
            </div>
          )}
          
          {activityStatus === 'completed' && (
            <div className="mb-4 space-y-2">
              <p className="text-lg font-semibold text-center">Challenge Completed!</p>
              {completedLocationCoords && (
                <div className="h-32 w-full rounded-lg overflow-hidden border border-white/20">
                   <StaticChallengeMap 
                    center={completedLocationCoords} 
                    locationName={completedLocationName} 
                    zoom={15} 
                  />
                </div>
              )}
              {completedLocationName && !completedLocationCoords && (
                 <div className="flex items-center text-sm p-2 bg-black/20 rounded-md justify-center">
                  <MapPin size={16} className="mr-2" />
                  Completed at: {completedLocationName}
                </div>
              )}
            </div>
          )}

          {!isLocked && activityStatus !== 'paused' && activityStatus !== 'completed' && (
            <div className="flex items-center text-sm font-semibold mb-4">
              <Coins size={18} className="mr-2 opacity-90" />
              <span>Reward: {challenge.rewardCoins} EcoCoins</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleChallengeAction}
          disabled={(isLocked && !isUltimateEcotabChallenge) || activityStatus === 'completed'}
          className={`${buttonClass} w-full font-semibold mt-auto`}
        >
          {activityStatus === 'completed' ? (
            <>
              <CheckCircle size={20} className="mr-2" />
              Completed
            </>
          ) : activityStatus === 'paused' ? (
            <>
              <Play size={20} className="mr-2" />
              Resume Challenge
            </>
          ) :isUltimateEcotabChallenge ? (
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
      {isUltimateEcotabChallenge && activityStatus !== 'completed' && (
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
