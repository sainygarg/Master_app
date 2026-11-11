import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Scissors, ClipboardCheck } from 'lucide-react';

export default function SidebarSystemSwitcher({ collapsed = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isChecklist = location.pathname.startsWith('/checklist') || location.pathname.startsWith('/checklist');
  const activeSystem = isChecklist ? 'checklist-delegation' : 'order-to-delivery';

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-2.5 border-b border-[#E8DFD3] w-full">
        <button
          type="button"
          onClick={() => {
            if (activeSystem === 'order-to-delivery') {
              navigate('/checklist/admin');
            } else {
              navigate('/order-to-delivery');
            }
          }}
          title={`Active: ${activeSystem === 'order-to-delivery' ? 'Order to Delivery' : 'Checklist & Delegation'}. Click to switch.`}
          className="w-11 h-11 rounded-xl bg-white hover:bg-[#5B172E] text-stone-700 hover:text-white transition-all shadow-xs flex items-center justify-center group relative border border-[#DECDB8]"
        >
          {activeSystem === 'order-to-delivery' ? (
            <Scissors className="w-5 h-5 text-[#5B172E] group-hover:text-white transition-colors" />
          ) : (
            <ClipboardCheck className="w-5 h-5 text-[#5B172E] group-hover:text-white transition-colors" />
          )}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>
        <span className="text-[9px] font-bold text-stone-500 mt-1 uppercase tracking-tighter">
          {activeSystem === 'order-to-delivery' ? 'Orders' : 'Tasks'}
        </span>
      </div>
    );
  }

  return (
    <div className="px-3.5 pt-2 pb-3 border-b border-[#E8DFD3] bg-white/60">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 font-sans">
          SYSTEM SWITCHER
        </span>
        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      </div>

      {/* 2-Segment Toggle Pill */}
      <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl gap-1 border border-stone-200">
        <button
          type="button"
          onClick={() => {
            if (activeSystem !== 'order-to-delivery') {
              navigate('/order-to-delivery');
            }
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
            activeSystem === 'order-to-delivery'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span className="truncate">Order Flow</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeSystem !== 'checklist-delegation') {
              navigate('/checklist/admin');
            }
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
            activeSystem === 'checklist-delegation'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span className="truncate">Checklist</span>
        </button>
      </div>
    </div>
  );
}

