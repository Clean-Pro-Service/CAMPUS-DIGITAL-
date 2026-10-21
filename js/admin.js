import { db } from "./firebase.js";
import { collection, getDocs, addDoc, setDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { initPage, h, msg, errFr, fmt, safeUrl, premium, FACULTES, NIVEAUX } from "./commun.js";
const { u, admin } = await initPage(); const root = document.getElementById("root");
const T = "text", S = "select", B = "bool", A = "area";
const CFG = {
  formations: { l: "Formations", f: [["titre", T], ["description", A], ["type", S, ["Cours", "Tutoriel", "Exercice", "Quiz", "Autre"]], ["publicCible", S, ["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"]], ["niveau", S, NIVEAUX], ["faculte", S, FACULTES], ["categorie", T], ["format", S, ["Lien web", "Vidéo YouTube", "PDF", "Word", "Image", "Autre"]], ["url", T], ["isPremium", B]] },
  ressources: { l: "Ressources / bibliothèque", f: [["titre", T], ["description", A], ["categorie", T], ["niveau", S, NIVEAUX], ["format", S, ["PDF", "Word", "Vidéo YouTube", "Lien web", "Image", "Autre"]], ["url", T], ["isPremium", B]] },
  bourses: { l: "Bourses", f: [["titre", T], ["organisme", T], ["pays", T], ["niveau", S, NIVEAUX], ["conditions", A], ["dateLimite", T], ["urlOfficielle", T], ["statut", S, ["à vérifier", "ouverte", "clôturée"]]] }
};
if (!u) location.href = "connexion.html?next=admin.html";
else if (!admin) root.replaceChildren(h("p", { class: "msg err" }, "Accès réservé aux administrateurs (e-mail autorisé et vérifié)."));
else start();
function start() {
  const tabs = h("div", {}), view = h("div", {}); root.replaceChildren(tabs, view);
  const show = (n, fn) => { tabs.querySelectorAll("button").forEach(b => b.disabled = b.dataset.n === n); view.replaceChildren(); fn(); };
  [...Object.keys(CFG), "demandes", "abonnes"].forEach(n => tabs.append(h("button", { class: "btn", "data-n": n, onclick: () => show(n, () => n === "demandes" ? demandes(view) : n === "abonnes" ? abonnes(view) : crud(view, n)) }, CFG[n]?.l || (n === "demandes" ? "Demandes" : "Abonnés")), " "));
  show("formations", () => crud(view, "formations"));
}
function crud(v, name) {
  const c = CFG[name]; let editId = null; const inp = {};
  const form = h("form", { class: "card" }), list = h("div", { class: "wrap" });
  form.append(h("p", { class: "msg inf" }, "Pour un PDF, Word ou une image, colle une URL directe accessible. Pour une vidéo, privilégie un lien YouTube. Le fichier doit être hébergé avant l’enregistrement ; cette version ne téléverse pas encore les fichiers sur Firebase Storage."));
  c.f.forEach(([k, t, o]) => {
    const labels = { titre: "Titre", description: "Description", niveau: "Niveau", faculte: "Faculté", categorie: "Catégorie", url: "Lien du contenu (URL https://)", isPremium: "Réservé aux abonnés Premium", type: "Type de formation", publicCible: "Public cible", format: "Format du contenu", organisme: "Organisme", pays: "Pays", conditions: "Conditions", dateLimite: "Date limite", urlOfficielle: "Lien officiel", statut: "Statut" };
    const e = t === A ? h("textarea", { rows: 3 }) : t === S ? h("select", {}, o.map(x => h("option", { value: x }, x))) : t === B ? h("input", { type: "checkbox", style: "width:auto" }) : h("input", { type: "text", placeholder: k === "url" || k === "urlOfficielle" ? "https://…" : "" });
    inp[k] = e; form.append(h("label", {}, labels[k] || k), e);
  });
  const ok = h("button", { class: "btn dk", type: "submit" }, "Enregistrer");
  const reset = () => { editId = null; form.reset(); ok.textContent = "Enregistrer"; };
  form.append(ok, " ", h("button", { class: "btn", type: "button", onclick: reset }, "Nouveau"));
  form.addEventListener("submit", async e => { e.preventDefault(); const d = {};
    c.f.forEach(([k, t]) => d[k] = t === B ? inp[k].checked : inp[k].value.trim());
    if (!d.titre) return msg("Le titre est obligatoire.", "err");
    for (const k of ["url", "urlOfficielle"]) if (d[k] && !safeUrl(d[k])) return msg("URL invalide (http/https).", "err");
    try { d.updatedAt = serverTimestamp(); if (editId) await updateDoc(doc(db, name, editId), d); else { d.createdAt = serverTimestamp(); await addDoc(collection(db, name), d); }
      msg("Enregistré."); reset(); load(); } catch (er) { msg(errFr(er), "err"); } });
  async function load() { try { const s = await getDocs(collection(db, name));
    list.replaceChildren(h("table", {}, ...s.docs.map(x => { const d = x.data(); return h("tr", {}, h("td", {}, d.titre), h("td", {}, h("button", { class: "btn", onclick: () => { editId = x.id; c.f.forEach(([k, t]) => t === B ? inp[k].checked = !!d[k] : inp[k].value = d[k] ?? ""); ok.textContent = "Mettre à jour"; scrollTo(0, 0); } }, "Modifier"), " ", h("button", { class: "btn rd", onclick: async () => { if (!confirm("Supprimer ?")) return; try { await deleteDoc(doc(db, name, x.id)); msg("Supprimé."); load(); } catch (er) { msg(errFr(er), "err"); } } }, "Supprimer"))); }))); } catch (er) { msg(errFr(er), "err"); } }
  v.append(form, list); load();
}
async function demandes(v) {
  try { const s = await getDocs(collection(db, "demandes_activation")); const refresh = () => { v.replaceChildren(); demandes(v); };
    v.append(h("div", { class: "wrap" }, h("table", {}, h("tr", {}, ["E-mail", "Opérateur", "Référence", "Date", "Statut", ""].map(t => h("th", {}, t))),
      ...s.docs.map(x => { const d = x.data(); return h("tr", {}, h("td", {}, d.email), h("td", {}, d.operateur), h("td", {}, d.reference), h("td", {}, fmt(d.createdAt)), h("td", {}, d.statut),
        h("td", {}, d.statut === "en_attente" ? [h("button", { class: "btn dk", onclick: async () => { if (!confirm("Paiement vérifié ? Activer 30 jours ?")) return;
          try { const exp = Timestamp.fromDate(new Date(Date.now() + 30 * 864e5)); await setDoc(doc(db, "users", d.uid), { subscriptionStatus: "active", subscriptionExpiresAt: exp, updatedAt: serverTimestamp() }, { merge: true }); await updateDoc(doc(db, "demandes_activation", x.id), { statut: "validee" }); refresh(); msg("Abonnement activé jusqu'au " + exp.toDate().toLocaleDateString("fr-FR")); } catch (er) { msg(errFr(er), "err"); } } }, "Activer 30 j"), " ",
          h("button", { class: "btn rd", onclick: async () => { try { await updateDoc(doc(db, "demandes_activation", x.id), { statut: "rejetee" }); refresh(); } catch (er) { msg(errFr(er), "err"); } } }, "Rejeter")] : "")); }))));
  } catch (er) { msg(errFr(er), "err"); }
}
async function abonnes(v) {
  const form = h("form", { class: "card" });
  const email = h("input", { type: "email", required: "required", placeholder: "E-mail exact du compte étudiant" });
  form.append(h("h2", {}, "Activer après vérification WhatsApp"), h("p", {}, "Après avoir vérifié le paiement et identifié le compte de l’étudiant, saisis son e-mail. Le compte doit déjà avoir ouvert son profil CAMPUS DIGITAL au moins une fois."), h("label", {}, "E-mail de l’étudiant"), email, h("button", { class: "btn dk", type: "submit" }, "Activer Premium 30 jours"));
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const targetEmail = email.value.trim().toLowerCase();
    try {
      const all = await getDocs(collection(db, "users"));
      const found = all.docs.find(x => (x.data().email || "").toLowerCase() === targetEmail);
      if (!found) return msg("Compte introuvable. Demande à l’étudiant de se connecter et d’ouvrir son profil, puis réessaie.", "err");
      if (!confirm(`Activer Premium pour ${targetEmail pendant 30 jours ?`)) return;
      const exp = Timestamp.fromDate(new Date(Date.now() + 30 * 864e5));
      await setDoc(doc(db, "users", found.id), { subscriptionStatus: "active", subscriptionExpiresAt: exp, updatedAt: serverTimestamp() }, { merge: true });
      msg("Premium activé jusqu’au " + exp.toDate().toLocaleDateString("fr-FR"));
      email.value = ""; await loadList();
    } catch (er) { msg(errFr(er), "err"); }
  });
  const list = h("div", { class: "wrap" });
  v.append(form, list);
  async function loadList() {
    try {
      const s = await getDocs(collection(db, "users"));
      const r = s.docs.map(x => ({ ...x.data(), _uid: x.id })).filter(d => d.subscriptionStatus);
      list.replaceChildren();
      if (!r.length) return list.append(h("p", {}, "Aucun abonnement enregistré."));
      list.append(h("table", {}, h("tr", {}, ["Nom", "E-mail", "Statut", "Expiration"].map(t => h("th", {}, t))), ...r.map(d => h("tr", {}, h("td", {}, d.nom || ""), h("td", {}, d.email || ""), h("td", {}, premium(d) ? "Actif" : "Expiré"), h("td", {}, fmt(d.subscriptionExpiresAt))))));
    } catch (er) { msg(errFr(er), "err"); }
  }
  await loadList();
}
