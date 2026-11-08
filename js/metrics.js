// Privacy-first measurement stub. Nothing leaves the device in v1: no cookies,
// no third-party service, no IDs. Counts live in this browser's localStorage so we
// can check them in playtests. To collect real numbers later (with the owner's OK),
// set NYC.Metrics.sink to a function that POSTs the event name + day number to a
// cookie-free endpoint (e.g. a Cloudflare Worker that only increments counters).
//
// Measures (see docs/design-research.md, "Evidence loop"):
//   session_start, first_session_seconds, day1_done, return_d1 (came back the next
//   calendar day), return_d7, share_open, share_done, week_done.
(function () {
  const KEY = 'nyclife.metrics';
  let m;
  try { m = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { m = null; }
  if (!m) m = { first: Date.now(), sessions: 0, counts: {} };
  const t0 = Date.now();
  const dayNo = ts => Math.floor((ts - new Date(new Date(m.first).toDateString()).getTime()) / 864e5);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { } };

  const M = {
    sink: null,
    track(name, value) {
      m.counts[name] = (m.counts[name] || 0) + 1;
      save();
      if (M.sink) try { M.sink({ name, value, day: dayNo(Date.now()) }); } catch (e) { }
    },
    once(name, value) { if (!m.counts[name]) M.track(name, value); },
    dump: () => JSON.parse(JSON.stringify(m))
  };

  m.sessions++;
  const d = dayNo(t0);
  if (m.sessions > 1 && d === 1) M.once('return_d1');
  if (m.sessions > 1 && d >= 7) M.once('return_d7');
  M.track('session_start');
  window.addEventListener('pagehide', () => { if (m.sessions === 1) { m.firstSessionSeconds = Math.round((Date.now() - t0) / 1000); save(); } });

  NYC.Metrics = M;
})();
