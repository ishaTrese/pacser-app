import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../components/layout/Breadcrumb';
import { Zap, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SubjectQuiz() {
  const { quizSetId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserStats } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [quizSet, setQuizSet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [outOfEnergy, setOutOfEnergy] = useState(false);
  const [accessError, setAccessError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scoreRef = useRef(0);
  const submittingRef = useRef(false);
  const attemptIdRef = useRef(null);

  // Fallback info if we navigated directly without state
  const quizTitle = location.state?.title || `Quiz Set ${quizSetId}`;
  const resolvedSubjectId = String(location.state?.subjectId || 'numerical-ability');
  const hasTimer = Boolean(quizSet?.has_timer && quizSet?.difficulty === 'difficult');

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const submitQuiz = useCallback((finalScore = scoreRef.current) => {
    if (submittingRef.current || questions.length === 0) return;

    submittingRef.current = true;
    setSubmitting(true);

    api.post('/quiz/submit', {
      quiz_set_id: quizSetId,
      attempt_id: attemptIdRef.current,
      score: finalScore,
      total: questions.length
    }).then((res) => {
      if (user) {
        updateUserStats({
          xp: user.xp + res.data.xp_gained,
          points: user.points + res.data.points_gained
        });
      }
      navigate(`/quiz/${quizSetId}/results`, {
        state: {
          score: res.data.log.score,
          total: res.data.log.total,
          percentage: res.data.log.percentage,
          xp_gained: res.data.xp_gained,
          points_gained: res.data.points_gained,
          difficulty: res.data.difficulty,
          difficulty_multiplier: res.data.difficulty_multiplier,
          base_xp: res.data.base_xp,
          awarded_xp: res.data.awarded_xp,
          base_points: res.data.base_points,
          awarded_points: res.data.awarded_points,
          subjectId: resolvedSubjectId
        }
      });
    }).catch(err => {
      console.error("Error submitting quiz", err);
      navigate(`/quiz/${quizSetId}/results`, { state: { score: finalScore, total: questions.length, subjectId: resolvedSubjectId } });
    });
  }, [navigate, questions.length, quizSetId, resolvedSubjectId, updateUserStats, user]);

  useEffect(() => {
    api.post(`/quiz-sets/${quizSetId}/start`)
      .then(response => {
        attemptIdRef.current = response.data.attempt_id || null;
        setQuizSet(response.data.quiz_set);
        
        // Sync server-confirmed energy after starting or reusing an attempt.
        if (user && user.role !== 'admin' && typeof response.data.user_energy === 'number') {
          updateUserStats({
            energy: response.data.user_energy,
            max_energy: response.data.user_max_energy ?? user.max_energy
          });
        }

        // Map backend questions to frontend format
        const formattedQuestions = response.data.questions.map(q => ({
          id: q.id,
          question_text: q.question_text,
          options: q.answers.map(a => ({
            id: a.id.toString(), // ID instead of 'a', 'b', 'c'
            text: a.answer_text,
            is_correct: a.is_correct
          })),
          correct_answer: q.answers.find(a => a.is_correct)?.id.toString(),
          explanation: q.explanation
        }));

        setQuestions(formattedQuestions);
        if (response.data.quiz_set?.has_timer && response.data.quiz_set?.difficulty === 'difficult') {
          setTimeRemaining(response.data.quiz_set.time_limit_seconds || 0);
        }
      })
      .catch(error => {
        if (error.response?.status === 403) {
          const message = error.response?.data?.message || 'You cannot start this quiz right now.';
          setAccessError(message);
          setOutOfEnergy(message.toLowerCase().includes('energy'));
        } else {
          console.error("Error fetching questions:", error);
        }
      })
      .finally(() => setLoading(false));
  }, [quizSetId]);

  useEffect(() => {
    if (!hasTimer || loading || outOfEnergy || questions.length === 0 || submitting || timerExpired || timeRemaining === null) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return prev;

        if (prev <= 1) {
          clearInterval(interval);
          setTimerExpired(true);
          submitQuiz(scoreRef.current);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasTimer, loading, outOfEnergy, questions.length, submitQuiz, submitting, timerExpired, timeRemaining]);

  if (accessError) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={32} className="text-yellow-500 fill-current" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
              {outOfEnergy ? 'Out of Energy!' : 'Quiz Unavailable'}
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {accessError}
            </p>
            <div className="space-y-3">
              {outOfEnergy && (
                <button onClick={() => navigate('/shop')} className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all shadow-md">
                  Visit Shop
                </button>
              )}
              <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-blue-600 animate-pulse font-bold text-lg tracking-widest">Loading Quiz Data...</div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-slate-500 font-medium">No questions found for this quiz set.</div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionId) => {
    if (isSubmitted || timerExpired || submitting) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption || timerExpired || submitting) return;
    setIsSubmitted(true);
    
    if (selectedOption === currentQuestion.correct_answer) {
      setScore(prev => {
        const nextScore = prev + 1;
        scoreRef.current = nextScore;
        return nextScore;
      });
    }
  };

  const handleNext = () => {
    if (timerExpired || submitting) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      submitQuiz(scoreRef.current);
    }
  };

  // Letters for options A, B, C, D
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-12 transition-colors">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        <Breadcrumb items={[
          { label: 'Learn', path: '/learn' },
          { label: resolvedSubjectId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), path: `/learn/${resolvedSubjectId}` },
          { label: quizTitle }
        ]} />

        {/* Quiz Header with Energy */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {quizSet?.name || quizTitle}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2">
            {hasTimer && (
              <div className={`flex items-center gap-2 border px-4 py-2 rounded-full shadow-sm ${
                timeRemaining <= 60
                  ? 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-700/50'
                  : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-700/50'
              }`}>
                <Clock size={16} className={timeRemaining <= 60 ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} />
                <span className={`font-black text-sm tracking-wider ${timeRemaining <= 60 ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-700/50 px-4 py-2 rounded-full shadow-sm">
              <Zap size={16} className="text-yellow-500 dark:text-yellow-400 fill-current" />
              <span className="text-yellow-600 dark:text-yellow-200 font-black text-sm tracking-wider">
                {user ? `${user.energy} / ${user.max_energy}` : '-- / --'} Energy
              </span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2 font-bold tracking-tight">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-blue-600 dark:text-blue-400">Score: {score} XP</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card (Clean Light HCI) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed tracking-tight">
            {currentQuestion.question_text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = "w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50 ";
              let icon = null;
              
              if (!isSubmitted) {
                btnClass += selectedOption === option.id 
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-900 dark:text-blue-100" 
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700/50";
              } else {
                if (option.id === currentQuestion.correct_answer) {
                  btnClass += "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-100";
                  icon = <CheckCircle2 className="text-blue-500 ml-auto" size={20} />;
                } else if (selectedOption === option.id) {
                  btnClass += "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 text-yellow-900 dark:text-yellow-100";
                  icon = <XCircle className="text-yellow-500 ml-auto" size={20} />;
                } else {
                  btnClass += "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={isSubmitted || timerExpired || submitting}
                  className={btnClass}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black mr-4 text-sm ${
                    !isSubmitted && selectedOption === option.id ? 'bg-blue-600 text-white' : 
                    isSubmitted && option.id === currentQuestion.correct_answer ? 'bg-blue-500 text-white' :
                    isSubmitted && selectedOption === option.id ? 'bg-yellow-500 text-white' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {optionLetters[idx] || '?'}
                  </span>
                  <span className="font-semibold text-left">{option.text}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Instant Rationale Channel */}
          {isSubmitted && (
            <div className="mt-8 p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-black text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2 text-lg tracking-tight">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                Explanation
              </h3>
              <p className="text-blue-800 dark:text-blue-200 font-medium leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            {!isSubmitted ? (
              <button 
                onClick={handleSubmit}
                disabled={!selectedOption || timerExpired || submitting}
                className={`px-8 py-3.5 rounded-xl font-bold transition-all text-sm shadow-sm ${
                  selectedOption && !timerExpired && !submitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {timerExpired ? 'Time Expired' : 'Submit Answer'}
              </button>
            ) : (
              <button 
                onClick={handleNext}
                disabled={timerExpired || submitting}
                className="px-8 py-3.5 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md text-sm transition-colors flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
