import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createTicket } from '../services/ticketService';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

const CreateTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'LOW' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.title.trim())       e.title       = 'Title is required.';
    if (!formData.description.trim()) e.description = 'Description is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await createTicket(formData);
      setSuccess(true);
      setTimeout(() => navigate('/tickets'), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.details && typeof data.details === 'object') {
        const fe = {};
        Object.entries(data.details).forEach(([k, v]) => { fe[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(fe);
      } else {
        setApiError(data?.message || 'Failed to create ticket.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3.5 py-3 bg-[#0f172a] border rounded-lg text-sm text-slate-100 placeholder-slate-600 outline-none transition-all font-[Inter]
    ${errors[field] ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#334155] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`;

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Create Ticket</h1>
            <p className="text-sm text-slate-400 mt-1">Submit a new support request</p>
          </div>
          <button onClick={() => navigate('/tickets')}
            className="text-xs px-3.5 py-2 border border-[#334155] rounded-lg text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all">
            ← Back to My Tickets
          </button>
        </div>

        {/* Form card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 animate-fade-slide-up">
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm rounded-lg px-4 py-3 mb-5">
              ✅ Ticket created successfully! Redirecting…
            </div>
          )}
          {apiError && (
            <div className="flex items-start gap-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded-lg px-4 py-3 mb-5">
              <span>⚠️</span><span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="Brief summary of your issue" className={inputCls('title')} />
              {errors.title && <p className="text-xs text-red-400 mt-1.5">⚠ {errors.title}</p>}
            </div>

            {/* Priority */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}
                className="w-full px-3.5 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-slate-100 outline-none cursor-pointer focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all">
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="mb-7">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6}
                placeholder="Describe your issue in detail…"
                className={`${inputCls('description')} resize-y min-h-[120px] leading-relaxed`} />
              {errors.description && <p className="text-xs text-red-400 mt-1.5">⚠ {errors.description}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => navigate('/tickets')}
                className="px-5 py-2.5 border border-[#334155] rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:border-slate-400 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-sm font-semibold rounded-lg
                  hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                  : '🎫 Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTicket;
