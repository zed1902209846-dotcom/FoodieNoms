/* Vendor screens: dashboard, listings, listing form, reservations, verify pickup, store profile, reviews, notifications. */
window.FN = window.FN || {};
(function () {
  const { ic, esc, rm, c, sel, act, time } = FN;
  const S = FN.state;
  const U = FN.ui = FN.ui || {};
  U.vListTab = U.vListTab || 'active';
  U.vResTab = U.vResTab || 'upcoming';

  const V = () => sel.myVendor();
  const liveListing = id => (U.liveVendorListings || []).find(listing => listing.id === id);
  const bell = () => { const v = V(); const n = v ? sel.unread(v.id) : 0; return `<button class="icon-btn m-only" data-go="v/notifications" aria-label="Notifications${n ? `, ${n} unread` : ''}">${ic('bell', 'ic-l')}${n ? '<span class="dot"></span>' : ''}</button>`; };
  const bar = ({ title = '', back = false, close = false, right = '', noBell = false, brand = false } = {}) => `<header class="appbar">
    <div class="side">${back ? `<button class="icon-btn" data-back aria-label="Back">${ic('back', 'ic-l')}</button>` : ''}${close ? `<button class="icon-btn" data-back aria-label="Close">${ic('x', 'ic-l')}</button>` : ''}</div>
    ${brand ? `<span class="brand m-only">${c.lockup(false, 24)}</span><h1 class="title d-only">${title}</h1>` : `<h1 class="title">${title}</h1>`}
    <div class="side r">${right}${noBell ? '' : bell()}</div></header>`;
  const todays = vid => sel.vendorOrders(vid).filter(o => time.isToday(o.createdAt));
  const listingPh = (l, h, w) => c.ph(l, { h, w });

  function resCard(o) {
    const lines = sel.itemsText(o);
    const actions = o.status === 'paid' ? `<button class="btn btn-ghost btn-sm" data-act="v-ready" data-id="${o.id}">Mark ready</button><button class="btn btn-primary btn-sm" data-go="v/verify/${o.id}">Verify pickup</button>`
      : o.status === 'ready' ? `<button class="btn btn-primary btn-sm" data-go="v/verify/${o.id}">Verify pickup</button><button class="btn btn-ghost btn-sm" data-act="v-noshow" data-id="${o.id}">No-show</button>` : '';
    return `<article class="card res-card">
      <div class="row" style="gap:12px">${c.avatar(o.student)}<div class="grow stack-s" style="gap:0"><b>${esc(o.student)}</b><span class="t-caption t-muted">${esc(lines)} · paid (test)</span></div><div class="stack-s" style="gap:0;align-items:flex-end"><b class="num">#${o.id}</b><span class="t-caption t-accent num">${rm(sel.total(o))}</span></div></div>
      ${actions ? `<div class="row res-actions">${actions}</div>` : `<div>${c.status(o)}</div>`}</article>`;
  }

  function loadVendorReservations() {
    const loaded = Array.isArray(U.liveVendorReservations);

    if (!loaded && !U.liveVendorReservationsLoading && FN.loadVendorReservations) {
      U.liveVendorReservationsLoading = true;

      FN.loadVendorReservations()
        .then((reservations) => {
          U.liveVendorReservations = reservations;
          U.liveVendorReservationsError = null;
        })
        .catch((error) => {
          console.error('Failed to load vendor reservations:', error);
          U.liveVendorReservations = [];
          U.liveVendorReservationsError = error;
        })
        .finally(() => {
          U.liveVendorReservationsLoading = false;

          if (FN.route.name === 'vres' || FN.route.name === 'vhome' || FN.route.name === 'verify') {
            FN.render(true);
          }
        });
    }

    return {
      loaded,
      reservations: U.liveVendorReservations || [],
      error: U.liveVendorReservationsError
    };
  }

  function loadVendorListings() {
    const loaded = Array.isArray(U.liveVendorListings);

    if (!loaded && !U.liveVendorListingsLoading && FN.loadVendorListings) {
      U.liveVendorListingsLoading = true;

      FN.loadVendorListings()
        .then((listings) => {
          U.liveVendorListings = listings;
          U.liveVendorListingsError = null;
        })
        .catch((error) => {
          console.error('Failed to load vendor listings:', error);
          U.liveVendorListings = [];
          U.liveVendorListingsError = error;
        })
        .finally(() => {
          U.liveVendorListingsLoading = false;

          if (FN.route.name === 'vhome' || FN.route.name === 'vlistings') {
            FN.render(true);
          }
        });
    }

    return {
      loaded,
      listings: U.liveVendorListings || [],
      error: U.liveVendorListingsError
    };
  }

  function liveReservationCard(reservation) {
    const collected = reservation.status === 'collected';

    return `<article class="card res-card">
      <div class="row" style="gap:12px">
        ${c.avatar(reservation.studentName || 'Student')}
        <div class="grow stack-s" style="gap:2px">
          <div class="row between"><b>${esc(reservation.studentName || 'Student')}</b>${c.badge(collected ? 'done' : 'pending', collected ? 'Collected' : 'Reserved')}</div>
          <span class="t-caption t-muted">${esc(reservation.listingName)} · ${rm(reservation.unitPrice)} · 1 portion</span>
          ${c.meta('clock', `Pickup ${time.range(reservation.pickupFrom, reservation.pickupTo)}`)}
        </div>
      </div>
      ${collected
        ? `<span class="meta" style="color:var(--success)">${ic('check', 'ic-s')} Collected</span>`
        : `<button class="btn btn-primary btn-block" data-go="v/verify/${esc(reservation.id)}">${ic('qr', 'ic-m')} Verify pickup code</button>`}
    </article>`;
  }

  function listingForm(l) {
    const d = U.lf;
    const pct = d.orig > 0 && d.price > 0 && d.price < d.orig ? Math.round((1 - d.price / d.orig) * 100) : null;
    return `<form class="content narrow" data-form="listing" novalidate>
      <label class="upload" for="lf-photo">${d.img ? `<img src="${d.img}" alt="Food photo preview">` : `<span class="ibox sunk lg">${ic('camera', 'ic-l')}</span><b>Add food photo</b><span class="t-caption t-muted">A real photo builds trust · JPG or PNG</span>`}<input id="lf-photo" type="file" accept="image/*" data-input="lf-photo" class="sr-only"></label>
      ${c.field({ id: 'lf-name', label: 'Food name', value: d.name, ph: 'e.g. Butter croissant', icon: 'tag', err: 'Give the food a name students will recognise' })}
      <div class="field"><span class="field-label">Category</span><div class="chips">${FN.CATEGORIES.map(x => `<button type="button" class="chip ${d.cat === x ? 'is-on' : ''}" data-act="lf-cat" data-v="${x}">${x}</button>`).join('')}</div></div>
      <div class="two">
        ${c.field({ id: 'lf-orig', label: 'Original price', type: 'number', value: d.orig || '', ph: '10.00', pre: 'RM', err: 'Enter the normal price', attrs: 'inputmode="decimal" step="0.10" min="0" data-input="lf-price"' })}
        ${c.field({ id: 'lf-price', label: 'Surplus price', type: 'number', value: d.price || '', ph: '5.00', pre: 'RM', err: 'Must be lower than the original price', attrs: 'inputmode="decimal" step="0.10" min="0" data-input="lf-price"' })}
      </div>
      <span class="meta" id="lf-pct" style="color:var(--accent-text)">${ic('tag', 'ic-s')}<span>${pct ? `Students see ${pct}% OFF${pct < 20 ? ' · most students look for 20–60% off' : ''}` : 'Discount shows here once both prices are set'}</span></span>
      <div class="row" style="gap:12px"><div class="grow stack-s" style="gap:0"><b>${l ? 'Portions left' : 'Quantity available'}</b><span class="t-caption t-muted">${l ? 'Update the portions still available to students.' : 'Portions you can sell today'}</span></div>${c.stepper('lf', d.left, 99, 'lf-qty')}</div>
      <div class="two">${c.field({ id: 'lf-from', label: 'Collect from', type: 'time', value: d.from, icon: 'clock' })}${c.field({ id: 'lf-to', label: 'Until', type: 'time', value: d.to, icon: 'clock', err: 'Must be after the start time' })}</div>
      <div class="field"><label for="lf-desc">Description</label><div class="input area"><textarea id="lf-desc" maxlength="200" placeholder="What is it, when was it made, how to store it">${esc(d.desc)}</textarea></div></div>
      ${l ? `<section class="card" style="gap:12px"><div class="row" style="gap:12px"><div class="grow stack-s" style="gap:0"><b>Show to students</b><span class="t-caption t-muted">Turn off to pause without deleting. Existing reservations stay valid.</span></div>${c.toggle(l.visible, 'lf-visible', `data-id="${l.id}"`, 'Show to students')}</div></section>
      <p class="t-caption t-muted">Turn off “Show to students” to take this listing down. It will remain in your Hidden tab and existing reservations stay valid.</p>` : ''}
      <button class="btn btn-primary btn-block d-only" type="submit">${l ? 'Save changes' : 'Publish listing'}</button>
    </form>
    <div class="actionbar m-only"><button class="btn btn-primary btn-block" data-act="lf-submit">${l ? 'Save changes' : 'Publish listing'}</button></div>`;
  }

  FN.vendor = {
    home() {
      const v = V();
      const listingState = loadVendorListings();
      const reservationState = loadVendorReservations();
      const ls = listingState.listings;
      const os = reservationState.reservations;
      const active = os.filter((reservation) => reservation.status !== 'collected');
      const live = ls.filter(l => l.visible && l.left > 0);
      const earned = os.filter((reservation) => reservation.status !== 'cancelled').reduce((sum, reservation) => sum + Number(reservation.unitPrice || 0), 0);
      const meals = os.filter((reservation) => reservation.status === 'collected').reduce((sum, reservation) => sum + Number(reservation.quantity || 0), 0);
      const ending = live.slice().sort((a, b) => String(a.to || '').localeCompare(String(b.to || '')) || a.left - b.left).slice(0, 3);
      const stat = (i, val, l, count = '') => `<div class="card stat-card">${ic(i, 'ic-m t-brand')}<span class="t-display num" ${count}>${val}</span><span class="t-small t-muted">${l}</span></div>`;
      return { shell: 'vendor', nav: 'v/home', html: `${bar({ brand: true, title: 'Dashboard' })}
      <div class="content">
        <div class="row v-head" style="gap:12px">${c.ph({ cat: v.cat, name: v.name }, { w: 56, h: 56 })}<div class="grow stack-s" style="gap:0"><h1 class="t-h1">${esc(v.name)}</h1>${c.meta('clock', `${time.toMin(v.closes) > time.nowMin ? 'Open' : 'Closed'} · closes ${time.fmt(v.closes)}`)}</div><button class="btn btn-accent d-only" data-go="v/listings/new">${ic('plus', 'ic-m')}List surplus food</button></div>
        <section class="card row accepting ${v.accepting ? 'on' : ''}" style="flex-direction:row;gap:12px"><div class="grow stack-s" style="gap:0"><b>${v.accepting ? 'Accepting reservations' : 'Reservations paused'}</b><span class="t-caption t-muted">${v.accepting ? 'Students can reserve your listings now' : 'Your listings are hidden from students'}</span></div>${c.toggle(v.accepting, 'v-accepting', '', 'Accept reservations')}</section>
        <div class="stat-grid">${stat('bag', live.length, 'Items listed now')}${stat('receipt', os.filter(o => o.status !== 'cancelled').length, 'Reservations today')}${stat('wallet', rm(earned), 'Earned today (test)', `data-count="${earned.toFixed(2)}" data-dec="2" data-pre="RM"`)}${stat('meal', meals, 'Meals rescued today')}</div>
        <button class="btn btn-accent btn-block m-only" data-go="v/listings/new">${ic('plus', 'ic-m')}List surplus food</button>
        <div class="v-cols">
          <section class="stack">
            <div class="row between"><h2 class="t-h2">Next pickups</h2><button class="btn-link t-small" data-go="v/reservations">View all</button></div>
            ${!reservationState.loaded ? `<div class="card t-muted t-small">Loading reservations…</div>` : active.length ? active.map(liveReservationCard).join('') : `<div class="card t-muted t-small">No pickups waiting. New reservations appear here instantly.</div>`}
          </section>
          <section class="stack">
            <div class="row between"><h2 class="t-h2">Ending soon</h2><button class="btn-link t-small" data-go="v/listings">Manage</button></div>
            ${ending.length ? `<div class="card" style="padding-block:4px">${ending.map(l => `<button class="list-row" data-go="v/listing/${l.id}">${listingPh(l, 44, 44)}<span class="grow stack-s" style="gap:0"><b>${esc(l.name)}</b><span class="t-caption t-muted">ends ${time.fmt(l.to)}</span></span>${c.badge('stock', `${l.left} left`)}</button>`).join('')}</div>`
              : !listingState.loaded ? `<div class="card t-muted t-small">Loading listings…</div>` : c.empty({ title: 'List your first surplus food', body: 'Add what’s left near closing time. Students nearby see it straight away.', actions: '<button class="btn btn-accent" data-go="v/listings/new">List surplus food</button>' })}
          </section>
        </div>
      </div>`, after: r => FN.motion.countUp(r) };
    },

    listings() {
      const listingState = loadVendorListings();
      const all = listingState.listings; const tab = U.vListTab;
      const groups = { active: all.filter(l => l.visible && l.left > 0), soldout: all.filter(l => l.left === 0), hidden: all.filter(l => !l.visible && l.left > 0) };
      const list = groups[tab];
      return { shell: 'vendor', nav: 'v/listings', html: `${bar({ title: 'My Listings', right: `<button class="btn btn-accent btn-sm d-only" data-go="v/listings/new">${ic('plus', 'ic-s')}New listing</button>` })}
      <div class="content">
        <button class="btn btn-accent btn-block m-only" data-go="v/listings/new">${ic('plus', 'ic-m')}New listing</button>
        ${c.seg([['active', `Active (${groups.active.length})`], ['soldout', `Sold out (${groups.soldout.length})`], ['hidden', `Hidden (${groups.hidden.length})`]], tab, 'v-list-tab')}
        ${!listingState.loaded ? `<div class="empty"><span class="ibox round">${ic('clock', 'ic-xl')}</span><h2 class="t-h1">Loading listings</h2><p class="t-muted">Getting your live Firestore listings.</p></div>` : ''}
        ${listingState.error ? c.empty({ art: false, title: 'Could not load listings', body: 'Please log in as a vendor and try again.' }) : ''}
        ${listingState.loaded && !listingState.error && list.length ? `<div class="listing-grid">${list.map(l => `<article class="card listing-card">
          <div class="row-top">${listingPh(l, 64, 64)}<div class="grow stack-s" style="gap:2px"><div class="row between"><b>${esc(l.name)}</b>${c.badge('stock', `${l.left} left`)}</div>
          <div class="row wrap" style="gap:6px">${c.price(l.price, l.orig)}${c.badge('discount', `${Math.round((1 - Number(l.price) / Number(l.orig)) * 100)}% OFF`)}</div>${c.meta('clock', time.range(l.from, l.to))}</div></div>
          <hr class="divider"><div class="row between"><span class="t-caption t-muted">${l.visible ? 'Visible to students' : 'Hidden'}</span><button class="btn btn-secondary btn-sm" data-go="v/listing/${l.id}">${ic('edit', 'ic-s')}Edit</button></div>
        </article>`).join('')}</div>` : ''}
        ${listingState.loaded && !listingState.error && !list.length ? c.empty({ art: tab === 'active', title: { active: 'Nothing listed right now', soldout: 'Nothing sold out yet', hidden: 'No hidden listings' }[tab], body: tab === 'active' ? 'List food you expect to have left before closing. It goes live for nearby students straight away.' : 'Listings move here automatically.', actions: tab === 'active' ? '<button class="btn btn-accent" data-go="v/listings/new">List surplus food</button>' : '' }) : ''}
      </div>` };
    },

    listingNew() {
      if (!U.lf || U.lf.id) U.lf = { id: null, name: '', cat: V().cat, orig: '', price: '', left: 4, from: '16:30', to: V().closes, desc: '', img: null };
      return { shell: 'vendor', nav: 'v/listings', bar: true, html: `${bar({ title: 'New listing', close: true, noBell: true })}${listingForm(null)}` };
    },
    listingEdit({ id }) {
      const l = liveListing(id) || sel.listing(id); if (!l) return FN.notFound();
      if (!U.lf || U.lf.id !== id) U.lf = { id, name: l.name, cat: l.category || l.cat, orig: Number(l.orig).toFixed(2), price: Number(l.price).toFixed(2), left: l.left, from: l.from, to: l.to, desc: l.description || l.desc || '', img: l.img };
      return { shell: 'vendor', nav: 'v/listings', bar: true, html: `${bar({ title: 'Edit listing', back: true, noBell: true })}${listingForm(l)}` };
    },

    reservations() {
      const reservationState = loadVendorReservations();
      const tab = U.vResTab;
      const reservations = reservationState.reservations;
      const active = reservations.filter((reservation) => reservation.status !== 'collected');
      const collected = reservations.filter((reservation) => reservation.status === 'collected');
      const list = tab === 'collected' ? collected : active;
      return { shell: 'vendor', nav: 'v/reservations', html: `${bar({ title: 'Reservations' })}
      <div class="content">
        <div class="chips">
          <button class="chip ${tab !== 'collected' ? 'is-on' : ''}" data-act="v-res-tab" data-v="upcoming">Reserved (${active.length})</button>
          <button class="chip ${tab === 'collected' ? 'is-on' : ''}" data-act="v-res-tab" data-v="collected">Collected (${collected.length})</button>
        </div>
        ${!reservationState.loaded ? `<div class="empty"><span class="ibox round">${ic('clock', 'ic-xl')}</span><h2 class="t-h1">Loading reservations</h2><p class="t-muted">Getting the latest student reservations from Firestore.</p></div>` : ''}
        ${reservationState.error ? c.empty({ art: false, title: 'Could not load reservations', body: 'Please log in with your vendor account and try again.' }) : ''}
        ${reservationState.loaded && !reservationState.error && list.length ? `<div class="res-grid">${list.map(liveReservationCard).join('')}</div>` : ''}
        ${reservationState.loaded && !reservationState.error && !list.length ? c.empty({ art: false, title: tab === 'collected' ? 'No collected reservations yet' : 'No reservations waiting', body: 'New student reservations will appear here automatically.' }) : ''}
      </div>` };
    },

    verify({ id }) {
      const reservationState = loadVendorReservations();
      const waiting = reservationState.reservations.filter((reservation) => reservation.status === 'reserved');
      const expect = id ? waiting.find((reservation) => reservation.id === id) : null;
      U.vcode = U.vcodeFor === id ? (U.vcode || '') : ''; U.vcodeFor = id;
      const code = U.vcode;
      const match = code.length === 4 ? (expect ? [expect] : waiting).find((reservation) => FN.pickupCode(reservation.id) === code) : null;
      const wrong = code.length === 4 && !match;
      return { shell: 'vendor', nav: 'v/reservations', bar: !!match, html: `${bar({ title: 'Verify pickup', back: true, noBell: true })}
      <div class="content narrow">
        <section class="scanner" aria-label="Code scanner"><div class="scan-frame">${ic('qr', 'ic-xl')}<span class="scan-line"></span></div><span class="t-small">Scanning uses the phone camera in the Android app. Type the code below in this preview.</span></section>
        ${!reservationState.loaded ? '<p class="t-small t-muted">Loading reservations…</p>' : ''}
        ${expect ? `<p class="t-small t-muted">Expecting <b class="t-brand">${esc(expect.studentName || 'Student')}</b> · ${esc(expect.listingName)} · 1 portion</p>` : ''}
        <label class="t-strong" for="vcode">Enter the 4-digit pickup code</label>
        <div class="code-input ${wrong ? 'shake' : ''} ${match ? 'ok' : ''}">
          <input id="vcode" data-input="vcode" inputmode="numeric" autocomplete="one-time-code" maxlength="4" value="${esc(code)}" aria-describedby="vcode-msg">
          ${[0, 1, 2, 3].map(i => `<span class="digit ${code[i] ? 'filled' : ''} ${i === code.length ? 'caret' : ''}" style="--i:${i}" aria-hidden="true">${code[i] || ''}</span>`).join('')}
        </div>
        <p id="vcode-msg" class="t-small ${wrong ? 't-error' : 't-muted'}">${wrong ? (expect ? 'That code doesn’t match this reservation. Check the student’s screen and try again.' : 'That code doesn’t match any waiting pickup. Check the student’s screen and try again.') : 'Ask the student to show the code on their order screen.'}</p>
        ${match ? `<section class="card match-card"><div class="row between">${c.meta('check', '<b>Code matches</b>', true)}</div><b>${esc(match.studentName || 'Student')} · ${esc(match.listingName)}</b><span class="t-small t-muted">${rm(match.unitPrice)} · pickup ${time.range(match.pickupFrom, match.pickupTo)}</span>
          <div class="d-only row"><button class="btn btn-primary" data-act="v-collect-live" data-id="${esc(match.id)}">Confirm collected</button></div></section>` : ''}
      </div>
      ${match ? `<div class="actionbar col m-only"><button class="btn btn-primary" data-act="v-collect-live" data-id="${esc(match.id)}">Confirm collected</button></div>` : ''}`,
      after: () => { const i = document.getElementById('vcode'); if (i && !match && window.matchMedia('(pointer:fine)').matches) i.focus({ preventScroll: true }); } };
    },

    store() {
      const v = V(); const r = sel.rating(v.id);
      return { shell: 'vendor', nav: 'v/store', html: `${bar({ title: 'Store profile' })}
      <div class="content narrow">
        <div class="store-cover">${c.ph({ cat: v.cat, name: v.name, img: v.img }, { h: 150, cls: 'full', label: 'Store photo' })}</div>
        <div class="row" style="gap:12px"><div class="grow stack-s" style="gap:2px"><h1 class="t-h1">${esc(v.name)}</h1><span class="meta ink">${c.rating(v.id)}<span class="t-muted">· ${v.cat}</span></span></div><button class="btn btn-secondary btn-sm" data-act="v-edit-store">${ic('edit', 'ic-s')}Edit</button></div>
        <section class="card" style="gap:12px">${[['pin', 'Pickup address', v.area], ['clock', 'Opening hours', `${time.range(v.opens, v.closes)}`], ['phone', 'Contact', v.phone], ['mail', 'Email', v.email]].map(([i, l, val]) => `<div class="row" style="gap:12px">${c.ibox(i, 'sm')}<div class="grow stack-s" style="gap:0"><span class="t-caption t-muted">${l}</span><b style="overflow-wrap:anywhere">${esc(val)}</b></div></div>`).join('')}</section>
        <div class="two"><div class="card stat-card tinted"><span class="t-display num">${v.rescued || 0}</span><span class="t-small t-muted">Meals rescued</span></div><div class="card stat-card tinted"><span class="t-display num">${rm(v.recovered || 0).replace('.00', '')}</span><span class="t-small t-muted">Recovered (test)</span></div></div>
        <section class="card" style="padding-block:4px">
          <button class="list-row" data-go="v/reviews">${ic('star', 'ic-m t-brand')}<span class="grow">Customer reviews</span><span class="t-small t-muted">${r.count ? r.avg.toFixed(1) + ' ★' : 'None yet'}</span></button>
          <button class="list-row" data-go="v/notifications">${ic('bell', 'ic-m t-brand')}<span class="grow">Notifications</span>${ic('chevron', 'ic-m t-muted')}</button>
          <button class="list-row" data-act="replay-splash">${ic('play', 'ic-m t-brand')}<span class="grow">Replay launch animation</span></button>
          <button class="list-row" data-act="reset-demo">${ic('refresh', 'ic-m t-brand')}<span class="grow">Reset demo data</span></button>
          <button class="list-row" data-act="logout">${ic('logout', 'ic-m t-error')}<span class="grow t-error">Log out</span></button>
        </section>
      </div>` };
    },

    reviews() {
      const v = V(); const r = sel.rating(v.id); const list = sel.reviewsOf(v.id);
      return { shell: 'vendor', nav: 'v/reviews', html: `${bar({ title: 'Customer reviews', back: true })}
      <div class="content narrow">
        <section class="card row" style="flex-direction:row;gap:14px"><span class="t-display num">${r.count ? r.avg.toFixed(1) : '–'}</span><div class="stack-s" style="gap:2px">${c.stars(r.avg, 'ic-m')}<span class="t-caption t-muted">${r.count} reviews · ${list.filter(x => !x.reply).length} waiting for a reply</span></div></section>
        ${list.map(x => `<article class="card" style="gap:8px"><div class="row" style="gap:10px">${c.avatar(x.author)}<div class="grow stack-s" style="gap:0"><b>${esc(x.author)}</b><span class="t-caption t-muted">${time.dayLabel(x.createdAt)}</span></div>${c.stars(x.stars)}</div>${x.text ? `<p class="t-small">${esc(x.text)}</p>` : ''}
          ${x.reply ? `<div class="reply"><span class="t-caption t-brand t-strong">Your reply</span><p class="t-small">${esc(x.reply)}</p></div>`
          : U.replying === x.id ? `<form class="stack-s" data-form="reply" data-id="${x.id}"><div class="input area"><textarea id="reply-text" maxlength="240" placeholder="Thank them or explain what you’ll change"></textarea></div><div class="row"><button type="button" class="btn btn-ghost btn-sm" data-act="v-reply-cancel">Cancel</button><button class="btn btn-primary btn-sm" type="submit">${ic('send', 'ic-s')}Post reply</button></div></form>`
          : `<button class="btn btn-ghost btn-sm" style="align-self:flex-start" data-act="v-reply" data-id="${x.id}">Reply</button>`}</article>`).join('')}
        ${!list.length ? c.empty({ art: false, title: 'No reviews yet', body: 'Students can rate you after they collect an order.' }) : ''}
      </div>`, after: () => { const t = document.getElementById('reply-text'); t && t.focus(); } };
    },

    notifications() {
      const v = V(); const list = sel.notifs(v.id);
      return { shell: 'vendor', nav: 'v/notifications', html: `${bar({ title: 'Notifications', back: true, noBell: true })}
      <div class="content narrow">
        ${sel.unread(v.id) ? `<button class="btn-link t-small" style="align-self:flex-end" data-act="read-all" data-v="${v.id}">Mark all as read</button>` : ''}
        <div class="stack-s">${list.map(n => `<button class="notif ${n.read ? '' : 'unread'}" data-act="open-notif" data-id="${n.id}">${c.ibox(n.icon, n.icon === 'alert' ? 'err round' : n.kind === 'order' ? 'accent round' : 'round')}<span class="grow stack-s" style="gap:2px"><span class="row between"><b>${esc(n.title)}</b><span class="t-caption t-muted">${time.isToday(n.at) ? time.clock(n.at) : time.dayLabel(n.at)}</span></span><span class="t-small t-muted">${esc(n.body)}</span></span>${n.read ? '' : '<span class="udot" aria-label="Unread"></span>'}</button>`).join('')}</div>
        ${!list.length ? c.empty({ art: false, title: 'No notifications yet', body: 'New reservations, payments and reviews will appear here.' }) : ''}
      </div>` };
    }
  };

  /* ---------- handlers ---------- */
  const keep = () => FN.render(true);
  const readForm = () => { const g = id => document.getElementById(id); if (!g('lf-name')) return; Object.assign(U.lf, { name: g('lf-name').value.trim(), orig: parseFloat(g('lf-orig').value) || '', price: parseFloat(g('lf-price').value) || '', from: g('lf-from').value, to: g('lf-to').value, desc: g('lf-desc').value }); };
  Object.assign(FN.on, {
    'v-accepting'(el) { const on = act.toggleAccepting(V().id); keep(); FN.toast(on ? 'Reservations open' : 'Reservations paused. Listings hidden from students.', { icon: on ? 'check' : 'info' }); },
    async 'v-visible'(el) {
      const listing = liveListing(el.dataset.id);
      if (!listing || !FN.setListingVisibility) return;
      await FN.setListingVisibility(listing.id, !listing.visible);
      U.liveVendorListings = null;
      keep();
      FN.toast(!listing.visible ? 'Listing visible to students' : 'Listing hidden', { icon: !listing.visible ? 'eye' : 'eyeoff' });
    },
    'v-list-tab'(el) { U.vListTab = el.dataset.v; keep(); },
    'v-res-tab'(el) { U.vResTab = el.dataset.v; keep(); },
    async 'v-collect-live'(el) {
      if (!FN.markReservationCollected || el.disabled) return;

      const originalText = el.textContent;
      el.disabled = true;
      el.textContent = 'Confirming...';

      try {
        await FN.markReservationCollected(el.dataset.id);
        U.liveVendorReservations = null;
        U.liveVendorReservationsError = null;
        U.vResTab = 'collected';
        U.vcode = '';
        if (FN.route.name === 'verify') FN.go('v/reservations', { replace: true }); else FN.render(true);
        FN.toast('Pickup complete. Nice rescue!', { icon: 'check' });
      } catch (error) {
        console.error('Failed to mark reservation collected:', error);
        FN.toast(
          error.code === 'permission-denied'
            ? 'You do not have permission to update this reservation.'
            : 'Could not confirm collection. Please try again.',
          { icon: 'info' }
        );
        el.disabled = false;
        el.textContent = originalText;
      }
    },
    'v-ready'(el) { act.markReady(el.dataset.id); keep(); FN.toast('Student notified: order ready', { icon: 'bell' }); },
    'v-collect'(el) { act.collect(el.dataset.id); U.vcode = ''; FN.go('v/reservations', { replace: true }); U.vResTab = 'collected'; FN.render(true); FN.toast('Pickup complete. Nice rescue!', { icon: 'check' }); },
    'v-noshow'(el) { const id = el.dataset.id; FN.overlay.confirm({ title: 'Mark as not collected?', body: 'Use this only after the pickup slot has passed. The student is notified.', ok: 'Mark no-show', okClass: 'btn-danger', onOk: () => { act.noShow(id); U.vcode = ''; if (FN.route.name === 'verify') FN.go('v/reservations', { replace: true }); else keep(); FN.toast('Marked as not collected', { icon: 'flag' }); } }); },
    'v-reply'(el) { U.replying = el.dataset.id; keep(); },
    'v-reply-cancel'() { U.replying = null; keep(); },
    'lf-cat'(el) { readForm(); U.lf.cat = el.dataset.v; keep(); },
    'lf-qty'(el) { readForm(); U.lf.left = Math.max(0, +el.dataset.q); keep(); },
    async 'lf-visible'(el) {
      const listing = liveListing(el.dataset.id);
      if (!listing || !FN.setListingVisibility) return;
      readForm();
      await FN.setListingVisibility(listing.id, !listing.visible);
      U.liveVendorListings = null;
      U.lf = null;
      FN.go('v/listings', { replace: true });
      FN.toast(!listing.visible ? 'Listing visible to students' : 'Listing hidden', { icon: !listing.visible ? 'eye' : 'eyeoff' });
    },
    'lf-soldout'(el) { act.soldOut(el.dataset.id); U.lf = null; FN.go('v/listings', { replace: true }); FN.toast('Marked as sold out', { icon: 'check' }); },
    'lf-delete'(el) { const id = el.dataset.id; FN.overlay.confirm({ title: 'Delete this listing?', body: 'Students will no longer see it. Reservations already made stay valid.', ok: 'Delete', okClass: 'btn-danger', onOk: () => { act.deleteListing(id); U.lf = null; FN.go('v/listings', { replace: true }); FN.toast('Listing deleted', { icon: 'trash' }); } }); },
    'lf-submit'() { FN.onSubmit.listing(); },
    'v-edit-store'() {
      const v = V();
      FN.overlay.sheet('Edit store', `<form class="stack" data-form="store" novalidate>${c.field({ id: 'st-name', label: 'Store name', value: v.name, icon: 'store', err: 'Name can’t be empty' })}${c.field({ id: 'st-area', label: 'Pickup address', value: v.area, icon: 'pin' })}<div class="two">${c.field({ id: 'st-opens', label: 'Opens', type: 'time', value: v.opens, icon: 'clock' })}${c.field({ id: 'st-closes', label: 'Closes', type: 'time', value: v.closes, icon: 'clock' })}</div>${c.field({ id: 'st-phone', label: 'Contact', type: 'tel', value: v.phone, icon: 'phone' })}<button class="btn btn-primary btn-block" type="submit">Save store</button></form>`);
    }
  });
  Object.assign(FN.onSubmit, {
async listing() {
  readForm();

  const draft = U.lf;

  const setError = (id, bad) => {
    const field = document.getElementById('f-' + id);
    field && field.classList.toggle('has-error', !!bad);
    return !bad;
  };

  const valid = [
    setError('lf-name', !draft.name),
    setError('lf-orig', !(draft.orig > 0)),
    setError(
      'lf-price',
      !(draft.price > 0 && draft.price < draft.orig)
    ),
    setError('lf-to', !draft.to || draft.to <= draft.from)
  ].every(Boolean);

  if (!valid) {
    FN.toast('Check the highlighted fields', {
      icon: 'alert'
    });
    return;
  }

  if (!draft.left && !draft.id) {
    FN.toast('Add at least 1 portion', {
      icon: 'alert'
    });
    return;
  }

  const localListing = {
    name: draft.name,
    cat: draft.cat,
    orig: Number(draft.orig),
    price: Number(Number(draft.price).toFixed(2)),
    left: Number(draft.left),
    from: draft.from,
    to: draft.to,
    desc: draft.desc || `${draft.name}, freshly made today.`,
    img: draft.img
  };

  if (draft.id) {
    if (!FN.updateListing) {
      FN.toast('Firebase is not ready. Please try again.', { icon: 'info' });
      return;
    }

    try {
      await FN.updateListing(draft.id, {
        name: localListing.name,
        category: localListing.cat,
        orig: localListing.orig,
        price: localListing.price,
        left: localListing.left,
        from: localListing.from,
        to: localListing.to,
        description: localListing.desc
      });

      U.liveVendorListings = null;
      U.liveVendorListingsError = null;
      U.lf = null;
      U.vListTab = 'active';
      FN.go('v/listings', { replace: true });
      FN.toast('Changes saved', { icon: 'check' });
    } catch (error) {
      console.error('Failed to update listing:', error);
      FN.toast('Could not save changes. Please try again.', { icon: 'info' });
    }
    return;
  }

  if (!FN.publishListing) {
    FN.toast('Firebase is not ready. Please try again.', {
      icon: 'info'
    });
    return;
  }

  const button = document.querySelector(
    '[data-form="listing"] button[type="submit"]'
  );

  if (button && button.disabled) return;

  if (button) {
    button.disabled = true;
    button.textContent = 'Publishing listing...';
  }

  try {
    const listingId = await FN.publishListing({
      name: localListing.name,
      category: localListing.cat,
      orig: localListing.orig,
      price: localListing.price,
      left: localListing.left,
      from: localListing.from,
      to: localListing.to,
      description: localListing.desc
    });

    localListing.qty = localListing.left;
    act.saveListing(V().id, localListing);

    console.log('Listing saved to Firestore:', listingId);

    U.liveVendorListings = null;
    U.liveVendorListingsError = null;

    FN.toast(`${esc(localListing.name)} is live for nearby students`, {
      icon: 'sparkle'
    });

    U.lf = null;
    U.vListTab = 'active';
    FN.go('v/listings', { replace: true });
  } catch (error) {
    console.error('Failed to publish listing:', error);

    const messages = {
      'auth/vendor-not-signed-in': 'Please log in as a vendor first.',
      'permission-denied': 'You do not have permission to publish listings.'
    };

    FN.toast(
      messages[error.code] || 'Failed to publish listing. Please try again.',
      { icon: 'info' }
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Publish listing';
    }
  }
},
    reply(form) { const t = document.getElementById('reply-text').value.trim(); if (!t) return FN.toast('Write a reply first', { icon: 'info' }); act.reply(form.dataset.id, t); U.replying = null; keep(); FN.toast('Reply posted'); },
    store() {
      const g = id => document.getElementById(id).value.trim(); if (!g('st-name')) { document.getElementById('f-st-name').classList.add('has-error'); return; }
      act.updateVendor(V().id, { name: g('st-name'), area: g('st-area'), opens: g('st-opens'), closes: g('st-closes'), phone: g('st-phone') }); FN.overlay.close(); keep(); FN.toast('Store updated', { icon: 'store' });
    }
  });
  Object.assign(FN.onInput, {
    vcode(el) { const v = el.value.replace(/\D/g, '').slice(0, 4); el.value = v; U.vcode = v; if (v.length === 4 || v.length === 3 || v.length < 4) { FN.render(true); const i = document.getElementById('vcode'); if (i && v.length < 4) { i.focus(); } } },
    'lf-price'() { const o = parseFloat(document.getElementById('lf-orig').value), p = parseFloat(document.getElementById('lf-price').value); const el = document.querySelector('#lf-pct span'); if (!el) return; const pct = o > 0 && p > 0 && p < o ? Math.round((1 - p / o) * 100) : null; el.textContent = pct ? `Students see ${pct}% OFF${pct < 20 ? ' · most students look for 20–60% off' : ''}` : (p >= o && o ? 'Surplus price must be lower than the original' : 'Discount shows here once both prices are set'); },
    'lf-photo'(el) { const f = el.files && el.files[0]; if (!f) return; readForm(); const r = new FileReader(); r.onload = () => { U.lf.img = r.result; keep(); }; r.readAsDataURL(f); }
  });
})();
