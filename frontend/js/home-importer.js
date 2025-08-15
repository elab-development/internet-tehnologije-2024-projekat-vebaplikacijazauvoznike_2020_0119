document.addEventListener("DOMContentLoaded", () => {
  // === API config ===
  const API_BASE = "http://127.0.0.1:8000";
  const PRODUCTS_ENDPOINT = "/api/products";
  const SUPPLIERS_ENDPOINT = "/api/suppliers";

  // === Header: toggle Products / Suppliers ===
  const searchForm = document.querySelector(".home-hero__form");
  const searchInput = document.getElementById("searchInput");
  const typeHidden = document.getElementById("searchType");
  const btnProd = document.getElementById("toggleProducts");
  const btnSupp = document.getElementById("toggleSuppliers");

  if (searchForm && searchInput && typeHidden && btnProd && btnSupp) {
    function setMode(mode) {
      const prod = mode === "products";
      btnProd.classList.toggle("is-active", prod);
      btnSupp.classList.toggle("is-active", !prod);
      btnProd.setAttribute("aria-pressed", String(prod));
      btnSupp.setAttribute("aria-pressed", String(!prod));
      typeHidden.value = prod ? "products" : "suppliers";
      searchInput.placeholder = prod ? "Search products" : "Search suppliers";
    }
    btnProd.addEventListener("click", () => setMode("products"));
    btnSupp.addEventListener("click", () => setMode("suppliers"));
    setMode("products");

    searchForm.addEventListener("submit", (e) => {
      if (!searchInput.value.trim()) e.preventDefault();
    });
  }

  // ==== Helpers ====
  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getToken = () => localStorage.getItem("auth_token") || "";

  async function apiGet(path, params = {}) {
    const url = new URL(API_BASE + path);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length) {
        url.searchParams.set(k, v);
      }
    });

    const headers = { Accept: "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url.toString(), { method: "GET", headers });
    if (!res.ok) {
      let err = {};
      try {
        err = await res.json();
      } catch (_) {}
      throw Object.assign(new Error("API error"), {
        status: res.status,
        data: err,
      });
    }
    try {
      return await res.json();
    } catch {
      return [];
    }
  }

  // Očekivani oblici odgovora sa backenda:
  // /api/products?search=xx -> [{ id, name, category, supplier, price, volume:{value,unit}, image, desc }]
  // /api/suppliers?search=xx -> [{ id, name, country }]
  // Ako tvoj backend vraća druga polja, mapiraj dole u normalize* funkcijama.

  const normalizeProduct = (p) => ({
    id: p.id,
    name: p.name ?? p.title ?? "Product",
    category: p.category ?? p.category_name ?? "",
    supplier: p.supplier ?? p.supplier_name ?? "",
    price: p.price ?? "",
    volume:
      p.volume ||
      (p.volume_value || p.volume_unit
        ? { value: p.volume_value ?? "", unit: p.volume_unit ?? "" }
        : null),
    image: p.image ?? p.image_url ?? "",
    desc: p.desc ?? p.description ?? "",
  });

  const normalizeSupplier = (s) => ({
    id: s.id,
    name: s.name ?? s.company_name ?? "Supplier",
    country: s.country ?? "",
  });

  // ==== Search module ====
  (function HomeSearch() {
    const form = document.querySelector(".home-hero__form");
    const input = document.getElementById("searchInput");
    const typeEl = document.getElementById("searchType");
    const resultsSection = document.getElementById("searchResults");
    const resultsGrid = document.getElementById("resultsGrid");
    const resultsTitleEl = document.querySelector(".search-results__title");
    const resultsMeta = document.getElementById("resultsMeta");
    const pg = document.getElementById("resultsPagination");
    const pgPrev = document.getElementById("pgPrev");
    const pgNext = document.getElementById("pgNext");
    const pgStatus = document.getElementById("pgStatus");
    const noResults = document.getElementById("noResults");

    if (!form || !input || !typeEl || !resultsSection) return;

    const PAGE_SIZE = 9;
    let state = { items: [], page: 1, pages: 1, q: "", type: "products", loading: false };

    // UI toggles
    function showResultsUI(show) {
      const pageContainer = document.querySelector(".page-container");
      if (pageContainer) pageContainer.classList.toggle("has-search-results", !!show);
      document.body.classList.toggle("search-active", !!show);
      resultsSection.hidden = !show;
    }

    function setLoading(on) {
      state.loading = !!on;
      resultsGrid.classList.toggle("is-loading", state.loading);
      if (state.loading) {
        resultsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:1rem; opacity:.7;">Loading…</div>`;
        noResults.hidden = true;
        pg.hidden = true;
        showResultsUI(true);
      }
    }

    // Render
    const render = () => {
      const typeLabelSingle = state.type === "suppliers" ? "Supplier" : "Product";
      const typeLabel = `${typeLabelSingle}s`;
      if (resultsTitleEl) {
        resultsTitleEl.innerHTML = `<strong>Search result&nbsp;|</strong> ${typeLabel}`;
      }

      if (resultsMeta) {
        const count = state.items.length;
        const label = state.type;
        const qTxt = state.q || "";
        resultsMeta.textContent = `${count} result${count === 1 ? "" : "s"} for “${qTxt}” in ${label}.`;
        resultsMeta.hidden = false;
        resultsMeta.style.display = "block";
      }

      resultsGrid.innerHTML = "";
      noResults.hidden = true;

      if (!state.items.length) {
        showResultsUI(true);
        pg.hidden = true;
        noResults.hidden = false;
        noResults.textContent = `No results found for “${state.q}”.`;
        return;
      }

      slicePage(state.items, state.page).forEach((it) => {
        const card = document.createElement("article");
        card.className = "result-card";
        card.setAttribute("role", "listitem");

        if (state.type === "suppliers") {
          card.classList.add("is-supplier");
          card.innerHTML = `
            <h3 class="result-card__title">${escapeHtml(it.name)}</h3>
            <p class="result-card__subtitle">Supplier</p>
            <div class="result-card__rows">
              <div class="result-card__row">
                <span class="result-card__label">COUNTRY:</span>
                <span class="result-card__value">${it.country ? escapeHtml(it.country) : "—"}</span>
              </div>
            </div>
          `;
        } else {
          const name = escapeHtml(it.name);
          const category = it.category ? escapeHtml(it.category) : "—";
          const supplier = it.supplier ? escapeHtml(it.supplier) : "—";
          const price = it.price || it.price === 0 ? escapeHtml(String(it.price)) : "—";
          const volume =
            it.volume && (it.volume.value || it.volume.value === 0)
              ? `${escapeHtml(String(it.volume.value))} ${escapeHtml(it.volume.unit || "")}`
              : "—";
          const image = it.image ? escapeHtml(it.image) : "";
          const desc =
            it.desc && it.desc.length > 150
              ? `${escapeHtml(it.desc.slice(0, 150))}…`
              : escapeHtml(it.desc || "");

          card.innerHTML = `
            ${image ? `<img class="result-card__img" src="${image}" alt="${name}" loading="lazy" />` : ""}
            <h3 class="result-card__title">${name}</h3>
            <p class="result-card__subtitle with-separator">Product</p>
            <p class="result-card__desc with-separator">${desc}</p>
            <div class="result-card__rows">
              <div class="result-card__row">
                <span class="result-card__label">CATEGORY:</span>
                <span class="result-card__value">${category}</span>
              </div>
              <div class="result-card__row">
                <span class="result-card__label">SUPPLIER:</span>
                <span class="result-card__value">${supplier}</span>
              </div>
              <div class="result-card__row">
                <span class="result-card__label">VOLUME:</span>
                <span class="result-card__value">${volume}</span>
              </div>
              <div class="result-card__row">
                <span class="result-card__label">PRICE:</span>
                <span class="result-card__value result-card__price">${price}</span>
              </div>
            </div>
            <div class="result-card__cta">
              <div class="qty">
                <button class="qty-btn qty-btn--minus" type="button" aria-label="Decrease quantity">−</button>
                <span class="qty-value" data-qty="1" aria-live="polite">1</span>
                <button class="qty-btn qty-btn--plus" type="button" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="result-card__shop"><span class="hdr-btn__text">SHOP</span></button>
            </div>
          `;
        }

        resultsGrid.appendChild(card);
      });

      state.pages = Math.max(1, Math.ceil(state.items.length / PAGE_SIZE));
      if (pgStatus) pgStatus.innerHTML = `${state.page} / <strong>${state.pages}</strong>`;
      if (pgPrev) pgPrev.disabled = state.page <= 1;
      if (pgNext) pgNext.disabled = state.page >= state.pages;
      if (pg) pg.hidden = state.pages <= 1;

      showResultsUI(true);
    };

    const slicePage = (items, page) => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Fetch + render
    async function doSearch() {
      const q = input.value.trim();
      const type = typeEl.value === "suppliers" ? "suppliers" : "products";
      if (!q) {
        showResultsUI(false);
        return;
      }

      state.q = q;
      state.type = type;
      state.page = 1;
      setLoading(true);

      try {
        if (type === "products") {
          const data = await apiGet(PRODUCTS_ENDPOINT, { search: q });
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          state.items = list.map(normalizeProduct);
        } else {
          const data = await apiGet(SUPPLIERS_ENDPOINT, { search: q });
          const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          state.items = list.map(normalizeSupplier);
        }
      } catch (err) {
        console.error("[home-importer] search error:", err);
        state.items = [];
      } finally {
        setLoading(false);
        render();
      }
    }

    // Wire up
    showResultsUI(false);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      doSearch();
    });

    pgPrev?.addEventListener("click", () => {
      if (state.page > 1) {
        state.page--;
        render();
      }
    });
    pgNext?.addEventListener("click", () => {
      if (state.page < state.pages) {
        state.page++;
        render();
      }
    });

    resultsGrid?.addEventListener("click", (e) => {
      const minusBtn = e.target.closest(".qty-btn--minus");
      const plusBtn = e.target.closest(".qty-btn--plus");
      if (!minusBtn && !plusBtn) return;

      const card = e.target.closest(".result-card");
      if (!card) return;
      const valEl = card.querySelector(".qty-value");
      if (!valEl) return;

      let qty = parseInt(valEl.getAttribute("data-qty") || "1", 10) || 1;
      if (minusBtn) qty = Math.max(1, qty - 1);
      if (plusBtn) qty = qty + 1;

      valEl.setAttribute("data-qty", String(qty));
      valEl.textContent = String(qty);
    });

    // Deep-link (?q=...&type=...)
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    const t = params.get("type") || "";
    if (q) {
      input.value = q;
      if (t === "suppliers" || t === "products") typeEl.value = t;
      doSearch();
    }
  })();
});