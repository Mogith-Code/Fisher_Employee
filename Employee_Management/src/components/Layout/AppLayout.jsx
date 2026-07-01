import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/* Map pathnames to readable page titles */
const routeTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/catch': 'Daily Catch',
  '/pricing': 'Fish Pricing',
  '/expenses': 'Expenses',
  '/invoices/seller': 'Seller Invoice',
  '/invoices/daily': 'Daily Invoice',
  '/invoices/weekly': 'Weekly Settlement',
  '/settings': 'Settings',
};

const LG_BREAKPOINT = 1024;

export default function AppLayout({ title: titleProp }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= LG_BREAKPOINT
  );

  /* Track viewport width */
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, []);

  /* Derive title from route if not provided */
  const pageTitle =
    titleProp ||
    routeTitles[location.pathname] ||
    location.pathname
      .split('/')
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' › ') ||
    'Dashboard';

  const toggleMobile = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-brand-ivory font-sans flex overflow-x-hidden">
      {/* ── Mobile Sidebar Drawer Backdrop ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
      />

      {/* ── Sidebar Component (Handles both desktop and mobile drawer internally via CSS) ── */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
        isDesktop={isDesktop}
      />

      {/* ── Main Content Area ── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full
          ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'}`}
      >
        {/* Sticky TopBar (Used on both mobile & desktop) */}
        <div className="sticky top-0 z-30">
          <TopBar
            title={pageTitle}
            onMenuClick={toggleMobile}
            showMenu={true} // Hamburger button is visible on mobile and hidden on desktop via CSS inside TopBar
          />
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
