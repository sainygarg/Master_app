import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Scissors, 
  Database, 
  Sparkles, 
  PackageCheck, 
  UserCheck, 
  CheckSquare, 
  ClipboardList, 
  ShieldCheck, 
  CheckCircle2, 
  PanelLeftClose, 
  PanelLeftOpen, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CalendarCheck, 
  BookmarkCheck, 
  Settings, 
  Zap, 
  Bell, 
  Video, 
  ClipboardCheck,
  BadgeCheck,
  Shirt,
  Ruler,
  Package,
  Truck
} from 'lucide-react';
import { useUnifiedAuth } from '../auth/UnifiedAuthContext';
import { canUserAccessChecklistPage } from '../../Systems/order-to-delivery/utils/userStorage';
import { STAGES } from '../../Systems/order-to-delivery/types/stages';
import { fetchOrders } from '../../Systems/order-to-delivery/utils/storage';
import { useChecklistDelegationPendingCounts } from '../../Systems/checklist-delegation/hooks/usePendingCounts';

// Mark Master System as active so embedded layouts (AdminLayout, UserLayout, OrderToDeliveryApp)
// know to defer sidebar and header rendering to this persistent shell.

const STAGE_ICONS = {
  material_check: PackageCheck,
  embroidery_marking_cutting: Scissors,
  embroidery_sample_approval: BadgeCheck,
  full_embroidery: Sparkles,
  final_cutting_karigar_allotment: UserCheck,
  stitching_completed: Shirt,
  first_qc_alterations_cleared: Ruler,
  finishing_final_qc_passed: ShieldCheck,
  trial_packing_pickup: Package,
  final_trial_delivered_return: Truck,
};

if (typeof window !== 'undefined') {
  window.__IS_MASTER_SYSTEM__ = true;
}

