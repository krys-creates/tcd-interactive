/**TCD campus map - catalogue 
 * FOR ADMINS:
 Renders the alphabetical building list, handles search, filter panel, saved panel and bookmark toggling
 
 DEPENDENCIES (loaded before this file):
data/buildings.js (BUILDINGS, CATEGORIES)
js/shared.js (getSaved, toggleSaved, isSaved, etc.)
 */

"use strict";

/* STATE*/

/*Active category filters ---empty shows all */
let activeFilters = new Set();

/*Current search query */
let searchQuery = "";

/* Buildings sorted alphabetically */
const SORTED_BUILDINGS = [...BUILDINGS].sort((a, b) =>
  a.name.localeCompare(b.name)
);

/** All letters a-z */
const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** checks out which letters actually have buildings  */
const LETTERS_WITH_BUILDINGS = new Set(
  SORTED_BUILDINGS.map((b) => b.name[0].toUpperCase())
);

/* FILTERING */
/**
  Return list of buildings to display applieds filters+ search
 * @returns {object[]}
 */
function filteredBuildings() {    
  return SORTED_BUILDINGS.filter((b) => {    
    const matchesFilter = activeFilters.size === 0 || b.categories.some((c) => activeFilters.has(c));
   const matchesSearch = searchQuery.length === 0 || b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

/* RENDER BUILDING LIST */
/*Takes the filtered buildings, groups them by first letter, 
generates the entire a-z list dynamically, these are not hardcoded in html*/
function renderBuildingList() {
  const container = document.getElementById("building-list");
  container.innerHTML = "";

  const buildings = filteredBuildings();

  if (buildings.length === 0) {
   container.innerHTML = `<p class="no-results">No buildings match your search or filters.</p>`;
   updateAlphaBar(new Set());
   return;
  }

  /* Group by first letter */
 const groups = {};
 buildings.forEach((b) => {
   const letter = b.name[0].toUpperCase();
   if (!groups[letter]) groups[letter] = [];
   groups[letter].push(b);
  });

 const lettersPresent = new Set(Object.keys(groups));
 updateAlphaBar(lettersPresent);

  Object.keys(groups)
    .sort()
    .forEach((letter) => {
     const section = document.createElement("section");
     section.id = `section-${letter}`;
     section.className = "building-group";
     section.setAttribute("aria-label", `Buildings beginning with ${letter}`);

     const heading = document.createElement("div");
     heading.className = "building-group-header";
     heading.innerHTML = `<h2 class="building-group-letter">${letter}</h2>`;
     section.appendChild(heading);

      groups[letter].forEach((b) => {
       const saved = isSaved(b.id);
       const entry = document.createElement("a");
       entry.href = b.pageUrl;
       entry.className = "building-entry";
       entry.setAttribute("aria-label", b.name);

        /* Category dots */
       const dots = b.categories
          .map((c) => {
            const cat = CATEGORIES[c];
            return `<span class="building-entry-cat-dot"
             style="background-color:${cat ? cat.colour : "#888"};"
             title="${cat ? cat.label : c}"></span>`;
          })
          .join("");

        entry.innerHTML = `<span class="building-entry-name">${b.name}</span>
          <span class="building-entry-categories" aria-hidden="true">${dots}</span>
          <button class="building-entry-bookmark ${saved ? "saved" : ""}"
            data-id="${b.id}"
            aria-label="${saved ? "Remove from saved" : "Save"} ${b.name}"
            aria-pressed="${saved}">
            ${bookmarkSVG(saved, 17)}
        </button>`;

        /* Prevent <a> navigation when clicking bookmark */
        entry.querySelector(".building-entry-bookmark").addEventListener("click", (e) => {
         e.preventDefault();
         e.stopPropagation();
         const btn = e.currentTarget;
         const nowSaved = toggleSaved(b.id);
         btn.classList.toggle("saved", nowSaved);
         btn.setAttribute("aria-pressed", nowSaved);
         btn.innerHTML = bookmarkSVG(nowSaved, 17);
         btn.setAttribute("aria-label", `${nowSaved ? "Remove from saved" : "Save"} ${b.name}`);
         dispatchSavedChange(b.id, nowSaved);
        });

        section.appendChild(entry);
      });

      container.appendChild(section);
    });
}

/*ALPHABET BAR */
/*Build the alphabet navigation bar, letters with no buildings are dimmed  */
function buildAlphaBar() {
  const bar = document.getElementById("alpha-bar");
  bar.innerHTML = "";
  ALL_LETTERS.forEach((letter) => {
   const btn = document.createElement("button");
   btn.className = "alpha-btn";
   btn.textContent = letter;
   btn.setAttribute("aria-label", `Jump to buildings starting with ${letter}`);

    if (LETTERS_WITH_BUILDINGS.has(letter)) {
     btn.classList.add("has-buildings");
    } else {
     btn.classList.add("dimmed");
     btn.disabled = true;
     btn.setAttribute("aria-disabled", "true");
    }

    btn.addEventListener("click", () => scrollToLetter(letter));
    bar.appendChild(btn);
  });
}

/**runs after every search or filter to re dim letters whose buildings are no longer visible
 @param {Set<string>} presentLetters
 */
function updateAlphaBar(presentLetters) {
  document.querySelectorAll(".alpha-btn").forEach((btn) => {
   const letter = btn.textContent;
   const hasBldg = LETTERS_WITH_BUILDINGS.has(letter);
   btn.classList.remove("dimmed", "has-buildings");
    if (presentLetters.has(letter)) {
     btn.classList.add("has-buildings");
     btn.disabled = false;
     btn.removeAttribute("aria-disabled");
    } else if (hasBldg) {
     btn.classList.add("dimmed");
     btn.disabled = true;
     btn.setAttribute("aria-disabled", "true");
    } else {
     btn.classList.add("dimmed");
     btn.disabled = true;
    }
  });
}

/**Smooth scroll to a letter section
@param {string} letter
 */
function scrollToLetter(letter) {
  const section = document.getElementById(`section-${letter}`);
  if (!section) return;
  /* sticky header height */
  const offset = document.querySelector(".catalogue-controls").offsetHeight + parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) + 8;
  const top = section.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/*FILTER PANEL */
function renderFilterPanel() {
  const body = document.getElementById("filter-panel-body");
  body.innerHTML = `<div class="filter-top-bar">
      <button class="filter-select-all" id="filter-select-all" aria-label="Select all categories">SELECT ALL</button>
      <button class="filter-clear" id="filter-clear" aria-label="Clear all category filters">CLEAR</button>
    </div>`;

  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const checked = activeFilters.has(key);
    const item = document.createElement("div");
    item.className = "filter-item";
    item.setAttribute("role", "checkbox");
    item.setAttribute("aria-checked", checked);
    item.setAttribute("aria-label", `Filter by ${cat.label}`);
    item.dataset.key = key;
    item.innerHTML = `<div class="filter-item-icon" style="background-color:${cat.colour}20;">
        <span style="color:${cat.colour};">${categoryIconSVG(key, 13)}</span>
      </div>
      <span class="filter-item-label">${cat.label}</span>
      <div class="filter-checkbox ${checked ? "checked" : ""}">
        ${checked ? checkmarkSVG() : ""}
      </div>`;

    item.addEventListener("click", () => {
      if (activeFilters.has(key)) {
        activeFilters.delete(key);
     } else {
        activeFilters.add(key);
      }
      renderFilterPanel();
      renderBuildingList();
    });

    body.appendChild(item);
  });

  /* Rewire select all/ clear after re-render */
  document.getElementById("filter-select-all").addEventListener("click", () => {
    Object.keys(CATEGORIES).forEach((k) => activeFilters.add(k));
    renderFilterPanel();
    renderBuildingList();
  });
  document.getElementById("filter-clear").addEventListener("click", () => {
    activeFilters.clear();
    renderFilterPanel();
    renderBuildingList();
  });
}

function checkmarkSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
    viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;
}

