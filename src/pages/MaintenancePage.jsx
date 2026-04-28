import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Clock, Trash2, Wrench, Search, X, Loader2, AlertCircle, PlayCircle } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const MaintenancePage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    request_id: '', request_date: new Date().toISOString().split('T')[0], description: '', resident_id: '', provider_id: '', staff_id: '' 
  });
  const [formError, setFormError] = useState('');

  // Fetch data
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const response = await api.get('/maintenance');
      return response.data.data;
    }
  });

  const { data: residents } = useQuery({ queryKey: ['residents-list'], queryFn: () => api.get('/residents').then(r => r.data.data) });
  const { data: providers } = useQuery({ queryKey: ['providers-list'], queryFn: () => api.get('/service-providers').then(r => r.data.data) });
  const { data: staff } = useQuery({ queryKey: ['staff-list'], queryFn: () => api.get('/staff').then(r => r.data.data) });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/maintenance', data),
    onSuccess: () => { queryClient.invalidateQueries(['maintenance']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create request')
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/maintenance/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['maintenance'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/maintenance/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['maintenance'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 glass-card animate-pulse" />)}</div>;

  const filteredRequests = requests?.filter(r => 
    r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.resident_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by description or resident..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Work Order
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Request</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assignments</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests?.map((req) => (
                <tr key={req.request_id} className="group hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-sm text-slate-400">WO-{req.request_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white line-clamp-1">{req.description}</span>
                      <span className="text-[10px] text-slate-500">From: {req.resident_name} • {new Date(req.request_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-300">Provider: {req.provider_name || 'Unassigned'}</span>
                      <span className="text-[10px] text-slate-300">Staff: {req.staff_name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {req.status === 'PENDING' && (
                        <button 
                          onClick={() => statusMutation.mutate({ id: req.request_id, status: 'IN_PROGRESS' })}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg hover:bg-blue-500/20 flex items-center gap-1"
                        >
                          <PlayCircle size={12} />
                          Start
                        </button>
                      )}
                      {req.status === 'IN_PROGRESS' && (
                        <button 
                          onClick={() => statusMutation.mutate({ id: req.request_id, status: 'COMPLETED' })}
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20 flex items-center gap-1"
                        >
                          <CheckCircle size={12} />
                          Complete
                        </button>
                      )}
                      {req.status === 'COMPLETED' && <span className="text-[10px] text-slate-500 font-bold">DONE</span>}
                      
                      <button 
                        onClick={() => { if(confirm('Delete request?')) deleteMutation.mutate(req.request_id); }}
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

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-lg relative animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">New Work Order</h2>
            {formError && <div className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-lg mb-6">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Request ID</label>
                  <input type="number" required className="input-field" value={formData.request_id} onChange={e => setFormData({...formData, request_id: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Date</label>
                  <input type="date" required className="input-field" value={formData.request_date} onChange={e => setFormData({...formData, request_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Description</label>
                <textarea required maxLength={200} className="input-field h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the issue..." />
                <p className="text-[10px] text-right text-slate-500 mt-1">{formData.description.length}/200</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Resident</label>
                <select required className="input-field" value={formData.resident_id} onChange={e => setFormData({...formData, resident_id: e.target.value})}>
                  <option value="">Select Resident</option>
                  {residents?.map(r => <option key={r.resident_id} value={r.resident_id}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Provider</label>
                  <select className="input-field" value={formData.provider_id} onChange={e => setFormData({...formData, provider_id: e.target.value})}>
                    <option value="">None</option>
                    {providers?.map(p => <option key={p.provider_id} value={p.provider_id}>{p.name} ({p.service_type})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Staff</label>
                  <select className="input-field" value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})}>
                    <option value="">None</option>
                    {staff?.map(s => <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.role})</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary">{createMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
