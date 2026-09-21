/*
  Accessibility settings - shared by EVERY page (index, map, catalogue and all building pages).

  Include on a page with:
    <link rel="stylesheet" href="css/accessibility.css">
    <script src="js/accessibility.js"></script>

  The script builds the settings dialog itself, so pages do not need any modal markup.
  It connects to the page's own button (#accessibilityBtn or .accessibility-btn) and creates a
  floating one if the page has none. Settings are saved in localStorage and re-applied on every page.

  Settings and the classes they set on <html> (styled in css/accessibility.css):
    textSize   0-4  -> root font size 100/115/130/150/200 %  (all text is in rem, so everything scales)
    contrast   "normal" | "high"  -> a11y-contrast-high
    spacing    boolean -> a11y-spacing        (WCAG 1.4.12 text spacing)
    links      boolean -> a11y-links          (underline every link)
    motion     boolean -> a11y-reduce-motion  (also on by default if the OS asks for reduced motion)
*/
(function () {
  "use strict";

  var STORAGE_KEY = "tcd_accessibility_settings_v2";
  var TEXT_SIZES = [100, 115, 130, 150, 200];
  var DEFAULTS = { textSize: 0, contrast: "normal", spacing: false, links: false, motion: false };

  var state = loadState();
  var modal = null;
  var openButton = null;
  var refs = {};

  function loadState() {
    var next = {};
    for (var key in DEFAULTS) next[key] = DEFAULTS[key];
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        var size = Number(saved.textSize);
        if (size >= 0 && size < TEXT_SIZES.length) next.textSize = Math.round(size);
        next.contrast = saved.contrast === "high" ? "high" : "normal";
        next.spacing = saved.spacing === true;
        next.links = saved.links === true;
        next.motion = saved.motion === true;
      }
    } catch (_error) { /* storage unavailable or corrupt: use defaults */ }
    return next;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) { /* private mode / storage full: settings just won't persist */ }
  }

  /* Applies the current settings to the page and, if built, to the dialog controls. */
  function applyState() {
    var root = document.documentElement;
    root.style.fontSize = state.textSize === 0 ? "" : TEXT_SIZES[state.textSize] + "%";
    root.classList.toggle("a11y-contrast-high", state.contrast === "high");
    root.classList.toggle("a11y-spacing", state.spacing);
    root.classList.toggle("a11y-links", state.links);
    root.classList.toggle("a11y-reduce-motion", state.motion);

    if (!modal) return;
    refs.sizeValue.textContent = TEXT_SIZES[state.textSize] + "%";
    refs.smaller.disabled = state.textSize === 0;
    refs.larger.disabled = state.textSize === TEXT_SIZES.length - 1;
    for (var i = 0; i < refs.steps.length; i++) {
      refs.steps[i].classList.toggle("is-on", i <= state.textSize);
    }
    setPressed(refs.contrastNormal, state.contrast === "normal");
    setPressed(refs.contrastHigh, state.contrast === "high");
    setChecked(refs.spacing, state.spacing);
    setChecked(refs.links, state.links);
    setChecked(refs.motion, state.motion);
  }

  function setPressed(button, pressed) {
    button.classList.toggle("is-active", pressed);
    button.setAttribute("aria-pressed", String(pressed));
  }

  function setChecked(button, checked) {
    button.setAttribute("aria-checked", String(checked));
  }

  function update(changes, announcement) {
    for (var key in changes) state[key] = changes[key];
    applyState();
    saveState();
    if (announcement) refs.status.textContent = announcement;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function section(titleText, titleId) {
    var wrap = el("section", "a11y-card");
    wrap.setAttribute("aria-labelledby", titleId);
    var title = el("h3", "a11y-card-title", titleText);
    title.id = titleId;
    wrap.appendChild(title);
    return { wrap: wrap, title: title };
  }

  /* One switch row: label + short description + on/off switch. */
  function switchRow(id, label, description, key, announceOn, announceOff) {
    var row = el("div", "a11y-row");
    var text = el("div", "a11y-row-text");
    var name = el("span", "a11y-row-label", label);
    name.id = id + "Label";
    var desc = el("span", "a11y-row-desc", description);
    desc.id = id + "Desc";
    text.appendChild(name);
    text.appendChild(desc);

    var sw = el("button", "a11y-switch");
    sw.type = "button";
    sw.id = id;
    sw.setAttribute("role", "switch");
    sw.setAttribute("aria-labelledby", name.id);
    sw.setAttribute("aria-describedby", desc.id);
    sw.addEventListener("click", function () {
      var next = !state[key];
      var change = {};
      change[key] = next;
      update(change, label + (next ? announceOn : announceOff));
    });

    row.appendChild(text);
    row.appendChild(sw);
    return { row: row, sw: sw };
  }

  function contrastOption(value, label, previewClass) {
    var b = el("button", "a11y-choice");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    var preview = el("span", "a11y-choice-preview " + previewClass, "Aa");
    preview.setAttribute("aria-hidden", "true");
    b.appendChild(preview);
    b.appendChild(el("span", "a11y-choice-label", label));
    b.addEventListener("click", function () {
      update({ contrast: value }, label + " contrast on");
    });
    return b;
  }

  function buildModal() {
    /* Older pages carried a static (non-working) copy of the dialog: drop it. */
    var stale = document.getElementById("accessibilityModal");
    if (stale) stale.remove();

    modal = el("div", "a11y-modal");
    modal.id = "accessibilityModal";
    modal.hidden = true;

    var dialog = el("div", "a11y-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "a11yTitle");

    /* Header band */
    var header = el("div", "a11y-header");
    var heading = el("div", "a11y-heading");
    var icon = el("img", "a11y-heading-icon");
    icon.src = "images/accessibility.png";
    icon.alt = "";
    icon.draggable = false;
    var titles = el("div");
    var title = el("h2", "a11y-title", "Accessibility");
    title.id = "a11yTitle";
    titles.appendChild(title);
    titles.appendChild(el("p", "a11y-subtitle", "Make this site easier to read and use"));
    heading.appendChild(icon);
    heading.appendChild(titles);

    var close = el("button", "a11y-close");
    close.id = "closeModal";
    close.type = "button";
    close.setAttribute("aria-label", "Close accessibility settings");
    close.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';
    close.addEventListener("click", closeModal);
    header.appendChild(heading);
    header.appendChild(close);
    dialog.appendChild(header);

    var body = el("div", "a11y-body");

    /* Text size */
    var size = section("Text size", "a11ySizeTitle");
    refs.sizeValue = el("span", "a11y-value");
    size.title.appendChild(refs.sizeValue);
    var stepper = el("div", "a11y-stepper");
    refs.smaller = el("button", "a11y-step-btn");
    refs.smaller.type = "button";
    refs.smaller.setAttribute("aria-label", "Decrease text size");
    refs.smaller.innerHTML = '<span aria-hidden="true">A<small>&minus;</small></span>';
    refs.smaller.addEventListener("click", function () {
      update({ textSize: Math.max(0, state.textSize - 1) }, "Text size " + TEXT_SIZES[Math.max(0, state.textSize - 1)] + "%");
    });
    refs.larger = el("button", "a11y-step-btn a11y-step-btn-large");
    refs.larger.type = "button";
    refs.larger.setAttribute("aria-label", "Increase text size");
    refs.larger.innerHTML = '<span aria-hidden="true">A<small>+</small></span>';
    refs.larger.addEventListener("click", function () {
      var next = Math.min(TEXT_SIZES.length - 1, state.textSize + 1);
      update({ textSize: next }, "Text size " + TEXT_SIZES[next] + "%");
    });
    var track = el("div", "a11y-steps");
    track.setAttribute("aria-hidden", "true");
    refs.steps = [];
    for (var i = 0; i < TEXT_SIZES.length; i++) {
      var dot = el("span", "a11y-step");
      refs.steps.push(dot);
      track.appendChild(dot);
    }
    stepper.appendChild(refs.smaller);
    stepper.appendChild(track);
    stepper.appendChild(refs.larger);
    size.wrap.appendChild(stepper);
    body.appendChild(size.wrap);

    /* Contrast */
    var contrast = section("Contrast", "a11yContrastTitle");
    var choices = el("div", "a11y-choices");
    refs.contrastNormal = contrastOption("normal", "Normal", "a11y-preview-normal");
    refs.contrastNormal.id = "contrastNormalBtn";
    refs.contrastHigh = contrastOption("high", "High", "a11y-preview-high");
    refs.contrastHigh.id = "contrastHighBtn";
    choices.appendChild(refs.contrastNormal);
    choices.appendChild(refs.contrastHigh);
    contrast.wrap.appendChild(choices);
    body.appendChild(contrast.wrap);

    /* Reading and motion */
    var more = section("Reading and motion", "a11yMoreTitle");
    var spacing = switchRow("a11ySpacing", "Text spacing", "More space between lines, words and letters", "spacing", " on", " off");
    var links = switchRow("a11yLinks", "Underline links", "Make every link easy to spot", "links", " on", " off");
    var motion = switchRow("a11yMotion", "Reduce motion", "Turn off animations and transitions", "motion", " on", " off");
    refs.spacing = spacing.sw;
    refs.links = links.sw;
    refs.motion = motion.sw;
    more.wrap.appendChild(spacing.row);
    more.wrap.appendChild(links.row);
    more.wrap.appendChild(motion.row);
    body.appendChild(more.wrap);

    dialog.appendChild(body);

    /* Footer */
    var footer = el("div", "a11y-footer");
    footer.appendChild(el("p", "a11y-note", "Saved on this device and used on every page."));
    var reset = el("button", "a11y-reset", "Reset");
    reset.type = "button";
    reset.addEventListener("click", function () {
      update({
        textSize: DEFAULTS.textSize,
        contrast: DEFAULTS.contrast,
        spacing: DEFAULTS.spacing,
        links: DEFAULTS.links,
        motion: DEFAULTS.motion
      }, "Accessibility settings reset");
    });
    footer.appendChild(reset);
    dialog.appendChild(footer);

    /* Screen reader announcements for changes */
    refs.status = el("p", "a11y-sr-only");
    refs.status.setAttribute("role", "status");
    dialog.appendChild(refs.status);

    modal.appendChild(dialog);
    /* Clicking the dark backdrop (not the dialog itself) closes it. */
    modal.addEventListener("mousedown", function (event) {
      if (event.target === modal) closeModal();
    });
    document.body.appendChild(modal);
  }

  function openModal() {
    modal.hidden = false;
    document.documentElement.classList.add("a11y-modal-open");
    if (openButton) openButton.setAttribute("aria-expanded", "true");
    refs.larger.disabled ? refs.smaller.focus() : refs.larger.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.documentElement.classList.remove("a11y-modal-open");
    if (openButton) {
      openButton.setAttribute("aria-expanded", "false");
      openButton.focus();
    }
  }

  /* Keep keyboard focus inside the dialog while it is open. */
  function trapFocus(event) {
    var focusable = modal.querySelectorAll("button:not([disabled])");
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function findOrCreateButton() {
    var existing = document.getElementById("accessibilityBtn") || document.querySelector(".accessibility-btn");
    if (existing) return existing;

    var created = el("button", "a11y-floating-btn");
    created.id = "accessibilityBtn";
    created.type = "button";
    created.setAttribute("aria-label", "Accessibility options");
    var icon = el("img");
    icon.src = "images/accessibility.png";
    icon.alt = "";
    icon.draggable = false;
    created.appendChild(icon);
    document.body.appendChild(created);
    return created;
  }

  function init() {
    buildModal();
    openButton = findOrCreateButton();
    openButton.setAttribute("aria-haspopup", "dialog");
    openButton.setAttribute("aria-expanded", "false");
    openButton.addEventListener("click", openModal);
    applyState();

    document.addEventListener("keydown", function (event) {
      if (modal.hidden) return;
      if (event.key === "Escape") closeModal();
      else if (event.key === "Tab") trapFocus(event);
    });

    /* Changed in another tab: follow it. */
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY) {
        state = loadState();
        applyState();
      }
    });
  }

  applyState();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
