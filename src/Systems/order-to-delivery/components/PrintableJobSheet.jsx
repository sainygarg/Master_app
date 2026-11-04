import React from 'react';
import { UPPER_BODY_MEASUREMENTS, LOWER_BODY_MEASUREMENTS, STAGES } from '../types/stages';
import { maskCustomerMobile } from '../utils/privacy';

export const PrintableJobSheet = ({ order, currentUser }) => {
  if (!order) return null;

  const currentStage = STAGES.find(s => s.id === order.currentStageId) || STAGES[0];

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-stone-900 border border-stone-300 print:border-none print:p-0">
      
      {/* Brand Header */}
      <div className="text-center border-b-2 border-[#5B172E] pb-4 mb-6">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#5B172E] text-white flex items-center justify-center font-serif font-bold text-xl mb-1">
          SG
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-widest uppercase text-[#431021]">
          Sainy Garg Couture
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#9B783E] font-medium mt-0.5">
          Atelier Bespoke Production Sheet
        </p>
      </div>

      {/* Order Meta Bar */}
      <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs mb-6">
        <div>
          <span className="text-stone-500 block text-[10px] uppercase font-bold">Order Number</span>
          <span className="font-bold text-base text-[#5B172E]">{order.id}</span>
        </div>
        <div>
          <span className="text-stone-500 block text-[10px] uppercase font-bold">Client Name</span>
          <span className="font-bold text-sm text-stone-800">{order.clientName}</span>
          <span className="block text-[11px] text-stone-500">{maskCustomerMobile(order.mobile, currentUser)} • {order.city}</span>
        </div>
        <div>
          <span className="text-stone-500 block text-[10px] uppercase font-bold">Trial Date</span>
          <span className="font-bold text-stone-800">{order.trialDate}</span>
        </div>
        <div>
          <span className="text-stone-500 block text-[10px] uppercase font-bold">Delivery Date</span>
          <span className="font-bold text-stone-800">{order.deliveryDate}</span>
        </div>
      </div>

      {/* Design Details & Photos */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        
        {/* Photos Column */}
        <div className="col-span-1 space-y-3">
          <h3 className="font-serif font-bold text-sm text-[#431021] border-b pb-1">
            Design References
          </h3>
          <div className="space-y-2">
            {order.designImages?.slice(0, 2).map((img, i) => (
              <div key={i} className="border border-stone-200 rounded-lg overflow-hidden h-40 bg-stone-50">
                <img src={img} alt="Design" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Specifications & Production */}
        <div className="col-span-2 space-y-4">
          <div>
            <h3 className="font-serif font-bold text-sm text-[#431021] border-b pb-1 mb-2">
              Outfit Specifications
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div><strong className="text-stone-500">Design Name:</strong> {order.designName}</div>
              <div><strong className="text-stone-500">Size:</strong> {order.size}</div>
              <div><strong className="text-stone-500">Fabric:</strong> {order.designDetails?.fabric || 'Bespoke Couture Fabric'}</div>
              <div><strong className="text-stone-500">Colour:</strong> {order.designDetails?.colour || 'Custom Dye'}</div>
              <div><strong className="text-stone-500">Workmanship:</strong> {order.designDetails?.work || 'Hand Embroidery'}</div>
              <div><strong className="text-stone-500">Current Stage:</strong> {currentStage.name}</div>
            </div>
          </div>

          {/* Measurements Table */}
          <div>
            <h3 className="font-serif font-bold text-sm text-[#431021] border-b pb-1 mb-2">
              Client Measurements (Inches)
            </h3>
            
            {order.measurements?.hasUpper && (
              <div className="mb-3">
                <span className="text-[11px] font-bold text-[#9B783E] block mb-1">Upper Body</span>
                <div className="grid grid-cols-4 gap-1 text-[11px] border border-stone-200 p-2 rounded bg-[#FAF8F5]">
                  {UPPER_BODY_MEASUREMENTS.map(m => {
                    const val = order.measurements?.upper?.[m.id];
                    const typeVal = order.measurements?.upper?.[`${m.id}Type`];
                    const displayVal = typeVal ? `${typeVal}${val ? ` (${val}")` : ''}` : (val ? `${val}"` : '-');
                    return (
                      <div key={m.id} className="flex justify-between border-b border-stone-100 py-0.5">
                        <span className="text-stone-600 truncate pr-1">{m.label}:</span>
                        <strong className="text-stone-900 shrink-0">{displayVal}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order.measurements?.hasLower && (
              <div>
                <span className="text-[11px] font-bold text-[#9B783E] block mb-1">Lower Body</span>
                <div className="grid grid-cols-4 gap-1 text-[11px] border border-stone-200 p-2 rounded bg-[#FAF8F5]">
                  {LOWER_BODY_MEASUREMENTS.map(m => (
                    <div key={m.id} className="flex justify-between border-b border-stone-100 py-0.5">
                      <span className="text-stone-600">{m.label}:</span>
                      <strong className="text-stone-900">{order.measurements?.lower?.[m.id] || '-'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stage Progression & Sign-offs */}
      <div className="border-t-2 border-stone-200 pt-4 mt-6">
        <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-600 mb-2">
          Production Sign-offs
        </h3>
        <div className="grid grid-cols-4 gap-3 text-center text-xs">
          <div className="border border-stone-300 p-3 rounded">
            <span className="text-stone-400 block text-[10px]">Material & Dye</span>
            <div className="h-8 flex items-end justify-center font-bold text-stone-700">Checked</div>
            <span className="border-t border-stone-200 block text-[10px] mt-1 pt-1">Sign</span>
          </div>
          <div className="border border-stone-300 p-3 rounded">
            <span className="text-stone-400 block text-[10px]">Cutter Master</span>
            <div className="h-8 flex items-end justify-center font-bold text-stone-700">Master Verified</div>
            <span className="border-t border-stone-200 block text-[10px] mt-1 pt-1">Sign</span>
          </div>
          <div className="border border-stone-300 p-3 rounded">
            <span className="text-stone-400 block text-[10px]">Stitching Tailor</span>
            <div className="h-8 flex items-end justify-center font-bold text-stone-700">Assembled</div>
            <span className="border-t border-stone-200 block text-[10px] mt-1 pt-1">Sign</span>
          </div>
          <div className="border border-stone-300 p-3 rounded">
            <span className="text-stone-400 block text-[10px]">Final QC & Packing</span>
            <div className="h-8 flex items-end justify-center font-bold text-stone-700">Passed</div>
            <span className="border-t border-stone-200 block text-[10px] mt-1 pt-1">Sign</span>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-stone-400 mt-6 pt-3 border-t">
        SAINY GARG COUTURE • Bespoke Atelier • One order number connects pictures, sketch, measurements and instructions.
      </div>
    </div>
  );
};

