import supabase from '../../../core/config/supabaseClient';

const TABLE = 'purchase_indents';
const APPROVALS_TABLE = 'purchase_approvals';
const LOCAL_KEY = 'sainy_purchase_indents_v1';
const LOCAL_APPROVALS_KEY = 'sainy_purchase_approvals_v1';

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeLocal = (rows) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
};

const readLocalApprovals = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_APPROVALS_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeLocalApprovals = (rows) => {
  try {
    localStorage.setItem(LOCAL_APPROVALS_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
};

export const generateNextIndentNumber = (indents = []) => {
  let maxNum = 1000;
  indents.forEach((item) => {
    const m = String(item?.indentNumber || '').match(/IND-(\d+)/i);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  });
  return `IND-${maxNum + 1}`;
};

const mapIndentRow = (r) => ({
  id: r.id,
  indentNumber: r.indent_number || r.indentNumber,
  indentDate: r.indent_date || r.indentDate,
  requester: r.requester,
  priority: r.priority,
  requiredDate: r.required_date || r.requiredDate,
  materialName: r.material_name || r.materialName,
  color: r.color,
  size: r.size,
  uom: r.uom,
  quantity: r.quantity,
  approvedQuantity: r.approved_quantity ?? r.approvedQuantity ?? r.quantity,
  attachmentUrl: r.attachment_url || r.attachmentUrl,
  attachmentName: r.attachment_name || r.attachmentName,
  specification: r.specification,
  currentStage: r.current_stage || r.currentStage || 'approval',
  status: r.status || 'Pending Approval',
  vendorType: r.vendor_type || r.vendorType || '',
  approvalRemarks: r.approval_remarks || r.approvalRemarks || '',
  approvedBy: r.approved_by || r.approvedBy || '',
  approvedAt: r.approved_at || r.approvedAt || null,
  createdAt: r.created_at || r.createdAt
});

export const fetchIndents = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []).map(mapIndentRow);
    writeLocal(rows);
    return rows;
  } catch {
    return readLocal();
  }
};

export const createIndent = async (indent) => {
  let savedRow = {
    id: indent.id || `IND-${Date.now()}`,
    indentNumber: indent.indentNumber || generateNextIndentNumber(readLocal()),
    indentDate: indent.indentDate,
    requester: indent.requester,
    priority: indent.priority,
    requiredDate: indent.requiredDate,
    materialName: indent.materialName,
    color: indent.color,
    size: indent.size,
    uom: indent.uom,
    quantity: Number(indent.quantity) || 0,
    attachmentUrl: indent.attachmentUrl || '',
    attachmentName: indent.attachmentName || '',
    specification: indent.specification || '',
    currentStage: 'approval',
    status: 'Pending Approval',
    vendorType: '',
    approvalRemarks: '',
    approvedBy: '',
    approvedAt: null,
    createdAt: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        indent_number: null, // Auto-assigned by PostgreSQL purchase_indent_seq trigger
        indent_date: savedRow.indentDate || null,
        requester: savedRow.requester,
        priority: savedRow.priority,
        required_date: savedRow.requiredDate || null,
        material_name: savedRow.materialName,
        color: savedRow.color || null,
        size: savedRow.size || null,
        uom: savedRow.uom || null,
        quantity: savedRow.quantity,
        attachment_url: savedRow.attachmentUrl || null,
        attachment_name: savedRow.attachmentName || null,
        specification: savedRow.specification || null,
        current_stage: 'approval',
        status: 'Pending Approval'
      })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      savedRow = {
        ...savedRow,
        id: data.id,
        indentNumber: data.indent_number,
        currentStage: data.current_stage || 'approval',
        status: data.status || 'Pending Approval',
        createdAt: data.created_at
      };
    }
  } catch {
    // Fallback to localStorage if purchase_indents table is not yet created
  }

  const existing = readLocal();
  writeLocal([savedRow, ...existing]);
  return savedRow;
};

/**
 * Fetch indents eligible for Approval stage:
 * - Current stage: 'approval'
 * - Status: 'Pending Approval' OR 'Hold'
 * Also returns decision history (Approved / Rejected) for review log.
 */
export const fetchApprovalIndents = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []).map(mapIndentRow);
    writeLocal(rows);
    return rows;
  } catch {
    return readLocal();
  }
};

