import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Confetti } from '@/components/icons'; // Removed unused Coins import
import { useToast } from "@/hooks/use-toast";
import { useEcoCoins } from '@/context/EcoCoinsContext';

interface ActivityRewardCardProps {
  coinsEarned: number;
  onClose: () => void;
}

const ActivityRewardCard: React.FC<ActivityRewardCardProps> = ({ coinsEarned, onClose }) => {
  const { toast } = useToast();
  const { addEcoCoins } = useEcoCoins();
  
  const handleClaimReward = async () => {
    const success = await addEcoCoins(coinsEarned, 'Activity Reward');
    if (success) {
      toast({
        title: "Reward Claimed!",
        description: `${coinsEarned} EcoCoins will be credited to your Ecotab card.`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Claim Failed",
        description: `Could not claim ${coinsEarned} EcoCoins. Please try again.`,
        variant: "destructive",
        duration: 3000,
      });
    }
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/70 backdrop-blur-sm animate-fade-in">
      <Card className="w-11/12 max-w-md bg-eco-dark-secondary border-eco-gray/20 p-6 rounded-2xl shadow-2xl relative overflow-hidden animate-fade-in-up">
        {/* Confetti animation effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="flex justify-between absolute top-0 left-0 w-full">
            {[...Array(8)].map((_, i) => (
              <div 
                key={`confetti-top-${i}`}
                className={`text-eco-accent transform translate-y-${Math.random() * 10} animate-bounce`}
                style={{ 
                  animationDelay: `${i * 0.1}s`, 
                  animationDuration: `${0.5 + Math.random()}s`,
                  marginLeft: `${Math.random() * 10}%`,
                  marginRight: `${Math.random() * 10}%`,
                }}
              >
                <Confetti size={20 + Math.random() * 10} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 py-8 z-10 relative">
          {/* Main Reward Text */}
          <h2 className="text-5xl sm:text-6xl font-extrabold text-eco-light flex flex-col items-center justify-center">
            <div className="flex items-baseline">
              <span className="text-eco-accent">{coinsEarned}</span>
            </div>
            <span className="text-2xl sm:text-3xl font-semibold text-eco-gray mt-1">EcoCoins</span>
          </h2>

          {/* "YOU WON" Badge */}
          <div className="inline-block bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold py-1.5 px-4 rounded shadow-md border border-slate-400 transform -rotate-3">
            YOU WON!
          </div>

          {/* Title */}
          <p className="text-eco-light text-xl sm:text-2xl font-bold pt-2">Claim Your Prize!</p>
            
          {/* Description */}
          <p className="text-eco-gray text-sm sm:text-base px-2 sm:px-4 max-w-xs">
            Your <span className="font-semibold text-eco-accent">{coinsEarned} EcoCoins</span> will be credited to your Ecotab card shortly.
          </p>
          
          <Button 
            onClick={handleClaimReward}
            className="w-full max-w-xs py-4 sm:py-5 bg-gradient-to-r from-sky-400 to-green-400 hover:opacity-90 text-eco-dark font-bold text-base sm:text-lg rounded-xl mt-3 sm:mt-4 shadow-lg"
          >
            Claim Prize
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ActivityRewardCard;
