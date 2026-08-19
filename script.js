(function () {
  "use strict";
  var doc = document.documentElement;

  /* ---------- YEAR ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- LANGUAGE ---------- */
  var STORE = "esdeta-lang";
  function applyLang(lang) {
    doc.setAttribute("lang", lang === "en" ? "en" : "lt");
    doc.setAttribute("data-lang", lang);
    var nodes = document.querySelectorAll("[data-lt],[data-en]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var txt = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-lt");
      if (txt !== null && txt !== undefined) el.textContent = txt;
    }
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }
  var saved = "lt";
  try { var s = localStorage.getItem(STORE); if (s === "en" || s === "lt") saved = s; } catch (e) {}
  applyLang(saved);
  var langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.addEventListener("click", function () {
    applyLang(doc.getAttribute("data-lang") === "en" ? "lt" : "en");
  });
  function curLang() { return doc.getAttribute("data-lang") === "en" ? "en" : "lt"; }

  /* ---------- HEADER STUCK ---------- */
  var head = document.getElementById("siteHead");
  function onScroll() { head.classList.toggle("stuck", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* ---------- CATEGORY FILTER ---------- */
  var filters = document.getElementById("filters");
  var products = Array.prototype.slice.call(document.querySelectorAll("#products .product"));
  if (filters) {
    filters.addEventListener("click", function (e) {
      var b = e.target.closest(".filter");
      if (!b) return;
      filters.querySelectorAll(".filter").forEach(function (f) { f.classList.remove("is-active"); });
      b.classList.add("is-active");
      var cat = b.getAttribute("data-filter");
      products.forEach(function (p, i) {
        var show = cat === "all" || p.getAttribute("data-cat") === cat;
        p.classList.toggle("hide", !show);
        if (show) { p.style.animation = "none"; void p.offsetWidth; p.style.animation = ""; p.style.animationDelay = (i % 6) * 0.04 + "s"; }
      });
      var track = document.getElementById("products");
      if (track) { track.scrollLeft = 0; if (track._upd) track._upd(); }
    });
  }

  /* ---------- SLIDERS (arrows + drag) ---------- */
  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector("[data-track]");
    var prev = slider.querySelector("[data-prev]");
    var next = slider.querySelector("[data-next]");
    if (!track) return;
    function step() {
      var f = track.querySelector(":scope > *:not(.hide)");
      var gap = parseInt(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 20;
      return (f ? f.getBoundingClientRect().width : 300) + gap;
    }
    function upd() {
      if (!prev || !next) return;
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    track._upd = upd;
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener("resize", upd);
    upd();
    var down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft; track.classList.add("drag");
    });
    track.addEventListener("pointermove", function (e) {
      if (!down) return; var dx = e.clientX - sx; moved = Math.abs(dx); track.scrollLeft = sl - dx;
    });
    function end(e) {
      if (!down) return; down = false; track.classList.remove("drag");
      if (moved > 6 && e && e.target) {
        var link = e.target.closest("a,button");
        if (link) { var stop = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
          link.addEventListener("click", stop, { once: true, capture: true });
          setTimeout(function () { link.removeEventListener("click", stop, true); }, 60); }
      }
    }
    track.addEventListener("pointerup", end);
    track.addEventListener("pointerleave", end);
    track.addEventListener("pointercancel", end);
  });

  /* ---------- INSTAGRAM REELS (click to load) ---------- */
  document.querySelectorAll(".reel-media").forEach(function (m) {
    var btn = m.querySelector(".reel-play");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (m.classList.contains("playing")) return;
      var src = m.getAttribute("data-embed");
      if (!src) return;
      var f = document.createElement("iframe");
      f.src = src;
      f.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share");
      f.setAttribute("allowfullscreen", "");
      f.setAttribute("scrolling", "no");
      f.setAttribute("title", "Instagram");
      m.appendChild(f);
      m.classList.add("playing");
      btn.style.display = "none";
    });
  });

  /* ---------- PRODUCT MODAL ---------- */
  var modal = document.getElementById("pmodal");
  var pm = {
    img: document.getElementById("pm-img"),
    cat: document.getElementById("pm-cat"),
    name: document.getElementById("pm-name"),
    size: document.getElementById("pm-size"),
    price: document.getElementById("pm-price"),
    desc: document.getElementById("pm-desc")
  };
  function openModal(card) {
    var lang = curLang();
    pm.img.src = card.getAttribute("data-img");
    pm.img.alt = card.getAttribute("data-name");
    var catEl = card.querySelector(".p-cat");
    pm.cat.textContent = catEl ? catEl.textContent : "";
    pm.name.textContent = card.getAttribute("data-name");
    pm.size.textContent = card.getAttribute("data-size");
    pm.price.textContent = card.getAttribute("data-price");
    pm.desc.textContent = card.getAttribute("data-desc-" + lang) || card.getAttribute("data-desc-lt");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  if (modal) {
    products.forEach(function (card) {
      var more = card.querySelector(".p-more");
      if (more) more.addEventListener("click", function () { openModal(card); });
    });
    modal.querySelectorAll("[data-modal-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { if (modal.classList.contains("open")) closeModal(); closeMenu(); }
    });
  }

  /* ---------- HERO VIDEO: always playing ---------- */
  var hv = document.querySelector(".hm-video");
  if (hv) {
    hv.muted = true;
    var kick = function () { var p = hv.play(); if (p && p.catch) p.catch(function () {}); };
    hv.addEventListener("loadeddata", kick);
    hv.addEventListener("canplay", kick);
    kick();
    ["touchstart", "click", "scroll", "pointerdown"].forEach(function (ev) {
      document.addEventListener(ev, kick, { once: true, passive: true });
    });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) kick(); });
  }

  /* ---------- REVEAL ---------- */
  var targets = document.querySelectorAll(".sec-head, .filters, .about-photo, .about-copy, .live-inner, .contact-grid, .reels-grid, .hero-copy");
  targets.forEach(function (t) { t.setAttribute("data-reveal", ""); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add("in"); });
  }
})();
