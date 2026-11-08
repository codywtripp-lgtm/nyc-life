// Game rules. No DOM here: every action takes the state, changes it, and returns
// what happened. That keeps the rules ready to move to a server later (multiplayer,
// shared economy) so players can't edit their cash in the browser.
(function () {
  const D = NYC.DATA;
  const SAVE_KEY = 'nyclife.save.v1';
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
  const money = n => '$' + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);
  E.money = money;

  const freshWeek = () => ({ earned: 0, spent: 0, rent: 0, shifts: 0, delays: 0, rats: 0, cats: 0, slices: 0, bodega: 0, brunches: 0, carts: 0, moments: [], lowSanity: 100 });

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
  E.rent = () => E.apt().rent + (S.rentHike || 0);
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

  // ------------------------------------------------------------ new game
  E.rollBackground = () => pick(D.backgrounds).id;
  E.newGame = (char, bgId) => {
    const bg = D.backgrounds.find(b => b.id === bgId);
    S = {
      v: 1, char, bg: bg.id, day: 1, hour: 8, cash: bg.cash,
      energy: 85, full: 70, sanity: bg.sanity, cred: bg.cred,
      area: 'home', at: 'home_apt', apt: bg.apt, rentHike: 0, rentOwed: 0, missedRent: 0,
      job: null, strikes: 0, lastLaundry: 1, today: {},
      perkTrain: bg.perk === 'trainwise', perkParents: bg.perk === 'parents', perkCharm: bg.perk === 'charm',
      week: freshWeek(), life: { weeks: 0, earned: 0, rats: 0, delays: 0, slices: 0, cats: 0 },
      log: [], listings: null
    };
    note(bg.intro, 'story');
    E.save();
    emit('change');
  };

  // ------------------------------------------------------------ core state changes
  function note(text, kind) {
    S.log.unshift({ d: S.day, t: E.clock(), text, kind: kind || 'info' });
    if (S.log.length > 60) S.log.length = 60;
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
    S.week.lowSanity = Math.min(S.week.lowSanity, S.sanity);
  }

  // Time passing drains food and energy.
  function pass(h) {
    S.hour += h;
    S.full = clamp(S.full - 3.5 * h);
    S.energy = clamp(S.energy - 2 * h);
    if (S.full <= 0) S.sanity = clamp(S.sanity - 3 * h);
  }

  function count(key, n) {
    if (!key) return;
    if (key === 'slices2') { S.week.slices += 2; S.life.slices += 2; return; }
    S.week[key] = (S.week[key] || 0) + (n || 1);
    if (S.life[key] !== undefined) S.life[key] += (n || 1);
  }

  function moment(text) { if (text && S.week.moments.indexOf(text) < 0) { S.week.moments.push(text); if (S.week.moments.length > 12) S.week.moments.shift(); } }

  // Result object returned to the UI: { say, event, modal, toast }
  function done(res) {
    res = res || {};
    // forced sleep checks
    if (!res.slept && (S.hour >= 26 || S.energy <= 0)) {
      const where = S.area === 'home' && S.at === 'home_apt' ? 'home' : 'out';
      res.followup = { title: 'Lights out', text: where === 'home'
        ? 'You fell asleep with your shoes on.'
        : (S.area === 'home' ? 'You fell asleep on the stoop. A neighbor put a blanket on you. Weird but nice.' : 'You fell asleep on the train and woke up at the end of the line. It took 2 hours to get home.') };
      sleep(where === 'home' ? 0 : -15);
      res.slept = true;
    }
    S.week.lowSanity = Math.min(S.week.lowSanity, S.sanity);
    E.save();
    emit('change');
    return res;
  }

  // ------------------------------------------------------------ available actions at a place
  E.actionsAt = placeId => {
    const p = D.places[placeId];
    const list = (p.actions || []).map(a => Object.assign({}, a));
    const j = E.job();
    if (j && j.place === placeId) {
      list.unshift({ id: 'work', label: 'Work a shift (' + E.jobTitle() + ')', hours: j.hours, special: 'work', hint: 'Pays ' + money(payRange(j)[0]) + '-' + money(payRange(j)[1]) });
    }
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

  // ------------------------------------------------------------ do an action
  E.act = (placeId, actionId, arg) => {
    const a = E.actionsAt(placeId).find(x => x.id === actionId);
    if (!a || a.disabled) return { say: a ? a.disabled : 'Can\'t do that.' };
    S.at = placeId;
    if (a.once) S.today[a.id] = true;

    switch (a.special) {
      case 'sleep': return done(sleep(0));
      case 'work': return done(work());
      case 'travel': return done(travel(arg));
      case 'hunt': pass(a.hours); return done({ modal: 'listings', listings: listings() });
      case 'jobs': pass(a.hours); return done({ modal: 'jobs' });
      case 'scratch': return done(scratch(a));
      case 'busk': return done(busk(a));
      case 'bar': return done(bar(a));
      case 'openmic': return done(openmic(a));
      case 'laundry': S.lastLaundry = S.day;
    }
    apply(a.fx);
    if (a.hours) pass(a.hours);
    count(a.count);
    const say = a.say && a.say.length ? pick(a.say) : null;
    if (say) note(say);
    return done(Object.assign({ say }, maybeEvent('street', 0.12)));
  };

  // ------------------------------------------------------------ specials
  function work() {
    const j = E.job();
    const [lo, hi] = payRange(j);
    let pay = Math.round(rand(lo, hi));
    if (S.sanity < 20) pay = Math.round(pay * 0.8);
    pass(j.hours);
    apply({ cash: pay, energy: -j.energy, sanity: j.sanity || -4 });
    S.today.work = true; S.strikes = 0;
    S.job.shifts++; S.week.shifts++;
    let say = pick(j.lines) + ' +' + money(pay) + '.';
    if (!S.job.promoted && S.job.shifts >= 8) {
      S.job.promoted = true; S.cred += 6;
      say += ' You got promoted to ' + j.promo + '! Pay up 18%.';
      moment('got promoted to ' + j.promo);
    }
    note(say, 'money');
    return { say };
  }

  function travel(dest) {
    if (!dest || dest === S.area) return { say: 'You\'re already here.' };
    if (S.cash < FARE) {
      // can't afford fare: walk (takes longer)
      pass(2.5); apply({ energy: -15, sanity: -4 });
      S.area = dest; S.at = D.areas[dest].subway;
      note('No money for the fare. You walked. Your calves will remember this.');
      return { say: 'You walked the whole way. 2.5 hours.', moved: true };
    }
    apply({ cash: -FARE });
    const commute = (dest === 'home' || S.area === 'home') ? E.apt().commute : 1;
    pass(commute * 0.75);
    S.area = dest; S.at = D.areas[dest].subway;
    const ev = maybeEvent('subway', S.perkTrain ? 0.4 : 0.6, S.perkTrain ? ['held', 'express'] : null);
    return Object.assign({ moved: true, say: 'You arrived in ' + E.areaName(dest) + '.' }, ev);
  }

  function scratch(a) {
    apply(a.fx); pass(a.hours);
    const r = Math.random();
    let say;
    if (r < 0.006) { apply({ cash: 500 }); say = 'YOU WON $500. The bodega guy says this has happened before, once, in 2009.'; moment('won $500 on a bodega scratch-off'); }
    else if (r < 0.06) { apply({ cash: 20 }); say = 'Won $20! You immediately spent it emotionally.'; }
    else if (r < 0.2) { apply({ cash: 2 }); say = 'Won $2. You broke even. The house always... breaks even?'; }
    else say = pick(['Nothing. The cat watched you lose.', 'Nothing. You scratched with a key and now the key is sad.', 'So close. (It was not close.)']);
    note(say);
    return { say };
  }

  function busk() {
    pass(2);
    let take = Math.round(rand(0, 30) + (S.cred > 20 ? 10 : 0) + (S.perkCharm ? 12 : 0));
    apply({ cash: take, energy: -10, sanity: take > 25 ? 6 : -3 });
    const say = take > 25 ? 'You sang to a crowd of 40 tourists. +' + money(take) + '. One filmed you. You might be famous in Ohio.'
      : take > 0 ? 'Mostly coins. A man gave you a single grape. +' + money(take) + '.'
        : 'Nothing. The saxophone guy across the plaza is your rival now.';
    if (take > 25) moment('busked for a crowd of tourists in Midtown');
    note(say, 'money');
    return { say };
  }

  function bar(a) {
    apply(a.fx); pass(a.hours);
    const r = Math.random();
    let say;
    if (r < 0.25) { apply({ cred: 5 }); say = 'You met someone who "knows a guy" at a staffing agency. +5 cred.'; }
    else if (r < 0.45) { apply({ cash: -14 }); say = 'You agreed to "one more round." It was three more rounds.'; }
    else say = pick(['The jukebox played the same song four times. Nobody stopped it.', 'You told a stranger your entire rent situation. They topped it.']);
    note(say);
    return { say };
  }

  function openmic(a) {
    apply(a.fx); pass(a.hours);
    const good = Math.random() < 0.35 + (S.perkCharm ? 0.2 : 0) + Math.max(0, S.cred) / 200;
    const say = good ? 'Your bit about your landlord KILLED. Someone said "you should do this for real."'
      : 'You bombed. One guy laughed, but it was at his phone.';
    apply(good ? { sanity: 14, cred: 5 } : { sanity: -8, cred: 1 });
    if (good) moment('killed at an open mic with a landlord bit');
    note(say);
    return { say };
  }

  // ------------------------------------------------------------ jobs
  E.jobChance = j => {
    if (S.cred < j.req) return 0;
    return Math.min(0.95, 0.55 + (S.cred - j.req) / 60 + (S.perkCharm ? 0.1 : 0));
  };
  E.applyJob = id => {
    const j = D.jobs.find(x => x.id === id);
    pass(1);
    let res;
    if (Math.random() < E.jobChance(j)) {
      S.job = { id: j.id, shifts: 0, promoted: false }; S.strikes = 0;
      res = { say: 'You got the job: ' + j.title + '! Your shift is at the ' + D.places[j.place].name.toLowerCase() + '.', ok: true };
      moment('got hired as a ' + j.title.toLowerCase());
    } else {
      res = { say: pick(['They said they\'d "keep your resume on file." The file is a trash can.', 'They went with someone who has 5 years of experience for an entry-level role.', 'The interviewer asked where you see yourself in 5 years. You said "alive."']) };
      apply({ sanity: -4 });
    }
    note(res.say, res.ok ? 'money' : 'info');
    return done(res);
  };

  // ------------------------------------------------------------ apartments
  function listings() {
    const pool = Object.keys(D.apartments).filter(id => id !== S.apt && id !== 'couch' && (!D.apartments[id].rare || Math.random() < 0.12));
    const out = [];
    while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    S.listings = out;
    return out;
  }
  E.moveCost = id => { const a = D.apartments[id]; return a.rent * 2 + 150; }; // broker fee (2 weeks) + van
  E.moveIn = id => {
    const cost = E.moveCost(id);
    if (S.cash < cost) return { say: 'You need ' + money(cost) + ' (broker fee + a man with a van).' };
    apply({ cash: -cost, energy: -20, sanity: 8 });
    pass(3);
    S.apt = id; S.rentHike = 0; S.missedRent = 0; S.rentOwed = 0;
    S.area = 'home'; S.at = 'home_apt';
    const a = D.apartments[id];
    const say = 'You moved to ' + a.hood + '! ' + a.note;
    moment('moved to ' + a.hood);
    note(say, 'story');
    return done({ say, moved: true });
  };

  // ------------------------------------------------------------ sleep + week rollover
  function sleep(extraSanity) {
    const apt = E.apt();
    const ev = maybeEvent('night', 0.6);
    const j = E.job();
    // missed a weekday shift?
    const dow = (S.day - 1) % 7;
    if (j && !j.gig && dow < 5 && !S.today.work) {
      S.strikes++;
      if (S.strikes >= 3) {
        note('You missed 3 shifts in a row. You\'re fired from ' + j.title.toLowerCase() + '.', 'bad');
        moment('got fired for not showing up');
        S.job = null; S.strikes = 0;
      } else note('You skipped work today. Strike ' + S.strikes + ' of 3.', 'bad');
    }
    // overnight
    S.energy = clamp(Math.max(S.energy, 0) + apt.rest);
    S.full = clamp(S.full - 15);
    // the city wears you down a little every day; a good apartment softens it
    S.sanity = clamp(S.sanity - 6 + apt.vibe + (extraSanity || 0));
    if (S.day - S.lastLaundry > 7) { S.sanity = clamp(S.sanity - 4); note('You\'re out of clean socks. You turned one inside out.', 'bad'); }
    if (S.job && E.job().risky && Math.random() < 0.04) { note('Your startup ran out of money. Everyone got a hoodie.', 'bad'); moment('their startup folded (got a hoodie)'); S.job = null; }

    const endWeek = S.day % 7 === 0;
    S.day++; S.hour = 8; S.today = {}; S.area = 'home'; S.at = 'home_apt';
    const res = Object.assign({ slept: true }, ev);
    if (endWeek) res.week = rentDay();
    return res;
  }

  function rentDay() {
    const due = E.rent() + S.rentOwed;
    let paid, evicted = false;
    if (S.cash >= due) { paid = due; S.cash -= due; S.rentOwed = 0; S.missedRent = 0; }
    else {
      paid = Math.max(0, Math.floor(S.cash)); S.cash -= paid; S.rentOwed = due - paid; S.missedRent++;
      if (S.missedRent >= 2 && S.apt !== 'couch') {
        evicted = true; moment('got evicted and moved onto a cousin\'s couch');
        note('Evicted. Your cousin says the couch is "always there for you." Ominously.', 'bad');
        S.apt = 'couch'; S.rentOwed = 0; S.missedRent = 0; S.rentHike = 0;
      }
    }
    S.week.rent = paid;
    S.week.spent += paid;
    const summary = Object.assign({}, S.week, {
      weekNo: E.week() - 1, cash: S.cash, due, paid, owed: S.rentOwed, evicted,
      sanity: S.sanity, cred: S.cred, job: E.jobTitle(), apt: E.apt().name, hood: E.apt().hood
    });
    S.life.weeks++; S.life.earned += S.week.earned;
    S.lastWeek = summary;
    S.week = freshWeek();
    note(paid >= due ? 'Rent day: paid ' + money(paid) + '.' : 'Rent day: you came up ' + money(due - paid) + ' short.', paid >= due ? 'money' : 'bad');
    return summary;
  }

  // ------------------------------------------------------------ events
  function maybeEvent(where, chance, onlyIds) {
    if (Math.random() > chance) return {};
    let pool = D.events.filter(e => e.where === where && (!e.when || e.when(S)));
    if (onlyIds) pool = pool.filter(e => onlyIds.indexOf(e.id) < 0); // train-wise players dodge some delays
    if (!pool.length) return {};
    const total = pool.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    const ev = pool.find(e => (r -= e.weight) < 0) || pool[0];
    if (!ev.options) {
      apply(ev.fx);
      count(ev.count);
      if (ev.id === 'held' || ev.id === 'express') { S.week.delays = (S.week.delays || 0); }
      moment(ev.moment);
      note(ev.text, 'event');
    }
    return { event: { id: ev.id, text: ev.text, options: ev.options ? ev.options.map(o => o.label) : null } };
  }

  E.choose = (eventId, idx) => {
    const ev = D.events.find(e => e.id === eventId);
    const opt = ev.options[idx];
    apply(opt.fx);
    moment(opt.moment);
    note(ev.text + ' ' + opt.say, 'event');
    return done({ say: opt.say });
  };

  // ------------------------------------------------------------ share text
  E.shareText = w => {
    w = w || S.lastWeek;
    const bits = ['Week ' + w.weekNo + ' in NYC: made ' + money(w.earned)];
    if (w.paid) bits.push('paid ' + money(w.paid) + ' rent');
    const n = (k, one, many) => k + ' ' + (k === 1 ? one : many);
    if (w.delays) bits.push('sat through ' + n(w.delays, 'train delay', 'train delays'));
    if (w.slices) bits.push('ate ' + n(w.slices, 'dollar slice', 'dollar slices'));
    if (w.cats) bits.push('pet ' + n(w.cats, 'bodega cat', 'bodega cats'));
    if (w.rats) bits.push('saw ' + n(w.rats, 'rat', 'rats'));
    return bits.join(', ') + '. Sanity ' + Math.round(w.sanity) + '/100.';
  };

  window.NYC.Engine = E;
})();
