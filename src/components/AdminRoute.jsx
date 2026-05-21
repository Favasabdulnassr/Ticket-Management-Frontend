import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <span className="w-10 h-10 border-4 border-[#334155] border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
  if (!user)      return <Navigate to="/login"     replace />;
  return isAdmin() ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
