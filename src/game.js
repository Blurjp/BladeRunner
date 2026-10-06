export const districts = [
  { id: 'docks', number: '01', name: '旧港街区', en: 'OLD HARBOR', tag: '案发现场', color: '#b9ed9c', description: '旧列车已经停运，雨还没有。有人在这里丢失了一段不该被记住的记忆。', points: [
    { id: 'body', name: '封锁现场', kind: '调查', x: .42, y: .61, text: '死者林弥，记忆档案员。她的太阳穴没有伤口，颈后的神经端口却烧成了黑色。地上的雨水倒映着仍在闪烁的端口。', actions: [{ id: 'burn', label: '检查神经端口', clue: 'burn' }] },
    { id: 'kiosk', name: '废弃售票机', kind: '搜索', x: .73, y: .48, text: '售票机旁藏着一块裂开的存储片。最后一段录像里，林弥正在向某人递交一份「意识审计」。', actions: [{ id: 'memory', label: '读取存储片', clue: 'memory' }] },
    { id: 'lu', name: '陆巡警', kind: '对话', x: .25, y: .71, text: '「我接到警报时，她已经倒下了。别信公司说的意外，这里的监控在 23:17 同时断了。」', actions: [{ id: 'lu-talk', label: '询问监控中断', clue: 'camera' }, { id: 'lu-about', label: '询问这座城市', response: '「雨港的人分两种：买得起新记忆的，和不得不卖掉旧记忆的。林弥想让我们知道，被卖掉的东西仍然活着。」' }] },
    { id: 'radio', name: '雨中电台', kind: '支线', x: .59, y: .78, text: '一台老收音机重复着杂音。机身上刻着：88.4 MHz。也许有人还在另一头等待。', actions: [{ id: 'radio-tune', label: '调到 88.4 MHz', side: 'radio' }] },
  ] },
  { id: 'market', number: '02', name: '夜市巷', en: 'NIGHT MARKET', tag: '目击者', color: '#efb87e', description: '汤的热气混进霓虹灯里。这里什么都卖，除了真话——真话需要一点耐心。', points: [
    { id: 'noodle', name: '阿婆面馆', kind: '对话', x: .31, y: .66, text: '「林弥每晚都来，最后那晚她给一个白头发孩子点了面。孩子的编号是 N-7，生日好像是四月十七。」', actions: [{ id: 'receipt', label: '询问留下的东西', clue: 'receipt' }, { id: 'eat', label: '吃一碗热面 · ¥ 15', side: 'noodles' }] },
    { id: 'broker', name: '记忆掮客', kind: '对话', x: .66, y: .56, text: '掮客压低了帽檐。「韩医生当晚来过，但他在找人，不是在追人。你想买情报？这次算我还林弥一个人情。」', actions: [{ id: 'alibi', label: '核实韩医生的行踪', clue: 'alibi' }, { id: 'broker-about', label: '什么是 N-7？', response: '「第七代合成人。公司说他们只有模拟情绪。可那孩子给林弥买过花。模拟的，还是活的，你说呢？」' }] },
    { id: 'sign', name: '失物招领墙', kind: '探索', x: .48, y: .81, text: '墙上贴满照片。失踪的人、失踪的猫、失踪的记忆。一个小小的手写标语：如果你仍然想念，那就还没有失去。', actions: [{ id: 'sign-read', label: '读完墙上的留言', response: '你在最下方发现一句旧话：「别让任何人为自己的存在道歉。」你把这句话记住了。' }] },
  ] },
  { id: 'clinic', number: '03', name: '白噪诊所', en: 'WHITE NOISE', tag: '技术鉴定', color: '#98c9ff', description: '一间替合成人修补梦境的诊所。消毒水的味道盖不过电路烧焦的气息。', points: [
    { id: 'han', name: '韩医生', kind: '对话', x: .33, y: .69, text: '「我替 N-7 切断过公司的追踪信号。林弥在证明她有自我意识。我想保护她们，可还是晚了。」', actions: [{ id: 'han-talk', label: '询问致命损伤', clue: 'scan', requires: 'burn' }, { id: 'han-about', label: '意识可以被证明吗？', response: '「我不知道。但害怕失去一个人时，不需要一张证明。N-7 也会害怕。」' }] },
    { id: 'lab', name: '诊断终端', kind: '调查', x: .67, y: .53, text: '终端里保留着公司的远程维护协议。只有企业级管理员，才能强制启动神经端口的过载指令。', actions: [{ id: 'protocol', label: '提取维护协议', clue: 'protocol' }] },
    { id: 'garden', name: '人造庭院', kind: '探索', x: .53, y: .79, text: '一株从不结果的电子树。有人在树下放了一束真正的花。花瓣上的水珠是真实的。', actions: [{ id: 'garden-rest', label: '在这里停留一会儿', response: '你听见树在模拟风声。这个夜晚第一次没有催促你。' }] },
  ] },
  { id: 'tower', number: '04', name: '天穹大厦', en: 'ZENITH TOWER', tag: '企业禁区', color: '#c7afff', description: '公司拥有这座城市的灯光，也想拥有灯光照不到的东西。答案就在楼上。', points: [
    { id: 'terminal', name: '审计终端', kind: '解密', x: .37, y: .63, text: '林弥留下的审计档案已加密。屏幕上只有一句提示：「不是编号，是她来到世界的那一天。」需要四位数字。', actions: [{ id: 'decrypt', label: '解锁审计档案', puzzle: true }] },
    { id: 'wu', name: '吴监理', kind: '对话', x: .69, y: .54, text: '「林弥的死亡是一次设备故障。不要把机器拟人化，侦探。雨港不缺悲剧，但不能缺秩序。」', actions: [{ id: 'wu-confront', label: '质问远程指令', requires: 'directive', response: '吴监理的手指停在杯沿。「你找到的只是维护日志。」他没有否认自己的签名。你看见杯中的水在颤动。' }, { id: 'wu-about', label: '询问意识审计', response: '「一份不合规的研究。如果每个产品都要谈权利，谁来承担成本？」' }] },
    { id: 'n7', name: '天台上的 N-7', kind: '对话', x: .51, y: .80, text: '白发的女孩站在天台雨里。「林弥说，有一天我可以自己选择名字。你找到她了吗？」', actions: [{ id: 'witness', label: '听她讲述最后一晚', requires: 'directive', clue: 'witness' }, { id: 'n7-about', label: '你想叫什么名字？', response: '「小弥。可以吗？」她第一次抬头看你。「不是替代她。是想记住她。」' }] },
  ] },
];

