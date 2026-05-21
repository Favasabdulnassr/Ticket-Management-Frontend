import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import StatusBadge from '../components/StatusBadge';
import { getTicketDetail } from '../services/ticketService';

const TicketDetail = () => {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const [ticket, setTicket]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getTicketDetail(id);
        setTicket(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Ticket not found or you do not have access.');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const fmt = (dt) => new Date(dt).toLocaleString('en-US', {
    year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
  });

  return (
    <>
      
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/tickets')}
          className="mb-6 text-xs px-3.5 py-2 border border-[#334155] rounded-lg text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all inline-flex items-center">
          ← Back to My Tickets
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-20 text-slate-400">
            <span className="w-10 h-10 border-4 border-[#334155] border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm">Loading ticket…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded-lg px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {/* Ticket detail */}
        {!loading && !error && ticket && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 animate-fade-slide-up">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 tracking-wide block mb-2">Ticket #{ticket.id}</span>
                <h1 className="text-xl font-bold text-slate-100 leading-snug">{ticket.title}</h1>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <StatusBadge type="status"   value={ticket.status} />
                <StatusBadge type="priority" value={ticket.priority} />
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Created by</p>
                <p className="text-sm text-slate-200">👤 {ticket.created_by_name || ticket.created_by}</p>
              </div>
              {ticket.assigned_to_name && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Assigned to</p>
                  <p className="text-sm text-slate-200">🧑‍💼 {ticket.assigned_to_name}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Created</p>
                <p className="text-sm text-slate-200">🕒 {fmt(ticket.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Last updated</p>
                <p className="text-sm text-slate-200">🔄 {fmt(ticket.updated_at)}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#334155] mb-6" />

            {/* Description */}
            <div className="mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Description</h2>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Resolution comment */}
            {ticket.resolution_comment && (
              <>
                <div className="h-px bg-[#334155] my-6" />
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-6 py-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">✅ Resolution Comment</h2>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{ticket.resolution_comment}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TicketDetail;
