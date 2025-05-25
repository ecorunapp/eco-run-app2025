
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

interface GiftCardDisplayProps {
  frontImageUrl: string;
  backImageUrl: string;
  promoCode: string;
  activationMessage?: string; // New optional prop
}

const GiftCardDisplay: React.FC<GiftCardDisplayProps> = ({ frontImageUrl, backImageUrl, promoCode, activationMessage }) => {
  const [showBack, setShowBack] = useState(false);
  const { toast } = useToast();

  const handleToggleView = () => {
    setShowBack(!showBack);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode)
      .then(() => {
        toast({ title: "Promo Code Copied!", description: "The code has been copied to your clipboard." });
      })
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy code. Please try manually.", variant: "destructive" });
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-800 rounded-lg shadow-xl w-full max-w-xs">
      <div className="relative w-full aspect-[1.586] overflow-hidden rounded-md group"> {/* Standard credit card aspect ratio */}
        <img
          src={showBack ? backImageUrl : frontImageUrl}
          alt={showBack ? "Gift Card Back" : "Gift Card Front"}
          className="w-full h-full object-cover transition-all duration-500"
        />
        {showBack && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-3 text-center">
            {activationMessage && (
              <p className="text-sm text-yellow-300 mb-2 font-semibold">{activationMessage}</p>
            )}
            {promoCode && (
              <>
                <p className="text-xs text-gray-300 mb-1">Promo Code:</p>
                <p className="text-lg font-mono font-bold text-white break-all mb-2">{promoCode}</p>
                <Button onClick={handleCopyCode} size="sm" variant="ghost" className="text-gray-200 hover:text-white">
                  <Copy size={16} className="mr-2"/> Copy Code
                </Button>
              </>
            )}
            {!promoCode && !activationMessage && (
                <p className="text-sm text-gray-300">Details will be revealed here.</p>
            )}
          </div>
        )}
      </div>
      
      <Button onClick={handleToggleView} variant="outline" className="w-full text-gray-200 border-gray-500 hover:bg-gray-700">
        {showBack ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
        {showBack ? 'Show Front' : 'Reveal Details'}
      </Button>
      <p className="text-xs text-gray-400 text-center">
        This is a digital gift card. {promoCode ? "Use the promo code at checkout." : "Details will be shown on the back."}
      </p>
    </div>
  );
};

export default GiftCardDisplay;
