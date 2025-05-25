
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Challenge } from '@/data/challenges';
import GiftCardDisplay from './GiftCardDisplay';
import { Confetti, Gift } from '@/components/icons';
import { useEcoCoins } from '@/context/EcoCoinsContext';

interface ChallengeWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  userGiftCardId: string | null;
}

const ChallengeWonModal: React.FC<ChallengeWonModalProps> = ({ isOpen, onClose, challenge, userGiftCardId }) => {
  const [isScratched, setIsScratched] = useState(false);
  const { claimGiftCardPrize } = useEcoCoins();

  const handleScratch = () => {
    setIsScratched(true);
    // Potentially play a sound effect here if desired
  };

  // Reset isScratched state when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Add a small delay to allow the closing animation to complete before resetting
      setTimeout(() => {
        setIsScratched(false);
      }, 300); 
    }
  }, [isOpen]);

  const activationMessage = "Card is activated within 12 hours. After activated you will get mail.";

  const handlePromoCodeCopied = async () => {
    if (userGiftCardId && challenge.giftCardKey) {
      const claimedSuccessfully = await claimGiftCardPrize(userGiftCardId);
      if (claimedSuccessfully) {
        // Toast for successful claim is handled within claimGiftCardPrize
        onClose(); // Close the modal on successful claim
      } else {
        // Toast for failed claim is also handled within claimGiftCardPrize
        // Modal remains open for user to review or if action is needed
        console.warn("Gift card claim was not successful. Modal remains open.");
      }
    } else {
      console.error("handlePromoCodeCopied called without a valid userGiftCardId or challenge.giftCardKey. This may happen if the challenge doesn't award a specific gift card or if there was an issue assigning it.");
      // Potentially show a toast to the user if this state is unexpected.
      // For now, we won't close the modal as the claim action couldn't be initiated.
    }
  };

  // Determine the correct front image URL, falling back to a placeholder if prizeImageUrl is empty or undefined
  const frontImage = (challenge.prizeImageUrl && challenge.prizeImageUrl.trim() !== '') 
    ? challenge.prizeImageUrl 
    : '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png';
  
  // Set the back image to the one user uploaded previously
  const backImage = '/lovable-uploads/1c8416bb-42a2-4d8c-93f1-9345404ac7d5.png';


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white transition-all duration-300 ease-in-out">
        <DialogHeader className="text-center pt-6">
          <div className="mx-auto mb-2">
            <Confetti size={56} className="text-yellow-300 animate-pulse"/>
          </div>
          <DialogTitle className="text-3xl font-bold">Congratulations!</DialogTitle>
          {!isScratched && (
            <DialogDescription className="text-lg text-purple-200 mt-1">
              You've completed the "{challenge.title}" challenge!
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="my-6 py-4 flex flex-col items-center justify-center min-h-[200px]">
          {!isScratched ? (
            <div 
              className="w-72 h-48 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-xl shadow-xl flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out p-6 text-center animate-fade-in"
              onClick={handleScratch}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleScratch()}
            >
              <Gift size={64} className="text-yellow-700 mb-3 drop-shadow-lg" />
              <p className="text-2xl font-bold text-white drop-shadow-md">Reveal Your Prize!</p>
              <p className="text-sm text-yellow-200 mt-1">(Click to unveil)</p>
            </div>
          ) : (
            <div className="animate-scale-in w-full">
              <GiftCardDisplay 
                frontImageUrl={frontImage} 
                backImageUrl={backImage} 
                promoCode={challenge.prizePromoCode || "NOON-XXX-XXX"}
                activationMessage={activationMessage}
                onCodeCopied={handlePromoCodeCopied}
              />
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center pb-6">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="bg-white/20 text-white hover:bg-white/30 border-white/30 font-semibold px-8"
          >
            {isScratched ? 'Close' : 'Maybe Later'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeWonModal;
