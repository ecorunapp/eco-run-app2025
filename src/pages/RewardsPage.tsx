import React, { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Gift, CreditCard, Coins, CheckCircle, Nfc as NfcIcon } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RewardOfferCard from '@/components/RewardOfferCard';
import TransactionHistoryItem from '@/components/TransactionHistoryItem';
import GradientDebitCard from '@/components/GradientDebitCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

// Type for Ecotab card data
interface EcotabCardData {
  id: string;
  gradientClass: string;
  cardNumberSuffix: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  nfcActive: boolean;
  isPrimary: boolean;
  cardNetworkLogo?: React.ReactNode;
}

// Sample data for Ecotab cards
const sampleEcotabCardsData: EcotabCardData[] = [
  {
    id: 'ecotab-rewards-1',
    gradientClass: 'bg-gradient-to-br from-eco-purple via-eco-pink to-orange-400',
    cardNumberSuffix: '1234',
    cardHolder: 'JANE DOE',
    expiryDate: '12/28',
    cvv: '123',
    nfcActive: true,
    isPrimary: true,
    cardNetworkLogo: <CreditCard size={36} className="text-white opacity-70" />
  },
  {
    id: 'ecotab-rewards-2',
    gradientClass: 'bg-gradient-to-tr from-green-400 via-teal-500 to-blue-600',
    cardNumberSuffix: '5678',
    cardHolder: 'JANE DOE',
    expiryDate: '10/27',
    cvv: '456',
    nfcActive: true,
    isPrimary: false,
    cardNetworkLogo: <CreditCard size={24} className="text-white opacity-50" />
  },
  {
    id: 'ecotab-rewards-3',
    gradientClass: 'bg-gradient-to-bl from-gray-700 via-gray-800 to-black',
    cardNumberSuffix: '9012',
    cardHolder: 'JANE DOE',
    expiryDate: '08/29',
    cvv: '789',
    nfcActive: false,
    isPrimary: false,
    cardNetworkLogo: undefined
  },
];

const RewardsPage: React.FC = () => {
  console.log('RewardsPage: component mounted');
  const [userEcoPoints, setUserEcoPoints] = useState(7580); // Made stateful
  const [showAllEcotabCards, setShowAllEcotabCards] = useState(false);
  const [dialogCard, setDialogCard] = useState<EcotabCardData | null>(null);

  const handleCardClick = (card: EcotabCardData) => {
    setDialogCard(card);
  };

  const primaryCard = sampleEcotabCardsData.find(card => card.isPrimary) || sampleEcotabCardsData[0];

  const handleRedeemReward = (pointsToDeduct: number, rewardName: string) => {
    if (userEcoPoints >= pointsToDeduct) {
      setUserEcoPoints(prevPoints => prevPoints - pointsToDeduct);
      // TODO: Add to transaction history (would require making sampleTransactions stateful too)
      alert(`Successfully redeemed "${rewardName}" for ${pointsToDeduct} EcoPoints!`);
    } else {
      alert(`Not enough EcoPoints to redeem "${rewardName}".`);
    }
  };

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
        {/* Ecotab Card Section - Interactive */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-eco-light">My Ecotab Cards</h2>
            {sampleEcotabCardsData.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-eco-accent text-eco-accent hover:bg-eco-accent hover:text-eco-dark" 
                onClick={() => setShowAllEcotabCards(!showAllEcotabCards)}
              >
                {showAllEcotabCards ? 'Show Primary' : 'Show All'}
              </Button>
            )}
          </div>

          {!showAllEcotabCards && primaryCard && (
            <div 
                onClick={() => handleCardClick(primaryCard)} 
                className="cursor-pointer hover:shadow-eco-accent/30 hover:shadow-lg transition-shadow rounded-xl"
                title="Click to view card details"
            >
              <GradientDebitCard {...primaryCard} />
              {sampleEcotabCardsData.length > 1 && <p className="text-center text-eco-gray mt-3 text-sm">View all cards by clicking "Show All"</p>}
            </div>
          )}

          {showAllEcotabCards && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sampleEcotabCardsData.map(card => (
                <div 
                    key={card.id} 
                    onClick={() => handleCardClick(card)}
                    className={`cursor-pointer rounded-xl transition-all duration-300 hover:shadow-eco-accent/20 hover:shadow-md ${dialogCard?.id === card.id ? 'ring-2 ring-eco-accent shadow-eco-accent/50 shadow-lg' : ''}`}
                >
                  <GradientDebitCard {...card} />
                </div>
              ))}
            </div>
          )}
        </section>
        
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
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}> {/* Adjusted animation delay */}
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
                // onRedeem={() => handleRedeemReward(offer.points, offer.title)} // This would be ideal if RewardOfferCard supported it
              />
            ))}
          </div>
          <p className="text-xs text-eco-gray mt-2 text-center">Note: Redeeming Featured Offers directly from this card is illustrative. Full functionality would require updates to the `RewardOfferCard` component.</p>
        </section>
        
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

        {/* Available Rewards Section - Now with redemption */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
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
                <Button 
                  variant="outline" 
                  className="w-full border-eco-accent text-eco-accent hover:bg-eco-accent hover:text-eco-dark"
                  onClick={() => handleRedeemReward(500, "Free Healthy Snack")}
                >
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
                <Button 
                  variant="outline" 
                  className="w-full border-eco-pink text-eco-pink hover:bg-eco-pink hover:text-eco-dark"
                  onClick={() => handleRedeemReward(2000, "$5 Off Sports Gear")}
                >
                  Redeem Now
                </Button>
              </CardContent>
            </Card>
          </div>
           <p className="text-center text-eco-gray mt-8">More exciting rewards coming soon!</p>
        </section>
      </main>
      <BottomNav />

      {/* Ecotab Card Dialog */}
      <Dialog open={!!dialogCard} onOpenChange={(isOpen) => { if (!isOpen) setDialogCard(null); }}>
        <DialogContent className="bg-eco-dark-secondary text-eco-light border-eco-accent max-w-md">
          {dialogCard && (
            <>
              <DialogHeader>
                <DialogTitle className="text-eco-light text-2xl">Ecotab Card Details</DialogTitle>
                <DialogDescription className="text-eco-gray">
                  Card ending in •••• {dialogCard.cardNumberSuffix}
                </DialogDescription>
              </DialogHeader>
              <div className="my-4">
                <GradientDebitCard {...dialogCard} />
              </div>
              <div className="space-y-3 my-4 px-2">
                <div className="flex items-center text-sm">
                  <NfcIcon size={20} className={`mr-2 ${dialogCard.nfcActive ? 'text-eco-accent' : 'text-eco-gray'}`} />
                  NFC Status: <span className={`font-semibold ml-1 ${dialogCard.nfcActive ? 'text-eco-accent' : 'text-eco-gray'}`}>
                    {dialogCard.nfcActive ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                 <div className="flex items-center text-sm">
                   <CheckCircle size={20} className="mr-2 text-green-400" />
                   Status: <span className="font-semibold ml-1 text-green-400">Ready for use</span>
                 </div>
                <div>
                  <h4 className="text-md font-semibold text-eco-light mb-1">Redemption History</h4>
                  <p className="text-xs text-eco-gray">
                    Ecopoint redemption history for this specific card will be shown here in a future update.
                    For now, please refer to the general transaction history.
                  </p>
                </div>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-eco-gray text-eco-gray hover:bg-eco-gray hover:text-eco-dark">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardsPage;
