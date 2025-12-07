declare module 'supabase' {
  export interface SupabaseClient {
    auth: {
      signUp: (credentials: { email: string; password: string; options?: { data?: Record<string, any> } }) => Promise<any>;
      signInWithPassword: (credentials: { email: string; password: string }) => Promise<any>;
      signOut: () => Promise<{ error: Error | null }>;
      getSession: () => Promise<{ data: { session: any }; error: Error | null }>;
      getUser: () => Promise<{ data: { user: any }; error: Error | null }>;
      onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } };
    };
  }

  export function createClient(supabaseUrl: string, supabaseKey: string): SupabaseClient;
}