import supabase from '../SupabaseClient';

/**
 * Adapter to fetch sheet data from Supabase
 */
export async function supabaseFetchSheet(sheetName) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(500);

    const payload = {
      success: !error,
      data: data || [],
      error: error ? error.message : null,
    };

    return new Response(JSON.stringify(payload), {
      status: error ? 500 : 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message, data: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Adapter to mutate sheet / task data in Supabase
 */
export async function supabaseMutateSheet(sheetName, action, payload = {}) {
  try {
    if (action === 'uploadFile') {
      let fileUrl = '';
      if (payload.file) {
        const fileName = `upload_${Date.now()}_${payload.fileName || 'file'}`;
        const { data, error } = await supabase.storage
          .from('checklist')
          .upload(fileName, payload.file);
        if (!error && data) {
          const { data: urlData } = supabase.storage.from('checklist').getPublicUrl(fileName);
          fileUrl = urlData.publicUrl;
        }
      }
      return new Response(JSON.stringify({ success: true, fileUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'updateTaskData') {
      const rows = payload.rowData || [];
      for (const row of rows) {
        if (row.taskId) {
          await supabase
            .from('tasks')
            .update({
              status: row.status || 'completed',
              actual_date: row.actualDate || new Date().toISOString(),
              remarks: row.remarks || '',
              image_url: row.imageUrl || null,
            })
            .eq('task_id', row.taskId);
        }
      }
      return new Response(JSON.stringify({ success: true, updated: rows.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default {
  supabaseFetchSheet,
  supabaseMutateSheet,
};

