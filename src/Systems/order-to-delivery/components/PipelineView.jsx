import React, { useState } from 'react';
import { 
  ArrowRight, 
  Ruler, 
  Eye, 
  Calendar, 
  Phone, 
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Kanban
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { maskCustomerMobile } from '../utils/privacy';

export const PipelineView = ({
  orders = [],
  currentUser,
  onSelectStage,
  onViewOrderDetails,
  onOpenMeasurements,
  onAdvanceStageDirect
}) => {
  const [pipelineFormat, setPipelineFormat] = useState('columns'); // 'columns' | 'cards' | 'table'

  return (
    <div className="space-y-4">
      {/* Top Banner / Pipeline Summary */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFD3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#431021] flex items-center gap-2">
            <span>10-Stage Couture Pipeline</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#FAF5EE] text-[#9B783E] border border-[#E0D2C0] font-sans font-semibold">
              Live Production Tracker
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Complete lifecycle from Material Check & Embroidery to QC, Client Trial & Final Delivery.
          </p>
        </div>

        {/* View Format Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#FAF6F0] p-1 rounded-xl border border-[#DECDB8] text-xs">
            <button
              onClick={() => setPipelineFormat('columns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                pipelineFormat === 'columns'
                  ? 'bg-[#5B172E] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="10-Column Kanban View"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Columns</span>
            </button>

            <button
              onClick={() => setPipelineFormat('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                pipelineFormat === 'cards'
                  ? 'bg-[#5B172E] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setPipelineFormat('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                pipelineFormat === 'table'
                  ? 'bg-[#5B172E] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <span className="text-xs text-stone-500 hidden sm:inline">
            <strong className="text-[#5B172E]">{orders.length}</strong> orders
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. COLUMNS (KANBAN) VIEW                                 */}
      {/* ========================================================= */}
      {pipelineFormat === 'columns' && (
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex items-start gap-4 min-w-[2800px]">
            {STAGES.map((stage, stageIndex) => {
              const stageOrders = orders.filter((o) => o.currentStageId === stage.id);

              return (
                <div
                  key={stage.id}
                  className="w-72 shrink-0 bg-[#FAF8F5] rounded-2xl border border-[#E8DFD3] shadow-xs flex flex-col max-h-[750px]"
                >
                  {/* Stage Header */}
                  <div className="p-3.5 border-b border-[#E8DFD3] bg-white rounded-t-2xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-[#9B783E] tracking-wider uppercase">
                        Stage {stageIndex + 1} / 10
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FAF2E6] text-[#5B172E] border border-[#DECDB8]">
                        {stageOrders.length}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onSelectStage(stage.id)}
                      className="font-serif font-bold text-sm text-[#431021] truncate hover:text-[#5B172E] cursor-pointer flex items-center gap-1 group"
                      title={stage.name}
                    >
                      <span className="truncate">{stage.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#9B783E]" />
                    </h3>

                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {stage.description}
                    </p>

                    <button
                      onClick={() => onSelectStage(stage.id)}
                      className="mt-2 w-full py-1 text-[11px] font-semibold text-[#5B172E] hover:bg-[#FAF2E6] rounded-lg transition-colors border border-dashed border-[#DECDB8] flex items-center justify-center gap-1"
                    >
                      <span>Open Stage Table</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Orders Cards List */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
                    {stageOrders.length === 0 ? (
                      <div className="p-6 text-center text-xs text-stone-400 border border-dashed border-[#DECDB8] rounded-xl bg-white/50">
                        No orders in this stage
                      </div>
                    ) : (
                      stageOrders.map((order) => {
                        const daysLeft = Math.ceil(
                          (new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24)
                        );
                        const stageInfo = order.stageData?.[stage.id] || {};

                        return (
                          <div
                            key={order.id}
                            className="bg-white rounded-xl p-3 border border-[#E4D8C8] shadow-xs hover:shadow-md transition-all space-y-2.5 group"
                          >
                            {/* Order ID & Client Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <button
                                  onClick={() => onViewOrderDetails(order)}
                                  className="font-bold text-xs text-[#5B172E] hover:underline flex items-center gap-1"
                                >
                                  {order.id}
                                </button>
                                <h4 className="font-semibold text-xs text-stone-900 leading-tight">
                                  {order.clientName}
                                </h4>
                                <p className="text-[10px] text-stone-500 font-mono">
                                  {order.city} • {maskCustomerMobile(order.mobile, currentUser)}
                                </p>
                              </div>

                              {order.designImages?.[0] && (
                                <img
                                  src={order.designImages[0]}
                                  alt={order.designName}
                                  className="w-10 h-10 rounded-md object-cover border border-[#DECDB8] shrink-0 cursor-pointer"
                                  onClick={() => onViewOrderDetails(order)}
                                />
                              )}
                            </div>

                            {/* Design & Size */}
                            <div className="text-[11px]">
                              <p className="font-medium text-stone-700 line-clamp-1">
                                {order.designName}
                              </p>
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#F2ECE1] text-[#9B783E]">
                                {order.size}
                              </span>
                            </div>

                            {/* Dates & Urgency */}
                            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#F0E6D8]">
                              <div className="text-stone-500">
                                <span>Del: </span>
                                <span className="font-bold text-stone-800">{order.deliveryDate}</span>
                              </div>
                              <span className={`px-1.5 py-0.2 rounded font-bold ${
                                daysLeft <= 3 
                                  ? 'bg-rose-100 text-rose-700' 
                                  : daysLeft <= 7 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {daysLeft > 0 ? `${daysLeft}d left` : 'Due'}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                onClick={() => onOpenMeasurements(order)}
                                className="flex-1 py-1 text-[10px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center justify-center gap-1"
                              >
                                <Ruler className="w-3 h-3 text-[#9B783E]" />
                                <span>Sizes</span>
                              </button>

                              <button
                                onClick={() => onViewOrderDetails(order)}
                                className="p-1 text-stone-500 hover:text-[#5B172E] hover:bg-stone-100 rounded-md transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {stageIndex < 9 && (
                                <button
                                  onClick={() => onAdvanceStageDirect(order)}
                                  className="px-2 py-1 text-[10px] font-bold text-white bg-[#5B172E] hover:bg-[#431021] rounded-md transition-all flex items-center gap-0.5 shadow-2xs"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CARDS GRID VIEW                                        */}
      {/* ========================================================= */}
      {pipelineFormat === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => {
            const currentStg = STAGES[order.currentStageIndex] || STAGES[0];
            const daysLeft = Math.ceil(
              (new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                <div className="p-4 bg-[#FAF7F2] border-b border-[#E8DFD3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#5B172E]">{order.id}</span>
                    <span className="text-stone-300">•</span>
                    <span className="font-semibold text-stone-800 text-sm">{order.clientName}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5B172E] text-white">
                    Stage {order.currentStageIndex + 1}
                  </span>
                </div>

                <div className="p-4 flex items-start gap-3.5 border-b border-[#F0E6D8]">
                  {order.designImages?.[0] ? (
                    <img
                      src={order.designImages[0]}
                      alt={order.designName}
                      className="w-16 h-16 rounded-xl object-cover border border-[#DECDB8] shadow-2xs shrink-0 cursor-pointer"
                      onClick={() => onViewOrderDetails(order)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#FAF5EE] text-[#9B783E] flex items-center justify-center font-serif font-bold text-lg border border-[#DECDB8] shrink-0">
                      SG
                    </div>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-[#431021] truncate">
                      {order.designName}
                    </h4>
                    <p className="text-xs text-[#9B783E] font-semibold">
                      Current: {currentStg.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span>Size: <strong>{order.size}</strong></span>
                      <span>•</span>
                      <span>Delivery: <strong>{order.deliveryDate}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    daysLeft <= 3 
                      ? 'bg-rose-100 text-rose-700' 
                      : daysLeft <= 7 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Due'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenMeasurements(order)}
                      className="px-2.5 py-1 text-xs font-semibold text-stone-600 bg-white border border-[#DECDB8] rounded-lg hover:bg-stone-50"
                    >
                      Sizes
                    </button>
                    <button
                      onClick={() => onViewOrderDetails(order)}
                      className="px-2.5 py-1 text-xs font-semibold text-stone-600 bg-white border border-[#DECDB8] rounded-lg hover:bg-stone-50"
                    >
                      Sheet
                    </button>
                    {order.currentStageIndex < 9 && (
                      <button
                        onClick={() => onAdvanceStageDirect(order)}
                        className="px-3 py-1 text-xs font-bold text-white bg-[#5B172E] rounded-lg hover:bg-[#431021]"
                      >
                        Advance →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TABLE VIEW                                             */}
      {/* ========================================================= */}
      {pipelineFormat === 'table' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Design Name</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Current Stage (1-10)</th>
                  <th className="py-3 px-4">Trial Date</th>
                  <th className="py-3 px-4">Delivery Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE7DC]">
                {orders.map((order) => {
                  const currentStg = STAGES[order.currentStageIndex] || STAGES[0];
                  return (
                    <tr key={order.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#5B172E]">
                        <button onClick={() => onViewOrderDetails(order)} className="hover:underline">
                          {order.id}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-800">{order.clientName}</span>
                        <div className="text-[10px] text-stone-400 font-mono">{maskCustomerMobile(order.mobile, currentUser)} • {order.city}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-800">
                        {order.designName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#F2ECE1] text-[#9B783E] font-bold text-[10px]">
                          {order.size}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectStage(currentStg.id)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#5B172E] text-white hover:bg-[#431021] transition-colors"
                        >
                          {order.currentStageIndex + 1}. {currentStg.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{order.trialDate}</td>
                      <td className="py-3 px-4 font-bold text-stone-800">{order.deliveryDate}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenMeasurements(order)}
                            className="p-1.5 text-stone-500 hover:text-[#5B172E] hover:bg-stone-100 rounded-lg"
                            title="Measurements"
                          >
                            <Ruler className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewOrderDetails(order)}
                            className="p-1.5 text-stone-500 hover:text-[#5B172E] hover:bg-stone-100 rounded-lg"
                            title="Order Sheet"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {order.currentStageIndex < 9 && (
                            <button
                              onClick={() => onAdvanceStageDirect(order)}
                              className="px-2 py-1 text-[10px] font-bold text-white bg-[#5B172E] hover:bg-[#431021] rounded-md"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
