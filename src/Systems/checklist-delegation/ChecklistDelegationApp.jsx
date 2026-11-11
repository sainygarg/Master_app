import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import './checklist.css';

// --- Page Imports (Strictly the 11 Checklist & Delegation Pages) ---
import AdminDashboard from './pages/admin/Dashboard';
import NotificationsPage from './pages/admin/Notifications';
import QuickTask from './pages/QuickTask';
import AdminAssignTask from './pages/admin/AssignTask';
import ChecklistTask from './pages/admin/ChecklistTask';
import MaintenanceTask from './pages/admin/MaintenanceTask';
import RepairTask from './pages/admin/RepairTask';
import EATask from './pages/admin/EATask';
import DelegationPage from './pages/delegation';
import AllTasks from './pages/admin/AllTasks';
import CalendarPage from './pages/admin/CalendarPage';
import HolidayListPage from './pages/admin/HolidayListPage';
import WorkingDayCalendarPage from './pages/admin/WorkingDayCalendarPage';
import AdminApprovalPage from './pages/admin/AdminApprovalPage';
import Setting from './pages/Setting';
import TrainingVideo from './pages/admin/TrainingVideo';

// --- Context & Listeners ---
import { MagicToastProvider } from './context/MagicToastContext';
import RealtimeLogoutListener from './components/RealtimeLogoutListener';
import { ALL_CHECKLIST_PAGE_IDS, canUserAccessChecklistPage } from '../order-to-delivery/utils/userStorage';


// Blocks direct URL access to checklist pages the user was not granted in Master Hub
const checkPageAccess = (path) => {
  try {
    const raw = localStorage.getItem('sainy_couture_auth_user_v3');
    if (!raw) return null;
    const masterUser = JSON.parse(raw);
    const isListed = ALL_CHECKLIST_PAGE_IDS.some((p) => p.id === path);
    if (!isListed || canUserAccessChecklistPage(masterUser, path)) return null;
    const firstAllowed = ALL_CHECKLIST_PAGE_IDS.find((p) => canUserAccessChecklistPage(masterUser, p.id));
    return <Navigate to={firstAllowed ? firstAllowed.id : '/order-to-delivery'} replace />;
  } catch {
    return null;
  }
};
// --- Auth Wrapper ---
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const username = (
    localStorage.getItem('user-name') ||
    localStorage.getItem('user_name') ||
    ''
  ).toLowerCase();
  const role = (localStorage.getItem('role') || '').toLowerCase();
  const canSelfAssign = localStorage.getItem('can_self_assign') === 'true';
  const path = window.location.pathname;

  // Check if master user is logged in
  const masterAuth = localStorage.getItem('sainy_couture_auth_user_v3');
  const hasAuth = !!username || !!masterAuth;

  const denied = checkPageAccess(path);
  if (denied) return denied;

  if (!hasAuth) {
    return <Navigate to="/order-to-delivery" replace />;
  }

  // Special Case: Allow 'user' role for assign-task if canSelfAssign is enabled
  if (path.startsWith('/checklist/assign-task')) {
    if (role === 'user' && canSelfAssign) {
      return children;
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
    // If master admin or HOD, allow access
    if (role === 'admin' || role === 'hod') {
      return children;
    }
    return <Navigate to="/checklist/admin" replace />;
  }

  return children;
};

const SuperAdminRoute = ({ children }) => {
  const username = (
    localStorage.getItem('user-name') ||
    localStorage.getItem('user_name') ||
    ''
  ).toLowerCase();
  const role = (localStorage.getItem('role') || '').toLowerCase();

  const denied = checkPageAccess(window.location.pathname);
  if (denied) return denied;

  if (role !== 'admin' && username !== 'admin') {
    return <Navigate to="/checklist/admin" replace />;
  }

  return children;
};

export function ChecklistDelegationApp() {
  return (
    <MagicToastProvider>
      <RealtimeLogoutListener />
      <Routes>
        {/* --- Main Dashboard Redirect --- */}
        <Route path="/checklist" element={<Navigate to="/checklist/admin" replace />} />

        {/* 1. Dashboard */}
        <Route
          path="/checklist/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 2. Notifications */}
        <Route
          path="/checklist/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* 3. Quick Task */}
        <Route
          path="/checklist/quick-task"
          element={
            <ProtectedRoute>
              <QuickTask />
            </ProtectedRoute>
          }
        />

        {/* 4. Assign Task */}
        <Route
          path="/checklist/assign-task"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD', 'user']}>
              <AdminAssignTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checklist/checklist"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD', 'user']}>
              <ChecklistTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checklist/maintenance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <MaintenanceTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checklist/repair"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <RepairTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checklist/ea-task"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <EATask />
            </ProtectedRoute>
          }
        />

        {/* 5. Delegation */}
        <Route
          path="/checklist/delegation"
          element={
            <ProtectedRoute>
              <DelegationPage />
            </ProtectedRoute>
          }
        />

        {/* 6. Task */}
        <Route
          path="/checklist/task"
          element={
            <ProtectedRoute>
              <AllTasks />
            </ProtectedRoute>
          }
        />

        {/* 7. Calendar */}
        <Route
          path="/checklist/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        {/* 8. Holiday Subpages */}
        <Route
          path="/checklist/holiday-list"
          element={
            <SuperAdminRoute>
              <HolidayListPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/checklist/working-day-calendar"
          element={
            <ProtectedRoute>
              <WorkingDayCalendarPage />
            </ProtectedRoute>
          }
        />

        {/* 9. Admin Approval */}
        <Route
          path="/checklist/admin-approval"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <AdminApprovalPage />
            </ProtectedRoute>
          }
        />

        {/* 10. Settings - Redirected to Unified Master Setting */}
        <Route
          path="/checklist/setting"
          element={<Navigate to="/order-to-delivery/settings" replace />}
        />

        {/* 11. Training Video */}
        <Route
          path="/checklist/training-video"
          element={
            <ProtectedRoute>
              <TrainingVideo />
            </ProtectedRoute>
          }
        />

        {/* Fallback for any other dashboard routes */}
        <Route path="/checklist/*" element={<Navigate to="/checklist/admin" replace />} />
      </Routes>
    </MagicToastProvider>
  );
}

export default ChecklistDelegationApp;
