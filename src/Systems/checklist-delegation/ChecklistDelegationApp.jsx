import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import './checklist.css';

// --- Page Imports ---
import AdminDashboard from './pages/admin/Dashboard';
import NotificationsPage from './pages/admin/Notifications';
import QuickTask from './pages/QuickTask';
import AdminAssignTask from './pages/admin/AssignTask';
import AccountDataPage from './pages/admin/account-data-page';
import AllTasks from './pages/admin/AllTasks';
import CalendarPage from './pages/admin/CalendarPage';
import HolidayListPage from './pages/admin/HolidayListPage';
import WorkingDayCalendarPage from './pages/admin/WorkingDayCalendarPage';
import AdminApprovalPage from './pages/admin/AdminApprovalPage';
import Setting from './pages/Setting';
import TrainingVideo from './pages/admin/TrainingVideo';
import ChecklistTask from './pages/admin/ChecklistTask';
import MaintenanceTask from './pages/admin/MaintenanceTask';
import RepairTask from './pages/admin/RepairTask';
import EATask from './pages/admin/EATask';
import BulkImport from './pages/BulkImport';
import DataPage from './pages/admin/DataPage';
import AdminDataPage from './pages/admin/admin-data-page';
import AdminDelegationTask from './pages/delegation-data';
import MisReport from './pages/MisReport';
import Demo from './pages/user/Demo';
import LoginPage from './pages/LoginPage';

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
    return <Navigate to="/checklist-login" replace />;
  }

  // Special Case: Allow 'user' role for assign-task and checklist if canSelfAssign is enabled
  if (path.startsWith('/dashboard/assign-task') || path.startsWith('/dashboard/checklist')) {
    if (role === 'user' && canSelfAssign) {
      return children;
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
    // If master admin, allow access
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
        {/* --- Public / Auth Routes --- */}
        <Route path="/checklist-login" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- Main Dashboard Redirects --- */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/admin" replace />} />

        {/* --- Core Dashboard Routes --- */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/demo"
          element={
            <ProtectedRoute>
              <Demo />
            </ProtectedRoute>
          }
        />

        {/* --- Task Management --- */}
        <Route
          path="/dashboard/assign-task"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD', 'user']}>
              <AdminAssignTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/quick-task"
          element={
            <ProtectedRoute>
              <QuickTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/checklist"
          element={
            <ProtectedRoute>
              <ChecklistTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/maintenance"
          element={
            <ProtectedRoute>
              <MaintenanceTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/repair"
          element={
            <ProtectedRoute>
              <RepairTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/ea-task"
          element={
            <ProtectedRoute>
              <EATask />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/task"
          element={
            <ProtectedRoute>
              <AllTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/training-video"
          element={
            <ProtectedRoute>
              <TrainingVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/bulk-import"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <BulkImport />
            </ProtectedRoute>
          }
        />

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

        {/* --- Data & Reporting --- */}
        <Route
          path="/dashboard/data"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <DataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/data/:category"
          element={
            <ProtectedRoute>
              <DataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin-data"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <AdminDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/delegation"
          element={
            <ProtectedRoute>
              <AccountDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/delegation-data"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <AdminDelegationTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin-approval"
          element={
            <ProtectedRoute allowedRoles={['admin', 'HOD']}>
              <AdminApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/mis-report"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MisReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* --- Settings --- */}
        <Route
          path="/dashboard/setting"
          element={
            <SuperAdminRoute>
              <Setting />
            </SuperAdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="/dashboard/*" element={<Navigate to="/dashboard/admin" replace />} />
      </Routes>
    </MagicToastProvider>
  );
}

export default ChecklistDelegationApp;
