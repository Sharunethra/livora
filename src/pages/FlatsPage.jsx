import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Home, Search, X, Loader2, AlertCircle, Building, Filter } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const FlatsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);
  const [formData, setFormData] = useState({ flat_id: '', flat_type: '2BHK', status: 'AVAILABLE', building_id: '' });
  const [formError, setFormError] = useState('');

  // Fetch data
  const { data: flats, isLoading } = useQuery({ 
    queryKey: ['flats', statusFilter], 
    queryFn: () => api.get(`/flats${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.data.data) 
  });
  const { data: buildings } = useQuery({ queryKey: ['buildings-list'], queryFn: () => api.get('/buildings').then(r => r.data.data) });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/flats', data),
    onSuccess: () => { queryClient.invalidateQueries(['flats']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create flat')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/flats/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries(['flats']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to update flat')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/flats/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['flats'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFlat) updateMutation.mutate({ id: editingFlat.flat_id, data: formData });
    else createMutation.mutate(formData);
  };

  const handleOpenModal = (f = null) => {
    if (f) { setEditingFlat(f); setFormData(f); }
    else { setEditingFlat(null); setFormData({ flat_id: '', flat_type: '2BHK', status: 'AVAILABLE', building_id: '' }); }
    setFormError(''); setShowModal(true);
  };

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 glass-card animate-pulse" />)}</div>;

  const filteredFlats = flats?.filter(f => 
    f.flat_id.toString().includes(searchTerm) || 
    f.building_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by flat ID or building..." className="input-field pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select className="input-field pl-10 pr-8 appearance-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
            </select>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Flat
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Flat ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Building</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFlats?.map(flat => (
                <tr key={flat.flat_id} className="group hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-sm font-bold text-white">{flat.flat_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-300">{flat.building_name}</span>
                      <span className="text-[10px] text-slate-500">{flat.society_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{flat.flat_type}</td>
                  <td className="px-6 py-4"><StatusBadge status={flat.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(flat)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"><Edit2 size={16} /></button>
                      <button onClick={() => { if(confirm('Delete flat?')) deleteMutation.mutate(flat.flat_id); }} className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400"><Trash2 size={16} /></button>
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
            <h2 className="text-2xl font-bold text-white mb-6">{editingFlat ? 'Edit Flat' : 'Add Flat'}</h2>
            {formError && <div className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-lg mb-6">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Flat ID</label>
                <input type="number" required disabled={!!editingFlat} className="input-field" value={formData.flat_id} onChange={e => setFormData({...formData, flat_id: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Building</label>
                <select required className="input-field" value={formData.building_id} onChange={e => setFormData({...formData, building_id: e.target.value})}>
                  <option value="">Select Building</option>
                  {buildings?.map(b => <option key={b.building_id} value={b.building_id}>{b.name} ({b.society_name})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Type</label>
                  <select className="input-field" value={formData.flat_type} onChange={e => setFormData({...formData, flat_type: e.target.value})}>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Status</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">{editingFlat ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlatsPage;
