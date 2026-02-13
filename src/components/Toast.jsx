import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success: {
    bg: "bg-gradient-to-r from-green-500 to-emerald-500",
    icon: "text-white",
    border: "border-green-200 dark:border-green-800",
  },
  error: {
    bg: "bg-gradient-to-r from-red-500 to-rose-500",
    icon: "text-white",
    border: "border-red-200 dark:border-red-800",
  },
  info: {
    bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
    icon: "text-white",
    border: "border-blue-200 dark:border-blue-800",
  },
  warning: {
    bg: "bg-gradient-to-r from-amber-500 to-orange-500",
    icon: "text-white",
    border: "border-amber-200 dark:border-amber-800",
  },
};

function Toast({ id, message, type = "info", duration = 3000, onClose }) {
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div
      className={`${styles.bg} text-white px-4 py-3 rounded-lg shadow-2xl border ${styles.border} flex items-center gap-3 min-w-[300px] max-w-[500px] animate-in slide-in-from-right-5 duration-300`}
    >
      <Icon size={20} className={styles.icon} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-white/80 hover:text-white hover:bg-white/20 rounded p-1 transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={onClose}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

export default ToastContainer;
