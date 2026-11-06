import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import './checklist.css';

// --- Page Imports (Strictly the 11 Checklist & Delegation Pages) ---
import AdminDashboard from './pages/admin/Dashboard';
import NotificationsPage from './pages/admin/Notifications';
import QuickTask from './pages/QuickTask';
import AdminAssignTask from './pages/admin/AssignTask';
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

  if (!hasAuth) {
    return <Navigate to="/order-to-delivery" replace />;
  }

  // Special Case: Allow 'user' role for assign-task if canSelfAssign is enabled
  if (path.startsWith('/dashboard/assign-task')) {
    if (role === 'user' && canSelfAssign) {
      return children;
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
    // If master admin or HOD, allow access
    if (role === 'admin' || role === 'hod') {
      return children;
    }
    return <Navigate to="/dashboard/admin" replace />;
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

  if (role !== 'admin' && username !== 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return children;
};

export function ChecklistDelegationApp() {
  return (
    <MagicToastProvider>
      <RealtimeLogoutListener />
      <Routes>
        {/* --- Main Dashboard Redirect --- */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/admin" replace />} />

        {/* 1. Dashboard */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 2. Notifications */}
        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* 3. Quick Task */}
        <Route
          path="/dashboard/quick-task"
          element={
            <ProtectedRoute>
              <QuickTask />
            </ProtectedRoute>
          }
        />

        {/* 4. Assign Task */}
        <Route
          path="/dashboard/assign-task"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD', 'user']}>
              <AdminAssignTask />
            </ProtectedRoute>
          }
        />

        {/* 5. Delegation */}
        <Route
          path="/dashboard/delegation"
          element={
            <ProtectedRoute>
              <DelegationPage />
            </ProtectedRoute>
          }
        />

        {/* 6. Task */}
        <Route
          path="/dashboard/task"
          element={
            <ProtectedRoute>
              <AllTasks />
            </ProtectedRoute>
          }
        />

        {/* 7. Calendar */}
        <Route
          path="/dashboard/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        {/* 8. Holiday Subpages */}
        <Route
          path="/dashboard/holiday-list"
          element={
            <SuperAdminRoute>
              <HolidayListPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/dashboard/working-day-calendar"
          element={
            <ProtectedRoute>
              <WorkingDayCalendarPage />
            </ProtectedRoute>
          }
        />

        {/* 9. Admin Approval */}
        <Route
          path="/dashboard/admin-approval"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <AdminApprovalPage />
            </ProtectedRoute>
          }
        />

        {/* 10. Settings - Redirected to Unified Master Setting */}
        <Route
          path="/dashboard/setting"
          element={<Navigate to="/order-to-delivery?view=settings" replace />}
        />

        {/* 11. Training Video */}
        <Route
          path="/dashboard/training-video"
          element={
            <ProtectedRoute>
              <TrainingVideo />
            </ProtectedRoute>
          }
        />

        {/* Fallback for any other dashboard routes */}
        <Route path="/dashboard/*" element={<Navigate to="/dashboard/admin" replace />} />
      </Routes>
    </MagicToastProvider>
  );
}

export default ChecklistDelegationApp;
