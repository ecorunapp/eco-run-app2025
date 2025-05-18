
import React from 'react';
import { useNavigate } from 'react-router-dom';
import GradientDebitCard from '@/components/GradientDebitCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from '@/components/icons'; // CreditCard can be used for cardNetworkLogo
import EcoRunLogo from '@/components/EcoRunLogo';

const EcotabDetailsPage: React.FC = () => {
  const navigate = useNavigate();

  // Example: Define a Visa logo component or image
  // const VisaLogo = () => <CreditCard size={36} className="text-white opacity-70" />; // Example Visa Logo

  const cardsData = [
    {
      id: '1',
      gradientClass: 'bg-gradient-to-br from-eco-purple via-eco-pink to-orange-400',
      cardNumberSuffix: '1234',
      cardHolder: 'JANE DOE',
      expiryDate: '12/28',
      cvv: '123',
      nfcActive: true,
      isPrimary: true,
      cardNetworkLogo: <CreditCard size={36} className="text-white opacity-70" /> // Example network logo
    },
    {
      id: '2',
      gradientClass: 'bg-gradient-to-tr from-green-400 via-teal-500 to-blue-600',
      cardNumberSuffix: '5678',
      cardHolder: 'JANE DOE',
      expiryDate: '10/27',
      cvv: '456',
      nfcActive: true,
      isPrimary: false, // Explicitly set isPrimary
      cardNetworkLogo: undefined // No specific logo, will use default
    },
    {
      id: '3',
      gradientClass: 'bg-gradient-to-bl from-gray-700 via-gray-800 to-black',
      cardNumberSuffix: '9012',
      cardHolder: 'JANE DOE',
      expiryDate: '08/29',
      cvv: '789',
      nfcActive: false,
      isPrimary: false, // Explicitly set isPrimary
      cardNetworkLogo: undefined // No specific logo, will use default
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-eco-dark z-40 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-eco-light hover:text-eco-accent">
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-semibold text-eco-light">My Ecotab Cards</h1>
        <EcoRunLogo size="small" />
      </header>

      <main className="flex-grow p-4 sm:p-6 space-y-6 overflow-y-auto pb-16">
        <p className="text-eco-gray text-center text-sm">Manage your virtual Ecotab debit cards. Use them for online purchases or link to your favorite payment apps.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {cardsData.map(card => (
            <GradientDebitCard
              key={card.id}
              gradientClass={card.gradientClass}
              cardNumberSuffix={card.cardNumberSuffix}
              cardHolder={card.cardHolder}
              expiryDate={card.expiryDate}
              cvv={card.cvv} // CVV is a prop, even if not displayed on front
              nfcActive={card.nfcActive}
              isPrimary={card.isPrimary}
              cardNetworkLogo={card.cardNetworkLogo}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" className="border-eco-accent text-eco-accent hover:bg-eco-accent hover:text-eco-dark">
            Request New Card
          </Button>
        </div>
      </main>
    </div>
  );
};

export default EcotabDetailsPage;
