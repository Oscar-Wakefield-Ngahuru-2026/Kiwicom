import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'
import { upsertProfile } from '../apiClient'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null) // Auth state starts as null - not logged in
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check if a session already exists (handles page refresh)
    // "Void" to explicitly say the return value is not needed
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setToken(session?.provider_token ?? null)
      setLoading(false)
    })

    // Subscribe to future auth changes (sign in / sign out events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setToken(session?.provider_token ?? null)
      if (event === 'SIGNED_IN' && session?.user) {
        const { id, user_metadata } = session.user
        void upsertProfile({
          id,
          githubUsername: user_metadata.user_name,
          avatarUrl: user_metadata.avatar_url,
        })
      }
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
    loading,
    token,
    signIn,
    signOut,
  }
}
