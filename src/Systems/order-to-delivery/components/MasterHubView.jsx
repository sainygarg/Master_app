import React, { useState, useEffect, useMemo } from 'react';
import { LoadingRow } from './LoadingState';
import { 
  User,
  Users, 
  UserPlus, 
  Shield, 
  Edit, 
  Trash2, 
  Check, 
  Eye,
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
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { fetchMasters, getCachedMasters, saveMaster, insertMaster, deleteMaster, generateNextMasterId, fetchMasterCounts, fetchDesignsPage, fetchDesignImages } from '../utils/masterDirectoryService';
import { isApexAdmin, canModify, canUserAccessPage, canUserAccessChecklistPage, ALL_CHECKLIST_PAGE_IDS, ALL_PAGE_IDS } from '../utils/userAuthService';
import { MasterEntryModal } from './MasterEntryModal';
import { CustomerPhoneDisplay, maskCustomerMobile } from '../utils/privacy';
import { useToastAlert } from '../../../core/context/ToastAlertContext';

export const MasterHubView = ({
  users = [],
  usersLoading = false,
  activeUserId,
  currentUser,
  onOpenAddUser,
  onOpenEditUser,
  onDeleteUser
}) => {
  const { showToast } = useToastAlert();

  // Permission check for Settings page: Can this user perform CRUD operations?
  const canEdit = isApexAdmin(currentUser) || canModify(currentUser, 'settings');

  // Master Tabs: 'users' | 'vendors' | 'customers' | 'departments' | 'tat' | 'transporters' | 'karigars' | 'designs'
  const [activeTab, setActiveTab] = useState('users');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Master Data States
  const [customers, setCustomers] = useState(() => getCachedMasters("customer") || []);
  const [vendors, setVendors] = useState(() => getCachedMasters("vendor") || []);
  const [departments, setDepartments] = useState(() => getCachedMasters("department") || []);
  const [tatConfig, setTATConfig] = useState(() => getCachedMasters("tat") || []);
  const [transporters, setTransporters] = useState(() => getCachedMasters("transporter") || []);
  const [karigars, setKarigars] = useState(() => getCachedMasters("karigar") || []);
  const [designs, setDesigns] = useState([]);
  // Lightweight tab counts (populated via count-only head queries on mount)
  const [tabCounts, setTabCounts] = useState({});
  // Kinds whose first load has finished (cached kinds count as loaded) – prevents "No records found" flashing
  const [loadedKinds, setLoadedKinds] = useState(() => new Set(["customer", "vendor", "department", "tat", "transporter", "karigar"].filter((k) => getCachedMasters(k))));
  const loadingKind = (k) => !loadedKinds.has(k);

  // Master Entry Modal State
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingMasterItem, setEditingMasterItem] = useState(null);
  const [masterModalType, setMasterModalType] = useState('customer');

  // Preview Image Gallery Modal state: { images: string[], index: number, name: string, sku: string, category?: string, type?: string, loadingGallery?: boolean } | null
  const [previewImage, setPreviewImage] = useState(null);

  // Designs server-side pagination state (only 1 page fetched at a time)
  const [designPage, setDesignPage] = useState(1);
  const [designPageSize, setDesignPageSize] = useState(15);
  const [designTotalCount, setDesignTotalCount] = useState(0);
  const [designsLoading, setDesignsLoading] = useState(false);
  const [debouncedDesignSearch, setDebouncedDesignSearch] = useState('');

  useEffect(() => {
    setDesignPage(1);
  }, [searchTerm, activeTab]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedDesignSearch(searchTerm);
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (!previewImage) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      } else if (e.key === 'ArrowRight' && previewImage.images.length > 1) {
        setPreviewImage((prev) => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
      } else if (e.key === 'ArrowLeft' && previewImage.images.length > 1) {
        setPreviewImage((prev) => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewImage]);

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
    c.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Vendors
  const filteredVendors = vendors.filter((v) =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone?.includes(searchTerm) ||
    v.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Departments
  const filteredDepartments = departments.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchTerm.toLowerCase())
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
    t.phone?.includes(searchTerm) ||
    t.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Karigars
  const filteredKarigars = karigars.filter((k) =>
    k.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.phone?.includes(searchTerm)
  );

  // Server-side paginated designs (designs already holds only the current page)
  const totalDesignPages = Math.max(1, Math.ceil(designTotalCount / designPageSize));
  const safeDesignPage = Math.min(designPage, totalDesignPages);
  const paginatedDesigns = designs;

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
    if (type === 'design' && item?.id) {
      fetchDesignImages(item.id)
        .then((imgs) => {
          if (imgs.length > 0) {
            setEditingMasterItem((prev) =>
              prev && prev.id === item.id ? { ...prev, images: imgs, imageUrl: imgs[0] || prev.imageUrl } : prev
            );
          }
        })
        .catch(() => {});
    }
  };

  const MASTER_KINDS = {
    customer: { items: customers, set: setCustomers, append: false },
    vendor: { items: vendors, set: setVendors, append: false },
    department: { items: departments, set: setDepartments, append: false },
    tat: { items: tatConfig, set: setTATConfig, append: true },
    transporter: { items: transporters, set: setTransporters, append: false },
    karigar: { items: karigars, set: setKarigars, append: false },
    design: { items: designs, set: setDesigns, append: false }
  };

  const TAB_TO_KIND = {
    vendors: 'vendor',
    customers: 'customer',
    departments: 'department',
    tat: 'tat',
    transporters: 'transporter',
    karigars: 'karigar',
    designs: 'design'
  };

  // 1. On mount: fetch ONLY lightweight counts for tab badges (0 rows transferred)
  useEffect(() => {
    fetchMasterCounts()
      .then((counts) => {
        setTabCounts((prev) => {
          const next = { ...prev };
          Object.entries(counts).forEach(([k, v]) => {
            if (v !== null) next[k] = v;
          });
          return next;
        });
      })
      .catch(() => {});
  }, []);

  // 2. Lazy-load non-design tab data ONLY when user opens that tab
  useEffect(() => {
    const kind = TAB_TO_KIND[activeTab];
    if (!kind || kind === 'design') return;
    if (loadedKinds.has(kind)) return;

    const cfg = MASTER_KINDS[kind];
    if (!cfg) return;
    fetchMasters(kind)
      .then((rows) => {
        cfg.set(rows);
        setTabCounts((prev) => ({ ...prev, [kind]: rows.length }));
      })
      .catch((err) => {
        console.error(`Failed to load ${kind} master data`, err);
        showToast(`Failed to load ${kind} data from database: ${err.message}`, 'error');
      })
      .finally(() => setLoadedKinds((prev) => new Set(prev).add(kind)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 3. Server-side paginated fetch for Designs tab (ONLY when activeTab === 'designs')
  const loadCurrentDesignsPage = async () => {
    setDesignsLoading(true);
    try {
      const { rows, total } = await fetchDesignsPage({
        page: safeDesignPage,
        pageSize: designPageSize,
        search: debouncedDesignSearch
      });
      setDesigns(rows);
      setDesignTotalCount(total);
      if (!debouncedDesignSearch.trim()) {
        setTabCounts((prev) => ({ ...prev, design: total }));
      }
    } catch (err) {
      console.error('Failed to load designs page', err);
      showToast(`Failed to load designs: ${err.message}`, 'error');
    } finally {
      setDesignsLoading(false);
      setLoadedKinds((prev) => new Set(prev).add('design'));
    }
  };

  useEffect(() => {
    if (activeTab !== 'designs') return;
    loadCurrentDesignsPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, safeDesignPage, designPageSize, debouncedDesignSearch]);

  // Saves to the database first; local state is updated only after the DB confirms.
  const handleSubmitMaster = async (itemData) => {
    if (!canEdit) {
      showToast('Permission Denied: You have View-only access to Settings.', 'error');
      return false;
    }
    const cfg = MASTER_KINDS[masterModalType];
    if (!cfg) return false;
    try {
      if (editingMasterItem) {
        await saveMaster(masterModalType, itemData);
        cfg.set(cfg.items.map((i) => (i.id === itemData.id ? itemData : i)));
      } else {
        // New entry: take the id from the latest DB state (never overwrite an existing record)
        const fresh = await fetchMasters(masterModalType, { force: true });
        const item = { ...itemData, id: generateNextMasterId(masterModalType, fresh) };
        await insertMaster(masterModalType, item);
        setTabCounts((prev) => ({
          ...prev,
          [masterModalType]: (prev[masterModalType] ?? fresh.length) + 1
        }));
        if (masterModalType === 'design') {
          await loadCurrentDesignsPage();
        } else {
          cfg.set(cfg.append ? [...fresh, item] : [item, ...fresh]);
        }
      }
      showToast('Saved successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Failed to save master entry', err);
      showToast('Could not save to database: ' + err.message, 'error');
      return false;
    }
  };

  const handleDeleteMaster = async (type, id) => {
    if (!canEdit) {
      showToast('Permission Denied: You have View-only access to Settings.', 'error');
      return;
    }
    const cfg = MASTER_KINDS[type];
    if (!cfg) return;
    try {
      await deleteMaster(type, id);
      setTabCounts((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] ?? cfg.items.length) - 1)
      }));
      if (type === 'design') {
        await loadCurrentDesignsPage();
      } else {
        cfg.set(cfg.items.filter((i) => i.id !== id));
      }
      showToast('Deleted successfully!', 'success');
    } catch (err) {
      console.error('Failed to delete master entry', err);
      showToast('Could not delete from database: ' + err.message, 'error');
    }
    setDeleteConfirmId(null);
  };

  const getAddButton = () => {
    if (!canEdit) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>View Only Mode</span>
        </span>
      );
    }
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
      case 'designs':
        return (
          <button
            onClick={() => handleOpenAddMaster('design')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Design</span>
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
            Manage Users, Vendors, Customers, Departments, Stage TAT, and Karigars master directories.
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
          <span>Users ({users.length})</span>
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
          <span>Vendors ({tabCounts.vendor ?? vendors.length})</span>
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
          <span>Customers ({tabCounts.customer ?? customers.length})</span>
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
          <span>Departments ({tabCounts.department ?? departments.length})</span>
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
          <span>Stage TAT ({tabCounts.tat ?? tatConfig.length})</span>
        </button>

        {/* 6. Transporters (Hidden as requested; code preserved) */}
        {false && (
          <button
            onClick={() => { setActiveTab('transporters'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'transporters'
                ? 'bg-[#5B172E] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Transporters ({tabCounts.transporter ?? transporters.length})</span>
          </button>
        )}

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
          <span>Karigars ({tabCounts.karigar ?? karigars.length})</span>
        </button>

        {/* 8. Designs & SKUs */}
        <button
          onClick={() => { setActiveTab('designs'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'designs'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Designs ({tabCounts.design ?? designTotalCount})</span>
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
                  <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[150px]">
                    ⚡ Actions
                  </th>

                  <th className="py-3.5 px-4 min-w-[200px]">User & Name</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Role</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Contact Info</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Page Access</th>
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
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle">
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
                        ) : !canEdit ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onOpenEditUser(user)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all"
                              title="View user details (Read-Only)"
                            >
                              <Eye className="w-3.5 h-3.5 text-stone-500" />
                              <span>View</span>
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
                          isApexAdmin(user)
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

                      {/* Page Access */}
                      <td className="py-3 px-4 align-middle whitespace-nowrap">
                        {isApexAdmin(user) ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>All Pages</span>
                          </span>
                        ) : (() => {
                          const totalPages = ALL_PAGE_IDS.length + ALL_CHECKLIST_PAGE_IDS.length;
                          const grantedPages =
                            ALL_PAGE_IDS.filter((p) => canUserAccessPage(user, p.id)).length +
                            ALL_CHECKLIST_PAGE_IDS.filter((p) => canUserAccessChecklistPage(user, p.id)).length;
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-2xs ${
                              grantedPages === totalPages
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : grantedPages > 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-stone-50 text-stone-500 border-stone-200'
                            }`}>
                              <span>{grantedPages} / {totalPages} Pages</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Status & Switch Demo */}
                      <td className="py-3 px-4 align-middle whitespace-nowrap">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{user.status || 'Active'}</span>
                          </span>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              
                {usersLoading && <LoadingRow colSpan={6} />}
                {!usersLoading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6}className="py-12 px-4 text-center bg-white">
                      <div className="font-serif text-base font-bold text-[#431021]">No records found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Nothing to show here yet. Use the add button above to create the first entry.</p>
                    </td>
                  </tr>
                )}
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
                  <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[180px]">Vendor Name & ID</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Contact Person & Phone</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredVendors.map((v) => {
                  const isConfirming = deleteConfirmId === v.id;
                  return (
                    <tr key={v.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle">
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
                            {canEdit ? (
                              <>
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
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenEditMaster('vendor', v)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100"
                                title="View details (Read-Only)"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" />
                                <span>View</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{v.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{v.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-semibold text-stone-800 text-xs">{v.contactPerson}</div>
                        <span className="text-[11px] text-stone-500 font-medium">{v.phone}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="text-[10px] text-stone-400 truncate block max-w-[180px]">{v.address}</span>
                      </td>
                    </tr>
                  );
                })}
              
                {loadingKind("vendor") && <LoadingRow colSpan={4} />}
                {!loadingKind("vendor") && filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 px-4 text-center bg-white">
                      <div className="font-serif text-base font-bold text-[#431021]">No records found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Nothing to show here yet. Use the add button above to create the first entry.</p>
                    </td>
                  </tr>
                )}
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
                  <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[180px]">Customer Name & ID</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Mobile / Contact</th>
                  <th className="py-3.5 px-4 min-w-[180px]">City</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Total Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredCustomers.map((cust) => {
                  const isConfirming = deleteConfirmId === cust.id;
                  return (
                    <tr key={cust.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle">
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
                            {canEdit ? (
                              <>
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
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenEditMaster('customer', cust)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100"
                                title="View details (Read-Only)"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" />
                                <span>View</span>
                              </button>
                            )}
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
                      </td>
                      <td className="py-3 px-4 align-middle font-bold text-stone-800">
                        {cust.ordersCount || 1} Orders
                      </td>
                    </tr>
                  );
                })}
              
                {loadingKind("customer") && <LoadingRow colSpan={5} />}
                {!loadingKind("customer") && filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 px-4 text-center bg-white">
                      <div className="font-serif text-base font-bold text-[#431021]">No records found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Nothing to show here yet. Use the add button above to create the first entry.</p>
                    </td>
                  </tr>
                )}
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
                  <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[200px]">Department Name & ID</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Dept Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredDepartments.map((dept) => {
                  const isConfirming = deleteConfirmId === dept.id;
                  return (
                    <tr key={dept.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle">
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
                            {canEdit ? (
                              <>
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
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenEditMaster('department', dept)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100"
                                title="View details (Read-Only)"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" />
                                <span>View</span>
                              </button>
                            )}
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
                    </tr>
                  );
                })}
              
                {loadingKind("department") && <LoadingRow colSpan={3} />}
                {!loadingKind("department") && filteredDepartments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 px-4 text-center bg-white">
                      <div className="font-serif text-base font-bold text-[#431021]">No records found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Nothing to show here yet. Use the add button above to create the first entry.</p>
                    </td>
                  </tr>
                )}
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
                  <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[160px]">Module Name</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Stage Name</th>
                  <th className="py-3.5 px-4 min-w-[120px]">TAT Type</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Time Value</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Assigned Person</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredTAT.map((tat, idx) => {
                  const isConfirming = deleteConfirmId === tat.id;
                  const displayType = tat.tatType || 'Days';
                  const displayValue = tat.timeValue ?? tat.standardDays ?? (tat.standardHours ? `${tat.standardHours}` : 2);
                  return (
                    <tr key={tat.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle">
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
                            {canEdit ? (
                              <>
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
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenEditMaster('tat', tat)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100"
                                title="View details (Read-Only)"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" />
                                <span>View</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                          {tat.moduleName || 'Order to Delivery'}
                        </span>
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
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-stone-100 text-stone-700 border border-stone-200">
                          {displayType}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                          {displayValue} {displayType}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        {tat.assignedPerson ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-bold text-[10px]">
                              {tat.assignedPerson.substring(0, 1).toUpperCase()}
                            </span>
                            <span className="font-semibold text-stone-800 text-xs">
                              {tat.assignedPerson}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">Not Assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle text-[11px] text-stone-600 line-clamp-2" title={tat.notes}>
                        {tat.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              
                {loadingKind("tat") && <LoadingRow colSpan={7} />}
                {!loadingKind("tat") && filteredTAT.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 px-4 text-center bg-white">
                      <div className="font-serif text-base font-bold text-[#431021]">No records found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Nothing to show here yet. Use the add button above to create the first entry.</p>
                    </td>
                  </tr>
                )}
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
                  <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[180px]">Company Name & ID</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Contact Person & Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredTransporters.map((trn) => {
                  const isConfirming = deleteConfirmId === trn.id;
                  return (
                    <tr key={trn.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle">
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
                            {canEdit ? (
                              <>
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
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenEditMaster('transporter', trn)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100"
                                title="View details (Read-Only)"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" />
                                <span>View</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{trn.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{trn.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-semibold text-stone-800 text-xs">{trn.contactPerson}</div>
                        <span className="text-[11px] text-stone-500 font-medium">{trn.phone}</span>
                      </td>
                    </tr>
                  );
                })}
              
                {loadingKind("transporter") && <LoadingRow colSpan={3} />}
                {!loadingKind("transporter") && filteredTransporters.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 px-4 text-center bg-white">
                      <div className="font-serif text-base font-bold text-[#431021]">No records found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Nothing to show here yet. Use the add button above to create the first entry.</p>
                    </td>
                  </tr>
                )}
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
                  <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[180px]">Artisan Master & ID</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Contact Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredKarigars.map((k) => {
                  const isConfirming = deleteConfirmId === k.id;
                  return (
                    <tr key={k.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle">
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
                            {canEdit ? (
                              <>
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
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenEditMaster('karigar', k)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100"
                                title="View details (Read-Only)"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" />
                                <span>View</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{k.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{k.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle font-medium text-stone-600">
                        {k.phone}
                      </td>
                    </tr>
                  );
                })}
              
                {loadingKind("karigar") && <LoadingRow colSpan={3} />}
                {!loadingKind("karigar") && filteredKarigars.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 px-4 text-center bg-white">
                      <div className="font-serif text-base font-bold text-[#431021]">No records found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Nothing to show here yet. Use the add button above to create the first entry.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. DESIGNS MASTER TABLE */}
      {activeTab === 'designs' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[150px]">
                    ⚡ Actions
                  </th>
                  <th className="py-3.5 px-4 min-w-[70px]">Image</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Design Name</th>
                  <th className="py-3.5 px-4 min-w-[130px]">SKU Code</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Category</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Type / Silhouette</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Color</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {paginatedDesigns.map((d) => {
                  const isConfirming = deleteConfirmId === d.id;
                  const designImgs = Array.isArray(d.images) && d.images.length > 0
                    ? d.images.filter(Boolean)
                    : (d.imageUrl ? [d.imageUrl] : []);
                  const primaryImg = designImgs[0] || '';
                  return (
                    <tr key={d.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle">
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => handleDeleteMaster('design', d.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
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
                            {canEdit ? (
                              <>
                                <button
                                  onClick={() => handleOpenEditMaster('design', d)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE]"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(d.id)}
                                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                                  title="Delete Design"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenEditMaster('design', d)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100"
                                title="View details (Read-Only)"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" />
                                <span>View</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 align-middle">
                        <div
                          onClick={() => {
                            if (designImgs.length > 0) {
                              setPreviewImage({
                                images: designImgs,
                                index: 0,
                                name: d.name,
                                sku: d.sku,
                                category: d.category,
                                type: d.type,
                                loadingGallery: true
                              });
                              fetchDesignImages(d.id)
                                .then((fullImgs) => {
                                  setPreviewImage((prev) => {
                                    if (!prev || prev.sku !== d.sku || prev.name !== d.name) return prev;
                                    const nextImgs = fullImgs.length > 0 ? fullImgs : prev.images;
                                    return { ...prev, images: nextImgs, loadingGallery: false };
                                  });
                                })
                                .catch(() => {
                                  setPreviewImage((prev) => (prev ? { ...prev, loadingGallery: false } : null));
                                });
                            }
                          }}
                          className={`w-12 h-12 rounded-xl overflow-hidden bg-[#FAF5EE] border border-[#DECDB8] flex items-center justify-center shrink-0 shadow-2xs group relative ${
                            designImgs.length > 0 ? 'cursor-pointer hover:border-[#5B172E] hover:ring-2 hover:ring-[#5B172E]/20 transition-all' : ''
                          }`}
                          title={designImgs.length > 1 ? `Click to view all ${designImgs.length} images` : primaryImg ? 'Click to view full image' : 'No image'}
                        >
                          {primaryImg ? (
                            <>
                              <img
                                src={primaryImg}
                                alt={d.name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerHTML = '<span class="text-[9px] font-bold text-stone-400">NO IMG</span>';
                                  }
                                }}
                              />
                              {designImgs.length > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-[#5B172E]/90 text-white text-[9px] font-bold leading-tight shadow">
                                  +{designImgs.length - 1}
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white drop-shadow" />
                              </div>
                            </>
                          ) : (
                            <Sparkles className="w-4 h-4 text-[#C5A059]" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900 text-xs">{d.name}</div>
                        <span className="text-[10px] font-mono text-[#9B783E]">{d.id}</span>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                          {d.sku}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle font-medium text-stone-600">
                        {d.category || 'Couture'}
                      </td>
                      <td className="py-3 px-4 align-middle font-medium text-stone-600">
                        {d.type || '—'}
                      </td>
                      <td className="py-3 px-4 align-middle">
                        {d.color ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                            {d.color}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 align-middle text-stone-600 line-clamp-2 max-w-xs">
                        {d.description || '—'}
                      </td>
                    </tr>
                  );
                })}
              
                {(designsLoading || loadingKind("design")) && <LoadingRow colSpan={8} />}
                {!designsLoading && !loadingKind("design") && paginatedDesigns.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 px-4 text-center bg-white">
                      <div className="font-serif text-base font-bold text-[#431021]">No design records found</div>
                      <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">Add design templates with SKU codes to easily select them when creating bespoke orders.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Designs Pagination Controls */}
          {designTotalCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[#E8DFD3] bg-[#FAF7F2] text-xs">
              <div className="flex items-center gap-2 text-stone-600">
                <span>
                  Showing{' '}
                  <strong className="text-[#431021]">
                    {(safeDesignPage - 1) * designPageSize + 1}–{Math.min(safeDesignPage * designPageSize, designTotalCount)}
                  </strong>{' '}
                  of <strong className="text-[#431021]">{designTotalCount}</strong> designs
                </span>
                <select
                  value={designPageSize}
                  onChange={(e) => {
                    setDesignPageSize(Number(e.target.value));
                    setDesignPage(1);
                  }}
                  className="ml-2 px-2 py-1 rounded-lg border border-[#DECDB8] bg-white text-stone-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#5B172E]"
                >
                  <option value={15}>15 / page</option>
                  <option value={30}>30 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeDesignPage <= 1}
                  onClick={() => setDesignPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DECDB8] bg-white text-stone-700 font-semibold hover:bg-[#FAF5EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="px-2.5 py-1 font-bold text-[#5B172E]">
                  Page {safeDesignPage} of {totalDesignPages}
                </span>
                <button
                  type="button"
                  disabled={safeDesignPage >= totalDesignPages}
                  onClick={() => setDesignPage((p) => Math.min(totalDesignPages, p + 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DECDB8] bg-white text-stone-700 font-semibold hover:bg-[#FAF5EE] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
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
        nextId={generateNextMasterId(masterModalType, MASTER_KINDS[masterModalType]?.items || [])}
        users={users}
      />

      {/* E-COMMERCE STYLE MULTI-IMAGE GALLERY LIGHTBOX */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#DECDB8] animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#DECDB8] bg-[#FAF8F5]">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base truncate">
                    {previewImage.name}
                  </h4>
                  {previewImage.images.length > 1 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#5B172E] text-white">
                      {previewImage.index + 1} / {previewImage.images.length}
                    </span>
                  )}
                  {previewImage.loadingGallery && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 animate-pulse">
                      Loading photos...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-[#5B172E] bg-[#FAF5EE] px-2 py-0.5 rounded-full border border-[#DECDB8]">
                    {previewImage.sku}
                  </span>
                  {previewImage.category && (
                    <span className="text-[11px] text-stone-500 font-medium">
                      {previewImage.category}{previewImage.type ? ` • ${previewImage.type}` : ''}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image Stage with Left/Right Arrows */}
            <div className="relative p-4 flex items-center justify-center bg-stone-950 min-h-[360px] max-h-[65vh] overflow-hidden select-none">
              {previewImage.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setPreviewImage((prev) =>
                      prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#431021] shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  title="Previous image (←)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <img
                key={previewImage.images[previewImage.index]}
                src={previewImage.images[previewImage.index]}
                alt={`${previewImage.name} - ${previewImage.index + 1}`}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg animate-in fade-in duration-150"
              />

              {previewImage.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setPreviewImage((prev) =>
                      prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#431021] shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  title="Next image (→)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* E-commerce Style Horizontal Scrollable Thumbnail Strip */}
            {previewImage.images.length > 1 && (
              <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#DECDB8] overflow-x-auto">
                <div className="flex items-center gap-2.5 min-w-max">
                  {previewImage.images.map((imgUrl, idx) => {
                    const isActive = idx === previewImage.index;
                    return (
                      <button
                        key={`${imgUrl}-${idx}`}
                        type="button"
                        onClick={() => setPreviewImage((prev) => (prev ? { ...prev, index: idx } : null))}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#5B172E] ring-2 ring-[#5B172E]/25 scale-105 shadow-sm'
                            : 'border-[#DECDB8] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer with actions */}
            <div className="p-3 bg-white border-t border-[#DECDB8] flex items-center justify-between">
              <span className="text-xs text-stone-500">
                {previewImage.images.length > 1
                  ? 'Use ← → arrow keys or click thumbnails to browse'
                  : 'Original High-Resolution Design Asset'}
              </span>
              <a
                href={previewImage.images[previewImage.index]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#5B172E] bg-[#FAF5EE] border border-[#DECDB8] hover:bg-[#FAF8F5] transition-colors"
              >
                Open in Full Tab
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
