/* =============================================================
   LUNA-OS // afstandsbediening — controller-logica (telefoon)
   Verbindt via WebRTC (PeerJS) met het scherm en stuurt commando's.
   ============================================================= */
(() => {
  "use strict";

  const PEER_PREFIX = "lunaos25-"; // moet matchen met script.js (display-kant)
  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const L = () => (window.LUNA && window.LUNA.lang) || "nl";
  const tx = (nl, en) => (L() === "en" ? en : nl);

  const statusEl = $("#status");
  const statusText = $("#statusText");
  const roomGroup = $("#roomGroup");
  const roomInput = $("#roomInput");
  const roomBtn = $("#roomBtn");
  const pad = $("#pad");
  const foot = $("#foot");

  const normCode = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);

  // code uit de URL (?r=) — komt mee via de QR/link
  const params = new URLSearchParams(location.search);
  let code = normCode(params.get("r"));
  if (code) roomInput.value = code;

  let peer = null;
  let conn = null;
  let connected = false;
  let reconnectTimer = null;

  const setStatus = (state, text) => {
    statusEl.className = "rc__status " + state; // is-off | is-connecting | is-on
    statusText.textContent = text;
  };

  const send = (msg) => {
    if (conn && conn.open) {
      try { conn.send(msg); return true; } catch (e) {}
    }
    return false;
  };

  const loadScript = (src) => new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = res;
    s.onerror = () => rej(new Error("load " + src));
    document.head.appendChild(s);
  });

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (!connected && code.length === 4) connect(code);
    }, 2500);
  }

  function openConn() {
    conn = peer.connect(PEER_PREFIX + code, { reliable: true, metadata: { from: "remote" } });
    conn.on("open", () => {
      connected = true;
      setStatus("is-on", tx("verbonden ✓", "connected ✓"));
      foot.textContent = tx("verbonden met scherm ", "connected to screen ") + code;
      roomGroup.style.display = "none";
      vibrate(30);
    });
    conn.on("data", () => { /* 'welcome' van het scherm; verder geen data nodig */ });
    conn.on("close", () => {
      connected = false;
      setStatus("is-off", tx("verbinding verbroken", "connection lost"));
      roomGroup.style.display = "";
      scheduleReconnect();
    });
  }

  async function connect(c) {
    code = normCode(c);
    if (code.length < 4) { setStatus("is-off", tx("code onvolledig", "code incomplete")); return; }
    setStatus("is-connecting", tx("verbinden…", "connecting…"));
    foot.textContent = tx("verbinden met scherm ", "connecting to screen ") + code + "…";

    try {
      if (typeof window.Peer === "undefined")
        await loadScript("https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js");
    } catch (e) {
      setStatus("is-off", tx("geen internet", "no internet"));
      return;
    }

    if (peer) { try { peer.destroy(); } catch (e) {} }
    peer = new window.Peer();
    peer.on("open", () => openConn());
    peer.on("error", (err) => {
      const t = err && err.type;
      if (t === "peer-unavailable") {
        setStatus("is-off", tx("scherm niet gevonden", "screen not found"));
        foot.textContent = tx("staat de site open én is er op 'telefoon koppelen' gedrukt?", "is the site open and did you tap 'connect phone'?");
        scheduleReconnect();
      } else {
        setStatus("is-off", tx("fout: ", "error: ") + (t || tx("onbekend", "unknown")));
      }
    });
  }

  /* ---------- knoppen ---------- */
  document.querySelectorAll("[data-goto]").forEach((b) => {
    b.addEventListener("click", () => { vibrate(15); send({ t: "goto", s: b.dataset.goto }); });
  });
  document.querySelectorAll("[data-cmd]").forEach((b) => {
    b.addEventListener("click", () => { vibrate(20); send({ t: b.dataset.cmd }); });
  });
  document.querySelectorAll("[data-page]").forEach((b) => {
    b.addEventListener("click", () => { vibrate(15); send({ t: "page", dir: parseInt(b.dataset.page, 10) }); });
  });

  /* ---------- touchpad: sleep met je vinger om te scrollen ---------- */
  const SENS = 2.4; // gevoeligheid: klein duwtje = beetje, snelle veeg = veel
  let padPointer = null;
  let lastY = 0;
  let pendingDy = 0;
  pad.addEventListener("pointerdown", (e) => {
    padPointer = e.pointerId;
    lastY = e.clientY;
    try { pad.setPointerCapture(e.pointerId); } catch (err) {}
    pad.classList.add("active");
  });
  pad.addEventListener("pointermove", (e) => {
    if (e.pointerId !== padPointer) return;
    // content volgt de vinger (zoals native scrollen): omhoog vegen = naar beneden
    pendingDy += -(e.clientY - lastY) * SENS;
    lastY = e.clientY;
  });
  const endPad = (e) => {
    if (padPointer !== null && (!e || e.pointerId === padPointer)) {
      padPointer = null;
      pad.classList.remove("active");
    }
  };
  pad.addEventListener("pointerup", endPad);
  pad.addEventListener("pointercancel", endPad);
  pad.addEventListener("lostpointercapture", endPad);
  // geaccumuleerde delta per frame versturen (voorkomt overspoelen met berichten)
  (function flushPad() {
    if (pendingDy && conn && conn.open) {
      send({ t: "scrollBy", dy: pendingDy });
      pendingDy = 0;
    }
    requestAnimationFrame(flushPad);
  })();

  /* ---------- room-code invoer ---------- */
  roomBtn.addEventListener("click", () => connect(roomInput.value));
  roomInput.addEventListener("keydown", (e) => { if (e.key === "Enter") connect(roomInput.value); });

  /* ---------- auto-verbinden als de code via QR/URL kwam ---------- */
  if (code.length === 4) connect(code);
  else setStatus("is-off", tx("voer de room-code in", "enter the room code"));

  // bij live taalwissel: ververs de dynamische status/voet-tekst indien verbonden
  window.addEventListener("luna:lang", () => {
    if (connected) {
      setStatus("is-on", tx("verbonden ✓", "connected ✓"));
      foot.textContent = tx("verbonden met scherm ", "connected to screen ") + code;
    }
  });
})();
