
import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag } from '@/components/icons';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const OrderEcotabPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark/80 backdrop-blur-md z-40 shadow-sm">
        <Button variant="ghost" size="icon" className="text-eco-light hover:text-eco-accent" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-semibold text-eco-light">Order Ecotab Card</h1>
        <EcoRunLogo size="small" />
      </header>

      <main className="flex-grow p-4 flex flex-col justify-center items-center text-center overflow-y-auto pb-24 animate-fade-in-up">
        <Card className="bg-eco-dark-secondary border-transparent shadow-lg w-full max-w-md">
          <CardHeader>
            <ShoppingBag size={48} className="mx-auto text-eco-accent mb-4" />
            <CardTitle className="text-eco-light text-2xl">Get Your Ecotab Card</CardTitle>
            <CardDescription className="text-eco-gray">
              Unlock exclusive benefits and make seamless transactions with your Ecotab.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-eco-light">
              Details about the Ecotab card and ordering process will be available here soon.
            </p>
            <Button className="w-full bg-eco-accent text-eco-dark hover:bg-eco-accent/90">
              Learn More (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default OrderEcotabPage;
