import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import CategoryBadge from '../components/ui/CategoryBadge'
import { Flame, BookOpen, Target, ChevronRight, Shield, Gift, Compass, Trophy } from 'lucide-react'
import api from '../api/axios'
import { getExamLevelKey, getSubjectsForClass } from '../config/examSubjects'

const cardInset = 'bg-slate-50/70 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-700/70 p-2.5 sm:p-3'
const sectionEyebrow = 'text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500'
const sectionEyebrowAccent = 'text-[11px] sm:text-xs font-bold text-blue-600 dark:text-blue-400'
const iconBox = 'w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border'
const iconBoxBlue = `${iconBox} bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-700/50`
const btnTouch = 'min-h-11 px-4 sm:px-5'
const btnPrimary = `${btnTouch} py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto`
const btnSecondary = `${btnTouch} py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 text-sm w-full sm:w-auto`
const btnTertiary = 'min-h-11 px-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1'
const heroCard = 'bg-gradient-to-br from-white via-white to-blue-50/80 dark:from-slate-800 dark:via-slate-800 dark:to-blue-950/35 border border-blue-200 dark:border-blue-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg shadow-blue-600/10 ring-2 ring-blue-500/15'
const focusCard = 'bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/60 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg shadow-blue-600/10'
const statTile = 'bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70 rounded-xl sm:rounded-2xl p-2.5 shadow-none flex items-center gap-2 min-w-[8.75rem] sm:min-w-0'
const gameCard = 'bg-white/80 dark:bg-slate-800/75 border border-slate-100 dark:border-slate-700/70 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-none'
const gameInset = `${cardInset} lg:p-2`
const quietIconBox = 'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'
const missionActionBtn = 'shrink-0 min-h-11 lg:min-h-8 px-3 py-2 lg:px-2 lg:py-1 rounded-lg text-[10px] font-semibold'

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
  const completedMissionCount = missions.filter(mission => mission.is_completed).length
  const missionProgressPercent = missions.length > 0 ? Math.round((completedMissionCount / missions.length) * 100) : 0
  const currentXp = user?.xp || 0
  const currentLevel = Math.floor(currentXp / 100) + 1
  const xpInCurrentLevel = currentXp % 100
  const xpNeededForNextLevel = 100 - xpInCurrentLevel
  const rankNames = {
    1: 'Applicant',
    2: 'Clerk',
    3: 'Officer',
    4: 'Supervisor',
    5: 'Director',
    6: 'Secretary',
    7: 'Commissioner',
    8: 'Civil Service Champion'
  }
  const rankPerks = {
    1: 'Base XP and Points',
    2: '+5% XP Bonus',
    3: '+10% XP, +5% Points Bonus',
    4: '+15% XP, +10% Points, 1 free Energy refill/week',
    5: '+20% XP, +15% Points, 2 free Energy refills/week',
    6: '+25% XP, +20% Points, 1 free Streak Freeze/week',
    7: '+30% XP, +25% Points, Double XP on Mondays',
    8: '+50% XP, +50% Points, All perks unlocked permanently'
  }
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
          : 'A recommended reviewer challenge is ready.',
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
  const hasContinueLearningCard = Boolean(continueLearning)
  const allReviewerSetsCompleted = Boolean(userClass && user?.pretest_completed && subjects.length > 0 && !continueLearning)
  const continueLearningTitle = continueLearning?.quiz_set_title || (allReviewerSetsCompleted ? 'All reviewer sets completed' : 'Choose your next reviewer set')
  const continueLearningSubject = continueLearning?.subject_name || userClass || 'Reviewer'
  const continueLearningDescription = continueLearning?.message || (
    allReviewerSetsCompleted
      ? 'Great work. Continue with a mock exam or revisit weak subjects to improve readiness.'
      : userClass
      ? 'A recommended reviewer challenge is ready.'
      : 'Select your exam category so PACSER can recommend your next quiz set.'
  )
  const nextQuestDescription = continueLearning?.quiz_set_id
    ? `Continue studying to earn XP toward Level ${currentLevel + 1}.`
    : continueLearningDescription
  const continueLearningPrimaryLabel = continueLearning?.is_locked
    ? 'View Subject'
    : continueLearning?.quiz_set_id
      ? 'Continue Quiz'
      : userClass
        ? 'Continue'
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
    ? 'Unlimited mock retakes and premium sets are active.'
    : hasUsedFreeMockAttempt
      ? 'Unlock retakes and progress tracking.'
      : hasPremiumLockedRecommendation
        ? `${continueLearning.quiz_set_title} is a Premium quiz set. Unlock it when you are ready for advanced practice.`
        : 'Use Premium for unlimited mock exam retakes, premium quiz set access, and extra practice when you need more reps.'
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
  const currentRankId = leaderboardSnapshot?.rank_id || user?.rank_id || 1
  const currentRankName = leaderboardSnapshot?.rank_name || rankNames[currentRankId] || 'Applicant'
  const currentRankPerk = rankPerks[currentRankId] || rankPerks[1]
  const leaderboardZoneLabel = leaderboardSnapshot?.promotion_status === 'promotion_zone'
    ? 'Promotion zone'
    : leaderboardSnapshot?.promotion_status === 'demotion_zone'
      ? 'Demotion zone'
      : 'Safe zone'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors overflow-x-hidden">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-8 sm:pb-12 flex flex-col gap-4 sm:gap-5 min-w-0">

        {/* Greeting */}
        <div className="order-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center flex-wrap gap-x-2">
            Welcome back, {displayName}!
            <CategoryBadge />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5 text-xs sm:text-sm max-w-2xl">
            Build momentum, clear today's quests, and keep your reviewer progress moving.
          </p>
        </div>

        {/* Progress Hub */}
        <div className="order-1 rounded-2xl sm:rounded-3xl border border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950 p-4 sm:p-6 shadow-xl shadow-blue-600/10 flex flex-col gap-4 max-w-full">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="min-w-0">
              <p className={sectionEyebrowAccent}>Progress Hub</p>
              <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                {displayName}
              </h2>
              <p className="mt-1 text-base font-bold text-slate-700 dark:text-slate-200">
                Level {currentLevel} Reviewer
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                {xpInCurrentLevel} / 100 XP to Level {currentLevel + 1}
              </p>
              <div className="mt-4 h-4 rounded-full bg-white/80 dark:bg-slate-800 border border-blue-100 dark:border-blue-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${xpInCurrentLevel}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <button
                onClick={dailyAction.primaryAction}
                className="min-h-12 px-5 py-3 rounded-xl bg-blue-600 text-white font-extrabold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                {dailyAction.primaryLabel}
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => navigate(canTakeMockExam ? mockExamPath : '/profile')}
                className="min-h-12 px-5 py-3 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-blue-100 dark:border-blue-800 text-slate-700 dark:text-slate-100 font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
              >
                {canTakeMockExam ? 'Take Mock Exam' : 'Mock Status'}
                <Target size={16} />
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-0.5 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-2 sm:overflow-visible scrollbar-none max-w-full">
            <div className={`${statTile} snap-start shrink-0 sm:shrink`}>
              <div className={`${iconBox} bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100 dark:border-yellow-700/50`}>
                <Flame size={16} className="text-yellow-500 dark:text-yellow-400" />
              </div>
              <div className="min-w-0">
                <p className={sectionEyebrow}>Current Streak</p>
                <p className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg truncate">{user?.streak || 0} Days</p>
              </div>
            </div>

            <div className={`${statTile} snap-start shrink-0 sm:shrink`}>
              <div className={iconBoxBlue}>
                <Target size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className={sectionEyebrow}>All-Time XP</p>
                <p className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg truncate">{currentXp} XP</p>
              </div>
            </div>

            <div className={`${statTile} snap-start shrink-0 sm:shrink`}>
              <div className={iconBoxBlue}>
                <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className={sectionEyebrow}>Quiz Sets</p>
                <p className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg truncate">{stats.quiz_sets_done} Done</p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70 rounded-xl sm:rounded-2xl p-2.5 flex flex-col justify-center snap-start shrink-0 w-[8.75rem] sm:w-auto sm:shrink col-span-1">
              <div className="flex justify-between items-center mb-1">
                <p className={sectionEyebrow}>Current Rank</p>
                <p className="text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold">
                  {currentRankName}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">{currentRankPerk}</p>
            </div>
          </div>

          {(user?.streak_freeze_active || timeLeft) && (
            <div className="flex flex-wrap gap-2">
              {user?.streak_freeze_active && (
                <div className="bg-white/80 dark:bg-slate-800/80 border border-yellow-100 dark:border-yellow-800/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <Shield size={14} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
                  <span className="text-yellow-800 dark:text-yellow-200 font-semibold text-xs sm:text-sm">Streak Freeze Active</span>
                </div>
              )}
              {timeLeft && (
                <div className="bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-blue-800/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <Flame size={14} className="text-blue-600 dark:text-blue-400 shrink-0 animate-pulse" />
                  <span className="text-blue-800 dark:text-blue-200 font-semibold text-xs sm:text-sm">Double XP Active — {timeLeft}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daily Action Panel — hero */}
        <div className="hidden">
          <div className="flex gap-3 min-w-0">
            <div className={`${iconBoxBlue} w-11 h-11 sm:w-12 sm:h-12 shadow-sm shadow-blue-600/10`}>
              <DailyActionIcon size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className={sectionEyebrowAccent}>{dailyAction.label}</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">{dailyAction.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-0.5 max-w-2xl">{dailyAction.description}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            {dailyAction.secondaryLabel && (
              <button
                onClick={dailyAction.secondaryAction}
                className={btnSecondary}
              >
                {dailyAction.secondaryLabel}
              </button>
            )}
            <button
              onClick={dailyAction.primaryAction}
              className={btnPrimary}
            >
              {dailyAction.primaryLabel}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Two-column layout: Learning | Gamification */}
        <div className="order-3 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

          {/* Learning column */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 min-w-0">

            {/* Next Quest */}
            {true && (
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/70 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-lg shadow-indigo-600/10 flex flex-col gap-4">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div className={`${iconBoxBlue} w-11 h-11 sm:w-12 sm:h-12 shadow-sm shadow-blue-600/10`}>
                    <BookOpen size={22} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">Next Quest</p>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                      {hasContinueLearningCard || allReviewerSetsCompleted ? continueLearningTitle : dailyAction.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-2xl">
                      {!allReviewerSetsCompleted && (
                        <span className="font-semibold text-slate-700 dark:text-slate-200 mr-1">
                          {continueLearningSubject}
                        </span>
                      )}
                      {hasContinueLearningCard || allReviewerSetsCompleted ? nextQuestDescription : dailyAction.description}
                    </p>
                    {continueLearning?.recommendation_reason && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                        {continueLearning.recommendation_reason.replace(/_/g, ' ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className={cardInset}>
                    <p className={sectionEyebrow}>Quiz Sets Done</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{stats.quiz_sets_done}</p>
                  </div>
                  <div className={cardInset}>
                    <p className={sectionEyebrow}>Average Mastery</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{Math.round(averageMastery)}%</p>
                  </div>
                  <button
                    onClick={() => navigate('/learn')}
                    className={`${cardInset} text-left hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors`}
                  >
                    <p className={sectionEyebrow}>Browse Subjects</p>
                    <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-300">{subjects.length} available</p>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                  {continueLearning?.is_locked && (
                    <button
                      onClick={() => navigate('/profile')}
                      className={`${btnSecondary} sm:col-start-2`}
                    >
                      Upgrade
                    </button>
                  )}
                  <button
                    onClick={allReviewerSetsCompleted ? () => navigate(canTakeMockExam ? mockExamPath : '/profile') : hasContinueLearningCard ? handleContinueLearning : dailyAction.primaryAction}
                    className="min-h-11 px-5 py-2.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-sm w-full sm:col-start-3"
                  >
                    {allReviewerSetsCompleted ? 'Take Mock Exam' : hasContinueLearningCard ? 'Continue' : dailyAction.primaryLabel}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Exam Readiness Milestone */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className={quietIconBox}>
                    <Target size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={sectionEyebrow}>Exam Readiness Milestone</p>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-0.5">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {hasReadinessData ? `${readinessScore}% - ${readinessLabel}` : 'Start building your readiness'}
                      </h2>
                      {hasReadinessData && (
                        <div className="flex-1 min-w-[6rem] max-w-[10rem]">
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-700"
                              style={{ width: `${readinessScore}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {!hasReadinessData
                        ? 'Complete your pretest or first quiz set to reveal a clearer next move.'
                        : weakSubjects.length > 0
                          ? `Best next move: review ${weakSubjects[0].title}.`
                          : canTakeMockExam
                            ? 'Your study signals look steady. A mock exam can validate exam-day readiness.'
                            : 'Keep building consistency through reviewer sets.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReadinessAction}
                  className={`${btnSecondary} shrink-0`}
                >
                  {readinessCtaLabel}
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {['Getting Started', 'Building Foundation', 'Nearly Ready', 'Exam Ready'].map(tier => (
                  <div
                    key={tier}
                    className={`rounded-md border px-2 py-1.5 text-center text-[10px] font-semibold ${
                      tier === readinessLabel
                        ? 'border-blue-100 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300'
                        : 'border-slate-100/70 dark:border-slate-800 bg-transparent text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {tier}
                  </div>
                ))}
              </div>

              <details className="group mt-3 rounded-lg border border-slate-100 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-900/30">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
                  <span>Readiness signals</span>
                  <ChevronRight size={15} className="transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    <div className={cardInset}>
                      <p className={sectionEyebrow}>Subject Mastery</p>
                      <p className="text-slate-900 dark:text-white font-bold text-base mt-0.5">{Math.round(averageMastery)}%</p>
                    </div>
                    <div className={cardInset}>
                      <p className={sectionEyebrow}>Best Mock</p>
                      <p className="text-slate-900 dark:text-white font-bold text-base mt-0.5">
                        {mockExam.best_result ? `${mockExam.best_result.percentage}%` : 'Not taken'}
                      </p>
                    </div>
                    <div className={cardInset}>
                      <p className={sectionEyebrow}>Latest Mock</p>
                      <p className="text-slate-900 dark:text-white font-bold text-base mt-0.5">
                        {latestMockPercentage !== null ? `${latestMockPercentage}%` : 'Not taken'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <p className={`${sectionEyebrow} mb-1.5`}>Weak Subjects</p>
                    {weakSubjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {weakSubjects.map(subject => (
                          <button
                            key={subject.id}
                            onClick={() => navigate(`/learn/${subject.id}`)}
                            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
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
              </details>
            </div>

            {/* Mock Exam Challenge */}
            {stats.mock_exam && (
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5">
                      <p className={sectionEyebrow}>Challenge Mode</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Target size={17} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Full-Length Mock Exam
                        </h2>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span className="text-slate-800 dark:text-slate-100 font-semibold">{mockExamLevelLabel}:</span>
                      {' '}{mockExamDuration}
                    </p>
                    <p className="text-[11px] font-semibold mt-0.5 text-slate-500 dark:text-slate-400">
                      {mockExamStatusLabel}
                      {!isPremiumMockUser && ` - ${mockExam.attempts_remaining} remaining`}
                    </p>
                    <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                      {mockExamDescription}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto shrink-0">
                    {canTakeMockExam && userClass ? (
                      <button
                        onClick={() => navigate(`/mock-exam?level=${userClass.toLowerCase()}`)}
                        className={btnSecondary}
                      >
                        {isPremiumMockUser && mockExam.attempt_count > 0 ? 'Retake Challenge' : 'Start Challenge'}
                      </button>
                    ) : canTakeMockExam ? (
                      <button
                        onClick={() => navigate('/select-class')}
                        className={btnSecondary}
                      >
                        Select Category
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/profile')}
                        className={btnSecondary}
                      >
                        Upgrade For Retakes
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="rounded-lg px-3 py-2 border bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-semibold text-slate-400">Best Score</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{formatMockResult(mockExam.best_result)}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2 border bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-semibold text-slate-400">Latest Score</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{formatMockResult(mockExam.latest_result)}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2 border bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-semibold text-slate-400">Attempts</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{mockExam.attempt_count || 0}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2 border bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-semibold text-slate-400">Readiness</p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{readinessScore}%</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Gamification column */}
          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5 min-w-0">

            {/* Study Streak Card */}
            <div className={`${gameCard} order-4`}>
              <div className="flex items-center gap-2.5 lg:gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  isStreakSafeToday
                    ? 'bg-emerald-50/70 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50'
                    : 'bg-yellow-50/70 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/50'
                }`}>
                  <Flame size={16} className={isStreakSafeToday ? 'text-emerald-500 dark:text-emerald-400' : 'text-yellow-500 dark:text-yellow-400'} />
                </div>
                <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className={sectionEyebrow}>Study Streak</p>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
                      {streakStatus?.current_streak || 0} Day{(streakStatus?.current_streak || 0) === 1 ? '' : 's'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{streakStatusTitle}</p>
                  </div>
                  <button
                    onClick={handleStreakAction}
                    className="shrink-0 min-h-9 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-1"
                  >
                    Open
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Missions Widget */}
            <div className={`${gameCard} order-1 border-emerald-200 dark:border-emerald-800/70`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-300">Daily Missions</p>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {completedMissionCount}/{missions.length || 0} missions cleared
                  </h2>
                  {completedUnclaimedMissions.length > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      {completedUnclaimedMissions.length} reward{completedUnclaimedMissions.length === 1 ? '' : 's'} ready
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${missionProgressPercent}%` }}
                ></div>
              </div>

              {missions.length === 0 ? (
                <div className={`${gameInset} mt-2`}>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No missions available today.</p>
                </div>
              ) : (
                <details
                  open
                  className="group mt-2 rounded-lg border border-slate-100 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-900/30"
                >
                  <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-300 flex items-center justify-between gap-2">
                    <span>Mission details</span>
                    <ChevronRight size={14} className="transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-2.5 pb-2.5 flex flex-col gap-2 lg:gap-1.5">
                  {missions.map((mission) => {
                    const progressPercent = mission.target > 0 ? Math.min(100, (mission.progress / mission.target) * 100) : 0
                    const isClaimable = mission.is_completed && !mission.is_claimed
                    const isClaimed = mission.is_claimed

                    return (
                      <div
                        key={mission.id}
                        className={`rounded-lg border p-2.5 lg:p-2 transition-colors ${
                          isClaimable
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/60'
                            : 'bg-white dark:bg-slate-800/70 border-slate-100 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 lg:gap-1 mb-1 lg:mb-0.5">
                          <div className="min-w-0">
                            <h3 className="text-xs lg:text-[11px] font-bold text-slate-900 dark:text-white">{getMissionTitle(mission.mission_type)}</h3>
                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
                              {mission.progress}/{mission.target} complete - +{mission.points_reward} pts
                            </p>
                          </div>
                          {isClaimable ? (
                            <button
                              onClick={() => handleClaimMission(mission.id)}
                              disabled={claimingMissionId === mission.id}
                              className={`${missionActionBtn} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors`}
                            >
                              {claimingMissionId === mission.id ? 'Claiming' : 'Claim'}
                            </button>
                          ) : isClaimed ? (
                            <button
                              disabled
                              className={`${missionActionBtn} bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-not-allowed`}
                            >
                              Claimed
                            </button>
                          ) : (
                            <span className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-700/80 px-2 py-1 lg:px-1.5 lg:py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              In Progress
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 lg:h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={mission.is_completed ? 'h-full bg-emerald-500' : 'h-full bg-blue-500'}
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                  </div>
                </details>
              )}
            </div>

            {/* Leaderboard Snapshot */}
            <div className={`${gameCard} order-2 border-amber-200 dark:border-amber-800/70`}>
              <div className="flex items-center gap-2 lg:gap-1.5">
                <div className={quietIconBox}>
                  <Trophy size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-300">Leaderboard Climb</p>
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                        {leaderboardSnapshot?.rank_name || 'Applicant'} League
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {leaderboardSnapshot?.position ? `#${leaderboardSnapshot.position}` : '-'}
                        <span className="mx-1">/</span>
                        {leaderboardSnapshot?.total_users || 0}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {leaderboardSnapshot?.xp_to_next_user
                          ? `${leaderboardSnapshot.xp_to_next_user} XP to pass next user`
                          : `${leaderboardSnapshot?.weekly_xp || 0} weekly XP`}
                      </p>
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-300 mt-0.5">
                        {leaderboardZoneLabel}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/leaderboards')}
                      className={`${btnTertiary} lg:min-h-8 lg:py-0 shrink-0`}
                    >
                      View
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Value Module */}
            <div className={`${gameCard} order-5 ${!isPremiumUser ? 'border-dashed' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  isPremiumUser
                    ? 'bg-emerald-50/70 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700'
                }`}>
                  <Shield size={16} className={isPremiumUser ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={sectionEyebrow}>
                    {isPremiumUser ? 'Premium Benefits' : 'Premium Option'}
                  </p>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">{premiumModuleTitle}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{premiumModuleDescription}</p>
                </div>
                <div className="w-full sm:w-auto shrink-0">
                  <button
                    onClick={handlePremiumAction}
                    className="min-h-9 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors inline-flex items-center justify-center gap-1 w-full sm:w-auto"
                  >
                    {premiumPrimaryLabel}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}



