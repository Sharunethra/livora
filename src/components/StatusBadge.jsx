const colors = {
  OPEN: 'bg-rose-500/10 text-rose-400',
  CLOSED: 'bg-emerald-500/10 text-emerald-400',
  PENDING: 'bg-amber-500/10 text-amber-400',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  BOOKED: 'bg-indigo-500/10 text-indigo-400',
  CANCELLED: 'bg-rose-500/10 text-rose-400',
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400',
  OCCUPIED: 'bg-rose-500/10 text-rose-400',
  CASH: 'bg-slate-500/10 text-slate-400',
  CARD: 'bg-blue-500/10 text-blue-400',
  UPI: 'bg-purple-500/10 text-purple-400',
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-white/10 text-slate-400'}`}>
    {status}
  </span>
);

export default StatusBadge;
