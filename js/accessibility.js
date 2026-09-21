const STORAGE_KEY = "tcd_accessibility_settings_v1";

const accessibilityBtn = document.getElementById("accessibilityBtn");
const modal = document.getElementById("accessibilityModal");
const closeModalBtn = document.getElementById("closeModal");
const brightnessRange = document.getElementById("brightnessRange");
const contrastLightBtn = document.getElementById("contrastLightBtn");
const contrastHighBtn = document.getElementById("contrastHighBtn");
const fontSizeToggleBtn = document.getElementById("fontSizeToggleBtn");

const hasCoreUI = accessibilityBtn && modal && closeModalBtn;

if (hasCoreUI) {
  const defaultState = {
    brightness: 100,
    contrast: "light",
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
      state.brightness = Number(parsed.brightness) || defaultState.brightness;
      state.contrast = parsed.contrast === "high" ? "high" : "light";
      state.largeText = Boolean(parsed.largeText);
    } catch (_error) {
      state = { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyState() {
    document.documentElement.style.setProperty("--accessibility-brightness", `${state.brightness}%`);

    document.body.classList.toggle("contrast-high", state.contrast === "high");
    document.body.classList.toggle("accessibility-mode", state.largeText);

    if (brightnessRange) {
      brightnessRange.value = String(state.brightness);
    }

    if (contrastLightBtn && contrastHighBtn) {
      contrastLightBtn.classList.toggle("is-active", state.contrast === "light");
      contrastHighBtn.classList.toggle("is-active", state.contrast === "high");
      contrastLightBtn.setAttribute("aria-pressed", String(state.contrast === "light"));
      contrastHighBtn.setAttribute("aria-pressed", String(state.contrast === "high"));
    }

    if (fontSizeToggleBtn) {
      fontSizeToggleBtn.classList.toggle("is-active", state.largeText);
      fontSizeToggleBtn.setAttribute("aria-pressed", String(state.largeText));
      fontSizeToggleBtn.textContent = state.largeText ? "Text Size: Large" : "Text Size: Default";
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

  if (brightnessRange) {
    brightnessRange.addEventListener("input", (event) => {
      const nextValue = Number(event.target.value);
      if (!Number.isNaN(nextValue)) {
        state.brightness = nextValue;
        applyState();
        saveState();
      }
    });
  }

  if (contrastLightBtn) {
    contrastLightBtn.addEventListener("click", () => {
      state.contrast = "light";
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
