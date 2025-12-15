import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';

// --- Card (New Component) ---
export const Card: React.FC<{children: React.ReactNode, className?: string, noPadding?: boolean, hover?: boolean}> = ({ children, className = '', noPadding = false, hover = true }) => (
    <div className={`bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl shadow-sm transition-all duration-300 ${hover ? 'hover:shadow-glow hover:-translate-y-1' : ''} ${noPadding ? '' : 'p-6'} ${className}`}>
        {children}
    </div>
);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with heavy blur */}
      <div 
        className="absolute inset-0 bg-stone-900/30 dark:bg-black/60 backdrop-blur-sm animate-enter" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up relative z-10 border border-stone-100 dark:border-stone-800">
        <div className="flex justify-between items-center p-5 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {children}
        </div>
        {footer && (
          <div className="p-4 bg-stone-50 dark:bg-stone-950/50 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3">
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
    <div className="flex flex-col items-center justify-center h-full p-10 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-stone-50/50 dark:bg-stone-900/30">
      <div className="w-20 h-20 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center mb-6 text-primary-400 shadow-sm border border-stone-100 dark:border-stone-700">
        {Icon ? <Icon size={32} /> : <Info size={32} />}
      </div>
      <h3 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-2">{title}</h3>
      <p className="text-stone-500 max-w-sm mb-8 leading-relaxed">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
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

  const styles = type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300' :
                 type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' :
                 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
  
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;

  return (
    <div className={`fixed bottom-6 right-6 flex items-center p-4 rounded-xl shadow-glow border ${styles} animate-slide-up z-[110] backdrop-blur-md max-w-md`}>
      <Icon size={20} className="mr-3 shrink-0" />
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

// --- Form Elements ---
export const Button: React.FC<any> = ({ variant = 'primary', className = '', loading, children, ...props }) => {
    const base = "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-stone-900";
    
    const variants: any = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 focus:ring-primary-500 border border-transparent",
        secondary: "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 hover:border-stone-300 focus:ring-stone-400",
        danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-transparent focus:ring-red-500",
        ghost: "bg-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
    };

    return (
        <button className={`${base} ${variants[variant]} ${className}`} disabled={loading} {...props}>
            {loading && <Loader2 size={16} className="animate-spin mr-2"/>}
            {children}
        </button>
    );
};

export const Input: React.FC<any> = ({ label, error, icon: Icon, ...props }) => {
    return (
        <div className="mb-5 group">
            {label && <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wide group-focus-within:text-primary-600 transition-colors">{label}</label>}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                        <Icon size={18} />
                    </div>
                )}
                <input 
                    className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:bg-white dark:focus:bg-stone-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm`}
                    {...props} 
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1 font-medium flex items-center"><AlertCircle size={10} className="mr-1"/> {error}</p>}
        </div>
    );
};

export const Select: React.FC<any> = ({ label, options, ...props }) => (
    <div className="mb-5 group">
        {label && <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wide group-focus-within:text-primary-600 transition-colors">{label}</label>}
        <div className="relative">
            <select 
                 className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:bg-white dark:focus:bg-stone-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none cursor-pointer"
                {...props}
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
            </div>
        </div>
    </div>
);