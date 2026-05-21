import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-indigo-900/10 border border-indigo-500/20 rounded-2xl px-8 py-8 mb-8 animate-fade-slide-up">
          <p className="text-indigo-400 text-sm font-semibold mb-1 uppercase tracking-wider">
            {isAdmin() ? '👑 Admin' : '👤 User'}
          </p>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            {isAdmin()
              ? 'You are logged in as Admin. Manage all support tickets from the Admin Panel.'
              : 'Submit new support requests and track their progress from here.'}
          </p>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!isAdmin() && (
            <Link to="/tickets/create"
              className="group bg-[#1e293b] border border-[#334155] hover:border-indigo-500 rounded-xl p-6 no-underline transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-indigo-500/15 rounded-lg flex items-center justify-center text-xl mb-4">➕</div>
              <h3 className="text-base font-semibold text-slate-100 mb-1">Create Ticket</h3>
              <p className="text-xs text-slate-400">Submit a new support request</p>
            </Link>
          )}

          <Link to={isAdmin() ? '/admin/tickets' : '/tickets'}
            className="group bg-[#1e293b] border border-[#334155] hover:border-indigo-500 rounded-xl p-6 no-underline transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5">
            <div className="w-10 h-10 bg-indigo-500/15 rounded-lg flex items-center justify-center text-xl mb-4">🎫</div>
            <h3 className="text-base font-semibold text-slate-100 mb-1">{isAdmin() ? 'All Tickets' : 'My Tickets'}</h3>
            <p className="text-xs text-slate-400">{isAdmin() ? 'View and manage all support tickets' : 'Track your submitted tickets'}</p>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
