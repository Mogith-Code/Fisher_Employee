import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`${sizeClasses[size]} w-full relative bg-white rounded-2xl shadow-2xl
          animate-in slide-in-from-bottom-4 fade-in duration-300 ease-out
          border border-gray-100`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-display font-semibold text-brand-dark">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-gray hover:text-brand-dark hover:bg-gray-100
              transition-all-custom cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
