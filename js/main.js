'use strict';

/* ── 1. CUSTOM CURSOR — sharp cross ────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  if (window.matchMedia('(hover: none)').matches) {
    dot.style.display = ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function tickRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tickRing);
  })();

  /* Rotate cursor on move for dynamism */
  let lastX = 0, lastY = 0, angle = 0;
  window.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      angle += 2;
      dot.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
      lastX = e.clientX; lastY = e.clientY;
    }
  }, { passive: true });

  document.querySelectorAll('a, button, [tabindex], .proj-card, .proj-featured, .tool-card, .interest-card').forEach((el) => {
    el.addEventListener('mouseenter', () => { dot.classList.add('is-hover'); ring.classList.add('is-hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); });
  });

  /* Click spark: create brief cross echo */
  document.addEventListener('click', (e) => {
    const spark = document.createElement('div');
    spark.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px;
      width:40px; height:40px; pointer-events:none; z-index:9997;
      transform:translate(-50%,-50%);
      animation: sparkFade 0.45s ease-out forwards;
    `;
    spark.innerHTML = `<svg viewBox="0 0 40 40" fill="none"><path d="M20 3 L21.5 18.5 L37 20 L21.5 21.5 L20 37 L18.5 21.5 L3 20 L18.5 18.5 Z" stroke="#dc2626" stroke-width="1" fill="rgba(220,38,38,0.15)"/></svg>`;
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  });

  /* Inject spark animation */
  const style = document.createElement('style');
  style.textContent = `@keyframes sparkFade { from { opacity:1; transform:translate(-50%,-50%) scale(0.5); } to { opacity:0; transform:translate(-50%,-50%) scale(2.2); } }`;
  document.head.appendChild(style);
})();

/* --- 1B. BACKGROUND PARTICLE PARALLAX -------------------------- */
(function initParticleParallax() {
  if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;

  let tx = 0, ty = 0, sx = 0, sy = 0;
  let activeSection = null;

  function setActiveSection(section, e) {
    if (activeSection !== section) {
      if (activeSection) activeSection.classList.remove('is-pointer-active');
      activeSection = section;
      if (activeSection) activeSection.classList.add('is-pointer-active');
    }

    if (!activeSection) return;
    const rect = activeSection.getBoundingClientRect();
    activeSection.style.setProperty('--sx', `${(e.clientX - rect.left).toFixed(0)}px`);
    activeSection.style.setProperty('--sy', `${(e.clientY - rect.top).toFixed(0)}px`);
  }

  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    tx = (nx - 0.5) * 46;
    ty = (ny - 0.5) * 38;
    const hovered = document.elementFromPoint(e.clientX, e.clientY);
    setActiveSection(hovered?.closest?.('.section') || null, e);
  }, { passive: true });

  document.addEventListener('mouseleave', () => setActiveSection(null, { clientX: 0, clientY: 0 }));

  function tick() {
    sx += (tx - sx) * 0.08;
    sy += (ty - sy) * 0.08;
    document.documentElement.style.setProperty('--pmx', `${sx.toFixed(2)}px`);
    document.documentElement.style.setProperty('--pmy', `${sy.toFixed(2)}px`);
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ── 2. NAVIGATION ──────────────────────────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  const close  = document.getElementById('navClose');
  let open = false;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  }, { passive: true });

  function openMenu() {
    open = true;
    mobile.classList.add('is-open');
    mobile.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    const sp = burger.querySelectorAll('span');
    sp[0].style.transform = 'translateY(7px) rotate(45deg)';
    sp[1].style.opacity   = '0';
    sp[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }
  function closeMenu() {
    open = false;
    mobile.classList.remove('is-open');
    mobile.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }

  burger.addEventListener('click', () => open ? closeMenu() : openMenu());
  close.addEventListener('click', closeMenu);
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) closeMenu(); });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  if (sections.length && navLinks.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => io.observe(s));
  }
})();

/* ── 3. THREE.JS — FIXED TRIBAL SIGIL + PER-SECTION CANVASES ───── */
(function initThree() {
  if (typeof THREE === 'undefined') return;

  /* ── Main fixed canvas: tribal sigil ── */
  (function initTribalSigil() {
    const canvas = document.getElementById('tribal-canvas');
    if (!canvas) return;

    let W = window.innerWidth, H = window.innerHeight;
    const isMobile = W < 768;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    camera.position.set(0, 0, 55);

    const sigilGroup = new THREE.Group();
    sigilGroup.position.set(isMobile ? 0 : 8, 0, 0);
    scene.add(sigilGroup);

    /* Central sacred knot */
    const knotMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, wireframe: true, transparent: true, opacity: 0.4 });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(7.5, 0.9, 200, 20, 3, 5), knotMat);
    sigilGroup.add(knot);

    /* Gothic cross — the core visual symbol */
    const crossGroup = new THREE.Group();
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.22 });
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 0.5), crossMat);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 0.5), crossMat.clone());
    hBar.position.y = 1.8;
    /* Pointed tips (cones at each end) */
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.35 });
    const tipTop = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.2, 4), tipMat);
    tipTop.position.y = 6;
    const tipBot = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.2, 4), tipMat.clone());
    tipBot.position.y = -6; tipBot.rotation.z = Math.PI;
    const tipL = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 4), tipMat.clone());
    tipL.position.x = -4.4; tipL.rotation.z = Math.PI / 2;
    const tipR = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 4), tipMat.clone());
    tipR.position.x = 4.4; tipR.rotation.z = -Math.PI / 2;
    crossGroup.add(vBar, hBar, tipTop, tipBot, tipL, tipR);
    crossGroup.scale.set(1.4, 1.4, 1.4);
    sigilGroup.add(crossGroup);

    /* Gyroscope rings */
    const ringGeo = new THREE.TorusGeometry(13, 0.06, 4, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xb91c1c, transparent: true, opacity: 0.28 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
    ring2.rotation.x = Math.PI / 3; ring2.material.opacity = 0.22;
    const ring3 = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
    ring3.rotation.x = -Math.PI / 3; ring3.material.opacity = 0.18;
    sigilGroup.add(ring1, ring2, ring3);

    /* Outer blade ring */
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(17, 0.04, 4, 96),
      new THREE.MeshBasicMaterial({ color: 0x991b1b, transparent: true, opacity: 0.14 })
    );
    outerRing.rotation.y = Math.PI / 6;
    sigilGroup.add(outerRing);

    /* 8 Gem nodes at cardinal+diagonal points */
    const gemMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.55 });
    const gemGeo = new THREE.OctahedronGeometry(0.9, 0);
    const gems = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const gem = new THREE.Mesh(gemGeo.clone(), gemMat.clone());
      gem.position.set(Math.cos(a) * 13, Math.sin(a) * 13, 0);
      gem.material.opacity = i % 2 === 0 ? 0.6 : 0.4;
      sigilGroup.add(gem);
      gems.push(gem);
    }

    /* Neo-tribal outer star points (6-point) */
    const starGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 3.5, 3, 1),
        new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.2 })
      );
      spike.position.set(Math.cos(a) * 19, Math.sin(a) * 19, 0);
      spike.rotation.z = a + Math.PI / 2;
      starGroup.add(spike);
    }
    sigilGroup.add(starGroup);

    /* Particle field */
    const N = isMobile ? 100 : 220;
    const positions = new Float32Array(N * 3);
    const velocities = [];
    for (let i = 0; i < N; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 80;
      positions[i*3+1] = (Math.random() - 0.5) * 80;
      positions[i*3+2] = (Math.random() - 0.5) * 40;
      velocities.push({ x: (Math.random() - 0.5) * 0.016, y: (Math.random() - 0.5) * 0.012, z: (Math.random() - 0.5) * 0.006 });
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ color: 0xef4444, size: 0.36, transparent: true, opacity: 0.4, sizeAttenuation: true })));

    /* Connection lines */
    const DIST_SQ = 20 * 20;
    const linePts = new Float32Array(N * 14 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePts, 3));
    scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.09 })));

    /* Mouse parallax */
    let tmx = 0, tmy = 0, smx = 0, smy = 0;
    window.addEventListener('mousemove', (e) => {
      tmx = (e.clientX / window.innerWidth  - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    /* Scroll-driven rotation */
    const scrollTarget = { ry: 0, rx: 0 };
    if (typeof gsap !== 'undefined') {
      gsap.to(scrollTarget, {
        ry: Math.PI * 4, rx: Math.PI * 1.5,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 2 }
      });
    }

    const clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      smx += (tmx - smx) * 0.03;
      smy += (tmy - smy) * 0.03;

      sigilGroup.rotation.y = t * 0.07 + scrollTarget.ry + smx * 0.18;
      sigilGroup.rotation.x = t * 0.045 + scrollTarget.rx * 0.3 + smy * 0.12;
      sigilGroup.rotation.z = t * 0.025;

      knot.rotation.y = -t * 0.14;
      knot.rotation.z =  t * 0.09;

      crossGroup.rotation.z = t * 0.12;
      crossGroup.rotation.y = t * 0.07;

      ring1.rotation.z = t * 0.11;
      ring2.rotation.y = t * 0.09;
      ring3.rotation.x = t * 0.07;
      outerRing.rotation.z = -t * 0.05;
      starGroup.rotation.z = -t * 0.04;

      gems.forEach((gem, i) => {
        const s = 1 + Math.sin(t * 1.8 + (i / 8) * Math.PI * 2) * 0.15;
        gem.scale.set(s, s, s);
      });

      const pos = ptGeo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        const v = velocities[i];
        pos[i*3]   += v.x;
        pos[i*3+1] += v.y;
        pos[i*3+2] += v.z;
        if (pos[i*3]   >  40) pos[i*3]   = -40;
        if (pos[i*3]   < -40) pos[i*3]   =  40;
        if (pos[i*3+1] >  40) pos[i*3+1] = -40;
        if (pos[i*3+1] < -40) pos[i*3+1] =  40;
      }
      ptGeo.attributes.position.needsUpdate = true;

      let li = 0;
      for (let i = 0; i < N; i++) {
        let c = 0;
        for (let j = i + 1; j < N && c < 2; j++) {
          const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
          if (dx*dx + dy*dy + dz*dz < DIST_SQ && li + 5 < linePts.length) {
            linePts[li++] = pos[i*3];   linePts[li++] = pos[i*3+1]; linePts[li++] = pos[i*3+2];
            linePts[li++] = pos[j*3];   linePts[li++] = pos[j*3+1]; linePts[li++] = pos[j*3+2];
            c++;
          }
        }
      }
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, li / 3);

      camera.position.x += (smx * 5 - camera.position.x) * 0.03;
      camera.position.y += (-smy * 3 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    tick();

    window.addEventListener('resize', () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      sigilGroup.position.x = W < 768 ? 0 : 8;
    });
  })();

  /* ── About canvas: centered gothic cross — bigger ── */
  (function initAboutCanvas() {
    const canvas = document.getElementById('about-canvas');
    if (!canvas) return;

    const W = 620, H = 620;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 14;

    const g = new THREE.Group();
    scene.add(g);

    /* Solid cross with phong materials for depth */
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, wireframe: true, transparent: true, opacity: 0.55 });
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 8, 0.5), crossMat);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.1, 0.5), crossMat.clone());
    hBar.position.y = 1.6;

    const tipMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75 });
    const tipT = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.2, 4), tipMat);
    tipT.position.y = 5.1;
    const tipB = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.2, 4), tipMat.clone());
    tipB.position.y = -5.1; tipB.rotation.z = Math.PI;
    const tipL = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.8, 4), tipMat.clone());
    tipL.position.set(-3.75, 1.6, 0); tipL.rotation.z = Math.PI / 2;
    const tipR = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.8, 4), tipMat.clone());
    tipR.position.set(3.75, 1.6, 0); tipR.rotation.z = -Math.PI / 2;

    /* Double orbiting rings */
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x991b1b, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.05, 4, 64), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(5, 0.04, 4, 48), new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.2 }));
    ring2.rotation.x = Math.PI / 4;

    /* 4 gem nodes */
    const gemMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 });
    const gems = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), gemMat.clone());
      gem.position.set(Math.cos(a) * 6.5, Math.sin(a) * 6.5, 0);
      g.add(gem); gems.push(gem);
    }

    g.add(vBar, hBar, tipT, tipB, tipL, tipR, ring1, ring2);

    const clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      g.rotation.y = t * 0.38;
      g.rotation.z = Math.sin(t * 0.28) * 0.12;
      ring1.rotation.z = t * 0.22;
      ring2.rotation.y = t * 0.18;
      gems.forEach((gem, i) => { gem.scale.setScalar(1 + Math.sin(t * 1.6 + i * 1.57) * 0.18); });
      renderer.render(scene, camera);
    }
    tick();
  })();

  /* ── Skills canvas: centered icosahedron — bigger ── */
  (function initSkillsCanvas() {
    const canvas = document.getElementById('skills-canvas');
    if (!canvas) return;

    const W = 580, H = 580;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 12;

    const g = new THREE.Group();
    scene.add(g);

    /* Outer wireframe */
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(4.5, 1),
      new THREE.MeshBasicMaterial({ color: 0xdc2626, wireframe: true, transparent: true, opacity: 0.38 })
    );
    /* Middle solid */
    const icoMid = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3, 0),
      new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.28 })
    );
    /* Inner core */
    const icoInner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.8, 0),
      new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.22 })
    );

    /* Orbiting ring */
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5.5, 0.04, 4, 80),
      new THREE.MeshBasicMaterial({ color: 0x991b1b, transparent: true, opacity: 0.28 })
    );

    g.add(ico, icoMid, icoInner, ring);

    const clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      ico.rotation.y = t * 0.3;
      ico.rotation.x = t * 0.2;
      icoMid.rotation.y = -t * 0.45;
      icoMid.rotation.z =  t * 0.28;
      icoInner.rotation.y = t * 0.7;
      icoInner.rotation.x = -t * 0.5;
      ring.rotation.x = t * 0.22;
      ring.rotation.z = -t * 0.15;
      renderer.render(scene, camera);
    }
    tick();
  })();

  /* ── Side neotribal 3D spines ── */
  (function initSideSpines() {
    if (typeof THREE === 'undefined') return;

    function buildSpine(canvas, isRight) {
      if (!canvas) return;
      const W = 72; // canvas CSS width in px
      let H = window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(W, H, false);

      const scene = new THREE.Scene();
      // 1 world unit = 1 CSS pixel
      const halfW = W / 2; // 36
      const getH2 = () => window.innerHeight / 2;

      const camera = new THREE.OrthographicCamera(-halfW, halfW, getH2(), -getH2(), 0.1, 500);
      camera.position.z = 100;

      const spineGroup = new THREE.Group();
      scene.add(spineGroup);

      let gems = [], gemMats = [], numNodes = 7;

      function rebuild() {
        while (spineGroup.children.length) spineGroup.remove(spineGroup.children[0]);
        gems = []; gemMats = [];
        const h2 = getH2();
        const top = h2 - 8, bot = -h2 + 8;
        numNodes = 7;
        const spacing = (top - bot) / (numNodes - 1);
        const ys = Array.from({ length: numNodes }, (_, i) => top - i * spacing);

        // Spine segments between nodes (all units = pixels)
        for (let i = 0; i < numNodes - 1; i++) {
          const segH = Math.abs(ys[i] - ys[i + 1]) - 10;
          const seg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 0.9, segH, 4),
            new THREE.MeshBasicMaterial({ color: 0x7f1d1d, transparent: true, opacity: 0.5 })
          );
          seg.position.y = (ys[i] + ys[i + 1]) / 2;
          seg.rotation.y = Math.PI / 4;
          spineGroup.add(seg);
        }

        // Gem nodes + tribal branches
        ys.forEach((y, i) => {
          const isEnd = i === 0 || i === numNodes - 1;
          const r = isEnd ? 6 : 3.5 + (i % 3);
          const mat = new THREE.MeshBasicMaterial({ color: 0x991b1b, transparent: true, opacity: 0.32 });
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(r, 0), mat);
          gem.position.set(0, y, 0);
          gem.rotation.y = (i * Math.PI) / 4;
          spineGroup.add(gem); gems.push(gem); gemMats.push(mat);

          // Horizontal tick rune
          const tLen = 6 + (i % 3) * 2;
          const tick = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, tLen, 3),
            new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.22 })
          );
          tick.position.set(0, y, 0); tick.rotation.z = Math.PI / 2;
          spineGroup.add(tick);

          if (!isEnd) {
            const dir = isRight ? -1 : 1;
            const bLen = 16 + (i % 3) * 5;

            // Primary branch
            const branch = new THREE.Mesh(
              new THREE.CylinderGeometry(1.0, 0.3, bLen, 3),
              new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.28 })
            );
            branch.position.set(dir * bLen / 2, y, 0);
            branch.rotation.z = Math.PI / 2;
            spineGroup.add(branch);

            // Branch-tip spike
            const spike = new THREE.Mesh(
              new THREE.ConeGeometry(2.2, 7, 3),
              new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.3 })
            );
            spike.position.set(dir * (bLen + 3.5), y, 0);
            spike.rotation.z = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
            spineGroup.add(spike);

            // Mid-diamond node
            const diam = new THREE.Mesh(
              new THREE.OctahedronGeometry(1.4, 0),
              new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.3 })
            );
            diam.position.set(dir * bLen * 0.58, y, 0);
            spineGroup.add(diam);

            // Sub-branch (45° angled upward) every other node
            if (i % 2 === 0) {
              const sLen = bLen * 0.48;
              const sub = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.2, sLen, 3),
                new THREE.MeshBasicMaterial({ color: 0xb91c1c, transparent: true, opacity: 0.18 })
              );
              sub.position.set(dir * sLen * 0.35, y + sLen * 0.35, 0);
              sub.rotation.z = dir > 0 ? -Math.PI / 4 : Math.PI + Math.PI / 4;
              spineGroup.add(sub);
            }
          }
        });

        // Bottom convergence spike (angled inward toward page center)
        const convDir = isRight ? -1 : 1;
        const botY = ys[numNodes - 1] - spacing * 0.45;
        const cs1 = new THREE.Mesh(
          new THREE.ConeGeometry(2.5, 28, 4),
          new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.28 })
        );
        cs1.position.set(convDir * 8, botY - 14, 0);
        cs1.rotation.z = convDir > 0 ? Math.PI / 6 : -Math.PI / 6;
        cs1.rotation.y = Math.PI / 4;
        spineGroup.add(cs1);

        const cs2 = new THREE.Mesh(
          new THREE.ConeGeometry(1.5, 18, 3),
          new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.2 })
        );
        cs2.position.set(convDir * 4, botY - 22, 0);
        cs2.rotation.z = convDir > 0 ? Math.PI / 9 : -Math.PI / 9;
        spineGroup.add(cs2);
      }

      rebuild();

      let scrollProg = 0;
      window.addEventListener('scroll', () => {
        const max = document.body.scrollHeight - window.innerHeight;
        scrollProg = max > 0 ? window.scrollY / max : 0;
      }, { passive: true });

      const clock = new THREE.Clock();
      function tick() {
        requestAnimationFrame(tick);
        const t = clock.getElapsedTime();
        const activeIdx = scrollProg * (numNodes - 1);
        gems.forEach((gem, i) => {
          const active = i <= activeIdx;
          const mat = gemMats[i];
          mat.opacity += ((active ? 0.78 : 0.28) - mat.opacity) * 0.05;
          mat.color.set(active ? 0xef4444 : 0x7f1d1d);
          if (active) gem.scale.setScalar(1 + Math.sin(t * 2.4 + i * 0.9) * 0.2);
          else gem.scale.setScalar(1);
          gem.rotation.y = t * (0.3 + i * 0.08);
          gem.rotation.z = t * 0.14;
        });
        spineGroup.rotation.x = Math.sin(t * 0.22) * 0.038;
        spineGroup.rotation.z = Math.sin(t * 0.16) * 0.018;
        renderer.render(scene, camera);
      }
      tick();

      window.addEventListener('resize', () => {
        H = window.innerHeight;
        renderer.setSize(W, H, false);
        camera.top = getH2(); camera.bottom = -getH2();
        camera.updateProjectionMatrix();
        rebuild();
      });
    }

    buildSpine(document.getElementById('side-spine-left'),  false);
    buildSpine(document.getElementById('side-spine-right'), true);
  })();

  /* ── Gallery planet: 3D orbital image system ── */
  (function initGalleryPlanet() {
    const canvas = document.getElementById('gallery-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const wrap = canvas.parentElement;
    let W = wrap.clientWidth || 900;
    let H = wrap.clientHeight || 560;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
    camera.position.z = 36;

    scene.add(new THREE.AmbientLight(0x220000, 0.6));
    const redLight = new THREE.PointLight(0xdc2626, 3.5, 80);
    redLight.position.set(8, 10, 15);
    scene.add(redLight);
    const fillLight2 = new THREE.PointLight(0x660000, 1.5, 50);
    fillLight2.position.set(-12, -6, 4);
    scene.add(fillLight2);

    // sceneContainer holds planet + orbits — drag rotates this group
    const sceneContainer = new THREE.Group();
    scene.add(sceneContainer);

    // Planet with spikes
    const skullGroup = new THREE.Group();
    sceneContainer.add(skullGroup);

    const wl = (c, op) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: op });

    // ── PLANET CORE ──────────────────────────────────────────────────────────
    const coreGeo  = new THREE.IcosahedronGeometry(7, 2);
    const coreFill = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: 0x030000 }));
    const coreEdge = new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), wl(0xdc2626, 0.68));
    skullGroup.add(coreFill, coreEdge);

    // ── OUTER ROTATING SHELL (cranEdge — spins slowly in tick) ───────────────
    const cranGeo  = new THREE.IcosahedronGeometry(9.2, 1);
    const cranEdge = new THREE.LineSegments(new THREE.EdgesGeometry(cranGeo), wl(0xdc2626, 0.22));
    skullGroup.add(cranEdge);

    const eyeGems = [];

    // ── FLOATING DEBRIS RUNES ────────────────────────────────────────────────
    const skullRunes = [];
    for (let i = 0; i < 6; i++) {
      const phi = Math.acos(-1 + (2 * i) / 5);
      const th  = Math.sqrt(8 * Math.PI) * phi;
      const r   = 10.5;
      const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.55 }));
      rune.position.set(r * Math.sin(phi) * Math.cos(th), r * Math.sin(phi) * Math.sin(th), r * Math.cos(phi));
      skullGroup.add(rune);
      skullRunes.push(rune);
    }

    // Nebula particles — 280 random pts in shell r=[14,38]
    (function addNebula() {
      const positions = new Float32Array(280 * 3);
      for (let i = 0; i < 280; i++) {
        const r   = 14 + Math.random() * 24;
        const phi = Math.acos(2 * Math.random() - 1);
        const th  = Math.random() * Math.PI * 2;
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(th);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(th);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      sceneContainer.add(new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xb91c1c, size: 0.14, transparent: true, opacity: 0.45, sizeAttenuation: true
      })));
    })();

    // Orbital path rings (faint torus at each orbit inclination)
    [[18.2, 0.42, 0], [20.9, -0.42, 0.18]].forEach(([r, rx, rz]) => {
      const pathRing = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.04, 3, 120),
        new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.09, wireframe: false })
      );
      pathRing.rotation.x = rx;
      pathRing.rotation.z = rz;
      sceneContainer.add(pathRing);
    });

    // Orbital image cards
    const imgData = [
      { src: 'galeria/7.png',                                      label: 'Juan del Corral' },
      { src: 'galeria/6.jpeg',                                     label: 'Proceso' },
      { src: 'galeria/DSC02408.JPG',                               label: 'Registro' },
      { src: 'galeria/Captura de pantalla 2026-04-23 162055.png',  label: 'Interfaz' },
      { src: 'galeria/Captura de pantalla 2026-04-26 164323.png',  label: 'Mapa' },
      { src: 'galeria/Captura de pantalla 2026-04-26 165454.png',  label: 'Exploración' },
      { src: 'galeria/proceso1 .jpeg',                             label: 'Proceso 01' },
      { src: 'galeria/proceso2.jpeg',                              label: 'Proceso 02' },
      { src: 'galeria/proceso3.jpeg',                              label: 'Proceso 03' },
      { src: 'galeria/proceso 4.jpeg',                             label: 'Proceso 04' },
      { src: 'galeria/proceso 5.jpeg',                             label: 'Proceso 05' },
    ];

    const loader    = new THREE.TextureLoader();
    const _pq       = new THREE.Quaternion();
    const _iq       = new THREE.Quaternion();
    const cardMeshes = [];

    const orbitData = imgData.map((d, i) => {
      const cH = 3.35;
      const cW = cH * (16 / 9);

      // Fallback canvas texture
      const fc = document.createElement('canvas');
      fc.width = 512; fc.height = 320;
      const ctx = fc.getContext('2d');
      ctx.fillStyle = '#0d0000';
      ctx.fillRect(0, 0, 512, 320);
      ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, 504, 312);
      ctx.strokeStyle = 'rgba(220,38,38,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(14, 14, 484, 292);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 38px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(d.label, 256, 160);
      const fallTex = new THREE.CanvasTexture(fc);

      const mat  = new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
      const card = new THREE.Mesh(new THREE.PlaneGeometry(cW, cH), mat);
      cardMeshes.push(card);
      let frame;

      // Update geometry to match actual image aspect ratio
      loader.load(d.src, (tex) => {
        mat.map = tex; mat.needsUpdate = true;
        const aspect = tex.image.width / tex.image.height;
        card.geometry.dispose();
        card.geometry = new THREE.PlaneGeometry(cH * aspect, cH);
        if (frame) {
          frame.geometry.dispose();
          frame.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(cH * aspect + 0.24, cH + 0.16, 0.05));
        }
      }, undefined, () => {});

      frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(cW + 0.28, cH + 0.18, 0.05)),
        new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.55 })
      );

      const cardGroup = new THREE.Group();
      cardGroup.add(card, frame);

      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.x = (i * 0.4 - 1.0) * 0.42;
      orbitGroup.rotation.z = (i % 3 - 1) * 0.18;
      sceneContainer.add(orbitGroup);

      const orbitR = 18.2 + (i % 2) * 2.7;
      cardGroup.position.set(orbitR, 0, 0);
      orbitGroup.add(cardGroup);

      return { orbitGroup, cardGroup, card, orbitR, angle: (i / imgData.length) * Math.PI * 2, speed: 0.28 + i * 0.055, src: d.src, label: d.label };
    });

    // Drag rotation state
    let isDragging = false, hasDragged = false;
    let prevDragX = 0, prevDragY = 0;
    let velX = 0, velY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true; hasDragged = false;
      prevDragX = e.clientX; prevDragY = e.clientY;
      velX = 0; velY = 0;
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevDragX;
      const dy = e.clientY - prevDragY;
      if (Math.abs(dx) + Math.abs(dy) > 3) hasDragged = true;
      velX = dx * 0.009;
      velY = dy * 0.006;
      sceneContainer.rotation.y += velX;
      sceneContainer.rotation.x = Math.max(-1.2, Math.min(1.2, sceneContainer.rotation.x + velY));
      prevDragX = e.clientX; prevDragY = e.clientY;
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) { isDragging = false; canvas.style.cursor = 'crosshair'; }
    });

    // Touch drag
    canvas.addEventListener('touchstart', (e) => {
      isDragging = true; hasDragged = false;
      prevDragX = e.touches[0].clientX; prevDragY = e.touches[0].clientY;
      velX = 0; velY = 0;
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - prevDragX;
      const dy = e.touches[0].clientY - prevDragY;
      if (Math.abs(dx) + Math.abs(dy) > 3) hasDragged = true;
      velX = dx * 0.009;
      velY = dy * 0.006;
      sceneContainer.rotation.y += velX;
      sceneContainer.rotation.x = Math.max(-1.2, Math.min(1.2, sceneContainer.rotation.x + velY));
      prevDragX = e.touches[0].clientX; prevDragY = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', () => { isDragging = false; });

    // Raycaster — click card to expand
    const raycaster = new THREE.Raycaster();
    canvas.addEventListener('click', (e) => {
      if (hasDragged) return;
      const r = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - r.left) / r.width)  * 2 - 1,
        -((e.clientY - r.top)  / r.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(cardMeshes);
      if (hits.length) {
        const idx = cardMeshes.indexOf(hits[0].object);
        if (idx >= 0) openGalleryModal(orbitData[idx].src, orbitData[idx].label);
      }
    });

    function openGalleryModal(src, label) {
      const modal = document.createElement('div');
      modal.className = 'gallery-modal';
      modal.innerHTML = `<div class="gallery-modal__backdrop"></div><div class="gallery-modal__content"><div class="gallery-modal__bar"><span class="gallery-modal__label">// ${label}</span><button class="gallery-modal__close" aria-label="Cerrar">&#x2715;</button></div><img class="gallery-modal__img" src="${src}" alt="${label}" loading="eager"></div>`;
      document.body.appendChild(modal);
      requestAnimationFrame(() => modal.classList.add('is-open'));
      function close() { modal.classList.remove('is-open'); setTimeout(() => modal.remove(), 380); }
      modal.querySelector('.gallery-modal__close').addEventListener('click', close);
      modal.querySelector('.gallery-modal__backdrop').addEventListener('click', close);
      function onKey(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } }
      document.addEventListener('keydown', onKey);
    }

    let tmx = 0, tmy = 0, smx = 0, smy = 0;

    canvas.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(skullGroup.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.65, ease: 'back.out(1.4)' });
        gsap.to(redLight, { intensity: 7, duration: 0.5 });
      }
    });
    canvas.addEventListener('mouseleave', () => {
      tmx = 0; tmy = 0;
      if (typeof gsap !== 'undefined') {
        gsap.to(skullGroup.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
        gsap.to(redLight, { intensity: 3.5, duration: 0.5 });
      }
    });
    canvas.addEventListener('mousemove', (e) => {
      if (isDragging) return;
      const r = canvas.getBoundingClientRect();
      tmx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      tmy = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    }, { passive: true });

    const clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      smx += (tmx - smx) * 0.04;
      smy += (tmy - smy) * 0.04;

      // Inertia decay when not dragging
      if (!isDragging) {
        sceneContainer.rotation.y += velX;
        sceneContainer.rotation.x = Math.max(-1.2, Math.min(1.2, sceneContainer.rotation.x + velY));
        velX *= 0.93;
        velY *= 0.93;
      }

      // Planet animation
      skullGroup.rotation.y = Math.sin(t * 0.12) * 0.28;
      skullGroup.rotation.x = Math.sin(t * 0.07) * 0.06;
      cranEdge.rotation.y   = t * 0.03;
      skullRunes.forEach((r, i) => r.scale.setScalar(1 + Math.sin(t * 1.8 + i) * 0.22));
      eyeGems.forEach((g, i)    => g.scale.setScalar(1 + Math.sin(t * 2.4 + i * Math.PI) * 0.38));
      // Pulsar — redLight throbs
      redLight.intensity = 3.5 + Math.sin(t * 1.4) * 1.2;
      redLight.position.set(Math.sin(t * 0.4) * 12, Math.cos(t * 0.3) * 9, 15);

      // Full 360° orbit + billboard facing camera
      orbitData.forEach((item) => {
        item.angle += item.speed * 0.005;
        item.orbitGroup.rotation.y = item.angle;

        // Billboard: parent_inv * camera.quaternion (correct order)
        item.orbitGroup.getWorldQuaternion(_pq);
        _iq.copy(_pq).invert();
        item.cardGroup.quaternion.copy(_iq).multiply(camera.quaternion);

        // Depth scale + opacity
        const wp = new THREE.Vector3();
        item.cardGroup.getWorldPosition(wp);
        const zNorm = Math.max(0, Math.min(1, (wp.z + item.orbitR) / (item.orbitR * 2)));
        item.cardGroup.scale.setScalar(0.62 + zNorm * 0.54);
        item.card.material.opacity = 0.55 + zNorm * 0.42;
      });

      // Camera subtle parallax (only when not dragging)
      if (!isDragging) {
        camera.position.x += (smx * 2.5 - camera.position.x) * 0.04;
        camera.position.y += (-smy * 1.8 - camera.position.y) * 0.04;
      }
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    tick();

    new ResizeObserver(() => {
      W = wrap.clientWidth; H = wrap.clientHeight || 560;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }).observe(wrap);
  })();

  /* ── Roadmap canvas: gothic dark crystal + cross ── */
  (function initRoadmapCanvas() {
    const canvas = document.getElementById('roadmap-canvas');
    if (!canvas) return;

    const roadmapSec = document.getElementById('roadmap');
    let W = canvas.clientWidth  || 520;
    let H = canvas.clientHeight || (roadmapSec ? roadmapSec.offsetHeight : 900);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 200);
    camera.position.z = 22;

    /* Lighting for dark chrome */
    scene.add(new THREE.AmbientLight(0x0a0008, 0.6));
    const redPt = new THREE.PointLight(0xdc2626, 2.5, 40);
    redPt.position.set(3, 6, 8);
    scene.add(redPt);
    const purplePt = new THREE.PointLight(0xb91c1c, 1.2, 30);
    purplePt.position.set(-6, -4, 4);
    scene.add(purplePt);

    const g = new THREE.Group();
    g.scale.set(0.84, 0.84, 0.84);
    g.position.x = -1.1;
    scene.add(g);

    /* Gothic cross — solid dark chrome */
    const crossGroup = new THREE.Group();
    const darkMat  = new THREE.MeshBasicMaterial({ color: 0x1a0005, wireframe: false, transparent: true, opacity: 0.9 });
    const wireMat  = new THREE.MeshBasicMaterial({ color: 0xdc2626, wireframe: true, transparent: true, opacity: 0.28 });
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 10, 0.7), wireMat);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.3, 0.7), wireMat.clone());
    hBar.position.y = 2.2;

    const tipMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.45 });
    [[0, 6.5, 0, 0], [0, -6.5, Math.PI, 0], [-4.5, 2.2, 0, Math.PI / 2], [4.5, 2.2, 0, -Math.PI / 2]].forEach(([x, y, rz, rzz]) => {
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.6, 4), tipMat.clone());
      tip.position.set(x, y, 0);
      tip.rotation.z = rz || rzz;
      crossGroup.add(tip);
    });
    crossGroup.add(vBar, hBar);
    g.add(crossGroup);

    /* Gothic arch ring (flattened torus) */
    const archMat = new THREE.MeshBasicMaterial({ color: 0x880000, transparent: true, opacity: 0.35 });
    const arch1 = new THREE.Mesh(new THREE.TorusGeometry(9, 0.06, 4, 96), archMat);
    arch1.rotation.x = Math.PI / 8;
    const arch2 = new THREE.Mesh(new THREE.TorusGeometry(11, 0.04, 4, 96), new THREE.MeshBasicMaterial({ color: 0x880000, transparent: true, opacity: 0.22 }));
    arch2.rotation.x = -Math.PI / 5;
    g.add(arch1, arch2);

    /* TorusKnot rune — gothic energy field */
    const knotMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, wireframe: true, transparent: true, opacity: 0.14 });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(6, 0.12, 160, 8, 2, 5), knotMat);
    g.add(knot);

    /* 8 dark gem nodes */
    const gemBaseMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.55 });
    const gemGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const R = i % 2 === 0 ? 9 : 7;
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), gemBaseMat.clone());
      gem.position.set(Math.cos(a) * R, Math.sin(a) * R, (i % 3 - 1) * 0.8);
      gemGroup.add(gem);
    }
    g.add(gemGroup);

    /* Spike ornaments — 6-point outer */
    const spikeGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 2.5, 3),
        new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.3 })
      );
      spike.position.set(Math.cos(a) * 11, Math.sin(a) * 11, 0);
      spike.rotation.z = a + Math.PI / 2;
      spikeGroup.add(spike);
    }
    g.add(spikeGroup);

    /* Scroll-driven rotation */
    const scrollState = { ry: 0 };
    if (typeof gsap !== 'undefined') {
      gsap.to(scrollState, {
        ry: Math.PI * 2,
        ease: 'none',
        scrollTrigger: { trigger: '#roadmap', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      });
    }

    function resizeRoadmapCanvas() {
      W = canvas.clientWidth || W;
      H = canvas.clientHeight || H;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeRoadmapCanvas, { passive: true });
    resizeRoadmapCanvas();

    const clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      g.rotation.y = t * 0.05 + scrollState.ry * 0.4;
      g.rotation.x = Math.sin(t * 0.18) * 0.12;
      crossGroup.rotation.z = Math.sin(t * 0.22) * 0.06;
      knot.rotation.y = -t * 0.15;
      knot.rotation.z =  t * 0.08;
      arch1.rotation.z = t * 0.08;
      arch2.rotation.y = t * 0.06;
      gemGroup.rotation.z = -t * 0.1;
      spikeGroup.rotation.z = t * 0.04;
      redPt.position.x = Math.sin(t * 0.6) * 8;
      redPt.position.y = Math.cos(t * 0.45) * 6;
      renderer.render(scene, camera);
    }
    tick();
  })();

  /* ── Dagger canvas: floating neotribal 3D blades ── */
  (function initDaggersCanvas() {
    const canvas = document.getElementById('dagger-canvas');
    if (!canvas || typeof THREE === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let W = window.innerWidth, H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.z = 26;

    function makeDagger() {
      const g = new THREE.Group();

      // Blade: 4-sided cone (diamond cross-section) — long and thin
      const bladeGeo = new THREE.ConeGeometry(0.26, 5.2, 4);
      const bladeEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(bladeGeo),
        new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.9 })
      );
      bladeEdge.position.y = 3.1;
      g.add(bladeEdge);
      // Filled blade face (very dark, just for depth)
      const bladeFace = new THREE.Mesh(
        bladeGeo,
        new THREE.MeshBasicMaterial({ color: 0x0a0000, transparent: true, opacity: 0.7 })
      );
      bladeFace.position.y = 3.1;
      g.add(bladeFace);

      // Blade fuller (center ridge line)
      const fullerGeo = new THREE.BufferGeometry();
      fullerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.5, 0.01, 0, 5.6, 0.01]), 3));
      g.add(new THREE.Line(fullerGeo, new THREE.LineBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.55 })));

      // Guard: diamond-shaped crossguard
      const guardGeo = new THREE.BoxGeometry(3.2, 0.22, 0.22);
      const guardEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(guardGeo),
        new THREE.LineBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.88 })
      );
      guardEdge.position.y = 0.05;
      g.add(guardEdge);
      // Guard tip spikes
      [-1.7, 1.7].forEach((x) => {
        const tipEdge = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.ConeGeometry(0.12, 0.72, 3)),
          new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75 })
        );
        tipEdge.position.set(x, 0.05, 0);
        tipEdge.rotation.z = x > 0 ? -Math.PI / 2 : Math.PI / 2;
        g.add(tipEdge);
      });

      // Guard gem (junction crystal)
      const junctionGem = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.24, 0)),
        new THREE.LineBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.9 })
      );
      junctionGem.position.y = 0.15;
      g.add(junctionGem);

      // Sigil ring (floating torus at guard)
      const sigilRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.04, 4, 24),
        new THREE.MeshBasicMaterial({ color: 0xdc2626, wireframe: true, transparent: true, opacity: 0.45 })
      );
      sigilRing.rotation.y = Math.PI / 4;
      g.add(sigilRing);

      // Handle: hexagonal grip
      const handleEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.15, 0.21, 2.4, 6)),
        new THREE.LineBasicMaterial({ color: 0xb91c1c, transparent: true, opacity: 0.72 })
      );
      handleEdge.position.y = -1.25;
      g.add(handleEdge);

      // Grip wrap rings (neotribal binding marks)
      [-0.65, -1.25, -1.85].forEach((y) => {
        const ring = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.TorusGeometry(0.24, 0.03, 4, 12)),
          new THREE.LineBasicMaterial({ color: 0x991b1b, transparent: true, opacity: 0.6 })
        );
        ring.position.y = y;
        ring.rotation.x = Math.PI / 2;
        g.add(ring);
      });

      // Pommel: large octahedron
      const pommelEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.48, 0)),
        new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.92 })
      );
      pommelEdge.position.y = -2.65;
      g.add(pommelEdge);
      // Pommel glow fill
      const pommelFace = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.42, 0),
        new THREE.MeshBasicMaterial({ color: 0x200000, transparent: true, opacity: 0.5 })
      );
      pommelFace.position.y = -2.65;
      g.add(pommelFace);

      // Bottom spike (dagger tail)
      const tailEdge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.ConeGeometry(0.14, 0.9, 4)),
        new THREE.LineBasicMaterial({ color: 0x991b1b, transparent: true, opacity: 0.6 })
      );
      tailEdge.position.y = -3.35;
      tailEdge.rotation.z = Math.PI;
      g.add(tailEdge);

      scene.add(g);
      return g;
    }

    // 8 daggers spread across full page — camera Y tracks scroll
    const SCROLL_RANGE = 42; // world units, top→bottom of page
    const daggerDefs = [
      // Hero area (1 dagger, right side, subtle)
      { px:  18,   py:  3,   pz: -5, rz: -0.28, floatA: 0.38, floatS: 0.55, spinS: -0.007 },
      // About section
      { px: -17,   py: -4,   pz: -3, rz:  0.20, floatA: 0.42, floatS: 0.68, spinS:  0.009 },
      { px:  16,   py: -9,   pz: -7, rz: -0.35, floatA: 0.48, floatS: 0.46, spinS: -0.008 },
      // Skills / Projects
      { px: -14,   py: -16,  pz: -2, rz:  0.16, floatA: 0.36, floatS: 0.72, spinS:  0.010 },
      { px:  19,   py: -22,  pz: -6, rz: -0.42, floatA: 0.52, floatS: 0.50, spinS: -0.007 },
      // Gallery / Roadmap
      { px: -18,   py: -28,  pz: -4, rz:  0.32, floatA: 0.44, floatS: 0.60, spinS:  0.008 },
      { px:  14,   py: -34,  pz: -3, rz: -0.22, floatA: 0.40, floatS: 0.57, spinS: -0.009 },
      // Contact / Footer
      { px:  -5,   py: -40,  pz: -8, rz:  0.12, floatA: 0.34, floatS: 0.64, spinS:  0.006 },
    ];

    const daggers = daggerDefs.map((def, i) => {
      const d = makeDagger();
      d.position.set(def.px, def.py, def.pz);
      d.rotation.z = def.rz;
      d.rotation.y = (i / daggerDefs.length) * Math.PI * 2;
      return { mesh: d, baseY: def.py, floatA: def.floatA, floatS: def.floatS, spinS: def.spinS, offset: i * 1.1 };
    });

    // Scroll tracking for camera Y
    let scrollProg = 0;
    window.addEventListener('scroll', () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollProg = max > 0 ? window.scrollY / max : 0;
    }, { passive: true });

    // Mouse parallax
    let tmx = 0, tmy = 0, smx = 0, smy = 0;
    window.addEventListener('mousemove', (e) => {
      tmx = (e.clientX / W - 0.5) * 2;
      tmy = (e.clientY / H - 0.5) * 2;
    }, { passive: true });

    const clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      smx += (tmx - smx) * 0.025;
      smy += (tmy - smy) * 0.025;

      daggers.forEach((d) => {
        d.mesh.position.y = d.baseY + Math.sin(t * d.floatS + d.offset) * d.floatA;
        d.mesh.rotation.z += d.spinS * 0.4;
        d.mesh.rotation.y += d.spinS * 0.2;
      });

      // Camera: scroll-driven Y reveals different daggers + mouse parallax
      const targetY = -scrollProg * SCROLL_RANGE + (-smy * 0.9);
      camera.position.x += (smx * 1.6 - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0, camera.position.y, 0);

      renderer.render(scene, camera);
    }
    tick();

    window.addEventListener('resize', () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }, { passive: true });
  })();

})();

