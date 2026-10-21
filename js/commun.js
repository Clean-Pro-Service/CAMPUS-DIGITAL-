// Fonctions partagées : navigation, session, droits, affichage sûr
import { auth, db, authReady } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const ADMINS = ["tameclor@gmail.com", "rtameclo@gmail.com"];
// Numéro WhatsApp officiel pour les demandes Premium (format international sans +).
export const WHATSAPP_NUMBER = "22898207231";
export const FACULTES = ["FDD", "FLLA", "FASEG", "FSHS", "FSS", "FDS", "Écoles et instituts", "Général"];
export const NIVEAUX = ["Licence 1", "Licence 2", "Licence 3", "Master", "Doctorat", "Tous niveaux"];

// Les droits admin sont basés sur la liste blanche d’e-mails, identique aux règles Firestore.
// Les comptes admin doivent être protégés par un mot de passe fort et la récupération d’e-mail.
export const isAdmin = u => !!u && ADMINS.includes((u.email || "").toLowerCase());
export const premium = p => !!p && p.subscriptionStatus === "active" && !!p.subscriptionExpiresAt?.toDate && p.subscriptionExpiresAt.toDate() > new Date();

export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
  }
  kids.flat().forEach(c => e.append(c instanceof Node ? c : document.createTextNode(c ?? "")));
  return e;
}
export function msg(t, type = "ok") {
  const b = document.getElementById("msg"); if (!b) return;
  b.textContent = t || ""; b.className = "msg " + type; b.hidden = !t;
}
export const safeUrl = u => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null; } catch { return null; } };
export const fmt = ts => ts?.toDate ? ts.toDate().toLocaleDateString("fr-FR") : "—";
export function errFr(e) {
  const c = e?.code || "";
  if (c.includes("permission-denied")) return "Firebase a refusé cette opération. Vérifiez que les règles Firestore corrigées ont bien été publiées, que vous êtes connecté avec tameclor@gmail.com ou rtameclo@gmail.com pour administrer, et que les documents gratuits ont isPremium = false.";
  if (c.includes("unavailable") || c === "auth/network-request-failed") return "Problème de réseau. Réessayez.";
  const m = { "auth/invalid-email": "Adresse e-mail invalide.", "auth/invalid-credential": "E-mail ou mot de passe incorrect.", "auth/wrong-password": "E-mail ou mot de passe incorrect.", "auth/user-not-found": "Aucun compte avec cet e-mail.", "auth/email-already-in-use": "Cet e-mail est déjà utilisé.", "auth/weak-password": "Mot de passe trop faible (6 caractères minimum).", "auth/too-many-requests": "Trop de tentatives. Patientez puis réessayez." };
  return m[c] || "Erreur : " + (e?.message || "inconnue");
}
export async function currentUser() {
  await authReady.catch(() => {});
  return new Promise(r => { const un = onAuthStateChanged(auth, u => { un(); r(u); }); });
}
export async function getProfile(u) {
  try { const s = await getDoc(doc(db, "users", u.uid)); return s.exists() ? s.data() : {}; } catch { return {}; }
}
// Initialise l'en-tête, le menu et le pied de page ; renvoie l'état de session
export async function initPage() {
  const u = await currentUser();
  const admin = isAdmin(u);
  const p = u ? await getProfile(u) : {};
  const links = [["index.html", "Accueil"], ["facultes.html", "Facultés"], ["formations.html", "Formations"], ["bibliotheque.html", "Bibliothèque"], ["bourses.html", "Bourses"], ["recherche.html", "Recherche"], ["abonnement.html", "Abonnement"]];
  if (u) links.push(["profil.html", "Mon profil"]);
  if (admin) links.push(["admin.html", "Admin"]);
  const nav = h("nav", { id: "nav" }, links.map(([a, t]) => h("a", { href: a }, t)));
  if (u) nav.append(h("a", { href: "#", onclick: async e => { e.preventDefault(); await signOut(auth); location.href = "index.html"; } }, "Déconnexion"));
  else nav.append(h("a", { href: "connexion.html" }, "Connexion"));
  const bar = h("div", { class: "bar" }, h("a", { class: "logo", href: "index.html" }, "CAMPUS ", h("span", {}, "DIGITAL")), h("button", { id: "burger", "aria-label": "Menu", onclick: () => nav.classList.toggle("open") }, "☰"));
  document.getElementById("hd").append(bar, nav);
  document.getElementById("ft").append(
    h("div", { class: "footer-inner" },
      h("div", { class: "footer-brand" }, h("span", { class: "footer-mark" }, "CD"), h("div", {}, h("strong", {}, "CAMPUS DIGITAL"), h("small", {}, "Le savoir à portée de clic."))),
      h("p", {}, "Apprendre. Découvrir. Construire son avenir."),
      h("div", { class: "footer-links" }, h("a", { href: "formations.html" }, "Formations"), h("a", { href: "bibliotheque.html" }, "Bibliothèque"), h("a", { href: "bourses.html" }, "Bourses"), h("a", { href: "https://univ-lome.tg/", target: "_blank", rel: "noopener noreferrer" }, "Université de Lomé")),
      h("p", { class: "footer-contact" }, "Contact : tameclor@gmail.com · © CAMPUS DIGITAL")
    )
  );
  enhancePageMotion();
  return { u, p, admin, prem: premium(p) || admin };
}

