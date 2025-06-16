
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/admin';

export function useAuthProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      setProfileLoading(true);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user?.id]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return { error: 'User not authenticated' };

    try {
      console.log('Updating profile for user:', user.id, 'with data:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        return { error };
      }

      await refreshProfile();
      console.log('Profile updated successfully');
      return { error: null };
      
    } catch (error: any) {
      console.error('Unexpected profile update error:', error);
      return { error };
    }
  };

  return {
    profile,
    profileLoading,
    updateProfile,
    refreshProfile
  };
}
