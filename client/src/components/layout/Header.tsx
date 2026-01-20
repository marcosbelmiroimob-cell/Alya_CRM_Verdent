import { Bell, Search, Moon, Sun, MessageCircle, Menu, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [showAlya, setShowAlya] = useState(false)
  const { usuario } = useAuthStore()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="h-14 md:h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors md:hidden"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Alya</span>
        </div>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar leads, imóveis, negociações..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setShowAlya(!showAlya)}
          className="flex items-center gap-2 px-2 md:px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Alya</span>
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors hidden sm:block"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>

        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-2 md:pl-3 border-l border-slate-200 dark:border-slate-600">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
