
import React from 'react';
import { Card } from '@/components/ui/card'; // CardContent is not used directly here for main layout
import { Nfc, CreditCard as ChipIcon } from '@/components/icons'; // Using CreditCard as ChipIcon
import EcoRunLogo from './EcoRunLogo';

interface GradientDebitCardProps {
  gradientClass: string;
  cardNumberSuffix: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string; // Kept for props consistency, though not displayed on front
  nfcActive: boolean;
  isPrimary?: boolean;
  cardNetworkLogo?: React.ReactNode; // Optional prop for Visa/Mastercard logo
}

const GradientDebitCard: React.FC<GradientDebitCardProps> = ({
  gradientClass,
  cardNumberSuffix,
  cardHolder,
  expiryDate,
  // cvv, // Not displayed on the front
  nfcActive,
  isPrimary = false,
  cardNetworkLogo, // Placeholder for network logo like Visa/Mastercard
}) => {
  const maskedCardNumber = `•••• •••• •••• ${cardNumberSuffix}`;

  return (
    <Card className={`w-full max-w-sm h-56 sm:h-60 rounded-xl shadow-xl text-white flex flex-col justify-between p-5 ${gradientClass} relative overflow-hidden font-sans`}>
      {isPrimary && (
        <div className="absolute top-2 right-2 bg-black/20 text-white px-2 py-1 text-xs rounded z-10">Primary</div>
      )}
      
      {/* Top Section: Logo and NFC */}
      <div className="flex justify-between items-start mb-4">
        <EcoRunLogo size="small" /> {/* Removed monogramColor, fixed error */}
        <Nfc size={28} className={`${nfcActive ? 'text-white' : 'text-white/50'}`} />
      </div>

      {/* Middle Section: Chip and Card Number */}
      <div className="flex-grow flex flex-col justify-center items-start space-y-3 sm:space-y-4">
        <ChipIcon size={36} className="text-white/80 mb-1" /> {/* Card Chip Icon */}
        <p className="text-xl sm:text-2xl md:text-3xl font-mono tracking-wider w-full">{maskedCardNumber}</p>
      </div>
      
      {/* Bottom Section: Card Holder, Expiry, and Network Logo */}
      <div className="flex justify-between items-end text-sm">
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Card Holder</p>
          <p className="font-medium uppercase">{cardHolder}</p>
          <div className="mt-1">
            <p className="text-xs opacity-70 uppercase tracking-wider">Expires</p>
            <p className="font-medium">{expiryDate}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Placeholder for Card Network Logo (e.g., Visa, Mastercard) */}
          {cardNetworkLogo ? cardNetworkLogo : <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center text-xs opacity-70">Logo</div>}
        </div>
      </div>
    </Card>
  );
};

export default GradientDebitCard;
