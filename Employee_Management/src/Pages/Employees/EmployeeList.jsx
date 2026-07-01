import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { Plus, Search, Users, Trash2, MoreVertical } from 'lucide-react';
import { WEEK_START_DAY } from '../../data/constants';
import EmployeeCard from '../../components/Employees/EmployeeCard';
import AddEmployeeModal from '../../components/Employees/AddEmployeeModal';
import DeleteEmployeeModal from '../../components/Employees/DeleteEmployeeModal';

export default function EmployeeList() {
  const navigate = useNavigate();
  const { employees, getEmployeeWeeklySummary } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [contextMenuId, setContextMenuId] = useState(null);

  // Current week date range
  const weekRange = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: WEEK_START_DAY });
    const end = endOfWeek(now, { weekStartsOn: WEEK_START_DAY });
    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    };
  }, []);

  // Compute weekly balances for all employees
  const weeklyBalances = useMemo(() => {
    const balances = {};
    employees.forEach((emp) => {
      const summary = getEmployeeWeeklySummary(emp.id, weekRange.start, weekRange.end);
      balances[emp.id] = summary?.netBalance ?? null;
    });
    return balances;
  }, [employees, weekRange, getEmployeeWeeklySummary]);

  // Filter employees by search
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase().trim();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.nic.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  const handleCardClick = (employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleDeleteClick = (e, employee) => {
    e.stopPropagation();
    setContextMenuId(null);
    setDeleteTarget(employee);
  };

  const toggleContextMenu = (e, empId) => {
    e.stopPropagation();
    setContextMenuId((prev) => (prev === empId ? null : empId));
  };

  // Close context menu on outside click
  const handleBackdropClick = () => {
    if (contextMenuId) setContextMenuId(null);
  };

  return (
    <div className="min-h-screen bg-brand-ivory" onClick={handleBackdropClick}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-dark font-display tracking-tight">
              Employees
            </h1>
            <p className="text-sm text-brand-gray mt-1">
              {employees.length} {employees.length === 1 ? 'fisherman' : 'fishermen'} registered
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-teal text-white text-sm
              font-semibold rounded-xl hover:bg-brand-teal-light active:bg-brand-teal-dark
              shadow-sm hover:shadow-md active:scale-[0.98] transition-all-custom cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Employee
          </button>
        </div>

        {/* Search */}
        {employees.length > 0 && (
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or NIC..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                text-brand-dark placeholder:text-brand-gray/50
                focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                transition-all-custom"
            />
          </div>
        )}

        {/* Employee Grid */}
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="relative group">
                <EmployeeCard
                  employee={emp}
                  weeklyBalance={weeklyBalances[emp.id]}
                  onClick={handleCardClick}
                />

                {/* Context menu trigger */}
                <button
                  onClick={(e) => toggleContextMenu(e, emp.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300
                    hover:text-brand-gray hover:bg-gray-100 transition-all-custom cursor-pointer
                    opacity-0 group-hover:opacity-100 z-10"
                  style={{ opacity: contextMenuId === emp.id ? 1 : undefined }}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Context dropdown */}
                {contextMenuId === emp.id && (
                  <div
                    className="absolute top-10 right-3 z-20 bg-white rounded-xl shadow-lg border border-gray-100
                      py-1 min-w-[140px] overflow-hidden"
                  >
                    <button
                      onClick={(e) => handleDeleteClick(e, emp)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600
                        hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : employees.length > 0 ? (
          /* No search results */
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-brand-dark">
              No matches found
            </h3>
            <p className="text-sm text-brand-gray mt-1">
              Try a different name or NIC number
            </p>
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-brand-teal/50" />
            </div>
            <h3 className="text-xl font-display font-semibold text-brand-dark">
              No employees yet
            </h3>
            <p className="text-sm text-brand-gray mt-2 max-w-sm mx-auto">
              Add your first fisherman to start tracking catch entries,
              expenses, and weekly settlements.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-teal text-white text-sm
                font-semibold rounded-xl hover:bg-brand-teal-light shadow-sm hover:shadow-md
                transition-all-custom cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add First Employee
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <DeleteEmployeeModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        employee={deleteTarget}
      />
    </div>
  );
}
