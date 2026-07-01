import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  danger = false,
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        {danger && (
          <div className="p-3 rounded-2xl bg-red-50 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        )}

        <p className="text-sm text-brand-gray leading-relaxed max-w-xs">
          {message}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl
            border border-gray-200 text-brand-gray
            hover:bg-gray-50 hover:text-brand-dark
            transition-all-custom cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white
            shadow-sm hover:shadow-md transition-all-custom cursor-pointer
            ${danger
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-brand-teal hover:bg-brand-teal-dark'
            }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
