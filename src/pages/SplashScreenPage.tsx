
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import EcoRunLogo from '@/components/EcoRunLogo';
// Updated import statement to use icons from the project's icon component
import { Footprints, Coins, Gift, Award, ChevronRight } from '@/components/icons';

interface SplashSlide {
  icon: React.ElementType;
  title: string;
  description: string;
}

const splashSlides: SplashSlide[] = [
  {
    icon: Footprints, // Changed from Run to Footprints
    title: 'Track Your Every Move',
    description: 'Log your steps, runs, and cycling effortlessly. See your progress and stay motivated.',
  },
  {
    icon: Coins,
    title: 'Earn EcoPoints, Get Rewarded',
    description: 'Turn your physical activity into EcoPoints. The more you move, the more you earn!',
  },
  {
    icon: Gift,
    title: 'Redeem Exciting Rewards',
    description: 'Use your EcoPoints to unlock exclusive offers, discounts, and cool merchandise.',
  },
  {
    icon: Award, // Changed from Target to Award
    title: 'Achieve Your Fitness Goals',
    description: 'Set personalized goals and let EcoRun help you on your journey to a healthier lifestyle.',
  },
];

const SplashScreenPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < splashSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark that user has seen splash screen
      localStorage.setItem('hasSeenSplash', 'true');
      navigate('/auth'); // Navigate directly to auth instead of welcome
    }
  };

  const handleSkip = () => {
    // Mark that user has seen splash screen
    localStorage.setItem('hasSeenSplash', 'true');
    navigate('/auth'); // Navigate directly to auth instead of welcome
  };

  const ActiveIcon = splashSlides[currentSlide].icon;

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light p-6 pt-10 justify-between relative overflow-hidden">
      <header className="flex items-center justify-between">
        <EcoRunLogo size="small" />
        <Button variant="ghost" onClick={handleSkip} className="text-eco-gray hover:text-eco-accent">
          Skip
        </Button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center animate-fade-in-up my-8">
        <div className="mb-10">
          <ActiveIcon size={64} className="text-eco-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold mb-4 text-eco-light leading-tight">
          {splashSlides[currentSlide].title}
        </h1>
        <p className="text-md sm:text-lg text-eco-gray max-w-sm mb-10">
          {splashSlides[currentSlide].description}
        </p>
      </main>

      <footer className="w-full max-w-xs mx-auto z-10 pb-4">
        <div className="flex justify-center mb-4">
          {splashSlides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full mx-1 ${
                index === currentSlide ? 'bg-eco-accent' : 'bg-eco-gray/50'
              }`}
            />
          ))}
        </div>
        <Button
          onClick={handleNext}
          className="w-full bg-eco-accent hover:bg-eco-accent-secondary text-eco-dark font-bold py-4 text-lg rounded-xl shadow-lg transform transition-transform hover:scale-105 active:scale-95"
          size="lg"
        >
          {currentSlide < splashSlides.length - 1 ? 'Next' : 'Get Started'}
          {/* Changed ArrowRight to ChevronRight */}
          {currentSlide < splashSlides.length - 1 && <ChevronRight size={20} className="ml-2" />}
        </Button>
      </footer>
    </div>
  );
};

export default SplashScreenPage;
