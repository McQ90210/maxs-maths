// Handwriting scratch pad on squared paper. Saved per question on this device.
export function createPad(container, key) {
  container.innerHTML = `
    <div class="pad-tools">
      <button class="tool on" data-tool="pen" aria-label="Pen">✏️ Pen</button>
      <button class="tool" data-tool="eraser" aria-label="Eraser">🧽 Eraser</button>
      <button class="tool" data-act="undo" aria-label="Undo">↩️ Undo</button>
      <button class="tool" data-act="clear" aria-label="Clear">🗑️ Clear</button>
    </div>
    <div class="pad-sheet"><canvas></canvas></div>`;
  const canvas = container.querySelector('canvas');
  const sheet = container.querySelector('.pad-sheet');
  const g = canvas.getContext('2d');
  let strokes = [];
  try { strokes = JSON.parse(localStorage.getItem('pad_' + key) || '[]'); } catch (e) { strokes = []; }
  let tool = 'pen', cur = null, penSeen = false;

  const save = () => { try { localStorage.setItem('pad_' + key, JSON.stringify(strokes)); } catch (e) { /* full */ } };

  function size() {
    const r = sheet.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function drawStroke(s) {
    if (!s.pts.length) return;
    g.save();
    g.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
    g.strokeStyle = '#1b2a4a';
    g.lineWidth = s.erase ? 22 : 2.6;
    g.lineCap = g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(s.pts[0][0], s.pts[0][1]);
    if (s.pts.length === 1) g.lineTo(s.pts[0][0] + 0.1, s.pts[0][1] + 0.1);
    for (let i = 1; i < s.pts.length; i++) g.lineTo(s.pts[i][0], s.pts[i][1]);
    g.stroke();
    g.restore();
  }
  function redraw() {
    g.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach(drawStroke);
  }
  const pos = e => {
    const r = canvas.getBoundingClientRect();
    return [Math.round((e.clientX - r.left) * 10) / 10, Math.round((e.clientY - r.top) * 10) / 10];
  };

  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'pen') penSeen = true;
    if (penSeen && e.pointerType === 'touch') return; // palm rejection once a stylus is used
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    cur = { erase: tool === 'eraser', pts: [pos(e)] };
    strokes.push(cur);
    drawStroke(cur);
  });
  canvas.addEventListener('pointermove', e => {
    if (!cur) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) cur.pts.push(pos(ev));
    redraw();
  });
  const end = () => { if (cur) { cur = null; save(); } };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  container.querySelector('.pad-tools').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tool) {
      tool = b.dataset.tool;
      container.querySelectorAll('[data-tool]').forEach(x => x.classList.toggle('on', x === b));
    } else if (b.dataset.act === 'undo') { strokes.pop(); redraw(); save(); }
    else if (b.dataset.act === 'clear') { if (strokes.length) { strokes = []; redraw(); save(); } }
  });

  const ro = new ResizeObserver(size);
  ro.observe(sheet);
  size();
  return { destroy: () => ro.disconnect() };
}
