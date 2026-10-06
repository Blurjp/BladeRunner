import './style.css';
import { districts, clues, neededEvidence, freshState, restoreState, collect, travel, objective, deduce, finish } from './game.js';
import { createCity } from './city.js';

const STORAGE = 'rainharbor.save.v1';
let storageAvailable = true;
let stored = null;
try { stored = localStorage.getItem(STORAGE); } catch { storageAvailable = false; }
let state = restoreState(stored);
let selected = null;
let tab = 'world';
let dialogReturn = null;
let audioContext = null;
let audioNodes = [];
const icons = {
  world: '<path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v8M7 5.8l9 5"/>',
  case: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 5V3h6v2M8 10h8M8 14h5M8 18h3"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
  signal: '<path d="M4 18v-3M9 18v-6M14 18V9M19 18V5"/>',
  sound: '<path d="m10 5-5 4H2v6h3l5 4V5ZM14 8c3 2 3 6 0 8M17 5c5 4 5 10 0 14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
};
const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.compass}</svg>`;
const app = document.querySelector('#app');
app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="雨港首页"><span class="brand-mark">雨</span><span>雨港<span class="brand-en">RAINHARBOR</span></span><span class="edition">A DETECTIVE RPG</span></a>
    <nav class="main-nav" aria-label="游戏视图"><button class="nav-button active" data-tab="world">${icon('world')}探索世界</button><button class="nav-button" data-tab="case">${icon('case')}案件板<span id="nav-count" class="nav-count">0</span></button></nav>
    <div class="top-right"><span class="system-status"><i></i>世界在线</span><button id="sound" class="icon-button" aria-label="开启雨夜环境音" aria-pressed="false">${icon('sound')}</button><button id="help" class="icon-button help-button" aria-label="操作指南">?</button></div>
  </header>
  <main>
    <section class="chapter-heading"><div><div class="eyebrow">雨港市 / 2089.11.07</div><h1>每段记忆，都有代价<span>。</span></h1><p>在永不停歇的雨里，寻找被城市遗忘的真相。</p></div><div class="weather"><span class="rain-icon">╱╱╱</span><div>持续降雨<span>23:41 · 14°C</span></div></div></section>
    <section class="case-strip" aria-label="当前案件"><div class="case-symbol">${icon('case', 23)}</div><div class="case-strip-title"><span>正在调查 <b>CASE 001</b></span><strong>雨中失踪的记忆</strong></div><div class="strip-divider"></div><div class="strip-objective"><span>当前目标</span><strong id="objective"></strong></div><div class="case-progress"><span id="progress-text"></span><div class="progress-track"><div id="progress-fill"></div></div></div><button id="open-case" class="text-button">查看案件 ${icon('arrow')}</button></section>
    <section id="world-view" class="workspace-grid">
      <aside class="district-panel"><div class="panel-label">城市导航<span>04 SECTORS</span></div><h2>今夜，去哪里？</h2><div id="district-list"></div><div class="city-notice"><span class="tiny-label">CITY BULLETIN / 07</span><p>记忆不等于意识。<br>还是说，它们本就相同？</p><span class="notice-line"></span><small>天穹集团 · 让明天更清晰</small></div><div class="player-card"><span class="player-avatar">林</span><div><strong>林渡 <span>调查员</span></strong><small id="credits"></small></div><span class="online-dot"></span></div></aside>
      <section class="map-panel"><div class="map-top"><div><span class="live-dot"></span><span id="map-location"></span></div><span id="map-en"></span></div><div class="canvas-wrap"><canvas id="city" tabindex="0" aria-label="可探索的雨港地图，使用方向键或 WASD 移动，点击标记调查。"></canvas><div class="map-caption"><span class="map-tag">自由探索</span><h2 id="map-title"></h2><p id="map-description"></p></div><div class="map-coordinates">31°14′ N / 121°28′ E<span>ZONE SCANNER ACTIVE</span></div><div class="map-help"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移动</span><span><kbd>E</kbd> 交互</span><span class="click-hint">点击地点调查</span></div></div><div class="location-list" id="location-list" aria-label="附近可交互地点"></div></section>
      <aside class="interaction-panel"><div class="panel-label">现场记录<span>FIELD NOTES</span></div><div id="interaction"></div><div class="evidence-summary"><div class="panel-label">已收集线索<button id="all-evidence" class="small-link">全部 ${icon('arrow', 13)}</button></div><div id="recent-evidence"></div></div></aside>
    </section>
    <section id="case-view" hidden></section>
    <footer><span><i></i><span id="save-status">本地自动存档</span></span><span>一个关于记忆、选择与存在的故事</span><button id="reset">重新开始</button></footer>
  </main>
  <div id="toast" role="status" aria-live="polite"></div>
  <dialog id="modal"><button id="close-modal" class="modal-close" aria-label="关闭">×</button><div id="modal-content"></div></dialog>
`;

