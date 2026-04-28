import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Edit2, Trash2, MapPin, Building, Search } from 'lucide-react';

const SocietiesPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch societies
  const { data, isLoading, error } = useQuery({
    queryKey: ['societies'],
    queryFn: async () => {
      const response = await api.get('/societies');
      return response.data.data;
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/societies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['societies']);
    }
  });

  if (isLoading) return <div className="text-white">Loading societies...</div>;
  if (error) return <div className="text-red-400">Error loading societies</div>;

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
        <button className="btn-primary flex items-center gap-2">
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
                <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
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
              <span className="text-slate-500">ID: SOC-{society.society_id}</span>
              <button className="text-indigo-400 font-bold hover:text-indigo-300">Manage Units →</button>
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
    </div>
  );
};

export default SocietiesPage;
