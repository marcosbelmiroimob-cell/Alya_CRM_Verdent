import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Kanban, 
  Users, 
  Wallet,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Landmark
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Drawer } from '../ui/Drawer'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/empreendimentos', icon: Landmark, label: 'Lançamentos' },
  { to: '/imoveis-usados', icon: Home, label: 'Usados' },
  { to: '/financeiro', icon: Wallet, label: 'Financeiro' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function SidebarContent({ collapsed, setCollapsed, onNavClick }: { 
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  onNavClick?: () => void 
}) {
  const { logout, usuario } = useAuthStore()

  return (
    <>
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Alya</h1>
              <p className="text-xs text-slate-400">CRM Imobiliário</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-base md:text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        {!collapsed && usuario && (
          <div className="mb-3 px-3">
            <p className="font-medium truncate">{usuario.nome}</p>
            <p className="text-xs text-slate-400 truncate">{usuario.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </>
  )
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white flex-col transition-all duration-300 hidden md:flex`}>
        <SidebarContent 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />
      </aside>

      <Drawer isOpen={mobileOpen} onClose={onMobileClose || (() => {})} side="left">
        <div className="flex flex-col h-full text-white pt-12">
          <SidebarContent 
            collapsed={false} 
            setCollapsed={() => {}} 
            onNavClick={onMobileClose}
          />
        </div>
      </Drawer>
    </>
  )
}
