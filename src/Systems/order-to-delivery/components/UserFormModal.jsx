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
  Scissors,
  PackageCheck
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { ALL_PAGE_IDS } from '../data/initialUsers';

export const UserFormModal = ({
  isOpen,
  onClose,
  onSubmitUser,
  editingUser = null,
  nextUserId
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('user123');
  const [role, setRole] = useState('User'); // Strictly 'Admin' or 'User'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');
  const [allowedPages, setAllowedPages] = useState(['dashboard', 'orders', 'stages']);
  const [allowedStages, setAllowedStages] = useState(STAGES.map(s => s.id));
  const [avatarColor, setAvatarColor] = useState('bg-[#5B172E]');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || '');
      setUsername(editingUser.username || '');
      setPassword(editingUser.password || 'user123');
      setRole(editingUser.role === 'Admin' ? 'Admin' : 'User');
      setEmail(editingUser.email || '');
      setPhone(editingUser.phone || '');
      setStatus(editingUser.status || 'Active');
      setAllowedPages(editingUser.allowedPages || ['dashboard', 'orders', 'stages']);
      setAllowedStages(editingUser.allowedStages || STAGES.map(s => s.id));
      setAvatarColor(editingUser.avatarColor || 'bg-[#5B172E]');
    } else {
      setName('');
      setUsername('');
      setPassword('user123');
      setRole('User');
      setEmail('');
      setPhone('');
      setStatus('Active');
      setAllowedPages(['dashboard', 'orders', 'stages']);
      setAllowedStages(STAGES.map(s => s.id));
      setAvatarColor('bg-blue-700');
    }
    setErrors({});
  }, [editingUser, isOpen]);

  const isAdmin = role === 'Admin';

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

  const handleSubmit = (e) => {
    e.preventDefault();
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
      status,
      allowedPages: isAdmin ? ALL_PAGE_IDS.map(p => p.id) : allowedPages,
      allowedStages: isAdmin ? STAGES.map(s => s.id) : allowedStages,
      avatarColor: isAdmin ? 'bg-[#5B172E]' : avatarColor
    };

    onSubmitUser(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
              <Shield className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#431021]">
                  {editingUser ? 'Update Staff & Page Access' : 'Add New Staff & Page Access'}
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#F2ECE1] text-[#9B783E]">
                  {editingUser ? editingUser.id : nextUserId}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Configure user credentials and granular page/stage permissions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
          
          {/* Section 1: Staff Credentials & Role */}
          <div className="bg-white p-5 rounded-xl border border-[#E8DFD3] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#431021] border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#9B783E]" />
              <span>Staff Credentials & Role</span>
            </h3>

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
                  placeholder="e.g. Priya Sharma"
                  className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                    errors.name ? 'border-rose-400 bg-rose-50' : 'border-[#DECDB8]'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
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
                  className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                    errors.username ? 'border-rose-400 bg-rose-50' : 'border-[#DECDB8]'
                  }`}
                />
                {errors.username && <p className="text-[11px] text-rose-500 mt-1">{errors.username}</p>}
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
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
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
                  className="w-full px-3 py-2 text-sm font-bold bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-[#5B172E]"
                >
                  <option value="User">User (Sees ONLY own created orders)</option>
                  <option value="Admin">Admin (Full Atelier & All Orders Access)</option>
                </select>
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
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
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
                  placeholder="staff@sainygargcouture.com"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                />
              </div>
            </div>
          </div>

          {/* Section 2: PAGE ACCESS PERMISSIONS (AS REQUESTED) */}
          <div className="bg-white p-5 rounded-xl border border-[#E8DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#9B783E]" />
                <span>Page Access Permissions</span>
              </h3>
              
              {!isAdmin && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAllPages}
                    className="text-[#5B172E] font-semibold hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllPages}
                    className="text-stone-500 font-semibold hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            {isAdmin ? (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Full Page Access:</strong> As an Admin, this account automatically has access to all pages (Dashboard, Orders, Stages, and Master Hub).
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALL_PAGE_IDS.map((p) => {
                  const isChecked = allowedPages.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePage(p.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'bg-[#FAF5EE] border-[#C5A059] text-stone-900 shadow-2xs'
                          : 'bg-white border-[#E8DFD3] text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked 
                          ? 'bg-[#5B172E] text-white border-[#5B172E]' 
                          : 'bg-white border-stone-300'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs capitalize text-stone-800">
                          {p.id === 'stages' ? 'Production Stages' : p.id === 'settings' ? 'Master Hub' : p.id}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate">
                          {p.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: PRODUCTION STAGES ACCESS (10 WORKFLOW STAGES) */}
          <div className="bg-white p-5 rounded-xl border border-[#E8DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9B783E]" />
                <span>Production Stages Access (10 Stages)</span>
              </h3>
              
              {!isAdmin && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAllStages}
                    className="text-[#5B172E] font-semibold hover:underline"
                  >
                    Select All Stages
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllStages}
                    className="text-stone-500 font-semibold hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            {isAdmin ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#9B783E] shrink-0" />
                <span>
                  <strong>All 10 Stages Permitted:</strong> Admins can view and operate all 10 stages of the production pipeline.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {STAGES.map((stage, idx) => {
                  const isChecked = allowedStages.includes(stage.id);
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => toggleStage(stage.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                        isChecked
                          ? 'bg-[#FAF5EE] border-[#C5A059] text-stone-900 shadow-2xs'
                          : 'bg-white border-[#E8DFD3] text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isChecked 
                          ? 'bg-[#5B172E] text-white border-[#5B172E]' 
                          : 'bg-white border-stone-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="w-4 h-4 rounded-full bg-[#EAE2D5] text-stone-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate text-xs font-medium">
                        {stage.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Data Privacy Rule info */}
          <div className="p-3.5 rounded-xl bg-[#FAF2E6] border border-[#DECDB8] text-xs text-stone-700 space-y-1">
            <div className="font-bold text-[#5B172E]">Data Privacy Rule:</div>
            <p>
              {role === 'Admin'
                ? '• As an Admin, this user will have full visibility across all orders and system master data.'
                : '• As a User, this staff member will ONLY see and manage orders created by them. Other users will not see their entries.'}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B172E] hover:bg-[#431021] shadow-xs hover:shadow transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingUser ? 'Save Changes' : 'Create Staff Member'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
