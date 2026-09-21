/*TCD campus map shared utilities 
 FOR ADMINS: Shared state (saved buildings) are saved in localStorage and utility functions used across both pages
 DEPENDENCIES: Must be loaded AFTER buildings.js
 */

"use strict";

/* Local storage key */
const SAVED_KEY = "tcd_saved_buildings";

/**Get saved building ids from localStorage
 @returns {string[]}*/
function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch {
    return [];
  }
}

/**persist saved building ids array to localStorage
 @param {string[]} ids*/
function setSaved(ids) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

/**toggle saved state for a building id, Returns new saved state (boolean)
 @param {string} id
 @returns {boolean}
 */
function toggleSaved(id){
  const saved = getSaved();
  const idx= saved.indexOf(id);
  if (idx === -1) {
    saved.push(id) ;
    setSaved(saved);
    return true;
  } else {
    saved.splice(idx, 1);
    setSaved (saved);
    return false;
  }
}

/**Check whether a building id is currently saved
 @param {string} id
 @returns {boolean}
 */
function isSaved(id) {
  return  getSaved().includes(id);
}

/**Remove a specific building id from saved list
 @param {string}  id
 */
function removeSaved(id) {
 const saved= getSaved().filter((s) => s !== id);
 setSaved(saved);

}

/* category helpers  */
/**get the primary category object for a building
 @param {object} building
@returns {object} category config
 */
function primaryCategory(building) {
 const key= building.categories[0];
  return CATEGORIES[key] || { colour: "#888", label: "Other", icon: "circle" };
}

/**render svg bookmark icon
 @param {boolean} filled
 @param {number} size
  @returns {string} svg markup
 */
function bookmarkSVG(filled, size = 18) {
  const fill = filled ? "currentColor" : "none";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
    viewBox="0 0 24 24" fill="${fill}" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>`;
}

/** Render a trash icon svg
  @param {number} size
  @returns {string} svg markup
 */
function trashSVG(size = 16) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>`;
}

/**Render category icon using svg shapes inline
  @param {string} categoryKey
 @param {number} size
  @returns {string} svg markup
 */
function categoryIconSVG(categoryKey, size = 15) {
  const icons = {  //change to more relvenat later-----------------------------------------------------------------------
    "academic": `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`, //hat
    "student-services": `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, 
    "administrative": `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`, 
    "heritage": `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`, //startburst
    "facilities": `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`, 
    "accessibility": `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`, 
  }; 
  return icons[categoryKey] || icons["administrative"];
}

/**
 * Dispatch a custom event to notify other scripts that saved state changed
 @param {string} buildingId
 @param {boolean} newState - true= saved, false= removed
 */
function dispatchSavedChange(buildingId, newState) {
 const event = new CustomEvent("savedChange", {
   detail: { id: buildingId, saved: newState },
  });
  document.dispatchEvent(event);
}
