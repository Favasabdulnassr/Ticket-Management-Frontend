import { useEffect, useState, useCallback } from 'react';

import StatusBadge from '../components/StatusBadge';
import { getAllTickets, updateTicket, resolveTicket, deleteTicket, getUsers } from '../services/ticketService';

const STATUS_OPTIONS   = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH'];
const STATUS_UPDATE    = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

/* ─── small reusable modal wrapper ───────────────────────────── */
const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-slide-up">
      <h2 className="text-lg font-bold text-slate-100 mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400 mb-5">{subtitle}</p>}
      {children}
    </div>
  </div>
);

/* ─── confirm delete modal ────────────────────────────────────── */
const DeleteConfirm = ({ ticket, onConfirm, onClose, loading }) => (
  <Modal
    title="Delete Ticket"
    subtitle={`Are you sure you want to permanently delete ticket #${ticket.id}: "${ticket.title}"? This action cannot be undone.`}
    onClose={onClose}
  >
    <div className="flex justify-end gap-3 mt-2">
      <button onClick={onClose}
        className="px-4 py-2 border border-[#334155] rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:border-slate-400 transition-all">
        Cancel
      </button>
      <button onClick={onConfirm} disabled={loading}
        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white text-sm font-semibold rounded-lg
          hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
        {loading
          ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</>
          : '🗑️ Delete'}
      </button>
    </div>
  </Modal>
);

