import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../types'

interface AuthContextType {
  user: User | null
  session: Session | null
  perfil: Perfil | null
  loading: boolean
  signUp: (email: string, password: string, nome: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  const loadPerfil = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao carregar perfil:', error)
        return null
      }

      return data as Perfil
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      return null
    }
  }

  const createPerfil = async (userId: string, email: string, nome: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .upsert({
          id: userId,
          nome,
          email,
          plano: 'CORRETOR_SOLO',
        }, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar perfil:', error)
        return null
      }

      return data as Perfil
    } catch (err) {
      console.error('Erro ao criar perfil:', err)
      return null
    }
  }

  useEffect(() => {
    let mounted = true
    
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false)
      }
    }, 10000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const perfilData = await loadPerfil(session.user.id)
        if (mounted) setPerfil(perfilData)
      }

      if (mounted) setLoading(false)
    }).catch((err) => {
      console.error('Erro ao obter sessão:', err)
      if (mounted) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const perfilData = await loadPerfil(session.user.id)
        if (mounted) setPerfil(perfilData)
      } else {
        setPerfil(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome },
        },
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        await createPerfil(data.user.id, email, nome)
      }

      return { error: null }
    } catch (err) {
      return { error: 'Erro ao criar conta' }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          return { error: 'Email ou senha incorretos' }
        }
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      return { error: 'Erro ao fazer login' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setPerfil(null)
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      return { error: 'Erro ao enviar email de recuperação' }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        perfil,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
