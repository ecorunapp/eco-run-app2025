import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

interface GiftCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  points?: number;
  expiryDate?: string;
  category?: string;
}

interface GiftCardSwiperProps {
  cards: GiftCard[];
  onSwipe: (direction: 'left' | 'right', cardId: string) => void;
}

export function GiftCardSwiper({ cards, onSwipe }: GiftCardSwiperProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<'left' | 'right' | null>(null);

  const handleSwipe = (swipeDirection: 'left' | 'right') => {
    setDirection(swipeDirection);
    onSwipe(swipeDirection, cards[currentIndex].id);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
      setDirection(null);
    }, 300);
  };

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px]">
      <motion.div
        key={currentCard.id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
          rotate: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
        }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute w-full h-full"
      >
        <Card className="relative w-full h-full overflow-hidden rounded-3xl shadow-2xl">
          {/* Card Background with Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-600/90 z-10" />
          
          {/* Card Content */}
          <div className="relative h-full flex flex-col">
            {/* Top Section */}
            <div className="p-6 flex justify-between items-start">
              <div className="space-y-2">
                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 inline-block">
                  <span className="text-white font-medium text-sm">{currentCard.category || 'Rewards'}</span>
                </div>
                {currentCard.points && (
                  <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 inline-block ml-2">
                    <span className="text-white font-medium text-sm">{currentCard.points} Points</span>
                  </div>
                )}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <span className="text-white font-medium text-sm">${currentCard.price}</span>
              </div>
            </div>

            {/* Middle Section */}
            <div className="flex-1 flex items-center justify-center p-6">
              <img
                src={currentCard.imageUrl}
                alt={currentCard.title}
                className="w-full h-full object-cover rounded-2xl shadow-lg"
              />
            </div>

            {/* Bottom Section */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">{currentCard.title}</h3>
                <p className="text-gray-200 text-sm">{currentCard.description}</p>
              </div>
              
              {currentCard.expiryDate && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                  <p className="text-white text-sm">Expires: {currentCard.expiryDate}</p>
                </div>
              )}

              <div className="flex justify-center gap-6 pt-4">
                <button
                  onClick={() => handleSwipe('left')}
                  className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 