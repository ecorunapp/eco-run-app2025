
import React, { createContext, useContext, useState } from 'react';

interface Transaction {
  label: string;
  value: number;
  date: string;
  type: 'income' | 'redeem' | 'spend' | 'ecotab'; // Added 'spend' and 'ecotab' for clarity
}

interface EcoCoinsContextType {
  balance: number;
  history: Transaction[];
  addEarnings: (amount: number, label: string) => void;
  redeemPoints: (amount: number, label: string) => boolean; // Returns true if successful
}

const EcoCoinsContext = createContext<EcoCoinsContextType | null>(null);

export function EcoCoinsProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(0); // Initial balance, can be fetched later
  const [history, setHistory] = useState<Transaction[]>([]);

  const addEarnings = (amount: number, label: string) => {
    setBalance(prev => prev + amount);
    setHistory(prev => [
      { label, value: amount, date: new Date().toLocaleDateString(), type: 'income' },
      ...prev,
    ]);
  };

  const redeemPoints = (amount: number, label: string) => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      setHistory(prev => [
        { label, value: amount, date: new Date().toLocaleDateString(), type: 'redeem' }, // Using 'redeem' type
        ...prev,
      ]);
      return true;
    }
    return false; // Not enough balance
  };

  return (
    <EcoCoinsContext.Provider value={{ balance, history, addEarnings, redeemPoints }}>
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
