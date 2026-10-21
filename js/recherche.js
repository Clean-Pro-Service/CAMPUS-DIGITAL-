import { initPage, h, loadCol, msg, errFr } from "./commun.js";
import { FAC } from "./facultes.js";
const { prem } = await initPage(); const box = document.getElementById("liste"), q = document.getElementById("q");
let all = [];
try {
  const [f, r, b] = await Promise.all([loadCol("formations", prem), loadCol("ressources", prem), loadCol("bourses", true, false)]);
  all = [...f.map(x => [x, "formations.html", "Formation"]), ...r.map(x => [x, "bibliotheque.html", "Ressource"]), ...b.map(x => [x, "bourses.html", "Bourse"]), ...FAC.map(x => [{ titre: x[1], description: x[2] }, "facultes.html", "Faculté"])];
} catch (e) { msg(errFr(e), "err"); }
const draw = () => { const t = q.value.trim().toLowerCase(); if (t.length < 2) return box.replaceChildren(h("p", {}, "Saisissez au moins 2 caractères."));
  const r = all.filter(([x]) => `${x.titre} ${x.description} ${x.organisme || ""}`.toLowerCase().includes(t));
  box.replaceChildren(...(r.length ? r.map(([x, p, k]) => h("div", { class: "card" }, h("span", { class: "tag" }, k), h("h3", {}, x.titre), h("p", {}, x.description || ""), h("a", { class: "btn dk", href: p }, "Voir la page"))) : [h("p", {}, "Aucun résultat.")])); };
q.addEventListener("input", draw); draw();
