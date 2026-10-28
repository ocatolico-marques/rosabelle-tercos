/* Rosabelle landing: GSAP + ScrollTrigger + Lenis for motion, a tiny 2D canvas for golden dust. */
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;

  /* header state */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  if (reduce) return;

  /* ---------- golden dust (2D canvas, paused when off screen) ---------- */
  (function dust() {
    var c = document.getElementById('dust');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, P = [], visible = true;
    function size() {
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 700 ? 22 : 46; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: 1.5 + Math.random() * 3.5, v: .08 + Math.random() * .22, a: .15 + Math.random() * .4, p: Math.random() * 6.28 });
    }
    size(); addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(c);
    function frame(t) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || window.__introDone === false) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var q = P[i];
        q.y -= q.v; q.x += Math.sin(t / 2600 + q.p) * .12;
        if (q.y < -10) { q.y = H + 10; q.x = Math.random() * W; }
        var tw = .6 + .4 * Math.sin(t / 1400 + q.p);
        var g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 3);
        g.addColorStop(0, 'rgba(255,232,190,' + (q.a * tw) + ')');
        g.addColorStop(1, 'rgba(224,188,120,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * 3, 0, 6.283); ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  })();

  if (!gsap || !ST) return;
  root.classList.add('live');
  gsap.registerPlugin(ST);

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href') === '#') return;
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: a.getAttribute('href') === '#topo' ? 0 : -72, duration: 1.5 });
    });
  }

  /* ---------- hero: masked headline + photo entrance ---------- */
  var h1 = document.getElementById('h1'), words = [];
  (function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (tok) {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var i = document.createElement('span'); i.textContent = tok;
          w.appendChild(i); frag.appendChild(w); words.push(i);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) split(n);
    });
  })(h1);

  /* Estado inicial aplicado já, antes de qualquer espera: nada pisca nem salta.
     A entrada só começa quando fontes e fotos estão prontas (evita o engasgo do início). */
  var heroEls = ['.hero .eyebrow', '.hero .lead', '.hero .actions .btn', '.chips li', '.glow', '.ph-a', '.ph-b', '.seal', '.tag'];
  gsap.set(words, { yPercent: 115 });
  gsap.set(['.hero .eyebrow', '.hero .lead', '.hero .actions .btn', '.chips li'], { autoAlpha: 0, y: 16 });
  gsap.set('.glow', { autoAlpha: 0, scale: .75 });
  gsap.set('.ph-a', { autoAlpha: 0, y: 48, rotation: -3 });
  gsap.set('.ph-b', { autoAlpha: 0, y: 64, rotation: 3 });
  gsap.set('.seal', { autoAlpha: 0, scale: .6 });
  gsap.set('.tag', { autoAlpha: 0, y: 10 });
  window.__introDone = false;

  function playIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: function () {
      window.__introDone = true;
      gsap.set(heroEls, { clearProps: 'willChange' });
    } });
    tl.to('.hero .eyebrow', { y: 0, autoAlpha: 1, duration: .7 }, 0)
      .to(words, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: .07 }, .1)
      .to('.hero .lead', { y: 0, autoAlpha: 1, duration: .8 }, .5)
      .to('.hero .actions .btn', { y: 0, autoAlpha: 1, duration: .7, stagger: .07 }, .65)
      .to('.chips li', { y: 0, autoAlpha: 1, duration: .6, stagger: .05 }, .85)
      .to('.glow', { scale: 1, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 0)
      .to('.ph-a', { y: 0, rotation: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out' }, .15)
      .to('.ph-b', { y: 0, rotation: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out' }, .3)
      .to('.seal', { scale: 1, autoAlpha: 1, duration: .9, ease: 'back.out(1.4)' }, .9)
      .to('.tag', { y: 0, autoAlpha: 1, duration: .7 }, 1.0);
  }
  var started = false;
  function start() { if (started) return; started = true; requestAnimationFrame(function () { requestAnimationFrame(playIntro); }); }
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.ph img')).map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); });
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.all([fonts, Promise.all(imgs)]).then(start);
  setTimeout(start, 1500); /* rede lenta: não deixa o topo vazio */

  /* photos drift at different speeds as you scroll away */
  gsap.to('.ph-a', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } });
  gsap.to('.ph-b', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } });

  /* pointer parallax on the photo stack (fine pointers only) */
  if (fine) {
    var ax = gsap.quickTo('.ph-a', 'x', { duration: .8, ease: 'power3.out' });
    var bx = gsap.quickTo('.ph-b', 'x', { duration: .8, ease: 'power3.out' });
    var by = gsap.quickTo('.ph-b', 'y', { duration: .8, ease: 'power3.out' });
    document.querySelector('.hero').addEventListener('pointermove', function (e) {
      var mx = e.clientX / innerWidth - .5, my = e.clientY / innerHeight - .5;
      ax(mx * -16); bx(mx * 22); by(my * 14);
    });
  }

  /* ---------- reveals ---------- */
  function reveal(sel, from, extra) {
    gsap.utils.toArray(sel).forEach(function (el) {
      gsap.from(el, Object.assign({}, from, Object.assign({ duration: 1.1, ease: 'expo.out', clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } }, extra || {})));
    });
  }
  reveal('.section .eyebrow', { y: 18, autoAlpha: 0 });
  reveal('.section .display', { y: 60, autoAlpha: 0 });
  reveal('.section .lead', { y: 30, autoAlpha: 0 });
  reveal('.model-list li', { y: 40, autoAlpha: 0 });
  reveal('.steps li', { y: 50, autoAlpha: 0 });
  reveal('.quote-card', { y: 60, autoAlpha: 0 });
  reveal('.quote', { y: 40, autoAlpha: 0 });
  reveal('details', { y: 24, autoAlpha: 0 }, { duration: .8 });
  reveal('.final .btn', { y: 30, autoAlpha: 0, scale: .94 });

  gsap.utils.toArray('.shot').forEach(function (el) {
    gsap.from(el, { clipPath: 'inset(100% 0 0 0)', duration: 1.5, ease: 'expo.out', clearProps: 'clipPath',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    gsap.fromTo(el.querySelector('img'), { yPercent: -7, scale: 1.12 }, { yPercent: 7, scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.fromTo('.wordmark', { yPercent: 25 }, { yPercent: 0, ease: 'none',
    scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* magnetic final button (fine pointers only) */
  if (fine) {
    var m = document.getElementById('magnet');
    var xTo = gsap.quickTo(m, 'x', { duration: .5, ease: 'power3.out' });
    var yTo = gsap.quickTo(m, 'y', { duration: .5, ease: 'power3.out' });
    m.addEventListener('pointermove', function (e) {
      var r = m.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * .25);
      yTo((e.clientY - (r.top + r.height / 2)) * .35);
    });
    m.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
  }

  addEventListener('load', function () { ST.refresh(); });
})();
