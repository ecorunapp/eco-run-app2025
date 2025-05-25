
import React from 'react';
import BottomNav from '@/components/BottomNav';
import EcoRunLogo from '@/components/EcoRunLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, SunMedium, Moon } from '@/components/icons';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTheme } from 'next-themes'; // Import useTheme from next-themes
import { toast } from 'sonner';

const AppearanceSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme === 'light' ? 'Light' : 'Dark'} Mode!`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground"> {/* Use theme variables */}
      <header className="p-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-40 shadow-sm">
        <Button variant="ghost" size="icon" className="text-foreground hover:text-primary" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Appearance</h1>
        <EcoRunLogo size="small" />
      </header>

      <main className="flex-grow p-4 overflow-y-auto pb-24 animate-fade-in-up">
        <Card className="bg-card border-border shadow-lg max-w-2xl mx-auto"> {/* Use theme variables */}
          <CardHeader>
            <Palette size={32} className="mx-auto text-primary mb-3" />
            <CardTitle className="text-card-foreground text-xl text-center">Customize Theme</CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Personalize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-card-foreground text-center">
              Select your preferred theme. The app will remember your choice.
            </p>
            <div className="flex flex-col sm:flex-row justify-around gap-4">
                <Button 
                  variant={theme === 'light' ? "default" : "outline"} 
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
                  onClick={() => handleThemeChange('light')}
                  data-state={theme === 'light' ? 'active' : ''}
                >
                    <SunMedium className="mr-2" /> Light Mode
                </Button>
                <Button 
                  variant={theme === 'dark' ? "default" : "outline"} 
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
                  onClick={() => handleThemeChange('dark')}
                  data-state={theme === 'dark' ? 'active' : ''}
                >
                    <Moon className="mr-2" /> Dark Mode
                </Button>
            </div>
             <p className="text-xs text-muted-foreground text-center mt-2">
              Your current theme is: <span className="font-semibold">{theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System Default'}</span>.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default AppearanceSettingsPage;
