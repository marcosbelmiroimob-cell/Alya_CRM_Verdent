export type EstadoImovelUsado = 'ORIGINAL' | 'REFORMADO' | 'SEMIMOBILIADO' | 'PORTEIRA_FECHADA'
export type TipoVaga = 'SOLTA' | 'PRESA' | 'COBERTA' | 'DESCOBERTA'
export type PosicaoSolar = 'NASCENTE_TOTAL' | 'NASCENTE_NORTE' | 'NASCENTE_SUL' | 'POENTE' | 'NORTE' | 'SUL'
export type StatusImovelUsado = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO'
export type TipoImovelUsado = 'APARTAMENTO' | 'CASA' | 'COBERTURA' | 'TERRENO' | 'COMERCIAL' | 'RURAL'

export interface ImovelUsado {
  id: string
  usuario_id: string
  titulo: string
  tipo: TipoImovelUsado
  valor_venda: number
  condominio: number | null
  iptu: number | null
  area_m2: number
  andar: number | null
  posicao_solar: PosicaoSolar | null
  dormitorios: number
  suites: number
  banheiros: number
  vagas: number
  tipo_vaga: TipoVaga | null
  estado: EstadoImovelUsado
  motivo_venda: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  estado_uf: string | null
  cep: string | null
  descricao: string | null
  caracteristicas: string[]
  fotos: string[]
  video_url: string | null
  tour_virtual_url: string | null
  status: StatusImovelUsado
  ativo: boolean
  destaque: boolean
  criado_em: string
  atualizado_em: string
}

export interface ImovelUsadoInsert {
  usuario_id: string
  titulo: string
  tipo: TipoImovelUsado
  valor_venda: number
  condominio?: number | null
  iptu?: number | null
  area_m2: number
  andar?: number | null
  posicao_solar?: PosicaoSolar | null
  dormitorios?: number
  suites?: number
  banheiros?: number
  vagas?: number
  tipo_vaga?: TipoVaga | null
  estado: EstadoImovelUsado
  motivo_venda?: string | null
  endereco?: string | null
  bairro?: string | null
  cidade?: string | null
  estado_uf?: string | null
  cep?: string | null
  descricao?: string | null
  caracteristicas?: string[]
  fotos?: string[]
  video_url?: string | null
  tour_virtual_url?: string | null
  status?: StatusImovelUsado
  destaque?: boolean
}
