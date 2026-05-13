﻿(() => {
  let isInitialized = false;

  const init = () => {
    if (isInitialized) {
      return;
    }

    const floatingContact = document.querySelector(".floating-contact");
    const floatingHome = document.querySelector(".floating-home");
    const floatingActions = document.querySelector(".floating-actions");
    const secondSection = document.querySelector("#section-02");
    const contactModal = document.querySelector("#contact-modal");
    const contactForm = document.querySelector("#contact-form");
    const closeButtons = document.querySelectorAll("[data-close-modal]");
    const submitButton = document.querySelector("#contact-submit");
    const messageInput = document.querySelector("#contact-message");
    const messageCount = document.querySelector("#message-count");
    const statusText = document.querySelector("#contact-status");
    const companyInput = document.querySelector("#contact-company");
    const emailInput = document.querySelector("#contact-email");
    const phoneInput = document.querySelector("#contact-phone");
    const subjectInput = document.querySelector("#contact-subject");
    const termsInput = document.querySelector("#contact-terms");

    if (
      !floatingContact ||
      !contactModal ||
      !contactForm ||
      !submitButton ||
      !messageInput ||
      !messageCount ||
      !companyInput ||
      !emailInput ||
      !phoneInput ||
      !subjectInput ||
      !termsInput
    ) {
      return;
    }

    isInitialized = true;
    let isSubmitting = false;
    let hasIntroNudgePlayed = false;

    const setStatus = (message, type = "") => {
      if (!statusText) {
        return;
      }

      statusText.textContent = message;
      statusText.className = type ? `contact-form__status ${type}` : "contact-form__status";
    };

    const openModal = () => {
      contactModal.classList.add("is-open");
      contactModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      setStatus("");

      if (!history.state || !history.state.contactModalOpen) {
        history.pushState({ contactModalOpen: true }, "", window.location.href);
      }
    };

    const closeModal = () => {
      contactModal.classList.remove("is-open");
      contactModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    const playIntroNudge = () => {
      if (hasIntroNudgePlayed) {
        return;
      }

      if (window.scrollY > 4) {
        hasIntroNudgePlayed = true;
        return;
      }

      if (!(secondSection instanceof HTMLElement)) {
        hasIntroNudgePlayed = true;
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        hasIntroNudgePlayed = true;
        return;
      }

      const revealHeight = Math.max(72, Math.round(window.innerHeight * 0.1));
      const targetY = Math.max(0, secondSection.offsetTop - window.innerHeight + revealHeight);

      hasIntroNudgePlayed = true;
      if (targetY > window.scrollY + 2) {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    };

    const updateMessageCount = () => {
      messageCount.textContent = String(messageInput.value.length);
    };

    const validateForm = () => {
      const classification = document.querySelector("input[name='contact-classification']:checked");
      const message = messageInput.value.trim();
      const isValid =
        !!companyInput.value.trim() &&
        !!emailInput.value.trim() &&
        emailInput.checkValidity() &&
        !!phoneInput.value.trim() &&
        !!subjectInput.value &&
        !!classification &&
        !!message &&
        message.length <= 200 &&
        termsInput.checked &&
        !isSubmitting;

      submitButton.disabled = !isValid;
    };

    const payloadFromForm = () => {
      const classification = document.querySelector("input[name='contact-classification']:checked");
      return {
        companyName: companyInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        subject: subjectInput.value,
        classification: classification ? classification.value : "",
        message: messageInput.value.trim(),
        termsAgreement: termsInput.checked
      };
    };

    const resetForm = () => {
      contactForm.reset();
      updateMessageCount();
      setStatus("");
      isSubmitting = false;
      validateForm();
    };

    const submitInquiry = async () => {
      isSubmitting = true;
      setStatus("전송 중입니다...");
      validateForm();

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payloadFromForm())
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "문의 전송에 실패했습니다.");
        }

        alert("문의가 전송되었습니다.");
        setStatus("문의가 전송되었습니다.", "is-success");
        closeModal();
        resetForm();
      } catch (error) {
        const message = error instanceof Error ? error.message : "문의 전송 중 오류가 발생했습니다.";
        alert(message);
        setStatus(message, "is-error");
        isSubmitting = false;
        validateForm();
      }
    };

    floatingContact.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });

    if (floatingHome) {
      floatingHome.addEventListener("click", (event) => {
        event.preventDefault();
        const firstSection = document.querySelector("#section-01");
        if (firstSection instanceof HTMLElement) {
          firstSection.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (floatingActions instanceof HTMLElement) {
      const onRevealEnd = (event) => {
        if (event.animationName !== "floatingActionsReveal") {
          return;
        }
        playIntroNudge();
        floatingActions.removeEventListener("animationend", onRevealEnd);
      };

      floatingActions.addEventListener("animationend", onRevealEnd);

      window.setTimeout(() => {
        playIntroNudge();
        floatingActions.removeEventListener("animationend", onRevealEnd);
      }, 3300);
    }

    closeButtons.forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && contactModal.classList.contains("is-open")) {
        closeModal();
      }
    });

    window.addEventListener("popstate", () => {
      if (contactModal.classList.contains("is-open")) {
        closeModal();
      }
    });

    window.addEventListener("pageshow", () => {
      closeModal();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      validateForm();
    });

    contactForm.addEventListener("input", () => {
      updateMessageCount();
      validateForm();
    });

    contactForm.addEventListener("change", validateForm);

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitButton.disabled || isSubmitting) {
        return;
      }

      await submitInquiry();
    });

    updateMessageCount();
    validateForm();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("contact:loaded", init);
})();
