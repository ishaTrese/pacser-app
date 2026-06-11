import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/axios';
import { Users, FileText, Database, Edit, Plus, Trash2 } from 'lucide-react';

const defaultPagination = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
  from: null,
  to: null,
};

const defaultFilters = {
  subject_id: '',
  quiz_set_id: '',
  difficulty: '',
  is_pretest: '',
  search: '',
  page: 1,
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_users: 0, total_questions: 0, total_quiz_sets: 0 });
  const [questions, setQuestions] = useState([]);
  const [quizSets, setQuizSets] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [error, setError] = useState('');

  const subjects = useMemo(() => {
    const mapped = new Map();
    quizSets.forEach((set) => {
      if (set.subject?.id) {
        mapped.set(set.subject.id, set.subject);
      }
    });

    return Array.from(mapped.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [quizSets]);

  const visibleQuizSets = useMemo(() => {
    if (!filters.subject_id) return quizSets;

    return quizSets.filter((set) => String(set.subject_id) === String(filters.subject_id));
  }, [filters.subject_id, quizSets]);

  const fetchQuestions = useCallback(async (page = filters.page) => {
    if (!user || user.role !== 'admin') return;

    setQuestionLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '20',
      });

      ['subject_id', 'quiz_set_id', 'difficulty', 'is_pretest', 'search'].forEach((key) => {
        if (filters[key]) {
          params.set(key, filters[key]);
        }
      });

      const res = await api.get(`/admin/questions?${params.toString()}`);
      setQuestions(res.data.questions || []);
      setPagination(res.data.pagination || defaultPagination);
    } catch (err) {
      console.error('Question bank fetch error', err);
      setError('Failed to load question bank.');
      setQuestions([]);
      setPagination(defaultPagination);
    } finally {
      setQuestionLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    if (!user) return;

    if (user.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchMeta = async () => {
      try {
        const [statsRes, quizSetsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/quiz-sets'),
        ]);
        setStats(statsRes.data);
        setQuizSets(quizSetsRes.data.quiz_sets || []);
      } catch (err) {
        console.error('Admin metadata fetch error', err);
        setError('Failed to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    fetchQuestions(filters.page);
  }, [fetchQuestions, filters.page, user]);

  const updateFilter = (key, value) => {
    setFilters((current) => {
      const next = {
        ...current,
        [key]: value,
        page: 1,
      };

      if (key === 'subject_id') {
        next.quiz_set_id = '';
      }

      return next;
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), pagination.last_page || 1);
    setFilters((current) => ({ ...current, page: nextPage }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/admin/questions/${id}`);

        if (questions.length === 1 && pagination.current_page > 1) {
          goToPage(pagination.current_page - 1);
        } else {
          fetchQuestions(pagination.current_page);
        }
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete question');
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 p-10">Loading Admin...</div>;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">403 Forbidden</h1>
        <p className="text-slate-500 text-lg">You do not have permission to access the admin panel.</p>
        <Link to="/dashboard" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl"><Users className="text-blue-600" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
              <p className="text-2xl font-black text-slate-900">{stats.total_users}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl"><Database className="text-green-600" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quiz Sets</p>
              <p className="text-2xl font-black text-slate-900">{stats.total_quiz_sets}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl"><FileText className="text-purple-600" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Questions</p>
              <p className="text-2xl font-black text-slate-900">{stats.total_questions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Manage Questions</h2>
              <p className="text-sm text-slate-500">
                {pagination.total > 0
                  ? `Showing ${pagination.from || 0}-${pagination.to || 0} of ${pagination.total} questions`
                  : 'Search and filter the question bank.'}
              </p>
            </div>
            <Link
              to="/admin/question/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm w-fit"
            >
              <Plus size={18} /> New Question
            </Link>
          </div>

          <div className="p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <select
              value={filters.subject_id}
              onChange={(e) => updateFilter('subject_id', e.target.value)}
              className="border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>

            <select
              value={filters.quiz_set_id}
              onChange={(e) => updateFilter('quiz_set_id', e.target.value)}
              className="border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All quiz sets</option>
              {visibleQuizSets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.subject?.name || 'Unknown'} - {set.name}
                </option>
              ))}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => updateFilter('difficulty', e.target.value)}
              className="border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All difficulty</option>
              <option value="easy">Easy</option>
              <option value="average">Average</option>
              <option value="difficult">Difficult</option>
            </select>

            <select
              value={filters.is_pretest}
              onChange={(e) => updateFilter('is_pretest', e.target.value)}
              className="border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All question types</option>
              <option value="true">Pretest only</option>
              <option value="false">Practice only</option>
            </select>

            <input
              type="search"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search question text"
              className="border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={clearFilters}
              className="border border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-lg p-2.5 text-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>

          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Quiz Set</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Question Text</th>
                  <th className="p-4">Pretest</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questionLoading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-sm font-bold text-slate-500">
                      Loading questions...
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-sm font-bold text-slate-500">
                      No questions match these filters.
                    </td>
                  </tr>
                ) : questions.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-500">#{q.id}</td>
                    <td className="p-4 text-sm font-bold text-slate-900">{q.quiz_set?.subject?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-slate-600">{q.quiz_set?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded capitalize">
                        {q.quiz_set?.difficulty || 'average'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-700 truncate max-w-xs">{q.question_text}</td>
                    <td className="p-4">
                      {q.is_pretest
                        ? <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">Yes</span>
                        : <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">No</span>
                      }
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/question/${q.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 mr-4"
                      >
                        <Edit size={16} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {pagination.current_page || 1} of {pagination.last_page || 1}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage((pagination.current_page || 1) - 1)}
                disabled={questionLoading || (pagination.current_page || 1) <= 1}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage((pagination.current_page || 1) + 1)}
                disabled={questionLoading || (pagination.current_page || 1) >= (pagination.last_page || 1)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
