
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EcoCoinsProvider } from "./context/EcoCoinsContext";
import { ChallengesProvider } from "./context/ChallengesContext"; // Import ChallengesProvider
import { ThemeProvider as NextThemesProvider } from "next-themes"; 

import WelcomeScreen from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import RewardsPage from "./pages/RewardsPage";
import ProfilePage from "./pages/ProfilePage";
import EcotabDetailsPage from "./pages/EcotabDetailsPage";
import GoalSelectionPage from "./pages/GoalSelectionPage";
import SplashScreenPage from "./pages/SplashScreenPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import GiftCards from './pages/GiftCards';
import EditProfilePage from './pages/EditProfilePage';
import OrderEcotabPage from './pages/OrderEcotabPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import AppearanceSettingsPage from './pages/AppearanceSettingsPage';
import ChallengesPage from './pages/ChallengesPage'; // Import ChallengesPage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EcoCoinsProvider>
      <ChallengesProvider> {/* Wrap with ChallengesProvider */}
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate replace to="/splash" />} />
                <Route path="/splash" element={<SplashScreenPage />} />
                <Route path="/welcome" element={<WelcomeScreen />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/goal-selection" element={<GoalSelectionPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/challenges" element={<ChallengesPage />} /> {/* Add route for ChallengesPage */}
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/ecotab-details" element={<EcotabDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/order-ecotab" element={<OrderEcotabPage />} />
                <Route path="/notification-settings" element={<NotificationSettingsPage />} />
                <Route path="/appearance-settings" element={<AppearanceSettingsPage />} />
                <Route path="/gift-cards" element={<GiftCards />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NextThemesProvider>
      </ChallengesProvider>
    </EcoCoinsProvider>
  </QueryClientProvider>
);

export default App;

