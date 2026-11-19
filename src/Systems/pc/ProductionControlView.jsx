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
  ArrowUpRight,
  Activity,
  ChevronDown,
  ShieldAlert,
  SlidersHorizontal,
  Bot,
  User,
  ExternalLink,
  ArrowLeft,
  Save,
  Check,
  CalendarDays,
  MessageSquare
} from 'lucide-react';
import { STAGES } from '../order-to-delivery/types/stages';
import { fetchOrders, getCachedOrders, saveOrder } from '../order-to-delivery/utils/storage';
import supabase from '../checklist-delegation/SupabaseClient';
import { fetchMasters } from '../order-to-delivery/utils/masterStorage';
import { useUnifiedAuth } from '../../core/auth/UnifiedAuthContext';

export default function ProductionControlView() {
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();
  
  // Navigation: null = Main PC Dashboard (Showing only the 2 systems), 'otd' = Order to Delivery System Details, 'checklist' = Checklist & Delegation System Details
  const [activeSystemView, setActiveSystemView] = useState(null); 

  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Critical' | 'Delayed' | 'On Track'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase()
  );

  const [orders, setOrders] = useState(() => getCachedOrders() || []);
  const [ordersLoading, setOrdersLoading] = useState(() => getCachedOrders() === null);
  const [checklistTasks, setChecklistTasks] = useState([]);
  const [delegationTasks, setDelegationTasks] = useState([]);
  const [tatMasters, setTatMasters] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Selected stage filter inside detail view
  const [selectedStageFilter, setSelectedStageFilter] = useState('All');

  // Saving state indicator for remarks and dates
  const [savingId, setSavingId] = useState(null);
  const [saveSuccessId, setSaveSuccessId] = useState(null);

  // Live timer display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase()
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load live data across both systems
  const loadData = async () => {
    setOrdersLoading(true);
    setTasksLoading(true);

    try {
      const [liveOrders, tats] = await Promise.all([
        fetchOrders(),
        fetchMasters('tat')
      ]);
      setOrders(liveOrders || []);
      setTatMasters(tats || []);
    } catch (e) {
      console.error('Failed to load orders/masters for PC', e);
    } finally {
      setOrdersLoading(false);
    }

    try {
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

      if (chkRes?.data) setChecklistTasks(chkRes.data);
      if (delRes?.data) setDelegationTasks(delRes.data);
    } catch (err) {
      console.error('Failed to fetch pending tasks for PC', err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // In-charge / Stage Owner from TAT Master
  const getStageOwner = (moduleName, stageName, fallback = 'Unassigned') => {
    const rec = tatMasters.find(t => 
      (t.moduleName?.toLowerCase() === moduleName.toLowerCase() || t.module?.toLowerCase() === moduleName.toLowerCase()) &&
      (t.stageName?.toLowerCase() === stageName.toLowerCase() || t.stageId === stageName)
    );
    return rec?.assignedPerson || fallback;
  };

  // Helper for delay calculation
  const calcAvgDelay = (items, dateKey) => {
    const today = new Date();
    if (!items || items.length === 0) return { days: 0, text: 'No delay', isDelayed: false };
    let totalDelayMs = 0;
    let delayCount = 0;
    items.forEach(it => {
      const d = it[dateKey] ? new Date(it[dateKey]) : null;
      if (d && d < today) {
        totalDelayMs += (today - d);
        delayCount++;
      }
    });
    if (delayCount === 0) return { days: 0, text: 'No delay', isDelayed: false };
    const avgDays = (totalDelayMs / delayCount) / (1000 * 60 * 60 * 24);
    const days = Math.floor(avgDays);
    const hours = Math.round((avgDays - days) * 24);
    return {
      days: avgDays,
      text: days > 0 ? `${days}d ${hours > 0 ? `${hours}h` : ''}` : `${hours}h`,
      isDelayed: true
    };
  };

  // Build the 2 Systems data: Order to Delivery and Checklist & Delegation
  const systemsData = useMemo(() => {
    const today = new Date();

    // 1. Order to Delivery (10 Stages)
    const otdStages = STAGES.map((stg, idx) => {
      const stageOrders = orders.filter(o => o.currentStageId === stg.id && (o.currentStageIndex ?? 0) < 10);
      const overdue = stageOrders.filter(o => o.deliveryDate && new Date(o.deliveryDate) < today);
      const todayPendingOrders = stageOrders.filter(o => o.deliveryDate && new Date(o.deliveryDate).toDateString() === today.toDateString());
      
      const stgDelay = calcAvgDelay(stageOrders, 'deliveryDate');
      const owner = getStageOwner('Order to Delivery', stg.name, getStageOwner('Order to Delivery', stg.id, 'Production Lead'));

      return {
        index: idx + 1,
        id: stg.id,
        name: stg.name,
        owner: owner,
        avgDelay: stgDelay.text,
        todayPending: todayPendingOrders.length > 0 ? `${todayPendingOrders.length} pending` : (overdue.length > 0 ? `${overdue.length} overdue` : (stageOrders.length > 0 ? `${stageOrders.length} in stage` : '—')),
        status: overdue.length > 0 ? 'Critical' : (stageOrders.length > 0 ? 'Delayed' : 'On Track'),
        pendingRaw: stageOrders.length,
        items: stageOrders
      };
    });

    const otdTotalPending = orders.filter(o => (o.currentStageIndex ?? 0) < 10).length;
    const otdAvgDelay = calcAvgDelay(orders.filter(o => (o.currentStageIndex ?? 0) < 10), 'deliveryDate');
    const otdCriticalStages = otdStages.filter(s => s.status === 'Critical').length;
    const otdStatus = otdCriticalStages > 0 ? 'Critical' : (otdTotalPending > 0 ? 'Delayed' : 'On Track');

    // 2. Checklist & Delegation (3 Stages / Workflows)
    const chkTodayPending = checklistTasks.filter(t => {
      if (!t.task_date) return false;
      const d = new Date(t.task_date);
      return d.toDateString() === today.toDateString();
    }).length;

    const chkOverdue = checklistTasks.filter(t => {
      if (!t.task_date) return false;
      return new Date(t.task_date) < today;
    });

    const delTodayPending = delegationTasks.filter(t => {
      if (!t.task_start_date) return false;
      const d = new Date(t.task_start_date);
      return d.toDateString() === today.toDateString();
    }).length;

    const delOverdue = delegationTasks.filter(t => {
      if (!t.task_start_date) return false;
      return new Date(t.task_start_date) < today;
    });

    const chkDelay = calcAvgDelay(checklistTasks, 'task_date');
    const delDelay = calcAvgDelay(delegationTasks, 'task_start_date');

    const checklistStages = [
      {
        index: 1,
        id: 'checklist_ops',
        name: 'Checklist Operations',
        owner: getStageOwner('Checklist Operations', 'Daily Routine', 'Operations Team'),
        avgDelay: chkDelay.text,
        todayPending: chkTodayPending > 0 ? `${chkTodayPending} pending` : (chkOverdue.length > 0 ? `${chkOverdue.length} overdue` : (checklistTasks.length > 0 ? `${checklistTasks.length} in stage` : '—')),
        status: chkOverdue.length > 0 ? 'Critical' : (checklistTasks.length > 0 ? 'Delayed' : 'On Track'),
        pendingRaw: checklistTasks.length,
        items: checklistTasks
      },
      {
        index: 2,
        id: 'delegation_tasks',
        name: 'Delegation Follow-up',
        owner: getStageOwner('Delegation Tasks', 'Delegation', 'Executive Admin'),
        avgDelay: delDelay.text,
        todayPending: delTodayPending > 0 ? `${delTodayPending} pending` : (delOverdue.length > 0 ? `${delOverdue.length} overdue` : (delegationTasks.length > 0 ? `${delegationTasks.length} in stage` : '—')),
        status: delOverdue.length > 0 ? 'Critical' : (delegationTasks.length > 0 ? 'Delayed' : 'On Track'),
        pendingRaw: delegationTasks.length,
        items: delegationTasks
      },
      {
        index: 3,
        id: 'approval_gate',
        name: 'Approval Pending',
        owner: getStageOwner('Approval Gate', 'Admin Approval', 'Management'),
        avgDelay: 'No delay',
        todayPending: '—',
        status: 'On Track',
        pendingRaw: 0,
        items: []
      }
    ];

    const chkTotalCount = checklistTasks.length + delegationTasks.length;
    const chkWorstDelay = chkDelay.days >= delDelay.days ? chkDelay.text : delDelay.text;
    const chkStatus = (chkOverdue.length > 0 || delOverdue.length > 0) ? 'Critical' : (chkTotalCount > 0 ? 'Delayed' : 'On Track');

    return [
      {
        id: 'otd',
        title: 'Order to Delivery (Bespoke Atelier)',
        department: 'Production & Sales',
        totalTasks: otdTotalPending,
        todayPending: orders.filter(o => o.deliveryDate && new Date(o.deliveryDate).toDateString() === today.toDateString()).length,
        avgDelay: otdAvgDelay.text,
        systemHealth: Math.max(12, 100 - (otdCriticalStages * 10) - (otdTotalPending * 4)),
        status: otdStatus,
        stageCount: 10,
        attentionCount: orders.filter(o => o.deliveryDate && new Date(o.deliveryDate) < today).length,
        worstDelay: otdAvgDelay.text,
        stages: otdStages
      },
      {
        id: 'chk_del',
        title: 'Checklist & Delegation',
        department: 'Operations',
        totalTasks: chkTotalCount,
        todayPending: chkTodayPending + delTodayPending,
        avgDelay: chkDelay.days > 0 ? chkDelay.text : (delDelay.days > 0 ? delDelay.text : 'No delay'),
        systemHealth: Math.max(15, 100 - (chkOverdue.length * 6) - (delOverdue.length * 8)),
        status: chkStatus,
        stageCount: checklistStages.length,
        attentionCount: chkOverdue.length + delOverdue.length,
        worstDelay: chkWorstDelay,
        stages: checklistStages
      }
    ];
  }, [orders, checklistTasks, delegationTasks, tatMasters]);

  // Overall KPI counts
  const totalTasksCount = useMemo(() => systemsData.reduce((acc, s) => acc + s.totalTasks, 0), [systemsData]);
  const criticalCount = useMemo(() => systemsData.filter(s => s.status === 'Critical').length, [systemsData]);
  const delayedCount = useMemo(() => systemsData.filter(s => s.status === 'Delayed').length, [systemsData]);
  const onTrackCount = useMemo(() => systemsData.filter(s => s.status === 'On Track').length, [systemsData]);

  // Save handler for Order PC Target Date & Remark
  const handleSaveOrderUpdate = async (orderId, pcTargetDate, remark) => {
    setSavingId(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updated = {
        ...order,
        // Delivery date remains untouched and original!
        pcTargetDate: pcTargetDate || order.pcTargetDate || '',
        pcRemarks: remark ?? order.pcRemarks ?? '',
        pcLastUpdated: new Date().toISOString(),
        pcUpdatedBy: user?.name || 'PC In-Charge'
      };

      // Await real submission to database: do not show Saved until it actually gets saved
      await saveOrder(updated);

      // Once confirmed saved in DB:
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setSaveSuccessId(orderId);
      setTimeout(() => setSaveSuccessId(null), 2500);
    } catch (err) {
      console.error('Failed to save PC order update', err);
      alert('Error updating order: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Save handler for Checklist / Delegation task PC Target Date & Remark
  const handleSaveTaskUpdate = async (taskId, table, pcTargetDate, remark) => {
    setSavingId(taskId);
    try {
      const updatePayload = {
        pc_target_date: pcTargetDate,
        remark: remark,
        updated_at: new Date().toISOString()
      };

      // Await real submission to database
      const { error } = await supabase.from(table).update(updatePayload).eq('id', taskId);
      if (error) {
        console.warn('Direct update failed, falling back to remark', error);
        const fallback = await supabase.from(table).update({ remark, updated_at: new Date().toISOString() }).eq('id', taskId);
        if (fallback.error) throw fallback.error;
      }

      // Once confirmed saved in DB:
      if (table === 'tasks') {
        setChecklistTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatePayload } : t));
      } else if (table === 'delegation') {
        setDelegationTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatePayload } : t));
      }

      setSaveSuccessId(taskId);
      setTimeout(() => setSaveSuccessId(null), 2500);
    } catch (err) {
      console.error('Failed to update task', err);
      alert('Error updating task: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Active detail system object
  const currentSystem = systemsData.find(s => s.id === activeSystemView);

  return (
    <div className="w-full min-w-0 bg-[#F8F9FA] min-h-screen text-[#1A1A1A]">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {activeSystemView && (
              <button
                onClick={() => { setActiveSystemView(null); setSelectedStageFilter('All'); }}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer mr-1"
                title="Back to All Systems"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-[#5B172E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              PC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  {activeSystemView ? currentSystem?.title : 'Process Control'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live · Updated {currentTimeStr}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeSystemView
                  ? 'Stage-wise detail view · save remarks & new completion dates'
                  : 'Company-wide system health · delay tracking · stage-wise accountability'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activeSystemView && (
              <button
                onClick={() => { setActiveSystemView(null); setSelectedStageFilter('All'); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ← Back to Systems
              </button>
            )}
            <button
              onClick={loadData}
              disabled={ordersLoading || tasksLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading || tasksLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ========================================================================= */}
        {/* VIEW A: MAIN PC DASHBOARD (EXACTLY 2 SEPARATE SYSTEM DIVS)                */}
        {/* ========================================================================= */}
        {!activeSystemView && (
          <>
            {/* Top 4 KPI Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="text-3xl font-extrabold text-gray-900">{totalTasksCount}</div>
                <div className="text-xs font-bold text-gray-800 mt-1">Total Tasks</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Across 2 core systems</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="text-3xl font-extrabold text-rose-600">
                  {criticalCount > 0 ? totalTasksCount : 0}
                </div>
                <div className="text-xs font-bold text-rose-700 mt-1">Critical</div>
                <div className="text-[11px] text-gray-500 mt-0.5">In {criticalCount} system · need immediate action</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="text-3xl font-extrabold text-amber-500">{delayedCount}</div>
                <div className="text-xs font-bold text-amber-700 mt-1">Delayed</div>
                <div className="text-[11px] text-gray-500 mt-0.5">In {delayedCount} systems · running behind</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="text-3xl font-extrabold text-emerald-600">{onTrackCount}</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">On Track</div>
                <div className="text-[11px] text-gray-500 mt-0.5">In {onTrackCount} system · operating normally</div>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterStatus('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === 'All'
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All 2
                </button>
                <button
                  onClick={() => setFilterStatus('Critical')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === 'Critical'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-rose-600 border border-gray-200 hover:bg-rose-50'
                  }`}
                >
                  Critical {criticalCount}
                </button>
                <button
                  onClick={() => setFilterStatus('Delayed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === 'Delayed'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-amber-600 border border-gray-200 hover:bg-amber-50'
                  }`}
                >
                  Delayed {delayedCount}
                </button>
                <button
                  onClick={() => setFilterStatus('On Track')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === 'On Track'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-600 border border-gray-200 hover:bg-emerald-50'
                  }`}
                >
                  On Track {onTrackCount}
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search systems, stages, owners..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/20"
                />
              </div>
            </div>

            {/* ONLY THE 2 REQUESTED SYSTEM CARDS (EXACT SCREENSHOT LAYOUT & THEMING) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemsData
                .filter(sys => {
                  if (filterStatus !== 'All' && sys.status !== filterStatus) return false;
                  if (searchTerm) {
                    const match = sys.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      sys.stages.some(st => st.name.toLowerCase().includes(searchTerm.toLowerCase()) || st.owner.toLowerCase().includes(searchTerm.toLowerCase()));
                    if (!match) return false;
                  }
                  return true;
                })
                .map((sys) => {
                  const isCrit = sys.status === 'Critical';
                  const isDel = sys.status === 'Delayed';
                  const statusColor = isCrit ? '#E11D48' : isDel ? '#F59E0B' : '#10B981';
                  const healthPercent = Math.min(100, Math.max(0, sys.systemHealth));

                  return (
                    <div
                      key={sys.id}
                      onClick={() => {
                        setActiveSystemView(sys.id);
                        setSelectedStageFilter('All');
                      }}
                      className="bg-white rounded-[24px] border border-[#E8DFD3] p-6 shadow-sm hover:shadow-md hover:border-[#5B172E]/40 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      {/* Top Header: Icon + Title + Department & Status Indicator */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8] flex items-center justify-center font-bold text-base shrink-0 group-hover:bg-[#5B172E] group-hover:text-white transition-colors">
                              {sys.id === 'otd' ? (
                                <Scissors className="w-5 h-5" />
                              ) : (
                                <ClipboardList className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <h2 className="text-base font-serif font-bold text-[#431021] group-hover:text-[#5B172E] transition-colors tracking-tight">
                                {sys.title}
                              </h2>
                              <p className="text-xs text-stone-500 font-medium mt-0.5">{sys.department}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pt-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: statusColor }}
                            />
                            <span
                              className="text-xs font-bold"
                              style={{ color: statusColor }}
                            >
                              {sys.status}
                            </span>
                          </div>
                        </div>

                        {/* 3 Metrics Block (TOTAL | TODAY PENDING | AVG DELAY) */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="bg-[#FAF8F5] rounded-2xl p-4 text-center border border-[#F0E6D8]">
                            <div className="text-2xl font-bold font-serif text-[#5B172E]">
                              {sys.totalTasks}
                            </div>
                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                              TOTAL
                            </div>
                          </div>

                          <div className="bg-[#FAF8F5] rounded-2xl p-4 text-center border border-[#F0E6D8]">
                            <div className="text-2xl font-bold font-serif text-[#5B172E]">
                              {sys.todayPending}
                            </div>
                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                              TODAY PENDING
                            </div>
                          </div>

                          <div className="bg-[#FAF8F5] rounded-2xl p-4 text-center border border-[#F0E6D8]">
                            <div
                              className="text-2xl font-bold font-serif truncate"
                              style={{ color: isCrit ? '#E11D48' : '#5B172E' }}
                            >
                              {sys.avgDelay}
                            </div>
                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                              AVG DELAY
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Strip: System Health Progress Bar + Attention Count + Arrow Button */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-stone-500 font-medium">System Health</span>
                          <div className="flex items-center gap-2.5">
                            <span
                              className="font-bold font-serif text-sm"
                              style={{ color: sys.systemHealth < 50 ? '#E11D48' : '#10B981' }}
                            >
                              {sys.systemHealth}%
                            </span>
                            {sys.attentionCount > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{sys.attentionCount}</span>
                              </span>
                            )}
                            <div className="w-7 h-7 rounded-full bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8] flex items-center justify-center group-hover:bg-[#5B172E] group-hover:text-white transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-[#FAF0E6] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${healthPercent}%`,
                              backgroundColor: sys.systemHealth < 50 ? '#E11D48' : '#10B981'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW B: SEPARATE SYSTEM STAGE-WISE DETAIL PAGE WITH REMARK & PC TARGET DATE */}
        {/* ========================================================================= */}
        {activeSystemView && currentSystem && (
          <div className="space-y-6">
            {/* System Info Banner with Luxury Styling */}
            <div className="bg-white rounded-[24px] p-6 border border-[#E8DFD3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                  {currentSystem.department}
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#431021] mt-1.5">{currentSystem.title}</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Stage-wise accountability: review delay metrics, assign PC target dates, and document process remarks.
                </p>
              </div>

              {/* Stage Filter Dropdown Styled matching Atelier Theme */}
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[#5B172E] uppercase tracking-wider shrink-0">
                  Filter Stage:
                </span>
                <div className="relative min-w-[240px] sm:min-w-[280px]">
                  <select
                    value={selectedStageFilter}
                    onChange={(e) => setSelectedStageFilter(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl text-xs font-bold bg-[#FAF8F5] text-[#431021] border border-[#DECDB8] hover:border-[#5B172E] focus:outline-none focus:ring-2 focus:ring-[#5B172E]/20 transition-all cursor-pointer shadow-xs"
                  >
                    <option value="All">
                      All Stages ({currentSystem.stages.reduce((sum, s) => sum + s.pendingRaw, 0)} items)
                    </option>
                    {currentSystem.stages.map((st) => (
                      <option key={st.id} value={st.id}>
                        Stage {st.index}: {st.name} ({st.pendingRaw} items)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#9B783E] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Stage Item Cards */}
            <div className="space-y-6">
              {currentSystem.stages
                .filter(st => selectedStageFilter === 'All' || selectedStageFilter === st.id)
                .map(stage => {
                  return (
                    <div key={stage.id} className="bg-white rounded-[24px] border border-[#E8DFD3] shadow-xs overflow-hidden">
                      {/* Stage Sub-Header */}
                      <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#F0E6D8] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#5B172E] text-[#FAF6F0] font-serif text-xs font-bold flex items-center justify-center shadow-xs">
                            {stage.index}
                          </span>
                          <div>
                            <h3 className="text-sm font-serif font-bold text-[#431021]">{stage.name}</h3>
                            <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                              <span>In-Charge: <strong className="text-stone-800">{stage.owner}</strong></span>
                              <span>·</span>
                              <span>Avg Delay: <strong className={stage.avgDelay !== 'No delay' ? 'text-rose-600' : 'text-stone-700'}>{stage.avgDelay}</strong></span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                            stage.status === 'Critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : stage.status === 'Delayed'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {stage.pendingRaw} Active Items ({stage.status})
                        </span>
                      </div>

                      {/* Items in this stage */}
                      {stage.items.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-400 font-medium">
                          No pending tasks or orders in this stage. All items on track!
                        </div>
                      ) : (
                        <div className="divide-y divide-[#F0E6D8]">
                          {stage.items.map((item, itemIdx) => {
                            if (activeSystemView === 'otd') {
                              return (
                                <OrderStageItemRow
                                  key={item.id || itemIdx}
                                  order={item}
                                  saving={savingId === item.id}
                                  saveSuccess={saveSuccessId === item.id}
                                  onSave={(pcTargetDate, remark) => handleSaveOrderUpdate(item.id, pcTargetDate, remark)}
                                />
                              );
                            }

                            const isChecklist = stage.id === 'checklist_ops';
                            const table = isChecklist ? 'tasks' : 'delegation';
                            return (
                              <TaskStageItemRow
                                key={item.id || itemIdx}
                                task={item}
                                isChecklist={isChecklist}
                                saving={savingId === item.id}
                                saveSuccess={saveSuccessId === item.id}
                                onSave={(pcTargetDate, remark) => handleSaveTaskUpdate(item.id, table, pcTargetDate, remark)}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent: Order Row for Order to Delivery Stage Detail View
function OrderStageItemRow({ order, onSave, saving, saveSuccess }) {
  const [remark, setRemark] = useState(order.pcRemarks || order.notes || '');
  const [pcTargetDate, setPcTargetDate] = useState(order.pcTargetDate || '');

  return (
    <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-[#FAF8F5]/80 transition-colors">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs font-bold text-[#5B172E] bg-[#FAF5EE] px-2.5 py-0.5 rounded-lg border border-[#DECDB8]">
            {order.id}
          </span>
          <h4 className="text-base font-serif font-bold text-[#431021]">{order.clientName || 'Unnamed Client'}</h4>
          {order.designNumber && (
            <span className="text-xs text-[#9B783E] font-semibold bg-[#FAF5EE] px-2 py-0.5 rounded-md border border-[#DECDB8]">
              Design #{order.designNumber}
            </span>
          )}
        </div>
        <p className="text-xs text-stone-600">
          <strong className="text-stone-800">Garment:</strong> {order.nameOfDesign || order.garmentType || 'Bespoke Order'} · <strong className="text-stone-800">Size:</strong> {order.size || 'Custom'}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1 flex-wrap">
          <span>Original Target Delivery: <strong className="text-stone-800">{order.deliveryDate || 'Not set'}</strong></span>
          {order.trialDate && <span>· Trial Date: <strong className="text-stone-800">{order.trialDate}</strong></span>}
          {order.pcLastUpdated && (
            <span className="text-[#9B783E] font-medium">
              · Last PC update by {order.pcUpdatedBy || 'Staff'} on {new Date(order.pcLastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Input controls: PC Target Date + Remark + Save Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 shrink-0 w-full lg:w-auto">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-[#5B172E] uppercase tracking-wider mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-[#9B783E]" />
            <span>PC Target Date</span>
          </label>
          <input
            type="date"
            value={pcTargetDate}
            onChange={(e) => setPcTargetDate(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/20 text-stone-800 font-medium shadow-xs"
          />
        </div>

        <div className="flex flex-col flex-1 sm:w-72">
          <label className="text-[10px] font-bold text-[#5B172E] uppercase tracking-wider mb-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-[#9B783E]" />
            <span>PC Stage Remark</span>
          </label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Document stage progress, issues or remarks..."
            className="px-3 py-2 text-xs bg-white border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/20 text-stone-800 shadow-xs placeholder:text-stone-400"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => onSave(pcTargetDate, remark)}
            disabled={saving}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#5B172E] hover:bg-[#431021] text-white active:scale-95'
            }`}
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Task Row for Checklist & Delegation Stage Detail View
function TaskStageItemRow({ task, isChecklist, onSave, saving, saveSuccess }) {
  const currentDate = isChecklist ? task.task_date : task.task_start_date;
  const [remark, setRemark] = useState(task.remark || task.notes || '');
  const [pcTargetDate, setPcTargetDate] = useState(task.pc_target_date || '');

  return (
    <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-[#FAF8F5]/80 transition-colors">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs font-bold text-[#5B172E] bg-[#FAF5EE] px-2.5 py-0.5 rounded-lg border border-[#DECDB8]">
            #{task.id}
          </span>
          <h4 className="text-base font-serif font-bold text-[#431021]">
            {task.task_name || task.task_description || 'Checklist Item'}
          </h4>
        </div>
        <p className="text-xs text-stone-600">
          <strong className="text-stone-800">Assigned To:</strong> {task.assigned_to || task.doer_name || task.name || 'Unassigned'} · <strong className="text-stone-800">Department:</strong> {task.department || 'Operations'}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1">
          <span>Original Schedule: <strong className="text-stone-800">{currentDate || 'Not set'}</strong></span>
          <span>· Status: <strong className="text-amber-700">{task.status || 'Pending'}</strong></span>
        </div>
      </div>

      {/* Input controls: PC Target Date + Remark + Save Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 shrink-0 w-full lg:w-auto">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-[#5B172E] uppercase tracking-wider mb-1 flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-[#9B783E]" />
            <span>PC Target Date</span>
          </label>
          <input
            type="date"
            value={pcTargetDate}
            onChange={(e) => setPcTargetDate(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/20 text-stone-800 font-medium shadow-xs"
          />
        </div>

        <div className="flex flex-col flex-1 sm:w-72">
          <label className="text-[10px] font-bold text-[#5B172E] uppercase tracking-wider mb-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-[#9B783E]" />
            <span>PC Task Remark</span>
          </label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add update note or postponement reason..."
            className="px-3 py-2 text-xs bg-white border border-[#DECDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B172E]/20 text-stone-800 shadow-xs placeholder:text-stone-400"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => onSave(pcTargetDate, remark)}
            disabled={saving}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#5B172E] hover:bg-[#431021] text-white active:scale-95'
            }`}
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
