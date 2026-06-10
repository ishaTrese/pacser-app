import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';

export default function QuizResults() {
  const { quizSetId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const score = location.state?.score || 0;
  const total = location.state?.total || 0;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const difficulty = location.state?.difficulty || 'average';
  const difficultyMultiplier = Number(location.state?.difficulty_multiplier || 1);
  const difficultyLabel = difficulty.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const difficultyBonusLabel = difficultyMultiplier > 1
    ? `Challenge Reward +${Math.round((difficultyMultiplier - 1) * 100)}%`
    : difficultyMultiplier < 1
      ? `Practice Reward -${Math.round((1 - difficultyMultiplier) * 100)}%`
      : 'Standard Reward';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-12 transition-colors">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Learn', path: '/learn' },
          { label: 'Results' }
        ]} />

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 md:p-12 text-center shadow-sm mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-2 bg-blue-600 dark:bg-blue-500" />
          
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Quiz Complete!</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 capitalize">Set: {quizSetId?.replace(/-/g, ' ')}</p>

          <div className="relative w-48 h-48 mx-auto mb-10">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
              <circle
                className="text-slate-100 dark:text-slate-700 stroke-current"
                strokeWidth="8"
                cx="50" cy="50" r="40" fill="transparent"
              ></circle>
              <circle
                className={`${percentage >= 75 ? 'text-blue-500 dark:text-blue-400' : percentage >= 50 ? 'text-yellow-500 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-500'} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeLinecap="round"
                cx="50" cy="50" r="40" fill="transparent"
                strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{percentage}%</span>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1">{score} / {total} Correct</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-xl px-5 py-3 text-center">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Earned XP</p>
              <p className="text-blue-600 dark:text-blue-400 font-black text-xl">+{location.state?.awarded_xp ?? location.state?.xp_gained ?? 0}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-700/50 rounded-xl px-5 py-3 text-center">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Earned Points</p>
              <p className="text-yellow-600 dark:text-yellow-400 font-black text-xl">+{location.state?.awarded_points ?? location.state?.points_gained ?? 0}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-4 mb-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Difficulty</p>
                <p className="text-slate-900 dark:text-white font-black">{difficultyLabel}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-black text-blue-600 dark:text-blue-400">
                {difficultyBonusLabel}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Base XP</p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{location.state?.base_xp ?? '--'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Base Points</p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{location.state?.base_points ?? '--'}</p>
              </div>
            </div>
          </div>

          <p className="text-lg text-slate-700 dark:text-slate-300 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            {percentage >= 75 ? "Excellent work! You have a strong grasp of this material." 
             : percentage >= 50 ? "Good effort, but there is room for improvement." 
             : "Keep practicing! Review the explanations to strengthen your understanding."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/learn')}
              className="px-6 py-3.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Back to Subjects
            </button>
            <button 
              onClick={() => navigate(`/quiz/${quizSetId}`, { state: { subjectId: location.state?.subjectId } })}
              className="px-8 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all"
            >
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




