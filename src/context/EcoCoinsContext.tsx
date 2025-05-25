import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import type { Challenge } from '@/data/challenges';
import { toast } from 'sonner';

interface Transaction {
  id?: string;
  label: string;
  value: number;
  date: string;
  type: 'income' | 'redeem' | 'spend' | 'ecotab' | 'gift_card_claim' | string;
}

interface EcoCoinsContextType {
  balance: number;
  history: Transaction[];
  addEarnings: (amount: number, label: string, challengeDetails?: Challenge) => Promise<string | null>;
  redeemPoints: (amount: number, label: string) => Promise<boolean>;
  claimGiftCardPrize: (userGiftCardId: string) => Promise<boolean>;
  isLoading: boolean;
}

const EcoCoinsContext = createContext<EcoCoinsContextType | null>(null);

export function EcoCoinsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserEcoData = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_eco_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        console.error('Error fetching balance:', balanceError);
      } else {
        setBalance(balanceData?.balance ?? 0);
      }

      const { data: historyData, error: historyError } = await supabase
        .from('user_eco_transactions')
        .select('id, label, value, type, transaction_date')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (historyError) {
        console.error('Error fetching history:', historyError);
      } else if (historyData) {
        setHistory(historyData.map(tx => ({
          id: tx.id,
          label: tx.label,
          value: tx.value,
          type: tx.type,
          date: new Date(tx.transaction_date).toLocaleDateString(),
        })));
      }
    } catch (error) {
      console.error('Error in fetchUserEcoData:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const getSessionAndData = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        setTimeout(() => {
          fetchUserEcoData(currentSession.user.id);
        }, 0);
      } else {
        setIsLoading(false);
        setBalance(0);
        setHistory([]);
      }
    };
    getSessionAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserEcoData(newSession.user.id);
          }, 0);
        } else {
          setBalance(0);
          setHistory([]);
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserEcoData]);

  const addEarnings = async (amount: number, label: string, challengeDetails?: Challenge): Promise<string | null> => {
    if (!user) {
      toast.error("User not authenticated. Cannot add earnings.");
      console.error("[EcoCoinsContext] addEarnings called without authenticated user.");
      return null;
    }
    setIsLoading(true);
    let userGiftCardId: string | null = null;

    const newBalance = balance + amount;
    const transactionType = 'income';

    const optimisticTransaction: Transaction = {
      id: `optimistic-${Date.now()}`,
      label,
      value: amount,
      date: new Date().toLocaleDateString(),
      type: transactionType,
    };
    setBalance(newBalance);
    setHistory(prev => [optimisticTransaction, ...prev]);

    try {
      const { error: transactionError } = await supabase
        .from('user_eco_transactions')
        .insert({
          user_id: user.id,
          label,
          value: amount,
          type: transactionType,
          transaction_date: new Date().toISOString(),
        });

      if (transactionError) {
        toast.error(`Error adding transaction: ${transactionError.message}`);
        setBalance(prev => prev - amount);
        setHistory(prev => prev.filter(tx => tx.id !== optimisticTransaction.id));
        setIsLoading(false);
        return null;
      }

      if (challengeDetails?.giftCardKey) {
        const { data: masterCard, error: masterCardError } = await supabase
          .from('gift_cards')
          .select('*')
          .eq('card_key', challengeDetails.giftCardKey)
          .single();

        if (masterCardError || !masterCard) {
          toast.error(`Could not find master gift card details for key: ${challengeDetails.giftCardKey}. Earnings added, but card not logged.`);
          console.error("[EcoCoinsContext] Master card fetch error:", masterCardError, "for key:", challengeDetails.giftCardKey);
        } else {
          console.log('[EcoCoinsContext] Attempting to insert user_gift_card. User ID:', user.id, 'Master Gift Card ID:', masterCard.id, 'Challenge ID:', challengeDetails.id, 'Challenge Gift Card Key:', challengeDetails.giftCardKey);
          
          const { data: newUserGiftCard, error: userGiftCardError } = await supabase
            .from('user_gift_cards')
            .insert({
              user_id: user.id,
              gift_card_id: masterCard.id,
              challenge_id_won_from: challengeDetails.id,
              prize_title: masterCard.title || challengeDetails.title,
              prize_image_url: challengeDetails.prizeImageUrl || masterCard.image_url,
              prize_promo_code: challengeDetails.prizePromoCode,
              prize_monetary_value_aed: masterCard.monetary_value_aed,
              prize_currency: masterCard.currency,
              associated_eco_coins_value: challengeDetails.rewardCoins || masterCard.value_coins,
              status: 'assigned',
              assigned_at: new Date().toISOString(),
            })
            .select('id')
            .single();
          
          if (userGiftCardError) {
            toast.error(`Error logging won gift card: ${userGiftCardError.message}`);
            console.error("[EcoCoinsContext] User gift card insert error:", userGiftCardError.message, userGiftCardError);
            // Do not return null here if only gift card logging failed but eco coins were earned.
            // The function should still reflect that earnings were added, and userGiftCardId will remain null.
          } else if (newUserGiftCard) {
            userGiftCardId = newUserGiftCard.id;
            toast.info(`Gift card "${masterCard.title}" logged to your prizes!`);
          }
        }
      }

      const { error: balanceError } = await supabase
        .from('user_eco_balances')
        .upsert({ user_id: user.id, balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (balanceError) {
        toast.error(`Error updating balance: ${balanceError.message}`);
        // If balance update fails, consider reverting the optimistic updates or handling inconsistency
      }
      return userGiftCardId; // This will be null if gift card logging failed or no gift card key
    } catch (error: any) {
      toast.error(`An unexpected error occurred: ${error.message}`);
      console.error("[EcoCoinsContext] Unexpected error in addEarnings:", error);
      setBalance(prev => prev - amount);
      setHistory(prev => prev.filter(tx => tx.id !== optimisticTransaction.id));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const redeemPoints = async (amount: number, label: string): Promise<boolean> => {
    if (!user) {
      toast.error("User not authenticated. Cannot redeem points.");
      return false;
    }
    if (balance < amount) {
      toast.warning("Not enough balance to redeem.");
      return false;
    }
    setIsLoading(true);
    const newBalance = balance - amount;
    const transactionType = 'redeem';

    const optimisticTransaction: Transaction = {
      id: `optimistic-${Date.now()}`,
      label,
      value: amount, 
      date: new Date().toLocaleDateString(),
      type: transactionType,
    };
    setBalance(newBalance);
    setHistory(prev => [optimisticTransaction, ...prev]);

    try {
      const { error: transactionError } = await supabase
        .from('user_eco_transactions')
        .insert({
          user_id: user.id,
          label,
          value: -amount,
          type: transactionType,
          transaction_date: new Date().toISOString(),
        });

      if (transactionError) {
        toast.error(`Error adding redeem transaction: ${transactionError.message}`);
        setBalance(prev => prev + amount);
        setHistory(prev => prev.filter(tx => tx.id !== optimisticTransaction.id));
        setIsLoading(false);
        return false;
      }

      const { error: balanceError } = await supabase
        .from('user_eco_balances')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (balanceError) {
        toast.error(`Error updating balance after redeem: ${balanceError.message}`);
        setIsLoading(false);
        return false;
      }
      return true;
    } catch (error: any) {
      toast.error(`Error in redeemPoints: ${error.message}`);
      setBalance(prev => prev + amount);
      setHistory(prev => prev.filter(tx => tx.id !== optimisticTransaction.id));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const claimGiftCardPrize = async (userGiftCardId: string): Promise<boolean> => {
    if (!user) {
      toast.error("User not authenticated. Cannot claim gift card.");
      return false;
    }
    setIsLoading(true);

    try {
      const { data: userCard, error: fetchError } = await supabase
        .from('user_gift_cards')
        .select('associated_eco_coins_value, prize_title, status')
        .eq('id', userGiftCardId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !userCard) {
        toast.error("Could not find the gift card or permission denied.");
        console.error("[EcoCoinsContext] Fetch user_gift_card error:", fetchError);
        setIsLoading(false);
        return false;
      }

      if (userCard.status === 'used') {
        toast.info(`Gift card "${userCard.prize_title}" has already been claimed.`);
        setIsLoading(false);
        return true;
      }
      
      const claimCost = userCard.associated_eco_coins_value || 0;
      if (balance < claimCost) {
        toast.error(`Not enough EcoCoins to claim "${userCard.prize_title}". You need ${claimCost}, have ${balance}.`);
        setIsLoading(false);
        return false;
      }

      const newBalance = balance - claimCost;
      const claimLabel = `Claimed: ${userCard.prize_title || 'Gift Card'}`;
      const transactionType = 'gift_card_claim';

      const optimisticTransaction: Transaction = {
        id: `optimistic-claim-${Date.now()}`,
        label: claimLabel,
        value: claimCost,
        date: new Date().toLocaleDateString(),
        type: transactionType,
      };
      setBalance(newBalance);
      setHistory(prev => [{...optimisticTransaction, value: -claimCost}, ...prev]);

      const { error: transactionError } = await supabase
        .from('user_eco_transactions')
        .insert({
          user_id: user.id,
          label: claimLabel,
          value: -claimCost,
          type: transactionType,
          transaction_date: new Date().toISOString(),
        });

      if (transactionError) {
        toast.error(`Error recording claim transaction: ${transactionError.message}`);
        setBalance(prev => prev + claimCost);
        setHistory(prev => prev.filter(tx => tx.id !== optimisticTransaction.id));
        setIsLoading(false);
        return false;
      }
      
      const { error: balanceError } = await supabase
        .from('user_eco_balances')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (balanceError) {
        toast.error(`Error updating balance after claim: ${balanceError.message}`);
        setIsLoading(false);
        return false;
      }

      const { error: updateCardError } = await supabase
        .from('user_gift_cards')
        .update({ status: 'used', used_at: new Date().toISOString() })
        .eq('id', userGiftCardId);

      if (updateCardError) {
        toast.error(`Error marking card as used: ${updateCardError.message}. Points deducted.`);
        setIsLoading(false);
        return false;
      }

      toast.success(`Successfully claimed "${userCard.prize_title || 'Gift Card'}". ${claimCost} EcoCoins deducted.`);
      return true;
    } catch (error: any) {
      toast.error(`An unexpected error occurred while claiming: ${error.message}`);
      console.error("[EcoCoinsContext] Unexpected error in claimGiftCardPrize:", error);
      return false;
    } finally {
      if (user) { await fetchUserEcoData(user.id); } // Refresh data after claim attempt
      setIsLoading(false);
    }
  };

  return (
    <EcoCoinsContext.Provider value={{ balance, history, addEarnings, redeemPoints, claimGiftCardPrize, isLoading }}>
      {children}
    </EcoCoinsContext.Provider>
  );
}

export function useEcoCoins() {
  const context = useContext(EcoCoinsContext);
  if (!context) {
    throw new Error("useEcoCoins must be used within an EcoCoinsProvider");
  }
  return context;
}
