import { create } from 'zustand'
import { KanbanData, Negociacao, EtapaKanban } from '../types'
import { negociacaoService } from '../services/api'

interface KanbanState {
  kanban: KanbanData
  loading: boolean
  error: string | null
  fetchKanban: () => Promise<void>
  moveCard: (negociacaoId: number, novaEtapa: EtapaKanban, ordem?: number) => Promise<void>
  addNegociacao: (negociacao: Negociacao) => void
}

const initialKanban: KanbanData = {
  NOVO_LEAD: [],
  PRIMEIRO_CONTATO: [],
  QUALIFICADO: [],
  VISITA_AGENDADA: [],
  PROPOSTA_ENVIADA: [],
  FECHAMENTO: [],
  VENDIDO: [],
  PERDIDO: [],
}

type KanbanKey = keyof KanbanData

export const useKanbanStore = create<KanbanState>((set, get) => ({
  kanban: initialKanban,
  loading: false,
  error: null,

  fetchKanban: async () => {
    set({ loading: true, error: null })
    try {
      const response = await negociacaoService.kanban()
      set({ kanban: { ...initialKanban, ...response.data.kanban }, loading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      set({ error: message, loading: false })
    }
  },

  moveCard: async (negociacaoId, novaEtapa, ordem) => {
    const { kanban } = get()
    
    let negociacao: Negociacao | undefined
    let etapaOrigem: KanbanKey | undefined
    
    const etapas = Object.keys(kanban) as KanbanKey[]
    for (const etapa of etapas) {
      const found = kanban[etapa].find((n) => n.id === negociacaoId)
      if (found) {
        negociacao = found
        etapaOrigem = etapa
        break
      }
    }

    if (!negociacao || !etapaOrigem) return

    const novaEtapaKey = novaEtapa as KanbanKey
    
    const novoKanban: KanbanData = { ...kanban }
    novoKanban[etapaOrigem] = novoKanban[etapaOrigem].filter((n) => n.id !== negociacaoId)
    
    const negociacaoAtualizada = { ...negociacao, etapaKanban: novaEtapa }
    novoKanban[novaEtapaKey] = [...novoKanban[novaEtapaKey], negociacaoAtualizada]
    
    set({ kanban: novoKanban })

    try {
      await negociacaoService.mover(negociacaoId, { etapaKanban: novaEtapa, ordem })
    } catch {
      set({ kanban })
    }
  },

  addNegociacao: (negociacao) => {
    const etapaKey = negociacao.etapaKanban as KanbanKey
    set((state) => ({
      kanban: {
        ...state.kanban,
        [etapaKey]: [...state.kanban[etapaKey], negociacao],
      },
    }))
  },
}))
