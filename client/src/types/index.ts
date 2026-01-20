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

export type StatusEmpreendimento = 'FUTURO_LANCAMENTO' | 'EM_CONSTRUCAO' | 'PRONTO'
export type StatusUnidade = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'BLOQUEADO'
export type TipoImovelUsado = 'APARTAMENTO' | 'CASA' | 'TERRENO' | 'SALA_COMERCIAL' | 'COBERTURA' | 'LOFT'
export type Documentacao = 'ESCRITURADO' | 'FINANCIADO' | 'INVENTARIO' | 'IRREGULAR'
export type PosicaoSolar = 'NASCENTE' | 'POENTE' | 'NORTE' | 'SUL'

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

export interface Empreendimento {
  id: number
  usuarioId: number
  nome: string
  incorporadora?: string
  endereco?: string
  cidade?: string
  bairro?: string
  status: StatusEmpreendimento
  dataLancamento?: string
  dataEntrega?: string
  comissaoPercentual: number
  descricao?: string
  caracteristicas?: Record<string, any>
  fotos?: string[]
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
  torres?: Torre[]
  tipologias?: Tipologia[]
}

export interface Torre {
  id: number
  empreendimentoId: number
  nome: string
  totalAndares: number
  unidadesPorAndar: number
  criadoEm: string
  atualizadoEm: string
  empreendimento?: Empreendimento
  unidades?: Unidade[]
}

export interface Tipologia {
  id: number
  empreendimentoId: number
  nome: string
  areaPrivativa: number
  quartos: number
  suites: number
  vagas: number
  precoBase: number
  diferenciais?: Record<string, any>
  criadoEm: string
  atualizadoEm: string
}

export interface Unidade {
  id: number
  torreId: number
  tipologiaId?: number
  codigo: string
  andar: number
  posicao: string
  posicaoSolar?: PosicaoSolar
  preco?: number
  precoM2?: number
  status: StatusUnidade
  extras?: Record<string, any>
  criadoEm: string
  atualizadoEm: string
  torre?: Torre
  tipologia?: Tipologia
}

export interface ImovelUsado {
  id: number
  usuarioId: number
  tipoImovel: TipoImovelUsado
  titulo: string
  descricao?: string
  endereco?: string
  cidade?: string
  bairro?: string
  areaUtil?: number
  areaTotal?: number
  quartos: number
  suites: number
  vagas: number
  valorAvaliacao?: number
  valorVenda: number
  comissaoPercentual: number
  documentacao: Documentacao
  nomeProprietario?: string
  telefoneProprietario?: string
  emailProprietario?: string
  caracteristicas?: Record<string, any>
  fotos?: string[]
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface TorreGrid {
  torre: Torre
  andares: {
    numero: number
    unidades: Unidade[]
  }[]
  estatisticas: {
    total: number
    disponiveis: number
    reservados: number
    vendidos: number
    bloqueados: number
  }
}
