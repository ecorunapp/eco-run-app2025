
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from "next-themes"; // Updated import
import './App.css';
// Removed BottomNav import as it's not used in App.tsx directly if pages include it.
// If it was meant to be here for a layout, it should be part of the JSX.
// For now, assuming individual pages like Home, Dashboard etc. include it if needed.

import Activities from './pages/ActivitiesPage'; // Updated import
import Home from './pages/Index'; // Updated import - Assuming Home component is from Index.tsx
import Profile from './pages/ProfilePage'; // Updated import
import Rewards from './pages/RewardsPage'; // Updated import
import NotFound from './pages/NotFound'; // This was likely correct
import { supabase } from './integrations/supabase/client'; // This was likely correct
import Auth from './pages/LoginPage'; // Updated import - Pointing to LoginPage as Auth.tsx is not found
import { EcoCoinsProvider } from './context/EcoCoinsContext'; // This was likely correct
import Dashboard from './pages/DashboardPage'; // Updated import
import MeetAndRunPage from './pages/MeetAndRunPage'; // This was likely correct

function App() {
  const [session, setSession] = useState<any>(null); // Using 'any' for session type for now
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => { // Renamed to avoid conflict
        setSession(currentSession);
        setLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => { // Renamed to avoid conflict
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      authListener?.unsubscribe();
    };
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
      <ThemeProvider attribute="class" defaultTheme="light" storageKey="vite-ui-theme" enableSystem={false} disableTransitionOnChange>
        <Router>
          <Routes>
            <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/" element={session ? <Home /> : <Navigate to="/auth" />} />
            <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/activities" element={session ? <Activities /> : <Navigate to="/auth" />} />
            <Route path="/rewards" element={session ? <Rewards /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />
            <Route path="/meet-and-run" element={session ? <MeetAndRunPage /> : <Navigate to="/auth" />} /> {/* Added session check for consistency */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster richColors />
      </ThemeProvider>
    </EcoCoinsProvider>
  );
}

export default App;
