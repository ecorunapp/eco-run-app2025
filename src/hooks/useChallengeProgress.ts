
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
// Assuming Challenge type is here - not directly used in this hook but good for context
// import { Challenge } from '@/data/challenges'; 
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
  // Cast status to the specific union type
  return (data || []).map(item => ({
    ...item,
    status: item.status as UserChallengeProgress['status'],
  })) as UserChallengeProgress[];
};

const upsertChallengeProgress = async (progress: Partial<UserChallengeProgress>): Promise<UserChallengeProgress | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated for upsert");

  if (!progress.challenge_id) {
    console.error("Challenge ID is required for upsert");
    throw new Error("Challenge ID is required for upsert");
  }

  const progressDataToSave = {
    ...progress, // Spread partial properties
    user_id: user.id,
    challenge_id: progress.challenge_id, // Ensure challenge_id is non-optional string here
    updated_at: new Date().toISOString(),
  };

  // If 'id' is explicitly undefined in progress, remove it so Supabase auto-generates or handles conflict correctly.
  if (progressDataToSave.id === undefined) {
    delete progressDataToSave.id;
  }
  
  // Ensure status is one of the allowed types if provided, otherwise DB default or existing value applies.
  // The type Partial<UserChallengeProgress> already enforces this for 'status' if present.

  const { data, error } = await supabase
    .from('user_challenge_progress')
    .upsert(progressDataToSave, { onConflict: 'user_id, challenge_id' })
    .select()
    .single();

  if (error) {
    console.error("Error upserting challenge progress:", error);
    throw error;
  }
  if (!data) return null;

  // Cast status for the returned object
  return {
    ...data,
    status: data.status as UserChallengeProgress['status'],
  } as UserChallengeProgress;
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
            // Ensure the updatedProgress being put into cache also has correctly typed status
            const correctlyTypedUpdate = {
                ...updatedProgress,
                status: updatedProgress.status as UserChallengeProgress['status'],
            };
            const index = oldData.findIndex(p => p.challenge_id === correctlyTypedUpdate.challenge_id && p.user_id === correctlyTypedUpdate.user_id);
            if (index !== -1) {
              const newData = [...oldData];
              newData[index] = correctlyTypedUpdate;
              return newData;
            }
            return [...oldData, correctlyTypedUpdate];
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
