import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, MessageSquare, Search, X, Loader2, Star, Calendar } from 'lucide-react';
import api from '../services/api';

const FeedbackPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ feedback_id: '', resident_id: '', rating: 5, date: new Date().toISOString().split('T')[0] });
  const [formError, setFormError] = useState('');

  // Fetch data
  const { data: feedback, isLoading } = useQuery({ queryKey: ['feedback'], queryFn: () => api.get('/feedback').then(r => r.data.data) });
  const { data: residents } = useQuery({ queryKey: ['residents-list'], queryFn: () => api.get('/residents').then(r => r.data.data) });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/feedback', data),
    onSuccess: () => { queryClient.invalidateQueries(['feedback']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to submit feedback')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/feedback/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['feedback'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 glass-card animate-pulse" />)}</div>;

  const filteredFeedback = feedback?.filter(f => f.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by resident..." className="input-field pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Feedback
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFeedback?.map(f => (
                <tr key={f.feedback_id} className="group hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-sm text-slate-400">FB-{f.feedback_id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{f.resident_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={14} className={star <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{new Date(f.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { if(confirm('Delete feedback?')) deleteMutation.mutate(f.feedback_id); }}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
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
            <h2 className="text-2xl font-bold text-white mb-6">Add Feedback</h2>
            {formError && <div className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-lg mb-6">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Feedback ID</label>
                <input type="number" required className="input-field" value={formData.feedback_id} onChange={e => setFormData({...formData, feedback_id: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Resident</label>
                <select required className="input-field" value={formData.resident_id} onChange={e => setFormData({...formData, resident_id: e.target.value})}>
                  <option value="">Select Resident</option>
                  {residents?.map(r => <option key={r.resident_id} value={r.resident_id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-4 uppercase tracking-wider">Rating</label>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className="transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star 
                        size={32} 
                        className={star <= formData.rating ? 'fill-amber-400 text-amber-400 shadow-amber-500/50' : 'text-slate-600'} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Date</label>
                <input type="date" required className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary">{createMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Submit Feedback'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
