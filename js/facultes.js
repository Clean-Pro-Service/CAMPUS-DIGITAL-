import { initPage, h } from "./commun.js";
// Présentation indicative : vérifier les intitulés exacts auprès de l'Université de Lomé.
export const FAC = [
 ["FDD","Faculté de Droit","Droit et sciences juridiques (orientation indicative)."],
 ["FLLA","Faculté des Lettres, Langues et Arts","Lettres, langues et arts (orientation indicative)."],
 ["FASEG","Faculté des Sciences Économiques et de Gestion","Économie et gestion (orientation indicative)."],
 ["FSHS","Faculté des Sciences de l'Homme et de la Société","Sciences humaines et sociales (orientation indicative)."],
 ["FSS","Faculté des Sciences de la Santé","Sciences de la santé (orientation indicative)."],
 ["FDS","Faculté des Sciences","Sciences exactes et expérimentales (orientation indicative)."],
 ["Écoles et instituts","Écoles et instituts de l'université","Consulte la liste officielle des établissements."]
];
if (document.getElementById("liste") && location.pathname.endsWith("facultes.html")) {
  await initPage();
  const box = document.getElementById("liste"), q = document.getElementById("q");
  const draw = () => {
    const t = (q?.value || "").toLowerCase();
    box.replaceChildren(...FAC.filter(f => f.join(" ").toLowerCase().includes(t)).map(f =>
      h("article", { class: "card faculty-card" },
        h("span", { class: "tag" }, f[0]),
        h("h3", {}, f[1]),
        h("p", {}, f[2]),
        h("a", { class: "btn dk", href: "formations.html?faculte=" + encodeURIComponent(f[0]) }, "Explorer les formations"),
        " ",
        h("a", { class: "btn", href: "https://univ-lome.tg/etablissements/", target: "_blank", rel: "noopener noreferrer" }, "Source officielle")
      )
    ));
  };
  q?.addEventListener("input", draw); draw();
}
