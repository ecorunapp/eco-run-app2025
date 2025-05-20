import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EcoRunLogo from '@/components/EcoRunLogo';
import { ArrowLeft, Mail, Lock, Loader2 } from '@/components/icons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, check onboarding status from their profile (to be implemented later)
        // For now, navigate to dashboard directly
        navigate('/dashboard');
      }
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Potentially check onboarding status from user profile here
        // const userProfile = await supabase.from('profiles').select('has_completed_onboarding').eq('id', session.user.id).single()
        // if (userProfile.data && userProfile.data.has_completed_onboarding) {
        //   navigate('/dashboard');
        // } else {
        //   navigate('/goal-selection');
        // }
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        navigate('/login');
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
      }
      // Successful login is handled by onAuthStateChange
    } catch (catchError: any) {
      toast.error(catchError.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light p-6 pt-10 justify-between items-center">
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/welcome')} className="text-eco-gray hover:text-eco-accent" disabled={isLoading}>
          <ArrowLeft size={24} />
        </Button>
        <EcoRunLogo size="small" />
        <div className="w-10" /> {/* Spacer */}
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
            <Button variant="link" onClick={() => { /* TODO: Implement Supabase password reset flow */ toast.info("Forgot password functionality coming soon!") }} className="text-eco-accent p-0 h-auto text-sm hover:underline" disabled={isLoading}>
              Forgot password?
            </Button>
          </div>
          <Button type="submit" className="w-full bg-eco-accent hover:bg-eco-accent-secondary text-eco-dark font-bold py-3 text-lg" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Log In'}
          </Button>
        </form>

         {/* Social Logins Placeholder - TODO: Implement with Supabase OAuth */}
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
      <footer className="h-10"></footer> {/* Spacer for bottom */}
    </div>
  );
};

export default LoginPage;
