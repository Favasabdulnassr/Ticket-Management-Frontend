import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import StatusBadge from '../components/StatusBadge';
import { getMyTickets } from '../services/ticketService';

const STATUS_OPTIONS   = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH'];

const MyTickets = () => {
  const [tickets, setTickets]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');
  const [page, setPage]        = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotal] = useState(1);
  const [filters, setFilters]  = useState({ status: '', priority: '', search: '', created_at: '' });

  const fetchTickets = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page, page_size: pageSize };
      if (filters.status)     params.status     = filters.status;
      if (filters.priority)   params.priority   = filters.priority;
      if (filters.search)     params.search     = filters.search;
      if (filters.created_at) params.created_at = filters.created_at;
      const res = await getMyTickets(params);
      setTickets(res.data.results || res.data);
      setTotal(Math.ceil((res.data.count || 0) / pageSize) || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets.');
    } finally { setLoading(false); }
  }, [page, pageSize, filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters(p => ({ ...p, [name]: value }));
    setPage(1);
  };

  const selectCls = "px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-slate-300 outline-none cursor-pointer focus:border-indigo-500 transition-all";

  return (
    <>
      
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">My Tickets</h1>
            <p className="text-sm text-slate-400 mt-1">Track the status of your support requests</p>
          </div>
          <Link to="/tickets/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-sm font-semibold rounded-lg
              hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all no-underline">
            + New Ticket
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input type="text" name="search" value={filters.search} onChange={handleFilter} placeholder="Search tickets..." 
            className="px-3.5 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 transition-all min-w-[200px]" />
            
          <input type="date" name="created_at" value={filters.created_at} onChange={handleFilter}
            className="px-3.5 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-slate-300 outline-none focus:border-indigo-500 transition-all cursor-pointer" />

          <select name="status" value={filters.status} onChange={handleFilter} className={selectCls}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilter} className={selectCls}>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
          </select>
          {(filters.status || filters.priority || filters.search || filters.created_at) && (
            <button onClick={() => { setFilters({ status:'', priority:'', search:'', created_at:'' }); setPage(1); }}
              className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/20 transition-all">
              Clear ✕
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-20 text-slate-400">
            <span className="w-10 h-10 border-4 border-[#334155] border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm">Loading tickets…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded-lg px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tickets.length === 0 && (
          <div className="flex flex-col items-center text-center py-20">
            <span className="text-5xl mb-4">🎫</span>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">No tickets found</h3>
            <p className="text-sm text-slate-400 mb-5">You haven't submitted any support tickets yet.</p>
            <Link to="/tickets/create"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-sm font-semibold rounded-lg no-underline hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
              Create Your First Ticket
            </Link>
          </div>
        )}

        {/* Ticket list */}
        {!loading && !error && tickets.length > 0 && (
          <div className="flex flex-col gap-3">
            {tickets.map(ticket => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}
                className="block bg-[#1e293b] border border-[#334155] hover:border-indigo-500 rounded-xl px-6 py-5 no-underline text-slate-100
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 animate-fade-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 tracking-wide">#{ticket.id}</span>
                  <StatusBadge type="status" value={ticket.status} />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2 leading-snug">{ticket.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">
                  {ticket.description?.slice(0, 110)}{ticket.description?.length > 110 ? '…' : ''}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge type="priority" value={ticket.priority} />
                  <span className="text-xs text-slate-500">
                    🕒 {new Date(ticket.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Page size selector */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm text-slate-300">Page size:</label>
          <select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value,10)); setPage(1); }} className="px-2 py-1 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-slate-300">
            {[3,5,10,20,50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="px-4 py-2 border border-[#334155] rounded-lg text-sm text-slate-400 hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all border
                  ${page === n ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-transparent border-[#334155] text-slate-400 hover:border-indigo-500 hover:text-indigo-400'}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              className="px-4 py-2 border border-[#334155] rounded-lg text-sm text-slate-400 hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MyTickets;
