import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Scissors,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Printer,
  ChevronDown,
  Info,
  Check,
  Ruler,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { useToastAlert } from '../../../core/context/ToastAlertContext';
import { maskCustomerMobile } from '../utils/privacy';

export const DesignSheetView = ({
  order,
  orders = [],
  onSelectOrder,
  onSaveDesignSheet,
  onBack,
  currentUser
}) => {
  const { showToast } = useToastAlert();

  // Selected Order
  const activeOrder = order || orders[0] || null;

  // Form State initialized with existing sheet or defaults
  const [formData, setFormData] = useState({
    // Section 1: Fabric & Embroidery Specifications
    fabricName: '',
    fabricMeters: '',
    embMaterial: '',
    embMaterialColor: '',
    embProcess: 'Hand',

    // Section 2: Tailoring, Silhouette & Internal Structure
    lining: '',
    fusingType: '',
    padded: 'No',
    paddedDetails: '',
    shoulderPads: 'No',
    canCan: 'No',
    canCanDetails: '',
    boning: 'No',
    boningDetails: '',
    measurementNotes: '',
    flareMeters: '',
    fitType: 'Slim Fit',
    dartType: 'Princess Seam',

    // Section 3: Fastenings, Trims & Accessories
    zip: 'Side Concealed',
    hookEye: 'Handmade',
    trim: '',
    tassel: '',
    buttonColor: '',
    kaajColor: '',
    hangerStraps: false,

    // Section 4: Workshop Execution & Dates
    sameAsPicture: 'Yes',
    extraDesignSpec: '',
    hemFinish: 'Bakram Fold',
    kachaTrial: 'Yes',
    interlock: 'Yes',
    expectedCuttingDate: '',
    components: ''
  });

  const [saving, setSaving] = useState(false);

  // Sync state whenever activeOrder changes
  useEffect(() => {
    if (activeOrder?.designSheet) {
      setFormData((prev) => ({
        ...prev,
        ...activeOrder.designSheet
      }));
    } else {
      // Prefill defaults
      setFormData({
        fabricName: '',
        fabricMeters: '',
        embMaterial: '',
        embMaterialColor: '',
        embProcess: activeOrder?.embroidery === 'No' ? 'N/A' : 'Hand',
        lining: '',
        fusingType: '',
        padded: 'No',
        paddedDetails: '',
        shoulderPads: 'No',
        canCan: 'No',
        canCanDetails: '',
        boning: 'No',
        boningDetails: '',
        measurementNotes: '',
        flareMeters: '',
        fitType: 'Slim Fit',
        dartType: 'Princess Seam',
        zip: 'Side Concealed',
        hookEye: 'Handmade',
        trim: '',
        tassel: '',
        buttonColor: '',
        kaajColor: '',
        hangerStraps: false,
        sameAsPicture: 'Yes',
        extraDesignSpec: '',
        hemFinish: 'Bakram Fold',
        kachaTrial: 'Yes',
        interlock: 'Yes',
        expectedCuttingDate: '',
        components: ''
      });
    }
  }, [activeOrder?.id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (isFinalSubmit = true) => {
    if (!activeOrder) {
      showToast('No active order selected.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        status: isFinalSubmit ? 'Completed' : 'Draft',
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Staff'
      };

      await onSaveDesignSheet(activeOrder.id, payload);
      showToast(
        isFinalSubmit
          ? `Design Sheet for ${activeOrder.id} submitted successfully!`
          : `Design Sheet draft saved for ${activeOrder.id}.`,
        'success'
      );
    } catch (err) {
      showToast('Failed to save Design Sheet: ' + (err.message || 'Server error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!activeOrder) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-[#E8DFD3] text-center shadow-xs">
        <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h3 className="font-serif text-lg font-bold text-stone-700">No Orders Available</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Create an order first to fill its atelier design sheet specifications.
        </p>
      </div>
    );
  }

  const isSubmitted = activeOrder.designSheet?.status === 'Completed';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD3] shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-[#FAF8F5] border border-[#DECDB8] hover:bg-[#F3ECE2] text-stone-700 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B172E] to-[#431021] text-white flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-5 h-5 text-[#FAF6F0]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#431021]">
                Atelier Design Sheet
              </h2>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                isSubmitted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {isSubmitted ? '✓ Specification Completed' : '• Pending Specification'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Couture job card specifications continuing from order creation to workshop execution.
            </p>
          </div>
        </div>

        {/* Order Selector (if multiple orders present) */}
        {orders.length > 1 && onSelectOrder && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 hidden sm:inline">Select Order:</span>
            <select
              value={activeOrder.id}
              onChange={(e) => {
                const found = orders.find((o) => o.id === e.target.value);
                if (found) onSelectOrder(found);
              }}
              className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-bold text-[#431021] focus:ring-2 focus:ring-[#5B172E]/30"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.clientName} ({o.designName})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* READ-ONLY SUMMARY HEADER: Automatically Carried From Order Creation (No Re-Entry) */}
      <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-[#F6EFE6] border border-[#DECDB8] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9B783E]">
              Order Credentials (Auto-Carried)
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Created: {new Date(activeOrder.createdAt || Date.now()).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Order ID</span>
            <span className="text-sm font-black text-[#5B172E] font-mono mt-0.5 block">{activeOrder.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Client Name</span>
            <span className="font-bold text-stone-800 mt-0.5 block truncate">{activeOrder.clientName}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Mobile</span>
            <span className="font-medium text-stone-700 mt-0.5 block font-mono">
              {maskCustomerMobile(activeOrder.mobile, currentUser)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Design & SKU</span>
            <span className="font-bold text-[#431021] mt-0.5 block truncate">
              {activeOrder.designName} {activeOrder.skuCode ? `(${activeOrder.skuCode})` : ''}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Date Of Delivery (DOD)</span>
            <span className="font-bold text-stone-800 mt-0.5 block">{activeOrder.deliveryDate || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Date Of Trial</span>
            <span className="font-medium text-stone-600 mt-0.5 block">{activeOrder.trialDate || 'Optional / None'}</span>
          </div>
        </div>

        {/* Existing Measurements & Photos Peek */}
        <div className="mt-3 pt-3 border-t border-[#E8DFD3]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#9B783E]" />
              <strong>Size:</strong> {activeOrder.size || 'Custom Fit'}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9B783E]" />
              <strong>Embroidery:</strong> {activeOrder.embroidery || 'Yes'}
            </span>
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#9B783E]" />
              <strong>Photos Attached:</strong> {(activeOrder.designImages?.length || 0) + (activeOrder.inspirationImages?.length || 0)} images
            </span>
          </div>
          <span className="text-[11px] text-[#5B172E] font-medium bg-[#5B172E]/10 px-2.5 py-0.5 rounded-full">
            All order form data is permanently locked & carried forward
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: FABRIC & EMBROIDERY SPECIFICATIONS
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFD3]">
          <div className="p-1.5 rounded-lg bg-[#5B172E]/10 text-[#5B172E]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#431021]">1. Fabric & Embroidery Specifications</h3>
            <p className="text-[11px] text-stone-500">Workshop material parameters & craft process</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Fabric - which */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Fabric - Which? *
            </label>
            <input
              type="text"
              value={formData.fabricName}
              onChange={(e) => handleChange('fabricName', e.target.value)}
              placeholder="e.g. Raw Silk, Pure Organza, Velvet"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Fabric Quantity (Mtr) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Fabric Quantity (Mtr) *
            </label>
            <input
              type="text"
              value={formData.fabricMeters}
              onChange={(e) => handleChange('fabricMeters', e.target.value)}
              placeholder="e.g. 4.5 Mtr"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Embroidery Material */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Embroidery Material *
            </label>
            <input
              type="text"
              value={formData.embMaterial}
              onChange={(e) => handleChange('embMaterial', e.target.value)}
              placeholder="e.g. Antique Zari, Cutdana, Dabka"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Embroidery Material Colour */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Embroidery Material Colour
            </label>
            <input
              type="text"
              value={formData.embMaterialColor}
              onChange={(e) => handleChange('embMaterialColor', e.target.value)}
              placeholder="e.g. Dull Gold & Champagne"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Emb Process: Hand or Machine */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Embroidery Process
            </label>
            <select
              value={formData.embProcess}
              onChange={(e) => handleChange('embProcess', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 font-medium"
            >
              <option value="Hand">Hand Embroidery Process</option>
              <option value="Machine">Machine Process</option>
              <option value="Both">Both (Hand + Machine)</option>
              <option value="N/A">Not Applicable</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: TAILORING, SILHOUETTE & INTERNAL STRUCTURE
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFD3]">
          <div className="p-1.5 rounded-lg bg-[#5B172E]/10 text-[#5B172E]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#431021]">2. Tailoring, Silhouette & Internal Structure</h3>
            <p className="text-[11px] text-stone-500">Lining, Fusing, Boning, Can-can, Pads & Fitting specs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Lining */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Lining Fabric
            </label>
            <input
              type="text"
              value={formData.lining}
              onChange={(e) => handleChange('lining', e.target.value)}
              placeholder="e.g. Cotton Mulmul / Santoon / Crepe"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Fusing (Konsa Fusing Rahega) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Fusing — Konsa Fusing Rahega?
            </label>
            <input
              type="text"
              value={formData.fusingType}
              onChange={(e) => handleChange('fusingType', e.target.value)}
              placeholder="e.g. Microdot Paper / Canvas Fusing / Heavy"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Padded */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Padded
            </label>
            <div className="flex items-center gap-2">
              <select
                value={formData.padded}
                onChange={(e) => handleChange('padded', e.target.value)}
                className="w-24 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {formData.padded === 'Yes' && (
                <input
                  type="text"
                  value={formData.paddedDetails}
                  onChange={(e) => handleChange('paddedDetails', e.target.value)}
                  placeholder="Cup size e.g. 34 Round"
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl"
                />
              )}
            </div>
          </div>

          {/* Shoulder Pads */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Shoulder Pads
            </label>
            <select
              value={formData.shoulderPads}
              onChange={(e) => handleChange('shoulderPads', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {/* Can-Can */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Can-Can
            </label>
            <div className="flex items-center gap-2">
              <select
                value={formData.canCan}
                onChange={(e) => handleChange('canCan', e.target.value)}
                className="w-24 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
              {formData.canCan === 'Yes' && (
                <input
                  type="text"
                  value={formData.canCanDetails}
                  onChange={(e) => handleChange('canCanDetails', e.target.value)}
                  placeholder="e.g. Hard Net 3.5m"
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl"
                />
              )}
            </div>
          </div>

          {/* Boning */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Boning (Specify)
            </label>
            <div className="flex items-center gap-2">
              <select
                value={formData.boning}
                onChange={(e) => handleChange('boning', e.target.value)}
                className="w-24 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
              {formData.boning === 'Yes' && (
                <input
                  type="text"
                  value={formData.boningDetails}
                  onChange={(e) => handleChange('boningDetails', e.target.value)}
                  placeholder="e.g. 6 Bones (Front/Sides)"
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl"
                />
              )}
            </div>
          </div>

          {/* Fit: Slim Fit, Comfort Fit */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Fit
            </label>
            <select
              value={formData.fitType}
              onChange={(e) => handleChange('fitType', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="Slim Fit">Slim Fit</option>
              <option value="Comfort Fit">Comfort Fit</option>
              <option value="Relaxed Fit">Relaxed Fit</option>
            </select>
          </div>

          {/* Dart Mention: Types */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Dart Mention — Types
            </label>
            <select
              value={formData.dartType}
              onChange={(e) => handleChange('dartType', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="Princess Seam">Princess Seam</option>
              <option value="4-Dart">4-Dart Cut</option>
              <option value="Waist Dart">Waist Dart</option>
              <option value="Side Dart">Side Dart</option>
              <option value="None">None / Plain Cut</option>
            </select>
          </div>

          {/* Flare (Mtr) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Flare (Mtr)
            </label>
            <input
              type="text"
              value={formData.flareMeters}
              onChange={(e) => handleChange('flareMeters', e.target.value)}
              placeholder="e.g. 5.5 Mtr Ghera"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Measurement Specification */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Measurement Specification & Cutter Notes
            </label>
            <input
              type="text"
              value={formData.measurementNotes}
              onChange={(e) => handleChange('measurementNotes', e.target.value)}
              placeholder="Specific alterations e.g. Extra 2 inches inner margin, low back neck 10.5 inch..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: FASTENINGS, TRIMS & ACCESSORIES
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFD3]">
          <div className="p-1.5 rounded-lg bg-[#5B172E]/10 text-[#5B172E]">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#431021]">3. Fastenings, Trims & Accessories</h3>
            <p className="text-[11px] text-stone-500">Zips, Hook & Eye, Buttons, Kaaj, Trims & Tassels</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Zip */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Zip
            </label>
            <select
              value={formData.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="Side Concealed">Side Concealed Zip</option>
              <option value="Back Concealed">Back Concealed Zip</option>
              <option value="Front Metal">Front Metal Zip</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

          {/* Hook & Eye: Ready / Hand Made */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Hook & Eye
            </label>
            <select
              value={formData.hookEye}
              onChange={(e) => handleChange('hookEye', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="Handmade">Handmade Eye & Hook</option>
              <option value="Ready-made">Ready-made Strip</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

          {/* Button Colour */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Button Colour
            </label>
            <input
              type="text"
              value={formData.buttonColor}
              onChange={(e) => handleChange('buttonColor', e.target.value)}
              placeholder="e.g. Matching dyed / Golden antique"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Kaaj Colour */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kaaj Colour
            </label>
            <input
              type="text"
              value={formData.kaajColor}
              onChange={(e) => handleChange('kaajColor', e.target.value)}
              placeholder="e.g. Self matching silk thread"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Trim */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Trim / Lace Details
            </label>
            <input
              type="text"
              value={formData.trim}
              onChange={(e) => handleChange('trim', e.target.value)}
              placeholder="e.g. Gota border, piping on neckline"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Tassel */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tassel / Latkan
            </label>
            <input
              type="text"
              value={formData.tassel}
              onChange={(e) => handleChange('tassel', e.target.value)}
              placeholder="e.g. Heavy handcrafted beaded latkans"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>

          {/* Add Hanger Straps (Tick Box Yes/No) */}
          <div className="flex items-center sm:col-span-2 pt-5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.hangerStraps}
                onChange={(e) => handleChange('hangerStraps', e.target.checked)}
                className="w-4 h-4 rounded text-[#5B172E] border-[#DECDB8] focus:ring-[#5B172E]"
              />
              <span className="text-xs font-bold text-stone-700">
                Add Hanger Straps (Tick Box: Yes)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: WORKSHOP EXECUTION & DATES
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFD3]">
          <div className="p-1.5 rounded-lg bg-[#5B172E]/10 text-[#5B172E]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#431021]">4. Workshop Execution & Dates</h3>
            <p className="text-[11px] text-stone-500">Hem finish, Kacha trial, Interlock, Cutting date & Components</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Same as picture */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Same As Picture?
            </label>
            <select
              value={formData.sameAsPicture}
              onChange={(e) => handleChange('sameAsPicture', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="Yes">Yes (Exact replica)</option>
              <option value="No">No (With custom modifications)</option>
            </select>
          </div>

          {/* Hem Finish */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Hem Finish
            </label>
            <select
              value={formData.hemFinish}
              onChange={(e) => handleChange('hemFinish', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="Bakram Fold">Bakram Fold</option>
              <option value="Double Fold">Standard Double Fold</option>
              <option value="Piping">Piping Finish</option>
              <option value="Pico">Pico / Overlock Finish</option>
            </select>
          </div>

          {/* Kacha trial / Not */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kacha Trial
            </label>
            <select
              value={formData.kachaTrial}
              onChange={(e) => handleChange('kachaTrial', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="Yes">Yes (Kacha Trial Required)</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

          {/* Interlock */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Interlock
            </label>
            <select
              value={formData.interlock}
              onChange={(e) => handleChange('interlock', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl font-medium"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Expected Cutting Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Expected Cutting Date
            </label>
            <input
              type="date"
              value={formData.expectedCuttingDate}
              onChange={(e) => handleChange('expectedCuttingDate', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 font-medium"
            />
          </div>

          {/* Component */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Garment Components *
            </label>
            <input
              type="text"
              value={formData.components}
              onChange={(e) => handleChange('components', e.target.value)}
              placeholder="e.g. Lehenga + Blouse + Dupatta + Belt"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 font-semibold text-[#431021]"
            />
          </div>

          {/* Extra design specification */}
          <div className="col-span-full">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Extra Design Specification
            </label>
            <textarea
              rows={2}
              value={formData.extraDesignSpec}
              onChange={(e) => handleChange('extraDesignSpec', e.target.value)}
              placeholder="Enter any other specific design instructions for the master cutter and tailoring team..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM SUBMISSION BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Info className="w-4 h-4 text-[#9B783E]" />
          <span>
            Once submitted, these specifications are locked and carry forward to Material Check & Marking/Cutting.
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#DECDB8] hover:bg-[#F3ECE2] text-xs font-bold text-stone-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B172E] via-[#6B1B37] to-[#802243] hover:from-[#431021] hover:to-[#5B172E] text-white text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Submitting...' : 'Submit Design Sheet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
