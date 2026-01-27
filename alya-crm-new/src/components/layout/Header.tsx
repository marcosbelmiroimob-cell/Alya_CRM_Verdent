import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Visão geral do seu negócio',
  },
  '/pipeline': {
    title: 'Pipeline de Vendas',
    subtitle: 'Gerencie suas oportunidades em tempo real',
  },
  '/leads': {
    title: 'Leads',
    subtitle: 'Gerencie seus contatos e clientes',
  },
  '/imoveis': {
    title: 'Imóveis',
    subtitle: 'Catálogo de imóveis disponíveis',
  },
  '/agenda': {
    title: 'Agenda',
    subtitle: 'Suas visitas e compromissos',
  },
  '/relatorios': {
    title: 'Relatórios',
    subtitle: 'Análises e métricas do seu desempenho',
  },
}

export function Header() {
  const location = useLocation()
  const { perfil } = useAuth()

  const pageInfo = pageTitles[location.pathname] || {
    title: 'Alya CRM',
    subtitle: 'Sistema de Gestão Imobiliária',
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{pageInfo.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{pageInfo.subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search - placeholder para futuro */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <i className="fas fa-search text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-48"
            />
          </div>

          {/* Notifications - placeholder */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {perfil?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">{perfil?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
              {perfil?.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
