import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if a session already exists (handles page refresh)
    // "Void" to explicitly say the return value is not needed
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Subscribe to future auth changes (sign in / sign out events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe()
  }, [])

  function signIn() {
    supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  function signOut() {
    supabase.auth.signOut()
  }

  return {
    user,
    isLoggedIn: user !== null,
    signIn,
    signOut,
  }
}
