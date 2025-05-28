import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '@/data/challenges';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Coins, Lock, MapPin, Play, CheckCircle, Footprints, X } from '@/components/icons';
import EcotabActivationModal from './EcotabActivationModal';
import StaticChallengeMap from './StaticChallengeMap';
import AnimatedProgressIcon from './AnimatedProgressIcon';
import ChallengeTimer from './ChallengeTimer';
import { LatLngTuple } from 'leaflet';
import { motion, PanInfo } from 'framer-motion';

interface ChallengeCardProps {
  challenge: Challenge;
  activityStatus?: 'active' | 'paused' | 'not_started' | 'completed';
  currentSteps?: number;
  pausedLocationName?: string;
  pausedLocationCoords?: LatLngTuple;
  kilometersCoveredAtPause?: number;
  completedLocationName?: string;
  completedLocationCoords?: LatLngTuple;
  onRemoveCompleted?: () => void;
  expiresAt?: string;
  isPersonalized?: boolean;
}

const ECOTAB_CHALLENGE_ID = 'challenge_20k_ecotab_300aed';

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  activityStatus = 'not_started',
  currentSteps = 0,
  pausedLocationName,
  pausedLocationCoords,
  kilometersCoveredAtPause,
  completedLocationName,
  completedLocationCoords,
  onRemoveCompleted,
  expiresAt,
  isPersonalized = false,
}) => {
  const navigate = useNavigate();
  const [showEcotabModal, setShowEcotabModal] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const isLocked = challenge.isLockedInitially && 
                   activityStatus !== 'paused' && 
                   activityStatus !== 'active' && 
                   activityStatus !== 'completed';
  const isUltimateEcotabChallenge = challenge.id === ECOTAB_CHALLENGE_ID;
  const isCompleted = activityStatus === 'completed';

  // Safely render challenge icon - ensure it's a valid React component
  const ChallengeIcon = challenge.icon && typeof challenge.icon === 'function' ? challenge.icon : null;

  let cardBgClass = '';
  let cardTextColorClass = challenge.textColor;
  let buttonClass = '';
  let titleIconClass = '';
  let unlockDescBgClass = 'bg-black/30';
  let unlockDescTextClass = 'text-yellow-300';

  if (isExpired && isPersonalized && !isCompleted) {
    cardBgClass = 'bg-gray-600 opacity-60';
    cardTextColorClass = 'text-gray-300';
    buttonClass = 'bg-gray-700 text-gray-400';
    titleIconClass = 'text-gray-400';
  } else if (isLocked) {
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
    if (isExpired && isPersonalized && !isCompleted) {
      console.log("Challenge expired:", challenge.title);
      return;
    }
    if (activityStatus === 'completed') {
      console.log("Challenge already completed:", challenge.title);
      return;
    }
    if (isUltimateEcotabChallenge && activityStatus !== 'paused' && !isLocked) {
      navigate('/order-ecotab');
    } else if (activityStatus === 'paused') {
      navigate('/activities', {
        state: {
          challengeId: challenge.id,
          resume: true,
          initialSteps: currentSteps,
        }
      });
    } else if (!isLocked && !isExpired) {
      navigate('/activities', { state: { challengeId: challenge.id } });
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!isCompleted || !onRemoveCompleted) return;
    
    if (info.offset.x > 150) {
      setIsRemoving(true);
      onRemoveCompleted();
    } else {
      setDragX(0);
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (!isCompleted || !onRemoveCompleted) return;
    
    if (info.offset.x > 0) {
      setDragX(info.offset.x);
    }
  };

  const handleExpire = () => {
    setIsExpired(true);
  };

  const progressPercentage = challenge.stepsGoal > 0 && currentSteps > 0 && (activityStatus === 'paused' || activityStatus === 'active' || activityStatus === 'completed')
    ? Math.min(100, (currentSteps / challenge.stepsGoal) * 100)
    : (activityStatus === 'completed' ? 100 : 0);

  const remainingSteps = (activityStatus === 'paused' || activityStatus === 'active') && challenge.stepsGoal > currentSteps
    ? challenge.stepsGoal - currentSteps
    : 0;
  
  const kilometersToGoal = remainingSteps > 0 && (activityStatus === 'paused' || activityStatus === 'active')
    ? parseFloat((remainingSteps * 0.000762).toFixed(2))
    : 0;

  // Safely check if coordinates are valid arrays
  const hasValidPausedCoords = pausedLocationCoords && 
    Array.isArray(pausedLocationCoords) && 
    pausedLocationCoords.length === 2 && 
    typeof pausedLocationCoords[0] === 'number' && 
    typeof pausedLocationCoords[1] === 'number';

  const hasValidCompletedCoords = completedLocationCoords && 
    Array.isArray(completedLocationCoords) && 
    completedLocationCoords.length === 2 && 
    typeof completedLocationCoords[0] === 'number' && 
    typeof completedLocationCoords[1] === 'number';

  const cardContent = (
    <div className={`p-6 rounded-xl shadow-lg ${cardBgClass} ${cardTextColorClass} flex flex-col justify-between animate-fade-in-up relative overflow-hidden`}>
      {/* Timer for personalized challenges */}
      {isPersonalized && expiresAt && !isCompleted && !isUltimateEcotabChallenge && (
        <div className="absolute top-4 right-4">
          <ChallengeTimer expiresAt={expiresAt} onExpire={handleExpire} />
        </div>
      )}

      {/* Swipe indicator for completed challenges */}
      {isCompleted && onRemoveCompleted && (
        <div 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-white/70 transition-opacity duration-200"
          style={{ opacity: Math.min(dragX / 100, 1) }}
        >
          <span className="text-sm font-medium">Remove</span>
          <X size={20} />
        </div>
      )}

      <div>
        <div className="flex items-center mb-2">
          {isLocked && <Lock size={28} className={`mr-3 ${titleIconClass}`} />}
          {activityStatus === 'completed' && <CheckCircle size={28} className="mr-3" />}
          {!isLocked && activityStatus !== 'completed' && ChallengeIcon && <ChallengeIcon size={28} className="mr-3" />}
          <h3 className="text-2xl font-bold">{challenge.title}</h3>
        </div>
        <p className="text-sm mb-4 opacity-90">{challenge.description}</p>
        
        {isLocked && challenge.unlockDescription && (
          <div className={`mb-4 p-3 ${unlockDescBgClass} rounded-md`}>
            <p className={`text-sm font-semibold ${unlockDescTextClass}`}>{challenge.unlockDescription}</p>
          </div>
        )}

        {isExpired && isPersonalized && !isCompleted && (
          <div className="mb-4 p-3 bg-red-900/30 rounded-md">
            <p className="text-sm font-semibold text-red-300">Challenge Expired - Wait for tomorrow's challenges!</p>
          </div>
        )}

        {(activityStatus === 'paused' || activityStatus === 'active') && challenge.stepsGoal > 0 && (
          <div className="mb-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 opacity-80">
                <span>Progress</span>
                <span>{currentSteps.toLocaleString()} / {challenge.stepsGoal.toLocaleString()} steps</span>
              </div>
              <div className="relative w-full">
                <Progress value={progressPercentage} className={`h-2.5 ${activityStatus === 'paused' ? '[&>div]:bg-yellow-400 bg-white/30' : '[&>div]:bg-green-400 bg-white/30'}`} />
                { (activityStatus === 'active' || activityStatus === 'paused') && progressPercentage > 0 && progressPercentage < 100 && (
                  <AnimatedProgressIcon progressPercentage={progressPercentage} />
                )}
              </div>
              
              {currentSteps > 0 && (
                <div className="flex items-center text-xs text-white mt-1">
                  <Footprints size={14} className="mr-1" /> 
                  Steps completed: {currentSteps.toLocaleString()}
                </div>
              )}

              {remainingSteps > 0 && (
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
               <div className="text-xs opacity-80 mt-1">
                Distance covered: {kilometersCoveredAtPause.toLocaleString()} km
              </div>
            )}
            {activityStatus === 'paused' && hasValidPausedCoords && (
              <div className="mt-3 h-32 w-full rounded-lg overflow-hidden border border-white/20">
                <StaticChallengeMap
                  center={pausedLocationCoords}
                  locationName={pausedLocationName}
                  zoom={15}
                />
              </div>
            )}
          </div>
        )}
        
        {activityStatus === 'completed' && (
          <div className="mb-4 space-y-2">
            <p className="text-lg font-semibold text-center">Challenge Completed!</p>
            {hasValidCompletedCoords && (
              <div className="h-32 w-full rounded-lg overflow-hidden border border-white/20">
                 <StaticChallengeMap 
                  center={completedLocationCoords} 
                  locationName={completedLocationName} 
                  zoom={15} 
                />
              </div>
            )}
            {completedLocationName && !hasValidCompletedCoords && (
               <div className="flex items-center text-sm p-2 bg-black/20 rounded-md justify-center">
                <MapPin size={16} className="mr-2" />
                Completed at: {completedLocationName}
              </div>
            )}
          </div>
        )}

        {!isLocked && activityStatus !== 'paused' && activityStatus !== 'completed' && !isExpired && (
          <div className="flex items-center text-sm font-semibold mb-4">
            <Coins size={18} className="mr-2 opacity-90" />
            <span>Reward: {challenge.rewardCoins} EcoCoins</span>
          </div>
        )}
      </div>
      <Button
        onClick={handleChallengeAction}
        disabled={(isLocked && !isUltimateEcotabChallenge) || activityStatus === 'completed' || (isExpired && isPersonalized && !isCompleted)}
        className={`${buttonClass} w-full font-semibold mt-auto`}
      >
        {isExpired && isPersonalized && !isCompleted ? (
          <>
            Challenge Expired
          </>
        ) : activityStatus === 'completed' ? (
          <>
            <CheckCircle size={20} className="mr-2" />
            Completed
          </>
        ) : activityStatus === 'paused' ? (
          <>
            <Play size={20} className="mr-2" />
            Resume Challenge
          </>
        ) :isUltimateEcotabChallenge && !isLocked ? (
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
  );

  // Wrap completed challenges with motion.div for swipe functionality
  if (isCompleted && onRemoveCompleted && !isRemoving) {
    return (
      <>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 300 }}
          dragElastic={0.2}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="cursor-grab active:cursor-grabbing"
        >
          {cardContent}
        </motion.div>
        <EcotabActivationModal
          isOpen={showEcotabModal}
          onClose={() => setShowEcotabModal(false)}
          challengeTitle={challenge.title}
        />
      </>
    );
  }

  return (
    <>
      {cardContent}
      <EcotabActivationModal
        isOpen={showEcotabModal}
        onClose={() => setShowEcotabModal(false)}
        challengeTitle={challenge.title}
      />
    </>
  );
};

export default ChallengeCard;
