import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface NavItem {
  path: string
  label: string
  icon: string
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'chart-pie' },
      { path: '/pipeline', label: 'Pipeline', icon: 'stream' },
      { path: '/leads', label: 'Leads', icon: 'users' },
    ]
  },
  {
    title: 'Imóveis',
    items: [
      { path: '/lancamentos', label: 'Lançamentos', icon: 'city' },
      { path: '/usados', label: 'Usados', icon: 'home' },
    ]
  },
  {
    items: [
      { path: '/agenda', label: 'Agenda', icon: 'calendar-alt' },
      { path: '/relatorios', label: 'Relatórios', icon: 'chart-bar' },
    ]
  },
]

export function Sidebar() {
  const location = useLocation()
  const { perfil, signOut } = useAuth()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gradient-primary">
          Alya CRM
        </h1>
        <p className="text-sm text-gray-500 mt-1">CRM Imobiliário</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.title && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${
                      isActive(item.path)
                        ? 'gradient-primary text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <i className={`fas fa-${item.icon} w-5 text-center`}></i>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
            {perfil?.nome?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {perfil?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {perfil?.plano?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}
