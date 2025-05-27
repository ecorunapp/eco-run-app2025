import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/components/theme-provider"
import './App.css';
import BottomNav from './components/BottomNav';
import Activities from './pages/Activities';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import NotFound from './pages/NotFound';
import { supabase } from './integrations/supabase/client';
import Auth from './pages/Auth';
import { EcoCoinsProvider } from './context/EcoCoinsContext';
import Dashboard from './pages/Dashboard';
import MeetAndRunPage from './pages/MeetAndRunPage'; // Add this line

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <EcoCoinsProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/" element={session ? <Home /> : <Navigate to="/auth" />} />
            <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/activities" element={session ? <Activities /> : <Navigate to="/auth" />} />
            <Route path="/rewards" element={session ? <Rewards /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />
            <Route path="/meet-and-run" element={<MeetAndRunPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster richColors />
      </ThemeProvider>
    </EcoCoinsProvider>
  );
}

export default App;
