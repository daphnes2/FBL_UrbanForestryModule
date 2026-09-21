const map = new maplibregl.Map({
    container: 'map',
    style:
        'https://api.maptiler.com/maps/470d6019-657f-4f7d-a018-6ec6ae0d0093/style.json?key=4xF6FrxAyNgBUQ4n4bUN',
    center: [-75.67580482586735, 45.40584450123107],
    zoom: 10
  });

//===================================================================
// SPECIES GROUPS
//
// Ottawa's Tree Inventory service (Forestry/MapServer/0) stores SPECIES
// as a coded value formatted "<Genus common name> <Descriptor>", e.g.
// "Fir Balsam" = Abies balsamea, "Fir White" = Abies concolor. That
// word order is confirmed from those two examples; the codes below for
// YOUR species list are inferred from standard common names using that
// same pattern - they have NOT been confirmed against the live data.
//
// VERIFY BEFORE TRUSTING THIS: click a tree of a known species on the
// map - the popup already shows the raw SPECIES value - and compare it
// to the "words" array for that species below. Each match check requires
// ALL words in the array to appear somewhere in SPECIES (case-insensitive,
// order doesn't matter), which is intentionally forgiving of word-order
// guesses, but a wrong descriptor word will still silently match zero
// trees. Fix by editing the relevant "words" array.
//===================================================================
const speciesGroups = {
    "Group 1 (Fir / Hemlock / White Pine / Cedar / Spruces)": [
        { latin: "Abies balsamea",      words: ["fir", "balsam"] },
        { latin: "Tsuga canadensis",    words: ["hemlock"] },
        { latin: "Pinus strobus",       words: ["pine", "white"] },
        { latin: "Thuja occidentalis",  words: ["cedar"] },
        { latin: "Picea abies",         words: ["spruce", "norway"] },
        { latin: "Picea glauca",        words: ["spruce", "white"] },
        { latin: "Picea rubens",        words: ["spruce", "red"] },
        { latin: "Picea mariana",       words: ["spruce", "black"] }
    ],
    "Group 2 (Red / Pitch / Loblolly Pine)": [
        { latin: "Pinus resinosa", words: ["pine", "red"] },
        { latin: "Pinus rigida",   words: ["pine", "pitch"] },
        { latin: "Pinus taeda",    words: ["pine", "loblolly"] }
    ],
    "Group 3 (Tamarack / Aspens)": [
        { latin: "Larix laricina",        words: ["tamarack"] },
        { latin: "Populus grandidentata",  words: ["aspen", "bigtooth"] },
        { latin: "Populus tremuloides",    words: ["aspen", "trembling"] }
    ],
    "Group 4 (Black Cherry / Birches)": [
        { latin: "Prunus serotina",       words: ["cherry", "black"] },
        { latin: "Betula populifolia",    words: ["birch", "gray"] },
        { latin: "Betula papyrifera",     words: ["birch", "paper"] },
        { latin: "Betula alleghaniensis", words: ["birch", "yellow"] },
        { latin: "Betula lenta",          words: ["birch", "sweet"] }
    ],
    "Group 5 (Walnut / White Ash / Tuliptree / Basswood / Bitternut Hickory)": [
        { latin: "Juglans nigra",         words: ["walnut", "black"] },
        { latin: "Fraxinus americana",    words: ["ash", "white"] },
        { latin: "Liriodendron tulipifera", words: ["tulip"] },
        { latin: "Tilia americana",       words: ["basswood"] },
        { latin: "Carya cordiformis",     words: ["hickory", "bitternut"] }
    ],
    "Group 6 (Maples / American Elm / American Beech)": [
        { latin: "Acer rubrum",       words: ["maple", "red"] },
        { latin: "Ulmus americana",   words: ["elm", "american"] },
        { latin: "Acer saccharinum",  words: ["maple", "silver"] },
        { latin: "Acer saccharum",    words: ["maple", "sugar"] },
        { latin: "Fagus grandifolia", words: ["beech", "american"] }
    ],
    "Group 7 (Oaks / Pignut Hickory)": [
        { latin: "Quercus macrocarpa", words: ["oak", "bur"] },
        { latin: "Quercus alba",       words: ["oak", "white"] },
        { latin: "Quercus coccinea",   words: ["oak", "scarlet"] },
        { latin: "Quercus rubra",      words: ["oak", "red"] },
        { latin: "Quercus velutina",   words: ["oak", "black"] },
        { latin: "Carya glabra",       words: ["hickory", "pignut"] }
    ]
};

