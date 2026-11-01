import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close dashboard navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed left-0 right-0 top-16 bottom-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}
      <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="mb-4 flex justify-end lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-expanded={sidebarOpen}
              aria-label="Open dashboard navigation"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <Menu className="h-4 w-4" />
              Dashboard Menu
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
