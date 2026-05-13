(() => {
  const section = document.querySelector("#section-02.goods-showcase");
  const triplet = section?.querySelector(".pb-feature-triplet");

  if (!section || !triplet) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopOnly = window.matchMedia("(min-width: 1101px)").matches;

  if (reduceMotion || !desktopOnly) {
    return;
  }

  triplet.classList.add("is-staged");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        triplet.classList.add("is-expanded");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.7 }
  );

  observer.observe(section);
})();
