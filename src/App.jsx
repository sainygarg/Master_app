import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './Systems'; // Automatically registers all systems
import { UnifiedAuthProvider } from './core/auth/UnifiedAuthContext';
import MasterShell from './core/layout/MasterShell';
import OrderToDeliveryApp from './Systems/order-to-delivery/OrderToDeliveryApp';
import ChecklistDelegationApp from './Systems/checklist-delegation/ChecklistDelegationApp';

export function App() {
  return (
    <UnifiedAuthProvider>
      <MasterShell>
        <Routes>
          {/* Default root path redirects to Order to Delivery */}
          <Route path="/" element={<Navigate to="/order-to-delivery" replace />} />

          {/* System 1: Order to Delivery */}
          <Route path="/order-to-delivery/*" element={<OrderToDeliveryApp />} />

          {/* System 2: Checklist & Delegation */}
          <Route path="/dashboard/*" element={<ChecklistDelegationApp />} />
          <Route path="/checklist-login" element={<ChecklistDelegationApp />} />
          <Route path="/login" element={<ChecklistDelegationApp />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/order-to-delivery" replace />} />
        </Routes>
      </MasterShell>
    </UnifiedAuthProvider>
  );
}

export default App;
