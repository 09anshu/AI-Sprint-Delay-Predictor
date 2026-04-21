import { HiOutlineX } from 'react-icons/hi';
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={`card p-6 w-full ${maxWidth} animate-slide-up`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><HiOutlineX className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};
export default Modal;
