import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { STAGES } from '../types/stages';
import { fetchDepartmentNames } from '../../../core/services/departmentService';
import supabase from '../../../core/config/supabaseClient';

export const MasterEntryModal = ({
  isOpen,
  onClose,
  type, // 'customer' | 'vendor' | 'transporter' | 'karigar' | 'department' | 'tat'
  initialData = null,
  onSubmit,
  nextId,
  users = []
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [imageUploadMode, setImageUploadMode] = useState('upload'); // 'upload' | 'url'
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);
  const pendingFilesRef = useRef(new Map()); // blobUrl -> File

  const clearPendingFiles = () => {
    pendingFilesRef.current.forEach((_, blobUrl) => {
      try { URL.revokeObjectURL(blobUrl); } catch {}
    });
    pendingFilesRef.current.clear();
  };

  // Department choices come from the database (Master Hub departments)
  useEffect(() => {
    if (type !== 'tat') return;
    fetchDepartmentNames().then(setDepartmentOptions).catch(() => setDepartmentOptions([]));
  }, [type, isOpen]);

  useEffect(() => {
    clearPendingFiles();
    setUrlInput('');
    if (initialData) {
      if (type === 'design') {
        const initImages = Array.isArray(initialData.images) && initialData.images.length > 0
          ? initialData.images.filter(Boolean)
          : (initialData.imageUrl ? [initialData.imageUrl] : []);
        setFormData({
          ...initialData,
          images: initImages,
          imageUrl: initImages[0] || ''
        });
      } else {
        setFormData({ ...initialData });
      }
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
      } else if (type === 'design') {
        setFormData({
          id: nextId || `DSN-${Date.now().toString().slice(-3)}`,
          name: '',
          sku: '',
          category: 'Couture',
          type: '',
          color: '',
          description: '',
          imageUrl: '',
          images: []
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
          moduleName: 'Order to Delivery',
          stageName: STAGES[0]?.name || 'Material Check',
          stageId: STAGES[0]?.id,
          stageIndex: 1,
          tatType: 'Days', // 'Days' | 'Hours' | 'Minutes'
          timeValue: 2,
          assignedPerson: '',
          assignedPersonId: '',
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

  const addDesignImages = (newUrls = []) => {
    const clean = newUrls.map((u) => String(u || '').trim()).filter(Boolean);
    if (clean.length === 0) return;
    setFormData((prev) => {
      const existing = Array.isArray(prev.images)
        ? prev.images
        : (prev.imageUrl ? [prev.imageUrl] : []);
      const merged = [...existing];
      clean.forEach((u) => {
        if (!merged.includes(u)) merged.push(u);
      });
      return {
        ...prev,
        images: merged,
        imageUrl: merged[0] || ''
      };
    });
  };

  const removeDesignImage = (indexToRemove) => {
    setFormData((prev) => {
      const existing = Array.isArray(prev.images)
        ? prev.images
        : (prev.imageUrl ? [prev.imageUrl] : []);
      const removedUrl = existing[indexToRemove];
      if (removedUrl && pendingFilesRef.current.has(removedUrl)) {
        try { URL.revokeObjectURL(removedUrl); } catch {}
        pendingFilesRef.current.delete(removedUrl);
      }
      const next = existing.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: next,
        imageUrl: next[0] || ''
      };
    });
  };

  const setPrimaryDesignImage = (indexToPromote) => {
    setFormData((prev) => {
      const existing = Array.isArray(prev.images)
        ? [...prev.images]
        : (prev.imageUrl ? [prev.imageUrl] : []);
      if (indexToPromote <= 0 || indexToPromote >= existing.length) return prev;
      const [chosen] = existing.splice(indexToPromote, 1);
      const next = [chosen, ...existing];
      return {
        ...prev,
        images: next,
        imageUrl: next[0] || ''
      };
    });
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const newErrors = {};

    if (type === 'tat') {
      if (!formData.moduleName?.trim()) {
        newErrors.moduleName = 'Module Name is required';
      }
      if (!formData.stageName?.trim()) {
        newErrors.stageName = 'Stage Name is required';
      }
      if (formData.timeValue === undefined || formData.timeValue === '' || Number(formData.timeValue) <= 0) {
        newErrors.timeValue = 'Valid time value is required';
      }
      if (!formData.assignedPerson?.trim()) {
        newErrors.assignedPerson = 'Assigned Person is required';
      }
    } else {
      if (!formData.name?.trim()) {
        newErrors.name = 'Name is required';
      }
      if (type !== 'department' && type !== 'design' && !formData.phone?.trim()) {
        newErrors.phone = 'Contact phone is required';
      }
      if (type === 'design' && !formData.sku?.trim()) {
        newErrors.sku = 'SKU code is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      let payloadToSave = formData;
      if (type === 'design') {
        const currentImages = Array.isArray(formData.images)
          ? formData.images
          : (formData.imageUrl ? [formData.imageUrl] : []);
        const hasPending = currentImages.some((u) => pendingFilesRef.current.has(u));
        if (hasPending) {
          setIsUploadingImage(true);
          try {
            const createWebpThumbnail = (file, maxSize = 240) =>
              new Promise((resolve) => {
                const img = new Image();
                const objUrl = URL.createObjectURL(file);
                img.onload = () => {
                  try {
                    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                    const w = Math.max(1, Math.round(img.width * scale));
                    const h = Math.max(1, Math.round(img.height * scale));
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob((blob) => {
                      URL.revokeObjectURL(objUrl);
                      resolve(blob || null);
                    }, 'image/webp', 0.78);
                  } catch {
                    URL.revokeObjectURL(objUrl);
                    resolve(null);
                  }
                };
                img.onerror = () => {
                  URL.revokeObjectURL(objUrl);
                  resolve(null);
                };
                img.src = objUrl;
              });

            let generatedThumbUrl = formData.thumbUrl || '';
            const resolvedImages = await Promise.all(
              currentImages.map(async (url, idx) => {
                const file = pendingFilesRef.current.get(url);
                if (!file) return url;
                try {
                  const cleanName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                  const { error: upErr } = await supabase.storage.from('designs').upload(cleanName, file, {
                    contentType: file.type || 'image/jpeg',
                    cacheControl: '31536000',
                    upsert: true
                  });
                  if (upErr) throw upErr;
                  const { data: pubData } = supabase.storage.from('designs').getPublicUrl(cleanName);

                  // Generate & upload lightweight WebP thumbnail for the primary image
                  if (idx === 0) {
                    const thumbBlob = await createWebpThumbnail(file, 240);
                    if (thumbBlob) {
                      const thumbPath = `thumbs/thumb-${cleanName.replace(/\.[^.]+$/, '')}.webp`;
                      const { error: tErr } = await supabase.storage.from('designs').upload(thumbPath, thumbBlob, {
                        contentType: 'image/webp',
                        cacheControl: '31536000',
                        upsert: true
                      });
                      if (!tErr) {
                        const { data: tPub } = supabase.storage.from('designs').getPublicUrl(thumbPath);
                        generatedThumbUrl = tPub.publicUrl;
                      }
                    }
                  }

                  return pubData.publicUrl;
                } catch (err) {
                  console.error('Failed uploading to Supabase bucket:', err);
                  return await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target?.result || '');
                    reader.onerror = () => resolve('');
                    reader.readAsDataURL(file);
                  });
                }
              })
            );
            const cleanResolved = resolvedImages.filter(Boolean);
            payloadToSave = {
              ...formData,
              images: cleanResolved,
              imageUrl: cleanResolved[0] || '',
              thumbUrl: generatedThumbUrl || cleanResolved[0] || ''
            };
          } finally {
            setIsUploadingImage(false);
          }
        }
      }

      const ok = await onSubmit(payloadToSave);
      if (ok !== false) {
        clearPendingFiles();
        onClose(); // keep the form open (data intact) if the save failed
      }
    } finally {
      setSubmitting(false);
    }
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
      case 'design': return `${action} Design Catalog & SKU`;
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
      case 'design': return <Sparkles className="w-5 h-5 text-[#C5A059]" />;
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
            
            {/* NAME FIELD (FOR CUSTOMER, VENDOR, TRANSPORTER, KARIGAR, DEPARTMENT, DESIGN) */}
            {type !== 'tat' && (
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">
                  {type === 'customer' ? 'Customer Full Name' :
                   type === 'vendor' ? 'Vendor / Business Firm Name' :
                   type === 'department' ? 'Department Name' :
                   type === 'transporter' ? 'Courier / Logistics Company Name' :
                   type === 'design' ? 'Name of Design' :
                   'Karigar / Artisan Master Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={type === 'design' ? 'e.g. Royal Maroon Velvet Lehenga' : 'Enter name...'}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                    errors.name ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>
            )}

            {/* PHONE FIELD (FOR CUSTOMER, VENDOR, TRANSPORTER, KARIGAR) */}
            {type !== 'department' && type !== 'tat' && type !== 'design' && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Contact Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Mobile number"
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
                    placeholder="City"
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
                    placeholder="Contact person"
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
                {/* 1. Module Name (Strictly Order to Delivery) */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Module Name <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value="Order to Delivery"
                    disabled
                    className="w-full px-3 py-2 text-sm bg-stone-100 text-stone-800 border border-[#DECDB8] rounded-lg cursor-not-allowed focus:outline-none"
                  >
                    <option value="Order to Delivery">Order to Delivery</option>
                  </select>
                </div>

                {/* 2. Stage Name */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Stage Name <span className="text-rose-500">*</span>
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
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.stageName && <p className="text-[11px] text-rose-500 mt-1">{errors.stageName}</p>}
                </div>

                {/* 3. TAT Type (Days, Hours, Minutes) */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    TAT Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.tatType || 'Days'}
                    onChange={(e) => handleChange('tatType', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  >
                    <option value="Days">Days</option>
                    <option value="Hours">Hours</option>
                    <option value="Minutes">Minutes</option>
                  </select>
                </div>

                {/* 4. Time Value */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Time Value ({formData.tatType || 'Days'}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.timeValue ?? 2}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1;
                      handleChange('timeValue', val);
                      // Backward compatibility helper
                      if ((formData.tatType || 'Days') === 'Days') {
                        handleChange('standardDays', val);
                      } else if (formData.tatType === 'Hours') {
                        handleChange('standardHours', val);
                      }
                    }}
                    placeholder="Enter duration..."
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                      errors.timeValue ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                    }`}
                  />
                  {errors.timeValue && <p className="text-[11px] text-rose-500 mt-1">{errors.timeValue}</p>}
                </div>

                {/* 5. Assigned Person */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Assign Person <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.assignedPerson || ''}
                    onChange={(e) => {
                      const selectedUser = users.find(u => u.name === e.target.value || u.username === e.target.value);
                      handleChange('assignedPerson', e.target.value);
                      if (selectedUser) {
                        handleChange('assignedPersonId', selectedUser.id);
                      }
                    }}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                      errors.assignedPerson ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                    }`}
                  >
                    <option value="">Select person responsible for this stage</option>
                    {formData.assignedPerson && !users.some(u => u.name === formData.assignedPerson || u.username === formData.assignedPerson) && (
                      <option value={formData.assignedPerson}>{formData.assignedPerson}</option>
                    )}
                    {users.map((u) => (
                      <option key={u.id} value={u.name || u.username}>
                        {u.name || u.username} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.assignedPerson && <p className="text-[11px] text-rose-500 mt-1">{errors.assignedPerson}</p>}
                </div>

                {/* 6. Remarks / Notes (Optional) */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    SLA Guidelines &amp; Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="SLA escalation rules, handover notes..."
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
                    placeholder="Contact person"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>
              </>
            )}

            {/* TYPE SPECIFIC FIELDS: DESIGN */}
            {type === 'design' && (
              <>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    SKU Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="e.g. SKU-101, LHG-001"
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                      errors.sku ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                    }`}
                  />
                  {errors.sku && <p className="text-[11px] text-rose-500 mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                    placeholder="e.g. Western Wear, Ethnic Wear, Couture"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Type / Silhouette
                  </label>
                  <input
                    type="text"
                    value={formData.type || ''}
                    onChange={(e) => handleChange('type', e.target.value)}
                    placeholder="e.g. Sleeveless, Fit & Flare, Full Sleeves"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="e.g. Black, Electric Blue, Ivory"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                  />
                </div>

                {/* DESIGN IMAGE SELECTION: MULTIPLE LOCAL DEVICE FILES OR URLS */}
                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-stone-700 text-xs">
                      Design Images <span className="text-stone-400 font-normal">({(formData.images || []).length} added)</span>
                    </label>
                    <div className="flex items-center gap-1 bg-[#FAF5EE] p-0.5 rounded-lg border border-[#DECDB8] text-[11px]">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('upload')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                          imageUploadMode === 'upload'
                            ? 'bg-[#5B172E] text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Local File / Device
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('url')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                          imageUploadMode === 'url'
                            ? 'bg-[#5B172E] text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Direct URL / Link
                      </button>
                    </div>
                  </div>

                  {imageUploadMode === 'upload' ? (
                    <div>
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
                          e.target.value = '';
                          if (files.length === 0) return;

                          const previewUrls = files.map((file) => {
                            const previewUrl = URL.createObjectURL(file);
                            pendingFilesRef.current.set(previewUrl, file);
                            return previewUrl;
                          });
                          addDesignImages(previewUrls);
                        }}
                      />
                      <button
                        type="button"
                        disabled={submitting || isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#DECDB8] hover:border-[#5B172E] rounded-xl bg-[#FAF8F5] text-stone-600 hover:text-[#5B172E] transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#C5A059]" />
                        <span>
                          {isUploadingImage
                            ? 'Uploading photos to Supabase Storage...'
                            : 'Select photos from device (uploads on Save)'}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (urlInput.trim()) {
                                addDesignImages([urlInput.trim()]);
                                setUrlInput('');
                              }
                            }
                          }}
                          placeholder="https://... or /designs/SKU.jpg"
                          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!urlInput.trim()) return;
                          addDesignImages([urlInput.trim()]);
                          setUrlInput('');
                        }}
                        className="px-3 py-2 rounded-lg bg-[#5B172E] text-white text-xs font-semibold hover:bg-[#431021] transition-colors shrink-0 cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  )}

                  {/* Multi-Image Preview Grid */}
                  {Array.isArray(formData.images) && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={`${imgUrl}-${idx}`}
                          className={`relative group aspect-square rounded-xl overflow-hidden border bg-stone-100 ${
                            idx === 0 ? 'border-[#5B172E] ring-2 ring-[#5B172E]/20' : 'border-[#DECDB8]'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Design ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.opacity = '0.35'; }}
                          />
                          {idx === 0 ? (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#5B172E]/90 text-white text-[9px] font-bold">
                              Primary
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPrimaryDesignImage(idx)}
                              className="opacity-0 group-hover:opacity-100 absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-semibold transition-opacity cursor-pointer"
                              title="Set as primary image"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeDesignImage(idx)}
                            className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 shadow hover:bg-rose-700 cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Description / Specifications
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Detailed design description, fabric type, handwork elements..."
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
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B172E] hover:bg-[#431021] shadow-xs hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving…' : initialData ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};