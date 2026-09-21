const STORAGE_KEY = "tcd_accessibility_settings_v2";

const accessibilityBtn = document.getElementById("accessibilityBtn");
const modal = document.getElementById("accessibilityModal");
const closeModalBtn = document.getElementById("closeModal");
const contrastNormalBtn =
  document.getElementById("contrastNormalBtn") ||
  document.getElementById("contrastLightBtn");
const contrastHighBtn = document.getElementById("contrastHighBtn");
const fontSizeToggleBtn = document.getElementById("fontSizeToggleBtn");

const hasCoreUI = accessibilityBtn && modal && closeModalBtn;

if (hasCoreUI) {
  const defaultState = {
    contrast: "normal",
    largeText: false
  };

  let state = { ...defaultState };

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return;
      }
      const parsed = JSON.parse(saved);
      state.contrast = parsed.contrast === "high" ? "high" : "normal";
      state.largeText =
        parsed.largeText === true || parsed.fontSize === "large";
    } catch (_error) {
      state = { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyState() {
    const isHighContrast = state.contrast === "high";
    document.body.classList.toggle("contrast-high", isHighContrast);
    document.body.classList.toggle("accessibility-mode", state.largeText);

    if (contrastNormalBtn && contrastHighBtn) {
      contrastNormalBtn.classList.toggle("is-active", !isHighContrast);
      contrastHighBtn.classList.toggle("is-active", isHighContrast);
      contrastNormalBtn.setAttribute("aria-pressed", String(!isHighContrast));
      contrastHighBtn.setAttribute("aria-pressed", String(isHighContrast));
    }

    if (fontSizeToggleBtn) {
      const label = state.largeText ? "Text Size: Large" : "Text Size: Default";
      fontSizeToggleBtn.textContent = label;
      fontSizeToggleBtn.classList.toggle("is-active", state.largeText);
      fontSizeToggleBtn.setAttribute("aria-pressed", String(state.largeText));
    }
  }

  function openModal() {
    modal.style.display = "flex";
    closeModalBtn.focus();
  }

  function closeModal() {
    modal.style.display = "none";
  }

  loadState();
  applyState();

  accessibilityBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);

  if (contrastNormalBtn) {
    contrastNormalBtn.addEventListener("click", () => {
      state.contrast = "normal";
      applyState();
      saveState();
    });
  }

  if (contrastHighBtn) {
    contrastHighBtn.addEventListener("click", () => {
      state.contrast = "high";
      applyState();
      saveState();
    });
  }

  if (fontSizeToggleBtn) {
    fontSizeToggleBtn.addEventListener("click", () => {
      state.largeText = !state.largeText;
      applyState();
      saveState();
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display === "flex") {
      closeModal();
    }
  });
}
