import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Learn', path: '/learn' },
  { label: 'Leaderboards', path: '/leaderboards' },
  { label: 'Shop', path: '/shop' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  function getLinkTarget(path) {
    if (user || path === '/') {
      return path
    }
    return '/login'
  }

  return (
    <nav className="w-full flex items-center px-6 h-16 gap-6 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex-shrink-0 mr-2 flex items-center">
        <span className="font-extrabold text-slate-900 tracking-tight text-xl">
          Pa<span className="text-blue-600">CSE</span>r
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.path}
              to={getLinkTarget(link.path)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-150 ${
                isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-auto">
        {user ? (
          <>
            {/* Bell */}
            <button className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-100">
              <Bell size={20} />
            </button>

            {/* Go Premium */}
            <button className="px-4 py-1.5 rounded-full text-sm font-bold bg-yellow-500 text-yellow-900 hover:bg-yellow-500 transition-colors shadow-sm">
              Go Premium
            </button>

            {/* Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-100 hover:border-blue-600 transition-colors"
              >
                <User size={20} className="text-slate-600" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border border-slate-100 bg-white z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    Contact Us
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-5 py-2 rounded-full text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}




