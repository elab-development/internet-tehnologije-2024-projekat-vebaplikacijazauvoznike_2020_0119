// === GLOBAL LOADER ===
function showLoader() {
  const loader = document.getElementById("loading-screen");
  const main = document.querySelector(".page-container");
  if (!loader) return;
  loader.style.display = "flex";
  requestAnimationFrame(() => {
    loader.style.opacity = "1";
    if (main) main.style.opacity = "0";
    document.body.style.overflow = "hidden";
  });
}
function hideLoader() {
  const loader = document.getElementById("loading-screen");
  const main = document.querySelector(".page-container");
  if (!loader) return;
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
    if (main) main.style.opacity = "1";
    document.body.style.overflow = "auto";
  }, 500);
}
window.addEventListener("load", hideLoader);

// === (Opcioni) mini “user store” — ostavljeno ako ti treba za demo
const UserStore = {
  key: "usersByEmail",
  _read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch { return {}; }
  },
  _write(obj) { localStorage.setItem(this.key, JSON.stringify(obj)); },
  exists(email) { return !!this._read()[email.toLowerCase()]; },
  get(email) { return this._read()[email.toLowerCase()] || null; },
  create(user) {
    const m = this._read(); const k = user.email.toLowerCase();
    if (m[k]) return false; m[k] = user; this._write(m); return true;
  },
};

