import { useEffect, useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { TransacaoFinanceira, ResumoFinanceiro } from '../types'
import { financeiroService } from '../services/api'

export function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([])
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'DESPESA' as const,
    categoria: '',
    descricao: '',
    valor: '',
    dataVencimento: '',
    status: 'PENDENTE' as const,
  })
  const [saving, setSaving] = useState(false)

  const categoriasDespesa = [
    'Aluguel', 'Carro', 'Combustível', 'Telefone', 'Internet',
    'Marketing', 'Alimentação', 'Transporte', 'Outros'
  ]

  const categoriasReceita = ['Comissão', 'Bônus', 'Outros']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [transacoesRes, resumoRes] = await Promise.all([
        financeiroService.transacoes(),
        financeiroService.resumo(),
      ])
      setTransacoes(transacoesRes.data.transacoes)
      setResumo(resumoRes.data.resumo)
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await financeiroService.criarTransacao({
        ...formData,
        valor: parseFloat(formData.valor),
      })
      setShowModal(false)
      setFormData({
        tipo: 'DESPESA',
        categoria: '',
        descricao: '',
        valor: '',
        dataVencimento: '',
        status: 'PENDENTE',
      })
      loadData()
    } catch (error) {
      console.error('Erro ao criar transação:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      PAGO: 'success',
      PENDENTE: 'warning',
      ATRASADO: 'danger',
      CANCELADO: 'default',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financeiro</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Controle suas finanças e comissões</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo?.receitas || 0)}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Despesas</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(resumo?.despesas || 0)}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Saldo</p>
                  <p className={`text-2xl font-bold ${(resumo?.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(resumo?.saldo || 0)}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <Wallet className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Previsão Comissões</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(resumo?.previsaoComissoes || 0)}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <PiggyBank className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Transações Recentes</h2>
            <div className="space-y-3">
              {transacoes.slice(0, 10).map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transacao.tipo === 'RECEITA' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {transacao.tipo === 'RECEITA' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{transacao.categoria}</p>
                      {transacao.descricao && (
                        <p className="text-sm text-slate-500">{transacao.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transacao.tipo === 'RECEITA' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(transacao.valor)}
                    </p>
                    {getStatusBadge(transacao.status)}
                  </div>
                </div>
              ))}
              {transacoes.length === 0 && (
                <p className="text-center text-slate-500 py-8">Nenhuma transação registrada</p>
              )}
            </div>
          </Card>
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Transação">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any, categoria: '' })}
            options={[
              { value: 'DESPESA', label: 'Despesa' },
              { value: 'RECEITA', label: 'Receita' },
            ]}
          />

          <Select
            label="Categoria"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            options={[
              { value: '', label: 'Selecione...' },
              ...(formData.tipo === 'DESPESA' ? categoriasDespesa : categoriasReceita).map(c => ({
                value: c,
                label: c,
              })),
            ]}
            required
          />

          <Input
            label="Descrição"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Detalhes da transação"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
            />
            <Input
              label="Data Vencimento"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { value: 'PENDENTE', label: 'Pendente' },
              { value: 'PAGO', label: 'Pago' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
