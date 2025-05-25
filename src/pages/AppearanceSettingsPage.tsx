
import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, SunMedium, Moon } from '@/components/icons';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const AppearanceSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // Theme switching logic will be complex and added later.
  // For now, it's a placeholder.
  const handleChangeTheme = (theme: 'light' | 'dark' | 'system') => {
    toast.info(`Theme selection (${theme}) is a placeholder for now. Full functionality coming soon!`);
    // Actual theme change logic would go here.
    // e.g., using a context or localStorage and updating CSS variables / body class.
  };

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light">
      <header className="p-4 flex justify-between items-center sticky top-0 bg-eco-dark/80 backdrop-blur-md z-40 shadow-sm">
        <Button variant="ghost" size="icon" className="text-eco-light hover:text-eco-accent" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-semibold text-eco-light">Appearance</h1>
        <EcoRunLogo size="small" />
      </header>

      <main className="flex-grow p-4 overflow-y-auto pb-24 animate-fade-in-up">
        <Card className="bg-eco-dark-secondary border-transparent shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <Palette size={32} className="mx-auto text-eco-accent mb-3" />
            <CardTitle className="text-eco-light text-xl text-center">Customize Theme</CardTitle>
            <CardDescription className="text-eco-gray text-center">
              Personalize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-eco-light text-center">
              Theme customization (Light/Dark mode toggle) is planned. Currently, the app defaults to a dark theme.
            </p>
            <div className="flex justify-around">
                <Button variant="outline" className="flex-1 mx-2 border-eco-accent text-eco-accent hover:bg-eco-accent hover:text-eco-dark" onClick={() => handleChangeTheme('light')}>
                    <SunMedium className="mr-2" /> Light Mode
                </Button>
                <Button variant="outline" className="flex-1 mx-2 border-eco-accent text-eco-accent hover:bg-eco-accent hover:text-eco-dark" onClick={() => handleChangeTheme('dark')}>
                    <Moon className="mr-2" /> Dark Mode
                </Button>
            </div>
             <p className="text-xs text-eco-gray text-center mt-2">
              Full theme switching functionality will be implemented soon.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default AppearanceSettingsPage;
