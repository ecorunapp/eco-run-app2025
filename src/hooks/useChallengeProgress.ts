
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Challenge } from '@/data/challenges'; // Assuming Challenge type is here
import { LatLngTuple } from 'leaflet';

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'not_started' | 'active' | 'paused' | 'completed';
  current_steps?: number | null;
  paused_location_name?: string | null;
  paused_location_lat?: number | null;
  paused_location_lng?: number | null;
  kilometers_covered_at_pause?: number | null;
  completed_location_name?: string | null;
  completed_location_lat?: number | null;
  completed_location_lng?: number | null;
  created_at?: string;
  updated_at?: string;
}

const fetchChallengeProgress = async (): Promise<UserChallengeProgress[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('user_challenge_progress')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;
  return data || [];
};

const upsertChallengeProgress = async (progress: Partial<UserChallengeProgress>): Promise<UserChallengeProgress | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated for upsert");

  if (!progress.challenge_id) throw new Error("Challenge ID is required for upsert");

  const progressDataToSave = {
    ...progress,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  // Remove id if it's an insert, or if it's a specific known ID for an existing record.
  // Supabase upsert handles this based on UNIQUE constraint (user_id, challenge_id)
  // If 'id' is present and matches an existing record, it updates. Otherwise, it inserts.
  // Forcing an insert by omitting id can be problematic if record exists.
  // It's better to rely on the UNIQUE constraint for upsert.

  const { data, error } = await supabase
    .from('user_challenge_progress')
    .upsert(progressDataToSave, { onConflict: 'user_id, challenge_id' })
    .select()
    .single();

  if (error) {
    console.error("Error upserting challenge progress:", error);
    throw error;
  }
  return data;
};


export const useChallengeProgress = () => {
  const queryClient = useQueryClient();

  const { data: challengeProgressList = [], isLoading, error } = useQuery<UserChallengeProgress[], Error>({
    queryKey: ['challengeProgress'],
    queryFn: fetchChallengeProgress,
  });

  const mutation = useMutation<UserChallengeProgress | null, Error, Partial<UserChallengeProgress>>({
    mutationFn: upsertChallengeProgress,
    onSuccess: (updatedProgress) => {
      queryClient.invalidateQueries({ queryKey: ['challengeProgress'] });
      // Optionally update the cache directly
      if (updatedProgress) {
          queryClient.setQueryData(['challengeProgress'], (oldData: UserChallengeProgress[] | undefined) => {
            if (!oldData) return [updatedProgress];
            const index = oldData.findIndex(p => p.challenge_id === updatedProgress.challenge_id && p.user_id === updatedProgress.user_id);
            if (index !== -1) {
              const newData = [...oldData];
              newData[index] = updatedProgress;
              return newData;
            }
            return [...oldData, updatedProgress];
          });
      }
    },
  });

  const getProgressByChallengeId = useCallback((challengeId: string): UserChallengeProgress | undefined => {
    return challengeProgressList.find(p => p.challenge_id === challengeId);
  }, [challengeProgressList]);

  return {
    challengeProgressList,
    isLoading,
    error,
    upsertProgress: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    getProgressByChallengeId,
  };
};
