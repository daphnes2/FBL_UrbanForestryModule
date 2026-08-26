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
// your species list are inferred from standard common names using that
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

//===================================================================
// PLAIN-JS SPECIES MATCHING (replaces the old MapLibre-expression
// version now that filtering happens client-side against the full
// in-memory dataset rather than via map.setFilter)
//===================================================================
function speciesWordsPresent(speciesValue, words) {
    if (!speciesValue) return false;
    const low = String(speciesValue).toLowerCase();
    return words.every((w) => low.includes(w));
}
function matchesGroup(speciesValue, groupEntries) {
    return groupEntries.some((entry) => speciesWordsPresent(speciesValue, entry.words));
}
function matchesAnyDefinedGroup(speciesValue) {
    return Object.values(speciesGroups).some((entries) => matchesGroup(speciesValue, entries));
}

//===================================================================
// PAGINATION: load the FULL tree inventory
//
// The Forestry/MapServer/0 service caps any single query response at
// maxRecordCount (1000) records. To get all ~300k trees we page through
// the dataset using resultOffset/resultRecordCount, firing a limited
// number of pages concurrently (rather than one at a time) so the
// initial load doesn't take minutes.
//===================================================================
const TREE_QUERY_BASE = 'https://maps.ottawa.ca/arcgis/rest/services/Forestry/MapServer/0/query';
const PAGE_SIZE = 1000;
const PAGE_CONCURRENCY = 6;

async function fetchAllTrees(onProgress) {
    // 1. Find out how many records exist in total.
    const countUrl = `${TREE_QUERY_BASE}?where=1%3D1&returnCountOnly=true&f=json`;
    const countResp = await fetch(countUrl);
    const countData = await countResp.json();
    const total = countData.count;
    if (!total || total <= 0) {
        throw new Error('Could not determine tree count from the Ottawa Forestry service.');
    }

    // 2. Build the list of page offsets we need to fetch.
    const numPages = Math.ceil(total / PAGE_SIZE);
    const offsets = Array.from({ length: numPages }, (_, i) => i * PAGE_SIZE);

    const allFeatures = [];
    let loadedCount = 0;
    let failedPages = 0;

    async function fetchPage(offset) {
        const url = `${TREE_QUERY_BASE}?where=1%3D1&outFields=*&f=geojson`
            + `&resultRecordCount=${PAGE_SIZE}&resultOffset=${offset}&orderByFields=OBJECTID`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            const feats = data.features || [];
            allFeatures.push(...feats);
            loadedCount += feats.length;
        } catch (err) {
            failedPages += 1;
            console.warn(`Failed to load tree page at offset ${offset}:`, err);
        }
        if (onProgress) onProgress(loadedCount, total, failedPages);
    }

    // 3. Fetch pages with limited concurrency (simple worker-pool pattern).
    let nextIndex = 0;
    async function worker() {
        while (nextIndex < offsets.length) {
            const myOffset = offsets[nextIndex];
            nextIndex += 1;
            await fetchPage(myOffset);
        }
    }
    const workers = Array.from({ length: PAGE_CONCURRENCY }, () => worker());
    await Promise.all(workers);

    if (failedPages > 0) {
        console.warn(`${failedPages} of ${numPages} pages failed to load - dataset may be incomplete.`);
    }

    return { type: 'FeatureCollection', features: allFeatures };
}

// Holds the complete, unfiltered dataset once loaded.
let allTreesData = null;

// Simple on-screen status line (loading progress, then result counts).
function setStatusText(text) {
    const el = document.getElementById('filter-result');
    if (el) el.textContent = text;
}

