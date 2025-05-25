
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Gift } from '@/components/icons';
import { Badge } from '@/components/ui/badge'; // For "New!" tag

interface RewardOfferCardProps {
  id: string;
  title: string;
  category?: string; // e.g., "Digital", "Gadgets"
  imageUrl: string;
  points: number; // Cost in EcoPoints
  description: string;
  claimedBy?: string; // e.g., "9.6K people claimed this"
  isNew?: boolean;
  actionText?: string;
}

const RewardOfferCard: React.FC<RewardOfferCardProps> = ({
  title,
  category,
  imageUrl,
  points,
  description,
  claimedBy,
  isNew,
  actionText = "Claim for"
}) => {
  return (
    <Card className="bg-eco-dark-secondary border-transparent shadow-lg overflow-hidden flex flex-col h-full hover:shadow-eco-accent/30 transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        {isNew && (
          <Badge variant="destructive" className="absolute top-2 right-2 bg-eco-pink text-white border-eco-pink">
            New!
          </Badge>
        )}
        {category && (
           <Badge variant="secondary" className="absolute top-2 left-2 bg-eco-purple/80 text-white border-eco-purple">
            {category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold text-eco-light mb-1 line-clamp-2">{title}</CardTitle>
        <p className="text-sm text-eco-gray mb-3 line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start space-y-3 bg-eco-dark-secondary/50">
        {claimedBy && <p className="text-xs text-eco-gray">{claimedBy}</p>}
        <Button className="w-full bg-eco-accent text-eco-dark hover:bg-eco-accent-secondary font-semibold">
          <Gift size={18} className="mr-2" />
          {actionText} {points.toLocaleString()} <Zap size={18} className="ml-1 text-yellow-400" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RewardOfferCard;
