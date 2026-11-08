// "My NYC life" card: a 1080x1350 image (portrait, fits Instagram and phone screens)
// drawn on canvas, shared through the phone's share sheet or downloaded on desktop.
(function () {
  const E = () => NYC.Engine;
  const SIGN = 'Bungee, "Arial Black", sans-serif';
  const BODY = 'Rubik, "Trebuchet MS", sans-serif';

  function wrap(ctx, text, x, y, maxW, lh, maxLines) {
    const words = text.split(' ');
    let line = '', n = 0;
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; if (++n >= (maxLines || 9) - 1) break; } else line = t;
    }
    if (line) ctx.fillText(line, x, y);
    return y + lh;
  }

  function skyline(ctx, W, base, color) {
    ctx.fillStyle = color;
    const bs = [[0, 160], [70, 240], [130, 180], [190, 330], [240, 210], [300, 280], [370, 150], [430, 420], [470, 380], [520, 200], [590, 260], [650, 190], [700, 310], [770, 230], [830, 170], [880, 290], [950, 210], [1010, 250]];
    bs.forEach(([x, h], i) => { const w = (bs[i + 1] ? bs[i + 1][0] : W) - x + 2; ctx.fillRect(x, base - h, w, h); });
    ctx.fillRect(448, base - 520, 6, 100);
    // water tower
    ctx.fillRect(220, base - 380, 46, 44); ctx.beginPath(); ctx.moveTo(214, base - 380); ctx.lineTo(243, base - 410); ctx.lineTo(272, base - 380); ctx.fill();
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  NYC.Share = {
    draw(canvas, w) {
      const S = E().state();
      const W = 1080, H = 1350;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      const ink = '#1d1d1f';

      // flat sky bands (no gradients: keeps the hand-made look)
      [['#ffb35c', 0], ['#f8925a', 210], ['#f26b5b', 420]].forEach(([c, y]) => { ctx.fillStyle = c; ctx.fillRect(0, y, W, 420); });
      ctx.fillStyle = '#fff1c9'; ctx.beginPath(); ctx.arc(830, 300, 105, 0, 7); ctx.fill();
      skyline(ctx, W, 640, '#3a2a6b');
      ctx.fillStyle = '#3a2a6b'; ctx.fillRect(0, 640, W, H - 640);

      // header
      ctx.fillStyle = ink;
      ctx.font = `44px ${SIGN}`; ctx.fillText('NYC LIFE', 70, 110);
      ctx.font = `120px ${SIGN}`; ctx.fillText('WEEK ' + w.weekNo, 66, 240);

      // card
      ctx.fillStyle = ink; rr(ctx, 72, 352, 960, 920, 30); ctx.fill();
      ctx.fillStyle = '#fff8ec'; rr(ctx, 60, 340, 960, 920, 30); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = ink; ctx.stroke();
      ctx.fillStyle = '#f2c12e'; ctx.beginPath(); ctx.arc(170, 450, 82, 0, 7); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(170, 450, 79, 0, 7); ctx.clip();
      NYC.Avatar.canvas(ctx, S.char.look, 92, 372, 1.55);
      ctx.restore();
      ctx.fillStyle = ink; ctx.font = `52px ${SIGN}`; ctx.fillText(S.char.name.toUpperCase(), 280, 430);
      ctx.font = `600 30px ${BODY}`; ctx.fillText(w.job + ' in ' + w.hood, 282, 478);
      ctx.fillStyle = '#b23a48'; ctx.font = `30px ${SIGN}`; ctx.fillText(w.rank.toUpperCase(), 282, 522);

      // the hook line
      if (w.hook) {
        ctx.fillStyle = '#f2c12e'; ctx.fillRect(100, 570, 880, 96);
        ctx.fillStyle = ink; ctx.font = `600 33px ${BODY}`;
        wrap(ctx, w.hook, 120, 610, 840, 42, 2);
      }

      // stats
      const stats = [
        ['MADE', E().money(w.earned)],
        ['RENT', w.paid >= w.due ? E().money(w.paid) : 'SHORT'],
        ['DOLLAR SLICES', w.slices || 0],
        ['TRAIN DELAYS', w.delays || 0],
        ['RATS SEEN', w.rats || 0],
        ['STICKERS', w.stickers]
      ];
      stats.forEach(([k, v], i) => {
        const x = 110 + (i % 3) * 300, y = 740 + Math.floor(i / 3) * 140;
        ctx.fillStyle = '#7a6a5a'; ctx.font = `800 24px ${BODY}`; ctx.fillText(k, x, y);
        ctx.fillStyle = ink; ctx.font = `56px ${SIGN}`; ctx.fillText(String(v), x, y + 64);
      });

      // highlight
      const m = w.moments && w.moments.length ? w.moments[w.moments.length - 1] : 'survived another week';
      ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.moveTo(100, 1030); ctx.lineTo(980, 1030); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#b23a48'; ctx.font = `28px ${SIGN}`; ctx.fillText('THIS WEEK I', 110, 1086);
      ctx.fillStyle = ink; ctx.font = `600 40px ${BODY}`;
      wrap(ctx, m + '.', 110, 1140, 860, 50, 2);

      ctx.fillStyle = '#fff8ec'; ctx.font = `600 30px ${BODY}`;
      ctx.fillText(NYC.DATA.text.shareFooter, 72, 1318);
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
})();
