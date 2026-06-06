/* =============================================================
   LUNA-OS // STATION_MICHAEL  —  animatie-engine
   Pure vanilla JS. Geen dependencies. Werkt op GitHub Pages.
   ============================================================= */
(() => {
  "use strict";

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand  = (a, b) => a + Math.random() * (b - a);

  const PALETTE = ["#2af5e0", "#ffb24a", "#ff3d8b", "#8b7bff", "#e9eefb"];

  /* ===========================================================
     1. KLOK (HUD) — leeft in de browser, dus Date is hier prima
     =========================================================== */
  const clockEl = $("#clock");
  function tickClock() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    clockEl.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ===========================================================
     2. CUSTOM CURSOR (alleen desktop / fijne pointer)
     =========================================================== */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    let rx = 0, ry = 0, dx = 0, dy = 0;
    addEventListener("mousemove", (e) => {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    });
    (function follow() {
      rx += (dx - rx) * 0.18; ry += (dy - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
    const hoverSel = "a, button, [data-hover], .why-card, .stat";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverSel)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverSel)) ring.classList.remove("is-hover");
    });
  }

  /* ===========================================================
     3. STARFIELD (canvas achtergrond)
     =========================================================== */
  (function starfield() {
    const cv = $("#starfield");
    const ctx = cv.getContext("2d");
    let w, h, dpr, stars = [];
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * dpr;
      h = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px";
      cv.style.height = innerHeight + "px";
      const count = Math.round((innerWidth * innerHeight) / 9000);
      stars = Array.from({ length: clamp(count, 60, 220) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: rand(0.3, 1.6),          // diepte → grootte + snelheid
        tw: rand(0, Math.PI * 2),   // twinkel-fase
        c: Math.random() < 0.12 ? PALETTE[Math.floor(rand(0, 3))] : "#cdd7f5",
      }));
    }
    resize();
    addEventListener("resize", resize);

    let mx = 0, my = 0;
    if (fine) addEventListener("mousemove", (e) => {
      mx = (e.clientX / innerWidth - 0.5);
      my = (e.clientY / innerHeight - 0.5);
    });

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y += s.z * 0.25 * dpr;                 // langzame drift
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        const px = s.x + mx * s.z * 26 * dpr;    // parallax
        const py = s.y + my * s.z * 26 * dpr;
        const tw = 0.55 + 0.45 * Math.sin(t / 700 + s.tw);
        ctx.globalAlpha = tw;
        ctx.fillStyle = s.c;
        const r = s.z * 1.1 * dpr;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!REDUCED) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ===========================================================
     4. FOTO-SLOT — val terug op placeholder als er geen foto is
     =========================================================== */
  (function photo() {
    const img = $("#subjectPhoto");
    const ph = $("#scanPlaceholder");
    const idEl = $("#scanId");
    const setId = () => {
      idEl.textContent = "0x" + Math.floor(rand(0, 1) * 0xffffff).toString(16).padStart(6, "0").toUpperCase();
    };
    setInterval(setId, 1400); setId();
    const showPlaceholder = () => { img.style.display = "none"; ph.style.display = "grid"; };
    const showPhoto = () => { ph.style.display = "none"; img.style.display = "block"; };
    img.addEventListener("error", showPlaceholder);
    img.addEventListener("load", () => { if (img.naturalWidth > 1) showPhoto(); });
    if (img.complete) { img.naturalWidth > 1 ? showPhoto() : showPlaceholder(); }
  })();

  /* ===========================================================
     4b. GIFT-BANNER — val terug op tekst-logo als key-art ontbreekt
     =========================================================== */
  (function giftBanner() {
    const b = document.getElementById("giftBanner");
    if (!b) return;
    const fail = () => { b.style.display = "none"; }; // fallback-logo eronder wordt zichtbaar
    b.addEventListener("error", fail);
    if (b.complete && b.naturalWidth < 1) fail();
  })();

  /* ===========================================================
     5. SCROLL-PROGRESS + reveal-on-scroll
     =========================================================== */
  const scrollBar = $("#scrollBar");
  addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollBar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  }, { passive: true });

  const revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
    }
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach((el) => revealIO.observe(el));

  /* ===========================================================
     6. COUNT-UP teller
     =========================================================== */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const fmt = (n) => n.toLocaleString("nl-NL");
    if (REDUCED) { el.textContent = fmt(target) + suffix; return; }
    const dur = 1500, t0 = performance.now();
    (function step(t) {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target) + suffix;
    })(t0);
  }
  const countIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); }
    }
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => { if (el.id !== "ageNum") countIO.observe(el); });

  /* ===========================================================
     7. TEKST-SCRAMBLE (decryptie-effect)
     =========================================================== */
  function scramble(el, text, dur = 1100) {
    if (REDUCED) { el.textContent = text; return Promise.resolve(); }
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@!?<>/\\01";
    const t0 = performance.now();
    return new Promise((resolve) => {
      (function step(t) {
        const p = clamp((t - t0) / dur, 0, 1);
        const reveal = Math.floor(p * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          if (i < reveal || text[i] === " ") out += text[i];
          else out += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        el.textContent = out;
        if (p < 1) requestAnimationFrame(step);
        else { el.textContent = text; resolve(); }
      })(t0);
    });
  }

  /* ===========================================================
     8. GLITCH op de hero-naam
     =========================================================== */
  function glitch(el) {
    if (REDUCED) return;
    el.classList.add("go");
    setTimeout(() => el.classList.remove("go"), 520);
  }

  /* ===========================================================
     9. CONFETTI (deelt geen loop met starfield; start on-demand)
     =========================================================== */
  const confetti = (() => {
    const cv = $("#confetti");
    const ctx = cv.getContext("2d");
    let w, h, dpr, parts = [], running = false;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    }
    resize(); addEventListener("resize", resize);

    function loop() {
      ctx.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.12 * dpr; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = clamp(p.life / 60, 0, 1);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
        if (p.life <= 0 || p.y > h + 40) parts.splice(i, 1);
      }
      if (parts.length) requestAnimationFrame(loop);
      else { running = false; ctx.clearRect(0, 0, w, h); }
    }
    function burst(x, y, n = 90, spread = 1) {
      if (REDUCED) return;
      x *= dpr; y *= dpr;
      for (let i = 0; i < n; i++) {
        const a = rand(-Math.PI, 0) + rand(-0.4, 0.4) * (1 - spread);
        const sp = rand(4, 13) * dpr * spread;
        parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rand(2, 6) * dpr,
          s: rand(6, 13) * dpr, rot: rand(0, 6), vr: rand(-0.3, 0.3),
          life: rand(70, 130), c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    function rain(n = 160) {
      if (REDUCED) return;
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * w, y: -rand(0, h) , vx: rand(-1.5, 1.5) * dpr, vy: rand(1, 4) * dpr,
          s: rand(6, 13) * dpr, rot: rand(0, 6), vr: rand(-0.3, 0.3),
          life: rand(160, 260), c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    return { burst, rain };
  })();

  function burstFrom(el, n = 90) {
    const r = el.getBoundingClientRect();
    confetti.burst(r.left + r.width / 2, r.top + r.height / 2, n, 1);
  }

  /* ===========================================================
     10. GIFT-REVEAL: Lunafilament-reactor → PRAGMATA
     =========================================================== */
  const reactorSteps = [
    [8,  "// reactor opwarmen…"],
    [22, "// Lunafilament smelten … 1.400 °C"],
    [38, "// wenslijst doelwit raadplegen … resultaat: \"ik weet het niet\""],
    [56, "// alternatief gevonden: 'SSD' / 'RAM' … prijs opvragen …"],
    [72, "// [ TE DUUR — bedankt, AI ] … broer-algoritme inschakelen"],
    [88, "// object materialiseren …"],
    [100,"// VOLTOOID — cadeau gegenereerd:"],
  ];
  let giftDone = false;
  async function runReactor() {
    if (giftDone) return; giftDone = true;
    const fill = $("#reactorFill");
    const status = $("#reactorStatus");
    const card = $("#giftCard");
    const name = $("#giftName");

    if (REDUCED) {
      fill.style.width = "100%";
      status.textContent = reactorSteps[reactorSteps.length - 1][1];
      name.textContent = "PRAGMATA";
      card.classList.add("in");
      return;
    }

    const dur = 3200, t0 = performance.now();
    let si = 0;
    await new Promise((resolve) => {
      (function step(t) {
        const p = clamp((t - t0) / dur, 0, 1);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const pct = eased * 100;
        fill.style.width = pct + "%";
        while (si < reactorSteps.length && pct >= reactorSteps[si][0]) {
          status.textContent = reactorSteps[si][1];
          si++;
        }
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      })(t0);
    });

    card.classList.add("in");
    await scramble(name, "PRAGMATA", 1200);
    burstFrom(card, 110);
  }
  const giftIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { runReactor(); giftIO.disconnect(); }
    }
  }, { threshold: 0.45 });
  giftIO.observe($("#reactor"));

  /* ===========================================================
     11. PARTY-knop + Steam-knop
     =========================================================== */
  $("#partyBtn").addEventListener("click", (e) => {
    confetti.rain(180);
    burstFrom(e.currentTarget, 120);
  });
  $("#steamBtn").addEventListener("click", (e) => burstFrom(e.currentTarget, 60));

  /* ===========================================================
     12. KONAMI-CODE easter egg
     =========================================================== */
  (function konami() {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let i = 0;
    addEventListener("keydown", (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = (k === seq[i]) ? i + 1 : (k === seq[0] ? 1 : 0);
      if (i === seq.length) {
        i = 0;
        confetti.rain(260);
        confetti.burst(innerWidth / 2, innerHeight / 2, 200, 1);
        const hint = $("#konamiHint");
        if (hint) hint.textContent = "ok, jij nerd. dít is je echte cadeau: nóg meer confetti. 🎉";
        glitch($(".hero__name"));
      }
    });
  })();

  /* ===========================================================
     13. BOOT-SEQUENCE
     =========================================================== */
  const bootLines = [
    { pre: "> LUNA-OS v25.0 // verjaardagskernel laden ", tok: "[ OK ]", cls: "ok" },
    { pre: "> verbinding met STATION_MICHAEL ", tok: "[ OK ]", cls: "ok" },
    { pre: "> subject identificeren … ", tok: "MICHAEL ULLERS", cls: "ok" },
    { pre: "> leeftijd synchroniseren … 24 → 25 ", tok: "[ OK ]", cls: "ok" },
    { pre: "> cadeauvoorkeuren ophalen … ", tok: "[ FOUT 404 ]", cls: "err" },
    { pre: "  └─ ontvangen input: \"eh… dinges\". parser geeft het op.", tok: "", cls: "warn", line: "warn" },
    { pre: "> noodprotocol \"BROER BESLIST\" activeren ", tok: "[ OK ]", cls: "ok" },
    { pre: "> Lunafilament-reactor voorverwarmen ", tok: "[ OK ]", cls: "ok" },
    { pre: "> systeem gereed. veel plezier — en doe rustig met scrollen. ", tok: "", cls: "ok" },
  ];

  const boot = $("#boot");
  const log = $("#bootLog");
  const barFill = $("#bootBarFill");
  let finished = false;

  function finishBoot() {
    if (finished) return; finished = true;
    boot.classList.add("is-done");
    document.body.classList.remove("is-booting");
    // hero count-up + glitch starten zodra de boot weg is
    const age = $("#ageNum");
    setTimeout(() => countUp(age), 250);
    setTimeout(() => glitch($(".hero__name")), 600);
    // af en toe nog een glitch voor de sfeer
    if (!REDUCED) setInterval(() => {
      if (scrollY < innerHeight) glitch($(".hero__name"));
    }, 6500);
  }

  $("#bootSkip").addEventListener("click", finishBoot);

  async function typeBoot() {
    if (REDUCED) {
      log.innerHTML = bootLines.map((l) =>
        `<span class="${l.line || ""}">${l.pre}<span class="${l.cls}">${l.tok}</span></span>`
      ).join("\n");
      barFill.style.width = "100%";
      await sleep(400);
      finishBoot();
      return;
    }

    for (let i = 0; i < bootLines.length; i++) {
      const l = bootLines[i];
      const div = document.createElement("span");
      if (l.line) div.className = l.line;
      const txt = document.createElement("span");
      const tok = document.createElement("span");
      tok.className = l.cls;
      const caret = document.createElement("span");
      caret.className = "boot__cursor";
      div.append(txt, tok, caret);
      log.append(div, document.createTextNode("\n"));

      // typ de regel-tekst
      for (let c = 0; c < l.pre.length; c++) {
        txt.textContent += l.pre[c];
        await sleep(l.pre[c] === " " ? 6 : 12);
      }
      await sleep(90);
      tok.textContent = l.tok;
      caret.remove();
      barFill.style.width = ((i + 1) / bootLines.length) * 100 + "%";
      await sleep(l.cls === "err" ? 420 : 150);
      if (finished) return; // gebruiker drukte skip
    }
    await sleep(650);
    finishBoot();
  }

  // veiligheidsnet: nooit eindeloos op de bootscreen blijven hangen
  setTimeout(finishBoot, 9000);

  // start zodra DOM klaar is
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", typeBoot);
  } else {
    typeBoot();
  }
})();