// Populate the species group dropdown from the object above, plus a
// catch-all "Other Species" option for anything that matches none of
// the seven defined groups.
const speciesGroupSelect = document.getElementById('operator-species-group');
Object.keys(speciesGroups).forEach((groupLabel) => {
    const opt = document.createElement('option');
    opt.value = groupLabel;
    opt.textContent = groupLabel;
    speciesGroupSelect.appendChild(opt);
});
const otherOpt = document.createElement('option');
otherOpt.value = '__other__';
otherOpt.textContent = 'Other Species';
speciesGroupSelect.appendChild(otherOpt);

// Builds a MapLibre boolean expression that is true when the feature's
// SPECIES field contains ALL of `words` (case-insensitive, substring
// match, order-independent). Guards against missing/null SPECIES.
function speciesEntryExpr(words) {
    const downcased = ['downcase', ['get', 'SPECIES']];
    const allWordsPresent = [
        'all',
        ...words.map((w) => ['>=', ['index-of', w, downcased], 0])
    ];
    return ['case', ['!', ['has', 'SPECIES']], false, allWordsPresent];
}

// Builds the "matches any species entry in this group" expression
function speciesGroupExpr(entries) {
    return ['any', ...entries.map((e) => speciesEntryExpr(e.words))];
}

// Expression matching ANY of the seven defined groups (used to build
// the "Other Species" catch-all as its logical negation).
function anyDefinedGroupExpr() {
    return ['any', ...Object.values(speciesGroups).map((entries) => speciesGroupExpr(entries))];
}

//===================================================================
// Ottawa Trees Layer
//===================================================================
map.on('load', () => {
    // Tree Icon
    map.loadImage(
        'https://img.icons8.com/?size=100&id=7880&format=png&color=000000',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);

            // Adding Ottawa Trees
            // NOTE: The Forestry/MapServer/0 service has a MaxRecordCount of
            // 1000, so this query only returns the first 1000 matching
            // records. If you need the full ~300k-tree dataset, you'll need
            // to page through results (resultOffset/resultRecordCount) and
            // merge them into one FeatureCollection before adding the source.
            map.addSource('o_trees', {
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

            // Apply whatever filter state is currently set (handles the
            // case where the layer finishes loading after filter controls
            // have already been initialized).
            updateFilters();
        }
    );
});

