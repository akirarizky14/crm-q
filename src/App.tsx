import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './lib/auth'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { FleetPage } from './pages/FleetPage'
import { VehicleDetailPage } from './pages/VehicleDetailPage'
import { TasksPage } from './pages/TasksPage'
import { AffiliatePage } from './pages/AffiliatePage'
import { BlogPage } from './pages/BlogPage'
import { BlogFormPage } from './pages/BlogFormPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/fleet/:id" element={<VehicleDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/affiliate" element={<AffiliatePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/new" element={<BlogFormPage />} />
            <Route path="/blog/:slug" element={<BlogFormPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
