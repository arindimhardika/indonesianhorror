/* ==========================================================
   Malam Kuis Angker - script.js
   ========================================================== */
(() => {
  'use strict';

  /* ---------- Util ---------- */
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* ---------- Elemen ---------- */
  const gameEl = $('game');
  const el = {
    ghost: $('ghost'),
    ghostName: $('ghost-name'),
    ghostHp: $('ghost-hp-fill'),
    weaponFx: $('weapon-fx'),
    damagePop: $('damage-pop'),
    flicker: $('flicker'),
    jumpscare: $('jumpscare'),
    jumpscareText: $('jumpscare-text'),
    hud: $('hud'),
    score: $('hud-score'),
    room: $('hud-room'),
    lives: $('hud-lives'),
    streak: $('hud-streak'),
    meters: $('meters'),
    mDistance: $('meter-distance'),
    mSanity: $('meter-sanity'),
    mBattery: $('meter-battery'),
    weaponSlot: $('weapon-slot'),
    weaponName: $('weapon-slot-name'),
    weaponUses: $('weapon-slot-uses'),
    banner: $('room-banner'),
    bannerText: $('room-banner-text'),
    menuHigh: $('menu-highscore'),
    bestiary: $('bestiary-list'),
    quizRoom: $('quiz-room'),
    quizTime: $('quiz-time'),
    timerFill: $('timer-fill'),
    quizQuestion: $('quiz-question'),
    quizFeedback: $('quiz-feedback'),
    options: Array.from(document.querySelectorAll('#quiz-options .option')),
    attackPanel: $('attack-panel'),
    attackHint: $('attack-hint'),
    gameoverTitle: $('gameover-title'),
    gameoverReason: $('gameover-reason'),
    resScore: $('result-score'),
    resRoom: $('result-room'),
    resGhosts: $('result-ghosts'),
    resHigh: $('result-highscore'),
    resNew: $('result-newrecord'),
    toolbar: $('toolbar'),
    btnSound: $('btn-sound')
  };

  const screens = {
  menu: $('screen-menu'),
  howto: $('screen-howto'),
  bestiary: $('screen-bestiary'),
  quiz: $('screen-quiz'),
  gameover: $('screen-gameover'),
  logbook: $('ai-logbook')
};
  const pauseScreen = $('screen-pause');

  /* ---------- Konstanta ---------- */
  const QUIZ_TIME = 15;
  const START_LIVES = 3;
  const MAX_LIVES = 5;
  const HIGH_KEY = 'malamKuisAngkerHighScore';
  const FOUND_KEY = 'malamKuisAngkerFound';
  const ROOM_CYCLE = ['tuyul', 'pocong', 'kuntilanak', 'genderuwo'];

  const GHOSTS = {
    pocong: {
      name: 'Pocong', speed: 1.15, hp: 1,
      desc: 'Terbungkus kain putih dan melompat-lompat. Sesekali ia melompat mendekat dengan tiba-tiba.'
    },
    kuntilanak: {
      name: 'Kuntilanak', speed: 1.0, hp: 1,
      desc: 'Berambut panjang dan bergaun putih. Kehadirannya membuat lampu berkedip dan sanity turun.'
    },
    tuyul: {
      name: 'Tuyul', speed: 1.3, hp: 0.7,
      desc: 'Kecil dan cepat. Jika kamu salah menjawab, ia mencuri baterai senter.'
    },
    genderuwo: {
      name: 'Genderuwo', speed: 0.8, hp: 1.8,
      desc: 'Besar dan berbulu. Lambat, tapi kuat. Sapu lidi hanya separuh efektif melawannya.'
    }
  };

  const WEAPONS = {
    sapu:      { id: 'sapu',      name: 'Sapu lidi',     damage: 5,  uses: 2, fx: '' },
    garam:     { id: 'garam',     name: 'Garam',         damage: 6,  uses: 2, fx: 'fx-salt', push: 10 },
    uv:        { id: 'uv',        name: 'Senter UV',     damage: 10, uses: 1, fx: 'fx-uv', hold: 3 },
    kentongan: { id: 'kentongan', name: 'Kentongan',     damage: 6,  uses: 1, fx: '', hold: 6 },
    lonceng:   { id: 'lonceng',   name: 'Lonceng perak', damage: 18, uses: 1, fx: 'fx-bell', sanity: 10 }
  };

  const WEAPON_POOLS = {
    1: ['sapu', 'sapu', 'garam'],
    2: ['garam', 'uv', 'kentongan', 'sapu'],
    3: ['uv', 'kentongan', 'garam', 'uv']
  };

  /* ---------- Bank soal: [pertanyaan, [opsi], indeks benar, level] ---------- */
  const QUESTIONS = [
    // Level 1
    ['Hewan apa yang dikenal sebagai raja hutan?', ['Singa', 'Harimau', 'Gajah', 'Beruang'], 0, 1],
    ['Berapa jumlah hari dalam seminggu?', ['5', '6', '7', '8'], 2, 1],
    ['Berapa hasil dari 8 x 7?', ['54', '56', '58', '64'], 1, 1],
    ['Apa mamalia terbesar di dunia?', ['Gajah', 'Paus biru', 'Hiu paus', 'Jerapah'], 1, 1],
    ['Gas apa yang dibutuhkan manusia untuk bernapas?', ['Oksigen', 'Nitrogen', 'Helium', 'Hidrogen'], 0, 1],
    ['Kota mana yang dijuluki Kota Pahlawan?', ['Bandung', 'Surabaya', 'Semarang', 'Malang'], 1, 1],
    ['Satu lusin sama dengan berapa?', ['10', '12', '14', '20'], 1, 1],
    ['Apa mata uang Indonesia?', ['Ringgit', 'Baht', 'Rupiah', 'Peso'], 2, 1],
    ['Benda langit apa yang menyinari Bumi pada siang hari?', ['Bulan', 'Matahari', 'Komet', 'Meteor'], 1, 1],
    ['Tari Kecak berasal dari pulau?', ['Bali', 'Jawa', 'Sumatra', 'Papua'], 0, 1],
    ['Hewan apa yang memiliki belalai?', ['Badak', 'Gajah', 'Kuda nil', 'Jerapah'], 1, 1],
    ['Hari kemerdekaan Indonesia diperingati setiap tanggal?', ['17 Agustus', '17 Juli', '28 Oktober', '1 Juni'], 0, 1],

    // Level 2
    ['Siapa pelukis lukisan Mona Lisa?', ['Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Raden Saleh'], 0, 2],
    ['Unsur kimia dengan simbol Au adalah?', ['Perak', 'Emas', 'Aluminium', 'Argon'], 1, 2],
    ['Candi Buddha terbesar di dunia yang ada di Magelang adalah?', ['Prambanan', 'Borobudur', 'Mendut', 'Sewu'], 1, 2],
    ['Organ apa yang berfungsi memompa darah?', ['Hati', 'Paru-paru', 'Jantung', 'Ginjal'], 2, 2],
    ['Apa ibu kota Australia?', ['Sydney', 'Canberra', 'Melbourne', 'Perth'], 1, 2],
    ['Planet mana yang dijuluki Planet Merah?', ['Venus', 'Mars', 'Jupiter', 'Saturnus'], 1, 2],
    ['Siapa penulis novel Laskar Pelangi?', ['Tere Liye', 'Andrea Hirata', 'Raditya Dika', 'Dee Lestari'], 1, 2],
    ['Siapa pencipta lagu Indonesia Raya?', ['Ismail Marzuki', 'W.R. Supratman', 'C. Simanjuntak', 'Ibu Sud'], 1, 2],
    ['Samudra manakah yang paling luas?', ['Atlantik', 'Hindia', 'Pasifik', 'Arktik'], 2, 2],
    ['Apa satuan gaya dalam Sistem Internasional?', ['Joule', 'Newton', 'Watt', 'Pascal'], 1, 2],
    ['Benua manakah yang paling kecil?', ['Eropa', 'Antartika', 'Australia', 'Amerika Selatan'], 2, 2],
    ['Gunung Krakatau terletak di selat?', ['Sunda', 'Malaka', 'Makassar', 'Bali'], 0, 2],

    // Level 3
    ['Pada tahun berapa Perang Dunia II berakhir?', ['1943', '1944', '1945', '1946'], 2, 3],
    ['Siapa yang umumnya diakui sebagai penemu telepon?', ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Guglielmo Marconi'], 1, 3],
    ['Negara terkecil di dunia berdasarkan luas wilayah adalah?', ['Monako', 'Vatikan', 'Nauru', 'San Marino'], 1, 3],
    ['Bagian sel yang berfungsi sebagai pembangkit energi adalah?', ['Ribosom', 'Mitokondria', 'Nukleus', 'Lisosom'], 1, 3],
    ['Konferensi Asia Afrika tahun 1955 diadakan di kota?', ['Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta'], 2, 3],
    ['Siapa yang mengemukakan teori relativitas?', ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Niels Bohr'], 1, 3],
    ['Gas apa yang paling banyak terdapat di atmosfer Bumi?', ['Oksigen', 'Karbon dioksida', 'Nitrogen', 'Argon'], 2, 3],
    ['Pelayaran tahun 1492 yang mencapai benua Amerika dipimpin oleh?', ['Vasco da Gama', 'Christopher Columbus', 'Ferdinand Magellan', 'Marco Polo'], 1, 3],
    ['Bilangan prima terkecil adalah?', ['0', '1', '2', '3'], 2, 3],
    ['Apa ibu kota Turki?', ['Istanbul', 'Ankara', 'Izmir', 'Bursa'], 1, 3],
    ['Apa satuan tekanan dalam Sistem Internasional?', ['Newton', 'Joule', 'Pascal', 'Watt'], 2, 3],
    ['Candi Prambanan merupakan candi bercorak?', ['Buddha', 'Hindu', 'Islam', 'Konghucu'], 1, 3]
  ];

  /* ---------- Status global ---------- */
  let state = 'menu';   // menu | playing | paused | gameover
  let phase = 'idle';   // idle | intro | quiz | feedback | attack | wait | cleared | dead
  let g = null;
  let lastTime = 0;
  let highScore = loadHigh();
  let found = loadFound();
  let timers = [];
  let usedQuestions = new Set();
  let quiz = { q: null, remaining: QUIZ_TIME, locked: false, correctIndex: 0, level: 1, lastSec: QUIZ_TIME };
  let hudCache = {};
  let cssCache = {};
  let audioCtx = null;
  let soundOn = true;
   
/* ---------- AI Logbook ---------- */
const LOGBOOK_KEY = 'malamKuisAngkerLogbook';

function addLogbookEntry(message) {
  const list = $('ai-logbook-list');
  if (!list) return;

  const entry = {
    time: new Date().toLocaleTimeString('id-ID'),
    message: message
  };

  let logs = [];
  try {
    logs = JSON.parse(localStorage.getItem(LOGBOOK_KEY)) || [];
  } catch (e) {
    logs = [];
  }

  logs.unshift(entry);
  logs = logs.slice(0, 100);

  try {
    localStorage.setItem(LOGBOOK_KEY, JSON.stringify(logs));
  } catch (e) {
    // Permainan tetap berjalan jika penyimpanan tidak tersedia.
  }

  renderLogbook();
}

function renderLogbook() {
  const list = $('ai-logbook-list');
  if (!list) return;

  let logs = [];
  try {
    logs = JSON.parse(localStorage.getItem(LOGBOOK_KEY)) || [];
  } catch (e) {
    logs = [];
  }

  list.replaceChildren();

  if (!logs.length) {
    const item = document.createElement('li');
    item.textContent = 'Belum ada aktivitas tercatat.';
    list.appendChild(item);
    return;
  }

  logs.forEach((log) => {
    const item = document.createElement('li');
    item.textContent = `[${log.time}] ${log.message}`;
    list.appendChild(item);
  });
}
   
  /* ---------- Penyimpanan ---------- */
  function loadHigh() {
    try { return parseInt(localStorage.getItem(HIGH_KEY), 10) || 0; } catch (e) { return 0; }
  }

  function saveHigh(v) {
    try { localStorage.setItem(HIGH_KEY, String(v)); } catch (e) { /* abaikan */ }
  }

  function loadFound() {
    try {
      const arr = JSON.parse(localStorage.getItem(FOUND_KEY));
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveFound() {
    try { localStorage.setItem(FOUND_KEY, JSON.stringify(found)); } catch (e) { /* abaikan */ }
  }

  /* ---------- Penjadwal berbasis waktu game (berhenti saat jeda) ---------- */
  function later(sec, fn) {
    timers.push({ t: sec, fn });
  }

  function runTimers(dt) {
    if (!timers.length) return;
    const due = [];
    timers = timers.filter((tm) => {
      tm.t -= dt;
      if (tm.t <= 0) {
        due.push(tm.fn);
        return false;
      }
      return true;
    });
    due.forEach((fn) => fn());
  }

  /* ---------- Audio ---------- */
  function ensureAudio() {
    if (!audioCtx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      } catch (e) {
        audioCtx = null;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function beep(freq, dur = 0.1, type = 'sine', vol = 0.05, slide = 0) {
    if (!soundOn || !audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  const sfx = {
    thump: () => {
      beep(62, 0.14, 'sine', 0.16, -20);
      setTimeout(() => beep(55, 0.16, 'sine', 0.12, -15), 150);
    },
    creak: () => beep(95, 0.7, 'sawtooth', 0.025, -35),
    tick: () => beep(900, 0.05, 'square', 0.03),
    correct: () => {
      beep(523, 0.12, 'triangle', 0.06);
      setTimeout(() => beep(659, 0.12, 'triangle', 0.06), 110);
      setTimeout(() => beep(784, 0.2, 'triangle', 0.06), 220);
    },
    wrong: () => {
      beep(220, 0.2, 'sawtooth', 0.06, -80);
      setTimeout(() => beep(150, 0.3, 'sawtooth', 0.06, -60), 160);
    },
    hit: () => beep(180, 0.18, 'square', 0.07, -120),
    crit: () => {
      beep(200, 0.18, 'square', 0.08, -140);
      setTimeout(() => beep(900, 0.15, 'triangle', 0.06, 300), 80);
    },
    bell: () => {
      beep(1200, 0.7, 'sine', 0.07, -200);
      setTimeout(() => beep(1800, 0.5, 'sine', 0.04, -300), 60);
    },
    kill: () => {
      beep(400, 0.5, 'sawtooth', 0.06, -330);
      setTimeout(() => beep(300, 0.5, 'triangle', 0.05, 150), 250);
    },
    scare: () => {
      beep(180, 0.5, 'sawtooth', 0.12, -140);
      beep(540, 0.4, 'square', 0.07, -400);
    }
  };

  /* ---------- Layar & UI ---------- */
  function showScreen(name) {
    Object.keys(screens).forEach((k) => {
      screens[k].classList.toggle('hidden', k !== name);
    });
  }

  function setPlayingUI(on) {
    [el.hud, el.meters, el.weaponSlot, el.toolbar].forEach((n) => n.classList.toggle('hidden', !on));
    if (!on) {
      [el.ghost, el.attackPanel, pauseScreen, el.banner, el.jumpscare, el.weaponFx, el.damagePop].forEach((n) =>
        n.classList.add('hidden')
      );
    }
  }

  function setText(node, key, val) {
    if (hudCache[key] !== val) {
      hudCache[key] = val;
      node.textContent = val;
    }
  }

  function setVar(name, val) {
    if (cssCache[name] !== val) {
      cssCache[name] = val;
      gameEl.style.setProperty(name, val);
    }
  }

  function retrigger(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  function updateHud() {
    setText(el.score, 'score', String(g.score));
    setText(el.room, 'room', String(g.room));
    setText(el.lives, 'lives', '\u2665 ' + g.lives);
    setText(el.streak, 'streak', String(g.streak));
  }

  function updateWeaponSlot() {
    if (g.weapon) {
      setText(el.weaponName, 'wname', g.weapon.name + (g.weapon.crit ? ' (kritis)' : ''));
      setText(el.weaponUses, 'wuses', 'x' + g.weapon.uses);
    } else {
      setText(el.weaponName, 'wname', 'Belum ada');
      setText(el.weaponUses, 'wuses', '');
    }
  }

  function updateVisuals() {
    const d = g.ghost ? clamp(g.ghost.distance, 0, 100) : 100;
    const near = 1 - d / 100;

    setVar('--ghost-scale', (0.45 + near * 1.15).toFixed(2));
    setVar('--vignette', clamp(0.35 + near * 0.5 + (1 - g.sanity / 100) * 0.25, 0, 1).toFixed(2));
    setVar('--light', clamp(0.25 + (g.battery / 100) * 0.75, 0.05, 1).toFixed(2));

    el.mDistance.style.width = d + '%';
    el.mSanity.style.width = clamp(g.sanity, 0, 100) + '%';
    el.mBattery.style.width = clamp(g.battery, 0, 100) + '%';
    el.mDistance.classList.toggle('low', d < 25);
    el.mSanity.classList.toggle('low', g.sanity < 25);
    el.mBattery.classList.toggle('low', g.battery < 20);
  }

  function showBanner(text) {
    el.bannerText.textContent = text;
    el.banner.classList.add('hidden');
    void el.banner.offsetWidth;
    el.banner.classList.remove('hidden');
    later(1.9, () => el.banner.classList.add('hidden'));
  }

  function shake() {
    retrigger(gameEl, 'shake');
    later(0.3, () => gameEl.classList.remove('shake'));
  }

  function flickerFx() {
    retrigger(el.flicker, 'on');
    later(0.6, () => el.flicker.classList.remove('on'));
  }

  function jumpscare() {
    const words = ['BOO!', 'HIIII!', 'AAAA!'];
    el.jumpscareText.textContent = words[Math.floor(Math.random() * words.length)];
    el.jumpscare.classList.add('hidden');
    void el.jumpscare.offsetWidth;
    el.jumpscare.classList.remove('hidden');
    sfx.scare();
    later(0.75, () => el.jumpscare.classList.add('hidden'));
  }

  function showWeaponFx(cls) {
    el.weaponFx.className = 'weapon-fx hidden ' + (cls || '');
    void el.weaponFx.offsetWidth;
    el.weaponFx.classList.remove('hidden');
    later(0.45, () => el.weaponFx.classList.add('hidden'));
  }

  function showDamage(n, crit) {
    el.damagePop.textContent = '-' + n;
    el.damagePop.className = 'damage-pop hidden' + (crit ? ' crit' : '');
    void el.damagePop.offsetWidth;
    el.damagePop.classList.remove('hidden');
    later(0.9, () => el.damagePop.classList.add('hidden'));
  }

  /* ---------- Koleksi hantu ---------- */
  function renderBestiary() {
    el.bestiary.querySelectorAll('.bestiary-item').forEach((li) => {
      const key = li.dataset.ghost;
      const def = GHOSTS[key];
      const isFound = found.indexOf(key) !== -1;
      li.classList.toggle('found', isFound);
      li.querySelector('.bestiary-name').textContent = isFound ? def.name : '???';
      li.querySelector('.bestiary-desc').textContent = isFound ? def.desc : 'Belum ditemukan.';
    });
  }

  /* ---------- Alur permainan ---------- */
  function newGame() {
    g = {
      room: 1,
      score: 0,
      lives: START_LIVES,
      sanity: 100,
      battery: 100,
      streak: 0,
      correct: 0,
      defeated: 0,
      weapon: null,
      ghost: null,
      attackCd: 0,
      heart: 1.2,
      creak: rand(9, 16),
      flick: rand(10, 18)
    };
    usedQuestions = new Set();
    timers = [];
    hudCache = {};
    cssCache = {};
    phase = 'idle';
  }

  function startGame() {
    ensureAudio();
    newGame();

      addLogbookEntry('Permainan baru dimulai.');
     
    state = 'playing';
    showScreen(null);
    pauseScreen.classList.add('hidden');
    setPlayingUI(true);
    updateHud();
    updateWeaponSlot();
    updateVisuals();
    spawnGhost();
  }

  function goMenu() {
    state = 'menu';
    phase = 'idle';
    timers = [];
    setPlayingUI(false);
    cssCache = {};
    setVar('--ghost-scale', '0.45');
    setVar('--vignette', '0.45');
    setVar('--light', '1');
    el.menuHigh.textContent = String(highScore);
    showScreen('menu');
  }

  function spawnGhost() {
    const bossRoom = g.room % 5 === 0;
    const type = ROOM_CYCLE[(bossRoom ? g.room / 5 : g.room - 1) % ROOM_CYCLE.length];
    const def = GHOSTS[type];
    const maxHp = Math.round((12 + g.room * 3) * def.hp * (bossRoom ? 2.5 : 1));
    const speed = (3 + Math.min(g.room, 12) * 0.45) * def.speed * (bossRoom ? 0.85 : 1);

    const ghost = {
      type, def, boss: bossRoom, hp: maxHp, maxHp,
      distance: 100, speed, hold: 0, special: rand(4, 7)
    };
    g.ghost = ghost;
    g.weapon = null;
    updateWeaponSlot();

    el.ghost.className = 'ghost appear type-' + type + (bossRoom ? ' boss' : '');
    el.ghostName.textContent = def.name + (bossRoom ? ' (Boss)' : '');
    el.ghostHp.style.width = '100%';
    later(0.9, () => {
      if (g && g.ghost === ghost) el.ghost.classList.remove('appear');
    });

    phase = 'intro';
    showBanner(bossRoom ? 'Ruangan ' + g.room + ' - Boss!' : 'Ruangan ' + g.room);
    flickerFx();
    sfx.creak();
    later(1.4, () => {
      if (g && g.ghost === ghost && phase === 'intro') openQuiz();
    });
    updateHud();
  }

  function nextRoom() {
    g.room++;
    spawnGhost();
  }

  /* ---------- Quiz ---------- */
  function pickQuestion(level) {
    let pool = QUESTIONS.map((q, i) => ({ q, i })).filter((o) => o.q[3] === level && !usedQuestions.has(o.i));
    if (!pool.length) pool = QUESTIONS.map((q, i) => ({ q, i })).filter((o) => !usedQuestions.has(o.i));
    if (!pool.length) {
      usedQuestions.clear();
      pool = QUESTIONS.map((q, i) => ({ q, i })).filter((o) => o.q[3] === level);
    }
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedQuestions.add(chosen.i);
    return chosen.q;
  }

  function openQuiz() {
    if (!g || !g.ghost) return;
    phase = 'quiz';
    const level = g.room <= 2 ? 1 : g.room <= 5 ? 2 : 3;
    const q = pickQuestion(level);
    const answerText = q[1][q[2]];
    const opts = shuffle(q[1]);

    quiz.q = q;
    quiz.level = level;
    quiz.correctIndex = opts.indexOf(answerText);
    quiz.locked = false;
    quiz.remaining = QUIZ_TIME;
    quiz.lastSec = QUIZ_TIME;

    el.quizRoom.textContent = String(g.room);
    el.quizQuestion.textContent = q[0];
    el.quizTime.textContent = String(QUIZ_TIME);
    el.timerFill.style.width = '100%';
    el.timerFill.className = 'timer-fill';
    el.quizFeedback.textContent = '';
    el.quizFeedback.className = 'quiz-feedback';
    el.options.forEach((btn, i) => {
      btn.textContent = opts[i];
      btn.disabled = false;
      btn.className = 'option';
    });
    showScreen('quiz');
  }

  function updateQuizTimer(dt) {
    quiz.remaining -= dt;
    const remain = Math.max(0, quiz.remaining);
    const sec = Math.ceil(remain);
    if (sec !== quiz.lastSec) {
      quiz.lastSec = sec;
      el.quizTime.textContent = String(sec);
      if (sec <= 5 && sec > 0) sfx.tick();
    }
    el.timerFill.style.width = (remain / QUIZ_TIME) * 100 + '%';
    el.timerFill.className = 'timer-fill' + (remain <= 5 ? ' danger' : remain <= 8 ? ' warning' : '');
    if (quiz.remaining <= 0) answerQuiz(-1);
  }

  function answerQuiz(index) {
    if (state !== 'playing' || phase !== 'quiz' || quiz.locked) return;
    quiz.locked = true;
    phase = 'feedback';

    const remain = Math.max(0, quiz.remaining);
    const ok = index === quiz.correctIndex;

     addLogbookEntry(
  (ok ? 'Jawaban benar: ' : 'Jawaban salah atau waktu habis: ')
  + quiz.q[0]
);

    el.options.forEach((btn, i) => {
      btn.disabled = true;
      if (i === quiz.correctIndex) btn.classList.add('correct');
      else if (i === index) btn.classList.add('wrong');
    });

    if (ok) onCorrect(remain);
    else onWrong(index);
  }

  function pickWeaponId(level, streak) {
    if (streak >= 3 && Math.random() < 0.5) return 'lonceng';
    const pool = WEAPON_POOLS[level];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function onCorrect(remain) {
    g.correct++;
    g.streak++;
    g.score += 50 + Math.round(remain) * 5;
    g.battery = Math.min(100, g.battery + 15);
    g.sanity = Math.min(100, g.sanity + 5);

    const crit = remain >= 10;
    const w = Object.assign({}, WEAPONS[pickWeaponId(quiz.level, g.streak)]);
    w.crit = crit;
    g.weapon = w;

    sfx.correct();
    el.quizFeedback.textContent = 'Benar! Kamu mendapat ' + w.name + '.' + (crit ? ' Cepat, pukulan kritis!' : '');
    el.quizFeedback.className = 'quiz-feedback good';
    updateHud();
    updateWeaponSlot();

    later(1.4, () => {
      if (!g || phase !== 'feedback') return;
      screens.quiz.classList.add('hidden');
      startAttack();
    });
  }

  function onWrong(index) {
    g.streak = 0;
    g.ghost.distance -= 18;
    g.sanity = Math.max(0, g.sanity - 15);

    let msg = index === -1 ? 'Waktu habis!' : 'Salah!';
    msg += ' Jawaban benar: ' + quiz.q[1][quiz.q[2]] + '.';
    if (g.ghost.type === 'tuyul') {
      g.battery = Math.max(0, g.battery - 20);
      msg += ' Tuyul mencuri baterai senter!';
    }

    sfx.wrong();
    flickerFx();
    shake();
    el.quizFeedback.textContent = msg;
    el.quizFeedback.className = 'quiz-feedback bad';
    updateHud();

    later(1.8, () => {
      if (!g || phase !== 'feedback') return;
      screens.quiz.classList.add('hidden');
      phase = 'wait';
      later(0.5, () => {
        if (g && g.ghost && phase === 'wait') openQuiz();
      });
    });
  }

  /* ---------- Serangan ---------- */
  function startAttack() {
    phase = 'attack';
    g.attackCd = 0.2;
    el.attackPanel.classList.remove('hidden');
    el.ghost.classList.add('targetable');
    el.attackHint.textContent = 'Tap hantu atau tekan Pukul! (' + g.weapon.name + ')';
  }

  function endAttack() {
    el.attackPanel.classList.add('hidden');
    el.ghost.classList.remove('targetable');
  }

  function attack() {
    if (state !== 'playing' || phase !== 'attack' || !g.weapon || !g.ghost) return;
    if (g.attackCd > 0) return;

    const w = g.weapon;
    const gh = g.ghost;

    let dmg = w.damage;
    if (gh.type === 'genderuwo' && w.id === 'sapu') dmg *= 0.5;
    if (w.crit) dmg *= 1.5;
    dmg = Math.max(1, Math.round(dmg));

    gh.hp = Math.max(0, gh.hp - dmg);
    el.ghostHp.style.width = (gh.hp / gh.maxHp) * 100 + '%';
    retrigger(el.ghost, 'hit');
    later(0.4, () => el.ghost.classList.remove('hit'));
    showWeaponFx(w.fx);
    showDamage(dmg, w.crit);

    if (w.id === 'lonceng') sfx.bell();
    else if (w.crit) sfx.crit();
    else sfx.hit();

    if (w.push) gh.distance = Math.min(100, gh.distance + w.push);
    if (w.hold) gh.hold = Math.max(gh.hold, w.hold);
    if (w.sanity) g.sanity = Math.min(100, g.sanity + w.sanity);

    w.uses--;
    g.attackCd = 0.4;
    g.score += dmg * 2;
    updateWeaponSlot();
    updateHud();

    if (gh.hp <= 0) {
      killGhost();
      return;
    }

    if (w.uses <= 0) {
      g.weapon = null;
      updateWeaponSlot();
      endAttack();
      phase = 'wait';
      later(0.9, () => {
        if (g && g.ghost && phase === 'wait') openQuiz();
      });
    }
  }

  function killGhost() {
    phase = 'cleared';
    endAttack();
    g.weapon = null;
    updateWeaponSlot();

    const gh = g.ghost;
    g.defeated++;
     
     addLogbookEntry(
  'Mengalahkan ' + gh.def.name +
  ' di ruangan ' + g.room
);

    g.score += 100 * g.room + (gh.boss ? 500 : 0);
    g.sanity = Math.min(100, g.sanity + 20);
    g.battery = Math.min(100, g.battery + 10);
    if (gh.boss && g.lives < MAX_LIVES) g.lives++;

    if (found.indexOf(gh.type) === -1) {
      found.push(gh.type);
      saveFound();
    }

    sfx.kill();
    el.ghost.classList.remove('hit', 'appear', 'targetable');
    el.ghost.classList.add('dead');
    showBanner(gh.boss ? 'Boss kalah!' : 'Hantu kalah!');
    updateHud();

    later(0.8, () => el.ghost.classList.add('hidden'));
    later(2, () => {
      if (g && phase === 'cleared') {
        g.ghost = null;
        nextRoom();
      }
    });
  }

  /* ---------- Hantu menangkap ---------- */
  function caught() {
    g.lives--;
    g.streak = 0;
    shake();
    flickerFx();
    jumpscare();
    updateHud();

    if (g.lives <= 0) {
      phase = 'dead';
      later(0.9, () => endGame('caught'));
      return;
    }
    g.ghost.distance = 55;
    g.sanity = Math.max(0, g.sanity - 10);
  }

  /* ---------- Update per frame ---------- */
  function update(dt) {
    runTimers(dt);
    if (state !== 'playing' || !g || phase === 'dead') return;

    g.attackCd = Math.max(0, g.attackCd - dt);
    const gh = g.ghost;

    // Hantu mendekat
    if (gh && phase !== 'intro' && phase !== 'cleared') {
      if (gh.hold > 0) {
        gh.hold -= dt;
      } else {
        const factor = phase === 'quiz' || phase === 'feedback' ? 0.5 : 1;
        gh.distance -= gh.speed * factor * dt;
      }

      // Kemampuan khusus
      gh.special -= dt;
      if (gh.special <= 0) {
        if (gh.type === 'pocong') {
          gh.distance -= 5;
          sfx.thump();
          gh.special = 5;
        } else if (gh.type === 'kuntilanak') {
          flickerFx();
          g.sanity = Math.max(0, g.sanity - 3);
          gh.special = 8;
        } else {
          gh.special = 8;
        }
      }
    }

    // Baterai & sanity
    if (phase !== 'intro' && phase !== 'cleared') {
      g.battery = Math.max(0, g.battery - 0.9 * dt);
      let drain = 0;
      if (gh && gh.distance < 60) drain += 0.25;
      if (g.battery <= 0) drain += 1;
      g.sanity = Math.max(0, g.sanity - drain * dt);
    }

    // Timer kuis
    if (phase === 'quiz') updateQuizTimer(dt);

    // Detak jantung
    const near = gh ? 1 - clamp(gh.distance, 0, 100) / 100 : 0;
    g.heart -= dt;
    if (g.heart <= 0) {
      sfx.thump();
      g.heart = lerp(1.2, 0.35, near);
    }

    // Suara derit & kedip acak
    g.creak -= dt;
    if (g.creak <= 0) {
      sfx.creak();
      g.creak = rand(9, 16);
    }
    g.flick -= dt;
    if (g.flick <= 0) {
      flickerFx();
      g.flick = g.battery < 25 ? rand(4, 8) : rand(10, 18);
    }

    // Tertangkap atau sanity habis
    if (gh && gh.distance <= 0 && phase !== 'cleared') {
      caught();
      if (phase === 'dead') return;
    }
    if (g.sanity <= 0) {
      endGame('sanity');
      return;
    }

    updateVisuals();
  }

  function frame(ts) {
    const dt = Math.min(0.05, (ts - lastTime) / 1000 || 0);
    lastTime = ts;
    if (state === 'playing') update(dt);
    requestAnimationFrame(frame);
  }

  /* ---------- Jeda & game over ---------- */
  function pauseGame() {
    if (state !== 'playing' || phase === 'dead') return;
    state = 'paused';
    pauseScreen.classList.remove('hidden');
  }

  function resumeGame() {
    if (state !== 'paused') return;
    state = 'playing';
    pauseScreen.classList.add('hidden');
  }

  function endGame(reason) {
  state = 'gameover';

  addLogbookEntry(
    'Permainan berakhir. Skor: ' + g.score +
    ', ruangan: ' + g.room +
    ', hantu dikalahkan: ' + g.defeated
  );

  phase = 'idle';
  timers = [];
  setPlayingUI(false);

  if (reason === 'sanity') {
    el.gameoverTitle.textContent = 'Kamu kehilangan akal';
    el.gameoverReason.textContent = 'Sanity-mu habis. Kamu tak sanggup lagi bertahan di rumah ini.';
  } else {
    el.gameoverTitle.textContent = 'Kamu tertangkap';
    el.gameoverReason.textContent = 'Hantu berhasil menangkapmu.';
  }

  const isRecord = g.score > highScore;
  if (isRecord) {
    highScore = g.score;
    saveHigh(highScore);
  }
  el.resScore.textContent = String(g.score);
  el.resRoom.textContent = String(g.room);
  el.resGhosts.textContent = String(g.defeated);
  el.resHigh.textContent = String(highScore);
  el.resNew.classList.toggle('hidden', !isRecord);
  el.menuHigh.textContent = String(highScore);
  showScreen('gameover');
}

  /* ---------- Input ---------- */
  document.addEventListener('keydown', (e) => {
    const code = e.code;

    if (code === 'KeyP' || code === 'Escape') {
      if (state === 'playing') pauseGame();
      else if (state === 'paused') resumeGame();
      return;
    }
    if (state !== 'playing') return;

    if (phase === 'quiz') {
      const map = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3 };
      if (code in map) {
        e.preventDefault();
        answerQuiz(map[code]);
      }
      return;
    }

    if (phase === 'attack' && (code === 'Space' || code === 'Enter' || code === 'KeyF')) {
      e.preventDefault();
      attack();
    }
  });

  /* ---------- Tombol UI ---------- */
  $('btn-start').addEventListener('click', startGame);
  $('btn-howto').addEventListener('click', () => showScreen('howto'));
  $('btn-howto-back').addEventListener('click', () => showScreen('menu'));
  $('btn-bestiary').addEventListener('click', () => {
    renderBestiary();
    showScreen('bestiary');
  });
  $('btn-bestiary-back').addEventListener('click', () => showScreen('menu'));
   $('btn-logbook').addEventListener('click', () => {
  renderLogbook();
  showScreen('logbook');
});

$('btn-logbook-back').addEventListener('click', () => {
  showScreen('menu');
});
  $('btn-retry').addEventListener('click', startGame);
  $('btn-menu').addEventListener('click', goMenu);
  $('btn-resume').addEventListener('click', resumeGame);
  $('btn-quit').addEventListener('click', goMenu);
  $('btn-pause').addEventListener('click', pauseGame);
  $('btn-attack').addEventListener('click', attack);
  el.ghost.addEventListener('click', attack);

  el.btnSound.addEventListener('click', () => {
    soundOn = !soundOn;
    el.btnSound.textContent = soundOn ? 'Suara: nyala' : 'Suara: mati';
    el.btnSound.setAttribute('aria-pressed', String(soundOn));
  });

  el.options.forEach((btn, i) => btn.addEventListener('click', () => answerQuiz(i)));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGame();
  });
  window.addEventListener('blur', pauseGame);

  /* ---------- Mulai ---------- */
  el.menuHigh.textContent = String(highScore);
  renderBestiary();
  showScreen('menu');
  requestAnimationFrame(frame);
})();
