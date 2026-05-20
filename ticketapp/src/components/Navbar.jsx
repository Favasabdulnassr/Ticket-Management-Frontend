import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : '?';

  return (
    <nav className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center text-base">🎫</div>
          <span className="font-bold text-sm text-slate-100">Help &amp; Support</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAdmin() && (
            <Link to="/admin/tickets" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors no-underline">
              Admin Panel
            </Link>
          )}
          {!isAdmin() && (
            <Link to="/tickets" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors no-underline">
              My Tickets
            </Link>
          )}

          {/* Avatar + username */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <span className="hidden sm:block">{user?.username}</span>
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 border border-[#334155] rounded-lg
              hover:border-red-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
