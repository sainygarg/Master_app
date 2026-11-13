import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Loader2, 
  Save, 
  ShieldCheck, 
  ListChecks, 
  User as UserIcon, 
  ChevronRight,
  Edit3,
  X,
  Mail,
  Phone,
  Briefcase,
  Shield,
  CheckCircle2,
  Lock
} from 'lucide-react';
import supabase from '../config/supabaseClient';
import { useUnifiedAuth } from '../auth/UnifiedAuthContext';
import { showGlobalToast } from '../context/ToastAlertContext';
import { STAGES } from '../../Systems/order-to-delivery/types/stages';
import {
  ALL_PAGE_IDS,
  ALL_CHECKLIST_PAGE_IDS,
  canUserAccessChecklistPage,
  isApexAdmin
} from '../../Systems/order-to-delivery/utils/userStorage';

const card = 'bg-white rounded-2xl border border-[#E8DFD3] shadow-xs p-5 sm:p-6 transition-all';
const label = 'block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 flex items-center gap-1.5';
const input =
  'w-full px-3.5 py-2.5 rounded-xl border border-[#DECDB8] bg-[#FAF8F5] text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 focus:border-[#5B172E] transition-all';
const btn =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-98';

// Shrink the photo before upload (phone photos are several MB)
const compressToBlob = (file, max = 512) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.85);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

// [table, column holding the assignee, has submission_date]
const TASK_SOURCES = [
  { key: 'checklist', title: 'Checklist', table: 'checklist', col: 'name', pendingBySubmission: true, href: '/checklist/task' },
  { key: 'delegation', title: 'Delegation', table: 'delegation', col: 'name', pendingBySubmission: true, href: '/checklist/delegation' }
];

const countOf = async (query) => {
  const { count, error } = await query;
  return error ? null : count ?? 0;
};

