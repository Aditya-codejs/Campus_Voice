import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterStudentPage } from './pages/public/RegisterStudentPage';
import { RegisterStaffPage } from './pages/public/RegisterStaffPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { TrackComplaintPage } from './pages/public/TrackComplaintPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaintPage } from './pages/student/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/student/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/student/ComplaintDetailPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffComplaintsPage } from './pages/staff/StaffComplaintsPage';
import { StaffComplaintDetail } from './pages/staff/StaffComplaintDetail';
import { StaffProfilePage } from './pages/staff/StaffProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { StaffApprovalsPage } from './pages/admin/StaffApprovalsPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { DepartmentsCategoriesPage } from './pages/admin/DepartmentsCategoriesPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

export const App = () => {
  return (
    <Routes>
      {/* Public Pages with Standard Header */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <LandingPage />
            </main>
          </div>
        }
      />
      <Route
        path="/login"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <LoginPage />
            </main>
          </div>
        }
      />
      <Route
        path="/register-student"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <RegisterStudentPage />
            </main>
          </div>
        }
      />
      <Route
        path="/register-staff"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <RegisterStaffPage />
            </main>
          </div>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <ForgotPasswordPage />
            </main>
          </div>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <ResetPasswordPage />
            </main>
          </div>
        }
      />
      <Route
        path="/track"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <TrackComplaintPage />
            </main>
          </div>
        }
      />
      <Route
        path="/track/:code"
        element={
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <TrackComplaintPage />
            </main>
          </div>
        }
      />

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/complaints/new" element={<SubmitComplaintPage />} />
          <Route path="/student/complaints" element={<MyComplaintsPage />} />
          <Route path="/student/complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>
      </Route>

      {/* Protected Staff Routes */}
      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/complaints" element={<StaffComplaintsPage />} />
          <Route path="/staff/complaints/:id" element={<StaffComplaintDetail />} />
          <Route path="/staff/profile" element={<StaffProfilePage />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
          <Route path="/admin/staff-approvals" element={<StaffApprovalsPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/departments-categories" element={<DepartmentsCategoriesPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

