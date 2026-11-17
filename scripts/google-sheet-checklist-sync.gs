/**
 * ==============================================================================
 * SAINY GARG COUTURE: SUPABASE TO GOOGLE SHEETS SYNC
 * Tab 1: "Checklist"   -> Supabase `checklist` table (Tasks up to today only)
 * Tab 2: "Delegation"  -> Supabase `delegation` table (Tasks up to today only)
 * ==============================================================================
 * 
 * Target Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1_eCwbKbQHY9wilMHoebR8uHobo58rfLxH7wq3AJ44Q8/edit?gid=144520974#gid=144520974
 * 
 * KEY RULES:
 * - NO FUTURE TASKS: Only fetches and writes tasks where task date (task_start_date or planned_date or created_at) is on or before TODAY (end of today).
 * - DEFAULT STYLING: Keeps your Google Sheet's natural default styling without forced color overrides.
 * - 1-HOUR AUTO SYNC: Runs hourly in the background.
 * - 2 SEPARATE TABS: Checklist rows strictly to "Checklist", Delegation rows strictly to "Delegation".
 * 
 * EXACT COLUMNS:
 * 
 * 1. TAB "Checklist" (18 Columns):
 *    Timestamp | Task ID | Department | Given By | Name | Task Description |
 *    Task Start Date | Freq | Enable Reminders | Require Attachment | Planned Date |
 *    Actual | Delay | Status | Remarks | Upload Imgage | Extend Date | Admin Done
 * 
 * 2. TAB "Delegation" (16 Columns):
 *    Timestamp | Task ID | Department | Given By | Name | Task Descriptions |
 *    Task Start Date | Freq | Enable Reminders | Require Attachment | Actual |
 *    Delay | Status | Remarks | Uploaded Image | Admin Done
 * ==============================================================================
 */

var CONFIG = {
  SUPABASE_URL: 'https://cagibmportrxcvoerutv.supabase.co',
  SUPABASE_KEY: 'sb_publishable_1Tp9ddXydm2FEE-YNdqUcA_7Adibzrd',
  CHECKLIST_GID: 144520974,              // Target GID from your sheet URL
  CHECKLIST_TAB_NAME: 'Checklist',       // Name of the Checklist tab
  DELEGATION_TAB_NAME: 'Delegation',     // Name of the Delegation tab
  PAGE_SIZE: 1000
};

// CHECKLIST HEADERS (18 columns)
var CHECKLIST_HEADERS = [
  'Timestamp',
  'Task ID',
  'Department',
  'Given By',
  'Name',
  'Task Description',
  'Task Start Date',
  'Freq',
  'Enable Reminders',
  'Require Attachment',
  'Planned Date',
  'Actual',
  'Delay',
  'Status',
  'Remarks',
  'Upload Imgage',
  'Extend Date',
  'Admin Done'
];

// DELEGATION HEADERS (16 columns)
var DELEGATION_HEADERS = [
  'Timestamp',
  'Task ID',
  'Department',
  'Given By',
  'Name',
  'Task Descriptions',
  'Task Start Date',
  'Freq',
  'Enable Reminders',
  'Require Attachment',
  'Actual',
  'Delay',
  'Status',
  'Remarks',
  'Uploaded Image',
  'Admin Done'
];

/**
 * Creates custom dropdown menu inside Google Sheets UI
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚡ Supabase Sync')
    .addItem('🔄 Sync Both (Checklist & Delegation)', 'syncAllData')
    .addSeparator()
    .addItem('📋 Sync "Checklist" Tab Only', 'syncChecklistData')
    .addItem('👥 Sync "Delegation" Tab Only', 'syncDelegationData')
    .addSeparator()
    .addItem('⏰ Enable 1-Hour Auto Sync Trigger', 'setupOneHourTrigger')
    .addToUi();
}

/**
 * Master sync function for both sheets
 */
function syncAllData() {
  var countChecklist = syncChecklistData(true);
  var countDelegation = syncDelegationData(true);

  var msg = '✅ Synced (Up to Today)! Checklist: ' + countChecklist + ' rows | Delegation: ' + countDelegation + ' rows.';
  Logger.log(msg);
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Sync Completed', 6);
  } catch (e) {}
}

/**
 * Syncs Checklist data strictly into the "Checklist" sheet tab (Excluding future tasks)
 */
