import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { appEnv, isSupabaseConfigured } from '../env';
import type { Database } from './database.types';

let browserClient: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  browserClient = createClient<Database>(appEnv.supabaseUrl, appEnv.supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
};
