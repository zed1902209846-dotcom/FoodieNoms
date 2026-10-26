/* Launch animation, welcome, log in and sign-up screens. */
window.FN = window.FN || {};
(function () {
  const { ic, esc, c } = FN;
  FN.ui = FN.ui || {};
  FN.on = FN.on || {}; FN.onSubmit = FN.onSubmit || {}; FN.onInput = FN.onInput || {};
  FN.ui.loginRole = FN.ui.loginRole || 'student';
  FN.ui.role = FN.ui.role || 'student';
  FN.ui.vdraft = FN.ui.vdraft || { name: '', cat: 'Bakery', phone: '', email: '', password: '', address: '', campus: FN.CAMPUSES[0], opens: '08:00', closes: '17:30', photo: null };

  const L = n => `assets/logo/layer-${n}.png`;
  FN.splashHTML = function () {
    return `<div class="splash" id="splash" data-act="skip-splash" role="img" aria-label="FoodieNoms is loading">
      <div class="logo-stage">
        <span class="glow"></span>
        <div class="bag" id="bag">
          <img class="ly handle" src="${L('handle')}" alt="">
          <img class="ly back" src="${L('back')}" alt="">
          <img class="ly real r3" src="${L('pizza')}" alt="">
          <img class="ly food f3" src="assets/logo/food-pizza.svg" alt="">
          <img class="ly real r4" src="${L('coffee')}" alt="">
          <img class="ly food f4" src="assets/logo/food-coffee.svg" alt="">
          <img class="ly real r1" src="${L('donut')}" alt="">
          <img class="ly food f1" src="assets/logo/food-donut.svg" alt="">
          <img class="ly real r2" src="${L('baguette')}" alt="">
          <img class="ly food f2" src="assets/logo/food-baguette.svg" alt="">
          <img class="ly front" src="${L('front')}" alt="">
          <img class="ly heart" src="${L('heart')}" alt="">
          <img class="ly badge" src="${L('badge')}" alt="">
          <img class="ly final" src="${L('final')}" alt="">
        </div>
      </div>
      <img class="word" src="assets/logo/logo-wordmark.png" alt="Foodienoms">
      <p class="tag">Eat good, save more</p>
      <span class="skip">Tap to skip</span>
    </div>`;
  };

  function authShell(panel, { hero = true } = {}) {
    return `<div class="auth">
      ${hero ? `<aside class="auth-hero d-only">
        ${c.lockup(true, 30)}
        <div class="auth-hero-art"><img src="assets/logo/logo-mark.png" alt=""></div>
        <h1 class="auth-hero-title">Good food, rescued before closing.</h1>
        <p class="auth-hero-body">Students reserve discounted surplus food from cafés and bakeries around Subang Jaya and collect it in store. Vendors earn back what would have been thrown away.</p>
        <div class="row wrap">${['tag|20–60% off', 'clock|Pick up before closing', 'leaf|Less food waste'].map(s => { const [i, t] = s.split('|'); return `<span class="hero-pill">${ic(i, 'ic-s')}${t}</span>`; }).join('')}</div>
      </aside>` : ''}
      <div class="auth-panel">${panel}</div>
    </div>`;
  }
  const backBar = (title = '') => `<header class="appbar auth-bar"><div class="side"><button class="icon-btn" data-back aria-label="Back">${ic('back', 'ic-l')}</button></div><h1 class="title">${title}</h1><div class="side r"></div></header>`;

  FN.auth = {
    welcome() {
      const r = FN.ui.role;
      const opt = (v, icn, t1, t2) => `<button class="card press role-card ${r === v ? 'sel' : ''}" data-act="pick-role" data-v="${v}" aria-pressed="${r === v}">
        <span class="row"><span class="ibox ${r === v ? '' : ''}" style="${r === v ? 'background:var(--surface)' : ''}">${ic(icn, 'ic-m')}</span>
        <span class="grow stack-s" style="gap:2px"><b>${t1}</b><span class="t-small t-muted">${t2}</span></span><span class="radio ${r === v ? 'is-on' : ''}"></span></span></button>`;
      return { shell: 'auth', html: authShell(`
        <div class="content auth-content">
          <div class="welcome-art m-only"><img src="assets/logo/logo-full.png" alt="Foodienoms"></div>
          <div class="stack-s"><h1 class="t-display">Rescue good food near campus</h1>
          <p class="t-muted">Cafés and bakeries list their unsold food before closing. You reserve it at a discount and collect it in store.</p></div>
          <p class="t-strong">How will you use FoodieNoms?</p>
          <div class="stack">${opt('student', 'user', 'I’m a student', 'Find discounted surplus food nearby')}${opt('vendor', 'store', 'I’m a vendor', 'List surplus food and manage pickups')}</div>
          <div class="stack auth-actions">
            <button class="btn btn-primary btn-block" data-go="${r === 'vendor' ? 'signup/vendor' : 'signup/student'}">Continue as ${r}</button>
            <p class="t-small t-muted t-center">Already have an account? <button class="btn-link" data-act="go-login">Log in</button></p>
          </div>
        </div>`) };
    },

    login() {
      const r = FN.ui.loginRole;
      const demo = r === 'vendor' ? 'hello@loafandlatte.my' : 'foodielover123@sd.taylors.edu.my';
      return { shell: 'auth', html: authShell(`${backBar()}
        <form class="content auth-content" data-form="login" novalidate>
          ${c.lockup(false, 26)}
          <div class="stack-s"><h1 class="t-display">Welcome back</h1><p class="t-muted">Log in to reserve today’s surplus deals or manage your store.</p></div>
          ${c.seg([['student', 'Student'], ['vendor', 'Vendor']], r, 'login-role')}
          ${c.field({ id: 'login-email', label: 'Email', type: 'email', value: FN.ui.loginEmail || demo, icon: 'mail', err: 'Enter the email you signed up with', attrs: 'autocomplete="email" required' })}
          ${c.field({ id: 'login-pass', label: 'Password', type: 'password', value: FN.ui.loginEmail ? '' : 'foodie2026', icon: 'lock', err: 'Enter your password', attrs: 'autocomplete="current-password" required', right: `<button type="button" class="icon-btn" style="width:32px;height:32px" data-act="peek" data-for="login-pass" aria-label="Show password">${ic('eye', 'ic-m')}</button>` })}
          <div class="row between"><span class="t-caption t-muted">${FN.ui.loginEmail ? 'Use the email you just registered' : 'Demo account filled in for you'}</span><button type="button" class="btn-link t-small" data-act="forgot">Forgot password?</button></div>
          <button class="btn btn-primary btn-block" type="submit">Log in as ${r}</button>
          <p class="t-small t-muted t-center">New to FoodieNoms? <button type="button" class="btn-link" data-go="welcome">Create an account</button></p>
        </form>`) };
    },

    signupStudent() {
      return { shell: 'auth', html: authShell(`${backBar('Create account')}
        <form class="content auth-content" data-form="signup-student" novalidate>
          <span class="badge badge-stock" style="align-self:flex-start">${ic('user', 'ic-s')} Student account</span>
          ${c.field({ id: 'su-name', label: 'Display name', value: '', ph: 'e.g. FoodieLover123', icon: 'user', err: 'Add a name other students will see on reviews', attrs: 'autocomplete="nickname"' })}
          ${c.field({ id: 'su-email', label: 'University email', type: 'email', ph: 'name@sd.taylors.edu.my', icon: 'mail', hint: 'We use it to confirm you study in Subang Jaya.', err: 'Use your university email ending in .edu.my', attrs: 'autocomplete="email"' })}
          ${c.select({ id: 'su-campus', label: 'University', options: FN.CAMPUSES, value: FN.CAMPUSES[0], icon: 'pin' })}
          ${c.field({ id: 'su-pass', label: 'Password', type: 'password', ph: 'At least 8 characters', icon: 'lock', err: 'Password needs at least 8 characters', attrs: 'autocomplete="new-password"', right: `<button type="button" class="icon-btn" style="width:32px;height:32px" data-act="peek" data-for="su-pass" aria-label="Show password">${ic('eye', 'ic-m')}</button>` })}
          <label class="check" id="f-su-terms"><input type="checkbox" id="su-terms"><span>I agree to the Terms of Use and Privacy Policy</span></label>
          <button class="btn btn-primary btn-block" type="submit">Create account</button>
          <p class="t-small t-muted t-center">Have an account? <button type="button" class="btn-link" data-act="go-login" data-v="student">Log in</button></p>
        </form>`) };
    },

    signupVendor() {
      const d = FN.ui.vdraft;
      return { shell: 'auth', html: authShell(`${backBar('Register your store')}
        <form class="content auth-content" data-form="vendor-1" novalidate>
          <div class="progress2"><i class="on"></i><i></i></div>
          <p class="t-small t-muted">Step 1 of 2 · Account and store</p>
          ${c.field({ id: 'vs-name', label: 'Store name', value: d.name, ph: 'e.g. Loaf & Latte', icon: 'store', err: 'Enter your store name' })}
          <div class="field"><span class="field-label">Category</span><div class="chips">${FN.CATEGORIES.map(x => `<button type="button" class="chip ${d.cat === x ? 'is-on' : ''}" data-act="v-cat" data-v="${x}">${x}</button>`).join('')}</div></div>
          ${c.field({ id: 'vs-phone', label: 'Contact number', type: 'tel', value: d.phone, ph: '+60 12-345 6789', icon: 'phone', err: 'Enter a Malaysian phone number', attrs: 'autocomplete="tel"' })}
          ${c.field({ id: 'vs-email', label: 'Business email', type: 'email', value: d.email, ph: 'hello@yourstore.my', icon: 'mail', err: 'Enter a valid email address', attrs: 'autocomplete="email"' })}
          ${c.field({ id: 'vs-pass', label: 'Password', type: 'password', ph: 'At least 8 characters', icon: 'lock', err: 'Password needs at least 8 characters', attrs: 'autocomplete="new-password"' })}
          <button class="btn btn-primary btn-block" type="submit">Next: store details</button>
        </form>`) };
    },

    signupVendor2() {
      const d = FN.ui.vdraft;
      return { shell: 'auth', html: authShell(`${backBar('Store details')}
        <form class="content auth-content" data-form="vendor-2" novalidate>
          <div class="progress2"><i class="on"></i><i class="on"></i></div>
          <p class="t-small t-muted">Step 2 of 2 · Where students collect</p>
          <label class="upload" for="vs-photo">${d.photo ? `<img src="${d.photo}" alt="Store photo preview">` : `<span class="ibox sunk lg">${ic('camera', 'ic-l')}</span><b>Add store photo</b><span class="t-caption t-muted">Shown on your listing card · JPG or PNG</span>`}<input id="vs-photo" type="file" accept="image/*" data-input="vendor-photo" class="sr-only"></label>
          ${c.field({ id: 'vs-address', label: 'Pickup address', value: d.address, ph: 'Shop lot, building, area', icon: 'pin', err: 'Tell students where to collect' })}
          ${c.select({ id: 'vs-campus', label: 'Nearest campus', options: FN.CAMPUSES, value: d.campus, icon: 'pin' })}
          <div class="row" style="gap:10px;align-items:flex-start">
            ${c.field({ id: 'vs-opens', label: 'Opens', type: 'time', value: d.opens, icon: 'clock' })}
            ${c.field({ id: 'vs-closes', label: 'Closes', type: 'time', value: d.closes, icon: 'clock', err: 'Closing must be after opening' })}
          </div>
          <div class="banner">${ic('info', 'ic-m')}<span>Your store goes live straight away. You can add your first surplus listing on the next screen.</span></div>
          <button class="btn btn-primary btn-block" type="submit">Create store</button>
        </form>`) };
    }
  };

  /* ---------- handlers ---------- */
  const setErr = (id, bad) => { const f = document.getElementById('f-' + id); f && f.classList.toggle('has-error', !!bad); return !bad; };
  Object.assign(FN.on, {
    'skip-splash'() { FN.endSplash(); },
    'pick-role'(el) { FN.ui.role = el.dataset.v; FN.render(); },
    'go-login'(el) { FN.ui.loginRole = el.dataset.v || FN.ui.role || 'student'; FN.go('login'); },
    'login-role'(el) { FN.ui.loginRole = el.dataset.v; FN.render(); },
    peek(el) { const i = document.getElementById(el.dataset.for); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; el.innerHTML = ic(show ? 'eyeoff' : 'eye', 'ic-m'); el.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); },
    forgot() { FN.toast('Reset link sent to your email (demo)', { icon: 'mail' }); },
    'v-cat'(el) { FN.ui.vdraft.cat = el.dataset.v; el.parentElement.querySelectorAll('.chip').forEach(x => x.classList.toggle('is-on', x === el)); }
  });
  Object.assign(FN.onSubmit, {
async login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;

  const valid = [
    setErr('login-email', !/^\S+@\S+\.\S+$/.test(email)),
    setErr('login-pass', !password)
  ].every(Boolean);

  if (!valid) return;

const role = FN.ui.loginRole;

const loginAccount = role === 'vendor'
  ? FN.loginVendorAccount
  : FN.loginStudentAccount;

if (!loginAccount) {
  FN.toast('Authentication is not ready. Please try again.', {
    icon: 'info'
  });
  return;
}

  const button = document.querySelector(
    '[data-form="login"] button[type="submit"]'
  );

  if (button.disabled) return;

  button.disabled = true;
  button.textContent = 'Logging in...';

  try {
const profile = await loginAccount(email, password);

FN.act.login(role);

FN.ui.liveListings = null;
FN.ui.liveReservationIds = [];
FN.ui.liveStudentReservations = null;
FN.ui.liveStudentReservationsError = null;
FN.ui.liveVendorListings = null;
FN.ui.liveVendorListingsError = null;
FN.ui.liveVendorReservations = null;
FN.ui.liveVendorReservationsError = null;

if (role === 'student') {
  Object.assign(FN.sel.me(), {
    name: profile.name,
    email: profile.email,
    campus: profile.campus
  });

  FN.save();
}

if (role === 'vendor') {
  const localVendor = FN.sel.myVendor();
  const localUser = FN.sel.user();

  if (localVendor) {
    Object.assign(localVendor, {
      name: profile.name,
      cat: profile.category,
      area: profile.address,
      opens: profile.opens,
      closes: profile.closes,
      phone: profile.phone,
      email: profile.email
    });
  }

  if (localUser) {
    Object.assign(localUser, {
      name: profile.name,
      email: profile.email
    });
  }

  FN.save();
}

FN.go(role === 'vendor' ? 'v/home' : 'home', {
  reset: true
});

FN.toast(`Welcome back, ${esc(profile.name)}`, {
  icon: 'check'
});
  } catch (error) {
    console.error('Student login failed:', error);

    const messages = {
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/user-not-found': 'Incorrect email or password.',
      'auth/wrong-password': 'Incorrect email or password.',
      'auth/student-profile-not-found':
        'Your student profile could not be found.',
      'auth/not-student-account':
        'Please use a student account to log in.',
      'auth/network-request-failed':
        'Network error. Please try again.'
    };

    FN.toast(
      messages[error.code] || 'Login failed. Please try again.',
      { icon: 'info' }
    );
  } finally {
    button.disabled = false;
    button.textContent = 'Log in as student';
  }
},
    async 'signup-student'(form) {
  const value = id => document.getElementById(id).value.trim();
  const password = document.getElementById('su-pass').value;

  const valid = [
    setErr('su-name', !value('su-name')),
    setErr(
      'su-email',
      !/^\S+@\S+\.edu\.my$/i.test(value('su-email'))
    ),
    setErr('su-pass', password.length < 8)
  ].every(Boolean);

  const terms = document.getElementById('su-terms').checked;

  document.getElementById('f-su-terms')
    .classList.toggle('has-error', !terms);

  if (!valid || !terms) {
    if (valid && !terms) {
      FN.toast('Please accept the terms to continue', {
        icon: 'info'
      });
    }
    return;
  }

  if (!FN.registerStudentAccount) {
    FN.toast('Authentication is not ready. Please try again.', {
      icon: 'info'
    });
    return;
  }

  const button = document.querySelector(
    '[data-form="signup-student"] button[type="submit"]'
  );

  if (button.disabled) return;

  button.disabled = true;
  button.textContent = 'Creating account...';

  try {
    await FN.registerStudentAccount(value("su-email"), password, {
  name: value("su-name"),
  campus: value("su-campus")
});

    FN.ui.loginRole = 'student';
    FN.ui.loginEmail = value('su-email');
    FN.go('login', { reset: true });

    FN.toast('Account created. Please log in.', {
      icon: 'check'
    });
  } catch (error) {
    console.error('Student registration failed:', error);

    const messages = {
      'auth/email-already-in-use':
        'This email is already registered.',
      'auth/invalid-email':
        'Please enter a valid email address.',
      'auth/weak-password':
        'Please choose a stronger password.',
      'auth/password-does-not-meet-requirements':
        'Your password does not meet the password requirements.',
      'auth/network-request-failed':
        'Network error. Please try again.',
      'auth/operation-not-allowed':
        'Email/password registration is not enabled.'
    };

    FN.toast(
      messages[error.code] ||
        'Registration failed. Please try again.',
      { icon: 'info' }
    );
  } finally {
    button.disabled = false;
    button.textContent = 'Create account';
  }
},
    'vendor-1'() {
      const d = FN.ui.vdraft; const v = id => document.getElementById(id).value.trim();
      Object.assign(d, { name: v('vs-name'), phone: v('vs-phone'), email: v('vs-email'), password: document.getElementById('vs-pass').value });
      const ok = [setErr('vs-name', !d.name), setErr('vs-phone', !/^\+?6?0?[\d\s-]{8,14}$/.test(d.phone)), setErr('vs-email', !/^\S+@\S+\.\S+$/.test(d.email)), setErr('vs-pass', d.password.length < 8)].every(Boolean);
      if (ok) FN.go('signup/vendor/2');
    },
async 'vendor-2'() {
  const draft = FN.ui.vdraft;
  const value = id => document.getElementById(id).value.trim();

  Object.assign(draft, {
    address: value('vs-address'),
    campus: value('vs-campus'),
    opens: value('vs-opens'),
    closes: value('vs-closes')
  });

  const valid = [
    setErr('vs-address', !draft.address),
    setErr('vs-closes', !draft.closes || draft.closes <= draft.opens)
  ].every(Boolean);

  if (!valid) return;

  if (!FN.registerVendorAccount) {
    FN.toast('Authentication is not ready. Please try again.', {
      icon: 'info'
    });
    return;
  }

  const button = document.querySelector(
    '[data-form="vendor-2"] button[type="submit"]'
  );

  if (button && button.disabled) return;

  if (button) {
    button.disabled = true;
    button.textContent = 'Creating vendor account...';
  }

  try {
    await FN.registerVendorAccount(draft.email, draft.password, {
      name: draft.name,
      category: draft.cat,
      phone: draft.phone,
      address: draft.address,
      campus: draft.campus,
      opens: draft.opens,
      closes: draft.closes
    });

    FN.ui.loginRole = 'vendor';
    FN.ui.loginEmail = draft.email;
    FN.go('login', { reset: true });

    FN.toast('Vendor account created. Please log in.', {
      icon: 'check'
    });
  } catch (error) {
    console.error('Vendor registration failed:', error);

    const messages = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Please choose a stronger password.',
      'auth/network-request-failed': 'Network error. Please try again.'
    };

    FN.toast(
      messages[error.code] || 'Vendor registration failed. Please try again.',
      { icon: 'info' }
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Create account';
    }
  }
}
  });
  FN.onInput['vendor-photo'] = el => {
    const f = el.files && el.files[0]; if (!f) return;
    const d = FN.ui.vdraft; const v = id => { const x = document.getElementById(id); return x ? x.value.trim() : ''; };
    Object.assign(d, { address: v('vs-address'), campus: v('vs-campus') || d.campus, opens: v('vs-opens') || d.opens, closes: v('vs-closes') || d.closes });
    const r = new FileReader(); r.onload = () => { d.photo = r.result; FN.render(true); }; r.readAsDataURL(f);
  };
})();
