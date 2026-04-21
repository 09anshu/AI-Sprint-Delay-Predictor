import { HiOutlineExclamation } from 'react-icons/hi';
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?', danger = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
            <HiOutlineExclamation className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmDialog;
