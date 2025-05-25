import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Gift, CreditCard, Coins, CheckCircle, Nfc as NfcIcon } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionHistoryItem from '@/components/TransactionHistoryItem';
import GradientDebitCard from '@/components/GradientDebitCard';
import { getIconForTransactionType } from '@/utils/iconHelper';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEcoCoins } from '@/context/EcoCoinsContext';
import { TransactionHistoryModal } from '@/components/TransactionHistoryModal';
import { useUserProfile } from '@/hooks/useUserProfile';
import { challenges as allChallenges, Challenge } from '@/data/challenges';
import RewardOfferCard from '@/components/RewardOfferCard';

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

// Sample data for Ecotab cards - CardHolder will be overridden by user's name
const initialEcotabCardsData: EcotabCardData[] = [
  {
    id: 'ecotab-rewards-1',
    gradientClass: 'bg-gradient-to-br from-eco-purple via-eco-pink to-orange-400',
    cardNumberSuffix: '1234',
    cardHolder: 'YOUR NAME', // Placeholder, will be updated
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
    cardHolder: 'YOUR NAME', // Placeholder
    expiryDate: '10/27',
    cvv: '456',
    nfcActive: true,
    isPrimary: false,
    cardNetworkLogo: <CreditCard size={24} className="text-white opacity-50" />
  },
  // ... other cards if any
];

