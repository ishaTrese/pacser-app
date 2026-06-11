import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ChevronLeft, Target, AlertCircle, CheckCircle2, Clock, Grid3x3, X } from 'lucide-react';

export default function MockExam() {
  const { user, updateUserStats } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get level from URL
  const queryParams = new URLSearchParams(location.search);
  const level = queryParams.get('level') || 'professional';

  // Constants
  const isProfessional = level === 'professional';
  const levelLabel = isProfessional ? 'Professional' : 'Sub-Professional';
  const totalItems = isProfessional ? 170 : 165;
  const passingScore = isProfessional ? 136 : 132;
  const initialTime = isProfessional ? (3 * 60 * 60) + (10 * 60) : (2 * 60 * 60) + (40 * 60);
  const timeLimitLabel = isProfessional ? '3 hours and 10 minutes' : '2 hours and 40 minutes';

  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [showGrid, setShowGrid] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const justCompleted = useRef(false);
  const timerRef = useRef(null);
  const protectionActiveRef = useRef(false);
  const allowNavigationRef = useRef(false);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    protectionActiveRef.current = started && !finished && !submitting;

    if (protectionActiveRef.current) {
      allowNavigationRef.current = false;
    }
  }, [started, finished, submitting]);

  useEffect(() => {
    if (!started || finished || submitting) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [started, finished, submitting]);

  useEffect(() => {
    const handlePopState = () => {
      if (!protectionActiveRef.current || allowNavigationRef.current) return;

      window.history.pushState({ mockExamProtection: true }, '', window.location.href);
      setShowQuitConfirm(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    setStarted(false);
    setLoading(false);
    setLoadError('');
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(initialTime);
  }, [level, initialTime]);

  const handleStartExam = async () => {
    if (loading || started) return;

    setLoading(true);
    setLoadError('');

    try {
      const res = await api.get(`/mock-exam/questions?level=${level}`);
      const loadedQuestions = res.data.questions || [];

      if (loadedQuestions.length === 0) {
        throw new Error('No mock exam questions are available for this level yet.');
      }

      setQuestions(loadedQuestions);
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeft(initialTime);
      window.history.pushState({ mockExamProtection: true }, '', window.location.href);
      setStarted(true);
      startTimer();
    } catch (err) {
      console.error("Failed to load mock exam", err);
      setLoadError(err.response?.data?.message || err.message || 'Failed to load mock exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAutoSubmit = () => {
    finishTest();
  };

  const handleSelect = (questionId, answerId, isCorrect, subjectSlug, subjectId) => {
    setAnswers({
      ...answers,
      [questionId]: { answerId, isCorrect, subjectSlug, subjectId }
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleQuit = () => {
    allowNavigationRef.current = true;
    protectionActiveRef.current = false;
    clearInterval(timerRef.current);
    setShowQuitConfirm(false);
    setStarted(false);
    navigate('/dashboard');
  };

  const finishTest = async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    setShowSubmitConfirm(false);

    // Group scores by subject
    const scores = {};
    let totalScore = 0;
    Object.values(answers).forEach(ans => {
      if (!scores[ans.subjectSlug]) {
        scores[ans.subjectSlug] = { score: 0, total: 0, subject_id: ans.subjectId };
      }
      scores[ans.subjectSlug].total += 1;
      if (ans.isCorrect) {
        scores[ans.subjectSlug].score += 1;
        totalScore += 1;
      }
    });

    // Ensure all subjects are represented with the actual allocation returned by the API.
    const subjectTotals = {};
    questions.forEach(q => {
      if (!subjectTotals[q.subject_slug]) {
        subjectTotals[q.subject_slug] = {
          total: 0,
          subject_id: q.subject_id
        };
      }
      subjectTotals[q.subject_slug].total += 1;
    });

    Object.entries(subjectTotals).forEach(([slug, data]) => {
      if (!scores[slug]) {
        scores[slug] = { score: 0, total: data.total, subject_id: data.subject_id };
      } else {
        scores[slug].total = data.total;
      }
    });

    try {
      const res = await api.post('/mock-exam/submit', {
        total_score: totalScore,
        subject_scores: scores,
        level: level,
        total_items: totalItems
      });

      if (res.data.result) {
        updateUserStats({ ...user, mock_exam_completed: true });
      }
      setResults({
        totalScore,
        subjectScores: scores,
        pretestScores: res.data.pretest_scores
      });
      justCompleted.current = true;
      allowNavigationRef.current = true;
      protectionActiveRef.current = false;
      setFinished(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit mock exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (finished && results) {
    const isPassed = results.totalScore >= passingScore;
    const percentage = ((results.totalScore / totalItems) * 100).toFixed(1);

    // Map pretest scores by subject_id
    const pretestMap = {};
    if (results.pretestScores) {
      results.pretestScores.forEach(p => {
        pretestMap[p.subject_id] = p.score;
      });
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-8 sm:p-6 sm:py-12 font-sans">
        <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 max-w-3xl w-full border border-slate-200">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isPassed ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Mock Exam Results</h1>
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 inline-block">
              <p className="text-4xl font-black text-slate-800 mb-1">{results.totalScore} <span className="text-xl text-slate-400">/ {totalItems}</span></p>
              <p className={`font-bold uppercase tracking-widest text-sm ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
                {isPassed ? 'PASSED (≥80%)' : 'FAILED (<80%)'} • {percentage}%
              </p>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 mb-4 text-lg">Per-Subject Breakdown & Baseline Comparison</h3>
          <div className="space-y-4 mb-8">
            {Object.entries(results.subjectScores).map(([slug, data]) => {
              const subPercentage = ((data.score / data.total) * 100).toFixed(1);
              const pretestScore = pretestMap[data.subject_id];
              let improvement = null;

              if (pretestScore !== undefined) {
                // Pretest was out of 10. We need to normalize to percentage to compare.
                const pretestPercentage = (pretestScore / 10) * 100;
                const diff = (subPercentage - pretestPercentage).toFixed(1);
                improvement = diff > 0 ? `+${diff}%` : `${diff}%`;
              }

              return (
                <div key={slug} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
                    <span className="font-bold text-slate-800 capitalize">{slug.replace(/-/g, ' ')}</span>
                    <span className="font-black text-blue-600">{data.score} / {data.total} <span className="text-slate-400 text-sm font-medium">({subPercentage}%)</span></span>
                  </div>

                  {pretestScore !== undefined && (
                    <div className="text-sm font-medium flex flex-col min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between gap-1 bg-slate-50 p-2 rounded-lg mt-2">
                      <span className="text-slate-500">Diagnostic Baseline: {pretestScore}/10</span>
                      <span className={`font-bold ${parseFloat(improvement) > 0 ? 'text-green-500' : parseFloat(improvement) < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {parseFloat(improvement) > 0 ? '↗' : parseFloat(improvement) < 0 ? '↘' : '→'} {improvement}
                      </span>
                    </div>
                  )}
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

  if (!started) {
    const attemptRule = user?.is_premium
      ? 'Premium users have unlimited mock exam attempts.'
      : user?.mock_exam_completed
        ? 'You have used your free mock exam attempt. Upgrade to Premium for unlimited retakes.'
        : 'You have 1 free mock exam attempt.';
    const startLabel = user?.is_premium && user?.mock_exam_completed ? 'Start Retake' : 'Start Mock Exam';

    return (
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-3xl w-full p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-8">
            <div>
              <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-2">{levelLabel} Level</p>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Full-Length Mock Exam</h1>
              <p className="text-slate-500 font-medium mt-2 max-w-xl">
                Review the rules before you begin. Your timer starts only after the questions are loaded.
              </p>
            </div>
            <div className="bg-blue-50 text-blue-700 rounded-2xl px-4 py-3 border border-blue-100 font-black text-sm uppercase tracking-widest shrink-0">
              {user?.is_premium ? 'Premium' : 'Free'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Items</p>
              <p className="text-slate-900 font-black text-xl">{totalItems}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Time Limit</p>
              <p className="text-slate-900 font-black text-xl">{timeLimitLabel}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Passing</p>
              <p className="text-slate-900 font-black text-xl">80%</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
            <h2 className="text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
              <Target size={20} className="text-blue-600" />
              Attempt Rules
            </h2>
            <p className="text-slate-600 font-medium text-sm leading-relaxed">{attemptRule}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
            <h2 className="text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Instructions
            </h2>
            <ul className="text-slate-600 text-sm font-medium space-y-2">
              <li>Answer each item carefully before submitting.</li>
              <li>The timer begins after you click Start and questions load successfully.</li>
              <li>Unanswered items are counted as incorrect when you submit.</li>
            </ul>
          </div>

          {loadError && (
            <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 mb-6 text-sm font-bold">
              {loadError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartExam}
              disabled={loading}
              className="flex-1 py-4 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              {loading ? 'Loading Questions...' : startLabel}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              className="flex-1 py-4 rounded-xl font-black bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-60 uppercase tracking-widest text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;
  const hasAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-20 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button onClick={() => setShowQuitConfirm(true)} className="text-slate-400 hover:text-red-500 transition-colors font-bold text-sm uppercase tracking-wider flex items-center gap-1">
            <X size={18} /> Quit
          </button>
          <span className="hidden sm:inline bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-widest">
            {isProfessional ? 'Professional' : 'Sub-Professional'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-xl font-mono text-base sm:text-lg font-bold shadow-inner shrink-0">
          <Clock size={18} className="text-blue-400" />
          {formatTime(timeLeft)}
        </div>

        <button onClick={() => setShowGrid(true)} className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-sm bg-slate-100 px-3 sm:px-4 py-2 rounded-lg transition-colors shrink-0">
          <Grid3x3 size={18} />
          <span className="hidden sm:inline">Grid</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-3 sm:p-6 pb-24">

        <div className="flex items-center justify-between mb-4">
          <span className="font-black text-slate-800 text-lg">Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-200 px-3 py-1 rounded-full">
            {currentQuestion.subject_name}
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 md:p-10 mb-6 sm:mb-8 flex-1 flex flex-col">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed mb-6 sm:mb-8">
            {currentQuestion.question_text}
          </h2>

          <div className="space-y-3 mt-auto">
            {currentQuestion.answers.map(ans => (
              <button
                key={ans.id}
                onClick={() => handleSelect(currentQuestion.id, ans.id, ans.is_correct, currentQuestion.subject_slug, currentQuestion.subject_id)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all font-medium text-base sm:text-lg flex items-start sm:items-center gap-3 sm:gap-4 break-words ${
                  answers[currentQuestion.id]?.answerId === ans.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  answers[currentQuestion.id]?.answerId === ans.id ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {answers[currentQuestion.id]?.answerId === ans.id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                </div>
                {ans.answer_text}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <ChevronLeft size={20} /> Prev
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex-1 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Grid Modal */}
      {showGrid && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">Question Grid</h3>
              <button onClick={() => setShowGrid(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowGrid(false);
                      }}
                      className={`h-12 rounded-lg font-bold text-sm border-2 transition-all flex items-center justify-center
                        ${isCurrent ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                        ${isAnswered
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                        }
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between text-sm font-bold">
              <span className="text-blue-600">{Object.keys(answers).length} Answered</span>
              <span className="text-slate-500">{questions.length - Object.keys(answers).length} Unanswered</span>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirm Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Quit Exam?</h3>
            <p className="text-slate-500 mb-6 font-medium">Are you sure you want to quit? This will forfeit your attempt and your progress will not be saved.</p>
            <div className="flex flex-col min-[360px]:flex-row gap-3">
              <button onClick={() => setShowQuitConfirm(false)} className="flex-1 py-3 font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleQuit} className="flex-1 py-3 font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors">
                Yes, Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirm Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Submit Exam?</h3>
            <p className="text-slate-500 mb-6 font-medium">
              You have answered {Object.keys(answers).length} out of {questions.length} questions. Are you sure you want to submit?
            </p>
            <div className="flex flex-col min-[360px]:flex-row gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-3 font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors">
                Review
              </button>
              <button onClick={finishTest} disabled={submitting} className="flex-1 py-3 font-bold bg-green-600 text-white hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
