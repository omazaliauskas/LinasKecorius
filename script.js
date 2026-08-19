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
    });
  }

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

  /* ---------- REVEAL ---------- */
  var targets = document.querySelectorAll(".sec-head, .filters, .about-photo, .about-copy, .live-inner, .contact-grid, .hero-figure, .hero-copy");
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
