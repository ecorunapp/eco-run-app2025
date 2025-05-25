
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import type { Enums } from '@/integrations/supabase/types'; // Import Enums

export type AppRole = Enums<'app_role'>; // 'admin' | 'user'

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  updated_at?: string | null;
  is_banned?: boolean | null; // Added
  total_steps?: number | null; // Added
  roles?: AppRole[]; // Added
}

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const fetchUserProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    setUser(currentUser);
    setIsLoading(true);

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        // It's possible the profile might not exist immediately after sign up due to trigger delay
        // or if the trigger failed. Handle this gracefully.
        if (profileError.code === 'PGRST116') { // "JSON object requested, multiple (or no) rows returned"
            toast.warning("Profile not found or multiple entries. Waiting for profile creation...");
            // Optionally, retry or guide user. For now, set profile to null.
            setProfile(null);
        } else {
            throw profileError;
        }
      } else {
        setProfile(profileData as UserProfile);
      }

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id);

      if (rolesError) throw rolesError;
      setRoles(rolesData.map(r => r.role as AppRole) || []);

    } catch (error: any) {
      toast.error(`Failed to fetch user data: ${error.message}`);
      setProfile(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUserProfile(session?.user || null);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await fetchUserProfile(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      // Optimistically update local profile state or refetch
      setProfile(prevProfile => prevProfile ? { ...prevProfile, ...data } : data as UserProfile);
      toast.success('Profile updated!');
      return data;
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, profile, roles, isLoading, updateProfile, fetchUserProfile };
};
