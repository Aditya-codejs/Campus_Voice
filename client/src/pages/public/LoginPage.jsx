import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin' || result.user.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setErrorMsg(result.error);
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Brand Visual */}
        <div className="bg-gradient-to-br from-brand-900 via-brand-950 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <GraduationCap className="w-7 h-7 text-brand-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">CampusVoice Portal</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sign in to manage and monitor your campus grievances, track resolution milestones, and communicate with institutional officers.
            </p>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-8 pt-6 border-t border-white/10 space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
                Local-only Demo Login
              </p>
              <div className="flex flex-col space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('student.demo@example.com', 'LocalDemo-Student-2026!')}
                  className="text-left text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/10 transition-colors flex items-center justify-between"
                >
                  <span>Student: <strong className="font-semibold text-brand-200">student.demo@example.com</strong></span>
                  <span className="text-[10px] text-brand-300">Fill</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('staff.demo@example.com', 'LocalDemo-Staff-2026!')}
                  className="text-left text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/10 transition-colors flex items-center justify-between"
                >
                  <span>Staff: <strong className="font-semibold text-brand-200">staff.demo@example.com</strong></span>
                  <span className="text-[10px] text-brand-300">Fill</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin.demo@example.com', 'LocalOnly-Admin-Demo-2026!')}
                  className="text-left text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/10 transition-colors flex items-center justify-between"
                >
                  <span>Administrator: <strong className="font-semibold text-brand-200">admin.demo@example.com</strong></span>
                  <span className="text-[10px] text-brand-300">Fill</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6 space-y-1">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h3>
            <p className="text-xs text-slate-500">Enter your official credentials to access your dashboard.</p>
          </div>

          {isExpired && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Your previous session has expired. Please log in again.</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rollnumber@college.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col space-y-2 text-center">
            <p className="text-xs text-slate-500">
              New student?{' '}
              <Link to="/register-student" className="font-bold text-brand-600 hover:text-brand-800">
                Register as Student
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Faculty / Department staff?{' '}
              <Link to="/register-staff" className="font-bold text-slate-700 hover:text-slate-900">
                Register Staff Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