const $ = (selector) => document.querySelector(selector);
const city = createCity($('#city'), () => state, selectPoint, moved);
function save() {
  try { localStorage.setItem(STORAGE, JSON.stringify(state)); $('#save-status').textContent = '本地自动存档 · 已保存'; }
  catch { storageAvailable = false; $('#save-status').textContent = '存储不可用 · 当前进度仅在本次会话保留'; }
}
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500); }
function moved() { save(); }
function currentDistrict() { return districts.find(d => d.id === state.district); }
function updateHUD() {
  $('#objective').textContent = objective(state);
  $('#progress-text').textContent = state.ending ? '案件已结' : `${state.evidence.length} / ${Object.keys(clues).length} 线索`;
  $('#progress-fill').style.width = `${state.evidence.length / Object.keys(clues).length * 100}%`;
  $('#nav-count').textContent = state.evidence.length;
  $('#credits').textContent = `¥ ${state.credits} 信用点${state.warmth ? ' · 一碗面的温暖' : ''}`;
  $('#recent-evidence').innerHTML = state.evidence.length ? state.evidence.slice(-3).reverse().map(id => `<button class="recent-clue" data-clue="${id}"><span class="clue-diamond">◇</span><span>${clues[id].title}<small>${clues[id].category} / ${clues[id].source.split(' · ')[0]}</small></span>${icon('arrow', 14)}</button>`).join('') : '<div class="empty-evidence">◇<p>城市留下了痕迹。<br>从封锁现场开始寻找。</p></div>';
  $('#district-list').innerHTML = districts.map(d => `<button class="district-button ${state.district === d.id ? 'active' : ''}" data-district="${d.id}" style="--district-color:${d.color}"><span class="district-number">${d.number}</span><span class="district-info"><strong>${d.name}</strong><small>${d.en}</small></span><span class="district-meta">${state.district === d.id ? '当前' : state.visited.includes(d.id) ? '已探索' : d.tag}</span></button>`).join('');
}
function renderWorld() {
  const d = currentDistrict();
  $('#map-location').textContent = `雨港 / ${d.name}`;
  $('#map-en').textContent = `SECTOR ${d.number} · ${d.en}`;
  $('#map-title').textContent = d.name;
  $('#map-description').textContent = d.description;
  $('#location-list').innerHTML = d.points.map(p => `<button class="location-button ${selected?.id === p.id ? 'selected' : ''}" data-point="${p.id}"><span class="location-dot ${p.kind === '对话' ? 'person' : ''}"></span><span>${p.name}</span><small>${p.kind}</small></button>`).join('');
  city.setDistrict(d, selected?.id);
  renderInteraction();
}
function renderInteraction(response = null) {
  const panel = $('#interaction');
  if (!selected) {
    panel.innerHTML = `<div class="scene-art intro-art"><div class="scanner-ring"></div><div class="scene-cross">+</div><span>NO SIGNAL LOST</span></div><span class="tiny-label accent">侦探的夜晚 / PROLOGUE</span><h2>城市不会主动开口。</h2><p class="scene-text">林弥死在了旧港的雨里。公司说是故障，街坊说是谋杀。你接下了这份没人想接的委托。</p><p class="scene-text muted">在地图上选择一个地点，或走近标记按 E。每个人都有秘密，每段记忆都可能是线索。</p><button class="action-button primary" data-select-first>调查封锁现场 ${icon('arrow')}</button>`;
    return;
  }
  const character = selected.kind === '对话';
  panel.innerHTML = `<div class="scene-art ${character ? 'portrait-art' : 'object-art'} ${selected.id === 'n7' ? 'n7-art' : ''}"><div class="scene-grid"></div>${character ? '<div class="person-silhouette"><div class="person-head"></div><div class="person-body"></div></div>' : `<div class="object-symbol">${selected.id === 'terminal' ? '⌘' : selected.id === 'radio' ? '≋' : '◇'}</div>`}<span>${character ? 'PERSON OF INTEREST' : 'ENVIRONMENT SCAN'} / ${currentDistrict().number}</span><div class="art-corner"></div></div><div class="scene-label"><span class="tiny-label accent">${selected.kind} / ${currentDistrict().name}</span><span class="scene-indicator">●</span></div><h2>${selected.name}</h2><p class="scene-text ${character ? 'dialogue-text' : ''}">${response || selected.text}</p><div class="scene-actions">${selected.actions.map(a => {
    const done = (a.clue && state.evidence.includes(a.clue)) || (a.side && state.done.includes(a.side));
    const locked = a.requires && !state.evidence.includes(a.requires);
    return `<button class="action-button ${done ? 'completed' : ''}" data-action="${a.id}" ${done || locked ? 'disabled' : ''}>${done ? '✓ ' : ''}${a.label}${done ? '<small>已完成</small>' : locked ? `<small>需要${clues[a.requires].title}</small>` : icon('arrow', 15)}</button>`;
  }).join('')}</div>`;
}
function selectPoint(id) {
  selected = currentDistrict().points.find(p => p.id === id);
  if (!selected) return;
  state.player = { x: Math.max(.12, Math.min(.88, selected.x - .045)), y: Math.min(.88, selected.y + .07) };
  save(); renderWorld();
  if (matchMedia('(max-width: 650px)').matches) $('#interaction').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}
