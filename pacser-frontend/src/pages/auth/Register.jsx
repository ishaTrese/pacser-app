import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await register(firstName, lastName, email, password, passwordConfirmation)
      navigate('/')
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Unable to register. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 font-sans">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        <section className="hidden justify-center lg:flex flex-col items-center">
          <div className="flex h-80 w-80 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xl p-8">
            <span className="font-extrabold text-slate-900 tracking-tight text-6xl">
              Pa<span className="text-blue-600">CSE</span>r
            </span>
          </div>
          <p className="mt-8 text-center text-slate-500 font-medium max-w-sm">
            Join the premier gamified learning platform and conquer the Civil Service Exam.
          </p>
        </section>

        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl lg:justify-self-start">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
        <p className="mb-8 text-center text-sm font-medium text-slate-500">Join and start your journey today</p>

        {error ? (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-bold text-slate-700">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                autoComplete="given-name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                placeholder="Juan"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm font-bold text-slate-700">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                autoComplete="family-name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                placeholder="Dela Cruz"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute inset-y-0 right-4 my-auto h-fit text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="passwordConfirmation" className="mb-1.5 block text-sm font-bold text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="passwordConfirmation"
                type={showPasswordConfirmation ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation((previous) => !previous)}
                className="absolute inset-y-0 right-4 my-auto h-fit text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showPasswordConfirmation ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-70 mt-4"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-slate-100" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-100" />
        </div>

        <button
          type="button"
          className="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-200 shadow-sm"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Sign In
          </Link>
        </p>
        </section>
      </div>
    </main>
  )
}

export default Register
