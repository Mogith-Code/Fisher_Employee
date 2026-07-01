import React from 'react';
import ConfirmDialog from '../UI/ConfirmDialog';
import { useData } from '../../context/DataContext';

export default function DeleteEmployeeModal({ isOpen, onClose, employee }) {
  const { deleteEmployee } = useData();

  if (!employee) return null;

  const handleConfirm = () => {
    deleteEmployee(employee.id);
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Employee"
      message={
        <>
          Are you sure you want to delete{' '}
          <span className="font-semibold text-brand-dark">{employee.name}</span>?
          This will permanently remove all associated catch entries, expenses,
          and settlement records. This action cannot be undone.
        </>
      }
      confirmLabel="Delete Employee"
      danger={true}
    />
  );
}
