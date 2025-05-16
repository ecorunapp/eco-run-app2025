
import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { Settings, Zap, CreditCard, Gift } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const RewardsPage: React.FC = () => {
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

      <main className="flex-grow p-4 space-y-6 overflow-y-auto pb-24"> {/* pb-24 for bottom nav space */}
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

        {/* Ecotab Card Section */}
        <Card className="bg-gradient-to-br from-eco-purple via-eco-accent-secondary to-eco-pink text-white shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>EcoTab Card</CardTitle>
              <CreditCard size={32} />
            </div>
            <CardDescription className="text-gray-200 opacity-90">Your Digital Rewards & Payment Card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center bg-black/20 p-4 rounded-lg">
              <p className="text-xs opacity-70 tracking-wider">CARD NUMBER</p>
              <p className="text-2xl font-mono tracking-widest my-1">**** **** **** 3852</p>
            </div>
            <div className="flex justify-between items-end pt-2">
              <div>
                <p className="text-xs opacity-70">CARD HOLDER</p>
                <p className="font-semibold text-lg">Valued EcoRunner</p>
              </div>
              <div>
                <p className="text-xs opacity-70">VALID THRU</p>
                <p className="font-semibold text-lg">12/28</p>
              </div>
            </div>
            <Button className="w-full bg-eco-light text-eco-dark hover:bg-opacity-90 mt-6 font-semibold py-3">
              <Zap size={20} className="mr-2" /> Use Points to Pay
            </Button>
          </CardContent>
        </Card>

        {/* Available Rewards Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-semibold text-eco-light mb-4">Available Rewards</h2>
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
