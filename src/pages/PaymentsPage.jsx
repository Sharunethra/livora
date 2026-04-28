import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard, Search, X, Loader2, AlertCircle, Calendar, User } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const PaymentsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    payment_id: '', amount: '', pay_date: new Date().toISOString().split('T')[0], mode: 'UPI', resident_id: '', invoice_id: '' 
  });
  const [formError, setFormError] = useState('');

  // Fetch data
  const { data: payments, isLoading } = useQuery({ queryKey: ['payments'], queryFn: () => api.get('/payments').then(r => r.data.data) });
  const { data: residents } = useQuery({ queryKey: ['residents-list'], queryFn: () => api.get('/residents').then(r => r.data.data) });
  const { data: invoices } = useQuery({ queryKey: ['invoices-list'], queryFn: () => api.get('/invoices').then(r => r.data.data) });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/payments', data),
    onSuccess: () => { queryClient.invalidateQueries(['payments']); setShowModal(false); },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to process payment')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 glass-card animate-pulse" />)}</div>;

  const filteredPayments = payments?.filter(p => 
    p.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.payment_id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by payment ID or resident..." className="input-field pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Record Payment
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Resident</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments?.map(payment => (
                <tr key={payment.payment_id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-sm text-slate-400">PAY-{payment.payment_id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">{payment.resident_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">INV-{payment.invoice_id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-400">₹{Number(payment.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{new Date(payment.pay_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={payment.mode} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Record New Payment</h2>
            {formError && <div className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-lg mb-6">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Payment ID</label>
                  <input type="number" required className="input-field" value={formData.payment_id} onChange={e => setFormData({...formData, payment_id: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Amount (₹)</label>
                  <input type="number" required className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Resident</label>
                <select required className="input-field" value={formData.resident_id} onChange={e => setFormData({...formData, resident_id: e.target.value})}>
                  <option value="">Select Resident</option>
                  {residents?.map(r => <option key={r.resident_id} value={r.resident_id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Invoice ID</label>
                <input type="number" required className="input-field" value={formData.invoice_id} onChange={e => setFormData({...formData, invoice_id: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Date</label>
                  <input type="date" required className="input-field" value={formData.pay_date} onChange={e => setFormData({...formData, pay_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">Mode</label>
                  <select className="input-field" value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})}>
                    <option value="UPI">UPI</option>
                    <option value="CARD">CARD</option>
                    <option value="CASH">CASH</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 btn-primary">{createMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Process Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
