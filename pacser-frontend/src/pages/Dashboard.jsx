import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Breadcrumb from '../components/layout/Breadcrumb'
import { Flame, BookOpen, Medal, Target, ChevronRight, PenTool, Scale, Shield, BookText } from 'lucide-react'
import api from '../api/axios'

const SUBJECTS = [
  {
    id: 'mathematics',
    title: 'Mathematics',
    description: 'Numerical reasoning and problem solving',
    icon: <PenTool size={28} className="text-blue-600" />,
    color: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'constitution',
    title: '1987 Constitution',
    description: 'Fundamentals of the Philippine Constitution',
    icon: <Scale size={28} className="text-yellow-500" />,
    color: 'bg-yellow-50',
    borderColor: 'border-yellow-100'
  },
  {
    id: 'code-of-conduct',
    title: 'Code of Conduct',
    description: 'R.A. No. 6713 - Ethical standards for public officials',
    icon: <Shield size={28} className="text-blue-600" />,
    color: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'filipino',
    title: 'Filipino',
    description: 'Talasalitaan, wastong gamit, at balarila',
    icon: <BookText size={28} className="text-yellow-500" />,
    color: 'bg-yellow-50',
    borderColor: 'border-yellow-100'
  },
  {
    id: 'english',
    title: 'English',
    description: 'Grammar, vocabulary, and reading comprehension',
    icon: <BookOpen size={28} className="text-blue-600" />,
    color: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
]

export default function Dashboard() {
  const { user, updateUserStats } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ quiz_sets_done: 0, mastery: {} })

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => {
        setStats({ quiz_sets_done: res.data.quiz_sets_done, mastery: res.data.mastery })
        if (res.data.user) {
          updateUserStats(res.data.user) // Refresh global user object
        }
      })
      .catch(err => console.error("Failed to load dashboard stats", err))
  }, [])

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Anna Doe'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">

        {/* Top Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {displayName}!</h1>
            <p className="text-slate-500 font-medium mt-1">Your Civil Service journey awaits. What are we studying today?</p>
          </div>
          <button 
            onClick={() => navigate('/learn')}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Continue Learning
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Top Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-yellow-100 transition-colors">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
              <Flame size={24} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Streak</p>
              <p className="text-slate-900 font-extrabold text-2xl">{user?.streak || 0} Days</p>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Target size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total XP</p>
              <p className="text-slate-900 font-extrabold text-2xl">{user?.xp || 0} XP</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quiz Sets</p>
              <p className="text-slate-900 font-extrabold text-2xl">{stats.quiz_sets_done} Done</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Level {Math.floor((user?.xp || 0) / 100) + 1}</p>
              <p className="text-blue-600 text-xs font-black">{(user?.xp || 0) % 100}%</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(user?.xp || 0) % 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Full-width Subjects Grid */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 px-1 tracking-tight">Reviewer Subjects</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SUBJECTS.map((subject) => {
              const subjectMastery = stats.mastery[subject.id] || 0;
              return (
              <div 
                key={subject.id}
                onClick={() => navigate(`/learn/${subject.id}`)}
                className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-blue-400 hover:shadow-md group flex flex-col transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl ${subject.color} ${subject.borderColor} border flex items-center justify-center`}>
                    {subject.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full">{subjectMastery}% Mastery</span>
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors tracking-tight">
                  {subject.title}
                </h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed flex-grow">
                  {subject.description}
                </p>
              </div>
            )})}
          </div>
        </div>

      </main>
    </div>
  )
}



