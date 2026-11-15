import { QUESTIONS, CATEGORIES, METHODS, byId } from './questions.js';
import { coony, angleDiagram, trophy, KIT } from './art.js';
import {
  evalTask, orderedTasks, pickRound, recordQuestion, skillPct, skillLevel, allMastered, avgSkill,
  todayKey, currentOpponent, simulateMatch, OPPONENTS, CUP_FINAL
} from './logic.js';
import * as S from './sound.js';
import { createPad } from './pad.js';
import * as store from './store.js';

const $ = (sel, el = document) => el.querySelector(sel);
const app = $('#app');
let player = null;
let round = null;
let Q = null; // current question state
let pad = null;

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random() * a.length)];

document.addEventListener('pointerdown', () => S.unlock(), { once: false, passive: true });

function muteBtn() {
  return `<button class="iconbtn" data-act="mute" aria-label="Sound on or off">${S.isMuted() ? '🔇' : '🔊'}</button>`;
}
app.addEventListener('click', e => {
  const b = e.target.closest('[data-act="mute"]');
  if (b) { S.setMuted(!S.isMuted()); b.textContent = S.isMuted() ? '🔇' : '🔊'; if (!S.isMuted()) S.tap(); }
});

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

async function persist() {
  try { await store.savePlayer(player); } catch (e) { console.warn(e); toast('Saving will retry when you are online.'); }
}

// ============ sign in ============
function showLogin(err = '') {
  app.innerHTML = `<div class="screen center login">
    ${coony(130, 'happy')}
    <h1>Raccoon Rovers</h1>
    <p class="sub">Max's Maths</p>
    <form class="loginform">
      <label>Email<input type="email" name="email" autocomplete="username" required></label>
      <label>Password<input type="password" name="pw" autocomplete="current-password" required></label>
      <button class="btn big" type="submit">Sign in ⚽</button>
      <p class="err">${esc(err)}</p>
    </form></div>`;
  $('.loginform').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    f.querySelector('button').disabled = true;
    try { await store.signIn(f.email.value, f.pw.value); }
    catch (x) { showLogin('That email or password didn\'t work. Try again.'); }
  });
}

async function start() {
  app.innerHTML = `<div class="screen center">${coony(120, 'think')}<p>Loading the Rovers...</p></div>`;
  try {
    await store.watchAuth(async user => {
      if (!user) { player = null; showLogin(); return; }
      player = await store.loadPlayer();
      showHome();
    });
  } catch (e) {
    app.innerHTML = `<div class="screen center">${coony(120, 'ooh')}<p>Couldn't connect. Check the internet and try again.</p><button class="btn" onclick="location.reload()">Try again</button></div>`;
  }
}

// ============ home ============
function weekCount() {
  const now = new Date();
  const monday = new Date(now); monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const mk = todayKey(monday);
  return (player.playedDays || []).filter(d => d >= mk).length;
}

function stars(level) {
  return Array.from({ length: 5 }, (_, i) => `<span class="${i < level ? 'on' : ''}">★</span>`).join('');
}

function skillCards(stats, highlight = []) {
  return Object.entries(CATEGORIES).map(([k, c]) => {
    const pct = skillPct(stats, k), lvl = skillLevel(pct);
    return `<div class="skill ${pct >= 1 ? 'mastered' : ''} ${highlight.includes(k) ? 'up' : ''}">
      <div class="sk-icon">${c.icon}</div>
      <div class="sk-name">${c.skill}</div>
      <div class="sk-cat">${c.name}</div>
      <div class="stars">${stars(lvl)}</div>
      ${pct >= 1 ? '<div class="badge">Mastered</div>' : `<div class="meter"><i style="width:${Math.round(pct * 100)}%"></i></div>`}
    </div>`;
  }).join('');
}

function ladder() {
  const rung = player.rung || 0;
  return `<ol class="ladder">${OPPONENTS.slice().reverse().map(o => {
    const i = OPPONENTS.indexOf(o);
    const st = i < rung ? 'beaten' : i === Math.min(rung, OPPONENTS.length - 1) && !player.cupFinal ? 'next' : '';
    return `<li class="${st}"><span class="dot" style="background:${o.colour}"></span>${o.name}${st === 'beaten' ? ' ✓' : st === 'next' ? ' ⬅ next match' : ''}</li>`;
  }).join('')}</ol>`;
}

function showHome() {
  round = null; Q = null;
  if (!player.trophy && !player.cupFinal && allMastered(player.stats)) { player.cupFinal = true; persist(); }
  const opp = currentOpponent(player);
  const wk = weekCount();
  const greeting = player.trophy ? 'Cup winners! Keep the skills sharp.' :
    player.cupFinal ? 'Every skill mastered. It\'s CUP FINAL time!' :
    Object.keys(player.stats).length ? pick(['Ready for training, boss?', 'Let\'s get those skills up!', 'The team is warming up.']) :
    'Welcome, boss! I\'m Coony, your captain. Let\'s train the team.';
  app.innerHTML = `<div class="screen home">
    <header class="topbar"><div class="club"><span class="crest">RR</span><b>Raccoon Rovers</b></div>${muteBtn()}</header>
    <div class="hero">
      ${coony(110, 'happy')}
      <div class="speech">${greeting}</div>
    </div>
    ${player.trophy ? `<div class="trophyrow">${trophy(70)}<b>Season Cup Winners</b></div>` : ''}
    <button class="btn huge ${player.cupFinal ? 'gold' : ''}" data-go="round">
      ${player.cupFinal ? '🏆 Cup Final training' : '⚽ Start training'}
      <small>5 questions, then a match against ${opp.name}</small>
    </button>
    <div class="week">Training this week: ${[0, 1, 2].map(i => `<span class="${i < wk ? 'on' : ''}">⚽</span>`).join('')} ${wk >= 3 ? '<b>Target reached!</b>' : `<span class="muted">aim for 3</span>`}</div>
    <h2>Player skills</h2>
    <div class="skills">${skillCards(player.stats)}</div>
    <h2>League ladder</h2>
    ${ladder()}
    <button class="link grownups" data-go="parent">Grown ups</button>
  </div>`;
  app.querySelector('[data-go="round"]').onclick = () => { S.whistle(); startRound(); };
  app.querySelector('[data-go="parent"]').onclick = () => showPin();
}

