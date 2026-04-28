import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, MapPin, Building, Search, X, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const SocietiesPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSociety, setEditingSociety] = useState(null);
  const [formData, setFormData] = useState({ society_id: '', name: '', location: '' });
  const [formError, setFormError] = useState('');

  // Fetch societies
  const { data, isLoading, error } = useQuery({
    queryKey: ['societies'],
    queryFn: async () => {
      const response = await api.get('/societies');
      return response.data.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/societies', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['societies']);
      setShowModal(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create society')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/societies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['societies']);
      setShowModal(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to update society')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/societies/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['societies'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (editingSociety) {
      updateMutation.mutate({ id: editingSociety.society_id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenModal = (society = null) => {
    if (society) {
      setEditingSociety(society);
      setFormData(society);
    } else {
      setEditingSociety(null);
      setFormData({ society_id: '', name: '', location: '' });
    }
    setFormError('');
    setShowModal(true);
  };

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-48 glass-card animate-pulse" />)}
    </div>
  );

  if (error) return (
    <div className="glass-card p-6 text-rose-400 flex items-center gap-3">
      <AlertCircle size={20} />
      Failed to load societies.
    </div>
  );

  const filteredSocieties = data?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search societies..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add New Society
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSocieties?.map((society) => (
          <div key={society.society_id} className="glass-card group p-6 hover:ring-2 hover:ring-indigo-500/50">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <Building size={24} />
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(society)}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => {
                    if(confirm('Are you sure you want to delete this society?')) {
                      deleteMutation.mutate(society.society_id);
                    }
                  }}
                  className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{society.name}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
              <MapPin size={14} />
              {society.location}
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">ID: SOC-{society.society_id}</span>
              <button className="text-indigo-400 font-bold hover:text-indigo-300">View Details →</button>
            </div>
          </div>
        ))}

        {filteredSocieties?.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card">
            <Building className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400">No societies found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-card p-8 w-full max-w-md relative animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingSociety ? 'Edit Society' : 'Add New Society'}
            </h2>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2 mb-6">
                <AlertCircle size={14} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Society ID</label>
                <input 
                  type="number" 
                  required
                  disabled={!!editingSociety}
                  className="input-field disabled:opacity-50"
                  placeholder="e.g. 1"
                  value={formData.society_id}
                  onChange={(e) => setFormData({...formData, society_id: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Society Name</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  placeholder="e.g. Green Meadows"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Location</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  placeholder="e.g. Chennai"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-all font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (editingSociety ? 'Save Changes' : 'Create Society')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocietiesPage;
