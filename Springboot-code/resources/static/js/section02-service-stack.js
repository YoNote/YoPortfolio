(() => {
  const cards = Array.from(document.querySelectorAll("[data-service-card]"));
  if (cards.length === 0) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    cards.forEach((card) => card.classList.add("is-in-view"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-in-view");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach((card) => observer.observe(card));
  }

  let ticking = false;

  const updateActiveCard = () => {
    const triggerLine = window.innerHeight * 0.3;
    let activeIndex = 0;

    cards.forEach((card, index) => {
      const top = card.getBoundingClientRect().top;
      if (top <= triggerLine) {
        activeIndex = index;
      }
    });

    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === activeIndex);
      card.classList.toggle("is-past", index < activeIndex);
      const offset = Math.max(0, activeIndex - index) * 6;
      card.style.setProperty("--stack-offset", `${offset}px`);
    });
  };

  const onScrollOrResize = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(() => {
      updateActiveCard();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  updateActiveCard();
})();
