import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getExamLevelKey } from '../config/examSubjects';

export default function PreTest() {
  const { user, updateUserStats, userClass } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const justCompleted = React.useRef(false);

  useEffect(() => {
    // If user already finished pretest and didn't just finish it now, kick them out
    if (user?.pretest_completed && !justCompleted.current) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!justCompleted.current) {
      api.get(`/pretest/questions?level=${getExamLevelKey(userClass)}`)
        .then(res => {
          setQuestions(res.data.questions);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load pretest", err);
        });
    }
  }, [user, navigate, userClass]);

  const handleSelect = (questionId, answerId, isCorrect, subjectSlug, subjectId) => {
    setAnswers({
      ...answers,
      [questionId]: { answerId, isCorrect, subjectSlug, subjectId }
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setSubmitting(true);
    
    // Group scores by subject
    const scores = {};
    Object.values(answers).forEach(ans => {
      if (!scores[ans.subjectSlug]) {
        scores[ans.subjectSlug] = { score: 0, total: 0, subject_id: ans.subjectId };
      }
      scores[ans.subjectSlug].total += 1;
      if (ans.isCorrect) {
        scores[ans.subjectSlug].score += 1;
      }
    });

    // Ensure all selected exam subjects are in the payload even if score is 0
    questions.forEach(q => {
      if (!scores[q.subject_slug]) {
        scores[q.subject_slug] = { score: 0, total: 10, subject_id: q.subject_id };
      }
    });

    try {
      const res = await api.post('/pretest/submit', { scores });
      if (res.data.user) {
        updateUserStats(res.data.user);
      }
      setResults(scores);
      justCompleted.current = true;
      setFinished(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit pretest');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading your diagnostic exam...</div>;
  }

  if (finished && results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Baseline Established</h1>
            <p className="text-slate-500 mt-2">Here is how you performed across your exam subjects. Don't worry if your scores are low—this is just the beginning of your journey!</p>
          </div>

          <div className="space-y-4 mb-8">
            {Object.entries(results).map(([slug, data]) => {
              const percentage = (data.score / 10) * 100; // Hardcoded out of 10 for display
              return (
                <div key={slug} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                  <span className="font-bold text-slate-800 capitalize">{slug.replace(/-/g, ' ')}</span>
                  <div className="flex items-center gap-4">
                    <span className={`font-black ${percentage >= 75 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {data.score} / 10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
          >
            Enter Dashboard <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }



  const currentQuestion = questions[currentIndex];
  const hasAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Progress Bar Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
          <span className="font-black text-slate-800 shrink-0">Q {currentIndex + 1}/{questions.length}</span>
          <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-slate-100 px-3 py-1 rounded-full">
            {currentQuestion.subject_name}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 mb-8 flex-1 flex flex-col">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed mb-8">
            {currentQuestion.question_text}
          </h2>

          <div className="space-y-3 mt-auto">
            {currentQuestion.answers.map(ans => (
              <button
                key={ans.id}
                onClick={() => handleSelect(currentQuestion.id, ans.id, ans.is_correct, currentQuestion.subject_slug, currentQuestion.subject_id)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium text-lg flex items-center gap-4 ${
                  answers[currentQuestion.id]?.answerId === ans.id && hasAnswered 
                    ? 'border-blue-600 bg-blue-50 text-blue-900' 
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  answers[currentQuestion.id]?.answerId === ans.id && hasAnswered ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {answers[currentQuestion.id]?.answerId === ans.id && hasAnswered && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                </div>
                {ans.answer_text}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleNext}
          disabled={!hasAnswered || submitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-sm ${
            hasAnswered && !submitting ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Submitting...' : currentIndex === questions.length - 1 ? 'Finish Pre-test' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