/* ── 4. TYPING ANIMATION ──────────────────────────────────────────── */
(function initTyping() {
  const el = document.getElementById('heroTyping');
  if (!el) return;

  const words = (el.dataset.words || '').split('|').filter(Boolean);
  if (words.length < 2) return;

  let wordIdx = 0, charIdx = 0, deleting = false;
  const SPEED_TYPE = 68, SPEED_DEL = 38, PAUSE_END = 1800, PAUSE_START = 320;

  function tick() {
    const current = words[wordIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) { deleting = true; setTimeout(tick, PAUSE_END); return; }
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) { deleting = false; wordIdx = (wordIdx + 1) % words.length; setTimeout(tick, PAUSE_START); return; }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }
  setTimeout(tick, 1400);
})();

/* ── 5. GSAP ANIMATIONS ───────────────────────────────────────────── */
(function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('.hero__status,.hero__label,.hero__n1,.hero__n2,.hero__n3,.hero__title,.hero__desc,.hero__actions')
      .forEach(el => { el.style.opacity = '1'; });
    return;
  }

  /* Hero entrance */
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.hero__status',  { opacity: 1, y: 0, duration: .6, delay: .3 })
    .to('.hero__label',   { opacity: 1, y: 0, duration: .7 }, '-=0.2')
    .fromTo('.hero__n1',  { y: 80 }, { opacity: 1, y: 0, duration: 1 }, '-=0.4')
    .fromTo('.hero__n2',  { y: 80 }, { opacity: 1, y: 0, duration: 1 }, '-=0.75')
    .fromTo('.hero__n3',  { y: 50 }, { opacity: 1, y: 0, duration: .85 }, '-=0.7')
    .to('.hero__barcode', { opacity: 1, duration: .5 }, '-=0.3')
    .to('.hero__title',   { opacity: 1, y: 0, duration: .6 }, '-=0.3')
    .to('.hero__desc',    { opacity: 1, y: 0, duration: .6 }, '-=0.4')
    .to('.hero__actions', { opacity: 1, y: 0, duration: .6 }, '-=0.4');

  function reveal(selector, fromVars) {
    gsap.utils.toArray(selector).forEach((el) => {
      const delay = parseFloat(el.style.getPropertyValue('--i') || '0') * 0.12;
      gsap.from(el, {
        ...fromVars, delay, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none none' }
      });
    });
  }

  reveal('.section-head',   { opacity: 0, y: 36 });
  reveal('.about__left',    { opacity: 0, x: -52 });
  reveal('.about__right',   { opacity: 0, x:  52 });
  reveal('.interest-card',  { opacity: 0, y: 24, scale: 0.92 });
  /* proj-featured uses clip-path reveal below — skip generic reveal */
  reveal('.proj-card',      { opacity: 0, y: 44 });
  reveal('.skill-cat',      { opacity: 0, y: 36 });
  reveal('.roadmap__item',  { opacity: 0, x: -36 });
  reveal('.contact__left',  { opacity: 0, x: -48 });
  reveal('.contact__right', { opacity: 0, x:  48 });

  /* Tool cards stagger */
  ScrollTrigger.create({
    trigger: '.tools-arsenal', start: 'top 85%',
    onEnter: () => gsap.from('.tool-card', { opacity: 0, scale: 0.82, y: 18, stagger: { each: 0.045, from: 'start' }, duration: .6, ease: 'back.out(1.4)' })
  });

  /* ── Proj-featured clip-path cinematic reveal ── */
  gsap.utils.toArray('.proj-featured').forEach((card) => {
    gsap.fromTo(card,
      { clipPath: 'inset(0 0 100% 0)', opacity: 0.7 },
      { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 1.05, ease: 'power3.inOut',
        scrollTrigger: { trigger: card, start: 'top 86%', toggleActions: 'play none none none' }
      }
    );
  });

  /* ── Skill pill stagger per category ── */
  gsap.utils.toArray('.skill-cat').forEach((cat) => {
    const pills = cat.querySelectorAll('.skill-pill');
    if (!pills.length) return;
    gsap.from(pills, {
      opacity: 0, scale: 0.76, y: 12,
      stagger: { each: 0.04, from: 'start' },
      duration: 0.45, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: cat, start: 'top 84%', toggleActions: 'play none none none' }
    });
  });

  /* ── Magnetic + 3D tilt on tool cards ── */
  document.querySelectorAll('.tool-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 16;
      gsap.to(card, { x, y, rotateX: -y * 0.65, rotateY: x * 0.65, duration: .28, ease: 'power2.out', transformPerspective: 600, overwrite: 'auto' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: .72, ease: 'elastic.out(1, 0.42)', overwrite: 'auto' });
    });
  });

  /* ── Contact form sequential entrance ── */
  ScrollTrigger.create({
    trigger: '.contact__form', start: 'top 80%', once: true,
    onEnter: () => gsap.from('.form-field', {
      opacity: 0, y: 30, stagger: 0.13, duration: 0.65, ease: 'power3.out'
    })
  });

  /* ── Proj-card reveal with stagger ── */
  ScrollTrigger.create({
    trigger: '.projects__grid', start: 'top 84%', once: true,
    onEnter: () => gsap.from('.proj-card', {
      opacity: 0, y: 36, scale: 0.94,
      stagger: { each: 0.08, from: 'start' },
      duration: 0.7, ease: 'power3.out'
    })
  });

  /* ── Ambient star GSAP float (override CSS animation) ── */
  gsap.utils.toArray('.ambient-star').forEach((star, i) => {
    star.style.animation = 'none';
    gsap.to(star, {
      y: `-=${12 + i * 5}`,
      x: `${i % 2 === 0 ? '+=' : '-='}${7 + i * 2}`,
      rotation: `${i % 2 === 0 ? '+=' : '-='}${10 + i * 2}`,
      duration: 3.6 + i * 1.1, ease: 'sine.inOut',
      yoyo: true, repeat: -1, delay: i * 0.65
    });
  });

  /* ── Section bg sigil parallax scrub ── */
  gsap.utils.toArray('.section-bg-sigil svg').forEach((svg) => {
    const sec = svg.closest('.section');
    if (!sec) return;
    gsap.to(svg, {
      y: 55, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1.4 }
    });
  });

  /* ── Roadmap rune scroll-driven rotation ── */
  const rune = document.querySelector('.roadmap__rune');
  if (rune) {
    rune.style.animation = 'none';
    gsap.to(rune, {
      rotation: 360, ease: 'none',
      scrollTrigger: { trigger: '#roadmap', start: 'top bottom', end: 'bottom top', scrub: 2 }
    });
  }

  /* ── Inject diagonal glow vein into each section ── */
  document.querySelectorAll('.section').forEach((sec) => {
    const vein = document.createElement('div');
    vein.className = 'sec-vein';
    vein.setAttribute('aria-hidden', 'true');
    sec.insertBefore(vein, sec.firstChild);
  });

  /* ── Section corner ornament: deploy from corner point ── */
  gsap.utils.toArray('.sec-corner').forEach((corner, i) => {
    const isTR = corner.classList.contains('sec-corner-tr');
    const isBL = corner.classList.contains('sec-corner-bl');
    const isBR = corner.classList.contains('sec-corner-br');
    const ox = (isTR || isBR) ? '100%' : '0%';
    const oy = (isBL || isBR) ? '100%' : '0%';
    gsap.fromTo(corner,
      { opacity: 0, clipPath: `inset(${oy} ${ox === '0%' ? '100%' : '0%'} ${oy === '0%' ? '100%' : '0%'} ${ox})` },
      { opacity: 0.58, clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: corner.closest('.section'), start: 'top 88%', toggleActions: 'play none none none' },
        delay: (i % 3) * 0.14
      }
    );
  });

  /* ── Roadmap line draw */
  gsap.from('.roadmap__line', {
    scaleY: 0, transformOrigin: 'top center', duration: 2, ease: 'power2.out',
    scrollTrigger: { trigger: '.roadmap__timeline', start: 'top 75%' }
  });

  /* Section title word stagger (cybersigilism reveal) */
  gsap.utils.toArray('.section-title').forEach((title) => {
    if (title.dataset.split) return;
    title.dataset.split = '1';
    const parts = title.innerHTML.split(/(\s+)/);
    title.innerHTML = parts.map(p =>
      p.trim()
        ? `<span class="word-reveal-wrap"><span class="word-reveal-inner">${p}</span></span>`
        : p
    ).join('');
    gsap.from(title.querySelectorAll('.word-reveal-inner'), {
      y: '108%', opacity: 0, duration: 0.82, ease: 'power3.out',
      stagger: { each: 0.1 },
      scrollTrigger: { trigger: title, start: 'top 91%', toggleActions: 'play none none none' }
    });
  });

  /* 3D tilt on project cards */
  document.querySelectorAll('.proj-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, { rotateX: -y * 10, rotateY: x * 10, duration: .35, ease: 'power2.out', transformPerspective: 900 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: .6, ease: 'power3.out' });
    });
  });

  /* Magnetic effect on interest cards */
  document.querySelectorAll('.interest-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 8;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 8;
      gsap.to(card, { x, y, duration: .3, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { x: 0, y: 0, duration: .5, ease: 'power3.out' });
    });
  });

  /* Section num slide */
  gsap.utils.toArray('.section-num').forEach((num) => {
    gsap.from(num, {
      opacity: 0, x: -20, duration: .6, ease: 'power2.out',
      scrollTrigger: { trigger: num, start: 'top 92%' }
    });
  });

})();

