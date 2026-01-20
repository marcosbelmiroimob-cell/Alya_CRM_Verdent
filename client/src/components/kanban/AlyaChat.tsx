import { useState, useEffect, useRef } from 'react'
import { X, Send, Sparkles, Copy, MessageCircle, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Negociacao, HistoricoIA, TipoMensagem } from '../../types'
import { negociacaoService, iaService } from '../../services/api'

interface AlyaChatProps {
  negociacaoId: number
  onClose: () => void
}

const TIPOS_MENSAGEM: { value: TipoMensagem; label: string }[] = [
  { value: 'PRIMEIRO_CONTATO', label: 'Primeiro Contato' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'CONVITE_VISITA', label: 'Convite para Visita' },
  { value: 'PROPOSTA', label: 'Envio de Proposta' },
  { value: 'NEGOCIACAO', label: 'Negociação' },
  { value: 'POS_VENDA', label: 'Pós-Venda' },
]

export function AlyaChat({ negociacaoId, onClose }: AlyaChatProps) {
  const [negociacao, setNegociacao] = useState<Negociacao | null>(null)
  const [historico, setHistorico] = useState<HistoricoIA[]>([])
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [mensagemGerada, setMensagemGerada] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'gerar'>('chat')
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>('PRIMEIRO_CONTATO')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [negociacaoId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historico])

  const loadData = async () => {
    setLoading(true)
    try {
      const [negRes, histRes] = await Promise.all([
        negociacaoService.buscar(negociacaoId),
        iaService.historico(negociacaoId),
      ])
      setNegociacao(negRes.data.negociacao)
      setHistorico(histRes.data.historico.reverse())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!mensagem.trim() || sending) return

    const novaMensagem = mensagem
    setMensagem('')
    setSending(true)

    const tempId = Date.now()
    setHistorico((prev) => [
      ...prev,
      { id: tempId, negociacaoId, tipoAgente: 'USER', prompt: novaMensagem, resposta: '', criadoEm: new Date().toISOString() },
    ])

    try {
      const response = await iaService.chat(negociacaoId, novaMensagem)
      setHistorico((prev) => [
        ...prev.filter((h) => h.id !== tempId),
        { id: tempId, negociacaoId, tipoAgente: 'USER', prompt: novaMensagem, resposta: '', criadoEm: new Date().toISOString() },
        { id: tempId + 1, negociacaoId, tipoAgente: 'ALYA_COACH', prompt: '', resposta: response.data.resposta, criadoEm: new Date().toISOString() },
      ])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setSending(false)
    }
  }

  const handleGerarMensagem = async () => {
    setGerando(true)
    setMensagemGerada('')
    try {
      const response = await iaService.gerarMensagem(negociacaoId, tipoMensagem)
      setMensagemGerada(response.data.mensagem)
    } catch (error) {
      console.error('Erro ao gerar mensagem:', error)
    } finally {
      setGerando(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(mensagemGerada)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-800 shadow-2xl flex flex-col z-50 animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Alya</h2>
            <p className="text-xs text-slate-500">Sua assistente de vendas</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {negociacao && (
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{negociacao.lead?.nome}</p>
          {negociacao.imovel && (
            <p className="text-xs text-slate-500 truncate">{negociacao.imovel.titulo}</p>
          )}
        </div>
      )}

      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          Consultoria
        </button>
        <button
          onClick={() => setActiveTab('gerar')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'gerar'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-1" />
          Gerar Mensagem
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              <>
                {historico.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Oi! Sou a Alya, sua consultora de vendas.
                      <br />
                      Como posso te ajudar com essa negociação?
                    </p>
                  </div>
                )}

                {historico.map((item) => (
                  <div key={item.id}>
                    {item.prompt && (
                      <div className="flex justify-end mb-2">
                        <div className="bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                          <p className="text-sm">{item.prompt}</p>
                        </div>
                      </div>
                    )}
                    {item.resposta && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-2 max-w-[80%]">
                          <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{item.resposta}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Digite sua dúvida..."
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-full text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                disabled={sending}
              />
              <Button
                onClick={handleSend}
                disabled={!mensagem.trim() || sending}
                className="rounded-full px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 p-4 flex flex-col">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Mensagem
            </label>
            <select
              value={tipoMensagem}
              onChange={(e) => setTipoMensagem(e.target.value as TipoMensagem)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
            >
              {TIPOS_MENSAGEM.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
          </div>

          <Button onClick={handleGerarMensagem} loading={gerando} className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Mensagem
          </Button>

          {mensagemGerada && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4 overflow-y-auto">
                <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{mensagemGerada}</p>
              </div>
              <Button variant="secondary" onClick={handleCopy} className="w-full">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Mensagem
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
