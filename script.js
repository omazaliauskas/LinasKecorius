(function () {
  "use strict";
  var doc = document.documentElement;

  /* ---------- YEAR ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- LANGUAGE TOGGLE ---------- */
  var STORE = "s47-lang";
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
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      applyLang(doc.getAttribute("data-lang") === "en" ? "lt" : "en");
    });
  }

  /* ---------- HEADER STUCK STATE ---------- */
  var head = document.getElementById("siteHead");
  function onScroll() {
    if (window.scrollY > 24) head.classList.add("stuck");
    else head.classList.remove("stuck");
  }
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
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- GALLERY MODAL ---------- */
  var gModal = document.getElementById("galleryModal");
  var gOpen = document.getElementById("galleryOpen");
  if (gModal && gOpen) {
    var openGallery = function () {
      gModal.classList.add("open");
      gModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    var closeGallery = function () {
      gModal.classList.remove("open");
      gModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };
    gOpen.addEventListener("click", openGallery);
    gModal.querySelectorAll("[data-gallery-close]").forEach(function (b) {
      b.addEventListener("click", closeGallery);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && gModal.classList.contains("open")) closeGallery();
    });
  }

  /* ---------- SLIDERS (arrows + drag) ---------- */
  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    var track = slider.querySelector("[data-track]");
    var prev = slider.querySelector("[data-prev]");
    var next = slider.querySelector("[data-next]");
    if (!track) return;

    function step() {
      var first = track.querySelector(":scope > *");
      var gap = parseInt(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 20;
      var w = first ? first.getBoundingClientRect().width : 320;
      return w + gap;
    }
    function updateArrows() {
      if (!prev || !next) return;
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(updateArrows); }, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();

    /* pointer drag to slide */
    var down = false, startX = 0, startLeft = 0, moved = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true; moved = 0;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.classList.add("drag");
    });
    track.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      track.scrollLeft = startLeft - dx;
    });
    function endDrag(e) {
      if (!down) return;
      down = false;
      track.classList.remove("drag");
      if (moved > 6 && e && e.target) {
        var stop = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
        var link = e.target.closest("a");
        if (link) { link.addEventListener("click", stop, { once: true, capture: true }); setTimeout(function(){ link.removeEventListener("click", stop, true); }, 60); }
      }
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointerleave", endDrag);
    track.addEventListener("pointercancel", endDrag);
  });

  /* ---------- SCROLL REVEAL ---------- */
  var targets = document.querySelectorAll(".sec-head, .stat-row, .steps > *, .slider, .ethos-line, .contact-cards, .loc-copy");
  targets.forEach(function (t) { t.setAttribute("data-reveal", ""); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add("in"); });
  }

  /* ---------- HERO VIDEO READY / FALLBACK ---------- */
  var hv = document.querySelector(".hero-video");
  if (hv) {
    var kick = function () {
      var p = hv.play();
      if (p && p.catch) p.catch(function () {});
    };
    hv.addEventListener("loadeddata", kick);
    document.addEventListener("click", kick, { once: true });
    document.addEventListener("touchstart", kick, { once: true, passive: true });
  }
})();
