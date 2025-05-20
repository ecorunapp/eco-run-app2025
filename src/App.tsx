
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EcoCoinsProvider } from "./context/EcoCoinsContext"; // Import EcoCoinsProvider
import WelcomeScreen from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import RewardsPage from "./pages/RewardsPage";
import ProfilePage from "./pages/ProfilePage";
import EcotabDetailsPage from "./pages/EcotabDetailsPage";
import GoalSelectionPage from "./pages/GoalSelectionPage";
import SplashScreenPage from "./pages/SplashScreenPage";
import NotFound from "./pages/NotFound";
import GiftCards from './pages/GiftCards';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <EcoCoinsProvider> {/* Wrap with EcoCoinsProvider */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate replace to="/splash" />} />
            <Route path="/splash" element={<SplashScreenPage />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/goal-selection" element={<GoalSelectionPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/ecotab-details" element={<EcotabDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/gift-cards" element={<GiftCards />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </EcoCoinsProvider>
  </QueryClientProvider>
);

export default App;

