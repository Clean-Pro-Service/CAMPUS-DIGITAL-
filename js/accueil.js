import { initPage } from "./commun.js";

await initPage();

// Animations progressives au défilement, avec respect des préférences d'accessibilité.
const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (motionAllowed && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js-motion");
  const targets = [...document.querySelectorAll("[data-reveal]")];
  targets.forEach((el, index) => {
    if (el.classList.contains("discover-card")) el.style.setProperty("--reveal-delay", `${(index % 3) * 100}ms`);
  });
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });
  targets.forEach(el => observer.observe(el));
} else {
  document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-visible"));
}
