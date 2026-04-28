import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Trash2, ShieldAlert, Search, X, Loader2, AlertCircle, Filter } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const ComplaintsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ complaint_id: '', resident_id: '', created_date: new Date().toISOString().split('T')[0], status: 'OPEN' });
  const [formError, setFormError] = useState('');
  const [closeConfirm, setCloseConfirm] = useState({ open: false, id: null });

  // Fetch data
  const { data: complaints, isLoading, error } = useQuery({
    queryKey: ['complaints', statusFilter],
    queryFn: async () => {
      const response = await api.get(`/complaints${statusFilter ? `?status=${statusFilter}` : ''}`);
      return response.data.data;
    }
  });

  const { data: residents } = useQuery({
    queryKey: ['residents-list'],
    queryFn: async () => {
      const response = await api.get('/residents');
      return response.data.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/complaints', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['complaints']);
      setShowModal(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to file complaint')
  });

  const closeMutation = useMutation({
    mutationFn: (id) => api.put(`/complaints/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries(['complaints']);
      setCloseConfirm({ open: false, id: null });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/complaints/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['complaints'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-16 glass-card animate-pulse" />)}
    </div>
  );

  if (error) return (
    <div className="glass-card p-6 text-rose-400 flex items-center gap-3">
      <AlertCircle size={20} />
      Failed to load complaints.
    </div>
  );

  const filteredComplaints = complaints?.filter(c => 
    c.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.complaint_id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or resident..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="input-field pl-10 appearance-none pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          File Complaint
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredComplaints?.map((complaint) => (
                <tr key={complaint.complaint_id} className="group hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-sm text-slate-400">CMP-{complaint.complaint_id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{complaint.resident_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{new Date(complaint.created_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {complaint.status === 'OPEN' && (
                        <button 
                          onClick={() => setCloseConfirm({ open: true, id: complaint.complaint_id })}
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Close
                        </button>
                      )}
                      <button 
                        onClick={() => { if(confirm('Delete this complaint?')) deleteMutation.mutate(complaint.complaint_id); }}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
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

      {/* File Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">File New Complaint</h2>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2 mb-6">
                <AlertCircle size={14} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Complaint ID</label>
                <input type="number" required className="input-field" value={formData.complaint_id} onChange={e => setFormData({...formData, complaint_id: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Resident</label>
                <select 
                  required 
                  className="input-field"
                  value={formData.resident_id}
                  onChange={e => setFormData({...formData, resident_id: e.target.value})}
                >
                  <option value="">Select Resident</option>
                  {residents?.map(r => <option key={r.resident_id} value={r.resident_id}>{r.name} (ID: {r.resident_id})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Date</label>
                <input type="date" required className="input-field" value={formData.created_date} onChange={e => setFormData({...formData, created_date: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Initial Status</label>
                <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'File Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={closeConfirm.open}
        title="Close Complaint"
        message={`Are you sure you want to mark complaint CMP-${closeConfirm.id} as resolved?`}
        confirmText="Yes, Close"
        type="info"
        onConfirm={() => closeMutation.mutate(closeConfirm.id)}
        onCancel={() => setCloseConfirm({ open: false, id: null })}
      />
    </div>
  );
};

export default ComplaintsPage;
