import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  PackageCheck,
  Scissors,
  Sparkles,
  UserCheck,
  CheckSquare,
  ClipboardCheck,
  ShieldCheck,
  BadgeCheck,
  Shirt,
  Ruler,
  Package,
  Truck,
  CheckCircle2,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Database
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { canUserAccessPage, canUserAccessStage } from '../utils/userStorage';
import { SystemNavGroup, OtherSystemGroup } from '../../../core/layout/SystemNavGroup';

const stageIcons = {
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

export const Sidebar = ({
  currentView,
  setCurrentView,
  selectedStageId,
  setSelectedStageId,
  orders = [],
  currentUser,
  isSidebarHidden,
  onToggleSidebar,
  onLogout
}) => {
  const [stagesOpen, setStagesOpen] = React.useState(currentView === 'stages');
  const activeOrdersCount = orders.filter(o => o.currentStageIndex < 9).length;

  const handleStageClick = (stageId) => {
    setSelectedStageId(stageId);
    setCurrentView('stages');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggleSidebar();
    }
  };

  const handleViewClick = (view) => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggleSidebar();
    }
  };

  const canAccessDashboard = canUserAccessPage(currentUser, 'dashboard');
  const canAccessOrders = canUserAccessPage(currentUser, 'orders');
  const canAccessSettings = canUserAccessPage(currentUser, 'settings');

  // Filter only permitted stages
  const permittedStages = STAGES.filter(stage => canUserAccessStage(currentUser, stage.id));

  // =========================================================================
  // MINI ICON-ONLY RAIL SIDEBAR (WHEN SIDEBAR IS HIDDEN/COLLAPSED - EXACT TO IMAGE 3)
  // =========================================================================
  if (isSidebarHidden) {
    return (
      <aside className="fixed top-0 bottom-0 left-0 z-40 w-[72px] bg-[#FAF6F0] border-r border-[#E8DFD3] hidden sm:flex flex-col justify-between py-3 shadow-sm select-none">

        {/* Top: Emblem & Expand Trigger */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs border-2 border-[#C5A059]/40 hover:scale-105 transition-transform"
            title="Click to Expand Sidebar"
          >
            SG
          </button>

          <button
            onClick={onToggleSidebar}
            className="p-2 text-stone-400 hover:text-[#5B172E] hover:bg-white rounded-xl transition-colors"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>


        {/* Center: Icon-Only Navigation with Live Badges */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center space-y-2.5 scrollbar-none">

          {/* Dashboard Icon */}
          {canAccessDashboard && (
            <div className="relative group">
              <button
                onClick={() => handleViewClick('dashboard')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${currentView === 'dashboard'
                    ? 'bg-[#5B172E] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-white hover:text-[#5B172E]'
                  }`}
                title="Dashboard (Production Tracking)"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E11D48] text-white ring-2 ring-[#FAF6F0]">
                  {activeOrdersCount}
                </span>
              )}
            </div>
          )}

          {/* Orders Icon */}
          {canAccessOrders && (
            <div className="relative group">
              <button
                onClick={() => handleViewClick('orders')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${currentView === 'orders'
                    ? 'bg-[#5B172E] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-white hover:text-[#5B172E]'
                  }`}
                title="Orders (All Stages)"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              {orders.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E11D48] text-white ring-2 ring-[#FAF6F0]">
                  {orders.length}
                </span>
              )}
            </div>
          )}

          <div className="w-8 border-b border-[#E8DFD3] my-1" />

          {/* Permitted Stages Icons */}
          {permittedStages.map((stage) => {
            const originalIndex = STAGES.findIndex(s => s.id === stage.id) + 1;
            const stageOrders = orders.filter(o => o.currentStageId === stage.id);
            const count = stageOrders.length;
            const isSelected = currentView === 'stages' && selectedStageId === stage.id;
            const Icon = stageIcons[stage.id] || Sparkles;
  
            return (
              <div key={stage.id} className="relative group">
                <button
                  onClick={() => handleStageClick(stage.id)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isSelected
                      ? 'bg-[#5B172E] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-white hover:text-[#5B172E]'
                    }`}
                  title={`Stage ${originalIndex}: ${stage.name}`}
                >
                  <Icon className="w-5 h-5" />
                </button>

                {count > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#9B783E] text-white ring-2 ring-[#FAF6F0]">
                    {count}
                  </span>
                )}
              </div>
            );
          })}

          <div className="w-8 border-b border-[#E8DFD3] my-1" />

          {/* Master Icon */}
          {canAccessSettings && (
            <button
              onClick={() => handleViewClick('settings')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${currentView === 'settings'
                  ? 'bg-[#5B172E] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-white hover:text-[#5B172E]'
                }`}
              title="Master Hub"
            >
              <Database className="w-5 h-5" />
            </button>
          )}

        </div>

        {/* Bottom: User Avatar Monogram + Logout */}
        <div className="flex flex-col items-center space-y-2 pt-2 border-t border-[#E8DFD3]">
          <div
            className={`w-9 h-9 rounded-full ${currentUser?.avatarColor || 'bg-[#5B172E]'} text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer`}
            title={`Logged in: ${currentUser?.name} (${currentUser?.role})`}
          >
            {currentUser?.name?.substring(0, 1).toUpperCase() || 'U'}
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>
    );
  }

  // =========================================================================
  // FULL EXPANDED SIDEBAR (CLEAN, NO "PRODUCTION SECTION" WRAPPER)
  // =========================================================================
  return (
    <>
      {/* Mobile Backdrop Overlay (Click outside to dismiss) */}
      <div
        onClick={onToggleSidebar}
        className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-2xs transition-opacity"
        aria-hidden="true"
      />

      <aside className="fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#FAF6F0] border-r border-[#E8DFD3] flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xl lg:shadow-none select-none">

        {/* Top Header & Navigation */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Brand Header */}
          <div className="p-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between shrink-0">
            <div
              onClick={() => {
                if (canAccessDashboard) handleViewClick('dashboard');
                else if (canAccessOrders) handleViewClick('orders');
                else if (permittedStages.length > 0) handleStageClick(permittedStages[0].id);
              }}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#5B172E] text-[#FAF6F0] flex items-center justify-center shadow-xs border-2 border-[#C5A059]/40 shrink-0">
                <span className="font-serif font-bold text-base tracking-wider">SG</span>
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold tracking-wider text-[#431021] uppercase leading-none">
                  Sainy Garg
                </h1>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#9B783E]">
                  Couture Atelier
                </span>
              </div>
            </div>

            {/* Collapse Sidebar Button */}
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation: Order Flow + Checklist dropdown pages */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <SystemNavGroup systemId="order-to-delivery" defaultOpen active>
              <div className="space-y-1.5">
                {/* Dashboard */}
                {canAccessDashboard && (
                  <button
                    onClick={() => handleViewClick('dashboard')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'dashboard'
                        ? 'bg-[#5B172E] text-white shadow-xs font-bold'
                        : 'text-stone-700 hover:bg-white hover:text-[#5B172E]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-[#9B783E]" />
                      <span>Dashboard</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentView === 'dashboard' ? 'bg-white/20 text-white' : 'bg-[#EAE2D5] text-stone-700'
                      }`}>
                      {activeOrdersCount}
                    </span>
                  </button>
                )}

                {/* Orders */}
                {canAccessOrders && (
                  <button
                    onClick={() => handleViewClick('orders')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${currentView === 'orders'
                        ? 'bg-[#5B172E] text-white border-[#5B172E] shadow-xs font-bold'
                        : 'bg-white text-stone-800 border-[#DECDB8] hover:border-[#9B783E]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-[#9B783E]" />
                      <span className="font-bold">Orders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentView === 'orders' ? 'bg-white/20 text-white' : 'bg-[#FAF2E6] text-[#5B172E]'
                        }`}>
                        {orders.length}
                      </span>
                      <span
                        role="button"
                        aria-label="Toggle order stages"
                        onClick={(e) => { e.stopPropagation(); setStagesOpen((o) => !o); }}
                        className="p-0.5 rounded hover:bg-black/10"
                      >
                        {stagesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                    </div>
                  </button>
                )}

                {/* 10 production stages as subpages of Orders */}
                {stagesOpen && (
                  <div className="ml-3 pl-2 border-l-2 border-[#E8DFD3] space-y-1">
                    {permittedStages.map((stage) => {
                      const originalIndex = STAGES.findIndex(s => s.id === stage.id) + 1;
                      const stageOrders = orders.filter(o => o.currentStageId === stage.id);
                      const count = stageOrders.length;
                      const isSelected = currentView === 'stages' && selectedStageId === stage.id;
                      const Icon = stageIcons[stage.id] || Sparkles;

                      return (
                        <button
                          key={stage.id}
                          onClick={() => handleStageClick(stage.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all text-left group ${isSelected
                              ? 'bg-[#5B172E] text-white font-bold shadow-xs'
                              : 'text-stone-700 hover:bg-white hover:text-[#5B172E]'
                            }`}
                          title={stage.name}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C5A059]' : 'text-stone-400 group-hover:text-[#5B172E]'
                              }`} />
                            <span className="truncate text-[11px] leading-tight">
                              {stage.name}
                            </span>
                          </div>

                          {count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${isSelected ? 'bg-[#9B783E] text-white' : 'bg-[#5B172E] text-white'
                              }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </SystemNavGroup>

            <OtherSystemGroup systemId="checklist-delegation" />
          </div>
        </div>

        {/* Bottom: Setting Page + User Profile */}
        <div className="border-t border-[#E8DFD3] bg-white shrink-0">

          {/* Master */}
          {canAccessSettings && (
            <div className="p-2 border-b border-[#F0E6D8]">
              <button
                onClick={() => handleViewClick('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${currentView === 'settings'
                    ? 'bg-[#5B172E] text-white shadow-xs font-bold'
                    : 'text-stone-700 hover:bg-[#FAF8F5] hover:text-[#5B172E]'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-[#9B783E]" />
                  <span className="font-bold">Master</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${currentView === 'settings' ? 'bg-white/20 text-white' : 'bg-[#FAF2E6] text-stone-600'
                  }`}>
                  Hub
                </span>
              </button>
            </div>
          )}

          {/* User Profile */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-full ${currentUser?.avatarColor || 'bg-[#5B172E]'} text-white flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-2xs`}>
                {currentUser?.name?.substring(0, 2).toUpperCase() || 'SG'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-stone-900 truncate text-[11px]">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-[10px]">
                  <span className={`px-1.5 py-0.2 rounded font-bold ${currentUser?.role === 'Admin' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {currentUser?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>
    </>
  );
};