function syncChecklistData(isSilent) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateTab_(ss, CONFIG.CHECKLIST_TAB_NAME, CONFIG.CHECKLIST_GID);

  var dbRows = fetchSupabaseTable_('checklist');
  var todayEnd = getTodayEndOfDay_();

  // Filter: exclude any future task beyond today
  var filteredRows = dbRows.filter(function(r) {
    return isNotFutureTask_(r, todayEnd);
  });

  var formattedRows = filteredRows.map(function(r) {
    return [
      fmtDateTime_(r.created_at),                           // 1. Timestamp
      r.task_id || r.id || '',                              // 2. Task ID
      r.department || '',                                   // 3. Department
      r.given_by || '',                                     // 4. Given By
      r.name || '',                                         // 5. Name
      r.task_description || '',                             // 6. Task Description
      fmtDate_(r.task_start_date),                          // 7. Task Start Date
      r.frequency || '',                                    // 8. Freq
      yesNo_(r.enable_reminder),                            // 9. Enable Reminders
      yesNo_(r.require_attachment),                         // 10. Require Attachment
      fmtDate_(r.planned_date),                             // 11. Planned Date
      fmtDateTime_(r.submission_date),                      // 12. Actual
      calculateDelay_(r.planned_date, r.submission_date),   // 13. Delay
      r.status || (r.submission_date ? 'Done' : 'Pending'), // 14. Status
      r.remark || '',                                       // 15. Remarks
      r.image_url || '',                                    // 16. Upload Imgage
      fmtDate_(r.next_extend_date || r.extend_date),        // 17. Extend Date
      formatAdminDone_(r.admin_done)                        // 18. Admin Done
    ];
  });

  // Sort newest Timestamp first
  formattedRows.sort(function(a, b) {
    return String(b[0]).localeCompare(String(a[0]));
  });

  writeDataOnly_(sheet, CHECKLIST_HEADERS, formattedRows);

  if (!isSilent) {
    var msg = '✅ Checklist Tab updated (Till Today): ' + formattedRows.length + ' rows!';
    Logger.log(msg);
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Checklist Synced', 5);
    } catch (e) {}
  }

  return formattedRows.length;
}

/**
 * Syncs Delegation data strictly into the "Delegation" sheet tab (Excluding future tasks)
 */
function syncDelegationData(isSilent) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateTab_(ss, CONFIG.DELEGATION_TAB_NAME);

  var dbRows = fetchSupabaseTable_('delegation');
  var todayEnd = getTodayEndOfDay_();

  // Filter: exclude any future task beyond today
  var filteredRows = dbRows.filter(function(r) {
    return isNotFutureTask_(r, todayEnd);
  });

  var formattedRows = filteredRows.map(function(r) {
    return [
      fmtDateTime_(r.created_at),                           // 1. Timestamp
      r.task_id || r.id || '',                              // 2. Task ID
      r.department || '',                                   // 3. Department
      r.given_by || '',                                     // 4. Given By
      r.name || '',                                         // 5. Name
      r.task_description || '',                             // 6. Task Descriptions
      fmtDate_(r.task_start_date),                          // 7. Task Start Date
      r.frequency || '',                                    // 8. Freq
      yesNo_(r.enable_reminder),                            // 9. Enable Reminders
      yesNo_(r.require_attachment),                         // 10. Require Attachment
      fmtDateTime_(r.submission_date),                      // 11. Actual
      calculateDelay_(r.planned_date, r.submission_date),   // 12. Delay
      r.status || (r.submission_date ? 'Done' : 'Pending'), // 13. Status
      r.reason || r.remark || '',                           // 14. Remarks
      r.audio_url || r.image_url || '',                     // 15. Uploaded Image
      formatAdminDone_(r.admin_done)                        // 16. Admin Done
    ];
  });

  // Sort newest Timestamp first
  formattedRows.sort(function(a, b) {
    return String(b[0]).localeCompare(String(a[0]));
  });

  writeDataOnly_(sheet, DELEGATION_HEADERS, formattedRows);

  if (!isSilent) {
    var msg = '✅ Delegation Tab updated (Till Today): ' + formattedRows.length + ' rows!';
    Logger.log(msg);
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Delegation Synced', 5);
    } catch (e) {}
  }

  return formattedRows.length;
}

/**
 * Writes data values ONLY — preserves your Google Sheet's natural default styling.
 */
