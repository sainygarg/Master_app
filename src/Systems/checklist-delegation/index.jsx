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
      element: <DelegationPage />,
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
  ],
});

export default ChecklistDelegationApp;
