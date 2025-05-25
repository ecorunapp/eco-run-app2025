
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Challenge } from '@/data/challenges';
import GiftCardDisplay from './GiftCardDisplay'; // We will create this next
import { Confetti, Gift } from '@/components/icons'; // Using our icons.tsx

interface ChallengeWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
}

const ChallengeWonModal: React.FC<ChallengeWonModalProps> = ({ isOpen, onClose, challenge }) => {
  const [isScratched, setIsScratched] = useState(false);

  const handleScratch = () => {
    setIsScratched(true);
    // Potentially play a sound
  };

  // Reset scratch state when modal is closed or challenge changes
  React.useEffect(() => {
    if (!isOpen) {
      setIsScratched(false);
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <Confetti size={64} className="text-yellow-300 animate-pulse"/>
          </div>
          <DialogTitle className="text-3xl font-bold">Congratulations!</DialogTitle>
          <DialogDescription className="text-lg text-purple-200">
            You've completed the "{challenge.title}" challenge and won a prize!
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6 py-8 flex flex-col items-center justify-center">
          {!isScratched ? (
            <div 
              className="w-64 h-40 bg-yellow-400 rounded-lg shadow-xl flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-300"
              onClick={handleScratch}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleScratch()}
            >
              <Gift size={48} className="text-yellow-700 mb-2" />
              <p className="text-xl font-semibold text-yellow-800">Reveal Your Prize!</p>
              <p className="text-xs text-yellow-700">(Click to scratch)</p>
            </div>
          ) : (
            <GiftCardDisplay 
              frontImageUrl={challenge.prizeImageUrl || '/placeholder-noon-card-front.png'} 
              backImageUrl="/placeholder-noon-card-back.png" // You'll need to upload this
              promoCode={challenge.prizePromoCode || "NOON-XXX-XXX"}
            />
          )}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={onClose} 
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
          >
            Claim Later & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeWonModal;
