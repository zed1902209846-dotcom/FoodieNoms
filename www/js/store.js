/* App state, persistence, selectors and actions. No framework: state is a plain object,
   every action mutates it, saves it, and asks the app to re-render. */
window.FN = window.FN || {};
(function () {
  const KEY = 'foodienoms:prototype';
  const NOW = new Date(FN.DEMO_NOW);
  const NOW_MIN = NOW.getHours() * 60 + NOW.getMinutes();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.db && s.db.version === FN.seed().version) return s;
      }
    } catch (e) { /* storage unavailable: start fresh */ }
    return fresh();
  }
  function fresh() {
    return { db: FN.seed(), session: null, basket: { vendorId: null, items: {}, slot: null }, filters: { q: '', cats: [], price: null, sort: 'nearest', vendor: '' }, pay: { method: 'ewallet', outcome: 'success' } };
  }
  const S = load();
  FN.state = S;
  FN.save = function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
  FN.resetDemo = function () { const f = fresh(); Object.keys(S).forEach(k => delete S[k]); Object.assign(S, f); FN.save(); };

  /* ---------- time ---------- */
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const fromMin = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  /* 4-digit pickup code derived from the reservation id, so student and vendor see the same code without a new Firestore field */
  FN.pickupCode = id => { let h = 0; for (const ch of String(id || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return String(1000 + h % 9000); };

  FN.time = {
    now: NOW, nowMin: NOW_MIN, toMin, fromMin,
    fmt(t) { const m = typeof t === 'number' ? t : toMin(t); let h = Math.floor(m / 60); const mm = String(m % 60).padStart(2, '0'); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${mm} ${ap}`; },
    range(a, b) { if (!a || !b) return 'time to be confirmed'; return `${FN.time.fmt(a)} – ${FN.time.fmt(b)}`; },
    slotRange(s) { return FN.time.range(s, toMin(s) + 15); },
    left(close) { const d = toMin(close) - NOW_MIN; if (d <= 0) return 'Closed'; if (d < 60) return `${d} min left`; const h = d / 60; return `${Number.isInteger(h) ? h : h.toFixed(1)} hr left`; },
    isToday(iso) { const d = new Date(iso); return d.toDateString() === NOW.toDateString(); },
    dayLabel(iso) {
      const d = new Date(iso); const diff = Math.round((new Date(NOW.toDateString()) - new Date(d.toDateString())) / 864e5);
      if (diff === 0) return 'Today'; if (diff === 1) return 'Yesterday'; if (diff < 7) return `${diff} days ago`;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    },
    clock(iso) { const d = new Date(iso); return FN.time.fmt(d.getHours() * 60 + d.getMinutes()); }
  };

  /* ---------- selectors ---------- */
  const db = () => S.db;
  const sel = FN.sel = {
    user() { return S.session ? db().users.find(u => u.id === S.session.userId) : null; },
    me() { return db().users.find(u => u.id === 'u1'); },
    vendor(id) { return db().vendors.find(v => v.id === id); },
    myVendor() { const u = sel.user(); return u && u.vendorId ? sel.vendor(u.vendorId) : null; },
    listing(id) { return db().listings.find(l => l.id === id); },
    listingsOf(vid, all = false) { return db().listings.filter(l => l.vendorId === vid && (all || (l.visible && l.left > 0))); },
    pct(l) { return Math.round((1 - l.price / l.orig) * 100); },
    maxPct(vid) { const ls = sel.listingsOf(vid); return ls.length ? Math.max(...ls.map(sel.pct)) : 0; },
    rating(vid) {
      const v = sel.vendor(vid); const added = db().reviews.filter(r => r.vendorId === vid && r.added);
      const count = v.ratingCount + added.length;
      const avg = count ? (v.ratingBase * v.ratingCount + added.reduce((a, r) => a + r.stars, 0)) / count : 0;
      return { avg: Math.round(avg * 10) / 10, count };
    },
    reviewsOf(vid) { return db().reviews.filter(r => r.vendorId === vid).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    order(id) { return db().orders.find(o => o.id === id); },
    myOrders() { return db().orders.filter(o => o.userId === 'u1').sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    vendorOrders(vid) { return db().orders.filter(o => o.vendorId === vid).sort((a, b) => a.slot.localeCompare(b.slot)); },
    total(o) { return o.items.reduce((a, i) => a + i.price * i.qty, 0); },
    origTotal(o) { return o.items.reduce((a, i) => a + i.orig * i.qty, 0); },
    itemsText(o) { return o.items.map(i => `${i.qty} × ${i.name}`).join(', '); },
    isActive(o) { return o.status === 'paid' || o.status === 'ready'; },
    impact(period = 'month') {
      const inPeriod = o => {
        const d = new Date(o.createdAt);
        if (period === 'day') return d.toDateString() === NOW.toDateString();
        if (period === 'month') return d.getMonth() === NOW.getMonth() && d.getFullYear() === NOW.getFullYear();
        if (period === 'year') return d.getFullYear() === NOW.getFullYear();
        return true;
      };
      const os = db().orders.filter(o => o.userId === 'u1' && o.status !== 'cancelled' && inPeriod(o));
      const saved = os.reduce((a, o) => a + sel.origTotal(o) - sel.total(o), 0);
      const meals = os.reduce((a, o) => a + o.items.reduce((b, i) => b + i.qty, 0), 0);
      return { saved, meals, co2: meals * FN.CO2_PER_MEAL_KG, orders: os.length };
    },
    leaderboard() {
      const me = { name: 'You', meals: sel.impact('month').meals, me: true };
      return [...db().leaderboard, me].sort((a, b) => b.meals - a.meals).map((r, i) => ({ ...r, rank: i + 1 }));
    },
    notifs(to) { return db().notifications.filter(n => n.to === to).sort((a, b) => b.at.localeCompare(a.at)); },
    unread(to) { return db().notifications.filter(n => n.to === to && !n.read).length; },
    basketCount() { return Object.values(S.basket.items).reduce((a, b) => a + b, 0); },
    basketLines() { return Object.entries(S.basket.items).map(([id, qty]) => ({ l: sel.listing(id), qty })).filter(x => x.l); },
    basketTotals() {
      const lines = sel.basketLines();
      const total = lines.reduce((a, x) => a + x.l.price * x.qty, 0); const orig = lines.reduce((a, x) => a + x.l.orig * x.qty, 0);
      return { total, orig, saved: orig - total, meals: lines.reduce((a, x) => a + x.qty, 0) };
    },
    slots(vid) {
      const lines = sel.basketLines();
      const ls = lines.length ? lines.map(x => x.l) : sel.listingsOf(vid);
      if (!ls.length) return [];
      const start = Math.max(...ls.map(l => toMin(l.from))); const end = Math.min(...ls.map(l => toMin(l.to)));
      const out = [];
      for (let m = start; m + 15 <= end; m += 15) {
        const s = fromMin(m);
        const taken = db().orders.filter(o => o.vendorId === vid && o.slot === s && FN.time.isToday(o.createdAt) && sel.isActive(o)).length;
        out.push({ s, past: m + 15 <= NOW_MIN + 5, full: taken >= 3, last: m + 30 > end });
      }
      return out;
    },
    defaultSlot(vid) { const s = sel.slots(vid).find(x => !x.past && !x.full); return s ? s.s : null; },
    dealsList() {
      const f = S.filters; const q = (f.q || '').trim().toLowerCase(); const vq = (f.vendor || '').trim().toLowerCase();
      const band = FN.PRICE_BANDS.find(b => b.id === f.price);
      let vs = db().vendors.filter(v => v.accepting && FN.time.toMin(v.closes) > NOW_MIN).map(v => {
        let ls = sel.listingsOf(v.id);
        if (f.cats.length) ls = ls.filter(l => f.cats.includes(l.cat));
        if (band) ls = ls.filter(l => l.price >= band.min && l.price <= band.max);
        if (q) { const vm = v.name.toLowerCase().includes(q); ls = vm ? ls : ls.filter(l => l.name.toLowerCase().includes(q)); }
        return { v, ls };
      }).filter(x => x.ls.length && (!vq || x.v.name.toLowerCase().includes(vq)));
      const key = { nearest: x => x.v.walk, discount: x => -sel.maxPct(x.v.id), closing: x => FN.time.toMin(x.v.closes) }[f.sort] || (x => x.v.walk);
      return vs.sort((a, b) => key(a) - key(b));
    },
    filterCount() { const f = S.filters; return f.cats.length + (f.price ? 1 : 0) + (f.vendor ? 1 : 0) + (f.sort !== 'nearest' ? 1 : 0); }
  };

  /* ---------- actions ---------- */
  const notify = (to, n) => db().notifications.push({ id: 'n' + Date.now() + Math.random().toString(16).slice(2, 6), to, read: false, at: new Date(NOW.getTime() + (Date.now() % 60000)).toISOString(), ...n });
  const nextOrderId = () => 'FN-' + (Math.max(...db().orders.map(o => +o.id.slice(3))) + 1);
  const code4 = () => String(Math.floor(1000 + Math.random() * 9000));

  FN.act = {
    login(role) {
      S.session = { role, userId: role === 'vendor' ? 'u2' : 'u1' };
      FN.save();
    },
    logout() { S.session = null; FN.save(); },
    signupStudent(d) {
      const me = sel.me(); Object.assign(me, { name: d.name, email: d.email, campus: d.campus });
      S.session = { role: 'student', userId: 'u1' }; FN.save();
    },
    signupVendor(d) {
      const id = 'v' + (db().vendors.length + 1);
      db().vendors.push({ id, name: d.name, cat: d.cat, ratingBase: 0, ratingCount: 0, area: d.address, walk: 8, opens: d.opens, closes: d.closes, phone: d.phone, email: d.email, accepting: true, img: null, rescued: 0, recovered: 0 });
      const uid = 'u' + (db().users.length + 10);
      db().users.push({ id: uid, role: 'vendor', vendorId: id, name: d.name, email: d.email });
      S.session = { role: 'vendor', userId: uid }; FN.save();
    },
    addToBasket(lid, qty = 1) {
      const l = sel.listing(lid); const b = S.basket;
      if (b.vendorId && b.vendorId !== l.vendorId && sel.basketCount()) return { conflict: true };
      if (b.vendorId !== l.vendorId) { b.vendorId = l.vendorId; b.items = {}; b.slot = null; }
      const cur = b.items[lid] || 0; const n = Math.min(l.left, cur + qty);
      if (n === cur) return { max: true };
      b.items[lid] = n; if (!b.slot) b.slot = sel.defaultSlot(l.vendorId);
      FN.save(); return { ok: true };
    },
    setQty(lid, q) {
      const l = sel.listing(lid); const b = S.basket;
      if (q <= 0) delete b.items[lid]; else b.items[lid] = Math.min(q, l.left);
      if (!sel.basketCount()) { b.vendorId = null; b.slot = null; }
      FN.save();
    },
    clearBasket() { S.basket = { vendorId: null, items: {}, slot: null }; FN.save(); },
    setSlot(s) { S.basket.slot = s; FN.save(); },
    toggleSaved(vid) { const s = db().saved; const i = s.indexOf(vid); if (i >= 0) s.splice(i, 1); else s.push(vid); FN.save(); return i < 0; },
    placeOrder() {
      const b = S.basket; const lines = sel.basketLines(); const v = sel.vendor(b.vendorId);
      const methodName = { ewallet: 'E-wallet', banking: 'Online banking', card: 'Debit / credit card' }[S.pay.method];
      const o = { id: nextOrderId(), userId: 'u1', student: sel.me().name, vendorId: b.vendorId, items: lines.map(x => ({ listingId: x.l.id, name: x.l.name, qty: x.qty, price: x.l.price, orig: x.l.orig })), slot: b.slot, status: 'paid', code: code4(), method: methodName, createdAt: new Date(NOW.getTime() + 60000).toISOString(), rated: false };
      lines.forEach(x => { x.l.left = Math.max(0, x.l.left - x.qty); });
      db().orders.push(o);
      notify('u1', { kind: 'order', icon: 'check', title: 'Payment confirmed', body: `Order #${o.id} · RM${sel.total(o).toFixed(2)} (test mode).`, link: 'order/' + o.id });
      notify(v.id, { kind: 'order', icon: 'receipt', title: 'New reservation', body: `${o.student} reserved ${sel.itemsText(o)} for ${FN.time.fmt(o.slot)}.`, link: 'v/reservations' });
      FN.act.clearBasket(); FN.save(); return o;
    },
    cancelOrder(id) {
      const o = sel.order(id); if (!o || !sel.isActive(o)) return;
      o.status = 'cancelled'; o.items.forEach(i => { const l = sel.listing(i.listingId); if (l) l.left += i.qty; });
      notify(o.vendorId, { kind: 'order', icon: 'x', title: 'Reservation cancelled', body: `${o.student} cancelled #${o.id}. Stock returned to your listing.`, link: 'v/reservations' });
      FN.save();
    },
    submitReview(orderId, stars, tags, text) {
      const o = sel.order(orderId);
      db().reviews.push({ id: 'r' + Date.now(), vendorId: o.vendorId, author: sel.me().name, stars, tags, text, createdAt: NOW.toISOString(), reply: '', added: true, mine: true });
      o.rated = true;
      notify(o.vendorId, { kind: 'review', icon: 'star', title: `New ${stars}-star review`, body: `${o.student} reviewed ${o.items[0].name}.`, link: 'v/reviews' });
      FN.save();
    },
    readNotif(id) { const n = db().notifications.find(x => x.id === id); if (n) n.read = true; FN.save(); },
    readAll(to) { db().notifications.forEach(n => { if (n.to === to) n.read = true; }); FN.save(); },
    setting(k, v) { db().settings[k] = v; FN.save(); },
    // vendor
    toggleAccepting(vid) { const v = sel.vendor(vid); v.accepting = !v.accepting; FN.save(); return v.accepting; },
    saveListing(vid, d, id) {
      if (id) { Object.assign(sel.listing(id), d); }
      else {
        id = 'l' + (Math.max(...db().listings.map(l => +l.id.slice(1))) + 1);
        db().listings.push({ id, vendorId: vid, visible: true, img: null, ...d });
        db().saved.includes(vid) && notify('u1', { kind: 'deal', icon: 'heart', title: `Saved shop update`, body: `${sel.vendor(vid).name} listed ${d.name} at ${Math.round((1 - d.price / d.orig) * 100)}% off.`, link: 'vendor/' + vid });
      }
      FN.save(); return id;
    },
    toggleVisible(id) { const l = sel.listing(id); l.visible = !l.visible; FN.save(); return l.visible; },
    soldOut(id) { sel.listing(id).left = 0; FN.save(); },
    deleteListing(id) { const i = db().listings.findIndex(l => l.id === id); if (i >= 0) db().listings.splice(i, 1); FN.save(); },
    markReady(id) {
      const o = sel.order(id); o.status = 'ready';
      notify(o.userId, { kind: 'order', icon: 'bag', title: 'Ready for pickup', body: `Your ${sel.itemsText(o)} at ${sel.vendor(o.vendorId).name} is ready. Collect by ${FN.time.fmt(FN.time.toMin(o.slot) + 15)}.`, link: 'order/' + o.id });
      FN.save();
    },
    collect(id) {
      const o = sel.order(id); o.status = 'collected'; o.collectedAt = NOW.toISOString();
      const v = sel.vendor(o.vendorId); v.rescued = (v.rescued || 0) + o.items.reduce((a, i) => a + i.qty, 0); v.recovered = (v.recovered || 0) + sel.total(o);
      notify(o.userId, { kind: 'review', icon: 'star', title: `How was ${v.name}?`, body: 'Rate your pickup to help other students.', link: 'review/' + o.id });
      FN.save();
    },
    noShow(id) { const o = sel.order(id); o.status = 'noshow'; FN.save(); },
    reply(rid, text) { const r = db().reviews.find(x => x.id === rid); r.reply = text; FN.save(); },
    updateVendor(vid, d) { Object.assign(sel.vendor(vid), d); FN.save(); },
    updateMe(d) { Object.assign(sel.me(), d); FN.save(); }
  };
})();
