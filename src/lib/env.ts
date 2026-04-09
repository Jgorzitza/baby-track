const readEnv = (value: string | undefined): string => value?.trim() ?? '';

const isPlaceholder = (value: string): boolean =>
  value.length === 0 ||
  value.includes('your-supabase-url-here') ||
  value.includes('your-supabase-publishable-key-here') ||
  value.includes('your-supabase-publishable-default-key-here') ||
  value.includes('your-supabase-anon-key-here');

const supabasePublishableKey =
  readEnv(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  readEnv(import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) ||
  readEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const appEnv = {
  appUrl: readEnv(import.meta.env.VITE_APP_URL),
  envMode: readEnv(import.meta.env.VITE_ENV_MODE) || 'development',
  supabaseUrl: readEnv(import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey,
  supabaseProjectId: readEnv(import.meta.env.VITE_SUPABASE_PROJECT_ID),
};

export const isSupabaseConfigured =
  !isPlaceholder(appEnv.supabaseUrl) && !isPlaceholder(appEnv.supabasePublishableKey);

export const getMissingConfigMessage = (): string =>
  'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env to enable auth and data sync. VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is also accepted for Supabase quickstart compatibility. Use VITE_SUPABASE_ANON_KEY only as a local/self-hosted fallback.';
