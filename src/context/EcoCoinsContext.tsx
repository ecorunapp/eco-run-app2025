import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Challenge, getChallengeById } from '@/data/challenges'; // Assuming getChallengeById might be useful later

export type EcoTransactionType = 'income' | 'expense' | 'redemption' | 'ecotab';

export interface EcoTransaction {
  id?: string;
  value: number;
  label: string;
  date: string;
  type: EcoTransactionType;
}

export interface ClaimedGiftCard {
  id: string; // user_gift_cards.id
  user_id: string;
  gift_card_id: string; // original gift_card.id from gift_cards table
  challenge_id_won_from?: string;
  prize_title?: string;
  prize_promo_code?: string;
  prize_image_url?: string;
  assigned_at: string;
  used_at?: string;
  status?: string; // e.g., 'assigned', 'used', 'expired'
  associated_eco_coins_value?: number;
  prize_monetary_value_aed?: number;
  prize_currency?: string;
}

interface EcoCoinsContextType {
  balance: number;
  history: EcoTransaction[];
  claimedGiftCards: ClaimedGiftCard[];
  isLoading: boolean;
  isLoadingHistory: boolean;
  isLoadingClaimedGiftCards: boolean;
  addEcoCoins: (amount: number, label: string, type?: EcoTransactionType) => Promise<boolean>;
  redeemPoints: (amount: number, label: string) => Promise<boolean>;
  fetchBalanceAndHistory: () => Promise<void>;
  assignGiftCardToUser: (challenge: Challenge, userId: string) => Promise<string | null>;
  claimGiftCardPrize: (userGiftCardId: string) => Promise<boolean>;
  fetchClaimedGiftCards: () => Promise<void>;
}

const EcoCoinsContext = createContext<EcoCoinsContextType | undefined>(undefined);

