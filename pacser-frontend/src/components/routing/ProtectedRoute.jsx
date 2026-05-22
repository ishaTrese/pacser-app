import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, userClass } = useAuth()
  const location = useLocation()

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <p className="text-blue-600 font-bold animate-pulse">Loading...</p>
  </div>

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}




