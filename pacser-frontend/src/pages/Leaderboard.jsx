import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { Search, Trophy, Medal } from 'lucide-react';
import CategoryBadge from '../components/ui/CategoryBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All Time');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => setLeaderboard(res.data.leaderboard))
      .catch(err => console.error("Failed to load leaderboard", err))
      .finally(() => setLoading(false));
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const theRest = leaderboard.slice(3);

  // Find current user's rank
  const userRankIndex = leaderboard.findIndex(u => u.id === user?.id);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : '-';

  const CURRENT_USER = {
    name: user ? `${user.first_name} ${user.last_name}` : 'Anna Doe',
    rank: userRank,
    xp: user?.xp || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center flex-wrap">
              Leaderboards
              <CategoryBadge />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              See how you stack up against other CSE aspirants.
            </p>
          </div>
          
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            {['Weekly', 'All Time'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Leaderboard Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden flex flex-col transition-colors">
          
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search for users..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500"
                disabled
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 min-h-[400px] flex flex-col bg-white dark:bg-slate-800">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold animate-pulse">Loading rankings...</span>
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="flex flex-col">
                
                {/* Podium for Top 3 */}
                <div className="flex justify-center items-end gap-2 sm:gap-6 pt-12 pb-8 px-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  {/* Rank 2 */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center w-24 sm:w-32">
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 mb-2 border-2 border-slate-300 dark:border-slate-600">
                        {topThree[1].first_name[0]}{topThree[1].last_name[0]}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate w-full text-center">{topThree[1].first_name}</p>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-3">{topThree[1].xp} XP</p>
                      <div className="w-full h-24 bg-slate-200 dark:bg-slate-700 rounded-t-lg flex justify-center pt-2 border-t border-l border-r border-slate-300 dark:border-slate-600 shadow-inner">
                        <span className="text-2xl font-black text-slate-400 dark:text-slate-500">2</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center w-28 sm:w-36 z-10">
                      <Trophy size={28} className="text-yellow-500 mb-2 fill-current drop-shadow-md" />
                      <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center font-bold text-yellow-700 dark:text-yellow-500 mb-2 border-4 border-yellow-400 dark:border-yellow-600 shadow-lg">
                        {topThree[0].first_name[0]}{topThree[0].last_name[0]}
                      </div>
                      <p className="text-base font-bold text-slate-900 dark:text-white truncate w-full text-center">{topThree[0].first_name}</p>
                      <p className="text-sm font-black text-yellow-600 dark:text-yellow-400 mb-3">{topThree[0].xp} XP</p>
                      <div className="w-full h-32 bg-yellow-400 dark:bg-yellow-600 rounded-t-xl flex justify-center pt-2 shadow-inner border-t border-l border-r border-yellow-500 dark:border-yellow-500">
                        <span className="text-4xl font-black text-yellow-600 dark:text-yellow-800 opacity-50 drop-shadow-sm">1</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center w-24 sm:w-32">
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center font-bold text-orange-800 dark:text-orange-500 mb-2 border-2 border-orange-300 dark:border-orange-700">
                        {topThree[2].first_name[0]}{topThree[2].last_name[0]}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate w-full text-center">{topThree[2].first_name}</p>
                      <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-3">{topThree[2].xp} XP</p>
                      <div className="w-full h-20 bg-orange-200 dark:bg-orange-800/50 rounded-t-lg flex justify-center pt-2 border-t border-l border-r border-orange-300 dark:border-orange-700 shadow-inner">
                        <span className="text-2xl font-black text-orange-400 dark:text-orange-600">3</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remaining List */}
                <div className="flex flex-col">
                  {theRest.map((u, idx) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="w-8 text-center font-bold text-slate-400 dark:text-slate-500">{idx + 4}</span>
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.first_name} {u.last_name}</p>
                      </div>
                      <span className="font-bold text-slate-600 dark:text-slate-300">{u.xp} XP</span>
                    </div>
                  ))}
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
          <div className="bg-slate-900 p-4 sm:px-6 flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                {CURRENT_USER.rank === '-' ? '-' : `#${CURRENT_USER.rank}`}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{CURRENT_USER.name}</p>
                <p className="text-slate-400 text-xs font-medium">You</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-400 font-black text-lg">{CURRENT_USER.xp} XP</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
