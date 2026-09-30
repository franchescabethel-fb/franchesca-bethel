/* =========================================================
   FRANCHESCA BETHEL — ISSUE Nº 01 · interaction engine
   GSAP + ScrollTrigger + Lenis (vendored), graceful fallbacks
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap;
  const animate = !!G && !reduce;
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} },
  };

  if (!animate) root.classList.add('no-anim');
  if (G && window.ScrollTrigger) G.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (animate && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.5, offset: 0 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- helpers: split text ---------- */
  function splitWords(el, cls = 'w') {
    const walk = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            if (cls === 'w') {
              const w = document.createElement('span'); w.className = 'w';
              const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
              w.appendChild(i); frag.appendChild(w);
            } else {
              const s = document.createElement('span'); s.className = cls; s.textContent = part; frag.appendChild(s);
            }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    return el;
  }
  function splitChars(el) {
    const walk = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach(c => {
            if (c === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$('.ch', el);
  }

  /* ---------- touch copy ---------- */
  if (!fine) { const how = $('.lb-how'); if (how) how.textContent = 'swipe through'; }

  /* ---------- year / dark zones ---------- */
  $$('.year').forEach(el => (el.textContent = new Date().getFullYear()));
  $$('.cover, .doors, .lookbook, .collab, .travel, .backcover, .menu, .press-hero, .press-contact, .nav, .vinyl, .loader, .brief, .topic').forEach(el => el.setAttribute('data-dark', ''));

  /* =========================================================
     CURSOR + MAGNETIC + HOVER MEDIA
     ========================================================= */
  const cursor = $('.cursor');
  if (fine && cursor && G) {
    document.body.classList.add('has-cursor');
    const dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
    const dx = G.quickTo(dot, 'x', { duration: .08 }), dy = G.quickTo(dot, 'y', { duration: .08 });
    const rx = G.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = G.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    G.set([dot, ring], { x: -100, y: -100 });
    window.addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.dataset.cursor; cursor.classList.add('is-label'); }
      else cursor.classList.remove('is-label');
      cursor.classList.toggle('on-dark', !!e.target.closest('[data-dark]') && !e.target.closest('.pass, .bio-block'));
    });
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => G.to([dot, ring], { opacity: 0, duration: .2 }));
    document.addEventListener('mouseenter', () => G.to([dot, ring], { opacity: 1, duration: .2 }));

    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        G.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3' });
      });
      el.addEventListener('pointerleave', () => G.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .4)' }));
    });

  }

  /* =========================================================
     NAV + MENU
     ========================================================= */
  const nav = $('#nav'), menuBtn = $('.menu-btn'), menu = $('#menu');
  let menuOpen = false;
  const setMenu = (open) => {
    menuOpen = open;
    document.body.classList.toggle('menu-open', open);
    menuBtn && menuBtn.setAttribute('aria-expanded', open);
    menu && menu.setAttribute('aria-hidden', !open);
    if (menuBtn) $('.menu-txt', menuBtn).textContent = open ? 'Close' : 'Menu';
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) nav.classList.remove('hide');
  };
  menuBtn && menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); } });
  const menuImg = $('.menu-img img');
  $$('.menu-list a').forEach(a => a.addEventListener('pointerenter', () => {
    if (!menuImg || menuImg.getAttribute('src') === a.dataset.img) return;
    menuImg.src = a.dataset.img;
    if (G) G.fromTo(menuImg, { scale: 1.2, opacity: .4 }, { scale: 1, opacity: 1, duration: .8, ease: 'expo.out' });
  }));

  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav && !nav.classList.contains('solid-lock')) {
      nav.classList.toggle('scrolled', y > 60);
      if (!menuOpen) nav.classList.toggle('hide', y > lastY && y > 400);
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* anchors */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' || id === '#main') return;
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    setTimeout(() => scrollToTarget(target), menuOpen ? 350 : 0);
  });

  /* =========================================================
     PAGE TRANSITION (curtain)
     ========================================================= */
  const curtain = $('.curtain');
  if (curtain && G && !reduce) {
    if (store.get('fb-curtain')) {
      store.del('fb-curtain');
      G.set(curtain, { yPercent: 0 });
      G.to(curtain, { yPercent: -101, duration: 1, ease: 'expo.inOut', delay: .15 });
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute('href');
      if (!/\.html(#.*)?$/.test(href) || href.startsWith('http')) return;
      e.preventDefault();
      if (menuOpen) setMenu(false);
      store.set('fb-curtain', '1');
      G.fromTo(curtain, { yPercent: 101 }, { yPercent: 0, duration: .8, ease: 'expo.inOut', onComplete: () => (location.href = href) });
    });
    window.addEventListener('pageshow', ev => { if (ev.persisted) G.set(curtain, { yPercent: 101 }); });
  }

  /* =========================================================
     DOORS (choose-your-door)
     ========================================================= */
  const doorsSec = $('.doors');
  if (doorsSec) {
    const doors = $$('.door', doorsSec);
    const bgs = $$('.doors-bg img', doorsSec);
    const activate = (name) => {
      doorsSec.dataset.theme = name;
      doors.forEach(d => {
        const on = d.dataset.door === name;
        d.classList.toggle('on', on);
        $('.door-word', d).setAttribute('aria-selected', on);
        $('.door-word', d).tabIndex = on ? 0 : -1;
      });
      bgs.forEach(i => i.classList.toggle('on', i.dataset.door === name));
    };
    doors.forEach((d, i) => {
      const btn = $('.door-word', d);
      if (fine) btn.addEventListener('pointerenter', () => activate(d.dataset.door));
      btn.addEventListener('click', () => activate(d.dataset.door));
      btn.addEventListener('focus', () => activate(d.dataset.door));
      btn.addEventListener('keydown', e => {
        if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        e.preventDefault();
        const next = doors[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : doors.length - 1)) % doors.length];
        $('.door-word', next).focus();
      });
    });
    activate('style');
    // reserve room under the door names for the tallest info card (desktop layout)
    const list = $('.door-list', doorsSec);
    const fit = () => {
      if (window.innerWidth <= 900) { list.style.paddingBottom = ''; return; }
      const tallest = Math.max(...$$('.door-panel', doorsSec).map(p => p.offsetHeight));
      list.style.paddingBottom = (tallest + 24) + 'px';
    };
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* =========================================================
     VINYL — Spotify iFrame API (record spins in sync with playback)
     ========================================================= */
  const vinyl = $('#vinyl');
  if (vinyl) {
    const btn = $('.vinyl-stage', vinyl), stateTxt = $('.vinyl-state', vinyl);
    const slot = $('#spotify-embed');
    let controller = null, playing = false, wantPlay = false;

    const setPlaying = (on) => {
      playing = on;
      vinyl.classList.toggle('playing', on);
      btn.setAttribute('aria-pressed', on);
      btn.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + 'Fashion Killa by A$AP Rocky');
      btn.dataset.cursor = on ? 'Pause' : 'Play';
      const cl = document.querySelector('.cursor-label');
      if (cl && cursor && cursor.classList.contains('is-label')) cl.textContent = btn.dataset.cursor;
      stateTxt.textContent = on ? 'Now playing — tap to pause' : 'Paused — tap to play';
    };

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      IFrameAPI.createController(slot, { uri: vinyl.dataset.spotify, width: '100%', height: 80 }, (c) => {
        controller = c;
        c.addListener('playback_update', e => { if (e && e.data) setPlaying(!e.data.isPaused); });
        c.addListener('ready', () => { if (wantPlay) { wantPlay = false; c.play(); } });
      });
    };
    // load the Spotify embed API once the player is near the viewport
    const loadSpotify = () => {
      if (window.__spotifyLoading) return; window.__spotifyLoading = true;
      const sc = document.createElement('script'); sc.src = 'https://open.spotify.com/embed/iframe-api/v1'; sc.async = true;
      sc.onerror = () => { wantPlay = false; setPlaying(false); stateTxt.textContent = 'Tap “Listen on Spotify” to play'; };
      document.head.appendChild(sc);
    };
    if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver(es => { if (es.some(en => en.isIntersecting)) { loadSpotify(); vio.disconnect(); } }, { rootMargin: '600px 0px' });
      vio.observe(vinyl);
    } else loadSpotify();

    btn.addEventListener('click', () => {
      if (controller) { controller.togglePlay(); setPlaying(!playing); return; }
      // API not ready yet: spin now, start playback as soon as it is
      wantPlay = true; loadSpotify(); setPlaying(true); stateTxt.textContent = 'Loading the track…';
      setTimeout(() => { if (!controller && wantPlay) { wantPlay = false; setPlaying(false); stateTxt.textContent = 'Tap “Listen on Spotify” to play'; } }, 8000);
    });
  }

  /* =========================================================
     TRAVEL — typewriter destinations + tear stub
     ========================================================= */
  const dest = $('#dest'), destCity = $('#destCity');
  if (dest && !reduce) {
    const trips = [['PARIS', 'France · for the croissants'], ['TULUM', 'Mexico · cenotes & sunsets'], ['AMALFI', 'Italy · lemons & linen'], ['SANTORINI', 'Greece · white walls, blue domes'], ['TOKYO', 'Japan · neon & matcha'], ['CABO', 'Mexico · girls’ trip energy'], ['BALI', 'Indonesia · honeymoon mode'], ['ANYWHERE', 'wherever you’re dreaming of']];
    let ti = 0, running = false, visible = false;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const loop = async () => {
      if (running) return; running = true;
      while (visible) {
        const [code, city] = trips[ti];
        for (let i = dest.textContent.length; i >= 0; i--) { dest.textContent = dest.textContent.slice(0, i); await sleep(45); }
        destCity.textContent = city;
        for (let i = 1; i <= code.length; i++) { dest.textContent = code.slice(0, i); await sleep(95); }
        await sleep(1800);
        ti = (ti + 1) % trips.length;
      }
      running = false;
    };
    new IntersectionObserver(es => es.forEach(en => { visible = en.isIntersecting; if (visible) loop(); }), { threshold: .3 }).observe(dest);
  }
  const stub = $('.pass-stub');
  stub && stub.addEventListener('click', () => { stub.classList.add('torn'); setTimeout(() => stub.classList.remove('torn'), 1800); });

  /* =========================================================
     PRESS: copy buttons
     ========================================================= */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const t = document.getElementById(b.dataset.copy); if (!t) return;
    try { await navigator.clipboard.writeText(t.innerText.trim()); const o = b.textContent; b.textContent = 'Copied ✓'; setTimeout(() => (b.textContent = o), 1800); } catch (e) {}
  }));

  /* =========================================================
     ANIMATION LAYER (GSAP only)
     ========================================================= */
  if (!animate) {
    root.classList.add('loaded');
    const lo = $('#loader'); if (lo) lo.remove();
    return;
  }

  // split headings now so intro + reveals can target words
  $$('[data-split]').forEach(el => splitWords(el));
  const mh = $('.masthead .mh');
  const mhChars = mh ? splitChars(mh) : [];
  const bcBig = $('.bc-big');
  if (bcBig) $$('.bc-line', bcBig).forEach(l => splitChars(l));
  const pressH1 = $('.press-hero h1');
  if (pressH1) splitWords(pressH1);

  /* ---------- cover intro ---------- */
  const coverIntro = () => {
    const tl = G.timeline({ defaults: { ease: 'expo.out' } });
    if ($('.cover')) {
      tl.from('.cover-meta', { opacity: 0, y: -14, duration: 1 }, 0)
        .from(mhChars, { yPercent: 115, rotate: 6, duration: 1.3, stagger: .045 }, .05)
        .from('.cover-bg img', { scale: 1.25, duration: 2.6, ease: 'expo.out' }, 0)
        .from('.cover-bg', { clipPath: 'inset(12% 8% 12% 8%)', duration: 1.8, ease: 'expo.inOut' }, 0)
        .from('.coverlines li', { y: 40, opacity: 0, duration: 1.1, stagger: .08 }, .8)
        
        .fromTo('.cover-sign', { clipPath: 'inset(-50% 100% -50% -10%)' }, { clipPath: 'inset(-50% -10% -50% -10%)', duration: 1.6, ease: 'power2.inOut' }, 1.1)
        .from('.cover-foot > *', { y: 20, opacity: 0, duration: 1, stagger: .1 }, 1.2)
        .from('.nav > *', { y: -20, opacity: 0, duration: 1, stagger: .08 }, .9)
        .from('.scroll-cue', { opacity: 0, duration: 1 }, 1.6);
    }
    if (pressH1) {
      tl.from($$('.wi', pressH1), { yPercent: 115, duration: 1.2, stagger: .06 }, .1)
        .from('.press-hero .ph-img', { clipPath: 'inset(100% 0 0 0 round 999px 999px 0 0)', duration: 1.4, ease: 'expo.inOut' }, .2)
        .from('.press-hero .lede, .press-hero .eyebrow', { opacity: 0, y: 20, duration: 1 }, .6);
    }
    return tl;
  };

  /* ---------- loader ---------- */
  const loader = $('#loader');
  const seen = store.get('fb-seen');
  if (loader && !seen && $('.cover')) {
    store.set('fb-seen', '1');
    if (lenis) lenis.stop();
    const num = $('#loaderNum');
    const c = { v: 0 };
    const intro = coverIntro().pause();
    G.timeline()
      .from('.loader-top span, .loader-bottom span', { opacity: 0, y: 12, stagger: .05, duration: .6, ease: 'power2.out' })
      .to(c, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => (num.textContent = String(Math.round(c.v)).padStart(2, '0')) }, 0)
      .to('.loader-count span', { yPercent: -110, duration: .6, ease: 'expo.in' }, '+=.1')
      .to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut', onComplete: () => { root.classList.add('loaded'); loader.remove(); if (lenis) lenis.start(); } }, '-=.2')
      .add(() => intro.play(), '-=.55');
  } else {
    root.classList.add('loaded');
    if (loader) loader.remove();
    coverIntro();
  }

  /* ---------- cover scroll + tilt ---------- */
  if ($('.cover')) {
    G.to('.cover-bg img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.masthead', { yPercent: 35, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.cover-grid', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- split heading reveals ---------- */
  $$('[data-split]').forEach(el => {
    G.from($$('.wi', el), { yPercent: 115, rotate: 5, duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  /* ---------- batch fade-ups ---------- */
  const batchSel = '.tags li, .toc li, .social-rows li, .trip-tags li, .stat, .creds > div, .topic, .bio-block, .fact-list li, .gallery-grid a, .checklist li, .door-links, .brief, .contents-head .script-note';
  $$(batchSel).forEach(el => el.classList.add('rv'));
  ScrollTrigger.batch(batchSel, { start: 'top 92%', once: true, onEnter: b => b.forEach((el, i) => { el.style.setProperty('--d', (i * .07) + 's'); el.classList.add('in'); }) });

  /* ---------- doors entrance ---------- */
  if (doorsSec) {
    G.from('.door-word', { yPercent: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.door-list', start: 'top 80%' } });
    G.from('.doors-title', { opacity: 0, x: -30, duration: 1, scrollTrigger: { trigger: doorsSec, start: 'top 70%' } });
  }

  /* ---------- quote scrub ---------- */
  const scrub = $('[data-scrub]');
  if (scrub) {
    splitWords(scrub, 'sw');
    G.to($$('.sw', scrub), { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: '.quote', start: 'top 70%', end: 'bottom 70%', scrub: true } });
    G.fromTo('.quote-sign', { clipPath: 'inset(-50% 100% -50% -10%)' }, { clipPath: 'inset(-50% -10% -50% -10%)', duration: 1.4, ease: 'power2.inOut', scrollTrigger: { trigger: '.quote-sign', start: 'top 90%' } });
  }

  /* ---------- lookbook horizontal ---------- */
  const mm = G.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const sec = $('.lookbook'), track = $('.lb-track');
    if (!sec || !track) return;
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = G.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    $$('.lb-frame', track).forEach(f => {
      G.fromTo($('img', f), { xPercent: -7, scale: 1.2 }, { xPercent: 7, scale: 1.2, ease: 'none', scrollTrigger: { trigger: f, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      G.from(f, { rotate: G.utils.random(-6, 6), y: 60, opacity: .3, ease: 'none', scrollTrigger: { trigger: f, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true } });
    });
  });

  /* ---------- parallax + image reveals ---------- */
  $$('.arch img, .press-hero .ph-img img').forEach(img => G.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  G.fromTo('.travel-bg img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.travel', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('.arch, .shop-photo img, .ap-main, .ap-small').forEach(el => G.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } }));
  G.from('.spin-badge, .shop-sticker', { scale: 0, rotate: -90, duration: 1.2, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.editor', start: 'top 60%' } });

  /* ---------- editor letter ---------- */
  if ($('.checklist')) {
    G.set('.checklist li', { '--chk': 0 });
    ScrollTrigger.create({ trigger: '.checklist', start: 'top 80%', once: true, onEnter: () => G.to('.checklist li', { '--chk': 1, duration: .4, ease: 'back.out(3)', stagger: .15, delay: .4 }) });
    G.fromTo('.signature', { clipPath: 'inset(-50% 100% -50% -10%)' }, { clipPath: 'inset(-50% -10% -50% -10%)', duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: '.signature', start: 'top 88%' } });
  }

  /* ---------- stats count-up ---------- */
  $$('.stat b[data-count]').forEach(b => {
    const end = parseFloat(b.dataset.count), dec = +(b.dataset.dec || 0), suf = b.dataset.suffix || '';
    const o = { v: 0 };
    b.textContent = (0).toFixed(dec) + suf;
    ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => G.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (b.textContent = o.v.toFixed(dec) + suf) }) });
  });

  /* ---------- boarding pass entrance ---------- */
  if ($('.pass')) {
    G.from('.pass', { rotateX: 35, y: 120, opacity: 0, duration: 1.6, ease: 'expo.out', transformPerspective: 1200, scrollTrigger: { trigger: '.pass', start: 'top 85%' } });
  }


  /* ---------- back cover ---------- */
  if (bcBig) G.from($$('.ch', bcBig), { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .025, scrollTrigger: { trigger: bcBig, start: 'top 85%' } });

  /* ---------- refresh after assets ---------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
