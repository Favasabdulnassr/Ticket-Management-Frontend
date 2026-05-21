const STATUS_MAP = {
  OPEN:        { label: 'Open',        cls: 'bg-indigo-500/15 text-indigo-400' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-amber-500/15 text-amber-400' },
  RESOLVED:    { label: 'Resolved',    cls: 'bg-emerald-500/15 text-emerald-400' },
  CLOSED:      { label: 'Closed',      cls: 'bg-slate-500/15 text-slate-400' },
};

const PRIORITY_MAP = {
  LOW:    { label: 'Low',    cls: 'bg-emerald-500/15 text-emerald-400' },
  MEDIUM: { label: 'Medium', cls: 'bg-amber-500/15 text-amber-400' },
  HIGH:   { label: 'High',   cls: 'bg-red-500/15 text-red-400' },
};

const StatusBadge = ({ type, value }) => {
  const map  = type === 'priority' ? PRIORITY_MAP : STATUS_MAP;
  const item = map[value] || { label: value, cls: 'bg-slate-500/15 text-slate-400' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${item.cls}`}>
      {item.label}
    </span>
  );
};

export default StatusBadge;
