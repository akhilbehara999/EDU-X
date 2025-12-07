import { supabase } from './supabaseClient'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export interface AuthState {
  user: AuthUser | null
  session: any | null
  loading: boolean
  error: string | null
}

// Sign up a new user
export const signUp = async (email: string, password: string, name?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    })

    if (error) throw error
    
    return { user: data.user, session: data.session }
  } catch (error: any) {
    throw new Error(error.message || 'Error signing up')
  }
}

// Sign in an existing user
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    
    return { user: data.user, session: data.session }
  } catch (error: any) {
    throw new Error(error.message || 'Error signing in')
  }
}

// Sign out the current user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  } catch (error: any) {
    throw new Error(error.message || 'Error signing out')
  }
}

// Get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  } catch (error: any) {
    console.error('Error getting current user:', error.message)
    return null
  }
}

// Listen for auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  const { data: authListener } = supabase.auth.onAuthStateChange(callback)
  return authListener.subscription
}