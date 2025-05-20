
import { Coins, Gift, ShoppingBag, CreditCard, Info } from '@/components/icons';
import { LucideIcon } from 'lucide-react';

export const getIconForTransactionType = (type: string): LucideIcon => {
  switch (type) {
    case 'income':
      return Coins;
    case 'redeem':
      return Gift;
    case 'spend':
      return ShoppingBag;
    case 'ecotab':
      return CreditCard;
    default:
      return Info;
  }
};
