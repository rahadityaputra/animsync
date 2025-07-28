import { createClient } from '@/lib/supabase/client';

export const getCurrentUser = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};