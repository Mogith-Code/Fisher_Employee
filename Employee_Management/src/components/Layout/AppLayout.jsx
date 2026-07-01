import { useState, useEffect, useCallback } from 'react';
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

  /* Close mobile sidebar on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* Lock body scroll when mobile overlay is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const sidebarWidth = collapsed ? 72 : 260;
  const contentMargin = isDesktop ? sidebarWidth : 0;

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="min-h-screen bg-brand-ivory font-sans">
      {/* ── Desktop sidebar ── */}
      {isDesktop && (
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      )}

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {/* ── Mobile sidebar ── */}
      {!isDesktop && (
        <div
          className="fixed top-0 left-0 z-50"
          style={{
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Sidebar collapsed={false} onToggle={closeMobile} />
        </div>
      )}

      {/* ── Main content area ── */}
      <div
        className="flex flex-col min-h-screen"
        style={{
          marginLeft: contentMargin,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Fixed desktop TopBar */}
        {isDesktop && (
          <div
            className="fixed top-0 right-0 z-30"
            style={{
              left: sidebarWidth,
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <TopBar
              title={pageTitle}
              onMenuClick={toggleMobile}
              showMenu={false}
            />
          </div>
        )}

        {/* Sticky mobile TopBar */}
        {!isDesktop && (
          <div className="sticky top-0 z-30">
            <TopBar
              title={pageTitle}
              onMenuClick={toggleMobile}
              showMenu={true}
            />
          </div>
        )}

        {/* Desktop spacer for fixed TopBar */}
        {isDesktop && <div className="h-16 shrink-0" />}

        {/* ── Scrollable page content ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
