// Pure logic: answer checking, mastery and round selection. No DOM here.
import { QUESTIONS, CATEGORIES, byId } from './questions.js';

const EPS = 1e-9;
export const eq = (a, b) => Math.abs(a - b) < EPS;

export function parseNum(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/[£,\s]/g, '');
  if (s === '' || s === '.') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function orderedTasks(q) {
  return [...q.tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || q.tasks.indexOf(a) - q.tasks.indexOf(b));
}

function lookup(mistakes, test) {
  for (const m of mistakes || []) if (test(m[0])) return { say: m[1], tag: m[2] };
  return null;
}

function asResult(x) {
  if (!x) return null;
  return Array.isArray(x) ? { say: x[0], tag: x[1] } : x;
}

// values: map taskId -> raw value. Returns {ok} | {empty} | {ok:false, say, tag}
export function evalTask(task, value, values) {
  const nums = {};
  for (const [k, v] of Object.entries(values || {})) { const n = parseNum(v); if (n != null) nums[k] = n; }

  if (task.kind === 'num') {
    const n = parseNum(value);
    if (n == null) return { empty: true };
    const ok = task.check ? task.check(n, nums) : eq(n, task.answer);
    if (ok) return { ok: true };
    const r = lookup(task.mistakes, m => eq(m, n)) || asResult(task.diagnose?.({ raw: value, n }, nums));
    return { ok: false, say: r?.say || task.generic, tag: r?.tag || 'other', value: String(value) };
  }

  if (task.kind === 'frac') {
    const n = parseNum(value?.n);
    const d = task.den ? task.den : parseNum(value?.d);
    if (n == null || d == null) return { empty: true };
    if (d === 0) return { ok: false, say: 'The denominator can\'t be 0.', tag: 'zero denominator', value: `${n}/0` };
    const [an, ad] = task.answer;
    const ok = task.equiv ? eq(n * ad, an * d) : (n === an && d === ad);
    if (ok) return { ok: true };
    const r = lookup(task.mistakes, m => m[0] * d === n * m[1]);
    return { ok: false, say: r?.say || task.generic, tag: r?.tag || 'other', value: `${n}/${d}` };
  }

  if (task.kind === 'choice') {
    const sel = [...(value || [])].sort();
    if (!sel.length) return { empty: true };
    const correct = [...task.correct].sort();
    if (task.pick && sel.length !== task.pick && sel.length < task.pick) {
      return { incomplete: true, say: `Choose ${task.pick === 1 ? 'one' : task.pick}.` };
    }
    if (sel.join() === correct.join()) return { ok: true };
    const wrongPick = sel.find(i => !correct.includes(i));
    let r = wrongPick != null ? asResult(task.wrong?.[wrongPick]) : null;
    if (!r) {
      const missed = correct.find(i => !sel.includes(i));
      if (missed != null) r = asResult(task.missing?.[missed]);
    }
    return { ok: false, say: r?.say || task.generic, tag: r?.tag || 'other', value: sel.map(i => task.options[i]).join(', ') };
  }

  if (task.kind === 'card') {
    if (!value) return { empty: true };
    if (value === task.answer) return { ok: true };
    const r = asResult(task.wrong?.[value]);
    const multWhenDiv = value[0] !== task.answer[0];
    return {
      ok: false,
      say: r?.say || (multWhenDiv ? 'Is the answer bigger or smaller than 6.4? That tells you whether to multiply or divide.' : task.generic),
      tag: r?.tag || (multWhenDiv ? 'multiply vs divide' : 'counted places wrong'),
      value
    };
  }

  if (task.kind === 'order') {
    const ord = value || [];
    if (ord.length < task.items.length) return { empty: true };
    if (ord.join() === task.correctOrder.join()) return { ok: true };
    const r = asResult(task.judge?.(ord));
    return { ok: false, say: r?.say || task.generic, tag: r?.tag || 'other', value: ord.join(',') };
  }
  return { empty: true };
}

// ---------------- progress ----------------

export const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export function blankStats() {
  return { seen: 0, cleanDays: [], wrongs: 0, hints: 0, left: 0, tags: {}, last: null };
}

// Credit 0..2: a clean answer (no wrong step, at most 1 hint) on 2 different days = mastered.
export function credit(stat) {
  return Math.min((stat?.cleanDays || []).length, 2);
}

export function skillPct(stats, cat) {
  const qs = QUESTIONS.filter(q => q.cat === cat);
  const sum = qs.reduce((s, q) => s + credit(stats[q.id]), 0);
  return sum / (qs.length * 2);
}

export function skillLevel(pct) {
  if (pct >= 1) return 5;
  return 1 + Math.floor(pct * 4); // 1..4, 5 = mastered
}

