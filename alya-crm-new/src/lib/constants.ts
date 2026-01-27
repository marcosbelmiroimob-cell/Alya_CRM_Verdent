import type { EtapaKanban } from '../types'

export const ETAPAS_KANBAN = [
  { 
    id: 'NOVO_LEAD' as EtapaKanban, 
    nome: 'Novo Lead', 
    cor: '#81C784',
    corFundo: '#E8F5E9',
    corTexto: '#2E7D32',
    icone: 'user-plus',
    descricao: 'Lead recém-captado'
  },
  { 
    id: 'PRIMEIRO_CONTATO' as EtapaKanban, 
    nome: 'Primeiro Contato', 
    cor: '#64B5F6',
    corFundo: '#E3F2FD',
    corTexto: '#1565C0',
    icone: 'phone',
    descricao: 'Contato realizado'
  },
  { 
    id: 'APRESENTACAO' as EtapaKanban, 
    nome: 'Apresentação', 
    cor: '#FFB74D',
    corFundo: '#FFF3E0',
    corTexto: '#E65100',
    icone: 'building',
    descricao: 'Mostrando opções'
  },
  { 
    id: 'VISITA_AGENDADA' as EtapaKanban, 
    nome: 'Visita Agendada', 
    cor: '#BA68C8',
    corFundo: '#F3E5F5',
    corTexto: '#7B1FA2',
    icone: 'calendar-check',
    descricao: 'Visita marcada'
  },
  { 
    id: 'PROPOSTA_ENVIADA' as EtapaKanban, 
    nome: 'Proposta Enviada', 
    cor: '#4DD0E1',
    corFundo: '#E0F7FA',
    corTexto: '#00838F',
    icone: 'file-invoice-dollar',
    descricao: 'Proposta em análise'
  },
  { 
    id: 'ANALISE_DOCUMENTACAO' as EtapaKanban, 
    nome: 'Análise/Documentação', 
    cor: '#FFD54F',
    corFundo: '#FFF8E1',
    corTexto: '#F57F17',
    icone: 'file-alt',
    descricao: 'Documentação em andamento'
  },
  { 
    id: 'FECHAMENTO' as EtapaKanban, 
    nome: 'Fechamento', 
    cor: '#66BB6A',
    corFundo: '#C8E6C9',
    corTexto: '#2E7D32',
    icone: 'handshake',
    descricao: 'Venda concluída'
  },
] as const

export const ORIGEM_LEAD = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SITE', label: 'Site' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'INDICACAO', label: 'Indicação' },
] as const

export const TIPO_IMOVEL = [
  { value: 'APARTAMENTO', label: 'Apartamento' },
  { value: 'CASA', label: 'Casa' },
  { value: 'TERRENO', label: 'Terreno' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'RURAL', label: 'Rural' },
] as const

export const STATUS_IMOVEL = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
] as const

export const PRIORIDADE = [
  { value: 'ALTA', label: 'Alta', cor: '#ef4444' },
  { value: 'MEDIA', label: 'Média', cor: '#f59e0b' },
  { value: 'BAIXA', label: 'Baixa', cor: '#10b981' },
] as const
