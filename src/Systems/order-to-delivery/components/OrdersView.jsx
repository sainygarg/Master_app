import React, { useState } from 'react';
import { 
  ShoppingBag, 
  PlusCircle, 
  Search, 
  Filter, 
  Ruler, 
  Eye, 
  ArrowRight, 
  Trash2, 
  Phone, 
  Calendar,
  Sparkles,
  Hourglass,
  History as HistoryIcon,
  CheckCircle2
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { CustomerPhoneDisplay } from '../utils/privacy';

export const OrdersView = ({
  orders = [],
  currentUser,
  onOpenNewOrder,
  onViewOrderDetails,
  onOpenMeasurements,
  onSelectStage,
  onDeleteOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filter all orders by search & stage
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm.trim() ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobile.includes(searchTerm) ||
      order.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.designName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'ALL' || order.currentStageId === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-4">
      
      {/* CLEAN HEADER: "All Orders" Title & "+ Create New Order" Button */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5B172E] text-white flex items-center justify-center shadow-xs shrink-0">
            <ShoppingBag className="w-5 h-5 text-[#FAF6F0]" />
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#431021]">
              All Orders
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
              {orders.length}
            </span>
          </div>
        </div>

        {/* "+ Create New Order" Button */}
        <div>
          <button
            onClick={onOpenNewOrder}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] via-[#6B1B37] to-[#802243] hover:from-[#431021] hover:to-[#5B172E] shadow-sm hover:shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4 text-[#F3ECE2]" />
            <span>+ Create New Order</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFD3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, Client, Phone, Design..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-800 font-medium"
          >
            <option value="ALL">All Stages</option>
            {STAGES.map((s, idx) => (
              <option key={s.id} value={s.id}>
                Stage {idx + 1}: {s.name}
              </option>
            ))}
          </select>

          <span className="text-xs text-stone-500 shrink-0 ml-2">
            Count: <strong className="text-[#5B172E] font-bold">{filteredOrders.length}</strong>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ORDERS TABLE FORMAT (1ST COLUMN = ACTIONS AS REQUESTED)   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#431021]">
              No Orders Found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No orders matched your search or stage filter. Click "+ Create New Order" above to place an order.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP SPREADSHEET TABLE */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                  
                  {/* 1ST COLUMN: STRICTLY ACTIONS AS REQUESTED */}
                  <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[170px]">
                    ⚡ Actions
                  </th>

                  <th className="py-3.5 px-4 min-w-[150px]">Order ID</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Client Details</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Design & Size</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Current Stage (1-10)</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Trial Date</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Delivery Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {filteredOrders.map((order) => {
                  const currentStg = STAGES[order.currentStageIndex] || STAGES[0];
                  const daysLeft = Math.ceil(
                    (new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  const isConfirmingDelete = deleteConfirmId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-[#FCFAF7] transition-colors">
                      
                      {/* 1ST COLUMN: ACTIONS WITH BUTTONS */}
                      <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                            <button
                              onClick={() => {
                                if (onDeleteOrder) onDeleteOrder(order.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px] hover:bg-stone-300"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {/* View Job Sheet Button */}
                            <button
                              onClick={() => onViewOrderDetails(order)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] shadow-2xs transition-all"
                              title="View Full Order Sheet"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Sheet</span>
                            </button>

                            {/* Measurements Button */}
                            <button
                              onClick={() => onOpenMeasurements(order)}
                              className="p-1.5 rounded-lg text-stone-600 hover:text-[#5B172E] hover:bg-[#FAF5EE] border border-[#DECDB8] transition-all"
                              title="View Measurements"
                            >
                              <Ruler className="w-3.5 h-3.5 text-[#9B783E]" />
                            </button>

                            {/* Delete Order Button */}
                            <button
                              onClick={() => setDeleteConfirmId(order.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Order ID */}
                      <td className="py-3 px-4 font-bold align-middle">
                        <button
                          onClick={() => onViewOrderDetails(order)}
                          className="text-[#5B172E] hover:underline flex items-center gap-1 font-bold text-sm"
                        >
                          {order.id}
                        </button>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Client Details */}
                      <td className="py-3 px-4 align-middle">
                        <div className="font-semibold text-stone-900 text-xs">
                          {order.clientName}
                        </div>
                        <div className="mt-0.5">
                          <CustomerPhoneDisplay mobile={order.mobile} currentUser={currentUser} />
                        </div>
                        <span className="text-[10px] text-stone-400 block">{order.city}</span>
                      </td>

                      {/* Design & Size */}
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center space-x-2.5">
                          {order.designImages?.[0] ? (
                            <img
                              src={order.designImages[0]}
                              alt={order.designName}
                              className="w-10 h-10 rounded-lg object-cover border border-[#DECDB8] shrink-0 cursor-pointer"
                              onClick={() => onViewOrderDetails(order)}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center font-serif font-bold text-xs border border-[#DECDB8] shrink-0">
                              SG
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-800 truncate max-w-[170px] text-xs">
                              {order.designName}
                            </p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#F2ECE1] text-[#9B783E] font-bold text-[9px] border border-[#DECDB8]">
                              Size: {order.size}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="py-3 px-4 align-middle">
                        <button
                          onClick={() => onSelectStage(currentStg.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#5B172E] text-white hover:bg-[#431021] transition-all shadow-2xs group"
                          title="Click to open this stage workspace"
                        >
                          <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[9px]">
                            {order.currentStageIndex + 1}
                          </span>
                          <span className="truncate max-w-[140px]">{currentStg.name}</span>
                          <ArrowRight className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                        </button>
                      </td>

                      {/* Trial Date */}
                      <td className="py-3 px-4 text-stone-700 font-medium align-middle">
                        {order.trialDate || 'N/A'}
                      </td>

                      {/* Delivery Date & Countdown */}
                      <td className="py-3 px-4 align-middle">
                        <div className="font-bold text-stone-900">{order.deliveryDate}</div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          daysLeft <= 3 
                            ? 'bg-rose-100 text-rose-700' 
                            : daysLeft <= 7 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Due'}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE ORDER CARDS (< md) */}
          <div className="md:hidden divide-y divide-[#EFE7DC]">
            {filteredOrders.map((order) => {
              const currentStg = STAGES[order.currentStageIndex] || STAGES[0];
              const daysLeft = Math.ceil(
                (new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24)
              );
              const isConfirmingDelete = deleteConfirmId === order.id;

              return (
                <div key={order.id} className="p-4 space-y-3 bg-white">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewOrderDetails(order)}
                          className="font-serif font-bold text-base text-[#5B172E] hover:underline"
                        >
                          {order.id}
                        </button>
                        <span className="text-xs font-semibold text-stone-800">{order.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                        <CustomerPhoneDisplay mobile={order.mobile} currentUser={currentUser} />
                        <span>•</span>
                        <span>{order.city}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      daysLeft <= 3 
                        ? 'bg-rose-100 text-rose-700' 
                        : daysLeft <= 7 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Due'}
                    </span>
                  </div>

                  {/* Image & Design */}
                  <div className="flex items-center gap-3">
                    {order.designImages?.[0] ? (
                      <img
                        src={order.designImages[0]}
                        alt={order.designName}
                        className="w-12 h-12 rounded-xl object-cover border border-[#DECDB8] shadow-2xs shrink-0 cursor-pointer"
                        onClick={() => onViewOrderDetails(order)}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center font-serif font-bold text-xs border border-[#DECDB8] shrink-0">
                        SG
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-stone-800 text-xs truncate">
                        {order.designName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.2 rounded bg-[#FAF5EE] text-[#9B783E] font-bold text-[10px] border border-[#DECDB8]">
                          Size: {order.size}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Deliv: <strong>{order.deliveryDate}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Button */}
                  <button
                    onClick={() => onSelectStage(currentStg.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#5B172E] to-[#781F3E] text-white shadow-2xs hover:from-[#431021] hover:to-[#5B172E] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[9px]">
                        {order.currentStageIndex + 1}
                      </span>
                      <span className="truncate">{currentStg.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                  </button>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#F0E6D8]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewOrderDetails(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#5B172E] bg-[#FAF8F5] border border-[#DECDB8] hover:bg-[#FAF5EE]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Job Sheet</span>
                      </button>
                      <button
                        onClick={() => onOpenMeasurements(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-[#FAF8F5] border border-[#DECDB8] hover:bg-[#FAF5EE]"
                      >
                        <Ruler className="w-3.5 h-3.5 text-[#9B783E]" />
                        <span>Measure</span>
                      </button>
                    </div>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (onDeleteOrder) onDeleteOrder(order.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(order.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </>
        )}
      </div>

    </div>
  );
};