//===================================================================
// Ottawa Trees Pop Ups
//===================================================================
map.on('click', 'o_trees', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const ottawatrees = e.features[0];

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
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
            <p><b>Diameter (cm):</b> ${ottawatrees.properties.DBH}</p>
            <p><b>Trunk Structure:</b> ${ottawatrees.properties.TRUNCSTRCT}</p>
            <p><b>Status:</b> ${ottawatrees.properties.STATUS}</p>
            `)
        .addTo(map);
});

map.on('mouseenter', 'o_trees', () => {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'o_trees', () => {
    map.getCanvas().style.cursor = '';
});

//===================================================================
// Filter Toggle Button
//===================================================================
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

//===================================================================
// Filter State
//===================================================================
let selectedSpeciesGroup = 'all';
let selectedConditions = [];       // e.g. ['HSURFACE', 'GRATE']
let maxPlantYear = 2026;
let maxDiameter = 150;
let onlyKnownPlantDate = false; // diagnostic toggle - see plantDateOnlyKnown checkbox

const CONDITION_FIELDS = ['HSURFACE', 'SSUPPORT', 'TRGUARD', 'GRATE', 'PLANTER', 'STAKED', 'WTUBES'];

//===================================================================
// Combined Filter Function
//===================================================================
function updateFilters() {
    if (!map.getLayer('o_trees')) return; // layer not added yet

    const filters = ['all'];

    // --- Species group filter ---
    if (selectedSpeciesGroup === '__other__') {
        // "Other Species": anything that matches none of the 7 defined groups
        filters.push(['!', anyDefinedGroupExpr()]);
    } else if (selectedSpeciesGroup !== 'all') {
        const entries = speciesGroups[selectedSpeciesGroup] || [];
        filters.push(speciesGroupExpr(entries));
    }

    // --- Planting condition checkboxes (OR across whatever is checked) ---
    // Fields are coded 0 = No, -1 = Yes.
    if (selectedConditions.length > 0) {
        filters.push([
            'any',
            ...selectedConditions.map((field) => ['==', ['get', field], -1])
        ]);
    }

    // --- Plant Date slider ("planted on or before") ---
    // Esri REST services are inconsistent about how they serialize Date
    // fields to GeoJSON - some return an ISO 8601 string like
    // "2010-05-03T00:00:00.000Z", others return a raw Unix epoch in
    // milliseconds like 1272844800000. This branches on the actual
    // runtime type so it works either way instead of assuming one format
    // (an earlier version assumed ISO-string-only, which silently broke
    // the whole filter if the service actually returns epoch numbers).
    // Trees with no recorded plant date always pass this filter (treated
    // like "Unknown"), unless "Only known plant dates" is checked below.
    const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
    filters.push([
        'case',
        ['!', ['has', 'PLNTDATE']], !onlyKnownPlantDate,
        ['==', ['get', 'PLNTDATE'], null], !onlyKnownPlantDate,
        ['==', ['typeof', ['get', 'PLNTDATE']], 'number'],
            ['<=', ['+', 1970, ['/', ['get', 'PLNTDATE'], MS_PER_YEAR]], maxPlantYear],
        // else: treat as an ISO 8601 string, compare the 4-digit year prefix
        ['<=', ['to-number', ['slice', ['get', 'PLNTDATE'], 0, 4]], maxPlantYear]
    ]);

    // --- Diameter slider ("diameter up to") ---
    // Trees with no recorded DBH always pass this filter.
    filters.push([
        'any',
        ['!', ['has', 'DBH']],
        ['==', ['get', 'DBH'], null],
        ['<=', ['get', 'DBH'], maxDiameter]
    ]);

    map.setFilter('o_trees', filters);
}

//===================================================================
// Species Group dropdown listener
//===================================================================
speciesGroupSelect.addEventListener('change', (e) => {
    selectedSpeciesGroup = e.target.value;
    updateFilters();
});

//===================================================================
// Planting Condition checkboxes
//===================================================================
function updateSelectedConditions() {
    const checkboxes = document.querySelectorAll('#filtersPlantingConditions input[type=checkbox]');
    selectedConditions = Array.from(checkboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);
}

document.querySelectorAll('#filtersPlantingConditions input[type=checkbox]').forEach((cb) => {
    cb.addEventListener('change', () => {
        updateSelectedConditions();
        updateFilters();
    });
});

//===================================================================
// Plant Date / Diameter sliders
//===================================================================
const plantDateSlider = document.getElementById('plantDateSlider');
const diameterSlider = document.getElementById('diameterSlider');
const plantDateValue = document.getElementById('plantDateValue');
const diameterValue = document.getElementById('diameterValue');

plantDateValue.textContent = plantDateSlider.value;
diameterValue.textContent = diameterSlider.value;

plantDateSlider.addEventListener('input', (e) => {
    maxPlantYear = parseInt(e.target.value);
    plantDateValue.textContent = maxPlantYear;
    updateFilters();
});

// Diagnostic checkbox: hides trees with no recorded PLNTDATE so you can
// see the slider's effect in isolation. If checking this makes the tree
// count drop drastically, it means most of your loaded trees simply have
// no plant date recorded (a data-coverage issue, not a filter bug).
const plantDateOnlyKnownCheckbox = document.getElementById('plantDateOnlyKnown');
if (plantDateOnlyKnownCheckbox) {
    plantDateOnlyKnownCheckbox.addEventListener('change', (e) => {
        onlyKnownPlantDate = e.target.checked;
        updateFilters();
    });
}

diameterSlider.addEventListener('input', (e) => {
    maxDiameter = parseInt(e.target.value);
    diameterValue.textContent = maxDiameter;
    updateFilters();
});

//===================================================================
// Reset Filters Button
//===================================================================
const resetBtn = document.getElementById('reset-filters');
resetBtn.addEventListener('click', () => {
    // Reset species group
    selectedSpeciesGroup = 'all';
    speciesGroupSelect.value = 'all';

    // Reset planting condition checkboxes
    selectedConditions = [];
    document.querySelectorAll('#filtersPlantingConditions input[type=checkbox]').forEach((cb) => {
        cb.checked = false;
    });

    // Reset sliders
    maxPlantYear = parseInt(plantDateSlider.max);
    maxDiameter = parseInt(diameterSlider.max);
    plantDateSlider.value = maxPlantYear;
    diameterSlider.value = maxDiameter;
    plantDateValue.textContent = maxPlantYear;
    diameterValue.textContent = maxDiameter;

    // Reset diagnostic checkbox
    onlyKnownPlantDate = false;
    if (plantDateOnlyKnownCheckbox) plantDateOnlyKnownCheckbox.checked = false;

    updateFilters();
});

// Initialize filters (in case the layer is already loaded, e.g. on hot reload)
updateSelectedConditions();
updateFilters();
