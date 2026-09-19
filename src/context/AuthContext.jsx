import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // เช็ค session ที่ login ค้างไว้อยู่แล้ว (ถ้ามี)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // ฟัง event ตอน login/logout เพื่ออัปเดตสถานะทั้งแอปทันที
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [user])

  const login = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)