// Screens, map taps, bottom sheet, pop-ups, phone and chat panels.
(function () {
  const D = NYC.DATA, E = NYC.Engine, A = NYC.Avatar, Net = NYC.Net;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let others = [];

  // ================================================================ character creation
  const draft = { look: A.random(), bg: E.rollBackground(), rolls: 0 };

  function swatches(id, list, key, isColor) {
    $(id).innerHTML = list.map(v => `<button class="sw${draft.look[key] === v ? ' on' : ''}" data-k="${key}" data-v="${v}" aria-label="${key} ${v}" ${isColor ? `style="background:${v}"` : ''}>${isColor ? '' : esc(v)}</button>`).join('');
  }
  function renderCreate() {
    $('#c-avatar').innerHTML = A.svg(draft.look, 110);
    swatches('#c-skin', A.skins, 'skin', true);
    swatches('#c-hair', A.hairs, 'hair', false);
    swatches('#c-haircolor', A.hairColors, 'hairColor', true);
    swatches('#c-shirt', A.shirts, 'shirt', true);
    const bg = D.backgrounds.find(b => b.id === draft.bg);
    const apt = D.apartments[bg.apt];
    $('#c-bg').innerHTML = `<div class="bg-name">${esc(bg.name)}</div><p>${esc(bg.blurb)}</p>` +
      `<div class="bg-facts"><span>Cash ${E.money(bg.cash)}</span><span>${esc(apt.hood)}</span><span>Rent ${apt.rent ? E.money(apt.rent) + '/wk' : 'free'}</span></div>`;
    $('#c-reroll').textContent = draft.rolls >= 3 ? 'Reroll (the city doesn\'t do refunds)' : 'Reroll backstory';
  }
  function initCreate() {
    $('#create').addEventListener('click', e => {
      const b = e.target.closest('.sw');
      if (b) { draft.look[b.dataset.k] = b.dataset.v; renderCreate(); }
    });
    $('#c-random').onclick = () => { draft.look = A.random(); renderCreate(); };
    $('#c-reroll').onclick = () => {
      let n; do { n = E.rollBackground(); } while (n === draft.bg);
      draft.bg = n; draft.rolls++; renderCreate();
    };
    $('#c-start').onclick = () => {
      const name = $('#c-name').value.trim().slice(0, 18) || randomName();
      E.newGame({ name, look: draft.look }, draft.bg);
      startGame();
      const bg = E.bg();
      popup(`<h2>Welcome to New York</h2><p class="big">${esc(bg.intro)}</p><p>Rent is due every Sunday night. Get a job in Midtown (take the train), eat, sleep, survive.</p><p class="tip">Tap any place on the map.</p>`, [{ label: 'Let\'s go' }]);
    };
    renderCreate();
  }
  function randomName() {
    const n = ['Sam', 'Jo', 'Alex', 'Rio', 'Dani', 'Kai', 'Nico', 'Pat', 'Remy', 'Ari'];
    return n[Math.floor(Math.random() * n.length)];
  }

  // ================================================================ HUD + map
  function bar(label, v, cls) {
    return `<div class="bar ${cls}"><span>${label}</span><i style="width:${Math.max(2, v)}%"></i><b>${Math.round(v)}</b></div>`;
  }
  function renderHud() {
    const S = E.state();
    const d2r = E.daysToRent();
    const late = S.hour >= 23;
    $('#hud').innerHTML =
      `<div class="hud-top"><div class="when"><b>${E.dayName()} ${E.clock()}</b><span>Week ${E.week()}${late ? ' · getting late' : ''}</span></div>` +
      `<div class="cash${S.cash < 20 ? ' low' : ''}">${E.money(S.cash)}</div></div>` +
      `<div class="rent${d2r <= 2 && S.cash < E.rent() ? ' warn' : ''}">Rent ${E.rent() ? E.money(E.rent() + S.rentOwed) : '$0'} due ${d2r === 1 ? 'tonight' : 'in ' + d2r + ' days'}${S.rentOwed ? ' (incl. ' + E.money(S.rentOwed) + ' owed)' : ''}</div>` +
      `<div class="bars">${bar('Energy', S.energy, 'en')}${bar('Food', S.full, 'fu')}${bar('Sanity', S.sanity, 'sa')}</div>`;
  }
  function renderMap() {
    const S = E.state();
    $('#area-name').textContent = E.areaName();
    NYC.Map.render($('#map'), S.area, { here: S.at, night: E.isNight(), myColor: S.char.look.shirt, others });
    const last = S.log[0];
    $('#ticker').textContent = last ? last.text : '';
  }
  function render() { renderHud(); renderMap(); if (!$('#phone').classList.contains('hidden')) renderPhone(); }

  // ================================================================ bottom sheet (actions at a place)
  function fxChips(a) {
    const out = [];
    if (a.hours) out.push(a.hours < 1 ? Math.round(a.hours * 60) + ' min' : a.hours + 'h');
    const fx = a.fx || {};
    if (fx.cash) out.push((fx.cash < 0 ? '-' : '+') + E.money(Math.abs(fx.cash)));
    [['energy', 'energy'], ['full', 'food'], ['sanity', 'sanity'], ['cred', 'cred']].forEach(([k, l]) => {
      if (fx[k]) out.push((fx[k] > 0 ? '+' : '') + fx[k] + ' ' + l);
    });
    if (a.hint) out.push(a.hint);
    return out.map(c => `<span class="chip${c[0] === '-' ? ' neg' : c[0] === '+' ? ' pos' : ''}">${esc(c)}</span>`).join('');
  }
  function openPlace(pid) {
    const p = D.places[pid];
    const S = E.state();
    if (S.at !== pid) { S.at = pid; renderMap(); }
    Net.setPresence(S.area, pid);
    const acts = E.actionsAt(pid);
    let html = `<div class="sheet-head"><h3>${esc(p.name)}</h3><button class="x" data-close aria-label="Close">×</button></div>`;
    if (p.kind === 'subway') {
      html += `<p class="sub">Fare ${E.money(2.9)}. Delays are a lifestyle.</p><div class="acts">` +
        Object.keys(D.areas).filter(a => a !== S.area).map(a =>
          `<button class="act" data-travel="${a}"><b>${a === 'home' ? 'Home: ' + esc(E.apt().hood) : esc(D.areas[a].name)}</b><div class="chips">${fxChips({ hours: (a === 'home' || S.area === 'home') ? E.apt().commute * 0.75 : 0.75, fx: { cash: -2.9 } })}</div></button>`).join('') + `</div>`;
    } else {
      const j = E.job();
      if (j && j.place === pid) html += `<p class="sub">You work here. ${S.job.shifts} shifts so far${S.job.promoted ? '' : ', promotion after 8'}.</p>`;
      html += `<div class="acts">` + acts.map(a =>
        `<button class="act" data-act="${a.id}" ${a.disabled ? 'disabled' : ''}><b>${esc(a.label)}</b><div class="chips">${a.disabled ? `<span class="chip">${esc(a.disabled)}</span>` : fxChips(a)}</div></button>`).join('') + `</div>`;
    }
    const sheet = $('#sheet');
    sheet.innerHTML = html;
    sheet.dataset.place = pid;
    sheet.classList.add('open');
  }
  function closeSheet() { $('#sheet').classList.remove('open'); }

  function handle(res) {
    if (!res) return;
    if (res.say && !res.event && !res.modal && !res.followup && !res.week) toast(res.say);
    const queue = [];
    if (res.followup) queue.push(() => popup(`<h2>${esc(res.followup.title)}</h2><p class="big">${esc(res.followup.text)}</p>`, [{ label: 'Ugh. OK.' }]));
    if (res.slept && !res.followup) queue.push(() => popup(`<h2>${E.dayName()} morning</h2><p class="big">${esc(morningLine())}</p>${res.say ? `<p>${esc(res.say)}</p>` : ''}`, [{ label: 'Get up' }]));
    if (res.event) queue.push(() => eventPopup(res.event));
    if (res.modal === 'jobs') queue.push(jobsPopup);
    if (res.modal === 'listings') queue.push(() => listingsPopup(res.listings));
    if (res.week) queue.push(() => weekPopup(res.week));
    if (!res.event && !res.modal && !res.followup && !res.slept && res.say && res.moved) { /* toast already shown */ }
    runQueue(queue);
  }
  let modalQueue = [];
  function runQueue(q) { modalQueue = modalQueue.concat(q); if ($('#modal').classList.contains('hidden')) next(); }
  function next() { const f = modalQueue.shift(); if (f) f(); }

  function morningLine() {
    const S = E.state();
    const lines = ['The radiator clanked you awake. Good morning, New York.', 'A garbage truck sang you the song of its people at 6am.', 'You woke up before your alarm. Pigeons.', 'The sun came through the airshaft for nine glorious minutes.'];
    if (S.energy < 40) return 'You slept, technically. Energy ' + Math.round(S.energy) + '.';
    return lines[S.day % lines.length];
  }

  // ================================================================ pop-ups
  function popup(html, buttons, choice) {
    const m = $('#modal');
    m.innerHTML = `<div class="card">${html}<div class="btns">${buttons.map((b, i) => `<button class="btn${i === 0 && !choice ? ' primary' : ''}" data-i="${i}">${esc(b.label)}</button>`).join('')}</div></div>`;
    m.classList.remove('hidden');
    m.onclick = e => {
      const b = e.target.closest('[data-i]');
      if (!b) return;
      const fn = buttons[+b.dataset.i].fn;
      m.classList.add('hidden'); m.innerHTML = '';
      if (fn) fn();
      next();
    };
  }
  function eventPopup(ev) {
    if (ev.options) {
      popup(`<div class="tag-ev">Only in New York</div><p class="big">${esc(ev.text)}</p>`,
        ev.options.map((label, i) => ({ label, fn: () => { const r = E.choose(ev.id, i); popupAfter(r.say); } })), true);
    } else {
      popup(`<div class="tag-ev">Only in New York</div><p class="big">${esc(ev.text)}</p>`, [{ label: 'Classic.' }]);
    }
  }
  function popupAfter(text) { modalQueue.unshift(() => popup(`<p class="big">${esc(text)}</p>`, [{ label: 'OK' }])); }

  function jobsPopup() {
    const S = E.state();
    const rows = D.jobs.map(j => {
      const ch = E.jobChance(j);
      const mine = S.job && S.job.id === j.id;
      const where = D.places[j.place];
      return `<button class="act job" data-job="${j.id}" ${mine || !ch ? 'disabled' : ''}>` +
        `<b>${esc(j.title)}</b><div class="chips"><span class="chip pos">${E.money(j.pay[0])}-${E.money(j.pay[1])}/shift</span><span class="chip">${j.hours}h</span><span class="chip">${esc(D.areas[where.area].name === 'Your block' ? 'near home' : D.areas[where.area].name)}</span>` +
        `${j.gig ? '<span class="chip">gig: no strikes</span>' : ''}${mine ? '<span class="chip">your job</span>' : !ch ? `<span class="chip neg">needs ${j.req} cred</span>` : `<span class="chip">${Math.round(ch * 100)}% chance</span>`}</div></button>`;
    }).join('');
    popup(`<h2>Help wanted</h2><p>Applying takes an hour. Your cred: <b>${S.cred}</b>. Get cred from vintage jackets, open mics, helping lost tourists...</p><div class="acts">${rows}</div>`, [{ label: 'Not today' }]);
    $('#modal').querySelectorAll('[data-job]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      $('#modal').classList.add('hidden');
      const r = E.applyJob(b.dataset.job);
      popup(`<h2>${r.ok ? 'Hired!' : 'No luck'}</h2><p class="big">${esc(r.say)}</p>`, [{ label: 'OK' }]);
    });
  }

  function listingsPopup(ids) {
    const S = E.state();
    const rows = ids.map(id => {
      const a = D.apartments[id];
      const cost = E.moveCost(id);
      return `<div class="listing"><div class="l-top"><b>${esc(a.name)}</b><span class="price">${E.money(a.rent)}/wk</span></div>` +
        `<div class="l-hood">${esc(a.hood)}, ${esc(a.boro)}${a.stabilized ? ' · <b class="rare">RENT-STABILIZED (rare!)</b>' : ''}</div>` +
        `<p>${esc(a.note)}</p><div class="chips"><span class="chip">${a.roommates ? a.roommates + ' roommate' + (a.roommates > 1 ? 's' : '') : 'no roommates'}</span><span class="chip">sleep ${a.rest >= 80 ? 'great' : a.rest >= 65 ? 'ok' : 'rough'}</span><span class="chip">${a.commute > 1 ? 'long commute' : 'ok commute'}</span></div>` +
        `<button class="btn move" data-move="${id}" ${S.cash < cost ? 'disabled' : ''}>Move in: ${E.money(cost)} <small>(broker fee + van)</small></button></div>`;
    }).join('');
    popup(`<h2>Listings</h2><p>"Cozy" means small. "Charming" means old. "Up-and-coming" means you.</p>${rows}`, [{ label: 'Keep my place' }]);
    $('#modal').querySelectorAll('[data-move]').forEach(b => b.onclick = ev => {
      ev.stopPropagation();
      $('#modal').classList.add('hidden');
      const r = E.moveIn(b.dataset.move);
      popup(`<p class="big">${esc(r.say)}</p>`, [{ label: 'Home sweet home' }]);
    });
  }

  function weekPopup(w) {
    const head = w.evicted ? 'Evicted.' : w.paid >= w.due ? 'Rent paid. You live here another week.' : 'You came up short on rent.';
    popup(`<h2>Week ${w.weekNo} done</h2><p class="big">${esc(head)}</p><canvas id="share-canvas" class="share-canvas"></canvas><p class="share-text">${esc(E.shareText(w))}</p>`,
      [{ label: 'Share my week', fn: () => doShare(w) }, { label: 'Keep playing' }]);
    NYC.Share.draw($('#share-canvas'), w);
  }
  async function doShare(w) {
    const c = document.createElement('canvas');
    NYC.Share.draw(c, w);
    const r = await NYC.Share.share(c, E.shareText(w));
    if (r === 'downloaded') toast('Saved the image. Post it anywhere.');
  }

  // ================================================================ phone + chat panels
  function renderPhone() {
    const S = E.state(), apt = E.apt(), j = E.job();
    $('#phone-body').innerHTML =
      `<div class="me">${A.svg(S.char.look, 64)}<div><h3>${esc(S.char.name)}</h3><div class="sub">${esc(E.bg().name)}</div></div></div>` +
      `<div class="kv"><span>Job</span><b>${esc(E.jobTitle())}${j ? ` · ${esc(D.places[j.place].name)}` : ' · Staffing agency in Midtown'}</b></div>` +
      (S.strikes ? `<div class="kv warn"><span>Strikes</span><b>${S.strikes} of 3 missed shifts</b></div>` : '') +
      `<div class="kv"><span>Home</span><b>${esc(apt.name)}, ${esc(apt.hood)} · ${apt.rent ? E.money(E.rent()) + '/wk' : 'free'}</b></div>` +
      `<div class="kv"><span>Cred</span><b>${S.cred}</b></div>` +
      `<div class="kv"><span>This week</span><b>+${E.money(S.week.earned)} earned · ${S.week.slices} slices · ${S.week.delays} delays</b></div>` +
      (S.lastWeek ? `<button class="btn primary wide" id="p-share">Share last week's card</button>` : '') +
      `<h4>Diary</h4><ul class="log">${S.log.slice(0, 25).map(l => `<li class="${l.kind}"><span>Day ${l.d}</span>${esc(l.text)}</li>`).join('')}</ul>` +
      `<button class="btn danger wide" id="p-reset">Start a new life</button>`;
    const sh = $('#p-share'); if (sh) sh.onclick = () => weekPopup(S.lastWeek);
    $('#p-reset').onclick = () => popup('<h2>Start over?</h2><p>This deletes your current life. The city will not notice.</p>', [
      { label: 'Yes, new life', fn: () => { E.reset(); location.reload(); } }, { label: 'Never mind' }]);
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

  // ================================================================ toast
  let tt;
  function toast(text) {
    const t = $('#toast');
    t.textContent = text; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3800);
  }

  // ================================================================ wiring
  function startGame() {
    $('#create').classList.add('hidden');
    $('#game').classList.remove('hidden');
    const S = E.state();
    Net.connect({ id: 'me', name: S.char.name, look: S.char.look });
    Net.setPresence(S.area, S.at);
    render();
  }

  function init() {
    E.on(render);
    Net.onPresence(list => { others = list; if (E.state()) renderMap(); });
    Net.onChat(addChat);

    $('#map').addEventListener('click', e => {
      const g = e.target.closest('[data-place]');
      if (g) openPlace(g.dataset.place);
    });
    $('#map').addEventListener('keydown', e => {
      if (e.key === 'Enter') { const g = e.target.closest('[data-place]'); if (g) openPlace(g.dataset.place); }
    });
    $('#sheet').addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return closeSheet();
      const pid = $('#sheet').dataset.place;
      const t = e.target.closest('[data-travel]');
      if (t) {
        closeSheet();
        const r = E.act(pid, 'travel', t.dataset.travel);
        Net.setPresence(E.state().area, E.state().at);
        return handle(r);
      }
      const a = e.target.closest('[data-act]');
      if (a && !a.disabled) {
        const r = E.act(pid, a.dataset.act);
        if (r.slept || r.modal || r.event || r.followup) closeSheet(); else openPlace(pid);
        Net.setPresence(E.state().area, E.state().at);
        handle(r);
      }
    });
    document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
      const t = b.dataset.tab;
      showPanel(t === 'map' ? null : t);
    });
    $('#chat-form').onsubmit = e => {
      e.preventDefault();
      const v = $('#chat-input').value.trim();
      if (v) Net.sendChat(v.slice(0, 140));
      $('#chat-input').value = '';
    };

    if (E.load()) startGame(); else initCreate();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
