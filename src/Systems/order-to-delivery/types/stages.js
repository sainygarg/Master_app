export const STAGES = [
  {
    id: 'material_check',
    name: 'Material Check',
    code: 'MC',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Fabric inspection, Dyeing confirmation & trims readiness',
    icon: 'PackageCheck',
    fields: [
      { key: 'dyeStatus', label: 'DYE Status', type: 'select', options: ['Yes', 'No', 'Not Required', 'In Process'] },
      { key: 'materialReadyDate', label: 'Full Material Ready Date', type: 'date' },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Dye shade remarks, fabric texture...' },
    ]
  },
  {
    id: 'embroidery_marking_cutting',
    name: 'Embroidery Marking or Cutting',
    code: 'EMC',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    dotColor: 'bg-orange-500',
    description: 'Khaka tracing, marking placement & base fabric cutting',
    icon: 'Scissors',
    fields: [
      { key: 'cuttingDate', label: 'Cutting Date', type: 'date' },
      { key: 'markingDate', label: 'Marking Date', type: 'date' },
      { key: 'handoverToEmbroidery', label: 'Handover to Embroidery Team', type: 'select', options: ['Yes', 'No', 'In Transit'] },
      { key: 'masterCutterName', label: 'Cutter / Master Name', type: 'text', placeholder: 'Master Name' },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Pattern placement, neck shape adjustment notes...' },
    ]
  },  
  {
    id: 'embroidery_sample_approval',
    name: 'Embroidery Sample Approval',
    code: 'ESA',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    dotColor: 'bg-purple-500',
    description: 'Swatch patch, thread/zari shade match & designer sign-off',
    icon: 'Sparkles',
    fields: [
      { key: 'expectedCompletionDate', label: 'Expected Date of Completion', type: 'date' },
      { key: 'expectedHours', label: 'Expected Hours', type: 'text', placeholder: 'e.g. 12 Hours / 2 Days' },
      { key: 'approvalStatus', label: 'Approval Status', type: 'select', options: ['Approved by Designer', 'Approved by Client', 'Pending Approval', 'Rework Required'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Motif size, swatch density feedback...' },
    ]
  },
  {
    id: 'full_embroidery',
    name: 'Full Embroidery',
    code: 'FE',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
    dotColor: 'bg-pink-500',
    description: 'Adda/frame hand embroidery & artisan workmanship',
    icon: 'Needle',
    fields: [
      { key: 'embroideryDeadline', label: 'Set Deadline of Full Embroidery', type: 'date' },
      { key: 'pictureSentOnGroup', label: 'Embroidery Picture Sent on Group', type: 'select', options: ['Yes', 'No', 'In Transit'] },
      { key: 'status', label: 'Status', type: 'select', options: ['In Progress', 'Completed', 'On Adda Frame', 'Pending Verification'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Karigar progress, highlights, framing...' },
    ]
  },
  {
    id: 'final_cutting_karigar_allotment',
    name: 'Final Cutting and Karigar Allotment',
    code: 'FCKA',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Final panel sizing, cancan/lining assignment & master tailoring',
    icon: 'UserCheck',
    fields: [
      { key: 'expectedCuttingDate', label: 'Date of Cutting Expected', type: 'date' },
      { key: 'estimatedStitchingTime', label: 'Estimated Time of Stitching', type: 'text', placeholder: 'e.g. 3 Days / 18 Hours' },
      { key: 'masterName', label: 'Master Name', type: 'text', placeholder: 'e.g. Master Salim' },
      { key: 'karigarName', label: 'Karigar Name', type: 'text', placeholder: 'e.g. Master Rajesh' },
      { key: 'status', label: 'Status', type: 'select', options: ['Allotted', 'In Cutting', 'Stitching Started', 'Pending Allotment'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Tailoring instructions, cancan/cup specs...' },
    ]
  },
  {
    id: 'stitching_completed',
    name: 'Stitching Completed',
    code: 'SC',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dotColor: 'bg-indigo-500',
    description: 'Garment assembly, stitching done & ready for inspection',
    icon: 'CheckSquare',
    fields: [
      { key: 'status', label: 'Status', type: 'select', options: ['Yes - Stitching Completed', 'In Progress', 'Needs Alteration', 'Pending Finishing'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Stitching observations, zipper smoothness, flare...' },
    ]
  },
  {
    id: 'first_qc_alterations_cleared',
    name: 'First QC and Alterations Cleared',
    code: 'FQC',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    dotColor: 'bg-rose-500',
    description: 'Measurement tape inspection against client sheet & dart corrections',
    icon: 'ClipboardCheck',
    fields: [
      { key: 'markReadyForTrial', label: 'Mark as Ready for Trial', type: 'select', options: ['Yes', 'No', 'Pending Alteration'] },
      { key: 'alterationIfAny', label: 'Alteration If Any', type: 'text', placeholder: 'e.g. Waist 0.5" let out, none' },
      { key: 'alterationDoneBy', label: 'Alteration Done By', type: 'text', placeholder: 'e.g. Master Salim / Sunita' },
      { key: 'status', label: 'Status', type: 'select', options: ['First QC Passed', 'Alterations Cleared', 'In Alteration', 'QC Pending'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Tape inspection against client sheet...' },
    ]
  },
  {
    id: 'finishing_final_qc_passed',
    name: 'Finishing and Final QC Passed',
    code: 'FFQC',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    dotColor: 'bg-teal-500',
    description: 'Thread trimming, steam pressing, latkans/hooks & barcode tagging',
    icon: 'ShieldCheck',
    fields: [
      { key: 'status', label: 'Status', type: 'select', options: ['Passed - 100% Cleared', 'Pending Finishing', 'Hold for Steaming / Hooks'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Steam pressing, hooks, latkans, security tag verification...' },
    ]
  },
  {
    id: 'trial_packing_pickup',
    name: 'Trial or Packing and Pickup',
    code: 'TPP',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    dotColor: 'bg-cyan-500',
    description: 'Client fitting session, luxury couture garment bag & pickup readiness',
    icon: 'ShoppingBag',
    fields: [
      { key: 'clientComingForTrial', label: 'When Client is Coming for Trial', type: 'select', options: ['Yes', 'No', 'Trial Completed', 'Direct Pickup'] },
      { key: 'dispatchNo', label: 'Dispatch No.', type: 'text', placeholder: 'e.g. SG-DISP-9841 / AWB-88123' },
      { key: 'dispatchedThrough', label: 'Dispatched Through', type: 'text', placeholder: 'e.g. BlueDart / Atelier VIP Van / Self Pickup' },
      { key: 'status', label: 'Status', type: 'select', options: ['Ready for Pickup', 'Trial Scheduled', 'Dispatched', 'Packed in Luxury Bag'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Packaging notes, client trial feedback...' },
    ]
  },
  {
    id: 'final_trial_delivered_return',
    name: 'Final Trial / Delivered / Return',
    code: 'FTDR',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-600',
    description: 'Successful delivery handover, payment settlement or post-trial rework',
    icon: 'CheckCircle2',
    fields: [
      { key: 'finalTrialDone', label: 'Final Trial Done', type: 'select', options: ['Yes', 'No', 'Not Applicable'] },
      { key: 'deliveryDone', label: 'Delivery Done', type: 'select', options: ['Yes', 'No', 'In Transit'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Delivered to Client', 'Client Trial Approved', 'Returned for Adjustment', 'Exchange Processed'] },
      { key: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Final delivery confirmation, payment cleared...' },
    ]
  }
];

export const UPPER_BODY_MEASUREMENTS = [
  { id: 'frontNeck', label: 'Front Neck', defaultVal: '7.5' },
  { id: 'backNeck', label: 'Back Neck', defaultVal: '9' },
  { id: 'shoulder', label: 'Shoulder', defaultVal: '14' },
  { id: 'upperChest', label: 'Upper Chest', defaultVal: '34' },
  { id: 'chest', label: 'Chest', defaultVal: '36' },
  { id: 'dartPoint', label: 'Dart Point', defaultVal: '10' },
  { id: 'underBust', label: 'Under Bust', defaultVal: '30' },
  { id: 'waist', label: 'Waist', defaultVal: '30' },
  { id: 'belly', label: 'Belly', defaultVal: '33' },
  { id: 'hip', label: 'Hip', defaultVal: '39' },
  { id: 'armhole', label: 'Armhole', defaultVal: '16.5' },
  {
    id: 'sleeveLength',
    label: 'Sleeve Length',
    isDropdownWithSize: true,
    options: ['Full Length', '3/4 Length', 'Half Length', 'Cap Length'],
    defaultType: 'Full Length',
    defaultVal: '18'
  },
  { id: 'bicep', label: 'Bicep', defaultVal: '12' },
  { id: 'elbow', label: 'Elbow', defaultVal: '10' },
  { id: 'wrist', label: 'Wrist', defaultVal: '6.5' },
  { id: 'fullLength', label: 'Full Length', defaultVal: '40' },
  { id: 'kurtiLength', label: 'Kurti Length', defaultVal: '46' },
  { id: 'blouseLength', label: 'Blouse Length', defaultVal: '15' },
  { id: 'topLength', label: 'Top Length', defaultVal: '26' },
  {
    id: 'jacketLength',
    label: 'Jacket Length',
    isDropdownWithSize: true,
    options: ['Full Length', 'Short Length'],
    defaultType: 'Full Length',
    defaultVal: '24'
  },
];

export const LOWER_BODY_MEASUREMENTS = [
  { id: 'skirtLength', label: 'Skirt Length', defaultVal: '42' },
  { id: 'pantLength', label: 'Pant Length', defaultVal: '38' },
  { id: 'pantWaist', label: 'Pant Waist', defaultVal: '30' },
  { id: 'hip', label: 'Hip', defaultVal: '40' },
  { id: 'thigh', label: 'Thigh', defaultVal: '23' },
  { id: 'knee', label: 'Knee', defaultVal: '15.5' },
  { id: 'calf', label: 'Calf', defaultVal: '14' },
  { id: 'crotch', label: 'Crotch', defaultVal: '11' },
  { id: 'crotchRounding', label: 'Crotch Rounding', defaultVal: '26' },
  { id: 'bottomRounding', label: 'Bottom Rounding', defaultVal: '13' },
  { id: 'pantFlare', label: 'Pant Flare', defaultVal: '22' },
  { id: 'skirtFlare', label: 'Skirt Flare', defaultVal: '120' },
];
