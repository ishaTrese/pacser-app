import React, { useState } from 'react';
import { Settings, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminGodMode() {
  const { user, updateUserStats } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    energy: user?.energy || 0,
    points: user?.points || 0,
    xp: user?.xp || 0,
    streak: user?.streak || 0,
  });

  // Only render if user is admin
  if (!user || user.role !== 'admin') return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const handleApply = async () => {
    try {
      const res = await api.post('/admin/god-mode', form);
      if (res.data.user) {
        updateUserStats(res.data.user);
      }
      alert('God Mode applied!');
    } catch (err) {
      alert('Failed to apply stats');
      console.error(err);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-transform hover:scale-110 z-50 border-2 border-slate-700 flex items-center justify-center group"
        title="Admin God Mode"
      >
        <Settings size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden z-50 text-white font-sans animate-in slide-in-from-bottom-5">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <h3 className="font-black text-blue-400 flex items-center gap-2">
          <Settings size={18} /> GOD MODE
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-5 space-y-4">
        {[
          { label: 'Energy', name: 'energy', max: 5 },
          { label: 'Points', name: 'points' },
          { label: 'XP', name: 'xp' },
          { label: 'Streak', name: 'streak' },
        ].map(field => (
          <div key={field.name} className="flex items-center justify-between gap-4">
            <label className="text-sm font-bold text-slate-300 w-16">{field.label}</label>
            <input 
              type="number" 
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}

        <button 
          onClick={handleApply}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          Apply Changes <ChevronRight size={18} />
        </button>

        <button 
          onClick={async () => {
            try {
              const res = await api.post('/admin/god-mode', { remove_double_xp: true });
              if (res.data.user) updateUserStats(res.data.user);
              alert('Double XP Perk Removed!');
            } catch (err) {
              alert('Failed to remove perk');
            }
          }}
          className="w-full mt-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 font-bold py-2 rounded-lg transition-colors text-sm"
        >
          Remove Active Double XP
        </button>

        <button 
          onClick={async () => {
            try {
              const res = await api.post('/admin/god-mode', { remove_streak_freeze: true });
              if (res.data.user) updateUserStats(res.data.user);
              alert('Streak Freeze Perk Removed!');
            } catch (err) {
              alert('Failed to remove perk');
            }
          }}
          className="w-full mt-2 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 font-bold py-2 rounded-lg transition-colors text-sm"
        >
          Remove Streak Freeze
        </button>
      </div>
    </div>
  );
}
