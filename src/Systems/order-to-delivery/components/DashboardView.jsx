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
  Kanban,
  TrendingUp,
  PackageCheck,
  Scissors,
  CheckCircle2,
  CheckSquare,
  Hourglass,
  History as HistoryIcon
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { maskCustomerMobile } from '../utils/privacy';

export const DashboardView = ({
  orders = [],
  currentUser,
  onSelectStage,
  onViewOrderDetails,
  onOpenMeasurements,
  onAdvanceStageDirect
}) => {
  const [dashboardTab, setDashboardTab] = useState('pending'); // 'pending' | 'history'
  const [pipelineFormat, setPipelineFormat] = useState('columns'); // 'columns' | 'cards' | 'table'

  const activeOrders = orders.filter(o => o.currentStageIndex < 9);
  const activeOrdersCount = activeOrders.length;
  const inEmbroideryCount = orders.filter(o => [0, 1, 2, 3].includes(o.currentStageIndex)).length;
  const inStitchingCount = orders.filter(o => [4, 5].includes(o.currentStageIndex)).length;
  const inQcFinishingCount = orders.filter(o => [6, 7].includes(o.currentStageIndex)).length;
  const inDeliveryCount = orders.filter(o => [8, 9].includes(o.currentStageIndex)).length;

  // Flatten all historical audit events across all orders
  const allHistoryLogs = [];
  orders.forEach(order => {
    if (order.history && Array.isArray(order.history)) {
      order.history.forEach(h => {
        allHistoryLogs.push({
          ...h,
          orderId: order.id,
          clientName: order.clientName,
          designName: order.designName
        });
      });
    }
  });

  // Sort newest first
  allHistoryLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Dashboard Header */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#431021]">
              Production Tracking Dashboard
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8] font-bold">
              Live Atelier Tracker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time tracking of all couture garments moving through the 10-stage atelier workflow.
          </p>
        </div>

        {/* View Format Switcher (shown when on Pending tracking tab) */}
        {dashboardTab === 'pending' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#FAF6F0] p-1 rounded-xl border border-[#DECDB8] text-xs">
              <button
                onClick={() => setPipelineFormat('columns')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  pipelineFormat === 'columns'
                    ? 'bg-[#5B172E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="10-Column Kanban Tracking Board"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Columns</span>
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
          </div>
        )}
      </div>

      {/* KPI Tracking Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total Active</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-serif text-[#5B172E]">{activeOrdersCount}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">In Production</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Dye & Embroidery</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-serif text-orange-800">{inEmbroideryCount}</span>
            <span className="text-[10px] text-stone-400 font-medium">Stages 1-4</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Cutting & Tailoring</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-serif text-indigo-800">{inStitchingCount}</span>
            <span className="text-[10px] text-stone-400 font-medium">Stages 5-6</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">QC & Finishing</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-serif text-teal-800">{inQcFinishingCount}</span>
            <span className="text-[10px] text-stone-400 font-medium">Stages 7-8</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Trial & Delivery</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-serif text-emerald-800">{inDeliveryCount}</span>
            <span className="text-[10px] text-stone-400 font-medium">Stages 9-10</span>
          </div>
        </div>
      </div>

      {/* PENDING & HISTORY TABS (AS REQUESTED) */}
      <div className="flex items-center space-x-2 border-b border-[#E8DFD3] pb-1">
        <button
          onClick={() => setDashboardTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            dashboardTab === 'pending'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <Hourglass className="w-4 h-4" />
          <span>Pending Pipeline ({activeOrdersCount})</span>
        </button>

        <button
          onClick={() => setDashboardTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            dashboardTab === 'history'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-[#DECDB8]'
          }`}
        >
          <HistoryIcon className="w-4 h-4" />
          <span>Tracking History Logs ({allHistoryLogs.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. PENDING (LIVE PIPELINE TRACKER)                        */}
      {/* ========================================================= */}
      {dashboardTab === 'pending' && (
        <>
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
                          <span>Open Stage Workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Orders Cards List */}
                      <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
                        {stageOrders.length === 0 ? (
                          <div className="p-6 text-center text-xs text-stone-400 border border-dashed border-[#DECDB8] rounded-xl bg-white/50">
                            No orders pending in this stage
                          </div>
                        ) : (
                          stageOrders.map((order) => {
                            const daysLeft = Math.ceil(
                              (new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24)
                            );

                            return (
                              <div
                                key={order.id}
                                className="bg-white rounded-xl p-3 border border-[#E4D8C8] shadow-xs hover:shadow-md transition-all space-y-2.5 group"
                              >
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

                                <div className="text-[11px]">
                                  <p className="font-medium text-stone-700 line-clamp-1">
                                    {order.designName}
                                  </p>
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#F2ECE1] text-[#9B783E]">
                                    {order.size}
                                  </span>
                                </div>

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

          {pipelineFormat === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeOrders.map((order) => {
                const currentStg = STAGES[order.currentStageIndex] || STAGES[0];
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-[#E8DFD3] p-4 shadow-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#5B172E]">{order.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#FAF2E6] text-[#9B783E] font-bold">
                        Stage {order.currentStageIndex + 1}: {currentStg.name}
                      </span>
                    </div>
                    <h4 className="font-bold text-stone-900">{order.clientName}</h4>
                    <p className="text-xs text-stone-600">{order.designName}</p>
                    <div className="mt-3 pt-2 border-t flex justify-between items-center text-xs">
                      <span>Delivery: <strong>{order.deliveryDate}</strong></span>
                      <button onClick={() => onViewOrderDetails(order)} className="text-[#5B172E] font-bold">
                        View Sheet →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pipelineFormat === 'table' && (
            <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b text-[11px] font-bold text-stone-600 uppercase whitespace-nowrap">
                    {/* 1ST COLUMN: ACTIONS AS REQUESTED */}
                    <th className="py-3.5 px-4 bg-[#F5EFE6] border-r border-[#DECDB8] sticky left-0 z-10 text-[#431021] font-extrabold shadow-xs min-w-[160px]">
                      ⚡ Actions
                    </th>
                    <th className="py-3.5 px-4 min-w-[140px]">Order ID</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Client</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Design</th>
                    <th className="py-3.5 px-4 min-w-[190px]">Active Stage</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Delivery Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE7DC]">
                  {activeOrders.map(order => {
                    const currentStg = STAGES[order.currentStageIndex] || STAGES[0];
                    return (
                      <tr key={order.id} className="hover:bg-[#FCFAF7] transition-colors">
                        {/* 1ST COLUMN: ACTIONS BUTTONS */}
                        <td className="py-3 px-4 bg-[#FBF9F5] border-r border-[#DECDB8] sticky left-0 z-10 shadow-xs align-middle">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onViewOrderDetails(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5B172E] bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] shadow-2xs transition-all"
                              title="View Full Order Sheet"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Sheet</span>
                            </button>

                            <button
                              onClick={() => onOpenMeasurements(order)}
                              className="p-1 rounded-lg text-stone-600 hover:text-[#5B172E] hover:bg-[#FAF5EE] border border-[#DECDB8] transition-all"
                              title="Client Measurements"
                            >
                              <Ruler className="w-3.5 h-3.5 text-[#9B783E]" />
                            </button>

                            {order.currentStageIndex < 9 && onAdvanceStageDirect && (
                              <button
                                onClick={() => onAdvanceStageDirect(order)}
                                className="p-1 rounded-lg text-[#5B172E] hover:bg-[#FAF5EE] border border-[#DECDB8] transition-all"
                                title="Quick Advance Stage"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-[#5B172E] align-middle">
                          <button
                            onClick={() => onViewOrderDetails(order)}
                            className="hover:underline font-bold"
                          >
                            {order.id}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-900 align-middle">
                          {order.clientName}
                        </td>
                        <td className="py-3 px-4 text-stone-700 align-middle">
                          {order.designName}
                        </td>
                        <td className="py-3 px-4 align-middle">
                          <button
                            onClick={() => onSelectStage(currentStg.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5B172E] text-white text-[10px] font-bold hover:bg-[#431021] transition-all"
                            title="Go to stage workspace"
                          >
                            <span>{order.currentStageIndex + 1}. {currentStg.name}</span>
                            <ArrowRight className="w-3 h-3 opacity-70" />
                          </button>
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900 align-middle">
                          {order.deliveryDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* 2. HISTORY (TRACKING AUDIT LOGS)                          */}
      {/* ========================================================= */}
      {dashboardTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs p-5">
          <h3 className="font-serif font-bold text-base text-[#431021] mb-4">
            Production Handover & Stage Movement History
          </h3>

          {allHistoryLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No stage transition logs recorded yet. Logs will appear here whenever an order advances across stages.
            </div>
          ) : (
            <div className="space-y-3">
              {allHistoryLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EAE2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#5B172E]">{log.orderId}</span>
                        <span className="text-stone-300">•</span>
                        <span className="font-semibold text-xs text-stone-800">{log.action}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Client: <strong>{log.clientName}</strong> ({log.designName})
                      </p>
                      {log.notes && (
                        <p className="text-[11px] text-stone-600 italic mt-1 bg-white px-2 py-0.5 rounded border border-[#EFE7DC] inline-block">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-stone-400 shrink-0">
                    <div className="font-medium text-stone-600">By: {log.actor || 'Production Staff'}</div>
                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
