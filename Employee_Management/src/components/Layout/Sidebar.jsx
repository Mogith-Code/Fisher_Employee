import { NavLink } from 'react-router-dom';
import logoImg from '../../assets/Images/KDTlogo.png';
import {
  LayoutDashboard,
  Users,
  Fish,
  DollarSign,
  Receipt,
  FileText,
  FileSpreadsheet,
  CalendarCheck,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Anchor,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Employees', icon: Users, path: '/employees' },
  { label: 'Daily Catch', icon: Fish, path: '/catch' },
  { label: 'Fish Pricing', icon: DollarSign, path: '/pricing' },
  { label: 'Expenses', icon: Receipt, path: '/expenses' },
  { label: 'Seller Invoice', icon: FileText, path: '/invoices/seller' },
  { label: 'Daily Invoice', icon: FileSpreadsheet, path: '/invoices/daily' },
  { label: 'Weekly Settlement', icon: CalendarCheck, path: '/invoices/weekly' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  return (
    <aside
      className="responsive-sidebar fixed top-0 left-0 z-50 h-screen flex flex-col bg-[#032c38] text-white select-none
        transition-transform duration-300 ease-in-out lg:z-40"
      style={{
        width: collapsed ? 72 : 260,
        '--sidebar-translate': mobileOpen ? '0%' : '-100%',
      }}
    >
      {/* ── Logo area ── */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="KDT Logo"
            className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 shrink-0 shadow-md"
          />

          <div
            className="overflow-hidden whitespace-nowrap"
            style={{
              width: collapsed ? 0 : 160,
              opacity: collapsed ? 0 : 1,
              transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
            }}
          >
            <h1 className="text-[15px] font-bold tracking-wide font-display leading-tight">
              KDT <span className="text-teal-400">SEA FOOD</span>
            </h1>
            <p className="text-[10px] text-white/40 tracking-widest uppercase leading-none mt-0.5">
              Fisheries Mgmt
            </p>
          </div>
        </div>

        {/* Mobile close drawer button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5 space-y-1 scrollbar-thin">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dashboard'}
            onClick={onCloseMobile} // Close mobile drawer when user navigates
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl py-2.5 cursor-pointer transition-all duration-200 ${
                collapsed ? 'justify-center px-0' : 'px-3'
              } ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/55 hover:bg-white/5 hover:text-white/90'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active accent bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-teal-400 shadow-sm shadow-teal-400/50" />
                )}

                <Icon size={19} className="shrink-0" />

                <span
                  className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                  style={{
                    width: collapsed ? 0 : 'auto',
                    opacity: collapsed ? 0 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {label}
                </span>

                {/* Tooltip on collapsed state */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-50">
                    {label}
                    <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Collapse toggle ── */}
      <div className="hidden lg:block shrink-0 border-t border-white/10 p-2.5">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && (
            <span className="text-xs font-medium">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
