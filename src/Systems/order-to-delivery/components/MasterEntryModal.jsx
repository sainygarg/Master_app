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
        });
      } else if (type === 'vendor') {
        setFormData({
          id: nextId || `VND-${Date.now().toString().slice(-3)}`,
          name: '',
          contactPerson: '',
          phone: '',
          address: '',
          gstNo: '',
        });
      } else if (type === 'transporter') {
        setFormData({
          id: nextId || `TRN-${Date.now().toString().slice(-3)}`,
          name: '',
          contactPerson: '',
          phone: ''
        });
      } else if (type === 'karigar') {
        setFormData({
          id: nextId || `KRG-${Date.now().toString().slice(-3)}`,
          name: '',
          phone: '',
          status: 'Active (On Duty)'
        });
      } else if (type === 'department') {
        setFormData({
          id: nextId || `DEPT-${Date.now().toString().slice(-3)}`,
          name: '',
          code: '',
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