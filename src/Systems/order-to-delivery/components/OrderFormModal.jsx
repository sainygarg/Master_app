import React, { useState } from 'react';
import {
  X,
  Upload,
  Trash2,
  Camera,
  Sparkles,
  Ruler,
  Check,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';
import { UPPER_BODY_MEASUREMENTS, LOWER_BODY_MEASUREMENTS } from '../types/stages';

export const OrderFormModal = ({ isOpen, onClose, onSubmitOrder, nextOrderId }) => {
  if (!isOpen) return null;

  // Basic Details
  const [clientName, setClientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [designName, setDesignName] = useState('');
  const [size, setSize] = useState('Custom');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [trialDate, setTrialDate] = useState('');

  // Images arrays
  const [designImages, setDesignImages] = useState([]);
  const [inspirationImages, setInspirationImages] = useState([]);

  // Measurement selection
  const [hasUpper, setHasUpper] = useState(true);
  const [hasLower, setHasLower] = useState(true);

  // Upper Body Measurements State
  const [upperMeasurements, setUpperMeasurements] = useState(
    UPPER_BODY_MEASUREMENTS.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {})
  );

  // Lower Body Measurements State
  const [lowerMeasurements, setLowerMeasurements] = useState(
    LOWER_BODY_MEASUREMENTS.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {})
  );

  // Validation errors
  const [errors, setErrors] = useState({});

  // Helper to handle multiple image uploads (file reader to Data URL)
  const handleImageUpload = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'design') {
          setDesignImages((prev) => [...prev, reader.result]);
        } else {
          setInspirationImages((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index, type) => {
    if (type === 'design') {
      setDesignImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setInspirationImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Quick preset loader for fast testing / demos
  const loadPresetData = () => {
    setClientName('Rhea Singhania');
    setMobile('+91 98112 34567');
    setCity('Delhi');
    setDesignName('Ivory & Blush Raw Silk Lehenga Set');
    setSize('Custom');

    // Set dates: delivery in 25 days, trial in 18 days
    const today = new Date();
    const trial = new Date(today);
    trial.setDate(trial.getDate() + 18);
    const deliv = new Date(today);
    deliv.setDate(deliv.getDate() + 25);

    setTrialDate(trial.toISOString().split('T')[0]);
    setDeliveryDate(deliv.toISOString().split('T')[0]);

    setDesignImages([
      '/assets/sg-1024-lehenga.jpg'
    ]);
    setInspirationImages([
      '/assets/sg-1042-rose.jpg'
    ]);

    setHasUpper(true);
    setHasLower(true);

    const presetUpper = {};
    UPPER_BODY_MEASUREMENTS.forEach(m => {
      presetUpper[m.id] = m.defaultVal;
      if (m.isDropdownWithSize) {
        presetUpper[`${m.id}Type`] = m.defaultType || m.options[0];
      }
    });
    setUpperMeasurements(presetUpper);

    const presetLower = {};
    LOWER_BODY_MEASUREMENTS.forEach(m => presetLower[m.id] = m.defaultVal);
    setLowerMeasurements(presetLower);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!clientName.trim()) errs.clientName = 'Client name is required';
    if (!mobile.trim()) errs.mobile = 'Mobile number is required';
    if (!designName.trim()) errs.designName = 'Design name is required';
    if (!deliveryDate) errs.deliveryDate = 'Delivery date is required';
    if (!trialDate) errs.trialDate = 'Trial date is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newOrder = {
      id: nextOrderId,
      clientName: clientName.trim(),
      mobile: mobile.trim(),
      city: city.trim() || 'New Delhi',
      designName: designName.trim(),
      size,
      deliveryDate,
      trialDate,
      createdAt: new Date().toISOString(),
      currentStageId: 'material_check',
      currentStageIndex: 0,
      designImages: designImages.length > 0 ? designImages : ['/assets/sg-1024-lehenga.jpg'],
      inspirationImages: inspirationImages.length > 0 ? inspirationImages : ['/assets/sg-1042-rose.jpg'],
      measurements: {
        hasUpper,
        hasLower,
        upper: hasUpper ? upperMeasurements : {},
        lower: hasLower ? lowerMeasurements : {}
      },
      stageData: {
        material_check: {
          dyeStatus: 'No',
          materialReadyDate: '',
          remarks: 'Newly created order awaiting material check.'
        }
      },
      history: [
        {
          stageId: 'material_check',
          stageName: 'Material Check',
          timestamp: new Date().toISOString(),
          action: 'Order Placed & Created',
          actor: 'Order Desk',
          notes: 'Assigned to Material Check stage automatically.'
        }
      ]
    };

    onSubmitOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#5B172E] text-[#FAF6F0] flex items-center justify-center shadow-xs">
              <span className="font-serif font-bold text-sm tracking-wider">SG</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#431021]">
                  New Bespoke Order Sheet
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#F2ECE1] text-[#9B783E] border border-[#DECDB8]">
                  {nextOrderId}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Sainy Garg Couture • Client Specifications & Measurement Chart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadPresetData}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#9B783E] bg-[#FAF3E8] hover:bg-[#F3E7D3] border border-[#DECDB8] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Fill Sample Data</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* SECTION 1: Client & Design Details */}
          <div className="bg-white rounded-xl p-5 border border-[#E8DFD3] shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-3 mb-4">
              <h3 className="font-serif font-bold text-[#5B172E] text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#5B172E]/10 text-[#5B172E] flex items-center justify-center text-xs font-bold font-sans">
                  1
                </span>
                Order & Client Details
              </h3>
              <span className="text-xs text-[#9B783E] font-medium">Stage 1 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  1. Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (errors.clientName) setErrors({ ...errors, clientName: null });
                  }}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${errors.clientName ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                    }`}
                />
                {errors.clientName && <p className="text-[11px] text-rose-500 mt-1">{errors.clientName}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  2. Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (errors.mobile) setErrors({ ...errors, mobile: null });
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${errors.mobile ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                    }`}
                />
                {errors.mobile && <p className="text-[11px] text-rose-500 mt-1">{errors.mobile}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  3. City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi, Mumbai"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                />
              </div>

              {/* Name Of Design */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  4. Name Of Design <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={designName}
                  onChange={(e) => {
                    setDesignName(e.target.value);
                    if (errors.designName) setErrors({ ...errors, designName: null });
                  }}
                  placeholder="e.g. Sage Green Handcrafted Lehenga Set"
                  className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${errors.designName ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                    }`}
                />
                {errors.designName && <p className="text-[11px] text-rose-500 mt-1">{errors.designName}</p>}
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  5. Size
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. Custom, 36, M, 38, etc."
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                />
              </div>

              {/* Date Of Trial */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  8. Date Of Trial <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={trialDate}
                  onChange={(e) => {
                    setTrialDate(e.target.value);
                    if (errors.trialDate) setErrors({ ...errors, trialDate: null });
                  }}
                  className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${errors.trialDate ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                    }`}
                />
                {errors.trialDate && <p className="text-[11px] text-rose-500 mt-1">{errors.trialDate}</p>}
              </div>

              {/* Date Of Delivery */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  7. Date Of Delivery <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    if (errors.deliveryDate) setErrors({ ...errors, deliveryDate: null });
                  }}
                  className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${errors.deliveryDate ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                    }`}
                />
                {errors.deliveryDate && <p className="text-[11px] text-rose-500 mt-1">{errors.deliveryDate}</p>}
              </div>
            </div>

            {/* Images Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-[#F0E6D8]">
              {/* 6. Design Images */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>6. Design Images (Multiples)</span>
                  <span className="text-[11px] text-stone-400">{designImages.length} uploaded</span>
                </label>
                <div className="border-2 border-dashed border-[#DECDB8] hover:border-[#9B783E] rounded-xl p-3 bg-[#FAF8F5] transition-colors text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="design-images-input"
                    onChange={(e) => handleImageUpload(e, 'design')}
                    className="hidden"
                  />
                  <label
                    htmlFor="design-images-input"
                    className="cursor-pointer flex flex-col items-center justify-center py-2 text-xs text-stone-600 hover:text-[#5B172E]"
                  >
                    <Upload className="w-5 h-5 text-[#9B783E] mb-1" />
                    <span className="font-semibold">Upload Design Sketches & Photos</span>
                    <span className="text-[10px] text-stone-400">PNG, JPG, WebP supported</span>
                  </label>

                  {/* Thumbnail Previews */}
                  {designImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#DECDB8]">
                      {designImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden h-16 border border-[#DECDB8]">
                          <img src={img} alt="Design preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx, 'design')}
                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 9. Inspiration Images */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>9. Inspiration Images (Multiples)</span>
                  <span className="text-[11px] text-stone-400">{inspirationImages.length} uploaded</span>
                </label>
                <div className="border-2 border-dashed border-[#DECDB8] hover:border-[#9B783E] rounded-xl p-3 bg-[#FAF8F5] transition-colors text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="insp-images-input"
                    onChange={(e) => handleImageUpload(e, 'inspiration')}
                    className="hidden"
                  />
                  <label
                    htmlFor="insp-images-input"
                    className="cursor-pointer flex flex-col items-center justify-center py-2 text-xs text-stone-600 hover:text-[#5B172E]"
                  >
                    <ImageIcon className="w-5 h-5 text-[#9B783E] mb-1" />
                    <span className="font-semibold">Upload Reference & Client Moodboard</span>
                    <span className="text-[10px] text-stone-400">Multiple files allowed</span>
                  </label>

                  {/* Thumbnail Previews */}
                  {inspirationImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#DECDB8]">
                      {inspirationImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden h-16 border border-[#DECDB8]">
                          <img src={img} alt="Inspiration preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx, 'inspiration')}
                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Measurements Details */}
          <div className="bg-white rounded-xl p-5 border border-[#E8DFD3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F0E6D8] pb-3 gap-2">
              <div>
                <h3 className="font-serif font-bold text-[#5B172E] text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#5B172E]/10 text-[#5B172E] flex items-center justify-center text-xs font-bold font-sans">
                    2
                  </span>
                  Measurement Details (All in Inches)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Select which measurement sections apply for this couture ensemble:
                </p>
              </div>

              {/* Selection Checkboxes / Toggle Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasUpper(!hasUpper)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${hasUpper
                    ? 'bg-[#5B172E] text-white border-[#5B172E]'
                    : 'bg-[#FAF8F5] text-stone-600 border-[#DECDB8]'
                    }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] ${hasUpper ? 'bg-white text-[#5B172E]' : 'border border-stone-400'}`}>
                    {hasUpper && '✓'}
                  </span>
                  1. Upper Body ({UPPER_BODY_MEASUREMENTS.length} points)
                </button>

                <button
                  type="button"
                  onClick={() => setHasLower(!hasLower)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${hasLower
                    ? 'bg-[#5B172E] text-white border-[#5B172E]'
                    : 'bg-[#FAF8F5] text-stone-600 border-[#DECDB8]'
                    }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] ${hasLower ? 'bg-white text-[#5B172E]' : 'border border-stone-400'}`}>
                    {hasLower && '✓'}
                  </span>
                  2. Lower Body ({LOWER_BODY_MEASUREMENTS.length} points)
                </button>
              </div>
            </div>

            {/* UPPER BODY MEASUREMENTS */}
            {hasUpper && (
              <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#DECDB8]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-[#9B783E]" />
                    Upper Body Measurements ({UPPER_BODY_MEASUREMENTS.length} Parameters)
                  </h4>
                  <span className="text-[11px] text-[#9B783E] font-medium">Standard / Tailored Inches</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {UPPER_BODY_MEASUREMENTS.map((item, index) => (
                    item.isDropdownWithSize ? (
                      <div key={item.id} className="bg-white p-2 rounded-lg border border-[#DECDB8]/80 shadow-2xs hover:border-[#9B783E] transition-colors">
                        <label className="block text-[11px] font-semibold text-stone-600 truncate mb-1" title={item.label}>
                          {index + 1}. {item.label}
                        </label>
                        <div className="flex items-center gap-1">
                          {/* Dropdown Selector for Type */}
                          <select
                            value={upperMeasurements[`${item.id}Type`] || item.defaultType || item.options[0]}
                            onChange={(e) =>
                              setUpperMeasurements({
                                ...upperMeasurements,
                                [`${item.id}Type`]: e.target.value
                              })
                            }
                            className="w-[58%] min-w-0 px-1.5 py-1 text-[11px] font-semibold text-stone-700 bg-[#FAF8F5] border border-[#DECDB8] rounded focus:outline-none focus:ring-1 focus:ring-[#5B172E] truncate"
                            title={`Select ${item.label} Type`}
                          >
                            {item.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>

                          {/* Length Input */}
                          <div className="relative w-[42%] shrink-0">
                            <input
                              type="text"
                              value={upperMeasurements[item.id] || ''}
                              onChange={(e) =>
                                setUpperMeasurements({
                                  ...upperMeasurements,
                                  [item.id]: e.target.value
                                })
                              }
                              placeholder={item.defaultVal}
                              className="w-full pr-3.5 pl-1.5 py-1 text-xs font-bold text-stone-800 bg-[#FAF8F5] border border-[#DECDB8] rounded focus:outline-none focus:ring-1 focus:ring-[#5B172E] text-center"
                              title={`Enter ${item.label} Length in Inches`}
                            />
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">
                              "
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={item.id} className="bg-white p-2 rounded-lg border border-[#DECDB8]/80 shadow-2xs hover:border-[#9B783E] transition-colors">
                        <label className="block text-[11px] font-semibold text-stone-600 truncate mb-1" title={item.label}>
                          {index + 1}. {item.label}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={upperMeasurements[item.id] || ''}
                            onChange={(e) =>
                              setUpperMeasurements({
                                ...upperMeasurements,
                                [item.id]: e.target.value
                              })
                            }
                            placeholder={item.defaultVal}
                            className="w-full pr-5 pl-2 py-1 text-xs font-bold text-stone-800 bg-[#FAF8F5] border border-[#DECDB8] rounded focus:outline-none focus:ring-1 focus:ring-[#5B172E]"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">
                            "
                          </span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* LOWER BODY MEASUREMENTS */}
            {hasLower && (
              <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#DECDB8]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-bold text-sm text-[#431021] flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-[#9B783E]" />
                    Lower Body Measurements ({LOWER_BODY_MEASUREMENTS.length} Parameters)
                  </h4>
                  <span className="text-[11px] text-[#9B783E] font-medium">Standard / Tailored Inches</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {LOWER_BODY_MEASUREMENTS.map((item, index) => (
                    <div key={item.id} className="bg-white p-2 rounded-lg border border-[#DECDB8]/80 shadow-2xs">
                      <label className="block text-[11px] font-semibold text-stone-600 truncate mb-1">
                        {index + 1}. {item.label}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={lowerMeasurements[item.id] || ''}
                          onChange={(e) =>
                            setLowerMeasurements({
                              ...lowerMeasurements,
                              [item.id]: e.target.value
                            })
                          }
                          placeholder={item.defaultVal}
                          className="w-full pr-5 pl-2 py-1 text-xs font-bold text-stone-800 bg-[#FAF8F5] border border-[#DECDB8] rounded focus:outline-none focus:ring-1 focus:ring-[#5B172E]"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">
                          "
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasUpper && !hasLower && (
              <div className="text-center py-6 border border-dashed border-amber-300 bg-amber-50 rounded-xl text-xs text-amber-800">
                Please select at least Upper Body or Lower Body Measurement to record client specifications.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#7B203E] hover:from-[#431021] hover:to-[#5B172E] shadow-md transition-all transform active:scale-98"
            >
              <span>Create Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

