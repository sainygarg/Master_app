import React from 'react';
import systemRegistry from '../../core/registry/systemRegistry';
import ChecklistDelegationApp from './ChecklistDelegationApp';

// Import the 11 Checklist-Delegation pages
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

systemRegistry.register({
  id: 'checklist-delegation',
  name: 'Checklist & Delegation',
  shortName: 'Checklist',
  description: 'Task Assignment, Delegation, Team Approvals & Operations MIS',
  icon: 'ClipboardCheck',
  color: '#173254',
  accentColor: '#1e40af',
  defaultRoute: '/checklist/admin',
  rootComponent: ChecklistDelegationApp,

  menuItems: [
    {
      label: 'Dashboard',
      href: '/checklist/admin',
      icon: 'Database',
      showFor: ['admin', 'user', 'HOD'],
    },
    {
      label: 'Notifications',
      href: '/checklist/notifications',
      icon: 'Bell',
      showFor: ['admin', 'user', 'HOD'],
    },
    {
      label: 'Quick Task',
      href: '/checklist/quick-task',
      icon: 'Zap',
      showFor: ['admin'],
    },
    {
      label: 'Assign Task',
      href: '/checklist/assign-task',
      icon: 'CheckSquare',
      showFor: ['admin', 'HOD', 'user'],
    },
    {
      label: 'Delegation',
      href: '/checklist/delegation',
      icon: 'ClipboardList',
      showFor: ['admin', 'user', 'HOD'],
    },
    {
      label: 'Task',
      href: '/checklist/task',
      icon: 'CalendarCheck',
      showFor: ['admin', 'HOD', 'user'],
    },
    {
      label: 'Calendar',
      href: '/checklist/calendar',
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
          href: '/checklist/holiday-list',
          label: 'Holiday List',
          showFor: ['admin'],
        },
        {
          href: '/checklist/working-day-calendar',
          label: 'Working Day Calendar',
          showFor: ['admin'],
        },
      ],
    },
    {
      label: 'Admin Approval',
      href: '/checklist/admin-approval',
      icon: 'BookmarkCheck',
      showFor: ['admin', 'HOD'],
    },
    {
      label: 'Settings',
      href: '/checklist/setting',
      icon: 'Settings',
      showFor: ['admin'],
    },
    {
      label: 'Training Video',
      href: '/checklist/training-video',
      icon: 'Video',
      showFor: ['admin', 'user', 'HOD'],
    },
  ],

  routes: [
    {
      path: '/checklist/admin',
      element: <AdminDashboard />,
      protected: true,
    },
    {
      path: '/checklist/notifications',
      element: <NotificationsPage />,
      protected: true,
    },
    {
      path: '/checklist/quick-task',
      element: <QuickTask />,
      protected: true,
      allowedRoles: ['admin'],
    },
    {
      path: '/checklist/assign-task',
      element: <AdminAssignTask />,
      protected: true,
      allowedRoles: ['admin', 'HOD', 'user'],
    },
    {
      path: '/checklist/delegation',
      element: <DelegationPage />,
      protected: true,
    },
    {
      path: '/checklist/task',
      element: <AllTasks />,
      protected: true,
    },
    {
      path: '/checklist/calendar',
      element: <CalendarPage />,
      protected: true,
    },
    {
      path: '/checklist/holiday-list',
      element: <HolidayListPage />,
      protected: true,
      superAdminOnly: true,
    },
    {
      path: '/checklist/working-day-calendar',
      element: <WorkingDayCalendarPage />,
      protected: true,
    },
    {
      path: '/checklist/admin-approval',
      element: <AdminApprovalPage />,
      protected: true,
      allowedRoles: ['admin', 'HOD'],
    },
    {
      path: '/checklist/setting',
      element: <Setting />,
      protected: true,
      superAdminOnly: true,
    },
    {
      path: '/checklist/training-video',
      element: <TrainingVideo />,
      protected: true,
    },
  ],
});

export default ChecklistDelegationApp;
