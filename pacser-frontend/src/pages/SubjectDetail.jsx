import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';
import { PlayCircle, Clock, CheckCircle, Lock, BookOpen } from 'lucide-react';
import api from '../api/axios';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        <Breadcrumb items={[
          { label: 'Learn', path: '/learn' },
          { label: subjectId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
        ]} />

        {/* Header */}
        <div className="mb-8 mt-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize mb-2">{subjectId.replace(/-/g, ' ')}</h1>
          <p className="text-slate-500 font-medium">
            Complete all practice sets to achieve mastery in this subject.
          </p>
        </div>

        {/* Quiz Sets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4 px-1 tracking-tight">Available Quiz Sets</h2>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <p className="text-blue-600 font-bold animate-pulse">Loading Quiz Sets...</p>
            </div>
          ) : quizSets.length === 0 ? (
            <div className="flex justify-center p-8 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500 font-medium">No quiz sets available for this subject yet.</p>
            </div>
          ) : (
            quizSets.map((set) => (
              <div 
                key={set.id}
                className={`bg-white border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 shadow-sm ${
                  set.status === 'locked' ? 'border-slate-200 opacity-75 bg-slate-50' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center shadow-sm ${
                    set.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                    set.status === 'locked' ? 'bg-slate-200 text-slate-500' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {set.status === 'completed' ? <CheckCircle size={24} /> :
                     set.status === 'locked' ? <Lock size={24} /> :
                     <PlayCircle size={24} />}
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-lg tracking-tight ${set.status === 'locked' ? 'text-slate-500' : 'text-slate-900'}`}>
                      {set.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1 font-medium">
                      <span className="flex items-center gap-1"><BookOpen size={14} /> {set.questions} Questions</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {set.time}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end">
                  {set.status === 'completed' ? (
                    <div className="text-right">
                      <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Score</span>
                      <span className="font-extrabold text-blue-600 text-lg">{set.score}</span>
                    </div>
                  ) : set.status === 'locked' ? (
                    <button disabled className="px-6 py-2.5 rounded-lg font-bold bg-slate-200 text-slate-500 text-sm cursor-not-allowed">
                      Locked
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/quiz/${set.id}`, { state: { title: set.title, subjectId: subjectId } })}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
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
