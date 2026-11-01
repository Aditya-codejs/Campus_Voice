import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  AlertTriangle,
  Building,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const LandingPage = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      navigate(`/track/${trackingCode.trim().toUpperCase()}`);
    }
  };

  const categories = [
    { name: 'Hostel & Mess', icon: Building, desc: 'Water supply, electricity, hygiene, room facilities' },
    { name: 'Academic & Teaching', icon: FileText, desc: 'Grading issues, attendance errors, syllabus timetable' },
    { name: 'Campus Wi-Fi & IT', icon: Sparkles, desc: 'Lab equipment, Wi-Fi connectivity, student portal' },
    { name: 'Examination & Records', icon: CheckCircle, desc: 'Hall tickets, result corrections, verification' },
    { name: 'Safety & Anti-Ragging', icon: AlertTriangle, desc: 'Confidential reporting with direct committee escalation' },
    { name: 'Library & Learning', icon: Users, desc: 'Book availability, timings, study spaces' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-brand-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              University Grievance Redressal Mechanism &bull; 2026 Academic Session
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Transparent Grievance Resolution for Every Student.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              CampusVoice gives students a direct, accountable channel to voice academic, hostel, and campus concerns. Track real-time progress from submission to resolution.
            </p>

            {/* Quick Track Input Bar */}
            <form
              onSubmit={handleTrackSubmit}
              className="mt-8 max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-2"
            >
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Enter Tracking ID (e.g. SCT-2026-000001)..."
                className="flex-1 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-brand-500/20 whitespace-nowrap"
              >
                Track Now
              </button>
            </form>

            {/* Quick Action CTA Links */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register-student"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all"
              >
                <span>Submit Grievance as Student</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-200 transition-all shadow-xs"
              >
                <span>Staff & Admin Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Performance Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-brand-600">24-48h</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority SLA Turnaround</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-emerald-600">100%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidential Anonymity</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-indigo-600">10+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus Departments</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-slate-800">4.8 / 5</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Satisfaction</p>
          </div>
        </div>
      </section>

      {/* 4-Step Resolution Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">End-to-End Workflow</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Your Grievance Gets Resolved</h2>
          <p className="text-sm text-slate-600">
            Every complaint passes through an institutional lifecycle with strict accountability deadlines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Lodge Complaint',
              desc: 'Select department, specify incident details, attach proofs, and toggle 100% anonymous mode if needed.',
              icon: FileText,
            },
            {
              step: '02',
              title: 'Smart SLA Routing',
              desc: 'Instantly assigned to the relevant department warden, engineer, or HOD with a countdown SLA timer.',
              icon: Clock,
            },
            {
              step: '03',
              title: 'Investigation & Action',
              desc: 'Officers investigate on-site, upload resolution photos, and update you via two-way comments.',
              icon: Users,
            },
            {
              step: '04',
              title: 'Verification & Closure',
              desc: 'Review the fix, rate the response (1-5 stars), or reopen within 7 days if the issue persists.',
              icon: CheckCircle,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative group hover:border-brand-500 transition-all card-hover"
              >
                <div className="text-4xl font-extrabold text-slate-100 group-hover:text-brand-100 transition-colors">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center my-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Departments & Grievance Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Campus Coverage</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Redressal Across All Sectors</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all card-hover"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sensitive Anonymity Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5" /> Confidential Protection Protocol
            </div>
            <h3 className="text-2xl font-bold">Harassment & Ragging Grievances</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Reports filed under the Anti-Ragging and Harassment category are protected by cryptographic role isolation. Your identity is concealed from departmental staff and escalated exclusively to the designated Anti-Ragging Committee.
            </p>
          </div>
          <Link
            to="/register-student"
            className="shrink-0 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md"
          >
            Report Anonymously
          </Link>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about lodging and tracking grievances.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Can I lodge a complaint without revealing my identity?',
              a: 'Yes. Simply check "Submit Anonymously" when filing your complaint. Your student name, roll number, and contact details will be completely hidden from departmental staff investigating the case.',
            },
            {
              q: 'What is the standard resolution timeframe (SLA)?',
              a: 'Critical safety issues are addressed within 24 hours. High-priority exam issues within 3 days. Infrastructure and library issues within 7 days. If a complaint exceeds its SLA, it is automatically flagged and escalated to senior administrators.',
            },
            {
              q: 'What happens if I am not satisfied with the resolution?',
              a: 'Once an officer marks an issue as Resolved, you have 7 calendar days to inspect the fix. If unsatisfied, you can click "Reopen Complaint" with an explanation note, which immediately moves the issue back into In Progress.',
            },
            {
              q: 'Can I track a complaint without logging in?',
              a: 'Yes. Use the "Track Grievance" search bar at the top with your unique tracking code (e.g. SCT-2026-000001) to view the real-time status and timeline without logging into an account.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center justify-between">
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

