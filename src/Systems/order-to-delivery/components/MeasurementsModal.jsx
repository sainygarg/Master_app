import React, { useState } from 'react';
import { 
  X, 
  Ruler, 
  Save, 
  Printer, 
  Sparkles, 
  Camera, 
  Check, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { UPPER_BODY_MEASUREMENTS, LOWER_BODY_MEASUREMENTS } from '../types/stages';
import { maskCustomerMobile } from '../utils/privacy';

export const MeasurementsModal = ({ order, isOpen, onClose, onSaveMeasurements, currentUser, isReadOnly = false }) => {
  if (!isOpen || !order) return null;

  const [activeCategory, setActiveCategory] = useState('upper'); // 'upper' | 'lower'
  const [upperValues, setUpperValues] = useState({
    ...(order.measurements?.upper || {})
  });
  const [lowerValues, setLowerValues] = useState({
    ...(order.measurements?.lower || {})
  });
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleUpperChange = (id, val) => {
    setUpperValues(prev => ({ ...prev, [id]: val }));
  };

  const handleLowerChange = (id, val) => {
    setLowerValues(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = () => {
    const updatedMeasurements = {
      ...order.measurements,
      hasUpper: true,
      hasLower: true,
      upper: upperValues,
      lower: lowerValues
    };
    onSaveMeasurements(order.id, updatedMeasurements);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#5B172E] text-[#FAF6F0] flex items-center justify-center shadow-xs">
              <Ruler className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#431021]">
                  Digital Measurement Book
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#F2ECE1] text-[#9B783E]">
                  {order.id}
                </span>
                {isReadOnly && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-stone-200 text-stone-700">
                    Read-Only (History)
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                Client: {order.clientName} • Measured for: {order.designName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="bg-[#FAF6F0] px-6 py-3 border-b border-[#E8DFD3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCategory('upper')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === 'upper'
                  ? 'bg-[#5B172E] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-[#DECDB8] hover:bg-stone-50'
              }`}
            >
              1. Upper Body ({UPPER_BODY_MEASUREMENTS.length} Parameters)
            </button>

            <button
              onClick={() => setActiveCategory('lower')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === 'lower'
                  ? 'bg-[#5B172E] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-[#DECDB8] hover:bg-stone-50'
              }`}
            >
              2. Lower Body ({LOWER_BODY_MEASUREMENTS.length} Parameters)
            </button>
          </div>

          <span className="text-xs text-[#9B783E] font-medium hidden sm:inline">
            All dimensions in inches (")
          </span>
        </div>

        {/* Body Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Photos / Fitting preview (like Image 1 in user mockup) */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8DFD3] shadow-xs flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-stone-100 border border-[#DECDB8] shrink-0">
              <img
                src={order.designImages?.[0] || '/assets/sg-measurement-book.jpg'}
                alt="Client reference"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-[#431021]">
                Bespoke Fit Reference Card
              </h4>
              <p className="text-xs text-stone-600">
                Precision measurements calibrated for <strong className="text-[#5B172E]">{order.designName}</strong>. Master tailors will cross-reference these points during Khaka tracing, cutting, and First QC.
              </p>
              <div className="pt-1 flex items-center gap-3 text-xs text-stone-500">
                <span>Client City: <strong>{order.city}</strong></span>
                <span>•</span>
                <span>Mobile: <strong className="font-mono">{maskCustomerMobile(order.mobile, currentUser)}</strong></span>
              </div>
            </div>
          </div>

          {/* Upper Body Section */}
          {activeCategory === 'upper' && (
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-serif font-bold text-base text-[#431021] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5B172E]/10 text-[#5B172E] flex items-center justify-center text-xs font-bold font-sans">
                    U
                  </span>
                  Upper Body Measurement Points (1 to {UPPER_BODY_MEASUREMENTS.length})
                </h3>
                <span className="text-xs text-stone-400">Tape measure snug fit</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {UPPER_BODY_MEASUREMENTS.map((m, idx) => (
                  m.isDropdownWithSize ? (
                    <div key={m.id} className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#DECDB8] hover:border-[#9B783E] transition-colors">
                      <label className="block text-xs font-semibold text-stone-700 mb-1 truncate" title={m.label}>
                        {idx + 1}. {m.label}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={upperValues[`${m.id}Type`] || m.defaultType || m.options[0]}
                          onChange={(e) => handleUpperChange(`${m.id}Type`, e.target.value)}
                          className="w-[58%] min-w-0 px-2 py-1.5 text-xs font-semibold text-stone-900 bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 truncate"
                          title={`Select ${m.label} Type`}
                        >
                          {m.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <div className="relative w-[42%] shrink-0">
                          <input
                            type="text"
                            value={upperValues[m.id] !== undefined ? upperValues[m.id] : ''}
                            onChange={(e) => handleUpperChange(m.id, e.target.value)}
                            placeholder={m.defaultVal}
                            className="w-full pl-2 pr-5 py-1.5 text-sm font-bold text-stone-900 bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-center"
                            title={`Enter ${m.label} Length`}
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                            "
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#DECDB8] hover:border-[#9B783E] transition-colors">
                      <label className="block text-xs font-semibold text-stone-700 mb-1 truncate">
                        {idx + 1}. {m.label}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upperValues[m.id] !== undefined ? upperValues[m.id] : ''}
                          onChange={(e) => handleUpperChange(m.id, e.target.value)}
                          placeholder={m.defaultVal}
                          className="w-full pl-2.5 pr-6 py-1.5 text-sm font-bold text-stone-900 bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                          "
                        </span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Lower Body Section */}
          {activeCategory === 'lower' && (
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-serif font-bold text-base text-[#431021] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5B172E]/10 text-[#5B172E] flex items-center justify-center text-xs font-bold font-sans">
                    L
                  </span>
                  Lower Body Measurement Points (1 to {LOWER_BODY_MEASUREMENTS.length})
                </h3>
                <span className="text-xs text-stone-400">Tape measure snug fit</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {LOWER_BODY_MEASUREMENTS.map((m, idx) => (
                  <div key={m.id} className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#DECDB8] hover:border-[#9B783E] transition-colors">
                    <label className="block text-xs font-semibold text-stone-700 mb-1 truncate">
                      {idx + 1}. {m.label}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={lowerValues[m.id] !== undefined ? lowerValues[m.id] : ''}
                        onChange={(e) => handleLowerChange(m.id, e.target.value)}
                        placeholder={m.defaultVal}
                        className="w-full pl-2.5 pr-6 py-1.5 text-sm font-bold text-stone-900 bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                        "
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-[#E8DFD3] flex items-center justify-between">
          <div>
            {isSavedNotice && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                Measurements successfully updated!
              </span>
            )}
            {isReadOnly && (
              <span className="text-xs text-stone-500 italic">
                Historical record archive: Measurements are view-only.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Close
            </button>
            {!isReadOnly && (
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B172E] hover:bg-[#431021] shadow-xs hover:shadow transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Measurements</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

