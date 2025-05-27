
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from "next-themes";
import './App.css';

import Activities from './pages/ActivitiesPage';
import Home from './pages/Index';
import Profile from './pages/ProfilePage';
import Rewards from './pages/RewardsPage';
import NotFound from './pages/NotFound';
import { supabase } from './integrations/supabase/client';
import Auth from './pages/LoginPage';
import { EcoCoinsProvider } from './context/EcoCoinsContext';
import Dashboard from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage'; // Added
// MeetAndRunPage import removed
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); 

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('App.tsx: onAuthStateChange event:', event, 'session:', currentSession);
      setSession(currentSession);
      setLoading(false); 
    });

    supabase.auth.getSession().catch(error => {
      console.error("App.tsx: Error during explicit supabase.auth.getSession():", error);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <EcoCoinsProvider>
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="vite-ui-theme" enableSystem={false} disableTransitionOnChange>
          <Router>
            <Routes>
              <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
              <Route path="/" element={session ? <Dashboard /> : <Home />} /> 
              <Route path="/welcome" element={<Home />} />
              <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/auth" />} />
              <Route path="/adashboard" element={session ? <AdminDashboardPage /> : <Navigate to="/auth" />} /> {/* Added admin route */}
              <Route path="/activities" element={session ? <Activities /> : <Navigate to="/auth" />} />
              <Route path="/rewards" element={session ? <Rewards /> : <Navigate to="/auth" />} />
              <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />
              {/* Route for /meet-and-run removed */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster richColors />
        </ThemeProvider>
      </EcoCoinsProvider>
    </QueryClientProvider>
  );
}

export default App;

