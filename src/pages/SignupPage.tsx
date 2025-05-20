
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EcoRunLogo from '@/components/EcoRunLogo';
import { ArrowLeft, Mail, Lock } from '@/components/icons'; // Assuming Mail and Lock icons exist or are added

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation (can be expanded with a library like Zod)
    if (password !== confirmPassword) {
      alert("Passwords don't match!"); // Replace with a toast notification later
      return;
    }
    console.log('Signing up with:', { email, password });
    // For now, simulate successful signup and navigate
    localStorage.setItem('hasCompletedOnboarding', 'false'); // Mark as new user, onboarding not done
    navigate('/goal-selection');
  };

  return (
    <div className="flex flex-col min-h-screen bg-eco-dark text-eco-light p-6 pt-10 justify-between items-center">
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/welcome')} className="text-eco-gray hover:text-eco-accent">
          <ArrowLeft size={24} />
        </Button>
        <EcoRunLogo size="small" />
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-sm animate-fade-in-up">
        <h1 className="text-3xl font-semibold mb-3 text-eco-light">Create an account</h1>
        <p className="text-eco-gray mb-8 text-center">Enter your email and password to sign up.</p>

        <form onSubmit={handleSignup} className="w-full space-y-6">
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
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-eco-gray" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10 text-base"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-eco-accent hover:bg-eco-accent-secondary text-eco-dark font-bold py-3 text-lg" size="lg">
            Create Account
          </Button>
        </form>

        {/* Social Logins Placeholder */}
        <div className="mt-8 text-center w-full">
          <p className="text-eco-gray text-sm mb-4">Or continue with</p>
          <div className="space-y-3">
            <Button variant="outline" className="w-full bg-eco-dark-secondary border-eco-dark-secondary hover:bg-eco-gray/20">
              {/* Placeholder for Google Icon */}
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full bg-eco-dark-secondary border-eco-dark-secondary hover:bg-eco-gray/20">
              {/* Placeholder for Facebook Icon */}
              Continue with Facebook
            </Button>
            <Button variant="outline" className="w-full bg-eco-dark-secondary border-eco-dark-secondary hover:bg-eco-gray/20">
              {/* Placeholder for Apple Icon */}
              Continue with Apple
            </Button>
          </div>
        </div>
        
        <p className="mt-8 text-eco-gray">
          Already have an account?{' '}
          <Button variant="link" onClick={() => navigate('/login')} className="text-eco-accent p-0 h-auto hover:underline">
            Log In
          </Button>
        </p>
      </main>
      <footer className="h-10"></footer> {/* Spacer for bottom */}
    </div>
  );
};

export default SignupPage;