/* SAVED PANEL*/
function renderSavedPanel() {
  const body = document.getElementById("saved-panel-body");
  body.innerHTML = "";

  const savedIds = getSaved();
  if (savedIds.length === 0) {
    body.innerHTML = `<p class="panel-empty-msg">No saved buildings yet.<br>Click the bookmark on any building.</p>`;
    return;
  }

  const savedBuildings = BUILDINGS.filter((b) => savedIds.includes(b.id))
   .sort((a, b) => a.name.localeCompare(b.name));

  savedBuildings.forEach((b) => {
    const cat = CATEGORIES[b.categories[0]];
    const item = document.createElement("div");
    item.className = "saved-panel-item";
    item.setAttribute("role", "link") ;
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Go to ${b.name}`);
    item.innerHTML = ` <div class="saved-panel-icon" style="background-color:${cat.colour}20;">
        <span style="color:${cat.colour};">${categoryIconSVG(b.categories[0], 13)}</span>
      </div>
      <span class="saved-panel-name">${b.name}</span>
      <button class="saved-panel-delete" data-id="${b.id}" aria-label="Remove ${b.name} from saved">
        ${trashSVG(15)}
      </button>`;

    item.addEventListener("click", (e) => {
      if (!e.target.closest(".saved-panel-delete")) {
        window.location.href = b.pageUrl;
      }
    });

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter") window.location.href = b.pageUrl;
    });

    item.querySelector(".saved-panel-delete").addEventListener("click", (e) => {
     e.stopPropagation();
     removeSaved(b.id);
     dispatchSavedChange(b.id, false);
     renderSavedPanel();
    });

    body.appendChild(item);
  });
}

/* PANEL OPEN/CLOSE HELPERS*/
function openPanel(panelId) {
 document.getElementById("panel-overlay").classList.add("visible");
 document.getElementById(panelId).classList.add("visible");
 document.getElementById(panelId).setAttribute("aria-hidden", "false");
}


function closeAllPanels() {
  document.getElementById("panel-overlay").classList.remove("visible");
  document.querySelectorAll(".side-panel").forEach((p) => {
    p.classList.remove("visible");
    p.setAttribute("aria-hidden", "true");
  });

}

/* STICKY HEADER SCROLL EFFECT*/
function handleScroll() {
  const controls = document.querySelector(".catalogue-controls");
  if (window.scrollY > 10) {
   controls.classList.add("scrolled");
  } else {
     controls.classList.remove("scrolled");
  }

}

/* SAVED CHANGE EVENT- refresh bookmark icons in list */
document.addEventListener("savedChange", (e) => {
  const  { id, saved } =  e.detail;
  const btn = document.querySelector(`.building-entry-bookmark[data-id="${id}"]`);
  if (btn) {
    btn.classList.toggle("saved", saved);
    btn.setAttribute("aria-pressed", saved);
    btn.innerHTML = bookmarkSVG(saved, 17);
    btn.setAttribute("aria-label", `${saved ? "Remove from saved" : "Save"} ${
       BUILDINGS.find((b) => b.id === id)?.name || ""
    }`);

  }
  /* Also refresh saved panel if open */
  if (document.getElementById("saved-panel").classList.contains("visible")) {
    renderSavedPanel();
  }
  /* Update saved toolbar button badge */
  const hasSaved = getSaved().length > 0;
   document.getElementById("btn-saved-toolbar").classList.toggle("active", hasSaved);

});

/* DOM WIRING- user interacts and what happens  */
document.addEventListener ("DOMContentLoaded", () => {
  buildAlphaBar();
  renderBuildingList();
   renderFilterPanel();

  /* Toolbar - saved badge */
  if  (getSaved().length > 0) {
   document.getElementById("btn-saved-toolbar").classList.add("active");
  }

  /* Search */
  document.getElementById("catalogue-search").addEventListener("input", (e) => {
    searchQuery = e.target.value;
   renderBuildingList();

  });

  /* Filter panel */
  document.getElementById("btn-filter").addEventListener("click", () => {
    renderFilterPanel ();
     openPanel ("filter-panel");
  });

  /* Saved panel */
  document.getElementById("btn-saved-toolbar").addEventListener("click", () => {
    renderSavedPanel();
     openPanel("saved-panel");

  });

  /* Close panels */
document.getElementById("btn-filter-close").addEventListener("click", closeAllPanels);
document.getElementById("btn-saved-close").addEventListener("click", closeAllPanels);
document.getElementById("panel-overlay").addEventListener("click",  closeAllPanels);

  /* Keyboard, close panels on esc */
  document.addEventListener("keydown", (e) =>  {
    if (e.key === "Escape")  closeAllPanels();

  });



  /* Sticky scroll */
  window.addEventListener("scroll", handleScroll, { passive: true });


});
