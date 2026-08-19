const map = new maplibregl.Map({
    container: 'map',
    style:
        'https://api.maptiler.com/maps/470d6019-657f-4f7d-a018-6ec6ae0d0093/style.json?key=4xF6FrxAyNgBUQ4n4bUN',
    center: [-75.67580482586735,45.40584450123107],
    zoom: 10
  });

//Ottawa Trees Layer
  map.on('load', () => {
    // Tree Icon
    map.loadImage(
        'https://img.icons8.com/?size=100&id=7880&format=png&color=000000',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);

    //Adding Ottawa Trees
    map.addSource ('o_trees', {
      type: 'geojson', 
      data: 'https://maps.ottawa.ca/arcgis/rest/services/Forestry/MapServer/0/query?outFields=*&where=1%3D1&f=geojson'
      });
         
    // Add a symbol layer for Ottawa Trees
    map.addLayer({
      'id': 'o_trees',
      'type': 'symbol',
      'source': 'o_trees',
      'layout': {
        'icon-image': 'custom-marker',
        'icon-size': 0.2
                }
      });
      }
    )
  });
 
//Ottawa Trees Pop Ups
  map.on('click', 'o_trees', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const ottawatrees = e.features[0];
 
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180)
      {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
 
        new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <h3>TREE ID: ${ottawatrees.properties.TREEID}</h3>
                <p><b>Address:</b> ${ottawatrees.properties.ADDSTR}</p>
                <p><b>Ottawa Ward:</b> ${ottawatrees.properties.WARD}</p>
                <p><b>Ownership:</b> ${ottawatrees.properties.OWNERSHIP}</p>
                <p><b>Species:</b> ${ottawatrees.properties.SPECIES}</p>
                <p><b>Diameter:</b> ${ottawatrees.properties.DBH}</p>
                <p><b>Trunk Structure:</b> ${ottawatrees.properties.TRUNCSTRCT}</p>
                <p><b>Status:</b> ${ottawatrees.properties.STATUS}</p>
                `)
            .addTo(map);
    });

//Filter Bar Functions
  const layers = document.getElementById('menu');

//Filter Toggle Button
  const toggleBtn = document.getElementById('toggle-filters');
    const overlay = document.querySelector('.map-overlay');

    toggleBtn.addEventListener('click', () => {
      overlay.classList.toggle('hidden');
      if (overlay.classList.contains('hidden')) {
        toggleBtn.textContent = '⚙️ Show Filters';
      } else {
        toggleBtn.textContent = '❌ Hide Filters';
      }
    });

//Filter functions

    //Filter Values
        let constructionYear = 2025;
        let reuseYear = 2025;
        let selectedOriginalTypology = "all";
        let selectedNewTypology = "all";
        let selectedOccupancy = "all";
        let selectedNotable = [];
        let selectedOwnership = [];

    //Combined Filter function
        function updateFilters() {
        const filters = ["all"];

    // Timeline sliders (allow "Unknown")
        filters.push([
            "any",
            ["==", ["get", "Year_of_Construction"], "Unknown"],
            ["<=", ["get", "Year_of_Construction"], constructionYear]
          ]);
        filters.push([
            "any",
            ["==", ["get", "Year_of_Adaptive_Reuse"], "Unknown"],
            ["<=", ["get", "Year_of_Adaptive_Reuse"], reuseYear]
          ]);

    // Dropdowns
        if (selectedOriginalTypology !== "all") {
            filters.push(["==", ["get", "Original_Typology"], selectedOriginalTypology]);
        }
        if (selectedNewTypology !== "all") {
            filters.push(["==", ["get", "New_Typology"], selectedNewTypology]);
          }
        if (selectedOccupancy !== "all") {
            filters.push(["==", ["get", "Occupancy"], selectedOccupancy]);
          }

    // Checkboxes (no "Unknown" handling here unless your data has it explicitly)
        if (selectedNotable.length > 0) {
            filters.push(["in", ["get", "Notable_Designation"], ...selectedNotable]);
          }
        if (selectedOwnership.length > 0) {
            filters.push(["in", ["get", "Ownership"], ...selectedOwnership]);
          }

    // Apply combined filter
        map.setFilter("g_sites", filters);
        map.setFilter("o_sites", filters);

    };

    // Slider event listeners
      const constructionSlider = document.getElementById('constructionSlider');
      const reuseSlider = document.getElementById('reuseSlider');
      const constructionValue = document.getElementById('constructionValue');
      const reuseValue = document.getElementById('reuseValue');

      constructionValue.textContent = constructionSlider.value;
      reuseValue.textContent = reuseSlider.value;

      constructionSlider.addEventListener('input', (e) => {
          constructionYear = parseInt(e.target.value);
          constructionValue.textContent = constructionYear;
          updateFilters();
      });

      reuseSlider.addEventListener('input', (e) => {
          reuseYear = parseInt(e.target.value);
          reuseValue.textContent = reuseYear;
          updateFilters();
      });

    // Dropdown event listeners
      document.getElementById('operator-og-typology').addEventListener('change', (e) => {
          selectedOriginalTypology = e.target.value;
          updateFilters();
      });

      document.getElementById('operator-new-typology').addEventListener('change', (e) => {
          selectedNewTypology = e.target.value;
          updateFilters();
      });

      document.getElementById('operator-occupancy').addEventListener('change', (e) => {
          selectedOccupancy = e.target.value;
          updateFilters();
      });

    // Notable Designation checkboxes
      function updateSelectedNotable() {
          const checkboxes = document.querySelectorAll('#filtersNotableDesignation input[type=checkbox]');
          const showAllChecked = document.querySelector('#filtersNotableDesignation input[value="all"]').checked;

          if (showAllChecked) {
              selectedNotable = []; // empty = show all
              checkboxes.forEach(cb => { if(cb.value !== "all") cb.checked = true; });
          } else {
              selectedNotable = Array.from(checkboxes)
                  .filter(cb => cb.checked && cb.value !== "all")
                  .map(cb => cb.value);
          }
      };

      document.querySelectorAll('#filtersNotableDesignation input[type=checkbox]').forEach(cb => {
          cb.addEventListener('change', () => {
              updateSelectedNotable();
              updateFilters();
          });
      });

    // Ownership checkboxes
      function updateSelectedOwnership() {
          const checkboxes = document.querySelectorAll('#filtersOwnership input[type=checkbox]');
          const showAllChecked = document.querySelector('#filtersOwnership input[value="all"]').checked;


          if (showAllChecked) {
              selectedOwnership = [];
              checkboxes.forEach(cb => { if(cb.value !== "all") cb.checked = true; });
          } else {
              selectedOwnership = Array.from(checkboxes)
                  .filter(cb => cb.checked && cb.value !== "all")
                  .map(cb => cb.value);
          }
      }

      document.querySelectorAll('#filtersOwnership input[type=checkbox]').forEach(cb => {
          cb.addEventListener('change', () => {
              updateSelectedOwnership();
              updateFilters();
          });
      });

//Reseting filters button
    const resetBtn = document.getElementById('reset-filters');
    resetBtn.addEventListener('click', () => {
        // Reset sliders
        constructionYear = 2025;
        reuseYear = 2025;
        constructionSlider.value = constructionYear;
        reuseSlider.value = reuseYear;
        constructionValue.textContent = constructionYear;
        reuseValue.textContent = reuseYear;

        // Reset dropdowns
        selectedOriginalTypology = 'all';
        selectedNewTypology = 'all';
        selectedOccupancy = 'all';
        document.getElementById('operator-og-typology').value = 'all';
        document.getElementById('operator-new-typology').value = 'all';
        document.getElementById('operator-occupancy').value = 'all';

        // Reset checkboxes
        selectedNotable = [];
        selectedOwnership = [];

        document.querySelectorAll('#filtersNotableDesignation input[type=checkbox]').forEach(cb => {
            cb.checked = cb.value === 'all';
        });

        document.querySelectorAll('#filtersOwnership input[type=checkbox]').forEach(cb => {
            cb.checked = cb.value === 'all';
        });

        // Reapply filters to both layers
        updateFilters();
        });

// Initialize filters
    updateSelectedNotable();
    updateSelectedOwnership();
    updateFilters();

