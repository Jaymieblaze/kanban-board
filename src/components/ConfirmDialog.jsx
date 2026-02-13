import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white dark:bg-gray-800 p-6 w-[95vw] sm:w-[450px] max-w-[90vw] rounded-2xl shadow-2xl border border-purple-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 font-medium shadow-md hover:shadow-lg transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default ConfirmDialog;
