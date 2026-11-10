import { STAGES } from '../types/stages';

const DEFAULT_TAT_DAYS = 2;
const DAY = 24 * 60 * 60 * 1000;

// When did the order enter the given stage? (order creation for stage 1, otherwise
// the moment it was moved out of the previous stage)
export const getStageEntryTime = (order, stageId) => {
  const idx = STAGES.findIndex((s) => s.id === stageId);
  if (idx <= 0) return order.createdAt ? new Date(order.createdAt) : null;
  const prevId = STAGES[idx - 1].id;
  const entry = (order.history || []).find(
    (h) => h.stageId === prevId && /^Moved from/i.test(h.action || '')
  );
  return entry ? new Date(entry.timestamp) : null;
};

// When did the order leave the given stage (= actual completion time)?
export const getStageActualTime = (order, stageId) => {
  const entry = [...(order.history || [])]
    .reverse()
    .find((h) => h.stageId === stageId && /^Moved from/i.test(h.action || ''));
  return entry ? new Date(entry.timestamp) : null;
};

// Planned completion = stage entry + Stage TAT (Master Hub > Stage TAT), default 2 days
export const getStagePlannedTime = (order, stageId, tatConfig = []) => {
  const entry = getStageEntryTime(order, stageId);
  if (!entry) return null;
  const tat = tatConfig.find((t) => t.stageId === stageId);
  const days = Number(tat?.standardDays ?? DEFAULT_TAT_DAYS);
  const hours = tat ? Number(tat.standardHours ?? 0) : 0;
  // Use whichever is set: days take priority, standardHours only when days are 0
  const ms = days > 0 ? days * DAY : hours * 60 * 60 * 1000;
  return new Date(entry.getTime() + ms);
};

export const formatPlanned = (d) =>
  d
    ? d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

// Human readable delay: { late: boolean, label }
export const formatDelay = (planned, actual) => {
  if (!planned || !actual) return { late: false, label: '—' };
  const diff = actual.getTime() - planned.getTime();
  if (diff <= 0) return { late: false, label: 'On time' };
  const totalMin = Math.floor(diff / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const label = d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
  return { late: true, label: `${label} late` };
};
