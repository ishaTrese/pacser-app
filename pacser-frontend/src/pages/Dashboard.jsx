import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import CategoryBadge from '../components/ui/CategoryBadge'
import { Flame, BookOpen, Target, ChevronRight, Shield } from 'lucide-react'
import api from '../api/axios'
import { getSubjectsForClass } from '../config/examSubjects'

export default function Dashboard() {
  const { user, updateUserStats, userClass } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    quiz_sets_done: 0,
    mastery: {},
    mock_exam: {
      attempt_count: 0,
      can_take_mock_exam: true,
      attempts_remaining: 1,
      is_premium: false
    }
  })
  const subjects = getSubjectsForClass(userClass)

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => {
        setStats({
          quiz_sets_done: res.data.quiz_sets_done,
          mastery: res.data.mastery,
          mock_exam: res.data.mock_exam || {
            attempt_count: 0,
            can_take_mock_exam: true,
            attempts_remaining: 1,
            is_premium: false
          }
        })
        if (res.data.user) {
          updateUserStats(res.data.user) // Refresh global user object
        }
      })
      .catch(err => console.error("Failed to load dashboard stats", err))
  }, [])

  useEffect(() => {
    if (!user?.double_xp_until) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      // Ensure we parse it correctly in case of timezone issues, assuming UTC from backend
      const end = new Date(user.double_xp_until + (!user.double_xp_until.endsWith('Z') ? 'Z' : ''));
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m left`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [user?.double_xp_until]);

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Anna Doe'
  const mockExam = stats.mock_exam
  const isPremiumMockUser = mockExam.is_premium || user?.is_premium
  const canTakeMockExam = mockExam.can_take_mock_exam
  const mockExamStatusLabel = isPremiumMockUser
    ? 'Premium - unlimited attempts'
    : canTakeMockExam
      ? '1 free attempt available'
      : 'Free attempt used'
  const mockExamDescription = isPremiumMockUser
    ? 'Retake the full-length mock exam whenever you want and use each attempt to sharpen your readiness.'
    : canTakeMockExam
      ? 'Use your included free attempt to measure readiness under exam conditions.'
      : 'You have used your free mock exam attempt. Upgrade to Premium to unlock unlimited retakes.'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans pb-12 transition-colors">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">

        {/* Top Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center flex-wrap">
              Welcome back, {displayName}!
              <CategoryBadge />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Your Civil Service journey awaits. What are we studying today?</p>
          </div>
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Continue Learning
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Active Perks Indicator */}
        {(user?.streak_freeze_active || timeLeft) && (
          <div className="flex gap-4 mb-2">
            {user?.streak_freeze_active && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                <div className="bg-yellow-100 dark:bg-yellow-800 p-1.5 rounded-full">
                  <Shield size={16} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-yellow-800 dark:text-yellow-200 font-bold text-sm tracking-tight">Streak Freeze Active</span>
              </div>
            )}

            {timeLeft && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full animate-pulse">
                  <Flame size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-800 dark:text-blue-200 font-bold text-sm tracking-tight">Double XP Active — {timeLeft}</span>
              </div>
            )}
          </div>
        )}

        {/* Top Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-yellow-100 dark:hover:border-yellow-900/50 transition-colors">
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Flame size={24} className="text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Current Streak</p>
              <p className="text-slate-900 dark:text-white font-extrabold text-2xl">{user?.streak || 0} Days</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-blue-200 dark:hover:border-blue-700/50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Target size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Total XP</p>
              <p className="text-slate-900 dark:text-white font-extrabold text-2xl">{user?.xp || 0} XP</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-blue-200 dark:hover:border-blue-700/50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Quiz Sets</p>
              <p className="text-slate-900 dark:text-white font-extrabold text-2xl">{stats.quiz_sets_done} Done</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-center hover:border-blue-200 dark:hover:border-blue-700/50 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Level {Math.floor((user?.xp || 0) / 100) + 1}</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs font-black">{(user?.xp || 0) % 100} / 100 XP</p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(user?.xp || 0) % 100}%` }}
              ></div>
            </div>
          </div>
        </div>



        {/* Full-width Subjects Grid */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-1 tracking-tight">Reviewer Subjects</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject) => {
              const subjectMastery = stats.mastery[subject.id] || 0;
              // Adjust colors for dark mode context
              const darkColor = subject.color.replace('50', '900/30');
              const darkBorderColor = subject.borderColor.replace('100', '700/50').replace('200', '700/50');
              const Icon = subject.icon;

              return (
              <div
                key={subject.id}
                onClick={() => navigate(`/learn/${subject.id}`)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md group flex flex-col transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl ${subject.color} dark:${darkColor} ${subject.borderColor} dark:${darkBorderColor} border flex items-center justify-center`}>
                    <Icon size={28} className={subject.iconClass} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full">{subjectMastery}% Mastery</span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                  {subject.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed flex-grow">
                  {subject.description}
                </p>
              </div>
            )})}
          </div>
        </div>

        {/* Mock Exam CTA at Bottom */}
        {userClass && (
          <div className={`mt-8 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg ${
            canTakeMockExam
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-600/20'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-slate-200/60 dark:shadow-black/10'
          }`}>
            <div className="text-white flex-1">
              <h2 className={`text-2xl font-black mb-4 flex items-center gap-3 ${canTakeMockExam ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                <Target size={28} className={canTakeMockExam ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'} />
                Full-Length Mock Exam
              </h2>
              <div className={`space-y-2 mb-4 p-4 rounded-lg border ${canTakeMockExam ? 'bg-white/10 border-white/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                <p className={`font-bold text-sm md:text-base ${canTakeMockExam ? 'text-blue-50' : 'text-slate-700 dark:text-slate-200'}`}>
                  <span className={canTakeMockExam ? 'text-yellow-400' : 'text-blue-600 dark:text-blue-400'}>{userClass} Level:</span>
                  {userClass === 'Professional' ? ' 170 items to be completed in 3 hours and 10 minutes.' : ' 165 items to be completed in 2 hours and 40 minutes.'}
                </p>
                <p className={`text-xs font-black uppercase tracking-widest ${canTakeMockExam ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {mockExamStatusLabel}
                  {!isPremiumMockUser && ` - ${mockExam.attempts_remaining} remaining`}
                </p>
              </div>
              <p className={`font-medium max-w-2xl text-sm leading-relaxed ${canTakeMockExam ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {mockExamDescription}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              {canTakeMockExam ? (
                <button
                  onClick={() => navigate(`/mock-exam?level=${userClass.toLowerCase()}`)}
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black px-8 py-3.5 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm"
                >
                  {isPremiumMockUser && mockExam.attempt_count > 0 ? 'Retake Mock Exam' : 'Take Mock Exam'}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 font-black px-8 py-3.5 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm"
                >
                  Upgrade For Retakes
                </button>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}



