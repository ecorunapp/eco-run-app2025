
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import EcoRunLogo from '@/components/EcoRunLogo';
import GradientDebitCard from '@/components/GradientDebitCard';
import { ArrowLeft, CheckCircle, ChevronRight, CreditCard } from '@/components/icons';

const benefits = [
  "Unlock exclusive partner rewards & discounts.",
  "Track your environmental impact in style.",
  "Gain access to premium app features.",
  "Priority customer support.",
  "Be part of the exclusive EcoTab community."
];

const OrderEcotabPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0 for splash/benefits

  // Placeholder for future steps
  const handleNext = () => {
    if (currentStep === 0) {
      // Navigate to the next step in the flow (e.g., customization)
      // For now, we can just log or prepare for the next step
      console.log("Proceeding to next step (customization - to be implemented)");
      // setCurrentStep(1); // Example: move to next step
      alert("Card customization and further steps will be implemented next!");
    }
  };

  const defaultCardData = {
    gradientClass: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600',
    cardNumberSuffix: '••••', // Masked for display
    cardHolder: 'EcoTab User',
    expiryDate: 'MM/YY',
    cvv: '•••',
    nfcActive: true,
    isPrimary: false,
    cardNetworkLogo: <CreditCard size={36} className="text-white opacity-70" />
  };

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-eco-dark/80 backdrop-blur-md z-40 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-eco-light hover:text-eco-accent">
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-semibold text-eco-light">Order Your EcoTab Card</h1>
        <EcoRunLogo size="small" />
      </header>

      <main className="flex-grow p-6 flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
        {currentStep === 0 && (
          <>
            <div className="w-full max-w-sm">
              <GradientDebitCard {...defaultCardData} />
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-semibold text-eco-accent mb-4">Your EcoTab Card Awaits!</h2>
              <p className="text-eco-gray mb-6">
                Join the EcoTab revolution and enjoy a seamless experience linking your eco-efforts to real-world rewards.
              </p>
            </div>

            <div className="w-full max-w-md bg-eco-dark-secondary p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-eco-light mb-4 text-center">Exclusive Benefits:</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle size={20} className="text-eco-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-eco-light-gray">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
             <p className="text-center font-semibold text-eco-accent text-md my-6 pt-2">
              One-time Activation & Delivery Fee: 60 AED (Placeholder)
            </p>
          </>
        )}
        {/* Future steps will be rendered here based on currentStep */}
      </main>
      
      {currentStep === 0 && (
        <footer className="p-6 sticky bottom-0 bg-eco-dark/80 backdrop-blur-md z-30">
          <Button
            onClick={handleNext}
            className="w-full bg-eco-accent hover:bg-eco-accent-secondary text-eco-dark font-bold py-3 text-lg rounded-xl shadow-lg transform transition-transform hover:scale-105 active:scale-95"
            size="lg"
          >
            Proceed to Customize
            <ChevronRight size={22} className="ml-2" />
          </Button>
        </footer>
      )}
    </div>
  );
};

export default OrderEcotabPage;
