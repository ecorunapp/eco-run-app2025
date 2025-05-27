
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Challenge } from '@/data/challenges';
import GiftCardDisplay from './GiftCardDisplay';
import { Confetti, Gift } from '@/components/icons';
import { useEcoCoins } from '@/context/EcoCoinsContext';
import { toast as sonnerToast } from 'sonner';

interface ChallengeWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  userGiftCardId: string | null; // This ID refers to the record in user_gift_cards table
}

const ChallengeWonModal: React.FC<ChallengeWonModalProps> = ({ isOpen, onClose, challenge, userGiftCardId }) => {
  const [isScratched, setIsScratched] = useState(false);
  // isGiftCardActivated is now handled by GiftCardDisplay's internal logic based on assignedAt
  const { claimGiftCardPrize } = useEcoCoins(); // This marks the card as 'used' typically
  const [assignedTimeForModal, setAssignedTimeForModal] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (isOpen) {
      // When modal opens for a new win, set/reset assigned time
      setAssignedTimeForModal(new Date().toISOString());
      // In a real app, you might fetch the userGiftCard details here if userGiftCardId
      // is available and has an `assigned_at` from the database.
      // For now, we assume the prize is freshly assigned.
    }
  }, [isOpen, userGiftCardId]);


  const handleScratch = () => {
    setIsScratched(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsScratched(false);
      }, 300); 
    }
  }, [isOpen]);


  const handlePromoCodeCopied = async (copiedCode: string) => {
    // This callback is now only invoked by GiftCardDisplay when the code is unlocked and copied.
    if (userGiftCardId && challenge.giftCardKey) { // giftCardKey might be part of challenge or fetched card details
      const claimedSuccessfully = await claimGiftCardPrize(userGiftCardId); // This likely sets status to 'used'
      if (claimedSuccessfully) {
        // Sonner toast for copy success is already in GiftCardDisplay
        // Perhaps a specific toast for "claiming" the prize in EcoRun system
        sonnerToast.success("Prize Claimed!", { description: `You've successfully initiated the claim for: ${challenge.title || 'your reward'}.` }); // Changed prizeTitle to title
        onClose(); 
      } else {
         sonnerToast.error("Claim Error", { description: "Could not finalize prize claim. Please try again or contact support." });
      }
    } else {
      console.error("handlePromoCodeCopied called without a valid userGiftCardId or necessary prize identifiers.");
      sonnerToast.error("Claim Initiation Failed", { description: "Could not process claim. Please contact support." });
    }
  };
  
  const frontImage = (challenge.prizeImageUrl && challenge.prizeImageUrl.trim() !== '') 
    ? challenge.prizeImageUrl 
    : '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png';
  
  const backImage = '/lovable-uploads/1c8416bb-42a2-4d8c-93f1-9345404ac7d5.png';

  // Determine if the card is unlocked for the purpose of the "Close" button text
  const isConsideredUnlockedForButton = () => {
    const unlockDate = new Date(new Date(assignedTimeForModal).getTime() + 24 * 60 * 60 * 1000);
    return new Date() >= unlockDate;
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
            <div className="animate-scale-in w-full flex flex-col items-center space-y-3">
              <GiftCardDisplay 
                frontImageUrl={frontImage} 
                backImageUrl={backImage} 
                promoCode={challenge.prizePromoCode || "NOON-XXX-XXX"} // Pass the actual code
                assignedAt={assignedTimeForModal} // Pass the assignment time
                onCodeCopied={handlePromoCodeCopied}
              />
              {/* Removed simulate activation button; GiftCardDisplay handles this */}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center pb-6">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="bg-white/20 text-white hover:bg-white/30 border-white/30 font-semibold px-8"
          >
            {isScratched && isConsideredUnlockedForButton() ? 'Claimed & Close' : isScratched ? 'Close for Now' : 'Maybe Later'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeWonModal;
