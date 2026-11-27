import React, { useEffect, useState } from 'react';
import { UserCheck, CheckCircle2, Clock, RotateCcw, Building2, Search, ArrowRight } from 'lucide-react';
import { fetchIndents } from '../services/purchaseService';

export default function Vendor() {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await fetchIndents();
      // Show indents that moved forward to vendor_selection (or approved)
      const approvedForVendor = (all || []).filter(
        (i) => i.currentStage === 'vendor_selection' || (i.status === 'Approved' && i.currentStage !== 'approval')
      );
      setIndents(approvedForVendor);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = indents.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.indentNumber?.toLowerCase().includes(q) ||
      item.materialName?.toLowerCase().includes(q) ||
      item.requester?.toLowerCase().includes(q) ||
      item.vendorType?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#431021]">Vendor Selection</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F3ECE2] text-[#5B172E] border border-[#DECDB8]">
              Stage 3
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Approved indents routed here from Stage 2 (Approval). Assign approved vendors and quotes.
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

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Ready for Vendor Assignment</span>
            <UserCheck className="w-4 h-4 text-[#9B783E]" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-serif">{indents.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">Approved indents advanced from Approval stage</div>
        </div>

        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Regular Vendors</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-800 font-serif">
            {indents.filter((i) => i.vendorType === 'Regular').length}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Direct PO flow</div>
        </div>

        <div className="p-4 rounded-xl border border-[#E8DFD3] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>3 Party Approval</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-800 font-serif">
            {indents.filter((i) => i.vendorType === '3 Party Approval').length}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Requires 3-party quotation &amp; sign-off</div>
        </div>
      </div>

      {/* Indents Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E8DFD3] flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-stone-800 uppercase tracking-wide">
            Approved Indents ({filtered.length})
          </div>
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E8DFD3] bg-stone-50/50 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading vendor queue...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <div className="text-sm font-semibold text-stone-700">No Approved Indents Pending Vendor Selection</div>
            <p className="text-xs text-stone-500 mt-1">
              When an indent is approved in Stage 2 (Approval), it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF6F0] text-stone-600 uppercase text-[10px] tracking-wider border-b border-[#E8DFD3]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Indent No.</th>
                  <th className="px-4 py-3 font-semibold">Material &amp; Qty</th>
                  <th className="px-4 py-3 font-semibold">Requester</th>
                  <th className="px-4 py-3 font-semibold">Vendor Type</th>
                  <th className="px-4 py-3 font-semibold">Approval Remarks</th>
                  <th className="px-4 py-3 font-semibold">Approved By</th>
                  <th className="px-4 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD3]/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDFBF7]">
                    <td className="px-4 py-3 font-mono font-bold text-[#5B172E]">{item.indentNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{item.materialName}</div>
                      <div className="text-[11px] text-stone-500">
                        {Number(item.quantity).toLocaleString()} {item.uom}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-800">{item.requester}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3ECE2] text-[#5B172E] border border-[#DECDB8]">
                        <Building2 className="w-3 h-3 text-[#9B783E]" />
                        {item.vendorType || 'Regular'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600 max-w-xs truncate" title={item.approvalRemarks}>
                      {item.approvalRemarks || '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      <div>{item.approvedBy || 'Approver'}</div>
                      <div className="text-[10px] text-stone-400">
                        {item.approvedAt ? new Date(item.approvedAt).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
