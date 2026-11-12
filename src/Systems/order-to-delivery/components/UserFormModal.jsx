import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  User, 
  Check, 
  Sparkles, 
  Lock, 
  Layers, 
  Phone, 
  Mail,
  Key,
  CheckSquare,
  Square,
  ShieldCheck,
  Eye,
  Sliders,
  ChevronDown,
  Scissors,
  PackageCheck
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { ALL_PAGE_IDS, ALL_CHECKLIST_PAGE_IDS, isApexAdmin } from '../utils/userStorage';

// One selectable permission card: click anywhere on it to allow / revoke
const PermissionRow = ({ label, checked, onToggle, index }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onToggle}
    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
      checked
        ? 'bg-[#FAF5EE] border-[#C5A059] text-stone-900 shadow-2xs ring-1 ring-[#C5A059]/30'
        : 'bg-white border-[#E8DFD3] text-stone-500 hover:bg-[#FAF8F5] hover:border-stone-400'
    }`}
  >
    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
      checked ? 'bg-[#5B172E] text-white border-[#5B172E]' : 'bg-white border-stone-300'
    }`}>
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </div>
    {index !== undefined && (
      <span className="w-5 h-5 rounded-full bg-[#EAE2D5] text-stone-700 font-bold text-[10px] flex items-center justify-center shrink-0">
        {index}
      </span>
    )}
    <span className="truncate text-xs font-semibold text-stone-700">{label}</span>
  </button>
);