export const EcoCoinsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<EcoTransaction[]>([]);
  const [claimedGiftCards, setClaimedGiftCards] = useState<ClaimedGiftCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isLoadingClaimedGiftCards, setIsLoadingClaimedGiftCards] = useState<boolean>(true);

  const fetchBalanceAndHistory = useCallback(async (currentUser?: User | null) => {
    const userToFetch = currentUser || user;
    if (!userToFetch) {
      setIsLoading(false);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoading(true);
    setIsLoadingHistory(true);
    console.log("EcoCoinsContext: Attempting to fetch balance and history for user:", userToFetch.id);

    try {
      // Fetch balance
      console.log("EcoCoinsContext: Fetching balance...");
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_eco_balances')
        .select('balance')
        .eq('user_id', userToFetch.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error fetching balance:', balanceError);
        toast.error("Error fetching your EcoPoints balance.");
      } else {
        console.log("EcoCoinsContext: Balance data:", balanceData);
        setBalance(balanceData?.balance || 0);
      }

      // Fetch transaction history
      console.log("EcoCoinsContext: Fetching history...");
      const { data: historyData, error: historyError } = await supabase
        .from('user_eco_transactions')
        .select('*')
        .eq('user_id', userToFetch.id)
        .order('transaction_date', { ascending: false });

      if (historyError) {
        console.error('Error fetching history:', historyError);
        toast.error("Error fetching your transaction history.");
      } else {
        console.log("EcoCoinsContext: History data:", historyData);
        setHistory(historyData.map(tx => ({
          id: tx.id,
          value: tx.value,
          label: tx.label,
          date: new Date(tx.transaction_date).toISOString(),
          type: tx.type as EcoTransactionType,
        })));
      }
    } catch (error) {
      console.error("Unexpected error fetching balance/history:", error);
      toast.error("An unexpected error occurred while fetching your data.");
    } finally {
      setIsLoading(false);
      setIsLoadingHistory(false);
      console.log("EcoCoinsContext: Finished fetching balance and history.");
    }
  }, [user]);

  const fetchClaimedGiftCards = useCallback(async (currentUser?: User | null) => {
    const userToFetch = currentUser || user;
    if (!userToFetch) {
      setIsLoadingClaimedGiftCards(false);
      return;
    }

    setIsLoadingClaimedGiftCards(true);
    console.log("EcoCoinsContext: Attempting to fetch claimed gift cards for user:", userToFetch.id);
    try {
      const { data, error } = await supabase
        .from('user_gift_cards')
        .select('*')
        .eq('user_id', userToFetch.id)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error fetching claimed gift cards:', error);
        toast.error("Could not load your claimed gift cards.");
        setClaimedGiftCards([]);
      } else {
        console.log("EcoCoinsContext: Claimed gift cards data:", data);
        setClaimedGiftCards(data as ClaimedGiftCard[]);
      }
    } catch (e) {
      console.error('Unexpected error fetching claimed gift cards:', e);
      toast.error("An unexpected error occurred while fetching your gift cards.");
      setClaimedGiftCards([]);
    } finally {
      setIsLoadingClaimedGiftCards(false);
      console.log("EcoCoinsContext: Finished fetching claimed gift cards.");
    }
  }, [user]);
  
  useEffect(() => {
    const getSession = async () => {
      console.log("EcoCoinsContext: getSession called");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("EcoCoinsContext: Error getting session:", sessionError);
        toast.error("Error initializing session.");
      }
      console.log("EcoCoinsContext: Session data:", session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log("EcoCoinsContext: User found in session, fetching data...");
        await fetchBalanceAndHistory(session.user);
        await fetchClaimedGiftCards(session.user);
      } else {
        console.log("EcoCoinsContext: No user in session, setting defaults.");
        setIsLoading(false);
        setIsLoadingHistory(false);
        setIsLoadingClaimedGiftCards(false);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("EcoCoinsContext: Auth state changed. New session:", session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log("EcoCoinsContext: User found in auth change, fetching data...");
        await fetchBalanceAndHistory(session.user);
        await fetchClaimedGiftCards(session.user);
      } else {
        console.log("EcoCoinsContext: No user in auth change, resetting state.");
        setBalance(0);
        setHistory([]);
        setClaimedGiftCards([]);
        setIsLoading(false);
        setIsLoadingHistory(false);
        setIsLoadingClaimedGiftCards(false);
      }
    });

    return () => {
      console.log("EcoCoinsContext: Unsubscribing auth listener.");
      authListener.subscription.unsubscribe();
    };
  }, [fetchBalanceAndHistory, fetchClaimedGiftCards]);

  const addEcoCoins = useCallback(async (amount: number, label: string, type: EcoTransactionType = 'income'): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to add EcoCoins.");
      return false;
    }
    if (amount <= 0) {
      toast.error("Amount must be positive.");
      return false;
    }
    console.log(`EcoCoinsContext: Attempting to add ${amount} EcoCoins for user ${user.id}, label: ${label}, type: ${type}`);

    try {
      // Start a Supabase transaction
      const { error: functionError } = await supabase.rpc('add_eco_coins_and_log_transaction' as any, { // Type assertion
        p_user_id: user.id,
        p_amount: amount,
        p_label: label,
        p_type: type,
      });

      if (functionError) {
        console.error('Error in add_eco_coins_and_log_transaction:', functionError);
        toast.error(`Failed to add EcoCoins: ${functionError.message}`);
        return false;
      }
      
      toast.success(`${amount} EcoCoins added for: ${label}`);
      await fetchBalanceAndHistory(); // Refresh balance and history
      return true;

    } catch (error) {
      console.error('Unexpected error in addEcoCoins:', error);
      toast.error('An unexpected error occurred while adding EcoCoins.');
      return false;
    }
  }, [user, fetchBalanceAndHistory]);

  const redeemPoints = useCallback(async (amount: number, label: string): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to redeem points.");
      return false;
    }
    if (amount <= 0) {
      toast.error("Amount must be positive.");
      return false;
    }
    
    if (balance < amount) {
        toast.error(`Not enough EcoPoints. You have ${balance.toLocaleString()}, tried to redeem ${amount.toLocaleString()}.`);
        return false;
    }
    console.log(`EcoCoinsContext: Attempting to redeem ${amount} points for user ${user.id}, label: ${label}`);

    try {
      const { error: functionError } = await supabase.rpc('redeem_eco_coins_and_log_transaction' as any, { // Type assertion
        p_user_id: user.id,
        p_amount_to_redeem: amount,
        p_label: label,
        p_type: 'redemption', 
      });

      if (functionError) {
        console.error('Error in redeem_eco_coins_and_log_transaction:', functionError);
        if (functionError.message.includes("Insufficient balance")) {
             toast.error(`Redemption failed: Insufficient EcoPoints.`);
        } else {
            toast.error(`Redemption failed: ${functionError.message}`);
        }
        return false;
      }
      
      await fetchBalanceAndHistory(); 
      return true;

    } catch (error) {
      console.error('Unexpected error in redeemPoints:', error);
      toast.error('An unexpected error occurred while redeeming points.');
      return false;
    }
  }, [user, balance, fetchBalanceAndHistory]);
  
  const assignGiftCardToUser = useCallback(async (challenge: Challenge, userId: string): Promise<string | null> => {
    if (!challenge.giftCardKey) {
        toast.error("This challenge does not award a specific gift card.");
        return null;
    }
    console.log(`EcoCoinsContext: Assigning gift card for challenge ${challenge.id} (key: ${challenge.giftCardKey}) to user ${userId}`);

    // Fetch the master gift card details using giftCardKey
    const { data: masterCard, error: masterCardError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('card_key', challenge.giftCardKey)
        .maybeSingle();

    if (masterCardError || !masterCard) {
        console.error('Error fetching master gift card or card not found:', masterCardError);
        toast.error(`Could not find details for gift card key: ${challenge.giftCardKey}.`);
        return null;
    }
    console.log("EcoCoinsContext: Master gift card details:", masterCard);

    const userCardData = {
        user_id: userId,
        gift_card_id: masterCard.id, 
        challenge_id_won_from: challenge.id,
        prize_title: masterCard.title || challenge.title, 
        prize_promo_code: challenge.prizePromoCode || `NOON-CODE-${Date.now().toString().slice(-4)}`, 
        prize_image_url: challenge.prizeImageUrl || masterCard.image_url || '/placeholder.svg',
        assigned_at: new Date().toISOString(),
        status: 'assigned', 
        associated_eco_coins_value: challenge.rewardCoins, 
        prize_monetary_value_aed: masterCard.monetary_value_aed,
        prize_currency: masterCard.currency,
    };
    console.log("EcoCoinsContext: User card data to insert:", userCardData);

    const { data: assignedCard, error: assignError } = await supabase
        .from('user_gift_cards')
        .insert(userCardData)
        .select()
        .single();

    if (assignError) {
        console.error('Error assigning gift card to user:', assignError);
        toast.error("Failed to assign gift card. Please try again.");
        return null;
    }

    toast.success(`"${challenge.title}" prize assigned! Check your rewards.`);
    console.log("EcoCoinsContext: Gift card assigned successfully:", assignedCard);
    await fetchClaimedGiftCards(); 
    return assignedCard.id; 
  }, [fetchClaimedGiftCards]);
  
  const claimGiftCardPrize = useCallback(async (userGiftCardId: string): Promise<boolean> => {
    console.log(`EcoCoinsContext: Attempting to mark gift card ${userGiftCardId} as used.`);
    const { data, error } = await supabase
        .from('user_gift_cards')
        .update({ status: 'used', used_at: new Date().toISOString() })
        .eq('id', userGiftCardId)
        .select()
        .single();

    if (error) {
        console.error('Error updating gift card status:', error);
        toast.error("Failed to update gift card status. Please try again.");
        return false;
    }

    toast.success(`Gift card "${data.prize_title}" marked as used!`);
    console.log("EcoCoinsContext: Gift card status updated successfully:", data);
    await fetchClaimedGiftCards(); 
    return true;
  }, [fetchClaimedGiftCards]);


  return (
    <EcoCoinsContext.Provider value={{ 
        balance, 
        history, 
        claimedGiftCards,
        isLoading, 
        isLoadingHistory,
        isLoadingClaimedGiftCards,
        addEcoCoins, 
        redeemPoints, 
        fetchBalanceAndHistory,
        assignGiftCardToUser,
        claimGiftCardPrize,
        fetchClaimedGiftCards 
    }}>
      {children}
    </EcoCoinsContext.Provider>
  );
};

export const useEcoCoins = () => {
  const context = useContext(EcoCoinsContext);
  if (context === undefined) {
    throw new Error('useEcoCoins must be used within an EcoCoinsProvider');
  }
  return context;
};
