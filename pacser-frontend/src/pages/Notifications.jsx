import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axios';
import { Bell, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-6 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bell className="text-blue-600 dark:text-blue-400" size={28} />
            Notifications
          </h1>
          <button
            onClick={markAllAsRead}
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-slate-500">You have no notifications.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-5 rounded-xl border flex items-start gap-4 transition-colors ${
                  notif.is_read
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-75'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 shadow-sm'
                }`}
              >
                <div className={`mt-1 rounded-full p-2 ${notif.is_read ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'}`}>
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm md:text-base ${notif.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white font-semibold'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
