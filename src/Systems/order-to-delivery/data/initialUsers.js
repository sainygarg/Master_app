export const INITIAL_USERS = [
  {
    id: 'USR-ADMIN',
    username: 'admin',
    password: 'admin123',
    name: 'Sainy Garg',
    email: 'admin@sainygargcouture.com',
    phone: '+91 98100 00001',
    role: 'Admin', // Strictly Admin or User
    isAdmin: true,
    status: 'Active',
    allowedPages: ['dashboard', 'orders', 'stages', 'settings'],
    allowedStages: [
      'material_check',
      'embroidery_marking_cutting',
      'embroidery_sample_approval',
      'full_embroidery',
      'final_cutting_karigar_allotment',
      'stitching_completed',
      'first_qc_alterations_cleared',
      'finishing_final_qc_passed',
      'trial_packing_pickup',
      'final_trial_delivered_return'
    ],
    avatarColor: 'bg-[#5B172E]'
  },
  {
    id: 'USR-PRIYA',
    username: 'priya',
    password: 'user123',
    name: 'Priya Sharma',
    email: 'priya@sainygargcouture.com',
    phone: '+91 98765 43210',
    role: 'User', // Strictly User
    isAdmin: false,
    status: 'Active',
    allowedPages: ['dashboard', 'orders', 'stages'],
    allowedStages: [
      'material_check',
      'embroidery_marking_cutting',
      'embroidery_sample_approval',
      'full_embroidery',
      'final_cutting_karigar_allotment',
      'stitching_completed',
      'first_qc_alterations_cleared',
      'finishing_final_qc_passed',
      'trial_packing_pickup',
      'final_trial_delivered_return'
    ],
    avatarColor: 'bg-purple-700'
  },
  {
    id: 'USR-ANANYA',
    username: 'ananya',
    password: 'user123',
    name: 'Ananya Verma',
    email: 'ananya@sainygargcouture.com',
    phone: '+91 98111 22334',
    role: 'User', // Strictly User
    isAdmin: false,
    status: 'Active',
    allowedPages: ['dashboard', 'orders', 'stages'],
    allowedStages: [
      'material_check',
      'embroidery_marking_cutting',
      'embroidery_sample_approval',
      'full_embroidery',
      'final_cutting_karigar_allotment',
      'stitching_completed',
      'first_qc_alterations_cleared',
      'finishing_final_qc_passed',
      'trial_packing_pickup',
      'final_trial_delivered_return'
    ],
    avatarColor: 'bg-emerald-700'
  },
  {
    id: 'USR-KAVITA',
    username: 'kavita',
    password: 'user123',
    name: 'Kavita Singhania',
    email: 'kavita@sainygargcouture.com',
    phone: '+91 98222 33445',
    role: 'User', // Strictly User
    isAdmin: false,
    status: 'Active',
    allowedPages: ['dashboard', 'orders', 'stages'],
    allowedStages: [
      'material_check',
      'embroidery_marking_cutting',
      'embroidery_sample_approval',
      'full_embroidery',
      'final_cutting_karigar_allotment',
      'stitching_completed',
      'first_qc_alterations_cleared',
      'finishing_final_qc_passed',
      'trial_packing_pickup',
      'final_trial_delivered_return'
    ],
    avatarColor: 'bg-amber-700'
  }
];

export const ALL_PAGE_IDS = [
  { id: 'dashboard', label: 'Dashboard (Production Tracking)' },
  { id: 'orders', label: 'Orders Page (All Orders & Create Order)' },
  { id: 'stages', label: 'Production Stages Workflows' },
  { id: 'settings', label: 'Master Hub (Users, Vendors, Clients, Dept, TAT)' }
];
