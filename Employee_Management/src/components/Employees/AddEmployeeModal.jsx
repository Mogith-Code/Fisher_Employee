import React, { useState } from 'react';
import Modal from '../UI/Modal';
import { useData } from '../../context/DataContext';
import { User, CreditCard, Phone, Loader2 } from 'lucide-react';

// Sri Lankan NIC: old format (9 digits + V/X) or new format (12 digits)
const NIC_REGEX = /^(\d{9}[VvXx]|\d{12})$/;

const initialFormState = {
  name: '',
  nic: '',
  phone: '',
};

export default function AddEmployeeModal({ isOpen, onClose }) {
  const { addEmployee, employees } = useData();
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.nic.trim()) {
      newErrors.nic = 'NIC number is required';
    } else if (!NIC_REGEX.test(form.nic.trim())) {
      newErrors.nic = 'Invalid NIC format (9 digits + V/X or 12 digits)';
    } else {
      // Duplicate NIC check
      const normalizedNic = form.nic.trim().toUpperCase();
      const exists = employees.some(
        (emp) => emp.nic.toUpperCase() === normalizedNic
      );
      if (exists) {
        newErrors.nic = 'An employee with this NIC already exists';
      }
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate a brief delay for UX
    setTimeout(() => {
      addEmployee({
        name: form.name.trim(),
        nic: form.nic.trim().toUpperCase(),
        phone: form.phone.trim(),
      });

      setSuccessMessage(`${form.name.trim()} has been added successfully!`);
      setForm(initialFormState);
      setErrors({});
      setIsSubmitting(false);

      // Auto-close after success feedback
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    }, 400);
  };

  const handleClose = () => {
    setForm(initialFormState);
    setErrors({});
    setSuccessMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Employee">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Success feedback */}
        {successMessage && (
          <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <span className="text-base">✓</span>
            {successMessage}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-brand-dark/85 tracking-wide block">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50 pointer-events-none" />
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. Mohamed Rizwan"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-brand-dark
                bg-white placeholder:text-brand-gray/50
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom ${
                  errors.name ? 'border-red-300 focus:ring-red-200/50 focus:border-red-400' : 'border-gray-200'
                }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* NIC */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-brand-dark/85 tracking-wide block">
            NIC Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50 pointer-events-none" />
            <input
              type="text"
              value={form.nic}
              onChange={handleChange('nic')}
              placeholder="e.g. 199912345678 or 912345678V"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-brand-dark
                bg-white placeholder:text-brand-gray/50
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom ${
                  errors.nic ? 'border-red-300 focus:ring-red-200/50 focus:border-red-400' : 'border-gray-200'
                }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.nic && (
            <p className="text-xs text-red-500 mt-1">{errors.nic}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-brand-dark/85 tracking-wide block">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50 pointer-events-none" />
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="e.g. 077 1234567"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-brand-dark
                bg-white placeholder:text-brand-gray/50
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom ${
                  errors.phone ? 'border-red-300 focus:ring-red-200/50 focus:border-red-400' : 'border-gray-200'
                }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 text-sm font-medium text-brand-gray bg-white border border-gray-200
              rounded-xl hover:bg-gray-50 hover:text-brand-dark transition-all-custom cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-teal rounded-xl
              hover:bg-brand-teal-light active:bg-brand-teal-dark shadow-sm hover:shadow-md
              active:scale-[0.98] transition-all-custom cursor-pointer
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Employee'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
