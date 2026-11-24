import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Scissors,
  Sparkles,
  Layers,
  Ruler,
  Calendar,
  Lock,
  Printer,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import { CustomerPhoneDisplay } from '../utils/privacy';

/**
 * Collapsible, read-only Design Sheet display panel for subsequent stages (Material Check, Cutting, Tailoring, etc.)
 * Starts collapsed by default so it does not clutter the screen, and cannot be edited in next stages.
 */
export const CollapsibleDesignSheetPanel = ({ order, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const ds = order?.designSheet;

  if (!ds) {
    return (
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Design sheet has not been submitted yet for this order.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#DECDB8] bg-white rounded-2xl overflow-hidden shadow-2xs transition-all">
      {/* Header bar that toggles collapse */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#FAF6F0] hover:bg-[#F3ECE2] flex items-center justify-between text-left transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#5B172E] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-4 h-4 text-[#FAF6F0]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#431021]">Atelier Design Sheet</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Submitted
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-stone-100 text-stone-500 border border-stone-200 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Read-Only
              </span>
            </div>
            <p className="text-[11px] text-stone-500 truncate mt-0.5">
              Fabric: <strong className="text-stone-700">{ds.fabricName || '—'}</strong> ({ds.fabricMeters ? `${ds.fabricMeters}m` : '—'}) • Lining: <strong className="text-stone-700">{ds.lining || '—'}</strong> • Fusing: <strong className="text-stone-700">{ds.fusingType || '—'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-[#5B172E]">
            {isOpen ? 'Collapse' : 'View Specifications'}
          </span>
          <div className="p-1 rounded-md bg-white border border-[#DECDB8] text-stone-600">
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </button>

      {/* Collapsible Content: Read-Only Grid */}
      {isOpen && (
        <div className="p-4 bg-white border-t border-[#DECDB8] space-y-4 animate-in fade-in duration-150">
          {/* Section 1: Fabric & Embroidery */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5B172E] flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-[#9B783E]" />
              1. Fabric & Embroidery Specifications
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Fabric & Meters</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  {ds.fabricName || '—'} {ds.fabricMeters ? `(${ds.fabricMeters} Mtr)` : ''}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">EMB Process</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.embProcess || 'Hand'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">EMB Material</span>
                <span className="font-semibold text-stone-800 mt-0.5 block truncate" title={ds.embMaterial}>
                  {ds.embMaterial || '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">EMB Colour</span>
                <span className="font-semibold text-stone-800 mt-0.5 block truncate" title={ds.embMaterialColor}>
                  {ds.embMaterialColor || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Structure, Silhouette & Tailoring */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5B172E] flex items-center gap-1.5 mb-2">
              <Layers className="w-3 h-3 text-[#9B783E]" />
              2. Tailoring, Silhouette & Internal Structure
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Lining</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.lining || '—'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Fusing Type</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.fusingType || '—'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Padded</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  {ds.padded === 'Yes' ? `Yes ${ds.paddedDetails ? `(${ds.paddedDetails})` : ''}` : 'No'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Shoulder Pads</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.shoulderPads || 'No'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Can-Can</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  {ds.canCan === 'Yes' ? `Yes ${ds.canCanDetails ? `(${ds.canCanDetails})` : ''}` : 'No'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Boning</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  {ds.boning === 'Yes' ? `Yes ${ds.boningDetails ? `(${ds.boningDetails})` : ''}` : 'No'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Fit & Darts</span>
                <span className="font-semibold text-stone-800 mt-0.5 block truncate">
                  {ds.fitType || 'Slim Fit'} • {ds.dartType || 'Princess Seam'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Flare (Mtr)</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  {ds.flareMeters ? `${ds.flareMeters} Mtr` : '—'}
                </span>
              </div>
            </div>
            {ds.measurementNotes && (
              <div className="mt-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase block mb-0.5">Measurement / Fitting Notes</span>
                <p className="text-stone-700">{ds.measurementNotes}</p>
              </div>
            )}
          </div>

          {/* Section 3: Fastenings, Trims & Accessories */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5B172E] flex items-center gap-1.5 mb-2">
              <Scissors className="w-3 h-3 text-[#9B783E]" />
              3. Fastenings, Trims & Accessories
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Zip & Closure</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.zip || 'Side Concealed'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Hook & Eye</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.hookEye || 'Handmade'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Button & Kaaj Colour</span>
                <span className="font-semibold text-stone-800 mt-0.5 block truncate">
                  Btn: {ds.buttonColor || '—'} / Kaaj: {ds.kaajColor || '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Hanger Straps</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  {ds.hangerStraps ? '✓ Yes (Add Straps)' : 'No'}
                </span>
              </div>
            </div>
            {(ds.trim || ds.tassel) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                {ds.trim && (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block mb-0.5">Trims & Laces</span>
                    <p className="text-stone-700">{ds.trim}</p>
                  </div>
                )}
                {ds.tassel && (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block mb-0.5">Tassels / Latkans</span>
                    <p className="text-stone-700">{ds.tassel}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Workshop Execution & Dates */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5B172E] flex items-center gap-1.5 mb-2">
              <Calendar className="w-3 h-3 text-[#9B783E]" />
              4. Workshop Execution & Handover Dates
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Hem Finish</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.hemFinish || 'Bakram Fold'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Kacha Trial</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.kachaTrial || 'Yes'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Interlock</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">{ds.interlock || 'Yes'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD3]">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Expected Cutting Date</span>
                <span className="font-semibold text-[#5B172E] mt-0.5 block">
                  {ds.expectedCuttingDate || '—'}
                </span>
              </div>
            </div>
            {ds.components && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#FAF6F0] border border-[#DECDB8] text-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase block mb-0.5">Garment Components</span>
                <p className="font-bold text-[#431021]">{ds.components}</p>
              </div>
            )}
            {ds.extraDesignSpec && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">Extra Design Specification</span>
                <p className="text-amber-900">{ds.extraDesignSpec}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
