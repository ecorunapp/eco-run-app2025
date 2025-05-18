
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Heart, Award, Zap, ArrowLeft } from '@/components/icons'; // Using available icons

const GoalSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const goals = [
    { id: 'lose_weight', text: 'Lose Weight', icon: <Heart size={24} className="mr-3" /> },
    { id: 'self_development', text: 'Self Development', icon: <Award size={24} className="mr-3" /> },
    { id: 'boost_productivity', text: 'Boost Productivity', icon: <Zap size={24} className="mr-3" /> },
  ];

  const handleGoalSelection = (goalId: string) => {
    console.log('Selected goal:', goalId);
    // For now, we'll just store a flag that onboarding is complete.
    // In a real app, you might want to store the actual goal.
    localStorage.setItem('hasCompletedOnboarding', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light p-6 pt-10 relative overflow-hidden">
      <header className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/welcome')} className="text-eco-gray hover:text-eco-accent">
          <ArrowLeft size={24} />
        </Button>
        <EcoRunLogo size="small" />
        <div className="w-10"></div> {/* Spacer for balance */}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-3 text-eco-light leading-tight">
          What's your main goal?
        </h1>
        <p className="text-md sm:text-lg text-eco-gray max-w-sm mb-10">
          Help us customize your experience by selecting your primary motivation.
        </p>

        <div className="w-full max-w-md space-y-4">
          {goals.map((goal) => (
            <Button
              key={goal.id}
              onClick={() => handleGoalSelection(goal.id)}
              variant="outline"
              className="w-full justify-start text-left py-6 text-lg bg-eco-dark-secondary border-eco-dark-secondary hover:bg-eco-accent/10 hover:border-eco-accent text-eco-light rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105"
              size="lg"
            >
              {goal.icon}
              {goal.text}
            </Button>
          ))}
        </div>
      </main>
      <div className="h-16"></div> {/* Spacer for bottom */}
    </div>
  );
};

export default GoalSelectionPage;
