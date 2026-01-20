import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface Sugestao {
  id: string
  tipo: 'follow_up' | 'visita' | 'proposta' | 'dica'
  titulo: string
  descricao: string
  acao?: () => void
}

interface AlyaContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  paginaAtual: string
  contexto: string
  sugestoes: Sugestao[]
  setSugestoes: (sugestoes: Sugestao[]) => void
  notificacoes: number
  limparNotificacoes: () => void
  conversaAtiva: number | null
  setConversaAtiva: (id: number | null) => void
}

const AlyaContext = createContext<AlyaContextType | undefined>(undefined)

const CONTEXTOS_PAGINA: Record<string, string> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/leads': 'leads',
  '/kanban': 'kanban',
  '/empreendimentos': 'empreendimentos',
  '/imoveis': 'imoveis',
  '/imoveis-usados': 'imoveis_usados',
  '/financeiro': 'financeiro',
}

export function AlyaProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [notificacoes, setNotificacoes] = useState(0)
  const [conversaAtiva, setConversaAtiva] = useState<number | null>(null)

  const paginaAtual = location.pathname
  const contexto = CONTEXTOS_PAGINA[paginaAtual] || 
    (paginaAtual.startsWith('/empreendimentos/') ? 'empreendimento_detalhe' : 
     paginaAtual.startsWith('/leads/') ? 'lead_detalhe' : 'geral')

  useEffect(() => {
    setNotificacoes(sugestoes.length)
  }, [sugestoes])

  const limparNotificacoes = () => setNotificacoes(0)

  return (
    <AlyaContext.Provider value={{
      isOpen,
      setIsOpen,
      paginaAtual,
      contexto,
      sugestoes,
      setSugestoes,
      notificacoes,
      limparNotificacoes,
      conversaAtiva,
      setConversaAtiva,
    }}>
      {children}
    </AlyaContext.Provider>
  )
}

export function useAlya() {
  const context = useContext(AlyaContext)
  if (!context) {
    throw new Error('useAlya deve ser usado dentro de AlyaProvider')
  }
  return context
}
