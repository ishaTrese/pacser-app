import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <p className="text-blue-600 font-bold animate-pulse">Loading...</p>
  </div>

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.pretest_completed && location.pathname !== '/pretest' && user.role !== 'admin') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <div className="pointer-events-none select-none h-full overflow-hidden">
          {children}
        </div>
        <div className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/80 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 max-w-xl w-full border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Diagnostic Pre-test</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
              Welcome to Pacser! Before you begin your review, we need to gauge your current knowledge level.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 p-5 rounded-2xl text-left mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="font-medium text-sm">This is a <strong>50-question exam</strong> (10 per subject) covering Mathematics, English, Filipino, Constitution, and Code of Conduct.</p>
              </div>
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="font-medium text-sm">You will <strong>not earn XP or Points</strong> for this test. It is strictly to establish your baseline mastery.</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/pretest')}
              className="w-full py-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all text-lg"
            >
              Start Pre-test
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children
}




