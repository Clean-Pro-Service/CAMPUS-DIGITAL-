import { initPage, h, loadCol, msg, errFr, itemCard } from "./commun.js";
await initPage(); const box = document.getElementById("liste");
try {
  const d = await loadCol("bourses", true, false);
  box.replaceChildren(...(d.length ? d.map(b => itemCard({ ...b, categorie: b.statut || "à vérifier", description: `${b.organisme || ""} ${b.pays ? "· " + b.pays : ""}\n${b.conditions || "Conditions à vérifier"}\nDate limite : ${b.dateLimite || "à vérifier"}` })) : [h("p", {}, "Aucune bourse publiée pour le moment.")]));
} catch (e) { box.textContent = ""; msg(errFr(e), "err"); }
