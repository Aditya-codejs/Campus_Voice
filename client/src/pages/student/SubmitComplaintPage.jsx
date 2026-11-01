import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  Upload,
  X,
  FileText,
  Building,
  Tag,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const SubmitComplaintPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    department_id: '',
    priority: 'medium',
    location: '',
    incident_date: new Date().toISOString().split('T')[0],
    description: '',
    is_anonymous: false,
  });

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          api.get('/categories'),
          api.get('/departments'),
        ]);

        if (catRes.data.success) setCategories(catRes.data.data.categories);
        if (deptRes.data.success) setDepartments(deptRes.data.data.departments);

        // Defaults
        if (catRes.data.data.categories.length > 0) {
          const firstCat = catRes.data.data.categories[0];
          setFormData((prev) => ({
            ...prev,
            category_id: firstCat._id,
            department_id: firstCat.default_department?._id || deptRes.data.data.departments[0]?._id || '',
            priority: firstCat.default_priority || 'medium',
          }));
        }
      } catch (err) {
        console.error('Failed to load form metadata', err);
      }
    };

    fetchMetadata();
  }, []);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find((c) => c._id === catId);
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
      department_id: cat?.default_department?._id || prev.department_id,
      priority: cat?.is_sensitive ? 'critical' : cat?.default_priority || 'medium',
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      toast.warning('Maximum 5 files allowed.');
      return;
    }

    // Validate size and extensions
    const valid = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5 MB limit.`);
        continue;
      }
      valid.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title || !formData.description || !formData.category_id || !formData.department_id) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category_id', formData.category_id);
      data.append('department_id', formData.department_id);
      data.append('priority', formData.priority);
      data.append('location', formData.location);
      data.append('incident_date', formData.incident_date);
      data.append('description', formData.description);
      data.append('is_anonymous', formData.is_anonymous);

      selectedFiles.forEach((file) => {
        data.append('attachments', file);
      });

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSuccessData(res.data.data.complaint);
        toast.success('Grievance logged successfully.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  // Success Dialog
  if (successData) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Grievance Successfully Lodged</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your issue has been allocated into the university queue and an email notification has been dispatched.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tracking Code:</span>
              <strong className="font-mono text-sm text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                {successData.complaint_code}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Initial Status:</span>
              <span className="capitalize font-semibold text-slate-800">{successData.status}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Target Resolution SLA:</span>
              <span className="font-semibold text-slate-800">{new Date(successData.due_date).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/student/complaints/${successData.id}`}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-500/20 text-center"
            >
              View Full Timeline & Details
            </Link>
            <Link
              to="/student/dashboard"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategoryDoc = categories.find((c) => c._id === formData.category_id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Submit New Grievance</h1>
          <p className="text-xs text-slate-500">Fill in the incident details to initiate an investigation.</p>
        </div>
        <Link
          to="/student/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Cancel
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {selectedCategoryDoc?.is_sensitive && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Sensitive Category Selected (Harassment / Ragging)</strong>
            <p className="text-[11px] text-amber-800 mt-0.5">
              This grievance will be treated with confidential high-priority handling and routed exclusively to the Anti-Ragging Committee.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Grievance Subject / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={150}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Water shortage on 3rd floor of Hostel B"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
        </div>

        {/* Category & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category_id}
              onChange={handleCategoryChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.is_sensitive ? '⚠️ (Sensitive)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department Assigned <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Incident Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs capitalize"
            >
              <option value="low">Low (14 Days Target SLA)</option>
              <option value="medium">Medium (7 Days Target SLA)</option>
              <option value="high">High (3 Days Target SLA)</option>
              <option value="critical">Critical (24 Hours Target SLA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date of Incident</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="date"
                value={formData.incident_date}
                onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Specific Location / Venue</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Block C, Room 204 or Main Library Reading Hall"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            maxLength={3000}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the problem, who was affected, and any previous attempts to resolve it..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs leading-relaxed"
          />
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Supporting Attachments (Max 5 files, 5 MB each &bull; JPG, PNG, PDF)
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <label className="cursor-pointer">
              <span className="text-xs font-bold text-brand-600 hover:text-brand-800">Click to browse files</span>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-1">Upload screenshots, photos, notices, or scanned receipts</p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedFiles.map((f, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[150px]">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anonymous Mode Checkbox */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.is_anonymous}
            onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
            className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="anonymous" className="cursor-pointer">
            <span className="block text-xs font-bold text-slate-800">Submit Anonymously</span>
            <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              When checked, your name, enrollment number, and identity are hidden from investigating staff officers and only accessible to authorized senior administrators for abuse verification.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Submit Grievance</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

