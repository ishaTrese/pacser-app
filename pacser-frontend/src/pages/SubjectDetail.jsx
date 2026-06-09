import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';
import { PlayCircle, Clock, CheckCircle, Lock, BookOpen, Zap } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/ui/CategoryBadge';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quizSets, setQuizSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/subjects/${subjectId}/quiz-sets`)
      .then(response => {
        setQuizSets(response.data.quiz_sets);
      })
      .catch(error => {
        console.error("Error fetching quiz sets", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <Breadcrumb items={[
          { label: 'Learn', path: '/learn' },
          { label: subjectId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
        ]} />

        {/* Header */}
        <div className="mb-8 mt-2 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight capitalize mb-2 flex items-center flex-wrap">
              {subjectId.replace(/-/g, ' ')}
              <CategoryBadge />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Complete all practice sets to achieve mastery in this subject.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-700/50 px-4 py-2 rounded-full shadow-sm shrink-0">
            <Zap size={16} className="text-yellow-500 dark:text-yellow-400 fill-current" />
            <span className="text-yellow-600 dark:text-yellow-200 font-black text-sm tracking-wider">
              {user ? `${user.energy} / ${user.max_energy}` : '-- / --'} Energy
            </span>
          </div>
        </div>

        {/* Quiz Sets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-1 tracking-tight">Available Quiz Sets</h2>

          {loading ? (
            <div className="flex justify-center p-8">
              <p className="text-blue-600 dark:text-blue-400 font-bold animate-pulse">Loading Quiz Sets...</p>
            </div>
          ) : quizSets.length === 0 ? (
            <div className="flex justify-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No quiz sets available for this subject yet.</p>
            </div>
          ) : (
            quizSets.map((set) => (
              <div
                key={set.id}
                className={`bg-white dark:bg-slate-800 border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 shadow-sm ${
                  set.status === 'locked' ? 'border-slate-200 dark:border-slate-700/50 opacity-75 bg-slate-50 dark:bg-slate-800/50' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center shadow-sm ${
                    set.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    set.status === 'locked' ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {set.status === 'completed' ? <CheckCircle size={24} /> :
                     set.status === 'locked' ? <Lock size={24} /> :
                     <PlayCircle size={24} />}
                  </div>

                  <div>
                    <h3 className={`font-bold text-lg tracking-tight ${set.status === 'locked' ? 'text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {set.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1"><BookOpen size={14} /> {set.questions} Questions</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {set.time}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end">
                  {set.status === 'completed' ? (
                    <div className="text-right">
                      <span className="block text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">{set.score}</span>
                    </div>
                  ) : set.status === 'locked' ? (
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 text-sm transition-colors"
                      title="Requires Premium Access"
                    >
                      Locked (Premium)
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/quiz/${set.id}`, { state: { title: set.title, subjectId: subjectId } })}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors shadow-sm shadow-blue-600/20"
                    >
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
