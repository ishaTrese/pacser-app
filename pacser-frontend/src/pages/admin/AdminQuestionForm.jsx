import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/axios';
import { Save, ArrowLeft, Trash2, Plus } from 'lucide-react';

export default function AdminQuestionForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [quizSets, setQuizSets] = useState([]);
  
  const [form, setForm] = useState({
    quiz_set_id: '',
    question_text: '',
    explanation: '',
    is_pretest: false,
    answers: [
      { answer_text: '', is_correct: true },
      { answer_text: '', is_correct: false },
    ]
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchConfig = async () => {
      try {
        // We need quiz sets for the dropdown
        const res = await api.get('/admin/stats'); // Actually need quiz sets, let's just fetch subjects/sets. For now, we will mock or fetch proper data if needed.
        // Wait, we don't have an endpoint for just quiz sets. Let's assume we use standard ones or create an endpoint.
      } catch(err) {}
    };
    
    const fetchQuestion = async () => {
      try {
        const res = await api.get('/admin/questions');
        const q = res.data.questions.find(q => q.id.toString() === id);
        if (q) {
          setForm({
            quiz_set_id: q.quiz_set_id,
            question_text: q.question_text,
            explanation: q.explanation || '',
            is_pretest: q.is_pretest,
            answers: q.answers.length > 0 ? q.answers.map(a => ({ id: a.id, answer_text: a.answer_text, is_correct: !!a.is_correct })) : form.answers
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!isNew) {
      fetchQuestion();
    }
  }, [id, user, navigate, isNew]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/admin/questions', form);
      } else {
        await api.put(`/admin/questions/${id}`, form);
      }
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert('Failed to save question. Make sure you set a quiz_set_id (e.g., 1)');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/admin" className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 mb-6">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isNew ? 'Create New Question' : `Edit Question #${id}`}
            </h1>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Set ID</label>
                <input 
                  type="number" 
                  value={form.quiz_set_id}
                  onChange={e => setForm({...form, quiz_set_id: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 1"
                />
                <p className="text-xs text-slate-400 mt-1">Which quiz module does this belong to?</p>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={form.is_pretest}
                    onChange={e => setForm({...form, is_pretest: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="font-bold text-slate-700">Flag as Pre-test Question</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Question Text</label>
              <textarea 
                value={form.question_text}
                onChange={e => setForm({...form, question_text: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-3 h-24 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="What is the capital of the Philippines?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Explanation (Optional)</label>
              <textarea 
                value={form.explanation}
                onChange={e => setForm({...form, explanation: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-3 h-20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Displayed after answering."
              />
            </div>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">Answers</h3>
                <button 
                  onClick={() => setForm({...form, answers: [...form.answers, { answer_text: '', is_correct: false }]})}
                  className="text-blue-600 hover:bg-blue-50 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm transition-colors"
                >
                  <Plus size={16} /> Add Answer
                </button>
              </div>
              
              <div className="space-y-3">
                {form.answers.map((ans, idx) => (
                  <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border ${ans.is_correct ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                    <input 
                      type="radio" 
                      name="correct_answer"
                      checked={ans.is_correct}
                      onChange={() => {
                        const newAns = form.answers.map((a, i) => ({...a, is_correct: i === idx}));
                        setForm({...form, answers: newAns});
                      }}
                      className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={ans.answer_text}
                      onChange={e => {
                        const newAns = [...form.answers];
                        newAns[idx].answer_text = e.target.value;
                        setForm({...form, answers: newAns});
                      }}
                      className="flex-1 bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500"
                      placeholder={`Answer option ${idx + 1}`}
                    />
                    <button 
                      onClick={() => {
                        if (form.answers.length > 2) {
                          const newAns = form.answers.filter((_, i) => i !== idx);
                          setForm({...form, answers: newAns});
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2"
                      title="Remove answer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
