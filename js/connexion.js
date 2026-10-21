import { auth, db, authReady } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { initPage, msg, errFr, isAdmin } from "./commun.js";
await initPage(); await authReady;
const $ = i => document.getElementById(i); let mode = "login";
const pages = ["profil.html", "abonnement.html", "formations.html", "bibliotheque.html", "admin.html"];
const go = u => { const n = new URLSearchParams(location.search).get("next"); location.href = pages.includes(n) ? n : isAdmin(u) ? "admin.html" : "profil.html"; };
const setMode = m => { mode = m; $("nomW").hidden = m !== "signup"; $("pwW").hidden = m === "reset"; $("go").textContent = { login: "Se connecter", signup: "Créer mon compte", reset: "Envoyer le lien" }[m]; msg(""); };
document.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.m)));
$("f").addEventListener("submit", async e => {
  e.preventDefault(); const email = $("email").value.trim(), pw = $("pw").value, nom = $("nom").value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return msg("Adresse e-mail invalide.", "err");
  if (mode !== "reset" && pw.length < 6) return msg("Mot de passe : 6 caractères minimum.", "err");
  if (mode === "signup" && !nom) return msg("Indiquez votre nom.", "err");
  $("go").disabled = true; msg("Veuillez patienter…", "inf");
  try {
    if (mode === "reset") { await sendPasswordResetEmail(auth, email); msg("Lien de réinitialisation envoyé (vérifiez vos spams)."); }
    else if (mode === "signup") {
      const c = await createUserWithEmailAndPassword(auth, email, pw);
      try { await sendEmailVerification(c.user); } catch {}
      try { await setDoc(doc(db, "users", c.user.uid), { nom, email: c.user.email, createdAt: serverTimestamp() }); } catch (er) { console.warn("Profil non créé :", er); }
      go(c.user);
    } else { const c = await signInWithEmailAndPassword(auth, email, pw); go(c.user); }
  } catch (er) { msg(errFr(er), "err"); } finally { $("go").disabled = false; }
});
