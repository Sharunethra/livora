import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Bell, Search, X, Loader2, AlertCircle, Calendar, Building } from 'lucide-react';
import api from '../services/api';

const NoticesPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ notice_id: '', society_id: '', content: '', notice_date: new Date().toISOString().split('T')[0] });
  const [formError, setFormError] = useState('');

  // Fetch data
  const { data: notices, isLoading } = useQuery({ queryKey: ['notices'], queryFn: () => api.get('/notices').then(r => r.data.data) });
  const { data: societies } = useQuery({ queryKey: ['societies-list'], queryFn: () => api.get('/societies').then(r => r.data.data) });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/notices', data),
    onSuccess: () => { queryClient.invalidateQueries(['notices']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to post notice')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notices/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['notices'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-48 glass-card animate-pulse" />)}</div>;

  const filteredNotices = notices?.filter(n => n.content.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search notices..." className="input-field pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Post New Notice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices?.map(notice => (
          <div key={notice.notice_id} className="glass-card group p-6 flex flex-col hover:ring-1 hover:ring-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Bell size={20} />
              </div>
              <button 
                onClick={() => { if(confirm('Delete this notice?')) deleteMutation.mutate(notice.notice_id); }}
                className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <p className="text-white text-sm leading-relaxed mb-6 flex-1">{notice.content}</p>
            
            <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <Building size={12} className="text-indigo-400" />
                {notice.society_name}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <Calendar size={12} />
                {new Date(notice.notice_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        {filteredNotices?.length === 0 && <div className="col-span-full py-20 text-center glass-card text-slate-500">No notices found.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-md relative animate-in slide-in-from-bottom-4">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Post New Notice</h2>
            {formError && <div className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-lg mb-6">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Notice ID</label>
                <input type="number" required className="input-field" value={formData.notice_id} onChange={e => setFormData({...formData, notice_id: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Society</label>
                <select required className="input-field" value={formData.society_id} onChange={e => setFormData({...formData, society_id: e.target.value})}>
                  <option value="">Select Society</option>
                  {societies?.map(s => <option key={s.society_id} value={s.society_id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Date</label>
                <input type="date" required className="input-field" value={formData.notice_date} onChange={e => setFormData({...formData, notice_date: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase">Content</label>
                <textarea required maxLength={255} className="input-field h-32 resize-none" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Type notice content..." />
                <p className="text-[10px] text-right text-slate-500 mt-1">{formData.content.length}/255</p>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary">{createMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Post Notice'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
