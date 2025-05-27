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
  email?: string | null; // Optional: if you fetch email along with profile
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
    setIsLoading(true);
    setError(null); // Reset error on new fetch

    try {
      // Fetch profile
      // For admin, we might need a different query or separate function if they need all users here.
      // For now, this fetches the logged-in user's profile.
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, roles:user_roles(role)') // Fetch roles alongside profile
        .eq('id', currentUser.id)
        .single();
      
      if (profileError) {
        if (profileError.code === 'PGRST116') { 
            toast.warning("Profile not found or multiple entries. Waiting for profile creation...");
            setProfile(null);
            setRoles([]); // Ensure roles are cleared if profile is not found
        } else {
            throw profileError;
        }
      } else {
        // Extract roles from the nested structure if fetched this way
        const fetchedRoles = (profileData as any)?.roles?.map((r: {role: AppRole}) => r.role) || [];
        const userProfile: UserProfile = {
            ...profileData,
            email: currentUser.email, // Add email from auth user
            roles: fetchedRoles,
        };
        setProfile(userProfile);
        setRoles(fetchedRoles);

        // If roles were not fetched with profile, fetch them separately
        if (fetchedRoles.length === 0) {
            const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id);

            if (rolesError) throw rolesError;
            const separateRoles = rolesData.map(r => r.role as AppRole) || [];
            setRoles(separateRoles);
            setProfile(prev => prev ? {...prev, roles: separateRoles} : null);
        }
      }

    } catch (error: any) {
      toast.error(`Failed to fetch user data: ${error.message}`);
      setError(error); 
      setProfile(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      // Fetch session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        toast.error(`Error getting session: ${sessionError.message}`);
        setIsLoading(false);
        return;
      }
      // Then fetch profile using the user from session
      await fetchUserProfile(session?.user || null);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // This callback should ideally be lean. Offload heavy lifting.
        // console.log("Auth state changed, new session:", session);
        // Directly calling fetchUserProfile here is okay if it's efficient
        // For more complex scenarios, consider event emitters or a more robust state management
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
