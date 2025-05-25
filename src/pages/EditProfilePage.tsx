
import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@/components/icons';
import { useNavigate } from 'react-router-dom';
import EditProfileForm from '@/components/EditProfileForm'; // Import the form
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark/80 backdrop-blur-md z-40 shadow-sm">
        <Button variant="ghost" size="icon" className="text-eco-light hover:text-eco-accent" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-semibold text-eco-light">Edit Profile</h1>
        <EcoRunLogo size="small" /> {/* Or some other element for balance */}
      </header>

      <main className="flex-grow p-4 overflow-y-auto pb-24 animate-fade-in-up">
        <Card className="bg-eco-dark-secondary border-transparent shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-eco-light text-lg text-center">Update Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <EditProfileForm />
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default EditProfilePage;
