import { format } from 'date-fns';
import { LogOut, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TopBar({ title, subtitle, onMenuClick, showMenu }) {
  const { user, logout } = useAuth();

  const today = format(new Date(), 'EEEE, dd MMM yyyy');

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A';

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-5 lg:px-6">
      {/* ── Left: Menu + Title ── */}
      <div className="flex items-center gap-3">
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-brand-gray hover:bg-slate-100 hover:text-brand-dark transition-all duration-200 cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}

        <div>
          <h1 className="text-lg font-semibold text-brand-dark font-display tracking-tight leading-tight">
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <p className="text-xs text-brand-gray mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* ── Right: Date + Notifications + Avatar + Logout ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date */}
        <span className="hidden md:block text-xs text-brand-gray font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          {today}
        </span>

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-brand-gray hover:bg-slate-100 hover:text-brand-dark transition-all duration-200 cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-7 bg-slate-200" />

        {/* Admin avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-teal to-brand-teal-light flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-brand-dark leading-tight">
              {user?.name || 'Admin'}
            </p>
            <p className="text-[10px] text-brand-gray leading-tight">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign out"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-brand-gray hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
