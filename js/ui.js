// Screens, map taps, bottom sheet, pop-ups, feedback ("juice"), phone and chat panels.
// All words shown to players come from NYC.DATA (js/data.js).
(function () {
  const D = NYC.DATA, T = D.text, E = NYC.Engine, A = NYC.Avatar, Net = NYC.Net, Snd = NYC.Sound, M = NYC.Metrics;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let others = [];

  // ================================================================ character creation
  const draft = { look: A.random(), bg: E.rollBackground(), hook: E.rollHook(), rolls: 0 };

  function swatches(id, list, key, names) {
    $(id).innerHTML = list.map(v => `<button class="sw${names ? ' word' : ''}${draft.look[key] === v ? ' on' : ''}" data-k="${key}" data-v="${v}" aria-label="${esc(T.lookLabels[key])} ${esc(names ? names[v] : v)}" ${names ? '' : `style="background:${v}"`}>${names ? esc(names[v]) : ''}</button>`).join('');
  }
  function renderCreate() {
    $('#c-avatar').innerHTML = A.svg(draft.look, 110);
    swatches('#c-skin', A.skins, 'skin');
    swatches('#c-hair', A.hairs, 'hair', T.hairNames);
    swatches('#c-haircolor', A.hairColors, 'hairColor');
    swatches('#c-shirt', A.shirts, 'shirt');
    swatches('#c-extra', A.extras, 'extra', T.extraNames);
    const bg = D.backgrounds.find(b => b.id === draft.bg);
    const apt = D.apartments[bg.apt];
    $('#c-bg').innerHTML = `<p class="hook">${esc(draft.hook)}</p><div class="bg-name">${esc(bg.name)}</div><p>${esc(bg.blurb)}</p>` +
      `<div class="bg-facts"><span>${E.money(bg.cash)} cash</span><span>${esc(apt.hood)}</span><span>${apt.rent ? E.money(apt.rent) + ' a week' : 'free (ish)'}</span></div>`;
    $('#c-reroll').textContent = draft.rolls >= 3 ? T.rerollLate : T.reroll;
  }
  function initCreate() {
    $('#c-tagline').textContent = T.tagline;
    $('#c-namelabel').textContent = T.nameLabel;
    $('#c-random').textContent = T.randomLook;
    $('#c-backstory').textContent = T.backstory;
    $('#c-start').textContent = T.start;
    document.querySelectorAll('[data-look-label]').forEach(el => el.textContent = T.lookLabels[el.dataset.lookLabel]);
    $('#create').addEventListener('click', e => {
      const b = e.target.closest('.sw');
      if (b) { draft.look[b.dataset.k] = b.dataset.v; Snd.play('tap'); renderCreate(); bounce($('#c-avatar')); }
    });
    $('#c-random').onclick = () => { draft.look = A.random(); Snd.play('tap'); renderCreate(); bounce($('#c-avatar')); };
    $('#c-reroll').onclick = () => {
      let n; do { n = E.rollBackground(); } while (n === draft.bg);
      draft.bg = n; draft.hook = E.rollHook(); draft.rolls++; Snd.play('tap'); renderCreate(); bounce($('#c-bg'));
    };
    $('#c-start').onclick = () => {
      const name = $('#c-name').value.trim().slice(0, 18) || randomName();
      E.newGame({ name, look: draft.look, hook: draft.hook }, draft.bg);
      M.track('new_game');
      Snd.play('train');
      startGame();
      setTimeout(arrival, 450);
    };
    renderCreate();
  }
  function randomName() {
    const n = ['Sam', 'Jo', 'Alex', 'Rio', 'Dani', 'Kai', 'Nico', 'Pat', 'Remy', 'Ari'];
    return n[Math.floor(Math.random() * n.length)];
  }

  // the first 30 seconds: a funny moment and a choice, no instructions
  function arrival() {
    popup(`<div class="tag-ev">Day 1</div><p class="big">${esc(D.arrival.text)}</p>`,
      D.arrival.options.map((o, i) => ({ label: o.label, fn: () => { feedback(E.arrive(i), 'home_sub'); } })), true);
  }

  // ================================================================ HUD + map
  let shownCash = null;
  function bar(label, v, cls) {
    return `<div class="bar ${cls}" data-bar="${cls}"><span>${label}</span><i style="width:${Math.max(2, v)}%"></i><b>${Math.round(v)}</b></div>`;
  }
  function renderHud() {
    const S = E.state();
    const d2r = E.daysToRent();
    const late = S.hour >= 23;
    const rent = E.rent() + S.rentOwed;
    $('#hud').innerHTML =
      `<div class="hud-top"><div class="when"><b>${E.dayName()} ${E.clock()}</b><span>Week ${E.week()}${late ? ' · getting late' : ''}</span></div>` +
      `<button class="mute" id="mute" aria-label="${Snd.muted() ? T.soundOff : T.soundOn}">${Snd.muted() ? speakerOff : speakerOn}</button>` +
      `<div class="cash${S.cash < 20 ? ' low' : ''}" id="cash">${E.money(shownCash === null ? S.cash : shownCash)}</div></div>` +
      `<div class="rent${d2r <= 2 && S.cash < rent + E.bills() ? ' warn' : ''}">Rent ${E.money(rent)}${E.week() === 1 && rent ? ' (half, first week)' : ''} + bills ${E.money(E.bills())}, due ${d2r === 1 ? 'tonight' : 'in ' + d2r + ' days'}</div>` +
      `<div class="bars">${bar('Energy', S.energy, 'en')}${bar('Food', S.full, 'fu')}${bar('Sanity', S.sanity, 'sa')}</div>`;
    $('#mute').onclick = () => { Snd.toggle(); Snd.play('tap'); renderHud(); };
    if (shownCash !== null && shownCash !== S.cash) countCash(shownCash, S.cash);
    shownCash = S.cash;
  }
  const speakerOn = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8q3 4 0 8M18.5 5.5q5 6.5 0 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  const speakerOff = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function countCash(from, to) {
    const el = $('#cash'); if (!el) return;
    const t0 = performance.now(), dur = 450;
    el.classList.remove('up', 'down'); void el.offsetWidth;
    el.classList.add(to > from ? 'up' : 'down');
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const v = from + (to - from) * (1 - Math.pow(1 - k, 3));
      const c = $('#cash'); if (c) c.textContent = E.money(Math.round(v * 100) / 100);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function renderGoal() {
    const S = E.state(), t = E.task();
    const el = $('#goal');
    if (!S.arrived || !t) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.classList.toggle('done', !!S.today.taskDone);
    el.innerHTML = `<b>${esc(T.goalsToday)}:</b> <span>${esc(t.text)}</span>${S.today.taskDone ? '<i class="check">done</i>' : ''}`;
  }

  function renderMap() {
    const S = E.state();
    $('#area-name').textContent = E.areaName();
    NYC.Map.render($('#map'), S.area, { here: S.at, night: E.isNight(), myColor: S.char.look.shirt, others, goal: E.taskPlace() });
    const last = S.log[0];
    $('#ticker').textContent = last ? last.text : T.firstTip;
    renderGoal();
  }
  function render() { renderHud(); renderMap(); if (!$('#phone').classList.contains('hidden')) renderPhone(); }

  // ================================================================ feedback ("juice")
  function bounce(el) { if (!el) return; el.classList.remove('bounce'); void el.getBoundingClientRect(); el.classList.add('bounce'); }

  function pop(text, x, y, cls, delay) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'pop ' + (cls || '');
      p.textContent = text;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }, delay || 0);
  }

  const LABELS = { energy: 'energy', full: 'food', sanity: 'sanity', cred: 'cred' };
  function feedback(res, placeId) {
    if (!res) return;
    const d = res.delta || {};
    const at = (placeId && NYC.Map.where($('#map'), placeId)) || { x: innerWidth / 2, y: innerHeight / 2 };
    let i = 0;
    if (d.cash) { pop((d.cash > 0 ? '+' : '-') + E.money(d.cash), at.x, at.y, d.cash > 0 ? 'cash' : 'cost', 0); i++; }
    Object.keys(LABELS).forEach(k => {
      if (d[k] && Math.abs(d[k]) >= 3) { pop((d[k] > 0 ? '+' : '') + Math.round(d[k]) + ' ' + LABELS[k], at.x + (i % 2 ? 30 : -30), at.y + 22 * i, d[k] > 0 ? 'good' : 'bad', i * 90); i++; }
    });
    ['en', 'fu', 'sa'].forEach((c, j) => {
      const k = ['energy', 'full', 'sanity'][j];
      const el = document.querySelector(`[data-bar="${c}"]`);
      if (el && d[k]) { el.classList.remove('flash-good', 'flash-bad'); void el.offsetWidth; el.classList.add(d[k] > 0 ? 'flash-good' : 'flash-bad'); }
    });
    if (res.sound) Snd.play(res.sound);
    else if (d.cash > 0) Snd.play('coin');
    else if ((d.sanity || 0) <= -5) Snd.play('bad');
    else if (d.cash < 0) Snd.play('spend');
    else Snd.play('tap');
    Snd.buzz(d.cash > 0 ? 20 : 8);
    (res.stickers || []).forEach(id => { toast(fmtT(T.newSticker, { name: D.stickers[id].name }), 'sticker', id); });
    (res.notes || []).forEach(n => toast(n.text, n.kind));
    handle(res);
  }
  const fmtT = (s, x) => E.fmt(s, x);

  // ================================================================ bottom sheet (actions at a place)
  function fxChips(a) {
    const out = [];
    if (a.hours) out.push(a.hours < 1 ? Math.round(a.hours * 60) + ' min' : a.hours + 'h');
    const fx = a.fx || {};
    if (fx.cash) out.push((fx.cash < 0 ? '-' : '+') + E.money(fx.cash));
    [['energy', 'energy'], ['full', 'food'], ['sanity', 'sanity'], ['cred', 'cred']].forEach(([k, l]) => {
      if (fx[k]) out.push((fx[k] > 0 ? '+' : '') + fx[k] + ' ' + l);
    });
    if (a.hint) out.push(a.hint);
    return out.map(c => `<span class="chip${c[0] === '-' ? ' neg' : c[0] === '+' ? ' pos' : ''}">${esc(c)}</span>`).join('');
  }
  function openPlace(pid) {
    const p = D.places[pid];
    const S = E.state();
    Snd.play('tap');
    bounce(document.querySelector(`[data-place="${pid}"]`));
    if (S.at !== pid) { S.at = pid; renderMap(); }
    Net.setPresence(S.area, pid);
    if (p.kind === 'hydrant' && !E.actionsAt(pid).length) { toast('Walt and the hydrant are not speaking today.'); return; }
    const acts = E.actionsAt(pid);
    let html = `<div class="sheet-head"><h3>${esc(p.name)}</h3><button class="x" data-close aria-label="Close">×</button></div>`;
    if (p.kind === 'subway') {
      html += `<p class="sub">${esc(E.apt().line)} and friends. ${E.money(2.9)} a ride.</p><div class="acts">` +
        Object.keys(D.areas).filter(a => a !== S.area).map(a =>
          `<button class="act" data-travel="${a}"><b>${a === 'home' ? 'Home to ' + esc(E.apt().hood) : esc(D.areas[a].name)}</b><div class="chips">${fxChips({ hours: (a === 'home' || S.area === 'home') ? E.apt().commute * 0.75 : 0.75, fx: { cash: -2.9 } })}</div></button>`).join('') + `</div>`;
    } else {
      const j = E.job();
      if (j && j.place === pid) html += `<p class="sub">You work here. ${S.job.shifts} shifts so far${S.job.promoted ? '' : ', promotion after 10'}.</p>`;
      html += `<div class="acts">` + acts.map(a =>
        `<button class="act${a.special === 'talk' ? ' talk' : ''}" data-act="${a.id}" ${a.disabled ? 'disabled' : ''}><b>${esc(a.label)}</b><div class="chips">${a.disabled ? `<span class="chip">${esc(a.disabled)}</span>` : fxChips(a)}</div></button>`).join('') + `</div>`;
    }
    const sheet = $('#sheet');
    sheet.innerHTML = html;
    sheet.dataset.place = pid;
    sheet.classList.add('open');
  }
  function closeSheet() { $('#sheet').classList.remove('open'); }

  // ================================================================ results -> pop-ups
  function handle(res) {
    const big = res.event || res.modal || res.slept;
    if (res.say && !big) toast(res.say, res.who ? 'story' : '');
    const queue = [];
    if (res.slept) queue.push(() => recapPopup(res));
    if (res.week) queue.push(() => weekPopup(res.week, true));
    if (res.slept) queue.push(() => { const r = E.morning(); if (r.event) feedback(r); else next(); });
    if (res.event) queue.push(() => eventPopup(res.event));
    if (res.modal === 'jobs') queue.push(jobsPopup);
    if (res.modal === 'listings') queue.push(() => listingsPopup(res.listings));
    runQueue(queue);
  }
  let modalQueue = [];
  function runQueue(q) { modalQueue = modalQueue.concat(q); if ($('#modal').classList.contains('hidden')) next(); }
  function next() { const f = modalQueue.shift(); if (f) f(); }

  function recapPopup(res) {
    const y = res.yesterday;
    if (y.day === 1) M.once('day1_done');
    const items = y.items.map(t => `<li>${esc(t)}</li>`).join('');
    const S = E.state();
    const lines = T.morningLines;
    popup(`<div class="receipt"><div class="r-head">${esc(fmtT(T.yesterdayTitle, { day: y.dayName }))}</div>` +
      (res.lightsOut ? `<p class="r-out">${esc(res.lightsOut)}</p>` : '') +
      `<ul>${items}</ul><div class="r-total"><span>Cash</span><b>${E.money(y.cash)}</b></div></div>` +
      (y.burnout ? `<p class="tease">${esc(y.burnout)}</p>` : '') +
      (y.tease ? `<p class="tease">${esc(y.tease)}</p>` : `<p class="tease calm">${esc(S.energy < 40 ? T.tiredMorning : lines[S.day % lines.length])}</p>`),
      [{ label: T.nextMorning }]);
    Snd.play('night');
  }

  function popup(html, buttons, choice) {
    const m = $('#modal');
    m.innerHTML = `<div class="card">${html}<div class="btns">${buttons.map((b, i) => `<button class="btn${i === 0 && !choice ? ' primary' : ''}" data-i="${i}">${esc(b.label)}</button>`).join('')}</div></div>`;
    m.classList.remove('hidden');
    m.onclick = e => {
      const b = e.target.closest('[data-i]');
      if (!b) return;
      Snd.play('tap');
      const fn = buttons[+b.dataset.i].fn;
      m.classList.add('hidden'); m.innerHTML = '';
      if (fn) fn();
      if ($('#modal').classList.contains('hidden')) next();
    };
  }
  function eventPopup(ev) {
    if (ev.options) {
      popup(`<div class="tag-ev">Only in New York</div><p class="big">${esc(ev.text)}</p>`,
        ev.options.map((label, i) => ({ label, fn: () => { const r = E.choose(ev.id, i); feedback(r); } })), true);
    } else {
      popup(`<div class="tag-ev">Only in New York</div><p class="big">${esc(ev.text)}</p>`, [{ label: 'Classic.' }]);
    }
  }

  function jobsPopup() {
    const S = E.state();
    const rows = D.jobs.map(j => {
      const ch = E.jobChance(j);
      const mine = S.job && S.job.id === j.id;
      const where = D.places[j.place];
      return `<button class="act job" data-job="${j.id}" ${mine || !ch ? 'disabled' : ''}>` +
        `<b>${esc(j.title)}</b><div class="chips"><span class="chip pos">${E.money(j.pay[0])} to ${E.money(j.pay[1])} a shift</span><span class="chip">${j.hours}h</span><span class="chip">${where.area === 'home' ? 'near home' : esc(D.areas[where.area].name)}</span>` +
        `${j.gig ? '<span class="chip">gig: skip days freely</span>' : ''}${mine ? '<span class="chip">your job</span>' : !ch ? `<span class="chip neg">needs ${j.req} cred</span>` : `<span class="chip">${Math.round(ch * 100)}% chance</span>`}</div></button>`;
    }).join('');
    popup(`<h2>Help wanted</h2><p>Applying takes an hour. Your cred: <b>${S.cred}</b>.</p><div class="acts">${rows}</div>`, [{ label: 'Not today' }]);
    $('#modal').querySelectorAll('[data-job]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      $('#modal').classList.add('hidden');
      const r = E.applyJob(b.dataset.job);
      feedback(Object.assign({}, r, { say: null }));
      if (r.ok) Snd.play('coin'); else Snd.play('bad');
      popup(`<h2>${r.ok ? 'Hired' : 'No luck'}</h2><p class="big">${esc(r.say)}</p>`, [{ label: 'OK' }]);
    });
  }

  function listingsPopup(ids) {
    const S = E.state();
    const rows = ids.map(id => {
      const a = D.apartments[id];
      const cost = E.moveCost(id);
      return `<div class="listing"><div class="l-top"><b>${esc(a.name)}</b><span class="price">${E.money(a.rent)} a week</span></div>` +
        `<div class="l-hood">${esc(a.hood)}, ${esc(a.boro)}, ${esc(a.line)}${a.stabilized ? ' · <b class="rare">RENT-STABILIZED</b>' : ''}</div>` +
        `<p>${esc(a.note)}</p><div class="chips"><span class="chip">${a.roommates ? a.roommates + ' roommate' + (a.roommates > 1 ? 's' : '') : 'no roommates'}</span><span class="chip">sleep ${a.rest >= 80 ? 'great' : a.rest >= 65 ? 'OK' : 'rough'}</span><span class="chip">${a.commute > 1 ? 'long commute' : 'OK commute'}</span></div>` +
        `<button class="btn move" data-move="${id}" ${S.cash < cost ? 'disabled' : ''}>Move in: ${E.money(cost)} <small>(broker fee and a van)</small></button></div>`;
    }).join('');
    popup(`<h2>Listings</h2><p>"Cozy" means small. "Charming" means old. "Up and coming" means you.</p>${rows}`, [{ label: 'Keep my place' }]);
    $('#modal').querySelectorAll('[data-move]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      $('#modal').classList.add('hidden');
      const r = E.moveIn(b.dataset.move);
      feedback(Object.assign({}, r, { say: null }));
      popup(`<p class="big">${esc(r.say)}</p>`, [{ label: 'Home sweet home' }]);
    });
  }

  function weekPopup(w, fresh) {
    const ok = !w.evicted && w.paid >= w.due;
    const head = w.evicted ? T.weekEvicted : ok ? T.weekPaid : T.weekShort;
    M.track(fresh ? 'week_done' : 'share_reopen');
    popup(`<h2>Week ${w.weekNo}</h2><p class="big">${esc(head)}</p><div class="stampwrap"><canvas id="share-canvas" class="share-canvas"></canvas>${fresh ? `<div class="stamp ${ok ? 'ok' : 'no'}">${ok ? 'RENT PAID' : w.evicted ? 'EVICTED' : 'SHORT'}</div>` : ''}</div>` +
      `<p class="share-text">Rent ${E.money(w.paid)}, bills ${E.money(w.bills || 0)}. Left over: ${E.money(w.cash)}.</p>`,
      [{ label: 'Share my week', fn: () => doShare(w) }, { label: 'Keep going' }]);
    drawCard($('#share-canvas'), w);
    if (fresh) setTimeout(() => Snd.play(ok ? 'stamp' : 'bad'), 350);
  }
  function drawCard(c, w) {
    const go = () => NYC.Share.draw(c, w);
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('900 40px Bungee'), document.fonts.load('700 20px Rubik')]).then(go, go); else go();
  }
  async function doShare(w) {
    M.track('share_open');
    const c = document.createElement('canvas');
    await new Promise(r => { drawCard(c, w); setTimeout(r, 60); });
    const r = await NYC.Share.share(c, E.shareText(w));
    if (r === 'shared' || r === 'downloaded') M.track('share_done');
    if (r === 'downloaded') toast(T.shareSaved);
  }

  // ================================================================ phone + chat panels
  function renderPhone() {
    const S = E.state(), apt = E.apt(), j = E.job(), t = E.task(), g = E.weekGoal();
    const rank = E.rank(), nr = E.nextRank(), n = E.stickerCount();
    const book = Object.keys(D.stickers).map(id => {
      const st = D.stickers[id], got = S.stickers[id];
      return `<div class="stk${got ? ' got' : ''}" title="${esc(got ? st.name : st.hint)}"><div class="stk-badge">${got ? stickerArt(id) : '?'}</div><span>${esc(got ? st.name : st.hint)}</span></div>`;
    }).join('');
    $('#phone-body').innerHTML =
      `<div class="me">${A.svg(S.char.look, 64)}<div><h3>${esc(S.char.name)}</h3><div class="sub">${esc(S.char.hook || E.bg().name)}</div></div></div>` +
      `<div class="rank"><div><span>Rank</span><b>${esc(rank.name)}</b></div>${nr ? `<div class="rk-bar"><i style="width:${Math.round(100 * (n - rank.n) / (nr.n - rank.n))}%"></i></div><small>${nr.n - n} more sticker${nr.n - n > 1 ? 's' : ''} to ${esc(nr.name)}</small>` : ''}</div>` +
      `<div class="goals"><div class="g${S.today.taskDone ? ' done' : ''}"><span>${esc(T.goalsToday)}</span><b>${esc(t ? t.text : '')}</b></div>` +
      `<div class="g${S.week.goalDone ? ' done' : ''}"><span>${esc(T.goalsWeek)}</span><b>Make rent (${E.money(E.rent() + S.rentOwed)}) and ${esc(g ? g.text.toLowerCase() : '')}</b></div></div>` +
      `<div class="kv"><span>Job</span><b>${esc(E.jobTitle())}${j ? ` at the ${esc(D.places[j.place].name.toLowerCase())}` : ', try the staffing agency in Midtown'}</b></div>` +
      (S.strikes ? `<div class="kv warn"><span>Strikes</span><b>${S.strikes} of 3 missed shifts</b></div>` : '') +
      `<div class="kv"><span>Home</span><b>${esc(apt.name)}, ${esc(apt.hood)} (${esc(apt.line)})</b></div>` +
      `<div class="kv"><span>Cred</span><b>${S.cred}</b></div>` +
      (S.lastWeek ? `<button class="btn primary wide" id="p-share">Share last week's card</button>` : '') +
      `<h4>${esc(T.stickerBook)} <small>${n} of ${Object.keys(D.stickers).length}</small></h4><div class="book">${book}</div>` +
      `<h4>Diary</h4><ul class="log">${S.log.slice(0, 25).map(l => `<li class="${l.kind}"><span>Day ${l.d}</span>${esc(l.text)}</li>`).join('')}</ul>` +
      `<button class="btn danger wide" id="p-reset">Start a new life</button>`;
    const sh = $('#p-share'); if (sh) sh.onclick = () => weekPopup(S.lastWeek, false);
    $('#p-reset').onclick = () => popup('<h2>Start over?</h2><p>This deletes your current life. The city will not notice.</p>', [
      { label: 'Yes, new life', fn: () => { E.reset(); location.reload(); } }, { label: 'Never mind' }]);
  }
  // a tiny stamp for each sticker: first letter on a colored seal
  function stickerArt(id) {
    const colors = ['#f2c12e', '#e0662e', '#3b6fb5', '#2f8a4f', '#b23a48', '#6e4f7a'];
    const c = colors[id.length % colors.length];
    return `<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 2 L24 6 L30 4 L31 10 L37 12 L35 18 L39 22 L34 26 L35 32 L29 33 L26 38 L20 35 L14 38 L11 33 L5 32 L6 26 L1 22 L5 18 L3 12 L9 10 L10 4 L16 6 Z" fill="${c}" stroke="#1d1d1f" stroke-width="2"/><text x="20" y="26" text-anchor="middle" font-size="15" class="stk-letter">${esc(D.stickers[id].name[0])}</text></svg>`;
  }

  function showPanel(id) {
    ['phone', 'chat'].forEach(p => $('#' + p).classList.toggle('hidden', p !== id));
    document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === (id || 'map')));
    if (id === 'phone') renderPhone();
    if (id === 'chat') { $('#chat-dot').classList.add('hidden'); $('#chat-log').scrollTop = 1e6; }
    closeSheet();
  }
  function addChat(m) {
    const S = E.state();
    if (!S || m.area !== S.area) return;
    const li = document.createElement('li');
    li.className = m.mine ? 'mine' : '';
    li.innerHTML = `<b>${esc(m.name)}</b> ${esc(m.text)}`;
    const log = $('#chat-log');
    log.appendChild(li);
    while (log.children.length > 40) log.firstChild.remove();
    log.scrollTop = 1e6;
    if ($('#chat').classList.contains('hidden') && !m.mine) $('#chat-dot').classList.remove('hidden');
  }

  // ================================================================ toasts (queued, so none get lost)
  const toasts = [];
  let toastBusy = false;
  function toast(text, kind, sticker) {
    toasts.push({ text, kind, sticker });
    if (!toastBusy) nextToast();
  }
  function nextToast() {
    const t = toasts.shift();
    const el = $('#toast');
    if (!t) { toastBusy = false; return; }
    toastBusy = true;
    el.className = 'toast ' + (t.kind || '');
    el.innerHTML = (t.sticker ? `<span class="t-stk">${stickerArt(t.sticker)}</span>` : '') + `<span>${esc(t.text)}</span>`;
    if (t.kind === 'sticker') Snd.play('sticker');
    void el.offsetWidth; el.classList.add('show');
    const ms = Math.min(4200, 1600 + t.text.length * 28);
    setTimeout(() => { el.classList.remove('show'); setTimeout(nextToast, 260); }, ms);
  }

  // ================================================================ wiring
  function startGame() {
    $('#create').classList.add('hidden');
    $('#game').classList.remove('hidden');
    const S = E.state();
    $('#chat-note').textContent = T.chatNote;
    Net.connect({ id: 'me', name: S.char.name, look: S.char.look });
    Net.setPresence(S.area, S.at);
    render();
  }

  function init() {
    E.on(render);
    Net.onPresence(list => { others = list; if (E.state()) renderMap(); });
    Net.onChat(addChat);

    $('#map').addEventListener('click', e => {
      const pg = e.target.closest('.pigeon');
      if (pg) {
        pg.closest('.pigeons').classList.add('flee');
        Snd.play('pigeon');
        feedback(E.tapPigeon());
        return;
      }
      const g = e.target.closest('[data-place]');
      if (g) openPlace(g.dataset.place);
    });
    $('#map').addEventListener('keydown', e => {
      if (e.key === 'Enter') { const g = e.target.closest('[data-place]'); if (g) openPlace(g.dataset.place); }
    });
    $('#goal').onclick = () => showPanel('phone');
    $('#sheet').addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return closeSheet();
      const pid = $('#sheet').dataset.place;
      const t = e.target.closest('[data-travel]');
      if (t) {
        closeSheet();
        const r = E.act(pid, 'travel', t.dataset.travel);
        Net.setPresence(E.state().area, E.state().at);
        return feedback(r, E.state().at);
      }
      const a = e.target.closest('[data-act]');
      if (a && !a.disabled) {
        bounce(a);
        const r = E.act(pid, a.dataset.act);
        if (r.slept || r.modal || r.event) closeSheet(); else openPlace(pid);
        Net.setPresence(E.state().area, E.state().at);
        feedback(r, pid);
      }
    });
    document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
      Snd.play('tap');
      const t = b.dataset.tab;
      showPanel(t === 'map' ? null : t);
    });
    $('#chat-form').onsubmit = e => {
      e.preventDefault();
      const v = $('#chat-input').value.trim();
      if (v) Net.sendChat(v.slice(0, 140));
      $('#chat-input').value = '';
    };

    if (E.load()) {
      startGame();
      const S = E.state();
      if (!S.arrived) setTimeout(arrival, 300);
      else if (S.pending) { const r = E.morning(); if (r.event) feedback(r); }
    } else initCreate();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
