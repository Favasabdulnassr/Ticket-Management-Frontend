import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ first_name:'', last_name:'', username:'', email:'', password:'', password_confirm:'' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.first_name.trim()) e.first_name = 'First name is required.';
    if (!formData.last_name.trim())  e.last_name  = 'Last name is required.';
    if (!formData.username.trim())   e.username   = 'Username is required.';
    if (!formData.email.trim())      e.email      = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email.';
    if (!formData.password)          e.password   = 'Password is required.';
    else if (formData.password.length < 8) e.password = 'Minimum 8 characters.';
    if (!formData.password_confirm)  e.password_confirm = 'Please confirm your password.';
    else if (formData.password !== formData.password_confirm) e.password_confirm = 'Passwords do not match.';
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
      await registerApi(formData);
      // Registration successful, redirect user to login
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (data?.details && typeof data.details === 'object') {
        const fe = {};
        Object.entries(data.details).forEach(([k, v]) => { fe[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(fe);
      } else {
        setApiError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3.5 py-3 bg-[#0f172a] border rounded-lg text-sm text-slate-100 placeholder-slate-600 outline-none transition-all
    ${errors[field] ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#334155] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
         style={{ background: 'radial-gradient(ellipse at top left, #312e81 0%, #0f172a 50%, #1e1b4b 100%)' }}>
      <div className="w-full max-w-md bg-[#1e293b] border border-[#334155] rounded-2xl p-10 shadow-2xl animate-fade-slide-up">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-xl">🎫</div>
          <span className="text-base font-bold text-slate-100">Help &amp; Support</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-1">Create account</h1>
        <p className="text-sm text-slate-400 mb-7">Sign up to start submitting support tickets</p>

        {apiError && (
          <div className="flex items-start gap-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded-lg px-4 py-3 mb-5">
            <span>⚠️</span><span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                placeholder="John" className={inputCls('first_name')} />
              {errors.first_name && <p className="text-xs text-red-400 mt-1">⚠ {errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                placeholder="Doe" className={inputCls('last_name')} />
              {errors.last_name && <p className="text-xs text-red-400 mt-1">⚠ {errors.last_name}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange}
              placeholder="john_doe" autoComplete="username" className={inputCls('username')} />
            {errors.username && <p className="text-xs text-red-400 mt-1">⚠ {errors.username}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="john@example.com" autoComplete="email" className={inputCls('email')} />
            {errors.email && <p className="text-xs text-red-400 mt-1">⚠ {errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="Min. 8 characters" autoComplete="new-password" className={inputCls('password')} />
            {errors.password && <p className="text-xs text-red-400 mt-1">⚠ {errors.password}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
            <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange}
              placeholder="Re-enter your password" autoComplete="new-password" className={inputCls('password_confirm')} />
            {errors.password_confirm && <p className="text-xs text-red-400 mt-1">⚠ {errors.password_confirm}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-semibold text-white
              bg-gradient-to-r from-indigo-500 to-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
              : 'Create Account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
