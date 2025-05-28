
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
import SplashScreenPage from './pages/SplashScreenPage';
import { supabase } from './integrations/supabase/client';
import Auth from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { EcoCoinsProvider } from './context/EcoCoinsContext';
import Dashboard from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  useEffect(() => {
    // Check if user has seen splash screen before
    const splashSeen = localStorage.getItem('hasSeenSplash');
    setHasSeenSplash(splashSeen === 'true');

    setLoading(true); 

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('App.tsx: onAuthStateChange event:', event, 'session:', currentSession);
      setSession(currentSession);
      setLoading(false); 
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("App.tsx: Error during getSession():", error);
        } else {
          setSession(initialSession);
        }
      } catch (error) {
        console.error("App.tsx: Error during explicit supabase.auth.getSession():", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

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
              {/* Public routes */}
              <Route path="/welcome" element={<Home />} />
              <Route path="/splash" element={<SplashScreenPage />} />
              
              {/* Auth routes */}
              <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
              <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
              <Route path="/signup" element={session ? <Navigate to="/dashboard" /> : <SignupPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/auth" />} />
              <Route path="/adashboard" element={session ? <AdminDashboardPage /> : <Navigate to="/auth" />} />
              <Route path="/activities" element={session ? <Activities /> : <Navigate to="/auth" />} />
              <Route path="/rewards" element={session ? <Rewards /> : <Navigate to="/auth" />} />
              <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />
              
              {/* Root route logic */}
              <Route 
                path="/" 
                element={
                  session ? (
                    <Navigate to="/dashboard" />
                  ) : hasSeenSplash ? (
                    <Navigate to="/auth" />
                  ) : (
                    <Navigate to="/splash" />
                  )
                } 
              />
              
              {/* Catch all */}
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
