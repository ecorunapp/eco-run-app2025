
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WelcomeScreen from "./pages/Index"; // Renamed Index to WelcomeScreen effectively
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/welcome" />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Placeholder routes for bottom nav items, can be built out later */}
          <Route path="/activities" element={<DashboardPage />} /> {/* TODO: Create ActivitiesPage */}
          <Route path="/rewards" element={<DashboardPage />} />    {/* TODO: Create RewardsPage */}
          <Route path="/profile" element={<DashboardPage />} />    {/* TODO: Create ProfilePage */}
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
