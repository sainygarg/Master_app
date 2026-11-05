import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { Scissors, ClipboardCheck, ChevronDown, ChevronRight } from 'lucide-react';
import systemRegistry from '../registry/systemRegistry';
import { STAGES } from '../../Systems/order-to-delivery/types/stages';

const SYSTEM_META = {
  'order-to-delivery': { label: 'Order Flow', Icon: Scissors, color: '#5B172E' },
  'checklist-delegation': { label: 'Checklist', Icon: ClipboardCheck, color: '#5B172E' },
};

/**
 * Collapsible sidebar page group (a "dropdown page") for one system.
 * Children are its subpages.
 */
export function SystemNavGroup({ systemId, defaultOpen = false, active = false, children }) {
  const { label, Icon, color } = SYSTEM_META[systemId];
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all border"
        style={
          active
            ? { backgroundColor: color, color: '#fff', borderColor: color }
            : { backgroundColor: '#fff', color: '#292524', borderColor: '#E7E5E4' }
        }
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="w-4 h-4" style={active ? undefined : { color }} />
          {label}
        </span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="mt-1.5 ml-2 pl-2 border-l-2 border-stone-200 space-y-1">{children}</div>}
    </div>
  );
}

function LinkRow({ icon, label, onClick, children }) {
  const [open, setOpen] = useState(false);
  const Icon = (icon && Lucide[icon]) || Lucide.Circle;
  return (
    <div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={onClick}
          className="flex-1 min-w-0 flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 text-left"
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </button>
        {children && (
          <button
            type="button"
            aria-label={`Toggle ${label} subpages`}
            onClick={() => setOpen((o) => !o)}
            className="p-1 rounded text-stone-500 hover:bg-stone-100"
          >
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {children && open && (
        <div className="ml-3 pl-2 border-l-2 border-stone-200 space-y-0.5">{children}</div>
      )}
    </div>
  );
}

/**
 * Dropdown for the system the user is NOT currently inside.
 * Each subpage navigates across systems.
 */
export function OtherSystemGroup({ systemId, onNavigate }) {
  const navigate = useNavigate();
  const go = (to) => {
    navigate(to);
    if (onNavigate) onNavigate();
  };

  let rows = [];
  if (systemId === 'order-to-delivery') {
    rows = [
      { label: 'Dashboard', icon: 'LayoutDashboard', to: '/order-to-delivery?view=dashboard' },
      {
        label: 'Orders',
        icon: 'ShoppingBag',
        to: '/order-to-delivery?view=orders',
        children: STAGES.map((s, i) => ({
          label: `${i + 1}. ${s.name}`,
          icon: 'Scissors',
          to: `/order-to-delivery?view=stages&stage=${s.id}`,
        })),
      },
      { label: 'Master', icon: 'Database', to: '/order-to-delivery?view=settings' },
    ];
  } else {
    const role = (localStorage.getItem('role') || 'user').toLowerCase();
    const items = systemRegistry.getSystem('checklist-delegation')?.menuItems || [];
    rows = items
      .filter((m) => !m.showFor || m.showFor.map((r) => r.toLowerCase()).includes(role))
      .map((m) => ({ label: m.label, icon: m.icon, to: m.href }));
  }

  return (
    <SystemNavGroup systemId={systemId}>
      {rows.map((r) => (
        <LinkRow key={r.label} icon={r.icon} label={r.label} onClick={() => go(r.to)}>
          {r.children &&
            r.children.map((c) => (
              <LinkRow key={c.label} icon={c.icon} label={c.label} onClick={() => go(c.to)} />
            ))}
        </LinkRow>
      ))}
    </SystemNavGroup>
  );
}
