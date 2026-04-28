import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Users, Search, X, Loader2, AlertCircle, Phone, MapPin, Calendar } from 'lucide-react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const ResidentsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [formData, setFormData] = useState({ 
    resident_id: '', name: '', dob: '', street: '', city: '', state: '', pincode: '', phone_no1: '', phone_no2: '', type: 'OWNER' 
  });
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Fetch residents
  const { data, isLoading, error } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const response = await api.get('/residents');
      return response.data.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/residents', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['residents']);
      setShowModal(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create resident')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/residents/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['residents']);
      setShowModal(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to update resident')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/residents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['residents']);
      setDeleteConfirm({ open: false, id: null });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!/^\d{6}$/.test(formData.pincode)) {
      setFormError('Pincode must be exactly 6 digits');
      return;
    }
    
    if (new Date(formData.dob) > new Date()) {
      setFormError('Date of birth cannot be in the future');
      return;
    }

    if (editingResident) {
      updateMutation.mutate({ id: editingResident.resident_id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenModal = (resident = null) => {
    if (resident) {
      setEditingResident(resident);
      setFormData({
        ...resident,
        dob: resident.dob ? resident.dob.split('T')[0] : '',
        phone_no1: resident.phone_no1 || '',
        phone_no2: resident.phone_no2 || '',
        type: resident.type || 'OWNER'
      });
    } else {
      setEditingResident(null);
      setFormData({ resident_id: '', name: '', dob: '', street: '', city: '', state: '', pincode: '', phone_no1: '', phone_no2: '', type: 'OWNER' });
    }
    setFormError('');
    setShowModal(true);
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 glass-card animate-pulse" />)}
    </div>
  );

  if (error) return (
    <div className="glass-card p-6 text-rose-400 flex items-center gap-3">
      <AlertCircle size={20} />
      Failed to load residents.
    </div>
  );

  const filteredResidents = data?.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search residents by name or city..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Resident
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredResidents?.map((resident) => (
                <tr key={resident.resident_id} className="group hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-sm text-slate-400">RES-{resident.resident_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{resident.name}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(resident.dob).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-300 flex items-center gap-1">
                        <Phone size={12} className="text-indigo-400" />
                        {resident.phone_no1}
                      </span>
                      {resident.phone_no2 && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Phone size={10} />
                          {resident.phone_no2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-300">{resident.city}, {resident.state}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin size={10} />
                        {resident.pincode}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      resident.type === 'OWNER' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {resident.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(resident)}
                        className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ open: true, id: resident.resident_id })}
                        className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-all"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-2xl relative animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingResident ? 'Edit Resident' : 'Add Resident'}
            </h2>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2 mb-6">
                <AlertCircle size={14} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Resident ID</label>
                  <input type="number" required disabled={!!editingResident} className="input-field" value={formData.resident_id} onChange={e => setFormData({...formData, resident_id: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Full Name</label>
                  <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Date of Birth</label>
                  <input type="date" required className="input-field" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                 <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Resident Type</label>
                  <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="OWNER">OWNER</option>
                    <option value="TENANT">TENANT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Primary Phone</label>
                  <input type="text" required className="input-field" value={formData.phone_no1} onChange={e => setFormData({...formData, phone_no1: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">City</label>
                    <input type="text" className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Pincode</label>
                    <input type="text" required className="input-field" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">State</label>
                  <input type="text" className="input-field" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Street</label>
                  <input type="text" className="input-field" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="animate-spin" size={18} /> : (editingResident ? 'Update Resident' : 'Create Resident')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={deleteConfirm.open}
        title="Delete Resident"
        message="Are you sure? This will remove the resident and their associated phone records."
        onConfirm={() => deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </div>
  );
};

export default ResidentsPage;
