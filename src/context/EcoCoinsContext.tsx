import React, { createContext, useContext, useState } from 'react';

const EcoCoinsContext = createContext(null);

export function EcoCoinsProvider({ children }) {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  const addEarnings = (amount, label) => {
    setBalance(prev => prev + amount);
    setHistory(prev => [
      { label, value: amount, date: new Date().toLocaleDateString(), type: 'income' },
      ...prev,
    ]);
  };

  return (
    <EcoCoinsContext.Provider value={{ balance, history, addEarnings }}>
      {children}
    </EcoCoinsContext.Provider>
  );
}

export function useEcoCoins() {
  return useContext(EcoCoinsContext);
} 