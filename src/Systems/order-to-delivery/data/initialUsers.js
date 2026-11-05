// Root Administrator Account for initial system access (All dummy/hardcoded users removed)
export const INITIAL_USERS = [
  {
    id: 'USR-ADMIN',
    username: 'admin',
    password: 'admin123',
    name: 'Sainy Garg',
    email: 'admin@sainygargcouture.com',
    phone: '',
    role: 'Admin',
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
  }
];

export const ALL_PAGE_IDS = [
  { id: 'dashboard', label: 'Dashboard (Production Tracking)' },
  { id: 'orders', label: 'Orders Page (All Orders & Create Order)' },
  { id: 'stages', label: 'Production Stages Workflows' },
  { id: 'settings', label: 'Master Hub (Users, Vendors, Clients, Dept, TAT)' }
];
