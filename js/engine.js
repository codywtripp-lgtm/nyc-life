// Game rules. No DOM here: every action changes the state and returns what
// happened (text, stat changes, stickers). That keeps the rules ready to move to
// a server later (multiplayer, shared economy) so nobody edits their cash in the browser.
(function () {
  const D = NYC.DATA, T = D.text;
  const SAVE_KEY = 'nyclife.save.v2';
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const FARE = 2.9;

  const E = {};
  let S = null;
  const listeners = [];
  E.on = fn => listeners.push(fn);
  const emit = (type, data) => listeners.forEach(fn => fn(type, data));

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const clamp = v => Math.max(0, Math.min(100, v));
  const money = n => { const v = Math.round(Math.abs(n) * 100) / 100; return '$' + (v % 1 ? v.toFixed(2) : v); };
  E.money = money;
  const fmt = (s, extra) => String(s).replace(/\{(\w+)\}/g, (m, k) => {
    if (extra && extra[k] !== undefined) return extra[k];
    if (!S) return m;
    if (k === 'hood') return E.apt().hood;
    if (k === 'line') return E.apt().line;
    if (k === 'name') return S.char.name;
    return m;
  });
  E.fmt = fmt;

  const freshWeek = () => ({ earned: 0, spent: 0, rent: 0, shifts: 0, delays: 0, rats: 0, cats: 0, slices: 0, bodega: 0, brunches: 0, carts: 0, shows: 0, talks: 0, moments: [], lowSanity: 100 });

  // ------------------------------------------------------------ save / load
  E.save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* private mode: play without saving */ } };
  E.load = () => {
    try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { S = JSON.parse(raw); return true; } } catch (e) { }
    return false;
  };
  E.reset = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } S = null; };
  E.state = () => S;

  // ------------------------------------------------------------ helpers the UI uses
  E.apt = () => D.apartments[S.apt];
  E.job = () => S.job ? D.jobs.find(j => j.id === S.job.id) : null;
  E.jobTitle = () => { const j = E.job(); return j ? (S.job.promoted ? j.promo : j.title) : 'Unemployed'; };
  E.bg = () => D.backgrounds.find(b => b.id === S.bg);
  E.dayName = d => DAYS[((d || S.day) - 1) % 7];
  E.week = () => Math.floor((S.day - 1) / 7) + 1;
  E.rent = () => Math.round((E.apt().rent + (S.rentHike || 0)) * (E.week() === 1 ? 0.5 : 1));
  E.bills = () => D.bills.reduce((s, b) => s + b.amt, 0);
  E.daysToRent = () => 7 - ((S.day - 1) % 7);
  E.clock = h => {
    h = h === undefined ? S.hour : h;
    const hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60);
    const ap = hh < 12 ? 'AM' : 'PM', h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ':' + String(mm).padStart(2, '0') + ' ' + ap;
  };
  E.areaName = id => {
    id = id || S.area;
    if (id === 'home') { const a = E.apt(); return a.hood + ', ' + a.boro; }
    const ar = D.areas[id]; return ar.name + ', ' + ar.boro;
  };
  E.isNight = () => S.hour >= 19 || S.hour < 6;
  E.stickerCount = () => Object.keys(S.stickers).length;
  E.rank = () => { let r = D.ranks[0]; D.ranks.forEach(x => { if (E.stickerCount() >= x.n) r = x; }); return r; };
  E.nextRank = () => D.ranks.find(x => x.n > E.stickerCount()) || null;

  // ------------------------------------------------------------ new game
  E.rollBackground = () => pick(D.backgrounds).id;
  E.rollHook = () => T.hookPrefix + pick(D.hook.who) + ' with ' + pick(D.hook.with) + '.';
  E.newGame = (char, bgId) => {
    const bg = D.backgrounds.find(b => b.id === bgId);
    S = {
      v: 2, char, bg: bg.id, day: 1, hour: 8, cash: bg.cash,
      energy: 85, full: 60, sanity: bg.sanity, cred: bg.cred,
      area: 'home', at: 'home_sub', apt: bg.apt, rentHike: 0, rentOwed: 0, missedRent: 0,
      job: null, strikes: 0, lastLaundry: 1, today: {}, recap: [],
      perkTrain: bg.perk === 'trainwise', perkParents: bg.perk === 'parents', perkCharm: bg.perk === 'charm',
      npc: {}, rafi: 0, mango: 0, tab: 0, stickers: {}, pending: null, arrived: false,
      task: null, weekGoal: null,
      week: freshWeek(), life: { weeks: 0, earned: 0, rats: 0, delays: 0, slices: 0, cats: 0 },
      log: [], lastWeek: null
    };
    S.task = pickTask();
    S.weekGoal = pick(D.weekGoals).id;
    E.save();
    emit('change');
  };

  // ------------------------------------------------------------ bookkeeping
  let snap = null, fresh = null;
  function begin() {
    snap = { cash: S.cash, energy: S.energy, full: S.full, sanity: S.sanity, cred: S.cred };
    fresh = { stickers: [], notes: [] };
  }
  function note(text, kind) {
    S.log.unshift({ d: S.day, t: E.clock(), text, kind: kind || 'info' });
    if (S.log.length > 60) S.log.length = 60;
  }
  function recap(text) { if (text && S.recap.indexOf(text) < 0) { S.recap.push(text); if (S.recap.length > 6) S.recap.shift(); } }
  function moment(text) { if (text && S.week.moments.indexOf(text) < 0) { S.week.moments.push(text); if (S.week.moments.length > 12) S.week.moments.shift(); } }

  function award(id) {
    if (!id || S.stickers[id] || !D.stickers[id]) return;
    const before = E.rank().name;
    S.stickers[id] = S.day;
    fresh.stickers.push(id);
    const after = E.rank().name;
    if (after !== before) fresh.notes.push({ kind: 'rank', text: fmt(T.newRank, { rank: after }) });
  }

  function apply(fx) {
    if (!fx) return;
    if (fx.cash) {
      S.cash = Math.round((S.cash + fx.cash) * 100) / 100;
      if (fx.cash < 0) S.week.spent -= fx.cash; else S.week.earned += fx.cash;
    }
    ['energy', 'full', 'sanity'].forEach(k => { if (fx[k]) S[k] = clamp(S[k] + fx[k]); });
    if (fx.cred) S.cred = Math.max(-50, S.cred + fx.cred);
    if (fx.rentHike) S.rentHike += fx.rentHike;
    if (fx.hours) pass(fx.hours);
  }

  // Time passing drains food and energy.
  function pass(h) {
    S.hour += h;
    S.full = clamp(S.full - 3.5 * h);
    S.energy = clamp(S.energy - 2 * h);
    if (S.full <= 0) S.sanity = clamp(S.sanity - 3 * h);
  }

  function count(key) {
    if (!key) return;
    if (key === 'slices2') { S.week.slices += 2; S.life.slices += 2; return; }
    S.week[key] = (S.week[key] || 0) + 1;
    if (S.life[key] !== undefined) S.life[key]++;
  }

  // goals: called with the id of whatever just happened
  function progress(actId) {
    const t = D.tasks.find(x => x.id === S.task);
    if (t && !S.today.taskDone && t.acts.indexOf(actId) >= 0) {
      S.today.taskDone = true;
      apply(t.reward);
      fresh.notes.push({ kind: 'task', text: fmt(T.taskDone, { task: t.text }) });
    }
    const g = D.weekGoals.find(x => x.id === S.weekGoal);
    if (g && !S.week.goalDone && (S.week[g.count] || 0) >= g.n) {
      S.week.goalDone = true;
      apply(g.reward);
      fresh.notes.push({ kind: 'task', text: fmt(T.weekGoalDone, { goal: g.text }) });
    }
  }
  function pickTask() {
    if (S.day === 1) return 'eat';
    if (S.day === 2 && !S.job) return 'work';
    const pool = D.tasks.filter(t => t.id !== S.task && t.id !== 'eat' && !(t.needsJob && !S.job) && !(t.needsNoJob && S.job) &&
      !(t.id.startsWith('walt') && (S.npc.walt || 0) >= D.npcs.walt.lines.length) &&
      !(t.id === 'dolores' && (S.npc.dolores || 0) >= D.npcs.dolores.lines.length) &&
      !(t.id === 'jordan' && (S.npc.jordan || 0) >= D.npcs.jordan.lines.length));
    return pick(pool).id;
  }
  E.task = () => D.tasks.find(x => x.id === S.task);
  // where the player should go for today's task (the subway if it's in another area)
  E.taskPlace = () => {
    const t = E.task();
    if (!t || S.today.taskDone || !S.arrived) return null;
    let pid = null;
    t.acts.some(id => {
      if (id.startsWith('talk_')) pid = D.npcs[id.slice(5)].place;
      else if (id === 'work') pid = E.job() ? E.job().place : null;
      else pid = Object.keys(D.places).find(k => (D.places[k].actions || []).some(a => a.id === id));
      return pid;
    });
    if (!pid) return null;
    return D.places[pid].area === S.area ? pid : D.areas[S.area].subway;
  };
  E.weekGoal = () => D.weekGoals.find(x => x.id === S.weekGoal);

  // Result for the UI: { say, event, modal, delta, stickers, notes, slept, recap, week }
  function done(res) {
    res = res || {};
    if (!res.slept && (S.hour >= 26 || S.energy <= 0)) {
      const where = S.at === 'home_apt' ? T.lightsOutHome : S.area === 'home' ? T.lightsOutBlock : T.lightsOutAway;
      res.lightsOut = where;
      Object.assign(res, sleep(S.at === 'home_apt' ? 0 : -12));
    }
    S.week.lowSanity = Math.min(S.week.lowSanity, S.sanity);
    if (snap) {
      res.delta = {};
      ['cash', 'energy', 'full', 'sanity', 'cred'].forEach(k => {
        const d = Math.round((S[k] - snap[k]) * 100) / 100;
        if (d && !res.slept) res.delta[k] = d;
      });
    }
    if (fresh) { res.stickers = fresh.stickers; res.notes = fresh.notes; }
    snap = null; fresh = null;
    E.save();
    emit('change');
    return res;
  }

  // ------------------------------------------------------------ actions at a place
  E.actionsAt = placeId => {
    const p = D.places[placeId];
    let list = (p.actions || []).map(a => Object.assign({}, a));
    const j = E.job();
    if (j && j.place === placeId) {
      const [lo, hi] = payRange(j);
      list.unshift({ id: 'work', label: 'Work a shift (' + E.jobTitle() + ')', hours: j.hours, special: 'work', hint: 'Pays ' + money(lo) + ' to ' + money(hi) });
    }
    Object.keys(D.npcs).forEach(id => {
      const n = D.npcs[id];
      if (n.place === placeId && (S.npc[id] || 0) < n.lines.length) list.push({ id: 'talk_' + id, label: n.talk, hours: 0.5, special: 'talk', npc: id, once: true });
    });
    if (placeId === 'bodega') list = list.filter(a => a.id !== 'tab' || (S.cash < 5 && !S.tab));
    if (p.kind === 'subway') list.push({ id: 'travel', label: 'Take the train', special: 'travel', hint: money(FARE) });
    list.forEach(a => {
      a.disabled = null;
      const cost = a.fx && a.fx.cash < 0 ? -a.fx.cash : 0;
      if (a.once && S.today[a.id]) a.disabled = 'Done for today';
      else if (cost && S.cash < cost) a.disabled = 'Not enough cash';
      else if (a.special === 'work' && S.today.work) a.disabled = 'Already worked today';
      else if (a.hours && S.hour + a.hours > 26) a.disabled = 'Too late';
    });
    return list;
  };

  function payRange(j) {
    const k = S.job && S.job.promoted ? 1.18 : 1;
    return [j.pay[0] * k, j.pay[1] * k];
  }

  E.act = (placeId, actionId, arg) => {
    const a = E.actionsAt(placeId).find(x => x.id === actionId);
    if (!a || a.disabled) return { say: a ? a.disabled : 'Can\'t do that.' };
    begin();
    S.at = placeId;
    if (a.once) S.today[a.id] = true;
    let res;
    switch (a.special) {
      case 'sleep': return done(sleep(0));
      case 'work': res = work(); break;
      case 'travel': res = travel(arg); break;
      case 'hunt': pass(a.hours); res = { modal: 'listings', listings: listings() }; break;
      case 'jobs': pass(a.hours); res = { modal: 'jobs' }; break;
      case 'scratch': res = scratch(a); break;
      case 'busk': res = busk(); break;
      case 'bar': res = bar(a); break;
      case 'openmic': res = openmic(a); break;
      case 'talk': res = talk(a.npc); break;
      case 'cat': res = cat(a); break;
      case 'tab': res = tab(a); break;
      default: res = plain(a);
    }
    if (a.recap) recap(a.recap);
    count(a.count);
    if (a.npc === 'rafi') res = rafiVisit(res);
    award(a.sticker);
    progress(a.id);
    if (!res.event && !res.modal && placeId.indexOf('sub') < 0 && a.special !== 'talk') Object.assign(res, maybeEvent('street', 0.12));
    return done(res);
  };

  function plain(a) {
    if (a.special === 'laundry') S.lastLaundry = S.day;
    apply(a.fx);
    if (a.hours) pass(a.hours);
    const say = a.say && a.say.length ? pick(a.say) : null;
    if (say) note(say);
    return { say };
  }

  // ------------------------------------------------------------ the cast
  function talk(id) {
    const n = D.npcs[id];
    const i = S.npc[id] || 0;
    const say = n.lines[i];
    S.npc[id] = i + 1;
    pass(0.5);
    apply({ sanity: 4 });
    count('talks');
    if (S.npc[id] >= n.lines.length) award(n.sticker);
    recap('talked to ' + n.name);
    note(say, 'story');
    return { say, who: n.name };
  }
  function rafiVisit(res) {
    S.rafi++;
    if (S.rafi === D.rafi.regular) { res.say = D.rafi.regularLine; award('regular'); note(res.say, 'story'); }
    else if (S.rafi > D.rafi.regular && Math.random() < 0.5) res.say = pick(D.rafi.usual);
    return res;
  }
  function tab(a) {
    let say;
    if (S.rafi < D.rafi.regular) { say = D.rafi.tabNo; pass(0.25); }
    else { apply(a.fx); pass(a.hours); S.tab = 5; say = D.rafi.tabYes; recap('ate on Rafi\'s tab'); }
    note(say, 'story');
    return { say };
  }
  function cat(a) {
    S.mango++;
    apply(a.fx); pass(a.hours);
    let say;
    if (S.mango < D.mango.after) say = D.mango.ignore[(S.mango - 1) % D.mango.ignore.length];
    else if (S.mango === D.mango.after) { say = D.mango.finally; award('mango'); }
    else say = pick(D.mango.friend);
    note(say);
    return { say };
  }

  // ------------------------------------------------------------ specials
  function work() {
    const j = E.job();
    const [lo, hi] = payRange(j);
    let pay = Math.round(rand(lo, hi));
    if (S.sanity < 20) pay = Math.round(pay * 0.8);
    pass(j.hours);
    apply({ cash: pay, energy: -j.energy, sanity: j.sanity || -4 });
    S.today.work = true; S.strikes = 0;
    S.job.shifts++; count('shifts');
    recap('worked a shift (+' + money(pay) + ')');
    let say = pick(j.lines) + ' +' + money(pay) + '.';
    if (!S.job.promoted && S.job.shifts >= 10) {
      S.job.promoted = true; S.cred += 6;
      say += ' ' + fmt(T.promoted, { promo: j.promo });
      moment('got promoted to ' + j.promo); award('promoted');
    }
    note(say, 'money');
    return { say };
  }

  function travel(dest) {
    if (!dest || dest === S.area) return { say: 'You\'re already here.' };
    if (S.cash < FARE) {
      pass(2.5); apply({ energy: -15, sanity: -4 });
      S.area = dest; S.at = D.areas[dest].subway;
      note(T.walked); recap('walked across the city');
      return { say: T.walked, moved: true };
    }
    apply({ cash: -FARE });
    const commute = (dest === 'home' || S.area === 'home') ? E.apt().commute : 1;
    pass(commute * 0.75);
    S.area = dest; S.at = D.areas[dest].subway;
    const ev = maybeEvent('subway', S.perkTrain ? 0.45 : 0.6, S.perkTrain ? ['held', 'express'] : null);
    return Object.assign({ moved: true, sound: 'train' }, ev);
  }

  function scratch(a) {
    apply(a.fx); pass(a.hours);
    const r = Math.random();
    let say;
    if (r < 0.006) { apply({ cash: 500 }); say = T.scratchBig; moment('won $500 on a bodega scratch-off'); award('scratch'); recap('WON $500 on a scratch-off'); }
    else if (r < 0.06) { apply({ cash: 20 }); say = T.scratchSmall; recap('won $20 on a scratch-off'); }
    else if (r < 0.2) { apply({ cash: 2 }); say = T.scratchEven; }
    else { say = pick(T.scratchNo); recap('lost $2 on a scratch-off'); }
    note(say);
    return { say };
  }

  function busk() {
    pass(2);
    const take = Math.round(rand(0, 30) + (S.cred > 20 ? 10 : 0) + (S.perkCharm ? 12 : 0));
    apply({ cash: take, energy: -10, sanity: take > 25 ? 6 : -3 });
    const say = fmt(take > 25 ? T.buskBig : take > 0 ? T.buskSmall : T.buskNone, { pay: '+' + money(take) });
    if (take > 25) moment('sang for a crowd of tourists in Midtown');
    recap(take ? 'sang in the plaza for ' + money(take) : 'sang to nobody in the plaza');
    note(say, 'money');
    return { say };
  }

  function bar(a) {
    apply(a.fx); pass(a.hours);
    const r = Math.random();
    let say;
    if (r < 0.25) { apply({ cred: 5 }); say = T.barNetwork; }
    else if (r < 0.45) { apply({ cash: -14, energy: -8 }); say = T.barRounds; }
    else say = pick(T.barPlain);
    note(say);
    return { say };
  }

  function openmic(a) {
    apply(a.fx); pass(a.hours);
    const good = Math.random() < 0.35 + (S.perkCharm ? 0.2 : 0) + Math.max(0, S.cred) / 200;
    const say = good ? T.micGood : T.micBad;
    apply(good ? { sanity: 14, cred: 5 } : { sanity: -8, cred: 1 });
    if (good) { moment('killed at an open mic'); award('killed'); recap('KILLED at the open mic'); } else recap('bombed at the open mic');
    note(say);
    return { say };
  }

  // ------------------------------------------------------------ jobs
  E.jobChance = j => {
    if (S.cred < j.req) return 0;
    return Math.min(0.95, 0.6 + (S.cred - j.req) / 60 + (S.perkCharm ? 0.1 : 0));
  };
  E.applyJob = id => {
    const j = D.jobs.find(x => x.id === id);
    begin();
    pass(1);
    let res;
    if (Math.random() < E.jobChance(j)) {
      S.job = { id: j.id, shifts: 0, promoted: false }; S.strikes = 0;
      res = { say: fmt(T.hired, { title: j.title, place: D.places[j.place].name.toLowerCase() }), ok: true };
      moment('got hired as a ' + j.title.toLowerCase()); recap('got hired as a ' + j.title.toLowerCase());
    } else {
      res = { say: pick(T.jobNo) };
      apply({ sanity: -4 }); recap('got rejected by a staffing agency');
    }
    note(res.say, res.ok ? 'money' : 'info');
    return done(res);
  };

  // ------------------------------------------------------------ apartments
  function listings() {
    const pool = Object.keys(D.apartments).filter(id => id !== S.apt && id !== 'couch' && (!D.apartments[id].rare || Math.random() < 0.12));
    const out = [];
    while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  }
  E.moveCost = id => D.apartments[id].rent * 2 + 150; // broker fee (2 weeks) + a man with a van
  E.moveIn = id => {
    const cost = E.moveCost(id);
    if (S.cash < cost) return { say: 'You need ' + money(cost) + '.' };
    begin();
    apply({ cash: -cost, energy: -20, sanity: 8 });
    pass(3);
    S.apt = id; S.rentHike = 0; S.missedRent = 0; S.rentOwed = 0;
    S.area = 'home'; S.at = 'home_apt';
    const a = D.apartments[id];
    const say = fmt(T.moved, { hood: a.hood, note: a.note });
    moment('moved to ' + a.hood); recap('moved to ' + a.hood);
    note(say, 'story');
    return done({ say, moved: true });
  };

  // ------------------------------------------------------------ first 30 seconds
  E.arrive = idx => {
    begin();
    const o = D.arrival.options[idx];
    apply(o.fx); award(o.sticker); recap(o.recap);
    S.arrived = true;
    note(o.say, 'story');
    return done({ say: o.say });
  };

  E.tapPigeon = () => {
    begin();
    S.pigeons = (S.pigeons || 0) + 1;
    if (S.pigeons === 5) award('pigeon');
    return done({ say: pick(T.pigeons) });
  };

  // ------------------------------------------------------------ sleep + week rollover
  function sleep(extraSanity) {
    const apt = E.apt();
    const j = E.job();
    const dow = (S.day - 1) % 7;
    const yesterday = { day: S.day, dayName: E.dayName(), items: S.recap.length ? S.recap.slice() : [T.recapEmpty], cash: S.cash };
    if (j && !j.gig && dow < 5 && !S.today.work) {
      S.strikes++;
      if (S.strikes >= 3) { note(T.fired, 'bad'); moment('got fired for not showing up'); S.job = null; S.strikes = 0; yesterday.items.push('got fired'); }
      else note(fmt(T.missedShift, { n: S.strikes }), 'bad');
    }
    if (S.tab) { apply({ cash: -S.tab }); S.tab = 0; note(D.rafi.tabPaid); }
    // overnight: the city wears you down a little; a good apartment softens it
    S.energy = clamp(Math.max(S.energy, 0) + apt.rest);
    S.full = clamp(S.full - 15);
    S.sanity = clamp(S.sanity - 6 + apt.vibe + (extraSanity || 0));
    if (S.day - S.lastLaundry > 7) { S.sanity = clamp(S.sanity - 4); note(T.socks, 'bad'); }
    if (S.job && E.job().risky && Math.random() < 0.04) { note(T.startupFolded, 'bad'); moment('their startup folded'); S.job = null; }

    // tonight's event waits until morning (the cliffhanger)
    const ev = pickEvent('night', 0.65);
    S.pending = ev ? ev.id : null;
    yesterday.tease = ev ? (ev.tease || null) : null;

    const endWeek = S.day % 7 === 0;
    S.day++; S.hour = 8; S.today = {}; S.recap = []; S.area = 'home'; S.at = 'home_apt';
    S.task = pickTask();
    // burnout: run sanity to zero and you lose the next day in bed (a real cost to grinding)
    if (S.sanity <= 3) {
      S.hour = 20; S.today.burnout = true;
      S.sanity = clamp(S.sanity + 35); S.energy = 100;
      recap(T.burnoutRecap); moment(T.burnoutRecap);
      yesterday.burnout = T.burnout;
    }
    const res = { slept: true, yesterday, sound: 'night' };
    if (endWeek) {
      if (S.perkParents) { apply({ cash: 250, sanity: -6 }); note(T.parentsVenmo, 'money'); }
      res.week = rentDay();
    }
    return res;
  }

  // shown when the player taps "next morning"
  E.morning = () => {
    if (!S.pending) return {};
    const ev = D.events.find(e => e.id === S.pending);
    S.pending = null;
    begin();
    return done(runEvent(ev));
  };

  function rentDay() {
    // bills come out first; you can't skip the phone bill
    const bills = E.bills();
    S.cash = Math.round((S.cash - bills) * 100) / 100;
    S.week.spent += bills;
    const due = Math.round(E.rentFor(E.week() - 1) + S.rentOwed);
    let paid, evicted = false;
    if (S.cash >= due) { paid = due; S.cash -= due; S.rentOwed = 0; S.missedRent = 0; award('rentday'); }
    else {
      paid = Math.max(0, Math.floor(S.cash)); S.cash -= paid; S.rentOwed = due - paid; S.missedRent++;
      if (S.missedRent >= 2 && S.apt !== 'couch') {
        evicted = true; moment('got evicted onto a cousin\'s couch');
        note(T.evicted, 'bad');
        S.apt = 'couch'; S.rentOwed = 0; S.missedRent = 0; S.rentHike = 0;
      }
    }
    S.week.rent = paid;
    S.week.spent += paid;
    const g = E.weekGoal();
    const summary = Object.assign({}, S.week, {
      weekNo: E.week() - 1, cash: S.cash, due, paid, bills, owed: S.rentOwed, evicted,
      sanity: S.sanity, cred: S.cred, job: E.jobTitle(), apt: E.apt().name, hood: E.apt().hood,
      hook: S.char.hook, rank: E.rank().name, stickers: E.stickerCount(), goal: g ? g.text : '', goalDone: !!S.week.goalDone
    });
    S.life.weeks++; S.life.earned += S.week.earned;
    S.lastWeek = summary;
    S.week = freshWeek();
    S.weekGoal = pick(D.weekGoals.filter(x => x.id !== S.weekGoal)).id;
    note(fmt(paid >= due ? T.rentPaid : T.rentShort, { amt: money(paid >= due ? paid : due - paid) }), paid >= due ? 'money' : 'bad');
    return summary;
  }
  E.rentFor = weekNo => Math.round((E.apt().rent + (S.rentHike || 0)) * (weekNo === 1 ? 0.5 : 1));

  // ------------------------------------------------------------ events
  function pickEvent(where, chance, skip) {
    if (Math.random() > chance) return null;
    let pool = D.events.filter(e => e.where === where && (!e.when || e.when(S)) && !(e.sticker && S.stickers[e.sticker] && e.weight < 2));
    if (skip) pool = pool.filter(e => skip.indexOf(e.id) < 0); // train-wise players dodge some delays
    if (!pool.length) return null;
    const total = pool.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    return pool.find(e => (r -= e.weight) < 0) || pool[0];
  }
  function runEvent(ev) {
    const text = fmt(ev.text);
    if (!ev.options) {
      apply(ev.fx); count(ev.count); award(ev.sticker); recap(ev.recap);
      moment(ev.recap);
      note(text, 'event');
    }
    return { event: { id: ev.id, text, options: ev.options ? ev.options.map(o => o.label) : null } };
  }
  function maybeEvent(where, chance, skip) {
    const ev = pickEvent(where, chance, skip);
    return ev ? runEvent(ev) : {};
  }

  E.choose = (eventId, idx) => {
    const ev = D.events.find(e => e.id === eventId);
    const opt = ev.options[idx];
    begin();
    apply(opt.fx); award(opt.sticker); recap(opt.recap); moment(opt.recap);
    note(fmt(ev.text) + ' ' + opt.say, 'event');
    return done({ say: opt.say });
  };

  // ------------------------------------------------------------ share text
  E.shareText = w => {
    w = w || S.lastWeek;
    const n = (k, one, many) => k + ' ' + (k === 1 ? one : many);
    const bits = ['My NYC life, week ' + w.weekNo + ': made ' + money(w.earned)];
    if (w.paid) bits.push(w.paid >= w.due ? 'paid ' + money(w.paid) + ' rent' : 'came up short on rent');
    if (w.delays) bits.push('sat through ' + n(w.delays, 'train delay', 'train delays'));
    if (w.slices) bits.push('ate ' + n(w.slices, 'dollar slice', 'dollar slices'));
    if (w.rats) bits.push('saw ' + n(w.rats, 'rat', 'rats'));
    return bits.join(', ') + '. Rank: ' + w.rank + '.';
  };

  window.NYC.Engine = E;
})();
