import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  User, 
  Building2, 
  Truck, 
  Scissors, 
  Phone, 
  Mail, 
  MapPin, 
  Tag, 
  FileText,
  Star,
  Clock,
  Briefcase,
  Layers,
  AlertCircle
} from 'lucide-react';
import { STAGES } from '../types/stages';

export const MasterEntryModal = ({
  isOpen,
  onClose,
  type, // 'customer' | 'vendor' | 'transporter' | 'karigar' | 'department' | 'tat'
  initialData = null,
  onSubmit,
  nextId
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      // Default empty templates
      if (type === 'customer') {
        setFormData({
          id: nextId || `CUST-${Date.now().toString().slice(-3)}`,
          name: '',
          phone: '',
          email: '',
          city: '',
          address: '',
          category: 'VIP Bridal',
          notes: ''
        });
      } else if (type === 'vendor') {
        setFormData({
          id: nextId || `VND-${Date.now().toString().slice(-3)}`,
          name: '',
          category: 'Pure Silk & Chanderi Fabrics',
          contactPerson: '',
          phone: '',
          city: '',
          address: '',
          gstNo: '',
          rating: '⭐⭐⭐⭐⭐ Top Tier',
          terms: '15 Days Credit'
        });
      } else if (type === 'transporter') {
        setFormData({
          id: nextId || `TRN-${Date.now().toString().slice(-3)}`,
          name: '',
          serviceType: 'Priority Air Courier (Express 24-48h)',
          contactPerson: '',
          phone: '',
          hubCity: '',
          operatingRoutes: 'Domestic Metros & Tier 1 Cities',
          trackingUrl: '',
          avgTransitTime: '24-48 Hours'
        });
      } else if (type === 'karigar') {
        setFormData({
          id: nextId || `KRG-${Date.now().toString().slice(-3)}`,
          name: '',
          specialization: 'Senior Stitching Master (Blouses & Bodice Fitting)',
          unit: 'Central Atelier - Tailoring Floor 1',
          phone: '',
          skillGrade: 'Grade A+ (Master Artisan)',
          status: 'Active (On Duty)',
          dailyCapacity: '1 Garment / Day'
        });
      } else if (type === 'department') {
        setFormData({
          id: nextId || `DEPT-${Date.now().toString().slice(-3)}`,
          name: '',
          code: '',
          headName: '',
          contactEmail: '',
          staffCount: 1,
          status: 'Active',
          description: ''
        });
      } else if (type === 'tat') {
        setFormData({
          id: nextId || `TAT-${Date.now().toString().slice(-3)}`,
          stageName: STAGES[0]?.name || 'Material Check',
          stageId: STAGES[0]?.id || 'material_check',
          stageIndex: 1,
          standardDays: 2,
          standardHours: 16,
          bufferDays: 1,
          maxSlaDays: 3,
          department: 'Order Desk & Client Relations',
          priority: 'Normal',
          notes: ''
        });
      }
    }
    setErrors({});
  }, [initialData, type, isOpen, nextId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (type === 'tat') {
      if (!formData.stageName?.trim()) {
        newErrors.stageName = 'Stage Name is required';
      }
      if (formData.standardDays === undefined || formData.standardDays === '') {
        newErrors.standardDays = 'Standard Days is required';
      }
    } else {
      if (!formData.name?.trim()) {
        newErrors.name = 'Name is required';
      }
      if (type !== 'department' && !formData.phone?.trim()) {
        newErrors.phone = 'Contact phone is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const getTitle = () => {
    const action = initialData ? 'Edit' : 'Add New';
    switch (type) {
      case 'customer': return `${action} Customer Record`;
      case 'vendor': return `${action} Vendor / Supplier`;
      case 'department': return `${action} Department Master`;
      case 'tat': return `${action} Stage TAT / SLA Configuration`;
      case 'transporter': return `${action} Transporter / Logistics Partner`;
      case 'karigar': return `${action} Karigar / Artisan Master`;
      default: return `${action} Master Record`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'customer': return <User className="w-5 h-5 text-[#C5A059]" />;
      case 'vendor': return <Building2 className="w-5 h-5 text-[#C5A059]" />;
      case 'department': return <Briefcase className="w-5 h-5 text-[#C5A059]" />;
      case 'tat': return <Clock className="w-5 h-5 text-[#C5A059]" />;
      case 'transporter': return <Truck className="w-5 h-5 text-[#C5A059]" />;
      case 'karigar': return <Scissors className="w-5 h-5 text-[#C5A059]" />;
      default: return <Tag className="w-5 h-5 text-[#C5A059]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#5B172E] text-white flex items-center justify-center shadow-xs">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#431021]">
                  {getTitle()}
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-md bg-[#FAF5EE] text-[#9B783E] border border-[#DECDB8]">
                  {formData.id}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Sainy Garg Couture • Master Data Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* NAME FIELD (FOR CUSTOMER, VENDOR, TRANSPORTER, KARIGAR, DEPARTMENT) */}
            {type !== 'tat' && (
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  {type === 'customer' ? 'Customer Full Name' :
                   type === 'vendor' ? 'Vendor / Business Firm Name' :
                   type === 'department' ? 'Department Name' :
                   type === 'transporter' ? 'Courier / Logistics Company Name' :
                   'Karigar / Artisan Master Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter name..."
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                    errors.name ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>
            )}

            {/* PHONE FIELD (FOR CUSTOMER, VENDOR, TRANSPORTER, KARIGAR) */}
            {type !== 'department' && type !== 'tat' && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Contact Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                    errors.phone ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
              </div>
            )}

            {/* TYPE SPECIFIC FIELDS: CUSTOMER */}
            {type === 'customer' && (
              <>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    City / Region
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. New Delhi, Mumbai"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Client Category
                  </label>
                  <select
                    value={formData.category || 'VIP Bridal'}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  >
                    <option value="VIP Bridal">VIP Bridal</option>
                    <option value="Couture Trousseau">Couture Trousseau</option>
                    <option value="High Net Bespoke">High Net Bespoke</option>
                    <option value="Wedding Guest Luxury">Wedding Guest Luxury</option>
                    <option value="Royal Heritage">Royal Heritage</option>
                    <option value="Contemporary Heritage">Contemporary Heritage</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Full Delivery Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Apartment, Street, Landmark, Pincode"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Client Taste & Style Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Specific necklines, embroidery density preferences, lining fabric..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>
              </>
            )}

            {/* TYPE SPECIFIC FIELDS: VENDOR */}
            {type === 'vendor' && (
              <>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson || ''}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    placeholder="e.g. Rajesh Shah"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Supply Category / Items
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    placeholder="e.g. Pure Silk, Zari, Organza, Can-Can, Thread"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    City / Market Location
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. Varanasi, Surat, Delhi"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstNo || ''}
                    onChange={(e) => handleChange('gstNo', e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Vendor Quality Rating
                  </label>
                  <select
                    value={formData.rating || '⭐⭐⭐⭐⭐ Top Tier'}
                    onChange={(e) => handleChange('rating', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  >
                    <option value="⭐⭐⭐⭐⭐ Top Tier">⭐⭐⭐⭐⭐ Top Tier</option>
                    <option value="⭐⭐⭐⭐ Premium">⭐⭐⭐⭐ Premium</option>
                    <option value="⭐⭐⭐ Standard">⭐⭐⭐ Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.terms || ''}
                    onChange={(e) => handleChange('terms', e.target.value)}
                    placeholder="e.g. 15 Days Credit, Advance 50%"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Address / Shop Details
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Market lane, Unit No., City"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>
              </>
            )}

            {/* TYPE SPECIFIC FIELDS: DEPARTMENT */}
            {type === 'department' && (
              <>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => handleChange('code', e.target.value)}
                    placeholder="e.g. BST, MDV, TKC"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Head of Department / In-Charge <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.headName || ''}
                    onChange={(e) => handleChange('headName', e.target.value)}
                    placeholder="e.g. Master Harish, Priya Sharma"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="dept@sainygarg.com"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Active Staff Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.staffCount || 1}
                    onChange={(e) => handleChange('staffCount', parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Expansion">Under Expansion</option>
                    <option value="On Shift">On Shift</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Operational Scope & Responsibility
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Core tasks handled by this department..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>
              </>
            )}

            {/* TYPE SPECIFIC FIELDS: TAT */}
            {type === 'tat' && (
              <>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Select Workflow Stage <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.stageName || STAGES[0]?.name}
                    onChange={(e) => {
                      const selectedStg = STAGES.find(s => s.name === e.target.value);
                      handleChange('stageName', e.target.value);
                      if (selectedStg) {
                        handleChange('stageId', selectedStg.id);
                        handleChange('stageIndex', STAGES.findIndex(s => s.id === selectedStg.id) + 1);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  >
                    {STAGES.map((s, idx) => (
                      <option key={s.id} value={s.name}>
                        Stage {idx + 1}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Standard Target (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.standardDays ?? 2}
                    onChange={(e) => handleChange('standardDays', parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Target Work Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.standardHours ?? 16}
                    onChange={(e) => handleChange('standardHours', parseInt(e.target.value, 10) || 8)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Buffer / Grace Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bufferDays ?? 1}
                    onChange={(e) => handleChange('bufferDays', parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Max SLA Limit (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxSlaDays ?? 3}
                    onChange={(e) => handleChange('maxSlaDays', parseInt(e.target.value, 10) || 2)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    In-Charge Department
                  </label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="e.g. Tracing, Khaka & Cutting"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    SLA Priority Flag
                  </label>
                  <select
                    value={formData.priority || 'Normal'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    SLA Guidelines & SOP Remark
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Quality verification rules, alert trigger notes..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>
              </>
            )}

            {/* TYPE SPECIFIC FIELDS: TRANSPORTER */}
            {type === 'transporter' && (
              <>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Courier / Service Type
                  </label>
                  <input
                    type="text"
                    value={formData.serviceType || ''}
                    onChange={(e) => handleChange('serviceType', e.target.value)}
                    placeholder="e.g. Priority Air, Express Road"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Contact Person / Representative
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson || ''}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    placeholder="e.g. Vikram Batra"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Hub Base City
                  </label>
                  <input
                    type="text"
                    value={formData.hubCity || ''}
                    onChange={(e) => handleChange('hubCity', e.target.value)}
                    placeholder="e.g. Delhi-NCR (Aerocity)"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Avg Transit SLA
                  </label>
                  <input
                    type="text"
                    value={formData.avgTransitTime || ''}
                    onChange={(e) => handleChange('avgTransitTime', e.target.value)}
                    placeholder="e.g. 24-48 Hours"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tracking Portal URL
                  </label>
                  <input
                    type="text"
                    value={formData.trackingUrl || ''}
                    onChange={(e) => handleChange('trackingUrl', e.target.value)}
                    placeholder="https://www.bluedart.com/tracking"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Operating Routes & Coverage
                  </label>
                  <input
                    type="text"
                    value={formData.operatingRoutes || ''}
                    onChange={(e) => handleChange('operatingRoutes', e.target.value)}
                    placeholder="e.g. Domestic Metros, Delhi-NCR, Pan-India"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>
              </>
            )}

            {/* TYPE SPECIFIC FIELDS: KARIGAR */}
            {type === 'karigar' && (
              <>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Artisan Craft Specialization
                  </label>
                  <select
                    value={formData.specialization || 'Senior Stitching Master (Blouses & Bodice Fitting)'}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  >
                    <option value="Senior Stitching Master (Blouses & Bodice Fitting)">Senior Stitching Master (Blouses & Bodice Fitting)</option>
                    <option value="Adda Zardozi, Marodi & Antique Dabka Ustad">Adda Zardozi, Marodi & Antique Dabka Ustad</option>
                    <option value="Women Master 1 (Lehenga Panel Flare & Cancan Tailoring)">Women Master 1 (Lehenga Panel Flare & Cancan Tailoring)</option>
                    <option value="Precision Khaka Tracing & Base Fabric Master Cutter">Precision Khaka Tracing & Base Fabric Master Cutter</option>
                    <option value="First QC Tape Inspector & Dart Correction Specialist">First QC Tape Inspector & Dart Correction Specialist</option>
                    <option value="Steam Pressing, Hooks, Dori Latkans & Final Packaging">Steam Pressing, Hooks, Dori Latkans & Final Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Workshop Unit / Location
                  </label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    placeholder="e.g. Central Atelier - Floor 1"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Skill Grade / Level
                  </label>
                  <select
                    value={formData.skillGrade || 'Grade A+ (Master Artisan)'}
                    onChange={(e) => handleChange('skillGrade', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  >
                    <option value="Ustad Karigar (30 Yrs Exp)">Ustad Karigar (30 Yrs Exp)</option>
                    <option value="Grade A+ (Master Artisan)">Grade A+ (Master Artisan)</option>
                    <option value="Grade A (Senior Artisan)">Grade A (Senior Artisan)</option>
                    <option value="Grade B (Skilled Artisan)">Grade B (Skilled Artisan)</option>
                    <option value="Senior QC Inspector">Senior QC Inspector</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Daily Capacity / Output Remark
                  </label>
                  <input
                    type="text"
                    value={formData.dailyCapacity || ''}
                    onChange={(e) => handleChange('dailyCapacity', e.target.value)}
                    placeholder="e.g. 2 Blouses or 1 Lehenga / Day"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>
              </>
            )}

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8DFD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B172E] hover:bg-[#431021] shadow-xs hover:shadow transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};