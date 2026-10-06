import { districts } from './game.js';

// All artwork is drawn locally. No remote assets or rendering service is needed.
export function createCity(canvas, getState, onSelect, onMove) {
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 700, height = 505, district = districts[0], selected = null, time = 0, last = 0;
  let hovered = null, moving = false, visible = true;
  const keys = new Set();
  const random = n => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(canvas);
  function path(points, fill, stroke) {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = .7; ctx.stroke(); }
  }
  function glowRect(x, y, w, h, color, blur = 12) {
    ctx.save(); ctx.shadowBlur = blur; ctx.shadowColor = color; ctx.fillStyle = color; ctx.fillRect(x, y, w, h); ctx.restore();
  }
  function building(x, base, w, h, depth, seed, neon, sign = '') {
    const roof = base - h;
    path([[x, roof], [x + w, roof], [x + w, base], [x, base]], '#182933', '#45617066');
    path([[x + w, roof], [x + w + depth, roof - depth * .45], [x + w + depth, base - depth * .45], [x + w, base]], '#101e28', '#355268');
    path([[x, roof], [x + depth, roof - depth * .45], [x + w + depth, roof - depth * .45], [x + w, roof]], '#2b3e46', '#466474');
    ctx.fillStyle = '#1e333e'; ctx.fillRect(x + 4, roof + 5, w - 8, 5);
    for (let row = 0; row < Math.floor((h - 15) / 14); row++) {
      for (let col = 0; col < Math.floor((w - 8) / 12); col++) {
        const lit = random(seed * 300 + row * 37 + col);
        ctx.fillStyle = lit > .78 ? neon + '9c' : lit > .48 ? '#688a9639' : '#0c1c25';
        ctx.fillRect(x + 7 + col * 12, roof + 16 + row * 14, 5, 6);
      }
      ctx.strokeStyle = '#43586233'; ctx.beginPath(); ctx.moveTo(x, roof + 25 + row * 14); ctx.lineTo(x + w, roof + 25 + row * 14); ctx.stroke();
    }
    const unitX = x + w * .2;
    path([[unitX, roof - 3], [unitX, roof - 12], [unitX + 22, roof - 12], [unitX + 27, roof - 7], [unitX + 27, roof - 3]], '#344650', '#536a73');
    ctx.strokeStyle = '#78909a77'; ctx.beginPath(); ctx.moveTo(x + w * .72, roof); ctx.lineTo(x + w * .72, roof - 28); ctx.stroke();
    glowRect(x + w * .72 - 1, roof - 29, 2, 2, neon, 6);
    if (sign) {
      const sx = x + w - 15, sy = roof + 17;
      ctx.fillStyle = '#0d161de6'; ctx.fillRect(sx - 4, sy - 5, 22, sign.length * 21 + 9);
      ctx.strokeStyle = neon + '88'; ctx.strokeRect(sx - 4, sy - 5, 22, sign.length * 21 + 9);
      ctx.save(); ctx.font = '16px sans-serif'; ctx.fillStyle = neon; ctx.shadowColor = neon; ctx.shadowBlur = 9;
      Array.from(sign).forEach((c, i) => ctx.fillText(c, sx - 1, sy + 14 + i * 21)); ctx.restore();
    }
    ctx.fillStyle = '#0a131bd9'; ctx.fillRect(x + w * .2, base - 24, w * .3, 24);
    glowRect(x + w * .2, base - 24, w * .3, 2, neon + '88', 9);
  }
  function streetLight(x, y, color) {
    ctx.strokeStyle = '#627983'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 53); ctx.lineTo(x + 17, y - 57); ctx.stroke();
    glowRect(x + 12, y - 58, 12, 3, color, 15);
    const cone = ctx.createRadialGradient(x + 15, y - 25, 3, x + 15, y - 25, 44); cone.addColorStop(0, color + '18'); cone.addColorStop(1, color + '00');
    ctx.fillStyle = cone; ctx.fillRect(x - 35, y - 70, 100, 80);
    ctx.fillStyle = '#172d35'; ctx.fillRect(x - 4, y - 3, 8, 4);
  }
  function draw() {
    if (!width) return;
    const w = width, h = height, index = districts.findIndex(d => d.id === district.id), accent = district.color;
    ctx.clearRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#091824'); sky.addColorStop(.45, '#263b44'); sky.addColorStop(1, '#0d1c24'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    // Layered skyline and the faint light of an unseen city.
    for (let i = 0; i < 22; i++) {
      const x = i * w / 20 - 14, bh = (90 + random(i + 8) * 125) * h / 505, bw = 20 + random(i) * 38;
      ctx.fillStyle = i % 2 ? '#10232c' : '#152b35'; ctx.fillRect(x, h * .48 - bh, bw, bh);
      for (let row = 0; row < bh / 12; row++) for (let col = 0; col < bw / 9; col++) {
        ctx.fillStyle = random(i * 77 + row * 13 + col) > .6 ? '#85b2bd22' : '#2b465022'; ctx.fillRect(x + col * 9 + 4, h * .48 - bh + row * 12 + 5, 2, 3);
      }
    }
    const fog = ctx.createLinearGradient(0, h * .17, 0, h * .6); fog.addColorStop(0, '#75969700'); fog.addColorStop(.65, '#75969721'); fog.addColorStop(1, '#75969700'); ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h);
    // Elevated rail and support pylons.
    path([[0, h * .36], [w, h * .31], [w, h * .335], [0, h * .385]], '#172a33', '#59748177');
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#23363d'; ctx.fillRect(i * w / 4 + 14, h * .37, 5, h * .13); }
    ctx.strokeStyle = '#95b4b155'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(0, h * .355); ctx.lineTo(w, h * .305); ctx.stroke();
    // Wet plaza, road markings, cable ducts, reflections.
    path([[0, h * .47], [w, h * .42], [w, h], [0, h]], '#14262d');
    for (let i = 0; i < 13; i++) {
      ctx.strokeStyle = '#66858a18'; ctx.beginPath(); ctx.moveTo(-w * .3 + i * w * .14, h); ctx.lineTo(w * .12 + i * w * .064, h * .43); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, h * (.48 + i * .045)); ctx.lineTo(w, h * (.44 + i * .045)); ctx.stroke();
    }
    path([[0, h * .66], [w, h * .57], [w, h * .67], [0, h * .77]], '#0f222c');
    path([[w * .43, h * .45], [w * .51, h * .45], [w * .67, h], [w * .47, h]], '#10222b');
    ctx.setLineDash([10, 15]); ctx.strokeStyle = '#89a79444'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, h * .709); ctx.lineTo(w, h * .621); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 95; i++) {
      const rx = random(i * 17 + 4) * w, ry = h * (.49 + random(i + 37) * .5);
      ctx.fillStyle = i % 3 === 0 ? accent + '18' : '#a4bfd00c'; ctx.fillRect(rx, ry, 3 + random(i) * 30, .8);
    }
    if (index === 0) {
      building(w * -.035, h * .61, w * .18, h * .26, 20, 1, '#98c5c1', '雨港');
      building(w * .18, h * .49, w * .18, h * .22, 21, 2, '#d5af88', '旅館');
      building(w * .48, h * .44, w * .20, h * .29, 23, 3, '#a4dabc', '記憶');
      building(w * .81, h * .54, w * .19, h * .4, 27, 4, '#a393bf', '電脳');
      // A train carriage, now part of the crime scene.
      path([[w * .28, h * .54], [w * .56, h * .515], [w * .56, h * .578], [w * .28, h * .604]], '#263b43', '#627e81');
      for (let i = 0; i < 5; i++) glowRect(w * (.30 + i * .045), h * (.55 - i * .004), w * .029, h * .023, '#72a6a345', 3);
      ctx.strokeStyle = '#c4b46d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * .32, h * .63); ctx.lineTo(w * .54, h * .60); ctx.stroke();
      for (let i = 0; i < 8; i++) { ctx.fillStyle = '#1a2228'; ctx.fillRect(w * (.32 + i * .028), h * (.629 - i * .0038), w * .012, 3); }
      ctx.fillStyle = '#6f999633'; ctx.fillRect(w * .72, h * .49, 12, 22); glowRect(w * .72 + 2, h * .49 + 3, 8, 8, '#a5d6ba88');
    } else if (index === 1) {
      building(w * -.02, h * .56, w * .23, h * .33, 18, 9, '#d5906e', '食堂');
      building(w * .28, h * .50, w * .18, h * .28, 20, 10, '#b6d3a1', '夜市');
      building(w * .56, h * .43, w * .19, h * .30, 20, 11, '#c88ba2', '夢');
      building(w * .84, h * .59, w * .17, h * .36, 23, 12, '#d1b171', '商店');
      for (let i = 0; i < 5; i++) {
        const x = w * (.10 + i * .16), y = h * (.57 + i * .003);
        path([[x, y], [x + w * .08, y - 13], [x + w * .13, y], [x + w * .03, y + 13]], i % 2 ? '#765a49' : '#44645c', '#b08b6777');
        ctx.fillStyle = '#354447'; ctx.fillRect(x + 6, y + 12, w * .10, 25); glowRect(x + 7, y + 9, w * .09, 2, '#e2be87', 10);
      }
      ctx.strokeStyle = '#4d686a'; ctx.beginPath(); ctx.moveTo(0, h * .48); ctx.quadraticCurveTo(w * .5, h * .57, w, h * .4); ctx.stroke();
      for (let i = 0; i < 8; i++) { const x = w * (i / 8 + .04), y = h * (.47 + Math.sin(i / 8 * Math.PI) * .035); glowRect(x, y, 7, 11, '#dba078', 12); }
    } else if (index === 2) {
      building(w * -.04, h * .59, w * .22, h * .33, 25, 18, '#86b8ca', '白噪');
      building(w * .22, h * .52, w * .28, h * .30, 26, 19, '#98c9dd', '診所');
      building(w * .62, h * .46, w * .17, h * .26, 23, 20, '#9cd0b4', '生命');
      building(w * .86, h * .58, w * .17, h * .38, 22, 21, '#98abce', '醫療');
      glowRect(w * .28, h * .32, 28, 6, '#a0dbe0', 16); glowRect(w * .28 + 11, h * .32 - 11, 6, 28, '#a0dbe0', 16);
      ctx.fillStyle = '#183a35'; ctx.beginPath(); ctx.ellipse(w * .55, h * .83, 43, 12, -.1, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6d9d87'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * .56, h * .84); ctx.lineTo(w * .56, h * .73); ctx.lineTo(w * .53, h * .69); ctx.moveTo(w * .56, h * .78); ctx.lineTo(w * .60, h * .72); ctx.stroke();
      glowRect(w * .53 - 3, h * .69 - 3, 6, 6, '#90c6a1', 16); glowRect(w * .60 - 3, h * .72 - 3, 6, 6, '#90c6a1', 16);
    } else {
      building(w * -.03, h * .56, w * .2, h * .42, 23, 27, '#a9a5d2', '天穹');
      building(w * .21, h * .47, w * .27, h * .41, 28, 28, '#bcb2df', '秩序');
      building(w * .57, h * .43, w * .24, h * .48, 28, 29, '#a1b6d4', '明日');
      building(w * .88, h * .60, w * .18, h * .39, 22, 30, '#a19cbf', '永恒');
      for (let i = 0; i < 4; i++) glowRect(w * (.27 + i * .045), h * .48 + i * 3, w * .045, 2, '#afa9d77a', 6);
      path([[w * .35, h * .63], [w * .75, h * .59], [w * .75, h * .66], [w * .35, h * .71]], '#2e3b46', '#73808d');
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = '#82909f55'; ctx.beginPath(); ctx.moveTo(w * .35, h * (.64 + i * .015)); ctx.lineTo(w * .75, h * (.60 + i * .015)); ctx.stroke(); }
    }
    // Vapor, foreground utility boxes, wires and puddles.
    for (let i = 0; i < 4; i++) {
      const vx = w * (.11 + i * .245), vy = h * .73;
      const vapor = ctx.createRadialGradient(vx, vy - 22, 0, vx, vy - 22, 33); vapor.addColorStop(0, '#b1c8c111'); vapor.addColorStop(1, '#b1c8c100'); ctx.fillStyle = vapor; ctx.fillRect(vx - 40, vy - 70, 80, 70);
    }
    streetLight(w * .17, h * .77, '#e1c091'); streetLight(w * .79, h * .71, '#acccbd');
    path([[0, h * .83], [w * .17, h * .87], [w * .17, h], [0, h]], '#101f28', '#31434a');
    ctx.fillStyle = '#293d46'; ctx.fillRect(w * .04, h * .87, w * .09, 18); ctx.strokeStyle = '#54717d'; ctx.strokeRect(w * .04, h * .87, w * .09, 18);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#10232c'; ctx.fillRect(w * .05, h * .87 + 3 + i * 2, w * .065, 1); }
    path([[w * .86, h * .87], [w, h * .83], [w, h], [w * .86, h]], '#14222d', '#354651');
    glowRect(w * .87, h * .89, 2, h * .11, accent + '55', 12);
    // Small passing hovercar, intentionally subtle.
    const carX = ((time * .018 + .2) % 1.4 - .2) * w;
    if (!reduced) { ctx.fillStyle = '#49636c'; ctx.fillRect(carX, h * .385 - carX / w * 16, 22, 5); glowRect(carX + 21, h * .385 - carX / w * 16 + 2, 3, 2, '#e6c392', 7); }
    // NPC silhouettes and accessible map points.
    district.points.forEach((p, i) => {
      const x = p.x * w, y = p.y * h, active = p.id === selected || p.id === hovered;
      if (p.kind === '对话') person(x + 12, y + 26, i === 2 && index === 3 ? '#c6ccd6' : '#8b9d9f', false);
      ctx.save(); ctx.shadowColor = active ? accent : '#adc9b0'; ctx.shadowBlur = active ? 17 : 5;
      ctx.beginPath(); ctx.arc(x, y, active ? 10 : 8, 0, Math.PI * 2); ctx.fillStyle = active ? '#344635e8' : '#14272ee8'; ctx.fill(); ctx.strokeStyle = active ? accent : '#abc4b499'; ctx.lineWidth = 1; ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = active ? accent : '#bed1bf'; ctx.textAlign = 'center'; ctx.font = '10px sans-serif'; ctx.fillText(p.kind === '对话' ? '·' : '+', x, y + 3);
      const textWidth = ctx.measureText(p.name).width;
      ctx.fillStyle = active ? '#1c2c26ee' : '#0c1c25db'; ctx.fillRect(x - textWidth / 2 - 8, y + 14, textWidth + 16, 22);
      ctx.strokeStyle = active ? '#829f6688' : '#698a8055'; ctx.lineWidth = .6; ctx.strokeRect(x - textWidth / 2 - 8, y + 14, textWidth + 16, 22);
      ctx.fillStyle = active ? '#d2e8c2' : '#a7c0b8'; ctx.font = '10px sans-serif'; ctx.fillText(p.name, x, y + 29); ctx.restore();
    });
    const player = getState().player;
    person(player.x * w, player.y * h, '#adb8a4', true);
    ctx.fillStyle = '#cee0c6'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('你', player.x * w, player.y * h + 15);
    // Rain is the last layer, so it catches the neon.
    ctx.lineWidth = .6; ctx.strokeStyle = '#a2c5d126';
    for (let i = 0; i < 150; i++) {
      const rx = ((random(i + 81) * w + (reduced ? 0 : time * .012)) % (w + 30)) - 15;
      const ry = (random(i * 7 + 31) * h + (reduced ? 0 : time * (.11 + random(i) * .09))) % h;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 9 + random(i) * 7); ctx.stroke();
    }
    const vignette = ctx.createRadialGradient(w / 2, h * .55, w * .2, w / 2, h * .55, w * .8); vignette.addColorStop(0, '#00000000'); vignette.addColorStop(1, '#020c1699'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);
  }
  function person(x, y, color, player) {
    ctx.fillStyle = '#020c1188'; ctx.beginPath(); ctx.ellipse(x, y + 2, 10, 3, -.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#14232b'; ctx.fillRect(x - 4, y - 4, 3, 8); ctx.fillRect(x + 2, y - 4, 3, 8);
    path([[x - 5, y - 20], [x + 5, y - 20], [x + 8, y - 3], [x - 8, y - 3]], player ? '#7d8a73' : '#384950');
    ctx.fillStyle = color; ctx.fillRect(x - 3, y - 27, 6, 7);
    if (player) { ctx.fillStyle = '#a0ac94'; ctx.fillRect(x - 6, y - 29, 12, 3); ctx.fillRect(x - 4, y - 32, 8, 3); ctx.strokeStyle = '#c8dcaa'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y + 3, 12, 4, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
  function findPoint(event) {
    const r = canvas.getBoundingClientRect(), x = (event.clientX - r.left) / width, y = (event.clientY - r.top) / height;
    return district.points.find(p => Math.abs(p.x - x) < .075 && y > p.y - .04 && y < p.y + .09);
  }
  canvas.addEventListener('pointermove', e => { hovered = findPoint(e)?.id || null; canvas.style.cursor = hovered ? 'pointer' : 'crosshair'; });
  canvas.addEventListener('pointerleave', () => { hovered = null; });
  canvas.addEventListener('click', e => {
    const p = findPoint(e);
    if (p) onSelect(p.id);
    else { const r = canvas.getBoundingClientRect(); getState().player = { x: Math.max(.12, Math.min(.88, (e.clientX - r.left) / width)), y: Math.max(.46, Math.min(.88, (e.clientY - r.top) / height)) }; onMove(); }
  });
  document.addEventListener('keydown', e => {
    if (!visible || document.querySelector('dialog[open]') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) { keys.add(key); e.preventDefault(); }
  });
  document.addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); if (moving && !keys.size) { moving = false; onMove(); } });
  window.addEventListener('blur', () => { keys.clear(); if (moving) { moving = false; onMove(); } });
  function frame(now) {
    const delta = Math.min(now - last, 40); last = now; time = now;
    if (visible && !document.hidden) {
      if (keys.size && !document.querySelector('dialog[open]')) {
        const player = getState().player;
        let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
        let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
        const length = Math.hypot(dx, dy) || 1; dx /= length; dy /= length;
        player.x = Math.max(.12, Math.min(.88, player.x + dx * delta * .00022)); player.y = Math.max(.46, Math.min(.88, player.y + dy * delta * .00022)); moving = true;
      }
      if (!reduced || keys.size || hovered || selected) draw();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame); resize();
  return { resize, setDistrict(d, id) { district = d; selected = id; draw(); } };
}
