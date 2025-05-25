
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Confetti, Leaf } from '@/components/icons'; // Assuming Confetti is available in icons.tsx

interface Co2SavedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  co2Saved: number;
}

const Co2SavedPopup: React.FC<Co2SavedPopupProps> = ({ isOpen, onClose, co2Saved }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
        <DialogHeader className="items-center">
          <div className="p-3 bg-primary/10 rounded-full inline-block my-2">
            <Confetti size={48} className="text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-primary">Congratulations!</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center text-lg text-muted-foreground my-4 px-4">
          You've successfully saved <span className="font-bold text-primary">{co2Saved} gm</span> of CO₂!
        </DialogDescription>
        <div className="flex flex-col items-center justify-center my-4">
          <Leaf size={60} className="text-green-500 opacity-70" />
          <p className="mt-2 text-sm text-muted-foreground">Keep up the great work for a greener planet!</p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={onClose} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            Thank You!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Co2SavedPopup;
