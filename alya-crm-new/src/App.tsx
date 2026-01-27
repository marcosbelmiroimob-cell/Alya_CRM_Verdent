import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Dashboard } from './pages/Dashboard'
import { Pipeline } from './pages/Pipeline'
import { Leads } from './pages/Leads'
import { Lancamentos } from './pages/Lancamentos'
import { ImoveisUsados } from './pages/ImoveisUsados'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { PrivateRoute } from './components/layout/PrivateRoute'
import { MainLayout } from './components/layout/MainLayout'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas de autenticação */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/pipeline"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Pipeline />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Leads />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/lancamentos"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Lancamentos />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/usados"
            element={
              <PrivateRoute>
                <MainLayout>
                  <ImoveisUsados />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <PrivateRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-600">Agenda em desenvolvimento...</h2>
                  </div>
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <PrivateRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-600">Relatórios em desenvolvimento...</h2>
                  </div>
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Redirect padrão */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
