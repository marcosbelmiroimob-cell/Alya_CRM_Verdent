// Tipos do banco de dados
export interface Perfil {
  id: string
  nome: string
  email: string
  telefone: string | null
  creci: string | null
  avatar_url: string | null
  plano: 'CORRETOR_SOLO' | 'EQUIPE' | 'IMOBILIARIA' | 'REDE' | 'ADMIN_MASTER'
  criado_em: string
  atualizado_em: string
}

export interface Lead {
  id: string
  usuario_id: string
  nome: string
  email: string | null
  telefone: string
  cpf: string | null
  rg: string | null
  data_nascimento: string | null
  profissao: string | null
  estado_civil: string | null
  renda_mensal: number | null
  origem: 'MANUAL' | 'SITE' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM' | 'INDICACAO'
  orcamento_min: number | null
  orcamento_max: number | null
  preferencias: Record<string, any>
  observacoes: string | null
  criado_em: string
  atualizado_em: string
}

export interface Imovel {
  id: string
  usuario_id: string
  titulo: string
  tipo: 'APARTAMENTO' | 'CASA' | 'TERRENO' | 'COMERCIAL' | 'RURAL'
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  valor: number
  area_m2: number | null
  quartos: number
  banheiros: number
  vagas: number
  condominio: number | null
  iptu: number | null
  descricao: string | null
  caracteristicas: string[]
  fotos: string[]
  status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO'
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export type EtapaKanban = 
  | 'NOVO_LEAD'
  | 'PRIMEIRO_CONTATO'
  | 'APRESENTACAO'
  | 'VISITA_AGENDADA'
  | 'PROPOSTA_ENVIADA'
  | 'ANALISE_DOCUMENTACAO'
  | 'FECHAMENTO'

export type Prioridade = 'ALTA' | 'MEDIA' | 'BAIXA'

export interface Negociacao {
  id: string
  usuario_id: string
  lead_id: string
  imovel_id: string | null
  etapa: EtapaKanban
  prioridade: Prioridade
  valor_proposta: number | null
  data_proxima_acao: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
  // Relacionamentos
  lead?: Lead
  imovel?: Imovel
  atividades?: Atividade[]
}

export type TipoAtividade = 
  | 'LIGACAO'
  | 'EMAIL'
  | 'WHATSAPP'
  | 'VISITA'
  | 'REUNIAO'
  | 'PROPOSTA'
  | 'FOLLOW_UP'

export interface Atividade {
  id: string
  negociacao_id: string
  tipo: TipoAtividade
  descricao: string | null
  data_atividade: string
  concluida: boolean
  criado_em: string
}

// Database types para Supabase
export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: Perfil
        Insert: Partial<Perfil> & { id: string; nome: string; email: string }
        Update: Partial<Perfil>
      }
      leads: {
        Row: Lead
        Insert: Partial<Lead> & { usuario_id: string; nome: string }
        Update: Partial<Lead>
      }
      imoveis: {
        Row: Imovel
        Insert: Partial<Imovel> & { usuario_id: string; titulo: string; tipo: Imovel['tipo']; valor: number }
        Update: Partial<Imovel>
      }
      negociacoes: {
        Row: Negociacao
        Insert: Partial<Negociacao> & { usuario_id: string; lead_id: string; etapa: EtapaKanban }
        Update: Partial<Negociacao>
      }
      atividades: {
        Row: Atividade
        Insert: Partial<Atividade> & { negociacao_id: string; tipo: TipoAtividade; data_atividade: string }
        Update: Partial<Atividade>
      }
      empreendimentos: {
        Row: {
          id: string
          usuario_id: string
          nome: string
          construtora: string
          status: 'LANCAMENTO' | 'EM_OBRAS' | 'PRONTO'
          previsao_entrega: string | null
          endereco: string | null
          bairro: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          diferenciais: Record<string, boolean>
          descricao: string | null
          imagem_capa: string | null
          imagens: string[]
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      tipologias: {
        Row: {
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
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      unidades: {
        Row: {
          id: string
          tipologia_id: string
          numero: string
          andar: number
          valor_tabela: number
          vagas_garagem: number
          status: 'DISPONIVEL' | 'RESERVADA' | 'VENDIDA'
          observacoes: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      imoveis_usados: {
        Row: {
          id: string
          usuario_id: string
          titulo: string
          tipo: 'APARTAMENTO' | 'CASA' | 'COBERTURA' | 'TERRENO' | 'COMERCIAL' | 'RURAL'
          valor_venda: number
          condominio: number | null
          iptu: number | null
          area_m2: number
          andar: number | null
          posicao_solar: string | null
          dormitorios: number
          suites: number
          banheiros: number
          vagas: number
          tipo_vaga: string | null
          estado: 'ORIGINAL' | 'REFORMADO' | 'SEMIMOBILIADO' | 'PORTEIRA_FECHADA'
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
          status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO'
          ativo: boolean
          destaque: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
