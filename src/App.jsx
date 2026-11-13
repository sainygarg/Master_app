import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './Systems'; // Automatically registers all systems
import { UnifiedAuthProvider, useUnifiedAuth } from './core/auth/UnifiedAuthContext';
import { ToastAlertProvider } from './core/context/ToastAlertContext';
import { STAGES } from './Systems/order-to-delivery/types/stages';
import {
  ALL_CHECKLIST_PAGE_IDS,
  ALL_PAGE_IDS,
  canUserAccessChecklistPage,
  canUserAccessPage,
  canUserAccessStage,
  isApexAdmin
} from './Systems/order-to-delivery/utils/userStorage';
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
  const { isAuthenticated, user, logout } = useUnifiedAuth();
  const { pathname } = useLocation();

  // Guests always land on /login (the login screen is rendered by OrderToDeliveryApp when nobody is signed in)
  if (!isAuthenticated) {
    if (pathname !== '/login') return <Navigate to="/login" replace />;
    return <OrderToDeliveryApp />;
  }
  // Signed-in users have no reason to be on /login
  if (pathname === '/login') return <Navigate to="/checklist/admin" replace />;

  // RBAC: a user with nothing granted gets no pages at all
  const hasAnyAccess =
    isApexAdmin(user) ||
    ALL_CHECKLIST_PAGE_IDS.some((p) => canUserAccessChecklistPage(user, p.id)) ||
    ALL_PAGE_IDS.some((p) => canUserAccessPage(user, p.id)) ||
    STAGES.some((s) => canUserAccessStage(user, s.id));
  if (!hasAnyAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-[#431021] mb-2">No access assigned</h1>
        <p className="text-sm text-stone-500 max-w-sm mb-6">
          Your account has no pages enabled yet. Please ask an administrator to grant you access.
        </p>
        <button
          type="button"
          onClick={logout}
          className="px-5 py-2.5 rounded-xl bg-[#5B172E] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Log out
        </button>
      </div>
    );
  }

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
