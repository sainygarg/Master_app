import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Save,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  FileText,
  User,
  Scissors,
  PackageCheck,
  Tag
} from 'lucide-react';
import { STAGES } from '../types/stages';

export const StageUpdateModal = ({
  isOpen,
  onClose,
  order,
  stageId,
  onSaveOnly,
  onSaveAndAdvance
}) => {
  if (!isOpen || !order) return null;

  const currentStage = STAGES.find(s => s.id === stageId) || STAGES[0];
  const currentStageIndex = STAGES.findIndex(s => s.id === stageId);
  const nextStage = STAGES[currentStageIndex + 1];

  // Local state for editing fields in this stage
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (order && stageId) {
      const existingData = order.stageData?.[stageId] || {};
      setFormData({ ...existingData });
    }
  }, [order, stageId, isOpen]);

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    onSaveOnly(order.id, stageId, formData);
    onClose();
  };

  const handleAdvance = (e) => {
    e.preventDefault();
    onSaveAndAdvance(order.id, stageId, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs shrink-0">
              {currentStageIndex + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#431021]">
                  Update: {currentStage.name}
                </h2>
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#F2ECE1] text-[#9B783E]">
                  {order.id}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Client: <strong>{order.clientName}</strong> • {order.designName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Stage Fields Form */}
        <form className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">

          {/* Order Quick Context Bar */}
          <div className="p-3 rounded-xl bg-white border border-[#E8DFD3] shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-stone-400">Target Delivery:</span>{' '}
              <strong className="text-stone-800">{order.deliveryDate}</strong>
            </div>
            <div>
              <span className="text-stone-400">Trial Date:</span>{' '}
              <strong className="text-stone-800">{order.trialDate || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-stone-400">Size:</span>{' '}
              <strong className="text-[#5B172E]">{order.size}</strong>
            </div>
          </div>

          {/* Dynamic Stage Input Fields */}
          <div className="bg-white p-5 rounded-xl border border-[#E8DFD3] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#431021] border-b pb-2 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#9B783E]" />
              <span>{currentStage.name} Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentStage.fields.map((field) => {
                const val = formData[field.key] || '';

                if (field.type === 'select') {
                  return (
                    <div key={field.key} className={field.options.length > 3 ? 'sm:col-span-2' : ''}>
                      <label className="block font-semibold text-stone-700 mb-1">
                        {field.label}
                      </label>
                      <select
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-800 font-medium"
                      >
                        <option value="">-- Select Option --</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === 'date') {
                  return (
                    <div key={field.key}>
                      <label className="block font-semibold text-stone-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="date"
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-800 font-medium"
                      />
                    </div>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field.key} className="sm:col-span-2">
                      <label className="block font-semibold text-stone-700 mb-1">
                        {field.label}
                      </label>
                      <textarea
                        rows={2}
                        value={val}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label}...`}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-800"
                      />
                    </div>
                  );
                }

                // Default text input
                return (
                  <div key={field.key} className={field.placeholder && field.placeholder.length > 30 ? 'sm:col-span-2' : ''}>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label}...`}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 text-stone-800"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions inside Popup */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
              {/* Save Draft Only */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white border border-[#DECDB8] hover:bg-[#FAF5EE] shadow-2xs transition-all"
                title="Save inputs without advancing stage"
              >
                <Save className="w-3.5 h-3.5 text-stone-500" />
                <span>Save Draft</span>
              </button>

              {/* Save & Advance to Next Stage */}
              <button
                type="button"
                onClick={handleAdvance}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5B172E] via-[#6B1B37] to-[#802243] hover:from-[#431021] hover:to-[#5B172E] shadow-xs hover:shadow transition-all"
                title={nextStage ? `Save and move to Stage ${currentStageIndex + 2}: ${nextStage.name}` : 'Finalize Delivery'}
              >
                <span>Save & Advance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

