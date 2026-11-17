/* Hiba Khan portfolio: bouncy name, sparkles, draggable collage, journey, tabs, theme switcher */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = ms => { if (navigator.vibrate) navigator.vibrate(ms); };
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const cols = ['#EC5F9C', '#F4A6C6', '#2B2A2D', '#FF8FB8'];

  /* Bouncy name, second word in italic pink */
  const h1 = $('[data-split]');
  const full = h1.textContent.trim();
  h1.setAttribute('aria-label', full);
  h1.innerHTML = full.split(' ').map((w, i) => '<span class="w' + (i ? ' it' : '') + '">' + [...w].map(c => '<span class="ch" aria-hidden="true">' + c + '</span>').join('') + '</span>').join(' ');
  $$('.ch', h1).forEach((c, i) => c.style.setProperty('--n', i));
  h1.addEventListener('pointerover', e => { const c = e.target.closest('.ch'); if (c) restart(c, 'hit'); });

  /* Sparkle bursts, cursor trail and tap sparkles */
  const burst = (x, y, n = 14) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'bit';
      p.textContent = i % 3 ? '\u2726' : '\u2665';
      p.style.cssText = `left:${x}px;top:${y}px;color:${cols[i % 4]};font-size:${10 + Math.random() * 16}px;--dx:${(Math.random() - 0.5) * 240}px;--dy:${-60 - Math.random() * 140}px;--r:${Math.random() * 360 - 180}deg`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  };
  if (!reduce) {
    let last = 0;
    document.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const now = performance.now();
      if (now - last < 60) return;
      last = now;
      const p = document.createElement('i');
      p.className = 'bit tr';
      p.textContent = '\u2726';
      p.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;color:${cols[Math.random() * 4 | 0]};font-size:${8 + Math.random() * 10}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }, { passive: true });
    document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') burst(e.clientX, e.clientY, 6); });
  }

  /* Draggable collage pieces with inertia and bounce */
  const box = $('.collage');
  $$('.drag').forEach(el => {
    const base = +el.dataset.r || 0;
    let x = 0, y = 0, vx = 0, vy = 0, rot = base, held = false, sx = 0, sy = 0, ox = 0, oy = 0, raf = 0;
    const lim = () => [-el.offsetLeft, box.clientWidth - el.offsetLeft - el.offsetWidth, -el.offsetTop, box.clientHeight - el.offsetTop - el.offsetHeight];
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const draw = () => { el.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg)`; };
    const fall = () => {
      const [x0, x1, y0, y1] = lim();
      x += vx; y += vy; vx *= 0.95; vy *= 0.95;
      if (x < x0 || x > x1) { x = clamp(x, x0, x1); vx *= -0.6; }
      if (y < y0 || y > y1) { y = clamp(y, y0, y1); vy *= -0.6; }
      rot += (base - rot) * 0.08 + vx * 0.1;
      draw();
      if (Math.abs(vx) + Math.abs(vy) > 0.2 || Math.abs(rot - base) > 0.3) raf = requestAnimationFrame(fall);
      else { rot = base; draw(); }
    };
    el.addEventListener('pointerdown', e => {
      held = true; el._m = false; el.setPointerCapture(e.pointerId); cancelAnimationFrame(raf);
      sx = e.clientX; sy = e.clientY; ox = x; oy = y; vx = vy = 0;
      el.classList.add('held'); buzz(6);
    });
    el.addEventListener('pointermove', e => {
      if (!held) return;
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 4) el._m = true;
      const [x0, x1, y0, y1] = lim();
      const nx = clamp(ox + e.clientX - sx, x0, x1), ny = clamp(oy + e.clientY - sy, y0, y1);
      vx = nx - x; vy = ny - y; x = nx; y = ny;
      rot = base + clamp(vx * 1.4, -14, 14);
      draw();
    });
    const drop = () => { if (!held) return; held = false; el.classList.remove('held'); raf = requestAnimationFrame(fall); };
    el.addEventListener('pointerup', drop);
    el.addEventListener('pointercancel', drop);
    draw();
  });
  const pol = $('.polaroid');
  pol.addEventListener('click', e => {
    if (pol._m) return;
    const r = pol.getBoundingClientRect();
    burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 18);
    buzz(15);
  });

  /* Colour switcher */
  const sw = $$('.sw');
  const setTheme = t => {
    document.body.dataset.theme = t;
    sw.forEach(s => s.classList.toggle('on', s.dataset.t === t));
    try { localStorage.setItem('hk-theme', t); } catch (err) { /* storage unavailable */ }
  };
  sw.forEach(s => s.addEventListener('click', () => {
    setTheme(s.dataset.t);
    const r = s.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 10);
  }));
  try { const t = localStorage.getItem('hk-theme'); if (t) setTheme(t); } catch (err) { /* storage unavailable */ }

  /* Journey stops */
  const stops = $$('.stop'), dT = $('#d-t'), dM = $('#d-m'), dP = $('#d-p'), det = $('.detail');
  stops.forEach(s => s.addEventListener('click', () => {
    stops.forEach(o => { o.classList.toggle('on', o === s); o.setAttribute('aria-pressed', String(o === s)); });
    dT.textContent = s.dataset.t; dM.textContent = s.dataset.m; dP.textContent = s.dataset.d;
    restart(det, 'swap'); buzz(8);
  }));

  /* Experience numerals, chips and tabs */
  $$('.num').forEach(n => n.addEventListener('click', () => { n.setAttribute('aria-pressed', String(n.classList.toggle('on'))); buzz(8); }));
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    c.classList.toggle('on');
    const r = c.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, 8);
  }));
  const tabs = $$('.tab'), panels = $$('.panel');
  panels.forEach(p => $$('.chip', p).forEach((c, i) => c.style.setProperty('--n', i)));
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    tabs.forEach((o, j) => { o.classList.toggle('on', i === j); o.setAttribute('aria-selected', String(i === j)); });
    panels.forEach((p, j) => { p.hidden = i !== j; if (i === j) restart(p, 'show'); });
    buzz(8);
  }));

  /* Marquee loop, nav scroll-spy and scroll reveals */
  const mq = $('.mq');
  mq.insertAdjacentHTML('beforeend', mq.innerHTML);
  const links = $$('.links a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section').forEach(s => spy.observe(s));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$('.pop').forEach(el => io.observe(el));

  /* Copy to clipboard with toast, and print */
  const toast = $('.toast');
  let tt;
  const say = msg => {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $$('.copy').forEach(b => b.addEventListener('click', async () => {
    const v = b.dataset.copy;
    try { await navigator.clipboard.writeText(v); }
    catch (err) {
      const t = document.createElement('textarea');
      t.value = v; t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    }
    say('Copied ' + v);
    const r = b.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, 8);
  }));
  $$('[data-print]').forEach(b => b.addEventListener('click', () => window.print()));
})();
