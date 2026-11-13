import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './Systems'; // Automatically registers all systems
import { UnifiedAuthProvider, useUnifiedAuth } from './core/auth/UnifiedAuthContext';
import { ToastAlertProvider } from './core/context/ToastAlertContext';
import MasterShell from './core/layout/MasterShell';
import ProfilePage from './core/pages/ProfilePage';
import OrderToDeliveryApp from './Systems/order-to-delivery/OrderToDeliveryApp';
import ChecklistDelegationApp from './Systems/checklist-delegation/ChecklistDelegationApp';

// The checklist app declares absolute routes (/checklist/...), so it must be
// mounted at the router root; a "/checklist/*" parent would strip the prefix and
// make every page fall through to its "/checklist/*" redirect (blank page).
// Old URL prefix, redirected to /checklist so existing bookmarks keep working
const LEGACY_PREFIX = "/dashboard";
const CHECKLIST_PREFIXES = ['/checklist'];
function ChecklistGate() {
  const { pathname } = useLocation();
  if (pathname === LEGACY_PREFIX || pathname.startsWith(LEGACY_PREFIX + "/")) {
    return <Navigate to={pathname.replace(LEGACY_PREFIX, "/checklist")} replace />;
  }
  const isChecklist = CHECKLIST_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  return isChecklist ? <ChecklistDelegationApp /> : <Navigate to="/order-to-delivery" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useUnifiedAuth();
  const { pathname } = useLocation();

  // Guests always land on /login (the login screen is rendered by OrderToDeliveryApp when nobody is signed in)
  if (!isAuthenticated) {
    if (pathname !== '/login') return <Navigate to="/login" replace />;
    return <OrderToDeliveryApp />;
  }
  // Signed-in users have no reason to be on /login
  if (pathname === '/login') return <Navigate to="/checklist/admin" replace />;

  return (
    <Routes>
      {/* Default root path redirects to Checklist Dashboard */}
      <Route path="/" element={<Navigate to="/checklist/admin" replace />} />

      {/* My Profile (opened from the header avatar) */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* System 1: Order to Delivery */}
      <Route path="/order-to-delivery/*" element={<OrderToDeliveryApp />} />

      {/* System 2: Checklist & Delegation (/dashboard/*); anything else falls back to Order to Delivery */}
      <Route path="*" element={<ChecklistGate />} />
    </Routes>
  );
}

export function App() {
  return (
    <UnifiedAuthProvider>
      <ToastAlertProvider>
        <MasterShell>
          <AppRoutes />
        </MasterShell>
      </ToastAlertProvider>
    </UnifiedAuthProvider>
  );
}

export default App;
