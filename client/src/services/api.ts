import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (email: string, senha: string) =>
    api.post('/auth/login', { email, senha }),
  registro: (data: { nome: string; email: string; senha: string; telefone?: string; creci?: string }) =>
    api.post('/auth/registro', data),
  me: () => api.get('/auth/me'),
}

export const leadService = {
  listar: () => api.get('/leads'),
  buscar: (id: number) => api.get(`/leads/${id}`),
  criar: (data: any) => api.post('/leads', data),
  atualizar: (id: number, data: any) => api.put(`/leads/${id}`, data),
  excluir: (id: number) => api.delete(`/leads/${id}`),
}

export const imovelService = {
  listar: (params?: { tipo?: string; ativo?: boolean }) => api.get('/imoveis', { params }),
  buscar: (id: number) => api.get(`/imoveis/${id}`),
  criar: (data: any) => api.post('/imoveis', data),
  atualizar: (id: number, data: any) => api.put(`/imoveis/${id}`, data),
  excluir: (id: number) => api.delete(`/imoveis/${id}`),
}

export const negociacaoService = {
  listar: () => api.get('/negociacoes'),
  kanban: () => api.get('/negociacoes/kanban'),
  buscar: (id: number) => api.get(`/negociacoes/${id}`),
  criar: (data: any) => api.post('/negociacoes', data),
  mover: (id: number, data: { etapaKanban: string; ordem?: number }) =>
    api.patch(`/negociacoes/${id}/move`, data),
  atualizar: (id: number, data: any) => api.put(`/negociacoes/${id}`, data),
  excluir: (id: number) => api.delete(`/negociacoes/${id}`),
}

export const financeiroService = {
  transacoes: (params?: { mes?: number; ano?: number; tipo?: string }) =>
    api.get('/financeiro/transacoes', { params }),
  resumo: (params?: { mes?: number; ano?: number }) =>
    api.get('/financeiro/resumo', { params }),
  categorias: () => api.get('/financeiro/categorias'),
  criarTransacao: (data: any) => api.post('/financeiro/transacoes', data),
  atualizarTransacao: (id: number, data: any) => api.put(`/financeiro/transacoes/${id}`, data),
  excluirTransacao: (id: number) => api.delete(`/financeiro/transacoes/${id}`),
}

export const iaService = {
  chat: (negociacaoId: number, mensagem: string) =>
    api.post('/ia/chat', { negociacaoId, mensagem }),
  gerarMensagem: (negociacaoId: number, tipoMensagem: string, contextoAdicional?: string) =>
    api.post('/ia/gerar-mensagem', { negociacaoId, tipoMensagem, contextoAdicional }),
  qualificar: (leadId: number) =>
    api.post('/ia/qualificar', { leadId }),
  historico: (negociacaoId: number) =>
    api.get(`/ia/historico/${negociacaoId}`),
}

export const atividadeService = {
  listar: (negociacaoId: number) => api.get(`/atividades/negociacao/${negociacaoId}`),
  criar: (data: { negociacaoId: number; tipo: string; descricao: string; dataAtividade: string }) =>
    api.post('/atividades', data),
  concluir: (id: number) => api.patch(`/atividades/${id}/concluir`),
  excluir: (id: number) => api.delete(`/atividades/${id}`),
}

export const dashboardService = {
  resumo: () => api.get('/dashboard/resumo'),
  pipelineValores: () => api.get('/dashboard/pipeline-valores'),
  resumoCompleto: () => api.get('/dashboard/resumo-completo'),
}

export const empreendimentoService = {
  listar: (params?: { status?: string; ativo?: boolean }) => 
    api.get('/empreendimentos', { params }),
  buscar: (id: number) => api.get(`/empreendimentos/${id}`),
  criar: (data: any) => api.post('/empreendimentos', data),
  atualizar: (id: number, data: any) => api.put(`/empreendimentos/${id}`, data),
  excluir: (id: number) => api.delete(`/empreendimentos/${id}`),
  estatisticas: (id: number) => api.get(`/empreendimentos/${id}/estatisticas`),
}

export const torreService = {
  listar: (empreendimentoId: number) => 
    api.get('/torres', { params: { empreendimentoId } }),
  buscar: (id: number) => api.get(`/torres/${id}`),
  criar: (data: any) => api.post('/torres', data),
  atualizar: (id: number, data: any) => api.put(`/torres/${id}`, data),
  excluir: (id: number) => api.delete(`/torres/${id}`),
  grid: (id: number) => api.get(`/torres/${id}/grid`),
}

export const tipologiaService = {
  listar: (empreendimentoId: number) => 
    api.get('/tipologias', { params: { empreendimentoId } }),
  buscar: (id: number) => api.get(`/tipologias/${id}`),
  criar: (data: any) => api.post('/tipologias', data),
  atualizar: (id: number, data: any) => api.put(`/tipologias/${id}`, data),
  excluir: (id: number) => api.delete(`/tipologias/${id}`),
  aplicarUnidades: (id: number, data: { unidadeIds: number[]; atualizarPreco?: boolean }) =>
    api.post(`/tipologias/${id}/aplicar-unidades`, data),
}

export const unidadeService = {
  listar: (torreId: number) => api.get('/unidades', { params: { torreId } }),
  buscar: (id: number) => api.get(`/unidades/${id}`),
  atualizar: (id: number, data: any) => api.put(`/unidades/${id}`, data),
  atualizarStatus: (id: number, status: string) => 
    api.patch(`/unidades/${id}/status`, { status }),
  atualizarMassa: (data: { unidadeIds: number[]; tipologiaId?: number; status?: string; posicaoSolar?: string }) =>
    api.patch('/unidades/bulk', data),
  atualizarValores: (data: { unidades: Array<{ id: number; tipologiaId?: number | null; status?: string; preco?: number | null; posicaoSolar?: string | null }> }) =>
    api.post('/unidades/bulk-update-values', data),
  disponiveis: (empreendimentoId: number) =>
    api.get('/unidades/disponiveis', { params: { empreendimentoId } }),
}

export const imovelUsadoService = {
  listar: (params?: { tipo?: string; ativo?: boolean }) => 
    api.get('/imoveis-usados', { params }),
  buscar: (id: number) => api.get(`/imoveis-usados/${id}`),
  criar: (data: any) => api.post('/imoveis-usados', data),
  atualizar: (id: number, data: any) => api.put(`/imoveis-usados/${id}`, data),
  excluir: (id: number) => api.delete(`/imoveis-usados/${id}`),
  ativos: () => api.get('/imoveis-usados/ativos'),
}

export default api
