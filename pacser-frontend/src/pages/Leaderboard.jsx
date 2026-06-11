import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { Trophy, Medal, Crown, Sparkles, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All Time');
  const [showRankGuide, setShowRankGuide] = useState(false);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [weeklyLeague, setWeeklyLeague] = useState(null);
  const [allTimeCurrentUser, setAllTimeCurrentUser] = useState(null);
  const [rankHistory, setRankHistory] = useState({ latest: null, recent: [] });
  const [loading, setLoading] = useState(true);

  const [userRankName, setUserRankName] = useState('Applicant');

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => {
        setWeeklyLeaderboard(res.data.leaderboard);
        setAllTimeLeaderboard(res.data.all_time_leaderboard);
        setWeeklyLeague(res.data.weekly_league || null);
        setAllTimeCurrentUser(res.data.all_time_current_user || null);
        setRankHistory(res.data.rank_history || { latest: null, recent: [] });

        const rankNames = {
          1: 'Applicant',
          2: 'Clerk',
          3: 'Officer',
          4: 'Supervisor',
          5: 'Director',
          6: 'Secretary',
          7: 'Commissioner',
          8: 'Civil Service Champion',
        };
        setUserRankName(rankNames[res.data.current_user_rank] || 'Applicant');
      })
      .catch(err => console.error("Failed to load leaderboard", err))
      .finally(() => setLoading(false));
  }, []);

  const leaderboard = activeTab === 'Weekly' ? weeklyLeaderboard : allTimeLeaderboard;
  const isWeekly = activeTab === 'Weekly';
  const topThree = leaderboard.slice(0, 3);
  const theRest = leaderboard.slice(3);

  // Find current user's rank
  const userRankIndex = leaderboard.findIndex(u => u.id === user?.id);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : '-';

  const CURRENT_USER = {
    name: user ? `${user.first_name} ${user.last_name}` : 'Anna Doe',
    rank: isWeekly ? (weeklyLeague?.current_user_position || userRank) : (allTimeCurrentUser?.position || userRank),
    xp: activeTab === 'Weekly' ? (weeklyLeague?.weekly_xp ?? user?.weekly_xp ?? 0) : (allTimeCurrentUser?.xp ?? user?.xp ?? 0),
    points: isWeekly ? null : allTimeCurrentUser?.points,
    level: isWeekly ? null : allTimeCurrentUser?.level,
    rankName: isWeekly ? weeklyLeague?.rank_name : allTimeCurrentUser?.rank_name,
    streak: isWeekly ? null : allTimeCurrentUser?.streak,
  };

  const formatWeekDate = (dateString) => {
    if (!dateString) return '--';

    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const zoneLabel = (status) => {
    if (status === 'promotion_zone') return 'Promotion';
    if (status === 'demotion_zone') return 'Demotion';
    return 'Safe';
  };

  const zoneClass = (status) => {
    if (status === 'promotion_zone') {
      return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-700/50';
    }

    if (status === 'demotion_zone') {
      return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-100 dark:border-red-700/50';
    }

    return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-700/50';
  };

  const zoneBorderClass = (status) => {
    if (status === 'promotion_zone') return 'border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10';
    if (status === 'demotion_zone') return 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
    return '';
  };

  const movementLabel = (status) => {
    if (status === 'promoted') return 'Promoted';
    if (status === 'demoted') return 'Demoted';
    return 'Retained';
  };

  const movementClass = (status) => {
    if (status === 'promoted') return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-700/50';
    if (status === 'demoted') return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-100 dark:border-red-700/50';
    return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-700/50';
  };

  const nextUserMessage = weeklyLeague?.xp_to_next_user
    ? `${weeklyLeague.xp_to_next_user} XP to pass ${weeklyLeague.next_user?.name || 'the next user'}.`
    : weeklyLeague?.current_user_position === 1
      ? 'You are leading this league.'
      : 'Earn XP from quizzes to climb the weekly league.';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-8 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3 mb-2">
              <Medal className="text-yellow-500" size={32} />
              Leaderboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              Compete with other Civil Service aspirants. Can you make it to the Top 20% and secure a promotion?
            </p>
          </div>
          <button
            onClick={() => setShowRankGuide(true)}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Info size={16} /> Ranks & Perks Guide
          </button>
        </div>

        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('Weekly')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'Weekly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Weekly League: {userRankName}
          </button>
          <button
            onClick={() => setActiveTab('All Time')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'All Time'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            All Time
          </button>
        </div>

        {isWeekly && weeklyLeague && (
          <div className="mt-6 grid gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    Weekly League
                  </p>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {weeklyLeague.rank_name || userRankName}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {formatWeekDate(weeklyLeague.week_start)} - {formatWeekDate(weeklyLeague.week_end)}
                  </p>
                </div>

                <div className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-widest ${zoneClass(weeklyLeague.promotion_status)}`}>
                  {zoneLabel(weeklyLeague.promotion_status)} Zone
                </div>
              </div>

              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Position</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {weeklyLeague.current_user_position ? `#${weeklyLeague.current_user_position}` : '-'}
                    <span className="text-sm text-slate-400 dark:text-slate-500"> / {weeklyLeague.total_users || 0}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Weekly XP</p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">{weeklyLeague.weekly_xp || 0}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Promotion</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {weeklyLeague.promotion_cutoff_position ? `Top ${weeklyLeague.promotion_cutoff_position}` : 'Not active'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 px-3 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Demotion</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {weeklyLeague.demotion_cutoff_position ? `#${weeklyLeague.demotion_cutoff_position}+` : 'Not active'}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 px-4 py-3">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                  {weeklyLeague.small_league_message || nextUserMessage}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    Weekly Result
                  </p>
                  {rankHistory.latest ? (
                    <>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {rankHistory.latest.old_rank_name} to {rankHistory.latest.new_rank_name}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Week of {formatWeekDate(rankHistory.latest.week_start_date)} - {rankHistory.latest.weekly_xp} XP
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      No weekly result yet. Your first weekly league result will appear after Sunday's reset.
                    </p>
                  )}
                </div>

                {rankHistory.latest && (
                  <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-widest ${movementClass(rankHistory.latest.status)}`}>
                    {movementLabel(rankHistory.latest.status)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Leaderboard Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden flex flex-col transition-colors mt-8">

          {/* List Area */}
          <div className="flex-1 min-h-[400px] flex flex-col bg-white dark:bg-slate-800">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold animate-pulse">Loading rankings...</span>
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="flex flex-col">

                {/* Podium for Top 3 */}
                <div className="flex justify-center items-end gap-1 sm:gap-6 pt-8 sm:pt-12 pb-6 sm:pb-8 px-2 sm:px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/50 border-b border-slate-100 dark:border-slate-700 overflow-hidden">
                  {/* Rank 2 */}
                  {topThree[1] && (
                    <div className={`flex flex-col items-center w-20 sm:w-32 rounded-xl p-1.5 sm:p-2 min-w-0 ${topThree[1].id === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 mb-2 border-2 border-slate-300 dark:border-slate-600">
                        {topThree[1].first_name[0]}{topThree[1].last_name[0]}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate w-full text-center">
                        {topThree[1].first_name}
                        {topThree[1].id === user?.id && <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400">You</span>}
                      </p>
                      {!isWeekly && (
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate w-full text-center">
                          Lv {topThree[1].level} - {topThree[1].rank_name}
                        </p>
                      )}
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-3">
                        {activeTab === 'Weekly' ? topThree[1].weekly_xp : topThree[1].xp} XP
                      </p>
                      <div className="w-full h-24 bg-slate-200 dark:bg-slate-700 rounded-t-lg flex justify-center pt-2 border-t border-l border-r border-slate-300 dark:border-slate-600 shadow-inner">
                        <span className="text-2xl font-black text-slate-400 dark:text-slate-500">2</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {topThree[0] && (
                    <div className={`flex flex-col items-center w-24 sm:w-36 z-10 rounded-xl p-1.5 sm:p-2 min-w-0 ${topThree[0].id === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <Trophy size={28} className="text-yellow-500 mb-2 fill-current drop-shadow-md" />
                      <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center font-bold text-yellow-700 dark:text-yellow-500 mb-2 border-4 border-yellow-400 dark:border-yellow-600 shadow-lg">
                        {topThree[0].first_name[0]}{topThree[0].last_name[0]}
                      </div>
                      <p className="text-base font-bold text-slate-900 dark:text-white truncate w-full text-center">
                        {topThree[0].first_name}
                        {topThree[0].id === user?.id && <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400">You</span>}
                      </p>
                      {!isWeekly && (
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate w-full text-center">
                          Lv {topThree[0].level} - {topThree[0].rank_name}
                        </p>
                      )}
                      <p className="text-sm font-black text-yellow-600 dark:text-yellow-400 mb-3">
                        {activeTab === 'Weekly' ? topThree[0].weekly_xp : topThree[0].xp} XP
                      </p>
                      <div className="w-full h-32 bg-yellow-400 dark:bg-yellow-600 rounded-t-xl flex justify-center pt-2 shadow-inner border-t border-l border-r border-yellow-500 dark:border-yellow-500">
                        <span className="text-4xl font-black text-yellow-600 dark:text-yellow-800 opacity-50 drop-shadow-sm">1</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {topThree[2] && (
                    <div className={`flex flex-col items-center w-20 sm:w-32 rounded-xl p-1.5 sm:p-2 min-w-0 ${topThree[2].id === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center font-bold text-orange-800 dark:text-orange-500 mb-2 border-2 border-orange-300 dark:border-orange-700">
                        {topThree[2].first_name[0]}{topThree[2].last_name[0]}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate w-full text-center">
                        {topThree[2].first_name}
                        {topThree[2].id === user?.id && <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400">You</span>}
                      </p>
                      {!isWeekly && (
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate w-full text-center">
                          Lv {topThree[2].level} - {topThree[2].rank_name}
                        </p>
                      )}
                      <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-3">
                        {activeTab === 'Weekly' ? topThree[2].weekly_xp : topThree[2].xp} XP
                      </p>
                      <div className="w-full h-20 bg-orange-200 dark:bg-orange-800/50 rounded-t-lg flex justify-center pt-2 border-t border-l border-r border-orange-300 dark:border-orange-700 shadow-inner">
                        <span className="text-2xl font-black text-orange-400 dark:text-orange-600">3</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remaining List */}
                <div className="flex flex-col">
                  {theRest.map((u, idx) => {
                    const actualRank = idx + 4;
                    const isCurrentUser = u.id === user?.id;

                    return (
                      <div key={u.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        activeTab === 'Weekly' ? zoneBorderClass(u.zone_status) : ''
                      } ${isCurrentUser ? 'ring-1 ring-blue-200 dark:ring-blue-800 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="w-8 text-center font-bold text-slate-400 dark:text-slate-500">{actualRank}</span>
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                            {u.first_name[0]}{u.last_name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{u.first_name} {u.last_name}</p>
                              {isCurrentUser && (
                                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                                  You
                                </span>
                              )}
                            </div>
                            {activeTab === 'Weekly' && (
                              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${zoneClass(u.zone_status)}`}>
                                {zoneLabel(u.zone_status)}
                              </span>
                            )}
                            {!isWeekly && (
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                <span>Lv {u.level || 1}</span>
                                <span>{u.rank_name || 'Applicant'}</span>
                                <span>{u.points || 0} pts</span>
                                <span>{u.streak || 0} streak</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-slate-600 dark:text-slate-300 sm:text-right">
                          {activeTab === 'Weekly' ? u.weekly_xp : u.xp} XP
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Trophy size={32} className="text-blue-300 dark:text-blue-500" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-2">No rankings yet!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                  The {activeTab.toLowerCase()} leaderboard is currently empty. Be the first to complete a practice set and claim the #1 spot!
                </p>
              </div>
            )}
          </div>

          {/* Current User Sticky Footer */}
          <div className="bg-slate-900 p-4 sm:px-6 flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-3 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                {CURRENT_USER.rank === '-' ? '-' : `#${CURRENT_USER.rank}`}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{CURRENT_USER.name}</p>
                <p className="text-slate-400 text-xs font-medium">
                  {isWeekly
                    ? 'You'
                    : `You - Lv ${CURRENT_USER.level || 1} - ${CURRENT_USER.rankName || 'Applicant'}`}
                </p>
                {!isWeekly && (
                  <p className="text-slate-500 text-[11px] font-bold mt-0.5">
                    {CURRENT_USER.points || 0} pts - {CURRENT_USER.streak || 0} streak
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-400 font-black text-lg">{CURRENT_USER.xp} XP</p>
            </div>
          </div>

        </div>
      </div>

      {/* Rank Guide Modal */}
      {showRankGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <Crown className="text-yellow-500" size={28} />
                Ranks & Perks Guide
              </h2>
              <button onClick={() => setShowRankGuide(false)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-slate-50 dark:bg-slate-900">
              {/* Leaderboard Rules */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Weekly League Rules</h3>
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 font-medium text-sm">
                  <li className="flex items-start gap-2">
                    <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    You only compete against users in your current rank.
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="text-green-500 shrink-0 mt-0.5" size={16} />
                    <strong>Top 20%</strong> gets promoted to the next rank every Sunday 11:59 PM.
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="text-slate-400 shrink-0 mt-0.5" size={16} />
                    <strong>Middle 60%</strong> retains their current rank.
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <strong>Bottom 20%</strong> gets demoted.
                  </li>
                </ul>
              </div>

              {/* Ranks Table */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Rank Tiers & Passive Perks</h3>
                <div className="grid gap-3">
                  {[
                    { id: 1, name: 'Applicant', perks: 'Base XP and Points' },
                    { id: 2, name: 'Clerk', perks: '+5% XP Bonus' },
                    { id: 3, name: 'Officer', perks: '+10% XP, +5% Points Bonus' },
                    { id: 4, name: 'Supervisor', perks: '+15% XP, +10% Points, 1 free Energy refill/week' },
                    { id: 5, name: 'Director', perks: '+20% XP, +15% Points, 2 free Energy refills/week' },
                    { id: 6, name: 'Secretary', perks: '+25% XP, +20% Points, 1 free Streak Freeze/week' },
                    { id: 7, name: 'Commissioner', perks: '+30% XP, +25% Points, Double XP on Mondays' },
                    { id: 8, name: 'Civil Service Champion', perks: '+50% XP, +50% Points, All perks unlocked permanently' }
                  ].map(rank => (
                    <div key={rank.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-slate-400 dark:text-slate-500 shrink-0">
                          {rank.id}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-lg">{rank.name}</span>
                      </div>
                      <div className="text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-right">
                        {rank.perks}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
