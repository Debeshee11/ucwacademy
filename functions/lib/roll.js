/* Builds one learner's public Roll entry from their private record. Pure: no database calls. */
const LESSON_MAX = 700, DAILY_XP_CAP = 800, FIRST_SYNC_CAP = 3000, WEEK_LESSON_CAP = 60;
const IST = 5.5 * 3600e3, DAY = 864e5;

const dayKey = (now, back) => new Date(now + IST - back * DAY).toISOString().slice(0, 10);

function buildRoll(L, prev, now, staff, examres) {
  prev = prev || {};
  const done = Object.entries(L.done || {}).filter(([k, t]) => /^\d+$/.test(k) && +k >= 1 && +k <= LESSON_MAX && Number(t) <= now + 60000).length;
  const qpts = Object.values(L.q || {}).reduce((a, e) => a + Math.min(Number(e && e.r) || 0, 50) * 2, 0);
  /* Module quizzes and refreshers are marked in the browser, so they only earn points. Exam passes and seals come from the results the server recorded. */
  const quiz = Object.entries(L.quiz || {}).filter(([k, q]) => q && q.passed && /^[mr]:/.test(k));
  const passes = Object.entries(examres || {}).filter(([k, v]) => /:[bih]$/.test(k) && v && v.passed);
  const seals = passes.length;
  let xp = done * 20 + qpts + quiz.length * 30 + passes.length * 30;
  const days = Math.max(1, (now - (prev.syncAt || now - DAY)) / DAY);
  const ceil = prev.xp != null ? prev.xp + Math.ceil(days) * DAILY_XP_CAP : FIRST_SYNC_CAP;
  xp = Math.max(prev.xp || 0, Math.min(xp, ceil));

  /* Lessons per day for the last 7 days. The app adds these up fresh each time it opens the board, so old weeks never linger. */
  const wkd = {}; let wk = 0;
  for (let i = 0; i < 7; i++) { const k = dayKey(now, i), n = Math.min(Number(L.act && L.act[k] && L.act[k].l) || 0, 40); if (n) { wkd[k] = n; wk += n; } }
  wk = Math.min(wk, WEEK_LESSON_CAP);

  const streak = Math.min(Number(L.streak && L.streak.n) || 0, Math.ceil((now - (L.created || now)) / DAY) + 1);
  const parts = String(L.name || "").trim().split(/\s+/);
  const name = (parts.length > 1 ? parts[0] + " " + parts[parts.length - 1][0].toUpperCase() + "." : parts[0] || "Learner").slice(0, 40);
  const last = Math.max(Number(L.updated) || 0, Number(prev.updated) || 0) || now;
  return { name, door: String(L.door || "").slice(0, 20), kind: staff ? "staff" : "public", xp, wk, wkd, streak, lessons: done, seals, updated: Math.min(last, now), syncAt: now };
}

module.exports = { buildRoll, LESSON_MAX };
