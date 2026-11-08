// Balance check: plays 4 weeks for each backstory with a few play styles and
// prints cash after each rent day. Run: node scripts/sim.js
// Goal (flow): week 1 is never a wall; later weeks need choices (rent vs fun vs sleep).
const fs = require('fs'), path = require('path'), vm = require('vm');
const store = {};
const ctx = { window: {}, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }, Math, JSON, console };
ctx.window = ctx; ctx.NYC = {};
vm.createContext(ctx);
['data.js', 'engine.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx));
const D = ctx.NYC.DATA, E = ctx.NYC.Engine;

const styles = {
  grinder: { days: 7, fun: 0 },       // works every day, cheapest food
  balanced: { days: 5, fun: 1 },      // weekdays, one fun thing a day
  slacker: { days: 3, fun: 2 }        // works 3 days, lots of fun
};

function playDay(style, dow) {
  const S = E.state();
  const go = dest => { if (S.area !== dest) E.act(D.areas[S.area].subway, 'travel', dest); };
  // events with choices: pick the first option
  const settle = r => { if (r && r.event && r.event.options) E.choose(r.event.id, 0); };
  settle(E.morning());
  if (!S.job) { go('midtown'); E.act('staffing', 'jobs'); E.applyJob('barista'); if (!S.job) E.applyJob('delivery'); }
  if (S.job && dow < style.days) { const p = D.places[E.job().place]; go(p.area); settle(E.act(p.area === 'home' ? 'park' : E.job().place, 'work')); }
  go('home');
  if (S.full < 60) settle(E.act('slice', 'two'));
  if (S.full < 60) settle(E.act('home_apt', 'cook'));
  for (let i = 0; i < style.fun; i++) settle(E.act(i ? 'stoop' : 'bodega', i ? 'stoop' : 'chopped'));
  if (style.fun > 1 && dow === 5) { go('downtown'); settle(E.act('brunch', 'brunch')); go('home'); }
  if (dow === 3) settle(E.act('laundry', 'wash'));
  return E.act('home_apt', 'sleep');
}

const runs = 40;
console.log('cash after rent day, median of ' + runs + ' runs (weeks 1-4); evictions');
D.backgrounds.forEach(bg => {
  Object.entries(styles).forEach(([name, style]) => {
    const weeks = [[], [], [], []]; let evict = 0, sanity = [];
    for (let r = 0; r < runs; r++) {
      E.newGame({ name: 'Sim', look: {}, hook: '' }, bg.id);
      E.state().arrived = true;
      for (let d = 0; d < 28; d++) {
        const res = playDay(style, d % 7);
        if (res.week && res.week.weekNo <= 4) { weeks[res.week.weekNo - 1].push(res.week.cash); if (res.week.evicted) evict++; }
      }
      sanity.push(E.state().sanity);
    }
    const med = a => { const s = a.slice().sort((x, y) => x - y); return Math.round(s[Math.floor(s.length / 2)]); };
    console.log(bg.id.padEnd(11), name.padEnd(9), weeks.map(med).map(v => String(v).padStart(6)).join(''), ' evicted:', evict, ' sanity:', med(sanity));
  });
});