export const clues = {
  burn: { title: '烧毁的神经端口', category: '物证', source: '旧港 · 封锁现场', text: '无外伤，端口从内部烧毁。需要医生鉴定损伤来源。' },
  memory: { title: '意识审计碎片', category: '记录', source: '旧港 · 售票机', text: '林弥正准备公开 N-7 的自主意识审计。企业的合成人资产将因此拥有法律人格。' },
  camera: { title: '23:17 的监控空白', category: '证词', source: '旧港 · 陆巡警', text: '整条街的企业监控同时离线。陆巡警在 23:22 收到报警后抵达。' },
  receipt: { title: '写着生日的收据', category: '物证', source: '夜市 · 阿婆面馆', text: 'N-7 的生日是 4 月 17 日。收据背面写着「不是编号，是生日」。四位数：0417。' },
  alibi: { title: '韩医生的不在场证明', category: '证词', source: '夜市 · 记忆掮客', text: '23:10 至 23:30，韩医生一直在夜市寻找 N-7。多位摊主及收款记录可核实。' },
  scan: { title: '神经过载鉴定', category: '鉴定', source: '诊所 · 韩医生', text: '死亡由远程神经过载造成，非自然故障。攻击使用了企业签名的维护命令。' },
  protocol: { title: '企业权限协议', category: '记录', source: '诊所 · 诊断终端', text: '普通维修权限不能发出致命过载。需要企业监理级授权；吴监理持有本区唯一密钥。' },
  directive: { title: '吴监理的签名指令', category: '关键证据', source: '天穹 · 审计终端', text: '23:17，吴监理签名：对林弥端口执行过载，清除审计备份，隔离 N-7。命令与监控中断同时发生。' },
  witness: { title: 'N-7 的最后记忆', category: '证词', source: '天穹 · N-7', text: '「吴监理说，审计一旦公开，公司就会失去我们。然后林弥倒下了。」她保存了未经剪辑的录音。' },
};

