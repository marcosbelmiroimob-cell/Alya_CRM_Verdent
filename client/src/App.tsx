import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { RegistroPage } from './pages/RegistroPage'
import { KanbanPage } from './pages/KanbanPage'
import { LeadsPage } from './pages/LeadsPage'
import { ImoveisPage } from './pages/ImoveisPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { DashboardPage } from './pages/DashboardPage'
import { EmpreendimentosPage } from './pages/EmpreendimentosPage'
import { EmpreendimentoDetailPage } from './pages/EmpreendimentoDetailPage'
import { ImoveisUsadosPage } from './pages/ImoveisUsadosPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/registro" element={<PublicRoute><RegistroPage /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<KanbanPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="imoveis" element={<ImoveisPage />} />
          <Route path="empreendimentos" element={<EmpreendimentosPage />} />
          <Route path="empreendimentos/:id" element={<EmpreendimentoDetailPage />} />
          <Route path="imoveis-usados" element={<ImoveisUsadosPage />} />
          <Route path="financeiro" element={<FinanceiroPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
