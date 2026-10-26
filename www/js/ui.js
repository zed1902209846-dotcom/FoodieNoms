/* Shared view helpers, components and overlay/motion utilities. */
window.FN = window.FN || {};
(function () {
  const ic = FN.ic;
  const esc = FN.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rm = FN.rm = n => 'RM' + Number(n).toFixed(2);
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  FN.reduceMotion = reduce;

  const CAT = { Bakery: ['c-bakery', 'bread'], 'Café': ['c-cafe', 'cup'], Dessert: ['c-dessert', 'cake'], Meals: ['c-meals', 'bowl'], Drinks: ['c-drinks', 'cup'], Others: ['c-others', 'bag'] };

  const C = FN.c = {
    ph(item, { w = null, h = 96, label = '', cls = '', extra = '' } = {}) {
      const [c, i] = CAT[item.cat] || CAT.Others;
      const size = `${w ? `width:${w}px;` : ''}height:${h}px;`;
      const inner = item.img ? `<img src="${esc(item.img)}" alt="${esc(item.name)}" loading="lazy">` : `${ic(i, 'ph-ic')}${label ? `<span class="ph-label">${esc(label)}</span>` : ''}`;
      return `<div class="ph ${c} ${cls}" style="${size}" ${item.img ? '' : `role="img" aria-label="${esc(item.name)} photo placeholder"`}>${inner}${extra}</div>`;
    },
    badge(kind, text) { return `<span class="badge badge-${kind}">${text}</span>`; },
    status(o) {
      return {
        paid: C.badge('pending', 'Paid · awaiting pickup'), ready: C.badge('ready', 'Ready for pickup'), collected: C.badge('done', 'Collected'),
        cancelled: C.badge('error', 'Cancelled'), noshow: C.badge('neutral', 'Not collected')
      }[o.status];
    },
    price(now, was, big = false) { return `<span class="price ${big ? 'big' : ''}"><span class="price-now">${rm(now)}</span><span class="price-was">${rm(was)}</span></span>`; },
    stars(n, cls = 'ic-s') { let s = ''; for (let i = 1; i <= 5; i++) s += FN.starIc(i <= Math.round(n), cls); return `<span class="stars" aria-label="${n} out of 5 stars">${s}</span>`; },
    rating(vid) { const r = FN.sel.rating(vid); return r.count ? `${FN.starIc(true)}<b class="num">${r.avg.toFixed(1)}</b><span class="t-muted num">(${r.count})</span>` : `<span class="t-muted">New on FoodieNoms</span>`; },
    meta(icon, text, ink = false) { return `<span class="meta ${ink ? 'ink' : ''}">${ic(icon, 'ic-s')}<span>${text}</span></span>`; },
    ibox(icon, cls = '') { return `<span class="ibox ${cls}">${ic(icon, 'ic-m')}</span>`; },
    toggle(on, act, args = '', label = '') { return `<button class="toggle" role="switch" aria-checked="${on}" data-act="${act}" ${args} aria-label="${esc(label)}"></button>`; },
    stepper(lid, q, max, act = 'qty') {
      return `<span class="stepper"><button data-act="${act}" data-id="${lid}" data-q="${q - 1}" aria-label="Decrease">${ic('minus', 'ic-m')}</button><span class="q num">${q}</span><button data-act="${act}" data-id="${lid}" data-q="${q + 1}" ${q >= max ? 'disabled' : ''} aria-label="Increase">${ic('plus', 'ic-m')}</button></span>`;
    },
    seg(opts, sel, act) { return `<div class="seg" role="tablist">${opts.map(([v, l]) => `<button role="tab" aria-selected="${v === sel}" class="${v === sel ? 'is-on' : ''}" data-act="${act}" data-v="${v}">${l}</button>`).join('')}</div>`; },
    avatar(name, me = false, cls = '') { return `<span class="avatar ${me ? 'me' : ''} ${cls}" aria-hidden="true">${esc((name || '?').trim()[0].toUpperCase())}</span>`; },
    lockup(dark = false, h = 28) { return `<span class="lockup ${dark ? 'on-dark' : ''}"><img class="mark" src="assets/logo/logo-mark.png" alt="" style="width:${h + 8}px;height:${h + 8}px"><img class="word" src="assets/logo/logo-wordmark.png" alt="Foodienoms" style="height:${h}px"></span>`; },
    field({ id, label, type = 'text', value = '', ph = '', icon = '', pre = '', hint = '', err = '', right = '', attrs = '' }) {
      return `<div class="field" id="f-${id}"><label for="${id}">${label}</label><div class="input">${icon ? ic(icon, 'ic-m') : ''}${pre ? `<span class="pre">${pre}</span>` : ''}<input id="${id}" name="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(ph)}" ${attrs}>${right}</div>${hint ? `<span class="field-hint">${hint}</span>` : ''}<span class="field-error">${ic('alert', 'ic-s')}<span>${err}</span></span></div>`;
    },
    select({ id, label, options, value, icon = '' }) {
      return `<div class="field" id="f-${id}"><label for="${id}">${label}</label><div class="input">${icon ? ic(icon, 'ic-m') : ''}<select id="${id}" name="${id}">${options.map(o => `<option ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>${ic('down', 'ic-m')}</div></div>`;
    },
    qr(code) {
      // Decorative pickup code pattern (not a scannable QR). Swap for a QR library in production.
      let seed = [...String(code)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
      const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      const N = 21; let cells = '';
      const finder = (x, y) => [[0, 0], [N - 7, 0], [0, N - 7]].some(([fx, fy]) => { const dx = x - fx, dy = y - fy; if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false; return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4); });
      const inFinder = (x, y) => [[0, 0], [N - 7, 0], [0, N - 7]].some(([fx, fy]) => x >= fx - 1 && y >= fy - 1 && x <= fx + 7 && y <= fy + 7);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const on = inFinder(x, y) ? finder(x, y) : rnd() > 0.52; cells += `<i class="${on ? 'on' : ''}"></i>`; }
      return `<div class="qr" role="img" aria-label="Pickup code ${code}">${cells}</div>`;
    },
    empty({ art = true, title, body, actions = '' }) {
      return `<div class="empty">${art ? '<img class="art" src="assets/logo/logo-mark.png" alt="">' : ''}<h2 class="t-h1">${title}</h2><p class="t-muted">${body}</p>${actions}</div>`;
    }
  };

  /* ---------- overlays ---------- */
  const root = () => document.getElementById('overlay-root');
  let lastFocus = null;
  FN.overlay = {
    open(html, { onClose } = {}) {
      lastFocus = document.activeElement;
      root().innerHTML = `<div class="scrim" data-act="close-overlay"></div>${html}`;
      FN.overlay._onClose = onClose;
      document.body.style.overflow = 'hidden';
      const first = root().querySelector('.sheet, .drawer, .dialog');
      first && first.setAttribute('tabindex', '-1'); first && first.focus({ preventScroll: true });
    },
    close() {
      if (!root().innerHTML) return;
      root().innerHTML = ''; document.body.style.overflow = '';
      const cb = FN.overlay._onClose; FN.overlay._onClose = null; cb && cb();
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    },
    isOpen() { return !!root().innerHTML; },
    sheet(title, body, sub = '') {
      FN.overlay.open(`<section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><span class="grabber"></span><div class="sheet-head"><div class="grow stack-s"><h2 class="t-h1">${title}</h2>${sub ? `<p class="t-small t-muted">${sub}</p>` : ''}</div><button class="icon-btn" data-act="close-overlay" aria-label="Close">${ic('x')}</button></div>${body}</section>`);
    },
    confirm({ title, body, ok = 'Confirm', okClass = 'btn-primary', cancel = 'Cancel', onOk }) {
      FN.overlay.open(`<section class="dialog" role="alertdialog" aria-modal="true" aria-label="${esc(title)}"><h2 class="t-h1">${title}</h2><p class="t-muted">${body}</p><div class="actions"><button class="btn btn-ghost" data-act="close-overlay">${cancel}</button><button class="btn ${okClass}" data-act="dialog-ok">${ok}</button></div></section>`);
      FN.overlay._ok = onOk;
    }
  };

  FN.toast = function (msg, { icon = 'check', action = null, onAction = null, ms = 2600 } = {}) {
    const tr = document.getElementById('toast-root');
    const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status');
    el.innerHTML = `${ic(icon, 'ic-m')}<span>${msg}</span>${action ? `<button type="button">${action}</button>` : ''}`;
    if (action) el.querySelector('button').onclick = () => { onAction && onAction(); dismiss(); };
    tr.innerHTML = ''; tr.appendChild(el);
    let gone = false; const dismiss = () => { if (gone) return; gone = true; el.classList.add('out'); setTimeout(() => el.remove(), 200); };
    setTimeout(dismiss, ms);
  };

  /* ---------- motion ---------- */
  FN.motion = {
    fly(fromEl, toSel) {
      const find = () => [...document.querySelectorAll(toSel)].find(e => e.offsetParent !== null);
      const to = find();
      if (!fromEl || !to || reduce()) { setTimeout(() => FN.motion.bump(find())); return; }
      const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
      const ghost = fromEl.cloneNode(true);
      Object.assign(ghost.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 90, pointerEvents: 'none', borderRadius: '14px', boxShadow: 'var(--shadow-lift)' });
      document.body.appendChild(ghost);
      const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
      const anim = ghost.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(.55)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(.15)`, opacity: .2 }
      ], { duration: 620, easing: 'cubic-bezier(.45,.05,.55,.95)' });
      anim.onfinish = () => { ghost.remove(); FN.motion.bump(find()); };
    },
    bump(el) { if (!el || reduce()) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); },
    countUp(root = document) {
      root.querySelectorAll('[data-count]').forEach(el => {
        const to = parseFloat(el.dataset.count); const dec = +(el.dataset.dec || 0); const pre = el.dataset.pre || ''; const suf = el.dataset.suf || '';
        if (reduce()) { el.textContent = pre + to.toFixed(dec) + suf; return; }
        const t0 = performance.now(), dur = 900;
        const step = t => { const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); el.textContent = pre + (to * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
    }
  };
})();
