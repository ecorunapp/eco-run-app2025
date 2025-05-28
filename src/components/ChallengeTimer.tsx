
import React, { useState, useEffect } from 'react';
import { Clock } from '@/components/icons';

interface ChallengeTimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

const ChallengeTimer: React.FC<ChallengeTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = expiry.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Expired');
        onExpire?.();
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  return (
    <div className="flex items-center text-xs text-yellow-300 bg-black/30 px-2 py-1 rounded-md">
      <Clock size={12} className="mr-1" />
      <span className="font-mono">{timeRemaining}</span>
    </div>
  );
};

export default ChallengeTimer;