function enhancePageMotion() {
  const path = location.pathname.split("/").pop() || "index.html";
  const pages = {
    "facultes.html": ["ORIENTATION UNIVERSITAIRE", "Choisis ta voie.", "Explore les facultés et établissements pour mieux préparer ton parcours."],
    "formations.html": ["APPRENDRE & PROGRESSER", "Fais grandir tes compétences.", "Des cours et des supports pour avancer à ton rythme."],
    "bibliotheque.html": ["ESPACE DE RÉVISION", "Ta bibliothèque, partout avec toi.", "Retrouve des ressources utiles pour étudier, comprendre et réviser."],
    "bourses.html": ["OPPORTUNITÉS", "Ouvre le champ des possibles.", "Découvre des pistes de bourses et consulte toujours les sources officielles."],
    "recherche.html": ["RECHERCHE INTELLIGENTE", "Trouve ce qu’il te faut.", "Un mot-clé pour retrouver cours, ressources et informations utiles."],
    "connexion.html": ["TON ESPACE PERSONNEL", "Bienvenue sur ton campus.", "Connecte-toi ou crée ton compte pour retrouver ton espace étudiant."],
    "profil.html": ["ESPACE ÉTUDIANT", "Ton parcours, en un seul endroit.", "Gère tes informations et consulte l’état de ton accès premium."],
    "abonnement.html": ["ACCÈS PREMIUM", "Investis dans ton apprentissage.", "Un accès de 30 jours après vérification manuelle du paiement."],
    "admin.html": ["ESPACE SÉCURISÉ", "Pilote CAMPUS DIGITAL.", "Gère les formations, ressources, bourses et demandes d’activation."]
  };
  const main = document.querySelector("main");
  if (main && pages[path] && !main.querySelector(".page-hero")) {
    const h1el = main.querySelector("h1");
    if (h1el) {
      const [kicker, title, desc] = pages[path];
      const hero = h("section", { class: "page-hero", "data-reveal": "up" },
        h("div", { class: "page-hero-copy" },
          h("span", { class: "section-kicker" }, kicker),
          h1el,
          h("p", { class: "page-hero-description" }, desc)
        ),
        h("div", { class: "page-hero-art", "aria-hidden": "true" }, h("span", { class: "hero-art-ring ring-a" }, "✳"), h("span", { class: "hero-art-ring ring-b" }, "✦"), h("span", { class: "hero-art-monogram" }, "CD"), h("span", { class: "hero-art-caption" }, "TON CAMPUS · TON AVENIR"))
      );
      h1el.remove();
      const msgBox = main.querySelector("#msg");
      if (msgBox) msgBox.after(hero); else main.prepend(hero);
    }
  }
  document.body.classList.add(path.replace(/\.html$/, "") + "-page");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-visible"));
    return;
  }
  document.documentElement.classList.add("js-motion");
  const seen = new WeakSet();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
  }), { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
  const watch = root => root.querySelectorAll?.("[data-reveal], main > .card, main > form, main > .grid, main > .filters, #liste > *, #root > *, #root .card, #root form").forEach(el => {
    if (!seen.has(el)) { seen.add(el); el.setAttribute("data-reveal", el.getAttribute("data-reveal") || "up"); observer.observe(el); }
  });
  watch(document);
  const mutation = new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => { if (n.nodeType === 1) { watch(n); if (n.matches?.("[data-reveal], .card, form, tr")) watch(n.parentElement || n); } })));
  mutation.observe(main || document.body, { childList: true, subtree: true });
}
// Sans accès premium, seules les entrées gratuites sont demandées (exigé par les règles)
export async function loadCol(name, prem, onlyFree = true) {
  const ref = collection(db, name);
  const q = onlyFree && !prem ? query(ref, where("isPremium", "==", false)) : ref;
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}
export function itemCard(it) {
  const url = safeUrl(it.url || it.urlOfficielle);
  return h("div", { class: "card" }, h("h3", {}, it.titre || "Sans titre"),
    h("div", {}, h("span", { class: "tag" }, it.categorie || it.statut || "—"), it.niveau ? h("span", { class: "tag" }, it.niveau) : "", it.faculte ? h("span", { class: "tag" }, it.faculte) : "", it.statut ? "" : it.isPremium ? h("span", { class: "tag pr" }, "Premium") : h("span", { class: "tag" }, "Gratuit")),
    h("p", {}, it.description || it.conditions || ""),
    url ? h("a", { class: "btn dk", href: url, target: "_blank", rel: "noopener noreferrer" }, "Consulter") : "");
}
// Catalogue filtrable (formations / ressources)
export async function catalogue(col) {
  const { prem } = await initPage();
  const box = document.getElementById("liste"), q = document.getElementById("q"), fs = ["faculte", "niveau", "categorie"].map(k => document.getElementById(k)).filter(Boolean);
  box.textContent = "Chargement…"; let data = [];
  try { data = await loadCol(col, prem); } catch (e) { box.textContent = ""; return msg(errFr(e), "err"); }
  const opts = { faculte: FACULTES, niveau: NIVEAUX, categorie: [...new Set(data.map(d => d.categorie).filter(Boolean))] };
  fs.forEach(s => opts[s.id].forEach(o => s.append(h("option", { value: o }, o))));
  const requestedFaculty = new URLSearchParams(location.search).get("faculte");
  const facultySelect = fs.find(s => s.id === "faculte");
  if (requestedFaculty && facultySelect && [...facultySelect.options].some(o => o.value === requestedFaculty)) {
    facultySelect.value = requestedFaculty;
    const heading = h("p", { class: "msg inf" }, "Formations associées à : " + requestedFaculty + ". Les filières affichées dépendent des formations publiées par l’administration.");
    box.before(heading);
  }
  const draw = () => {
    const t = (q?.value || "").toLowerCase();
    const r = data.filter(d => (!t || `${d.titre || ""} ${d.description || ""} ${d.faculte || ""}`.toLowerCase().includes(t)) && fs.every(s => !s.value || d[s.id] === s.value));
    box.replaceChildren(...(r.length ? r.map(itemCard) : [h("p", {}, "Aucun contenu disponible pour ces critères.")]));
  };
  [q, ...fs].forEach(e => e.addEventListener("input", draw)); draw();
  if (!prem) msg("Les contenus premium sont visibles après activation de votre abonnement.", "inf");
}


// Animations d'apparition au défilement, avec fallback pour les navigateurs anciens.
function observeReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { items.forEach(el => el.classList.add('is-visible', 'revealed')); return; }
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible', 'revealed'); observer.unobserve(entry.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  items.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 5, 4) * 65}ms`; observer.observe(el); });
}
document.addEventListener('DOMContentLoaded', observeReveal, { once: true });
