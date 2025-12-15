import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-stone-100">
          <h3 className="text-lg font-bold text-stone-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
        {footer && (
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Empty State ---
interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
        {Icon ? <Icon size={32} /> : <Info size={32} />}
      </div>
      <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
      <p className="text-stone-500 max-w-xs mb-6">{description}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// --- Toast / Notification ---
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
             type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
             'bg-blue-50 border-blue-200 text-blue-800';
  
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;

  return (
    <div className={`fixed bottom-6 right-6 flex items-center p-4 rounded-xl shadow-lg border ${bg} animate-in slide-in-from-bottom-5 z-50`}>
      <Icon size={20} className="mr-3" />
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

// --- Form Elements ---
export const Button: React.FC<any> = ({ variant = 'primary', className = '', ...props }) => {
    const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
    const variants: any = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200",
        secondary: "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
        ghost: "bg-transparent text-stone-500 hover:bg-stone-100"
    };
    return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};

export const Input: React.FC<any> = ({ label, error, ...props }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>}
        <input 
            className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-300 focus:ring-red-100' : 'border-stone-200 focus:ring-primary-100 focus:border-primary-400'}`}
            {...props} 
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

export const Select: React.FC<any> = ({ label, options, ...props }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>}
        <select 
             className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
            {...props}
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);