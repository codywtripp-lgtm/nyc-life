// Character look: drawn as SVG (in the game) and on canvas (for the share card).
(function () {
  const A = {
    skins: ['#f5d0b0', '#e0b48a', '#c68e5e', '#9a6a43', '#6b4429'],
    hairColors: ['#1d1a18', '#5a3b22', '#b8792f', '#e3c27a', '#9a2f2f', '#7a8fd0'],
    shirts: ['#e0662e', '#3b6fb5', '#2f8a4f', '#b23a48', '#6e4f7a', '#1d1d1f'],
    hairs: ['short', 'long', 'curly', 'bun', 'none'],
    random() {
      const p = a => a[Math.floor(Math.random() * a.length)];
      return { skin: p(A.skins), hairColor: p(A.hairColors), shirt: p(A.shirts), hair: p(A.hairs) };
    }
  };

  // shapes in a 100x120 box; used by both renderers
  function hairBack(l) {
    if (l.hair === 'long') return [['path', 'M22 50 Q22 18 50 16 Q78 18 78 50 L82 92 L18 92 Z']];
    return [];
  }
  function hairFront(l) {
    switch (l.hair) {
      case 'short': return [['path', 'M26 44 Q26 16 50 16 Q74 16 74 44 Q66 30 50 30 Q34 30 26 44 Z']];
      case 'long': return [['path', 'M26 46 Q28 18 50 18 Q72 18 74 46 Q60 30 44 32 Q34 36 26 46 Z']];
      case 'curly': return [[18, 0], [38, -8], [58, -8], [78, 0], [28, 12], [70, 12], [48, 6]].map(([x, y]) => ['circle', x + 2, 32 + y, 11]);
      case 'bun': return [['path', 'M27 44 Q27 18 50 18 Q73 18 73 44 Q64 30 50 30 Q36 30 27 44 Z'], ['circle', 50, 12, 10]];
      default: return [];
    }
  }

  A.svg = (l, size) => {
    size = size || 80;
    const shape = s => s[0] === 'circle' ? `<circle cx="${s[1]}" cy="${s[2]}" r="${s[3]}" fill="${l.hairColor}"/>` : `<path d="${s[1]}" fill="${l.hairColor}"/>`;
    return `<svg viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-hidden="true">` +
      hairBack(l).map(shape).join('') +
      `<path d="M14 120 Q14 82 50 82 Q86 82 86 120 Z" fill="${l.shirt}"/>` +
      `<rect x="43" y="66" width="14" height="18" fill="${l.skin}"/>` +
      `<ellipse cx="50" cy="48" rx="24" ry="28" fill="${l.skin}"/>` +
      hairFront(l).map(shape).join('') +
      `<circle cx="41" cy="50" r="3" fill="#222"/><circle cx="59" cy="50" r="3" fill="#222"/>` +
      `<path d="M41 62 Q50 69 59 62" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
      `</svg>`;
  };

  A.canvas = (ctx, l, x, y, scale) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    const shape = s => {
      ctx.fillStyle = l.hairColor; ctx.beginPath();
      if (s[0] === 'circle') ctx.arc(s[1], s[2], s[3], 0, Math.PI * 2); else ctx.fill(new Path2D(s[1]));
      ctx.fill();
    };
    hairBack(l).forEach(shape);
    ctx.fillStyle = l.shirt; ctx.fill(new Path2D('M14 120 Q14 82 50 82 Q86 82 86 120 Z'));
    ctx.fillStyle = l.skin; ctx.fillRect(43, 66, 14, 18);
    ctx.beginPath(); ctx.ellipse(50, 48, 24, 28, 0, 0, Math.PI * 2); ctx.fill();
    hairFront(l).forEach(shape);
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(41, 50, 3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(59, 50, 3, 0, 7); ctx.fill();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(41, 62); ctx.quadraticCurveTo(50, 69, 59, 62); ctx.stroke();
    ctx.restore();
  };

  NYC.Avatar = A;
})();
