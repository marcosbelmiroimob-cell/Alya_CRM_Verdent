export type StatusEmpreendimento = 'LANCAMENTO' | 'EM_OBRAS' | 'PRONTO'
export type StatusUnidade = 'DISPONIVEL' | 'RESERVADA' | 'VENDIDA'

export interface DiferenciaisEmpreendimento {
  iptu_verde: boolean
  coworking: boolean
  lavanderia: boolean
  academia: boolean
  rooftop: boolean
  piscina: boolean
  churrasqueira: boolean
  playground: boolean
  salao_festas: boolean
  portaria_24h: boolean
  bicicletario: boolean
  pet_place: boolean
}

export interface Empreendimento {
  id: string
  usuario_id: string
  nome: string
  construtora: string
  status: StatusEmpreendimento
  previsao_entrega: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  diferenciais: DiferenciaisEmpreendimento
  descricao: string | null
  imagem_capa: string | null
  imagens: string[]
  ativo: boolean
  criado_em: string
  atualizado_em: string
  tipologias?: Tipologia[]
}

export interface Tipologia {
  id: string
  empreendimento_id: string
  nome: string
  area_privativa: number
  dormitorios: number
  suites: number
  banheiros: number
  vagas: number
  unidades_finais: string | null
  destaque: string | null
  planta_url: string | null
  criado_em: string
  atualizado_em: string
  unidades?: Unidade[]
}

export interface Unidade {
  id: string
  tipologia_id: string
  numero: string
  andar: number
  valor_tabela: number
  vagas_garagem: number
  status: StatusUnidade
  observacoes: string | null
  criado_em: string
  atualizado_em: string
  tipologia?: Tipologia
}

export interface EmpreendimentoInsert {
  usuario_id: string
  nome: string
  construtora: string
  status: StatusEmpreendimento
  previsao_entrega?: string | null
  endereco?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  diferenciais?: DiferenciaisEmpreendimento
  descricao?: string | null
  imagem_capa?: string | null
  imagens?: string[]
}

export interface TipologiaInsert {
  empreendimento_id: string
  nome: string
  area_privativa: number
  dormitorios?: number
  suites?: number
  banheiros?: number
  vagas?: number
  unidades_finais?: string | null
  destaque?: string | null
  planta_url?: string | null
}

export interface UnidadeInsert {
  tipologia_id: string
  numero: string
  andar: number
  valor_tabela: number
  vagas_garagem?: number
  status?: StatusUnidade
  observacoes?: string | null
}
