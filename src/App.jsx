import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
} from './Systems/order-to-delivery/utils/userAuthService';
import MasterShell from './core/layout/MasterShell';
import { LoginPage } from './Systems/order-to-delivery/components/LoginPage';

// Lazy load route views to avoid loading entire app bundles simultaneously in dev mode
const MasterExecutiveDashboard = lazy(() => import('./core/pages/MasterExecutiveDashboard'));
const ProfilePage = lazy(() => import('./core/pages/ProfilePage'));
const ProductionControlView = lazy(() => import('./Systems/pc/ProductionControlView'));
const KarigarReportView = lazy(() => import('./Systems/karigar-report/KarigarReportView'));
const PurchaseApp = lazy(() => import('./Systems/purchase/PurchaseApp'));
const OrderToDeliveryApp = lazy(() => import('./Systems/order-to-delivery/OrderToDeliveryApp'));
const ChecklistDelegationApp = lazy(() => import('./Systems/checklist-delegation/ChecklistDelegationApp'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-7 h-7 border-3 border-[#DECDB8] border-t-[#5B172E] rounded-full animate-spin" />
    </div>
  );
}

// Reusable RBAC ProtectedRoute component
export function ProtectedRoute({ children, requiredPageId, requiredStageId, requiredChecklistPageId }) {
  const { isAuthenticated, user } = useUnifiedAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPageId && !isApexAdmin(user) && !canUserAccessPage(user, requiredPageId)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredStageId && !isApexAdmin(user) && !canUserAccessStage(user, requiredStageId)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredChecklistPageId && !isApexAdmin(user) && !canUserAccessChecklistPage(user, requiredChecklistPageId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// The checklist app declares absolute routes (/checklist/...), so it must be
// mounted at the router root; a "/checklist/*" parent would strip the prefix and
// make every page fall through to its "/checklist/*" redirect (blank page).
const CHECKLIST_PREFIXES = ['/checklist'];
function ChecklistGate() {
  const { pathname } = useLocation();
  const isChecklist = CHECKLIST_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  return isChecklist ? <ChecklistDelegationApp /> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { isAuthenticated, user, login, logout } = useUnifiedAuth();
  const { pathname } = useLocation();

  // Guests always land on /login
  if (!isAuthenticated) {
    if (pathname !== '/login') return <Navigate to="/login" replace />;
    return <LoginPage onLogin={login} />;
  }
  // Signed-in users have no reason to be on /login
  if (pathname === '/login') return <Navigate to="/dashboard" replace />;

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
      {/* 1. Default Root & Main Landing Page: Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MasterExecutiveDashboard />
          </ProtectedRoute>
        }
      />

      {/* My Profile (opened from the header avatar) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* System 1: PC (Production Control) */}
      <Route
        path="/pc"
        element={
          <ProtectedRoute requiredPageId="pc">
            <ProductionControlView />
          </ProtectedRoute>
        }
      />

      {/* System: Karigar Report (Placed after PC) */}
      <Route
        path="/karigar-report"
        element={
          <ProtectedRoute requiredPageId="karigar-report">
            <KarigarReportView />
          </ProtectedRoute>
        }
      />

      {/* System: Purchase */}
      <Route
        path="/purchase/*"
        element={
          <ProtectedRoute>
            <PurchaseApp />
          </ProtectedRoute>
        }
      />

      {/* System 2: Order to Delivery & Master Hub Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredPageId="settings">
            <OrderToDeliveryApp />
          </ProtectedRoute>
        }
      />
      <Route path="/order-to-delivery/settings" element={<Navigate to="/settings" replace />} />
      <Route
        path="/order-to-delivery/*"
        element={
          <ProtectedRoute>
            <OrderToDeliveryApp />
          </ProtectedRoute>
        }
      />

      {/* System 3: Checklist & Delegation (/checklist/*); anything else falls back to Dashboard */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <ChecklistGate />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <UnifiedAuthProvider>
      <ToastAlertProvider>
        <MasterShell>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </MasterShell>
      </ToastAlertProvider>
    </UnifiedAuthProvider>
  );
}

export default App;