const AdminTickets = () => {
  const [tickets, setTickets]           = useState([]);
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [totalPages, setTotal]          = useState(1);
  const [totalCount, setTotalCount]     = useState(0);
  const [filters, setFilters]           = useState({ status: '', priority: '' });

  // Modal states
  const [resolveModal, setResolveModal] = useState(null);
  const [assignModal, setAssignModal]   = useState(null);
  const [deleteModal, setDeleteModal]   = useState(null);
  const [resComment, setResComment]     = useState('');
  const [assignedTo, setAssignedTo]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]               = useState(null);

  /* ─── fetch tickets ─────────────────────────────────────────── */
  const fetchTickets = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page, page_size: pageSize };
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const res = await getAllTickets(params);
      setTickets(res.data.results || res.data);
      setTotalCount(res.data.count || 0);
      setTotal(Math.ceil((res.data.count || 0) / pageSize) || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets.');
    } finally { setLoading(false); }
  }, [page, pageSize, filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  /* ─── fetch users once (for assign dropdown) ─────────────────── */
  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data?.results || res.data || []))
      .catch(() => {}); // silently ignore if endpoint not ready
  }, []);

  /* ─── helpers ───────────────────────────────────────────────── */
  const showToast = (text, error = false) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 3000);
  };

  const patchTicket = (id, updated) =>
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));

  const handleFilter = (e) => {
    setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
    setPage(1);
  };

  /* ─── status change (inline dropdown) ───────────────────────── */
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await updateTicket(ticketId, { status: newStatus });
      patchTicket(ticketId, { status: newStatus });
      showToast('Status updated!');
    } catch { showToast('Failed to update status.', true); }
  };

  /* ─── resolve ────────────────────────────────────────────────── */
  const handleResolve = async () => {
    if (!resComment.trim()) return;
    setActionLoading(true);
    try {
      await resolveTicket(resolveModal.id, { resolution_comment: resComment });
      patchTicket(resolveModal.id, { status: 'RESOLVED', resolution_comment: resComment });
      setResolveModal(null); setResComment('');
      showToast('Ticket resolved!');
    } catch { showToast('Failed to resolve ticket.', true); }
    finally { setActionLoading(false); }
  };

  /* ─── assign ─────────────────────────────────────────────────── */
  const handleAssign = async () => {
    setActionLoading(true);
    try {
      await updateTicket(assignModal.id, { assigned_to: assignedTo || null });
      const assignedUser = users.find(u => String(u.id) === String(assignedTo));
      patchTicket(assignModal.id, {
        assigned_to: assignedTo || null,
        assigned_to_name: assignedUser ? assignedUser.username : null,
      });
      setAssignModal(null); setAssignedTo('');
      showToast('Ticket assigned!');
    } catch { showToast('Failed to assign ticket.', true); }
    finally { setActionLoading(false); }
  };

  /* ─── delete ─────────────────────────────────────────────────── */
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteTicket(deleteModal.id);
      setTickets(prev => prev.filter(t => t.id !== deleteModal.id));
      setDeleteModal(null);
      showToast('Ticket deleted.');
    } catch { showToast('Failed to delete ticket.', true); }
    finally { setActionLoading(false); }
  };

  const selectCls = "px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-slate-300 outline-none cursor-pointer focus:border-indigo-500 transition-all";
  const inputCls  = "w-full px-3.5 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-slate-100 placeholder-slate-600 outline-none resize-y focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  return (
    <>
      
      <div className="max-w-[1400px] mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">All Tickets</h1>
            <p className="text-sm text-slate-400 mt-1">
              {totalCount > 0 ? `${totalCount} ticket${totalCount !== 1 ? 's' : ''} total` : 'Manage and resolve all support requests'}
            </p>
          </div>

          {/* Toast */}
          {toast && (
            <div className={`text-sm px-4 py-2 rounded-lg font-medium transition-all
              ${toast.error ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
              {toast.text}
            </div>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select name="status" value={filters.status} onChange={handleFilter} className={selectCls}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilter} className={selectCls}>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
          </select>
          {(filters.status || filters.priority) && (
            <button onClick={() => { setFilters({ status:'', priority:'' }); setPage(1); }}
              className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/20 transition-all">
              Clear ✕
            </button>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-24 text-slate-400">
            <span className="w-10 h-10 border-4 border-[#334155] border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm">Loading tickets…</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex items-start gap-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded-lg px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && tickets.length === 0 && (
          <div className="flex flex-col items-center text-center py-24">
            <span className="text-5xl mb-4">📭</span>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">No tickets found</h3>
            <p className="text-sm text-slate-400">No tickets match your current filters.</p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && !error && tickets.length > 0 && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155] bg-[#0f172a]/40">
                    {['#', 'Title', 'Submitted by', 'Assigned to', 'Priority', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, idx) => (
                    <tr key={ticket.id}
                      className={`border-b border-[#334155]/40 hover:bg-indigo-500/5 transition-colors duration-150 ${idx % 2 !== 0 ? 'bg-[#0f172a]/20' : ''}`}>

                      {/* ID */}
                      <td className="px-5 py-4 text-slate-500 text-xs font-mono whitespace-nowrap">#{ticket.id}</td>

                      {/* Title */}
                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="text-slate-100 font-medium truncate">{ticket.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{ticket.description?.slice(0, 45)}{ticket.description?.length > 45 ? '…' : ''}</p>
                      </td>

                      {/* Submitted by */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs text-slate-300">
                          <span className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-400 flex-shrink-0">
                            {(ticket.created_by_name || String(ticket.created_by))[0]?.toUpperCase()}
                          </span>
                          {ticket.created_by_name || ticket.created_by}
                        </span>
                      </td>

                      {/* Assigned to */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {ticket.assigned_to_name ? (
                          <span className="flex items-center gap-1.5 text-xs text-slate-300">
                            <span className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-400 flex-shrink-0">
                              {ticket.assigned_to_name[0]?.toUpperCase()}
                            </span>
                            {ticket.assigned_to_name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4">
                        <StatusBadge type="priority" value={ticket.priority} />
                      </td>

                      {/* Status inline dropdown */}
                      <td className="px-5 py-4">
                        <select value={ticket.status} onChange={e => handleStatusChange(ticket.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-[#0f172a] border border-[#334155] rounded-lg text-xs text-slate-300 outline-none cursor-pointer focus:border-indigo-500 transition-all min-w-[110px]">
                          {STATUS_UPDATE.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                          {ticket.status === 'RESOLVED' && <option value="RESOLVED">RESOLVED</option>}
                        </select>
                      </td>

                      {/* Created date */}
                      <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Assign */}
                          <button
                            onClick={() => { setAssignModal(ticket); setAssignedTo(ticket.assigned_to ? String(ticket.assigned_to) : ''); }}
                            className="px-2.5 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-lg hover:bg-indigo-500/20 transition-all whitespace-nowrap">
                            Assign
                          </button>

                          {/* Resolve */}
                          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                            <button onClick={() => { setResolveModal(ticket); setResComment(''); }}
                              className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-500/20 transition-all whitespace-nowrap">
                              Resolve
                            </button>
                          )}

                          {/* Delete */}
                          <button onClick={() => setDeleteModal(ticket)}
                            className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/20 transition-all">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="px-4 py-2 border border-[#334155] rounded-lg text-sm text-slate-400 hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all
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

      {/* ══ RESOLVE MODAL ══════════════════════════════════════════ */}
      {resolveModal && (
        <Modal
          title="Resolve Ticket"
          subtitle={`Ticket #${resolveModal.id}: "${resolveModal.title}"`}
          onClose={() => setResolveModal(null)}
        >
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Resolution Comment <span className="text-red-400">*</span>
          </label>
          <textarea value={resComment} onChange={e => setResComment(e.target.value)} rows={4}
            placeholder="Describe how this ticket was resolved…"
            className={`${inputCls} mb-5`} />
          <div className="flex justify-end gap-3">
            <button onClick={() => setResolveModal(null)}
              className="px-4 py-2 border border-[#334155] rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:border-slate-400 transition-all">
              Cancel
            </button>
            <button onClick={handleResolve} disabled={actionLoading || !resComment.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-semibold rounded-lg
                hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {actionLoading
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resolving…</>
                : '✅ Mark as Resolved'}
            </button>
          </div>
        </Modal>
      )}

      {/* ══ ASSIGN MODAL ═══════════════════════════════════════════ */}
      {assignModal && (
        <Modal
          title="Assign Ticket"
          subtitle={`Ticket #${assignModal.id}: "${assignModal.title}"`}
          onClose={() => setAssignModal(null)}
        >
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Assign to user</label>
          <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
            className={`${inputCls} mb-5 cursor-pointer`}>
            <option value="">— Unassigned —</option>
            {users.filter(u => u.role === 'ADMIN' || u.is_staff || u.is_superuser).map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u.first_name} {u.last_name})</option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAssignModal(null)}
              className="px-4 py-2 border border-[#334155] rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:border-slate-400 transition-all">
              Cancel
            </button>
            <button onClick={handleAssign} disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-sm font-semibold rounded-lg
                hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {actionLoading
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                : '👤 Save Assignment'}
            </button>
          </div>
        </Modal>
      )}

      {/* ══ DELETE CONFIRM MODAL ════════════════════════════════════ */}
      {deleteModal && (
        <DeleteConfirm
          ticket={deleteModal}
          onConfirm={handleDelete}
          onClose={() => setDeleteModal(null)}
          loading={actionLoading}
        />
      )}
    </>
  );
};

export default AdminTickets;
