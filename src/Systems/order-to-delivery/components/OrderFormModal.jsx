import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Trash2,
  Camera,
  Sparkles,
  Ruler,
  Check,
  Image as ImageIcon,
  ArrowRight,
  ChevronDown,
  PlusCircle,
  Layers,
  Eye,
  ZoomIn
} from 'lucide-react';
import { STAGES, UPPER_BODY_MEASUREMENTS, LOWER_BODY_MEASUREMENTS } from '../types/stages';
import { uploadOrderImage } from '../utils/imageUploadService';
import { fetchMasters, getCachedMasters } from '../utils/masterDirectoryService';
import { useToastAlert } from '../../../core/context/ToastAlertContext';

export const OrderFormModal = ({ isOpen, onClose, onSubmitOrder, nextOrderId }) => {
  const { showToast } = useToastAlert();
  if (!isOpen) return null;

  // Helper to compute consecutive IDs: e.g. SG-1008, SG-1009, SG-1010
  const getOrderIdForIndex = (baseId, index) => {
    const match = String(baseId || '').match(/SG-(\d+)/);
    if (!match) return `SG-${1000 + index}`;
    const baseNum = parseInt(match[1], 10);
    return `SG-${baseNum + index}`;
  };

  // Default empty measurements
  const defaultUpper = UPPER_BODY_MEASUREMENTS.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {});
  const defaultLower = LOWER_BODY_MEASUREMENTS.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {});

  // Template generator for each item card
  const createNewItem = (index, prefillSource = null) => {
    return {
      uid: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      // Common Client Details - prefilled from previous item if available
      clientName: prefillSource?.clientName || '',
      mobile: prefillSource?.mobile || '',
      city: prefillSource?.city || '',
      // Dates - prefilled from previous item
      trialDate: prefillSource?.trialDate || '',
      deliveryDate: prefillSource?.deliveryDate || '',
      // Garment Design Info
      designName: prefillSource?.designName || '',
      skuCode: prefillSource?.skuCode || '',
      description: prefillSource?.description || '',
      note: '',
      size: prefillSource?.size || '',
      deliveryType: prefillSource?.deliveryType || 'Production',
      embroidery: prefillSource?.embroidery || 'Yes',
      catalogImageUrl: prefillSource?.catalogImageUrl || null,
      designImages: prefillSource?.designImages ? [...prefillSource.designImages] : [],
      inspirationImages: prefillSource?.inspirationImages ? [...prefillSource.inspirationImages] : [],
      // Measurement Chart - prefilled from previous item
      hasUpper: prefillSource ? prefillSource.hasUpper : true,
      hasLower: prefillSource ? prefillSource.hasLower : true,
      upperMeasurements: prefillSource ? { ...prefillSource.upperMeasurements } : { ...defaultUpper },
      lowerMeasurements: prefillSource ? { ...prefillSource.lowerMeasurements } : { ...defaultLower },
    };
  };

  // State: Array of order items (each will become its own order)
  const [items, setItems] = useState(() => [createNewItem(0)]);

  // Design Master Options (with SKU & Description)
  const [designOptions, setDesignOptions] = useState(() => getCachedMasters('design') || []);
  useEffect(() => {
    fetchMasters('design').then((data) => {
      if (Array.isArray(data)) setDesignOptions(data);
    }).catch(() => {});
  }, []);

  // Validation errors map: { [itemUid]: { clientName: '...', ... } }
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const pendingFilesRef = useRef(new Map()); // blobUrl -> File

  // Active design search dropdown state per item UID
  const [activeSearchUid, setActiveSearchUid] = useState(null);

  // Full-size image preview modal state: { url: string, title?: string } | null
  const [previewModalImage, setPreviewModalImage] = useState(null);

  // Select design from dropdown: auto-prefills Name, SKU, Description, and swaps the catalog image
  const handleSelectDesign = (uid, selectedDesign) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item;

        // Strip previous catalog image from designImages if present
        const currentImgs = Array.isArray(item.designImages) ? [...item.designImages] : [];
        const filteredImgs = item.catalogImageUrl
          ? currentImgs.filter((img) => img !== item.catalogImageUrl)
          : currentImgs;

        const catalogImgs = Array.isArray(selectedDesign.images) && selectedDesign.images.length > 0
          ? selectedDesign.images.filter(Boolean)
          : (selectedDesign.imageUrl ? [selectedDesign.imageUrl] : []);
        const newCatalogImg = catalogImgs[0] || null;
        let finalImages = filteredImgs;

        catalogImgs.forEach((img) => {
          if (!finalImages.includes(img)) {
            finalImages = [...finalImages, img];
          }
        });

        return {
          ...item,
          designName: selectedDesign.name || item.designName,
          skuCode: selectedDesign.sku || item.skuCode,
          description: selectedDesign.description || item.description,
          catalogImageUrl: newCatalogImg,
          designImages: finalImages
        };
      })
    );

    setActiveSearchUid(null);
  };

  // Field update handler for a specific item
  const updateItemField = (uid, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item;

        // If user clears the design name completely, also clean up the associated catalog image
        if (field === 'designName' && (!value || value.trim() === '')) {
          const currentImgs = Array.isArray(item.designImages) ? item.designImages : [];
          const cleanedImgs = item.catalogImageUrl
            ? currentImgs.filter((img) => img !== item.catalogImageUrl)
            : currentImgs;

          return {
            ...item,
            designName: '',
            skuCode: '',
            catalogImageUrl: null,
            designImages: cleanedImgs
          };
        }

        return { ...item, [field]: value };
      })
    );
    // Clear error on edit
    if (errors[uid]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [uid]: {
          ...prev[uid],
          [field]: null
        }
      }));
    }
  };

  // Measurement update helpers
  const updateUpperMeasurement = (uid, key, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item;
        return {
          ...item,
          upperMeasurements: {
            ...item.upperMeasurements,
            [key]: value
          }
        };
      })
    );
  };

  const updateLowerMeasurement = (uid, key, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.uid !== uid) return item;
        return {
          ...item,
          lowerMeasurements: {
            ...item.lowerMeasurements,
            [key]: value
          }
        };
      })
    );
  };

  // Add another garment div with prefilled data from the previous div
  const handleAddItem = (fromIndex = null) => {
    const sourceIndex = fromIndex !== null ? fromIndex : items.length - 1;
    const sourceItem = items[sourceIndex] || items[0];
    const newItem = createNewItem(items.length, sourceItem);
    setItems((prev) => [...prev, newItem]);
  };

  // Remove an item
  const handleRemoveItem = (uid) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.uid !== uid));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  };

  // Image Selection (instant local preview; uploads to Supabase only on Submit)
  const handleImageUpload = (e, uid, type) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;

    const previewUrls = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      pendingFilesRef.current.set(previewUrl, file);
      return previewUrl;
    });

    setItems((prev) =>
      prev.map((it) => {
        if (it.uid !== uid) return it;
        if (type === 'design') {
          return { ...it, designImages: [...it.designImages, ...previewUrls] };
        } else {
          return { ...it, inspirationImages: [...it.inspirationImages, ...previewUrls] };
        }
      })
    );
  };

  const removeImage = (uid, index, type) => {
    setItems((prev) => {
      const targetItem = prev.find((it) => it.uid === uid);
      const removedUrl = targetItem
        ? (type === 'design' ? targetItem.designImages[index] : targetItem.inspirationImages[index])
        : null;

      const nextItems = prev.map((it) => {
        if (it.uid !== uid) return it;
        if (type === 'design') {
          return { ...it, designImages: it.designImages.filter((_, i) => i !== index) };
        } else {
          return { ...it, inspirationImages: it.inspirationImages.filter((_, i) => i !== index) };
        }
      });

      if (removedUrl && pendingFilesRef.current.has(removedUrl)) {
        const stillReferenced = nextItems.some(
          (it) => it.designImages.includes(removedUrl) || it.inspirationImages.includes(removedUrl)
        );
        if (!stillReferenced) {
          try { URL.revokeObjectURL(removedUrl); } catch {}
          pendingFilesRef.current.delete(removedUrl);
        }
      }
      return nextItems;
    });
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (uploadingCount > 0) {
      alert('Please wait for photos to finish uploading.');
      return;
    }

    // Validate every item
    const newErrors = {};
    let hasError = false;
    const missingFieldsSet = new Set();

    items.forEach((item, idx) => {
      const itemErrs = {};
      if (!item.clientName?.trim()) {
        itemErrs.clientName = 'Client name is required';
        missingFieldsSet.add('Client Name');
      }
      if (!item.mobile?.trim()) {
        itemErrs.mobile = 'Mobile number is required';
        missingFieldsSet.add('Mobile Number');
      }
      if (!item.designName?.trim()) {
        itemErrs.designName = 'Design name is required';
        missingFieldsSet.add('Design Name');
      }
      if (!item.deliveryDate) {
        itemErrs.deliveryDate = 'Delivery date is required';
        missingFieldsSet.add('Date of Delivery');
      }

      if (Object.keys(itemErrs).length > 0) {
        newErrors[item.uid] = itemErrs;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      const missingList = Array.from(missingFieldsSet).join(', ');
      showToast(`Please fill in all required fields: ${missingList}`, 'error');
      return;
    }

    // Build order payload for each item
    const payload = items.map((item, index) => {
      const assignedId = getOrderIdForIndex(nextOrderId, index);
      return {
        id: assignedId,
        clientName: item.clientName.trim(),
        mobile: item.mobile.trim(),
        city: (item.city || '').trim(),
        designName: item.designName.trim(),
        skuCode: (item.skuCode || '').trim(),
        description: (item.description || '').trim(),
        note: (item.note || '').trim(),
        size: item.size || '',
        deliveryDate: item.deliveryDate,
        trialDate: item.trialDate,
        deliveryType: item.deliveryType || 'Production',
        embroidery: item.embroidery || 'Yes',
        createdAt: new Date().toISOString(),
        currentStageId: item.deliveryType === 'In Stock' ? 'alteration' : STAGES[0].id,
        currentStageIndex: item.deliveryType === 'In Stock'
          ? Math.max(0, STAGES.findIndex((s) => s.id === 'alteration'))
          : 0,
        designImages: item.designImages || [],
        inspirationImages: item.inspirationImages || [],
        measurements: {
          hasUpper: item.hasUpper,
          hasLower: item.hasLower,
          upper: item.hasUpper ? item.upperMeasurements : {},
          lower: item.hasLower ? item.lowerMeasurements : {}
        },
        stageData: item.deliveryType === 'In Stock' ? {
          alteration: {
            alterationType: 'Fitting / Size Adjust',
            alterationDoneBy: '',
            targetCompletionDate: '',
            status: 'In Alteration',
            remarks: 'In Stock order fast-tracked directly to Alteration stage.'
          }
        } : {
          [STAGES[0].id]: {
            dyeStatus: '',
            materialReadyDate: '',
            remarks: ''
          }
        },
        history: [
          {
            stageId: item.deliveryType === 'In Stock' ? 'alteration' : STAGES[0].id,
            stageName: item.deliveryType === 'In Stock' ? 'Alteration' : STAGES[0].name,
            timestamp: new Date().toISOString(),
            action: item.deliveryType === 'In Stock' ? 'In-Stock Fast-Track Order Created' : 'Order Placed & Created',
            actor: localStorage.getItem('user-name') || '',
            notes: item.deliveryType === 'In Stock'
              ? 'Fast-Track In Stock: Skipped manufacturing stages, routed directly to Alteration stage.'
              : `Assigned to ${STAGES[0].name} stage automatically.`
          }
        ]
      };
    });

    setSubmitting(true);
    try {
      // Upload any pending local device files to Supabase only on Submit
      const urlToOrderId = new Map();
      items.forEach((item, index) => {
        const assignedId = getOrderIdForIndex(nextOrderId, index);
        [...(item.designImages || []), ...(item.inspirationImages || [])].forEach((u) => {
          if (pendingFilesRef.current.has(u) && !urlToOrderId.has(u)) {
            urlToOrderId.set(u, assignedId);
          }
        });
      });

      const resolvedUrlMap = new Map();
      if (urlToOrderId.size > 0) {
        setUploadingCount(urlToOrderId.size);
        try {
          await Promise.all(
            Array.from(urlToOrderId.entries()).map(async ([blobUrl, orderId]) => {
              const file = pendingFilesRef.current.get(blobUrl);
              if (!file) return;
              const uploadedUrl = await uploadOrderImage(file, orderId || 'drafts');
              resolvedUrlMap.set(blobUrl, uploadedUrl);
            })
          );
        } finally {
          setUploadingCount(0);
        }
      }

      const finalPayload = payload.map((orderObj) => ({
        ...orderObj,
        designImages: (orderObj.designImages || []).map((u) => resolvedUrlMap.get(u) || u),
        inspirationImages: (orderObj.inspirationImages || []).map((u) => resolvedUrlMap.get(u) || u),
      }));

      const ok = await onSubmitOrder(finalPayload);
      if (ok !== false) {
        pendingFilesRef.current.forEach((_, blobUrl) => {
          try { URL.revokeObjectURL(blobUrl); } catch {}
        });
        pendingFilesRef.current.clear();
        onClose();
      }
    } catch (err) {
      console.error('Failed to upload order images on submit:', err);
      showToast('Could not upload photo: ' + (err.message || 'unknown error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const firstId = getOrderIdForIndex(nextOrderId, 0);
  const lastId = getOrderIdForIndex(nextOrderId, items.length - 1);
  const headerIdText = items.length === 1 ? firstId : `${firstId} – ${lastId} (${items.length} Orders)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E2D5C3] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD3] flex items-center justify-between sticky top-0 z-20">
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
                  {headerIdText}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Sainy Garg Couture • Client Specifications &amp; Multi-Garment Measurement Chart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body with Item Blocks */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {items.map((item, index) => {
            const itemOrderId = getOrderIdForIndex(nextOrderId, index);
            const itemErrs = errors[item.uid] || {};

            return (
              <div
                key={item.uid}
                className="bg-white rounded-2xl p-5 border-2 border-[#E8DFD3] shadow-sm space-y-6 relative transition-all"
              >
                {/* Item Card Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0E6D8] gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-[#5B172E] text-white flex items-center justify-center text-xs font-bold font-sans shadow-xs">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-[#5B172E] text-base">
                          Garment / Order #{index + 1}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8]">
                          {itemOrderId}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        {index === 0 ? 'Primary Client Order' : `Additional Garment for ${item.clientName || 'Same Client'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Delete button (if more than 1 item) */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.uid)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Remove this garment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* SECTION 1: Client & Design Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-[#431021] text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#9B783E]" />
                      Order &amp; Client Details
                    </h4>
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
                        value={item.clientName}
                        onChange={(e) => updateItemField(item.uid, 'clientName', e.target.value)}
                        placeholder="Client full name"
                        className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                          itemErrs.clientName ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                        }`}
                      />
                      {itemErrs.clientName && <p className="text-[11px] text-rose-500 mt-1">{itemErrs.clientName}</p>}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        2. Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.mobile}
                        onChange={(e) => updateItemField(item.uid, 'mobile', e.target.value)}
                        placeholder="Mobile number"
                        className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                          itemErrs.mobile ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                        }`}
                      />
                      {itemErrs.mobile && <p className="text-[11px] text-rose-500 mt-1">{itemErrs.mobile}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        3. City
                      </label>
                      <input
                        type="text"
                        value={item.city}
                        onChange={(e) => updateItemField(item.uid, 'city', e.target.value)}
                        placeholder="City"
                        className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                      />
                    </div>

                    {/* Name Of Design & SKU (Interactive Search & Autocomplete) */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-stone-700">
                          4. Name Of Design <span className="text-rose-500">*</span>
                        </label>
                        {designOptions.length > 0 && (
                          <span className="text-[10px] text-stone-400">
                            Search catalog designs or type custom
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={item.designName}
                          onFocus={() => setActiveSearchUid(item.uid)}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateItemField(item.uid, 'designName', val);
                            setActiveSearchUid(item.uid);

                            // Exact match check
                            const matched = designOptions.find(
                              (d) =>
                                d.name?.toLowerCase() === val.toLowerCase() ||
                                d.sku?.toLowerCase() === val.toLowerCase()
                            );
                            if (matched) {
                              handleSelectDesign(item.uid, matched);
                            }
                          }}
                          placeholder="Search from 92 designs by name or SKU..."
                          className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                            itemErrs.designName ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                          }`}
                        />

                        {/* Interactive Dropdown Results with Image Previews */}
                        {activeSearchUid === item.uid && (
                          <>
                            {/* Backdrop to close dropdown on outside click */}
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveSearchUid(null)}
                            />

                            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-64 overflow-y-auto bg-white border border-[#DECDB8] rounded-xl shadow-xl divide-y divide-[#F2EAE1] animate-in fade-in duration-150">
                              {(() => {
                                const q = (item.designName || '').toLowerCase().trim();
                                const filtered = designOptions.filter(
                                  (d) =>
                                    !q ||
                                    d.name?.toLowerCase().includes(q) ||
                                    d.sku?.toLowerCase().includes(q) ||
                                    d.category?.toLowerCase().includes(q) ||
                                    d.type?.toLowerCase().includes(q)
                                );

                                if (filtered.length === 0) {
                                  return (
                                    <div className="p-3 text-xs text-stone-500 text-center">
                                      No catalog design matching "{item.designName}". Custom name will be kept.
                                    </div>
                                  );
                                }

                                return filtered.map((d) => {
                                  const img = d.imageUrl || d.images?.[0];
                                  return (
                                    <div
                                      key={d.id || d.sku}
                                      onClick={() => handleSelectDesign(item.uid, d)}
                                      className="flex items-center gap-3 p-2.5 hover:bg-[#FAF5EE] cursor-pointer transition-colors"
                                    >
                                      {/* Thumbnail Image */}
                                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 border border-[#DECDB8] shrink-0 flex items-center justify-center">
                                        {img ? (
                                          <img
                                            src={img}
                                            alt={d.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              if (e.currentTarget.parentElement) {
                                                e.currentTarget.parentElement.innerHTML = '<span class="text-[8px] font-bold text-stone-400">NO IMG</span>';
                                              }
                                            }}
                                          />
                                        ) : (
                                          <Sparkles className="w-4 h-4 text-[#C5A059]" />
                                        )}
                                      </div>

                                      {/* Info */}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="font-bold text-xs text-stone-900 truncate">
                                            {d.name}
                                          </div>
                                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF5EE] text-[#5B172E] border border-[#DECDB8] shrink-0">
                                            {d.sku}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                                          <span>{d.category || 'Couture'}</span>
                                          {d.type && <span>• {d.type}</span>}
                                          {d.color && <span>• {d.color}</span>}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </>
                        )}
                      </div>
                      {itemErrs.designName && <p className="text-[11px] text-rose-500 mt-1">{itemErrs.designName}</p>}
                    </div>

                    {/* SKU Code */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        SKU Code
                      </label>
                      <input
                        type="text"
                        value={item.skuCode}
                        onChange={(e) => updateItemField(item.uid, 'skuCode', e.target.value)}
                        placeholder="e.g. SKU-101 / DSN-001"
                        className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Design Description &amp; Specifications
                      </label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => updateItemField(item.uid, 'description', e.target.value)}
                        placeholder="Enter design details, fabric specifics, craftsmanship notes..."
                        className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                      />
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        5. Size
                      </label>
                      <input
                        type="text"
                        value={item.size}
                        onChange={(e) => updateItemField(item.uid, 'size', e.target.value)}
                        placeholder="Size e.g. 32 / M"
                        className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                      />
                    </div>

                    {/* Date Of Trial */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        8. Date Of Trial <span className="text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={item.trialDate}
                        onChange={(e) => updateItemField(item.uid, 'trialDate', e.target.value)}
                        className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                          itemErrs.trialDate ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                        }`}
                      />
                      {itemErrs.trialDate && <p className="text-[11px] text-rose-500 mt-1">{itemErrs.trialDate}</p>}
                    </div>

                    {/* Date Of Delivery */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        7. Date Of Delivery <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={item.deliveryDate}
                        onChange={(e) => updateItemField(item.uid, 'deliveryDate', e.target.value)}
                        className={`w-full px-3 py-2 text-sm bg-[#FAF8F5] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 ${
                          itemErrs.deliveryDate ? 'border-rose-400 bg-rose-50/50' : 'border-[#DECDB8]'
                        }`}
                      />
                      {itemErrs.deliveryDate && <p className="text-[11px] text-rose-500 mt-1">{itemErrs.deliveryDate}</p>}
                    </div>

                    {/* Embroidery Type */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        9. Embroidery <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={item.embroidery}
                        onChange={(e) => updateItemField(item.uid, 'embroidery', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 cursor-pointer"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      {item.embroidery === 'No' && (
                        <p className="text-[11px] text-amber-700 mt-1">Embroidery stages will be skipped.</p>
                      )}
                    </div>

                    {/* Delivery / Order Flow Type */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        10. Delivery <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={item.deliveryType || 'Production'}
                        onChange={(e) => updateItemField(item.uid, 'deliveryType', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30 cursor-pointer font-medium"
                      >
                        <option value="Production">Production </option>
                        <option value="In Stock">In Stock </option>
                      </select>
                      {item.deliveryType === 'In Stock' ? (
                        <p className="text-[11px] text-violet-700 font-semibold mt-1">
                          ⚡ Skips all stages &rarr; opens directly in Alteration stage.
                        </p>
                      ) : (
                        <p className="text-[10px] text-stone-400 mt-1">
                          Normal production cycle (Material Check &rarr; Delivery).
                        </p>
                      )}
                    </div>
                  </div>

                  {itemErrs.images && <p className="text-[11px] text-rose-500 mt-2">{itemErrs.images}</p>}

                  {/* Images Upload Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#F0E6D8]">
                    {/* Design Images */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                        <span>6. Design Images (Multiples)</span>
                        <span className="text-[11px] text-stone-400">{(item.designImages || []).length} uploaded</span>
                      </label>
                      <div className="border-2 border-dashed border-[#DECDB8] hover:border-[#9B783E] rounded-xl p-3 bg-[#FAF8F5] transition-colors text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          id={`design-images-input-${item.uid}`}
                          onChange={(e) => handleImageUpload(e, item.uid, 'design', itemOrderId)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`design-images-input-${item.uid}`}
                          className="cursor-pointer flex flex-col items-center justify-center py-2 text-xs text-stone-600 hover:text-[#5B172E]"
                        >
                          <Upload className="w-5 h-5 text-[#9B783E] mb-1" />
                          <span className="font-semibold">Upload Design Sketches &amp; Photos</span>
                          <span className="text-[10px] text-stone-400">PNG, JPG, WebP supported</span>
                        </label>

                        {item.designImages?.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#DECDB8]">
                            {item.designImages.map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => setPreviewModalImage({ url: img, title: `${item.designName || 'Design Image'} (${idx + 1})` })}
                                className="relative group rounded-lg overflow-hidden h-16 border border-[#DECDB8] cursor-pointer hover:ring-2 hover:ring-[#5B172E]/40 transition-all bg-stone-100"
                                title="Click to view full image"
                              >
                                <img src={img} alt="Design preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-4 h-4 text-white drop-shadow" />
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(item.uid, idx, 'design');
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                                  title="Delete photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inspiration Images */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                        <span>9. Inspiration Images (Multiples)</span>
                        <span className="text-[11px] text-stone-400">{(item.inspirationImages || []).length} uploaded</span>
                      </label>
                      <div className="border-2 border-dashed border-[#DECDB8] hover:border-[#9B783E] rounded-xl p-3 bg-[#FAF8F5] transition-colors text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          id={`insp-images-input-${item.uid}`}
                          onChange={(e) => handleImageUpload(e, item.uid, 'inspiration', itemOrderId)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`insp-images-input-${item.uid}`}
                          className="cursor-pointer flex flex-col items-center justify-center py-2 text-xs text-stone-600 hover:text-[#5B172E]"
                        >
                          <ImageIcon className="w-5 h-5 text-[#9B783E] mb-1" />
                          <span className="font-semibold">Upload Reference &amp; Client Moodboard</span>
                          <span className="text-[10px] text-stone-400">Multiple files allowed</span>
                        </label>

                        {item.inspirationImages?.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#DECDB8]">
                            {item.inspirationImages.map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => setPreviewModalImage({ url: img, title: `Inspiration Image (${idx + 1})` })}
                                className="relative group rounded-lg overflow-hidden h-16 border border-[#DECDB8] cursor-pointer hover:ring-2 hover:ring-[#5B172E]/40 transition-all bg-stone-100"
                                title="Click to view full image"
                              >
                                <img src={img} alt="Inspiration preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-4 h-4 text-white drop-shadow" />
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(item.uid, idx, 'inspiration');
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                                  title="Delete photo"
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
                <div className="pt-4 border-t border-[#F0E6D8] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-[#5B172E] text-sm flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-[#9B783E]" />
                        Measurement Details (All in Inches)
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Select applicable measurement sections for this garment:
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateItemField(item.uid, 'hasUpper', !item.hasUpper)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          item.hasUpper
                            ? 'bg-[#5B172E] text-white border-[#5B172E]'
                            : 'bg-[#FAF8F5] text-stone-600 border-[#DECDB8]'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] ${item.hasUpper ? 'bg-white text-[#5B172E]' : 'border border-stone-400'}`}>
                          {item.hasUpper && '✓'}
                        </span>
                        1. Upper Body ({UPPER_BODY_MEASUREMENTS.length} pts)
                      </button>

                      <button
                        type="button"
                        onClick={() => updateItemField(item.uid, 'hasLower', !item.hasLower)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          item.hasLower
                            ? 'bg-[#5B172E] text-white border-[#5B172E]'
                            : 'bg-[#FAF8F5] text-stone-600 border-[#DECDB8]'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] ${item.hasLower ? 'bg-white text-[#5B172E]' : 'border border-stone-400'}`}>
                          {item.hasLower && '✓'}
                        </span>
                        2. Lower Body ({LOWER_BODY_MEASUREMENTS.length} pts)
                      </button>
                    </div>
                  </div>

                  {/* UPPER BODY MEASUREMENTS */}
                  {item.hasUpper && (
                    <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-[#DECDB8]">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-serif font-bold text-xs text-[#431021] flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5 text-[#9B783E]" />
                          Upper Body Measurements ({UPPER_BODY_MEASUREMENTS.length} Parameters)
                        </span>
                        <span className="text-[10px] text-[#9B783E] font-medium">Standard / Tailored Inches</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {UPPER_BODY_MEASUREMENTS.map((m, mIdx) => (
                          m.isDropdownWithSize ? (
                            <div key={m.id} className="bg-white p-2 rounded-lg border border-[#DECDB8]/80 shadow-2xs">
                              <label className="block text-[11px] font-semibold text-stone-600 truncate mb-1" title={m.label}>
                                {mIdx + 1}. {m.label}
                              </label>
                              <div className="flex items-center gap-1">
                                <select
                                  value={item.upperMeasurements[`${m.id}Type`] || m.options[0]}
                                  onChange={(e) => updateUpperMeasurement(item.uid, `${m.id}Type`, e.target.value)}
                                  className="w-[58%] min-w-0 px-1 py-1 text-[11px] font-semibold text-stone-700 bg-[#FAF8F5] border border-[#DECDB8] rounded focus:outline-none focus:ring-1 focus:ring-[#5B172E] truncate"
                                >
                                  {m.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                                <div className="relative w-[42%] shrink-0">
                                  <input
                                    type="text"
                                    value={item.upperMeasurements[m.id] || ''}
                                    onChange={(e) => updateUpperMeasurement(item.uid, m.id, e.target.value)}
                                    className="w-full pr-3 pl-1 py-1 text-xs font-bold text-stone-800 bg-[#FAF8F5] border border-[#DECDB8] rounded focus:outline-none focus:ring-1 focus:ring-[#5B172E] text-center"
                                  />
                                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">"</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={m.id} className="bg-white p-2 rounded-lg border border-[#DECDB8]/80 shadow-2xs">
                              <label className="block text-[11px] font-semibold text-stone-600 truncate mb-1" title={m.label}>
                                {mIdx + 1}. {m.label}
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={item.upperMeasurements[m.id] || ''}
                                  onChange={(e) => updateUpperMeasurement(item.uid, m.id, e.target.value)}
                                  className="w-full pr-5 pl-2 py-1 text-xs font-bold text-stone-800 bg-[#FAF8F5] border border-[#DECDB8] rounded focus:outline-none focus:ring-1 focus:ring-[#5B172E]"
                                />
                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">"</span>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LOWER BODY MEASUREMENTS */}
                  {item.hasLower && (
                    <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-[#DECDB8]">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-serif font-bold text-xs text-[#431021] flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5 text-[#9B783E]" />
                          Lower Body Measurements ({LOWER_BODY_MEASUREMENTS.length} Parameters)
                        </span>
                        <span className="text-[10px] text-[#9B783E] font-medium">Standard / Tailored Inches</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {LOWER_BODY_MEASUREMENTS.map((m, mIdx) => (
                          <div key={m.id} className="bg-white p-2 rounded-lg border border-[#DECDB8]/80 shadow-2xs">
                            <label className="block text-[11px] font-semibold text-stone-600 truncate mb-1">
                              {mIdx + 1}. {m.label}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={item.lowerMeasurements[m.id] || ''}
                                onChange={(e) => updateLowerMeasurement(item.uid, m.id, e.target.value)}
                                className="w-full pr-5 pl-2 py-1 text-xs font-bold text-stone-800 bg-[#FAF8F5] border border-[#DECDB8] rounded focus:outline-none focus:ring-1 focus:ring-[#5B172E]"
                              />
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">"</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!item.hasUpper && !item.hasLower && (
                    <div className="text-center py-4 border border-dashed border-amber-300 bg-amber-50 rounded-xl text-xs text-amber-800">
                      Please select at least Upper Body or Lower Body Measurement for this garment.
                    </div>
                  )}

                  {/* Order Note (Last Field per Order) */}
                  <div className="pt-2 border-t border-[#E8DFD3]">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Additional Note <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={item.note || ''}
                      onChange={(e) => updateItemField(item.uid, 'note', e.target.value)}
                      placeholder="Add special client instructions, alteration notes, or delivery reminders for this order..."
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#DECDB8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B172E]/30"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* "+ Add Another Garment / Order for this Client" Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleAddItem()}
              className="w-auto px-5 py-3 border-2 border-dashed border-[#5B172E]/50 hover:border-[#5B172E] text-[#5B172E] hover:text-[#431021] font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 bg-[#FAF5EE] hover:bg-[#F3ECE2] transition-all cursor-pointer shadow-2xs group"
            >
              <PlusCircle className="w-5 h-5 text-[#5B172E] group-hover:scale-110 transition-transform" />
              <span>+ Add Another</span>
            </button>
          </div>

          {uploadingCount > 0 && (
            <p className="text-xs text-stone-500 text-center font-medium">
              Uploading {uploadingCount} photo(s)... Please wait before submitting.
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8DFD3]">
            <div className="text-xs text-stone-500">
              Total to create: <strong className="text-[#5B172E]">{items.length} {items.length === 1 ? 'Order' : 'Orders'}</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingCount > 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#5B172E] to-[#7B203E] hover:from-[#431021] hover:to-[#5B172E] shadow-md transition-all transform active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>
                  {submitting
                    ? 'Creating Orders…'
                    : uploadingCount > 0
                    ? 'Uploading photos…'
                    : items.length === 1
                    ? 'Create Order'
                    : `Create All ${items.length} Orders (${firstId} – ${lastId})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

      </div>

      {/* LIGHTBOX MODAL: FULL RESOLUTION PREVIEW (CLICK OUTSIDE CLOSES) */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#DECDB8] cursor-default animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-[#DECDB8] bg-[#FAF8F5]">
              <div className="font-serif font-bold text-stone-900 text-sm truncate pr-2">
                {previewModalImage.title || 'Image Preview'}
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Container */}
            <div className="p-4 flex items-center justify-center bg-stone-950 min-h-[300px] max-h-[75vh] overflow-hidden select-none">
              <img
                src={previewModalImage.url}
                alt="Full resolution preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-[#DECDB8] flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                Click anywhere outside this window to close
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#5B172E] bg-[#FAF5EE] border border-[#DECDB8] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
