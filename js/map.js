// Draws each neighborhood as an illustrated SVG block. Buildings are tappable
// (data-place attribute). Everything is drawn in code: no image files, no logos.
(function () {
  const D = NYC.DATA;
  const W = 360, H = 520;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function windows(x, y, w, h, cols, rows, lit) {
    let s = '';
    const gw = w / cols, gh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const on = lit && ((r * 7 + c * 3) % 5 < 2);
      s += `<rect class="win${on ? ' lit' : ''}" x="${x + c * gw + gw * 0.2}" y="${y + r * gh + gh * 0.2}" width="${gw * 0.6}" height="${gh * 0.55}" rx="1"/>`;
    }
    return s;
  }

  function awning(x, y, w, color) {
    const n = Math.max(4, Math.round(w / 12)), sw = w / n;
    let s = `<rect x="${x - 3}" y="${y}" width="${w + 6}" height="14" fill="${color}"/>`;
    for (let i = 0; i < n; i += 2) s += `<rect x="${x - 3 + i * sw}" y="${y}" width="${sw}" height="14" fill="#fff" opacity=".35"/>`;
    for (let i = 0; i < n; i++) s += `<path d="M${x - 3 + i * sw} ${y + 14} q${sw / 2} 7 ${sw} 0" fill="${color}"/>`;
    return s;
  }

  function sign(x, y, w, text, fill, color) {
    const fs = Math.min(10, (w - 14) / (text.length * 0.8));
    return `<rect x="${x + 4}" y="${y}" width="${w - 8}" height="16" rx="2" fill="${fill || '#1d1d1f'}"/>` +
      `<text x="${x + w / 2}" y="${y + 11.5}" font-size="${fs}" text-anchor="middle" class="signtxt" fill="${color || '#fff'}">${esc(text)}</text>`;
  }

  const draw = {
    brick(p, night) {
      return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.color}" stroke="#3a2a22" stroke-width="2"/>` +
        // fire escape + water tower
        `<g stroke="#2b2b2b" stroke-width="1.5" fill="none">${[0, 1, 2].map(i => `<rect x="${p.x + p.w - 34}" y="${p.y + 30 + i * 40}" width="26" height="14"/><path d="M${p.x + p.w - 30} ${p.y + 44 + i * 40} l18 26"/>`).join('')}</g>` +
        `<g transform="translate(${p.x + 14},${p.y - 30})"><rect x="0" y="12" width="26" height="20" fill="#7b5a3c" stroke="#3a2a22"/><path d="M-2 12 L13 0 L28 12Z" fill="#5e4430"/><path d="M3 32v8M23 32v8" stroke="#3a2a22" stroke-width="2"/></g>` +
        windows(p.x + 6, p.y + 22, p.w - 44, p.h - 60, 2, 4, night) +
        `<rect x="${p.x + 10}" y="${p.y + p.h - 34}" width="22" height="34" fill="#4a2f22"/>` +
        `<path d="M${p.x + 2} ${p.y + p.h} h44 v6 h-44z" fill="#8c8c86"/>` +
        sign(p.x + 30, p.y + p.h - 28, 60, p.sign, '#f6efe3', '#3a2a22');
    },
    shop(p, night) {
      return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.color}" stroke="#222" stroke-width="2"/>` +
        windows(p.x + 6, p.y + 6, p.w - 12, p.h * 0.36, 3, 2, night) +
        sign(p.x, p.y + p.h * 0.42, p.w, p.sign) +
        awning(p.x, p.y + p.h * 0.42 + 18, p.w, p.awning) +
        `<rect x="${p.x + 8}" y="${p.y + p.h * 0.42 + 40}" width="${p.w * 0.5}" height="${p.h * 0.58 - 40}" fill="${night ? '#ffe39a' : '#cfe3ee'}" stroke="#222"/>` +
        `<rect x="${p.x + p.w * 0.66}" y="${p.y + p.h * 0.42 + 40}" width="${p.w * 0.26}" height="${p.h * 0.58 - 40}" fill="#3b2a20"/>`;
    },
    glass(p, night) {
      let s = `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${p.color}" stroke="#2d3a48" stroke-width="2"/>`;
      s += windows(p.x + 4, p.y + 6, p.w - 8, p.h - 40, 4, 9, night);
      s += `<path d="M${p.x} ${p.y} l${p.w} ${p.h * 0.5}" stroke="#fff" stroke-opacity=".18" stroke-width="18"/>`;
      s += `<rect x="${p.x + p.w / 2 - 14}" y="${p.y + p.h - 28}" width="28" height="28" fill="#1f2a35"/>`;
      if (p.sign) s += sign(p.x, p.y + p.h - 48, p.w, p.sign, '#1f2a35');
      return s;
    },
    subway(p) {
      return `<g><rect x="${p.x - 6}" y="${p.y + 6}" width="${p.w + 12}" height="${p.h - 4}" fill="#3a3a3a" rx="2"/>` +
        `<path d="M${p.x - 2} ${p.y + 12} h${p.w + 4} M${p.x} ${p.y + 20} h${p.w} M${p.x + 2} ${p.y + 28} h${p.w - 4}" stroke="#777" stroke-width="2"/>` +
        `<path d="M${p.x - 8} ${p.y + 6} v-14 M${p.x + p.w + 8} ${p.y + 6} v-14" stroke="#1f5e3a" stroke-width="3"/>` +
        `<circle cx="${p.x - 8}" cy="${p.y - 12}" r="6" fill="#4caf6e" stroke="#1f5e3a" stroke-width="2"/><circle cx="${p.x + p.w + 8}" cy="${p.y - 12}" r="6" fill="#4caf6e" stroke="#1f5e3a" stroke-width="2"/>` +
        `<rect x="${p.x - 10}" y="${p.y + p.h + 4}" width="${p.w + 20}" height="15" rx="3" fill="#1d1d1f"/><text x="${p.x + p.w / 2}" y="${p.y + p.h + 15}" font-size="9" text-anchor="middle" class="signtxt" fill="#fff">SUBWAY</text></g>`;
    },
    park(p) {
      let s = `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="6" fill="#8fc27a" stroke="#4d7a3a" stroke-width="2"/>`;
      s += `<path d="M${p.x} ${p.y + p.h * 0.6} C${p.x + p.w * 0.3} ${p.y + p.h * 0.4} ${p.x + p.w * 0.6} ${p.y + p.h * 0.9} ${p.x + p.w} ${p.y + p.h * 0.55}" stroke="#e8dcc0" stroke-width="10" fill="none"/>`;
      [[0.15, 0.25], [0.4, 0.2], [0.75, 0.25], [0.25, 0.85], [0.85, 0.85], [0.6, 0.45]].forEach(([fx, fy]) => {
        const cx = p.x + p.w * fx, cy = p.y + p.h * fy;
        s += `<rect x="${cx - 2}" y="${cy}" width="4" height="12" fill="#6b4a2f"/><circle cx="${cx}" cy="${cy - 4}" r="13" fill="#4f9a4a"/><circle cx="${cx - 5}" cy="${cy - 8}" r="6" fill="#68b35f"/>`;
      });
      s += `<rect x="${p.x + p.w * 0.45}" y="${p.y + p.h * 0.72}" width="34" height="6" fill="#7b5a3c"/>`;
      return s;
    },
    stoop(p) {
      let s = `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#c9b49a" stroke="#6b5a48" stroke-width="2"/>`;
      for (let i = 0; i < 4; i++) s += `<rect x="${p.x + 18 + i * 4}" y="${p.y + 10 + i * 12}" width="${p.w - 36 - i * 8}" height="10" fill="#a8927a" stroke="#6b5a48"/>`;
      s += `<path d="M${p.x + 14} ${p.y + 6} l-6 50 M${p.x + p.w - 14} ${p.y + 6} l6 50" stroke="#2b2b2b" stroke-width="2"/>`;
      return s;
    },
    cart(p) {
      return `<rect x="${p.x - 4}" y="${p.y}" width="${p.w + 8}" height="12" fill="#f2c12e"/>` +
        `<rect x="${p.x}" y="${p.y + 12}" width="${p.w}" height="${p.h - 22}" fill="#d9d9d9" stroke="#555" stroke-width="2"/>` +
        `<rect x="${p.x + 6}" y="${p.y + 18}" width="${p.w - 12}" height="14" fill="#c0392b"/><text x="${p.x + p.w / 2}" y="${p.y + 28.5}" font-size="8" text-anchor="middle" class="signtxt" fill="#fff">HALAL FOOD</text>` +
        `<circle cx="${p.x + 12}" cy="${p.y + p.h - 6}" r="6" fill="#333"/><circle cx="${p.x + p.w - 12}" cy="${p.y + p.h - 6}" r="6" fill="#333"/>` +
        `<path class="steam" d="M${p.x + 20} ${p.y - 4} q4 -8 0 -16 M${p.x + 34} ${p.y - 4} q4 -8 0 -16" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>`;
    },
    plaza(p) {
      const b = D.billboards;
      let s = `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#cfc8bd" stroke="#8a8378" stroke-width="2"/>`;
      for (let i = 0; i < 6; i++) s += `<path d="M${p.x + i * (p.w / 6)} ${p.y} v${p.h}" stroke="#bdb5a8"/>`;
      b.forEach((bb, i) => {
        const bw = (p.w - 16) / b.length, bx = p.x + 6 + i * (bw + 2), by = p.y + 8;
        s += `<g class="billboard"><rect x="${bx}" y="${by}" width="${bw}" height="44" fill="${bb.color}" stroke="#111" stroke-width="2"/>` +
          `<text x="${bx + bw / 2}" y="${by + 20}" font-size="${Math.min(9, (bw - 6) / (bb.text.length * 0.8))}" text-anchor="middle" class="signtxt" fill="#fff">${esc(bb.text)}</text>` +
          `<text x="${bx + bw / 2}" y="${by + 33}" font-size="${Math.min(6.5, bw / (bb.sub.length * 0.5))}" text-anchor="middle" fill="#fff" opacity=".85">${esc(bb.sub)}</text></g>`;
      });
      s += `<rect x="${p.x + 20}" y="${p.y + 64}" width="44" height="10" fill="#d23" opacity=".85"/><rect x="${p.x + 120}" y="${p.y + 70}" width="44" height="10" fill="#d23" opacity=".85"/>`;
      return s;
    },
    hydrant(p) {
      const x = p.x, y = p.y;
      return `<rect x="${x + 4}" y="${y + 8}" width="18" height="24" rx="4" fill="#c8372d" stroke="#222" stroke-width="2"/>` +
        `<rect x="${x}" y="${y + 14}" width="26" height="7" rx="3" fill="#c8372d" stroke="#222" stroke-width="2"/>` +
        `<path d="M${x + 5} ${y + 9} Q${x + 13} ${y - 2} ${x + 21} ${y + 9}Z" fill="#a82a22" stroke="#222" stroke-width="2"/>` +
        `<rect x="${x + 2}" y="${y + 31}" width="22" height="4" fill="#222"/>`;
    },
    pier(p) {
      let s = `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="#a07a52" stroke="#5e4430" stroke-width="2"/>`;
      for (let i = 1; i < 10; i++) s += `<path d="M${p.x} ${p.y + i * p.h / 10} h${p.w}" stroke="#7b5a3c"/>`;
      s += `<path d="M${p.x} ${p.y} h${p.w}" stroke="#333" stroke-width="3" stroke-dasharray="2 6"/>`;
      return s;
    }
  };

  function streets(area) {
    let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="${area.ground}"/>`;
    // avenue + cross streets
    s += `<rect x="0" y="216" width="${W}" height="66" fill="#5a5a5e"/>`;
    s += `<path d="M0 249 h${W}" stroke="#f2c12e" stroke-width="2" stroke-dasharray="14 10"/>`;
    s += `<rect x="118" y="0" width="12" height="${H}" fill="#6a6a6e"/><rect x="232" y="0" width="12" height="${H}" fill="#6a6a6e"/>`;
    // crosswalks
    for (let i = 0; i < 6; i++) { s += `<rect x="${119 + 0}" y="${222 + i * 9}" width="10" height="5" fill="#eee"/><rect x="233" y="${222 + i * 9}" width="10" height="5" fill="#eee"/>`; }
    // sidewalk lines
    s += `<path d="M0 214 h${W} M0 284 h${W}" stroke="#bdb5a8" stroke-width="3"/>`;
    // water at the bottom for downtown
    if (area.id === 'downtown') s += `<rect x="0" y="460" width="${W}" height="60" fill="#5b8fb0"/><path d="M10 480 q10 -6 20 0 t20 0 M120 495 q10 -6 20 0 t20 0 M60 505 q10 -6 20 0 t20 0" stroke="#cfe3ee" fill="none"/>`;
    // little cars
    s += `<g class="car"><rect x="30" y="226" width="34" height="16" rx="4" fill="#f2c12e"/><rect x="38" y="222" width="18" height="8" rx="2" fill="#f2c12e"/><text x="47" y="238" font-size="6" text-anchor="middle" fill="#222" class="signtxt">TAXI</text></g>`;
    s += `<g class="car2"><rect x="270" y="258" width="38" height="16" rx="4" fill="#3b6fb5"/></g>`;
    return s;
  }

  // A tiny figure for the player and regulars.
  function person(x, y, color, label, me) {
    return `<g class="person${me ? ' me' : ''}" transform="translate(${x},${y})">` +
      (me ? `<circle r="15" fill="#fff" opacity=".7" class="pulse"/>` : '') +
      `<circle cy="-10" r="5" fill="#e0b48a" stroke="#333" stroke-width="1"/>` +
      `<rect x="-5" y="-5" width="10" height="12" rx="3" fill="${color}" stroke="#333" stroke-width="1"/>` +
      (label ? `<text y="18" font-size="7.5" text-anchor="middle" class="tag">${esc(label)}</text>` : '') + `</g>`;
  }

  // where a figure stands next to a place
  function spot(p, i) {
    if (p.kind === 'subway') return [p.x + p.w + 30, p.y + p.h - 4];
    if (p.kind === 'hydrant') return [p.x - 16 - i * 20, p.y + 30];
    return [p.x + p.w / 2 + (i ? (i % 2 ? -22 : 22) * Math.ceil(i / 2) : 0), p.y + p.h + 28];
  }

  function pigeons(areaId) {
    const spots = { home: [[58, 291], [74, 289], [300, 291]], midtown: [[150, 292], [166, 296]], downtown: [[200, 456], [214, 452], [60, 210]] }[areaId] || [];
    return `<g class="pigeons" data-pigeon="1">` + spots.map(([x, y], i) =>
      `<g transform="translate(${x},${y})"><g class="pigeon" style="animation-delay:${i * 0.7}s"><rect x="-10" y="-12" width="22" height="18" fill="transparent"/><ellipse rx="6" ry="4" fill="#8a8f9a" stroke="#333"/><circle cx="5" cy="-4" r="3" fill="#6f7480" stroke="#333"/><path d="M8 -4 l3 1 -3 1z" fill="#e0a52e"/><circle cx="6" cy="-4.5" r=".8" fill="#111"/></g></g>`).join('') +
      `</g>`;
  }

  NYC.Map = {
    // Draws the area. The player figure is kept outside the redrawn layer so it
    // can walk (CSS transition) between places instead of teleporting.
    render(svg, areaId, opts) {
      const area = Object.assign({ id: areaId }, D.areas[areaId]);
      const night = opts.night;
      let s = streets(area);
      area.places.forEach(pid => {
        const p = D.places[pid];
        const body = draw[p.kind](p, night);
        const lx = p.x + p.w / 2, ly = p.kind === 'subway' ? p.y + p.h + 32 : p.y + p.h + 12;
        const goal = opts.goal === pid;
        s += `<g class="place${opts.here === pid ? ' here' : ''}${goal ? ' goal' : ''}" data-place="${pid}" tabindex="0" role="button" aria-label="${esc(p.name)}">` +
          `<rect class="hit" x="${p.x - 6}" y="${p.y - 6}" width="${p.w + 12}" height="${p.h + 12}" fill="transparent"/>` +
          (goal ? `<rect class="goalring" x="${p.x - 5}" y="${p.y - 5}" width="${p.w + 10}" height="${p.h + 10}" rx="8"/>` : '') + body +
          (p.kind !== 'subway' && p.kind !== 'hydrant' ? `<g class="plabel"><rect x="${lx - p.name.length * 3 - 6}" y="${ly - 9}" width="${p.name.length * 6 + 12}" height="13" rx="6.5"/><text x="${lx}" y="${ly}" font-size="8.5" text-anchor="middle">${esc(p.name)}</text></g>` : '') +
          `</g>`;
      });
      s += pigeons(areaId);
      const used = {};
      (opts.others || []).forEach(o => {
        const p = D.places[o.place];
        used[o.place] = (used[o.place] || 0) + 1;
        const [x, y] = spot(p, used[o.place]);
        s += person(x, y, o.color, o.name.split(' ')[0], false);
      });
      if (night) s += `<rect x="0" y="0" width="${W}" height="${H}" fill="#0b1a40" opacity=".35" pointer-events="none"/>`;

      const hp = D.places[opts.here] || D.places[area.subway];
      const [mx, my] = spot(hp, 0);
      const sameArea = svg.dataset.area === areaId;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      if (!svg.querySelector('#layer')) {
        svg.innerHTML = `<defs><clipPath id="mapclip"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#mapclip)"><g id="layer"></g><g id="me" class="walker">${person(0, 0, opts.myColor, 'You', true)}</g></g>`;
      }
      svg.querySelector('#layer').innerHTML = s;
      const me = svg.querySelector('#me');
      me.innerHTML = person(0, 0, opts.myColor, 'You', true);
      me.classList.toggle('nowalk', !sameArea);
      me.style.transform = `translate(${mx}px, ${my}px)`;
      svg.dataset.area = areaId;
    },
    // screen position (client px) of a place, for number pops
    where(svg, placeId) {
      const g = svg.querySelector(`[data-place="${placeId}"]`);
      if (!g) return null;
      const r = g.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 60) };
    }
  };
})();
