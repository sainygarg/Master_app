export const INITIAL_ORDERS = [
  // --- PRIYA SHARMA'S ORDERS (USR-PRIYA) ---
  {
    id: 'SG-1021',
    createdByUserId: 'USR-PRIYA',
    createdByName: 'Priya Sharma',
    clientName: 'Priya Sharma',
    mobile: '+91 98765 43210',
    city: 'New Delhi',
    designName: 'Sage Green Handcrafted Lehenga Set',
    size: 'Custom',
    deliveryDate: '2026-11-25',
    trialDate: '2026-11-18',
    createdAt: '2026-11-01T10:30:00.000Z',
    currentStageId: 'material_check',
    currentStageIndex: 0,
    designImages: ['/assets/couture-1.jpg'],
    inspirationImages: ['/assets/media_1793616727811_51733b37.jpg'],
    measurements: {
      hasUpper: true,
      hasLower: true,
      upper: { frontNeck: '7.5', backNeck: '9.0', shoulder: '14.0', upperChest: '34.0', chest: '36.0', dartPoint: '10.0', underBust: '30.0', waist: '30.0', belly: '33.0', hip: '39.0', armhole: '16.5', sleeveLength: '18.0', sleeveLengthType: 'Full Length', bicep: '12.0', elbow: '10.0', wrist: '6.5', fullLength: '42.0', kurtiLength: '46.0', blouseLength: '15.0', topLength: '26.0', jacketLength: '24.0', jacketLengthType: 'Full Length' },
      lower: { skirtLength: '42.0', pantLength: '38.0', pantWaist: '30.0', hip: '39.0', thigh: '23.0', knee: '15.5', calf: '14.0', crotch: '11.0', crotchRounding: '26.0', bottomRounding: '13.0', pantFlare: '22.0', skirtFlare: '120.0' }
    },
    stageData: {
      material_check: { dyeStatus: 'In Process', materialReadyDate: '2026-11-04', remarks: 'Sage Green custom dye shade #7B9075.' }
    },
    history: [{ stageId: 'material_check', stageName: 'Material Check', timestamp: '2026-11-01T10:30:00.000Z', action: 'Order Placed by Priya', actor: 'Priya Sharma', notes: 'Material Check initiated.' }]
  },
  {
    id: 'SG-1022',
    createdByUserId: 'USR-PRIYA',
    createdByName: 'Priya Sharma',
    clientName: 'Simran Kaur',
    mobile: '+91 98111 88990',
    city: 'Chandigarh',
    designName: 'Blush Pink Zardozi Sharara Set',
    size: 'M (36)',
    deliveryDate: '2026-11-20',
    trialDate: '2026-11-14',
    createdAt: '2026-10-28T14:15:00.000Z',
    currentStageId: 'embroidery_marking_cutting',
    currentStageIndex: 1,
    designImages: ['/assets/couture-2.jpg'],
    inspirationImages: ['/assets/sg-1042-rose.jpg'],
    measurements: {
      hasUpper: true,
      hasLower: true,
      upper: { frontNeck: '7.0', backNeck: '8.0', shoulder: '14.0', chest: '36.0', waist: '30.0', hip: '40.0', kurtiLength: '38.0' },
      lower: { fullLength: '40.0', skirtLength: '40.0', pantLength: '38.0', pantWaist: '30.0', hip: '40.0' }
    },
    stageData: {
      material_check: { dyeStatus: 'Yes', materialReadyDate: '2026-10-30', remarks: 'Base fabric approved' },
      embroidery_marking_cutting: { cuttingDate: '2026-11-02', markingDate: '2026-11-03', handoverToEmbroidery: 'Yes', masterCutterName: 'Master Rajesh', remarks: 'Marking pattern verified.' }
    },
    history: []
  },
  {
    id: 'SG-1023',
    createdByUserId: 'USR-PRIYA',
    createdByName: 'Priya Sharma',
    clientName: 'Natasha Oberoi',
    mobile: '+91 98200 44556',
    city: 'Mumbai',
    designName: 'Ivory Resham Embroidered Cape & Dhoti Set',
    size: 'S (34)',
    deliveryDate: '2026-11-16',
    trialDate: '2026-11-10',
    createdAt: '2026-10-25T11:00:00.000Z',
    currentStageId: 'embroidery_sample_approval',
    currentStageIndex: 2,
    designImages: ['/assets/couture-3.jpg'],
    inspirationImages: ['/assets/media_1793616727811_d77a6720.jpg'],
    measurements: {
      hasUpper: true,
      hasLower: true,
      upper: { frontNeck: '7.5', shoulder: '13.5', chest: '34.0', waist: '28.0', hip: '37.0' },
      lower: { fullLength: '39.0', pantLength: '38.0', pantWaist: '28.0', hip: '37.0' }
    },
    stageData: {
      embroidery_sample_approval: { expectedCompletionDate: '2026-11-06', expectedHours: '16 Hours', approvalStatus: 'Approved by Client', remarks: 'Swatch verified with bride.' }
    },
    history: []
  },
  {
    id: 'SG-1024',
    createdByUserId: 'USR-PRIYA',
    createdByName: 'Priya Sharma',
    clientName: 'Sanjana Kapoor',
    mobile: '+91 98333 11223',
    city: 'Delhi',
    designName: 'Emerald Green Velvet Kalidar Suit',
    size: 'L (38)',
    deliveryDate: '2026-11-05',
    trialDate: '2026-11-02',
    createdAt: '2026-10-15T09:00:00.000Z',
    currentStageId: 'final_trial_delivered_return',
    currentStageIndex: 9,
    designImages: ['/assets/couture-4.jpg'],
    inspirationImages: ['/assets/couture-1.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '38.0', waist: '32.0', hip: '42.0' }, lower: { fullLength: '40.0', pantLength: '39.0', pantWaist: '32.0' } },
    stageData: {
      final_trial_delivered_return: { finalTrialDone: 'Yes', deliveryDone: 'Yes', status: 'Delivered to Client', remarks: 'Delivered in-person, fitting loved.' }
    },
    history: []
  },

  // --- ANANYA VERMA'S ORDERS (USR-ANANYA) ---
  {
    id: 'SG-1025',
    createdByUserId: 'USR-ANANYA',
    createdByName: 'Ananya Verma',
    clientName: 'Tanvi Mehra',
    mobile: '+91 98444 33221',
    city: 'Jaipur',
    designName: 'Mustard Raw Silk Gotapatti Lehenga',
    size: 'M (36)',
    deliveryDate: '2026-11-22',
    trialDate: '2026-11-15',
    createdAt: '2026-10-29T10:00:00.000Z',
    currentStageId: 'full_embroidery',
    currentStageIndex: 3,
    designImages: ['/assets/couture-5.jpg'],
    inspirationImages: ['/assets/couture-2.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '36.0', waist: '30.0', shoulder: '14.0' }, lower: { fullLength: '41.0', skirtLength: '42.0', pantWaist: '30.0' } },
    stageData: {
      full_embroidery: { embroideryDeadline: '2026-11-12', pictureSentOnGroup: 'Yes', status: 'On Adda Frame', remarks: 'Adda work in Jaipur karkhana underway.' }
    },
    history: []
  },
  {
    id: 'SG-1026',
    createdByUserId: 'USR-ANANYA',
    createdByName: 'Ananya Verma',
    clientName: 'Ridhima Goel',
    mobile: '+91 98555 66778',
    city: 'Gurugram',
    designName: 'Lilac Organza Anarkali with Pearl Choker Dupatta',
    size: 'S (34)',
    deliveryDate: '2026-11-19',
    trialDate: '2026-11-13',
    createdAt: '2026-10-26T12:00:00.000Z',
    currentStageId: 'final_cutting_karigar_allotment',
    currentStageIndex: 4,
    designImages: ['/assets/couture-6.jpg'],
    inspirationImages: ['/assets/couture-3.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '34.0', waist: '28.0', shoulder: '13.5' }, lower: { fullLength: '40.0', skirtLength: '41.0' } },
    stageData: {
      final_cutting_karigar_allotment: { expectedCuttingDate: '2026-11-04', estimatedStitchingTime: '3 Days', masterName: 'Master Salim', karigarName: 'Master Rajesh', status: 'Allotted', remarks: 'Cancan & santoon lining issued.' }
    },
    history: []
  },
  {
    id: 'SG-1027',
    createdByUserId: 'USR-ANANYA',
    createdByName: 'Ananya Verma',
    clientName: 'Ishita Jain',
    mobile: '+91 98666 77889',
    city: 'New Delhi',
    designName: 'Powder Blue Tissue Silk Saree Blouse Set',
    size: 'M (36)',
    deliveryDate: '2026-11-17',
    trialDate: '2026-11-11',
    createdAt: '2026-10-24T15:30:00.000Z',
    currentStageId: 'stitching_completed',
    currentStageIndex: 5,
    designImages: ['/assets/couture-7.jpg'],
    inspirationImages: ['/assets/couture-4.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '36.0', waist: '29.5', blouseLength: '14.5' }, lower: { fullLength: '39.0', pantWaist: '30.0' } },
    stageData: {
      stitching_completed: { status: 'Yes - Stitching Completed', remarks: 'Cups and inner finishing checked.' }
    },
    history: []
  },
  {
    id: 'SG-1028',
    createdByUserId: 'USR-ANANYA',
    createdByName: 'Ananya Verma',
    clientName: 'Megha Agarwal',
    mobile: '+91 98777 88990',
    city: 'Noida',
    designName: 'Ruby Red Banarasi Silk Brocade Kurta',
    size: 'L (38)',
    deliveryDate: '2026-11-15',
    trialDate: '2026-11-09',
    createdAt: '2026-10-22T09:00:00.000Z',
    currentStageId: 'first_qc_alterations_cleared',
    currentStageIndex: 6,
    designImages: ['/assets/couture-8.jpg'],
    inspirationImages: ['/assets/couture-5.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '38.0', waist: '32.0', hip: '41.0' }, lower: { fullLength: '39.0', pantWaist: '32.0' } },
    stageData: {
      first_qc_alterations_cleared: { markReadyForTrial: 'Yes', alterationIfAny: 'None - Passed first shot', alterationDoneBy: 'Master Salim', status: 'First QC Passed', remarks: 'All 17 measurement points matched.' }
    },
    history: []
  },

  // --- KAVITA SINGHANIA'S ORDERS (USR-KAVITA) ---
  {
    id: 'SG-1029',
    createdByUserId: 'USR-KAVITA',
    createdByName: 'Kavita Singhania',
    clientName: 'Alisha Merchant',
    mobile: '+91 98888 12345',
    city: 'Mumbai',
    designName: 'Gold Antique Zari Tissue Lehenga',
    size: 'Custom (36)',
    deliveryDate: '2026-11-14',
    trialDate: '2026-11-08',
    createdAt: '2026-10-20T14:00:00.000Z',
    currentStageId: 'finishing_final_qc_passed',
    currentStageIndex: 7,
    designImages: ['/assets/couture-9.jpg'],
    inspirationImages: ['/assets/couture-6.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '36.0', waist: '30.0', shoulder: '14.0' }, lower: { fullLength: '42.0', skirtLength: '42.0' } },
    stageData: {
      finishing_final_qc_passed: { status: 'Passed - 100% Cleared', remarks: 'Steam pressing and hooks inspected.' }
    },
    history: []
  },
  {
    id: 'SG-1030',
    createdByUserId: 'USR-KAVITA',
    createdByName: 'Kavita Singhania',
    clientName: 'Divya Khurana',
    mobile: '+91 98999 54321',
    city: 'Ludhiana',
    designName: 'Crimson Velvet Bridal Lehenga Set',
    size: 'M (36)',
    deliveryDate: '2026-11-10',
    trialDate: '2026-11-05',
    createdAt: '2026-10-18T11:00:00.000Z',
    currentStageId: 'trial_packing_pickup',
    currentStageIndex: 8,
    designImages: ['/assets/couture-10.jpg'],
    inspirationImages: ['/assets/couture-7.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '36.0', waist: '30.0', shoulder: '14.0' }, lower: { fullLength: '42.0', skirtLength: '42.0' } },
    stageData: {
      trial_packing_pickup: { clientComingForTrial: 'Yes', dispatchNo: 'SG-DISP-9842', dispatchedThrough: 'Atelier VIP Van', status: 'Ready for Pickup', remarks: 'Luxury bag with protective garment cover packed.' }
    },
    history: []
  },
  {
    id: 'SG-1031',
    createdByUserId: 'USR-KAVITA',
    createdByName: 'Kavita Singhania',
    clientName: 'Sakshi Talwar',
    mobile: '+91 98123 45678',
    city: 'Delhi',
    designName: 'Chikankari Moti Work Georgette Kurta Set',
    size: 'S (34)',
    deliveryDate: '2026-11-03',
    trialDate: '2026-10-30',
    createdAt: '2026-10-12T10:00:00.000Z',
    currentStageId: 'final_trial_delivered_return',
    currentStageIndex: 9,
    designImages: ['/assets/couture-11.jpg'],
    inspirationImages: ['/assets/couture-8.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '34.0', waist: '28.0' }, lower: { fullLength: '39.0', pantLength: '38.0' } },
    stageData: {
      final_trial_delivered_return: { finalTrialDone: 'Yes', deliveryDone: 'Yes', status: 'Delivered to Client', remarks: 'Delivered to bride for wedding festivities.' }
    },
    history: []
  },

  // --- ADMIN'S DIRECT ORDERS (USR-ADMIN) ---
  {
    id: 'SG-1032',
    createdByUserId: 'USR-ADMIN',
    createdByName: 'Sainy Garg',
    clientName: 'Aditi Rao',
    mobile: '+91 99000 11223',
    city: 'Hyderabad',
    designName: 'Heritage Peacock Zardozi Raw Silk Ensemble',
    size: 'Custom',
    deliveryDate: '2026-11-28',
    trialDate: '2026-11-21',
    createdAt: '2026-11-02T09:00:00.000Z',
    currentStageId: 'material_check',
    currentStageIndex: 0,
    designImages: ['/assets/couture-12.jpg'],
    inspirationImages: ['/assets/couture-9.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '35.0', waist: '29.0', shoulder: '14.0' }, lower: { fullLength: '41.0', skirtLength: '41.0' } },
    stageData: {
      material_check: { dyeStatus: 'In Process', materialReadyDate: '2026-11-05', remarks: 'Peacock motif pure zari tracing scheduled.' }
    },
    history: []
  },
  {
    id: 'SG-1033',
    createdByUserId: 'USR-ADMIN',
    createdByName: 'Sainy Garg',
    clientName: 'Shreya Ghoshal Fan Club VIP',
    mobile: '+91 99111 22334',
    city: 'Mumbai',
    designName: 'Midnight Blue Hand-Embroidered Velvet Gown',
    size: 'M (36)',
    deliveryDate: '2026-11-24',
    trialDate: '2026-11-17',
    createdAt: '2026-10-31T16:00:00.000Z',
    currentStageId: 'full_embroidery',
    currentStageIndex: 3,
    designImages: ['/assets/couture-13.jpg'],
    inspirationImages: ['/assets/couture-10.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '36.0', waist: '30.0', shoulder: '14.5' }, lower: { fullLength: '54.0' } },
    stageData: {
      full_embroidery: { embroideryDeadline: '2026-11-15', pictureSentOnGroup: 'Yes', status: 'On Adda Frame', remarks: 'Heavy hand zardozi on bodice in progress.' }
    },
    history: []
  },
  {
    id: 'SG-1034',
    createdByUserId: 'USR-ADMIN',
    createdByName: 'Sainy Garg',
    clientName: 'Tara Sutaria Celebrity Styling',
    mobile: '+91 99222 33445',
    city: 'Mumbai',
    designName: 'Champagne Gold Glass Beadwork Lehenga',
    size: 'XS (32)',
    deliveryDate: '2026-11-18',
    trialDate: '2026-11-12',
    createdAt: '2026-10-27T10:00:00.000Z',
    currentStageId: 'first_qc_alterations_cleared',
    currentStageIndex: 6,
    designImages: ['/assets/sg-1024-lehenga.jpg'],
    inspirationImages: ['/assets/sg-1042-rose.jpg'],
    measurements: { hasUpper: true, hasLower: true, upper: { chest: '32.0', waist: '26.0', shoulder: '13.0' }, lower: { fullLength: '41.0', skirtLength: '41.0' } },
    stageData: {
      first_qc_alterations_cleared: { markReadyForTrial: 'Yes', alterationIfAny: 'None - Passed', alterationDoneBy: 'Sunita Sharma', status: 'First QC Passed', remarks: 'Beadwork tension verified.' }
    },
    history: []
  }
];
