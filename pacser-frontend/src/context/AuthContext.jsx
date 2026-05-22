import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userClass, setUserClass] = useState(() => localStorage.getItem('userClass') || null)

  const saveUserClass = (className) => {
    localStorage.setItem('userClass', className)
    setUserClass(className)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/user')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const register = async (first_name, last_name, email, password, password_confirmation) => {
    const res = await api.post('/register', { first_name, last_name, email, password, password_confirmation })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }

  const logout = async () => {
    await api.post('/logout')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, userClass, saveUserClass, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