function doAction(id) {
  const action = selected?.actions.find(a => a.id === id);
  if (!action || (action.requires && !state.evidence.includes(action.requires))) return;
  if (action.clue) {
    if (collect(state, action.clue)) toast(`线索已归档：${clues[action.clue].title}`);
    renderInteraction(clues[action.clue].text);
  } else if (action.response) renderInteraction(action.response);
  else if (action.puzzle) openDecrypt();
  else if (action.side === 'radio' && !state.done.includes('radio')) {
    state.done.push('radio'); state.credits += 30;
    renderInteraction('「这里是雨港自由电台。听到的人，如果你今晚也很孤独，下一首歌送给你。」你修好了电台，机主转来 30 信用点。'); toast('支线完成 · 雨中的声音 / + ¥ 30');
  } else if (action.side === 'noodles' && !state.done.includes('noodles')) {
    if (state.credits < 15) { toast('信用点不足。先试着修好旧港的电台。'); return; }
    state.done.push('noodles'); state.credits -= 15; state.warmth = 1;
    renderInteraction('热汤暖着你的手。阿婆给你多加了半个蛋。「有些事情查不明白，也得先吃饭。」你觉得这座城市没有那么冷了。'); toast('− ¥ 15 · 获得「一碗面的温暖」');
  }
  save(); updateHUD(); if (tab === 'case') renderCase();
}
function openModal(html) {
  dialogReturn = document.activeElement;
  $('#modal-content').innerHTML = html;
  if (!$('#modal').open) $('#modal').showModal();
}
function openDecrypt() {
  if (state.evidence.includes('directive')) { showClue('directive'); return; }
  openModal(`<span class="eyebrow">ZENITH / ENCRYPTED ARCHIVE</span><h2>一个不该被删除的生日</h2><p>「不是编号，是她来到世界的那一天。」<br>输入林弥留下的四位密码。</p><form id="decrypt-form"><label for="passcode">四位数字</label><input id="passcode" name="passcode" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="0 0 0 0" autocomplete="off" required /><p id="puzzle-message" role="status">提示：夜市的阿婆记得那个孩子。</p><button class="action-button primary" type="submit">解密档案 ${icon('arrow')}</button></form>`);
  $('#decrypt-form').addEventListener('submit', e => {
    e.preventDefault();
    if ($('#passcode').value !== '0417') { $('#puzzle-message').textContent = '密码错误。想想 N-7 的生日，而不是她的编号。'; return; }
    collect(state, 'directive'); save(); updateHUD(); closeModal(); renderInteraction(clues.directive.text); toast('关键证据已归档：吴监理的签名指令');
  });
}
function showClue(id) {
  if (!state.evidence.includes(id)) return;
  const c = clues[id];
  openModal(`<span class="eyebrow">EVIDENCE / ${c.category}</span><h2>${c.title}</h2><p class="clue-source">${c.source}</p><p class="clue-detail">${c.text}</p><div class="verified-tag">✓ 已归档至案件 001</div>`);
}
function closeModal() { $('#modal').close(); dialogReturn?.focus(); }
function switchTab(next) {
  tab = next;
  document.querySelectorAll('[data-tab]').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
  $('#world-view').hidden = tab !== 'world'; $('#case-view').hidden = tab !== 'case';
  if (tab === 'case') renderCase(); else { city.resize(); renderWorld(); }
}
function renderCase() {
  const enough = neededEvidence.every(id => state.evidence.includes(id));
  $('#case-view').innerHTML = `<div class="board-heading"><div><span class="eyebrow">CASE FILE / 001</span><h2>雨中失踪的记忆</h2><p>林弥 · 记忆档案员 / 旧港 / 23:17</p></div><span class="case-state">${state.ending ? '已结案' : state.solved ? '真相已确认' : '调查进行中'}</span></div><div class="case-layout"><div><div class="panel-label">证据档案<span>${state.evidence.length} RECORDS</span></div><div class="evidence-grid">${Object.entries(clues).map(([id, c], i) => `<button class="evidence-card ${state.evidence.includes(id) ? 'found' : 'missing'}" data-clue="${id}" ${!state.evidence.includes(id) ? 'disabled' : ''}><span class="evidence-number">E—${String(i + 1).padStart(2, '0')}</span><span class="evidence-type">${state.evidence.includes(id) ? c.category : '未发现'}</span><h3>${state.evidence.includes(id) ? c.title : '未知线索'}</h3><p>${state.evidence.includes(id) ? c.text : '探索城市，与人物交谈，留下你的现场记录。'}</p><small>${state.evidence.includes(id) ? c.source : '等待调查'} ${state.evidence.includes(id) ? '↗' : ''}</small></button>`).join('')}</div></div><aside class="deduction-panel">${state.solved ? endingPanel() : `<span class="eyebrow">CONNECT THE DOTS</span><h3>拼起最后一块真相。</h3><p>谁动的手？如何做到？又为什么？让证据来回答。</p><form id="deduction-form"><label for="suspect">01 / 嫌疑人</label><select id="suspect" required><option value="">选择嫌疑人</option><option value="han">韩医生</option><option value="lu">陆巡警</option><option value="wu">吴监理</option></select><label for="method">02 / 作案方式</label><select id="method" required><option value="">选择作案方式</option><option value="weapon">现场枪击</option><option value="overload">远程神经过载</option><option value="accident">自然设备故障</option></select><label for="motive">03 / 动机</label><select id="motive" required><option value="">选择动机</option><option value="debt">追讨记忆交易债务</option><option value="revenge">私人复仇</option><option value="audit">阻止意识审计公开</option></select><p id="deduction-message" role="status">${enough ? '✓ 关键证据已齐全，可以提交推理。' : `关键证据 ${neededEvidence.filter(id => state.evidence.includes(id)).length} / ${neededEvidence.length} · 继续探索以补全证据链。`}</p><button class="action-button primary" type="submit" ${!enough ? 'disabled' : ''}>提交推理 ${icon('arrow')}</button></form>`}</aside></div>`;
  $('#deduction-form')?.addEventListener('submit', e => {
    e.preventDefault(); const result = deduce(state, $('#suspect').value, $('#method').value, $('#motive').value);
    if (result.ok) { save(); updateHUD(); renderCase(); toast('推理成立 · 真相不会再被雨冲走'); } else $('#deduction-message').textContent = result.reason;
  });
}
function endingPanel() {
  if (state.ending) return `<span class="eyebrow">CASE CLOSED / ${state.ending === 'publish' ? 'THE FIRST DAWN' : 'A NAME OF HER OWN'}</span><h3>${state.ending === 'publish' ? '结局 · 第一束晨光' : '结局 · 她自己的名字'}</h3><p>${state.ending === 'publish' ? '你向自由电台公开了审计与签名指令。吴监理被停职，城市第一次听见 N-7 的声音。合成人的权利仍有漫长的路，但她选择了站出来。' : '你将谋杀证据送交独立法庭，保留 N-7 的身份信息。吴监理受到调查，而小弥带着林弥的记忆离开了雨港。她终于拥有不必向谁解释的明天。'}</p><div class="ending-reward">委托完成 <strong>+ ¥ 200</strong></div><p class="ending-note">${state.done.includes('radio') ? '修好的电台播出了属于她们的歌。' : '街头的收音机还在等待被修好。'}${state.warmth ? '阿婆为你留了一碗热面。' : ''}</p><button class="action-button" data-return-world>回到城市 ${icon('arrow')}</button>`;
  return `<span class="eyebrow">THE TRUTH IS YOURS</span><h3>真相已明。接下来呢？</h3><p>吴监理签发过载指令，杀害林弥，企图掩盖合成人的自主意识。N-7 把证词交给了你，也把她的未来交给了你。</p><div class="ending-choice"><h4>公开全部审计</h4><p>让城市听见 N-7 的声音。她同意出面，但将承担被公司盯上的风险。</p><button class="action-button primary" data-ending="publish">让真相见光 ${icon('arrow')}</button></div><div class="ending-choice"><h4>保护证人的身份</h4><p>提交谋杀证据，隐去 N-7 的身份。让她离开雨港，开始自己的人生。</p><button class="action-button" data-ending="protect">给她一个明天 ${icon('arrow')}</button></div>`;
}
function toggleAudio() {
  if (audioContext) {
    audioNodes.forEach(n => n.disconnect()); audioNodes = []; audioContext.close(); audioContext = null;
    $('#sound').setAttribute('aria-pressed', 'false'); $('#sound').setAttribute('aria-label', '开启雨夜环境音'); toast('环境音已关闭'); return;
  }
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    audioContext = new Context();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    const source = audioContext.createBufferSource(); source.buffer = buffer; source.loop = true;
    const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1100;
    const gain = audioContext.createGain(); gain.gain.value = .09;
    source.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); source.start();
    audioNodes = [source, filter, gain]; $('#sound').setAttribute('aria-pressed', 'true'); $('#sound').setAttribute('aria-label', '关闭雨夜环境音'); toast('雨夜环境音已开启');
  } catch { audioContext = null; toast('此浏览器暂不支持环境音'); }
}
app.addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.tab) switchTab(button.dataset.tab);
  else if (button.dataset.district) { travel(state, button.dataset.district); selected = null; save(); updateHUD(); renderWorld(); toast(`抵达 ${currentDistrict().name}`); }
  else if (button.dataset.point) selectPoint(button.dataset.point);
  else if (button.hasAttribute('data-select-first')) selectPoint('body');
  else if (button.dataset.action) doAction(button.dataset.action);
  else if (button.dataset.clue) showClue(button.dataset.clue);
  else if (button.dataset.ending) { if (finish(state, button.dataset.ending)) { save(); updateHUD(); renderCase(); toast('案件已结 · 委托奖励 + ¥ 200'); } }
  else if (button.hasAttribute('data-return-world')) switchTab('world');
});
$('#open-case').addEventListener('click', () => switchTab('case'));
$('#all-evidence').addEventListener('click', () => switchTab('case'));
$('#sound').addEventListener('click', toggleAudio);
$('#help').addEventListener('click', () => openModal('<span class="eyebrow">FIELD MANUAL / 操作指南</span><h2>欢迎来到雨港。</h2><p>你是调查员林渡。首个案件没有时间限制，也不会因推理失误丢失进度。</p><ul class="help-list"><li><b>探索</b>：左侧选择街区，点击地图标记或下方地点按钮。</li><li><b>移动</b>：WASD / 方向键，靠近地点按 E 交互。触屏直接点击地点。</li><li><b>调查</b>：右侧交谈、检查物品，线索会自动进入案件板。</li><li><b>推理</b>：收齐关键证据后，在案件板选择嫌疑人、方式与动机。</li><li><b>选择</b>：结案时决定证人的未来。城市里的支线仍可继续。</li><li><b>存档</b>：进度保存在当前浏览器。可随时关闭页面后继续。</li><li><b>氛围</b>：右上角音量按钮可开启合成的雨夜环境音。</li></ul>'));
$('#reset').addEventListener('click', () => {
  openModal('<span class="eyebrow">NEW INVESTIGATION</span><h2>重新走进这个雨夜？</h2><p>这将清除当前浏览器的案件进度、线索和结局。</p><button class="action-button primary" id="confirm-reset">确认重新开始</button><button class="action-button" id="cancel-reset">保留当前进度</button>');
  $('#confirm-reset').addEventListener('click', () => { state = freshState(); selected = null; closeModal(); save(); updateHUD(); switchTab('world'); toast('新调查已开始'); });
  $('#cancel-reset').addEventListener('click', closeModal);
});
$('#close-modal').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if (e.target === $('#modal')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal(); } });
$('.brand').addEventListener('click', e => { e.preventDefault(); switchTab('world'); });
document.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'e' && tab === 'world' && !$('#modal').open && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) { const p = currentDistrict().points.reduce((best, p) => Math.hypot(p.x - state.player.x, p.y - state.player.y) < Math.hypot(best.x - state.player.x, best.y - state.player.y) ? p : best); if (Math.hypot(p.x - state.player.x, p.y - state.player.y) < .18) selectPoint(p.id); else toast('靠近地图上的地点，再按 E 交互'); } });
updateHUD(); renderWorld();
if (!storageAvailable) $('#save-status').textContent = '存储不可用 · 当前进度仅在本次会话保留';
window.addEventListener('pagehide', save);
