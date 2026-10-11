// Site vitrine Presmile : en-tête (bordure au défilement, menu mobile) et choix mensuel / annuel du tarif

// Adresse de l'outil Presmile (écran de connexion), pour tous les liens « Se connecter » (data-app-link).
// À passer sur https://app.presmile.fr quand le domaine sera pris.
const APP_URL = "https://app.presmile.fr";
document.querySelectorAll("a[data-app-link]").forEach(a => { a.href = APP_URL + "/"; });

const PRICE = {monthly: {value: "19", unit: "€ HT / mois", note: "Sans engagement, résiliable à tout moment"},
               yearly: {value: "190", unit: "€ HT / an", note: "Soit 15,83 € HT par mois, deux mois offerts"}};
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
