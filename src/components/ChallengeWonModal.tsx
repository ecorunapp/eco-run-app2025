
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Challenge } from '@/data/challenges';
import GiftCardDisplay from './GiftCardDisplay';
import { Confetti, Gift, RefreshCw } from '@/components/icons'; // Added RefreshCw
import { useEcoCoins } from '@/context/EcoCoinsContext';
import { toast as sonnerToast } from 'sonner';

interface ChallengeWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  userGiftCardId: string | null;
}

const ChallengeWonModal: React.FC<ChallengeWonModalProps> = ({ isOpen, onClose, challenge, userGiftCardId }) => {
  const [isScratched, setIsScratched] = useState(false);
  const [isGiftCardActivated, setIsGiftCardActivated] = useState(false); // New state for activation
  const { claimGiftCardPrize } = useEcoCoins();

  const handleScratch = () => {
    setIsScratched(true);
  };

  // Reset states when the modal is closed or challenge changes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsScratched(false);
        setIsGiftCardActivated(false); // Reset activation status
      }, 300); 
    }
  }, [isOpen]);

  const generalActivationInfo = "Your gift card typically activates within 24 hours. You'll be notified once it's ready.";
  const pendingCodeMessage = "Code will appear here after activation (approx. 24 hrs).";

  const handlePromoCodeCopied = async () => {
    if (!isGiftCardActivated) {
      sonnerToast.info("Activation Pending", { description: "Please wait for the gift card to be activated before claiming." });
      return;
    }
    if (userGiftCardId && challenge.giftCardKey) {
      const claimedSuccessfully = await claimGiftCardPrize(userGiftCardId);
      if (claimedSuccessfully) {
        onClose(); 
      }
    } else {
      console.error("handlePromoCodeCopied called without a valid userGiftCardId or challenge.giftCardKey.");
      sonnerToast.error("Claim Error", { description: "Could not initiate claim. Please contact support." });
    }
  };
  
  const simulateActivationCheck = () => {
    sonnerToast.info("Checking Status...", { description: "Simulating activation check..." });
    setTimeout(() => {
      setIsGiftCardActivated(true);
      sonnerToast.success("Gift Card Activated!", { description: "Your promo code is now visible." });
    }, 1500);
  };

  const frontImage = (challenge.prizeImageUrl && challenge.prizeImageUrl.trim() !== '') 
    ? challenge.prizeImageUrl 
    : '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png';
  
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
            <div className="animate-scale-in w-full flex flex-col items-center space-y-3">
              <GiftCardDisplay 
                frontImageUrl={frontImage} 
                backImageUrl={backImage} 
                promoCode={challenge.prizePromoCode || "NOON-XXX-XXX"}
                activationMessage={generalActivationInfo}
                onCodeCopied={handlePromoCodeCopied}
                isPromoCodeVisible={isGiftCardActivated}
                pendingActivationMessage={pendingCodeMessage}
              />
              {!isGiftCardActivated && (
                <Button
                  onClick={simulateActivationCheck}
                  variant="outline"
                  className="bg-yellow-400/20 text-yellow-100 hover:bg-yellow-500/30 border-yellow-400/50 font-semibold px-6"
                >
                  <RefreshCw size={16} className="mr-2 animate-spin-slow" />
                  Check Status (Simulate)
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center pb-6">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="bg-white/20 text-white hover:bg-white/30 border-white/30 font-semibold px-8"
          >
            {isScratched && isGiftCardActivated ? 'Claimed & Close' : isScratched ? 'Close for Now' : 'Maybe Later'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeWonModal;
