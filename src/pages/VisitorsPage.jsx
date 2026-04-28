import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, LogOut, Trash2, UserCheck, Search, X, Loader2, AlertCircle, Phone, Calendar, Clock } from 'lucide-react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const VisitorsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ visitor_id: '', name: '', phone_no: '', resident_id: '', entry_time: new Date().toISOString().slice(0, 16) });
  const [formError, setFormError] = useState('');

  // Fetch data
  const { data: visitors, isLoading } = useQuery({ queryKey: ['visitors'], queryFn: () => api.get('/visitors').then(r => r.data.data) });
  const { data: residents } = useQuery({ queryKey: ['residents-list'], queryFn: () => api.get('/residents').then(r => r.data.data) });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/visitors', data),
    onSuccess: () => { queryClient.invalidateQueries(['visitors']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to log visitor')
  });

  const exitMutation = useMutation({
    mutationFn: (id) => api.put(`/visitors/${id}/exit`),
    onSuccess: () => queryClient.invalidateQueries(['visitors'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/visitors/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['visitors'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 glass-card animate-pulse" />)}</div>;

  const filteredVisitors = visitors?.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.resident_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by name or resident..." className="input-field pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Log Visitor
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Visitor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Visiting</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Entry</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Exit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVisitors?.map(visitor => (
                <tr key={visitor.visitor_id} className="group hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{visitor.name}</span>
                      <span className="text-[10px] text-slate-500">ID: VIS-{visitor.visitor_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 flex items-center gap-2">
                    <Phone size={12} className="text-indigo-400" /> {visitor.phone_no}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{visitor.resident_name}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1"><Clock size={12} /> {new Date(visitor.entry_time).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {visitor.exit_time ? (
                      <div className="flex items-center gap-1 text-emerald-400"><Clock size={12} /> {new Date(visitor.exit_time).toLocaleString()}</div>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px] font-bold">INSIDE</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!visitor.exit_time && (
                        <button 
                          onClick={() => exitMutation.mutate(visitor.visitor_id)}
                          className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-bold rounded-lg hover:bg-rose-500/20 flex items-center gap-1"
                        >
                          <LogOut size={12} /> Log Exit
                        </button>
                      )}
                      <button 
                        onClick={() => { if(confirm('Delete log?')) deleteMutation.mutate(visitor.visitor_id); }}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-md relative animate-in slide-in-from-bottom-4">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Log New Visitor</h2>
            {formError && <div className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-lg mb-6">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Visitor ID</label>
                <input type="number" required className="input-field" value={formData.visitor_id} onChange={e => setFormData({...formData, visitor_id: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Name</label>
                <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Phone No</label>
                <input type="text" required className="input-field" value={formData.phone_no} onChange={e => setFormData({...formData, phone_no: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Visiting Resident</label>
                <select required className="input-field" value={formData.resident_id} onChange={e => setFormData({...formData, resident_id: e.target.value})}>
                  <option value="">Select Resident</option>
                  {residents?.map(r => <option key={r.resident_id} value={r.resident_id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Entry Time</label>
                <input type="datetime-local" required className="input-field" value={formData.entry_time} onChange={e => setFormData({...formData, entry_time: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Log Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorsPage;
