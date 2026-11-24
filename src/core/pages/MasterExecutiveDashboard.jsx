import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  ClipboardCheck,
  Scissors,
  CheckCircle2,
  Clock,
  Trophy,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ChevronRight,
  Building2,
  UserCheck
} from 'lucide-react';
import supabase from '../config/supabaseClient';
import { useUnifiedAuth } from '../auth/UnifiedAuthContext';
import { fetchOrders } from '../../Systems/order-to-delivery/utils/storage';
import { STAGES } from '../../Systems/order-to-delivery/types/stages';
import { canUserAccessPage, canUserAccessChecklistPage } from '../../Systems/order-to-delivery/utils/userAuthService';

export default function MasterExecutiveDashboard() {
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live Metrics State
  const [checklistTasks, setChecklistTasks] = useState([]);
  const [delegationTasks, setDelegationTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // Fetch all real-time operational data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const username = (user?.username || user?.name || '').toLowerCase();

      // 1. Fetch Orders from OTD
      const ordersData = await fetchOrders().catch(() => []);
      setOrders(ordersData || []);

      // 2. Fetch Checklist Tasks (today/active)
      const { data: clData } = await supabase
        .from('checklist')
        .select('*')
        .order('task_id', { ascending: false })
        .limit(300);
      setChecklistTasks(clData || []);

      // 3. Fetch Delegation Tasks
      const { data: delData } = await supabase
        .from('delegation')
        .select('*')
        .order('task_id', { ascending: false })
        .limit(200);
      setDelegationTasks(delData || []);

      // 4. Fetch Holidays
      const { data: holData } = await supabase
        .from('holidays')
        .select('*')
        .order('holiday_date', { ascending: true })
        .limit(10);
      setHolidays(holData || []);
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Operational Calculations (Strictly personalized: each user sees only their OWN score and tasks)
  const currentUsername = (user?.username || '').toLowerCase().trim();
  const currentDisplayName = (user?.name || '').toLowerCase().trim();

  // Helper to test if a task belongs to the currently logged in user
  const isUserTask = (t) => {
    const assigned = (t.name || t.assigned_person || t.user_name || '').toLowerCase().trim();
    if (!assigned) return false;
    return (
      (currentUsername && assigned === currentUsername) ||
      (currentDisplayName && assigned === currentDisplayName) ||
      (currentDisplayName && assigned.includes(currentDisplayName)) ||
      (currentUsername && assigned.includes(currentUsername))
    );
  };

  // 1. Checklist Metrics (Strictly for Current User's Own Tasks)
  const userChecklists = useMemo(() => {
    if (!checklistTasks.length) return [];
    return checklistTasks.filter(isUserTask);
  }, [checklistTasks, currentUsername, currentDisplayName]);

  const checklistDoneCount = useMemo(() => {
    return userChecklists.filter((t) => {
      const s = (t.status || '').toLowerCase();
      return s === 'yes' || s === 'done' || s === 'completed';
    }).length;
  }, [userChecklists]);

  const checklistTotalCount = userChecklists.length || 0;
  const checklistPendingCount = Math.max(0, checklistTotalCount - checklistDoneCount);
  const checklistRate = checklistTotalCount > 0
    ? Math.round((checklistDoneCount / checklistTotalCount) * 100)
    : 0;

  // 2. Delegation Metrics (Strictly for Current User's Own Delegations)
  const userDelegations = useMemo(() => {
    if (!delegationTasks.length) return [];
    return delegationTasks.filter(isUserTask);
  }, [delegationTasks, currentUsername, currentDisplayName]);

  const delegationDoneCount = useMemo(() => {
    return userDelegations.filter((t) => {
      const s = (t.status || '').toLowerCase();
      return s === 'done' || s === 'completed' || s === 'yes';
    }).length;
  }, [userDelegations]);

  const delegationTotalCount = userDelegations.length || 0;
  const delegationPendingCount = Math.max(0, delegationTotalCount - delegationDoneCount);
  const delegationRate = delegationTotalCount > 0
    ? Math.round((delegationDoneCount / delegationTotalCount) * 100)
    : 0;

  // 3. Order to Delivery (OTD) Pipeline Metrics (Scoped to user's orders unless company-wide master admin)
  const userOrders = useMemo(() => {
    if (!orders.length) return [];
    if (user?.canAccessAllOrders || user?.isAdmin || (user?.role || '').toLowerCase() === 'admin') {
      return orders;
    }
    return orders.filter((o) => {
      const actor = (o.actor || o.createdBy || o.userId || '').toLowerCase().trim();
      return (
        actor === currentUsername ||
        actor === currentDisplayName ||
        actor.includes(currentUsername)
      );
    });
  }, [orders, user, currentUsername, currentDisplayName]);

  const activeOrders = useMemo(() => {
    return userOrders.filter((o) => (o.currentStageIndex ?? 0) < 9);
  }, [userOrders]);

  const deliveredOrders = useMemo(() => {
    return userOrders.filter((o) => (o.currentStageIndex ?? 0) >= 9);
  }, [userOrders]);

  const urgentOrders = useMemo(() => {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return activeOrders.filter((o) => {
      if (!o.deliveryDate) return false;
      const d = new Date(o.deliveryDate);
      return !isNaN(d) && d <= threeDaysLater;
    });
  }, [activeOrders]);

  // 4. Production Control (PC) Stage Analysis
  const pcDelayedOrders = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return activeOrders.filter((o) => {
      const stageDate = o.stageDueDate || o.expectedCompletionDate || o.deliveryDate;
      return stageDate && stageDate < todayStr;
    });
  }, [activeOrders]);

  // 5. Unified MIS Score Calculation (Weighted operational index: 0 - 100)
  const misScore = useMemo(() => {
    const otdCompletionRate = orders.length > 0
      ? Math.round((deliveredOrders.length / orders.length) * 100)
      : 100;

    const weights = {
      checklist: 0.45,
      delegation: 0.35,
      otd: 0.20,
    };

    const score = Math.round(
      (checklistRate * weights.checklist) +
      (delegationRate * weights.delegation) +
      (otdCompletionRate * weights.otd)
    );

    return Math.min(100, Math.max(0, score || 0));
  }, [checklistRate, delegationRate, orders.length, deliveredOrders.length]);

  // Overall Task Completion Ratio
  const totalTasksAssigned = checklistTotalCount + delegationTotalCount;
  const totalTasksCompleted = checklistDoneCount + delegationDoneCount;
  const totalTasksPending = checklistPendingCount + delegationPendingCount;
  const overallTaskRate = totalTasksAssigned > 0
    ? Math.round((totalTasksCompleted / totalTasksAssigned) * 100)
    : 0;

  // Upcoming Studio Holidays (Next 30 days)
  const upcomingHolidays = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return holidays.filter((h) => h.holiday_date >= today).slice(0, 4);
  }, [holidays]);

  // Permission Checks
  const canSeeOTD = canUserAccessPage(user, 'orders') || canUserAccessPage(user, 'dashboard');
  const canSeePC = canUserAccessPage(user, 'pc');
  const canSeeChecklist = canUserAccessChecklistPage(user, '/checklist/task');

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-stone-800 p-3 sm:p-5 md:p-6 lg:p-8 font-sans selection:bg-[#C5A059]/20">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">

        {/* =========================================================================
            HEADER BAR: Luxury Title + Company & Live Sync Controls
        ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B172E] to-[#431021] border border-[#C5A059]/40 flex items-center justify-center shadow-sm">
              <LayoutDashboard className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#431021]">Dashboard</h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#5B172E]/10 text-[#5B172E] border border-[#5B172E]/20">
                  Live Executive
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Sainy Couture Master Operations & Performance Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E8DFD3] text-xs shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-[#9B783E]" />
              <span className="font-bold text-[#431021]">Sainy Couture</span>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3ECE2] border border-[#E8DFD3] text-xs font-bold text-[#5B172E] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Refresh Live Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#9B783E]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            ROW 1: TRI-CARD EXECUTIVE HERO (MIS Score | User Identity | Task Status)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">

          {/* CARD 1: OVERALL MIS SCORE GAUGE (Light Luxury Theme) */}
          <div className="md:col-span-4 lg:col-span-3 bg-white border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">MIS Score</span>
                <p className="text-[11px] text-stone-400">Overall performance index</p>
              </div>
              <span className="p-1.5 rounded-lg bg-[#FAF6F0] text-[#9B783E] border border-[#E8DFD3]">
                <Trophy className="w-4 h-4" />
              </span>
            </div>

            {/* Circular MIS Gauge */}
            <div className="my-4 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-stone-100"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * misScore) / 100}
                    strokeLinecap="round"
                    className="text-[#5B172E] transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-[#431021] tracking-tight">{misScore}</span>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">out of 100</span>
                </div>
              </div>
              <p className="text-[11px] italic text-stone-500 text-center mt-2 px-2">
                "Excellence is not an act, but a habit."
              </p>
            </div>

            {/* Bottom Meta */}
            <div className="pt-3 border-t border-[#E8DFD3] grid grid-cols-3 text-center text-xs">
              <div>
                <span className="block text-stone-400 text-[10px] font-bold uppercase">Rank</span>
                <span className="font-black text-[#431021]">#1</span>
              </div>
              <div>
                <span className="block text-stone-400 text-[10px] font-bold uppercase">Dept</span>
                <span className="font-bold text-[#431021] truncate px-1">
                  {user?.designation || user?.department || 'Couture'}
                </span>
              </div>
              <div>
                <span className="block text-stone-400 text-[10px] font-bold uppercase">Cycle</span>
                <span className="font-bold text-emerald-700">Active</span>
              </div>
            </div>
          </div>

          {/* CARD 2: PERSONAL & EMPLOYMENT DETAILS */}
          <div className="md:col-span-8 lg:col-span-5 bg-white border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Employee Profile</span>
                  <p className="text-[11px] text-stone-400">Personal & operational credentials</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#5B172E] text-white shadow-2xs">
                  {user?.role || 'User'}
                </span>
              </div>

              {/* User Identity Header */}
              <div className="flex items-center gap-3.5 mt-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#5B172E] to-[#431021] text-white flex items-center justify-center font-serif font-black text-xl border-2 border-[#C5A059]/40 shadow-sm">
                  {(user?.name || user?.username || 'SG').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-[#431021] truncate">{user?.name || user?.username || 'Executive'}</h2>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 truncate mt-0.5">
                    <span className="font-mono">@{user?.username || 'user'}</span>
                    <span>•</span>
                    <span className="text-[#9B783E] font-bold">{user?.designation || 'Master Team'}</span>
                  </p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3]">
                  <span className="block text-[10px] text-stone-400 font-bold uppercase">Account Status</span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Active
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3]">
                  <span className="block text-[10px] text-stone-400 font-bold uppercase">Department</span>
                  <span className="text-xs font-bold text-[#431021] truncate mt-0.5 block">
                    {user?.department || 'Design & Prod'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3] col-span-2 sm:col-span-1">
                  <span className="block text-[10px] text-stone-400 font-bold uppercase">User ID</span>
                  <span className="text-xs font-bold text-stone-700 font-mono mt-0.5 block truncate">
                    {user?.id || 'USR-01'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Task Tally Sub-divs */}
            <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-[#E8DFD3]">
              <div
                onClick={() => navigate('/checklist/task')}
                className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100/70 border border-blue-200 cursor-pointer transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between text-blue-900 font-bold">
                  <span className="text-[11px]">Checklist Tasks</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-blue-950">{checklistDoneCount}/{checklistTotalCount}</span>
                  <span className="text-[10px] text-blue-700 font-semibold">Done</span>
                </div>
              </div>

              <div
                onClick={() => navigate('/checklist/delegation')}
                className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200 cursor-pointer transition-all group shadow-2xs"
              >
                <div className="flex items-center justify-between text-amber-900 font-bold">
                  <span className="text-[11px]">Delegation Tasks</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-amber-950">{delegationDoneCount}/{delegationTotalCount}</span>
                  <span className="text-[10px] text-amber-700 font-semibold">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: TASK COMPLETION & ACHIEVEMENTS */}
          <div className="md:col-span-12 lg:col-span-4 bg-white border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Task Performance</span>
                  <p className="text-[11px] text-stone-400">Completion rate & achievements</p>
                </div>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                  <span className="text-base font-black text-emerald-950 block">{totalTasksCompleted}</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-700">Completed</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <Clock className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                  <span className="text-base font-black text-amber-950 block">{totalTasksPending}</span>
                  <span className="text-[9px] uppercase font-bold text-amber-700">Pending</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#DECDB8] text-center">
                  <Trophy className="w-4 h-4 text-[#9B783E] mx-auto mb-1" />
                  <span className="text-base font-black text-[#5B172E] block">{misScore}</span>
                  <span className="text-[9px] uppercase font-bold text-[#9B783E]">Score</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-600">Overall Task Completion</span>
                  <span className="font-black text-emerald-700">{overallTaskRate}%</span>
                </div>
                <div className="h-2.5 w-full bg-[#FAF6F0] rounded-full overflow-hidden border border-[#E8DFD3]">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-[#5B172E] rounded-full transition-all duration-700"
                    style={{ width: `${overallTaskRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Performance Trend Line Graphic */}
            <div className="mt-4 pt-3 border-t border-[#E8DFD3]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-2">
                Performance Trend
              </span>
              <div className="h-9 flex items-end gap-1.5 px-1">
                {[45, 60, 55, 75, 80, 70, 90, 85, 95, overallTaskRate].map((val, idx) => (
                  <div key={idx} className="flex-1 bg-stone-100 hover:bg-[#5B172E]/30 rounded-t transition-all group relative" style={{ height: `${val}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#431021] text-[9px] font-bold px-1.5 py-0.5 rounded text-white pointer-events-none transition-opacity">
                      {val}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            ROW 2: OPERATIONAL MODULE CARDS (PC, Checklist & Delegation, OTD)
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">

          {/* SECTION A: PRODUCTION CONTROL (PC) */}
          <div className="bg-white border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#431021]">Production Control (PC)</h3>
                    <p className="text-[11px] text-stone-500">Stage timelines & delivery adherence</p>
                  </div>
                </div>
                {canSeePC && (
                  <button
                    onClick={() => navigate('/pc')}
                    className="text-stone-400 hover:text-[#5B172E] p-1 rounded-md hover:bg-[#FAF6F0]"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* PC Metrics */}
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3]">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">Active In Stages</span>
                  <span className="text-xl font-black text-[#431021] mt-1 block">{activeOrders.length}</span>
                  <span className="text-[10px] text-stone-400">Garments in process</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] text-rose-800 font-bold uppercase block">Stage Delays</span>
                  <span className="text-xl font-black text-rose-700 mt-1 block">{pcDelayedOrders.length}</span>
                  <span className="text-[10px] text-rose-600/80">Past stage target</span>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="mt-4 p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">On-Time Stage Completion</span>
                  <span className="font-bold text-emerald-700">
                    {activeOrders.length > 0
                      ? Math.round(((activeOrders.length - pcDelayedOrders.length) / activeOrders.length) * 100)
                      : 100}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-[#E8DFD3]">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${activeOrders.length > 0 ? Math.round(((activeOrders.length - pcDelayedOrders.length) / activeOrders.length) * 100) : 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/pc')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE2] border border-[#DECDB8] text-xs font-bold text-[#5B172E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Open PC Control Table</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SECTION B: CHECKLIST & DELEGATION */}
          <div className="bg-white border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#431021]">Checklist & Delegation</h3>
                    <p className="text-[11px] text-stone-500">Daily routine & assigned tasks</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checklist/task')}
                  className="text-stone-400 hover:text-[#5B172E] p-1 rounded-md hover:bg-[#FAF6F0]"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Checklist & Delegation Grid */}
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">Checklist Pending</span>
                  <span className="text-xl font-black text-blue-950 mt-1 block">{checklistPendingCount}</span>
                  <span className="text-[10px] text-blue-700">{checklistDoneCount} of {checklistTotalCount} done</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">Delegation Open</span>
                  <span className="text-xl font-black text-amber-950 mt-1 block">{delegationPendingCount}</span>
                  <span className="text-[10px] text-amber-700">{delegationDoneCount} of {delegationTotalCount} closed</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="mt-4 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-500 font-medium">Checklist Rate</span>
                    <span className="font-bold text-blue-700">{checklistRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#FAF6F0] rounded-full overflow-hidden border border-[#E8DFD3]">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${checklistRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-500 font-medium">Delegation Rate</span>
                    <span className="font-bold text-amber-700">{delegationRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#FAF6F0] rounded-full overflow-hidden border border-[#E8DFD3]">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: `${delegationRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => navigate('/checklist/task')}
                className="py-2 px-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE2] border border-[#DECDB8] text-xs font-bold text-[#431021] transition-colors text-center cursor-pointer shadow-2xs"
              >
                Tasks View
              </button>
              <button
                onClick={() => navigate('/checklist/delegation')}
                className="py-2 px-3 rounded-xl bg-[#5B172E] hover:bg-[#731D3A] text-xs font-bold text-white transition-colors text-center cursor-pointer shadow-xs"
              >
                Delegations
              </button>
            </div>
          </div>

          {/* SECTION C: ORDER TO DELIVERY (OTD) */}
          <div className="bg-white border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#5B172E]/10 text-[#5B172E] border border-[#5B172E]/20">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#431021]">Order to Delivery (OTD)</h3>
                    <p className="text-[11px] text-stone-500">Garment production pipeline</p>
                  </div>
                </div>
                {canSeeOTD && (
                  <button
                    onClick={() => navigate('/order-to-delivery/orders')}
                    className="text-stone-400 hover:text-[#5B172E] p-1 rounded-md hover:bg-[#FAF6F0]"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* OTD Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3]">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">In Production</span>
                  <span className="text-lg font-black text-[#431021] mt-0.5 block">{activeOrders.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">Near Due</span>
                  <span className="text-lg font-black text-amber-700 mt-0.5 block">{urgentOrders.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Delivered</span>
                  <span className="text-lg font-black text-emerald-700 mt-0.5 block">{deliveredOrders.length}</span>
                </div>
              </div>

              {/* 10 Production Stages Snapshot */}
              <div className="mt-4 p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-2">
                  Active Stage Breakdown
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {STAGES.slice(0, 4).map((s) => {
                    const cnt = orders.filter((o) => o.currentStageId === s.id).length;
                    return (
                      <div key={s.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-[#E8DFD3] text-stone-700">
                        <span className="truncate text-[11px] font-medium">{s.name}</span>
                        <span className="font-bold text-[#5B172E] px-1.5 py-0.2 rounded bg-[#5B172E]/10 text-[10px]">{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/order-to-delivery/orders')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-[#5B172E] hover:bg-[#731D3A] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* =========================================================================
            ROW 3: STUDIO CALENDAR & QUICK ACTION SHORTCUTS
        ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">

          {/* STUDIO HOLIDAYS & WORKING DAYS (Real Data) */}
          <div className="md:col-span-6 bg-white border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9B783E]" />
                <h3 className="text-sm font-bold text-[#431021]">Studio Holidays & Schedule</h3>
              </div>
              <button
                onClick={() => navigate('/checklist/holiday-list')}
                className="text-xs text-[#5B172E] hover:underline font-bold"
              >
                View Calendar
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {upcomingHolidays.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3] text-center text-xs text-stone-500 font-medium">
                  No upcoming holidays scheduled this month.
                </div>
              ) : (
                upcomingHolidays.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFD3] text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#9B783E]"></span>
                      <span className="font-bold text-[#431021]">{h.holiday_name}</span>
                    </div>
                    <span className="text-stone-500 font-mono text-[11px]">
                      {new Date(h.holiday_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QUICK ACTIONS & SHORTCUTS */}
          <div className="md:col-span-6 bg-white border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9B783E]" />
                <h3 className="text-sm font-bold text-[#431021]">Quick Action Hub</h3>
              </div>
              <span className="text-xs text-stone-400 font-medium">1-Click Jump</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={() => navigate('/order-to-delivery/orders')}
                className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE2] border border-[#E8DFD3] text-left transition-all group shadow-2xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#5B172E] mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#431021] block">Orders Hub</span>
                <span className="text-[10px] text-stone-500">All active client garments</span>
              </button>

              <button
                onClick={() => navigate('/pc')}
                className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE2] border border-[#E8DFD3] text-left transition-all group shadow-2xs cursor-pointer"
              >
                <Layers className="w-4 h-4 text-indigo-700 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#431021] block">PC Schedule</span>
                <span className="text-[10px] text-stone-500">Stage target tracker</span>
              </button>

              <button
                onClick={() => navigate('/checklist/task')}
                className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE2] border border-[#E8DFD3] text-left transition-all group shadow-2xs cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4 text-emerald-700 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#431021] block">Submit Tasks</span>
                <span className="text-[10px] text-stone-500">Execute checklist items</span>
              </button>

              <button
                onClick={() => navigate('/checklist/delegation')}
                className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE2] border border-[#E8DFD3] text-left transition-all group shadow-2xs cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-700 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#431021] block">Delegations</span>
                <span className="text-[10px] text-stone-500">Assigned responsibility</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
