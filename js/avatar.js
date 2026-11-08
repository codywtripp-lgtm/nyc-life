// Character look, drawn as SVG (in the game) and on canvas (share card) from one shape list.
(function () {
  const A = {
    skins: ['#f5d0b0', '#e0b48a', '#c68e5e', '#9a6a43', '#6b4429'],
    hairColors: ['#1d1a18', '#5a3b22', '#b8792f', '#e3c27a', '#9a2f2f', '#7a8fd0'],
    shirts: ['#e0662e', '#3b6fb5', '#2f8a4f', '#b23a48', '#6e4f7a', '#1d1d1f'],
    hairs: ['short', 'long', 'curly', 'bun', 'none'],
    extras: ['none', 'beanie', 'headphones', 'tote'],
    random() {
      const p = a => a[Math.floor(Math.random() * a.length)];
      return { skin: p(A.skins), hairColor: p(A.hairColors), shirt: p(A.shirts), hair: p(A.hairs), extra: p(A.extras) };
    }
  };
  const INK = '#1d1d1f';

  // all shapes in a 100x120 box
  function shapes(l) {
    const s = [], hc = l.hairColor;
    if (l.hair === 'long') s.push({ t: 'path', d: 'M22 50 Q22 18 50 16 Q78 18 78 50 L82 92 L18 92 Z', fill: hc });
    s.push({ t: 'path', d: 'M14 120 Q14 82 50 82 Q86 82 86 120 Z', fill: l.shirt, stroke: INK });
    s.push({ t: 'rect', x: 43, y: 66, w: 14, h: 18, fill: l.skin });
    s.push({ t: 'ellipse', cx: 50, cy: 48, rx: 24, ry: 28, fill: l.skin, stroke: INK });
    if (l.extra !== 'beanie') {
      if (l.hair === 'short') s.push({ t: 'path', d: 'M26 44 Q26 16 50 16 Q74 16 74 44 Q66 30 50 30 Q34 30 26 44 Z', fill: hc });
      if (l.hair === 'long') s.push({ t: 'path', d: 'M26 46 Q28 18 50 18 Q72 18 74 46 Q60 30 44 32 Q34 36 26 46 Z', fill: hc });
      if (l.hair === 'curly') [[20, 32], [40, 24], [60, 24], [80, 32], [30, 44], [72, 44], [50, 38]].forEach(([x, y]) => s.push({ t: 'circle', cx: x, cy: y, r: 11, fill: hc }));
      if (l.hair === 'bun') { s.push({ t: 'path', d: 'M27 44 Q27 18 50 18 Q73 18 73 44 Q64 30 50 30 Q36 30 27 44 Z', fill: hc }); s.push({ t: 'circle', cx: 50, cy: 12, r: 10, fill: hc }); }
    }
    s.push({ t: 'circle', cx: 41, cy: 50, r: 3, fill: INK }, { t: 'circle', cx: 59, cy: 50, r: 3, fill: INK });
    s.push({ t: 'line', d: 'M41 62 Q50 69 59 62', stroke: INK, w: 2.5 });
    if (l.extra === 'beanie') {
      s.push({ t: 'path', d: 'M25 42 Q25 12 50 12 Q75 12 75 42 Z', fill: '#c8372d', stroke: INK });
      s.push({ t: 'rect', x: 23, y: 36, w: 54, h: 10, fill: '#a82a22', stroke: INK });
      s.push({ t: 'circle', cx: 50, cy: 10, r: 6, fill: '#f6efe3', stroke: INK });
    }
    if (l.extra === 'headphones') {
      s.push({ t: 'line', d: 'M24 48 Q24 14 50 14 Q76 14 76 48', stroke: INK, w: 5 });
      s.push({ t: 'rect', x: 18, y: 42, w: 10, h: 16, fill: '#e0662e', stroke: INK }, { t: 'rect', x: 72, y: 42, w: 10, h: 16, fill: '#e0662e', stroke: INK });
    }
    if (l.extra === 'tote') {
      s.push({ t: 'line', d: 'M60 84 L70 104', stroke: '#c9b28f', w: 3 });
      s.push({ t: 'rect', x: 62, y: 100, w: 26, h: 20, fill: '#f6efe3', stroke: INK });
      s.push({ t: 'path', d: 'M69 116 L69 107 L72 110 L78 110 L81 107 L81 116 Z', fill: INK }); // a tiny cat
    }
    return s;
  }

  A.svg = (l, size) => {
    size = size || 80;
    const out = shapes(l).map(p => {
      const st = p.stroke ? ` stroke="${p.stroke}" stroke-width="${p.w || 2}"` : '';
      if (p.t === 'path') return `<path d="${p.d}" fill="${p.fill}"${st}/>`;
      if (p.t === 'line') return `<path d="${p.d}" fill="none" stroke="${p.stroke}" stroke-width="${p.w}" stroke-linecap="round"/>`;
      if (p.t === 'rect') return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="2" fill="${p.fill}"${p.stroke ? ` stroke="${p.stroke}" stroke-width="2"` : ''}/>`;
      if (p.t === 'circle') return `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${p.fill}"${st}/>`;
      if (p.t === 'ellipse') return `<ellipse cx="${p.cx}" cy="${p.cy}" rx="${p.rx}" ry="${p.ry}" fill="${p.fill}"${st}/>`;
      return '';
    }).join('');
    return `<svg viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-hidden="true">${out}</svg>`;
  };

  A.canvas = (ctx, l, x, y, scale) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    shapes(l).forEach(p => {
      ctx.beginPath();
      let path = null;
      if (p.t === 'path' || p.t === 'line') path = new Path2D(p.d);
      else if (p.t === 'rect') ctx.rect(p.x, p.y, p.w, p.h);
      else if (p.t === 'circle') ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
      else if (p.t === 'ellipse') ctx.ellipse(p.cx, p.cy, p.rx, p.ry, 0, 0, Math.PI * 2);
      if (p.t !== 'line') { ctx.fillStyle = p.fill; path ? ctx.fill(path) : ctx.fill(); }
      if (p.stroke) { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.w || 2; ctx.lineCap = 'round'; path ? ctx.stroke(path) : ctx.stroke(); }
    });
    ctx.restore();
  };

  NYC.Avatar = A;
})();
