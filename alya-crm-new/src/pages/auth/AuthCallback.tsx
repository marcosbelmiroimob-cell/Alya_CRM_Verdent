import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // O Supabase retorna os tokens na URL como hash fragments
        // Precisamos deixar o Supabase processar isso
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError)
          setError(sessionError.message)
          setTimeout(() => navigate('/auth/login'), 2000)
          return
        }

        if (session) {
          // Verificar se perfil existe
          const { error: perfilError } = await supabase
            .from('perfis')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (perfilError && perfilError.code === 'PGRST116') {
            // Perfil não existe, criar
            const { error: insertError } = await supabase.from('perfis').insert({
              id: session.user.id,
              nome: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email,
              plano: 'CORRETOR_SOLO',
            } as any)

            if (insertError) {
              console.error('Erro ao criar perfil:', insertError)
            }
          }

          navigate('/dashboard', { replace: true })
        } else {
          // Tentar extrair tokens da URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          
          if (accessToken) {
            // Aguardar o Supabase processar os tokens
            const { data } = await supabase.auth.getSession()
            if (data.session) {
              navigate('/dashboard', { replace: true })
              return
            }
          }
          
          console.log('Nenhuma sessão encontrada')
          navigate('/auth/login')
        }
      } catch (err: any) {
        console.error('Erro no callback:', err)
        setError(err.message)
        setTimeout(() => navigate('/auth/login'), 2000)
      }
    }

    // Aguardar um momento para o Supabase processar os tokens da URL
    const timer = setTimeout(handleCallback, 500)
    return () => clearTimeout(timer)
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Erro na autenticação</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-2">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Autenticando...</p>
      </div>
    </div>
  )
}