// ============ round ============
function startRound() {
  const forced = store.isDemo() && new URLSearchParams(location.search).get('qs');
  const ids = forced ? forced.split(',') : pickRound(player.stats);
  round = {
    ids, idx: 0, started: Date.now(), records: [],
    before: Object.fromEntries(Object.keys(CATEGORIES).map(c => [c, skillLevel(skillPct(player.stats, c))])),
    opp: currentOpponent(player)
  };
  showQuestion();
}

function blankValue(t) {
  if (t.kind === 'frac') return { n: '', d: '' };
  if (t.kind === 'choice' || t.kind === 'order') return [];
  return '';
}

function showQuestion() {
  const q = byId[round.ids[round.idx]];
  Q = {
    q, values: {}, locked: {}, wrongTry: {}, wrongNow: {}, hints: 0, wrongs: [], start: Date.now(),
    focus: null, selCard: null, prot: false, done: false, exampleShown: {}
  };
  q.tasks.forEach(t => { Q.values[t.id] = blankValue(t); });
  const placed = new Set();
  let stem = q.stem.replace(/\{\{(\w+)\}\}/g, (m, id) => {
    if (id === 'tray') return `<div class="tray">${q.cards.map(c => `<button class="card" data-card="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
    if (id === 'angle') return `<div class="angle-wrap">${angleDiagram(false)}</div><button class="btn small" data-act="prot">📐 Put the protractor on</button>`;
    placed.add(id);
    const t = q.tasks.find(x => x.id === id);
    return `${t?.label ? `<span class="inl-label">${t.label}</span> ` : ''}<span class="tw inline" data-wrap="${id}"></span>`;
  });
  const steps = q.tasks.filter(t => !placed.has(t.id)).map(t => `
    <div class="step" data-step="${t.id}">
      ${t.label ? `<div class="step-label">${t.label}</div>` : ''}
      <div class="step-row">${t.prefix ? `<span class="pre">${t.prefix}</span>` : ''}<span class="tw" data-wrap="${t.id}"></span>${t.after ? `<span class="post">${t.after}</span>` : ''}</div>
    </div>`).join('');
  // inline prefixes for Q13 style tasks are handled in steps; inline ones have none.
  const cat = CATEGORIES[q.cat];
  const dots = round.ids.map((id, i) => {
    const r = round.records[i];
    return `<span class="qdot ${r ? r.result : i === round.idx ? 'now' : ''}">${r ? (r.result === 'left' ? '•' : '⚽') : i + 1}</span>`;
  }).join('');
  app.innerHTML = `<div class="screen qscreen">
    <header class="topbar">
      <button class="iconbtn" data-act="quit" aria-label="Back to home">🏠</button>
      <div class="qdots">${dots}</div>
      <div class="tag">${cat.icon} ${cat.skill}</div>
      ${muteBtn()}
    </header>
    <div class="qmain">
      <section class="qcard">
        <div class="qnum">Question ${q.num}</div>
        <div class="stem">${stem}</div>
        <div class="steps">${steps}</div>
        <div class="hintbox" hidden></div>
        <div class="feedback" hidden></div>
        <div class="actions">
          <button class="btn ghost" data-act="hint">💡 Coach's tip <small>(0 of 3)</small></button>
          <button class="btn go" data-act="check">Check ✓</button>
        </div>
      </section>
      <section class="padwrap"><div class="padlabel">Working out</div><div class="pad"></div></section>
    </div>
    <div class="keypad" hidden>
      ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '⌫'].map(k => `<button data-key="${k}">${k}</button>`).join('')}
      <button class="kp-hide" data-key="done">Hide ⌄</button>
      <button class="kp-check" data-act="check">Check ✓</button>
    </div>
  </div>`;
  pad?.destroy?.();
  pad = createPad($('.pad'), q.id);
  refreshAll();
  wireQuestion();
  // focus first empty number box
  const first = orderedTasks(q).find(t => t.kind === 'num' || t.kind === 'frac');
  if (first && window.innerWidth > 700) setFocus(first.id, first.kind === 'frac' ? 'n' : null);
}

