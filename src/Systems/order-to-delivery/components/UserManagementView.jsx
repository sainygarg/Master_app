import React, { useState } from 'react';
import { 
  User,
  Users, 
  UserPlus, 
  Shield, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Lock, 
  Search, 
  Table as TableIcon, 
  Phone, 
  Mail, 
  Layers, 
  ArrowRightCircle, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  Truck, 
  Scissors, 
  PlusCircle, 
  Tag, 
  Star, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Briefcase, 
  Database,
  ArrowRight
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { 
  getStoredCustomers, 
  saveCustomersToStorage,
  getStoredVendors, 
  saveVendorsToStorage,
  getStoredTransporters, 
  saveTransportersToStorage,
  getStoredKarigars, 
  saveKarigarsToStorage,
  getStoredDepartments,
  saveDepartmentsToStorage,
  getStoredTATConfig,
  saveTATConfigToStorage
} from '../utils/masterStorage';
import { MasterEntryModal } from './MasterEntryModal';
import { CustomerPhoneDisplay, maskCustomerMobile } from '../utils/privacy';

export const UserManagementView = ({
  users = [],
  activeUserId,
  currentUser,
  onSwitchUser,
  onOpenAddUser,
  onOpenEditUser,
  onDeleteUser
}) => {
  // Master Tabs: 'users' | 'vendors' | 'customers' | 'departments' | 'tat' | 'transporters' | 'karigars'
  const [activeTab, setActiveTab] = useState('users');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Master Data States
  const [customers, setCustomers] = useState(() => getStoredCustomers());
  const [vendors, setVendors] = useState(() => getStoredVendors());
  const [departments, setDepartments] = useState(() => getStoredDepartments());
  const [tatConfig, setTATConfig] = useState(() => getStoredTATConfig());
  const [transporters, setTransporters] = useState(() => getStoredTransporters());
  const [karigars, setKarigars] = useState(() => getStoredKarigars());

  // Master Entry Modal State
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingMasterItem, setEditingMasterItem] = useState(null);
  const [masterModalType, setMasterModalType] = useState('customer');

  // Filtered Users
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone && u.phone.includes(searchTerm)) ||
    (u.email && u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtered Customers
  const filteredCustomers = customers.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Vendors
  const filteredVendors = vendors.filter((v) =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone?.includes(searchTerm) ||
    v.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Departments
  const filteredDepartments = departments.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.headName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered TAT Config
  const filteredTAT = tatConfig.filter((t) =>
    t.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Transporters
  const filteredTransporters = transporters.filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone?.includes(searchTerm) ||
    t.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.operatingRoutes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Karigars
  const filteredKarigars = karigars.filter((k) =>
    k.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.phone?.includes(searchTerm) ||
    k.skillGrade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Modal Handlers
  const handleOpenAddMaster = (type) => {
    setMasterModalType(type);
    setEditingMasterItem(null);
    setIsMasterModalOpen(true);
  };

  const handleOpenEditMaster = (type, item) => {
    setMasterModalType(type);
    setEditingMasterItem(item);
    setIsMasterModalOpen(true);
  };

  const handleSubmitMaster = (itemData) => {
    if (masterModalType === 'customer') {
      const exists = customers.some(c => c.id === itemData.id);
      const updated = exists ? customers.map(c => c.id === itemData.id ? itemData : c) : [itemData, ...customers];
      setCustomers(updated);
      saveCustomersToStorage(updated);
    } else if (masterModalType === 'vendor') {
      const exists = vendors.some(v => v.id === itemData.id);
      const updated = exists ? vendors.map(v => v.id === itemData.id ? itemData : v) : [itemData, ...vendors];
      setVendors(updated);
      saveVendorsToStorage(updated);
    } else if (masterModalType === 'department') {
      const exists = departments.some(d => d.id === itemData.id);
      const updated = exists ? departments.map(d => d.id === itemData.id ? itemData : d) : [itemData, ...departments];
      setDepartments(updated);
      saveDepartmentsToStorage(updated);
    } else if (masterModalType === 'tat') {
      const exists = tatConfig.some(t => t.id === itemData.id);
      const updated = exists ? tatConfig.map(t => t.id === itemData.id ? itemData : t) : [...tatConfig, itemData];
      setTATConfig(updated);
      saveTATConfigToStorage(updated);
    } else if (masterModalType === 'transporter') {
      const exists = transporters.some(t => t.id === itemData.id);
      const updated = exists ? transporters.map(t => t.id === itemData.id ? itemData : t) : [itemData, ...transporters];
      setTransporters(updated);
      saveTransportersToStorage(updated);
    } else if (masterModalType === 'karigar') {
      const exists = karigars.some(k => k.id === itemData.id);
      const updated = exists ? karigars.map(k => k.id === itemData.id ? itemData : k) : [itemData, ...karigars];
      setKarigars(updated);
      saveKarigarsToStorage(updated);
    }
  };

  const handleDeleteMaster = (type, id) => {
    if (type === 'customer') {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      saveCustomersToStorage(updated);
    } else if (type === 'vendor') {
      const updated = vendors.filter(v => v.id !== id);
      setVendors(updated);
      saveVendorsToStorage(updated);
    } else if (type === 'department') {
      const updated = departments.filter(d => d.id !== id);
      setDepartments(updated);
      saveDepartmentsToStorage(updated);
    } else if (type === 'tat') {
      const updated = tatConfig.filter(t => t.id !== id);
      setTATConfig(updated);
      saveTATConfigToStorage(updated);
    } else if (type === 'transporter') {
      const updated = transporters.filter(t => t.id !== id);
      setTransporters(updated);
      saveTransportersToStorage(updated);
    } else if (type === 'karigar') {
      const updated = karigars.filter(k => k.id !== id);
      setKarigars(updated);
      saveKarigarsToStorage(updated);
    }
    setDeleteConfirmId(null);
  };

  const getAddButton = () => {
    switch (activeTab) {
      case 'users':
        return (
          <button
            onClick={onOpenAddUser}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create New User</span>
          </button>
        );
      case 'vendors':
        return (
          <button
            onClick={() => handleOpenAddMaster('vendor')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Vendor</span>
          </button>
        );
      case 'customers':
        return (
          <button
            onClick={() => handleOpenAddMaster('customer')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Customer</span>
          </button>
        );
      case 'departments':
        return (
          <button
            onClick={() => handleOpenAddMaster('department')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Department</span>
          </button>
        );
      case 'tat':
        return (
          <button
            onClick={() => handleOpenAddMaster('tat')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Stage TAT</span>
          </button>
        );
      case 'transporters':
        return (
          <button
            onClick={() => handleOpenAddMaster('transporter')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Transporter</span>
          </button>
        );
      case 'karigars':
        return (
          <button
            onClick={() => handleOpenAddMaster('karigar')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Karigar Master</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner - Master Hub */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#431021] flex items-center gap-2">
              <Database className="w-6 h-6 text-[#9B783E]" />
              <span>Master Hub</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8] font-bold">
              Central Reference & Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage Users, Vendors, Customers, Departments, Stage TAT, Transporters, and Karigars master directories.
          </p>
        </div>

        {getAddButton()}
      </div>

      {/* 🚀 MASTER NAVIGATION TABS (ALL 7 MASTERS DIRECTLY ACCESSIBLE) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scroll-smooth border-b border-[#E8DFD3]">
        
        {/* 1. Users */}
        <button
          onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'users'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & RBAC ({users.length})</span>
        </button>

        {/* 2. Vendors */}
        <button
          onClick={() => { setActiveTab('vendors'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'vendors'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Vendors ({vendors.length})</span>
        </button>

        {/* 3. Customers */}
        <button
          onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'customers'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Customers ({customers.length})</span>
        </button>

        {/* 4. Departments */}
        <button
          onClick={() => { setActiveTab('departments'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'departments'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        {/* 5. TAT Master */}
        <button
          onClick={() => { setActiveTab('tat'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'tat'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Stage TAT ({tatConfig.length})</span>
        </button>

        {/* 6. Transporters */}
        <button
          onClick={() => { setActiveTab('transporters'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'transporters'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Transporters ({transporters.length})</span>
        </button>

        {/* 7. Karigars */}
        <button
          onClick={() => { setActiveTab('karigars'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'karigars'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Karigars ({karigars.length})</span>
        </button>

      </div>

      {/* Search Bar Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-800"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. USERS MASTER TAB (CREATE, UPDATE, DELETE, RBAC PERMISSIONS)             */}
      {/* 1ST COLUMN IS STRICTLY ACTIONS WITH BUTTONS                              */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  
                  {/* 1ST COLUMN: STRICTLY ACTIONS */}
                  <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[150px]">
                    ⚡ Actions
                  </th>

                  <th className="py-3.5 px-4 min-w-[200px]">User & Name</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Role</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Contact Info</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Page Permissions</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Stage Access</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredUsers.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const isConfirmingDelete = deleteConfirmId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-[#FCFAF7] transition-colors">
                      
                      {/* 1ST COLUMN: ACTIONS */}
                      <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => {
                                onDeleteUser(user.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px] hover:bg-stone-300"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => onOpenEditUser(user)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] shadow-2xs transition-all"
                              title="Edit user details & permissions"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Button (disabled for self or primary admin) */}
                            {user.username !== 'admin' && !isCurrent ? (
                              <button
                                onClick={() => setDeleteConfirmId(user.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="p-1.5 text-stone-300 cursor-not-allowed" title="Protected account">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* User & Name */}
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-full ${user.avatarColor || 'bg-[#5B172E]'} text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0`}>
                            {user.name?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-500 font-mono">@{user.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 align-middle">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          user.role === 'Admin'
                            ? 'bg-[#5B172E] text-white shadow-2xs'
                            : 'bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8]'
                        }`}>
                          <Shield className="w-3 h-3" />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 align-middle">
                        <div className="text-[11px] text-stone-700 font-medium">
                          {maskCustomerMobile(user.phone, currentUser)}
                        </div>
                        <span className="text-[10px] text-stone-400 block truncate max-w-[140px]">{user.email}</span>
                      </td>

                      {/* Page Permissions */}
                      <td className="py-3 px-4 align-middle">
                        {user.role === 'Admin' ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                            Full Atelier Access (All Pages)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(user.allowedPages || []).map((p) => (
                              <span key={p} className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-100 text-stone-700 border border-stone-200 capitalize">
                                {p === 'settings' ? 'Master' : p}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Stage Access */}
                      <td className="py-3 px-4 align-middle">
                        {user.role === 'Admin' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            All 10 Stages Accessible
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            {(user.allowedStages || []).length} / 10 Stages Permitted
                          </span>
                        )}
                      </td>

                      {/* Status & Switch Demo */}
                      <td className="py-3 px-4 align-middle whitespace-nowrap">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{user.status || 'Active'}</span>
                          </span>

                          {!isCurrent && onSwitchUser && (
                            <button
                              onClick={() => onSwitchUser(user.id)}
                              className="text-[10px] font-bold text-[#5B172E] hover:underline bg-[#FAF5EE] px-2 py-1 rounded border border-[#DECDB8]"
                              title="Switch active session to this user"
                            >
                              Switch
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VENDORS MASTER TAB                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[180px]">Vendor Name & ID</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Supply Category</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Contact Person & Phone</th>
                  <th className="py-3.5 px-4 min-w-[180px]">City & Address</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Rating / Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredVendors.map((v) => {
                  const isConfirming = deleteConfirmId === v.id;
                  return (
                    <tr key={v.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => handleDeleteMaster('vendor', v.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditMaster('vendor', v)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(v.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                              title="Delete Vendor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{v.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{v.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                          {v.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-semibold text-stone-800 text-xs">{v.contactPerson}</div>
                        <span className="text-[11px] text-stone-500 font-medium">{v.phone}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-800 text-xs">{v.city}</div>
                        <span className="text-[10px] text-stone-400 truncate block max-w-[180px]">{v.address}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="text-[11px] font-semibold text-stone-800">{v.rating}</div>
                        <span className="text-[10px] text-stone-500">{v.terms}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CUSTOMERS MASTER TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[180px]">Customer Name & ID</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Mobile / Contact</th>
                  <th className="py-3.5 px-4 min-w-[180px]">City & Address</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Category</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Total Orders</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Preferences / Style Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredCustomers.map((cust) => {
                  const isConfirming = deleteConfirmId === cust.id;
                  return (
                    <tr key={cust.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => handleDeleteMaster('customer', cust.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditMaster('customer', cust)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(cust.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{cust.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{cust.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <CustomerPhoneDisplay mobile={cust.phone} currentUser={currentUser} />
                        <span className="text-[10px] text-stone-400 block truncate max-w-[130px]">{cust.email}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-800 text-xs">{cust.city}</div>
                        <span className="text-[10px] text-stone-400 truncate block max-w-[180px]">{cust.address}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8]">
                          {cust.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle font-bold text-stone-800">
                        {cust.ordersCount || 1} Orders
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="text-[11px] text-stone-600 line-clamp-2" title={cust.notes}>
                          {cust.notes || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DEPARTMENTS MASTER TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[200px]">Department Name & ID</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Dept Code</th>
                  <th className="py-3.5 px-4 min-w-[160px]">In-Charge / Lead</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Official Email</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Staff Count</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Status</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Responsibilities / Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredDepartments.map((dept) => {
                  const isConfirming = deleteConfirmId === dept.id;
                  return (
                    <tr key={dept.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => handleDeleteMaster('department', dept.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditMaster('department', dept)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(dept.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                              title="Delete Department"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{dept.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{dept.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-stone-100 text-stone-800 border border-stone-200">
                          {dept.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle font-bold text-stone-800">
                        {dept.headName}
                      </td>
                      <td className="py-3 px-4 align-middle text-stone-600 font-medium">
                        {dept.contactEmail}
                      </td>
                      <td className="py-3 px-4 align-middle font-bold text-stone-800">
                        {dept.staffCount} Staff
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{dept.status || 'Active'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle text-[11px] text-stone-600 line-clamp-2" title={dept.description}>
                        {dept.description || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAT (TURNAROUND TIME) CONFIGURATION MASTER                             */}
      {/* ========================================================================= */}
      {activeTab === 'tat' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[200px]">Workflow Stage</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Standard Target</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Work Hours</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Buffer Days</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Max SLA Limit</th>
                  <th className="py-3.5 px-4 min-w-[180px]">In-Charge Dept</th>
                  <th className="py-3.5 px-4 min-w-[100px]">SLA Priority</th>
                  <th className="py-3.5 px-4 min-w-[220px]">SOP & Guidelines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredTAT.map((tat, idx) => {
                  const isConfirming = deleteConfirmId === tat.id;
                  return (
                    <tr key={tat.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => handleDeleteMaster('tat', tat.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditMaster('tat', tat)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit TAT</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tat.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                              title="Delete TAT rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-bold text-[10px]">
                            {tat.stageIndex || idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-stone-900 text-xs">{tat.stageName}</div>
                            <span className="text-[10px] font-mono text-[#9B783E]">{tat.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                          {tat.standardDays} Days
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle font-semibold text-stone-700">
                        {tat.standardHours} Hours
                      </td>
                      <td className="py-3 px-4 align-middle font-medium text-stone-600">
                        +{tat.bufferDays} Days
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="font-bold text-rose-700">
                          {tat.maxSlaDays} Days Max
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle text-stone-800 font-medium">
                        {tat.department}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tat.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : tat.priority === 'High'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {tat.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle text-[11px] text-stone-600 line-clamp-2" title={tat.notes}>
                        {tat.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TRANSPORTERS MASTER TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === 'transporters' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[180px]">Company Name & ID</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Service Type</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Contact Person & Phone</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Hub City & Routes</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Transit SLA / Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredTransporters.map((trn) => {
                  const isConfirming = deleteConfirmId === trn.id;
                  return (
                    <tr key={trn.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => handleDeleteMaster('transporter', trn.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditMaster('transporter', trn)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(trn.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                              title="Delete Transporter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{trn.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{trn.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                          {trn.serviceType}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-semibold text-stone-800 text-xs">{trn.contactPerson}</div>
                        <span className="text-[11px] text-stone-500 font-medium">{trn.phone}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-800 text-xs">{trn.hubCity}</div>
                        <span className="text-[10px] text-stone-400 truncate block max-w-[160px]">{trn.operatingRoutes}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="text-[11px] font-bold text-stone-800">{trn.avgTransitTime}</div>
                        {trn.trackingUrl && (
                          <a
                            href={trn.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-[#5B172E] hover:underline"
                          >
                            <span>Tracking URL</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. KARIGARS & MASTERS TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'karigars' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[180px]">Artisan Master & ID</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Artisan Craft Specialization</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Unit / Workshop Floor</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Contact Mobile</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Skill Grade / Daily Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredKarigars.map((k) => {
                  const isConfirming = deleteConfirmId === k.id;
                  return (
                    <tr key={k.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => handleDeleteMaster('karigar', k.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditMaster('karigar', k)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(k.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                              title="Delete Karigar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{k.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{k.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                          {k.specialization}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle text-stone-700 font-medium">
                        {k.unit}
                      </td>
                      <td className="py-3 px-4 align-middle font-medium text-stone-600">
                        {k.phone}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-800 text-[11px]">{k.skillGrade}</div>
                        <span className="text-[10px] text-stone-500">{k.dailyCapacity}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MASTER ENTRY MODAL */}
      <MasterEntryModal
        isOpen={isMasterModalOpen}
        onClose={() => {
          setIsMasterModalOpen(false);
          setEditingMasterItem(null);
        }}
        type={masterModalType}
        initialData={editingMasterItem}
        onSubmit={handleSubmitMaster}
        nextId={
          masterModalType === 'customer' ? `CUST-00${customers.length + 1}` :
          masterModalType === 'vendor' ? `VND-00${vendors.length + 1}` :
          masterModalType === 'department' ? `DEPT-00${departments.length + 1}` :
          masterModalType === 'tat' ? `TAT-0${tatConfig.length + 1}` :
          masterModalType === 'transporter' ? `TRN-00${transporters.length + 1}` :
          `KRG-00${karigars.length + 1}`
        }
      />

    </div>
  );
};