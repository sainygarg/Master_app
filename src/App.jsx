import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './Systems'; // Automatically registers all systems
import { UnifiedAuthProvider } from './core/auth/UnifiedAuthContext';
import MasterShell from './core/layout/MasterShell';
import OrderToDeliveryApp from './Systems/order-to-delivery/OrderToDeliveryApp';
import ChecklistDelegationApp from './Systems/checklist-delegation/ChecklistDelegationApp';

// The checklist app declares absolute routes (/dashboard/...), so it must be
// mounted at the router root; a "/dashboard/*" parent would strip the prefix and
// make every page fall through to its "/dashboard/*" redirect (blank page).
const CHECKLIST_PREFIXES = ['/dashboard'];
function ChecklistGate() {
  const { pathname } = useLocation();
  const isChecklist = CHECKLIST_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  return isChecklist ? <ChecklistDelegationApp /> : <Navigate to="/order-to-delivery" replace />;
}

export function App() {
  return (
    <UnifiedAuthProvider>
      <MasterShell>
        <Routes>
          {/* Default root path redirects to Checklist Dashboard (login gate sends guests to the login page) */}
          <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />

          {/* System 1: Order to Delivery */}
          <Route path="/order-to-delivery/*" element={<OrderToDeliveryApp />} />

          {/* System 2: Checklist & Delegation (/dashboard/*); anything else falls back to Order to Delivery */}
          <Route path="*" element={<ChecklistGate />} />
        </Routes>
      </MasterShell>
    </UnifiedAuthProvider>
  );
}

export default App;
