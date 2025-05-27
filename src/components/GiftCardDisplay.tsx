
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Info } from '@/components/icons'; // Added Info icon
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';

interface GiftCardDisplayProps {
  frontImageUrl: string;
  backImageUrl: string;
  promoCode: string;
  activationMessage?: string;
  onCodeCopied?: () => Promise<void>;
  isPromoCodeVisible: boolean; // New prop
  pendingActivationMessage?: string; // New prop for message when code is not visible
}

const GiftCardDisplay: React.FC<GiftCardDisplayProps> = ({ 
  frontImageUrl, 
  backImageUrl, 
  promoCode, 
  activationMessage,
  onCodeCopied,
  isPromoCodeVisible,
  pendingActivationMessage = "Promo code will be revealed here after activation." 
}) => {
  const [showBack, setShowBack] = useState(false);

  const handleToggleView = () => {
    setShowBack(!showBack);
  };

  const handleCopyCodeAndClaim = async () => {
    if (!isPromoCodeVisible) {
      sonnerToast.info("Code Not Active", { description: "The promo code is not yet active or visible." });
      return;
    }
    try {
      await navigator.clipboard.writeText(promoCode);
      sonnerToast.success("Promo Code Copied!", { description: "The code has been copied to your clipboard." });
      
      if (onCodeCopied) {
        await onCodeCopied();
      }
    } catch (err) {
      sonnerToast.error("Copy Failed", { description: "Could not copy code. Please try manually." });
      console.error('Failed to copy text: ', err);
    }
  };

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
          </div>
          {/* Back of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-md overflow-hidden">
            <img
              src={backImageUrl}
              alt="Gift Card Back"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 p-3 text-center">
              {activationMessage && !isPromoCodeVisible && ( // Show activation message more prominently if code isn't visible yet
                <p className="text-sm text-yellow-300 mb-2 font-semibold">{activationMessage}</p>
              )}
              
              {isPromoCodeVisible && promoCode && (
                <>
                  <p className="text-xs text-gray-300 mb-1">Promo Code:</p>
                  <p className="text-lg font-mono font-bold text-white break-all mb-2">{promoCode}</p>
                  <Button onClick={handleCopyCodeAndClaim} size="sm" variant="ghost" className="text-gray-200 hover:text-white">
                    <Copy size={16} className="mr-2"/> Copy Code & Claim
                  </Button>
                </>
              )}
              {!isPromoCodeVisible && (
                <div className="flex flex-col items-center">
                  <Info size={24} className="text-yellow-400 mb-2" />
                  <p className="text-sm text-gray-200 font-semibold">{pendingActivationMessage}</p>
                </div>
              )}
              {activationMessage && isPromoCodeVisible && ( // Show activation message subtly if code is visible
                 <p className="text-xs text-gray-400 mt-3">{activationMessage}</p>
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
        This is a digital gift card. {isPromoCodeVisible && promoCode ? "Copy the code to use it." : "Details will be shown on the back once active."}
      </p>
    </div>
  );
};

export default GiftCardDisplay;