function taskWidget(t) {
  const v = Q.values[t.id];
  const locked = Q.locked[t.id];
  const f = Q.focus;
  if (t.kind === 'num') {
    const isF = f && f.id === t.id;
    return `<button class="ans ${t.digit ? 'digit' : ''} ${isF ? 'focus' : ''}" data-task="${t.id}" ${locked ? 'disabled' : ''}>${esc(v) || '&nbsp;'}</button>`;
  }
  if (t.kind === 'frac') {
    const fn = f && f.id === t.id && f.part === 'n', fd = f && f.id === t.id && f.part === 'd';
    return `<span class="fracin">
      <button class="ans small ${fn ? 'focus' : ''}" data-task="${t.id}" data-part="n" ${locked ? 'disabled' : ''}>${esc(v.n) || '&nbsp;'}</button>
      <span class="fline"></span>
      ${t.den ? `<span class="fden">${t.den}</span>` : `<button class="ans small ${fd ? 'focus' : ''}" data-task="${t.id}" data-part="d" ${locked ? 'disabled' : ''}>${esc(v.d) || '&nbsp;'}</button>`}
    </span>`;
  }
  if (t.kind === 'choice') {
    return `<span class="choices ${t.layout || 'row'} ${t.tick ? 'tick' : 'circle'}">${t.options.map((o, i) =>
      `<button class="opt ${v.includes(i) ? 'sel' : ''}" data-task="${t.id}" data-opt="${i}" ${locked ? 'disabled' : ''}>${t.tick ? `<span class="box">${v.includes(i) ? '✔' : ''}</span>` : ''}${esc(o)}</button>`).join('')}</span>`;
  }
  if (t.kind === 'card') {
    const isF = f && f.id === t.id;
    return `<button class="slot ${isF ? 'focus' : ''}" data-task="${t.id}" ${locked ? 'disabled' : ''}>${esc(v) || '&nbsp;'}</button>`;
  }
  if (t.kind === 'order') {
    return `<div class="order">
      <div class="order-src">${t.items.map((h, i) => `<button class="opt fr ${v.includes(i) ? 'used' : ''}" data-task="${t.id}" data-item="${i}" ${locked || v.includes(i) ? 'disabled' : ''}>${h}</button>`).join('')}</div>
      <div class="order-dst">${t.items.map((_, i) => `<button class="obox" data-task="${t.id}" data-pos="${i}" ${locked ? 'disabled' : ''}>${v[i] != null ? t.items[v[i]] : '&nbsp;'}</button>`).join('<span class="comma">,</span>')}</div>
      <div class="order-ends"><span>smallest</span><span>largest</span></div>
    </div>`;
  }
  return '';
}

function refreshAll() {
  Q.q.tasks.forEach(t => {
    const w = app.querySelector(`[data-wrap="${t.id}"]`);
    if (!w) return;
    w.innerHTML = taskWidget(t);
    w.classList.toggle('locked', !!Q.locked[t.id]);
    w.classList.toggle('wrong', !!Q.wrongNow[t.id]);
    const step = app.querySelector(`[data-step="${t.id}"]`);
    if (step) { step.classList.toggle('locked', !!Q.locked[t.id]); step.classList.toggle('wrong', !!Q.wrongNow[t.id]); }
  });
  const kp = $('.keypad');
  if (kp) kp.hidden = !(Q.focus && ['num', 'frac'].includes(byTask(Q.focus.id).kind));
  if (Q.q.cards) app.querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c.dataset.card === Q.selCard));
}

const byTask = id => Q.q.tasks.find(t => t.id === id);

function setFocus(id, part = null) {
  Q.focus = id ? { id, part } : null;
  refreshAll();
}

function clearWrong(id) { if (Q.wrongNow[id]) { delete Q.wrongNow[id]; } }

function typeKey(k) {
  if (!Q.focus) return;
  const t = byTask(Q.focus.id);
  if (Q.locked[t.id]) return;
  let cur = t.kind === 'frac' ? Q.values[t.id][Q.focus.part] : Q.values[t.id];
  if (k === '⌫') cur = cur.slice(0, -1);
  else if (k === '.') { if (!cur.includes('.') && !t.digit && t.kind !== 'frac') cur += cur ? '.' : '0.'; }
  else if (/^\d$/.test(k)) { if (t.digit) cur = k; else if (cur.length < 9) cur += k; }
  if (t.kind === 'frac') Q.values[t.id][Q.focus.part] = cur; else Q.values[t.id] = cur;
  clearWrong(t.id);
  S.tap();
  refreshAll();
}

function wireQuestion() {
  const root = $('.qscreen');
  root.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'quit') return confirmQuit();
    if (act === 'check') return check();
    if (act === 'hint') return showHint();
    if (act === 'prot') {
      Q.prot = !Q.prot; S.tap();
      $('.angle-wrap').innerHTML = angleDiagram(Q.prot);
      b.textContent = Q.prot ? '📐 Take the protractor off' : '📐 Put the protractor on';
      return;
    }
    if (act === 'example') return showExample(b.dataset.task);
    if (act === 'leave') return finishQuestion('left');
    if (act === 'next') return nextQuestion();
    if (b.dataset.method) {
      Q.method = b.dataset.method; S.tap();
      root.querySelectorAll('[data-method]').forEach(x => x.classList.toggle('sel', x === b));
      return;
    }
    if (b.dataset.key) {
      if (b.dataset.key === 'done') { setFocus(null); return; }
      return typeKey(b.dataset.key);
    }
    if (b.dataset.card) {
      S.tap();
      if (Q.focus && byTask(Q.focus.id).kind === 'card') {
        Q.values[Q.focus.id] = b.dataset.card; clearWrong(Q.focus.id);
        const next = Q.q.tasks.find(t => t.kind === 'card' && !Q.values[t.id] && !Q.locked[t.id]);
        Q.focus = next ? { id: next.id } : null; Q.selCard = null;
      } else Q.selCard = Q.selCard === b.dataset.card ? null : b.dataset.card;
      return refreshAll();
    }
    const tid = b.dataset.task;
    if (!tid) return;
    const t = byTask(tid);
    if (Q.locked[tid]) return;
    if (t.kind === 'num' || t.kind === 'frac') { S.tap(); return setFocus(tid, b.dataset.part || null); }
    if (t.kind === 'card') {
      S.tap();
      if (Q.selCard) { Q.values[tid] = Q.selCard; Q.selCard = null; clearWrong(tid); Q.focus = null; }
      else if (Q.values[tid]) { Q.values[tid] = ''; clearWrong(tid); Q.focus = { id: tid }; }
      else Q.focus = { id: tid };
      return refreshAll();
    }
    if (t.kind === 'choice') {
      S.tap();
      const i = +b.dataset.opt, v = Q.values[tid];
      if (v.includes(i)) Q.values[tid] = v.filter(x => x !== i);
      else if (t.pick === 1) Q.values[tid] = [i];
      else if (t.pick && v.length >= t.pick) { toast(`Choose ${t.pick}. Tap one again to remove it first.`); return; }
      else Q.values[tid] = [...v, i];
      clearWrong(tid); Q.focus = null;
      return refreshAll();
    }
    if (t.kind === 'order') {
      S.tap();
      const v = Q.values[tid];
      if (b.dataset.item != null) { const i = +b.dataset.item; if (!v.includes(i) && v.length < t.items.length) v.push(i); }
      else if (b.dataset.pos != null) { const p = +b.dataset.pos; if (v[p] != null) v.splice(p, 1); }
      clearWrong(tid);
      return refreshAll();
    }
  });
}

