export type Plano = 'TRIAL' | 'BASICO' | 'PROFISSIONAL' | 'PREMIUM'
export type TipoNegocio = 'LANCAMENTO' | 'TERCEIROS'
export type EtapaKanban = 
  | 'NOVO_LEAD'
  | 'PRIMEIRO_CONTATO'
  | 'QUALIFICADO'
  | 'VISITA_AGENDADA'
  | 'PROPOSTA_ENVIADA'
  | 'FECHAMENTO'
  | 'VENDIDO'
  | 'PERDIDO'

export type TipoTransacao = 'RECEITA' | 'DESPESA'
export type StatusTransacao = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO'
export type TipoMensagem = 
  | 'PRIMEIRO_CONTATO'
  | 'FOLLOW_UP'
  | 'CONVITE_VISITA'
  | 'PROPOSTA'
  | 'NEGOCIACAO'
  | 'POS_VENDA'

export interface Usuario {
  id: number
  nome: string
  email: string
  telefone?: string
  creci?: string
  plano: Plano
  avatar?: string
  criadoEm: string
}

export interface Lead {
  id: number
  usuarioId: number
  nome: string
  telefone?: string
  email?: string
  origem?: string
  perfilComprador?: Record<string, any>
  scoreQualificacao: number
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
  negociacoes?: Negociacao[]
}

export interface Imovel {
  id: number
  usuarioId: number
  tipoNegocio: TipoNegocio
  titulo: string
  descricao?: string
  valor: number
  comissaoPercentual: number
  endereco?: string
  cidade?: string
  bairro?: string
  caracteristicas?: Record<string, any>
  fotos?: string[]
  construtora?: string
  nomeProprietario?: string
  telefoneProprietario?: string
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface Negociacao {
  id: number
  usuarioId: number
  leadId: number
  imovelId?: number
  etapaKanban: EtapaKanban
  valorProposta?: number
  observacoes?: string
  proximoContato?: string
  ordem: number
  criadoEm: string
  atualizadoEm: string
  lead?: Lead
  imovel?: Imovel
  atividades?: Atividade[]
}

export interface TransacaoFinanceira {
  id: number
  usuarioId: number
  negociacaoId?: number
  tipo: TipoTransacao
  categoria: string
  descricao?: string
  valor: number
  dataVencimento?: string
  dataPagamento?: string
  status: StatusTransacao
  recorrente: boolean
  criadoEm: string
}

export interface Atividade {
  id: number
  negociacaoId: number
  tipo: string
  descricao: string
  dataAtividade: string
  concluida: boolean
}

export interface HistoricoIA {
  id: number
  negociacaoId: number
  tipoAgente: string
  prompt: string
  resposta: string
  criadoEm: string
}

export interface KanbanData {
  NOVO_LEAD: Negociacao[]
  PRIMEIRO_CONTATO: Negociacao[]
  QUALIFICADO: Negociacao[]
  VISITA_AGENDADA: Negociacao[]
  PROPOSTA_ENVIADA: Negociacao[]
  FECHAMENTO: Negociacao[]
  VENDIDO: Negociacao[]
  PERDIDO: Negociacao[]
}

export interface ResumoFinanceiro {
  receitas: number
  despesas: number
  saldo: number
  receitasPendentes: number
  despesasPendentes: number
  previsaoComissoes: number
}

export interface QualificacaoResult {
  score: number
  nivel: 'FRIO' | 'MORNO' | 'QUENTE' | 'MUITO_QUENTE'
  analise: string
  recomendacoes: string[]
  sinaisPositivos: string[]
  sinaisNegativos: string[]
}