export const neededEvidence = ['memory', 'scan', 'protocol', 'directive', 'witness'];
export const freshState = () => ({ version: 1, district: 'docks', evidence: [], visited: ['docks'], done: [], credits: 120, warmth: 0, solved: false, ending: null, player: { x: .48, y: .7 } });

export function restoreState(raw) {
  try {
    const saved = JSON.parse(raw);
    if (saved?.version !== 1) return freshState();
    const base = freshState();
    base.district = districts.some(d => d.id === saved.district) ? saved.district : 'docks';
    base.evidence = [...new Set((Array.isArray(saved.evidence) ? saved.evidence : []).filter(id => Object.hasOwn(clues, id)))];
    base.visited = [...new Set(['docks', ...(Array.isArray(saved.visited) ? saved.visited : []).filter(id => districts.some(d => d.id === id))])];
    base.done = (Array.isArray(saved.done) ? saved.done : []).filter(id => ['radio', 'noodles'].includes(id));
    base.credits = Number.isFinite(saved.credits) ? Math.max(0, Math.min(9999, saved.credits)) : 120;
    base.warmth = base.done.includes('noodles') ? 1 : 0;
    base.solved = saved.solved === true && neededEvidence.every(id => base.evidence.includes(id));
    base.ending = base.solved && ['publish', 'protect'].includes(saved.ending) ? saved.ending : null;
    if (saved.player && Number.isFinite(saved.player.x) && Number.isFinite(saved.player.y)) base.player = { x: Math.max(.12, Math.min(.88, saved.player.x)), y: Math.max(.46, Math.min(.88, saved.player.y)) };
    return base;
  } catch { return freshState(); }
}

export function collect(state, id) {
  if (!Object.hasOwn(clues, id) || state.evidence.includes(id)) return false;
  state.evidence.push(id);
  return true;
}

export function travel(state, id) {
  if (!districts.some(d => d.id === id)) return false;
  state.district = id;
  if (!state.visited.includes(id)) state.visited.push(id);
  state.player = { x: .48, y: .7 };
  return true;
}

export function objective(state) {
  if (state.ending) return '案件已结 · 雨港仍有故事等待你';
  if (state.solved) return '决定如何公开真相，保护 N-7';
  if (!state.evidence.includes('burn')) return '调查旧港的封锁现场';
  if (!state.evidence.includes('receipt')) return '前往夜市，追查林弥最后的行踪';
  if (!state.evidence.includes('scan')) return '带着端口线索，向韩医生求证';
  if (!state.evidence.includes('directive')) return '前往天穹，用生日解锁审计档案';
  if (!state.evidence.includes('witness')) return '找到天台上的 N-7，听取她的证词';
  if (!neededEvidence.every(id => state.evidence.includes(id))) return '补全意识审计与企业权限证据';
  return '证据已齐全 · 打开案件板提交推理';
}

export function deduce(state, suspect, method, motive) {
  if (!neededEvidence.every(id => state.evidence.includes(id))) return { ok: false, reason: '证据链还不完整。需要意识审计、损伤鉴定、权限协议、签名指令和 N-7 的证词。' };
  if (suspect !== 'wu' || method !== 'overload' || motive !== 'audit') return { ok: false, reason: '这份推理与证据存在矛盾。比对致命损伤、管理员签名和意识审计的后果，再试一次。' };
  state.solved = true;
  return { ok: true, reason: '证据链成立：吴监理以远程神经过载杀害林弥，阻止意识审计公开。现在，真相的去向由你决定。' };
}

export function finish(state, choice) {
  if (!state.solved || !['publish', 'protect'].includes(choice) || state.ending) return false;
  state.ending = choice;
  state.credits += 200;
  return true;
}
