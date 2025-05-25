
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, X, Copy as CopyIcon, Confetti } from '@/components/icons'; // Changed PartyPopper to Confetti
import { toast as sonnerToast } from "sonner";

interface ScratchRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: {
    name: string;
    imageUrl: string;
    code: string;
  };
  userName?: string;
}

const ScratchRewardModal: React.FC<ScratchRewardModalProps> = ({ isOpen, onClose, prize, userName }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    // Optional: Add a small confetti effect
    sonnerToast.success("Prize Revealed!", { icon: <Confetti className="text-yellow-400" /> }); // Changed PartyPopper to Confetti
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(prize.code)
      .then(() => {
        sonnerToast.success("Gift card code copied to clipboard!");
      })
      .catch(err => {
        sonnerToast.error("Failed to copy code.");
        console.error('Failed to copy text: ', err);
      });
  };

  const handleCloseModal = () => {
    setIsRevealed(false);
    setIsFlipped(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            Congratulations{userName ? `, ${userName}` : ''}!
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 text-center">
          {!isRevealed ? (
            <>
              <div className="my-8 flex justify-center">
                <Gift className="w-24 h-24 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-muted-foreground mb-6">You've won a special prize!</p>
              <Button onClick={handleReveal} size="lg" className="w-full bg-primary hover:bg-primary/90">
                Reveal Your Prize
              </Button>
            </>
          ) : (
            <div className="mt-4 mb-6">
              <p className="text-lg font-semibold mb-4">{prize.name}</p>
              {/* 3D Flip Card Container */}
              <div
                className="flip-card w-full max-w-[300px] h-[190px] mx-auto cursor-pointer group [perspective:1000px]"
                onClick={handleFlip}
              >
                <div
                  className={`flip-card-inner relative w-full h-full duration-700 [transform-style:preserve-3d] ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* Front of the card (Image) */}
                  <div className="flip-card-front absolute w-full h-full [backface-visibility:hidden] rounded-lg overflow-hidden shadow-lg">
                    <img src={prize.imageUrl} alt={prize.name} className="w-full h-full object-contain" />
                  </div>
                  {/* Back of the card (Code) */}
                  <div className="flip-card-back absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg shadow-lg flex flex-col items-center justify-center p-4">
                    <p className="text-sm text-gray-700 font-medium mb-1">Your Gift Card Code:</p>
                    <p className="text-2xl text-gray-800 font-bold tracking-wider mb-3">{prize.code}</p>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCopyToClipboard(); }} className="bg-white/80 hover:bg-white text-gray-700 border-gray-400">
                      <CopyIcon size={16} className="mr-2" /> Copy Code
                    </Button>
                    <p className="text-xs text-gray-600 mt-3">Click card to flip back</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="p-6 pt-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full" onClick={handleCloseModal}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchRewardModal;

