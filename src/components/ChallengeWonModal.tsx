
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
      await claimGiftCardPrize(userGiftCardId);
      // Potentially add a toast message for successful claim initiation
    }
  };

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
                frontImageUrl={challenge.prizeImageUrl || '/placeholder-noon-card-front.png'} 
                backImageUrl="/placeholder-noon-card-back.png" 
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
