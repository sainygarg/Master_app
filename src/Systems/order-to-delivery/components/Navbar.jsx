import React from 'react';
import { 
  Menu, 
  Search, 
  Shield, 
  PanelLeft, 
  PanelLeftClose, 
  LogOut,
  User
} from 'lucide-react';

export const Navbar = ({ 
  isSidebarHidden,
  onToggleSidebar, 
  orders = [], 
  searchQuery, 
  setSearchQuery,
  currentView,
  selectedStageName,
  currentUser,
  onLogout
}) => {
  const activeOrdersCount = orders.filter(o => o.currentStageIndex < 9).length;

  const getViewTitle = () => {
    if (currentView === 'stages') return selectedStageName;
    if (currentView === 'dashboard') return 'Dashboard';
    if (currentView === 'orders') return 'Orders';
    if (currentView === 'settings') return 'Master';
    return currentView;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8DFD3] shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Sidebar Hide / Unhide Toggle & Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-stone-600 hover:text-[#5B172E] hover:bg-[#FAF5EE] border border-[#E8DFD3] transition-all flex items-center gap-1.5"
            title={isSidebarHidden ? 'Show Sidebar' : 'Hide Sidebar'}
          >
            <PanelLeft className="w-4 h-4 text-[#9B783E]" />
            <span className="text-xs font-semibold hidden sm:inline">
              {isSidebarHidden ? 'Unhide Sidebar' : 'Hide Sidebar'}
            </span>
          </button>

          <div>
            <div className="flex items-center space-x-2 text-xs text-stone-500 font-medium">
              <span className="hidden sm:inline">Order To Delivery</span>
              <span className="hidden sm:inline">/</span>
              <span className="font-bold text-[#5B172E] capitalize truncate max-w-[150px] sm:max-w-none">
                {getViewTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-xs md:max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Client, Phone..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Active Stats, Logged in User Profile & Sign Out */}
        <div className="flex items-center space-x-3">
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3] text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[#8C827A]">Active Orders:</span>
            <strong className="text-[#431021] font-bold">{activeOrdersCount}</strong>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DECDB8]">
            <div className={`w-7 h-7 rounded-full ${currentUser?.avatarColor || 'bg-[#5B172E]'} text-white flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-2xs`}>
              {currentUser?.name?.substring(0, 2).toUpperCase() || 'SG'}
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 leading-none">
                {currentUser?.name || 'User'}
              </div>
              <div className="text-[10px] leading-none mt-1">
                <span className={`px-1 py-0.2 rounded font-bold ${
                  currentUser?.role === 'Admin' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentUser?.role || 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Sign Out CTA */}
          <button
            onClick={onLogout}
            className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-[#DECDB8] rounded-xl transition-colors"
            title="Sign Out / Switch Account"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Mobile Search Input */}
      <div className="sm:hidden px-4 pb-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Client, Phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
          />
        </div>
      </div>
    </header>
  );
};
