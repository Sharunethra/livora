import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Building, Search, X, Loader2, AlertCircle, MapPin } from 'lucide-react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const BuildingsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [formData, setFormData] = useState({ building_id: '', name: '', society_id: '' });
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Fetch data
  const { data: buildings, isLoading } = useQuery({ queryKey: ['buildings'], queryFn: () => api.get('/buildings').then(r => r.data.data) });
  const { data: societies } = useQuery({ queryKey: ['societies-list'], queryFn: () => api.get('/societies').then(r => r.data.data) });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/buildings', data),
    onSuccess: () => { queryClient.invalidateQueries(['buildings']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create building')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/buildings/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries(['buildings']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to update building')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/buildings/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['buildings']); setDeleteConfirm({ open: false, id: null }); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBuilding) updateMutation.mutate({ id: editingBuilding.building_id, data: formData });
    else createMutation.mutate(formData);
  };

  const handleOpenModal = (b = null) => {
    if (b) { setEditingBuilding(b); setFormData(b); }
    else { setEditingBuilding(null); setFormData({ building_id: '', name: '', society_id: '' }); }
    setFormError(''); setShowModal(true);
  };

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-48 glass-card animate-pulse" />)}</div>;

  const filteredBuildings = buildings?.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search buildings..." className="input-field pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Building
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBuildings?.map(b => (
          <div key={b.building_id} className="glass-card group p-6 hover:ring-1 hover:ring-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Building size={24} /></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(b)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"><Edit2 size={16} /></button>
                <button onClick={() => setDeleteConfirm({ open: true, id: b.building_id })} className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{b.name}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
              <MapPin size={14} /> {b.society_name}
            </div>
            <div className="pt-4 border-t border-white/5 text-[10px] text-slate-500 font-medium">ID: BLD-{b.building_id}</div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-md relative animate-in slide-in-from-bottom-4">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">{editingBuilding ? 'Edit Building' : 'Add Building'}</h2>
            {formError && <div className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-lg mb-6">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Building ID</label>
                <input type="number" required disabled={!!editingBuilding} className="input-field" value={formData.building_id} onChange={e => setFormData({...formData, building_id: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Name</label>
                <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Society</label>
                <select required className="input-field" value={formData.society_id} onChange={e => setFormData({...formData, society_id: e.target.value})}>
                  <option value="">Select Society</option>
                  {societies?.map(s => <option key={s.society_id} value={s.society_id}>{s.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">{editingBuilding ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={deleteConfirm.open} 
        onConfirm={() => deleteMutation.mutate(deleteConfirm.id)} 
        onCancel={() => setDeleteConfirm({ open: false, id: null })} 
        message="Deleting a building might affect associated flats. Proceed?"
      />
    </div>
  );
};

export default BuildingsPage;
