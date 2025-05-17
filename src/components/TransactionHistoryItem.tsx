
import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap, Gift, ArrowUpRight, ArrowDownLeft } from '@/components/icons'; // Assuming general icons for now

interface TransactionHistoryItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  amount: number; // Positive for income, negative for expense
  date: string;
}

const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = ({
  icon: IconComponent,
  title,
  description,
  amount,
  date,
}) => {
  const isPositive = amount >= 0;
  const amountColor = isPositive ? 'text-green-400' : 'text-eco-light';
  const AmountIcon = isPositive ? ArrowUpRight : ArrowDownLeft;

  return (
    <Card className="bg-eco-dark-secondary border-transparent p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-eco-dark rounded-full">
          <IconComponent size={20} className={isPositive ? "text-eco-accent" : "text-eco-pink"} />
        </div>
        <div>
          <p className="font-semibold text-eco-light text-sm">{title}</p>
          <p className="text-xs text-eco-gray">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-sm flex items-center justify-end ${amountColor}`}>
          {isPositive ? '+' : ''}{Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          <AmountIcon size={16} className={`ml-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
        </p>
        <p className="text-xs text-eco-gray">{date}</p>
      </div>
    </Card>
  );
};

export default TransactionHistoryItem;
