const navLinks = Array.from(document.querySelectorAll(".topbar nav a[href^='#']"));
const projectNav = document.querySelector(".project-page .topbar nav");
if (projectNav && !projectNav.querySelector('a[href="../archive.html"]')) {
  const archiveLink = document.createElement("a");
  archiveLink.href = "../archive.html";
  archiveLink.textContent = "ARCHIVE";
  projectNav.insertBefore(archiveLink, projectNav.querySelector('a[href="../index.html#about"]'));
}
const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window && sections.length) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-20% 0px -65%", threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const hero = document.querySelector(".hero");
const profile = document.querySelector(".profile");

if (hero && !motionPreference.matches) {
  let frame = 0;
  const updateHero = () => {
    frame = 0;
    const distance = Math.max(1, Math.min(hero.offsetHeight * .8, window.innerHeight));
    const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / distance));
    hero.style.setProperty("--hero-progress", progress.toFixed(3));
  };
  const requestHeroUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(updateHero);
  };
  updateHero();
  window.addEventListener("scroll", requestHeroUpdate, { passive: true });
  window.addEventListener("resize", requestHeroUpdate);
}

if (profile && "IntersectionObserver" in window && !motionPreference.matches) {
  document.documentElement.classList.add("motion-ready");
  const reveal = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    profile.classList.add("is-visible");
    reveal.disconnect();
  }, { rootMargin: "0px 0px -10% 0px", threshold: .08 });
  reveal.observe(profile);
}
