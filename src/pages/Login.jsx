import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.username.trim()) e.username = 'Username is required.';
    if (!formData.password)        e.password  = 'Password is required.';
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
      const loginRes = await loginApi(formData);
      const userData = loginRes.data.user;
      
      login(userData);
      const isUserAdmin = userData.role === 'ADMIN' || userData.is_staff || userData.is_superuser;
      navigate(isUserAdmin ? '/admin/tickets' : '/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
         style={{ background: 'radial-gradient(ellipse at top left, #312e81 0%, #0f172a 50%, #1e1b4b 100%)' }}>
      <div className="w-full max-w-md bg-[#1e293b] border border-[#334155] rounded-2xl p-12 shadow-2xl animate-fade-slide-up">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-xl">🎫</div>
          <span className="text-base font-bold text-slate-100">Help &amp; Support</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h1>
        <p className="text-sm text-slate-400 mb-8">Sign in to your account to continue</p>

        {apiError && (
          <div className="flex items-start gap-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded-lg px-4 py-3 mb-5">
            <span>⚠️</span><span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
            <input
              id="username" type="text" name="username"
              value={formData.username} onChange={handleChange}
              placeholder="Enter your username" autoComplete="username"
              className={`w-full px-3.5 py-3 bg-[#0f172a] border rounded-lg text-sm text-slate-100 placeholder-slate-600 outline-none transition-all
                ${errors.username ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#334155] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
            />
            {errors.username && <p className="text-xs text-red-400 mt-1.5">⚠ {errors.username}</p>}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <input
              id="password" type="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Enter your password" autoComplete="current-password"
              className={`w-full px-3.5 py-3 bg-[#0f172a] border rounded-lg text-sm text-slate-100 placeholder-slate-600 outline-none transition-all
                ${errors.password ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#334155] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}`}
            />
            {errors.password && <p className="text-xs text-red-400 mt-1.5">⚠ {errors.password}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-semibold text-white
              bg-gradient-to-r from-indigo-500 to-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
              : 'Sign In'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
