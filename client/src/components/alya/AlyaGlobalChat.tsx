import { useState, useEffect, useRef } from 'react'
import { X, Send, Sparkles, User, MessageCircle, UserPlus, Loader2 } from 'lucide-react'
import { useAlya } from '../../contexts/AlyaContext'
import { Button } from '../ui/Button'
import { alyaService } from '../../services/api'

interface Mensagem {
  id: number
  remetente: 'alya' | 'usuario' | 'lead'
  conteudo: string
  timestamp: Date
}

type TabAtiva = 'assistente' | 'qualificar'

export function AlyaGlobalChat() {
  const { isOpen, setIsOpen, contexto, paginaAtual } = useAlya()
  const [tabAtiva, setTabAtiva] = useState<TabAtiva>('assistente')
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversaId, setConversaId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  useEffect(() => {
    if (isOpen && mensagens.length === 0) {
      const saudacao = getSaudacaoContextual(contexto)
      setMensagens([{
        id: 1,
        remetente: 'alya',
        conteudo: saudacao,
        timestamp: new Date(),
      }])
    }
  }, [isOpen, contexto])

  const getSaudacaoContextual = (ctx: string): string => {
    const saudacoes: Record<string, string> = {
      dashboard: 'Oi! Vi que voce ta no dashboard. Quer que eu te ajude a analisar seus numeros ou dar uma dica de follow-up?',
      kanban: 'E ai! Vejo que ta gerenciando suas negociacoes. Posso te ajudar com alguma estrategia de venda?',
      leads: 'Opa! Trabalhando com seus leads? Quer que eu qualifique algum ou sugira uma abordagem?',
      empreendimentos: 'Oi! Vejo que ta nos empreendimentos. Precisa de ajuda para apresentar algum imovel?',
      empreendimento_detalhe: 'Oi! Analisando esse empreendimento? Posso te ajudar a encontrar o cliente ideal ou gerar uma descricao.',
      imoveis: 'E ai! Vejo que ta olhando os imoveis. Posso te ajudar a encontrar opcoes para seus clientes.',
      geral: 'Oi! Sou a Alya, sua assistente de vendas. Como posso te ajudar hoje?',
    }
    return saudacoes[ctx] || saudacoes.geral
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const novaMensagem = input.trim()
    setInput('')
    
    setMensagens(prev => [...prev, {
      id: Date.now(),
      remetente: tabAtiva === 'qualificar' ? 'lead' : 'usuario',
      conteudo: novaMensagem,
      timestamp: new Date(),
    }])

    setLoading(true)

    try {
      if (tabAtiva === 'qualificar') {
        const response = await alyaService.qualificar({
          mensagem: novaMensagem,
          conversaId,
        })
        
        if (response.data.conversaId && !conversaId) {
          setConversaId(response.data.conversaId)
        }

        setMensagens(prev => [...prev, {
          id: Date.now() + 1,
          remetente: 'alya',
          conteudo: response.data.resposta,
          timestamp: new Date(),
        }])
      } else {
        const response = await alyaService.chat({
          mensagem: novaMensagem,
          contexto,
          paginaAtual,
        })

        setMensagens(prev => [...prev, {
          id: Date.now() + 1,
          remetente: 'alya',
          conteudo: response.data.resposta,
          timestamp: new Date(),
        }])
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setMensagens(prev => [...prev, {
        id: Date.now() + 1,
        remetente: 'alya',
        conteudo: 'Desculpa, tive um probleminha. Tenta de novo?',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleNovaQualificacao = () => {
    setTabAtiva('qualificar')
    setConversaId(null)
    setMensagens([{
      id: 1,
      remetente: 'alya',
      conteudo: 'Oi! Estou pronta para qualificar um novo lead. Cole a primeira mensagem do cliente ou me conta sobre ele.',
      timestamp: new Date(),
    }])
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Alya</h2>
              <p className="text-xs text-white/80">Sua assistente de vendas</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setTabAtiva('assistente')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            tabAtiva === 'assistente'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Assistente
        </button>
        <button
          onClick={handleNovaQualificacao}
          className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            tabAtiva === 'qualificar'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Qualificar Lead
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 min-h-[200px]">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.remetente === 'alya' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
              msg.remetente === 'alya'
                ? 'bg-slate-100 dark:bg-slate-700 rounded-bl-md'
                : msg.remetente === 'lead'
                  ? 'bg-green-500 text-white rounded-br-md'
                  : 'bg-purple-600 text-white rounded-br-md'
            }`}>
              {msg.remetente === 'lead' && (
                <div className="flex items-center gap-1 text-xs text-white/80 mb-1">
                  <User className="w-3 h-3" />
                  Lead
                </div>
              )}
              <p className={`text-sm whitespace-pre-wrap ${
                msg.remetente === 'alya' ? 'text-slate-900 dark:text-white' : ''
              }`}>
                {msg.conteudo}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={tabAtiva === 'qualificar' ? 'Cole a mensagem do lead...' : 'Digite sua pergunta...'}
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-full text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="rounded-full px-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        
        {tabAtiva === 'qualificar' && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            Simule a conversa colando as mensagens do lead
          </p>
        )}
      </div>
    </div>
  )
}
