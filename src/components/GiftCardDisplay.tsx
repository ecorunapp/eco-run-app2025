
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Info, Lock, Clock } from '@/components/icons'; // Added Lock, Clock
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';
import { differenceInSeconds, formatDistanceToNowStrict, addHours } from 'date-fns';

interface GiftCardDisplayProps {
  frontImageUrl: string;
  backImageUrl: string;
  promoCode: string; // The actual promo code, display will manage visibility
  assignedAt: string; // ISO string timestamp of when the card was assigned/won
  onCodeCopied?: (promoCodeValue: string) => Promise<void>;
}

const GiftCardDisplay: React.FC<GiftCardDisplayProps> = ({ 
  frontImageUrl, 
  backImageUrl, 
  promoCode, 
  assignedAt,
  onCodeCopied,
}) => {
  const [showBack, setShowBack] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlockDate = useMemo(() => addHours(new Date(assignedAt), 24), [assignedAt]);

  useEffect(() => {
    const now = new Date();
    if (now >= unlockDate) {
      setIsUnlocked(true);
      setTimeRemaining('');
      return;
    }

    setIsUnlocked(false);
    const calculateTimeRemaining = () => {
      const currentNow = new Date();
      const secondsLeft = differenceInSeconds(unlockDate, currentNow);

      if (secondsLeft <= 0) {
        setIsUnlocked(true);
        setTimeRemaining('');
        if (intervalId) clearInterval(intervalId);
        return;
      }

      // Format HH:MM:SS
      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;
      setTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    calculateTimeRemaining(); // Initial call
    const intervalId = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [unlockDate, assignedAt]);

  const handleToggleView = () => {
    setShowBack(!showBack);
  };

  const handleCopyCodeAndClaim = async () => {
    if (!isUnlocked || !promoCode) {
      sonnerToast.info("Code Locked", { description: `This code will unlock in ${timeRemaining || formatDistanceToNowStrict(unlockDate, { addSuffix: true })}.` });
      return;
    }
    try {
      await navigator.clipboard.writeText(promoCode);
      sonnerToast.success("Promo Code Copied!", { description: "The code has been copied to your clipboard." });
      
      if (onCodeCopied) {
        await onCodeCopied(promoCode);
      }
    } catch (err) {
      sonnerToast.error("Copy Failed", { description: "Could not copy code. Please try manually." });
      console.error('Failed to copy text: ', err);
    }
  };

  const displayedPromoCode = isUnlocked ? promoCode : 'LOCKED';
  const canAttemptCopy = isUnlocked && !!promoCode;

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-800 rounded-lg shadow-xl w-full max-w-xs [perspective:1000px]">
      <div className="relative w-full aspect-[1.586] rounded-md overflow-hidden"> {/* This is the flipper container */}
        <div 
          className={cn(
            "relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]",
            showBack ? "[transform:rotateY(180deg)]" : ""
          )}
        >
          {/* Front of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] rounded-md overflow-hidden">
            <img
              src={frontImageUrl}
              alt="Gift Card Front"
              className="w-full h-full object-cover"
            />
             {!isUnlocked && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2">
                    <Lock size={32} className="text-yellow-400 mb-2" />
                    <p className="text-sm text-yellow-300 font-semibold text-center">Reward Locked</p>
                </div>
            )}
          </div>
          {/* Back of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-md overflow-hidden">
            <img
              src={backImageUrl}
              alt="Gift Card Back"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 p-3 text-center">
              {!isUnlocked && (
                <div className="flex flex-col items-center">
                  <Clock size={28} className="text-yellow-400 mb-2" />
                  <p className="text-sm text-gray-200 font-semibold mb-1">Code unlocks in:</p>
                  <p className="text-2xl font-mono font-bold text-white mb-2">{timeRemaining || 'Calculating...'}</p>
                  <p className="text-xs text-gray-300">Your reward will be available soon!</p>
                </div>
              )}
              
              {isUnlocked && promoCode && (
                <>
                  <p className="text-xs text-gray-300 mb-1">Promo Code:</p>
                  <p className="text-lg font-mono font-bold text-white break-all mb-2">{displayedPromoCode}</p>
                  <Button onClick={handleCopyCodeAndClaim} size="sm" variant="ghost" className="text-gray-200 hover:text-white" disabled={!canAttemptCopy}>
                    <Copy size={16} className="mr-2"/> Copy Code & Claim
                  </Button>
                </>
              )}
              {isUnlocked && !promoCode && (
                <div className="flex flex-col items-center">
                    <Info size={24} className="text-blue-400 mb-2" />
                    <p className="text-sm text-gray-200 font-semibold">Promo code details not available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Button onClick={handleToggleView} variant="outline" className="w-full text-gray-200 border-gray-500 hover:bg-gray-700">
        {showBack ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
        {showBack ? 'Show Front' : 'Reveal Details'}
      </Button>
      <p className="text-xs text-gray-400 text-center">
        This is a digital gift card. 
        {isUnlocked && promoCode ? " Copy the code to use it." : 
        !isUnlocked && timeRemaining ? ` Unlocks in ${timeRemaining}.` : 
        !isUnlocked ? ` Code will unlock in approximately ${formatDistanceToNowStrict(unlockDate, { addSuffix: false })}.` :
        " Details will be shown on the back."}
      </p>
    </div>
  );
};

export default GiftCardDisplay;
