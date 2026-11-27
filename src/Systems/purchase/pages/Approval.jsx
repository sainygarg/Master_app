import React, { useEffect, useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Check,
  RotateCcw,
  Building2,
  X,
  FileText,
  Eye,
  Layers
} from 'lucide-react';
import { fetchApprovalIndents, submitApproval } from '../services/purchaseService';
import { useUnifiedAuth } from '../../../core/auth/UnifiedAuthContext';
import { useToastAlert } from '../../../core/context/ToastAlertContext';
import { canModify, isApexAdmin } from '../../order-to-delivery/utils/userAuthService';

const VENDOR_TYPES = ['Regular', 'Three Party Approval'];

export default function Approval() {
  const { user } = useUnifiedAuth();
  const { showToast } = useToastAlert();
  const canApprove = isApexAdmin(user) || canModify(user, '/purchase/approval');

  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'

  // Modal State
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // The required parameters in Approval
  const [decisionStatus, setDecisionStatus] = useState('Approved'); // 'Approved' | 'Hold' | 'Rejected'
  const [vendorType, setVendorType] = useState('Regular'); // 'Regular' | 'Three Party Approval'
  const [approvedQuantity, setApprovedQuantity] = useState('');
  const [remarks, setRemarks] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const rows = await fetchApprovalIndents();
      setIndents(rows);
    } catch {
      showToast('Could not load purchase indents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered indents based on active tab and search query
  const filteredIndents = useMemo(() => {
    return indents.filter((item) => {
      // Tab matching:
      // 'pending' -> Needs action: 'Pending Approval' or 'Hold'
      // 'history' -> Completed review: 'Approved' or 'Rejected'
      if (activeTab === 'pending') {
        if (item.status !== 'Pending Approval' && item.status !== 'Hold') return false;
      } else if (activeTab === 'history') {
        if (item.status !== 'Approved' && item.status !== 'Rejected') return false;
      }

      // Search matching
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.indentNumber?.toLowerCase().includes(q) ||
        item.requester?.toLowerCase().includes(q) ||
        item.materialName?.toLowerCase().includes(q) ||
        item.specification?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q) ||
        item.vendorType?.toLowerCase().includes(q)
      );
    });
  }, [indents, activeTab, searchQuery]);

  // Counts for metric badges
  const counts = useMemo(() => {
    const pendingCount = indents.filter((i) => i.status === 'Pending Approval' || i.status === 'Hold').length;
    const historyCount = indents.filter((i) => i.status === 'Approved' || i.status === 'Rejected').length;
    return {
      pending: pendingCount,
      history: historyCount,
      hold: indents.filter((i) => i.status === 'Hold').length,
      approved: indents.filter((i) => i.status === 'Approved').length,
      rejected: indents.filter((i) => i.status === 'Rejected').length,
      total: indents.length
    };
  }, [indents]);

  const openDecisionModal = (indent) => {
    setSelectedIndent(indent);
    // Initialize form with existing values or defaults
    setDecisionStatus(indent.status === 'Hold' ? 'Hold' : 'Approved');
    setVendorType(indent.vendorType || 'Regular');
    setApprovedQuantity(indent.quantity);
    setRemarks(indent.approvalRemarks || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIndent(null);
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIndent) return;

    if (!decisionStatus) {
      showToast('Please select a status decision (Approved, Hold, or Rejected).', 'error');
      return;
    }

    if (!vendorType) {
      showToast('Please select a Vendor Type (Regular or Three Party Approval).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const approverName = user?.name || user?.username || 'Approver';
      await submitApproval({
        indentId: selectedIndent.id,
        status: decisionStatus,
        vendorType,
        approvedQuantity: decisionStatus === 'Approved' ? approvedQuantity : selectedIndent.quantity,
        remarks,
        approverName
      });

      // Update state locally immediately
      setIndents((prev) =>
        prev.map((item) => {
          if (item.id === selectedIndent.id) {
            return {
              ...item,
              status: decisionStatus,
              currentStage: decisionStatus === 'Approved' ? 'vendor_selection' : 'approval',
              vendorType,
              approvedQuantity: decisionStatus === 'Approved' && approvedQuantity ? Number(approvedQuantity) : item.quantity,
              approvalRemarks: remarks,
              approvedBy: approverName,
              approvedAt: new Date().toISOString()
            };
          }
          return item;
        })
      );

      if (decisionStatus === 'Approved') {
        showToast(
          `Indent ${selectedIndent.indentNumber} Approved! Moved forward to Vendor Selection (${vendorType}).`,
          'success'
        );
      } else if (decisionStatus === 'Hold') {
        showToast(
          `Indent ${selectedIndent.indentNumber} set to Hold. It remains on the Approval page.`,
          'info'
        );
      } else {
        showToast(
          `Indent ${selectedIndent.indentNumber} Rejected. It will not advance to the next stage.`,
          'warning'
        );
      }

      closeModal();
    } catch (err) {
      showToast('Failed to record approval decision: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'Hold':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Hold
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Pending Approval
          </span>
        );
    }
  };

  const renderPriorityBadge = (p) => {
    const colors = {
      Urgent: 'bg-red-50 text-red-700 border-red-200',
      High: 'bg-orange-50 text-orange-700 border-orange-200',
      Medium: 'bg-blue-50 text-blue-700 border-blue-200',
      Low: 'bg-stone-100 text-stone-600 border-stone-200'
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${colors[p] || colors.Medium}`}>
        {p || 'Medium'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#431021]">Purchase Approval</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F3ECE2] text-[#5B172E] border border-[#DECDB8]">
              Stage 2
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review incoming indents. Approved items move forward to Vendor Selection; Hold items remain for re-evaluation; Rejected items are halted.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-[#E8DFD3] hover:bg-[#FDFBF7] shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#9B783E]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-50/70 border-amber-300 shadow-xs ring-1 ring-amber-300'
              : 'bg-white border-[#E8DFD3] hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium">Pending Review</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-serif">{counts.pending}</div>
          <div className="text-[11px] text-amber-700 mt-1">
            Requires approval decision
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#F3ECE2] border-[#DECDB8] shadow-xs ring-1 ring-[#DECDB8]'
              : 'bg-white border-[#E8DFD3] hover:border-[#DECDB8]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium">History (Processed)</span>
            <Layers className="w-4 h-4 text-[#9B783E]" />
          </div>
          <div className="text-2xl font-bold text-[#5B172E] font-serif">{counts.history}</div>
          <div className="text-[11px] text-[#9B783E] mt-1">Approved &amp; Rejected logs</div>
        </button>

        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-serif">{counts.approved}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Advanced to Vendor Selection</div>
        </div>

        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium">Rejected / Hold</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-serif">
            {counts.rejected} <span className="text-xs text-stone-400 font-normal">/ {counts.hold} Hold</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Halted or on-hold indents</div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Tab buttons: strictly 2 tabs: Pending and History */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-white text-[#5B172E] shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-[#5B172E] shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              History ({counts.history})
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Indent #, Material, Requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8DFD3] bg-stone-50/50 focus:bg-white focus:outline-hidden focus:border-[#9B783E] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">
            <RotateCcw className="w-6 h-6 animate-spin text-[#9B783E] mx-auto mb-2" />
            Loading approval indents...
          </div>
        ) : filteredIndents.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <div className="text-sm font-semibold text-stone-700">No Indents Found</div>
            <p className="text-xs text-stone-500 mt-1">
              {activeTab === 'pending'
                ? 'All indents have been reviewed! There are currently no pending or hold items.'
                : 'No past approval records match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF6F0] text-stone-600 uppercase text-[10px] tracking-wider border-b border-[#E8DFD3]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Indent Info</th>
                  <th className="px-4 py-3 font-semibold">Requester & Date</th>
                  <th className="px-4 py-3 font-semibold">Material & Spec</th>
                  <th className="px-4 py-3 font-semibold">Qty & UOM</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Vendor Type</th>
                  <th className="px-4 py-3 font-semibold">Attachment</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD3]/60">
                {filteredIndents.map((indent) => {
                  const isActionable = indent.status === 'Pending Approval' || indent.status === 'Hold';
                  return (
                    <tr
                      key={indent.id || indent.indentNumber}
                      className="hover:bg-[#FDFBF7] transition-colors"
                    >
                      {/* Indent Info */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[#5B172E] text-xs">
                          {indent.indentNumber}
                        </span>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          Stage: <span className="font-medium text-stone-600">{indent.currentStage || 'approval'}</span>
                        </div>
                      </td>

                      {/* Requester & Date */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-900">{indent.requester || '—'}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {indent.indentDate || indent.createdAt?.split('T')[0] || '—'}
                        </div>
                      </td>

                      {/* Material & Spec */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="font-semibold text-stone-900 truncate" title={indent.materialName}>
                          {indent.materialName}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate mt-0.5">
                          {[indent.color, indent.size].filter(Boolean).join(' • ') || indent.specification || '—'}
                        </div>
                      </td>

                      {/* Qty & UOM */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-stone-900 text-xs">
                          {Number(indent.quantity).toLocaleString()}
                        </span>{' '}
                        <span className="text-[11px] text-stone-500">{indent.uom}</span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {renderPriorityBadge(indent.priority)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {renderStatusBadge(indent.status)}
                      </td>

                      {/* Vendor Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {indent.vendorType ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3ECE2] text-[#5B172E] border border-[#DECDB8]">
                            <Building2 className="w-3 h-3 text-[#9B783E]" />
                            {indent.vendorType}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px] italic">Not Assigned</span>
                        )}
                      </td>

                      {/* Attachment */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {indent.attachmentUrl ? (
                          <a
                            href={indent.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#5B172E] hover:underline font-medium"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{indent.attachmentName ? indent.attachmentName.slice(0, 14) + '...' : 'View file'}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-stone-300 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {isActionable ? (
                          <button
                            onClick={() => openDecisionModal(indent)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                              indent.status === 'Hold'
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-[#5B172E] hover:bg-[#431021] text-white'
                            }`}
                          >
                            <span>{indent.status === 'Hold' ? 'Review Hold' : 'Review & Decide'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openDecisionModal(indent)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {isModalOpen && selectedIndent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Decoupled Full-Screen Backdrop: Eliminates thin half-page overshadow bug */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={closeModal}
          />

          <div className="relative z-10 bg-white rounded-2xl max-w-xl w-full border border-[#E8DFD3] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#FAF6F0] border-b border-[#E8DFD3] flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#431021]">
                    Approval Decision
                  </h3>
                  <span className="font-mono font-bold text-xs bg-[#5B172E] text-white px-2 py-0.5 rounded">
                    {selectedIndent.indentNumber}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Set decision status, approved quantity, vendor routing type, and remarks.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleDecisionSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Indent Summary Card */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-stone-800">
                  <span className="text-sm font-serif">{selectedIndent.materialName}</span>
                  <span className="font-bold text-[#5B172E]">
                    Requested: {Number(selectedIndent.quantity).toLocaleString()} {selectedIndent.uom}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1 border-t border-stone-200/60">
                  <div>
                    <span className="text-stone-400">Requester:</span> {selectedIndent.requester || '—'}
                  </div>
                  <div>
                    <span className="text-stone-400">Required Date:</span> {selectedIndent.requiredDate || '—'}
                  </div>
                  <div>
                    <span className="text-stone-400">Priority:</span> {selectedIndent.priority}
                  </div>
                  <div>
                    <span className="text-stone-400">Attachment:</span>{' '}
                    {selectedIndent.attachmentUrl ? (
                      <a
                        href={selectedIndent.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5B172E] underline inline-flex items-center gap-0.5"
                      >
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      'None'
                    )}
                  </div>
                </div>
                {selectedIndent.specification && (
                  <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60">
                    <span className="text-stone-400">Specification:</span> {selectedIndent.specification}
                  </div>
                )}
              </div>

              {/* Parameter 1: Decision Status & Approved Qty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    1. Decision Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={decisionStatus}
                      onChange={(e) => setDecisionStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DECDB8] bg-white text-stone-800 focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E] shadow-2xs font-semibold cursor-pointer"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Hold">Hold</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Approved Qty {decisionStatus === 'Approved' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required={decisionStatus === 'Approved'}
                    value={approvedQuantity}
                    onChange={(e) => setApprovedQuantity(e.target.value)}
                    placeholder={`e.g. ${selectedIndent.quantity}`}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DECDB8] bg-white text-stone-900 font-semibold focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E] shadow-2xs"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Requested Qty: {selectedIndent.quantity}
                  </p>
                </div>
              </div>

              {/* Parameter 2: Vendor Type (Regular vs Three Party Approval) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                  2. Vendor Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={vendorType}
                    onChange={(e) => setVendorType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DECDB8] bg-white text-stone-800 focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E] shadow-2xs font-medium cursor-pointer"
                  >
                    {VENDOR_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Select <span className="font-semibold text-stone-600">Regular</span> for standard approved vendors or{' '}
                  <span className="font-semibold text-stone-600">Three Party Approval</span> when third-party sign-off is required.
                </p>
              </div>

              {/* Parameter 3: Remark Field */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                  3. Remark / Comments {decisionStatus === 'Rejected' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    decisionStatus === 'Rejected'
                      ? 'Please specify reason for rejection...'
                      : decisionStatus === 'Hold'
                      ? 'Note what clarification or action is awaited...'
                      : 'Approval remarks or special instructions for vendor selection...'
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DECDB8] bg-white text-stone-800 focus:outline-hidden focus:border-[#9B783E] focus:ring-1 focus:ring-[#9B783E] shadow-2xs resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {canApprove ? (
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer transition-all disabled:opacity-50 ${
                      decisionStatus === 'Approved'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : decisionStatus === 'Hold'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Submit {decisionStatus}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-stone-400 italic">
                    View only (You lack approval modify permission)
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
