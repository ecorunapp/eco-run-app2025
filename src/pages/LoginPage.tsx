
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EcoRunLogo from '@/components/EcoRunLogo';
import { ArrowLeft, Mail, Lock, Loader2 } from '@/components/icons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UserProfile, AppRole } from '@/hooks/useUserProfile';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const handleAuthRedirect = async (userId: string) => {
      setIsLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_banned, id')
          .eq('id', userId)
          .single<Pick<UserProfile, 'is_banned' | 'id'>>();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          if (profileError.code !== 'PGRST116') {
            toast.error(`Error fetching profile: ${profileError.message}`);
            await supabase.auth.signOut(); 
            navigate('/auth');
            return;
          }
          // If PGRST116 (no profile found), continue to role check
        }

        if (profileData?.is_banned) {
          toast.error('Your account has been banned.');
          await supabase.auth.signOut();
          navigate('/auth');
          return;
        }

        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (rolesError) {
          console.error('Roles fetch error:', rolesError);
          toast.success('Logged in successfully!');
          navigate('/dashboard'); 
          return;
        }

        const roles = rolesData?.map(r => r.role as AppRole) || [];
        if (roles.includes('admin')) {
          toast.success('Admin login successful!');
          navigate('/adashboard');
        } else {
          toast.success('Logged in successfully!');
          navigate('/dashboard');
        }
      } catch (e: any) {
        console.error('Auth redirect error:', e);
        toast.error(`An unexpected error occurred: ${e.message}`);
        await supabase.auth.signOut();
        navigate('/auth');
      } finally {
        setIsLoading(false);
        setIsCheckingSession(false);
      }
    };

    const checkSession = async () => {
      setIsCheckingSession(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
        }
        if (session) {
          await handleAuthRedirect(session.user.id);
        } else {
          setIsCheckingSession(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setIsCheckingSession(false);
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        await handleAuthRedirect(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setEmail('');
        setPassword('');
        navigate('/auth'); 
        setIsCheckingSession(false); 
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
      // Success handling is done in onAuthStateChange
    } catch (catchError: any) {
      toast.error(catchError.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } 
  };

  if (isCheckingSession || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light p-6 justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-eco-accent" />
        <p className="mt-4">
          {isCheckingSession && !isLoading ? "Checking session..." : "Processing..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light p-6 pt-10 justify-between items-center">
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/welcome')} className="text-eco-gray hover:text-eco-accent" disabled={isLoading}>
          <ArrowLeft size={24} />
        </Button>
        <EcoRunLogo size="small" />
        <div className="w-10" />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-sm animate-fade-in-up">
        <h1 className="text-3xl font-semibold mb-3 text-eco-light">Welcome back,</h1>
        <p className="text-eco-gray mb-8 text-center">Enter your email address and password to log in.</p>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-eco-gray" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 text-base"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-eco-gray" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 text-base"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="text-right">
            <Button variant="link" onClick={() => { toast.info("Forgot password functionality coming soon!") }} className="text-eco-accent p-0 h-auto text-sm hover:underline" disabled={isLoading}>
              Forgot password?
            </Button>
          </div>
          <Button type="submit" className="w-full bg-eco-accent hover:bg-eco-accent-secondary text-eco-dark font-bold py-3 text-lg" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Log In'}
          </Button>
        </form>

        <div className="mt-8 text-center w-full">
          <p className="text-eco-gray text-sm mb-4">Or continue with</p>
          <div className="space-y-3">
            <Button variant="outline" className="w-full bg-eco-dark-secondary border-eco-dark-secondary hover:bg-eco-gray/20" disabled={isLoading}>
              Continue with Google
            </Button>
             <Button variant="outline" className="w-full bg-eco-dark-secondary border-eco-dark-secondary hover:bg-eco-gray/20" disabled={isLoading}>
              Continue with Facebook
            </Button>
             <Button variant="outline" className="w-full bg-eco-dark-secondary border-eco-dark-secondary hover:bg-eco-gray/20" disabled={isLoading}>
              Continue with Apple
            </Button>
          </div>
        </div>

        <p className="mt-8 text-eco-gray">
          Don't have an account?{' '}
          <Button variant="link" onClick={() => navigate('/signup')} className="text-eco-accent p-0 h-auto hover:underline" disabled={isLoading}>
            Sign Up
          </Button>
        </p>
      </main>
      <footer className="h-10"></footer>
    </div>
  );
};

export default LoginPage;
