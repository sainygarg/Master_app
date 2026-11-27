import React, { useEffect, useState } from 'react';
import { PlusCircle, ClipboardList, X, Upload, Paperclip } from 'lucide-react';
import {
  fetchIndents,
  createIndent,
  generateNextIndentNumber,
  uploadIndentAttachment
} from '../services/purchaseService';
import { useUnifiedAuth } from '../../../core/auth/UnifiedAuthContext';
import { useToastAlert } from '../../../core/context/ToastAlertContext';
import { canModify, isApexAdmin } from '../../order-to-delivery/utils/userAuthService';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const UOMS = ['Meters', 'Yards', 'Pieces', 'Kg', 'Grams', 'Rolls', 'Sets', 'Boxes', 'Dozens', 'Liters'];

export default function Indent() {
  const { user } = useUnifiedAuth();
  const { showToast } = useToastAlert();
  const canCreateIndent = isApexAdmin(user) || canModify(user, '/purchase/indent');
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState('file'); // 'file' | 'url'
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentUrlInput, setAttachmentUrlInput] = useState('');

  const [form, setForm] = useState({
    indentNumber: '',
    indentDate: new Date().toISOString().split('T')[0],
    requester: user?.name || user?.username || '',
    priority: 'Medium',
    requiredDate: '',
    materialName: '',
    color: '',
    size: '',
    uom: 'Meters',
    quantity: '',
    specification: ''
  });

  useEffect(() => {
    fetchIndents()
      .then((rows) => setIndents(rows))
      .finally(() => setLoading(false));
  }, []);

  const openModal = () => {
    setForm({
      indentNumber: generateNextIndentNumber(indents),
      indentDate: new Date().toISOString().split('T')[0],
      requester: user?.name || user?.username || '',
      priority: 'Medium',
      requiredDate: '',
      materialName: '',
      color: '',
      size: '',
      uom: 'Meters',
      quantity: '',
      specification: ''
    });
    setAttachmentMode('file');
    setAttachmentFile(null);
    setAttachmentUrlInput('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.indentNumber.trim() || !form.materialName.trim() || !form.quantity) {
      showToast('Please fill Indent Number, Material Name, and Quantity.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      let attachmentUrl = '';
      let attachmentName = '';
      if (attachmentMode === 'file' && attachmentFile) {
        const uploaded = await uploadIndentAttachment(attachmentFile, form.indentNumber);
        attachmentUrl = uploaded.url;
        attachmentName = uploaded.name;
      } else if (attachmentMode === 'url' && attachmentUrlInput.trim()) {
        attachmentUrl = attachmentUrlInput.trim();
        attachmentName = attachmentUrl.split('/').pop()?.split('?')[0] || 'External Link';
      }
      const created = await createIndent({
        ...form,
        attachmentUrl,
        attachmentName
      });
      setIndents((prev) => [created, ...prev]);
      showToast(`Indent ${created.indentNumber} created.`, 'success');
      setIsModalOpen(false);
    } catch (err) {
      showToast('Failed to create indent: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#431021] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#9B783E]" />
            <span>Purchase Indent</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Raise material indents with specifications, priority, and required delivery dates.
          </p>
        </div>

        {canCreateIndent && (
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#781F3E] hover:from-[#431021] hover:to-[#5B172E] shadow-xs transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Indent</span>
          </button>
        )}
      </div>

      {/* Indents Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[11px] font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap">
                <th className="py-3.5 px-4">Indent No.</th>
                <th className="py-3.5 px-4">Indent Date</th>
                <th className="py-3.5 px-4">Requester</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Required Date</th>
                <th className="py-3.5 px-4">Material Name</th>
                <th className="py-3.5 px-4">Color / Size</th>
                <th className="py-3.5 px-4">Qty &amp; UOM</th>
                <th className="py-3.5 px-4">Attachment</th>
                <th className="py-3.5 px-4">Specification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE7DC]">
              {!loading && indents.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 px-4 text-center text-stone-500">
                    No indents raised yet. Click <strong>+ Create Indent</strong> to add one.
                  </td>
                </tr>
              )}
              {indents.map((row) => (
                <tr key={row.id} className="hover:bg-[#FCFAF7]">
                  <td className="py-3 px-4 font-mono font-bold text-[#5B172E]">{row.indentNumber}</td>
                  <td className="py-3 px-4 text-stone-600">{row.indentDate || '—'}</td>
                  <td className="py-3 px-4 font-semibold text-stone-800">{row.requester || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                      row.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      row.status === 'Hold' ? 'bg-amber-100 text-amber-800' :
                      row.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {row.status || 'Pending Approval'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600">{row.requiredDate || '—'}</td>
                  <td className="py-3 px-4 font-semibold text-stone-900">{row.materialName}</td>
                  <td className="py-3 px-4 text-stone-600">
                    {[row.color, row.size].filter(Boolean).join(' • ') || '—'}
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-800">
                    {row.quantity} {row.uom}
                  </td>
                  <td className="py-3 px-4">
                    {row.attachmentUrl ? (
                      <a
                        href={row.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#5B172E] hover:underline font-semibold"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{row.attachmentName || 'View'}</span>
                      </a>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4 text-stone-600 max-w-xs truncate" title={row.specification}>
                    {row.specification || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Indent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DECDB8]">
            <div className="flex items-center justify-between p-5 border-b border-[#E8DFD3] bg-[#FAF8F5]">
              <h2 className="font-serif text-lg font-bold text-[#431021]">Create Purchase Indent</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Indent Number <span className="text-stone-400 font-normal">(Auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={form.indentNumber}
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-stone-100 font-mono font-bold text-[#5B172E] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Indent Date *</label>
                  <input
                    type="date"
                    required
                    value={form.indentDate}
                    onChange={(e) => setForm({ ...form, indentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Requester *</label>
                  <input
                    type="text"
                    required
                    disabled
                    readOnly
                    value={form.requester}
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-stone-100 text-stone-600 font-semibold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Required Date</label>
                  <input
                    type="date"
                    value={form.requiredDate}
                    onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Material Name *</label>
                  <input
                    type="text"
                    required
                    value={form.materialName}
                    onChange={(e) => setForm({ ...form, materialName: e.target.value })}
                    placeholder="e.g. Pure Organza Silk"
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="e.g. Ivory, Maroon"
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="e.g. 44 inch / M"
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">UOM *</label>
                  <select
                    value={form.uom}
                    onChange={(e) => setForm({ ...form, uom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  >
                    {UOMS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-stone-700">Attachment (Image / PDF / Doc / URL)</label>
                    <div className="flex items-center gap-1 bg-[#FAF5EE] p-0.5 rounded-lg border border-[#DECDB8] text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAttachmentMode('file')}
                        className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                          attachmentMode === 'file' ? 'bg-[#5B172E] text-white' : 'text-stone-600'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachmentMode('url')}
                        className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                          attachmentMode === 'url' ? 'bg-[#5B172E] text-white' : 'text-stone-600'
                        }`}
                      >
                        Direct URL
                      </button>
                    </div>
                  </div>
                  {attachmentMode === 'file' ? (
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#DECDB8] hover:border-[#5B172E] rounded-xl bg-[#FAF8F5] text-stone-600 cursor-pointer">
                      <Upload className="w-4 h-4 text-[#C5A059]" />
                      <span>
                        {attachmentFile
                          ? attachmentFile.name
                          : 'Upload Image (auto-compressed), PDF, Word, or Excel'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                        className="hidden"
                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  ) : (
                    <input
                      type="url"
                      value={attachmentUrlInput}
                      onChange={(e) => setAttachmentUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                    />
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Specification</label>
                  <textarea
                    rows={3}
                    value={form.specification}
                    onChange={(e) => setForm({ ...form, specification: e.target.value })}
                    placeholder="Material grade, GSM, weave, or vendor instructions..."
                    className="w-full px-3 py-2 rounded-lg border border-[#DECDB8] bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#5B172E] hover:bg-[#431021] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Submit Indent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
