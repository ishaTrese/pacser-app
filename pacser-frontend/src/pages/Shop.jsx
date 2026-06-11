import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/ui/CategoryBadge';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Shop() {
  const [activeTab, setActiveTab] = useState('Perks');
  const [modalMessage, setModalMessage] = useState(null);
  const { user, updateUserStats } = useAuth();
  const navigate = useNavigate();
  const availablePoints = user?.points || 0;



  const perks = [
    { id: 'double_xp', title: 'Double XP Boost', detail: '24 hours', value: 'Best before a study session.', cost: 450 },
    { id: 'streak_freeze', title: 'Streak Freeze', detail: 'Protect your streak', value: 'Protects one eligible missed study day.', cost: 150 },
    { id: 'energy_refill', title: 'Energy Refill', detail: 'Full energy restore', value: 'Restores energy up to your cap.', cost: 180 },
    { id: 'energy_plus_one', title: 'Energy +1', detail: 'One energy restore', value: 'Restores one energy.', cost: 20 },
  ];

  const inventoryKeyFor = (itemId) => (
    itemId === 'double_xp' ? 'inventory_double_xp' :
    itemId === 'streak_freeze' ? 'inventory_streak_freezes' :
    itemId === 'energy_refill' ? 'inventory_energy_refills' :
    'inventory_energy_plus_one'
  );

  const isDoubleXpActive = () => {
    if (!user?.double_xp_until) return false;

    const end = new Date(user.double_xp_until + (!user.double_xp_until.endsWith('Z') ? 'Z' : ''));
    return end > new Date();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;

    return new Date(dateString + (!dateString.endsWith('Z') ? 'Z' : '')).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getActivationState = (itemId, ownedCount) => {
    const energyCap = Math.min(user?.max_energy || 20, 20);
    const isEnergyFull = (user?.energy || 0) >= energyCap;

    if (ownedCount <= 0) {
      return { canActivate: false, reason: 'Not owned', activeLabel: null };
    }

    if (itemId === 'double_xp' && isDoubleXpActive()) {
      return {
        canActivate: false,
        reason: 'Already active',
        activeLabel: `Active until ${formatDateTime(user.double_xp_until)}`
      };
    }

    if (itemId === 'streak_freeze' && user?.streak_freeze_active) {
      return {
        canActivate: false,
        reason: 'Already active',
        activeLabel: 'Active'
      };
    }

    if ((itemId === 'energy_refill' || itemId === 'energy_plus_one') && isEnergyFull) {
      return {
        canActivate: false,
        reason: 'Energy full',
        activeLabel: `${user?.energy || 0} / ${energyCap} energy`
      };
    }

    return { canActivate: true, reason: null, activeLabel: null };
  };

  const handlePurchase = async (itemId) => {
    try {
      const res = await api.post('/shop/purchase', { item_id: itemId });
      if (res.data.user) {
        updateUserStats(res.data.user);
      }
      setModalMessage(res.data.message || 'Purchase successful.');
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
          setModalMessage(`${res.data.message} Your energy is now ${res.data.user.energy} / ${Math.min(res.data.user.max_energy || 20, 20)}.`);
        } else {
          setModalMessage(res.data.message || 'Perk activated.');
        }
      } else {
        setModalMessage(res.data.message || 'Perk activated.');
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
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center flex-wrap">
              Shop
              <CategoryBadge />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Spend points on study perks that help you keep momentum.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700/50 shadow-sm rounded-xl px-5 py-3 flex items-center gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider">Available Points</span>
            <span className="text-blue-600 dark:text-blue-400 font-black text-2xl">{availablePoints}</span>
          </div>
        </div>

        <div className="mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-1">How points work</p>
            <h2 className="text-slate-900 dark:text-white font-black text-lg tracking-tight">Earn points, then turn them into study perks.</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-3xl">
              Earn points from quizzes, perfect scores, daily missions, and weekly league rewards. Spend points on study perks in the Shop.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 px-5 rounded-xl transition-all shadow-md uppercase tracking-widest shrink-0"
          >
            Earn Points
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          


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
                  const pointsNeeded = Math.max(0, perk.cost - availablePoints);
                  const invKey = inventoryKeyFor(perk.id);
                  const ownedCount = user?.[invKey] || 0;
                  const activationState = getActivationState(perk.id, ownedCount);

                  return (
                    <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-5 flex flex-col shadow-lg transition-transform hover:-translate-y-1 relative">
                      {ownedCount > 0 && (
                        <div className="absolute -top-3 -right-3 bg-green-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md border-2 border-white dark:border-slate-800 z-10">
                          Owned: {ownedCount}
                        </div>
                      )}
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">{perk.title}</h3>
                      <p className="text-slate-400 dark:text-slate-500 text-sm mb-1">{perk.detail}</p>
                      <p className="text-slate-600 dark:text-slate-300 text-sm font-bold mb-4">{perk.value}</p>

                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                          Owned {ownedCount}
                        </span>
                        {activationState.activeLabel && (
                          <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-700/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
                            {activationState.activeLabel}
                          </span>
                        )}
                        {!canAfford && (
                          <span className="rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-700/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                            Need {pointsNeeded} more points
                          </span>
                        )}
                      </div>
                      
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
                            {canAfford ? 'Buy' : 'Not enough'}
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleActivate(perk.id)}
                          disabled={!activationState.canActivate}
                          className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                            activationState.canActivate
                              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {activationState.canActivate ? 'Activate' : activationState.reason}
                        </button>
                        {!canAfford && (
                          <p className="text-xs text-amber-600 dark:text-amber-300 font-bold text-center">
                            Need {pointsNeeded} more points
                          </p>
                        )}
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
                    <span className="text-slate-500 font-bold text-sm text-center px-4">Reviewer Book</span>
                  </div>
                  <div className="flex flex-col flex-1 h-full">
                    <h3 className="text-slate-900 dark:text-white font-bold text-2xl mb-2">Reviewer Book Details</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 leading-relaxed">
                      Reviewer book details will be available here.
                    </p>
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