// === ANIMATED BLOBS ===
function initAnimatedBlobs(containerId, blobsConfig) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Kontejner sa ID-em '${containerId}' nije pronađen. Blobovi neće biti inicijalizovani.`);
    return;
  }
  blobsConfig.forEach((blobConfig, index) => {
    const animationName = `animate-blob-${containerId}-${Date.now()}-${index}`;
    let keyframesString = `@keyframes ${animationName} {`;
    for (const [percent, position] of Object.entries(blobConfig.keyframes)) {
      keyframesString += `
        ${percent} {
          transform: translate(${position.x}, ${position.y});
        }
      `;
    }
    keyframesString += "}";

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = keyframesString;
    document.head.appendChild(styleSheet);

    const blobElement = document.createElement("div");
    blobElement.classList.add("animated-blob");
    blobElement.style.width = blobConfig.size;
    blobElement.style.height = blobConfig.height || blobConfig.size;
    blobElement.style.background = blobConfig.color;
    blobElement.style.opacity = blobConfig.opacity;
    blobElement.style.filter = `blur(${blobConfig.blur})`;
    blobElement.style.animationName = animationName;
    blobElement.style.animationDuration = blobConfig.speed;
    blobElement.style.animationDirection = "alternate";
    blobElement.style.animationTimingFunction = "ease-in-out";
    blobElement.style.animationIterationCount = "infinite";

    container.appendChild(blobElement);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // BLOBS – podešavanja
  const rightSectionBlobsConfig = [
    { color: "rgba(255,102,170,0.5)", opacity: "1", size: "30rem", blur: "5rem", speed: "5s",
      keyframes: { "0%": { x: "0vw", y: "80vh" }, "100%": { x: "-10vw", y: "90vh" } } },
    { color: "var(--blur-purple)", opacity: "1", size: "50rem", blur: "5rem", speed: "10s",
      keyframes: { "0%": { x: "-20vw", y: "80vh" }, "100%": { x: "20vw", y: "60vh" } } },
    { color: "var(--primary-accent-color)", opacity: "1", size: "30rem", blur: "5rem", speed: "10s",
      keyframes: { "0%": { x: "20vw", y: "60vh" }, "100%": { x: "-20vw", y: "80vh" } } },
    { color: "var(--blur-yellow)", opacity: "0.5", size: "20rem", blur: "10rem", speed: "20s",
      keyframes: { "0%": { x: "0vw", y: "-35vh" }, "100%": { x: "20vw", y: "-45vh" } } },
    { color: "var(--blur-orange)", opacity: "0.5", size: "30rem", blur: "10rem", speed: "20s",
      keyframes: { "0%": { x: "-25vw", y: "-60vh" }, "100%": { x: "25vw", y: "-55vh" } } },
  ];
  const fullPageBlobsConfig = [
    { color: "var(--blur-purple)", opacity: "0.25", size: "80rem", blur: "10rem", speed: "20s",
      keyframes: { "0%": { x: "-20vw", y: "80vh" }, "100%": { x: "80vw", y: "100vh" } } },
    { color: "var(--blur-yellow)", opacity: "0.25", size: "20rem", blur: "10rem", speed: "20s",
      keyframes: { "0%": { x: "0vw", y: "-30vh" }, "100%": { x: "20vw", y: "-40vh" } } },
    { color: "var(--blur-orange)", opacity: "0.25", size: "30rem", blur: "10rem", speed: "20s",
      keyframes: { "0%": { x: "-20vw", y: "-60vh" }, "100%": { x: "20vw", y: "-50vh" } } },
  ];
  const introBlobsConfig = [
    { color: "rgba(255,102,170,0.5)", opacity: "0.5", size: "60rem", blur: "10rem", speed: "5s",
      keyframes: { "0%": { x: "60vw", y: "50vh" }, "100%": { x: "40vw", y: "0vh" } } },
    { color: "rgba(255,102,170,0.5)", opacity: "0.5", size: "40rem", blur: "10rem", speed: "5s",
      keyframes: { "0%": { x: "0vw", y: "0vh" }, "100%": { x: "-20vw", y: "50vh" } } },
  ];

  if (document.getElementById("blob-container")) {
    initAnimatedBlobs("blob-container", rightSectionBlobsConfig);
  }
  const fullPageBlobContainer = document.getElementById("full-page-blob-container");
  if (fullPageBlobContainer) {
    if (document.body.classList.contains("intro-loader")) {
      initAnimatedBlobs("full-page-blob-container", introBlobsConfig);
    } else {
      initAnimatedBlobs("full-page-blob-container", fullPageBlobsConfig);
    }
  }

  // “Enter/Space” accessibility za .popfx
  document.querySelectorAll(".popfx").forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
    });
  });
});

// === POST‑AUTH NOTICE (modal) + LOGOUT varijanta ===
(function PostAuthNotice() {
  const STORAGE_KEY = "postAuthNotice";
  function ensureOverlay() {
    if (document.getElementById("postAuthOverlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "postAuthOverlay";
    overlay.className = "notice-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="notice-modal" role="dialog" aria-modal="true" aria-labelledby="postAuthTitle" aria-describedby="postAuthDesc">
        <img id="postAuthIcon" class="notice-illustration" src="../images/transio_image_03.01.png" alt="" />
        <h2 class="notice-title" id="postAuthTitle">Congrats!</h2>
        <p class="notice-desc" id="postAuthDesc">
          Your account is all set up. You can now access your
          <strong>personalized dashboard</strong> and <strong>all our features</strong>.
        </p>
        <button class="notice-cta" id="postAuthCta" type="button">Let’s Go</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  ensureOverlay();

  (function ensureNoticeActionsStyle() {
    const STYLE_ID = "notice-actions-inline-style";
    if (document.getElementById(STYLE_ID)) return;
    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = `
      .notice-actions {
        display: flex; flex-direction: row; gap: 1rem; justify-content: center; margin-top: 1.5rem;
      }
    `;
    document.head.appendChild(st);
  })();

  const TEXT = {
    signup: {
      title: "Congrats!",
      desc: "Your account is all set up. You can now access your <strong>personalized dashboard</strong> and <strong>all our features</strong>.",
      cta: "Let’s Go",
      icon: "../images/transio_image_03.01.png",
    },
    login: {
      title: "You’re In!",
      desc: "You’re now logged in. Access your <strong>personalized dashboard</strong> and <strong>all our features</strong>.",
      cta: "Let’s Go",
      icon: "../images/transio_image_03.01.png",
    },
    error: {
      title: "Hold It Right There!",
      desc: "Looks like you’ve <strong>wandered into a restricted area</strong>. Let’s get you <strong>back on track</strong>.",
      cta: "Oops, My Bad",
      icon: "../images/transio_image_03.02.png",
    },
    logout: {
      title: "Leaving So Soon?",
      desc: "Are you sure you want to <strong>log out</strong>?<br>You can log back in anytime to access <strong>your dashboard</strong> and <strong>all features</strong>.",
      ctaYes: "Log Me Out",
      ctaCancel: "Stay Here",
      icon: "../images/transio_image_03.03.png",
    },
  };

  function openNotice(variant, onConfirm) {
    const overlay = document.getElementById("postAuthOverlay");
    if (!overlay) return;

    const data = TEXT[variant] || TEXT.login;
    const modal = overlay.querySelector(".notice-modal");
    const titleEl = document.getElementById("postAuthTitle");
    const descEl = document.getElementById("postAuthDesc");
    const iconEl = document.getElementById("postAuthIcon");
    const ctaEl = document.getElementById("postAuthCta");

    const oldActions = modal.querySelector(".notice-actions");
    if (oldActions) oldActions.remove();
    if (ctaEl) { ctaEl.style.display = ""; ctaEl.onclick = null; }

    titleEl.textContent = data.title;
    descEl.innerHTML = data.desc;
    iconEl.src = data.icon;

    const close = () => {
      overlay.classList.add("is-leaving");
      overlay.classList.remove("is-open");
      setTimeout(() => { overlay.hidden = true; overlay.classList.remove("is-leaving"); }, 190);
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", onKey);
      overlay.removeEventListener("click", onBackdrop);
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const onBackdrop = (e) => { if (e.target === overlay) close(); };

    if (variant === "logout") {
      if (ctaEl) ctaEl.style.display = "none";
      const actions = document.createElement("div");
      actions.className = "notice-actions";

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "notice-cta notice-cta--cancel";
      cancelBtn.textContent = data.ctaCancel;
      cancelBtn.addEventListener("click", close);

      const yesBtn = document.createElement("button");
      yesBtn.type = "button";
      yesBtn.className = "notice-cta";
      yesBtn.textContent = data.ctaYes;
      yesBtn.addEventListener("click", () => { close(); if (typeof onConfirm === "function") onConfirm(); });

      actions.appendChild(cancelBtn);
      actions.appendChild(yesBtn);
      modal.appendChild(actions);
    } else {
      ctaEl.textContent = data.cta;
      ctaEl.onclick = close;
    }

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    document.addEventListener("keydown", onKey);
    overlay.addEventListener("click", onBackdrop);
    document.body.style.overflow = "hidden";
  }

  window.openNotice = openNotice;

  function readFromStorage() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
  }
  function clearStorage() { try { sessionStorage.removeItem(STORAGE_KEY); } catch {} }
  function readFromQuery() {
    const params = new URLSearchParams(location.search);
    const v = params.get("notice");
    return v && (v === "signup" || v === "login" || v === "error" || v === "logout")
      ? { variant: v, ts: Date.now() }
      : null;
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      const storeHit = readFromStorage();
      const queryHit = storeHit ? null : readFromQuery();
      const hit = storeHit || queryHit;
      if (hit && TEXT[hit.variant]) {
        clearStorage();
        openNotice(hit.variant);
      }
    }, 350);
  });
})();

// === LOGOUT HOOK ===
(function LogoutHook() {
  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", () => {
      if (window.openNotice) {
        window.openNotice("logout", () => {
          try {
            // očisti local/session storage (uklj. naš auth token ako postoji)
            localStorage.removeItem("auth_token");
            sessionStorage.clear();
            localStorage.removeItem("usersByEmail");
          } catch {}
          window.__suspendErrorGuards = true;
          window.location.href = "../html/intro.html";
        });
      }
    });
  });
})();

// === (Opcioni) ERROR GUARDS — isključeno po defaultu da ne smeta tokom razvoja ===
(function ErrorGuards() {
  const ENABLE = false; // stavi na true ako želiš auto-redirect na error-page.html
  if (!ENABLE) return;

  const ERROR_PAGE = "error-page.html";
  const isOnErrorPage = () =>
    location.pathname.endsWith("/" + ERROR_PAGE) || location.pathname.endsWith(ERROR_PAGE);
  function safeRedirect() {
    if (window.__suspendErrorGuards) return;
    if (isOnErrorPage()) return;
    location.href = ERROR_PAGE;
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    safeRedirect();
  }
  window.addEventListener("offline", safeRedirect);
  const _fetch = window.fetch ? window.fetch.bind(window) : null;
  if (_fetch) {
    window.fetch = async (...args) => {
      try {
        const res = await _fetch(...args);
        if (!res.ok && (res.status === 404 || (res.status >= 500 && res.status <= 599))) {
          safeRedirect();
        }
        return res;
      } catch (err) {
        safeRedirect();
        throw err;
      }
    };
  }
  window.addEventListener("error", () => safeRedirect(), { capture: true });
  window.addEventListener("unhandledrejection", () => safeRedirect());
})();

// === SIMPLE NOTIFICATIONS PANEL (self‑contained) ===
(function Notifications() {
  const btn = document.getElementById("activityBtn");
  if (!btn) return;

  const STORE_KEY = "transio.notifications";
  let panel, listEl, markAllBtn, isOpen = false;

  const load = () => { try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || []; } catch { return []; } };
  const save = (arr) => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(arr)); } catch {} };

  let items = load();

  const fmtNum = (n) => new Intl.NumberFormat().format(n);
  const fmtItems = (n) => (n === 1 ? "1 item" : `${n} items`);
  const fmtPrice = (p) => `${fmtNum(p.value)} ${p.currency}`;
  const fmtVolume = (v) => `${fmtNum(v.value)} ${v.unit}`;
  const fmtDate = (ts) => new Date(ts).toLocaleString();
  const relTime = (ts) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 5) return "just now";
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  const uid = () => "ntf_" + Math.random().toString(36).slice(2, 9);

  function ensurePanel() {
    if (panel) return;
    panel = document.createElement("div");
    panel.className = "activity-panel";
    panel.innerHTML = `
      <div class="activity-panel__head">
        <h3 class="activity-panel__title">Notifications</h3>
        <button type="button" class="activity-mark" id="markAllBtn">Mark all as read</button>
      </div>
      <ul class="activity-list"></ul>
    `;
    document.body.appendChild(panel);
    listEl = panel.querySelector(".activity-list");
    markAllBtn = panel.querySelector("#markAllBtn");

    markAllBtn.addEventListener("click", () => {
      let changed = false;
      items = items.map((n) => {
        if (!n.read) { changed = true; return { ...n, read: true }; }
        return n;
      });
      if (changed) { save(items); render(); syncBadge(); }
    });

    document.addEventListener("click", (e) => {
      if (!isOpen) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      panel.style.display = "none"; isOpen = false;
    });
  }

  function tplNotif(n) {
    const itemsList = (n.items || [])
      .map((i) => `<li>${i.name} × ${fmtNum(i.qty)}</li>`)
      .join("");
    return `
<li class="notif ${n.read ? "" : "is-unread"}" data-id="${n.id}">
  <span class="notif-dot" aria-hidden="true"></span>

  <h4 class="notif-title">
    Shipment from ${n.supplier}
    <span class="notif-sep" aria-hidden="true">•</span>
    <span class="notif-chip notif-chip--status">SHIPPED</span>
  </h4>

  <time class="notif-time" datetime="${new Date(n.ts).toISOString()}">${relTime(n.ts)}</time>

  <div class="notif-meta">
    ${fmtItems(n.items?.length || 0)} • ${fmtVolume(n.volume)} • ${fmtPrice(n.price)}
  </div>

  <div class="notif-body">
    <div class="notif-details">
      <div class="notif-row">
        <div class="notif-label">Supplier:</div>
        <div class="notif-value">${n.supplier}</div>
      </div>
      <div class="notif-row">
        <div class="notif-label">Reference:</div>
        <div class="notif-value">${n.ref}</div>
      </div>
      <div class="notif-row">
        <div class="notif-label">Items:</div>
        <ul class="notif-items">${itemsList}</ul>
      </div>
      <div class="notif-row">
        <div class="notif-label">Volume:</div>
        <div class="notif-value">${fmtVolume(n.volume)}</div>
      </div>
      <div class="notif-row">
        <div class="notif-label">Price:</div>
        <div class="notif-value">${fmtPrice(n.price)}</div>
      </div>
      <div class="notif-row">
        <div class="notif-label">Date:</div>
        <div class="notif-value">${fmtDate(n.ts)}</div>
      </div>
    </div>
  </div>
</li>`;
  }

  function render() {
    if (!listEl) return;
    if (!items.length) {
      listEl.innerHTML = `<li class="activity-empty">No notifications yet</li>`;
      return;
    }
    listEl.innerHTML = items.map(tplNotif).join("");
    listEl.querySelectorAll(".notif").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        const n = items.find((x) => x.id === id);
        el.classList.toggle("is-open");
        if (n && !n.read) {
          n.read = true; el.classList.remove("is-unread");
          save(items); syncBadge();
        }
      });
    });
  }

  function syncBadge() {
    const unread = items.filter((n) => !n.read).length;
    let badge = btn.querySelector(".hdr-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "hdr-badge";
      btn.style.position = "relative";
      btn.appendChild(badge);
    }
    badge.textContent = unread > 99 ? "99+" : String(unread);
    badge.hidden = unread === 0;
  }

  btn.addEventListener("click", () => {
    ensurePanel();
    if (!isOpen) { render(); panel.style.display = "block"; }
    else { panel.style.display = "none"; }
    isOpen = !isOpen;
  });

  // Public API za push iz app‑a: pozovi kad supplier “shipuje”
  window.pushShipmentNotification = function pushShipmentNotification(payload) {
    const n = {
      id: uid(),
      type: "shipment",
      supplier: payload.supplier,
      ref: payload.ref,
      items: payload.items || [],
      volume: payload.volume,             // {value, unit}
      price: payload.price,               // {value, currency}
      ts: payload.ts || Date.now(),
      read: false,
    };
    items.unshift(n);
    save(items);
    syncBadge();
    if (isOpen) render();
  };

  // inicijalni badge (bez demo notifikacije)
  syncBadge();
})();