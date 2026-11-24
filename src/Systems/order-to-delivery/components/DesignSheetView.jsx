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
  Tag,
  Edit3,
  Eye,
  Hourglass,
  CheckSquare,
  Search,
  X
} from 'lucide-react';
import { useToastAlert } from '../../../core/context/ToastAlertContext';
import { CustomerPhoneDisplay } from '../utils/privacy';
import { canModify, isApexAdmin } from '../utils/userAuthService';

export const DesignSheetView = ({
  order,
  orders = [],
  onSelectOrder,
  onSaveDesignSheet,
  onBack,
  currentUser,
  onViewOrderDetails
}) => {
  const { showToast } = useToastAlert();

  // 3-Tier RBAC: Check if user has modify access to design-sheet or orders
  const canEditDS = isApexAdmin(currentUser) || canModify(currentUser, 'design-sheet') || canModify(currentUser, 'orders');

  // Sub-tabs: 'pending' vs 'history'
  const [tab, setTab] = useState('pending'); // 'pending' | 'history'
  const [searchTerm, setSearchTerm] = useState('');

  // Editing Modal State: when an order's "Update" button is clicked, open modal editor
  const [editingOrder, setEditingOrder] = useState(order || null);

  // Form State for the modal
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

  // When editingOrder changes, load its designSheet or defaults
  useEffect(() => {
    if (editingOrder) {
      if (editingOrder.designSheet) {
        setFormData({
          ...editingOrder.designSheet
        });
      } else {
        setFormData({
          fabricName: '',
          fabricMeters: '',
          embMaterial: '',
          embMaterialColor: '',
          embProcess: editingOrder.embroidery === 'No' ? 'N/A' : 'Hand',
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
    }
  }, [editingOrder?.id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveModal = async (isFinalSubmit = true) => {
    if (!editingOrder) return;
    setSaving(true);
    try {
      const payload = {
        ...formData,
        status: isFinalSubmit ? 'Completed' : 'Draft',
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Staff'
      };

      await onSaveDesignSheet(editingOrder.id, payload);
      showToast(
        isFinalSubmit
          ? `Design Sheet for ${editingOrder.id} submitted successfully!`
          : `Design Sheet draft saved for ${editingOrder.id}.`,
        'success'
      );
      setEditingOrder(null);
    } catch (err) {
      showToast('Failed to save Design Sheet: ' + (err.message || 'Server error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter orders into Pending (not completed) vs History (completed)
  const pendingOrders = orders.filter(
    (o) => !o.designSheet || o.designSheet.status !== 'Completed'
  );
  const completedOrders = orders.filter(
    (o) => o.designSheet && o.designSheet.status === 'Completed'
  );

  const displayedList = (tab === 'pending' ? pendingOrders : completedOrders).filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (o.id || '').toLowerCase().includes(q) ||
      (o.clientName || '').toLowerCase().includes(q) ||
      (o.city || '').toLowerCase().includes(q) ||
      (o.designName || '').toLowerCase().includes(q) ||
      (o.mobile || '').includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Stage Header matching Material Check style */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#5B172E] text-white flex items-center justify-center font-serif font-black text-lg shadow-xs shrink-0">
            DS
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#431021]">
                Atelier Design Sheet
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8] font-bold">
                Workshop Job Card Specifications
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Fabric specifications, EMB material, lining, fusing, boning, trims & workshop execution parameters.
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#DECDB8] text-xs">
            <span className="text-stone-500 font-medium">Pending Specifications: </span>
            <strong className="text-[#5B172E] font-black ml-1 text-sm">{pendingOrders.length}</strong>
          </div>
        </div>
      </div>

      {/* Sub-tabs: 'pending' vs 'history' & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD3] pb-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'pending'
                ? 'bg-[#5B172E] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
            }`}
          >
            <Hourglass className="w-4 h-4" />
            <span>Pending Orders ({pendingOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'history'
                ? 'bg-[#5B172E] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>History ({completedOrders.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, Client, Design..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
          />
        </div>
      </div>

      {/* =========================================================================
          DESKTOP TABLE ROW DIV FORMAT (MATCHING EXACT STAGE / MATERIAL CHECK STYLE)
      ========================================================================= */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                {/* 1st Column: Action Button */}
                <th className="py-3.5 px-4 bg-[#FAF7F2] border-r border-[#DECDB8] text-[#431021] font-extrabold min-w-[130px]">
                  ⚡ Actions
                </th>
                <th className="py-3.5 px-4 min-w-[180px]">Order ID & Client</th>
                <th className="py-3.5 px-4 min-w-[200px]">Design & Size</th>
                <th className="py-3.5 px-4 min-w-[150px]">Target Dates</th>
                <th className="py-3.5 px-4 min-w-[180px]">Design Sheet Status</th>
                <th className="py-3.5 px-4 min-w-[200px]">Fabric & Lining Specs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE7DC]">
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                    <p className="font-semibold text-xs">No orders in this section.</p>
                  </td>
                </tr>
              ) : (
                displayedList.map((ord) => {
                  const ds = ord.designSheet;
                  const isDone = ds?.status === 'Completed';
                  const daysToDelivery = ord.deliveryDate
                    ? Math.ceil((new Date(ord.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <tr key={ord.id} className="hover:bg-[#FCFAF7] transition-colors">
                      {/* Action Button */}
                      <td className="py-3 px-4 bg-white border-r border-[#DECDB8] align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {canEditDS ? (
                            <button
                              type="button"
                              onClick={() => setEditingOrder(ord)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#7A1E3C] hover:from-[#431021] hover:to-[#5B172E] shadow-2xs transition-all active:scale-98 cursor-pointer"
                              title="Update Design Sheet"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isDone ? 'Edit' : 'Update'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingOrder(ord)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 shadow-2xs transition-all cursor-pointer"
                              title="View Design Sheet (Read-Only)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          )}

                          {onViewOrderDetails && (
                            <button
                              type="button"
                              onClick={() => onViewOrderDetails(ord)}
                              className="p-1.5 rounded-lg text-stone-600 hover:text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] shadow-2xs transition-all shrink-0 cursor-pointer"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4 text-[#5B172E]" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Order ID & Client */}
                      <td className="py-3 px-4 align-middle">
                        <button
                          type="button"
                          onClick={() => setEditingOrder(ord)}
                          className="font-bold text-sm text-[#5B172E] hover:underline block text-left"
                        >
                          {ord.id}
                        </button>
                        <div className="font-semibold text-stone-900 text-xs mt-0.5">
                          {ord.clientName}
                        </div>
                        <div className="mt-0.5">
                          <CustomerPhoneDisplay mobile={ord.mobile} currentUser={currentUser} />
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium block">
                          {ord.city || '—'}
                        </span>
                      </td>

                      {/* Design & Size */}
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center gap-2.5">
                          {ord.designImages?.[0] ? (
                            <img
                              src={ord.designImages[0]}
                              alt={ord.designName}
                              className="w-11 h-11 rounded-lg object-cover border border-[#DECDB8] shadow-2xs shrink-0 cursor-pointer"
                              onClick={() => setEditingOrder(ord)}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center font-serif font-bold text-xs border border-[#DECDB8] shrink-0">
                              SG
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-800 text-xs truncate max-w-[150px]">
                              {ord.designName}
                            </p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#9B783E] font-bold text-[10px] border border-[#DECDB8]">
                              Size: {ord.size || 'Custom'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Target Dates */}
                      <td className="py-3 px-4 align-middle whitespace-nowrap">
                        <div className="text-[11px] text-stone-600">
                          Delivery: <strong className="text-stone-900">{ord.deliveryDate || '—'}</strong>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Trial: {ord.trialDate || 'N/A'}
                        </div>
                        {daysToDelivery !== null && (
                          <span
                            className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              daysToDelivery <= 3
                                ? 'bg-rose-100 text-rose-700'
                                : daysToDelivery <= 7
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {daysToDelivery > 0 ? `${daysToDelivery} days left` : 'Due'}
                          </span>
                        )}
                      </td>

                      {/* Design Sheet Status */}
                      <td className="py-3 px-4 align-middle">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Hourglass className="w-3 h-3 text-amber-600" />
                            Pending Submission
                          </span>
                        )}
                        {ds?.updatedAt && (
                          <span className="block text-[10px] text-stone-400 mt-1 font-mono">
                            {new Date(ds.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      {/* Fabric & Lining Specs */}
                      <td className="py-3 px-4 align-middle">
                        {ds?.fabricName ? (
                          <div className="space-y-0.5 text-[11px]">
                            <div className="font-semibold text-stone-800">
                              {ds.fabricName} {ds.fabricMeters ? `(${ds.fabricMeters}m)` : ''}
                            </div>
                            <div className="text-stone-500 text-[10px]">
                              Lining: {ds.lining || '—'} • Fusing: {ds.fusingType || '—'}
                            </div>
                            {ds.components && (
                              <div className="text-[10px] text-[#5B172E] font-medium truncate max-w-[180px]">
                                {ds.components}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">Not entered yet</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MOBILE CARDS ROW FORMAT (MATCHING EXACT STAGE / MATERIAL CHECK STYLE)
      ========================================================================= */}
      <div className="md:hidden space-y-3">
        {displayedList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E8DFD3] text-center text-stone-400 text-xs">
            No orders found in this section.
          </div>
        ) : (
          displayedList.map((ord) => {
            const ds = ord.designSheet;
            const isDone = ds?.status === 'Completed';
            const daysToDelivery = ord.deliveryDate
              ? Math.ceil((new Date(ord.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-[#E8DFD3] p-4 shadow-xs space-y-3"
              >
                {/* Top Row: Order ID, Client, Countdown Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-[#F0E6D8] pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingOrder(ord)}
                        className="font-serif font-bold text-base text-[#5B172E] hover:underline"
                      >
                        {ord.id}
                      </button>
                      <span className="text-xs font-semibold text-stone-800">
                        {ord.clientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                      <CustomerPhoneDisplay mobile={ord.mobile} currentUser={currentUser} />
                      <span>•</span>
                      <span>{ord.city || '—'}</span>
                    </div>
                  </div>

                  {daysToDelivery !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        daysToDelivery <= 3
                          ? 'bg-rose-100 text-rose-700'
                          : daysToDelivery <= 7
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {daysToDelivery > 0 ? `${daysToDelivery}d left` : 'Due'}
                    </span>
                  )}
                </div>

                {/* Middle Row: Image, Design Name & Target Dates */}
                <div className="flex items-center gap-3">
                  {ord.designImages?.[0] ? (
                    <img
                      src={ord.designImages[0]}
                      alt={ord.designName}
                      className="w-14 h-14 rounded-xl object-cover border border-[#DECDB8] shadow-2xs shrink-0 cursor-pointer"
                      onClick={() => setEditingOrder(ord)}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center font-serif font-bold text-sm border border-[#DECDB8] shrink-0">
                      SG
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-800 text-xs line-clamp-1">
                      {ord.designName}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#9B783E] font-bold text-[10px] border border-[#DECDB8]">
                        Size: {ord.size || 'Custom'}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Delivery: <strong>{ord.deliveryDate || '—'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Status Badge & Update Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D8]">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      DS Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700">
                      <Hourglass className="w-3.5 h-3.5" />
                      DS Pending
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setEditingOrder(ord)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#7A1E3C] shadow-2xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Edit DS' : 'Update DS'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          UPDATE MODAL: FULL ATELIER DESIGN SHEET FORM
      ========================================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs shrink-0">
                  DS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-bold text-[#431021]">
                      Update Atelier Design Sheet
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#F2ECE1] text-[#9B783E]">
                      {editingOrder.id}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Client: <strong>{editingOrder.clientName}</strong> • {editingOrder.designName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Form Fields */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs scrollbar-thin">
              {/* Read-Only Carried Header */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E8DFD3] shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9B783E] mb-2">
                  Order Credentials (Locked & Carried Forward)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Client</span>
                    <strong className="text-stone-800">{editingOrder.clientName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Design & SKU</span>
                    <strong className="text-stone-800">{editingOrder.designName} {editingOrder.skuCode ? `(${editingOrder.skuCode})` : ''}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Size</span>
                    <strong className="text-stone-800">{editingOrder.size || 'Custom'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Target Delivery</span>
                    <strong className="text-[#5B172E] font-bold">{editingOrder.deliveryDate || '—'}</strong>
                  </div>
                </div>
              </div>

              {/* 1. Fabric & Embroidery */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8DFD3] shadow-xs space-y-3.5">
                <h4 className="font-serif font-bold text-sm text-[#431021] border-b pb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#9B783E]" />
                  <span>1. Fabric & Embroidery Specifications</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Fabric - Which? *</label>
                    <input
                      type="text"
                      value={formData.fabricName}
                      onChange={(e) => handleChange('fabricName', e.target.value)}
                      placeholder="e.g. Raw Silk, Organza"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Fabric Quantity (Mtr) *</label>
                    <input
                      type="text"
                      value={formData.fabricMeters}
                      onChange={(e) => handleChange('fabricMeters', e.target.value)}
                      placeholder="e.g. 4.5 Mtr"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Embroidery Process</label>
                    <select
                      value={formData.embProcess}
                      onChange={(e) => handleChange('embProcess', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg font-medium"
                    >
                      <option value="Hand">Hand Embroidery</option>
                      <option value="Machine">Machine Process</option>
                      <option value="Both">Both (Hand + Machine)</option>
                      <option value="N/A">Not Applicable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">EMB Material</label>
                    <input
                      type="text"
                      value={formData.embMaterial}
                      onChange={(e) => handleChange('embMaterial', e.target.value)}
                      placeholder="e.g. Zari, Dabka, Cutdana"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">EMB Material Colour</label>
                    <input
                      type="text"
                      value={formData.embMaterialColor}
                      onChange={(e) => handleChange('embMaterialColor', e.target.value)}
                      placeholder="e.g. Antique Gold & Champagne"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Tailoring, Structure & Silhouette */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8DFD3] shadow-xs space-y-3.5">
                <h4 className="font-serif font-bold text-sm text-[#431021] border-b pb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#9B783E]" />
                  <span>2. Tailoring, Silhouette & Internal Structure</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Lining</label>
                    <input
                      type="text"
                      value={formData.lining}
                      onChange={(e) => handleChange('lining', e.target.value)}
                      placeholder="e.g. Cotton Mulmul / Santoon"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Fusing — Konsa Fusing Rahega?</label>
                    <input
                      type="text"
                      value={formData.fusingType}
                      onChange={(e) => handleChange('fusingType', e.target.value)}
                      placeholder="e.g. Microdot Paper / Canvas"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Padded</label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={formData.padded}
                        onChange={(e) => handleChange('padded', e.target.value)}
                        className="w-20 px-2 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {formData.padded === 'Yes' && (
                        <input
                          type="text"
                          value={formData.paddedDetails}
                          onChange={(e) => handleChange('paddedDetails', e.target.value)}
                          placeholder="Cup size"
                          className="flex-1 px-2 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Shoulder Pads</label>
                    <select
                      value={formData.shoulderPads}
                      onChange={(e) => handleChange('shoulderPads', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Can-Can</label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={formData.canCan}
                        onChange={(e) => handleChange('canCan', e.target.value)}
                        className="w-20 px-2 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      {formData.canCan === 'Yes' && (
                        <input
                          type="text"
                          value={formData.canCanDetails}
                          onChange={(e) => handleChange('canCanDetails', e.target.value)}
                          placeholder="e.g. 3.5m Hard Net"
                          className="flex-1 px-2 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Boning (Specify)</label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={formData.boning}
                        onChange={(e) => handleChange('boning', e.target.value)}
                        className="w-20 px-2 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                      {formData.boning === 'Yes' && (
                        <input
                          type="text"
                          value={formData.boningDetails}
                          onChange={(e) => handleChange('boningDetails', e.target.value)}
                          placeholder="e.g. 6 Bones"
                          className="flex-1 px-2 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Fit</label>
                    <select
                      value={formData.fitType}
                      onChange={(e) => handleChange('fitType', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="Slim Fit">Slim Fit</option>
                      <option value="Comfort Fit">Comfort Fit</option>
                      <option value="Relaxed Fit">Relaxed Fit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Dart Mention — Types</label>
                    <select
                      value={formData.dartType}
                      onChange={(e) => handleChange('dartType', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="Princess Seam">Princess Seam</option>
                      <option value="4-Dart">4-Dart Cut</option>
                      <option value="Waist Dart">Waist Dart</option>
                      <option value="Side Dart">Side Dart</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Flare (Mtr)</label>
                    <input
                      type="text"
                      value={formData.flareMeters}
                      onChange={(e) => handleChange('flareMeters', e.target.value)}
                      placeholder="e.g. 5.5 Mtr"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Measurement Specification & Cutter Notes</label>
                    <input
                      type="text"
                      value={formData.measurementNotes}
                      onChange={(e) => handleChange('measurementNotes', e.target.value)}
                      placeholder="Specific alterations or instructions for master..."
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Fastenings, Trims & Accessories */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8DFD3] shadow-xs space-y-3.5">
                <h4 className="font-serif font-bold text-sm text-[#431021] border-b pb-2 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#9B783E]" />
                  <span>3. Fastenings, Trims & Accessories</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Zip</label>
                    <select
                      value={formData.zip}
                      onChange={(e) => handleChange('zip', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="Side Concealed">Side Concealed Zip</option>
                      <option value="Back Concealed">Back Concealed Zip</option>
                      <option value="Front Metal">Front Metal Zip</option>
                      <option value="Not Required">Not Required</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Hook & Eye</label>
                    <select
                      value={formData.hookEye}
                      onChange={(e) => handleChange('hookEye', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="Handmade">Handmade Eye & Hook</option>
                      <option value="Ready-made">Ready-made Strip</option>
                      <option value="Not Required">Not Required</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Button Colour</label>
                    <input
                      type="text"
                      value={formData.buttonColor}
                      onChange={(e) => handleChange('buttonColor', e.target.value)}
                      placeholder="e.g. Self matching dyed"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Kaaj Colour</label>
                    <input
                      type="text"
                      value={formData.kaajColor}
                      onChange={(e) => handleChange('kaajColor', e.target.value)}
                      placeholder="e.g. Matching silk thread"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Trim Details</label>
                    <input
                      type="text"
                      value={formData.trim}
                      onChange={(e) => handleChange('trim', e.target.value)}
                      placeholder="e.g. Gota border"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tassel / Latkan</label>
                    <input
                      type="text"
                      value={formData.tassel}
                      onChange={(e) => handleChange('tassel', e.target.value)}
                      placeholder="e.g. Handcrafted beaded"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div className="flex items-center sm:col-span-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.hangerStraps}
                        onChange={(e) => handleChange('hangerStraps', e.target.checked)}
                        className="w-4 h-4 rounded text-[#5B172E] border-[#DECDB8]"
                      />
                      <span className="text-xs font-bold text-stone-700">Add Hanger Straps (Tick Box: Yes)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Workshop Execution & Dates */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8DFD3] shadow-xs space-y-3.5">
                <h4 className="font-serif font-bold text-sm text-[#431021] border-b pb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9B783E]" />
                  <span>4. Workshop Execution & Dates</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Same As Picture?</label>
                    <select
                      value={formData.sameAsPicture}
                      onChange={(e) => handleChange('sameAsPicture', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Hem Finish</label>
                    <select
                      value={formData.hemFinish}
                      onChange={(e) => handleChange('hemFinish', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="Bakram Fold">Bakram Fold</option>
                      <option value="Double Fold">Double Fold</option>
                      <option value="Piping">Piping</option>
                      <option value="Pico">Pico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Kacha Trial</label>
                    <select
                      value={formData.kachaTrial}
                      onChange={(e) => handleChange('kachaTrial', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="Not Required">Not Required</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Interlock</label>
                    <select
                      value={formData.interlock}
                      onChange={(e) => handleChange('interlock', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Expected Cutting Date</label>
                    <input
                      type="date"
                      value={formData.expectedCuttingDate}
                      onChange={(e) => handleChange('expectedCuttingDate', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Components *</label>
                    <input
                      type="text"
                      value={formData.components}
                      onChange={(e) => handleChange('components', e.target.value)}
                      placeholder="e.g. Lehenga + Blouse + Dupatta"
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg font-bold text-[#431021]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Extra Design Specification</label>
                    <textarea
                      rows={2}
                      value={formData.extraDesignSpec}
                      onChange={(e) => handleChange('extraDesignSpec', e.target.value)}
                      placeholder="Any specific instructions for workshop masters..."
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-[#E8DFD3] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {canEditDS ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSaveModal(false)}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] cursor-pointer disabled:opacity-50"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveModal(true)}
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] via-[#6B1B37] to-[#802243] hover:from-[#431021] hover:to-[#5B172E] shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {saving ? 'Submitting...' : 'Submit Design Sheet'}
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>View Only (No Modify Permission)</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
