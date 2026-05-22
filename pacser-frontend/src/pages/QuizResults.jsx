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

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Learn', path: '/learn' },
          { label: 'Results' }
        ]} />

        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center shadow-sm mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-2 bg-blue-600" />
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Quiz Complete!</h1>
          <p className="text-slate-500 font-medium mb-10 capitalize">Set: {quizSetId?.replace(/-/g, ' ')}</p>

          <div className="relative w-48 h-48 mx-auto mb-10">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
              <circle
                className="text-slate-100 stroke-current"
                strokeWidth="8"
                cx="50" cy="50" r="40" fill="transparent"
              ></circle>
              <circle
                className={`${percentage >= 75 ? 'text-blue-500' : percentage >= 50 ? 'text-yellow-500' : 'text-blue-600'} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeLinecap="round"
                cx="50" cy="50" r="40" fill="transparent"
                strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{percentage}%</span>
              <span className="text-sm font-bold text-slate-400 mt-1">{score} / {total} XP</span>
            </div>
          </div>

          <p className="text-lg text-slate-700 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            {percentage >= 75 ? "Excellent work! You have a strong grasp of this material." 
             : percentage >= 50 ? "Good effort, but there is room for improvement." 
             : "Keep practicing! Review the explanations to strengthen your understanding."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/learn')}
              className="px-6 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Back to Subjects
            </button>
            <button 
              onClick={() => navigate(`/quiz/${quizSetId}`)}
              className="px-8 py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
            >
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




