import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/axios';
import { Users, FileText, Database, Edit, Plus, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_questions: 0, total_quiz_sets: 0 });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, qRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/questions')
        ]);
        setStats(statsRes.data);
        setQuestions(qRes.data.questions);
      } catch (err) {
        console.error("Admin fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/admin/questions/${id}`);
        setQuestions(questions.filter(q => q.id !== id));
      } catch (err) {
        console.error("Failed to delete", err);
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
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Manage Questions</h2>
            <Link 
              to="/admin/question/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} /> New Question
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Question Text</th>
                  <th className="p-4">Pretest</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-500">#{q.id}</td>
                    <td className="p-4 text-sm font-bold text-slate-900">{q.quiz_set?.subject?.name || 'Unknown'}</td>
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
        </div>

      </div>
    </div>
  );
}