/**
 * Submit approval action on an indent:
 * - status: 'Approved' | 'Hold' | 'Rejected'
 * - vendorType: 'Regular' | 'Three Party Approval'
 * - remarks: string
 * - approverName: string
 *
 * Rules:
 * - If Approved: current_stage moves to 'vendor_selection', status = 'Approved'
 * - If Hold: current_stage stays 'approval', status = 'Hold' (stays on approval page)
 * - If Rejected: current_stage stays 'approval', status = 'Rejected' (does NOT move forward)
 */
export const submitApproval = async ({ indentId, status, vendorType, approvedQuantity, remarks, approverName }) => {
  const approvedAt = new Date().toISOString();
  const nextStage = status === 'Approved' ? 'vendor_selection' : 'approval';

  const approvalRecord = {
    id: `appr-${Date.now()}`,
    indent_id: indentId,
    decision: status,
    vendor_type: vendorType,
    approved_quantity: approvedQuantity !== undefined && approvedQuantity !== '' ? Number(approvedQuantity) : null,
    remarks: remarks || '',
    approved_by: approverName || 'Approver',
    approved_at: approvedAt
  };

  // 1. Try to record approval in purchase_approvals table
  try {
    await supabase.from(APPROVALS_TABLE).insert({
      indent_id: indentId,
      decision: status,
      vendor_type: vendorType,
      approved_quantity: approvalRecord.approved_quantity,
      remarks: remarks || '',
      approved_by: approverName || 'Approver',
      approved_at: approvedAt
    });
  } catch {
    /* fallback to local storage */
  }

  // 2. Update purchase_indents table
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        status: status,
        current_stage: nextStage,
        vendor_type: vendorType,
        approved_quantity: approvalRecord.approved_quantity,
        approval_remarks: remarks || '',
        approved_by: approverName || 'Approver',
        approved_at: approvedAt
      })
      .eq('id', indentId)
      .select();

    if (error) throw error;
  } catch {
    /* fallback to local storage */
  }

  // 3. Update localStorage cache
  const localIndents = readLocal();
  const updatedIndents = localIndents.map((item) => {
    if (item.id === indentId || item.indentNumber === indentId) {
      return {
        ...item,
        status,
        currentStage: nextStage,
        vendorType,
        approvedQuantity: approvalRecord.approved_quantity ?? item.quantity,
        approvalRemarks: remarks || '',
        approvedBy: approverName || 'Approver',
        approvedAt
      };
    }
    return item;
  });
  writeLocal(updatedIndents);

  const localApprovals = readLocalApprovals();
  writeLocalApprovals([approvalRecord, ...localApprovals]);

  return {
    success: true,
    indentId,
    status,
    nextStage,
    vendorType,
    approvedQuantity: approvalRecord.approved_quantity,
    approvalRecord
  };
};

// Compress image files to WebP (max 1600px, quality 0.78) to save Supabase bucket storage
const compressImageToWebp = (file, maxDim = 1600, quality = 0.78) =>
  new Promise((resolve) => {
    if (!file || !file.type?.startsWith('image/')) {
      resolve(file);
      return;
    }
    const img = new Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objUrl);
            if (blob && blob.size < file.size) {
              const webpName = file.name.replace(/\.[^.]+$/, '') + '.webp';
              resolve(new File([blob], webpName, { type: 'image/webp' }));
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      } catch {
        URL.revokeObjectURL(objUrl);
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      resolve(file);
    };
    img.src = objUrl;
  });

export const uploadIndentAttachment = async (file, indentNumber) => {
  if (!file) return { url: '', name: '' };
  try {
    const processedFile = await compressImageToWebp(file);
    const cleanName = `indents/${indentNumber || 'draft'}-${Date.now()}-${processedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error } = await supabase.storage.from('purchase-attachments').upload(cleanName, processedFile, {
      contentType: processedFile.type || 'application/octet-stream',
      cacheControl: '31536000',
      upsert: true
    });
    if (error) throw error;
    const { data } = supabase.storage.from('purchase-attachments').getPublicUrl(cleanName);
    return { url: data.publicUrl, name: processedFile.name };
  } catch {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ url: e.target?.result || '', name: file.name });
      reader.onerror = () => resolve({ url: '', name: file.name });
      reader.readAsDataURL(file);
    });
  }
};