export default function MasterShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUnifiedAuth();
  const pendingCounts = useChecklistDelegationPendingCounts();

  // Desktop sidebar collapsed state (persisted)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 1. Order Flow Main Dropdown state
  const [orderFlowOpen, setOrderFlowOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const p = window.location.pathname;
    return p.startsWith('/order-to-delivery') || p === '/';
  });

  // 2. Checklist Main Dropdown state
  const [checklistOpen, setChecklistOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const p = window.location.pathname;
    return p.startsWith('/dashboard') || p.startsWith('/checklist');
  });

  // Holiday submenu toggle state
  const [holidayOpen, setHolidayOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const p = window.location.pathname;
    return p.includes('holiday') || p.includes('working-day');
  });

  // URL View & Stage parameters
  const currentViewParam = new URLSearchParams(location.search).get('view') || (location.pathname.startsWith('/order-to-delivery') ? 'orders' : '');
  const currentStageParam = new URLSearchParams(location.search).get('stage');

  // System detection
  const isOrderFlow = location.pathname.startsWith('/order-to-delivery') || location.pathname === '/';
  const isChecklist = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/checklist');

  // Active helpers
  const isOrderFlowActive = isOrderFlow && currentViewParam !== 'settings';
  const isChecklistActive = isChecklist;
  const isMasterSettingActive = isOrderFlow && currentViewParam === 'settings';

  // Keep dropdown open for the active module on mount or manual route changes, but do not force-close the other module
  useEffect(() => {
    if (isOrderFlow && currentViewParam !== 'settings') {
      setOrderFlowOpen(true);
    } else if (isChecklist) {
      setChecklistOpen(true);
      if (location.pathname.includes('holiday') || location.pathname.includes('working-day')) {
        setHolidayOpen(true);
      }
    }
  }, [isOrderFlow, isChecklist, currentViewParam, location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar-collapsed', next ? 'true' : 'false');
      } catch {}
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, location.search]);

  // Read orders for dynamic badge counts
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    let cancelled = false;
    fetchOrders()
      .then((o) => { if (!cancelled) setOrders(o); })
      .catch(() => { if (!cancelled) setOrders([]); });
    return () => { cancelled = true; };
  }, [location.pathname, location.search]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => (o.currentStageIndex ?? 0) < 9).length;
  }, [orders]);

  // User display metadata & permissions
  const username = user?.name || localStorage.getItem('user-name') || localStorage.getItem('user_name') || 'Admin';
  const role = (user?.role || localStorage.getItem('role') || 'Admin').toUpperCase();

  // Total pending items for Checklist badge
  const totalChecklistPending = (pendingCounts.taskPending || 0) + (pendingCounts.delegationPending || 0) + (pendingCounts.adminApprovalPending || 0);

  // Exact Checklist Subpages matching user-uploaded screenshot
  const checklistSubpages = useMemo(() => {
    const all = [
      { label: 'Dashboard', href: '/dashboard/admin', icon: Database },
      { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { label: 'Quick Task', href: '/dashboard/quick-task', icon: Zap },
      { label: 'Assign Task', href: '/dashboard/assign-task', icon: CheckSquare },
      { 
        label: 'Delegation', 
        href: '/dashboard/delegation', 
        icon: ClipboardList,
        badge: pendingCounts.delegationPending > 0 ? pendingCounts.delegationPending : null,
      },
      { 
        label: 'Task', 
        href: '/dashboard/task', 
        icon: CalendarCheck,
        badge: pendingCounts.taskPending > 0 ? pendingCounts.taskPending : null,
      },
      { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarIcon },
      { 
        label: 'Holiday', 
        icon: CalendarIcon,
        isSubmenu: true,
        subItems: [
          { label: 'Holiday List', href: '/dashboard/holiday-list', icon: BookmarkCheck },
          { label: 'Working Day Calendar', href: '/dashboard/working-day-calendar', icon: CalendarCheck }
        ]
      },
      { 
        label: 'Admin Approval', 
        href: '/dashboard/admin-approval', 
        icon: BookmarkCheck,
        badge: pendingCounts.adminApprovalPending > 0 ? pendingCounts.adminApprovalPending : null,
      },
      { label: 'Training Video', href: '/dashboard/training-video', icon: Video },
    ];
    // Hide pages this user has not been granted in Master Hub > Users & RBAC
    return all
      .map((item) =>
        item.subItems
          ? { ...item, subItems: item.subItems.filter((s) => canUserAccessChecklistPage(user, s.href)) }
          : item
      )
      .filter((item) =>
        item.subItems ? item.subItems.length > 0 : canUserAccessChecklistPage(user, item.href)
      );
  }, [pendingCounts, user]);

  // Current page title computation for header breadcrumb
  const pageTitle = useMemo(() => {
    if (isOrderFlow) {
      if (currentViewParam === 'dashboard') return 'Dashboard';
      if (currentViewParam === 'stages') {
        const stage = STAGES.find((s) => s.id === currentStageParam);
        return stage ? stage.name : 'Production Stages';
      }
      if (currentViewParam === 'settings') return 'Settings';
      return 'All Orders';
    }

    const path = location.pathname;
    if (path.includes('assign-task')) return 'Assign Task';
    if (path.includes('quick-task')) return 'Quick Task';
    if (path.includes('delegation')) return 'Delegation';
    if (path.includes('holiday-list')) return 'Holiday List';
    if (path.includes('working-day-calendar')) return 'Working Day Calendar';
    if (path.includes('calendar')) return 'Calendar';
    if (path.includes('admin-approval')) return 'Admin Approval';
    if (path.includes('setting')) return 'Settings';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('training-video')) return 'Training Video';
    if (path.includes('task')) return 'Task';
    return 'Dashboard';
  }, [isOrderFlow, currentViewParam, currentStageParam, location.pathname]);

  // If not authenticated, render plain shell
  if (!isAuthenticated && !localStorage.getItem('sainy_couture_auth_user_v3') && !localStorage.getItem('user-name')) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[#FAF6F0] text-stone-800 antialiased selection:bg-[#5B172E] selection:text-white">
        {children}
      </div>
    );
  }

  // Navigation handler
  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#FAF6F0] text-stone-800 antialiased selection:bg-[#5B172E] selection:text-white">
      
      {/* =========================================================================
          1. PERSISTENT DESKTOP SIDEBAR (3 MAIN PAGES: ORDER FLOW, CHECKLIST, MASTER SETTING)
      ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 bg-[#FAF6F0] border-r border-[#E8DFD3] select-none transition-all duration-300 ${
          isCollapsed ? 'w-[72px]' : 'w-72'
        }`}
      >
        {/* Top: Brand Monogram Header */}
        <div className="flex flex-col shrink-0">
          <div className={`flex items-center border-b border-[#E8DFD3] bg-[#FAF6F0] ${
            isCollapsed ? 'h-16 justify-center px-2' : 'h-16 justify-between px-4'
          }`}>
            <button
              onClick={() => { handleNavigate('/order-to-delivery?view=dashboard'); setOrderFlowOpen(true); setChecklistOpen(false); }}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
              title="Sainy Couture Atelier"
            >
              <div className="w-10 h-10 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-sm border-2 border-[#C5A059]/40 shadow-xs shrink-0 hover:scale-105 transition-transform">
                SG
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-serif font-bold text-base text-[#431021] leading-tight truncate uppercase tracking-wider">
                    Sainy Couture
                  </span>
                  <span className="text-[10px] text-[#9B783E] uppercase font-bold tracking-widest leading-none mt-0.5">
                    Atelier & Task Suite
                  </span>
                </div>
              )}
            </button>

            {!isCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-stone-400 hover:text-[#5B172E] hover:bg-[#F3ECE2] transition-colors"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Scrollable Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-2 [scrollbar-width:thin]">
          {isCollapsed ? (
            /* Icon-Only Rail Mode (Exactly 3 Main Icons) */
            <div className="flex flex-col items-center space-y-2.5">
              <button
                onClick={toggleSidebar}
                className="p-2 text-stone-400 hover:text-[#5B172E] hover:bg-white rounded-xl transition-colors mb-1"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>

              {/* 2. Checklist Icon */}
              <button
                onClick={() => { handleNavigate('/dashboard/admin'); setChecklistOpen(true); setOrderFlowOpen(false); }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
                  isChecklistActive ? 'bg-[#5B172E] text-white shadow-xs' : 'text-stone-600 hover:bg-white hover:text-[#5B172E]'
                }`}
                title="Checklist & Delegation"
              >
                <ClipboardCheck className="w-5 h-5" />
                {totalChecklistPending > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E11D48] text-white">
                    {totalChecklistPending}
                  </span>
                )}
              </button>

              {/* 1. Order Flow Icon */}
              <button
                onClick={() => handleNavigate('/order-to-delivery?view=dashboard')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
                  isOrderFlowActive ? 'bg-[#5B172E] text-white shadow-xs' : 'text-stone-600 hover:bg-white hover:text-[#5B172E]'
                }`}
                title="Order to Delivery"
              >
                <Scissors className="w-5 h-5" />
                {orders.length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E11D48] text-white">
                    {orders.length}
                  </span>
                )}
              </button>

              {/* 3. Master Setting Icon */}
              <button
                onClick={() => { handleNavigate('/order-to-delivery?view=settings'); setOrderFlowOpen(false); setChecklistOpen(false); }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
                  isMasterSettingActive ? 'bg-[#5B172E] text-white shadow-xs' : 'text-stone-600 hover:bg-white hover:text-[#5B172E]'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Full Expanded Navigation: Exactly 3 Main Sections */
            <div className="space-y-3">
              
              {/* =========================================================================
                  PAGE 1: CHECKLIST & DELEGATION (MAIN DROPDOWN - EXACT TO SCREENSHOT)
              ========================================================================= */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setChecklistOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left select-none cursor-pointer ${
                    isChecklistActive
                      ? 'bg-[#F3ECE2] text-[#5B172E] font-bold border border-[#DECDB8] shadow-2xs'
                      : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg ${isChecklistActive ? 'bg-[#5B172E] text-white shadow-2xs' : 'bg-white text-[#9B783E] border border-[#E8DFD3]'}`}>
                      <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span className="truncate font-semibold tracking-tight">Checklist & Delegation</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {totalChecklistPending > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white bg-[#E11D48]">
                        {totalChecklistPending}
                      </span>
                    )}
                    <span className={`p-1 rounded-md transition-colors ${checklistOpen ? 'bg-black/5 text-stone-800' : 'text-stone-400'}`}>
                      {checklistOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>

                {/* Checklist Subpages Dropdown */}
                {checklistOpen && (
                  <div className="mt-1.5 ml-3 pl-2.5 border-l-2 border-[#DECDB8] space-y-1 py-0.5">
                    {checklistSubpages.map((sub) => {
                      const SubIcon = sub.icon;

                      // Expandable Holiday Submenu
                      if (sub.isSubmenu) {
                        const isAnyChildActive = sub.subItems.some((item) => location.pathname === item.href);
                        return (
                          <div key={sub.label} className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => setHolidayOpen(!holidayOpen)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group ${
                                isAnyChildActive
                                  ? 'bg-[#F3ECE2] text-[#5B172E] font-bold'
                                  : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                                <div className="p-1 rounded-md bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]">
                                  {SubIcon && <SubIcon className="w-3 h-3 shrink-0" />}
                                </div>
                                <span className="truncate text-[11px] font-medium">{sub.label}</span>
                              </div>
                              <span className="text-stone-400">
                                {holidayOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </span>
                            </button>

                            {holidayOpen && (
                              <div className="mt-1 ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-0.5">
                                {sub.subItems.map((item) => {
                                  const isChildActive = location.pathname === item.href;
                                  const ItemIcon = item.icon;
                                  return (
                                    <button
                                      key={item.href}
                                      type="button"
                                      onClick={() => handleNavigate(item.href)}
                                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer ${
                                        isChildActive
                                          ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 pr-1">
                                        {ItemIcon && (
                                          <ItemIcon className={`w-3 h-3 shrink-0 ${isChildActive ? 'text-white' : 'text-stone-400'}`} />
                                        )}
                                        <span className="truncate text-[10px]">{item.label}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Regular Checklist Item
                      const isSubActive = location.pathname === sub.href;
                      return (
                        <button
                          key={sub.href}
                          type="button"
                          onClick={() => handleNavigate(sub.href)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group ${
                            isSubActive
                              ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                              : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1">
                            <div className={`p-1 rounded-md transition-colors ${isSubActive ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]'}`}>
                              {SubIcon && (
                                <SubIcon className="w-3 h-3 shrink-0" />
                              )}
                            </div>
                            <span className="truncate text-[11px] font-medium">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              isSubActive ? 'bg-white/20 text-white' : 'bg-[#E11D48] text-white'
                            }`}>
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* =========================================================================
                  PAGE 2: ORDER FLOW (MAIN DROPDOWN WITH ALL 12 PEER SUBPAGES)
              ========================================================================= */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setOrderFlowOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left select-none cursor-pointer ${
                    isOrderFlowActive
                      ? 'bg-[#F3ECE2] text-[#5B172E] font-bold border border-[#DECDB8] shadow-2xs'
                      : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg ${isOrderFlowActive ? 'bg-[#5B172E] text-white shadow-2xs' : 'bg-white text-[#9B783E] border border-[#E8DFD3]'}`}>
                      <Scissors className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span className="truncate font-semibold tracking-tight">Order to Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {orders.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                        {orders.length}
                      </span>
                    )}
                    <span className={`p-1 rounded-md transition-colors ${orderFlowOpen ? 'bg-black/5 text-stone-800' : 'text-stone-400'}`}>
                      {orderFlowOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>

                {/* Order Flow Subpages: Dashboard, All Orders, and 10 Stages */}
                {orderFlowOpen && (
                  <div className="mt-1.5 ml-3 pl-2.5 border-l-2 border-[#DECDB8] space-y-1 py-0.5">
                    
                    {/* 1. Dashboard */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/order-to-delivery?view=dashboard')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group ${
                        isOrderFlow && currentViewParam === 'dashboard'
                          ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className={`p-1 rounded-md transition-colors ${isOrderFlow && currentViewParam === 'dashboard' ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]'}`}>
                          <LayoutDashboard className="w-3 h-3 shrink-0" />
                        </div>
                        <span className="truncate text-[11px] font-medium">Dashboard</span>
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                          isOrderFlow && currentViewParam === 'dashboard' ? 'bg-[#C5A059] text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                        }`}>
                          {activeOrdersCount}
                        </span>
                      )}
                    </button>

                    {/* 2. All Orders */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/order-to-delivery?view=orders')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group ${
                        isOrderFlow && (currentViewParam === 'orders' || (!currentViewParam && location.pathname.startsWith('/order-to-delivery')))
                          ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                          : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className={`p-1 rounded-md transition-colors ${isOrderFlow && (currentViewParam === 'orders' || !currentViewParam) ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]'}`}>
                          <ShoppingBag className="w-3 h-3 shrink-0" />
                        </div>
                        <span className="truncate text-[11px] font-medium">All Orders</span>
                      </div>
                      {orders.length > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                          isOrderFlow && (currentViewParam === 'orders' || !currentViewParam) ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                        }`}>
                          {orders.length}
                        </span>
                      )}
                    </button>

                    {/* 3 to 12. The 10 Stages */}
                    {STAGES.map((stage) => {
                      const stageOrders = orders.filter((o) => o.currentStageId === stage.id);
                      const isStageActive = isOrderFlow && currentViewParam === 'stages' && currentStageParam === stage.id;
                      const StageIcon = STAGE_ICONS[stage.id] || Sparkles;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => handleNavigate(`/order-to-delivery?view=stages&stage=${stage.id}`)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer group ${
                            isStageActive
                              ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                              : 'text-stone-600 hover:bg-[#F3ECE2] hover:text-[#5B172E]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1">
                            <div className={`p-1 rounded-md transition-colors ${isStageActive ? 'bg-white/20 text-white' : 'bg-[#FAF5EE] text-stone-500 group-hover:text-[#5B172E]'}`}>
                              <StageIcon className="w-3 h-3 shrink-0" />
                            </div>
                            <span className="truncate text-[11px] font-medium">{stage.name}</span>
                          </div>
                          {stageOrders.length > 0 && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              isStageActive ? 'bg-[#C5A059] text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                            }`}>
                              {stageOrders.length}
                            </span>
                          )}
                        </button>
                      );
                    })}

                  </div>
                )}
              </div>

              {/* =========================================================================
                  PAGE 3: MASTER SETTING (MAIN PAGE)
              ========================================================================= */}
              <button
                type="button"
                onClick={() => handleNavigate('/order-to-delivery?view=settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer select-none ${
                  isMasterSettingActive
                    ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:bg-[#F3ECE2] hover:text-[#5B172E] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg ${isMasterSettingActive ? 'bg-white/20 text-white shadow-2xs' : 'bg-white text-[#9B783E] border border-[#E8DFD3]'}`}>
                    <Settings className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate font-semibold tracking-tight">Settings</span>
                </div>
              </button>

            </div>
          )}
        </nav>

        {/* Bottom: User Profile Card & Sign Out */}
        <div className="border-t border-[#E8DFD3] bg-[#FAF6F0] p-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-xs border-2 border-[#C5A059]/40 shadow-xs shrink-0">
                {username ? username.substring(0, 2).toUpperCase() : 'SG'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[#431021] truncate font-serif leading-tight">
                    {username}
                  </div>
                  <div className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {role}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                logout();
                localStorage.clear();
                window.location.href = '/order-to-delivery';
              }}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. PERSISTENT MOBILE DRAWER (SAME HIERARCHY AS DESKTOP)
      ========================================================================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#FAF6F0] border-r border-[#E8DFD3] shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200 z-50">
            <div className="flex h-16 items-center justify-between border-b border-[#E8DFD3] px-4 bg-[#FAF6F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-sm border-2 border-[#C5A059]/40 shadow-xs">
                  SG
                </div>
                <div>
                  <h2 className="font-serif font-bold text-sm text-[#431021] leading-tight">Sainy Couture</h2>
                  <p className="text-[10px] text-[#9B783E] uppercase font-bold tracking-widest">Master Navigation</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-[#5B172E] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              
              {/* 2. Checklist & Delegation in Mobile */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setChecklistOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isChecklistActive ? 'bg-[#F3ECE2] text-[#5B172E]' : 'text-stone-700 hover:bg-[#F3ECE2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className="w-4 h-4 text-[#C5A059]" />
                    <span>Checklist & Delegation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {totalChecklistPending > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold text-white bg-[#E11D48]">
                        {totalChecklistPending}
                      </span>
                    )}
                    <span className="p-0.5 rounded text-stone-500">
                      {checklistOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>

                {checklistOpen && (
                  <div className="mt-1 ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-0.5">
                    {checklistSubpages.map((sub) => {
                      const SubIcon = sub.icon;
                      if (sub.isSubmenu) {
                        return (
                          <div key={sub.label} className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => setHolidayOpen(!holidayOpen)}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-stone-600 hover:bg-[#F3ECE2]"
                            >
                              <div className="flex items-center gap-2">
                                {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
                                <span>{sub.label}</span>
                              </div>
                              {holidayOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                            {holidayOpen && (
                              <div className="ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-0.5">
                                {sub.subItems.map((item) => (
                                  <button
                                    key={item.href}
                                    type="button"
                                    onClick={() => handleNavigate(item.href)}
                                    className={`w-full px-2 py-1 text-left text-[11px] rounded ${
                                      location.pathname === item.href ? 'bg-[#5B172E] text-white font-bold' : 'text-stone-600'
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const isSubActive = location.pathname === sub.href;
                      return (
                        <button
                          key={sub.href}
                          type="button"
                          onClick={() => handleNavigate(sub.href)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                            isSubActive ? 'bg-[#5B172E] text-white font-bold' : 'text-stone-600 hover:bg-[#F3ECE2]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            {SubIcon && (
                              <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-stone-400'}`} />
                            )}
                            <span className="truncate text-[11px]">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#E11D48] text-white">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 1. Order Flow in Mobile */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setOrderFlowOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isOrderFlowActive ? 'bg-[#F3ECE2] text-[#5B172E]' : 'text-stone-700 hover:bg-[#F3ECE2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-[#C5A059]" />
                    <span>Order to Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {orders.length > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[#FAF5EE] text-[#5B172E]">
                        {orders.length}
                      </span>
                    )}
                    <span className="p-0.5 rounded text-stone-500">
                      {orderFlowOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </button>

                {orderFlowOpen && (
                  <div className="mt-1 ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-0.5">
                    {/* 1. Dashboard */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/order-to-delivery?view=dashboard')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        isOrderFlow && currentViewParam === 'dashboard' ? 'bg-[#5B172E] text-white font-bold' : 'text-stone-600 hover:bg-[#F3ECE2]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#C5A059] text-white">
                          {activeOrdersCount}
                        </span>
                      )}
                    </button>

                    {/* 2. All Orders */}
                    <button
                      type="button"
                      onClick={() => handleNavigate('/order-to-delivery?view=orders')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        isOrderFlow && (currentViewParam === 'orders' || !currentViewParam) ? 'bg-[#5B172E] text-white font-bold' : 'text-stone-600 hover:bg-[#F3ECE2]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>All Orders</span>
                      </div>
                      {orders.length > 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-white/20 text-white">
                          {orders.length}
                        </span>
                      )}
                    </button>

                    {/* 3 to 12. The 10 Stages (Same hierarchy) */}
                    {STAGES.map((stage, idx) => {
                      const stageOrders = orders.filter((o) => o.currentStageId === stage.id);
                      const isStageActive = isOrderFlow && currentViewParam === 'stages' && currentStageParam === stage.id;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => handleNavigate(`/order-to-delivery?view=stages&stage=${stage.id}`)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                            isStageActive ? 'bg-[#5B172E] text-white font-bold' : 'text-stone-600 hover:bg-[#F3ECE2]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            {(() => {
                              const StageIcon = STAGE_ICONS[stage.id] || Sparkles;
                              return (
                                <StageIcon className={`w-3.5 h-3.5 shrink-0 ${
                                  isStageActive ? 'text-[#C5A059]' : 'text-stone-400'
                                }`} />
                              );
                            })()}
                            <span className="truncate text-[11px]">{stage.name}</span>
                          </div>
                          {stageOrders.length > 0 && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              isStageActive ? 'bg-[#C5A059] text-white' : 'bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]'
                            }`}>
                              {stageOrders.length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Master Setting in Mobile */}
              <button
                type="button"
                onClick={() => handleNavigate('/order-to-delivery?view=settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isMasterSettingActive ? 'bg-[#5B172E] text-white shadow-xs' : 'text-stone-700 hover:bg-[#F3ECE2]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#C5A059]" />
                  <span>Settings</span>
                </div>
              </button>

            </div>

            {/* Mobile Footer */}
            <div className="border-t border-[#E8DFD3] p-4 bg-[#FAF6F0] flex items-center justify-between">
              <span className="text-xs font-bold text-[#431021]">{username}</span>
              <button
                onClick={() => {
                  logout();
                  localStorage.clear();
                  window.location.href = '/order-to-delivery';
                }}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. MAIN CONTENT VIEWPORT (WITH PERSISTENT HEADER)
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* PERSISTENT HEADER (NEVER UNMOUNTS DURING NAVIGATION) */}
        <header className="h-16 border-b border-[#E8DFD3] bg-[#FAF6F0] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
          
          {/* Left: Mobile Trigger + Desktop Collapse + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-[#5B172E] hover:bg-white transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-xl text-stone-400 hover:text-[#5B172E] hover:bg-white transition-colors border border-transparent hover:border-[#E8DFD3] cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-xs border border-[#C5A059]/40 shadow-xs shrink-0">
                SG
              </div>
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span className="font-serif font-bold text-sm sm:text-base text-[#431021] truncate">
                  Sainy Couture
                </span>
                <span className="text-stone-300">/</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8] shrink-0">
                  {isMasterSettingActive ? 'Settings' : isOrderFlow ? 'Order to Delivery' : 'Checklist'}
                </span>
                <span className="text-stone-300 hidden xs:inline">/</span>
                <span className="text-xs font-semibold text-stone-600 truncate hidden xs:inline">
                  {pageTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Right: User Profile + Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User Greeting */}
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                Welcome
              </span>
              <span className="text-xs font-serif font-bold text-[#431021] leading-tight mt-0.5">
                {username}
              </span>
            </div>

            {/* User Avatar Circle */}
            <div
              className="w-9 h-9 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-xs border-2 border-[#C5A059]/40 shadow-xs cursor-pointer hover:scale-105 transition-transform"
              title={`${username} (${role})`}
            >
              {username ? username.substring(0, 2).toUpperCase() : 'SG'}
            </div>

            {/* Logout Action Button */}
            <button
              onClick={() => {
                logout();
                localStorage.clear();
                window.location.href = '/order-to-delivery';
              }}
              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT (STABLE SCROLLBAR GUTTER TO PREVENT ANY JUMPING) */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-[#FAF6F0]"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
