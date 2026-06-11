import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/axios';
import { Users, FileText, Database, Edit, Plus, Trash2, Save, X, Upload, Download } from 'lucide-react';

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

const defaultQuizSetForm = {
  id: null,
  subject_id: '',
  name: '',
  order_index: 1,
  difficulty: 'average',
  is_premium: false,
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('questions');
  const [stats, setStats] = useState({ total_users: 0, total_questions: 0, total_quiz_sets: 0 });
  const [questions, setQuestions] = useState([]);
  const [quizSets, setQuizSets] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [quizSetSaving, setQuizSetSaving] = useState(false);
  const [error, setError] = useState('');
  const [quizSetMessage, setQuizSetMessage] = useState('');
  const [quizSetErrors, setQuizSetErrors] = useState([]);
  const [quizSetForm, setQuizSetForm] = useState(defaultQuizSetForm);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [accessCodeLoading, setAccessCodeLoading] = useState(false);
  const [accessCodeSaving, setAccessCodeSaving] = useState(false);
  const [accessCodeForm, setAccessCodeForm] = useState('');
  const [accessCodeMessage, setAccessCodeMessage] = useState('');
  const [accessCodeErrors, setAccessCodeErrors] = useState([]);
  const [accessCodeFilters, setAccessCodeFilters] = useState({ status: '', search: '' });

  const visibleQuizSets = useMemo(() => {
    if (!filters.subject_id) return quizSets;

    return quizSets.filter((set) => String(set.subject_id) === String(filters.subject_id));
  }, [filters.subject_id, quizSets]);

  const formatBackendErrors = (err, fallback) => {
    const errors = err.response?.data?.errors;
    if (errors) {
      return Object.values(errors).flat();
    }

    return [err.response?.data?.message || fallback];
  };

  const fetchQuizSets = useCallback(async () => {
    const quizSetsRes = await api.get('/admin/quiz-sets');
    setQuizSets(quizSetsRes.data.quiz_sets || []);
    setSubjects(quizSetsRes.data.subjects || []);
  }, []);

  const fetchAccessCodes = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    setAccessCodeLoading(true);
    setAccessCodeErrors([]);

    try {
      const params = new URLSearchParams();
      if (accessCodeFilters.status) params.set('status', accessCodeFilters.status);
      if (accessCodeFilters.search) params.set('search', accessCodeFilters.search);

      const query = params.toString();
      const res = await api.get(`/admin/access-codes${query ? `?${query}` : ''}`);
      setAccessCodes(res.data.access_codes || []);
    } catch (err) {
      console.error('Access code fetch error', err);
      setAccessCodeErrors(formatBackendErrors(err, 'Failed to load access codes.'));
    } finally {
      setAccessCodeLoading(false);
    }
  }, [accessCodeFilters, user]);

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
        const statsRes = await api.get('/admin/stats');
        await fetchQuizSets();
        setStats(statsRes.data);
      } catch (err) {
        console.error('Admin metadata fetch error', err);
        setError('Failed to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [fetchQuizSets, user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    fetchQuestions(filters.page);
  }, [fetchQuestions, filters.page, user]);

  useEffect(() => {
    if (activeTab === 'access_codes') {
      fetchAccessCodes();
    }
  }, [activeTab, fetchAccessCodes]);

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

  const updateQuizSetForm = (key, value) => {
    setQuizSetForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validateQuizSetForm = () => {
    const errors = [];

    if (!quizSetForm.subject_id) {
      errors.push('Select a subject.');
    }

    if (!quizSetForm.name.trim()) {
      errors.push('Quiz set name cannot be blank.');
    }

    if (!Number.isInteger(Number(quizSetForm.order_index)) || Number(quizSetForm.order_index) < 1) {
      errors.push('Order must be a whole number of 1 or higher.');
    }

    if (!['easy', 'average', 'difficult'].includes(quizSetForm.difficulty)) {
      errors.push('Select a valid difficulty.');
    }

    return errors;
  };

  const resetQuizSetForm = () => {
    setQuizSetForm(defaultQuizSetForm);
    setQuizSetErrors([]);
    setQuizSetMessage('');
  };

  const editQuizSet = (quizSet) => {
    setQuizSetForm({
      id: quizSet.id,
      subject_id: quizSet.subject_id,
      name: quizSet.name,
      order_index: quizSet.order_index,
      difficulty: quizSet.difficulty || 'average',
      is_premium: !!quizSet.is_premium,
    });
    setQuizSetErrors([]);
    setQuizSetMessage('');
    setActiveTab('quiz_sets');
  };

  const saveQuizSet = async () => {
    const errors = validateQuizSetForm();
    if (errors.length > 0) {
      setQuizSetErrors(errors);
      return;
    }

    setQuizSetSaving(true);
    setQuizSetErrors([]);
    setQuizSetMessage('');

    const payload = {
      subject_id: quizSetForm.subject_id,
      name: quizSetForm.name,
      order_index: Number(quizSetForm.order_index),
      difficulty: quizSetForm.difficulty,
      is_premium: !!quizSetForm.is_premium,
    };

    try {
      const res = quizSetForm.id
        ? await api.put(`/admin/quiz-sets/${quizSetForm.id}`, payload)
        : await api.post('/admin/quiz-sets', payload);

      setQuizSetMessage(res.data.message || 'Quiz set saved.');
      setQuizSetForm(defaultQuizSetForm);
      await fetchQuizSets();
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      fetchQuestions(filters.page);
    } catch (err) {
      console.error('Failed to save quiz set', err);
      setQuizSetErrors(formatBackendErrors(err, 'Failed to save quiz set.'));
    } finally {
      setQuizSetSaving(false);
    }
  };

  const deleteQuizSet = async (quizSet) => {
    if (quizSet.questions_count > 0) return;

    if (window.confirm(`Delete "${quizSet.name}"?`)) {
      try {
        const res = await api.delete(`/admin/quiz-sets/${quizSet.id}`);
        setQuizSetMessage(res.data.message || 'Quiz set deleted.');
        await fetchQuizSets();
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
        fetchQuestions(filters.page);
      } catch (err) {
        console.error('Failed to delete quiz set', err);
        setQuizSetErrors(formatBackendErrors(err, 'Failed to delete quiz set.'));
      }
    }
  };

  const selectedImportFile = (file) => {
    setImportFile(file);
    setImportPreview(null);
    setImportMessage('');
    setImportErrors([]);
  };

  const previewImport = async () => {
    if (!importFile) {
      setImportErrors(['Choose a CSV file first.']);
      return;
    }

    setImportLoading(true);
    setImportErrors([]);
    setImportMessage('');
    setImportPreview(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.post('/admin/questions/import-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportPreview(res.data);
      setImportMessage('Preview complete. Review errors and duplicate warnings before importing.');
    } catch (err) {
      console.error('Import preview failed', err);
      setImportErrors(formatBackendErrors(err, 'Failed to preview import.'));
    } finally {
      setImportLoading(false);
    }
  };

  const runImport = async () => {
    if (!importFile || !importPreview || importPreview.invalid_row_count > 0) return;

    setImportLoading(true);
    setImportErrors([]);
    setImportMessage('');

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.post('/admin/questions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportMessage(`Import complete. Imported ${res.data.imported_count || 0} questions and skipped ${res.data.skipped_duplicate_count || 0} duplicates.`);
      setImportPreview(null);
      setImportFile(null);
      await fetchQuizSets();
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      fetchQuestions(filters.page);
    } catch (err) {
      console.error('Import failed', err);
      setImportErrors(formatBackendErrors(err, 'Failed to import CSV.'));
      if (err.response?.data?.summary) {
        setImportPreview(err.response.data.summary);
      }
    } finally {
      setImportLoading(false);
    }
  };

  const exportQuestions = async () => {
    const params = new URLSearchParams();
    ['subject_id', 'quiz_set_id', 'difficulty', 'is_pretest', 'search'].forEach((key) => {
      if (filters[key]) {
        params.set(key, filters[key]);
      }
    });

    const query = params.toString();

    setExportLoading(true);
    setImportErrors([]);

    try {
      const res = await api.get(`/admin/questions/export${query ? `?${query}` : ''}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pacser-question-bank.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      setImportErrors(['Failed to export question bank CSV.']);
    } finally {
      setExportLoading(false);
    }
  };

  const createAccessCode = async () => {
    if (!accessCodeForm.trim()) {
      setAccessCodeErrors(['Access code cannot be blank.']);
      return;
    }

    setAccessCodeSaving(true);
    setAccessCodeErrors([]);
    setAccessCodeMessage('');

    try {
      const res = await api.post('/admin/access-codes', { code: accessCodeForm });
      setAccessCodeMessage(res.data.message || 'Access code created.');
      setAccessCodeForm('');
      await fetchAccessCodes();
    } catch (err) {
      console.error('Failed to create access code', err);
      setAccessCodeErrors(formatBackendErrors(err, 'Failed to create access code.'));
    } finally {
      setAccessCodeSaving(false);
    }
  };

  const toggleAccessCode = async (accessCode) => {
    setAccessCodeErrors([]);
    setAccessCodeMessage('');

    try {
      const shouldDisable = !accessCode.disabled_at;
      const res = await api.put(`/admin/access-codes/${accessCode.id}`, { disabled: shouldDisable });
      setAccessCodeMessage(res.data.message || 'Access code updated.');
      await fetchAccessCodes();
    } catch (err) {
      console.error('Failed to update access code', err);
      setAccessCodeErrors(formatBackendErrors(err, 'Failed to update access code.'));
    }
  };

  const deleteAccessCode = async (accessCode) => {
    if (accessCode.is_used) return;

    if (window.confirm(`Delete access code "${accessCode.code}"?`)) {
      try {
        const res = await api.delete(`/admin/access-codes/${accessCode.id}`);
        setAccessCodeMessage(res.data.message || 'Access code deleted.');
        await fetchAccessCodes();
      } catch (err) {
        console.error('Failed to delete access code', err);
        setAccessCodeErrors(formatBackendErrors(err, 'Failed to delete access code.'));
      }
    }
  };

  const accessCodeStatus = (accessCode) => {
    if (accessCode.disabled_at) return 'Disabled';
    if (accessCode.is_used) return 'Used';
    return 'Available';
  };

  const accessCodeStatusClass = (accessCode) => {
    if (accessCode.disabled_at) return 'bg-slate-200 text-slate-700';
    if (accessCode.is_used) return 'bg-purple-100 text-purple-700';
    return 'bg-green-100 text-green-700';
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

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            Question Bank
          </button>
          <button
            onClick={() => setActiveTab('quiz_sets')}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
              activeTab === 'quiz_sets'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            Quiz Sets
          </button>
          <button
            onClick={() => setActiveTab('import_export')}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
              activeTab === 'import_export'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            Import / Export
          </button>
          <button
            onClick={() => setActiveTab('access_codes')}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
              activeTab === 'access_codes'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            Access Codes
          </button>
        </div>

        {activeTab === 'questions' && (
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
        )}

        {activeTab === 'quiz_sets' && (
          <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-fit">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">
                  {quizSetForm.id ? 'Edit Quiz Set' : 'Create Quiz Set'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Order controls display sequence only. Premium access is controlled separately.</p>
              </div>

              <div className="p-6 space-y-4">
                {quizSetMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">
                    {quizSetMessage}
                  </div>
                )}

                {quizSetErrors.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-bold mb-1">Please fix the following:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {quizSetErrors.map((errorItem, index) => (
                        <li key={`${errorItem}-${index}`}>{errorItem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                  <select
                    value={quizSetForm.subject_id}
                    onChange={(e) => updateQuizSetForm('subject_id', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                  <input
                    value={quizSetForm.name}
                    onChange={(e) => updateQuizSetForm('name', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="Set 4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Order</label>
                    <input
                      type="number"
                      min="1"
                      value={quizSetForm.order_index}
                      onChange={(e) => updateQuizSetForm('order_index', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                    <select
                      value={quizSetForm.difficulty}
                      onChange={(e) => updateQuizSetForm('difficulty', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="average">Average</option>
                      <option value="difficult">Difficult</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizSetForm.is_premium}
                    onChange={(e) => updateQuizSetForm('is_premium', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>
                    <span className="block text-sm font-bold text-slate-800">Premium Set</span>
                    <span className="block text-xs text-slate-500">Free users will see this quiz set as locked.</span>
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={saveQuizSet}
                    disabled={quizSetSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} /> {quizSetSaving ? 'Saving...' : 'Save'}
                  </button>
                  {quizSetForm.id && (
                    <button
                      onClick={resetQuizSetForm}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold inline-flex items-center gap-2"
                    >
                      <X size={16} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Quiz Sets</h2>
                <p className="text-sm text-slate-500">Manage quiz set order, subject, and difficulty.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-wider">
                      <th className="p-4">Subject</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Order</th>
                      <th className="p-4">Difficulty</th>
                      <th className="p-4">Questions</th>
                      <th className="p-4">Access</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizSets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-sm font-bold text-slate-500">
                          No quiz sets found.
                        </td>
                      </tr>
                    ) : quizSets.map((set) => (
                      <tr key={set.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-bold text-slate-900">{set.subject?.name || 'Unknown'}</td>
                        <td className="p-4 text-sm text-slate-700">{set.name}</td>
                        <td className="p-4 text-sm font-bold text-slate-600">Set {set.order_index}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded capitalize">
                            {set.difficulty || 'average'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{set.questions_count || 0}</td>
                        <td className="p-4">
                          {set.is_premium ? (
                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">Premium</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Free</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => editQuizSet(set)}
                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 mr-4"
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => deleteQuizSet(set)}
                            disabled={(set.questions_count || 0) > 0}
                            title={(set.questions_count || 0) > 0 ? 'Quiz sets with questions cannot be deleted.' : 'Delete quiz set'}
                            className="text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1 disabled:text-slate-300 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'import_export' && (
          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-fit">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Import Questions</h2>
                <p className="text-sm text-slate-500 mt-1">Preview the CSV first. Actual import skips duplicates and does not overwrite existing questions.</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                  <p className="font-bold mb-1">Required CSV columns</p>
                  <p className="leading-relaxed">
                    subject_slug, quiz_set_order, quiz_set_name, difficulty, is_pretest,
                    question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation
                  </p>
                </div>

                {importMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">
                    {importMessage}
                  </div>
                )}

                {importErrors.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-bold mb-1">Import issue</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {importErrors.map((errorItem, index) => (
                        <li key={`${errorItem}-${index}`}>{errorItem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => selectedImportFile(e.target.files?.[0] || null)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={previewImport}
                    disabled={importLoading || !importFile}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} /> {importLoading ? 'Checking...' : 'Preview CSV'}
                  </button>
                  <button
                    onClick={runImport}
                    disabled={importLoading || !importPreview || importPreview.invalid_row_count > 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} /> Run Import
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Export Question Bank</h2>
                    <p className="text-sm text-slate-500">Exports CSV using the same columns as import. Current question filters are included.</p>
                  </div>
                  <button
                    onClick={exportQuestions}
                    disabled={exportLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} /> {exportLoading ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>
              </div>

              {importPreview && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">Preview Summary</h2>
                    <p className="text-sm text-slate-500">Review this before running the import.</p>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-bold uppercase text-slate-400">Valid Rows</p>
                        <p className="text-2xl font-black text-slate-900">{importPreview.valid_row_count || 0}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-bold uppercase text-slate-400">Invalid Rows</p>
                        <p className="text-2xl font-black text-red-600">{importPreview.invalid_row_count || 0}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-bold uppercase text-slate-400">To Create</p>
                        <p className="text-2xl font-black text-green-600">{importPreview.questions_to_create?.length || 0}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-bold uppercase text-slate-400">Duplicates</p>
                        <p className="text-2xl font-black text-amber-600">{importPreview.questions_to_skip?.length || 0}</p>
                      </div>
                    </div>

                    {importPreview.quiz_sets_to_create?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-slate-900 mb-2">Quiz Sets To Create</h3>
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                          {importPreview.quiz_sets_to_create.map((set) => (
                            <div key={set.cache_key} className="p-3 border-b last:border-b-0 border-slate-100 text-sm text-slate-700">
                              <span className="font-bold">{set.subject_slug}</span> - Set {set.order_index}: {set.name} ({set.difficulty})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {importPreview.row_errors?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-red-700 mb-2">Row Errors</h3>
                        <div className="rounded-xl border border-red-200 overflow-hidden">
                          {importPreview.row_errors.map((rowError) => (
                            <div key={rowError.row} className="p-3 border-b last:border-b-0 border-red-100 text-sm text-red-700">
                              <span className="font-bold">Row {rowError.row}:</span> {rowError.errors.join(' ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {importPreview.duplicate_warnings?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-amber-700 mb-2">Duplicate Warnings</h3>
                        <div className="rounded-xl border border-amber-200 overflow-hidden">
                          {importPreview.duplicate_warnings.map((warning) => (
                            <div key={`${warning.row}-${warning.question_text}`} className="p-3 border-b last:border-b-0 border-amber-100 text-sm text-amber-700">
                              <span className="font-bold">Row {warning.row}:</span> {warning.reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {importPreview.questions_to_create?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-slate-900 mb-2">Questions To Create</h3>
                        <div className="rounded-xl border border-slate-200 overflow-hidden max-h-72 overflow-y-auto">
                          {importPreview.questions_to_create.slice(0, 20).map((question) => (
                            <div key={`${question.row}-${question.question_text}`} className="p-3 border-b last:border-b-0 border-slate-100 text-sm text-slate-700">
                              <span className="font-bold">Row {question.row}:</span> {question.question_text}
                            </div>
                          ))}
                          {importPreview.questions_to_create.length > 20 && (
                            <div className="p-3 text-sm text-slate-500">
                              Showing first 20 of {importPreview.questions_to_create.length} questions.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'access_codes' && (
          <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-fit">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Create Access Code</h2>
                <p className="text-sm text-slate-500 mt-1">Access codes unlock Premium for one user.</p>
              </div>

              <div className="p-6 space-y-4">
                {accessCodeMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">
                    {accessCodeMessage}
                  </div>
                )}

                {accessCodeErrors.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-bold mb-1">Please fix the following:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {accessCodeErrors.map((errorItem, index) => (
                        <li key={`${errorItem}-${index}`}>{errorItem}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Code</label>
                  <input
                    value={accessCodeForm}
                    onChange={(e) => setAccessCodeForm(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="PACSER-PREMIUM-001"
                  />
                </div>

                <button
                  onClick={createAccessCode}
                  disabled={accessCodeSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus size={16} /> {accessCodeSaving ? 'Creating...' : 'Create Code'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Access Codes</h2>
                <p className="text-sm text-slate-500">Create, disable, enable, and delete unused Premium codes.</p>
              </div>

              <div className="p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-3">
                <select
                  value={accessCodeFilters.status}
                  onChange={(e) => setAccessCodeFilters((current) => ({ ...current, status: e.target.value }))}
                  className="border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All statuses</option>
                  <option value="available">Available</option>
                  <option value="used">Used</option>
                  <option value="disabled">Disabled</option>
                </select>
                <input
                  type="search"
                  value={accessCodeFilters.search}
                  onChange={(e) => setAccessCodeFilters((current) => ({ ...current, search: e.target.value }))}
                  placeholder="Search code"
                  className="border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setAccessCodeFilters({ status: '', search: '' })}
                  className="border border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-lg p-2.5 text-sm transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-wider">
                      <th className="p-4">Code</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Used By</th>
                      <th className="p-4">Used At</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessCodeLoading ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-sm font-bold text-slate-500">
                          Loading access codes...
                        </td>
                      </tr>
                    ) : accessCodes.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-sm font-bold text-slate-500">
                          No access codes found.
                        </td>
                      </tr>
                    ) : accessCodes.map((accessCode) => (
                      <tr key={accessCode.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-black text-slate-900">{accessCode.code}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${accessCodeStatusClass(accessCode)}`}>
                            {accessCodeStatus(accessCode)}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {accessCode.used_by_name || (accessCode.used_by_user_id ? `User #${accessCode.used_by_user_id}` : '-')}
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {accessCode.used_at ? new Date(accessCode.used_at).toLocaleString() : '-'}
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {accessCode.created_at ? new Date(accessCode.created_at).toLocaleString() : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleAccessCode(accessCode)}
                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 mr-4"
                          >
                            {accessCode.disabled_at ? 'Enable' : 'Disable'}
                          </button>
                          <button
                            onClick={() => deleteAccessCode(accessCode)}
                            disabled={accessCode.is_used}
                            title={accessCode.is_used ? 'Used access codes cannot be deleted.' : 'Delete access code'}
                            className="text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1 disabled:text-slate-300 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
