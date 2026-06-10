import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import CategoryBadge from '../components/ui/CategoryBadge'
import { Flame, BookOpen, Target, ChevronRight, Shield, Gift, Compass, Trophy } from 'lucide-react'
import api from '../api/axios'
import { getExamLevelKey, getSubjectsForClass } from '../config/examSubjects'

export default function Dashboard() {
  const { user, updateUserStats, userClass } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    quiz_sets_done: 0,
    mastery: {},
    mock_exam: {
      attempt_count: 0,
      can_take_mock_exam: true,
      attempts_remaining: 1,
      is_premium: false
    },
    continue_learning: null,
    streak_status: null,
    leaderboard_snapshot: null
  })
  const [missions, setMissions] = useState([])
  const [claimingMissionId, setClaimingMissionId] = useState(null)
  const subjects = getSubjectsForClass(userClass)

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats', userClass ? { params: { level: getExamLevelKey(userClass) } } : undefined)
      .then(res => {
        setStats({
          quiz_sets_done: res.data.quiz_sets_done,
          mastery: res.data.mastery,
          continue_learning: res.data.continue_learning || null,
          streak_status: res.data.streak_status || null,
          leaderboard_snapshot: res.data.leaderboard_snapshot || null,
          mock_exam: res.data.mock_exam || {
            attempt_count: 0,
            can_take_mock_exam: true,
            attempts_remaining: 1,
            is_premium: false
          }
        })
        if (res.data.user) {
          updateUserStats(res.data.user) // Refresh global user object
        }
      })
      .catch(err => console.error("Failed to load dashboard stats", err))

    api.get('/missions')
      .then(res => setMissions(res.data.missions || []))
      .catch(err => console.error("Failed to load dashboard missions", err))
  }, [userClass])

  useEffect(() => {
    if (!user?.double_xp_until) {
      setTimeLeft('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      // Ensure we parse it correctly in case of timezone issues, assuming UTC from backend
      const end = new Date(user.double_xp_until + (!user.double_xp_until.endsWith('Z') ? 'Z' : ''));
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m left`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [user?.double_xp_until]);

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Anna Doe'
  const mockExam = stats.mock_exam
  const isPremiumMockUser = mockExam.is_premium || user?.is_premium
  const canTakeMockExam = mockExam.can_take_mock_exam
  const mockExamStatusLabel = isPremiumMockUser
    ? 'Premium - unlimited attempts'
    : canTakeMockExam
      ? '1 free attempt available'
      : 'Free attempt used'
  const mockExamDescription = isPremiumMockUser
    ? 'Retake the full-length mock exam whenever you want and use each attempt to sharpen your readiness.'
    : canTakeMockExam
      ? 'Use your included free attempt to measure readiness under exam conditions.'
      : 'You have used your free mock exam attempt. Upgrade to Premium to unlock unlimited retakes.'
  const formatMockResult = (result) => {
    if (!result) return 'No attempts yet'
    return `${result.percentage}% (${result.score}/${result.total_items})`
  }
  const mockExamLevelLabel = userClass || 'Select a category'
  const mockExamDuration = userClass === 'Professional'
    ? '170 items to be completed in 3 hours and 10 minutes.'
    : userClass === 'Sub-Professional'
      ? '165 items to be completed in 2 hours and 40 minutes.'
      : 'Choose Professional or Sub-Professional to start a full-length mock exam.'
  const completedUnclaimedMissions = missions.filter(mission => mission.is_completed && !mission.is_claimed)
  const getMissionTitle = (missionType) => {
    if (missionType === 'complete_2_quiz_sets') return 'Complete 2 Quiz Sets'
    if (missionType === 'score_80_percent') return 'Score 80% or Higher'
    if (missionType === 'earn_100_xp') return 'Earn 100 XP'
    if (missionType === 'maintain_streak') return 'Maintain Your Daily Streak'
    return 'Daily Mission'
  }
  const handleClaimMission = async (missionId) => {
    if (claimingMissionId) return

    setClaimingMissionId(missionId)

    try {
      const res = await api.post(`/missions/${missionId}/claim`)
      setMissions(missions.map(mission => mission.id === missionId ? res.data.mission : mission))
      if (res.data.mission?.mission_type === 'maintain_streak') {
        setStats(prev => ({
          ...prev,
          streak_status: prev.streak_status ? {
            ...prev.streak_status,
            maintain_streak_mission: {
              ...prev.streak_status.maintain_streak_mission,
              ...res.data.mission
            }
          } : prev.streak_status
        }))
      }
      if (res.data.user) {
        updateUserStats(res.data.user)
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim reward')
    } finally {
      setClaimingMissionId(null)
    }
  }
  const mockExamPath = userClass ? `/mock-exam?level=${userClass.toLowerCase()}` : '/select-class'
  const getDailyAction = () => {
    if (!userClass) {
      return {
        icon: Compass,
        label: 'Start Here',
        title: 'Choose your exam category',
        description: 'Select Professional or Sub-Professional so PACSER can show the right subjects, pretest, and mock exam.',
        primaryLabel: 'Select Category',
        primaryAction: () => navigate('/select-class'),
        secondaryLabel: null,
        secondaryAction: null
      }
    }

    if (!user?.pretest_completed) {
      return {
        icon: Target,
        label: 'Diagnostic First',
        title: 'Take your pretest',
        description: `Set your ${userClass} baseline before studying so your progress has a starting point.`,
        primaryLabel: 'Take Pretest',
        primaryAction: () => navigate('/pretest'),
        secondaryLabel: 'Review Subjects',
        secondaryAction: () => navigate('/learn')
      }
    }

    if (completedUnclaimedMissions.length > 0) {
      return {
        icon: Gift,
        label: 'Reward Ready',
        title: `Claim ${completedUnclaimedMissions.length} completed mission reward${completedUnclaimedMissions.length > 1 ? 's' : ''}`,
        description: 'You already earned the reward. Claim it before starting the next study session.',
        primaryLabel: 'Claim Rewards',
        primaryAction: () => navigate('/profile'),
        secondaryLabel: 'Continue Learning',
        secondaryAction: () => navigate('/learn')
      }
    }

    if (subjects.length > 0) {
      return {
        icon: BookOpen,
        label: 'Next Study Step',
        title: stats.quiz_sets_done > 0 ? 'Continue your reviewer progress' : 'Start your first reviewer set',
        description: stats.quiz_sets_done > 0
          ? 'Keep momentum by returning to your subject reviewer and finishing another quiz set.'
          : `Begin with one ${userClass} subject and build your first mastery score.`,
        primaryLabel: 'Continue Learning',
        primaryAction: () => navigate('/learn'),
        secondaryLabel: canTakeMockExam ? 'Mock Exam' : 'Mock Status',
        secondaryAction: () => navigate(canTakeMockExam ? mockExamPath : '/profile')
      }
    }

    return {
      icon: Target,
      label: 'Readiness Check',
      title: 'Take a full-length mock exam',
      description: 'Use the mock exam to measure your readiness under timed conditions.',
      primaryLabel: canTakeMockExam ? 'Take Mock Exam' : 'View Mock Status',
      primaryAction: () => navigate(canTakeMockExam ? mockExamPath : '/profile'),
      secondaryLabel: 'Review Subjects',
      secondaryAction: () => navigate('/learn')
    }
  }
  const dailyAction = getDailyAction()
  const DailyActionIcon = dailyAction.icon
  const continueLearning = stats.continue_learning
  const streakStatus = stats.streak_status
  const continueLearningTitle = continueLearning?.quiz_set_title || 'Choose a reviewer subject'
  const continueLearningSubject = continueLearning?.subject_name || userClass || 'Reviewer'
  const continueLearningDescription = continueLearning?.message || (
    userClass
      ? 'Start with one reviewer subject and build your first mastery score.'
      : 'Select your exam category so PACSER can recommend your next quiz set.'
  )
  const continueLearningPrimaryLabel = continueLearning?.is_locked
    ? 'View Subject'
    : continueLearning?.quiz_set_id
      ? 'Continue Quiz'
      : userClass
        ? 'Open Learn'
        : 'Select Category'
  const handleContinueLearning = () => {
    if (!userClass) {
      navigate('/select-class')
      return
    }

    if (continueLearning?.is_locked && continueLearning.subject_slug) {
      navigate(`/learn/${continueLearning.subject_slug}`)
      return
    }

    if (continueLearning?.quiz_set_id) {
      navigate(`/quiz/${continueLearning.quiz_set_id}`, {
        state: {
          title: continueLearning.quiz_set_title,
          subjectId: continueLearning.subject_slug
        }
      })
      return
    }

    navigate('/learn')
  }
  const streakCtaLabel = !userClass
    ? 'Select Category'
    : !user?.pretest_completed
      ? 'Take Pretest'
      : continueLearning?.quiz_set_id && !continueLearning?.is_locked
        ? 'Continue Quiz'
        : 'Continue Learning'
  const handleStreakAction = () => {
    if (!userClass) {
      navigate('/select-class')
      return
    }

    if (!user?.pretest_completed) {
      navigate('/pretest')
      return
    }

    if (continueLearning?.quiz_set_id && !continueLearning?.is_locked) {
      handleContinueLearning()
      return
    }

    navigate('/learn')
  }
  const isStreakSafeToday = Boolean(streakStatus?.is_safe_today)
  const streakMission = streakStatus?.maintain_streak_mission
  const streakStatusTitle = isStreakSafeToday
    ? 'Study streak secured today'
    : streakStatus?.last_study_date
      ? 'Study today to keep your streak alive'
      : 'Start your study streak'
  const streakStatusDescription = isStreakSafeToday
    ? 'You completed a study activity today. Nice and tidy.'
    : 'Complete a quiz, pretest, or mock exam to count today as a study day.'
  const subjectMasteryScores = subjects.map(subject => ({
    ...subject,
    mastery: stats.mastery[subject.id] || 0
  }))
  const averageMastery = subjectMasteryScores.length > 0
    ? subjectMasteryScores.reduce((sum, subject) => sum + subject.mastery, 0) / subjectMasteryScores.length
    : 0
  const bestMockPercentage = mockExam.best_result?.percentage || 0
  const latestMockPercentage = mockExam.latest_result?.percentage || null
  const completionSignal = user?.pretest_completed && stats.quiz_sets_done > 0
    ? 100
    : user?.pretest_completed || stats.quiz_sets_done > 0
      ? 50
      : 0
  const readinessScore = Math.round((averageMastery * 0.5) + (bestMockPercentage * 0.4) + (completionSignal * 0.1))
  const readinessLabel = readinessScore >= 80
    ? 'Exam Ready'
    : readinessScore >= 60
      ? 'Nearly Ready'
      : readinessScore >= 40
        ? 'Building Foundation'
        : 'Getting Started'
  const weakSubjects = subjectMasteryScores
    .filter(subject => subject.mastery < 75)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3)
  const hasReadinessData = Boolean(userClass && (stats.quiz_sets_done > 0 || mockExam.attempt_count > 0 || user?.pretest_completed))
  const readinessCtaLabel = !userClass
    ? 'Select Category'
    : !user?.pretest_completed
      ? 'Take Pretest'
      : weakSubjects.length > 0
        ? 'Review Weak Subjects'
        : canTakeMockExam
          ? 'Take Mock Exam'
          : 'Continue Learning'
  const handleReadinessAction = () => {
    if (!userClass) {
      navigate('/select-class')
      return
    }

    if (!user?.pretest_completed) {
      navigate('/pretest')
      return
    }

    if (weakSubjects.length > 0) {
      navigate(`/learn/${weakSubjects[0].id}`)
      return
    }

    if (canTakeMockExam) {
      navigate(mockExamPath)
      return
    }

    navigate('/learn')
  }
  const isPremiumUser = Boolean(user?.is_premium || mockExam.is_premium)
  const hasUsedFreeMockAttempt = !isPremiumUser && mockExam.attempt_count > 0
  const hasPremiumLockedRecommendation = !isPremiumUser && (
    continueLearning?.is_locked || continueLearning?.recommendation_reason === 'premium_locked_next_set'
  )
  const premiumModuleTitle = isPremiumUser
    ? 'Premium Active'
    : hasUsedFreeMockAttempt
      ? 'Unlock unlimited mock exam retakes'
      : hasPremiumLockedRecommendation
        ? 'Unlock your next recommended set'
        : 'Unlock deeper practice with Premium'
  const premiumModuleDescription = isPremiumUser
    ? 'Unlimited mock exam retakes and premium quiz sets are available on your account.'
    : hasUsedFreeMockAttempt
      ? 'Your free mock exam attempt is used. Premium lets you retake full-length exams and track progress over time.'
      : hasPremiumLockedRecommendation
        ? `${continueLearning.quiz_set_title} is a Premium Set 3 quiz. Unlock it when you are ready for advanced practice.`
        : 'Use Premium for unlimited mock exam retakes, Set 3 quiz access, and extra practice when you need more reps.'
  const premiumPrimaryLabel = !userClass
    ? 'Select Category'
    : isPremiumUser
      ? mockExam.attempt_count > 0
        ? 'Retake Mock Exam'
        : 'Continue Learning'
      : 'Redeem Access Code'
  const handlePremiumAction = () => {
    if (!userClass) {
      navigate('/select-class')
      return
    }

    if (isPremiumUser) {
      if (mockExam.attempt_count > 0) {
        navigate(mockExamPath)
        return
      }

      handleContinueLearning()
      return
    }

    navigate('/profile')
  }
  const leaderboardSnapshot = stats.leaderboard_snapshot
  const leaderboardStatusLabel = leaderboardSnapshot?.promotion_status === 'promotion_zone'
    ? 'Promotion Zone'
    : leaderboardSnapshot?.promotion_status === 'demotion_zone'
      ? 'Demotion Zone'
      : 'Safe Zone'
  const leaderboardStatusClass = leaderboardSnapshot?.promotion_status === 'promotion_zone'
    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-700/50'
    : leaderboardSnapshot?.promotion_status === 'demotion_zone'
      ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-700/50'
      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-700/50'
  const leaderboardHelpText = !leaderboardSnapshot
    ? 'Complete quizzes to start climbing your weekly league.'
    : leaderboardSnapshot.total_users <= 1
      ? 'Complete quizzes to set the pace in your weekly league.'
      : leaderboardSnapshot.xp_to_next_user
        ? `${leaderboardSnapshot.xp_to_next_user} XP to pass ${leaderboardSnapshot.next_user?.name || 'the next user'}.`
        : 'You are leading this weekly league.'
  const leaderboardRulesText = leaderboardSnapshot?.promotion_cutoff_position || leaderboardSnapshot?.demotion_cutoff_position
    ? 'Top 20% promotes. Bottom 20% demotes each week.'
    : 'Promotion and demotion apply when enough users are in your league.'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans pb-12 transition-colors">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">

        {/* Top Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center flex-wrap">
              Welcome back, {displayName}!
              <CategoryBadge />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Your Civil Service journey awaits. What are we studying today?</p>
          </div>
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Continue Learning
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Daily Action Panel */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-700/50">
              <DailyActionIcon size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-1">{dailyAction.label}</p>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{dailyAction.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1 max-w-2xl">{dailyAction.description}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            {dailyAction.secondaryLabel && (
              <button
                onClick={dailyAction.secondaryAction}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-black rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors uppercase tracking-widest text-xs"
              >
                {dailyAction.secondaryLabel}
              </button>
            )}
            <button
              onClick={dailyAction.primaryAction}
              className="px-5 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {dailyAction.primaryLabel}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Continue Learning Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-700/50">
              <BookOpen size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Continue Learning</p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{continueLearningTitle}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                <span className="font-bold text-slate-700 dark:text-slate-200">{continueLearningSubject}</span>
                {' - '}{continueLearningDescription}
              </p>
              {continueLearning?.recommendation_reason && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">
                  {continueLearning.recommendation_reason.replace(/_/g, ' ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            {continueLearning?.is_locked && (
              <button
                onClick={() => navigate('/profile')}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-black rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors uppercase tracking-widest text-xs"
              >
                Upgrade
              </button>
            )}
            <button
              onClick={handleContinueLearning}
              className="px-5 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {continueLearningPrimaryLabel}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Exam Readiness Panel */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-700/50">
                <Target size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Estimated Exam Readiness</p>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {hasReadinessData ? `${readinessScore}% - ${readinessLabel}` : 'Start building your readiness'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-2xl">
                  {hasReadinessData
                    ? 'This estimate combines subject mastery, mock exam performance, and study completion signals. It is not an official passing prediction.'
                    : 'Complete your pretest, answer quiz sets, and take a mock exam to unlock a clearer readiness estimate.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleReadinessAction}
              className="w-full lg:w-auto px-5 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shrink-0"
            >
              {readinessCtaLabel}
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Subject Mastery</p>
              <p className="text-slate-900 dark:text-white font-black text-xl">{Math.round(averageMastery)}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Best Mock</p>
              <p className="text-slate-900 dark:text-white font-black text-xl">
                {mockExam.best_result ? `${mockExam.best_result.percentage}%` : 'Not taken'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Latest Mock</p>
              <p className="text-slate-900 dark:text-white font-black text-xl">
                {latestMockPercentage !== null ? `${latestMockPercentage}%` : 'Not taken'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Weak Subjects</p>
            {weakSubjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {weakSubjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/learn/${subject.id}`)}
                    className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
                  >
                    {subject.title} - {subject.mastery}%
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {hasReadinessData ? 'No weak subjects flagged yet.' : 'Start a subject quiz to reveal weak areas.'}
              </p>
            )}
          </div>
        </div>

        {/* Streak Status Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isStreakSafeToday
                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-700/50'
                : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100 dark:border-yellow-700/50'
            }`}>
              <Flame size={24} className={isStreakSafeToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-500 dark:text-yellow-400'} />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Study Streak</p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {streakStatus?.current_streak || 0} Day{(streakStatus?.current_streak || 0) === 1 ? '' : 's'} - {streakStatusTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-2xl">{streakStatusDescription}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {streakStatus?.streak_freeze_active && (
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-700/50 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    Freeze Active
                  </span>
                )}
                {!streakStatus?.streak_freeze_active && streakStatus?.inventory_streak_freezes > 0 && (
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    {streakStatus.inventory_streak_freezes} Freeze{streakStatus.inventory_streak_freezes === 1 ? '' : 's'} Available
                  </span>
                )}
                {streakMission && (
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    streakMission.is_claimed
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : streakMission.is_completed
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-700/50'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                  }`}>
                    {streakMission.is_claimed
                      ? 'Mission Claimed'
                      : streakMission.is_completed
                        ? `Mission Complete +${streakMission.points_reward} pts`
                        : `Mission ${streakMission.progress}/${streakMission.target}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleStreakAction}
            className="w-full lg:w-auto px-5 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shrink-0"
          >
            {streakCtaLabel}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Daily Missions Widget */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Daily Missions</p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Earn points from today&apos;s goals</h2>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-700/50 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest">
              {completedUnclaimedMissions.length} Ready
            </div>
          </div>

          {missions.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No missions available today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {missions.map((mission) => {
                const progressPercent = mission.target > 0 ? Math.min(100, (mission.progress / mission.target) * 100) : 0
                const isClaimable = mission.is_completed && !mission.is_claimed
                const isClaimed = mission.is_claimed

                return (
                  <div
                    key={mission.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      isClaimable
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/60'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{getMissionTitle(mission.mission_type)}</h3>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">
                          {mission.progress} / {mission.target}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">+{mission.points_reward} pts</span>
                        {isClaimable ? (
                          <button
                            onClick={() => handleClaimMission(mission.id)}
                            disabled={claimingMissionId === mission.id}
                            className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                          >
                            {claimingMissionId === mission.id ? 'Claiming' : 'Claim'}
                          </button>
                        ) : isClaimed ? (
                          <button
                            disabled
                            className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
                          >
                            Claimed
                          </button>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">In Progress</span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={mission.is_completed ? 'h-full bg-emerald-500' : 'h-full bg-blue-500'}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Premium Value Module */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isPremiumUser
                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-700/50'
                : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-700/50'
            }`}>
              <Shield size={24} className={isPremiumUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'} />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
                {isPremiumUser ? 'Premium Benefits' : 'Premium Option'}
              </p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{premiumModuleTitle}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-2xl">{premiumModuleDescription}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  Unlimited Retakes
                </span>
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  Premium Set 3
                </span>
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  Extra Practice
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handlePremiumAction}
            className={`w-full lg:w-auto px-5 py-3 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shrink-0 ${
              isPremiumUser
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {premiumPrimaryLabel}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Leaderboard Snapshot */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shrink-0 border border-yellow-100 dark:border-yellow-700/50">
              <Trophy size={24} className="text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Weekly League</p>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {leaderboardSnapshot?.rank_name || 'Applicant'} League
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{leaderboardHelpText}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">
                {leaderboardRulesText}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-3 w-full lg:w-auto">
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Position</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {leaderboardSnapshot?.position ? `#${leaderboardSnapshot.position}` : '-'}
                <span className="text-slate-400 dark:text-slate-500"> / {leaderboardSnapshot?.total_users || 0}</span>
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Weekly XP</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{leaderboardSnapshot?.weekly_xp || 0} XP</p>
            </div>
            <div className={`rounded-xl px-3 py-2 flex items-center justify-center text-center text-[10px] font-black uppercase tracking-widest ${leaderboardStatusClass}`}>
              {leaderboardStatusLabel}
            </div>
            <button
              onClick={() => navigate('/leaderboards')}
              className="px-4 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              View
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Active Perks Indicator */}
        {(user?.streak_freeze_active || timeLeft) && (
          <div className="flex gap-4 mb-2">
            {user?.streak_freeze_active && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                <div className="bg-yellow-100 dark:bg-yellow-800 p-1.5 rounded-full">
                  <Shield size={16} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-yellow-800 dark:text-yellow-200 font-bold text-sm tracking-tight">Streak Freeze Active</span>
              </div>
            )}

            {timeLeft && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700/50 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full animate-pulse">
                  <Flame size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-800 dark:text-blue-200 font-bold text-sm tracking-tight">Double XP Active — {timeLeft}</span>
              </div>
            )}
          </div>
        )}

        {/* Top Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-yellow-100 dark:hover:border-yellow-900/50 transition-colors">
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Flame size={24} className="text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Current Streak</p>
              <p className="text-slate-900 dark:text-white font-extrabold text-2xl">{user?.streak || 0} Days</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-blue-200 dark:hover:border-blue-700/50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
              <Target size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Total XP</p>
              <p className="text-slate-900 dark:text-white font-extrabold text-2xl">{user?.xp || 0} XP</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-blue-200 dark:hover:border-blue-700/50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Quiz Sets</p>
              <p className="text-slate-900 dark:text-white font-extrabold text-2xl">{stats.quiz_sets_done} Done</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-center hover:border-blue-200 dark:hover:border-blue-700/50 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Level {Math.floor((user?.xp || 0) / 100) + 1}</p>
              <p className="text-blue-600 dark:text-blue-400 text-xs font-black">{(user?.xp || 0) % 100} / 100 XP</p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(user?.xp || 0) % 100}%` }}
              ></div>
            </div>
          </div>
        </div>



        {/* Full-width Subjects Grid */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-1 tracking-tight">Reviewer Subjects</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject) => {
              const subjectMastery = stats.mastery[subject.id] || 0;
              // Adjust colors for dark mode context
              const darkColor = subject.color.replace('50', '900/30');
              const darkBorderColor = subject.borderColor.replace('100', '700/50').replace('200', '700/50');
              const Icon = subject.icon;

              return (
              <div
                key={subject.id}
                onClick={() => navigate(`/learn/${subject.id}`)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md group flex flex-col transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl ${subject.color} dark:${darkColor} ${subject.borderColor} dark:${darkBorderColor} border flex items-center justify-center`}>
                    <Icon size={28} className={subject.iconClass} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full">{subjectMastery}% Mastery</span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                  {subject.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed flex-grow">
                  {subject.description}
                </p>
              </div>
            )})}
          </div>
        </div>

        {/* Mock Exam CTA at Bottom */}
        {stats.mock_exam && (
          <div className={`mt-8 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg ${
            canTakeMockExam
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-600/20'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-slate-200/60 dark:shadow-black/10'
          }`}>
            <div className="text-white flex-1">
              <h2 className={`text-2xl font-black mb-4 flex items-center gap-3 ${canTakeMockExam ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                <Target size={28} className={canTakeMockExam ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'} />
                Full-Length Mock Exam
              </h2>
              <div className={`space-y-2 mb-4 p-4 rounded-lg border ${canTakeMockExam ? 'bg-white/10 border-white/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                <p className={`font-bold text-sm md:text-base ${canTakeMockExam ? 'text-blue-50' : 'text-slate-700 dark:text-slate-200'}`}>
                  <span className={canTakeMockExam ? 'text-yellow-400' : 'text-blue-600 dark:text-blue-400'}>{mockExamLevelLabel}:</span>
                  {' '}{mockExamDuration}
                </p>
                <p className={`text-xs font-black uppercase tracking-widest ${canTakeMockExam ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {mockExamStatusLabel}
                  {!isPremiumMockUser && ` - ${mockExam.attempts_remaining} remaining`}
                </p>
              </div>
              <p className={`font-medium max-w-2xl text-sm leading-relaxed ${canTakeMockExam ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {mockExamDescription}
              </p>
              {mockExam.attempt_count > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                  <div className={`rounded-lg px-4 py-3 border ${canTakeMockExam ? 'bg-white/10 border-white/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${canTakeMockExam ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>Best Score</p>
                    <p className={`text-sm font-black ${canTakeMockExam ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {formatMockResult(mockExam.best_result)}
                    </p>
                  </div>
                  <div className={`rounded-lg px-4 py-3 border ${canTakeMockExam ? 'bg-white/10 border-white/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${canTakeMockExam ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>Latest Attempt</p>
                    <p className={`text-sm font-black ${canTakeMockExam ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {formatMockResult(mockExam.latest_result)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              {canTakeMockExam && userClass ? (
                <button
                  onClick={() => navigate(`/mock-exam?level=${userClass.toLowerCase()}`)}
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black px-8 py-3.5 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm"
                >
                  {isPremiumMockUser && mockExam.attempt_count > 0 ? 'Retake Mock Exam' : 'Take Mock Exam'}
                </button>
              ) : canTakeMockExam ? (
                <button
                  onClick={() => navigate('/select-class')}
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black px-8 py-3.5 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm"
                >
                  Select Category
                </button>
              ) : (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 font-black px-8 py-3.5 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm"
                >
                  Upgrade For Retakes
                </button>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}



