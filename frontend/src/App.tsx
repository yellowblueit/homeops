import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { HomeProvider } from '@/contexts/HomeContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomesPage } from '@/pages/HomesPage'
import { HomeDetailPage } from '@/pages/HomeDetailPage'
import { EquipmentPage } from '@/pages/EquipmentPage'
import { EquipmentDetailPage } from '@/pages/EquipmentDetailPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { TasksPage } from '@/pages/TasksPage'
import { MembersPage } from '@/pages/MembersPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
})

function AuthCallback() {
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <HomeProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/homes" element={<HomesPage />} />
                  <Route path="/homes/:homeId" element={<HomeDetailPage />} />
                  <Route path="/homes/:homeId/equipment" element={<EquipmentPage />} />
                  <Route path="/homes/:homeId/equipment/:equipmentId" element={<EquipmentDetailPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/members" element={<MembersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </HomeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
