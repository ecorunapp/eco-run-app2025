import React from 'react';
import { GiftCardSwiper } from '@/components/GiftCardSwiper';
import { toast } from 'sonner';

const sampleGiftCards = [
  {
    id: '1',
    title: 'Premium Coffee Experience',
    description: 'Enjoy a month of specialty coffee delivered to your door. Includes 4 bags of premium beans.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    price: 49.99,
    points: 500,
    expiryDate: 'Dec 31, 2024',
    category: 'Food & Drink'
  },
  {
    id: '2',
    title: 'Luxury Spa Day',
    description: 'Treat yourself to a day of relaxation and pampering at our premium spa center.',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
    price: 199.99,
    points: 2000,
    expiryDate: 'Jan 15, 2025',
    category: 'Wellness'
  },
  {
    id: '3',
    title: 'Master Chef Class',
    description: 'Learn to cook like a professional chef with our expert-led cooking workshop.',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
    price: 89.99,
    points: 1000,
    expiryDate: 'Feb 28, 2025',
    category: 'Experience'
  },
  {
    id: '4',
    title: 'Wine Tasting Journey',
    description: 'Discover fine wines with expert sommeliers in an exclusive tasting session.',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
    price: 129.99,
    points: 1500,
    expiryDate: 'Mar 15, 2025',
    category: 'Food & Drink'
  },
];

export default function GiftCards() {
  const handleSwipe = (direction: 'left' | 'right', cardId: string) => {
    const card = sampleGiftCards.find(c => c.id === cardId);
    if (direction === 'right') {
      toast.success(`Added ${card?.title} to favorites!`);
    } else {
      toast.info(`Skipped ${card?.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Discover Rewards
        </h1>
        <p className="text-gray-300 text-center mb-12">
          Swipe right to save your favorite rewards, left to skip
        </p>
        <GiftCardSwiper cards={sampleGiftCards} onSwipe={handleSwipe} />
      </div>
    </div>
  );
} 