// physical keyboard support on computers
document.addEventListener('keydown', e => {
  if (!Q || Q.done || !$('.qscreen')) return;
  if (/^\d$/.test(e.key) || e.key === '.') { typeKey(e.key); e.preventDefault(); }
  else if (e.key === 'Backspace') { typeKey('⌫'); e.preventDefault(); }
  else if (e.key === 'Enter') { check(); e.preventDefault(); }
  else if (e.key === 'Tab' && Q.focus) {
    const order = orderedTasks(Q.q).filter(t => (t.kind === 'num' || t.kind === 'frac') && !Q.locked[t.id]);
    const i = order.findIndex(t => t.id === Q.focus.id);
    const n = order[(i + 1) % order.length];
    if (n) setFocus(n.id, n.kind === 'frac' ? 'n' : null);
    e.preventDefault();
  }
});

function showHint() {
  const q = Q.q;
  if (Q.hints >= q.hints.length) return;
  Q.hints += 1;
  S.chime();
  const box = $('.hintbox');
  box.hidden = false;
  box.innerHTML = `<div class="coach">${coony(56, 'think')}<div><b>Coach's tips</b>${q.hints.slice(0, Q.hints).map((h, i) => `<div class="hint"><span class="hn">${i + 1}</span><div>${h}</div></div>`).join('')}</div></div>`;
  const hb = app.querySelector('[data-act="hint"]');
  hb.innerHTML = Q.hints >= q.hints.length ? '💡 All tips used' : `💡 Another tip <small>(${Q.hints} of 3)</small>`;
  if (Q.hints >= q.hints.length) hb.disabled = true;
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function feedback(html, mood = 'think') {
  const fb = $('.feedback');
  fb.hidden = false;
  fb.innerHTML = `<div class="coach">${coony(56, mood)}<div class="fbtext">${html}</div></div>`;
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showExample(tid) {
  const t = byTask(tid);
  Q.exampleShown[tid] = true;
  S.chime();
  const ex = $('.feedback .example');
  if (ex) { ex.hidden = false; ex.innerHTML = `<b>Mini example</b>${t.mini}`; }
  const b = $('.feedback [data-act="example"]'); if (b) b.remove();
}

function check() {
  if (Q.done) return;
  const tasks = orderedTasks(Q.q);
  const values = Q.values;
  for (const t of tasks) {
    if (Q.locked[t.id]) continue;
    const r = evalTask(t, values[t.id], values);
    if (r.empty || r.incomplete) {
      setFocus(['num', 'frac'].includes(t.kind) ? t.id : null, t.kind === 'frac' ? (values[t.id].n ? 'd' : 'n') : null);
      feedback(r.say || (t.label ? `Fill in this step first: ${t.label.replace(/<[^>]+>/g, '')}` : 'Fill in every box first.'), 'think');
      flash(t.id);
      return;
    }
    if (r.ok) { Q.locked[t.id] = true; delete Q.wrongNow[t.id]; continue; }
    // wrong step
    Q.wrongTry[t.id] = (Q.wrongTry[t.id] || 0) + 1;
    Q.wrongNow[t.id] = true;
    Q.wrongs.push({ task: t.id, tag: r.tag, value: r.value });
    S.ooh();
    const lockedCount = tasks.filter(x => Q.locked[x.id]).length;
    const kept = lockedCount ? `<p class="kept">✅ Your earlier steps are right, so they're kept.</p>` : '';
    const tries = Q.wrongTry[t.id];
    feedback(`<p class="var">VAR review 📺</p>${kept}<p>${r.say}</p>
      <div class="example" hidden></div>
      <div class="fbbtns">
        <button class="btn small" data-act="example" data-task="${t.id}">Show me an example</button>
        ${tries >= 2 ? '<button class="btn small ghost" data-act="leave">Leave it for now</button>' : ''}
      </div>`, 'ooh');
    if (tries >= 3) showExample(t.id);
    setFocus(['num', 'frac'].includes(t.kind) ? t.id : null, t.kind === 'frac' ? 'n' : null);
    return;
  }
  finishQuestion(Q.wrongs.length ? 'comeback' : 'goal');
}

function flash(tid) {
  const w = app.querySelector(`[data-wrap="${tid}"]`);
  if (w) { w.classList.remove('nudge'); void w.offsetWidth; w.classList.add('nudge'); }
}

function praise(result) {
  const m = METHODS[Q.q.methods[0]]?.name.toLowerCase();
  if (result === 'comeback') return pick([
    'What a comeback! You found the step that went wrong and fixed it.',
    'Spotting and fixing a mistake is what top players do.',
    'Back of the net! You kept going until you got it.'
  ]);
  if (Q.hints) return pick([`Great use of the coach's tips and the ${m}.`, 'Using the tips to work it out is smart training.']);
  return pick([`Great ${m} work.`, 'You set that out really clearly.', 'Solid method, boss.']);
}

function finishQuestion(result) {
  Q.done = true;
  setFocus(null);
  const rec = {
    id: Q.q.id, num: Q.q.num, cat: Q.q.cat, result,
    wrongs: Q.wrongs, hints: Q.hints, secs: Math.round((Date.now() - Q.start) / 1000), method: null
  };
  round.records[round.idx] = rec;
  app.querySelector('.actions').innerHTML = '';
  if (result === 'left') {
    S.tap();
    feedback(`<p>No problem. We'll practise this one again soon. Every training session helps.</p>
      <div class="fbbtns"><button class="btn go" data-act="next">Next ▶</button></div>`, 'happy');
  } else {
    S.cheer(result === 'comeback' ? 2.6 : 2.2);
    const methods = [...Q.q.methods, 'justknew'];
    feedback(`<p class="goal">${result === 'comeback' ? 'COMEBACK GOAL!' : 'GOAL!'} ⚽</p><p>${praise(result)}</p>
      <p class="ask">Which method did you use?</p>
      <div class="methods">${methods.map(k => `<button class="mbtn" data-method="${k}">${METHODS[k].icon} ${METHODS[k].name}</button>`).join('')}</div>
      <div class="fbbtns"><button class="btn go" data-act="next">Next ▶</button></div>`, 'cheer');
    const big = document.createElement('div');
    big.className = 'goalflash'; big.textContent = result === 'comeback' ? 'COMEBACK GOAL!' : 'GOAL!';
    document.body.appendChild(big); setTimeout(() => big.remove(), 1400);
  }
  recordQuestion(player.stats, rec);
  persist();
}

function nextQuestion() {
  if (round.records[round.idx]) round.records[round.idx].method = Q.method || null;
  S.tap();
  round.idx += 1;
  if (round.idx >= round.ids.length) showRoundEnd();
  else showQuestion();
}

function confirmQuit() {
  const fb = $('.feedback');
  fb.hidden = false;
  fb.innerHTML = `<div class="coach">${coony(56, 'think')}<div class="fbtext"><p>Leave training and go back to the club? Questions you've finished are saved.</p>
    <div class="fbbtns"><button class="btn small" data-act="quityes">Yes, go home</button><button class="btn small ghost" data-act="quitno">Keep training</button></div></div></div>`;
  fb.querySelector('[data-act="quityes"]').onclick = async () => {
    if (round.records.length) await saveSession(null);
    showHome();
  };
  fb.querySelector('[data-act="quitno"]').onclick = () => { fb.hidden = true; };
}

// ============ round end and match ============
function showRoundEnd() {
  const goals = round.records.filter(r => r.result !== 'left').length;
  const comebacks = round.records.filter(r => r.result === 'comeback').length;
  round.goals = goals; round.comebacks = comebacks;
  const day = todayKey();
  if (!player.playedDays.includes(day)) player.playedDays.push(day);
  player.playedDays = player.playedDays.slice(-60);
  persist();
  app.innerHTML = `<div class="screen center roundend">
    <header class="topbar"><div class="club"><span class="crest">RR</span><b>Training done!</b></div>${muteBtn()}</header>
    ${coony(110, 'cheer')}
    <h1>${goals} training goal${goals === 1 ? '' : 's'}</h1>
    ${comebacks ? `<p>Including ${comebacks} comeback goal${comebacks === 1 ? '' : 's'}. Fixing mistakes makes the team stronger.</p>` : '<p>Great work, boss.</p>'}
    <p class="sub">Every training goal gives the Rovers an extra chance in the match.</p>
    <div class="vs"><b>Raccoon Rovers</b><span>vs</span><b>${round.opp.name}</b></div>
    <button class="btn huge" data-act="kickoff">Kick off! ⚽</button>
  </div>`;
  app.querySelector('[data-act="kickoff"]').onclick = () => playMatch();
}

const ROVERS = ['Coony', 'Rocket', 'Scraps', 'Whiskers', 'Stripe'];
const SKILL_WORDS = {
  place: 'a fierce shot', addsub: 'a lovely pass', multdiv: 'a mazy dribble', frac: 'great close control',
  measure: 'a lung busting run', geom: 'a towering header', stats: 'a clever through ball'
};

function pitchSVG(opp) {
  let players = '';
  const ours = [[120, 90], [120, 270], [220, 180], [300, 110], [300, 250]];
  const theirs = [[480, 90], [480, 270], [380, 180], [300 + 40, 140], [340, 220]];
  ours.forEach((p, i) => { players += `<circle class="pl us" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="11" fill="${KIT.main}" stroke="${KIT.dark}" stroke-width="3"/>`; });
  theirs.forEach((p, i) => { players += `<circle class="pl them" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="11" fill="${opp.colour}" stroke="#fff" stroke-width="3"/>`; });
  let stripes = '';
  for (let i = 0; i < 8; i++) stripes += `<rect x="${i * 75}" y="0" width="75" height="360" fill="${i % 2 ? '#3f9b3f' : '#47a847'}"/>`;
  return `<svg class="pitch" viewBox="0 0 600 360">${stripes}
    <rect x="10" y="10" width="580" height="340" fill="none" stroke="#fff" stroke-width="3"/>
    <line x1="300" y1="10" x2="300" y2="350" stroke="#fff" stroke-width="3"/>
    <circle cx="300" cy="180" r="45" fill="none" stroke="#fff" stroke-width="3"/>
    <rect x="10" y="110" width="70" height="140" fill="none" stroke="#fff" stroke-width="3"/>
    <rect x="520" y="110" width="70" height="140" fill="none" stroke="#fff" stroke-width="3"/>
    <rect x="0" y="150" width="10" height="60" fill="#fff"/><rect x="590" y="150" width="10" height="60" fill="#fff"/>
    ${players}
    <circle id="ball" cx="300" cy="180" r="7" fill="#fff" stroke="#111" stroke-width="2"/>
  </svg>`;
}

function tween(el, x, y, ms) {
  const x0 = +el.getAttribute('cx'), y0 = +el.getAttribute('cy');
  const t0 = performance.now();
  return new Promise(res => {
    const step = now => {
      const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      el.setAttribute('cx', x0 + (x - x0) * e); el.setAttribute('cy', y0 + (y - y0) * e);
      if (k < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
}

async function playMatch() {
  const opp = round.opp;
  const events = simulateMatch(round.goals, avgSkill(player.stats), opp);
  const score = { us: 0, them: 0 };
  let speed = 1;
  app.innerHTML = `<div class="screen match">
    <header class="topbar"><div class="score"><span class="team us">Rovers</span><b class="sc" id="sus">0</b><b class="sc" id="sthem">0</b><span class="team them">${opp.name}</span></div>${muteBtn()}</header>
    <div class="clock" id="clock">0'</div>
    ${pitchSVG(opp)}
    <ul class="commentary" id="comm"></ul>
    <button class="btn small ghost ff" id="ff">⏩ Faster</button>
  </div>`;
  $('#ff').onclick = () => { speed = speed === 1 ? 4 : 1; $('#ff').textContent = speed === 1 ? '⏩ Faster' : '▶ Normal speed'; };
  const ball = $('#ball');
  const comm = $('#comm');
  const say = (txt, cls = '') => { const li = document.createElement('li'); li.className = cls; li.innerHTML = txt; comm.prepend(li); };
  const wait = ms => sleep(ms / speed);
  const jiggle = () => app.querySelectorAll('.pl').forEach(p => {
    const cx = +p.getAttribute('cx'), cy = +p.getAttribute('cy');
    tween(p, Math.max(30, Math.min(570, cx + (Math.random() - 0.5) * 40)), Math.max(30, Math.min(330, cy + (Math.random() - 0.5) * 40)), 900 / speed);
  });
  S.whistle(1);
  say(`Kick off! Raccoon Rovers against ${opp.name}${opp.final ? ' in the CUP FINAL!' : '.'}`);
  await wait(1500);
  const fillers = [
    'The Rovers knock it around nicely.', 'Coony is shouting instructions from midfield!',
    `${opp.name} are pressing hard.`, 'The crowd are singing for the Rovers!', 'A crunching tackle in midfield. Play on.'
  ];
  for (const ev of events) {
    $('#clock').textContent = ev.min + "'";
    if (Math.random() < 0.5) { say(pick(fillers)); jiggle(); await wait(1600); }
    jiggle();
    if (ev.us) {
      const who = pick(ROVERS);
      const skill = pick(Object.keys(CATEGORIES));
      await tween(ball, 420, 120 + Math.random() * 120, 900 / speed);
      say(`${ev.min}' ${SKILL_WORDS[skill]} from ${who}...`);
      await wait(1100);
      S.kick();
      if (ev.goal) {
        await tween(ball, 596, 165 + Math.random() * 30, 500 / speed);
        score.us++; $('#sus').textContent = score.us;
        S.cheer(); say(`<b>GOAL! ${who} scores for Raccoon Rovers!</b>`, 'goalline');
      } else {
        await tween(ball, 596, Math.random() < 0.5 ? 135 : 230, 500 / speed);
        S.ooh(); say(pick(['Just wide! So close.', 'Saved by the keeper!', 'Off the post!']));
      }
    } else {
      await tween(ball, 180, 120 + Math.random() * 120, 900 / speed);
      say(`${ev.min}' ${opp.name} attack...`);
      await wait(1000);
      S.kick();
      if (ev.goal) {
        await tween(ball, 4, 170 + Math.random() * 20, 500 / speed);
        score.them++; $('#sthem').textContent = score.them;
        S.ooh(); say(`${opp.name} score. Heads up, Rovers!`);
      } else {
        await tween(ball, 30, 180, 500 / speed);
        say(pick(['Great save by Bandit in goal!', 'Blocked by the Rovers defence!', 'Over the bar!']));
      }
    }
    await wait(1500);
    await tween(ball, 300, 180, 500 / speed);
  }
  $('#clock').textContent = "90'";
  say('<b>Last minute... PENALTY to Raccoon Rovers!</b>', 'goalline');
  await wait(1500);
  penalty(score, opp);
}

function penalty(score, opp) {
  app.innerHTML = `<div class="screen penalty center">
    <header class="topbar"><div class="score"><span class="team us">Rovers</span><b class="sc">${score.us}</b><b class="sc">${score.them}</b><span class="team them">${opp.name}</span></div>${muteBtn()}</header>
    <h2>Your penalty, boss! Where should Coony shoot?</h2>
    <svg class="goalsvg" viewBox="0 0 400 220">
      <rect x="0" y="0" width="400" height="220" fill="#47a847"/>
      <rect x="40" y="30" width="320" height="140" fill="#e9f5e9" stroke="#fff" stroke-width="8"/>
      ${Array.from({ length: 15 }, (_, i) => `<line x1="${40 + i * 23}" y1="30" x2="${40 + i * 23}" y2="170" stroke="#cfd8cf"/>`).join('')}
      ${Array.from({ length: 6 }, (_, i) => `<line x1="40" y1="${30 + i * 28}" x2="360" y2="${30 + i * 28}" stroke="#cfd8cf"/>`).join('')}
      <g id="keeper" transform="translate(200,120)"><rect x="-16" y="-34" width="32" height="44" rx="8" fill="${opp.colour}" stroke="#fff" stroke-width="2"/><circle cx="0" cy="-44" r="12" fill="#9aa0a9"/></g>
      <circle id="pball" cx="200" cy="205" r="9" fill="#fff" stroke="#111" stroke-width="2"/>
    </svg>
    <div class="aim"><button class="btn" data-aim="0">⬅ Left</button><button class="btn" data-aim="1">⬆ Middle</button><button class="btn" data-aim="2">Right ➡</button></div>
  </div>`;
  app.querySelectorAll('[data-aim]').forEach(b => b.onclick = async () => {
    app.querySelectorAll('[data-aim]').forEach(x => { x.disabled = true; });
    const aim = +b.dataset.aim, dive = Math.floor(Math.random() * 3);
    const xs = [95, 200, 305];
    S.kick();
    $('#keeper').style.transition = 'transform .45s ease-out';
    $('#keeper').setAttribute('transform', `translate(${xs[dive]},${dive === 1 ? 110 : 125}) rotate(${dive === 0 ? -50 : dive === 2 ? 50 : 0})`);
    await tween($('#pball'), xs[aim], 80, 450);
    const scored = aim !== dive;
    if (scored) { score.us++; S.cheer(2.8); } else S.ooh();
    const h = $('.penalty h2'); h.textContent = scored ? 'GOAL! What a penalty!' : 'Saved! Unlucky, good effort.';
    await sleep(2200);
    S.whistle(3);
    await sleep(1300);
    finishMatch(score, opp, scored);
  });
}

async function saveSession(result) {
  const ups = Object.keys(CATEGORIES).filter(c => skillLevel(skillPct(player.stats, c)) > round.before[c]);
  const sess = {
    started: round.started, ended: Date.now(), mins: Math.max(1, Math.round((Date.now() - round.started) / 60000)),
    records: round.records.filter(Boolean),
    right: round.records.filter(r => r && r.result !== 'left').length,
    comebacks: round.records.filter(r => r && r.result === 'comeback').length,
    match: result, skillUps: ups
  };
  try { await store.addSession(sess); } catch (e) { console.warn(e); }
  return ups;
}

async function finishMatch(score, opp, penScored) {
  const win = score.us > score.them, draw = score.us === score.them;
  let headline, line;
  if (opp.final) {
    if (win) { player.trophy = true; player.cupFinal = false; headline = 'CUP WINNERS!'; line = 'Raccoon Rovers have won the cup. Every skill mastered. Amazing work, boss!'; }
    else { headline = draw ? 'A draw in the final' : 'So close in the final'; line = 'We\'ll get them next time. Another training session and we go again!'; }
  } else if (win) {
    if ((player.rung || 0) < OPPONENTS.length - 1) { player.rung = (player.rung || 0) + 1; line = `You climbed the league! Next up: ${OPPONENTS[player.rung].name}.`; }
    else line = 'Top of the league! Keep training to unlock something special.';
    headline = 'WIN!';
  } else {
    headline = draw ? 'A draw!' : 'A tough game';
    line = `Good effort. You'll face ${opp.name} again next time, and your training goals give the team more chances.`;
  }
  const ups = await saveSession({ us: score.us, them: score.them, opp: opp.name, pen: penScored, final: !!opp.final });
  await persist();
  if (player.trophy && opp.final && win) return showTrophy();
  app.innerHTML = `<div class="screen center result">
    <header class="topbar"><div class="club"><span class="crest">RR</span><b>Full time</b></div>${muteBtn()}</header>
    ${coony(110, win ? 'cheer' : 'happy')}
    <h1>${headline}</h1>
    <div class="score final"><span class="team us">Raccoon Rovers</span><b class="sc">${score.us}</b><b class="sc">${score.them}</b><span class="team them">${opp.name}</span></div>
    <p>${line}</p>
    ${ups.length ? `<h2>Skills up! ⬆</h2><div class="skills">${skillCards(player.stats, ups)}</div>` : ''}
    <button class="btn huge" data-act="home">Back to the club</button>
  </div>`;
  if (win) S.cheer(3);
  app.querySelector('[data-act="home"]').onclick = () => { S.tap(); showHome(); };
}

function showTrophy() {
  S.cheer(4);
  app.innerHTML = `<div class="screen center trophyscreen">
    <div class="confetti">${Array.from({ length: 40 }, (_, i) => `<i style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 2}s;background:${pick(['#f28c28', '#1d3557', '#f4c430', '#2a9d8f', '#e63946'])}"></i>`).join('')}</div>
    ${trophy(180)}
    <h1>CUP WINNERS!</h1>
    ${coony(100, 'cheer')}
    <p>Raccoon Rovers lift the cup! You mastered every skill on the paper. That's brilliant hard work, boss.</p>
    <button class="btn huge" data-act="home">Back to the club</button>
  </div>`;
  app.querySelector('[data-act="home"]').onclick = () => showHome();
}

// ============ grown ups ============
function keypadHTML() {
  return `<div class="keypad static">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(k => k ? `<button data-k="${k}">${k}</button>` : '<span></span>').join('')}</div>`;
}

function showPin(stage = null, first = '') {
  const setting = !player.parentPin;
  stage = stage || (setting ? 'set' : 'enter');
  const title = stage === 'set' ? 'Grown ups: choose a 4 digit PIN' : stage === 'confirm' ? 'Type the PIN again' : 'Grown ups only: enter the PIN';
  let pin = '';
  app.innerHTML = `<div class="screen center pin">
    <header class="topbar"><button class="iconbtn" data-act="back">🏠</button><b>${title}</b><span></span></header>
    <div class="pindots">${'<i></i>'.repeat(4)}</div>
    <p class="err"></p>
    ${keypadHTML()}
  </div>`;
  const dots = () => app.querySelectorAll('.pindots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
  app.querySelector('[data-act="back"]').onclick = () => showHome();
  app.querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
    S.tap();
    const k = b.dataset.k;
    if (k === '⌫') pin = pin.slice(0, -1); else if (pin.length < 4) pin += k;
    dots();
    if (pin.length < 4) return;
    await sleep(150);
    if (stage === 'set') return showPin('confirm', pin);
    if (stage === 'confirm') {
      if (pin === first) { player.parentPin = pin; await persist(); return showParent(); }
      return showPin('set');
    }
    if (pin === player.parentPin) return showParent();
    pin = ''; dots(); $('.err').textContent = 'That PIN isn\'t right.';
  });
}

function fmtDate(ms) {
  return new Date(ms).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' +
    new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function stillLearning() {
  const rows = QUESTIONS.map(q => ({ q, s: player.stats[q.id] }))
    .filter(r => r.s && r.s.seen && (r.s.cleanDays || []).length < 2 && (r.s.wrongs || r.s.hints || r.s.left))
    .sort((a, b) => (b.s.wrongs + b.s.hints * 0.5 + b.s.left * 2) - (a.s.wrongs + a.s.hints * 0.5 + a.s.left * 2));
  if (!rows.length) return '<p class="muted">Nothing stuck yet. Once Max has played a few rounds, anything he finds hard shows here.</p>';
  return `<ul class="learning">${rows.slice(0, 8).map(({ q, s }) => {
    const tags = Object.entries(s.tags || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t, n]) => `${esc(t)} (${n})`).join(', ');
    return `<li><b>Q${q.num}</b> ${CATEGORIES[q.cat].name}: ${q.methods.map(m => METHODS[m].name).join(', ')}
      <div class="muted">${s.wrongs} wrong step${s.wrongs === 1 ? '' : 's'}, ${s.hints} tip${s.hints === 1 ? '' : 's'} used${s.left ? `, left ${s.left} time${s.left === 1 ? '' : 's'}` : ''}${tags ? `. Mistakes: ${tags}` : ''}</div>
      <div class="muted">Try together: ${esc(q.hints[1].replace(/<[^>]+>.*$/s, ''))}</div></li>`;
  }).join('')}</ul>`;
}

function recLine(r) {
  const res = r.result === 'goal' ? '⚽ Goal' : r.result === 'comeback' ? '🔁 Comeback goal' : '⏸ Left for later';
  const wr = r.wrongs?.length ? `${r.wrongs.length} wrong step${r.wrongs.length === 1 ? '' : 's'}: ${r.wrongs.map(w => esc(w.tag)).join(', ')}` : 'no wrong steps';
  return `<li><b>Q${r.num}</b> ${res}. ${wr}. ${r.hints} tip${r.hints === 1 ? '' : 's'}. ${r.method ? 'Method: ' + METHODS[r.method]?.name : ''} <span class="muted">(${Math.round(r.secs / 60 * 10) / 10} min)</span></li>`;
}

async function showParent() {
  app.innerHTML = `<div class="screen parent"><header class="topbar"><button class="iconbtn" data-act="back">🏠</button><b>Grown ups</b><button class="link" data-act="signout">Sign out</button></header><p>Loading...</p></div>`;
  let sessions = [];
  try { sessions = await store.listSessions(30); } catch (e) { console.warn(e); }
  const cards = sessions.map((s, i) => `
    <div class="report">
      <div class="r-head"><b>${fmtDate(s.started)}</b><span>${s.mins} min</span></div>
      <div class="r-body">
        <span>✅ ${s.right} of ${s.records.length} right</span>
        <span>🔁 ${s.comebacks} comeback${s.comebacks === 1 ? '' : 's'}</span>
        ${s.match ? `<span>⚽ Rovers ${s.match.us}, ${esc(s.match.opp)} ${s.match.them}</span>` : '<span class="muted">Left before the match</span>'}
        ${s.skillUps?.length ? `<span>⭐ Up: ${s.skillUps.map(c => CATEGORIES[c].name).join(', ')}</span>` : ''}
      </div>
      <button class="link" data-detail="${i}">More detail</button>
      <ul class="detail" hidden>${s.records.map(recLine).join('')}</ul>
    </div>`).join('') || '<p class="muted">No sessions yet.</p>';
  app.innerHTML = `<div class="screen parent">
    <header class="topbar"><button class="iconbtn" data-act="back">🏠</button><b>Grown ups</b><button class="link" data-act="signout">Sign out</button></header>
    <h2>Skills</h2>
    <ul class="skilllist">${Object.entries(CATEGORIES).map(([k, c]) => `<li><span>${c.name}</span><span class="meter"><i style="width:${Math.round(skillPct(player.stats, k) * 100)}%"></i></span><span>${Math.round(skillPct(player.stats, k) * 100)}%</span></li>`).join('')}</ul>
    <p class="muted">A question counts as mastered once it's answered with no wrong steps and at most one tip, on two different days.</p>
    <h2>Methods still learning</h2>
    ${stillLearning()}
    <h2>Match reports</h2>
    ${cards}
  </div>`;
  app.querySelector('[data-act="back"]').onclick = () => showHome();
  app.querySelector('[data-act="signout"]').onclick = async () => { await store.signOut(); if (store.isDemo()) showLogin(); };
  app.querySelectorAll('[data-detail]').forEach(b => b.onclick = () => {
    const ul = b.nextElementSibling; ul.hidden = !ul.hidden; b.textContent = ul.hidden ? 'More detail' : 'Less detail';
  });
}

start();
