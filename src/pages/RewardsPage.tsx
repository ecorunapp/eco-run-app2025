
import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Gift, CreditCard, Coins, CheckCircle, Nfc as NfcIcon, Info, User, Loader2 } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionHistoryItem from '@/components/TransactionHistoryItem';
import GradientDebitCard from '@/components/GradientDebitCard';
import GiftCardDisplay from '@/components/GiftCardDisplay';
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
import { supabase } from '@/integrations/supabase/client';
import { subHours, addHours } from 'date-fns'; // Added this line

// Default image URLs for gift cards
const DEFAULT_FRONT_IMAGE_URL = '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png';
const DEFAULT_BACK_IMAGE_URL = '/lovable-uploads/1c8416bb-42a2-4d8c-93f1-9345404ac7d5.png';

// Type for user's earned gift cards
interface UserEarnedGiftCard {
  id: string; // user_gift_cards.id
  frontImageUrl: string;
  backImageUrl: string;
  promoCode: string;
  assignedAt: string; // ISO string
  title: string;
  status: string; // 'assigned', 'used', 'expired'
  // Add any other properties from user_gift_cards if needed by GiftCardDisplay or logic
}

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

// Sample data for user's earned gift cards
const sampleUserGiftCards = [
  {
    id: 'user-gc-1',
    frontImageUrl: '/lovable-uploads/f973e69a-5e3d-4a51-9760-b8fa3f2bf314.png', // Example image
    backImageUrl: '/lovable-uploads/1c8416bb-42a2-4d8c-93f1-9345404ac7d5.png',  // Example image
    promoCode: 'NOON-ABC-123',
    assignedAt: subHours(new Date(), 2).toISOString(), // Assigned 2 hours ago (locked)
    title: "Coffee Voucher", // Added for context
    status: 'assigned', // Added status for sample data consistency
  },
  {
    id: 'user-gc-2',
    frontImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874', // Example image
    backImageUrl: '/lovable-uploads/1c8416bb-42a2-4d8c-93f1-9345404ac7d5.png',
    promoCode: 'SPAWEEKEND-XYZ',
    assignedAt: subHours(new Date(), 25).toISOString(), // Assigned 25 hours ago (unlocked)
    title: "Spa Day Pass", // Added for context
    status: 'assigned', // Added status
  },
  {
    id: 'user-gc-3',
    frontImageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', // Example image
    backImageUrl: '/lovable-uploads/1c8416bb-42a2-4d8c-93f1-9345404ac7d5.png',
    promoCode: 'WINEFUN-789',
    assignedAt: addHours(new Date(), -12).toISOString(), // Assigned 12 hours ago (locked)
    title: "Wine Tasting Ticket", // Added for context
    status: 'assigned', // Added status
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
  const { 
    balance: userEcoPoints, 
    history: transactionHistory, 
    redeemPoints, 
    isLoading: ecoCoinsLoading,
    claimGiftCardPrize // Destructure claimGiftCardPrize
  } = useEcoCoins();
  const { profile: userProfile, isLoading: profileLoading } = useUserProfile();

  const [userEarnedCards, setUserEarnedCards] = useState<UserEarnedGiftCard[]>([]);
  const [isLoadingUserCards, setIsLoadingUserCards] = useState(true);

  const [ecotabCards, setEcotabCards] = useState<EcotabCardData[]>(initialEcotabCardsData);
  const [showAllEcotabCards, setShowAllEcotabCards] = useState(false);
  const [dialogCard, setDialogCard] = useState<EcotabCardData | null>(null);
  const [showRedeemInput, setShowRedeemInput] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      fetchEarnedCards();
    } else if (!profileLoading) { 
      // If not loading profile and no profile ID, means user is likely not logged in.
      // For sample data display purposes or if you want to show locked state by default:
      // setUserEarnedCards(sampleUserGiftCards); // Uncomment to show sample data if not logged in
      setIsLoadingUserCards(false); // Stop loading as there's no user to fetch for
      setEcotabCards(initialEcotabCardsData.map(card => ({
        ...card,
        cardHolder: 'Eco User',
      })));
    }
  }, [userProfile?.id, profileLoading]);

  const fetchEarnedCards = async () => {
    if (!userProfile?.id) {
      setIsLoadingUserCards(false); // Not logged in or profile not loaded
      return;
    }
    setIsLoadingUserCards(true);
    try {
      const { data, error } = await supabase
        .from('user_gift_cards')
        .select('id, prize_image_url, prize_promo_code, assigned_at, prize_title, status')
        .eq('user_id', userProfile.id)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Error fetching user earned gift cards:', error);
        toast.error('Could not load your gift cards.');
        setUserEarnedCards([]);
      } else if (data) {
        const mappedCards: UserEarnedGiftCard[] = data.map(card => ({
          id: card.id,
          frontImageUrl: card.prize_image_url || DEFAULT_FRONT_IMAGE_URL,
          backImageUrl: DEFAULT_BACK_IMAGE_URL, // Using a default back image
          promoCode: card.prize_promo_code || 'CODE-UNAVAILABLE', // Provide a fallback if null
          assignedAt: card.assigned_at || new Date().toISOString(), // Fallback, though assigned_at should always exist
          title: card.prize_title || 'Untitled Reward',
          status: card.status || 'assigned',
        }));
        setUserEarnedCards(mappedCards);
      }
    } catch (e) {
      console.error('Exception fetching user earned gift cards:', e);
      toast.error('An error occurred while loading your gift cards.');
      setUserEarnedCards([]);
    } finally {
      setIsLoadingUserCards(false);
    }
  };

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
        
        {/* My Gift Cards Section - UPDATED */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-semibold text-eco-light mb-4">My Earned Gift Cards</h2>
          {isLoadingUserCards ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-eco-accent" />
              <p className="ml-3 text-eco-gray">Loading your gift cards...</p>
            </div>
          ) : userEarnedCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userEarnedCards.map(card => (
                <div key={card.id} className="flex flex-col items-center">
                  <GiftCardDisplay
                    frontImageUrl={card.frontImageUrl}
                    backImageUrl={card.backImageUrl}
                    promoCode={card.promoCode}
                    assignedAt={card.assignedAt}
                    onCodeCopied={async (copiedCode) => {
                      if (card.status === 'used') {
                        toast.info(`Gift card "${card.title}" has already been claimed.`);
                        return;
                      }
                      const claimedSuccessfully = await claimGiftCardPrize(card.id);
                      if (claimedSuccessfully) {
                        toast.success(`Prize "${card.title}" Claimed!`, { 
                          description: "The promo code has been copied and your prize claim initiated." 
                        });
                        setUserEarnedCards(prevCards => 
                          prevCards.map(c => c.id === card.id ? { ...c, status: 'used' } : c)
                        );
                      } else {
                        toast.error("Claim Error", { description: "Could not finalize prize claim for this card. Please try again." });
                      }
                    }}
                  />
                   <p className="text-center text-eco-light mt-2 text-md font-semibold">{card.title}</p>
                   {card.status === 'used' && (
                     <p className="text-xs text-green-400">(Claimed)</p>
                   )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-eco-gray text-center py-4">You haven't earned any gift cards yet. Complete challenges to win!</p>
          )}
        </section>
        
        {/* Transaction History Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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
        
        {/* Featured Offers Section - Placeholder for where RewardOfferCard might go */}
        {/* <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-semibold text-eco-light mb-4">Featured Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredOffers.map(offer => ( // Assuming featuredOffers is defined
              <RewardOfferCard key={offer.id} {...offer} onRedeem={() => handleRedeemOffer(offer.points, offer.title)} />
            ))}
          </div>
        </section> */}

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
