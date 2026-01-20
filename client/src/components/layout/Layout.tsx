import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { AlyaProvider } from '../../contexts/AlyaContext'
import { AlyaFloatingButton } from '../alya/AlyaFloatingButton'
import { AlyaGlobalChat } from '../alya/AlyaGlobalChat'

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <AlyaProvider>
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
        <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onMobileClose={() => setMobileMenuOpen(false)} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
        
        <AlyaFloatingButton />
        <AlyaGlobalChat />
      </div>
    </AlyaProvider>
  )
}
