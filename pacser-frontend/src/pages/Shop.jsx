import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Shop() {
  const [activeTab, setActiveTab] = useState('Perks');
  const [modalMessage, setModalMessage] = useState(null);
  const { user, updateUserStats } = useAuth();
  const availablePoints = user?.points || 0;

  const missions = [
    { title: 'Complete 3 Lessons', current: 0, total: 3, reward: '+50 pts' },
    { title: 'Score 80% on a Quiz', current: 0, total: 1, reward: '+50 pts' },
    { title: 'Algebra', current: 0, total: 7, reward: '+50 pts' },
    { title: 'Governance', current: 0, total: 30, reward: '+50 pts' },
  ];

  const perks = [
    { id: 'double_xp', title: 'Double XP Boost', detail: '24 hours', cost: 450 },
    { id: 'streak_freeze', title: 'Streak Freeze', detail: 'Protect your streak', cost: 150 },
    { id: 'energy_refill', title: 'Energy Refill', detail: 'Full energy restore', cost: 180 },
    { id: 'energy_plus_one', title: 'Energy', detail: 'One energy restore', cost: 20 },
  ];

  const handlePurchase = async (itemId) => {
    try {
      const res = await api.post('/shop/purchase', { item_id: itemId });
      if (res.data.user) {
        updateUserStats(res.data.user);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to purchase item');
    }
  };

  const handleActivate = async (itemId) => {
    try {
      const res = await api.post('/shop/activate', { item_id: itemId });
      if (res.data.user) {
        updateUserStats(res.data.user);
        if (itemId === 'energy_refill' || itemId === 'energy_plus_one') {
          setModalMessage(`Perk Activated! Your energy is now ${res.data.user.energy} / 20.`);
        } else {
          setModalMessage('Perk Activated!');
        }
      } else {
        setModalMessage('Perk Activated!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate item');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="mb-8 mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Shop</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Redeem points for books, perks, and more!
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700/50 shadow-sm rounded-xl px-5 py-3 flex items-center gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider">Available Points</span>
            <span className="text-blue-600 dark:text-blue-400 font-black text-2xl">{availablePoints}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Daily Missions */}
          <div className="mb-8 shrink-0">
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold mb-4">Daily Missions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {missions.map((mission, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 flex flex-col shadow-lg">
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-6">{mission.title}</h3>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-3.5 rounded-full mb-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-yellow-500 dark:bg-yellow-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(mission.current / mission.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-1">
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">{mission.current}/{mission.total}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{mission.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shop Tabs */}
          <div className="flex gap-8 border-b border-slate-200 dark:border-slate-700 mb-6 shrink-0">
            {['Perks', 'Books'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-lg font-bold transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400' 
                    : 'text-slate-900 dark:text-slate-400 border-transparent hover:text-slate-500 dark:hover:text-slate-300'
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
                  
                  // Map perk ID to inventory column name in user object
                  const invKey = 
                    perk.id === 'double_xp' ? 'inventory_double_xp' :
                    perk.id === 'streak_freeze' ? 'inventory_streak_freezes' :
                    perk.id === 'energy_refill' ? 'inventory_energy_refills' :
                    'inventory_energy_plus_one';
                  
                  const ownedCount = user?.[invKey] || 0;

                  return (
                    <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 flex flex-col shadow-lg transition-transform hover:-translate-y-1 relative">
                      {ownedCount > 0 && (
                        <div className="absolute -top-3 -right-3 bg-green-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md border-2 border-white dark:border-slate-800 z-10">
                          Owned: {ownedCount}
                        </div>
                      )}
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">{perk.title}</h3>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">{perk.detail}</p>
                      
                      <div className="mt-auto flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{perk.cost} pts</span>
                          <button 
                            onClick={() => handlePurchase(perk.id)}
                            className={`px-4 py-1.5 rounded font-bold text-sm transition-colors shadow-sm ${
                              canAfford 
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50' 
                                : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600 cursor-not-allowed'
                            }`}
                            disabled={!canAfford}
                          >
                            Buy
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleActivate(perk.id)}
                          disabled={ownedCount <= 0}
                          className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                            ownedCount > 0
                              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Activate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'Books' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-xl">
                  <div className="w-40 h-56 bg-slate-800 dark:bg-slate-900 rounded-lg flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                    <span className="text-slate-500 font-bold text-sm">Book Cover Placeholder</span>
                  </div>
                  <div className="flex flex-col flex-1 h-full">
                    <h3 className="text-slate-900 dark:text-white font-bold text-2xl mb-2">CSE Reviewer Masterclass</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 leading-relaxed">
                      The ultimate guide to passing the Civil Service Exam. Packed with comprehensive lessons, practice tests, and proven strategies to help you succeed.
                    </p>
                    <a 
                      href="#" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-lg transition-colors w-full sm:w-auto self-start shadow-lg"
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

      {/* Custom Modal */}
      {modalMessage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 transition-transform">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Success!</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{modalMessage}</p>
            <button 
              onClick={() => setModalMessage(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Awesome
            </button>
          </div>
        </div>
      )}
    </div>
  );
}





