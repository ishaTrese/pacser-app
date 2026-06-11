import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, User, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const unread = res.data.notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  async function handleLogout() {
    await logout()
    setMobileMenuOpen(false)
    setDropdownOpen(false)
    navigate('/')
  }

  function getLinkTarget(path) {
    if (user || path === '/') {
      return path
    }
    return '/login'
  }

  const linkClass = (path) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
    return isActive
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
  }

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-1 flex items-center">
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-xl">
            Pa<span className="text-blue-600 dark:text-blue-400">CSE</span>r
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={getLinkTarget(link.path)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-150 ${linkClass(link.path)}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right side */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {user ? (
            <>
              <button
                onClick={() => navigate('/notifications')}
                className="relative text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Open notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                )}
              </button>

              {!user.is_premium && (
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-1.5 rounded-full text-sm font-bold bg-yellow-500 text-yellow-900 hover:bg-yellow-400 transition-colors shadow-sm"
                >
                  Go Premium
                </button>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                  aria-label="Open profile menu"
                  aria-expanded={dropdownOpen}
                >
                  <User size={20} className="text-slate-600 dark:text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {user.first_name} {user.last_name} {user.role === 'admin' && <span className="text-blue-500">(Admin)</span>}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Contact Us
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
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
                className="px-5 py-2 rounded-full text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                Sign In
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

        {/* Mobile Actions */}
        <div className="ml-auto flex md:hidden items-center gap-1">
          {user && (
            <>
              <button
                onClick={() => navigate('/notifications')}
                className="relative text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Open notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                )}
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                aria-label="Open profile"
              >
                <User size={18} className="text-slate-600 dark:text-slate-400" />
              </button>
            </>
          )}

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 shadow-lg">
          <div className="flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={getLinkTarget(link.path)}
                className={`px-3 py-3 rounded-xl text-sm font-bold transition-colors ${linkClass(link.path)}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 px-3 py-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {user.first_name} {user.last_name} {user.role === 'admin' && <span className="text-blue-500">(Admin)</span>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
                {!user.is_premium && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      navigate('/profile')
                    }}
                    className="w-full rounded-xl bg-yellow-500 px-3 py-3 text-left text-sm font-black text-yellow-950 hover:bg-yellow-400 transition-colors"
                  >
                    Go Premium
                  </button>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="px-3 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  View Profile
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Contact Us
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-3 rounded-xl text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Link
                  to="/login"
                  className="rounded-xl border border-blue-200 dark:border-blue-800 px-3 py-3 text-center text-sm font-black text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-black text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}