function writeDataOnly_(sheet, headers, rows) {
  var numCols = headers.length;

  // 1. Set headers in Row 1
  sheet.getRange(1, 1, 1, numCols).setValues([headers]);

  // 2. Clear old data rows (keep Row 1 intact, preserves your sheet styling)
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, numCols)).clearContent();
  }

  // 3. Write data rows using the sheet's default style
  if (rows && rows.length > 0) {
    sheet.getRange(2, 1, rows.length, numCols).setValues(rows);
  }

  sheet.setFrozenRows(1);
}

/**
 * Returns Date object set to 23:59:59.999 of TODAY in the script's timezone.
 */
function getTodayEndOfDay_() {
  var now = new Date();
  var endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return endOfDay;
}

/**
 * Checks whether task is scheduled on or before today (excludes future tasks).
 * Evaluates task_start_date -> planned_date -> created_at.
 */
function isNotFutureTask_(r, todayEnd) {
  var dateStr = r.task_start_date || r.planned_date || r.created_at;
  if (!dateStr) return true; // If no date is given, keep it

  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;

  // Keep only tasks scheduled on or before end of today
  return d.getTime() <= todayEnd.getTime();
}

/**
 * Helper to get a sheet tab by Name or GID, or create it if missing
 */
function getOrCreateTab_(ss, tabName, optGid) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toLowerCase() === tabName.trim().toLowerCase()) {
      return sheets[i];
    }
  }

  if (optGid) {
    for (var j = 0; j < sheets.length; j++) {
      if (sheets[j].getSheetId() === optGid) {
        sheets[j].setName(tabName);
        return sheets[j];
      }
    }
  }

  return ss.insertSheet(tabName);
}

/**
 * Recurring 1-hour background trigger
 */
function setupOneHourTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    var handler = triggers[i].getHandlerFunction();
    if (handler === 'syncAllData' || handler === 'syncChecklistData') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('syncAllData')
    .timeBased()
    .everyHours(1)
    .create();

  SpreadsheetApp.getUi().alert(
    '⏰ 1-Hour Auto Sync Enabled!\n\nChecklist and Delegation data up to today will sync to their respective tabs every hour.'
  );
}

/**
 * Fetch all records from Supabase table with pagination
 */
function fetchSupabaseTable_(tableName) {
  var allRecords = [];
  var from = 0;

  while (true) {
    var endpoint = CONFIG.SUPABASE_URL + '/rest/v1/' + tableName + '?select=*&order=id.asc';
    var response = UrlFetchApp.fetch(endpoint, {
      method: 'get',
      muteHttpExceptions: true,
      headers: {
        'apikey': CONFIG.SUPABASE_KEY,
        'Authorization': 'Bearer ' + CONFIG.SUPABASE_KEY,
        'Range': from + '-' + (from + CONFIG.PAGE_SIZE - 1),
        'Range-Unit': 'items'
      }
    });

    var code = response.getResponseCode();
    if (code !== 200 && code !== 206) {
      throw new Error('Supabase fetch [' + tableName + '] failed (' + code + '): ' + response.getContentText());
    }

    var chunk = JSON.parse(response.getContentText());
    if (!chunk || chunk.length === 0) break;

    allRecords = allRecords.concat(chunk);
    if (chunk.length < CONFIG.PAGE_SIZE) break;

    from += CONFIG.PAGE_SIZE;
  }

  return allRecords;
}

function fmtDate_(val) {
  if (!val) return '';
  var d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy');
}

function fmtDateTime_(val) {
  if (!val) return '';
  var d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
}

function yesNo_(val) {
  if (val === true) return 'Yes';
  if (val === false || val === null || val === undefined) return 'No';
  var str = String(val).toLowerCase();
  return (str === 'yes' || str === 'true') ? 'Yes' : 'No';
}

function formatAdminDone_(val) {
  if (val === true) return 'Done';
  if (val === false || val === null || val === undefined) return '';
  var str = String(val).toLowerCase();
  return (str === 'true' || str === 'done' || str === 'yes') ? 'Done' : '';
}

function calculateDelay_(planned, actual) {
  if (!planned) return '';
  var pDate = new Date(planned);
  if (isNaN(pDate.getTime())) return '';

  var compareDate = actual ? new Date(actual) : new Date();
  var diffTime = compareDate.getTime() - pDate.getTime();
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}
