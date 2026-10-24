// Site vitrine Presmile : en-tête (bordure au défilement, menu mobile) et choix mensuel / annuel du tarif

// ---- En-tête : menu sur téléphone (bouton ☰), page en cours, bordure au défilement ----
const header = document.querySelector(".site-header");
const menuBtn = header && header.querySelector(".menu-btn");
const backdrop = document.createElement("div");
backdrop.className = "menu-backdrop";
document.body.appendChild(backdrop);

function setMenu(open) {
  if (!header) return;
  header.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  if (menuBtn) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    menuBtn.innerHTML = `<svg class="ic" viewBox="0 0 24 24">${open ? '<path d="M18 6 6 18M6 6l12 12"/>' : '<path d="M4 6h16M4 12h16M4 18h16"/>'}</svg>`;
  }
}
function toggleMenu() { setMenu(!header.classList.contains("open")); }
backdrop.addEventListener("click", () => setMenu(false));
addEventListener("keydown", e => { if (e.key === "Escape" && header && header.classList.contains("open")) { setMenu(false); menuBtn && menuBtn.focus(); } });
matchMedia("(min-width: 1081px)").addEventListener("change", e => { if (e.matches) setMenu(false); });
if (header) header.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));

// Page en cours mise en avant dans le menu
const here = location.pathname.split("/").pop() || "index.html";
if (header) header.querySelectorAll(".nav a[href]").forEach(a => {
  if (a.getAttribute("href") === here) { a.classList.add("active"); a.setAttribute("aria-current", "page"); }
});

if (header) {
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 4);
  addEventListener("scroll", onScroll, {passive: true});
  onScroll();
}

// Clavier ouvert (saisie dans un champ) : la barre du bas s'efface pour ne pas cacher le champ
document.addEventListener("focusin", e => { if (e.target.matches("input, select, textarea")) document.body.classList.add("typing"); });
document.addEventListener("focusout", () => document.body.classList.remove("typing"));

// Adresse de l'outil Presmile (écran de connexion), pour tous les liens « Se connecter » (data-app-link).
// À passer sur https://app.presmile.fr quand le domaine sera pris.
const APP_URL = "https://app.presmile.fr";
document.querySelectorAll("a[data-app-link]").forEach(a => { a.href = APP_URL + "/"; });

const PRICE = {monthly: {value: "19", unit: "€ / mois", note: "Sans engagement, résiliable à tout moment"},
               yearly: {value: "190", unit: "€ / an", note: "Soit 15,83 € par mois, deux mois offerts"}};
document.querySelectorAll(".offer-section [data-billing]").forEach(btn => btn.addEventListener("click", () => {
  const p = PRICE[btn.dataset.billing];
  document.querySelectorAll(".offer-section [data-billing]").forEach(b => b.setAttribute("aria-pressed", b === btn));
  document.getElementById("priceValue").textContent = p.value;
  document.getElementById("priceUnit").textContent = p.unit;
  document.getElementById("priceNote").textContent = p.note;
  document.getElementById("offerLink").href = "lancement.html";
}));

// Champ email de l'accroche : ouvre la page « Être prévenu du lancement » avec l'email déjà rempli
document.querySelectorAll("form[data-signup]").forEach(form => form.addEventListener("submit", e => {
  e.preventDefault();
  const email = form.querySelector("input[type=email]").value.trim();
  try { if (email) sessionStorage.setItem("signupEmail", email); } catch (err) { /* navigation privée : l'email sera à retaper */ }
  location.href = form.getAttribute("action") || "lancement.html";  // jamais l'email dans l'adresse (journaux, statistiques)
}));

// Barre d'essai collée en bas sur téléphone : visible une fois l'accroche dépassée, cachée près de l'appel final
const sticky = document.getElementById("stickyCta");
if (sticky) {
  const finalCta = document.querySelector(".cta-final");
  const update = () => {
    const pastHero = scrollY > 480;
    const nearEnd = finalCta && finalCta.getBoundingClientRect().top < innerHeight;
    sticky.classList.toggle("show", pastHero && !nearEnd);
  };
  addEventListener("scroll", update, {passive: true});
  update();
}

// Page « Presmile sur ton téléphone » : onglets iPhone / Android, le bon ouvert d'office selon l'appareil
const osTabs = document.querySelectorAll(".os-tabs [role=tab]");
if (osTabs.length) {
  const show = id => osTabs.forEach(tab => {
    const on = tab.id === id;
    tab.setAttribute("aria-selected", on);
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !on;
  });
  osTabs.forEach(tab => tab.addEventListener("click", () => show(tab.id)));
  if (/android/i.test(navigator.userAgent)) show("tab-android");
}

// Page Fonctionnalités : la pastille de la rubrique lue s'allume dans le sommaire (barre collante sur téléphone)
const toc = document.querySelector(".toc");
if (toc && "IntersectionObserver" in window) {
  const links = new Map([...toc.querySelectorAll("a[href^='#']")].map(a => [a.getAttribute("href").slice(1), a]));
  const visible = new Set();
  const mark = () => {
    const current = [...links.keys()].find(id => visible.has(id));
    links.forEach((a, id) => {
      const on = id === current;
      a.classList.toggle("active", on);
      if (on && toc.scrollWidth > toc.clientWidth) toc.scrollTo({left: a.offsetLeft - 16, behavior: "smooth"});
    });
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => en.isIntersecting ? visible.add(en.target.id) : visible.delete(en.target.id));
    mark();
  }, {rootMargin: "-150px 0px -55% 0px"});
  links.forEach((a, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}

// Accueil : les sections apparaissent en douceur au défilement (tout reste visible sans JavaScript)
const reveals = document.querySelectorAll(".reveal");
if (reveals.length && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("js-reveal");
  const seen = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); seen.unobserve(en.target); }
  }), {rootMargin: "0px 0px -8% 0px"});
  reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 60}ms`; seen.observe(el); });
}
