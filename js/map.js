/**TCD campus map - interactive map 
 FOR ADMINS:
 Initialises the Leaflet map, places markers, handles sidebar panels, category filtering, search and saved buildings.
 
 DEPENDENCIES (loaded before this file in index.html):
 Leaflet CSS + JS , data/buildings.js (buildings, categories)
 js/shared.js (getSaved, toggleSaved, isSaved, etc.)
 */

/* wait til html is built*/
document.addEventListener ("DOMContentLoaded", function () {

  "use strict";

  /* create leaflet map */
  var MAP_CENTER= [53.3440, -6.2549]; //location of tcd
  var MAP_ZOOM = 16;
  var MAP_MIN_ZOOM = 14;
  var MAP_MAX_ZOOM = 19;
  var map = L.map("map", {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    minZoom: MAP_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    zoomControl: false,
  });

  //load map tiles 
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: MAP_MAX_ZOOM,
  }).addTo(map) ;

  L.control.zoom({ position: "topright" }).addTo(map);

  /*STATE of different elements on map---*/
  var activeCategories = new Set();   /*category filters clicked/not */
  var showingSaved = false;   
  var currentCategoryKey =null;  /*which category user drilled into*/
  var markerMap ={};     /*each builidng ID is connected to leaflet pin */


  /* gnerate pin icons ith svgs in tehm - generate them here to appear in html, nothing is hardcoded, accessibility els. generated here for pins*/
  function createMarkerIcon(colour, categoryKey) {   /*what`s next is aka to constructer for html el.*/
    var html = '<div class="custom-marker" role="img" aria-label="Map marker">' +'<div class="marker-pin" style="background-color:' + colour + ';">' +'<div class="marker-pin-inner" style="color:white;">' + categoryIconSVG(categoryKey, 14) + '</div></div>' +'<div class="marker-tail"></div></div>';
    return L.divIcon ({
      html: html,
      className: "",
      iconSize: [36, 46],
      iconAnchor: [17, 46],
      popupAnchor: [0, -48],
    }
  );
  }

  /* POPUP HTML - generate them here to appear in html, nothing is hardcoded in html,generates some accessibility el. here */
 function buildPopupHTML(building) {
    var saved = isSaved (building.id) ;
    var imgTag = '<img src="' + building.image + '" alt="Photo of ' + building.name + '" class="popup-img" onerror="this.outerHTML=\'<div class=&quot;popup-img-placeholder&quot;>Image coming soon</div>\'">';
    return '<div class="popup-card">' + imgTag + '<div class="popup-body">' + '<p class="popup-title">' + building.name + '</p>' + (building.hours ? '<p class="popup-hours">Hours: ' + building.hours + '</p>' : '') +
      '<p class="popup-desc">' + building.shortDesc + '</p>' + '<div class="popup-footer">' + '<a href="' + building.pageUrl + '" class="popup-more-link" aria-label="More about ' + building.name + '">more&gt;</a>' +
      '<button class="popup-save-btn '+ (saved ? 'saved' : '') + '" data-id="' + building.id + '"' + ' aria-label="'+ (saved ? 'Remove from saved' : 'Save') + ' ' + building.name + '"' +
      ' aria-pressed="' + saved + '">' + bookmarkSVG(saved, 17) + '</button>' +'</div></div></div>';
  }

  /*LOOP through every buliding in buildings.js place a pin at proper coordinates + bind a popup */
  function placeMarkers() {
    BUILDINGS.forEach(function (building) {
      var catKey = building.categories[0];
      var cat = CATEGORIES[catKey];
      if (!cat) return;
      var icon = createMarkerIcon(cat.colour, catKey);
      var marker = L.marker(building.coords, {
        icon: icon,
        title: building.name,
        alt: building.name,
      });
      marker.bindPopup(buildPopupHTML(building), {
        maxWidth: 240,
        minWidth: 240,
      });
      marker.on("popupopen", function () {
        var btn = document.querySelector('.popup-save-btn[data-id="' + building.id + '"]');
        if (btn) {
          btn.addEventListener("click", function (e) {
            e.preventDefault();
            var nowSaved = toggleSaved(building.id);
            dispatchSavedChange(building.id, nowSaved);
            marker.setPopupContent(buildPopupHTML(building));
            setTimeout(function () { marker.openPopup(); }, 10);
          });
        }
      });
      marker.addTo(map);
      markerMap[building.id] = marker;
    });
  }

  /* MARKER/pin VISIBILITY -if showingSaved is true, only saved buildings appear OR If activeCategories has entries, 
  only buildings belonging to those categories appear. all markers shown if neither condtion is true */
  function updateMarkerVisibility() {
    var savedIds = getSaved();
    BUILDINGS.forEach(function (building) {
      var marker = markerMap[building.id];
      if (!marker) return;
      var visible = true;
      if (showingSaved) {
       visible = savedIds.indexOf(building.id) !== -1;
      } else if (activeCategories.size > 0) {
        visible = building.categories.some(function (c) { return activeCategories.has(c); });
      }
      if (visible) {
       if (!map.hasLayer(marker)) map.addLayer(marker);
      } else {
       if (map.hasLayer(marker)) map.removeLayer(marker);
      }

    });

  }

  /* CATEGORY PANEL  */
    /* tickbox hwen category chosen */
  function checkmarkSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"' +' fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +'<polyline points="20 6 9 17 4 12"/></svg>';
  }

  /* building category list in panel itself, reads from buildings.js  */
  function renderCategoryPanel() {    
    var panel = document.getElementById("panel-categories");
    panel.innerHTML = "";

    Object.keys(CATEGORIES).forEach(function (key) {
      var cat = CATEGORIES[key];
      var isChecked = activeCategories.has(key);
      var item = document.createElement("div");
      item.className = "category-item";
      item.setAttribute("role", "row");
      item.dataset.catKey = key;
      item.innerHTML ='<div class="category-icon" style="background-color:' + cat.colour + '20;">' +'<span style="color:' + cat.colour + ';">' + categoryIconSVG(key, 15) + '</span>' +'</div>' +'<span class="category-label">' + cat.label + '</span>' +
        '<div class="category-checkbox ' + (isChecked ? 'checked' : '') + '"' + ' role="checkbox" aria-checked="' + isChecked + '" aria-label="Filter by ' + cat.label + '">' + (isChecked ? checkmarkSVG() : '') +'</div>' +'<span class="category-chevron" aria-hidden="true">&#x203A;</span>';

      item.querySelector(".category-chevron").addEventListener("click", function (e) { /* arrow to open categories  */
        e.stopPropagation();
        openCategoryDetail(key);
      });

      item.addEventListener("click", function (e) {
        if (!e.target.closest(".category-chevron")) {
         toggleCategory(key);
        }
      });

      panel.appendChild(item);  /* arrow  */
    });
  }

  /* used when a user clicks a category row, add or remove from activeCategories */
  function toggleCategory(key) {
    if (activeCategories.has(key)) {
     activeCategories.delete(key);
    } else {
     activeCategories.add(key);
    }
    showingSaved = false;
    document.getElementById("btn-saved").classList.remove("has-saved");
    renderCategoryPanel();     
    updateMarkerVisibility();        /* show or hide the relevant pins */
  }

    /* when arrow clicked on a category, filters buildings to only show buildings in that category,
     sorts buildings in category aplhabetically, generates list of clickable building rows
      Each row will have a name, a bookmark button with correct ARIA attributes*/
  function openCategoryDetail(key) {
    currentCategoryKey = key;
    var cat = CATEGORIES[key];
    var buildings = BUILDINGS.filter(function (b) { return b.categories.indexOf(key) !== -1; });

    if (!activeCategories.has(key)) {
      activeCategories.add(key);
      updateMarkerVisibility();
    }

    var detail = document.getElementById("panel-category-detail");
    detail.querySelector(".panel-category-title").textContent = cat.label;
    detail.querySelector(".panel-category-title-icon").innerHTML ='<span style="color:' + cat.colour + ';">' + categoryIconSVG(key, 16) + '</span>';

    var list = detail.querySelector(".building-list");
    list.innerHTML = "";

    buildings.sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (b) {
     var saved = isSaved(b.id);
     var item = document.createElement("div");
     item.className = "building-list-item";
     item.setAttribute("role", "button");
     item.setAttribute("tabindex", "0");      /* accessibility - keyboard navigation for sidebare*/ 
     item.setAttribute("aria-label", b.name);
      item.innerHTML ='<span class="building-list-item-name">' + b.name + '</span>' + '<button class="bookmark-icon ' + (saved ? 'saved' : '') + '" data-id="' + b.id + '"' + ' aria-label="' + (saved ? 'Remove from saved' : 'Save') + ' ' + b.name + '"' + ' aria-pressed="' + saved + '">' + bookmarkSVG(saved, 17) + '</button>';

      item.addEventListener("click", function (e) {
        if (!e.target.closest(".bookmark-icon")) flyToBuilding(b.id);
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") flyToBuilding(b.id);
      });

      item.querySelector(".bookmark-icon").addEventListener("click", function (e) {
        e.stopPropagation();
       var btn = e.currentTarget;
       var nowSaved = toggleSaved(b.id);
       btn.classList.toggle("saved", nowSaved);
       btn.setAttribute("aria-pressed", nowSaved);   /* updates aria-pressed state to notify screen reader*/
       btn.innerHTML = bookmarkSVG(nowSaved, 17);
       btn.setAttribute("aria-label", (nowSaved ? "Remove from saved" : "Save") + " " + b.name);  /*  screen reader announces Save or Remove from saved based on what`s done */
        dispatchSavedChange(b.id, nowSaved);
      });
      list.appendChild(item);
    });

    document.getElementById("panel-categories").style.display = "none";
    document.getElementById("search-results-list").classList.remove("visible");
    detail.classList.add("visible");
  }

   /* when back button is clicked show main categories panel again*/
  function closeCategoryDetail() {
    currentCategoryKey = null;
    document.getElementById("panel-categories").style.display = "";
    document.getElementById("panel-category-detail").classList.remove("visible");
  }

  /* SAVED PANEL , reads the saved building ID from localStorage via getSaved() 
   finds the matching building objects, sorts them alphabetically and generates a list
   Each item shows the category colour icon, building name and delete button
   */
  function renderSavedPanel() {
    var savedIds = getSaved();
    var list = document.getElementById("saved-list");
    list.innerHTML = "";

    if (savedIds.length === 0) {
      list.innerHTML = '<p class="saved-empty">No saved buildings yet.<br>Use the bookmark icon on any building.</p>';
      return;
    }

    var savedBuildings = BUILDINGS.filter(function (b) { return savedIds.indexOf(b.id) !== -1; });
    savedBuildings.sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (b) {
      var cat = CATEGORIES[b.categories[0]];
      var item = document.createElement("div");
      item.className = "saved-list-item";
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");      /* accessibility - keyboard navigation*/
      item.setAttribute("aria-label", "Go to " + b.name);
      item.innerHTML ='<div class="saved-list-icon" style="background-color:' + cat.colour + '20;">' + '<span style="color:' + cat.colour + ';">' + categoryIconSVG(b.categories[0], 13) + '</span>' +
        '</div>' +'<span class="saved-list-name">' + b.name + '</span>' +'<button class="btn-delete" data-id="' + b.id + '" aria-label="Remove ' + b.name + ' from saved">' + trashSVG(15) +'</button>';
      item.addEventListener("click", function (e) {
        if (!e.target.closest(".btn-delete")) flyToBuilding(b.id);
      });
  

      item.querySelector(".btn-delete").addEventListener("click", function (e) {
        e.stopPropagation();
        removeSaved(b.id);
        dispatchSavedChange(b.id, false);
        renderSavedPanel();
        updateMarkerVisibility();
      });

      list.appendChild(item);
    });

  }

  /* when saved button is clicked,  
  hides the category panel and renders the saved list, 
  closing it restores the category panel and clears all active filters*/
  function toggleSavedPanel() {
    showingSaved = !showingSaved;
    var savedPanel = document.getElementById("panel-saved");
    var catPanel = document.getElementById("panel-categories");
    var catDetail = document.getElementById("panel-category-detail");
    var searchResults = document.getElementById("search-results-list");

    if (showingSaved) {
      catPanel.style.display = "none";
      catDetail.classList.remove("visible");
      searchResults.classList.remove("visible");
      renderSavedPanel();
      savedPanel.classList.add("visible");
      document.getElementById("btn-saved").classList.add("has-saved");
      updateMarkerVisibility();
    }else {
      savedPanel.classList.remove("visible");
      catPanel.style.display = "";
      document.getElementById("btn-saved").classList.remove("has-saved");
      activeCategories.clear();
      renderCategoryPanel();
      updateMarkerVisibility();
    }
  }

  /*SEARCH - runs every time the user types in the search bar, 
  filters by name, 
  each result has click and keyboard listeners that fly the map to the building */
  function handleSearch(query) {
    var q = query.trim().toLowerCase();
    var resultsList = document.getElementById("search-results-list");
    var catPanel = document.getElementById("panel-categories");
    var catDetail = document.getElementById("panel-category-detail");
    var savedPanel = document.getElementById("panel-saved");

    if (q.length < 2) {
      resultsList.classList.remove("visible");
      catPanel.style.display = "";
      if (!showingSaved) savedPanel.classList.remove("visible");
      return;
    }
    var matches = BUILDINGS.filter(function (b) {
      return b.name.toLowerCase().indexOf(q) !== -1 || b.shortDesc.toLowerCase().indexOf(q) !== -1;
    });

    resultsList.innerHTML = "";
    if (matches.length === 0) {
      resultsList.innerHTML = '<div class="search-result-item"><span class="search-result-name" style="font-style:italic;color:var(--text-muted)">No results found</span></div>';
    } else {
      matches.forEach(function (b) {
        var cat = CATEGORIES[b.categories[0]];
        var item = document.createElement("div");
        item.className = "search-result-item";
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-label", "Go to " + b.name);
        item.innerHTML ='<div class="search-result-dot" style="background-color:' + cat.colour + ';"></div>' +'<span class="search-result-name">' + b.name + '</span>';
        item.addEventListener("click", function () { clearSearch(); flyToBuilding(b.id); });
        item.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { clearSearch(); flyToBuilding(b.id); }
        });
        resultsList.appendChild(item);
      });
    }
    catPanel.style.display = "none";
    catDetail.classList.remove("visible");
    savedPanel.classList.remove("visible");
    resultsList.classList.add("visible");
  }

  function clearSearch() {
    var input = document.getElementById("search-input");
    input.value = "";
    document.getElementById("search-results-list").classList.remove("visible");
    document.getElementById("panel-categories").style.display = "";
    if (showingSaved) {
      document.getElementById("panel-saved").classList.add("visible");
    }
  }

  /*FLY TO BUILDING 
  Finds a building by ID in the BUILDINGS.js arrays
  Each result has click and keyboard listeners that fly  map to building*/
  function flyToBuilding(id) {
    var building = null;
    for (var i = 0; i < BUILDINGS.length; i++) {
      if (BUILDINGS[i].id === id) { building = BUILDINGS[i]; break; }
    }
    var marker = markerMap[id];
    if (!building || !marker) return;
    if (!map.hasLayer(marker)) map.addLayer(marker);
    map.flyTo(building.coords, Math.max(map.getZoom(), 17), {  /* popup appears just as the map finishes moving */
      animate: true,
      duration: 0.8,
    });
    setTimeout(function () { marker.openPopup(); }, 850);
  }

  /*SELECT ALL/CLEAR */
  function selectAll() {
    Object.keys(CATEGORIES).forEach(function (k) { activeCategories.add(k); });
    showingSaved = false;
    renderCategoryPanel();
    updateMarkerVisibility();
  }

  function clearAll() {
    activeCategories.clear();
    showingSaved = false;
    renderCategoryPanel();
    updateMarkerVisibility();
  }

  /* SAVED CHANGE EVENT 
  Listens for the custom savedChange event in shared.js whenever building is saved/unsaved anywhere on page*/
  document.addEventListener("savedChange", function () {
    var hasSaved = getSaved().length > 0;
    document.getElementById("btn-saved").classList.toggle("has-saved", hasSaved);
    if (showingSaved) {
      renderSavedPanel();
      updateMarkerVisibility();
    }
    if (currentCategoryKey) openCategoryDetail(currentCategoryKey);
  });

  /*DOM WIRING */
  placeMarkers();
  renderCategoryPanel();  /*render based on whatever is put to buildings.js file= dynamic updating */

  if (getSaved().length > 0) {
   document.getElementById("btn-saved").classList.add("has-saved");
  }

   /*what happens when different buttons are clicked */
  document.getElementById("search-input").addEventListener("input", function (e) {
   handleSearch(e.target.value);
  });
  document.getElementById("search-input").addEventListener("keydown", function (e) {
    if (e.key === "Escape") clearSearch();
  });

  document.getElementById("btn-saved").addEventListener("click", function () {
    toggleSavedPanel();
  });

   
  document.getElementById("btn-select-all").addEventListener("click", selectAll);
  document.getElementById("btn-clear").addEventListener("click", clearAll);
 document.getElementById("btn-back").addEventListener("click", closeCategoryDetail);
  document.getElementById("btn-back-saved").addEventListener("click", function () {
    toggleSavedPanel();
  });

/* collapse/expand sidebar(tab) on map, adapted to mobile and desktop*/
var sidebarToggle = document.getElementById("sidebar-toggle");
  var sidebarArrow = document.getElementById("sidebar-toggle-arrow");
  var sidebar = document.getElementById("sidebar");
  var isMobile = function () { return window.innerWidth <= 768; };

  sidebarToggle.addEventListener("click", function () {
    if (isMobile()) {
      var isOpen = sidebar.classList.toggle("mobile-open");
      sidebarToggle.classList.toggle("mobile-open", isOpen);
      sidebarArrow.innerHTML = isOpen ? "&#8250;" : "&#8249;";
    }else {
      var isCollapsed = sidebar.classList.toggle("collapsed");
      sidebarToggle.classList.toggle("collapsed", isCollapsed);
      sidebarArrow.innerHTML = isCollapsed ? "&#8250;" : "&#8249;";
      setTimeout(function () { map.invalidateSize(); }, 420);    /*  map looks accurately after sidebar is collapsed */
    }
    
  });

}); /* end DOMContentLoaded */