const RewardsPage: React.FC = () => {
  console.log('RewardsPage: component mounted');
  const { balance: userEcoPoints, history: transactionHistory, redeemPoints, isLoading: ecoCoinsLoading } = useEcoCoins();
  const { profile: userProfile, isLoading: profileLoading } = useUserProfile();

  const [ecotabCards, setEcotabCards] = useState<EcotabCardData[]>(initialEcotabCardsData);
  const [showAllEcotabCards, setShowAllEcotabCards] = useState(false);
  const [dialogCard, setDialogCard] = useState<EcotabCardData | null>(null);
  const [showRedeemInput, setShowRedeemInput] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);

  useEffect(() => {
    if (userProfile?.full_name) {
      setEcotabCards(initialEcotabCardsData.map(card => ({
        ...card,
        cardHolder: userProfile.full_name || 'Eco User',
      })));
    } else if (!profileLoading) { // if not loading and no full_name, use a default
        setEcotabCards(initialEcotabCardsData.map(card => ({
            ...card,
            cardHolder: 'Eco User',
        })));
    }
  }, [userProfile, profileLoading]);

  const handleCardClick = (card: EcotabCardData) => {
    setDialogCard(card);
    setShowRedeemInput(false);
    setRedeemAmount('');
  };

  const primaryCard = ecotabCards.find(card => card.isPrimary) || ecotabCards[0];

  const handleEcotabRedemption = async () => { // Made async
    const amount = parseInt(redeemAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount of points to redeem.");
      return;
    }
    if (dialogCard) {
      // redeemPoints now returns a promise, so we should await it.
      const success = await redeemPoints(amount, `Redeemed to Ecotab Card ${dialogCard.cardNumberSuffix}`);
      if (success) {
        toast.success(`${amount} EcoPoints successfully redeemed to Ecotab Card ${dialogCard.cardNumberSuffix}!`);
        setDialogCard(null);
        setShowRedeemInput(false);
        setRedeemAmount('');
      } else {
         if (userEcoPoints < amount) {
           toast.error(`Not enough EcoPoints. You have ${userEcoPoints.toLocaleString()}, tried to redeem ${amount.toLocaleString()}.`);
         } else {
           toast.error("Redemption failed. Please try again.");
         }
      }
    }
  };

  const displayedTransactions = transactionHistory.slice(0, 4).map(tx => ({
    id: tx.id || tx.date + tx.label + tx.value + tx.type, // Use tx.id if available
    icon: getIconForTransactionType(tx.type),
    title: tx.label,
    descriptionType: tx.type,
    amount: (tx.type === 'income' || tx.type === 'ecotab') ? tx.value : -tx.value, // Ecotab might be earnings
    date: tx.date,
  }));

  // Filter for 10 AED Noon Gift Cards from challenges
  const noon10AedChallenges = allChallenges.filter(
    challenge => challenge.giftCardKey?.includes('NOON_10_AED') && challenge.rewardCoins === 50
  );

  const featuredNoonOffers = noon10AedChallenges.map(challenge => ({
    id: challenge.id,
    title: challenge.title,
    category: "Digital Gift Card",
    imageUrl: challenge.prizeImageUrl || '/placeholder.svg', // Fallback image
    points: challenge.rewardCoins,
    description: challenge.description,
    isNew: false, // Or some logic to determine if it's new
    actionText: "Claim for"
  }));

  const handleRedeemOffer = (points: number, offerTitle: string) => {
    // This is a placeholder. Implement actual redemption logic,
    // possibly by integrating with useEcoCoins or a new context/hook.
    console.log(`Attempting to redeem ${offerTitle} for ${points} points.`);
    toast.info(`Redeeming ${offerTitle} for ${points} EcoPoints... (Feature coming soon!)`);
    // Example:
    // if (userEcoPoints >= points) {
    //   redeemPoints(points, `Redeemed: ${offerTitle}`);
    //   toast.success(`${offerTitle} redeemed successfully!`);
    // } else {
    //   toast.error(`Not enough EcoPoints to redeem ${offerTitle}.`);
    // }
  };

  if (profileLoading || ecoCoinsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-eco-accent" />
        <p className="mt-4 text-lg">Loading your rewards...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark/80 backdrop-blur-md z-40 shadow-sm">
        <EcoRunLogo size="small" />
        <h1 className="text-xl font-semibold text-eco-light">Rewards</h1>
        <Button variant="ghost" size="icon" className="text-eco-gray hover:text-eco-accent">
          <Settings size={24} />
        </Button>
      </header>

      <main className="flex-grow p-4 space-y-8 overflow-y-auto pb-24">
        {/* Ecotab Card Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-eco-light">My Ecotab Cards</h2>
            {ecotabCards.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-eco-accent text-eco-accent hover:bg-eco-accent hover:text-eco-dark transition-colors" 
                onClick={() => setShowAllEcotabCards(!showAllEcotabCards)}
              >
                {showAllEcotabCards ? 'Show Primary' : `Show All (${ecotabCards.length})`}
              </Button>
            )}
          </div>

          {!showAllEcotabCards && primaryCard && (
            <div 
                onClick={() => handleCardClick(primaryCard)} 
                className="cursor-pointer hover:shadow-eco-accent/30 hover:shadow-lg transition-shadow rounded-xl"
                title="Click to view card details"
            >
              <GradientDebitCard {...primaryCard} cardHolder={userProfile?.full_name || primaryCard.cardHolder} />
              {ecotabCards.length > 1 && <p className="text-center text-eco-gray mt-3 text-xs">View all cards by clicking "Show All"</p>}
            </div>
          )}

          {showAllEcotabCards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ecotabCards.map(card => (
                <div 
                    key={card.id} 
                    onClick={() => handleCardClick(card)}
                    className={`cursor-pointer rounded-xl transition-all duration-300 hover:shadow-eco-accent/20 hover:shadow-lg ${dialogCard?.id === card.id ? 'ring-2 ring-eco-accent shadow-eco-accent/50 ' : 'ring-1 ring-transparent hover:ring-eco-gray/50'}`}
                >
                  <GradientDebitCard {...card} cardHolder={userProfile?.full_name || card.cardHolder} />
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Balance Section */}
        <Card className="bg-eco-dark-secondary border-transparent shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-eco-light flex items-center text-xl">
              <Zap size={24} className="mr-2 text-yellow-400" />
              Your EcoPoints Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-eco-accent">{userEcoPoints.toLocaleString()}</p>
            <p className="text-sm text-eco-gray mt-1">Redeem your points for amazing rewards!</p>
          </CardContent>
        </Card>
        
        {/* Transaction History Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-eco-light">Recent Activity</h2>
            <Button
              variant="link"
              className="text-eco-accent hover:text-eco-accent-secondary px-0"
              onClick={() => setShowTxModal(true)}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {displayedTransactions.length > 0 ? displayedTransactions.map((transaction) => (
              <TransactionHistoryItem
                key={transaction.id}
                icon={transaction.icon}
                title={transaction.title}
                descriptionType={transaction.descriptionType}
                amount={transaction.amount}
                date={transaction.date}
              />
            )) : <p className="text-eco-gray text-center py-4 text-sm">No recent activity. Start earning EcoPoints!</p>}
          </div>
        </section>
        
        {/* Featured Offers Section - Now displaying Noon 10 AED cards */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-semibold text-eco-light mb-4">Featured Offers</h2>
          {featuredNoonOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Increased gap */}
              {featuredNoonOffers.map(offer => (
                <RewardOfferCard 
                  key={offer.id} 
                  {...offer} 
                  // The RewardOfferCard itself has a button that says "Claim for X points"
                  // If you want that button to do something, you'd pass an onRedeem or similar prop here.
                  // For now, the button is part of RewardOfferCard's internal structure.
                  // We can add an onClick handler to the button *inside* RewardOfferCard if needed,
                  // or pass a callback from here if RewardOfferCard supports it.
                  // Let's assume RewardOfferCard's button will eventually trigger a redemption.
                  // We've added handleRedeemOffer above as an example if RewardOfferCard needs an external handler.
                />
              ))}
            </div>
          ) : (
            <p className="text-eco-gray text-center py-4">No featured Noon offers available at the moment.</p>
          )}
        </section>

      </main>
      <BottomNav />

      {/* Ecotab Card Dialog with Redemption */}
      <Dialog open={!!dialogCard} onOpenChange={(isOpen) => { if (!isOpen) { setDialogCard(null); setShowRedeemInput(false); setRedeemAmount(''); } }}>
        <DialogContent className="bg-eco-dark-secondary text-eco-light border-eco-accent/50 max-w-md rounded-xl">
          {dialogCard && (
            <>
              <DialogHeader className="pt-2">
                <DialogTitle className="text-eco-light text-xl text-center">Ecotab Card Details</DialogTitle>
                <DialogDescription className="text-eco-gray text-center text-xs">
                  Card ending in •••• {dialogCard.cardNumberSuffix}
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 px-2">
                 {/* Pass updated cardHolder to GradientDebitCard in Dialog */}
                <GradientDebitCard {...dialogCard} cardHolder={userProfile?.full_name || dialogCard.cardHolder} />
              </div>

              {!showRedeemInput ? (
                <>
                  <div className="space-y-3 my-4 px-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-eco-gray">
                        <NfcIcon size={18} className={`mr-2 ${dialogCard.nfcActive ? 'text-eco-accent' : 'text-eco-gray/70'}`} />
                        NFC Status:
                      </span>
                      <span className={`font-semibold ${dialogCard.nfcActive ? 'text-eco-accent' : 'text-eco-gray/70'}`}>
                        {dialogCard.nfcActive ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="flex items-center text-eco-gray">
                        <CheckCircle size={18} className="mr-2 text-green-400" />
                        Card Status:
                       </span>
                       <span className="font-semibold text-green-400">Ready for use</span>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-eco-light mt-3 mb-1">Redemption Note</h4>
                      <p className="text-xs text-eco-gray leading-relaxed">
                        Redeemed EcoPoints can be used towards online/offline gift cards or services via this Ecotab card. 
                        Select specific gift cards from the "Gift Cards" section in the app.
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-center gap-3 px-4 pb-4 pt-2">
                    <Button 
                      type="button" 
                      className="flex-1 bg-eco-accent text-eco-dark hover:bg-eco-accent/90 font-semibold"
                      onClick={() => setShowRedeemInput(true)}
                    >
                      Redeem EcoPoints
                    </Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="flex-1 border-eco-gray text-eco-gray hover:bg-eco-gray/20 hover:text-eco-light font-semibold">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              ) : (
                <div className="my-2 px-4 space-y-4">
                  <h3 className="text-lg font-semibold text-eco-light text-center">Redeem EcoPoints</h3>
                  <p className="text-sm text-eco-gray text-center">Your balance: <span className="font-bold text-eco-accent">{userEcoPoints.toLocaleString()} pts</span></p>
                  <div>
                    <label htmlFor="redeemAmount" className="text-xs font-medium text-eco-gray block mb-1.5">
                      Enter points to load onto this card:
                    </label>
                    <Input
                      id="redeemAmount"
                      type="number"
                      placeholder="e.g., 500"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      className="bg-eco-dark border-eco-gray focus:border-eco-accent text-eco-light placeholder:text-eco-gray/50"
                      min="1"
                      step="1"
                    />
                  </div>
                  <DialogFooter className="sm:justify-center gap-3 pt-2 pb-4">
                    <Button 
                      type="button" 
                      className="flex-1 bg-eco-accent text-eco-dark hover:bg-eco-accent/90 font-semibold"
                      onClick={handleEcotabRedemption}
                      disabled={!redeemAmount || parseInt(redeemAmount) <= 0 || parseInt(redeemAmount) > userEcoPoints}
                    >
                      Confirm & Load
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 border-eco-gray text-eco-gray hover:bg-eco-gray/20 hover:text-eco-light font-semibold"
                      onClick={() => { setShowRedeemInput(false); setRedeemAmount(''); }}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <TransactionHistoryModal open={showTxModal} onClose={() => setShowTxModal(false)} />
    </div>
  );
};

export default RewardsPage;
