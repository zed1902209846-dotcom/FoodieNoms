/* Student screens: home, deals, vendor, food, basket, payment, orders, impact, notifications, saved, reviews, profile, settings. */
window.FN = window.FN || {};
(function () {
  const { ic, esc, rm, c, sel, act, time } = FN;
  const S = FN.state;
  FN.ui = FN.ui || {};
  const U = FN.ui;
  U.ordersTab = U.ordersTab || 'all';
  U.impactPeriod = U.impactPeriod || 'month';
  U.notifTab = U.notifTab || 'all';
  U.reviewSort = U.reviewSort || 'recent';
  U.foodQty = 1;
  U.dealsLoaded = false;

  /* ---------- shared pieces ---------- */
  const bell = () => { const n = sel.unread('u1'); return `<button class="icon-btn m-only" data-go="notifications" aria-label="Notifications${n ? `, ${n} unread` : ''}">${ic('bell', 'ic-l')}${n ? '<span class="dot"></span>' : ''}</button>`; };
  const bar = ({ title = '', back = false, menu = false, home = false, right = '', noBell = false, brand = false, dhide = false } = {}) => `<header class="appbar ${dhide ? 'd-hide' : ''}">
    <div class="side">${back ? `<button class="icon-btn" data-back aria-label="Back">${ic('back', 'ic-l')}</button>` : ''}${menu ? `<button class="icon-btn m-only" data-act="drawer" aria-label="Open menu">${ic('menu', 'ic-l')}</button>` : ''}${home ? `<button class="icon-btn m-only" data-go="home" aria-label="Home">${ic('home', 'ic-l')}</button>` : ''}</div>
    ${brand ? `<span class="brand m-only">${c.lockup(false, 24)}</span><h1 class="title d-only">${title}</h1>` : `<h1 class="title">${title}</h1>`}
    <div class="side r">${right}${noBell ? '' : bell()}</div></header>`;
  const mapUrl = v => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + ' ' + v.area)}`;
  const timeLeftPct = v => { const open = time.toMin(v.opens), close = time.toMin(v.closes); return Math.max(4, Math.min(100, Math.round((time.nowMin - open) / (close - open) * 100))); };
  const urgent = v => time.toMin(v.closes) - time.nowMin <= 45;
  const vendorPh = (v, h, w) => c.ph({ cat: v.cat, name: v.name, img: v.img }, { h, w, label: v.img || h < 90 ? '' : 'Store photo' });
  const saveBtn = (vid, cls = 'icon-btn') => { const on = S.db.saved.includes(vid); return `<button class="${cls}" data-act="save-vendor" data-id="${vid}" aria-pressed="${on}" aria-label="${on ? 'Remove from saved shops' : 'Save shop'}" style="${on ? 'color:var(--accent-text)' : ''}">${on ? `<svg class="ic ic-m" style="fill:currentColor" aria-hidden="true"><use href="#i-bookmark"></use></svg>` : ic('bookmark', 'ic-m')}</button>`; };

  function vendorCard(v, ls) {
    const items = ls.length; const pct = sel.maxPct(v.id);
    return `<article class="card press vendor-card" data-go="vendor/${v.id}" tabindex="0" role="link" aria-label="${esc(v.name)}">
      <div class="vc-photo">${vendorPh(v, 104, 92)}</div>
      <div class="grow stack-s vc-body">
        <div class="row between"><h3 class="t-strong vc-name">${esc(v.name)}</h3>${saveBtn(v.id, 'icon-btn vc-save')}</div>
        <span class="meta ink">${c.rating(v.id)}<span class="t-muted">· ${v.cat}</span></span>
        <span class="meta">${ic('clock', 'ic-s')}<span>Closes ${time.fmt(v.closes)} · <b class="${urgent(v) ? 't-accent' : ''}">${time.left(v.closes)}</b></span></span>
        <div class="bar ${urgent(v) ? 'urgent' : ''}" aria-hidden="true"><i style="width:${timeLeftPct(v)}%"></i></div>
        <span class="meta">${ic('walk', 'ic-s')}<span>${esc(v.area.split(',')[0])} · ${v.walk} min walk</span></span>
        <div class="row wrap" style="gap:6px">${c.badge('discount', `Up to ${pct}% OFF`)}${c.badge('stock', `${items} item${items > 1 ? 's' : ''} listed`)}</div>
      </div></article>`;
  }

  function foodCard(l) {
    const q = S.basket.items[l.id] || 0;
    const control = q ? `<span class="corner-r">${c.stepper(l.id, q, l.left)}</span>` : `<button class="add-fab corner-r" data-act="add" data-id="${l.id}" aria-label="Add ${esc(l.name)} to basket" ${l.left ? '' : 'disabled'}>${ic('plus', 'ic-m')}</button>`;
    return `<article class="card food-card" data-id="${l.id}">
      <div class="fc-img" data-go="food/${l.id}" role="link" tabindex="0" aria-label="${esc(l.name)} details">${c.ph(l, { h: 112, cls: 'full', extra: `<span class="corner">${l.left ? c.badge('stock', `${l.left} left`) : c.badge('neutral', 'Sold out')}</span>` })}</div>
      ${control}
      <div class="stack-s" style="gap:2px;padding:0 4px 2px">
        <button class="t-strong fc-name" data-go="food/${l.id}">${esc(l.name)}</button>
        ${c.price(l.price, l.orig)}
        <span class="meta">${ic('clock', 'ic-s')}<span>${time.range(l.from, l.to)}</span></span>
      </div></article>`;
  }

    function liveListingCard(listing) {
    const originalPrice = Number(listing.orig || 0);
    const discountedPrice = Number(listing.price || 0);
    const quantityLeft = Number(listing.left || 0);
    const isReserved = (U.liveReservationIds || []).includes(listing.id);
    const discountPercentage = originalPrice > 0
      ? Math.round((1 - discountedPrice / originalPrice) * 100)
      : 0;

  return `<article
  class="card pad-l stack-s press"
  style="gap:10px;cursor:pointer"
  data-go="live-food/${encodeURIComponent(listing.id)}"
  role="link"
  tabindex="0"
  aria-label="View ${esc(listing.name || 'listing')}"
