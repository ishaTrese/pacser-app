import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight,
  ChevronLeft,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  Grid3x3,
  X,
  FileText,
  Loader2,
  Check,
  ClipboardList,
  ListChecks,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from 'lucide-react';

const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

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
  const [timerAnnouncement, setTimerAnnouncement] = useState('');

  const justCompleted = useRef(false);
  const timerRef = useRef(null);
  const protectionActiveRef = useRef(false);
  const allowNavigationRef = useRef(false);
  const announcedMilestonesRef = useRef(new Set());
  const quitCancelRef = useRef(null);
  const submitReviewRef = useRef(null);
  const gridCloseRef = useRef(null);

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
    announcedMilestonesRef.current = new Set();
    setTimerAnnouncement('');
  }, [level, initialTime]);

  useEffect(() => {
    if (!started || finished) return;

    const milestones = [
      { seconds: 600, message: '10 minutes remaining' },
      { seconds: 300, message: '5 minutes remaining' },
      { seconds: 60, message: '1 minute remaining' },
    ];

    for (const { seconds, message } of milestones) {
      if (timeLeft === seconds && !announcedMilestonesRef.current.has(seconds)) {
        announcedMilestonesRef.current.add(seconds);
        setTimerAnnouncement(message);
        break;
      }
    }
  }, [timeLeft, started, finished]);

  useEffect(() => {
    if (showQuitConfirm) quitCancelRef.current?.focus();
  }, [showQuitConfirm]);

  useEffect(() => {
    if (showSubmitConfirm) submitReviewRef.current?.focus();
  }, [showSubmitConfirm]);

  useEffect(() => {
    if (showGrid) gridCloseRef.current?.focus();
  }, [showGrid]);

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
      announcedMilestonesRef.current = new Set();
      setTimerAnnouncement('');
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

  const formatSubjectName = (slug) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Presentation-only theme tokens (level-based visual styling)
  const th = isProfessional
    ? {
        page: 'bg-slate-900',
        card: 'bg-slate-800 border-slate-700 shadow-xl shadow-black/30',
        cardInset: 'bg-slate-900/70 border-slate-700',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        textFaint: 'text-slate-500',
        accent: 'text-blue-400',
        accentStrong: 'text-indigo-300',
        accentBg: 'bg-blue-500',
        accentBgHover: 'hover:bg-blue-400',
        progressTrack: 'bg-slate-700',
        progressFill: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        header: 'bg-slate-800/95 border-slate-700',
        headerBtn: 'text-slate-400 hover:text-red-400',
        gridBtn: 'text-slate-200 hover:text-blue-300 bg-slate-700 hover:bg-slate-600',
        subjectPill: 'text-slate-300 bg-slate-700',
        questionCard: 'bg-slate-800 border-slate-700 shadow-lg shadow-black/20',
        itemLabel: 'text-indigo-400',
        answerDefault: 'border-slate-600 bg-slate-900/50 text-slate-200 hover:border-blue-500/60 hover:bg-slate-700/80',
        answerSelected: 'border-blue-500 bg-blue-950/60 text-blue-50 ring-1 ring-blue-500/80',
        answerLetterDefault: 'border-slate-500 text-slate-400 bg-slate-800',
        answerLetterSelected: 'border-blue-500 bg-blue-500 text-white',
        bottomNav: 'bg-slate-800 border-slate-700 shadow-[0_-4px_24px_rgba(0,0,0,0.35)]',
        prevBtn: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
        secondaryBtn: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
        modal: 'bg-slate-800 border border-slate-700',
        modalHeader: 'bg-slate-900/80 border-slate-700',
        modalClose: 'hover:bg-slate-700 text-slate-400',
        overlay: 'bg-black/60',
        gridPanel: 'bg-slate-800',
        gridUnanswered: 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500',
        gridRingOffset: 'ring-offset-slate-800',
        scoreRingTrack: '#334155',
        scoreRingInner: 'bg-slate-800',
        scoreRingText: 'text-white',
        primaryBtn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-900/40',
        startHero: 'bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-950/50 border-indigo-500/30 ring-1 ring-indigo-500/20',
        startIcon: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/50',
        startBadge: 'bg-indigo-950/80 text-indigo-200 border-indigo-500/40',
        statIcon: 'text-indigo-400',
        checklist: 'bg-slate-900/60 border-slate-700',
        checklistTitle: 'text-white',
        checklistText: 'text-slate-300',
        levelEyebrow: 'text-indigo-400',
        premiumBadge: 'bg-indigo-950/60 text-indigo-200 border-indigo-500/40',
        errorBox: 'bg-red-950/50 text-red-300 border-red-800/50',
        submitOverlayCard: 'bg-slate-800 border-slate-700',
        submitOverlayText: 'text-white',
        submitOverlaySub: 'text-slate-400',
        loaderColor: 'text-blue-400',
      }
    : {
        page: 'bg-slate-50',
        card: 'bg-white border-slate-200 shadow-xl',
        cardInset: 'bg-slate-50 border-slate-100',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
        textFaint: 'text-slate-400',
        accent: 'text-blue-600',
        accentStrong: 'text-blue-600',
        accentBg: 'bg-blue-600',
        accentBgHover: 'hover:bg-blue-700',
        progressTrack: 'bg-slate-200',
        progressFill: 'bg-blue-600',
        header: 'bg-white border-slate-200',
        headerBtn: 'text-slate-400 hover:text-red-500',
        gridBtn: 'text-slate-700 hover:text-blue-600 bg-slate-100',
        subjectPill: 'text-slate-500 bg-slate-200',
        questionCard: 'bg-white border-slate-200 shadow-sm',
        itemLabel: 'text-blue-600',
        answerDefault: 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50',
        answerSelected: 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600',
        answerLetterDefault: 'border-slate-300 text-slate-500 bg-white',
        answerLetterSelected: 'border-blue-600 bg-blue-600 text-white',
        bottomNav: 'bg-white border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]',
        prevBtn: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
        secondaryBtn: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        modal: 'bg-white border-transparent',
        modalHeader: 'bg-slate-50 border-slate-200',
        modalClose: 'hover:bg-slate-200 text-slate-500',
        overlay: 'bg-slate-900/60',
        gridPanel: 'bg-white',
        gridUnanswered: 'bg-white border-slate-200 text-slate-500 hover:border-slate-400',
        gridRingOffset: 'ring-offset-white',
        scoreRingTrack: '#e2e8f0',
        scoreRingInner: 'bg-white',
        scoreRingText: 'text-slate-900',
        primaryBtn: 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20',
        startHero: 'bg-white border-slate-200',
        startIcon: 'bg-blue-100 text-blue-600',
        startBadge: 'bg-blue-50 text-blue-700 border-blue-100',
        statIcon: 'text-blue-600',
        checklist: 'bg-slate-50 border-slate-100',
        checklistTitle: 'text-slate-900',
        checklistText: 'text-slate-600',
        levelEyebrow: 'text-blue-600',
        premiumBadge: 'bg-blue-50 text-blue-700 border-blue-100',
        errorBox: 'bg-red-50 text-red-700 border-red-100',
        submitOverlayCard: 'bg-white border-transparent',
        submitOverlayText: 'text-slate-900',
        submitOverlaySub: 'text-slate-500',
        loaderColor: 'text-blue-600',
      };

  if (finished && results) {
    const isPassed = results.totalScore >= passingScore;
    const percentage = ((results.totalScore / totalItems) * 100).toFixed(1);
    const scoreAngle = Math.min(100, parseFloat(percentage)) * 3.6;

    // Map pretest scores by subject_id
    const pretestMap = {};
    if (results.pretestScores) {
      results.pretestScores.forEach(p => {
        pretestMap[p.subject_id] = p.score;
      });
    }

    return (
      <main className={`min-h-screen ${th.page} flex flex-col items-center p-3 sm:p-4 font-sans py-4 sm:py-6 overflow-x-hidden`}>
        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-3xl w-full min-w-0 border ${th.card}`}>
          <div className="text-center mb-4 sm:mb-5">
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${th.levelEyebrow}`}>{levelLabel} Mock Exam</p>
            <div
              className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3"
              role="img"
              aria-label={`Score ${percentage} percent`}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(${isPassed ? '#16a34a' : '#dc2626'} ${scoreAngle}deg, ${th.scoreRingTrack} ${scoreAngle}deg)`,
                }}
              />
              <div className={`absolute inset-2 ${th.scoreRingInner} rounded-full flex flex-col items-center justify-center`}>
                {isPassed ? (
                  <CheckCircle2 size={24} className="text-green-500 mb-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle size={24} className="text-red-500 mb-0.5" aria-hidden="true" />
                )}
                <span className={`text-lg sm:text-xl font-black ${th.scoreRingText}`}>{percentage}%</span>
              </div>
            </div>

            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${th.textPrimary}`}>Mock Exam Results</h1>
            <p className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
              isPassed
                ? isProfessional ? 'bg-green-950/60 text-green-300 border border-green-700/50' : 'bg-green-100 text-green-700'
                : isProfessional ? 'bg-red-950/60 text-red-300 border border-red-700/50' : 'bg-red-100 text-red-700'
            }`}>
              {isPassed ? 'Passed' : 'Failed'} — {isPassed ? '≥80%' : '<80%'}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xs w-full mx-auto">
              <div className={`p-3 rounded-xl border min-w-0 ${th.cardInset}`}>
                <p className={`${th.textFaint} text-xs font-bold uppercase tracking-widest mb-0.5`}>Raw Score</p>
                <p className={`text-xl sm:text-2xl font-black ${th.textPrimary}`}>
                  {results.totalScore}
                  <span className={`text-sm font-medium ${th.textMuted}`}> / {totalItems}</span>
                </p>
              </div>
              <div className={`p-3 rounded-xl border min-w-0 ${th.cardInset}`}>
                <p className={`${th.textFaint} text-xs font-bold uppercase tracking-widest mb-0.5`}>Percentage</p>
                <p className={`text-xl sm:text-2xl font-black ${isPassed ? 'text-green-500' : 'text-red-500'}`}>{percentage}%</p>
              </div>
            </div>
          </div>

          <h2 className={`font-bold mb-3 text-base sm:text-lg ${th.textPrimary}`}>Per-Subject Breakdown &amp; Baseline Comparison</h2>
          <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5">
            {Object.entries(results.subjectScores).map(([slug, data]) => {
              const subPercentage = ((data.score / data.total) * 100).toFixed(1);
              const subPercentNum = parseFloat(subPercentage);
              const pretestScore = pretestMap[data.subject_id];
              let improvement = null;

              if (pretestScore !== undefined) {
                const pretestPercentage = (pretestScore / 10) * 100;
                const diff = (subPercentage - pretestPercentage).toFixed(1);
                improvement = diff > 0 ? `+${diff}%` : `${diff}%`;
              }

              const improvementNum = improvement !== null ? parseFloat(improvement) : null;

              return (
                <div key={slug} className={`border rounded-xl p-3.5 sm:p-4 shadow-sm min-w-0 ${isProfessional ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 mb-2">
                    <span className={`font-bold min-w-0 break-words ${th.textPrimary}`}>{formatSubjectName(slug)}</span>
                    <span className={`font-black shrink-0 ${th.accent}`}>
                      {data.score} / {data.total}
                      <span className={`${th.textMuted} text-sm font-medium ml-1`}>({subPercentage}%)</span>
                    </span>
                  </div>

                  <div className={`h-1.5 ${th.progressTrack} rounded-full overflow-hidden`} role="presentation">
                    <div
                      className={`h-full rounded-full transition-all ${subPercentNum >= 80 ? 'bg-green-500' : subPercentNum >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${subPercentNum}%` }}
                    />
                  </div>

                  {pretestScore !== undefined && (
                    <div className={`text-sm font-medium flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-2.5 rounded-lg mt-2.5 border min-w-0 ${th.cardInset}`}>
                      <span className={th.textMuted}>Diagnostic Baseline: {pretestScore}/10</span>
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        improvementNum > 0 ? 'text-green-500' : improvementNum < 0 ? 'text-red-500' : th.textFaint
                      }`}>
                        {improvementNum > 0 ? (
                          <TrendingUp size={14} aria-hidden="true" />
                        ) : improvementNum < 0 ? (
                          <TrendingDown size={14} aria-hidden="true" />
                        ) : (
                          <Minus size={14} aria-hidden="true" />
                        )}
                        {improvement}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full min-h-[52px] py-3.5 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${th.primaryBtn}`}
          >
            Enter Dashboard <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </main>
    );
  }

  if (!started) {
    const attemptRule = user?.is_premium
      ? 'Premium users have unlimited mock exam attempts.'
      : user?.mock_exam_completed
        ? 'You have used your free mock exam attempt. Upgrade to Premium for unlimited retakes.'
        : 'You have 1 free mock exam attempt.';
    const startLabel = user?.is_premium && user?.mock_exam_completed ? 'Start Retake' : 'Start Mock Exam';
    const attemptTone = user?.is_premium
      ? isProfessional ? 'bg-blue-950/50 border-blue-700/50 text-blue-200' : 'bg-blue-50 border-blue-100 text-blue-800'
      : user?.mock_exam_completed
        ? isProfessional ? 'bg-amber-950/50 border-amber-700/50 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'
        : isProfessional ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200' : 'bg-green-50 border-green-100 text-green-800';

    return (
      <main className={`min-h-screen ${th.page} font-sans flex items-center justify-center p-3 sm:p-4 overflow-x-hidden`}>
        <div className={`rounded-2xl sm:rounded-3xl max-w-3xl w-full min-w-0 p-4 sm:p-6 md:p-7 border ${isProfessional ? th.startHero : th.card}`}>
          <div className="flex flex-col gap-3 mb-5 sm:mb-6">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${th.startIcon}`} aria-hidden="true">
                {isProfessional ? <Sparkles size={24} /> : <ClipboardList size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className={`font-black text-xs uppercase tracking-widest ${th.levelEyebrow}`}>{levelLabel} Level</p>
                  {isProfessional && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Sparkles size={10} aria-hidden="true" /> Elite Mode
                    </span>
                  )}
                </div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${th.textPrimary}`}>Full-Length Mock Exam</h1>
                <p className={`${th.textMuted} font-medium mt-1.5 text-sm sm:text-base`}>
                  Review the rules before you begin. Your timer starts only after the questions are loaded.
                </p>
              </div>
            </div>
            <div className={`self-start sm:ml-14 rounded-2xl px-3.5 py-1.5 border font-black text-xs sm:text-sm uppercase tracking-widest ${th.premiumBadge}`}>
              {user?.is_premium ? 'Premium' : 'Free'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
            <div className={`rounded-xl p-3.5 sm:p-4 border flex items-start gap-3 min-w-0 ${th.cardInset}`}>
              <FileText size={20} className={`${th.statIcon} shrink-0 mt-0.5`} aria-hidden="true" />
              <div className="min-w-0">
                <p className={`${th.textFaint} text-xs font-bold uppercase tracking-widest mb-0.5`}>Items</p>
                <p className={`${th.textPrimary} font-black text-xl`}>{totalItems}</p>
              </div>
            </div>
            <div className={`rounded-xl p-3.5 sm:p-4 border flex items-start gap-3 min-w-0 ${th.cardInset}`}>
              <Clock size={20} className={`${th.statIcon} shrink-0 mt-0.5`} aria-hidden="true" />
              <div className="min-w-0">
                <p className={`${th.textFaint} text-xs font-bold uppercase tracking-widest mb-0.5`}>Time Limit</p>
                <p className={`${th.textPrimary} font-black text-base sm:text-lg leading-tight break-words`}>{timeLimitLabel}</p>
              </div>
            </div>
            <div className={`rounded-xl p-3.5 sm:p-4 border flex items-start gap-3 min-w-0 ${th.cardInset}`}>
              <Target size={20} className={`${th.statIcon} shrink-0 mt-0.5`} aria-hidden="true" />
              <div className="min-w-0">
                <p className={`${th.textFaint} text-xs font-bold uppercase tracking-widest mb-0.5`}>Passing</p>
                <p className={`${th.textPrimary} font-black text-xl`}>≥80%</p>
                <p className={`${th.textMuted} text-xs font-medium mt-0.5`}>{passingScore} of {totalItems}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-4 border mb-4 ${attemptTone}`}>
            <h2 className="font-bold text-base sm:text-lg mb-1.5 flex items-center gap-2">
              <Target size={18} aria-hidden="true" />
              Attempt Rules
            </h2>
            <p className="font-medium text-sm leading-relaxed">{attemptRule}</p>
          </div>

          <div className={`rounded-2xl p-4 border mb-5 ${th.checklist}`}>
            <h2 className={`font-bold text-base sm:text-lg mb-2.5 flex items-center gap-2 ${th.checklistTitle}`}>
              <ListChecks size={18} className={th.accent} aria-hidden="true" />
              Before You Begin
            </h2>
            <ul className={`text-sm font-medium space-y-2 ${th.checklistText}`}>
              {[
                'Answer each item carefully before submitting.',
                'The timer begins after you click Start and questions load successfully.',
                'Unanswered items are counted as incorrect when you submit.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check size={16} className="text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {loadError && (
            <div
              role="alert"
              className={`border rounded-xl p-4 mb-5 text-sm font-bold flex items-start gap-2 ${th.errorBox}`}
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span>{loadError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartExam}
              disabled={loading}
              className={`flex-1 min-h-[52px] py-4 rounded-xl font-black text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-widest text-sm flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${th.primaryBtn}`}
            >
              {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
              {loading ? 'Loading Questions...' : startLabel}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              className={`flex-1 min-h-[52px] py-4 rounded-xl font-black transition-all disabled:opacity-60 uppercase tracking-widest text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${th.secondaryBtn}`}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isLowTime = timeLeft <= 600;
  const isCriticalTime = timeLeft <= 60;

  return (
    <div className={`min-h-screen ${th.page} font-sans flex flex-col overflow-x-hidden max-w-full`}>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{timerAnnouncement}</span>

      {/* Header */}
      <header className={`border-b sticky top-0 z-20 shadow-sm w-full max-w-full ${th.header}`}>
        <div className="px-2.5 sm:px-6 py-2.5 sm:py-3 grid grid-cols-[auto_1fr_auto] items-center gap-2 max-w-full">
          <button
            onClick={() => setShowQuitConfirm(true)}
            aria-label="Quit exam"
            className={`min-h-[44px] min-w-[44px] px-2 transition-colors font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 rounded-lg ${th.headerBtn}`}
          >
            <X size={18} aria-hidden="true" /> <span className="hidden sm:inline">Quit</span>
          </button>

          <div
            className={`min-w-0 justify-self-center flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl font-mono text-sm sm:text-xl font-bold shadow-inner transition-colors ${
              isCriticalTime
                ? 'bg-red-600 text-white animate-pulse motion-reduce:animate-none'
                : isLowTime
                  ? 'bg-amber-500 text-white'
                  : isProfessional
                    ? 'bg-indigo-950 text-white border border-indigo-500/40'
                    : 'bg-slate-900 text-white'
            }`}
            role="timer"
            aria-label={`Time remaining: ${formatTime(timeLeft)}`}
          >
            <Clock size={18} className={isCriticalTime || isLowTime ? 'text-white' : isProfessional ? 'text-indigo-400' : 'text-blue-400'} aria-hidden="true" />
            <span aria-hidden="true">{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowGrid(true)}
            aria-label="Open question grid"
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 font-bold text-xs sm:text-sm px-2.5 sm:px-4 py-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${th.gridBtn}`}
          >
            <Grid3x3 size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-2.5 sm:px-6 pb-2.5 sm:pb-3">
          <div
            className={`h-1.5 rounded-full overflow-hidden ${th.progressTrack}`}
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-label={`Question ${currentIndex + 1} of ${questions.length}`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${th.progressFill}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-3xl w-full min-w-0 mx-auto p-3 sm:p-6 pb-32 sm:pb-28">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className={`font-black text-base sm:text-lg ${th.textPrimary}`}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className={`text-sm font-bold ${th.accent}`}>
              {answeredCount} answered
            </span>
            <span className={`text-sm font-medium ${th.textMuted}`}>
              · {unansweredCount} left
            </span>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full truncate max-w-full sm:max-w-xs ${th.subjectPill}`}
            title={currentQuestion.subject_name}
          >
            <span className="sm:hidden">{levelLabel}</span>
            <span className="hidden sm:inline">{currentQuestion.subject_name}</span>
          </span>
        </div>

        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 flex-1 flex flex-col border w-full max-w-full min-w-0 ${th.questionCard}`}>
          <p className={`text-xs font-bold uppercase tracking-widest mb-2.5 ${th.itemLabel}`}>
            Item {currentIndex + 1}
          </p>
          <h2
            id={`question-${currentQuestion.id}`}
            className={`text-lg sm:text-xl md:text-2xl font-bold leading-relaxed mb-5 sm:mb-7 ${th.textPrimary}`}
          >
            {currentQuestion.question_text}
          </h2>

          <div
            className="space-y-2.5 sm:space-y-3 mt-auto"
            role="radiogroup"
            aria-labelledby={`question-${currentQuestion.id}`}
          >
            {currentQuestion.answers.map((ans, ansIdx) => {
              const isSelected = answers[currentQuestion.id]?.answerId === ans.id;
              const letter = ANSWER_LETTERS[ansIdx] || String(ansIdx + 1);

              return (
                <button
                  key={ans.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(currentQuestion.id, ans.id, ans.is_correct, currentQuestion.subject_slug, currentQuestion.subject_id)}
                  className={`w-full max-w-full text-left min-h-[52px] p-3.5 sm:p-5 rounded-2xl border-2 transition-all font-medium text-base sm:text-lg flex items-start gap-3 sm:gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                    isSelected ? th.answerSelected : th.answerDefault
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 text-sm font-black ${
                      isSelected ? th.answerLetterSelected : th.answerLetterDefault
                    }`}
                    aria-hidden="true"
                  >
                    {letter}
                  </span>
                  <span className="flex-1 min-w-0 break-words leading-snug">{ans.answer_text}</span>
                  {isSelected && <Check size={20} className={`${th.accent} shrink-0`} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky Navigation Bar */}
      <div className={`fixed bottom-0 inset-x-0 z-30 border-t px-3 sm:px-6 py-2.5 sm:py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-w-full ${th.bottomNav}`}>
        <div className="max-w-3xl w-full mx-auto flex gap-2 sm:gap-4 min-w-0">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            aria-label="Previous question"
            className={`flex-1 min-w-0 min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg transition-all disabled:opacity-50 flex justify-center items-center gap-1.5 sm:gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${th.prevBtn}`}
          >
            <ChevronLeft size={20} aria-hidden="true" /> Prev
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              aria-label="Submit exam"
              className="flex-1 min-w-0 min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex justify-center items-center gap-1.5 sm:gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              <CheckCircle2 size={20} aria-hidden="true" /> Submit Exam
            </button>
          ) : (
            <button
              onClick={handleNext}
              aria-label="Next question"
              className="flex-1 min-w-0 min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex justify-center items-center gap-1.5 sm:gap-2 shadow-lg shadow-blue-600/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Next <ChevronRight size={20} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Submitting Overlay */}
      {submitting && !finished && (
        <div
          className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${th.overlay}`}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className={`rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border ${th.submitOverlayCard}`}>
            <Loader2 size={40} className={`animate-spin mx-auto mb-4 ${th.loaderColor}`} aria-hidden="true" />
            <p className={`text-lg font-bold ${th.submitOverlayText}`}>Submitting your exam…</p>
            <p className={`text-sm mt-2 font-medium ${th.submitOverlaySub}`}>Please wait while your answers are saved.</p>
          </div>
        </div>
      )}

      {/* Grid Modal */}
      {showGrid && (
        <div
          className={`fixed inset-0 backdrop-blur-sm z-50 flex justify-end overflow-hidden ${isProfessional ? 'bg-black/50' : 'bg-slate-900/40'}`}
          role="presentation"
          onClick={() => setShowGrid(false)}
        >
          <div
            className={`w-full max-w-full sm:max-w-md h-full shadow-2xl flex flex-col min-w-0 ${th.gridPanel}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="grid-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-3 sm:p-4 border-b flex justify-between items-center gap-3 ${th.modalHeader}`}>
              <h3 id="grid-dialog-title" className={`font-bold text-lg ${th.textPrimary}`}>Question Grid</h3>
              <button
                ref={gridCloseRef}
                onClick={() => setShowGrid(false)}
                aria-label="Close question grid"
                className={`min-h-[44px] min-w-[44px] p-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${th.modalClose}`}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-w-0">
              <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-4 text-xs font-bold">
                <span className={`inline-flex items-center gap-1.5 ${th.textMuted}`}>
                  <span className={`w-3 h-3 rounded border-2 border-blue-400 ring-2 ring-blue-400 ring-offset-1 ${isProfessional ? 'bg-slate-800 ring-offset-slate-800' : 'bg-white ring-offset-white'}`} aria-hidden="true" />
                  Current
                </span>
                <span className={`inline-flex items-center gap-1.5 ${th.accent}`}>
                  <span className="w-3 h-3 rounded bg-blue-500" aria-hidden="true" />
                  Answered
                </span>
                <span className={`inline-flex items-center gap-1.5 ${th.textMuted}`}>
                  <span className={`w-3 h-3 rounded border-2 ${isProfessional ? 'border-slate-600 bg-slate-900' : 'border-slate-200 bg-white'}`} aria-hidden="true" />
                  Unanswered
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      aria-label={`Question ${idx + 1}${isCurrent ? ', current' : ''}${isAnswered ? ', answered' : ', unanswered'}`}
                      aria-current={isCurrent ? 'true' : undefined}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowGrid(false);
                      }}
                      className={`h-11 sm:h-12 min-w-0 rounded-lg font-bold text-sm border-2 transition-all flex items-center justify-center relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
                        ${isCurrent ? `ring-2 ring-blue-400 ring-offset-2 ${th.gridRingOffset}` : ''}
                        ${isAnswered
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : th.gridUnanswered
                        }
                      `}
                    >
                      {isAnswered && !isCurrent && (
                        <Check size={10} className="absolute top-1 right-1 text-white/80" aria-hidden="true" />
                      )}
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={`p-3 sm:p-4 border-t space-y-3 ${th.modalHeader}`}>
              <div className="flex justify-between text-sm font-bold">
                <span className={th.accent}>{answeredCount} Answered</span>
                <span className={th.textMuted}>{unansweredCount} Unanswered</span>
              </div>
              <button
                onClick={() => {
                  setShowGrid(false);
                  setShowSubmitConfirm(true);
                }}
                className="w-full min-h-[48px] py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirm Modal */}
      {showQuitConfirm && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${th.overlay}`}>
          <div
            className={`rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center max-h-[90vh] overflow-y-auto ${th.modal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quit-dialog-title"
            aria-describedby="quit-dialog-desc"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isProfessional ? 'bg-red-950/60 text-red-400' : 'bg-red-100 text-red-600'}`} aria-hidden="true">
              <AlertCircle size={32} />
            </div>
            <h3 id="quit-dialog-title" className={`text-xl font-bold mb-2 ${th.textPrimary}`}>Quit Exam?</h3>
            <p id="quit-dialog-desc" className={`mb-6 font-medium text-sm sm:text-base ${th.textMuted}`}>
              Are you sure you want to quit? This will forfeit your attempt and your progress will not be saved.
            </p>
            <div className="flex gap-3">
              <button
                ref={quitCancelRef}
                onClick={() => setShowQuitConfirm(false)}
                className={`flex-1 min-h-[48px] py-3 font-bold rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${th.secondaryBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={handleQuit}
                className="flex-1 min-h-[48px] py-3 font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Yes, Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirm Modal */}
      {showSubmitConfirm && (
        <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${th.overlay}`}>
          <div
            className={`rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center max-h-[90vh] overflow-y-auto ${th.modal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-dialog-title"
            aria-describedby="submit-dialog-desc"
          >
            <h3 id="submit-dialog-title" className={`text-xl font-bold mb-4 ${th.textPrimary}`}>Submit Exam?</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`p-3 rounded-xl border ${isProfessional ? 'bg-blue-950/50 border-blue-700/50' : 'bg-blue-50 border-blue-100'}`}>
                <p className={`text-2xl font-black ${th.accent}`}>{answeredCount}</p>
                <p className={`text-xs font-bold uppercase tracking-wider ${isProfessional ? 'text-blue-300' : 'text-blue-700'}`}>Answered</p>
              </div>
              <div className={`p-3 rounded-xl border ${
                unansweredCount > 0
                  ? isProfessional ? 'bg-amber-950/50 border-amber-700/50' : 'bg-amber-50 border-amber-100'
                  : isProfessional ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'
              }`}>
                <p className={`text-2xl font-black ${unansweredCount > 0 ? 'text-amber-500' : th.textSecondary}`}>{unansweredCount}</p>
                <p className={`text-xs font-bold uppercase tracking-wider ${unansweredCount > 0 ? 'text-amber-400' : th.textMuted}`}>Unanswered</p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div role="alert" className={`flex items-start gap-2 text-left rounded-xl p-3 mb-4 text-sm font-medium ${
                isProfessional ? 'bg-amber-950/50 border border-amber-700/50 text-amber-200' : 'bg-amber-50 border border-amber-100 text-amber-800'
              }`}>
                <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>Unanswered items will be counted as incorrect.</span>
              </div>
            )}

            <p id="submit-dialog-desc" className={`mb-6 font-medium text-sm ${th.textMuted}`}>
              You have answered {answeredCount} out of {questions.length} questions. Are you sure you want to submit?
            </p>
            <div className="flex gap-3">
              <button
                ref={submitReviewRef}
                onClick={() => setShowSubmitConfirm(false)}
                className={`flex-1 min-h-[48px] py-3 font-bold rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${th.secondaryBtn}`}
              >
                Review
              </button>
              <button
                onClick={finishTest}
                disabled={submitting}
                className="flex-1 min-h-[48px] py-3 font-bold bg-green-600 text-white hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
