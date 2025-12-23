import { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'from-green-600 to-emerald-600 border-green-500',
    error: 'from-red-600 to-rose-600 border-red-500',
    warning: 'from-yellow-600 to-orange-600 border-yellow-500',
    info: 'from-blue-600 to-indigo-600 border-blue-500'
  };

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className={`bg-gradient-to-r ${colors[type]} text-white px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[280px] max-w-md`}>
        <div className="flex-shrink-0">{icons[type]}</div>
        <p className="font-medium text-sm flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="flex-shrink-0 hover:bg-white/20 p-1 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
