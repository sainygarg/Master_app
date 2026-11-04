import React, { useState } from 'react';
import { 
  X, 
  Ruler,
  Printer
} from 'lucide-react';
import { UPPER_BODY_MEASUREMENTS, LOWER_BODY_MEASUREMENTS } from '../types/stages';
import { PrintableJobSheet } from './PrintableJobSheet';
import { maskCustomerMobile } from '../utils/privacy';

export const OrderDetailDrawer = ({
  order,
  isOpen,
  onClose,
  onAdvanceStage,
  onOpenMeasurements,
  currentUser,
  isReadOnly = false
}) => {
  if (!isOpen || !order) return null;

  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet' | 'print'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between no-print gap-3">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#5B172E] text-[#FAF6F0] flex items-center justify-center shadow-xs shrink-0">
              <span className="font-serif font-bold text-sm tracking-wider">SG</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-[#5B172E]">{order.id}</span>
                <span className="text-stone-300">•</span>
                <h2 className="font-serif text-lg font-bold text-[#431021] truncate">
                  {order.clientName}
                </h2>
              </div>
              <p className="text-xs text-stone-500 truncate">
                Created: {new Date(order.createdAt).toLocaleDateString()} • {order.city} • <span className="font-mono">{maskCustomerMobile(order.mobile, currentUser)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Tab switchers: Order Sheet & Print Preview */}
            <div className="flex items-center bg-[#FAF6F0] p-1 rounded-xl border border-[#DECDB8] text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('sheet')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'sheet' 
                    ? 'bg-[#5B172E] text-white shadow-2xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Order Sheet
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('print')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'print' 
                    ? 'bg-[#5B172E] text-white shadow-2xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Print Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: ORDER SHEET */}
          {activeTab === 'sheet' && (
            <div className="space-y-6">
              
              {/* Reference Pictures & Sketch */}
              <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs">
                <h3 className="font-serif font-bold text-base text-[#431021] mb-3 flex items-center justify-between border-b pb-2">
                  <span>1. Pictures & Sketches</span>
                  <span className="text-xs text-stone-400 font-sans font-normal">
                    One order number connects pictures, sketch, measurements and instructions.
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Inspiration */}
                  <div className="border border-[#DECDB8] rounded-xl overflow-hidden bg-[#FAF8F5]">
                    <div className="p-2 border-b border-[#DECDB8] text-[11px] font-bold text-center text-stone-600 bg-white">
                      Inspiration Photo
                    </div>
                    <div className="h-56 sm:h-64 flex items-center justify-center p-2">
                      <img
                        src={order.inspirationImages?.[0] || order.designImages?.[0]}
                        alt="Inspiration"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Design Sketch */}
                  <div className="border border-[#DECDB8] rounded-xl overflow-hidden bg-[#FAF8F5]">
                    <div className="p-2 border-b border-[#DECDB8] text-[11px] font-bold text-center text-stone-600 bg-white">
                      Design Sketch
                    </div>
                    <div className="h-56 sm:h-64 flex items-center justify-center p-2">
                      <img
                        src={order.designImages?.[0] || '/assets/sg-1024-lehenga.jpg'}
                        alt="Design sketch"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Final Outfit Reference */}
                  <div className="border border-[#DECDB8] rounded-xl overflow-hidden bg-[#FAF8F5]">
                    <div className="p-2 border-b border-[#DECDB8] text-[11px] font-bold text-center text-stone-600 bg-white">
                      Final Outfit / Workmanship Preview
                    </div>
                    <div className="h-56 sm:h-64 flex items-center justify-center p-2">
                      <img
                        src={order.designImages?.[1] || order.designImages?.[0] || '/assets/sg-1042-rose.jpg'}
                        alt="Final Outfit"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Measurements & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Design Details */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs space-y-3">
                  <h3 className="font-serif font-bold text-base text-[#431021] border-b pb-2 flex items-center justify-between">
                    <span>Design Details</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#FAF5EE] text-[#9B783E] font-bold">
                      Size: {order.size}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EFE7DC]">
                      <span className="text-stone-400 block text-[10px]">Design Name</span>
                      <strong className="text-stone-800">{order.designName}</strong>
                    </div>

                    <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EFE7DC]">
                      <span className="text-stone-400 block text-[10px]">Client Contact</span>
                      <strong className="text-stone-800">{order.clientName} ({maskCustomerMobile(order.mobile, currentUser)})</strong>
                    </div>

                    <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EFE7DC]">
                      <span className="text-stone-400 block text-[10px]">Trial Date</span>
                      <strong className="text-stone-800">{order.trialDate}</strong>
                    </div>

                    <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EFE7DC]">
                      <span className="text-stone-400 block text-[10px]">Delivery Date</span>
                      <strong className="text-[#5B172E] font-bold">{order.deliveryDate}</strong>
                    </div>

                    <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EFE7DC]">
                      <span className="text-stone-400 block text-[10px]">Fabric Required</span>
                      <span className="text-stone-800 font-medium">
                        {order.stageData?.material_check?.fabricMeterage || order.designDetails?.fabric || 'Chanderi Silk / Pure Satin'}
                      </span>
                    </div>

                    <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EFE7DC]">
                      <span className="text-stone-400 block text-[10px]">Dye Status</span>
                      <span className="font-bold text-[#9B783E]">
                        {order.stageData?.material_check?.dyeStatus || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Key Measurements Snapshot */}
                <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-serif font-bold text-base text-[#431021] flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-[#9B783E]" />
                      <span>Measurements (Inches)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => onOpenMeasurements(order)}
                      className="text-xs font-semibold text-[#5B172E] hover:underline cursor-pointer"
                    >
                      Edit All Measurements →
                    </button>
                  </div>

                  {/* Upper summary */}
                  {order.measurements?.hasUpper && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#9B783E] uppercase tracking-wider block">
                        Upper Body Highlights
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-[#FAF8F5] p-1.5 rounded border text-center">
                          <span className="text-[10px] text-stone-400 block">Chest</span>
                          <span className="font-bold">{order.measurements?.upper?.chest || '36'}"</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded border text-center">
                          <span className="text-[10px] text-stone-400 block">Waist</span>
                          <span className="font-bold">{order.measurements?.upper?.waist || '30'}"</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded border text-center">
                          <span className="text-[10px] text-stone-400 block">Shoulder</span>
                          <span className="font-bold">{order.measurements?.upper?.shoulder || '14'}"</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded border text-center">
                          <span className="text-[10px] text-stone-400 block">Blouse Len</span>
                          <span className="font-bold">{order.measurements?.upper?.blouseLength || '15'}"</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lower summary */}
                  {order.measurements?.hasLower && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold text-[#9B783E] uppercase tracking-wider block">
                        Lower Body Highlights
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-[#FAF8F5] p-1.5 rounded border text-center">
                          <span className="text-[10px] text-stone-400 block">Hip</span>
                          <span className="font-bold">{order.measurements?.lower?.hip || '39'}"</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded border text-center">
                          <span className="text-[10px] text-stone-400 block">Skirt Len</span>
                          <span className="font-bold">{order.measurements?.lower?.skirtLength || '40'}"</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded border text-center">
                          <span className="text-[10px] text-stone-400 block">Pant Len</span>
                          <span className="font-bold">{order.measurements?.lower?.pantLength || '38'}"</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1.5 rounded border text-center">
                          <span className="text-[10px] text-stone-400 block">Thigh</span>
                          <span className="font-bold">{order.measurements?.lower?.thigh || '23'}"</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenMeasurements(order)}
                      className="w-full py-2 bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#DECDB8] rounded-xl text-xs font-semibold text-[#5B172E] transition-colors cursor-pointer"
                    >
                      View Complete Digital Measurement Sheet ({UPPER_BODY_MEASUREMENTS.length + LOWER_BODY_MEASUREMENTS.length} Points)
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PRINT PREVIEW */}
          {activeTab === 'print' && (
            <div className="space-y-4">
              <div className="flex justify-end no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#5B172E] text-white rounded-xl text-xs font-bold hover:bg-[#431021] flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print This Job Sheet</span>
                </button>
              </div>
              <PrintableJobSheet order={order} currentUser={currentUser} />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
