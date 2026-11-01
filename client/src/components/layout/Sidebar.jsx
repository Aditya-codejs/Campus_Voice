import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  UserCheck,
  Users,
  Building2,
  FolderTree,
  ShieldAlert,
  Settings,
  HelpCircle,
  CheckSquare,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/student/complaints/new', icon: PlusCircle, label: 'Submit Grievance' },
    { to: '/student/complaints', icon: FileText, label: 'My Grievances' },
    { to: '/student/profile', icon: Settings, label: 'Profile & Security' },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Department Overview' },
    { to: '/staff/complaints', icon: CheckSquare, label: 'Department Queue' },
    { to: '/staff/profile', icon: Settings, label: 'Profile & Security' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics Hub' },
    { to: '/admin/complaints', icon: FileText, label: 'All Grievances' },
    { to: '/admin/staff-approvals', icon: UserCheck, label: 'Staff Approvals' },
    { to: '/admin/users', icon: Users, label: 'User Directory' },
    { to: '/admin/departments-categories', icon: Building2, label: 'Depts & Categories' },
    { to: '/admin/audit-logs', icon: ShieldAlert, label: 'System Audit Logs' },
    { to: '/admin/profile', icon: Settings, label: 'Admin Settings' },
  ];

  let links = studentLinks;
  if (role === 'staff') links = staffLinks;
  if (role === 'admin' || role === 'superadmin') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        {/* Role Identity Tag */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portal Workspace</p>
            <p className="text-xs font-bold text-slate-800 capitalize">
              {role === 'staff' ? `${user.department_name || 'Staff'} Cell` : `${role} Workspace`}
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-xs border border-brand-100/60 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Support Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-2 text-slate-500 text-xs">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Need help? Contact Cell</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 pl-6">ext: 2024 / grievance@college.edu</p>
      </div>
    </aside>
  );
};

