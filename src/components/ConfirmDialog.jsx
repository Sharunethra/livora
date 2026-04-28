import { X, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card p-6 w-full max-w-sm relative animate-in zoom-in-95 duration-200 shadow-2xl border-white/20">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-full mb-4 ${
            type === 'danger' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
          }`}>
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{title || 'Are you sure?'}</h3>
          <p className="text-slate-400 text-sm mb-8">{message}</p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-bold text-sm transition-all shadow-lg active:scale-95 ${
                type === 'danger' 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
