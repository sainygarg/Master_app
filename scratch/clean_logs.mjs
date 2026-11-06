import fs from 'fs';

// 1. AdminLayout.jsx
let adminLayout = fs.readFileSync('src/Systems/checklist-delegation/components/layout/AdminLayout.jsx', 'utf8');
adminLayout = adminLayout.replace(/console\.log\(`[^`]*SECURITY GUARD DEBUG:[^`]*`\);/, '');
adminLayout = adminLayout.replace(/console\.log\("AdminLayout - Profile Image URL \(Cached\):", cachedImage\);/, '');
adminLayout = adminLayout.replace(/console\.log\(`[^`]*Sidebar Filter: Checking[^`]*`\);/, '');
fs.writeFileSync('src/Systems/checklist-delegation/components/layout/AdminLayout.jsx', adminLayout, 'utf8');

// 2. UserLayout.jsx
let userLayout = fs.readFileSync('src/Systems/checklist-delegation/components/layout/UserLayout.jsx', 'utf8');
userLayout = userLayout.replace(/console\.log\("UserLayout - Profile Image URL \(Cached\):", cachedImage\);/, '');
fs.writeFileSync('src/Systems/checklist-delegation/components/layout/UserLayout.jsx', userLayout, 'utf8');

// 3. RealtimeLogoutListener.jsx
let realtime = fs.readFileSync('src/Systems/checklist-delegation/components/RealtimeLogoutListener.jsx', 'utf8');
realtime = realtime.replace(/\.subscribe\(\(status\) => console\.log\("✅ Subscribed to admin Realtime:", status\)\);/, '.subscribe();');
realtime = realtime.replace(/if \("Notification" in window\) \{\s*Notification\.requestPermission\(\);\s*\}/, 'if ("Notification" in window && Notification.permission === "default") { Notification.requestPermission(); }');
fs.writeFileSync('src/Systems/checklist-delegation/components/RealtimeLogoutListener.jsx', realtime, 'utf8');

// 4. assignTaskApi.js
let assignTaskApi = fs.readFileSync('src/Systems/checklist-delegation/redux/api/assignTaskApi.js', 'utf8');
assignTaskApi = assignTaskApi.replace(/console\.log\("🔍 Fetching doer data for department:", department\);/, '');
assignTaskApi = assignTaskApi.replace(/console\.log\("🔍 API: Fetching 'Assign From' list from database\.\.\."\);/, '');
assignTaskApi = assignTaskApi.replace(/console\.log\("✅ API: Loaded Assigners:", uniqueNames\);/, '');
fs.writeFileSync('src/Systems/checklist-delegation/redux/api/assignTaskApi.js', assignTaskApi, 'utf8');

// 5. ChecklistTask.jsx
let checklistTask = fs.readFileSync('src/Systems/checklist-delegation/pages/admin/ChecklistTask.jsx', 'utf8');
checklistTask = checklistTask.replace(/console\.log\(`📌 AssignTask Entry Guard:[^`]*`\);/, '');
fs.writeFileSync('src/Systems/checklist-delegation/pages/admin/ChecklistTask.jsx', checklistTask, 'utf8');

// 6. AssignTask.jsx
let assignTask = fs.readFileSync('src/Systems/checklist-delegation/pages/admin/AssignTask.jsx', 'utf8');
assignTask = assignTask.replace(/console\.log\(`📌 AssignTask Entry Guard:[^`]*`\);/, '');
fs.writeFileSync('src/Systems/checklist-delegation/pages/admin/AssignTask.jsx', assignTask, 'utf8');

console.log('Cleaned up debug console logs.');

