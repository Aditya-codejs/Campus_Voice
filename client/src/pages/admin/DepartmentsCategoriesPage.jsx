import React, { useState, useEffect } from 'react';
import {
  Building2,
  FolderTree,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Hash,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const DepartmentsCategoriesPage = () => {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Dept Form
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', email: '', description: '' });

  // New Category Form
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    default_department: '',
    default_priority: 'medium',
    is_sensitive: false,
  });

  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, catRes] = await Promise.all([
        api.get('/departments'),
        api.get('/categories'),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data.departments);
      if (catRes.data.success) {
        setCategories(catRes.data.data.categories);
        if (deptRes.data.data.departments.length > 0) {
          setCatForm((prev) => ({
            ...prev,
            default_department: deptRes.data.data.departments[0]._id,
          }));
        }
      }
    } catch (err) {
      toast.error('Failed to load institutional classifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!deptForm.name) return;

    try {
      setSaving(true);
      const res = await api.post('/departments', deptForm);
      if (res.data.success) {
        toast.success(`Department ${deptForm.name} created.`);
        setDeptModalOpen(false);
        setDeptForm({ name: '', code: '', email: '', description: '' });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create department');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCat = async (e) => {
    e.preventDefault();
    if (!catForm.name) return;

    try {
      setSaving(true);
      const res = await api.post('/categories', catForm);
      if (res.data.success) {
        toast.success(`Category ${catForm.name} created.`);
        setCatModalOpen(false);
        setCatForm({
          name: '',
          description: '',
          default_department: departments[0]?._id || '',
          default_priority: 'medium',
          is_sensitive: false,
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Departments & Categories Management
        </h1>
        <p className="text-xs text-slate-500">
          Configure campus administrative units, grievance classifications, default routing, and sensitivity protocols.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Departments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Campus Departments ({departments.length})</h2>
            </div>
            <button
              onClick={() => setDeptModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {departments.map((dept) => (
              <div key={dept._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                    {dept.code && (
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {dept.code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{dept.description || 'Administrative division'}</p>
                  {dept.email && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {dept.email}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FolderTree className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Grievance Categories ({categories.length})</h2>
            </div>
            <button
              onClick={() => setCatModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {categories.map((cat) => (
              <div key={cat._id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                    {cat.is_sensitive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Sensitive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{cat.description || 'Category'}</p>
                  <p className="text-[11px] text-slate-500">
                    Default: <strong>{cat.default_department?.name || 'General'}</strong> &bull; Priority: <span className="capitalize font-semibold">{cat.default_priority}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Create Department */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Department</h3>

            <form onSubmit={handleCreateDept} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Sports & Gymnasium Cell"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SPORTS"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={deptForm.email}
                    onChange={(e) => setDeptForm({ ...deptForm, email: e.target.value })}
                    placeholder="dept@college.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Overview of jurisdiction and responsibilities..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
                >
                  {saving ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Category */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Grievance Category</h3>

            <form onSubmit={handleCreateCat} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Sports Equipment Shortage"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Department</label>
                <select
                  value={catForm.default_department}
                  onChange={(e) => setCatForm({ ...catForm, default_department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Priority SLA</label>
                <select
                  value={catForm.default_priority}
                  onChange={(e) => setCatForm({ ...catForm, default_priority: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs capitalize"
                >
                  <option value="low">Low (14 Days)</option>
                  <option value="medium">Medium (7 Days)</option>
                  <option value="high">High (3 Days)</option>
                  <option value="critical">Critical (24 Hours)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="cat_sensitive"
                  checked={catForm.is_sensitive}
                  onChange={(e) => setCatForm({ ...catForm, is_sensitive: e.target.checked })}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="cat_sensitive" className="cursor-pointer text-xs">
                  <strong className="block text-amber-900 font-bold">Mark as Sensitive Category</strong>
                  <span className="text-[11px] text-amber-800 block mt-0.5">
                    Sensitive categories (e.g. Harassment, Ragging) bypass normal staff and enforce high/critical SLA priority.
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Summary of issues covered..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  {saving ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

