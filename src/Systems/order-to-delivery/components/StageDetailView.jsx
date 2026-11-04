import React, { useState } from 'react';
import {
  PackageCheck,
  Scissors,
  Sparkles,
  UserCheck,
  CheckSquare,
  ClipboardCheck,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Phone,
  Ruler,
  Eye,
  ArrowRight,
  AlertCircle,
  FileText,
  Clock,
  Save,
  Check,
  History as HistoryIcon,
  Hourglass,
  Tag,
  Edit3,
  Layers
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { StageUpdateModal } from './StageUpdateModal';
import { CustomerPhoneDisplay } from '../utils/privacy';

export const StageDetailView = ({
  orders = [],
  selectedStageId = 'material_check',
  currentUser,
  onSelectStage,
  onUpdateStageData,
  onAdvanceStage,
  onViewOrderDetails,
  onOpenMeasurements
}) => {
  const currentStage = STAGES.find(s => s.id === selectedStageId) || STAGES[0];
  const currentStageIndex = STAGES.findIndex(s => s.id === selectedStageId);

  // Sub-tabs: 'pending' vs 'history'
  const [stageTab, setStageTab] = useState('pending'); // 'pending' | 'history'

  // Popup Modal State for updating stage inputs (AS REQUESTED)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);

  // Orders currently pending at this stage
  const pendingOrders = orders.filter(o => o.currentStageId === selectedStageId);

  // Orders that have passed or completed this stage in the past
  const historyOrders = orders.filter(o =>
    o.currentStageIndex > currentStageIndex ||
    (o.stageData && o.stageData[selectedStageId] && o.currentStageId !== selectedStageId)
  );

  const handleOpenUpdateModal = (order) => {
    // Orders in history cannot be updated; only pending orders can be updated
    if (stageTab === 'history') return;
    setSelectedOrderForUpdate(order);
    setIsUpdateModalOpen(true);
  };

  const handleSaveStageDataOnly = (orderId, stgId, updatedFields) => {
    onUpdateStageData(orderId, stgId, updatedFields);
  };

  const handleSaveAndAdvanceStage = (orderId, stgId, updatedFields) => {
    onAdvanceStage(orderId, stgId, updatedFields);
  };

  return (
    <div className="space-y-4">
      {/* CLEAN STAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8DFD3]">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs shrink-0">
            {currentStageIndex + 1}
          </span>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#431021] leading-tight">
              {currentStage.name}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {currentStage.description}
            </p>
          </div>
        </div>

        {/* Live Pending Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-white border border-[#DECDB8] text-stone-700 shadow-2xs">
            Active in Stage: <strong className="text-[#5B172E] font-bold">{pendingOrders.length}</strong>
          </span>
        </div>
      </div>

      {/* PENDING & HISTORY TABS */}
      <div className="flex items-center space-x-2 border-b border-[#E8DFD3] pb-1">
        <button
          onClick={() => setStageTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${stageTab === 'pending'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
            }`}
        >
          <Hourglass className="w-4 h-4" />
          <span>Pending Orders ({pendingOrders.length})</span>
        </button>

        <button
          onClick={() => setStageTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${stageTab === 'history'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
            }`}
        >
          <HistoryIcon className="w-4 h-4" />
          <span>History ({historyOrders.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. PENDING TAB                                            */}
      {/* TABLE FOR DESKTOP (MD+) / CARDS FOR MOBILE PHONES (< MD)  */}
      {/* ========================================================= */}
      {stageTab === 'pending' && (
        pendingOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#DECDB8] p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center mx-auto mb-3">
              <PackageCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#431021]">
              No Orders Currently Pending in {currentStage.name}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
              All orders in this stage have been cleared! You can review past orders under the <strong>History</strong> tab.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP SPREADSHEET TABLE (HIDDEN ON PHONES < md) */}
            <div className="hidden md:block bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">

                      {/* 1ST COLUMN: ALL ACTION BUTTONS IN ONE ROW */}
                      <th className="py-3.5 px-3 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[135px]">
                        ⚡ Actions
                      </th>

                      <th className="py-3.5 px-4 min-w-[170px]">Order ID & Client</th>
                      <th className="py-3.5 px-4 min-w-[190px]">Design & Size</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Target Dates</th>

                      {/* DEDICATED COLUMN HEADERS FOR DISPLAYING EACH STAGE FIELD */}
                      {currentStage.fields.map((field) => (
                        <th key={field.key} className="py-3.5 px-4 min-w-[170px] bg-stone-50/70 border-l border-[#EFE7DC]">
                          <span className="text-[#5B172E] font-bold">{field.label}</span>
                        </th>
                      ))}

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DC]">
                    {pendingOrders.map((order) => {
                      const daysToDelivery = Math.ceil((new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
                      const stageVals = order.stageData?.[selectedStageId] || {};

                      return (
                        <tr key={order.id} className="hover:bg-[#FCFAF7] transition-colors">

                          {/* 1ST COLUMN: ALL ACTION BUTTONS IN ONE ROW */}
                          <td className="py-2.5 px-3 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {/* Update Button */}
                              <button
                                onClick={() => handleOpenUpdateModal(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#7A1E3C] hover:from-[#431021] hover:to-[#5B172E] shadow-2xs transition-all active:scale-98 shrink-0"
                                title="Update Stage Parameters"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Update</span>
                              </button>

                              {/* View Button (Eye Icon Only, No Text) */}
                              <button
                                onClick={() => onViewOrderDetails(order, false)}
                                className="p-1.5 rounded-lg text-stone-600 hover:text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] shadow-2xs transition-all shrink-0 flex items-center justify-center"
                                title="View Order Details"
                              >
                                <Eye className="w-4 h-4 text-[#5B172E]" />
                              </button>
                            </div>
                          </td>

                          {/* Order ID & Client */}
                          <td className="py-3 px-4 align-middle">
                            <button
                              onClick={() => onViewOrderDetails(order)}
                              className="font-bold text-sm text-[#5B172E] hover:underline"
                            >
                              {order.id}
                            </button>
                            <div className="font-semibold text-stone-900 text-xs mt-0.5">
                              {order.clientName}
                            </div>
                            <div className="mt-0.5">
                              <CustomerPhoneDisplay mobile={order.mobile} currentUser={currentUser} />
                            </div>
                            <span className="text-[10px] text-stone-400 font-medium block">
                              {order.city}
                            </span>
                          </td>

                          {/* Design & Size (Unique Distinct Couture Image) */}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex items-center gap-2.5">
                              {order.designImages?.[0] ? (
                                <img
                                  src={order.designImages[0]}
                                  alt={order.designName}
                                  className="w-11 h-11 rounded-lg object-cover border border-[#DECDB8] shadow-2xs shrink-0 cursor-pointer"
                                  onClick={() => onViewOrderDetails(order)}
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center font-serif font-bold text-xs border border-[#DECDB8] shrink-0">
                                  SG
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-stone-800 text-xs truncate max-w-[150px]">
                                  {order.designName}
                                </p>
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#9B783E] font-bold text-[10px] border border-[#DECDB8]">
                                  Size: {order.size}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Target Dates */}
                          <td className="py-3 px-4 align-middle whitespace-nowrap">
                            <div className="text-[11px] text-stone-600">
                              Delivery: <strong className="text-stone-900">{order.deliveryDate}</strong>
                            </div>
                            <div className="text-[11px] text-stone-500">
                              Trial: {order.trialDate || 'N/A'}
                            </div>
                            <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${daysToDelivery <= 3
                                ? 'bg-rose-100 text-rose-700'
                                : daysToDelivery <= 7
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                              {daysToDelivery > 0 ? `${daysToDelivery} days left` : 'Due'}
                            </span>
                          </td>

                          {/* PURE DISPLAY COLUMNS (NO INLINE FORM INPUTS) */}
                          {currentStage.fields.map((field) => {
                            const val = stageVals[field.key];

                            return (
                              <td key={field.key} className="py-3 px-4 border-l border-[#EFE7DC] align-middle">
                                {val ? (
                                  field.type === 'select' ? (
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${val.toLowerCase().includes('yes') || val.toLowerCase().includes('passed') || val.toLowerCase().includes('approved')
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : val.toLowerCase().includes('no') || val.toLowerCase().includes('rework') || val.toLowerCase().includes('failed')
                                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}>
                                      {val}
                                    </span>
                                  ) : (
                                    <span className="font-medium text-stone-800 line-clamp-2" title={val}>
                                      {val}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[11px] text-stone-300 italic">
                                    — Not filled
                                  </span>
                                )}
                              </td>
                            );
                          })}

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE ATELIER CARDS (SPECIALLY OPTIMIZED FOR PHONES < md) */}
            <div className="md:hidden space-y-3.5">
              {pendingOrders.map((order) => {
                const daysToDelivery = Math.ceil((new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
                const stageVals = order.stageData?.[selectedStageId] || {};

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#E8DFD3] p-4 shadow-xs space-y-3 animate-in fade-in duration-150"
                  >
                    {/* Top Row: Order ID, Client, Countdown Badge */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#F0E6D8] pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewOrderDetails(order)}
                            className="font-serif font-bold text-base text-[#5B172E] hover:underline"
                          >
                            {order.id}
                          </button>
                          <span className="text-xs font-semibold text-stone-800">
                            {order.clientName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                          <CustomerPhoneDisplay mobile={order.mobile} currentUser={currentUser} />
                          <span>•</span>
                          <span>{order.city}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${daysToDelivery <= 3
                          ? 'bg-rose-100 text-rose-700'
                          : daysToDelivery <= 7
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {daysToDelivery > 0 ? `${daysToDelivery}d left` : 'Due'}
                      </span>
                    </div>

                    {/* Middle Row: Image, Design Name & Target Dates */}
                    <div className="flex items-center gap-3">
                      {order.designImages?.[0] ? (
                        <img
                          src={order.designImages[0]}
                          alt={order.designName}
                          className="w-14 h-14 rounded-xl object-cover border border-[#DECDB8] shadow-2xs shrink-0 cursor-pointer"
                          onClick={() => onViewOrderDetails(order)}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center font-serif font-bold text-sm border border-[#DECDB8] shrink-0">
                          SG
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-800 text-xs line-clamp-1">
                          {order.designName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#9B783E] font-bold text-[10px] border border-[#DECDB8]">
                            Size: {order.size}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Delivery: <strong>{order.deliveryDate}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Current Stage Parameters Panel */}
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE2D5] space-y-1.5 text-xs">
                      <div className="text-[10px] font-bold text-[#9B783E] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{currentStage.name} Parameters</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentStage.fields.map((field) => {
                          const val = stageVals[field.key];
                          return (
                            <div key={field.key} className="flex items-baseline justify-between gap-2 border-b border-[#F5EFE6] pb-1 last:border-none">
                              <span className="text-stone-500 text-[11px] font-medium shrink-0">
                                {field.label}:
                              </span>
                              <span className="text-right font-semibold text-stone-800 text-[11px] truncate max-w-[180px]">
                                {val ? (
                                  field.type === 'select' ? (
                                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${val.toLowerCase().includes('yes') || val.toLowerCase().includes('passed') || val.toLowerCase().includes('approved')
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : val.toLowerCase().includes('no') || val.toLowerCase().includes('rework') || val.toLowerCase().includes('failed')
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}>
                                      {val}
                                    </span>
                                  ) : val
                                ) : (
                                  <span className="text-stone-300 italic font-normal">—</span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Touch-Friendly Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenUpdateModal(order)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#7A1E3C] hover:from-[#431021] hover:to-[#5B172E] shadow-2xs active:scale-98 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update</span>
                      </button>

                      <button
                        onClick={() => onViewOrderDetails(order, false)}
                        className="p-2 rounded-xl text-stone-700 bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] shadow-2xs flex items-center justify-center shrink-0"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4 text-[#5B172E]" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </>
        )
      )}

      {/* ========================================================= */}
      {/* 2. HISTORY TAB                                            */}
      {/* ========================================================= */}
      {stageTab === 'history' && (
        historyOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#DECDB8] p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center mx-auto mb-3">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#431021]">
              No Historical Orders for {currentStage.name}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              Orders that pass through and advance from this stage will be permanently preserved in this history log.
            </p>
          </div>
        ) : (
          <>
            {/* History Read-Only Notice Bar */}
            <div className="bg-[#FAF8F5] border border-[#DECDB8] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-stone-600 shadow-2xs">
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-[#9B783E]" />
                <span>
                  <strong>Historical Archive:</strong> Orders listed here have already cleared this stage and cannot be updated. Any stage updates can only be performed from the <strong>Pending Orders</strong> tab.
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700 shrink-0">
                🔒 Read-Only
              </span>
            </div>

            {/* DESKTOP HISTORY TABLE (HIDDEN ON PHONES < md) */}
            <div className="hidden md:block bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">

                      {/* 1ST COLUMN: STRICTLY ACTIONS */}
                      <th className="py-3.5 px-3 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[75px]">
                        ⚡ Actions
                      </th>

                      <th className="py-3.5 px-4 min-w-[170px]">Order ID & Client</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Design & Size</th>
                      <th className="py-3.5 px-4 min-w-[150px]">Current Status</th>

                      {/* DEDICATED COLUMNS FOR STAGE PARAMETERS */}
                      {currentStage.fields.map((field) => (
                        <th key={field.key} className="py-3.5 px-4 min-w-[170px] bg-stone-50/70 border-l border-[#EFE7DC]">
                          <span className="text-stone-700 font-bold">{field.label}</span>
                        </th>
                      ))}

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE7DC]">
                    {historyOrders.map((order) => {
                      const currentStg = STAGES[order.currentStageIndex] || STAGES[0];
                      const stageVals = order.stageData?.[selectedStageId] || {};

                      return (
                        <tr key={order.id} className="hover:bg-[#FCFAF7] transition-colors">

                          {/* 1ST COLUMN: ACTIONS (READ ONLY FOR HISTORY) */}
                          <td className="py-2.5 px-3 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle whitespace-nowrap">
                            <button
                              onClick={() => onViewOrderDetails(order, true)}
                              className="p-1.5 rounded-lg text-stone-600 hover:text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] shadow-2xs transition-all flex items-center justify-center"
                              title="View Order Details (Read-Only)"
                            >
                              <Eye className="w-4 h-4 text-[#5B172E]" />
                            </button>
                          </td>

                          {/* Order ID & Client */}
                          <td className="py-3 px-4 align-middle">
                            <button
                              onClick={() => onViewOrderDetails(order)}
                              className="font-bold text-sm text-[#5B172E] hover:underline"
                            >
                              {order.id}
                            </button>
                            <div className="font-semibold text-stone-900 text-xs mt-0.5">
                              {order.clientName}
                            </div>
                            <div className="mt-0.5">
                              <CustomerPhoneDisplay mobile={order.mobile} currentUser={currentUser} />
                            </div>
                          </td>

                          {/* Design & Size */}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex items-center gap-2">
                              {order.designImages?.[0] && (
                                <img
                                  src={order.designImages[0]}
                                  alt={order.designName}
                                  className="w-9 h-9 rounded-md object-cover border border-[#DECDB8]"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-stone-800 text-xs">{order.designName}</div>
                                <span className="text-[10px] text-stone-500">Size: {order.size}</span>
                              </div>
                            </div>
                          </td>

                          {/* Current Status */}
                          <td className="py-3 px-4 align-middle whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Cleared Stage</span>
                            </span>
                            <div className="text-[10px] text-stone-400 mt-1">
                              Now in: Stage {order.currentStageIndex + 1}
                            </div>
                          </td>

                          {/* STAGE DATA VALUES */}
                          {currentStage.fields.map((field) => (
                            <td key={field.key} className="py-3 px-4 border-l border-[#EFE7DC] align-middle">
                              <span className="font-medium text-stone-800">
                                {stageVals[field.key] || '—'}
                              </span>
                            </td>
                          ))}

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE HISTORY CARDS (< md) */}
            <div className="md:hidden space-y-3">
              {historyOrders.map((order) => {
                const stageVals = order.stageData?.[selectedStageId] || {};

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#E8DFD3] p-4 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewOrderDetails(order)}
                          className="font-serif font-bold text-sm text-[#5B172E] hover:underline"
                        >
                          {order.id}
                        </button>
                        <span className="text-xs font-semibold text-stone-800">{order.clientName}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Cleared</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-700 font-medium truncate max-w-[200px]">{order.designName}</span>
                      <span className="text-stone-500 font-bold">Size: {order.size}</span>
                    </div>

                    {/* Past Stage Values */}
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE2D5] space-y-1 text-xs">
                      {currentStage.fields.map((field) => (
                        <div key={field.key} className="flex justify-between text-[11px]">
                          <span className="text-stone-500">{field.label}:</span>
                          <span className="font-medium text-stone-800">{stageVals[field.key] || '—'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions (History Read-Only) */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onViewOrderDetails(order, true)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#5B172E] border border-[#DECDB8] hover:bg-[#FAF5EE]"
                      >
                        View Job Sheet
                      </button>
                      <button
                        onClick={() => onOpenMeasurements(order, true)}
                        className="p-1.5 rounded-lg text-stone-600 border border-[#DECDB8] hover:bg-[#FAF5EE]"
                        title="View Measurements (Read-Only)"
                      >
                        <Ruler className="w-4 h-4 text-[#9B783E]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      )}

      {/* STAGE UPDATE POPUP MODAL (AS REQUESTED) */}
      <StageUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedOrderForUpdate(null);
        }}
        order={selectedOrderForUpdate}
        stageId={selectedStageId}
        onSaveOnly={handleSaveStageDataOnly}
        onSaveAndAdvance={handleSaveAndAdvanceStage}
      />

    </div>
  );
};