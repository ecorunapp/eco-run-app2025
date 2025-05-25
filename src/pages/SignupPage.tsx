
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EcoRunLogo from '@/components/EcoRunLogo';
import { ArrowLeft, Mail, Lock, User as UserIcon, UploadCloud, Weight, Zap // Using Zap for height as an example icon
} from '@/components/icons';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react'; // Replaced duplicate Loader2 import

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        // We will update profile details in a separate step after signup
        // options: {
        //   data: {
        //     full_name: fullName, // This would require handle_new_user trigger to be updated
        //   }
        // }
      });

      if (signUpError) {
        toast.error(signUpError.message);
        setIsLoading(false);
        return;
      }
      
      if (!signUpData.user) {
        // This case can happen if email confirmation is required but the user already exists with an unconfirmed email.
        toast.error("User already exists or sign up failed. Please try logging in or use a different email.");
        setIsLoading(false);
        return;
      }
      
      const user = signUpData.user;
      let avatarPublicUrl: string | null = null;

      if (avatarFile) {
        const filePath = `${user.id}/${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('profile_pictures')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast.warning('Signup successful, but avatar upload failed. You can update it later.');
          // Proceed without avatar if upload fails
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('profile_pictures')
            .getPublicUrl(filePath);
          avatarPublicUrl = publicUrlData?.publicUrl || null;
        }
      }

      // Update the profile table. The handle_new_user trigger already creates a basic profile.
      // We are updating it here with additional details.
      const profileUpdateData: {
        full_name: string;
        avatar_url?: string;
        weight_kg?: number;
        height_cm?: number;
      } = {
        full_name: fullName,
      };
      if (avatarPublicUrl) profileUpdateData.avatar_url = avatarPublicUrl;
      if (weight) profileUpdateData.weight_kg = parseFloat(weight);
      if (height) profileUpdateData.height_cm = parseFloat(height);
      
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError);
        toast.warning('Signup successful, but profile details might not be fully saved. Please check your profile.');
      }

      toast.success('Signup successful! Please check your email to confirm your account (if required).');
      navigate('/login');

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
        <h1 className="text-3xl font-semibold mb-3 text-eco-light">Create an account</h1>
        <p className="text-eco-gray mb-8 text-center">Join EcoRun and start your journey!</p>

        <form onSubmit={handleSignup} className="w-full space-y-4">
          {/* Avatar Upload */}
          <div className="space-y-2 flex flex-col items-center">
            <Label htmlFor="avatar" className="self-start">Profile Picture (Optional)</Label>
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-2 border-eco-accent" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-eco-dark-secondary flex items-center justify-center border-2 border-eco-gray">
                  <UserIcon size={48} className="text-eco-gray" />
                </div>
              )}
              <Button type="button" size="icon" variant="outline" className="absolute bottom-0 right-0 bg-eco-dark-secondary rounded-full p-1 border-eco-accent" onClick={() => document.getElementById('avatar-input')?.click()}>
                <UploadCloud size={16} className="text-eco-accent" />
              </Button>
            </div>
            <Input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-eco-gray" />
              <Input
                id="fullName"
                type="text"
                placeholder="e.g., Alex Green"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-10 text-base"
                disabled={isLoading}
              />
            </div>
          </div>

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
                placeholder="•••••••• (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 text-base"
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-eco-gray" />
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g., 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="pl-10 text-base"
                  disabled={isLoading}
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-eco-gray" /> {/* Using Zap as placeholder icon */}
                <Input
                  id="height"
                  type="number"
                  placeholder="e.g., 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="pl-10 text-base"
                  disabled={isLoading}
                  min="0"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-eco-accent hover:bg-eco-accent-secondary text-eco-dark font-bold py-3 text-lg mt-6" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Account'}
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
          Already have an account?{' '}
          <Button variant="link" onClick={() => navigate('/login')} className="text-eco-accent p-0 h-auto hover:underline" disabled={isLoading}>
            Log In
          </Button>
        </p>
      </main>
      <footer className="h-10"></footer> {/* Spacer for bottom */}
    </div>
  );
};

export default SignupPage;
