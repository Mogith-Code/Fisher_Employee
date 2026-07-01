import React from 'react';

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="p-4 rounded-2xl bg-gray-50 mb-5">
          <Icon className="w-10 h-10 text-brand-gray/40" />
        </div>
      )}

      <h3 className="text-lg font-display font-semibold text-brand-dark mb-1.5">
        {title}
      </h3>

      {message && (
        <p className="text-sm text-brand-gray max-w-sm leading-relaxed">
          {message}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-5 py-2.5 bg-brand-teal text-white text-sm font-medium rounded-xl
            hover:bg-brand-teal-dark shadow-sm hover:shadow-md
            transition-all-custom cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