>
      <div class="row between" style="align-items:flex-start">
        <div class="row grow" style="gap:12px;align-items:flex-start">
          ${c.ibox('bag', 'accent')}
          <div class="grow stack-s" style="gap:3px">
            <div class="row between">
              <h3 class="t-h2">${esc(listing.name || 'Untitled listing')}</h3>
              ${c.badge('stock', `${quantityLeft} left`)}
            </div>
            <span class="t-small t-muted">
              ${esc(listing.category || 'Food')} · Live from Firestore
            </span>
          </div>
        </div>
      </div>

      <div class="row wrap" style="gap:8px">
        ${c.price(discountedPrice, originalPrice)}
        ${c.badge('discount', `${discountPercentage}% OFF`)}
      </div>

      <div class="row wrap" style="gap:14px">
        ${c.meta('clock', `Pickup today, ${time.range(listing.from, listing.to)}`)}
        ${c.meta('bag', `${quantityLeft} portion${quantityLeft === 1 ? '' : 's'} available`)}
      </div>

      <p class="t-small t-muted">
        ${esc(listing.description || 'Fresh surplus food available for collection today.')}
      </p>

      <span class="t-caption t-muted">
        Listing ID: ${esc(listing.id)}
      </span>
    </article>`;
  }

  function loadStudentReservations() {
    const loaded = Array.isArray(U.liveStudentReservations);

    if (!loaded && !U.liveStudentReservationsLoading && FN.loadStudentReservations) {
      U.liveStudentReservationsLoading = true;

      FN.loadStudentReservations()
        .then((reservations) => {
          U.liveStudentReservations = reservations;
          U.liveStudentReservationsError = null;
          U.liveReservationIds = reservations.map((reservation) => reservation.listingId);
        })
        .catch((error) => {
          console.error('Failed to load student reservations:', error);
          U.liveStudentReservations = [];
          U.liveStudentReservationsError = error;
        })
        .finally(() => {
          U.liveStudentReservationsLoading = false;

          if (FN.route.name === 'orders' || FN.route.name === 'live-food') {
            FN.render(true);
          }
        });
    }

    return {
      loaded,
      reservations: U.liveStudentReservations || [],
      error: U.liveStudentReservationsError
    };
  }

  function liveReservationCard(reservation) {
    const collected = reservation.status === 'collected';
    const status = collected ? 'Collected' : 'Reserved';

    return `<article class="card stack-s" style="gap:10px">
      <div class="row" style="gap:12px">
        ${c.ibox(collected ? 'check' : 'bag', collected ? 'round' : 'accent round')}
        <div class="grow stack-s" style="gap:2px">
          <div class="row between"><b>${esc(reservation.listingName)}</b>${c.badge(collected ? 'done' : 'pending', status)}</div>
          <span class="t-small t-muted">${esc(reservation.listingCategory)} · 1 portion · ${rm(reservation.unitPrice)}</span>
          ${c.meta('clock', `Pickup today, ${time.range(reservation.pickupFrom, reservation.pickupTo)}`)}
        </div>
      </div>
      ${collected ? '' : `<div class="row between" style="gap:8px"><span class="t-small t-muted">Show this code at pickup</span><b class="t-h2 num t-brand" style="letter-spacing:4px">${FN.pickupCode(reservation.id)}</b></div>`}
      <span class="t-caption t-muted" style="overflow-wrap:anywhere">Reservation ID: ${esc(reservation.id)}</span>
    </article>`;
  }

  function orderCard(o) {
    const v = sel.vendor(o.vendorId);
    let btns = '';
    if (sel.isActive(o)) btns = `<a class="btn btn-ghost btn-sm" href="${mapUrl(v)}" target="_blank" rel="noopener">Directions</a><button class="btn btn-primary btn-sm" data-go="order/${o.id}">Pickup code</button>`;
    else if (o.status === 'collected' && !o.rated) btns = `<button class="btn btn-primary btn-sm" data-go="review/${o.id}">Rate vendor</button>`;
    else if (o.status === 'collected') btns = `<button class="btn btn-secondary btn-sm" data-go="vendor/${v.id}">Reorder</button>`;
    else btns = `<button class="btn btn-ghost btn-sm" data-go="order/${o.id}">View</button>`;
    return `<article class="card order-card">
      <div class="row-top" data-go="order/${o.id}" role="link" tabindex="0" style="cursor:pointer">${vendorPh(v, 60, 60)}
        <div class="grow stack-s" style="gap:2px"><div class="row between"><b>${esc(v.name)}</b><b class="t-accent num">${rm(sel.total(o))}</b></div>
        <span class="t-small t-muted">${esc(sel.itemsText(o))} · #${o.id}</span>
        ${c.meta('clock', o.status === 'collected' ? `Collected ${time.dayLabel(o.createdAt)}, ${time.slotRange(o.slot)}` : `${time.dayLabel(o.createdAt)}, ${time.slotRange(o.slot)}`, true)}</div></div>
      <div class="row between wrap" style="gap:8px">${o.rated && o.status === 'collected' ? c.badge('done', 'Rated') : c.status(o)}<div class="row">${btns}</div></div></article>`;
  }

  function filterPanel(where = 'sheet') {
    const f = S.filters; const n = sel.dealsList().length;
    const chip = (on, a, v, l) => `<button class="chip ${on ? 'is-on' : ''}" data-act="${a}" data-v="${v}" aria-pressed="${on}">${l}</button>`;
    return `<div class="stack-l" id="filter-body-${where}">
      <div class="stack-s"><b>Sort by</b><div class="chips">${[['nearest', 'Nearest'], ['discount', 'Biggest discount'], ['closing', 'Closing soon']].map(([v, l]) => chip(f.sort === v, 'f-sort', v, l)).join('')}</div></div>
      <div class="stack-s"><b>Food category</b><div class="chips">${FN.CATEGORIES.map(x => chip(f.cats.includes(x), 'f-cat', x, x)).join('')}</div></div>
      <div class="stack-s"><b>Price per item</b><div class="chips">${FN.PRICE_BANDS.map(b => chip(f.price === b.id, 'f-price', b.id, b.label)).join('')}</div></div>
      <div class="field"><label for="f-vendor-q-${where}">Vendor</label><div class="input">${ic('store', 'ic-m')}<input id="f-vendor-q-${where}" data-input="f-vendor" value="${esc(f.vendor)}" placeholder="Search a vendor name" autocomplete="off"></div></div>
      <div class="row"><button class="btn btn-secondary" data-act="f-reset">Reset</button>${where === 'sheet' ? `<button class="btn btn-primary grow" data-act="close-overlay">Show ${n} vendor${n === 1 ? '' : 's'}</button>` : ''}</div>
    </div>`;
  }
  FN.refreshFilters = () => { const b = document.getElementById('filter-body-sheet'); if (b) { const focused = document.activeElement && document.activeElement.id; b.outerHTML = filterPanel(); if (focused) { const el = document.getElementById(focused); if (el) { el.focus(); el.setSelectionRange && el.setSelectionRange(el.value.length, el.value.length); } } } };

  function basketSummary(compact = false) {
    const lines = sel.basketLines(); const t = sel.basketTotals(); const v = sel.vendor(S.basket.vendorId);
    if (!lines.length) return `<div class="card pad-l stack basket-aside"><h2 class="t-h2">Your basket</h2><p class="t-muted t-small">Add surplus food from one vendor, pick a time, then reserve and pay.</p>${c.ibox('bag', 'accent')}</div>`;
    return `<div class="card pad-l stack basket-aside">
      <div class="row between"><h2 class="t-h2">Your basket</h2><span class="badge badge-stock">${t.meals} item${t.meals > 1 ? 's' : ''}</span></div>
      ${c.meta('store', `${esc(v.name)} · one vendor per order`)}
      ${lines.map(x => `<div class="row">${c.ph(x.l, { h: 48, w: 48 })}<div class="grow stack-s" style="gap:0"><b class="t-small">${esc(x.l.name)}</b><span class="t-small t-accent num">${rm(x.l.price)}</span></div>${c.stepper(x.l.id, x.qty, x.l.left)}</div>`).join('')}
      <hr class="divider"><b class="t-small">Pickup time</b>
      <div class="chips">${sel.slots(v.id).map(s => `<button class="chip ${S.basket.slot === s.s ? 'is-on' : ''}" data-act="pick-slot" data-v="${s.s}" ${s.past || s.full ? 'aria-disabled="true"' : ''}>${time.fmt(s.s).replace(' pm', '').replace(' am', '')}${s.full ? ' · full' : ''}</button>`).join('')}</div>
      <hr class="divider">
      <div class="kv"><span>Original price</span><span class="num">${rm(t.orig)}</span></div>
      <div class="kv"><span>Surplus discount</span><span class="num t-accent">− ${rm(t.saved)}</span></div>
      <div class="kv total"><span>Total</span><span class="num">${rm(t.total)}</span></div>
      <div class="banner ok">${ic('leaf', 'ic-m')}<span>You save ${rm(t.saved)} and rescue ${t.meals} meal${t.meals > 1 ? 's' : ''}</span></div>
      <button class="btn btn-primary btn-block" data-act="checkout">Reserve & pay · ${rm(t.total)}</button>
      ${compact ? '' : `<span class="meta">${ic('info', 'ic-s')}<span>Test mode: no real money is charged.</span></span>`}
    </div>`;
  }

  function slotSheet() {
    const vid = S.basket.vendorId || U.lastVendor; const v = sel.vendor(vid); const slots = sel.slots(vid);
    FN.overlay.sheet('Select pickup time', `<div class="stack" role="radiogroup">${slots.map(s => {
      const on = S.basket.slot === s.s; const dis = s.past || s.full;
      return `<button class="option ${on ? 'is-on' : ''}" role="radio" aria-checked="${on}" data-act="pick-slot" data-v="${s.s}" ${dis ? 'aria-disabled="true"' : ''}><span class="radio"></span><span class="grow ${on ? 't-strong' : ''}">${time.slotRange(s.s)}</span>${s.full ? '<span class="t-caption t-muted">Full</span>' : s.past ? '<span class="t-caption t-muted">Passed</span>' : s.last ? '<span class="t-caption t-accent">Last slot</span>' : ''}</button>`;
    }).join('') || '<p class="t-muted">No pickup slots left today.</p>'}</div><button class="btn btn-primary btn-block" data-act="close-overlay">Confirm pickup time</button>`, `${esc(v.name)} closes at ${time.fmt(v.closes)}. Collect within your slot.`);
  }

  /* ---------- screens ---------- */
  FN.student = {
    home() {
      const me = sel.me(); const im = sel.impact('month');
      const active = sel.myOrders().filter(sel.isActive);
      const closing = sel.dealsList().slice().sort((a, b) => time.toMin(a.v.closes) - time.toMin(b.v.closes)).slice(0, 3);
      const tiles = [['tag', 'Nearby Deals', 'Surplus food near you', 'deals'], ['receipt', 'Order History', 'Pickups & past orders', 'orders'], ['heart', 'Saved Shops', 'Your favourite vendors', 'saved'], ['trophy', 'Leaderboard', 'Impact & rankings', 'impact']];
      return { shell: 'student', nav: 'home', html: `${bar({ menu: true, brand: true, title: 'Home', dhide: true })}
      <div class="content home">
        <div class="home-hello"><p class="t-muted">Welcome back,</p><h2 class="t-h1">${esc(me.name)}</h2></div>
        <div class="home-grid">
          <div class="stack home-main">
            <section class="hero-card" aria-label="Your impact this month">
              <div class="row between"><div><p class="t-small" style="opacity:.85">Your impact this month</p><p class="t-h2"><span data-count="${im.meals}">${im.meals}</span> meals rescued</p></div><img src="assets/logo/logo-mark.png" alt="" class="hero-mark"></div>
              <div class="stats-3">
                <div class="stat">${ic('wallet', 'ic-m t-brand')}<span class="stat-v" data-count="${im.saved.toFixed(2)}" data-dec="2" data-pre="RM">${rm(im.saved)}</span><span class="stat-l">Saved</span></div>
                <div class="stat">${ic('leaf', 'ic-m t-brand')}<span class="stat-v" data-count="${im.co2.toFixed(1)}" data-dec="1" data-suf=" kg">${im.co2.toFixed(1)} kg</span><span class="stat-l">CO₂ prevented (est.)</span></div>
                <div class="stat">${ic('meal', 'ic-m t-brand')}<span class="stat-v" data-count="${im.meals}">${im.meals}</span><span class="stat-l">Meals saved</span></div>
              </div>
            </section>
            ${active.map(o => { const v = sel.vendor(o.vendorId); return `<button class="card press pending-card" data-go="order/${o.id}">
              <span class="row" style="gap:12px">${c.ibox('bag', 'accent')}<span class="grow stack-s" style="gap:2px">${o.status === 'ready' ? c.badge('ready', 'Ready for pickup') : c.badge('pending', 'Pending pickup')}<b>${esc(v.name)} · ${esc(sel.itemsText(o))}</b>${c.meta('clock', `Today, ${time.slotRange(o.slot)} · code ${o.code}`)}</span>${ic('chevron', 'ic-m t-brand')}</span></button>`; }).join('')}
            <nav class="tiles" aria-label="Shortcuts">${tiles.map(([i, t1, t2, go]) => `<button class="card press tile" data-go="${go}"><span class="ibox round">${ic(i, 'ic-m')}</span><b>${t1}</b><span class="t-caption t-muted">${t2}</span></button>`).join('')}</nav>
          </div>
          <div class="stack home-side">
            <div class="row between"><h2 class="t-h2">Closing soon near you</h2><button class="btn-link t-small" data-go="deals">See all</button></div>
            ${closing.map(({ v, ls }) => `<button class="card press mini-vendor" data-go="vendor/${v.id}">${vendorPh(v, 56, 56)}<span class="grow stack-s" style="gap:2px"><b>${esc(v.name)}</b><span class="meta"><span>${ls.length} item${ls.length > 1 ? 's' : ''} · from ${rm(Math.min(...ls.map(l => l.price)))}</span></span></span><span class="badge ${urgent(v) ? 'badge-solid' : 'badge-discount'}">${time.left(v.closes)}</span></button>`).join('')}
            <aside class="partner" aria-label="Sponsored"><div class="grow stack-s" style="gap:2px"><span class="t-eyebrow">Sponsored</span><b>Partner banner slot</b><span class="t-caption t-muted">Content provided by TBS partners</span></div>${c.ph({ cat: 'Drinks', name: 'Partner' }, { w: 72, h: 56 })}</aside>
          </div>
        </div>
      </div>`, after: root => FN.motion.countUp(root) };
    },

    deals() {
      const filters = S.filters;
      const isLoaded = Array.isArray(U.liveListings);
      const isOffline = navigator.onLine === false;

      if (
        !isLoaded &&
        !U.liveListingsLoading &&
        FN.loadVisibleListings
      ) {
        U.liveListingsLoading = true;

        FN.loadVisibleListings()
          .then((listings) => {
            U.liveListings = listings;
            U.liveListingsError = null;
          })
          .catch((error) => {
            console.error("Failed to load live listings:", error);
            U.liveListings = [];
            U.liveListingsError = error;
          })
          .finally(() => {
            U.liveListingsLoading = false;

            if (FN.route.name === "deals") {
              FN.render(true);
            }
          });
      }

      const searchText = String(filters.q || "").trim().toLowerCase();
      const selectedCategories = filters.cats || [];
      const selectedPriceBand = FN.PRICE_BANDS.find(
        (band) => band.id === filters.price
      );

      const liveListings = (U.liveListings || [])
        .filter((listing) => {
          const listingName = String(listing.name || "").toLowerCase();
          const listingCategory = String(
            listing.category || ""
          ).toLowerCase();

          const matchesSearch =
            !searchText ||
            listingName.includes(searchText) ||
            listingCategory.includes(searchText);

          const matchesCategory =
            !selectedCategories.length ||
            selectedCategories.includes(listing.category);

          const matchesPrice =
            !selectedPriceBand ||
            (
              Number(listing.price) >= selectedPriceBand.min &&
              Number(listing.price) <= selectedPriceBand.max
            );

          return matchesSearch && matchesCategory && matchesPrice;
        })
        .sort((firstListing, secondListing) => {
          if (filters.sort === "discount") {
            const firstDiscount =
              Number(firstListing.orig) - Number(firstListing.price);
            const secondDiscount =
              Number(secondListing.orig) - Number(secondListing.price);

            return secondDiscount - firstDiscount;
          }

          if (filters.sort === "closing") {
            return String(firstListing.to || "").localeCompare(
              String(secondListing.to || "")
            );
          }

          return String(secondListing.createdAt || "").localeCompare(
            String(firstListing.createdAt || "")
          );
        });

      const quickFilters = `<div class="chips scroll m-only" role="toolbar" aria-label="Deal filters">
        <button class="chip ${!selectedCategories.length ? "is-on" : ""}" data-act="f-cat-all">All</button>
        ${FN.CATEGORIES.map((category) => `
          <button
            class="chip ${selectedCategories.includes(category) ? "is-on" : ""}"
            data-act="f-cat"
            data-v="${category}"
          >${category}</button>
        `).join("")}
      </div>`;

      let body;

      if (isOffline) {
        body = `<div class="empty">
          <span class="ibox round err" style="width:80px;height:80px">
            ${ic("alert", "ic-xl")}
          </span>
          <h2 class="t-h1">Can’t load live deals</h2>
          <p class="t-muted">Check your connection and try again.</p>
        </div>`;
      } else if (!isLoaded) {
        body = `<div class="deal-list" aria-busy="true">
          ${[0, 1, 2].map(() => `
            <div class="card pad-l stack-s">
              <div class="skel" style="height:22px;width:55%"></div>
              <div class="skel" style="height:15px;width:35%"></div>
              <div class="skel" style="height:15px;width:75%"></div>
            </div>
          `).join("")}
        </div>`;
      } else if (U.liveListingsError) {
        body = `<div class="empty">
          <span class="ibox round err" style="width:80px;height:80px">
            ${ic("alert", "ic-xl")}
          </span>
          <h2 class="t-h1">Could not load live deals</h2>
          <p class="t-muted">Please refresh and try again.</p>
        </div>`;
      } else if (!liveListings.length) {
        body = c.empty({
          title: "No live deals match",
          body: "Try another search or category. Vendors usually publish surplus food before closing.",
          actions: `<button class="btn btn-primary" data-act="f-reset">Clear filters</button>`
        });
      } else {
        body = `<div class="deal-list">
          ${liveListings.map(liveListingCard).join("")}
        </div>`;
      }

      return {
        shell: "student",
        nav: "deals",
        html: `${bar({ title: "Nearby Deals", menu: true, home: true })}
        <div class="content">
          <div class="stack" style="width:100%;max-width:900px;margin-inline:auto">
            <button class="row loc" data-act="campus">
              ${ic("pin", "ic-m t-accent")}
              <b>${esc(sel.me().campus)}</b>
              ${ic("down", "ic-s")}
            </button>

            <div class="input search">
              ${ic("search", "ic-m")}
              <input
                id="deals-q"
                type="search"
                data-input="deals-q"
                value="${esc(filters.q)}"
                placeholder="Search live food listings"
                aria-label="Search live food listings"
                autocomplete="off"
              >
            </div>

            ${quickFilters}

            <p class="t-small t-muted">
              ${isLoaded ? `${liveListings.length} live Firestore listing${liveListings.length === 1 ? "" : "s"} available now` : "Loading live Firestore listings..."}
            </p>

            ${body}
          </div>
        </div>`
      };
    },

        liveFood({ id }) {
      const listing = (U.liveListings || []).find(
        (item) => item.id === id
      );

      if (!listing) {
        if (!U.liveListingDetailLoading && FN.loadVisibleListings) {
          U.liveListingDetailLoading = true;

          FN.loadVisibleListings()
            .then((listings) => {
              U.liveListings = listings;
            })
            .catch((error) => {
              console.error("Failed to load live listing detail:", error);
            })
            .finally(() => {
              U.liveListingDetailLoading = false;

              if (FN.route.name === "live-food") {
                FN.render(true);
              }
            });
        }

        return {
          shell: "student",
          nav: "deals",
          html: `${bar({ title: "Food details", back: true, home: true })}
          <div class="content">
            <div class="empty">
              <span class="ibox round">${ic("bag", "ic-xl")}</span>
              <h2 class="t-h1">Loading listing</h2>
              <p class="t-muted">Getting the latest information from Firestore.</p>
            </div>
          </div>`
        };
      }

      const originalPrice = Number(listing.orig || 0);
      const discountedPrice = Number(listing.price || 0);
      const quantityLeft = Number(listing.left || 0);
      const isReserved = (U.liveReservationIds || []).includes(listing.id);
      const discountPercentage = originalPrice > 0
        ? Math.round((1 - discountedPrice / originalPrice) * 100)
        : 0;

      return {
        shell: "student",
        nav: "deals",
        bar: true,
        html: `${bar({ title: "Food details", back: true, home: true })}
        <div class="content">
          <div class="split">
            <div class="stack" style="min-width:0">
              <section class="card pad-l stack">
                <div class="row" style="gap:14px;align-items:flex-start">
                  ${c.ibox("bag", "accent")}
                  <div class="grow stack-s">
                    <div class="row between">
                      <h1 class="t-h1">${esc(listing.name || "Untitled listing")}</h1>
                      ${c.badge("stock", `${quantityLeft} left`)}
                    </div>
                    <span class="t-muted">
                      ${esc(listing.category || "Food")} · Live Firestore listing
                    </span>
                  </div>
                </div>

                <div class="row wrap" style="gap:8px">
                  ${c.price(discountedPrice, originalPrice, true)}
                  ${c.badge("discount", `${discountPercentage}% OFF`)}
                </div>

                <hr class="divider">

                <div class="row" style="gap:12px">
                  ${c.ibox("clock")}
                  <div class="stack-s" style="gap:0">
                    <span class="t-caption t-muted">Collection time</span>
                    <b>Today, ${time.range(listing.from, listing.to)}</b>
                  </div>
                </div>

                <div class="row" style="gap:12px">
                  ${c.ibox("bag")}
                  <div class="stack-s" style="gap:0">
                    <span class="t-caption t-muted">Quantity available</span>
                    <b>${quantityLeft} portion${quantityLeft === 1 ? "" : "s"} left</b>
                  </div>
                </div>
              </section>

              <section class="card pad-l stack-s">
                <h2 class="t-h2">About this item</h2>
                <p class="t-muted">
                  ${esc(
                    listing.description ||
                    "Fresh surplus food available for collection today."
                  )}
                </p>
                <span class="meta" style="color:var(--success)">
                  ${ic("check", "ic-s")}
                  <span>Published by a verified FoodieNoms vendor</span>
                </span>
              </section>

