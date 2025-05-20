
import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from '@/components/icons'; // Assuming general icons for now
import { IconType } from 'lucide-react'; // For icon type

interface TransactionHistoryItemProps {
  icon?: IconType; // Making icon optional for now, can be derived from type
  title: string; // was label
  descriptionType: 'income' | 'redeem' | 'spend' | 'ecotab' | string; // was description, now reflects transaction type
  amount: number; // was value
  date: string;
}

const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = ({
  icon: IconComponentProp,
  title,
  descriptionType,
  amount,
  date,
}) => {
  const isPositive = descriptionType === 'income';
  const amountColor = isPositive ? 'text-green-400' : 'text-eco-pink'; // Adjusted for points
  const AmountIcon = isPositive ? ArrowUpRight : ArrowDownLeft;
  
  // Determine icon based on type if not provided
  const IconToRender = IconComponentProp || AlertCircle; // Fallback icon

  return (
    <Card className="bg-eco-dark-secondary border-transparent p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-eco-dark rounded-full">
          <IconToRender size={20} className={isPositive ? "text-eco-accent" : "text-eco-pink"} />
        </div>
        <div>
          <p className="font-semibold text-eco-light text-sm">{title}</p>
          <p className="text-xs text-eco-gray capitalize">{descriptionType.replace('_', ' ')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-sm flex items-center justify-end ${amountColor}`}>
          {isPositive ? '+' : '-'}{Math.abs(amount).toLocaleString()} pts
          <AmountIcon size={16} className={`ml-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
        </p>
        <p className="text-xs text-eco-gray">{date}</p>
      </div>
    </Card>
  );
};

export default TransactionHistoryItem;
