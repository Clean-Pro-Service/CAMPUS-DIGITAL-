import { initPage, WHATSAPP_NUMBER } from "./commun.js";
const { u } = await initPage();
const wa = document.getElementById("wa");
const numero = WHATSAPP_NUMBER || "22898207231";
const email = u?.email || "À renseigner";
const message = `Bonjour, je souhaite demander l’accès Premium de CAMPUS DIGITAL (3 000 FCFA pour 30 jours). E-mail de mon compte : ${email}. Merci de m’indiquer la procédure de paiement et d’activation.`;
wa.href = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
wa.addEventListener("click", () => {
  if (!u) {
    // WhatsApp reste accessible ; le message rappelle à l’étudiant de renseigner son e-mail.
    return;
  }
});
