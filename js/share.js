// "My week in NYC" card: a 1080x1350 image (Instagram portrait size) drawn on canvas,
// shared through the phone's share sheet when available, otherwise downloaded.
(function () {
  const E = () => NYC.Engine;

  function wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(' ');
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; } else line = t;
    }
    if (line) ctx.fillText(line, x, y);
    return y + lh;
  }

  function skyline(ctx, W, base, color) {
    ctx.fillStyle = color;
    const bs = [[0, 160], [70, 240], [130, 180], [190, 330], [240, 210], [300, 280], [370, 150], [430, 420], [470, 380], [520, 200], [590, 260], [650, 190], [700, 310], [770, 230], [830, 170], [880, 290], [950, 210], [1010, 250]];
    bs.forEach(([x, h], i) => {
      const w = (bs[i + 1] ? bs[i + 1][0] : W) - x + 2;
      ctx.fillRect(x, base - h, w, h);
    });
    // a spire
    ctx.fillRect(448, base - 520, 6, 100);
  }

  NYC.Share = {
    draw(canvas, w) {
      const S = E().state();
      const W = 1080, H = 1350;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      const font = (wt, px) => `${wt} ${px}px "Trebuchet MS", "Segoe UI", system-ui, sans-serif`;

      // sky
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#ffb35c'); g.addColorStop(0.55, '#f26b5b'); g.addColorStop(1, '#3a2a6b');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,240,200,.85)'; ctx.beginPath(); ctx.arc(820, 300, 110, 0, 7); ctx.fill();
      skyline(ctx, W, 640, 'rgba(40,24,70,.55)');

      // header
      ctx.fillStyle = '#1d1d1f';
      ctx.font = font(900, 50); ctx.fillText('NYC LIFE', 70, 110);
      ctx.font = font(900, 112); ctx.fillText('WEEK ' + w.weekNo, 70, 230);
      ctx.font = font(700, 44); ctx.fillText('in New York', 74, 290);

      // avatar card
      ctx.fillStyle = '#fff8ec'; roundRect(ctx, 60, 380, 960, 900, 36); ctx.fill();
      ctx.fillStyle = '#f2c12e'; roundRect(ctx, 60, 380, 960, 150, 36); ctx.fill(); ctx.fillRect(60, 480, 960, 50);
      NYC.Avatar.canvas(ctx, S.char.look, 80, 350, 1.55);
      ctx.fillStyle = '#1d1d1f'; ctx.font = font(900, 54); ctx.fillText(S.char.name, 260, 448);
      ctx.font = font(600, 32); ctx.fillText(w.job + ' · ' + w.hood, 262, 500);

      // stats
      const stats = [
        ['Made', E().money(w.earned)],
        ['Rent', w.paid >= w.due ? E().money(w.paid) + ' paid' : 'short ' + E().money(w.due - w.paid)],
        ['Dollar slices', w.slices || 0],
        ['Train delays', w.delays || 0],
        ['Bodega cats pet', w.cats || 0],
        ['Rats seen', w.rats || 0]
      ];
      stats.forEach(([k, v], i) => {
        const x = 100 + (i % 2) * 460, y = 600 + Math.floor(i / 2) * 120;
        ctx.fillStyle = '#7a6a5a'; ctx.font = font(600, 30); ctx.fillText(k.toUpperCase(), x, y);
        ctx.fillStyle = '#1d1d1f'; ctx.font = font(900, 54); ctx.fillText(String(v), x, y + 58);
      });

      // sanity meter
      const sy = 980;
      ctx.fillStyle = '#7a6a5a'; ctx.font = font(600, 30); ctx.fillText('SANITY', 100, sy);
      ctx.fillStyle = '#e5dccd'; roundRect(ctx, 250, sy - 28, 680, 34, 17); ctx.fill();
      ctx.fillStyle = w.sanity > 50 ? '#2f8a4f' : w.sanity > 25 ? '#e0a52e' : '#b23a48';
      roundRect(ctx, 250, sy - 28, Math.max(34, 680 * w.sanity / 100), 34, 17); ctx.fill();

      // highlight
      const m = w.moments && w.moments.length ? w.moments[w.moments.length - 1] : 'survived another week';
      ctx.fillStyle = '#1d1d1f'; ctx.font = font(800, 36);
      ctx.fillText('Highlight:', 100, 1070);
      ctx.font = font(600, 38);
      wrap(ctx, 'I ' + m + '.', 100, 1122, 880, 48);

      ctx.fillStyle = '#fff'; ctx.font = font(700, 30);
      ctx.fillText('Play free: NYC Life (browser game)', 70, 1325);
    },

    async share(canvas, text) {
      try {
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        const file = new File([blob], 'nyc-life-week.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text });
          return 'shared';
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'nyc-life-week.png';
        document.body.appendChild(a); a.click(); a.remove();
        return 'downloaded';
      } catch (e) { return 'cancelled'; }
    }
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
})();
