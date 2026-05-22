import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { Search, Trophy, Medal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Weekly');

  // As requested, the system has no progress yet. 
  // We provide a clean empty state following HCI best practices.
  const LEADERBOARD_LIST = []; 
  
  const CURRENT_USER = {
    name: user ? `${user.first_name} ${user.last_name}` : 'Anna Doe',
    rank: '-',
    xp: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Leaderboards</h1>
            <p className="text-slate-500 font-medium">
              See how you stack up against other CSE aspirants.
            </p>
          </div>
          
          <div className="flex bg-slate-200 p-1 rounded-lg">
            {['Weekly', 'All Time'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Leaderboard Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
          
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search for users..."
                className="w-full bg-white border border-slate-200 text-sm text-slate-900 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-blue-500 transition-colors"
                disabled
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 min-h-[400px] flex flex-col">
            {LEADERBOARD_LIST.length > 0 ? (
              <div className="flex flex-col">
                {/* List items would go here */}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Trophy size={32} className="text-blue-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">No rankings yet!</h3>
                <p className="text-slate-500 max-w-sm mb-6">
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
