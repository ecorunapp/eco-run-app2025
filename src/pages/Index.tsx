
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  // Removed useEffect that checked for 'hasCompletedOnboarding'
  // This screen is now purely for pre-authentication choices.

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-eco-dark text-eco-light p-8 pt-16 sm:pt-24 relative overflow-hidden">
      {/* Abstract background element - simplified */}
      <div className="absolute inset-0 opacity-5">
        {/* Placeholder for a more complex SVG background like in the image */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(0,245,212,0.3)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(138,79,255,0.3)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)" />
           <path d="M-200 0 Q-100 200 0 0 T200 0 T400 0 T600 0 T800 0 T1000 0 V1000 H-200 Z" fill="rgba(0,245,212,0.05)" transform="scale(2) rotate(30) translate(50, 50)" />
        </svg>
      </div>
      
      <div className="z-10 text-center animate-fade-in-up flex flex-col items-center">
        <EcoRunLogo size="large" className="mb-8" />
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-eco-light leading-tight">
          Your fresh start <br /> in a healthy life
        </h2>
        <p className="text-md sm:text-lg text-eco-gray max-w-sm mb-12">
          Track your steps, runs, and cycling. Earn EcoPoints and redeem exciting rewards!
        </p>
      </div>

      <div className="w-full max-w-xs z-10 animate-fade-in-up space-y-4" style={{ animationDelay: '0.3s' }}>
        <Button
          onClick={() => navigate('/signup')}
          className="w-full bg-eco-accent hover:bg-eco-accent-secondary text-eco-dark font-bold py-4 text-lg rounded-xl shadow-lg transform transition-transform hover:scale-105 active:scale-95"
          size="lg"
        >
          Sign Up
        </Button>
        <Button
          onClick={() => navigate('/auth')}
          variant="outline"
          className="w-full bg-eco-dark-secondary border-eco-dark-secondary hover:bg-eco-gray/20 text-eco-light font-bold py-4 text-lg rounded-xl shadow-lg transform transition-transform hover:scale-105 active:scale-95"
          size="lg"
        >
          Log In
        </Button>
      </div>
      <div className="h-16"></div> {/* Spacer for bottom */}
    </div>
  );
};

export default WelcomeScreen;
