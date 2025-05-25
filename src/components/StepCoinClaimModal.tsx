
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award } from '@/components/icons'; // Using Award icon as a placeholder

interface StepCoinClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinsToClaim: number;
  onClaim: (coins: number) => void;
}

const StepCoinClaimModal: React.FC<StepCoinClaimModalProps> = ({ isOpen, onClose, coinsToClaim, onClaim }) => {
  if (!isOpen || coinsToClaim <= 0) {
    return null;
  }

  const handleClaim = () => {
    onClaim(coinsToClaim);
    // onClose will be called from ActivitiesPage after successful claim
  };

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => { if (!openState) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-gray-800 text-white border-gray-700 rounded-lg shadow-xl">
        <DialogHeader className="pt-8 text-center">
          <div className="mx-auto mb-4 p-4 bg-gray-700 rounded-full w-fit animate-pulse">
            <Award size={40} className="text-yellow-400" />
          </div>
          <DialogTitle className="text-4xl font-bold mb-1">{coinsToClaim} EcoCoins</DialogTitle>
          <div className="mt-2 mb-3">
            <span className="inline-block bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-md">
              YOU WON!
            </span>
          </div>
          <DialogDescription className="text-xl text-gray-200 mt-1">
            Claim Your Prize!
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 text-center text-gray-300 px-6">
          Your {coinsToClaim} EcoCoin{coinsToClaim > 1 ? 's' : ''} will be credited to your wallet.
        </div>
        <DialogFooter className="sm:justify-center pb-8 px-6">
          <Button
            onClick={handleClaim}
            className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white font-bold py-3 text-lg rounded-md shadow-lg transition-all hover:shadow-xl transform hover:scale-105"
            size="lg"
          >
            Claim Prize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StepCoinClaimModal;
