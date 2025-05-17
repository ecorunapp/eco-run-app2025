
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Nfc, CreditCard, Wifi } from '@/components/icons'; // Wifi as a fallback or general contactless
import EcoRunLogo from './EcoRunLogo';

interface GradientDebitCardProps {
  gradientClass: string;
  cardNumberSuffix: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  nfcActive: boolean;
  isPrimary?: boolean;
}

const GradientDebitCard: React.FC<GradientDebitCardProps> = ({
  gradientClass,
  cardNumberSuffix,
  cardHolder,
  expiryDate,
  cvv,
  nfcActive,
  isPrimary = false,
}) => {
  const maskedCardNumber = `•••• •••• •••• ${cardNumberSuffix}`;

  return (
    <Card className={`w-full max-w-sm h-56 sm:h-60 rounded-xl shadow-xl text-white flex flex-col justify-between p-5 ${gradientClass} relative overflow-hidden`}>
      {isPrimary && (
        <div className="absolute top-2 right-2 bg-black/20 text-white px-2 py-1 text-xs rounded">Primary</div>
      )}
      <div className="flex justify-between items-start">
        <EcoRunLogo size="small" monogramColor="white" /> {/* Changed size to "small" */}
        <Nfc size={28} className={`${nfcActive ? 'text-white' : 'text-white/50'}`} />
      </div>
      
      <div className="space-y-2">
        <p className="text-xl sm:text-2xl font-mono tracking-wider">{maskedCardNumber}</p>
        <div className="flex justify-between items-end text-sm">
          <div>
            <p className="text-xs opacity-70">Card Holder</p>
            <p className="font-medium">{cardHolder}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Expires</p>
            <p className="font-medium">{expiryDate}</p>
          </div>
        </div>
      </div>
      
      {/* Placeholder for CVV, maybe shown on flip or interaction in a real app */}
      {/* <p className="text-xs absolute bottom-2 right-2 opacity-70">CVV: {cvv}</p> */}
    </Card>
  );
};

export default GradientDebitCard;
