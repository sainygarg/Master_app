import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  Building2,
  Scissors,
  ClipboardList,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { STAGES } from '../order-to-delivery/types/stages';
import { fetchOrders, getCachedOrders } from '../order-to-delivery/utils/storage';
import { useChecklistDelegationPendingCounts } from '../checklist-delegation/hooks/usePendingCounts';
import supabase from '../checklist-delegation/SupabaseClient';
import { OrderDetailDrawer } from '../order-to-delivery/components/OrderDetailDrawer';

export default function ProductionControlView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'otd' | 'checklist'
  const [orders, setOrders] = useState(() => getCachedOrders() || []);
  const [ordersLoading, setOrdersLoading] = useState(() => getCachedOrders() === null);
  const [checklistTasks, setChecklistTasks] = useState([]);
  const [delegationTasks, setDelegationTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const checklistPendingCounts = useChecklistDelegationPendingCounts();

  // Load live data
  const loadData = async () => {
    setOrdersLoading(true);
    setTasksLoading(true);

    try {
      const liveOrders = await fetchOrders();
      setOrders(liveOrders || []);
    } catch (e) {
      console.error('Failed to load orders for PC', e);
    } finally {
      setOrdersLoading(false);
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [chkRes, delRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .neq('status', 'Done')
          .order('task_date', { ascending: true }),
        supabase
          .from('delegation')
          .select('*')
          .neq('status', 'Done')
          .order('task_start_date', { ascending: true })
      ]);

      if (chkRes.data) setChecklistTasks(chkRes.data);
      if (delRes.data) setDelegationTasks(delRes.data);
    } catch (err) {
      console.error('Failed to fetch pending tasks for PC', err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Stage-Wise Breakdown for Order to Delivery
  const otdStageStats = useMemo(() => {
    return STAGES.map((stage, idx) => {
      const stageOrders = orders.filter((o) => o.currentStageId === stage.id && (o.currentStageIndex ?? 0) < 10);
      const overdue = stageOrders.filter((o) => {
        if (!o.deliveryDate) return false;
        return new Date(o.deliveryDate) < new Date();
      });
      return {
        stageIndex: idx + 1,
        id: stage.id,
        name: stage.name,
        code: stage.code,
        description: stage.description,
        badgeColor: stage.badgeColor,
        dotColor: stage.dotColor,
        orders: stageOrders,
        totalPending: stageOrders.length,
        overdueCount: overdue.length
      };
    });
  }, [orders]);

  // Compute Module-Wise Breakdown for Checklist & Delegation
  const checklistModuleStats = useMemo(() => {
    const checklistPending = checklistTasks.filter(
      (t) => t.status !== 'Done' && t.status !== 'Approved'
    );
    const delegationPending = delegationTasks.filter(
      (t) => t.status !== 'Done' && t.status !== 'Approved'
    );

    return [
      {
        id: 'daily_routine',
        name: 'Daily Routine Tasks',
        module: 'Checklist Operations',
        code: 'CHK',
        pendingCount: checklistPending.length,
        items: checklistPending.slice(0, 5),
        path: '/checklist/task',
        dotColor: 'bg-emerald-500'
      },
      {
        id: 'delegation_followup',
        name: 'Delegation & Follow-up',
        module: 'Delegation Module',
        code: 'DEL',
        pendingCount: delegationPending.length,
        items: delegationPending.slice(0, 5),
        path: '/checklist/delegation',
        dotColor: 'bg-blue-500'
      },
      {
        id: 'admin_approvals',
        name: 'Admin Approvals',
        module: 'Approval Gate',
        code: 'APR',
        pendingCount: checklistPendingCounts.adminApprovalPending || 0,
        items: [],
        path: '/checklist/admin-approval',
        dotColor: 'bg-rose-500'
      }
    ];
  }, [checklistTasks, delegationTasks, checklistPendingCounts]);

  const totalOtdPending = useMemo(() => {
    return orders.filter((o) => (o.currentStageIndex ?? 0) < 9).length;
  }, [orders]);

  const totalChecklistPending = useMemo(() => {
    return (
      (checklistPendingCounts.taskPending || checklistTasks.length) +
      (checklistPendingCounts.delegationPending || delegationTasks.length) +
      (checklistPendingCounts.adminApprovalPending || 0)
    );
  }, [checklistPendingCounts, checklistTasks, delegationTasks]);

  return (
    <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DFD3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5B172E] text-[#FAF6F0] flex items-center justify-center font-bold text-base shadow-xs">
              PC
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#431021]">
                Production Control (PC)
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Centralized Stage-Wise &amp; Module-Wise Pending Tracking across all systems
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={ordersLoading || tasksLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-[#FAF8F5] border border-[#DECDB8] hover:bg-[#F3ECE2] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading || tasksLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Counts</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Garments */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Garments in Pipeline
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5EE] text-[#5B172E]">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#5B172E] font-serif">
            {totalOtdPending}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Across 10 Atelier Stages</p>
        </div>

        {/* Total Checklist & Delegation Pendings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Task Pendings
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5EE] text-[#C5A059]">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#9B783E] font-serif">
            {totalChecklistPending}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Daily Routine, Delegation &amp; Approvals</p>
        </div>

        {/* Highest Bottleneck Stage */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Top Bottleneck Stage
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {(() => {
            const highest = [...otdStageStats].sort((a, b) => b.totalPending - a.totalPending)[0];
            return (
              <>
                <div className="text-base font-bold text-stone-800 truncate">
                  {highest?.name || '—'}
                </div>
                <p className="text-[11px] text-amber-700 font-semibold mt-1">
                  {highest?.totalPending || 0} active orders waiting
                </p>
              </>
            );
          })()}
        </div>

        {/* Total Overdue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Overdue Alert
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          {(() => {
            const totalOverdue = otdStageStats.reduce((sum, s) => sum + s.overdueCount, 0);
            return (
              <>
                <div className="text-2xl font-bold text-rose-600 font-serif">
                  {totalOverdue}
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Orders past target delivery date</p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Module Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8DFD3] pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'text-stone-600 hover:bg-[#F3ECE2]'
          }`}
        >
          All Systems Overview
        </button>
        <button
          onClick={() => setActiveTab('otd')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'otd'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'text-stone-600 hover:bg-[#F3ECE2]'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Order to Delivery (10 Stages)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
            {totalOtdPending}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'checklist'
              ? 'bg-[#5B172E] text-white shadow-xs'
              : 'text-stone-600 hover:bg-[#F3ECE2]'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Checklist &amp; Delegation</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
            {totalChecklistPending}
          </span>
        </button>
      </div>

      {/* SECTION 1: ORDER TO DELIVERY - 10 STAGES BREAKDOWN */}
      {(activeTab === 'all' || activeTab === 'otd') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#431021] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#C5A059]" />
              <span>Order to Delivery — Stage-Wise Pending Garments</span>
            </h2>
            <button
              onClick={() => navigate('/order-to-delivery/dashboard')}
              className="text-xs font-semibold text-[#5B172E] hover:underline flex items-center gap-1"
            >
              <span>Open Production Tracking</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {otdStageStats.map((stg) => (
              <div
                key={stg.id}
                onClick={() => navigate(`/order-to-delivery/stages/${stg.id}`)}
                className="bg-white rounded-2xl p-4 border border-[#E8DFD3] hover:border-[#5B172E]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                      Stage {stg.stageIndex}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${stg.dotColor}`} />
                  </div>

                  <h3 className="font-serif font-bold text-sm text-[#431021] group-hover:text-[#5B172E] transition-colors truncate">
                    {stg.name}
                  </h3>
                  <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5 min-h-[30px]">
                    {stg.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0E6D8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Pending Orders</span>
                    <span className="text-xl font-bold font-serif text-stone-900">
                      {stg.totalPending}
                    </span>
                  </div>
                  {stg.overdueCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      {stg.overdueCount} Overdue
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#C5A059] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: CHECKLIST & DELEGATION MODULE-WISE PENDING */}
      {(activeTab === 'all' || activeTab === 'checklist') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#431021] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#C5A059]" />
              <span>Checklist &amp; Delegation — Module-Wise Pendings</span>
            </h2>
            <button
              onClick={() => navigate('/checklist/admin')}
              className="text-xs font-semibold text-[#5B172E] hover:underline flex items-center gap-1"
            >
              <span>Open Checklist Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {checklistModuleStats.map((mod) => (
              <div
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className="bg-white rounded-2xl p-5 border border-[#E8DFD3] hover:border-[#5B172E]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${mod.dotColor}`} />
                      <span className="text-xs font-semibold text-stone-400">{mod.module}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                      {mod.code}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#431021] group-hover:text-[#5B172E] transition-colors">
                    {mod.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-serif text-[#5B172E]">
                      {mod.pendingCount}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">pending items</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F0E6D8] flex items-center justify-between text-xs text-stone-500 group-hover:text-[#5B172E]">
                  <span className="font-semibold">Review Pending Tasks</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Order Drawer for Quick Drilldown */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOpenMeasurements={() => {}}
          onOpenUpdateModal={() => {}}
          currentUser={null}
        />
      )}
    </div>
  );
}
