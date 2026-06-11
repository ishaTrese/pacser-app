import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { Shield, Star, Flame, Target, Zap, Award, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/ui/CategoryBadge';
import api from '../api/axios';

export default function Profile() {
  const { user, updateUserStats } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [mockExam, setMockExam] = useState(null);
  const [mockExamHistory, setMockExamHistory] = useState([]);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/profile/stats');
      setStats(res.data.stats);
      setMockExam(res.data.mock_exam || null);
      setBadges(res.data.badges);
      if (res.data.user) {
        updateUserStats(res.data.user);
        setEmail(res.data.user.email);
      }

      const historyRes = await api.get('/mock-exam/history');
      setMockExamHistory(historyRes.data.attempts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccount = async () => {
    try {
      const res = await api.post('/profile/update', { email, password });
      alert(res.data.message);
      if (res.data.user) {
        updateUserStats(res.data.user);
      }
      setPassword(''); // Clear password
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update account');
    }
  };

  const handleRedeemCode = async () => {
    if (!code) return;
    try {
      const res = await api.post('/profile/redeem', { code });
      alert(res.data.message);
      if (res.data.user) {
        updateUserStats(res.data.user);
      }
      setCode('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to redeem code');
    }
  };

  const badgeIcons = [Shield, Flame, Zap, Star, Target, Award, BookOpen, Clock];
  const badgeColors = [
    { color: 'text-yellow-500', bg: 'border-yellow-500/30' },
    { color: 'text-red-400', bg: 'border-red-500/30' },
    { color: 'text-indigo-400', bg: 'border-indigo-500/30' },
    { color: 'text-blue-400', bg: 'border-blue-500/30' },
    { color: 'text-green-400', bg: 'border-green-500/30' },
    { color: 'text-purple-400', bg: 'border-purple-500/30' },
    { color: 'text-pink-400', bg: 'border-pink-500/30' },
    { color: 'text-orange-400', bg: 'border-orange-500/30' },
  ];

  const formatMockResult = (result) => {
    if (!result) return 'No attempts yet';
    return `${result.percentage}% (${result.score}/${result.total_items})`;
  };

  const formatAttemptDate = (dateString) => {
    if (!dateString) return 'Unknown date';

    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const visibleMockExamHistory = mockExamHistory.slice(0, 3);



  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-5 overflow-hidden">

        {/* Header Section */}
        <div className="mb-5 shrink-0">
          <h1 className="text-slate-900 dark:text-white font-black text-2xl flex items-center flex-wrap">
            My Profile
            <CategoryBadge />
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Manage your profile, track progress, and redeem codes.</p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

          {/* LEFT: Identity Card (4/12) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-6 shadow-xl flex flex-col items-center transition-colors">
            <div className="w-28 h-28 rounded-full bg-slate-700 dark:bg-slate-900 flex items-center justify-center border-4 border-blue-600 dark:border-blue-500 shadow-[0_0_15px_rgba(251,191,36,0.3)] mb-4 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400 dark:text-slate-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
            </div>

            <h2 className="text-slate-900 dark:text-white font-black text-xl mb-1 tracking-wide">{user?.first_name} {user?.last_name}</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest mb-8">
              {user?.is_premium ? 'Premium Aspirant' : 'Civil Service Aspirant'}
            </p>

            <div className="w-full flex flex-col gap-3 mt-auto">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-white/5 dark:border-white/10 p-4 flex justify-between items-center shadow-inner">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Total XP</span>
                <span className="text-blue-600 dark:text-blue-400 font-black text-lg">{user?.xp || 0}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-white/5 dark:border-white/10 p-4 flex justify-between items-center shadow-inner">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Current Rank</span>
                <span className="text-yellow-500 dark:text-yellow-400 font-black text-lg">{stats?.rank || 'Applicant'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-white/5 dark:border-white/10 p-4 flex justify-between items-center shadow-inner">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Points</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-black text-lg">{user?.points || 0}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Content Tabs (8/12) */}
          <div className="lg:col-span-8 flex flex-col min-h-0">

            {/* Tabs Header */}
            <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 mb-5 shrink-0 transition-colors">
              {['Overview', 'Mock Exams', 'Achievements', 'Account'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                      : 'text-slate-900 dark:text-slate-400 border-transparent hover:text-slate-500 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white dark:[&::-webkit-scrollbar-track]:bg-slate-800 [&::-webkit-scrollbar-thumb]:bg-blue-600/50 hover:[&::-webkit-scrollbar-thumb]:bg-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full pr-2">

              {activeTab === 'Overview' && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 shadow-lg flex flex-col justify-center items-center text-center transition-colors">
                      <BookOpen size={24} className="text-blue-400 dark:text-blue-500 mb-3" />
                      <span className="text-slate-900 dark:text-white font-black text-2xl mb-1">{stats?.total_lessons || 0}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Total Lessons</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 shadow-lg flex flex-col justify-center items-center text-center transition-colors">
                      <Target size={24} className="text-green-400 dark:text-green-500 mb-3" />
                      <span className="text-slate-900 dark:text-white font-black text-2xl mb-1">{stats?.accuracy || 0}%</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Practice Accuracy</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 shadow-lg flex flex-col justify-center items-center text-center transition-colors">
                      <Flame size={24} className="text-red-400 dark:text-red-500 mb-3" />
                      <span className="text-slate-900 dark:text-white font-black text-2xl mb-1">{user?.streak || 0}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Day Streak</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 shadow-lg flex flex-col justify-center items-center text-center transition-colors">
                      <Award size={24} className="text-purple-400 dark:text-purple-500 mb-3" />
                      <span className="text-slate-900 dark:text-white font-black text-2xl mb-1">{stats?.mock_exams_taken || 0}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Mock Exams Taken</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 shadow-lg transition-colors">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Daily missions are now handled from the Dashboard so this profile can focus on your progress history.
                    </p>
                  </div>

                  {/* Rank Perks Section */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-6 shadow-lg transition-colors">
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <Shield size={20} className="text-yellow-500" />
                      My Rank Perks
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 font-medium">
                        {user?.rank_id === 1 && <li>• Base XP and Points</li>}
                        {user?.rank_id === 2 && <li>• +5% XP Bonus</li>}
                        {user?.rank_id === 3 && <li>• +10% XP, +5% Points</li>}
                        {user?.rank_id === 4 && <li>• +15% XP, +10% Points, 1 free Energy refill/week</li>}
                        {user?.rank_id === 5 && <li>• +20% XP, +15% Points, 2 free Energy refills/week</li>}
                        {user?.rank_id === 6 && <li>• +25% XP, +20% Points, 1 free Streak Freeze/week</li>}
                        {user?.rank_id === 7 && <li>• +30% XP, +25% Points, Double XP on Mondays</li>}
                        {user?.rank_id === 8 && <li>• +50% XP, +50% Points, All perks unlocked permanently</li>}
                      </ul>
                      <p className="text-xs text-slate-400 mt-4 italic">Rank up in the weekly leaderboard to unlock better perks!</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Mock Exams' && (
                <div className="flex flex-col gap-6">
                  {mockExam?.attempt_count > 0 && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 shadow-lg transition-colors">
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <Target size={20} className="text-blue-500" />
                        Mock Exam Performance
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Best Score</p>
                          <p className="text-slate-900 dark:text-white font-black text-xl">{formatMockResult(mockExam.best_result)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Latest Attempt</p>
                          <p className="text-slate-900 dark:text-white font-black text-xl">{formatMockResult(mockExam.latest_result)}</p>
                          <p className={`text-xs font-bold uppercase tracking-widest mt-2 ${mockExam.latest_result?.passed ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {mockExam.latest_result?.passed ? 'Passed' : 'Needs Review'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 shadow-lg transition-colors">
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <Clock size={20} className="text-blue-500" />
                      Mock Exam History
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-4">
                      Showing latest 3 attempts.
                    </p>

                    {mockExamHistory.length === 0 ? (
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          No mock exam attempts yet.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {visibleMockExamHistory.map((attempt, index) => (
                          <div key={attempt.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div>
                                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                                  Attempt #{mockExamHistory.length - index}
                                </p>
                                <p className="text-slate-900 dark:text-white font-black text-lg">
                                  {formatAttemptDate(attempt.taken_at)}
                                </p>
                              </div>
                              <div className="sm:text-right">
                                <p className="text-slate-900 dark:text-white font-black text-lg">
                                  {attempt.score} / {attempt.total_items}
                                  <span className="text-slate-400 dark:text-slate-500 text-sm font-bold ml-2">
                                    {attempt.percentage}%
                                  </span>
                                </p>
                                <p className={`text-xs font-bold uppercase tracking-widest ${attempt.passed ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {attempt.passed ? 'Passed' : 'Needs Review'}
                                </p>
                              </div>
                            </div>

                            {attempt.subject_scores?.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedAttemptId(expandedAttemptId === attempt.id ? null : attempt.id)}
                                className="mt-3 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                              >
                                {expandedAttemptId === attempt.id ? 'Hide breakdown' : 'View breakdown'}
                              </button>
                            )}

                            {expandedAttemptId === attempt.id && attempt.subject_scores?.length > 0 && (
                              <div className="space-y-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                {attempt.subject_scores.map((subject) => (
                                  <div key={`${attempt.id}-${subject.subject_slug}`} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 items-center">
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                      {subject.subject_name}
                                    </p>
                                    <p className="text-xs font-black text-slate-500 dark:text-slate-400">
                                      {subject.score}/{subject.total}
                                      <span className="ml-2 text-slate-400 dark:text-slate-500">{subject.percentage}%</span>
                                    </p>
                                    <div className="col-span-2 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        className={subject.percentage >= 80 ? 'h-full bg-emerald-500' : 'h-full bg-blue-500'}
                                        style={{ width: `${Math.min(100, subject.percentage)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Achievements' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-6 shadow-lg transition-colors">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
                    {badges.map((badge, idx) => {
                      const Icon = badgeIcons[idx];
                      const colorObj = badgeColors[idx];
                      return (
                        <div key={badge.id} className="flex flex-col items-center text-center gap-3">
                          <div
                            title={badge.name}
                            className={`relative w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-2 ${badge.earned ? colorObj.bg : 'border-slate-800 grayscale opacity-30'} ${badge.earned ? 'shadow-[0_0_20px_rgba(251,191,36,0.2)]' : ''} transition-all duration-300`}
                          >
                            <Icon size={32} className={`${badge.earned ? colorObj.color : 'text-slate-600'}`} />
                          </div>
                          <div>
                            <p className={`font-black text-sm ${badge.earned ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                              {badge.name}
                            </p>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${badge.earned ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate-400 dark:text-slate-600'}`}>
                              {badge.earned ? 'Unlocked' : 'Locked'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'Account' && (
                <div className="flex flex-col gap-5">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-6 shadow-lg transition-colors">
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Account Settings</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wide">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors font-medium"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wide">Password (Leave blank to keep current)</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors font-medium"
                        />
                      </div>
                      <button
                        onClick={handleUpdateAccount}
                        className="mt-2 w-fit bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs py-2 px-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        Update Settings
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-6 shadow-lg transition-colors">
                    <h3 className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-1">Redeem Access Code</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mb-4">Enter a code from your physical book to unlock premium features.</p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="XXXX-XXXX-XXXX"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium flex-1 uppercase"
                      />
                      <button
                        onClick={handleRedeemCode}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2 px-6 rounded-lg transition-all shadow-md uppercase tracking-widest shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}