export default function ProfilePage() {
  const { user, login } = useUnifiedAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const username = (user?.username || localStorage.getItem('user-name') || '').toLowerCase();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({ name: '', email: '', phone: '', designation: '' });
  const [savingDetails, setSavingDetails] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Edit toggles: only allow fields and save button to activate when user clicks Edit
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [tasks, setTasks] = useState(null); // null = loading

  // ---- load the user's fresh row ----
  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`user_name.eq.${username},username.eq.${username}`)
        .limit(1);
      if (cancelled) return;
      if (error) showGlobalToast('Could not load profile: ' + error.message, 'error');
      const r = data?.[0] || null;
      setRow(r);
      if (r) {
        setDetails({
          name: r.name || r.user_name || '',
          email: r.email || r.email_id || '',
          phone: r.phone || r.number || r.mobile || '',
          designation: r.Designation || ''
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [username]);

  // ---- load task counts (in parallel; head-only counts) ----
  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    (async () => {
      const names = [username, user?.name].filter(Boolean);
      const results = await Promise.all(
        TASK_SOURCES.filter((s) => canUserAccessChecklistPage(user, s.href)).map(async (s) => {
          const base = () => supabase.from(s.table).select('*', { count: 'exact', head: true }).in(s.col, names);
          const total = await countOf(base());
          const pending = s.pendingBySubmission ? await countOf(base().is('submission_date', null)) : null;
          return { ...s, total, pending };
        })
      );
      if (cancelled) return;
      setTasks(results);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, JSON.stringify(user?.allowedChecklistPages)]);

  const admin = isApexAdmin(user);
  const profileImage = row?.profile_image || localStorage.getItem('profile_image') || null;

  const permissions = useMemo(() => {
    if (!user) return null;
    return {
      pages: ALL_PAGE_IDS.filter((p) => (user.allowedPages || []).includes(p.id)),
      stages: STAGES.filter((s) => (user.allowedStages || []).includes(s.id)),
      checklist: ALL_CHECKLIST_PAGE_IDS.filter((p) => (user.allowedChecklistPages || []).includes(p.id))
    };
  }, [user]);

  // ---- actions ----
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !row) return;
    if (!file.type.startsWith('image/')) {
      showGlobalToast('Please choose an image file.', 'error');
      return;
    }
    setUploading(true);
    try {
      const blob = await compressToBlob(file);
      const fileName = `profile_${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('user-profiles').upload(fileName, blob, { contentType: 'image/jpeg' });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('user-profiles').getPublicUrl(fileName);
      const url = urlData.publicUrl;
      const { error } = await supabase.from('users').update({ profile_image: url }).eq('id', row.id);
      if (error) throw error;
      setRow((r) => ({ ...r, profile_image: url }));
      localStorage.setItem('profile_image', url);
      window.dispatchEvent(new Event('profile-image-changed'));
      showGlobalToast('Profile photo updated.', 'success');
    } catch (err) {
      console.error(err);
      showGlobalToast('Could not update photo: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    if (!row || savingDetails) return;
    if (!details.name.trim()) {
      showGlobalToast('Name is required.', 'error');
      return;
    }
    setSavingDetails(true);
    try {
      const update = {
        name: details.name.trim(),
        email: details.email.trim(),
        email_id: details.email.trim(),
        phone: details.phone.trim(),
        number: details.phone.trim(),
        mobile: details.phone.trim(),
        Designation: details.designation.trim() || null
      };
      const { error } = await supabase.from('users').update(update).eq('id', row.id);
      if (error) throw error;
      setRow((r) => ({ ...r, ...update }));
      login({ ...user, name: update.name, email: update.email, phone: update.phone, designation: details.designation.trim() });
      setIsEditingDetails(false);
      showGlobalToast('Profile details saved.', 'success');
    } catch (err) {
      console.error(err);
      showGlobalToast('Could not save details: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setSavingDetails(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!row || savingPw) return;
    if (pw.current !== row.password) {
      showGlobalToast('Current password is incorrect.', 'error');
      return;
    }
    if (pw.next.length < 4) {
      showGlobalToast('New password must be at least 4 characters.', 'error');
      return;
    }
    if (pw.next !== pw.confirm) {
      showGlobalToast('New password and confirmation do not match.', 'error');
      return;
    }
    setSavingPw(true);
    try {
      const { error } = await supabase.from('users').update({ password: pw.next }).eq('id', row.id);
      if (error) throw error;
      setRow((r) => ({ ...r, password: pw.next }));
      login({ ...user, password: pw.next }); // keep the session valid
      setPw({ current: '', next: '', confirm: '' });
      setIsEditingPassword(false);
      showGlobalToast('Password changed successfully.', 'success');
    } catch (err) {
      console.error(err);
      showGlobalToast('Could not change password: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B172E]" />
        <div className="text-xs font-semibold text-stone-500">Loading profile…</div>
      </div>
    );
  }

  const initials = (details.name || username || 'SG').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. Identity & Personal Details Master Card */}
      <form onSubmit={saveDetails} className={card}>
        {/* Top Header Row: Avatar, Identity, Badges & Edit Button */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 pb-5 border-b border-[#F0E6D8]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
            {/* Avatar with luxury golden ring & upload trigger */}
            <div className="relative shrink-0 group">
              <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#5B172E] to-[#3a0d1c] text-white flex items-center justify-center font-serif font-bold text-2xl shadow-sm border-2 border-[#C5A059]/40 overflow-hidden ring-4 ring-[#FAF5EE]">
                {profileImage ? <img src={profileImage} alt="" className="w-full h-full object-cover" /> : initials}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white border border-[#DECDB8] text-[#5B172E] shadow-sm hover:bg-[#FAF5EE] hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer transition-all"
                title="Change photo"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#9B783E]" /> : <Camera className="w-4 h-4 text-[#9B783E]" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {/* Name, Username, Role & Status Pills */}
            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#431021] tracking-tight truncate">
                  {row?.name || row?.user_name || details.name || username}
                </h1>
                {admin && (
                  <span title="Apex Authority" className="p-1 rounded-md bg-[#FAF5EE] text-[#C5A059] border border-[#DECDB8]">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-mono mt-0.5">@{username}{row?.Designation ? ` • ${row.Designation}` : ''}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8] shadow-2xs">
                  <Shield className="w-3 h-3 text-[#9B783E]" />
                  <span>{user.role || 'User'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{row?.status || 'Active'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger: Edit or Cancel */}
          <div className="shrink-0">
            {!isEditingDetails ? (
              <button
                type="button"
                onClick={() => setIsEditingDetails(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] hover:border-[#5B172E]/40 shadow-xs hover:shadow transition-all cursor-pointer active:scale-98"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#9B783E]" />
                <span>Edit Details</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditingDetails(false);
                  if (row) {
                    setDetails({
                      name: row.name || row.user_name || '',
                      email: row.email || row.email_id || '',
                      phone: row.phone || row.number || row.mobile || '',
                      designation: row.Designation || ''
                    });
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Fields: Display state vs Editable State */}
        <div className="pt-5">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-serif text-sm font-bold text-[#431021] flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#9B783E]" />
              <span>Personal Information</span>
            </h3>
            <span className="text-[11px] text-stone-400">
              {isEditingDetails ? 'Editing enabled' : 'Read-only mode'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>
                <UserIcon className="w-3 h-3 text-stone-400" />
                <span>Full Name</span>
              </label>
              <input
                disabled={!isEditingDetails}
                className={`${input} ${!isEditingDetails ? 'bg-stone-50 text-stone-700 cursor-not-allowed border-stone-200' : 'bg-white shadow-2xs'}`}
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className={label}>
                <Mail className="w-3 h-3 text-stone-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                disabled={!isEditingDetails}
                className={`${input} ${!isEditingDetails ? 'bg-stone-50 text-stone-700 cursor-not-allowed border-stone-200' : 'bg-white shadow-2xs'}`}
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
                placeholder="user@sainygargcouture.com"
              />
            </div>
            <div>
              <label className={label}>
                <Phone className="w-3 h-3 text-stone-400" />
                <span>Phone Number</span>
              </label>
              <input
                disabled={!isEditingDetails}
                className={`${input} ${!isEditingDetails ? 'bg-stone-50 text-stone-700 cursor-not-allowed border-stone-200' : 'bg-white shadow-2xs'}`}
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                placeholder={!isEditingDetails ? 'Not provided' : 'e.g. +91 98765 43210'}
              />
            </div>
            <div>
              <label className={label}>
                <Briefcase className="w-3 h-3 text-stone-400" />
                <span>Designation</span>
              </label>
              <input
                disabled={!isEditingDetails}
                className={`${input} ${!isEditingDetails ? 'bg-stone-50 text-stone-700 cursor-not-allowed border-stone-200' : 'bg-white shadow-2xs'}`}
                value={details.designation}
                onChange={(e) => setDetails({ ...details, designation: e.target.value })}
                placeholder={!isEditingDetails ? 'Not specified' : 'e.g. Master Tailor / Administrator'}
              />
            </div>
          </div>

          {/* Save Bar */}
          {isEditingDetails && (
            <div className="mt-5 pt-4 border-t border-[#F0E6D8] flex items-center justify-end gap-3 animate-in fade-in">
              <button
                type="button"
                onClick={() => {
                  setIsEditingDetails(false);
                  if (row) {
                    setDetails({
                      name: row.name || row.user_name || '',
                      email: row.email || row.email_id || '',
                      phone: row.phone || row.number || row.mobile || '',
                      designation: row.Designation || ''
                    });
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
              <button type="submit" disabled={savingDetails || !row} className={btn}>
                {savingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{savingDetails ? 'Saving…' : 'Save Details'}</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {/* 2. Password & Security Card */}
      <form onSubmit={changePassword} className={card}>
        <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8] flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-[#9B783E]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#431021]">Change Password</h2>
              <p className="text-[11px] text-stone-500">Manage and update your account login credentials</p>
            </div>
          </div>

          {!isEditingPassword ? (
            <button
              type="button"
              onClick={() => setIsEditingPassword(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] hover:border-[#5B172E]/40 shadow-xs hover:shadow transition-all cursor-pointer active:scale-98"
            >
              <Lock className="w-3.5 h-3.5 text-[#9B783E]" />
              <span>Change Password</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditingPassword(false);
                setPw({ current: '', next: '', confirm: '' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {!isEditingPassword ? (
          <div className="py-6 px-4 bg-[#FAF8F5] rounded-xl border border-dashed border-[#DECDB8] text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-white text-[#5B172E] border border-[#DECDB8] flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-4 h-4 text-[#9B783E]" />
            </div>
            <p className="text-xs font-bold text-stone-800">Account Security Locked</p>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Your password is encrypted. Click <strong className="text-[#5B172E]">"Change Password"</strong> above whenever you need to update it.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-1 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className={label}>
                  <Lock className="w-3 h-3 text-stone-400" />
                  <span>Current Password</span>
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`${input} bg-white`}
                  value={pw.current}
                  placeholder="Enter current password"
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>
                  <KeyRound className="w-3 h-3 text-stone-400" />
                  <span>New Password</span>
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`${input} bg-white`}
                  value={pw.next}
                  placeholder="Min 4 characters"
                  onChange={(e) => setPw({ ...pw, next: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>
                  <CheckCircle2 className="w-3 h-3 text-stone-400" />
                  <span>Confirm New Password</span>
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`${input} bg-white`}
                  value={pw.confirm}
                  placeholder="Re-enter new password"
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#5B172E] cursor-pointer select-none"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPw ? 'Hide passwords' : 'Show passwords'}</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPw({ current: '', next: '', confirm: '' });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPw || !row || !pw.current || !pw.next}
                  className={btn}
                >
                  {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>{savingPw ? 'Updating…' : 'Update Password'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* 3. System Access & Permissions Card */}
      <div className={card}>
        <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#9B783E]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#431021]">Permissions & Access Control</h2>
              <p className="text-[11px] text-stone-500">Modules and workflows authorized for this account</p>
            </div>
          </div>
        </div>

        {admin ? (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#FAF5EE] via-white to-[#FAF5EE] border border-[#DECDB8] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#5B172E] text-white shrink-0 shadow-2xs mt-0.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#431021]">Full Apex Atelier Authority</div>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                As an Administrator, you possess unrestricted authority across every module, master hub directory, and all 10 production workflow stages.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              ['Order to Delivery pages', permissions.pages.map((p) => p.label)],
              ['Production stages', permissions.stages.map((s) => s.name)],
              ['Checklist & Delegation pages', permissions.checklist.map((p) => p.label)]
            ].map(([title, items]) => (
              <div key={title} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2">{title}</div>
                {items.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-[#5B172E] border border-[#DECDB8] shadow-2xs">
                        {i}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No access granted.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Active Tasks & Operational Activity */}
      <div className={card}>
        <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8] flex items-center justify-center shrink-0">
              <ListChecks className="w-4 h-4 text-[#9B783E]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#431021]">My Active Tasks & Workspaces</h2>
              <p className="text-[11px] text-stone-500">Quick shortcuts to your personal queues across systems</p>
            </div>
          </div>
        </div>

        {tasks === null ? (
          <div className="flex items-center justify-center gap-2.5 text-xs text-stone-500 py-10">
            <Loader2 className="w-4 h-4 animate-spin text-[#5B172E]" />
            <span>Loading task counts…</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-xs text-stone-500 py-8 text-center">No task queues are assigned to your account.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tasks.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => navigate(t.href)}
                className="group text-left p-3.5 rounded-xl border border-[#E8DFD3] bg-[#FAF8F5] hover:bg-white hover:border-[#5B172E]/40 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 group-hover:text-[#5B172E] transition-colors">{t.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#5B172E] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-2 text-2xl font-serif font-bold text-[#431021]">{t.total ?? '—'}</div>
                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                  {t.pending !== null && t.pending !== undefined ? `${t.pending} pending` : 'total assigned'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
