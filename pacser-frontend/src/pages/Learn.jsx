import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Zap } from 'lucide-react';
import CategoryBadge from '../components/ui/CategoryBadge';
import { useAuth } from '../context/AuthContext';
import { getSubjectsForClass } from '../config/examSubjects';

export default function Learn() {
  const navigate = useNavigate();
  const { user, userClass } = useAuth();
  const subjects = getSubjectsForClass(userClass);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 mt-2 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center flex-wrap">
              Select a Subject
              <CategoryBadge />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              Choose a domain to start practicing. All questions are modeled after the actual Civil Service Examination format.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-700/50 px-4 py-2 rounded-full shadow-sm shrink-0">
            <Zap size={16} className="text-yellow-500 dark:text-yellow-400 fill-current" />
            <span className="text-yellow-600 dark:text-yellow-200 font-black text-sm tracking-wider">
              {user ? `${user.energy} / ${user.max_energy}` : '-- / --'} Energy
            </span>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const darkColor = subject.color.replace('50', '900/30');
            const darkBorderColor = subject.borderColor.replace('100', '700/50').replace('200', '700/50');
            const Icon = subject.icon;
            
            return (
              <div 
                key={subject.id}
                onClick={() => navigate(`/learn/${subject.id}`)}
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                <div className={`w-16 h-16 rounded-2xl ${subject.color} dark:${darkColor} ${subject.borderColor} dark:${darkBorderColor} border flex items-center justify-center mb-6 shadow-sm`}>
                  <Icon size={32} className={subject.iconClass} />
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {subject.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-grow">
                  {subject.description}
                </p>
                
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                  <span>View Quiz Sets</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}




