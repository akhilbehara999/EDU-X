import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const supabaseUrl = 'https://kwrpjhajdvlilplpmhds.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cnBqaGFqZHZsaWxwbHBtaGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTE3ODksImV4cCI6MjA4MDU4Nzc4OX0.yg9h6L1Z8Le9GTaQGA80HVH6p_rlwDcUKahX7z9pv0Y'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)