${isReserved
  ? `<div class="banner ok">
      ${ic("check", "ic-m")}
      <span>Reservation confirmed. Your pickup is ${time.range(listing.from, listing.to)}.</span>
    </div>`
  : quantityLeft > 0
    ? `<button
        class="btn btn-primary btn-block"
        data-act="reserve-live-listing"
        data-id="${esc(listing.id)}"
      >
        Reserve 1 portion · ${rm(discountedPrice)}
      </button>`
    : `<button class="btn btn-secondary btn-block" disabled>
        Sold out
      </button>`
}

<button class="btn btn-secondary" data-go="deals">
  Back to live deals
</button>
            </div>
          </div>
        </div>`
      };
    },

    vendor({ id }) {
      const v = sel.vendor(id); if (!v) return FN.notFound();
      U.lastVendor = id;
      const ls = sel.listingsOf(id, true).filter(l => l.visible);
      const r = sel.rating(id); const revs = sel.reviewsOf(id).slice(0, 2);
      const mine = S.basket.vendorId === id; const t = sel.basketTotals(); const other = S.basket.vendorId && !mine ? sel.vendor(S.basket.vendorId) : null;
      const ab = other
        ? `<div class="actionbar m-only"><span class="grow t-small">Basket from <b>${esc(other.name)}</b></span><button class="btn btn-secondary btn-sm" data-go="basket">View basket</button></div>`
        : `<div class="actionbar m-only"><button class="pickup-pill" data-act="slots" ${mine ? '' : 'disabled'}><span class="t-caption t-muted">Pickup time</span><b class="row" style="gap:4px">${mine && S.basket.slot ? time.slotRange(S.basket.slot) : 'Choose after adding'}${ic('down', 'ic-s')}</b></button><button class="btn btn-primary" data-go="basket" id="basket-btn" ${mine ? '' : 'disabled'}>View basket${mine ? ` · ${sel.basketCount()}` : ''}</button></div>`;
      return { shell: 'student', nav: 'deals', bar: true, html: `${bar({ back: true, home: true, title: '', right: saveBtn(id) })}
      <div class="content">
        <div class="split">
          <div class="stack" style="min-width:0">
            <section class="card vendor-head">
              ${vendorPh(v, 116, 100)}
              <div class="grow stack-s" style="gap:3px">
                <h1 class="t-h1">${esc(v.name)}</h1>
                <button class="meta ink" data-go="reviews/${id}" style="align-self:flex-start">${c.rating(id)}<span class="t-brand" style="text-decoration:underline">${r.count} reviews</span><span class="t-muted">· ${v.cat}</span></button>
                <span class="meta">${ic('clock', 'ic-s')}<span>Closes ${time.fmt(v.closes)} · <b class="${urgent(v) ? 't-accent' : ''}">${time.left(v.closes)}</b></span></span>
                <span class="meta">${ic('pin', 'ic-s')}<span>${esc(v.area)}</span></span>
                <span class="meta">${ic('walk', 'ic-s')}<span>${v.walk} min walk · <a href="${mapUrl(v)}" target="_blank" rel="noopener">Directions</a></span></span>
              </div>
            </section>
            <div class="row between"><h2 class="t-h2">Available today</h2>${ls.some(l => l.left) ? c.badge('discount', `Up to ${sel.maxPct(id)}% OFF`) : ''}</div>
            ${ls.length ? `<div class="food-grid">${ls.map(foodCard).join('')}</div>` : c.empty({ title: 'Nothing listed right now', body: `${esc(v.name)} usually lists food an hour before closing. Save the shop to get an alert.` })}
            ${revs.length ? `<section class="card stack-s"><div class="row between"><h2 class="t-h2">What students say</h2><button class="btn-link t-small" data-go="reviews/${id}">See all ${r.count}</button></div>${revs.map(x => `<div class="list-row" style="align-items:flex-start">${c.avatar(x.author)}<div class="grow stack-s" style="gap:2px"><div class="row between"><b class="t-small">${esc(x.author)}</b>${c.stars(x.stars, 'ic-s')}</div><p class="t-small">${esc(x.text)}</p></div></div>`).join('')}</section>` : ''}
          </div>
          <aside class="d-only aside-sticky">${basketSummary()}</aside>
        </div>
      </div>${ab}` };
    },

    food({ id }) {
      const l = sel.listing(id); if (!l) return FN.notFound(); const v = sel.vendor(l.vendorId);
      const inB = S.basket.items[id] || 0; if (U.foodFor !== id) { U.foodFor = id; U.foodQty = inB || 1; }
      const q = Math.min(U.foodQty, Math.max(1, l.left));
      return { shell: 'student', nav: 'deals', bar: true, html: `
      <div class="food-page">
        <div class="food-hero">${c.ph(l, { h: 280, cls: 'full hero-ph', label: '' })}
          <button class="icon-btn on-card fh-back" data-back aria-label="Back">${ic('back', 'ic-l')}</button>
          <span class="fh-save">${saveBtn(v.id, 'icon-btn on-card')}</span></div>
        <div class="content food-body">
          <div class="row wrap" style="gap:6px">${l.left ? c.badge('stock', `${l.left} left`) : c.badge('neutral', 'Sold out')}${c.badge('neutral', l.cat)}</div>
          <h1 class="t-display">${esc(l.name)}</h1>
          <button class="meta ink" data-go="vendor/${v.id}" style="align-self:flex-start">${ic('store', 'ic-s')}<b class="t-brand">${esc(v.name)}</b>${c.rating(v.id)}</button>
          <div class="row wrap">${c.price(l.price, l.orig, true)}${c.badge('discount', `${sel.pct(l)}% OFF`)}</div>
          <section class="card" style="gap:12px">
            <div class="row" style="gap:12px">${c.ibox('bag')}<div class="stack-s" style="gap:0"><span class="t-caption t-muted">Quantity left</span><b>${l.left} of ${l.qty} portion${l.qty > 1 ? 's' : ''}</b></div></div>
            <div class="row" style="gap:12px">${c.ibox('clock')}<div class="stack-s" style="gap:0"><span class="t-caption t-muted">Collection time</span><b>Today, ${time.range(l.from, l.to)}</b></div></div>
            <div class="row" style="gap:12px">${c.ibox('pin')}<div class="stack-s" style="gap:0"><span class="t-caption t-muted">Pickup at</span><b>${esc(v.area)}</b></div></div>
          </section>
          <h2 class="t-h2">About this item</h2>
          <p class="t-muted">${esc(l.desc)}</p>
          <span class="meta" style="color:var(--success)">${ic('check', 'ic-s')}<span>Prepared today · stored by the vendor</span></span>
          <span class="meta">${ic('info', 'ic-s')}<span>Ask the vendor about allergens at pickup.</span></span>
          <div class="d-only row" style="gap:10px;margin-top:8px">${l.left ? `${c.stepper(id, q, l.left, 'food-qty')}<button class="btn btn-primary" data-act="add-food" data-id="${id}">${inB ? 'Update basket' : 'Add to basket'} · ${rm(l.price * q)}</button>` : ''}</div>
        </div>
      </div>
      <div class="actionbar m-only">${l.left ? `${c.stepper(id, q, l.left, 'food-qty')}<button class="btn btn-primary" data-act="add-food" data-id="${id}" id="basket-btn">${inB ? 'Update basket' : 'Add to basket'} · ${rm(l.price * q)}</button>` : `<button class="btn btn-ghost btn-block" data-go="vendor/${v.id}">Sold out · see other items</button>`}</div>` };
    },

    basket() {
      const lines = sel.basketLines();
      if (!lines.length) return { shell: 'student', nav: 'deals', html: `${bar({ title: 'Your basket', back: true })}<div class="content">${c.empty({ title: 'Your basket is empty', body: 'Find surplus food from a vendor near you, then reserve a pickup time.', actions: '<button class="btn btn-primary" data-go="deals">Browse deals</button>' })}</div>` };
      const v = sel.vendor(S.basket.vendorId); const t = sel.basketTotals();
      const method = { ewallet: ['wallet', 'E-wallet'], banking: ['bank', 'Online banking'], card: ['card', 'Debit / credit card'] }[S.pay.method];
      return { shell: 'student', nav: 'deals', bar: true, html: `${bar({ title: 'Your basket', back: true })}
      <div class="content">
        <div class="split">
          <div class="stack" style="min-width:0">
            <section class="card">
              <div class="row" style="gap:10px">${c.ibox('store')}<div class="grow stack-s" style="gap:0"><b>${esc(v.name)}</b><span class="t-caption t-muted">${esc(v.area)}</span></div></div>
              <hr class="divider"><div class="row between">${c.meta('clock', S.basket.slot ? `Pickup today, ${time.slotRange(S.basket.slot)}` : '<span class="t-error">Choose a pickup time</span>', true)}<button class="btn-link t-small" data-act="slots">${S.basket.slot ? 'Change' : 'Choose'}</button></div>
            </section>
            <h2 class="t-h2">Order summary</h2>
            <section class="card">
              ${lines.map(x => `<div class="row" style="gap:12px">${c.ph(x.l, { w: 60, h: 60 })}<div class="grow stack-s" style="gap:2px"><b>${esc(x.l.name)}</b>${c.price(x.l.price, x.l.orig)}</div>${c.stepper(x.l.id, x.qty, x.l.left)}</div>`).join('<hr class="divider">')}
              <button class="row t-small t-brand t-strong" data-go="vendor/${v.id}" style="gap:6px">${ic('plus', 'ic-s')}Add more from this vendor</button>
            </section>
          </div>
          <div class="stack aside-sticky">
            <section class="card" style="gap:8px">
              <div class="kv"><span>Original price</span><span class="num">${rm(t.orig)}</span></div>
              <div class="kv"><span>Surplus discount</span><span class="num t-accent">− ${rm(t.saved)}</span></div>
              <hr class="divider"><div class="kv total"><span>Total to pay</span><span class="num">${rm(t.total)}</span></div>
              <div class="banner ok">${ic('leaf', 'ic-m')}<span>You save ${rm(t.saved)} and rescue ${t.meals} meal${t.meals > 1 ? 's' : ''}</span></div>
            </section>
            <button class="card press row" data-go="pay" style="flex-direction:row;align-items:center;gap:12px">${c.ibox(method[0], 'accent')}<span class="grow stack-s" style="gap:2px"><b>${method[1]}</b>${c.badge('pending', 'Test mode')}</span>${ic('chevron', 'ic-m t-brand')}</button>
            <button class="btn btn-primary btn-block d-only" data-act="checkout">Reserve & pay · ${rm(t.total)}</button>
          </div>
        </div>
      </div>
      <div class="actionbar m-only"><button class="btn btn-primary btn-block" data-act="checkout">Reserve & pay · ${rm(t.total)}</button></div>` };
    },

    pay() {
      if (!sel.basketCount()) return FN.redirect('basket');
      const t = sel.basketTotals(); const v = sel.vendor(S.basket.vendorId); const m = S.pay.method;
      const opt = (val, icon, name, desc) => `<button class="option ${m === val ? 'is-on' : ''}" role="radio" aria-checked="${m === val}" data-act="pay-method" data-v="${val}">${c.ibox(icon)}<span class="grow stack-s" style="gap:0"><b>${name}</b><span class="t-caption t-muted">${desc}</span></span><span class="radio"></span></button>`;
      return { shell: 'student', nav: 'deals', bar: true, html: `${bar({ title: 'Payment', back: true, noBell: true })}
      <div class="content narrow">
        <div class="banner">${ic('info', 'ic-m')}<span>Test mode: payments are simulated by the gateway sandbox. No real money is charged.</span></div>
        <section class="card t-center" style="align-items:center;gap:2px"><span class="t-small t-muted">Amount to pay</span><span class="t-display num">${rm(t.total)}</span><span class="t-caption t-muted">${esc(v.name)} · pickup ${time.slotRange(S.basket.slot)}</span></section>
        <h2 class="t-h2">Choose a method</h2>
        <div class="stack" role="radiogroup" aria-label="Payment method">${opt('ewallet', 'wallet', 'E-wallet', 'Simulated e-wallet checkout')}${opt('banking', 'bank', 'Online banking', 'Simulated bank redirect')}${opt('card', 'card', 'Debit / credit card', 'Sandbox test card')}</div>
        <section class="sandbox"><div class="row between"><b class="t-small">Sandbox outcome</b><span class="t-caption t-muted">for demos and testing</span></div>${c.seg([['success', 'Payment succeeds'], ['fail', 'Payment fails']], S.pay.outcome, 'pay-outcome')}</section>
        <span class="meta">${ic('lock', 'ic-s')}<span>The gateway handles card details. FoodieNoms never stores them.</span></span>
        <button class="btn btn-primary btn-block d-only" data-go="pay/processing">Pay ${rm(t.total)}</button>
      </div>
      <div class="actionbar m-only"><button class="btn btn-primary btn-block" data-go="pay/processing">Pay ${rm(t.total)}</button></div>` };
    },

    processing() {
      if (!sel.basketCount()) return FN.redirect('home');
      setTimeout(() => {
        if (FN.route.name !== 'processing') return;
        if (S.pay.outcome === 'fail') { U.holdUntil = Date.now() + 10 * 60 * 1000; S.pay.outcome = 'success'; FN.save(); FN.go('pay/failed', { replace: true }); }
        else { const o = act.placeOrder(); FN.go('confirmed/' + o.id, { replace: true }); }
      }, 1700);
      return { shell: 'bare', html: `<div class="processing" role="status"><div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" class="track"/><circle cx="60" cy="60" r="54" class="arc"/></svg><img src="assets/logo/logo-mark.png" alt=""></div><h1 class="t-h1">Confirming your payment…</h1><p class="t-muted">Please keep the app open. This usually takes a few seconds.</p></div>` };
    },

    failed() {
      if (!sel.basketCount()) return FN.redirect('home');
      const line = sel.basketLines()[0];
      return { shell: 'student', nav: 'deals', bar: true, html: `${bar({ title: 'Payment', noBell: true, right: `<button class="icon-btn" data-go="basket" aria-label="Close">${ic('x', 'ic-l')}</button>` })}
      <div class="content narrow center-col">
        <span class="ibox round err" style="width:88px;height:88px">${ic('alert', 'ic-xl')}</span>
        <h1 class="t-h1 t-center">Payment didn’t go through</h1>
        <p class="t-muted t-center">You weren’t charged. We’re holding your ${esc(line.l.name)} for a few more minutes.</p>
        <span class="badge badge-pending" style="font-size:14px;padding:8px 14px">${ic('clock', 'ic-s')} Held for <b class="num" id="hold">10:00</b></span>
        <section class="card full"><span class="t-caption t-muted">Reason from gateway (test)</span><b>Insufficient balance in e-wallet</b></section>
        <div class="stack full d-only"><button class="btn btn-primary" data-go="pay/processing">Try again</button><button class="btn btn-secondary" data-go="pay">Use another method</button><button class="btn btn-ghost" data-act="cancel-hold">Cancel reservation</button></div>
      </div>
      <div class="actionbar col m-only"><button class="btn btn-primary" data-go="pay/processing">Try again</button><button class="btn btn-secondary" data-go="pay">Use another method</button><button class="btn btn-ghost" data-act="cancel-hold">Cancel reservation</button></div>`,
      after: () => {
        const tick = () => { const el = document.getElementById('hold'); if (!el) return; const ms = Math.max(0, (U.holdUntil || Date.now()) - Date.now()); el.textContent = `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`; if (ms > 0) setTimeout(tick, 1000); };
        tick();
      } };
    },

    confirmed({ id }) {
      const o = sel.order(id); if (!o) return FN.notFound(); const v = sel.vendor(o.vendorId);
      const saved = sel.origTotal(o) - sel.total(o); const meals = o.items.reduce((a, i) => a + i.qty, 0);
      return { shell: 'student', nav: 'orders', bar: true, html: `
      <div class="content narrow center-col confirm">
        <div class="stamp-stage" aria-hidden="true"><img class="cm" src="assets/logo/logo-mark.png" alt=""><img class="stamp" src="assets/logo/badge.png" alt=""></div>
        <h1 class="t-display t-center">Reservation confirmed!</h1>
        <p class="t-muted t-center">Show your pickup code at the counter to collect your food.</p>
        <section class="card full">
          <div class="row between"><b>${esc(v.name)}</b>${c.status(o)}</div>
          ${c.meta('bag', `${esc(sel.itemsText(o))} · ${rm(sel.total(o))}`, true)}
          ${c.meta('clock', `Today, ${time.slotRange(o.slot)}`, true)}
          ${c.meta('receipt', `Order #${o.id} · pickup code <b>${o.code}</b>`, true)}
        </section>
        <section class="hero-card full"><p class="t-small" style="opacity:.85">Your impact from this order</p><div class="stats-3">
          <div class="stat">${ic('wallet', 'ic-m t-brand')}<span class="stat-v" data-count="${saved.toFixed(2)}" data-dec="2" data-pre="RM">${rm(saved)}</span><span class="stat-l">Saved</span></div>
          <div class="stat">${ic('leaf', 'ic-m t-brand')}<span class="stat-v" data-count="${(meals * FN.CO2_PER_MEAL_KG).toFixed(1)}" data-dec="1" data-pre="~" data-suf=" kg">~${(meals * FN.CO2_PER_MEAL_KG).toFixed(1)} kg</span><span class="stat-l">CO₂ prevented</span></div>
          <div class="stat">${ic('meal', 'ic-m t-brand')}<span class="stat-v" data-count="${meals}" data-pre="+">+${meals}</span><span class="stat-l">Meal${meals > 1 ? 's' : ''} saved</span></div></div></section>
        <div class="stack full d-only"><button class="btn btn-primary" data-go="order/${o.id}">View pickup code</button><button class="btn btn-secondary" data-go="home">Back to home</button></div>
      </div>
      <div class="actionbar col m-only"><button class="btn btn-primary" data-go="order/${o.id}">View pickup code</button><button class="btn btn-secondary" data-go="home" data-reset>Back to home</button></div>`,
      after: root => { FN.motion.countUp(root); } };
    },

    orders() {
      const reservationState = loadStudentReservations();
      const reservations = reservationState.reservations;
      const active = reservations.filter((reservation) => reservation.status !== 'collected');
      const collected = reservations.filter((reservation) => reservation.status === 'collected');
      return { shell: 'student', nav: 'orders', html: `${bar({ title: 'Order History', back: true })}
      <div class="content narrow">
        ${!reservationState.loaded ? `<div class="empty"><span class="ibox round">${ic('clock', 'ic-xl')}</span><h2 class="t-h1">Loading reservations</h2><p class="t-muted">Getting your latest Firestore reservations.</p></div>` : ''}
        ${reservationState.error ? c.empty({ title: 'Could not load reservations', body: 'Please sign in as a student and try again.', actions: '<button class="btn btn-primary" data-go="login">Log in</button>' }) : ''}
        ${reservationState.loaded && !reservationState.error && active.length ? `<p class="t-small t-muted">Awaiting pickup</p><div class="stack-s">${active.map(liveReservationCard).join('')}</div>` : ''}
        ${reservationState.loaded && !reservationState.error && collected.length ? `<p class="t-small t-muted">Collected</p><div class="stack-s">${collected.map(liveReservationCard).join('')}</div>` : ''}
        ${reservationState.loaded && !reservationState.error && !reservations.length ? c.empty({ title: 'No reservations yet', body: 'Reserve surplus food from a nearby vendor and it will show up here.', actions: '<button class="btn btn-primary" data-go="deals">Browse deals</button>' }) : ''}
      </div>` };
    },

    order({ id }) {
      const o = sel.order(id); if (!o) return FN.notFound(); const v = sel.vendor(o.vendorId);
      const steps = [['Reserved & paid', time.clock(o.createdAt), true], ['Vendor preparing', '', o.status !== 'cancelled'], ['Ready for pickup', time.slotRange(o.slot), ['ready', 'collected'].includes(o.status)], ['Collected', o.status === 'collected' ? 'Done' : '—', o.status === 'collected']];
      const active = sel.isActive(o);
      return { shell: 'student', nav: 'orders', bar: active || (o.status === 'collected' && !o.rated), html: `${bar({ title: 'Order #' + o.id, back: true })}
      <div class="content narrow">
        ${active ? `<section class="card t-center code-card" style="align-items:center">
          <span class="t-small t-muted">Show this at the counter</span>${c.qr(o.code)}
          <span class="pickup-code num" aria-label="Pickup code ${o.code.split('').join(' ')}">${o.code}</span>${c.status(o)}
          <span class="t-caption t-muted">Pickup ${time.slotRange(o.slot)} · ${esc(v.area)}</span></section>`
        : `<section class="card row" style="flex-direction:row;gap:12px">${c.ibox(o.status === 'collected' ? 'check' : 'x', o.status === 'collected' ? '' : 'err')}<div class="grow stack-s" style="gap:2px"><b>${o.status === 'collected' ? 'Collected — enjoy your food!' : o.status === 'cancelled' ? 'This order was cancelled' : 'Not collected'}</b><span class="t-small t-muted">${o.status === 'cancelled' ? 'No charge was kept for this test order.' : time.dayLabel(o.createdAt) + ', ' + time.slotRange(o.slot)}</span></div></section>`}
        ${o.status !== 'cancelled' ? `<section class="card timeline" aria-label="Order status">${steps.map(([l, tm, done], i) => `<div class="tl-row ${done ? 'done' : ''}"><span class="tl-dot"></span>${i < steps.length - 1 ? '<span class="tl-line"></span>' : ''}<span class="grow ${done ? 't-strong' : 't-muted'}">${l}</span><span class="t-caption t-muted">${tm}</span></div>`).join('')}</section>` : ''}
        <section class="card" style="gap:8px">
          <div class="kv"><span>${esc(v.name)}</span><span>${esc(v.area.split(',')[0])}</span></div>
          ${o.items.map(i => `<div class="kv"><span>${i.qty} × ${esc(i.name)}</span><span class="num">${rm(i.price * i.qty)}</span></div>`).join('')}
          <div class="kv"><span>You saved</span><span class="num t-accent">${rm(sel.origTotal(o) - sel.total(o))}</span></div>
          <div class="kv"><span>Paid with</span><span>${esc(o.method)} (test)</span></div>
          <div class="kv"><span>Vendor contact</span><span class="num" style="user-select:all">${esc(v.phone)}</span></div>
        </section>
        <div class="d-only row">${active ? `<a class="btn btn-ghost" href="${mapUrl(v)}" target="_blank" rel="noopener">Directions</a><button class="btn btn-secondary" data-act="cancel-order" data-id="${o.id}">Cancel order</button>` : (o.status === 'collected' && !o.rated ? `<button class="btn btn-primary" data-go="review/${o.id}">Rate ${esc(v.name)}</button>` : '')}</div>
      </div>
      ${active ? `<div class="actionbar m-only"><a class="btn btn-ghost" href="${mapUrl(v)}" target="_blank" rel="noopener">Directions</a><button class="btn btn-secondary" data-act="cancel-order" data-id="${o.id}">Cancel order</button></div>` : (o.status === 'collected' && !o.rated ? `<div class="actionbar m-only"><button class="btn btn-primary btn-block" data-go="review/${o.id}">Rate ${esc(v.name)}</button></div>` : '')}` };
    },

    impact() {
      const p = U.impactPeriod; const im = sel.impact(p); const lb = sel.leaderboard(); const me = lb.find(x => x.me);
      const label = { day: 'Today', month: time.now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), year: String(time.now.getFullYear()) }[p];
      const top = lb.slice(0, 5); if (me.rank > 5) top.push(me);
      return { shell: 'student', nav: 'impact', html: `${bar({ title: 'Impact Summary', back: true })}
      <div class="content narrow">
        ${c.seg([['day', 'Daily'], ['month', 'Monthly'], ['year', 'Yearly']], p, 'impact-period')}
        <section class="hero-card"><div class="row between"><div class="stack-s" style="gap:2px"><span class="t-small" style="opacity:.85">${label}</span><span class="t-display"><span data-count="${im.meals}">${im.meals}</span> meal${im.meals === 1 ? '' : 's'} rescued</span><span class="t-small" style="opacity:.85">${im.meals ? 'Kept out of the bin and onto a plate.' : 'Reserve a deal to start counting.'}</span></div><img class="hero-mark lg" src="assets/logo/logo-mark.png" alt=""></div></section>
        ${[['wallet', 'Total saved', `<span data-count="${im.saved.toFixed(2)}" data-dec="2" data-pre="RM">${rm(im.saved)}</span>`, 'accent'], ['leaf', 'CO₂ prevented (est.)', `<span data-count="${im.co2.toFixed(1)}" data-dec="1" data-suf=" kg">${im.co2.toFixed(1)} kg</span>`, ''], ['meal', 'Meals saved', `<span data-count="${im.meals}">${im.meals}</span>`, 'sunk']].map(([i, l, v, k]) => `<section class="card row" style="flex-direction:row;gap:12px">${c.ibox(i, k)}<span class="grow t-muted">${l}</span><b class="price-now num" style="color:var(--text)">${v}</b></section>`).join('')}
        <p class="t-caption t-muted">CO₂ uses an estimate of ${FN.CO2_PER_MEAL_KG} kg per rescued meal.</p>
        <section class="card"><div class="row between"><h2 class="t-h2">Monthly leaderboard</h2>${c.badge('neutral', 'For fun · no rewards')}</div>
          ${top.map(r => `<div class="row lb-row ${r.me ? 'me' : ''}"><b class="lb-rank num ${r.rank === 1 ? 't-accent' : 't-muted'}">${r.rank}</b>${c.avatar(r.name, r.me)}<b class="grow">${esc(r.name)}</b><span class="t-small t-muted num">${r.meals} meals</span></div>`).join('')}
        </section>
      </div>`, after: root => FN.motion.countUp(root) };
    },

    notifications() {
      const tab = U.notifTab; const all = sel.notifs('u1');
      const list = all.filter(n => tab === 'all' || (tab === 'orders' ? n.kind === 'order' : n.kind === 'deal'));
      const today = list.filter(n => time.isToday(n.at)), earlier = list.filter(n => !time.isToday(n.at));
      const row = n => `<button class="notif ${n.read ? '' : 'unread'}" data-act="open-notif" data-id="${n.id}">${c.ibox(n.icon, n.kind === 'order' ? 'accent round' : 'round')}<span class="grow stack-s" style="gap:2px"><span class="row between"><b>${esc(n.title)}</b><span class="t-caption t-muted">${time.isToday(n.at) ? time.clock(n.at) : time.dayLabel(n.at)}</span></span><span class="t-small t-muted">${esc(n.body)}</span></span>${n.read ? '' : '<span class="udot" aria-label="Unread"></span>'}</button>`;
      return { shell: 'student', nav: 'notifications', html: `${bar({ title: 'Notifications', back: true, noBell: true, right: `<button class="icon-btn" data-go="settings" aria-label="Notification settings">${ic('settings', 'ic-l')}</button>` })}
      <div class="content narrow">
        <div class="row between wrap"><div class="chips">${[['all', 'All'], ['orders', 'Orders'], ['deals', 'New deals']].map(([v, l]) => `<button class="chip ${tab === v ? 'is-on' : ''}" data-act="notif-tab" data-v="${v}">${l}</button>`).join('')}</div>${sel.unread('u1') ? '<button class="btn-link t-small" data-act="read-all" data-v="u1">Mark all as read</button>' : ''}</div>
        ${today.length ? `<p class="t-small t-muted">Today</p><div class="stack-s">${today.map(row).join('')}</div>` : ''}
        ${earlier.length ? `<p class="t-small t-muted">Earlier</p><div class="stack-s">${earlier.map(row).join('')}</div>` : ''}
        ${!list.length ? c.empty({ art: false, title: 'You’re all caught up', body: 'Order updates and new deals from nearby vendors will appear here.' }) : ''}
      </div>` };
    },

    saved() {
      const vs = S.db.saved.map(sel.vendor).filter(Boolean);
      return { shell: 'student', nav: 'saved', html: `${bar({ title: 'Saved Shops', back: true })}
      <div class="content narrow">
        <section class="card row" style="flex-direction:row;gap:12px">${c.ibox('bell', 'round')}<span class="grow stack-s" style="gap:0"><b>Alert me when saved shops list food</b><span class="t-caption t-muted">Push notification when a new deal goes live</span></span>${c.toggle(S.db.settings.savedAlerts, 'set-toggle', 'data-k="savedAlerts"', 'Saved shop alerts')}</section>
        ${vs.map(v => { const n = sel.listingsOf(v.id).length; return `<article class="card row saved-row" style="flex-direction:row;gap:12px"><button class="row grow" data-go="vendor/${v.id}" style="gap:12px;text-align:left">${vendorPh(v, 64, 64)}<span class="grow stack-s" style="gap:3px"><b>${esc(v.name)}</b><span class="meta ink">${c.rating(v.id)}<span class="t-muted">· ${v.cat}</span></span>${n ? c.badge('stock', `${n} item${n > 1 ? 's' : ''} available`) : c.badge('neutral', 'No listings yet today')}</span></button><button class="icon-btn" style="background:var(--accent-soft);color:var(--accent-text)" data-act="unsave" data-id="${v.id}" aria-label="Remove ${esc(v.name)}"><svg class="ic ic-m" style="fill:currentColor" aria-hidden="true"><use href="#i-heart"></use></svg></button></article>`; }).join('')}
        ${!vs.length ? c.empty({ title: 'No saved shops yet', body: 'Tap the bookmark on a vendor to follow their surplus deals.', actions: '<button class="btn btn-primary" data-go="deals">Find vendors</button>' }) : ''}
      </div>` };
    },

    reviews({ id }) {
      const v = sel.vendor(id); if (!v) return FN.notFound(); const r = sel.rating(id);
      let list = sel.reviewsOf(id);
      if (U.reviewSort === 'high') list = list.slice().sort((a, b) => b.stars - a.stars); if (U.reviewSort === 'low') list = list.slice().sort((a, b) => a.stars - b.stars);
      const dist = [5, 4, 3, 2, 1].map(k => { const base = { 5: .6, 4: .24, 3: .1, 2: .04, 1: .02 }[k]; return [k, base]; });
      return { shell: 'student', nav: 'deals', html: `${bar({ title: 'Reviews', back: true })}
      <div class="content narrow">
        <p class="t-strong">${esc(v.name)}</p>
        <section class="card row" style="flex-direction:row;gap:18px"><div class="stack-s t-center" style="align-items:center;gap:2px"><span class="t-display num">${r.avg.toFixed(1)}</span>${c.stars(r.avg)}<span class="t-caption t-muted">${r.count} reviews</span></div>
          <div class="grow stack-s" style="gap:5px">${dist.map(([k, w]) => `<div class="row" style="gap:8px"><span class="t-caption t-muted num">${k}</span><div class="bar grow"><i style="width:${Math.round(w * 100)}%;background:var(--accent)"></i></div></div>`).join('')}</div></section>
        <div class="chips">${[['recent', 'Most recent'], ['high', 'Highest'], ['low', 'Lowest']].map(([k, l]) => `<button class="chip ${U.reviewSort === k ? 'is-on' : ''}" data-act="review-sort" data-v="${k}">${l}</button>`).join('')}</div>
        ${list.map(x => `<article class="card" style="gap:8px"><div class="row" style="gap:10px">${c.avatar(x.author, x.mine)}<div class="grow stack-s" style="gap:0"><b>${esc(x.author)}${x.mine ? ' <span class="badge badge-stock">You</span>' : ''}</b><span class="t-caption t-muted">${time.dayLabel(x.createdAt)}</span></div>${c.stars(x.stars)}</div>${x.text ? `<p>${esc(x.text)}</p>` : ''}${x.tags && x.tags.length ? `<div class="row wrap" style="gap:6px">${x.tags.map(t => c.badge('neutral', esc(t))).join('')}</div>` : ''}${x.reply ? `<div class="reply"><span class="t-caption t-brand t-strong">Reply from ${esc(v.name)}</span><p class="t-small">${esc(x.reply)}</p></div>` : ''}</article>`).join('')}
      </div>` };
    },

    review({ id }) {
      const o = sel.order(id); if (!o) return FN.notFound(); const v = sel.vendor(o.vendorId);
      if (o.rated) return { shell: 'student', nav: 'orders', html: `${bar({ title: 'Rate your pickup', back: true })}<div class="content narrow">${c.empty({ title: 'Thanks, already rated', body: 'You have reviewed this order. You can see it on the vendor’s reviews.', actions: `<button class="btn btn-primary" data-go="reviews/${v.id}">See reviews</button>` })}</div>` };
      U.rv = U.rv && U.rv.id === id ? U.rv : { id, stars: 0, tags: [], text: '', photo: null };
      const R = U.rv; const words = ['Tap a star to rate', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
      return { shell: 'student', nav: 'orders', bar: true, html: `${bar({ title: 'Rate your pickup', noBell: true, right: `<button class="icon-btn" data-back aria-label="Close">${ic('x', 'ic-l')}</button>` })}
      <form class="content narrow" data-form="review" novalidate>
        <div class="row" style="gap:12px">${vendorPh(v, 56, 56)}<div class="stack-s" style="gap:0"><b>${esc(v.name)}</b><span class="t-caption t-muted">${esc(sel.itemsText(o))} · collected ${time.dayLabel(o.createdAt).toLowerCase()}</span></div></div>
        <section class="card t-center" style="align-items:center"><h2 class="t-h2">How was it?</h2>
          <div class="stars input-stars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(k => `<button type="button" role="radio" aria-checked="${R.stars === k}" aria-label="${k} star${k > 1 ? 's' : ''}" data-act="rv-star" data-v="${k}">${FN.starIc(k <= R.stars, 'ic-xl')}</button>`).join('')}</div>
          <b class="${R.stars ? 't-accent' : 't-muted'}" id="rv-word">${words[R.stars]}</b></section>
        <b>What went well?</b>
        <div class="chips">${['Food quality', 'Fresh', 'Quick pickup', 'Friendly staff', 'Good value', 'Clean & hygienic'].map(x => `<button type="button" class="chip ${R.tags.includes(x) ? 'is-on' : ''}" data-act="rv-tag" data-v="${x}" aria-pressed="${R.tags.includes(x)}">${x}</button>`).join('')}</div>
        <div class="field"><label for="rv-text">Your review (optional)</label><div class="input area"><textarea id="rv-text" maxlength="300" data-input="rv-text" placeholder="What should other students know?">${esc(R.text)}</textarea></div><span class="field-hint" id="rv-count">${R.text.length} / 300</span></div>
        <label class="row t-strong t-accent" style="gap:10px;cursor:pointer" for="rv-photo">${R.photo ? `<img src="${R.photo}" alt="Your photo" style="width:56px;height:56px;border-radius:12px;object-fit:cover">` : c.ibox('camera', 'sunk')}${R.photo ? 'Change photo' : 'Add a photo'}<input id="rv-photo" type="file" accept="image/*" class="sr-only" data-input="rv-photo"></label>
        <button class="btn btn-primary btn-block d-only" type="submit">Submit review</button>
      </form>
      <div class="actionbar m-only"><button class="btn btn-primary btn-block" data-act="submit-review">Submit review</button></div>` };
    },

    profile() {
      const me = sel.me(); const os = sel.myOrders().filter(o => o.status !== 'cancelled'); const all = sel.impact('all');
      const revs = sel.myOrders().filter(o => o.rated).length;
      return { shell: 'student', nav: 'profile', html: `${bar({ title: 'My Profile', back: true, noBell: true, right: `<button class="icon-btn" data-go="settings" aria-label="Settings">${ic('settings', 'ic-l')}</button>` })}
      <div class="content narrow">
        <div class="stack-s" style="align-items:center;gap:8px">${c.avatar(me.name, false, 'lg')}<h2 class="t-h1">${esc(me.name)}</h2><span>${c.badge('stock', 'Student account')}</span></div>
        <div class="stats-3">${[[os.length, 'Orders'], [rm(all.saved), 'Saved'], [revs, 'Reviews']].map(([v, l]) => `<div class="stat card t-center" style="align-items:center"><span class="stat-v">${v}</span><span class="stat-l">${l}</span></div>`).join('')}</div>
        <section class="card" style="gap:12px">
          <div class="row between"><b>Account details</b><button class="btn-link t-small" data-act="edit-profile">Edit</button></div>
          ${[['mail', 'Email', me.email], ['pin', 'University', me.campus], ['phone', 'Phone', me.phone]].map(([i, l, v]) => `<div class="row" style="gap:12px">${ic(i, 'ic-m t-muted')}<div class="stack-s grow" style="gap:0"><span class="t-caption t-muted">${l}</span><b style="overflow-wrap:anywhere">${esc(v)}</b></div></div>`).join('')}
        </section>
        <section class="card" style="padding-block:4px">${[['receipt', 'Order history', 'orders'], ['heart', 'Saved shops', 'saved'], ['trophy', 'Impact summary', 'impact'], ['settings', 'Settings', 'settings']].map(([i, l, g]) => `<button class="list-row" data-go="${g}">${ic(i, 'ic-m t-brand')}<span class="grow">${l}</span>${ic('chevron', 'ic-m t-muted')}</button>`).join('')}</section>
        <button class="btn btn-danger" data-act="logout">Log out</button>
      </div>` };
    },

    settings() {
      const st = S.db.settings; const theme = document.documentElement.getAttribute('data-theme') || 'system';
      const row = (k, l, d) => `<div class="row" style="gap:12px"><div class="grow stack-s" style="gap:0"><b>${l}</b><span class="t-caption t-muted">${d}</span></div>${c.toggle(st[k], 'set-toggle', `data-k="${k}"`, l)}</div>`;
      return { shell: 'student', nav: 'profile', html: `${bar({ title: 'Settings', back: true, noBell: true })}
      <div class="content narrow">
        <h2 class="t-h2">Notifications</h2>
        <section class="card" style="gap:14px">${row('notifOrders', 'Order updates', 'Payment, ready for pickup, reminders')}${row('notifDeals', 'New deals nearby', 'When vendors near you list food')}${row('notifSaved', 'Saved shops', 'Only from vendors you saved')}${row('notifReminder', 'Pickup reminder', '15 minutes before your slot')}</section>
        <h2 class="t-h2">Appearance</h2>
        ${c.seg([['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], theme, 'theme')}
        <h2 class="t-h2">Account</h2>
        <section class="card" style="padding-block:4px">
          <button class="list-row" data-act="edit-profile">${ic('user', 'ic-m t-brand')}<span class="grow">Edit profile</span>${ic('chevron', 'ic-m t-muted')}</button>
          <button class="list-row" data-act="campus">${ic('pin', 'ic-m t-brand')}<span class="grow">Default campus</span><span class="t-small t-muted">${esc(sel.me().campus.split(' ·')[0])}</span></button>
          <button class="list-row" data-act="toast" data-v="We’ve emailed you a link to change your password (demo)">${ic('lock', 'ic-m t-brand')}<span class="grow">Change password</span>${ic('chevron', 'ic-m t-muted')}</button>
          <button class="list-row" data-act="replay-splash">${ic('play', 'ic-m t-brand')}<span class="grow">Replay launch animation</span></button>
          <button class="list-row" data-act="reset-demo">${ic('refresh', 'ic-m t-brand')}<span class="grow">Reset demo data</span></button>
          <button class="list-row" data-act="logout">${ic('logout', 'ic-m t-error')}<span class="grow t-error">Log out</span></button>
        </section>
        <p class="t-caption t-muted">FoodieNoms prototype v1.0 · Capstone Group 39 × TBS EAP Group 21</p>
      </div>` };
    }
  };

  FN.drawerHTML = function () {
    const me = sel.me(); const cur = FN.route.name; const n = sel.unread('u1');
    const item = (i, l, g, extra = '') => `<button class="nav-item ${cur === g ? 'is-on' : ''}" data-go="${g}" data-close>${ic(i, 'ic-l')}<span class="grow">${l}</span>${extra}</button>`;
    return `<nav class="drawer" aria-label="Main menu">
      <button class="row" data-go="profile" data-close style="gap:12px;text-align:left;padding:4px 8px 12px">${c.avatar(me.name, false)}<span class="stack-s" style="gap:0"><b>${esc(me.name)}</b><span class="t-caption t-muted">Student · ${esc(me.campus.split(' ·')[0])}</span></span></button>
      <hr class="divider">
      ${item('home', 'Home', 'home')}${item('tag', 'Nearby Deals', 'deals')}${item('receipt', 'Order History', 'orders')}${item('heart', 'Saved Shops', 'saved')}${item('trophy', 'Impact & Leaderboard', 'impact')}${item('bell', 'Notifications', 'notifications', n ? c.badge('solid', n) : '')}${item('user', 'My Profile', 'profile')}${item('settings', 'Settings', 'settings')}
      <hr class="divider"><button class="nav-item danger" data-act="logout">${ic('logout', 'ic-l')}<span>Log out</span></button>
      <div class="mt-auto" style="padding:12px 8px 0">${c.lockup(false, 22)}</div>
    </nav>`;
  };

  /* ---------- handlers ---------- */
  const rerenderKeep = () => FN.render(true);
  Object.assign(FN.on, {
    drawer() { FN.overlay.open(FN.drawerHTML()); },
    'save-vendor'(el, e) { e.stopPropagation(); const on = act.toggleSaved(el.dataset.id); FN.toast(on ? 'Saved. We’ll alert you when they list food.' : 'Removed from saved shops', { icon: on ? 'heart' : 'bookmark' }); rerenderKeep(); },
    unsave(el) { const id = el.dataset.id; act.toggleSaved(id); rerenderKeep(); FN.toast(`${esc(sel.vendor(id).name)} removed`, { icon: 'heart', action: 'Undo', onAction: () => { act.toggleSaved(id); rerenderKeep(); } }); },
    add(el, e) {
      e.stopPropagation(); const id = el.dataset.id; const res = act.addToBasket(id);
      if (res.conflict) return conflictDialog(id);
      if (res.max) return FN.toast('That’s all the vendor has left', { icon: 'info' });
      const img = el.closest('.food-card') && el.closest('.food-card').querySelector('.ph');
      FN.motion.fly(img, '#basket-btn, .topnav-basket, .basket-aside'); rerenderKeep();
      FN.toast(`${esc(sel.listing(id).name)} added to basket`, { icon: 'bag', action: 'Undo', onAction: () => { act.setQty(id, (S.basket.items[id] || 1) - 1); rerenderKeep(); } });
    },
    qty(el, e) { e.stopPropagation(); act.setQty(el.dataset.id, +el.dataset.q); rerenderKeep(); },
    'food-qty'(el) { U.foodQty = Math.max(1, +el.dataset.q); rerenderKeep(); },
    'add-food'(el) {
      const id = el.dataset.id; const l = sel.listing(id); const b = S.basket;
      if (b.vendorId && b.vendorId !== l.vendorId && sel.basketCount()) return conflictDialog(id, U.foodQty);
      if (b.vendorId !== l.vendorId) { b.vendorId = l.vendorId; b.items = {}; }
      act.setQty(id, U.foodQty); if (!b.slot) act.setSlot(sel.defaultSlot(l.vendorId));
      FN.motion.fly(document.querySelector('.hero-ph'), '.topnav-basket, #basket-btn');
      FN.toast(`${esc(l.name)} × ${U.foodQty} in your basket`, { icon: 'bag', action: 'View', onAction: () => FN.go('basket') });
      rerenderKeep();
    },
        async 'reserve-live-listing'(element) {
      const listingId = element.dataset.id;
      const listing = (U.liveListings || []).find(
        (item) => item.id === listingId
      );

      if (!listing) {
        FN.toast('Listing information is unavailable. Please try again.', {
          icon: 'info'
        });
        return;
      }

      if (!FN.reserveListing) {
        FN.toast('Reservation service is not ready. Please try again.', {
          icon: 'info'
        });
        return;
      }

      if (element.disabled) return;

      const originalText = element.textContent;
      element.disabled = true;
      element.textContent = 'Reserving...';

      try {
        const reservationId = await FN.reserveListing(listing);

        listing.left = Math.max(0, Number(listing.left) - 1);

        U.liveReservationIds = U.liveReservationIds || [];
        U.liveReservationIds.push(listing.id);
        U.liveStudentReservations = null;
        U.liveStudentReservationsError = null;

        console.log('Reservation completed:', reservationId);

        FN.render(true);

        FN.toast('Reservation confirmed. Please collect your food on time.', {
          icon: 'check'
        });
      } catch (error) {
        console.error('Reservation failed:', error);

        const messages = {
          'auth/student-not-signed-in':
            'Please log in as a student first.',
          'auth/student-profile-not-found':
            'Your student profile could not be found.',
          'reservation/already-exists':
            'You have already reserved this listing.',
          'listing/not-found':
            'This listing is no longer available.',
          'listing/sold-out':
            'Sorry, this listing is sold out.',
          'permission-denied':
            'You do not have permission to reserve this listing.'
        };

        FN.toast(
          messages[error.code] ||
          'Reservation failed. Please try again.',
          { icon: 'info' }
        );

        element.disabled = false;
        element.textContent = originalText;
      }
    },
    slots() { if (!S.basket.vendorId) return; slotSheet(); },
    'pick-slot'(el) { act.setSlot(el.dataset.v); if (FN.overlay.isOpen()) { FN.overlay.close(); slotSheet(); } FN.render(true); },
    checkout() { if (!S.basket.slot) { FN.toast('Choose a pickup time first', { icon: 'clock' }); return slotSheet(); } FN.go('pay'); },
    'pay-method'(el) { S.pay.method = el.dataset.v; FN.save(); rerenderKeep(); },
    'pay-outcome'(el) { S.pay.outcome = el.dataset.v; FN.save(); rerenderKeep(); },
    'cancel-hold'() { FN.overlay.confirm({ title: 'Cancel this reservation?', body: 'Your basket will be cleared and the food goes back to other students.', ok: 'Cancel reservation', okClass: 'btn-danger', cancel: 'Keep it', onOk: () => { act.clearBasket(); FN.go('home', { reset: true }); FN.toast('Reservation cancelled', { icon: 'x' }); } }); },
    'cancel-order'(el) { const id = el.dataset.id; FN.overlay.confirm({ title: 'Cancel this order?', body: 'The vendor will be told and the test payment is voided.', ok: 'Cancel order', okClass: 'btn-danger', cancel: 'Keep order', onOk: () => { act.cancelOrder(id); FN.render(true); FN.toast('Order cancelled', { icon: 'x' }); } }); },
    'orders-tab'(el) { U.ordersTab = el.dataset.v; rerenderKeep(); },
    'impact-period'(el) { U.impactPeriod = el.dataset.v; FN.render(true); },
    'notif-tab'(el) { U.notifTab = el.dataset.v; rerenderKeep(); },
    'read-all'(el) { act.readAll(el.dataset.v); rerenderKeep(); },
    'open-notif'(el) { const n = S.db.notifications.find(x => x.id === el.dataset.id); act.readNotif(n.id); n.link ? FN.go(n.link) : rerenderKeep(); },
    'review-sort'(el) { U.reviewSort = el.dataset.v; rerenderKeep(); },
    'rv-star'(el) { U.rv.stars = +el.dataset.v; rerenderKeep(); },
    'rv-tag'(el) { const t = U.rv.tags; const i = t.indexOf(el.dataset.v); i >= 0 ? t.splice(i, 1) : t.push(el.dataset.v); rerenderKeep(); },
    'submit-review'() { FN.onSubmit.review(); },
    'open-filters'() { FN.overlay.sheet('Filter deals', filterPanel(), 'Narrow by food category, price or vendor'); },
    'f-sort'(el) { S.filters.sort = el.dataset.v; filtersChanged(); },
    'f-cat'(el) { const a = S.filters.cats; const i = a.indexOf(el.dataset.v); i >= 0 ? a.splice(i, 1) : a.push(el.dataset.v); filtersChanged(); },
    'f-cat-all'() { S.filters.cats = []; filtersChanged(); },
    'f-price'(el) { S.filters.price = S.filters.price === el.dataset.v ? null : el.dataset.v; filtersChanged(); },
    'f-reset'() { Object.assign(S.filters, { q: '', cats: [], price: null, sort: 'nearest', vendor: '' }); filtersChanged(); },
    noop() {},
    retry() { U.dealsLoaded = false; FN.render(); },
    'alerts-on'() { act.setting('notifDeals', true); FN.toast('Deal alerts on. We’ll notify you when food is listed.', { icon: 'bell' }); },
    campus() {
      FN.overlay.sheet('Choose campus', `<div class="stack">${FN.CAMPUSES.map(x => `<button class="option ${sel.me().campus === x ? 'is-on' : ''}" data-act="set-campus" data-v="${esc(x)}"><span class="radio"></span><span class="grow">${esc(x)}</span></button>`).join('')}</div>`, 'Deals are sorted by walking distance from here.');
    },
    'set-campus'(el) { act.updateMe({ campus: el.dataset.v }); FN.overlay.close(); FN.render(true); FN.toast('Campus updated', { icon: 'pin' }); },
    'set-toggle'(el) { const k = el.dataset.k; const v = el.getAttribute('aria-checked') !== 'true'; act.setting(k, v); el.setAttribute('aria-checked', v); },
    theme(el) { const v = el.dataset.v; if (v === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', v); try { localStorage.setItem('foodienoms:theme', v); } catch (e) { } rerenderKeep(); },
    toast(el) { FN.toast(el.dataset.v, { icon: 'info' }); },
    'edit-profile'() {
      const me = sel.me();
      FN.overlay.sheet('Edit profile', `<form class="stack" data-form="profile" novalidate>${c.field({ id: 'pf-name', label: 'Display name', value: me.name, icon: 'user', err: 'Name can’t be empty' })}${c.field({ id: 'pf-phone', label: 'Phone', type: 'tel', value: me.phone, icon: 'phone' })}${c.select({ id: 'pf-campus', label: 'University', options: FN.CAMPUSES, value: me.campus, icon: 'pin' })}<button class="btn btn-primary btn-block" type="submit">Save changes</button></form>`);
    },
    'replay-splash'() { FN.playSplash(() => FN.render()); },
    'reset-demo'() { FN.overlay.confirm({ title: 'Reset demo data?', body: 'Orders, listings, reviews and settings go back to the sample data. You will be logged out.', ok: 'Reset', okClass: 'btn-danger', onOk: () => { FN.resetDemo(); location.reload(); } }); },
    async logout() {
      FN.overlay.close();
      try {
        if (FN.firebaseSignOut) await FN.firebaseSignOut();
      } catch (error) {
        console.error('Firebase sign-out failed:', error);
      }
      U.liveListings = null;
      U.liveReservationIds = [];
      U.liveStudentReservations = null;
      U.liveVendorListings = null;
      U.liveVendorReservations = null;
      act.logout();
      FN.go('welcome', { reset: true });
      FN.toast('Logged out', { icon: 'logout' });
    }
  });
  function filtersChanged() { FN.save(); FN.render(true); FN.refreshFilters(); }
  function conflictDialog(id, q = 1) {
    const cur = sel.vendor(S.basket.vendorId), nxt = sel.vendor(sel.listing(id).vendorId);
    FN.overlay.confirm({ title: 'Start a new basket?', body: `Your basket has food from ${esc(cur.name)}. Each order is collected from one vendor, so adding from ${esc(nxt.name)} clears it.`, ok: 'Start new basket', cancel: 'Keep current', onOk: () => { act.clearBasket(); act.addToBasket(id, q); FN.render(true); FN.toast('New basket started', { icon: 'bag' }); } });
  }
  Object.assign(FN.onSubmit, {
    review() {
      const R = U.rv; if (!R.stars) { FN.toast('Choose a star rating first', { icon: 'star' }); return; }
      act.submitReview(R.id, R.stars, R.tags, R.text.trim()); const vid = sel.order(R.id).vendorId; U.rv = null;
      FN.go('reviews/' + vid, { replace: true }); FN.toast('Thanks! Your review is live.', { icon: 'star' });
    },
    profile() {
      const name = document.getElementById('pf-name').value.trim(); document.getElementById('f-pf-name').classList.toggle('has-error', !name); if (!name) return;
      act.updateMe({ name, phone: document.getElementById('pf-phone').value.trim(), campus: document.getElementById('pf-campus').value }); FN.overlay.close(); FN.render(true); FN.toast('Profile saved');
    }
  });
  Object.assign(FN.onInput, {
    'deals-q'(el) { S.filters.q = el.value; FN.save(); clearTimeout(U.qT); U.qT = setTimeout(() => { FN.render(true); const i = document.getElementById('deals-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 220); },
    'top-q'(el) { S.filters.q = el.value; FN.save(); clearTimeout(U.qT); U.qT = setTimeout(() => { if (FN.route.name !== 'deals') FN.go('deals'); else FN.render(true); const i = document.getElementById('top-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 260); },
    'f-vendor'(el) { S.filters.vendor = el.value; FN.save(); clearTimeout(U.vT); U.vT = setTimeout(() => { FN.render(true); FN.refreshFilters(); }, 250); },
    'rv-text'(el) { U.rv.text = el.value; const cnt = document.getElementById('rv-count'); if (cnt) cnt.textContent = `${el.value.length} / 300`; },
    'rv-photo'(el) { const f = el.files && el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { U.rv.photo = r.result; rerenderKeep(); }; r.readAsDataURL(f); }
  });
})();