// Collapsible card: header shows "x / y selected"; body lists the selectable permission cards
const PermissionSection = ({
  icon, title, subtitle, enabledCount, totalCount, isAdmin, adminNote, onSelectAll, onDeselectAll, children
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        className="w-full flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-[#FCFAF7] transition-colors select-none"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
            {icon}
            <span className="truncate">{title}</span>
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8]">
            {isAdmin ? 'All' : `${enabledCount} / ${totalCount}`}
          </span>
          <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-[#F0E6D8] space-y-3">
          {isAdmin ? (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-[#FAF5EE] border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#9B783E] shrink-0" />
              <span>{adminNote}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-end gap-2 text-[11px]">
                <button type="button" onClick={onSelectAll} className="text-[#5B172E] font-bold hover:underline">
                  Select All
                </button>
                <span className="text-stone-300">•</span>
                <button type="button" onClick={onDeselectAll} className="text-stone-500 font-medium hover:underline">
                  Deselect All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{children}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const UserFormModal = ({
  isOpen,
  onClose,
  onSubmitUser,
  editingUser = null,
  nextUserId
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('user123');
  const [role, setRole] = useState('User'); // Strictly 'Admin' or 'User'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState('Active');
  const [allowedPages, setAllowedPages] = useState(['dashboard', 'orders', 'stages']);
  const [allowedStages, setAllowedStages] = useState(STAGES.map(s => s.id));
  const allChecklistIds = ALL_CHECKLIST_PAGE_IDS.map(p => p.id);
  const [allowedChecklistPages, setAllowedChecklistPages] = useState(allChecklistIds);
  const [avatarColor, setAvatarColor] = useState('bg-[#5B172E]');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || '');
      setUsername(editingUser.username || '');
      setPassword(editingUser.password || 'user123');
      setRole(editingUser.role === 'Admin' ? 'Admin' : 'User');
      setEmail(editingUser.email || '');
      setPhone(editingUser.phone || '');
      setDesignation(editingUser.designation || '');
      setStatus(editingUser.status || 'Active');
      setAllowedPages(editingUser.allowedPages || ['dashboard', 'orders', 'stages']);
      setAllowedStages(editingUser.allowedStages || STAGES.map(s => s.id));
      setAllowedChecklistPages(editingUser.allowedChecklistPages || allChecklistIds);
      setAvatarColor(editingUser.avatarColor || 'bg-[#5B172E]');
    } else {
      setAllowedChecklistPages(allChecklistIds);
      setName('');
      setUsername('');
      setPassword('user123');
      setRole('User');
      setEmail('');
      setPhone('');
      setDesignation('');
      setStatus('Active');
      setAllowedPages(['dashboard', 'orders', 'stages']);
      setAllowedStages(STAGES.map(s => s.id));
      setAvatarColor('bg-blue-700');
    }
    setErrors({});
  }, [editingUser, isOpen]);

  const isAdmin = isApexAdmin({ role, username }) || role === 'Admin';

  const togglePage = (pageId) => {
    if (isAdmin) return; // Admin has all pages
    setAllowedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const toggleStage = (stageId) => {
    if (isAdmin) return; // Admin has all stages
    setAllowedStages((prev) =>
      prev.includes(stageId)
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  const toggleChecklistPage = (href) => {
    if (isAdmin) return;
    setAllowedChecklistPages((prev) =>
      prev.includes(href) ? prev.filter((id) => id !== href) : [...prev, href]
    );
  };

  const handleSelectAllStages = () => {
    setAllowedStages(STAGES.map(s => s.id));
  };

  const handleDeselectAllStages = () => {
    setAllowedStages([]);
  };

  const handleSelectAllPages = () => {
    setAllowedPages(ALL_PAGE_IDS.map(p => p.id));
  };

  const handleDeselectAllPages = () => {
    setAllowedPages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!username.trim()) errs.username = 'Username is required';
    if (!password) errs.password = 'Password is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const userData = {
      id: editingUser ? editingUser.id : nextUserId,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password,
      role, // Strictly 'Admin' or 'User'
      isAdmin,
      email: email.trim(),
      phone: phone.trim(),
      designation: designation.trim(),
      status,
      allowedPages: isAdmin ? ALL_PAGE_IDS.map(p => p.id) : allowedPages,
      allowedStages: isAdmin ? STAGES.map(s => s.id) : allowedStages,
      allowedChecklistPages: isAdmin ? allChecklistIds : allowedChecklistPages,
      avatarColor: isAdmin ? 'bg-[#5B172E]' : avatarColor
    };

    setSubmitting(true);
    try {
      const ok = await onSubmitUser(userData);
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-white via-[#FAF7F2] to-white border-b border-[#E8DFD3] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5B172E] to-[#781F3E] text-white flex items-center justify-center font-serif font-bold text-base shadow-sm ring-2 ring-[#C5A059]/30">
              <Shield className="w-5 h-5 text-[#E6C687]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#431021] tracking-tight">
                  {editingUser ? 'Update Staff & Permissions' : 'Add New Staff & Page Access'}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8] shadow-2xs">
                  {editingUser ? editingUser.id : nextUserId}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Configure user credentials, system role, and granular section permissions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
          
          {/* Section 1: Staff Credentials & Role */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3">
              <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
                <User className="w-4 h-4 text-[#9B783E]" />
                <span>Staff Credentials & Role</span>
              </h3>
              <span className="text-[11px] font-medium text-stone-400">Step 1 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  placeholder="Full name"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 transition-all ${
                    errors.name ? 'border-rose-400 bg-rose-50' : 'border-[#DECDB8] hover:border-stone-400'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Login Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: null });
                  }}
                  placeholder="e.g. priya"
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 font-mono transition-all ${
                    errors.username ? 'border-rose-400 bg-rose-50' : 'border-[#DECDB8] hover:border-stone-400'
                  }`}
                />
                {errors.username && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.username}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="user123"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-[#FAF8F5] border border-[#DECDB8] hover:border-stone-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 transition-all"
                />
              </div>

              {/* Role: STRICTLY "Admin" OR "User" */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  System Role (Admin / User)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-[#5B172E] cursor-pointer transition-all"
                >
                  <option value="Admin">Admin (Full Apex Access)</option>
                  <option value="User">User (Granular Access)</option>
                </select>
              </div>

              {/* Designation */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Production Manager"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DECDB8] hover:border-stone-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 transition-all"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DECDB8] hover:border-stone-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DECDB8] hover:border-stone-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Settings (Master Hub) access: off unless explicitly granted. Admins always have it. */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-3">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#9B783E]" />
                <span>Settings / Master Hub Access</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Users, vendors, customers, departments, TAT and checklist settings. Hidden from anyone not granted access.
              </p>
            </div>
            {isAdmin ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Admins always have Settings access.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <PermissionRow
                  label="Allow access to Settings"
                  checked={allowedPages.includes('settings')}
                  onToggle={() => togglePage('settings')}
                />
              </div>
            )}
          </div>

          {/* Section 2: CHECKLIST & DELEGATION SUB-PAGE PERMISSIONS (collapsible, toggles) */}
          <PermissionSection
            icon={<CheckSquare className="w-4 h-4 text-[#9B783E]" />}
            title="Checklist & Delegation Pages"
            subtitle="Control access across all Checklist, Tasks, Calendar, and Delegation submodules."
            enabledCount={allowedChecklistPages.length}
            totalCount={ALL_CHECKLIST_PAGE_IDS.length}
            isAdmin={isAdmin}
            adminNote="All Checklist Pages: Admins automatically access every Checklist & Delegation page unconditionally."
            onSelectAll={() => setAllowedChecklistPages(allChecklistIds)}
            onDeselectAll={() => setAllowedChecklistPages([])}
          >
            {ALL_CHECKLIST_PAGE_IDS.map((p) => (
              <PermissionRow
                key={p.id}
                label={p.label}
                checked={allowedChecklistPages.includes(p.id)}
                onToggle={() => toggleChecklistPage(p.id)}
              />
            ))}
          </PermissionSection>

          {/* Section 3: PRODUCTION STAGES ACCESS (collapsible, toggles) */}
          <PermissionSection
            icon={<Layers className="w-4 h-4 text-[#9B783E]" />}
            title={`Production Stages Access (${STAGES.length} Stages)`}
            subtitle="Control which atelier pipeline stages this staff member can view and update."
            enabledCount={allowedStages.length}
            totalCount={STAGES.length}
            isAdmin={isAdmin}
            adminNote={`All ${STAGES.length} Stages Permitted: Admins can view and operate every stage of the production pipeline.`}
            onSelectAll={handleSelectAllStages}
            onDeselectAll={handleDeselectAllStages}
          >
            {STAGES.map((stage, idx) => (
              <PermissionRow
                key={stage.id}
                index={idx + 1}
                label={stage.name}
                checked={allowedStages.includes(stage.id)}
                onToggle={() => toggleStage(stage.id)}
              />
            ))}
          </PermissionSection>

          {/* Section 4: Data Privacy Rule info */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF2E6] to-[#FAF8F5] border border-[#DECDB8] text-xs text-stone-700 space-y-1.5 shadow-2xs">
            <div className="font-bold text-[#5B172E] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#9B783E]" />
              <span>Data Privacy & Isolation Rule:</span>
            </div>
            <p className="leading-relaxed">
              {role === 'Admin'
                ? '• As an Admin, this user will possess apex authority with full visibility across all orders, checklists, tasks, and system master data.'
                : '• As a User, this staff member will ONLY see and manage orders created by them. Their entries will remain private from other users.'}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving…' : editingUser ? 'Save Changes' : 'Create Staff Member'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
