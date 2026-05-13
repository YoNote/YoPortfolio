(() => {
  const slider = document.querySelector("[data-slider]");
  if (!slider) {
    return;
  }

  const section = slider.closest("section") || slider;
  const track = slider.querySelector("[data-slider-track]");
  const viewport = slider.querySelector(".pb-slider__viewport");
  const dotsWrap = slider.querySelector("[data-slider-dots]");
  const toggleButton = slider.querySelector("[data-slider-toggle]");
  const cards = track ? Array.from(track.children) : [];
  const slideImages = track ? Array.from(track.querySelectorAll("img")) : [];

  if (!track || !viewport || !dotsWrap || !toggleButton || cards.length === 0) {
    return;
  }

  const AUTOPLAY_DELAY = 3000;
  const BUTTON_TEXT = {
    play: "▶",
    pause: "❚❚"
  };

  let currentIndex = 0;
  let isPlaying = false;
  let hasAutoStarted = false;
  let timerId = null;
  let rafId = 0;
  let isDragging = false;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragDeltaX = 0;

  const stopTickingDots = () => {
    dotsWrap.querySelectorAll(".pb-slider__dot").forEach((dot) => {
      dot.classList.remove("is-ticking");
    });
  };

  const stopAutoPlay = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    stopTickingDots();
  };

  const syncToggleButton = () => {
    if (isPlaying) {
      toggleButton.textContent = BUTTON_TEXT.pause;
      toggleButton.setAttribute("aria-label", "자동재생 멈춤");
      return;
    }

    toggleButton.textContent = BUTTON_TEXT.play;
    toggleButton.setAttribute("aria-label", "자동재생 시작");
  };

  const render = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    const dots = dotsWrap.querySelectorAll(".pb-slider__dot");

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
      dot.classList.remove("is-ticking");
      if (index === currentIndex && isPlaying) {
        void dot.offsetWidth;
        dot.classList.add("is-ticking");
      }
    });

    syncToggleButton();
  };

  const normalizeIndex = (index) => {
    const total = cards.length;
    return ((index % total) + total) % total;
  };

  const goTo = (index) => {
    currentIndex = normalizeIndex(index);
    render();
  };

  const applyDragTransform = () => {
    const viewportWidth = viewport.clientWidth || slider.clientWidth || 1;
    const baseX = -currentIndex * viewportWidth;
    track.style.transition = "none";
    track.style.transform = `translateX(${baseX + dragDeltaX}px)`;
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if (!isPlaying) {
      return;
    }

    timerId = setInterval(() => {
      goTo(currentIndex + 1);
    }, AUTOPLAY_DELAY);
  };

  const isSectionCentered = () => {
    const rect = section.getBoundingClientRect();
    const viewportCenterY = window.innerHeight / 2;
    return rect.top <= viewportCenterY && rect.bottom >= viewportCenterY;
  };

  const tryAutoStartAtCenter = () => {
    if (hasAutoStarted || isPlaying) {
      return;
    }
    if (!isSectionCentered()) {
      return;
    }

    hasAutoStarted = true;
    isPlaying = true;
    render();
    startAutoPlay();
  };

  const requestCenterCheck = () => {
    if (rafId) {
      return;
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      tryAutoStartAtCenter();
    });
  };

  const endDrag = () => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    slider.classList.remove("is-dragging");
    track.style.transition = "";

    const viewportWidth = viewport.clientWidth || slider.clientWidth || 1;
    const threshold = Math.max(56, viewportWidth * 0.14);
    const delta = dragDeltaX;

    dragPointerId = null;
    dragDeltaX = 0;

    if (Math.abs(delta) >= threshold) {
      if (delta < 0) {
        goTo(currentIndex + 1);
        return;
      }
      goTo(currentIndex - 1);
      return;
    }

    render();
  };

  // Prevent native image drag behavior from stealing pointer drag gestures.
  slideImages.forEach((image) => {
    image.draggable = false;
  });

  cards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "pb-slider__dot";
    dot.setAttribute("aria-label", `슬라이드 ${index + 1} 보기`);
    dot.addEventListener("click", () => {
      hasAutoStarted = true;
      isPlaying = false;
      stopAutoPlay();
      goTo(index);
    });
    dotsWrap.appendChild(dot);
  });

  toggleButton.addEventListener("click", () => {
    hasAutoStarted = true;

    isPlaying = !isPlaying;
    render();
    if (isPlaying) {
      startAutoPlay();
      return;
    }
    stopAutoPlay();
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    isDragging = true;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragDeltaX = 0;
    hasAutoStarted = true;
    isPlaying = false;
    stopAutoPlay();
    slider.classList.add("is-dragging");

    if (viewport.setPointerCapture) {
      viewport.setPointerCapture(event.pointerId);
    }
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== dragPointerId) {
      return;
    }

    dragDeltaX = event.clientX - dragStartX;
    if (Math.abs(dragDeltaX) > 4) {
      event.preventDefault();
    }
    applyDragTransform();
  });

  viewport.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  viewport.addEventListener("pointerup", (event) => {
    if (event.pointerId !== dragPointerId) {
      return;
    }

    if (viewport.releasePointerCapture) {
      viewport.releasePointerCapture(event.pointerId);
    }
    endDrag();
  });

  viewport.addEventListener("pointercancel", () => {
    endDrag();
  });

  viewport.addEventListener("lostpointercapture", () => {
    endDrag();
  });

  window.addEventListener("scroll", requestCenterCheck, { passive: true });
  window.addEventListener("resize", requestCenterCheck);

  render();
  requestCenterCheck();
})();
