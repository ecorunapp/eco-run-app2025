import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import type { Enums } from '@/integrations/supabase/types';

export type AppRole = Enums<'app_role'>;

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email?: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  updated_at?: string | null;
  is_banned?: boolean | null; 
  total_steps?: number | null; 
  roles?: AppRole[]; 
}

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [error, setError] = useState<Error | null>(null); 

  const fetchUserProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setRoles([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setUser(currentUser);
    setError(null);

    try {
      // Fetch profile with a timeout to prevent long waits
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      const rolesPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id);

      // Use Promise.allSettled to handle partial failures gracefully
      const [profileResult, rolesResult] = await Promise.allSettled([profilePromise, rolesPromise]);

      // Handle profile result
      if (profileResult.status === 'fulfilled') {
        const { data: profileData, error: profileError } = profileResult.value;
        if (profileError) {
          if (profileError.code === 'PGRST116') { 
            // Create default profile for new users
            const defaultProfile: UserProfile = {
              id: currentUser.id,
              username: currentUser.email,
              full_name: null,
              avatar_url: null,
              email: currentUser.email,
              weight_kg: null,
              height_cm: null,
              total_steps: 0,
              roles: ['user'],
            };
            setProfile(defaultProfile);
          } else {
            throw profileError;
          }
        } else {
          const userProfile: UserProfile = {
            ...profileData,
            email: currentUser.email,
            total_steps: profileData.total_steps || 0,
          };
          setProfile(userProfile);
        }
      }

      // Handle roles result
      if (rolesResult.status === 'fulfilled') {
        const { data: rolesData, error: rolesError } = rolesResult.value;
        if (!rolesError && rolesData) {
          const fetchedRoles = rolesData.map(r => r.role as AppRole) || ['user'];
          setRoles(fetchedRoles);
          setProfile(prev => prev ? {...prev, roles: fetchedRoles} : null);
        } else {
          setRoles(['user']); // Default role
        }
      } else {
        setRoles(['user']); // Default role if fetch fails
      }

    } catch (error: any) {
      console.error('Profile fetch error:', error);
      setError(error); 
      // Don't show toast for new users, just set defaults
      const defaultProfile: UserProfile = {
        id: currentUser.id,
        username: currentUser.email,
        full_name: null,
        avatar_url: null,
        email: currentUser.email,
        weight_kg: null,
        height_cm: null,
        total_steps: 0,
        roles: ['user'],
      };
      setProfile(defaultProfile);
      setRoles(['user']);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          setIsLoading(false);
          return;
        }
        await fetchUserProfile(session?.user || null);
      } catch (error) {
        console.error('Session fetch error:', error);
        setIsLoading(false);
      }
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

  const updateProfile = async (userIdToUpdate: string, updates: Partial<UserProfile>) => {
    if (!user) {
        toast.error("You must be logged in to update a profile.");
        return null;
    }
    
    // Basic client-side check (RLS is the source of truth for security)
    const isOwnProfile = userIdToUpdate === user.id;
    const isAdmin = roles.includes('admin');

    if (!isOwnProfile && !isAdmin) {
        toast.error("You are not authorized to update this profile.");
        return null;
    }

    setIsLoading(true); // Consider a specific loading state for this operation if needed
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userIdToUpdate)
        .select()
        .single();

      if (updateError) throw updateError;
      
      // If the updated profile is the currently logged-in user's profile, update local state
      if (userIdToUpdate === user.id) {
        setProfile(prevProfile => prevProfile ? { ...prevProfile, ...data } : data as UserProfile);
      }
      // For admin dashboard, the list of allUsers will need to be re-fetched or updated.
      // This hook doesn't manage allUsers, so the component using it (AdminDashboardPage)
      // will need to handle re-fetching or updating its local allUsers state.
      
      toast.success('Profile updated!');
      return data as UserProfile; // Ensure returned data is cast correctly
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`);
      setError(error); 
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, profile, roles, isLoading, error, updateProfile, fetchUserProfile };
};
