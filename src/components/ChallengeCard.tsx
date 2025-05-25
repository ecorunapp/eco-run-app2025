
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap } from '@/components/icons'; // Assuming Zap is for EcoCoins
import type { Challenge } from '@/types/Challenge'; // Using Challenge from Challenge.ts
import { useNavigate } from 'react-router-dom';

interface ChallengeCardProps {
  challenge: Challenge & { status: 'not-started' | 'completed' }; // Status is now part of the prop
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const navigate = useNavigate();
  const IconComponent = challenge.icon;

  const handleStartChallenge = () => {
    navigate('/activities', { state: { activeChallenge: challenge } });
  };

  return (
    <Card className="bg-card text-card-foreground border shadow-lg flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{challenge.title}</CardTitle>
        <IconComponent className="h-8 w-8 text-primary" />
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
        <div className="flex items-center text-sm text-primary">
          <Zap size={16} className="mr-1 text-yellow-400" />
          <span>{challenge.reward} EcoCoins</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Distance: {challenge.distance} km</p>
      </CardContent>
      <CardFooter>
        {challenge.status === 'completed' ? (
          <Badge variant="default" className="w-full justify-center bg-green-500 hover:bg-green-500 text-white py-2">
            <CheckCircle size={18} className="mr-2" />
            Completed
          </Badge>
        ) : (
          <Button onClick={handleStartChallenge} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Start Challenge
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;

