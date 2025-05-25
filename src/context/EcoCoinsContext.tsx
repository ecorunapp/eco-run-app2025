
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { Session, User } from '@supabase/supabase-js';

interface Transaction {
  id?: string; // Optional: if we want to use DB id as key
  label: string;
  value: number;
  date: string; // Keep as string for display, can be formatted from TIMESTAMPTZ
  type: 'income' | 'redeem' | 'spend' | 'ecotab' | string; // Allow string for flexibility from DB
}

interface EcoCoinsContextType {
  balance: number;
  history: Transaction[];
  addEarnings: (amount: number, label: string) => Promise<void>;
  redeemPoints: (amount: number, label: string) => Promise<boolean>; // Returns true if successful
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
      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_eco_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') { // PGRST116: 0 rows
        console.error('Error fetching balance:', balanceError);
      } else {
        setBalance(balanceData?.balance ?? 0);
      }

      // Fetch history
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
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await fetchUserEcoData(currentSession.user.id);
      } else {
        setIsLoading(false); // No user, not loading data
        setBalance(0);
        setHistory([]);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchUserEcoData(newSession.user.id);
        } else {
          setBalance(0);
          setHistory([]);
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetchUserEcoData]);

  const addEarnings = async (amount: number, label: string) => {
    if (!user) {
      console.error("User not authenticated. Cannot add earnings.");
      return;
    }
    setIsLoading(true);
    const newBalance = balance + amount;
    const transactionType = 'income';

    // Optimistic update for UI
    const optimisticTransaction: Transaction = {
        label,
        value: amount,
        date: new Date().toLocaleDateString(),
        type: transactionType,
    };
    setBalance(newBalance);
    setHistory(prev => [optimisticTransaction, ...prev]);

    try {
      // Add transaction to history
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
        console.error('Error adding transaction:', transactionError);
        // Revert optimistic update if necessary (or show error to user)
        setBalance(prev => prev - amount); // Revert balance
        setHistory(prev => prev.filter(tx => tx !== optimisticTransaction)); // Revert history
        setIsLoading(false);
        return;
      }

      // Update/insert balance
      const { error: balanceError } = await supabase
        .from('user_eco_balances')
        .upsert({ user_id: user.id, balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      
      if (balanceError) {
        console.error('Error updating balance:', balanceError);
         // Potentially revert transaction insert if balance update fails critically, or handle more gracefully
      }
      // Fetch fresh data to ensure consistency, or rely on optimistic for now
      // await fetchUserEcoData(user.id);
    } catch (error) {
      console.error("Error in addEarnings:", error);
       // Revert optimistic updates fully if an unexpected error occurs
       setBalance(prev => prev - amount);
       setHistory(prev => prev.filter(tx => tx !== optimisticTransaction));
    } finally {
        setIsLoading(false);
        // Fetch data again to ensure sync, especially if optimistic updates were complex
        if (user) await fetchUserEcoData(user.id);
    }
  };

  const redeemPoints = async (amount: number, label: string) => {
    if (!user) {
      console.error("User not authenticated. Cannot redeem points.");
      return false;
    }
    if (balance < amount) {
      console.warn("Not enough balance to redeem.");
      return false;
    }
    setIsLoading(true);
    const newBalance = balance - amount;
    const transactionType = 'redeem';

    // Optimistic update
    const optimisticTransaction: Transaction = {
        label,
        value: amount, // Storing positive value, type indicates redeem
        date: new Date().toLocaleDateString(),
        type: transactionType,
    };
    setBalance(newBalance);
    setHistory(prev => [optimisticTransaction, ...prev]);

    try {
      // Add transaction to history
      const { error: transactionError } = await supabase
        .from('user_eco_transactions')
        .insert({
          user_id: user.id,
          label,
          value: -amount, // Store negative value for redeem/spend in DB to make SUM easier
          type: transactionType,
          transaction_date: new Date().toISOString(),
        });

      if (transactionError) {
        console.error('Error adding redeem transaction:', transactionError);
        setBalance(prev => prev + amount); // Revert
        setHistory(prev => prev.filter(tx => tx !== optimisticTransaction)); // Revert
        setIsLoading(false);
        return false;
      }

      // Update balance
      const { error: balanceError } = await supabase
        .from('user_eco_balances')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (balanceError) {
        console.error('Error updating balance after redeem:', balanceError);
        // Consider reverting transaction insert or other compensation logic
        setIsLoading(false);
        return false;
      }
      // await fetchUserEcoData(user.id); // Fetch fresh data
      return true;
    } catch (error) {
      console.error("Error in redeemPoints:", error);
      setBalance(prev => prev + amount); // Revert
      setHistory(prev => prev.filter(tx => tx !== optimisticTransaction)); // Revert
      return false;
    } finally {
        setIsLoading(false);
        // Fetch data again to ensure sync
        if (user) await fetchUserEcoData(user.id);
    }
  };

  return (
    <EcoCoinsContext.Provider value={{ balance, history, addEarnings, redeemPoints, isLoading }}>
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

