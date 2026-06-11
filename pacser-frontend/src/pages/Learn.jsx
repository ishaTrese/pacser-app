import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { ChevronRight, Compass, Zap } from 'lucide-react';
import CategoryBadge from '../components/ui/CategoryBadge';
import { useAuth } from '../context/AuthContext';
import { getSubjectsForClass } from '../config/examSubjects';

export default function Learn() {
  const navigate = useNavigate();
  const { user, userClass } = useAuth();
  const subjects = userClass ? getSubjectsForClass(userClass) : [];

  if (!userClass) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-8 mt-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Choose Your Reviewer Category
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              PACSER has separate reviewer paths for Professional and Sub-Professional exam takers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-700/50">
                  <Compass size={28} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Category Required</p>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select Professional or Sub-Professional first</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2 max-w-2xl">
                    Your category controls which subjects, quiz sets, pretest questions, and mock exam layout PACSER shows.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/select-class')}
                className="w-full md:w-auto px-5 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shrink-0"
              >
                Select Category
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                <h3 className="font-black text-slate-900 dark:text-white mb-2">Professional</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Numerical, Analytical, Verbal, and General Information reviewers.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                <h3 className="font-black text-slate-900 dark:text-white mb-2">Sub-Professional</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Numerical, Clerical, Verbal, and General Information reviewers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 mt-2 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center flex-wrap">
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
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
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

                <div className="mt-5 grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Progress</p>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">Ready</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Mastery</p>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">--</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                  <span>View Quiz Sets</span>
                  <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}




