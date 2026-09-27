import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import RegisterPage from './pages/RegisterPage'
import PredictorPage from './pages/PredictorPage'
import HistoryPage from './pages/HistoryPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/predict"
        element={
          <ProtectedRoute>
            <PredictorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/predict' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
