import React from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Gift, Star, Wifi, CreditCard, Coins } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RewardOfferCard from '@/components/RewardOfferCard';
import TransactionHistoryItem from '@/components/TransactionHistoryItem';

// Sample data for featured offers
const featuredOffers = [
  {
    id: '1',
    title: '10% Off PC, Xbox & PS5 Games',
    category: 'Digital',
    imageUrl: '/placeholder.svg', // Replace with actual image path
    points: 1500,
    description: 'Enjoy instant delivery on a wide range of games. Perfect for gamers!',
    claimedBy: '9.6K people claimed this',
    isNew: true,
  },
  {
    id: '2',
    title: 'Surfshark VPN: Secure Your Connection',
    category: 'Digital',
    imageUrl: '/placeholder.svg', // Replace with actual image path
    points: 500,
    description: 'Get Surfshark VPN from $1.49/month. Stay safe online.',
    claimedBy: '12K people claimed this',
    isNew: false,
  },
  {
    id: '3',
    title: 'ES11 Smart Band Discount',
    category: 'Gadgets',
    imageUrl: '/placeholder.svg', // Replace with actual image path
    points: 2500,
    description: '65% off + free shipping on the ES11 Smart Band. Track your fitness in style.',
    claimedBy: '17K people claimed this',
    isNew: true,
  },
  {
    id: '4',
    title: 'ClassPass: 1 Month Free Trial',
    category: 'Fitness',
    imageUrl: '/placeholder.svg', // Replace with actual image path
    points: 1000,
    description: 'Try ClassPass for 1 month free. Access thousands of fitness studios and classes.',
    claimedBy: '220 people claimed this',
    isNew: false,
  },
];

// Sample data for transaction history
const sampleTransactions = [
  {
    id: 't1',
    icon: Gift,
    title: 'Redeemed Spotify Voucher',
    description: 'Digital Reward',
    amount: -500, // Assuming points used
    date: 'May 15, 2025',
  },
  {
    id: 't2',
    icon: Coins,
    title: 'Weekly Bonus Points',
    description: 'Activity Completion',
    amount: 250,
    date: 'May 12, 2025',
  },
  {
    id: 't3',
    icon: Gift,
    title: 'Claimed Coffee Coupon',
    description: 'Partner Offer',
    amount: -150,
    date: 'May 10, 2025',
  },
  {
    id: 't4',
    icon: Zap, // Using Zap for points earned from an activity
    title: 'EcoChallenge Points',
    description: 'Milestone Reached',
    amount: 1000,
    date: 'May 5, 2025',
  },
];

const RewardsPage: React.FC = () => {
  console.log('RewardsPage: component mounted');
  const userEcoPoints = 7580; // Example data

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark z-40 shadow-sm">
        <EcoRunLogo size="small" />
        <h1 className="text-xl font-semibold text-eco-light">Rewards</h1>
        <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent">
          <Settings size={24} />
        </Button>
      </header>

      <main className="flex-grow p-4 space-y-8 overflow-y-auto pb-24">
        {/* Balance Section */}
        <Card className="bg-eco-dark-secondary border-eco-accent shadow-xl animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-eco-light flex items-center">
              <Zap size={28} className="mr-2 text-yellow-300" />
              Your EcoPoints Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-eco-accent">{userEcoPoints.toLocaleString()}</p>
            <p className="text-sm text-eco-gray mt-1">Redeem your points for amazing rewards!</p>
          </CardContent>
        </Card>

        {/* Featured Offers Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-semibold text-eco-light mb-4">Featured Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredOffers.map((offer) => (
              <RewardOfferCard
                key={offer.id}
                id={offer.id}
                title={offer.title}
                category={offer.category}
                imageUrl={offer.imageUrl}
                points={offer.points}
                description={offer.description}
                claimedBy={offer.claimedBy}
                isNew={offer.isNew}
              />
            ))}
          </div>
        </section>

        {/* Ecotab Card Section - Now a Link */}
        <Link to="/ecotab-details" className="block animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Card 
            className="bg-zinc-900 text-white shadow-2xl rounded-xl border-transparent hover:shadow-eco-accent/30 transition-all duration-300 cursor-pointer group"
          >
            <CardHeader className="flex flex-row justify-between items-start p-6">
              <Star size={28} className="text-eco-accent group-hover:animate-pulse" />
              <Wifi size={24} className="text-gray-400" />
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="mb-8">
                <p className="text-xs text-gray-400 tracking-wider uppercase">Member Since</p>
                <p className="text-lg font-medium mt-1">05/24</p>
              </div>
              <div className="mb-4">
                <p className="text-2xl font-semibold tracking-wide">Valued EcoRunner</p>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-sm text-gray-400">EcoTab Debit</p>
                <div className="flex items-center">
                  <div className="w-7 h-7 bg-red-500 rounded-full z-10 border-2 border-zinc-900"></div>
                  <div className="w-7 h-7 bg-yellow-500 rounded-full -ml-3 border-2 border-zinc-900"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        {/* Transaction History Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-eco-light">Transaction History</h2>
            <Button variant="link" className="text-eco-accent hover:text-eco-accent-secondary">View All</Button>
          </div>
          <div className="space-y-3">
            {sampleTransactions.map((transaction) => (
              <TransactionHistoryItem
                key={transaction.id}
                icon={transaction.icon}
                title={transaction.title}
                description={transaction.description}
                amount={transaction.amount}
                date={transaction.date}
              />
            ))}
          </div>
        </section>

        {/* Available Rewards Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}> {/* Adjusted animation delay */}
          <h2 className="text-2xl font-semibold text-eco-light mb-4">Other Rewards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-eco-dark-secondary hover:shadow-eco-accent/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center text-eco-accent">
                  <Gift size={24} className="mr-2" />
                  <CardTitle className="text-eco-light">Free Healthy Snack</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-eco-gray mb-3">Redeem for 500 EcoPoints</CardDescription>
                <Button variant="outline" className="w-full border-eco-accent text-eco-accent hover:bg-eco-accent hover:text-eco-dark">
                  Redeem Now
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-eco-dark-secondary hover:shadow-eco-pink/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                 <div className="flex items-center text-eco-pink">
                  <Gift size={24} className="mr-2" />
                  <CardTitle className="text-eco-light">$5 Off Sports Gear</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-eco-gray mb-3">Redeem for 2000 EcoPoints</CardDescription>
                <Button variant="outline" className="w-full border-eco-pink text-eco-pink hover:bg-eco-pink hover:text-eco-dark">
                  Redeem Now
                </Button>
              </CardContent>
            </Card>
          </div>
           <p className="text-center text-eco-gray mt-8">More exciting rewards coming soon!</p>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default RewardsPage;
