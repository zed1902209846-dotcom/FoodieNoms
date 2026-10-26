/* Router, app shells (auth / student / vendor), event delegation and the launch animation. */
window.FN = window.FN || {};
(function () {
  const { ic, esc, c, sel } = FN;
  const S = FN.state;
  const app = document.getElementById('app');
  document.body.insertAdjacentHTML('afterbegin', FN.iconSprite);
  try { const t = localStorage.getItem('foodienoms:theme'); if (t && t !== 'system') document.documentElement.setAttribute('data-theme', t); } catch (e) { }

  /* ---------- routes ---------- */
  const R = [
    ['welcome', 'welcome', () => FN.auth.welcome(), 'guest'],
    ['login', 'login', () => FN.auth.login(), 'guest'],
    ['signup/student', 'signup', () => FN.auth.signupStudent(), 'guest'],
    ['signup/vendor', 'signupv', () => FN.auth.signupVendor(), 'guest'],
    ['signup/vendor/2', 'signupv2', () => FN.auth.signupVendor2(), 'guest'],
    ['home', 'home', p => FN.student.home(p), 'student'],
    ['deals', 'deals', p => FN.student.deals(p), 'student'],
    ['vendor/:id', 'vendor', p => FN.student.vendor(p), 'student'],
    ['food/:id', 'food', p => FN.student.food(p), 'student'],
    ['live-food/:id', 'live-food', p => FN.student.liveFood(p), 'student'],
    ['basket', 'basket', p => FN.student.basket(p), 'student'],
    ['pay', 'pay', p => FN.student.pay(p), 'student'],
    ['pay/processing', 'processing', p => FN.student.processing(p), 'student'],
    ['pay/failed', 'failed', p => FN.student.failed(p), 'student'],
    ['confirmed/:id', 'confirmed', p => FN.student.confirmed(p), 'student'],
    ['orders', 'orders', p => FN.student.orders(p), 'student'],
    ['order/:id', 'order', p => FN.student.order(p), 'student'],
    ['impact', 'impact', p => FN.student.impact(p), 'student'],
    ['notifications', 'notifications', p => FN.student.notifications(p), 'student'],
    ['saved', 'saved', p => FN.student.saved(p), 'student'],
    ['reviews/:id', 'reviews', p => FN.student.reviews(p), 'student'],
    ['review/:id', 'review', p => FN.student.review(p), 'student'],
    ['profile', 'profile', p => FN.student.profile(p), 'student'],
    ['settings', 'settings', p => FN.student.settings(p), 'student'],
    ['v/home', 'vhome', p => FN.vendor.home(p), 'vendor'],
    ['v/listings', 'vlistings', p => FN.vendor.listings(p), 'vendor'],
    ['v/listings/new', 'vnew', p => FN.vendor.listingNew(p), 'vendor'],
    ['v/listing/:id', 'vedit', p => FN.vendor.listingEdit(p), 'vendor'],
    ['v/reservations', 'vres', p => FN.vendor.reservations(p), 'vendor'],
    ['v/verify', 'verify', p => FN.vendor.verify(p), 'vendor'],
    ['v/verify/:id', 'verify', p => FN.vendor.verify(p), 'vendor'],
    ['v/store', 'vstore', p => FN.vendor.store(p), 'vendor'],
    ['v/reviews', 'vreviews', p => FN.vendor.reviews(p), 'vendor'],
    ['v/notifications', 'vnotif', p => FN.vendor.notifications(p), 'vendor']
  ];
  function match(path) {
    const parts = path.split('/');
    for (const [pat, name, fn, guard] of R) {
      const pp = pat.split('/'); if (pp.length !== parts.length) continue;
      const params = {}; let ok = true;
      pp.forEach((seg, i) => { if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(parts[i]); else if (seg !== parts[i]) ok = false; });
      if (ok) return { path, name, fn, guard, params };
    }
    return null;
  }
  const homeFor = () => !S.session ? 'welcome' : S.session.role === 'vendor' ? 'v/home' : 'home';

  FN.route = { name: '' };
  const stack = [];
  FN.go = function (path, { replace = false, reset = false } = {}) {
    if (reset) stack.length = 0; else if (!replace && FN.route.path && FN.route.path !== path) stack.push(FN.route.path);
    if (stack.length > 40) stack.shift();
    FN.overlay.close();
    navigate(path, true);
  };
  FN.back = function () { const p = stack.pop(); navigate(p || homeFor(), true, true); };
  FN.redirect = path => { setTimeout(() => FN.go(path, { replace: true })); return { shell: 'bare', html: '' }; };
  FN.notFound = () => ({ shell: S.session && S.session.role === 'vendor' ? 'vendor' : 'student', html: `<div class="content">${c.empty({ title: 'This page has moved', body: 'The item may have sold out or been removed by the vendor.', actions: `<button class="btn btn-primary" data-go="${homeFor()}">Go home</button>` })}</div>` });

  function navigate(path, animate, isBack = false) {
    let m = match(path) || match(homeFor());
    if (m.guard !== 'guest' && (!S.session || S.session.role !== m.guard)) m = match(homeFor());
    if (m.guard === 'guest' && S.session) m = match(homeFor());
    FN.route = { name: m.name, path: m.path, params: m.params, fn: m.fn };
    try { const h = '#/' + m.path; if (location.hash !== h) history.replaceState(null, '', h); } catch (e) { }
    FN.render(false, animate, isBack);
  }

  /* ---------- shells ---------- */
  function topnav() {
    const n = sel.unread('u1'); const cnt = sel.basketCount(); const cur = FN.route.name;
    const link = (g, l, names) => `<button class="tn-link ${names.includes(cur) ? 'is-on' : ''}" data-go="${g}">${l}</button>`;
    return `<header class="topnav d-only"><div class="tn-inner">
      <button data-go="home" aria-label="FoodieNoms home">${c.lockup(false, 26)}</button>
      <div class="input search tn-search">${ic('search', 'ic-m')}<input id="top-q" type="search" data-input="top-q" value="${esc(S.filters.q)}" placeholder="Search food or vendor" aria-label="Search food or vendor" autocomplete="off"></div>
      <nav class="tn-links">${link('home', 'Home', ['home'])}${link('deals', 'Deals', ['deals', 'vendor', 'food', 'live-food'])}${link('orders', 'Orders', ['orders', 'order', 'confirmed', 'review'])}${link('saved', 'Saved', ['saved'])}${link('impact', 'Impact', ['impact'])}</nav>
      <button class="icon-btn topnav-basket" data-go="basket" aria-label="Basket, ${cnt} items">${ic('bag', 'ic-l')}${cnt ? `<span class="tn-count num">${cnt}</span>` : ''}</button>
      <button class="icon-btn" data-go="notifications" aria-label="Notifications">${ic('bell', 'ic-l')}${n ? '<span class="dot"></span>' : ''}</button>
      <button data-go="profile" aria-label="My profile">${c.avatar(sel.me().name, true)}</button>
    </div></header>`;
  }
  function sidenav(v) {
    const cur = FN.route.path; const n = sel.unread(v.id);
    const item = (i, l, g, extra = '') => `<button class="nav-item ${cur && cur.startsWith(g) ? 'is-on' : ''}" data-go="${g}">${ic(i, 'ic-l')}<span class="grow">${l}</span>${extra}</button>`;
    const pending = (FN.ui.liveVendorReservations || []).filter(r => r.status === 'reserved').length;
    return `<aside class="sidenav d-only" aria-label="Vendor menu">
      <div class="sn-brand">${c.lockup(true, 24)}</div>
      <div class="sn-store"><b>${esc(v.name)}</b><span>${v.accepting ? 'Accepting reservations' : 'Reservations paused'}</span></div>
      ${item('home', 'Dashboard', 'v/home')}${item('list', 'Listings', 'v/listing')}${item('receipt', 'Reservations', 'v/reservations', pending ? `<span class="badge badge-solid">${pending}</span>` : '')}${item('qr', 'Verify pickup', 'v/verify')}${item('star', 'Reviews', 'v/reviews')}${item('store', 'Store profile', 'v/store')}${item('bell', 'Notifications', 'v/notifications', n ? `<span class="badge badge-solid">${n}</span>` : '')}
      <button class="nav-item mt-auto" data-act="logout">${ic('logout', 'ic-l')}<span>Log out</span></button>
    </aside>`;
  }
  function tabbar(v) {
    const cur = FN.route.path || ''; const pending = (FN.ui.liveVendorReservations || []).filter(r => r.status === 'reserved').length;
    const t = (i, l, g, on, extra = '') => `<button class="${on ? 'is-on' : ''}" data-go="${g}" aria-current="${on ? 'page' : 'false'}"><span class="pill">${ic(i, 'ic-l')}${extra}</span>${l}</button>`;
    return `<nav class="tabbar m-only" aria-label="Vendor navigation">${t('home', 'Home', 'v/home', cur === 'v/home')}${t('list', 'Listings', 'v/listings', cur.startsWith('v/listing'))}${t('receipt', 'Orders', 'v/reservations', cur.startsWith('v/reservations') || cur.startsWith('v/verify'), pending ? `<span class="count">${pending}</span>` : '')}${t('store', 'Store', 'v/store', ['v/store', 'v/reviews', 'v/notifications'].includes(cur))}</nav>`;
  }

  const STUDENT_TABS = ['home', 'deals', 'orders', 'saved', 'profile'];
  function studentTabbar() {
    const cur = FN.route.path || '';
    const t = (i, l, g) => { const on = cur === g; return `<button class="${on ? 'is-on' : ''}" data-go="${g}" aria-current="${on ? 'page' : 'false'}"><span class="pill">${ic(i, 'ic-l')}</span>${l}</button>`; };
    return `<nav class="tabbar m-only" aria-label="Student navigation">${t('home', 'Home', 'home')}${t('tag', 'Deals', 'deals')}${t('receipt', 'Orders', 'orders')}${t('bookmark', 'Saved', 'saved')}${t('user', 'Profile', 'profile')}</nav>`;
  }

  FN.render = function (keepScroll = false, animate = false, isBack = false) {
    if (!FN.route.fn) return;
    const y = window.scrollY;
    const view = FN.route.fn(FN.route.params || {});
    if (!view) return;
    const hasBar = /class="actionbar/.test(view.html);
    let html;
    if (view.shell === 'student') { const tabs = !hasBar && STUDENT_TABS.includes(FN.route.path); html = `<div class="shell student">${topnav()}<main class="screen ${hasBar ? 'has-actionbar' : ''} ${tabs ? 'has-tabbar' : ''}" id="screen">${view.html}</main>${tabs ? studentTabbar() : ''}</div>`; }
    else if (view.shell === 'vendor') { const v = sel.myVendor(); const tabs = !hasBar; html = `<div class="shell vendor">${sidenav(v)}<main class="screen ${hasBar ? 'has-actionbar' : ''} ${tabs ? 'has-tabbar' : ''}" id="screen">${view.html}</main>${tabs ? tabbar(v) : ''}</div>`; }
    else if (view.shell === 'auth') html = `<div class="shell auth-shell">${view.html}</div>`;
    else html = `<div class="shell bare">${view.html}</div>`;
    app.innerHTML = html;
    const scr = document.getElementById('screen') || app.firstElementChild;
    if (animate && scr && !FN.reduceMotion()) { scr.classList.add(isBack ? 'view-back' : 'view-in'); }
    window.scrollTo(0, keepScroll ? y : 0);
    view.after && view.after(app);
    onScroll();
    if (animate) { const h = app.querySelector('h1'); document.title = (h && h.textContent.trim() ? h.textContent.trim() + ' · ' : '') + 'FoodieNoms'; }
  };

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act], [data-go], [data-back]');
    if (!t || t.closest('[disabled]') || t.getAttribute('aria-disabled') === 'true') return;
    if (t.matches('a[href^="http"]')) return;
    if (t.hasAttribute('data-back')) { e.preventDefault(); return FN.back(); }
    if (t.dataset.act) {
      const a = t.dataset.act;
      if (a === 'close-overlay') { if (e.target.closest('.sheet, .dialog, .drawer') && !t.matches('button')) return; FN.overlay.close(); return; }
      if (a === 'dialog-ok') { const cb = FN.overlay._ok; FN.overlay._ok = null; FN.overlay.close(); cb && cb(); return; }
      if (FN.on[a]) { e.preventDefault(); FN.on[a](t, e); }
      return;
    }
    if (t.dataset.go) { e.preventDefault(); if (t.hasAttribute('data-close')) FN.overlay.close(); FN.go(t.dataset.go, { reset: t.hasAttribute('data-reset') }); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && FN.overlay.isOpen()) FN.overlay.close();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="link"][data-go]')) { e.preventDefault(); FN.go(e.target.dataset.go); }
  });
  document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.input; if (k && FN.onInput[k]) FN.onInput[k](e.target, e); });
  document.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.input; if (k && e.target.type === 'file' && FN.onInput[k]) FN.onInput[k](e.target, e); });
  document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault(); const h = FN.onSubmit[f.dataset.form]; h && h(f, e); });
  function onScroll() { const b = document.querySelector('.appbar'); if (b) b.classList.toggle('scrolled', window.scrollY > 4); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('offline', () => { FN.toast('You’re offline. Showing saved data.', { icon: 'alert' }); if (FN.route.name === 'deals') FN.render(true); });
  window.addEventListener('online', () => { FN.toast('Back online', { icon: 'check' }); if (FN.route.name === 'deals') FN.render(true); });
  window.addEventListener('hashchange', () => { const p = location.hash.replace(/^#\/?/, ''); if (p && p !== FN.route.path) FN.go(p); });

  /* ---------- launch animation ---------- */
  let splashDone = null;
  FN.playSplash = function (done) {
    splashDone = done;
    const host = document.createElement('div'); host.id = 'splash-host'; host.innerHTML = FN.splashHTML();
    document.body.appendChild(host);
    const el = host.firstElementChild;
    const imgs = [...el.querySelectorAll('img')];
    Promise.all(imgs.map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => {
      el.classList.add('go');
      FN._splashT = setTimeout(FN.endSplash, FN.reduceMotion() ? 700 : 2700);
    });
  };
  FN.endSplash = function () {
    const host = document.getElementById('splash-host'); if (!host) return;
    clearTimeout(FN._splashT); host.firstElementChild.classList.add('out');
    const cb = splashDone; splashDone = null; cb && cb();
    setTimeout(() => host.remove(), 380);
  };

  /* ---------- boot ---------- */
  const start = (location.hash || '').replace(/^#\/?/, '');
  const target = start && match(start) ? start : homeFor();
  FN.playSplash(() => navigate(target, true));
})();
