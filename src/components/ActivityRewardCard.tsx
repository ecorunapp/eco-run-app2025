
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Confetti, Coins, Award } from '@/components/icons';
import { useToast } from "@/hooks/use-toast";

interface ActivityRewardCardProps {
  coinsEarned: number;
  onClose: () => void;
}

const ActivityRewardCard: React.FC<ActivityRewardCardProps> = ({ coinsEarned, onClose }) => {
  const { toast } = useToast();
  
  const handleClaimReward = () => {
    toast({
      title: "Reward Claimed!",
      description: `${coinsEarned} EcoCoins have been added to your balance.`,
      duration: 3000,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm animate-fade-in">
      <Card className="w-11/12 max-w-md bg-eco-dark-secondary border-eco-gray/20 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Confetti animation effect */}
        <div className="absolute top-0 left-0 w-full">
          <div className="flex justify-between">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`text-eco-accent transform translate-y-${Math.random() * 10} animate-bounce`}
                style={{ 
                  animationDelay: `${i * 0.1}s`, 
                  animationDuration: `${0.5 + Math.random()}s` 
                }}
              >
                <Confetti size={24} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-6 py-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-eco-accent to-eco-purple flex items-center justify-center shadow-lg">
            <Coins size={60} className="text-eco-dark" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-eco-light flex items-center justify-center">
              <span className="text-eco-accent">{coinsEarned}</span>
              <span className="mx-1">EcoCoins</span>
            </h2>
            <div className="bg-eco-gray/20 text-eco-accent text-sm py-1 px-3 rounded-full inline-block">
              YOU WON!
            </div>
            <p className="text-eco-light text-xl font-semibold">Claim your prize!</p>
            <p className="text-eco-gray text-sm">
              Your reward for completing this activity. Claim your EcoCoins and use them for rewards!
            </p>
          </div>
          
          <Button 
            onClick={handleClaimReward}
            className="w-full py-6 bg-gradient-to-r from-eco-accent to-eco-purple hover:opacity-90 text-eco-dark font-bold text-lg rounded-xl"
          >
            Claim prize
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ActivityRewardCard;
