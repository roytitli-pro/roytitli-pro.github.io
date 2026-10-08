/* =========================================================
   Portfolio — interactions
   Vanilla JS, aucune dépendance, aucune étape de build.
   ========================================================= */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. Thème clair / sombre (mémorisé) ---------- */
  var THEME_KEY = "portfolio-theme";
  var root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = $("#theme-btn");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("aria-label", theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre");
    }
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#15100f" : "#fbf7f9");
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* mode privé */ }
  if (!saved) {
    saved = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(saved);

  var themeBtn = $("#theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---------- 2. Menu mobile ---------- */
  var burger = $("#burger");
  var nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Referme le menu quand on clique un lien ou dehors
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", function (ev) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(ev.target) || burger.contains(ev.target)) return;
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- 3. Ombre de l'en-tête au défilement ---------- */
  var header = $("#header");
  var toTop = $("#to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 620);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- 4. Filtres de projets ---------- */
  var buttons = $$(".filter");
  var cards = $$("[data-cat]");

  function applyFilter(cat) {
    var shown = 0;
    cards.forEach(function (card) {
      var cats = (card.getAttribute("data-cat") || "").split(/\s+/);
      var match = cat === "all" || cats.indexOf(cat) !== -1;
      card.classList.toggle("hidden", !match);
      if (match) shown++;
    });
    var empty = $("#no-result");
    if (empty) empty.classList.toggle("show", shown === 0);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  /* ---------- 5. Lien de navigation actif ---------- */
  var sections = $$("section[id]");
  var navLinks = $$(".nav a[href^='#']");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var seen = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var bestId = null, best = 0;
      Object.keys(seen).forEach(function (id) { if (seen[id] > best) { best = seen[id]; bestId = id; } });
      if (!bestId) return;
      navLinks.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + bestId);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.6, 1] });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 6. Apparition au défilement ---------- */
  var revealables = $$(".reveal");
  if (revealables.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          obs.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
      revealables.forEach(function (el) { io.observe(el); });
    } else {
      revealables.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ---------- 7. Année automatique dans le pied de page ---------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- 8. Compteur animé des chiffres clés ---------- */
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var co = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        if (reduce || !isFinite(target)) { el.textContent = target + suffix; return; }
        var dur = 900, t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- 9. Formulaire de contact (mode brouillon) ---------- */
  var form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var box = $("#form-status");
      var name = (form.querySelector("#c-nom") || {}).value || "vous";
      var email = (form.querySelector("#c-email") || {}).value || "";
      var msg = (form.querySelector("#c-message") || {}).value || "";

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (box) {
        box.hidden = false;
        box.textContent =
          "Mode brouillon : le formulaire n'est pas encore branché. " +
          "Copiez votre message (« " + msg.slice(0, 60) + (msg.length > 60 ? "…" : "") + " ») " +
          "et envoyez-le à " + (email || "votre adresse e-mail") + ".";
      }
      form.reset();
    });
  }

  /* ---------- 10. Liens pas encore renseignés (href="#") ----------
     Ils restent cliquables mais ne font pas sauter la page en haut :
     un petit clignotement rappelle qu'il reste une adresse à mettre. */
  $$('a[href="#"]').forEach(function (a) {
    if (!a.title) a.title = "Lien à compléter";
    a.setAttribute("aria-label", (a.textContent || "").trim() + " — lien à compléter");
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      a.classList.add("todo-pulse");
      setTimeout(function () { a.classList.remove("todo-pulse"); }, 1100);
    });
  });

  /* ---------- 11. Aperçu de la carte de projet au clavier ---------- */
  $$(".card, details.deep").forEach(function (card) {
    var sum = $("summary", card);
    if (!sum) return;
    card.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); sum.click(); }
    });
  });

  /* ---------- 12. Mode édition : modifier les textes en direct ----------
     Les textes marqués data-edit deviennent modifiables. Attention : rien
     n'est enregistré sur le disque. Le bouton « Copier le HTML » met la page
     entière dans le presse-papiers, pour coller le résultat dans index.html. */
  var editBtn = $("#edit-btn");
  var editBar = $("#edit-bar");

  function setEditable(on) {
    $$("[data-edit]").forEach(function (el) {
      if (on) { el.setAttribute("contenteditable", "true"); el.setAttribute("spellcheck", "false"); }
      else { el.removeAttribute("contenteditable"); }
    });
    document.body.classList.toggle("editing", !!on);
    if (editBtn) {
      editBtn.setAttribute("aria-pressed", on ? "true" : "false");
      editBtn.textContent = on ? "✓ Terminer" : "✎ Éditer";
      editBtn.title = on
        ? "Quitter le mode édition (les modifications ne sont pas enregistrées)"
        : "Rendre les textes modifiables";
    }
    if (editBar) editBar.hidden = !on;
  }

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      setEditable(!document.body.classList.contains("editing"));
    });
  }

  var copyBtn = $("#copy-html");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var out = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
      var done = function () {
        copyBtn.textContent = "✓ Copié !";
        setTimeout(function () { copyBtn.textContent = "Copier le HTML modifié"; }, 2200);
      };
      var fail = function () {
        editBar.hidden = false;
        $("#copy-status").textContent = "Copie impossible ici — ouvrez la console (F12) et tapez : copy(document.documentElement.outerHTML)";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(out).then(done).catch(fail);
      } else { fail(); }
    });
  }
  setEditable(false);
})();
