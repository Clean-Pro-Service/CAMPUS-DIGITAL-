import { db, auth } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { initPage, msg, errFr, fmt, premium } from "./commun.js";
const { u } = await initPage();
if (!u) location.href = "connexion.html?next=profil.html"; else {
const $ = i => document.getElementById(i), ref = doc(db, "users", u.uid);
async function show() {
  try {
    let s = await getDoc(ref);
    if (!s.exists()) { await setDoc(ref, { nom: u.displayName || "", email: u.email, createdAt: serverTimestamp() }); s = await getDoc(ref); }
    const p = s.data(); $("email").textContent = u.email; $("nom").value = p.nom || ""; $("tel").value = p.telephone || "";
    $("abo").textContent = premium(p) ? "Premium actif" : p.subscriptionStatus === "active" ? "Expiré" : "Gratuit (aucun abonnement actif)";
    $("exp").textContent = fmt(p.subscriptionExpiresAt);
    $("ver").textContent = u.emailVerified ? "E-mail vérifié" : "E-mail non vérifié";
  } catch (e) { msg(errFr(e), "err"); }
}
$("f").addEventListener("submit", async e => { e.preventDefault();
  try { await updateDoc(ref, { nom: $("nom").value.trim(), telephone: $("tel").value.trim() }); msg("Profil mis à jour."); } catch (er) { msg(errFr(er), "err"); } });
$("verif").addEventListener("click", async () => { try { await sendEmailVerification(auth.currentUser); msg("E-mail de vérification envoyé."); } catch (er) { msg(errFr(er), "err"); } });
show(); }
