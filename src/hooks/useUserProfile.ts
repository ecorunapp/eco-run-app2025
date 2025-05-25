
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  username: string | null; // email
}

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, weight_kg, height_cm, username')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') { // Not found
          console.warn('Profile not found for user:', userId);
          // Potentially create a default profile or handle as needed
          setProfile(null);
        } else {
          throw profileError;
        }
      } else {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          // Use setTimeout to ensure this runs after the auth state has fully settled
          // and to avoid potential issues if fetchProfile itself causes state changes
          // that might interact with the onAuthStateChange lifecycle.
          setTimeout(() => fetchProfile(currentUser.id), 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const updateProfile = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setProfile(data as UserProfile);
      return data as UserProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err);
      // Optionally refetch or revert optimistic updates if any
      if (user) await fetchProfile(user.id); // Refetch to ensure consistency
      throw err; 
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, user]);


  return { user, profile, isLoading, error, fetchProfile, updateProfile };
}
