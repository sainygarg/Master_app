import React from 'react';
import systemRegistry from '../../core/registry/systemRegistry';
import ChecklistDelegationApp from './ChecklistDelegationApp';

// Import Checklist-Delegation pages
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

systemRegistry.register({
  id: 'checklist-delegation',
  name: 'Checklist & Delegation',
  shortName: 'Checklist',
  description: 'Task Assignment, Delegation, Team Approvals & Operations MIS',
  icon: 'ClipboardCheck',
  color: '#173254',
  accentColor: '#1e40af',
  defaultRoute: '/dashboard/admin',
  rootComponent: ChecklistDelegationApp,

  menuItems: [
    {
      label: 'Dashboard',
      href: '/dashboard/admin',
      icon: 'Database',
      showFor: ['admin', 'user', 'HOD'],
    },
    {
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: 'Bell',
      showFor: ['admin', 'user', 'HOD'],
    },
    {
      label: 'Quick Task',
      href: '/dashboard/quick-task',
      icon: 'Zap',
      showFor: ['admin'],
    },
    {
      label: 'Assign Task',
      href: '/dashboard/assign-task',
      icon: 'CheckSquare',
      showFor: ['admin', 'HOD', 'user'],
    },
    {
      label: 'Delegation',
      href: '/dashboard/delegation',
      icon: 'ClipboardList',
      showFor: ['admin', 'user', 'HOD'],
    },
    {
      label: 'Task',
      href: '/dashboard/task',
      icon: 'CalendarCheck',
      showFor: ['admin', 'HOD', 'user'],
    },
    {
      label: 'Calendar',
      href: '/dashboard/calendar',
      icon: 'Calendar',
      showFor: ['admin', 'user', 'HOD'],
    },
    {
      label: 'Holiday',
      icon: 'Calendar',
      showFor: ['admin'],
      isSubmenu: true,
      subItems: [
        {
          href: '/dashboard/holiday-list',
          label: 'Holiday List',
          showFor: ['admin'],
        },
        {
          href: '/dashboard/working-day-calendar',
          label: 'Working Day Calendar',
          showFor: ['admin'],
        },
      ],
    },
    {
      label: 'Admin Approval',
      href: '/dashboard/admin-approval',
      icon: 'BookmarkCheck',
      showFor: ['admin', 'HOD'],
    },
    {
      label: 'Settings',
      href: '/dashboard/setting',
      icon: 'Settings',
      showFor: ['admin'],
    },
    {
      label: 'Training Video',
      href: '/dashboard/training-video',
      icon: 'Video',
      showFor: ['admin', 'user', 'HOD'],
    },
  ],

  routes: [
    {
      path: '/dashboard/admin',
      element: <AdminDashboard />,
      protected: true,
    },
    {
      path: '/dashboard/notifications',
      element: <NotificationsPage />,
      protected: true,
    },
    {
      path: '/dashboard/quick-task',
      element: <QuickTask />,
      protected: true,
      allowedRoles: ['admin'],
    },
    {
      path: '/dashboard/assign-task',
      element: <AdminAssignTask />,
      protected: true,
      allowedRoles: ['admin', 'HOD', 'user'],
    },
    {
      path: '/dashboard/delegation',
      element: <AllTasks defaultTab="delegation" lockedTab={true} />,
      protected: true,
    },
    {
      path: '/dashboard/task',
      element: <AllTasks />,
      protected: true,
    },
    {
      path: '/dashboard/calendar',
      element: <CalendarPage />,
      protected: true,
    },
    {
      path: '/dashboard/holiday-list',
      element: <HolidayListPage />,
      protected: true,
      superAdminOnly: true,
    },
    {
      path: '/dashboard/working-day-calendar',
      element: <WorkingDayCalendarPage />,
      protected: true,
    },
    {
      path: '/dashboard/admin-approval',
      element: <AdminApprovalPage />,
      protected: true,
      allowedRoles: ['admin', 'HOD'],
    },
    {
      path: '/dashboard/setting',
      element: <Setting />,
      protected: true,
      superAdminOnly: true,
    },
    {
      path: '/dashboard/training-video',
      element: <TrainingVideo />,
      protected: true,
    },
    {
      path: '/dashboard/checklist',
      element: <ChecklistTask />,
      protected: true,
    },
    {
      path: '/dashboard/maintenance',
      element: <MaintenanceTask />,
      protected: true,
    },
    {
      path: '/dashboard/repair',
      element: <RepairTask />,
      protected: true,
    },
    {
      path: '/dashboard/ea-task',
      element: <EATask />,
      protected: true,
    },
    {
      path: '/dashboard/bulk-import',
      element: <BulkImport />,
      protected: true,
      allowedRoles: ['admin', 'HOD'],
    },
    {
      path: '/dashboard/data',
      element: <DataPage />,
      protected: true,
      allowedRoles: ['admin', 'HOD'],
    },
    {
      path: '/dashboard/data/:category',
      element: <DataPage />,
      protected: true,
    },
    {
      path: '/dashboard/admin-data',
      element: <AdminDataPage />,
      protected: true,
      allowedRoles: ['admin', 'HOD'],
    },
    {
      path: '/dashboard/delegation-data',
      element: <AdminDelegationTask />,
      protected: true,
      allowedRoles: ['admin', 'HOD'],
    },
    {
      path: '/dashboard/mis-report',
      element: <MisReport />,
      protected: true,
      allowedRoles: ['admin'],
    },
    {
      path: '/dashboard/demo',
      element: <Demo />,
      protected: true,
    },
  ],
});

export default ChecklistDelegationApp;
