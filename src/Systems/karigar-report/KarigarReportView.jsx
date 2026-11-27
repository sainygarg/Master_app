import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  Search,
  RotateCcw,
  User,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileText,
  ShieldCheck,
  Calendar,
  Eye,
  Check
} from 'lucide-react';
import { useUnifiedAuth } from '../../core/auth/UnifiedAuthContext';
import { useToastAlert } from '../../core/context/ToastAlertContext';
import { isApexAdmin, canModify, fetchUsers } from '../order-to-delivery/utils/userAuthService';
import {
  fetchKarigarReports,
  submitKarigarReport,
  fetchDistinctKarigars
} from './services/karigarReportService';

export default function KarigarReportView() {
  const { user } = useUnifiedAuth();
  const { showToast } = useToastAlert();

  const isAdmin = isApexAdmin(user);
  const canSubmit = isAdmin || canModify(user, 'karigar-report');
  const loggedInKarigarName = user?.name || user?.username || 'Current User';

  // State
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [loading, setLoading] = useState(true);

  // Admin View Mode: 'all' (all karigars by default for admin) or 'my' (only current user)
  const [viewScope, setViewScope] = useState(() => (isApexAdmin(user) ? 'all' : 'my'));
  const [selectedKarigarFilter, setSelectedKarigarFilter] = useState('');
  const [distinctKarigars, setDistinctKarigars] = useState([]);

  // Submit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formKarigarName, setFormKarigarName] = useState(loggedInKarigarName);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formWorkingTime, setFormWorkingTime] = useState('');
  const [formOrderId, setFormOrderId] = useState('');
  const [formRemark, setFormRemark] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  // Fetch distinct karigars & all users once for admin
  useEffect(() => {
    if (isAdmin) {
      fetchDistinctKarigars().then(setDistinctKarigars).catch(() => {});
      fetchUsers().then(setAllUsers).catch(() => {});
    }
  }, [isAdmin]);

  // Main data loader with Server-Side Range Pagination
  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const isAll = isAdmin && viewScope === 'all';
      const targetKarigar = isAll
        ? selectedKarigarFilter
        : loggedInKarigarName;

      const result = await fetchKarigarReports({
        page: currentPage,
        pageSize,
        karigarName: targetKarigar,
        searchOrderId,
        allReports: isAll && !selectedKarigarFilter,
        forceRefresh
      });

      setReports(result.reports);
      setTotalReports(result.total);
      setTotalPages(result.totalPages);
    } catch {
      showToast('Could not fetch Karigar Reports.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, viewScope, selectedKarigarFilter, loggedInKarigarName, currentPage, pageSize, searchOrderId]); // removed unstable showToast

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to page 1 on filter changes
  const handleSearchChange = (val) => {
    setSearchOrderId(val);
    setCurrentPage(1);
  };

  const handleScopeChange = (scope) => {
    setViewScope(scope);
    setSelectedKarigarFilter('');
    setCurrentPage(1);
  };

  const handlePageSizeChange = (val) => {
    setPageSize(Number(val));
    setCurrentPage(1);
  };

  // Submit new report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const finalKarigarName = isAdmin
      ? (formKarigarName.trim() || loggedInKarigarName)
      : loggedInKarigarName;

    if (!finalKarigarName) {
      showToast('Please specify a Karigar Name.', 'error');
      return;
    }

    if (!formOrderId.trim()) {
      showToast('Please enter an Order ID.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Find matching user id if selected from registered users, or fallback to current user id if self
      const matchedUser = allUsers.find(
        (u) => (u.name || u.username) === finalKarigarName
      );
      const targetUserId = matchedUser?.id || (finalKarigarName === loggedInKarigarName ? user?.id : null);

      await submitKarigarReport({
        userId: targetUserId,
        karigarName: finalKarigarName,
        orderId: formOrderId.trim(),
        reportDate: formDate,
        workingTime: formWorkingTime.trim(),
        remark: formRemark.trim()
      });

      showToast(`Report for ${finalKarigarName} (Order: ${formOrderId.trim()}) submitted successfully!`, 'success');
      setFormOrderId('');
      setFormWorkingTime('');
      setFormRemark('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormKarigarName(loggedInKarigarName);
      setIsModalOpen(false);
      // Reload current page or go to page 1
      if (currentPage === 1) {
        loadData();
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      showToast('Failed to submit report: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const todayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return reports.filter((r) => r.createdAt && r.createdAt.startsWith(todayStr)).length;
  }, [reports]);

  const startRecord = totalReports === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalReports);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold text-[#431021]">Karigar Report</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F3ECE2] text-[#5B172E] border border-[#DECDB8]">
              Worker Operation Log
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Submit and view production job card work logs with row-level user isolation and server-side range pagination.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-[#E8DFD3] hover:bg-[#FDFBF7] shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh reports"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#9B783E]' : ''}`} />
            <span>Refresh</span>
          </button>

          {canSubmit ? (
            <button
              onClick={() => {
                setFormKarigarName(loggedInKarigarName);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5B172E] hover:bg-[#431021] shadow-xs cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Report</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-500 bg-stone-100 border border-stone-200">
              <Eye className="w-3.5 h-3.5" />
              <span>View Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>{isAdmin && viewScope === 'all' ? 'Total Reports' : 'My Total Reports'}</span>
            <FileSpreadsheet className="w-4 h-4 text-[#9B783E]" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-serif">{totalReports}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            {isAdmin && viewScope === 'all' ? 'All karigars combined' : `Submitted by ${loggedInKarigarName}`}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Today's Entries</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 font-serif">{todayCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Reports submitted today
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Active Karigars</span>
            <User className="w-4 h-4 text-[#5B172E]" />
          </div>
          <div className="text-2xl font-bold text-[#5B172E] font-serif">
            {isAdmin ? distinctKarigars.length : 1}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {isAdmin ? 'Total reporting karigars' : loggedInKarigarName}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Current Page</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-900 font-serif">
            {currentPage} <span className="text-xs font-normal text-stone-400">/ {totalPages}</span>
          </div>
          <div className="text-[11px] text-blue-700 mt-1">
            Showing {reports.length} records
          </div>
        </div>
      </div>

      {/* Control Bar: Scope toggle (if admin), search, and page size */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Admin Toggle & Filter */}
          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 bg-stone-100/90 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleScopeChange('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewScope === 'all'
                      ? 'bg-white text-[#5B172E] shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All Karigars
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeChange('my')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewScope === 'my'
                      ? 'bg-white text-[#5B172E] shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  My Reports ({loggedInKarigarName})
                </button>
              </div>

              {viewScope === 'all' && distinctKarigars.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedKarigarFilter}
                    onChange={(e) => {
                      setSelectedKarigarFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 text-xs rounded-xl border border-[#E8DFD3] bg-white text-stone-700 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Filter by Karigar: All</option>
                    {distinctKarigars.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
              <span className="p-1 rounded-md bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                <User className="w-3.5 h-3.5 inline mr-1" />
                {loggedInKarigarName}
              </span>
              <span>Only your submitted reports are displayed.</span>
            </div>
          )}

          {/* Search and Page Size */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Order ID..."
                value={searchOrderId}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E8DFD3] bg-stone-50/50 focus:bg-white focus:outline-hidden focus:border-[#9B783E]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-500 whitespace-nowrap">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg border border-[#E8DFD3] bg-white cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">
            <RotateCcw className="w-6 h-6 animate-spin text-[#9B783E] mx-auto mb-2" />
            Loading Karigar reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <div className="text-sm font-semibold text-stone-700">No Reports Found</div>
            <p className="text-xs text-stone-500 mt-1">
              {searchOrderId
                ? 'No reports match your Order ID search.'
                : 'You have not submitted any Karigar reports yet. Click "+ Submit Report" to add one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF6F0] text-stone-600 uppercase text-[10px] tracking-wider border-b border-[#E8DFD3]">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Karigar Name</th>
                  <th className="px-4 py-3 font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Working Time</th>
                  <th className="px-4 py-3 font-semibold">Remark / Work Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD3]/60">
                {reports.map((row, idx) => {
                  const sNo = (currentPage - 1) * pageSize + idx + 1;
                  const displayDate = row.reportDate || (row.createdAt ? row.createdAt.split('T')[0] : '—');

                  return (
                    <tr key={row.id || idx} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="px-4 py-3 text-center text-stone-400 font-mono text-[11px]">
                        {sNo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-stone-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{displayDate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3ECE2] text-[#5B172E] border border-[#DECDB8]">
                          <User className="w-3 h-3 text-[#9B783E]" />
                          {row.karigarName}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md border border-stone-200">
                          {row.orderId}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-stone-700">
                        {row.workingTime ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {row.workingTime}
                          </span>
                        ) : (
                          <span className="text-stone-300 italic text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-700 max-w-md">
                        {row.remark ? (
                          <span className="whitespace-pre-wrap">{row.remark}</span>
                        ) : (
                          <span className="text-stone-300 italic">No remark provided</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Footer */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E8DFD3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-stone-600">
          <div>
            Showing <span className="font-bold text-stone-800">{startRecord}</span> to{' '}
            <span className="font-bold text-stone-800">{endRecord}</span> of{' '}
            <span className="font-bold text-stone-800">{totalReports}</span> reports
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DECDB8] bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <div className="px-3 py-1 font-bold text-xs bg-white border border-[#DECDB8] rounded-lg">
              Page {currentPage} of {totalPages || 1}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DECDB8] bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative z-10 bg-white rounded-2xl max-w-lg w-full border border-[#E8DFD3] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF6F0] border-b border-[#E8DFD3] flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#431021]">Submit Karigar Report</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Record your daily job card or order operation report.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReport} className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Row 1: Karigar Name & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Karigar Name <span className="text-red-500">*</span>
                  </label>
                  {isAdmin ? (
                    <select
                      required
                      value={formKarigarName || loggedInKarigarName}
                      onChange={(e) => setFormKarigarName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DECDB8] bg-white text-stone-800 font-semibold focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E] cursor-pointer"
                    >
                      {allUsers.map((u) => {
                        const displayName = u.name || u.username;
                        return (
                          <option key={u.id} value={displayName}>
                            {displayName}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={loggedInKarigarName}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-100 text-stone-700 font-semibold cursor-not-allowed"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">
                        Locked to your logged-in account.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDB8] bg-white text-stone-800 font-medium focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E]"
                  />
                </div>
              </div>

              {/* Row 2: Order ID & Working Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Order ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORD-1042 or 1042"
                    value={formOrderId}
                    onChange={(e) => setFormOrderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDB8] bg-white text-stone-900 font-mono font-medium focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Enter the Order ID you worked on.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Working Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Hours, 9 AM - 2 PM"
                    value={formWorkingTime}
                    onChange={(e) => setFormWorkingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDB8] bg-white text-stone-800 font-medium focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Shift or duration (e.g. 4 hrs, Full Day).
                  </p>
                </div>
              </div>

              {/* Field 3: Remark Field */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                  Remark / Work Completed
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe work completed (e.g., cutting finished, embroidery 40m done, quality pass, etc.)..."
                  value={formRemark}
                  onChange={(e) => setFormRemark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDB8] bg-white text-stone-900 focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E] resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !formOrderId.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B172E] hover:bg-[#431021] disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                >
                  {submitting ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
