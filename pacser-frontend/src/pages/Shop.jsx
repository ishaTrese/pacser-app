import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

export default function Shop() {
  const [activeTab, setActiveTab] = useState('Perks');
  const { user } = useAuth();
  const availablePoints = user?.points || 0;

  const missions = [
    { title: 'Complete 3 Lessons', current: 0, total: 3, reward: '+50 pts' },
    { title: 'Score 80% on a Quiz', current: 0, total: 1, reward: '+50 pts' },
    { title: 'Algebra', current: 0, total: 7, reward: '+50 pts' },
    { title: 'Governance', current: 0, total: 30, reward: '+50 pts' },
  ];

  const perks = [
    { title: 'Double XP Boost', detail: '24 hours', cost: 450 },
    { title: 'Streak Freeze', detail: 'Protect your streak', cost: 150 },
    { title: 'Energy Refill', detail: 'Full energy restore', cost: 180 },
    { title: 'Energy', detail: 'One energy restore', cost: 20 },
    { title: 'Double XP Boost', detail: '24 hours', cost: 450 },
    { title: 'Streak Freeze', detail: 'Protect your streak', cost: 150 },
    { title: 'Energy Refill', detail: 'Full energy restore', cost: 180 },
    { title: 'Energy', detail: 'One energy restore', cost: 20 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="mb-8 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Shop</h1>
            <p className="text-slate-500 font-medium">
              Redeem points for books, perks, and more!
            </p>
          </div>
          <div className="bg-white border border-blue-200 shadow-sm rounded-xl px-5 py-3 flex items-center gap-4">
            <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Available Points</span>
            <span className="text-blue-600 font-black text-2xl">{availablePoints}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Daily Missions */}
          <div className="mb-8 shrink-0">
            <h2 className="text-slate-900 text-2xl font-bold mb-4">Daily Missions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {missions.map((mission, idx) => (
                <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl border border-white/10 p-5 flex flex-col shadow-lg">
                  <h3 className="text-slate-900 font-bold text-lg mb-6">{mission.title}</h3>
                  <div className="w-full bg-white h-3.5 rounded-full mb-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-yellow-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(mission.current / mission.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-1">
                    <span className="text-slate-300 text-sm font-medium">{mission.current}/{mission.total}</span>
                    <span className="text-blue-600 font-bold">{mission.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shop Tabs */}
          <div className="flex gap-8 border-b border-white/10 mb-6 shrink-0">
            {['Perks', 'Books'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-lg font-bold transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-slate-900 border-transparent hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 pb-6">
            {activeTab === 'Perks' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {perks.map((perk, idx) => {
                  const canAfford = availablePoints >= perk.cost;
                  return (
                    <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl border border-white/10 p-5 flex flex-col shadow-lg transition-transform hover:-translate-y-1">
                      <h3 className="text-slate-900 font-bold text-lg mb-2">{perk.title}</h3>
                      <p className="text-slate-400 text-sm mb-6">{perk.detail}</p>
                      <div className="flex justify-between items-center mt-auto pt-2">
                        <span className="text-blue-600 font-bold text-lg">{perk.cost} pts</span>
                        <button 
                          className={`px-5 py-2 rounded font-bold transition-colors shadow-sm ${
                            canAfford 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-[#2a3040] text-slate-400 cursor-not-allowed'
                          }`}
                          disabled={!canAfford}
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'Books' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-xl">
                  <div className="w-40 h-56 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                    <span className="text-slate-500 font-bold text-sm">Book Cover Placeholder</span>
                  </div>
                  <div className="flex flex-col flex-1 h-full">
                    <h3 className="text-slate-900 font-bold text-2xl mb-2">CSE Reviewer Masterclass</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      The ultimate guide to passing the Civil Service Exam. Packed with comprehensive lessons, practice tests, and proven strategies to help you succeed.
                    </p>
                    <a 
                      href="#" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-slate-900 font-black px-6 py-3 rounded-lg transition-colors w-full sm:w-auto self-start shadow-lg"
                    >
                      Buy on Shopee
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}