/* ── 6. STAT COUNTERS ─────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el = entry.target;
      const end = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.textContent.replace(/[0-9]/g, '').trim();
      const duration = 1200;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * end) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => io.observe(el));
})();

/* ── 7. CONTACT FORM ──────────────────────────────────────────────── */
(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  function validateField(input) {
    const errorEl = input.closest('.form-field').querySelector('.form-field__error');
    if (!input.checkValidity()) {
      const msg = input.type === 'email' ? 'Ingresa un email válido.' : 'Este campo es requerido.';
      if (errorEl) errorEl.textContent = msg;
      input.style.borderColor = 'rgba(248,113,113,.5)';
      return false;
    }
    if (errorEl) errorEl.textContent = '';
    input.style.borderColor = '';
    return true;
  }

  form.querySelectorAll('.form-field input, .form-field textarea').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validateField(field); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('.form-field input, .form-field textarea').forEach((f) => { if (!validateField(f)) valid = false; });
    if (!valid) return;
    if (form.querySelector('[name="_honey"]')?.value) return;

    const btn   = form.querySelector('.form-submit');
    const txtEl = btn.querySelector('.form-submit__text');
    const status = document.getElementById('formStatus');
    const orig  = txtEl.textContent;

    btn.disabled = true;
    txtEl.textContent = 'Enviando...';
    if (status) {
      status.textContent = '';
      status.classList.remove('is-error', 'is-success');
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('No se pudo enviar el mensaje');

      txtEl.textContent = 'Mensaje enviado ✓';
      btn.style.background = '#059669';
      btn.style.boxShadow  = '0 0 28px rgba(5,150,105,.35)';
      if (status) {
        status.textContent = 'Gracias. Tu mensaje llegó a mi correo.';
        status.classList.add('is-success');
      }

      setTimeout(() => {
        txtEl.textContent  = orig;
        btn.disabled       = false;
        btn.style.background = '';
        btn.style.boxShadow  = '';
        form.reset();
        form.querySelectorAll('.form-field input, .form-field textarea').forEach(f => { f.style.borderColor = ''; });
      }, 3200);
    } catch (err) {
      txtEl.textContent = orig;
      btn.disabled = false;
      if (status) {
        status.textContent = 'No se pudo enviar. Escríbeme por WhatsApp o correo.';
        status.classList.add('is-error');
      }
    }
  });
})();

/* --- 8. IMAGE SHEET TILT -------------------------------------- */
(function initImageSheetTilt() {
  if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;

  const sheets = [
    ...document.querySelectorAll('.about__photo'),
    ...document.querySelectorAll('.proj-visual-media')
  ];
  if (!sheets.length) return;

  sheets.forEach((sheet) => {
    const target = sheet.matches('.about__photo')
      ? sheet.querySelector('.about__photo-inner')
      : sheet;
    if (!target) return;

    sheet.addEventListener('pointermove', (e) => {
      const rect = sheet.getBoundingClientRect();
      const px = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const py = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
      const rotateY = (px - 0.5) * 18;
      const rotateX = (0.5 - py) * 14;

      target.classList.add('is-tilting');
      target.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
      target.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
      target.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
      target.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
    }, { passive: true });

    sheet.addEventListener('pointerleave', () => {
      target.classList.remove('is-tilting');
      target.style.setProperty('--tilt-x', '0deg');
      target.style.setProperty('--tilt-y', '0deg');
      target.style.setProperty('--glare-x', '50%');
      target.style.setProperty('--glare-y', '50%');
    });
  });
})();
