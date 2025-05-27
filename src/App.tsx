
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
import MeetAndRunPage from './pages/MeetAndRunPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Added

const queryClient = new QueryClient(); // Added

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // Explicitly set loading when the effect runs

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('App.tsx: onAuthStateChange event:', event, 'session:', currentSession);
      setSession(currentSession);
      setLoading(false); // Update loading state based on auth changes
    });

    // To ensure that onAuthStateChange fires, Supabase might need an explicit getSession call.
    // This call also helps if the listener is somehow delayed.
    // If getSession() results in an error, onAuthStateChange should still typically fire with a null session.
    supabase.auth.getSession().catch(error => {
      console.error("App.tsx: Error during explicit supabase.auth.getSession():", error);
      // If getSession errors and onAuthStateChange hasn't fired, we might be stuck loading.
      // However, onAuthStateChange is expected to fire even after a getSession error (e.g., with session as null).
      // The setLoading(false) in onAuthStateChange should eventually handle this.
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
    <QueryClientProvider client={queryClient}> {/* Added */}
      <EcoCoinsProvider>
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="vite-ui-theme" enableSystem={false} disableTransitionOnChange>
          <Router>
            <Routes>
              <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
              {/* Adjusted root path to check session and navigate accordingly */}
              <Route path="/" element={session ? <Dashboard /> : <Home />} /> 
              <Route path="/welcome" element={<Home />} /> {/* Explicit route for welcome if needed, or consolidate with "/" */}
              <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/auth" />} />
              <Route path="/activities" element={session ? <Activities /> : <Navigate to="/auth" />} />
              <Route path="/rewards" element={session ? <Rewards /> : <Navigate to="/auth" />} />
              <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />
              <Route path="/meet-and-run" element={session ? <MeetAndRunPage /> : <Navigate to="/auth" />} />
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
