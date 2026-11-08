// Small synthesized sounds (no audio files to download). Mute is remembered.
(function () {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('nyclife.muted') === '1'; } catch (e) { }

  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, vol, slide) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + start;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  const sounds = {
    tap: () => tone(660, 0, 0.06, 'triangle', 0.06),
    coin: () => { tone(988, 0, 0.08, 'square', 0.05); tone(1319, 0.07, 0.18, 'square', 0.05); },
    spend: () => tone(330, 0, 0.09, 'triangle', 0.06, 260),
    bad: () => { tone(220, 0, 0.18, 'sawtooth', 0.04, 150); },
    train: () => { tone(784, 0, 0.35, 'sine', 0.1); tone(622, 0.35, 0.5, 'sine', 0.1); }, // a two-note door chime
    sticker: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.16, 'triangle', 0.07)); },
    stamp: () => { tone(120, 0, 0.12, 'square', 0.12, 60); tone(90, 0.02, 0.1, 'sine', 0.15, 50); },
    pigeon: () => { tone(1400, 0, 0.05, 'triangle', 0.04, 2200); tone(1500, 0.06, 0.05, 'triangle', 0.04, 2400); },
    night: () => { tone(392, 0, 0.4, 'sine', 0.06); tone(330, 0.25, 0.6, 'sine', 0.05); }
  };

  NYC.Sound = {
    play(name) { if (muted || !sounds[name]) return; try { sounds[name](); } catch (e) { } },
    muted: () => muted,
    toggle() { muted = !muted; try { localStorage.setItem('nyclife.muted', muted ? '1' : '0'); } catch (e) { } return muted; },
    buzz(ms) { if (!muted && navigator.vibrate) try { navigator.vibrate(ms || 8); } catch (e) { } }
  };
})();
