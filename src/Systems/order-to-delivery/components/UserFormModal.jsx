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
  PackageCheck,
  FileSpreadsheet
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { ALL_PAGE_IDS, ALL_CHECKLIST_PAGE_IDS, ALL_PURCHASE_PAGE_IDS, isApexAdmin } from '../utils/userAuthService';

// Order to Delivery sub pages (stage access is separate, per stage)
const OTD_PAGES = ALL_PAGE_IDS.filter((p) => p.id === 'dashboard' || p.id === 'orders' || p.id === 'design-sheet');

// One selectable permission row with 3-way segmented control: None | View | Modify
const SegmentedPermissionRow = ({ label, value = 'none', onChange, disabled = false }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 px-3 rounded-xl border border-[#E8DFD3] bg-white hover:bg-[#FAF8F5] transition-all">
      <span className="text-xs font-semibold text-stone-800 truncate select-text">{label}</span>
      <div className="inline-flex rounded-lg border border-[#DECDB8] bg-[#FAF8F5] p-0.5 shrink-0 self-start sm:self-auto">
        {[
          { key: 'none', label: 'None', activeClass: 'bg-stone-200 text-stone-800 font-bold shadow-2xs' },
          { key: 'view', label: 'View', activeClass: 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-2xs' },
          { key: 'modify', label: 'Modify', activeClass: 'bg-[#5B172E] text-white font-bold shadow-2xs' }
        ].map((opt) => {
          const isSelected = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.key)}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${
                isSelected
                  ? opt.activeClass
                  : 'text-stone-500 hover:text-stone-800 hover:bg-white/60'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Collapsible card: clean header with title and toggle arrow
const PermissionSection = ({
  icon, title, isAdmin, adminNote, onSetAllNone, onSetAllView, onSetAllModify, children
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        className="w-full flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-[#FCFAF7] transition-colors"
        aria-expanded={open}
      >
        <div className="min-w-0 select-text">
          <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
            {icon}
            <span className="truncate">{title}</span>
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
              <div className="flex items-center justify-end gap-2 text-[11px] font-medium">
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider mr-1">Quick Set:</span>
                <button type="button" onClick={onSetAllNone} className="text-stone-500 hover:text-stone-800 hover:underline">
                  All None
                </button>
                <span className="text-stone-300">•</span>
                <button type="button" onClick={onSetAllView} className="text-amber-800 font-semibold hover:underline">
                  All View
                </button>
                <span className="text-stone-300">•</span>
                <button type="button" onClick={onSetAllModify} className="text-[#5B172E] font-bold hover:underline">
                  All Modify
                </button>
              </div>
              <div className="space-y-2">
                {children}
              </div>
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
  nextUserId,
  readOnly = false
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('user123');
  const [role, setRole] = useState('User'); // Strictly 'Admin' or 'User'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [status, setStatus] = useState('Active');
  // Team Data Scope: Can user access and manage other employees' orders in OTD?
  const [canAccessAllOrders, setCanAccessAllOrders] = useState(false);
  // Granular 3-Tier Permissions Map: { [pageOrStageId]: 'none' | 'view' | 'modify' }
  const [permissions, setPermissions] = useState({});
  // New users start with NO access; an admin must grant each page explicitly
  const [allowedPages, setAllowedPages] = useState([]);
  const [allowedStages, setAllowedStages] = useState([]);
  const allChecklistIds = ALL_CHECKLIST_PAGE_IDS.map(p => p.id);
  const allPurchaseIds = ALL_PURCHASE_PAGE_IDS.map(p => p.id);
  const [allowedChecklistPages, setAllowedChecklistPages] = useState([]);
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
      setCanAccessAllOrders(Boolean(editingUser.canAccessAllOrders));
      
      // Strictly initialize permissions from user's permissions object
      const initialPerms = { ...(editingUser.permissions || {}) };
      setPermissions(initialPerms);

      setAllowedPages(editingUser.allowedPages || []);
      setAllowedStages(editingUser.allowedStages || []);
      setAllowedChecklistPages(editingUser.allowedChecklistPages || []);
      setAvatarColor(editingUser.avatarColor || 'bg-[#5B172E]');
    } else {
      setAllowedChecklistPages([]);
      setName('');
      setUsername('');
      setPassword('user123');
      setRole('User');
      setEmail('');
      setPhone('');
      setDesignation('');
      setStatus('Active');
      setCanAccessAllOrders(false);
      setPermissions({});
      setAllowedPages([]);
      setAllowedStages([]);
      setAvatarColor('bg-blue-700');
    }
    setErrors({});
  }, [editingUser, isOpen]);

  const isAdmin = isApexAdmin({ role, username }) || role === 'Admin';

  const handlePermissionChange = (key, val) => {
    if (isAdmin) return;
    setPermissions(prev => ({ ...prev, [key]: val }));

    // Keep legacy arrays in sync
    const isGranted = val === 'view' || val === 'modify';
    if (OTD_PAGES.some(p => p.id === key) || key === 'pc' || key === 'karigar-report' || key === 'settings') {
      setAllowedPages(prev => isGranted ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key));
    } else if (STAGES.some(s => s.id === key)) {
      setAllowedStages(prev => isGranted ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key));
    } else if (ALL_CHECKLIST_PAGE_IDS.some(c => c.id === key)) {
      setAllowedChecklistPages(prev => isGranted ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key));
    }
  };

  const setGroupPermissions = (keys, val) => {
    if (isAdmin) return;
    setPermissions(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = val; });
      return next;
    });

    const isGranted = val === 'view' || val === 'modify';
    keys.forEach(key => {
      if (OTD_PAGES.some(p => p.id === key) || key === 'pc' || key === 'karigar-report' || key === 'settings') {
        setAllowedPages(prev => isGranted ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key));
      } else if (STAGES.some(s => s.id === key)) {
        setAllowedStages(prev => isGranted ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key));
      } else if (ALL_CHECKLIST_PAGE_IDS.some(c => c.id === key)) {
        setAllowedChecklistPages(prev => isGranted ? Array.from(new Set([...prev, key])) : prev.filter(k => k !== key));
      }
    });
  };

  const getPermVal = (key) => {
    if (isAdmin) return 'modify';
    if (permissions[key]) return permissions[key];
    return 'none';
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

    // Build final permissions object
    const finalPermissions = { ...permissions };
    if (isAdmin) {
      ALL_PAGE_IDS.forEach(p => { finalPermissions[p.id] = 'modify'; });
      STAGES.forEach(s => { finalPermissions[s.id] = 'modify'; });
      ALL_CHECKLIST_PAGE_IDS.forEach(c => { finalPermissions[c.id] = 'modify'; });
      ALL_PURCHASE_PAGE_IDS.forEach(pr => { finalPermissions[pr.id] = 'modify'; });
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
      canAccessAllOrders: isAdmin ? true : canAccessAllOrders,
      permissions: finalPermissions,
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
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
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

          {/* Section 1: CHECKLIST PERMISSIONS (collapsible, 3-tier) */}
          <PermissionSection
            icon={<CheckSquare className="w-4 h-4 text-[#9B783E]" />}
            title="Checklist & Delegation"
            isAdmin={isAdmin}
            adminNote="Admins automatically access every Checklist page unconditionally."
            onSetAllNone={() => setGroupPermissions(allChecklistIds, 'none')}
            onSetAllView={() => setGroupPermissions(allChecklistIds, 'view')}
            onSetAllModify={() => setGroupPermissions(allChecklistIds, 'modify')}
          >
            {ALL_CHECKLIST_PAGE_IDS.map((p) => (
              <SegmentedPermissionRow
                key={p.id}
                label={p.label}
                value={getPermVal(p.id)}
                onChange={(val) => handlePermissionChange(p.id, val)}
              />
            ))}
          </PermissionSection>

          {/* Section 2B: PURCHASE SYSTEM PERMISSIONS (collapsible, 3-tier) */}
          <PermissionSection
            icon={<Layers className="w-4 h-4 text-[#9B783E]" />}
            title="Purchase System"
            isAdmin={isAdmin}
            adminNote="Admins automatically access every Purchase page unconditionally."
            onSetAllNone={() => setGroupPermissions(allPurchaseIds, 'none')}
            onSetAllView={() => setGroupPermissions(allPurchaseIds, 'view')}
            onSetAllModify={() => setGroupPermissions(allPurchaseIds, 'modify')}
          >
            {ALL_PURCHASE_PAGE_IDS.map((p) => (
              <SegmentedPermissionRow
                key={p.id}
                label={p.label}
                value={getPermVal(p.id)}
                onChange={(val) => handlePermissionChange(p.id, val)}
              />
            ))}
          </PermissionSection>

          {/* Section 2: ORDER TO DELIVERY PERMISSIONS (collapsible, 3-tier + Team Scope) */}
          <PermissionSection
            icon={<Layers className="w-4 h-4 text-[#9B783E]" />}
            title="Order to Delivery"
            isAdmin={isAdmin}
            adminNote="Full access: Admins can open the Dashboard, All Orders and every atelier stage."
            onSetAllNone={() => {
              const allOtdKeys = [...OTD_PAGES.map(p => p.id), ...STAGES.map(s => s.id)];
              setGroupPermissions(allOtdKeys, 'none');
            }}
            onSetAllView={() => {
              const allOtdKeys = [...OTD_PAGES.map(p => p.id), ...STAGES.map(s => s.id)];
              setGroupPermissions(allOtdKeys, 'view');
            }}
            onSetAllModify={() => {
              const allOtdKeys = [...OTD_PAGES.map(p => p.id), ...STAGES.map(s => s.id)];
              setGroupPermissions(allOtdKeys, 'modify');
            }}
          >
            {/* SPECIAL PRIVILEGE: TEAM DATA SCOPE FOR USER EMPLOYEES */}
            {!isAdmin && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FAF5EE] to-amber-50/50 border border-[#DECDB8] mb-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#9B783E] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Access All Team Orders</span>
                      <span className="text-[11px] text-stone-500 block">
                        Allow this employee to view and CRUD orders created by other team members
                      </span>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setCanAccessAllOrders(prev => !prev)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      canAccessAllOrders ? 'bg-[#5B172E]' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        canAccessAllOrders ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[10px] text-stone-600 font-medium">
                  {canAccessAllOrders ? (
                    <span className="text-emerald-800 font-bold">✓ Full Team Visibility Enabled: Can see and update all employees' orders.</span>
                  ) : (
                    <span className="text-stone-500">🔒 Personal Scope Only: Can strictly view and update only orders they created.</span>
                  )}
                </div>
              </div>
            )}

            <div className="text-[11px] uppercase font-bold text-stone-400 tracking-wider pt-1">Main Pages</div>
            {OTD_PAGES.map((p) => (
              <SegmentedPermissionRow
                key={p.id}
                label={p.label}
                value={getPermVal(p.id)}
                onChange={(val) => handlePermissionChange(p.id, val)}
              />
            ))}

            <div className="text-[11px] uppercase font-bold text-stone-400 tracking-wider pt-2">Production Stages</div>
            {STAGES.map((stage) => (
              <SegmentedPermissionRow
                key={stage.id}
                label={stage.name}
                value={getPermVal(stage.id)}
                onChange={(val) => handlePermissionChange(stage.id, val)}
              />
            ))}
          </PermissionSection>

          {/* Section 3: PC (Production Control) Access (Placed after Order to Delivery) */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#9B783E]" />
                <span>PC (Production Control)</span>
              </h3>
            </div>
            {isAdmin ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Admins always have PC (Production Control) access.
              </div>
            ) : (
              <SegmentedPermissionRow
                label="PC (Production Control)"
                value={getPermVal('pc')}
                onChange={(val) => handlePermissionChange('pc', val)}
              />
            )}
          </div>

          {/* Section 3.5: Karigar Report Access (Placed after PC) */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#9B783E]" />
                <span>Karigar Report</span>
              </h3>
            </div>
            {isAdmin ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Admins always have Karigar Report access.
              </div>
            ) : (
              <SegmentedPermissionRow
                label="Karigar Report (Worker Operation Log)"
                value={getPermVal('karigar-report')}
                onChange={(val) => handlePermissionChange('karigar-report', val)}
              />
            )}
          </div>

          {/* Section 4: Settings Access (Placed after Order to Delivery & PC) */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#9B783E]" />
                <span>Settings</span>
              </h3>
            </div>
            {isAdmin ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Admins always have Settings access.
              </div>
            ) : (
              <SegmentedPermissionRow
                label="Settings Management"
                value={getPermVal('settings')}
                onChange={(val) => handlePermissionChange('settings', val)}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? 'Saving…' : editingUser ? 'Save Changes' : 'Create Staff Member'}</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