//===================================================================
// Ottawa Trees Layer (clustered)
//===================================================================
map.on('load', () => {
    map.loadImage(
        'https://img.icons8.com/?size=100&id=7880&format=png&color=000000',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);

            // Start with an empty source; real data is streamed in once
            // pagination finishes (see fetchAllTrees() call below).
            map.addSource('o_trees', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50
            });

            // Cluster bubbles
            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'o_trees',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step', ['get', 'point_count'],
                        '#8bc98b', 50,
                        '#5a9c5a', 200,
                        '#2f6b2f'
                    ],
                    'circle-radius': [
                        'step', ['get', 'point_count'],
                        16, 50,
                        22, 200,
                        28
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });

            // Cluster count labels
            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'o_trees',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': ['get', 'point_count_abbreviated'],
                    'text-size': 12
                },
                paint: {
                    'text-color': '#ffffff'
                }
            });

            // Individual (unclustered) trees - kept as layer id "o_trees"
            // so the existing click/popup handlers below don't need to change.
            map.addLayer({
                id: 'o_trees',
                type: 'symbol',
                source: 'o_trees',
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': 'custom-marker',
                    'icon-size': 0.2
                }
            });

            // Click a cluster to zoom into it
            map.on('click', 'clusters', (e) => {
                const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                if (!features.length) return;
                const clusterId = features[0].properties.cluster_id;
                map.getSource('o_trees').getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err) return;
                    map.easeTo({ center: features[0].geometry.coordinates, zoom });
                });
            });
            map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });

            // Kick off the full paginated load.
            setStatusText('Loading trees... 0 / ?');
            fetchAllTrees((loaded, total, failedPages) => {
                const failNote = failedPages > 0 ? ` (${failedPages} pages failed)` : '';
                setStatusText(`Loading trees... ${loaded} / ${total}${failNote}`);
            })
                .then((geojson) => {
                    allTreesData = geojson;
                    updateFilters(); // populates the source with the (currently unfiltered) full dataset
                })
                .catch((err) => {
                    console.error('Failed to load tree inventory:', err);
                    setStatusText('Error loading tree data - see browser console for details.');
                });
        }
    );
});

//===================================================================
// Ottawa Trees Pop Ups
//===================================================================
map.on('click', 'o_trees', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const ottawatrees = e.features[0];

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
let onlyKnownPlantDate = false;    // diagnostic toggle - see plantDateOnlyKnown checkbox

//===================================================================
// Per-tree predicate + combined client-side filter
//===================================================================
function passesSpeciesFilter(props) {
    if (selectedSpeciesGroup === '__other__') {
        return !matchesAnyDefinedGroup(props.SPECIES);
    }
    if (selectedSpeciesGroup === 'all') return true;
    const entries = speciesGroups[selectedSpeciesGroup] || [];
    return matchesGroup(props.SPECIES, entries);
}

function passesConditionFilter(props) {
    if (selectedConditions.length === 0) return true;
    return selectedConditions.some((field) => props[field] === -1);
}

// PLNTDATE may come back as an ISO 8601 string or a raw epoch-ms number
// depending on the service - native JS Date parsing handles either.
// Trees with no recorded plant date always pass (treated as "Unknown"),
// unless the "only known" diagnostic checkbox is enabled.
function passesPlantDateFilter(props) {
    const val = props.PLNTDATE;
    if (val === null || val === undefined || val === '') {
        return !onlyKnownPlantDate;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return !onlyKnownPlantDate;
    return d.getUTCFullYear() <= maxPlantYear;
}

// Trees with no recorded diameter always pass.
function passesDiameterFilter(props) {
    const val = props.DBH;
    if (val === null || val === undefined || val === '') return true;
    return Number(val) <= maxDiameter;
}

function treePassesFilters(props) {
    return passesSpeciesFilter(props)
        && passesConditionFilter(props)
        && passesPlantDateFilter(props)
        && passesDiameterFilter(props);
}

function updateFilters() {
    if (!allTreesData) return; // still loading

    const filteredFeatures = allTreesData.features.filter((f) => treePassesFilters(f.properties));

    const source = map.getSource('o_trees');
    if (source) {
        source.setData({ type: 'FeatureCollection', features: filteredFeatures });
    }

    setStatusText(`Showing ${filteredFeatures.length.toLocaleString()} of ${allTreesData.features.length.toLocaleString()} trees`);
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

diameterSlider.addEventListener('input', (e) => {
    maxDiameter = parseInt(e.target.value);
    diameterValue.textContent = maxDiameter;
    updateFilters();
});

// Diagnostic checkbox: hides trees with no recorded PLNTDATE so you can
// see the slider's effect in isolation.
const plantDateOnlyKnownCheckbox = document.getElementById('plantDateOnlyKnown');
if (plantDateOnlyKnownCheckbox) {
    plantDateOnlyKnownCheckbox.addEventListener('change', (e) => {
        onlyKnownPlantDate = e.target.checked;
        updateFilters();
    });
}

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

// Initialize condition state (filters themselves run once allTreesData loads)
updateSelectedConditions();
