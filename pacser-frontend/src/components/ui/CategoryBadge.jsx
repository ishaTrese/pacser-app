import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function CategoryBadge() {
  const { userClass } = useAuth();
  if (!userClass) return null;

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-black uppercase tracking-widest align-middle ml-3 mb-1 shadow-sm border border-blue-200 dark:border-blue-700/50">
      {userClass}
    </span>
  );
}