export function allMastered(stats) {
  return Object.keys(CATEGORIES).every(c => skillPct(stats, c) >= 1);
}

export function avgSkill(stats) {
  const cats = Object.keys(CATEGORIES);
  return cats.reduce((s, c) => s + skillPct(stats, c), 0) / cats.length;
}

// Need score: higher means practise sooner.
export function need(stat) {
  if (!stat || !stat.seen) return 100;
  const c = credit(stat);
  if (c >= 2) return 0;
  return (2 - c) * 3 + Math.min(stat.wrongs, 6) + Math.min(stat.hints, 6) * 0.5 + stat.left * 2;
}

// Pick 5 questions. First pass goes through the paper in order. After that,
// 3 that need the most work plus 2 others for variety, avoiding today's repeats where possible.
export function pickRound(stats, rand = Math.random, size = 5) {
  const unseen = QUESTIONS.filter(q => !stats[q.id]?.seen);
  if (unseen.length >= size) return unseen.slice(0, size).map(q => q.id);
  const today = todayKey();
  const pool = QUESTIONS.map(q => ({ q, need: need(stats[q.id]), today: stats[q.id]?.last === today }));
  const notMastered = pool.filter(p => p.need > 0).sort((a, b) => (a.today - b.today) || (b.need - a.need) || (rand() - 0.5));
  const chosen = [...unseen.map(q => q.id)];
  for (const p of notMastered) { if (chosen.length >= Math.max(3, unseen.length)) break; if (!chosen.includes(p.q.id)) chosen.push(p.q.id); }
  const rest = pool.filter(p => !chosen.includes(p.q.id)).sort(() => rand() - 0.5)
    .sort((a, b) => (a.today - b.today));
  // variety: prefer categories not yet in the round
  const cats = new Set(chosen.map(id => byId[id].cat));
  rest.sort((a, b) => (cats.has(a.q.cat) ? 1 : 0) - (cats.has(b.q.cat) ? 1 : 0));
  for (const p of rest) { if (chosen.length >= size) break; chosen.push(p.q.id); }
  return chosen.slice(0, size);
}

// Record a finished question into stats. rec: {id, result, wrongs:[{tag}], hints, method}
export function recordQuestion(stats, rec, day = todayKey()) {
  const s = stats[rec.id] || blankStats();
  s.seen += 1;
  s.last = day;
  s.wrongs += rec.wrongs.length;
  s.hints += rec.hints;
  if (rec.result === 'left') s.left += 1;
  for (const w of rec.wrongs) s.tags[w.tag] = (s.tags[w.tag] || 0) + 1;
  const clean = rec.result === 'goal' && rec.hints <= 1;
  if (clean && !s.cleanDays.includes(day)) s.cleanDays.push(day);
  // a later struggle does not remove mastery, but recent mistakes keep it in rotation via need()
  stats[rec.id] = s;
  return s;
}

// ---------------- the league ladder ----------------

export const OPPONENTS = [
  { name: 'Bin Lid Wanderers', str: 1, colour: '#6c757d' },
  { name: 'Dustbin Dynamos', str: 2, colour: '#2a9d8f' },
  { name: 'Ringtail Athletic', str: 3, colour: '#8e44ad' },
  { name: 'Moonlight Rangers', str: 4, colour: '#264653' },
  { name: 'Midnight Bandits', str: 5, colour: '#e63946' },
  { name: 'Stripy Tail Town', str: 6, colour: '#3a86ff' }
];
export const CUP_FINAL = { name: 'Masked Marvels', str: 7, colour: '#111111', final: true };

export function currentOpponent(player) {
  if (player.cupFinal) return CUP_FINAL;
  return OPPONENTS[Math.min(player.rung || 0, OPPONENTS.length - 1)];
}

// Simulate a match. goalsInRound: correct + comeback (0..5).
export function simulateMatch(goalsInRound, skill, opp, rand = Math.random) {
  const ourChances = 2 + goalsInRound;
  const ourConv = 0.3 + 0.35 * skill;
  const theirChances = 1 + Math.floor(opp.str / 2) + (opp.final ? 1 : 0);
  const theirConv = 0.22 + 0.04 * opp.str;
  const events = [];
  const minutes = new Set();
  const minute = () => { let m; do { m = 3 + Math.floor(rand() * 85); } while (minutes.has(m)); minutes.add(m); return m; };
  for (let i = 0; i < ourChances; i++) events.push({ min: minute(), us: true, goal: rand() < ourConv });
  for (let i = 0; i < theirChances; i++) events.push({ min: minute(), us: false, goal: rand() < theirConv });
  events.sort((a, b) => a.min - b.min);
  return events;
}
