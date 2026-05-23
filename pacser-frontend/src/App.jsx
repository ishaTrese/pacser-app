import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/routing/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Learn from './pages/Learn'
import SubjectDetail from './pages/SubjectDetail'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import ClassSelection from './pages/ClassSelection'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SubjectQuiz from './pages/SubjectQuiz'
import QuizResults from './pages/QuizResults'
import AdminGodMode from './components/admin/AdminGodMode'

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-[#0b0f17]">
      <Navbar />
      <div className="flex h-[80vh] items-center justify-center px-4">
        <h1 className="text-center text-3xl font-bold text-[#d4af37]">{title} — Coming Soon</h1>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/select-class" element={<ClassSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/learn"
            element={(
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/learn/:subjectId"
            element={(
              <ProtectedRoute>
                <SubjectDetail />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/quiz/:quizSetId"
            element={(
              <ProtectedRoute>
                <SubjectQuiz />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/quiz/:quizSetId/results"
            element={(
              <ProtectedRoute>
                <QuizResults />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/profile"
            element={(
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/leaderboards"
            element={(
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/shop"
            element={(
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/contact"
            element={(
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            )}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AdminGodMode />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
