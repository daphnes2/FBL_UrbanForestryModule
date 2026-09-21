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

// Stable ordered list of the 7 defined group keys (insertion order of the
// speciesGroups object above), used to assign each tree a numeric group ID
// (1-7 = defined groups, 8 = Other Species) and to look up its color.
const speciesGroupKeys = Object.keys(speciesGroups);

function computeSpeciesGroupId(speciesValue) {
    for (let i = 0; i < speciesGroupKeys.length; i++) {
        if (matchesGroup(speciesValue, speciesGroups[speciesGroupKeys[i]])) return i + 1;
    }
    return 8; // Other Species - matches none of the 7 defined groups
}

// Colors requested for each group (1-7 = defined groups, 8 = Other Species).
const GROUP_COLORS = {
    1: '#ADD8E6', // light blue
    2: '#FFCC80', // light orange
    3: '#FDD835', // yellow
    4: '#4CAF50', // green
    5: '#F06292', // pink
    6: '#0D47A1', // dark blue
    7: '#E65100', // dark orange
    8: '#8E24AA'  // purple (Other Species)
};

// MapLibre "match" expression built from GROUP_COLORS above, used as the
// circle-color paint for the unclustered "o_trees" layer. Falls back to
// the old neutral green if a tree somehow has no _groupId set.
const GROUP_COLOR_MATCH_EXPR = [
    'match', ['get', '_groupId'],
    1, GROUP_COLORS[1],
    2, GROUP_COLORS[2],
    3, GROUP_COLORS[3],
    4, GROUP_COLORS[4],
    5, GROUP_COLORS[5],
    6, GROUP_COLORS[6],
    7, GROUP_COLORS[7],
    8, GROUP_COLORS[8],
    /* default */ '#647c64'
];

// Cluster bubble radius by tree count (px). Used by the donut markers
// below - same thresholds as before (16 / 22 / 28), size still scales
// with how many trees are in the cluster.
function clusterRadiusForCount(count) {
    if (count >= 200) return 28;
    if (count >= 50) return 22;
    return 16;
}

//===================================================================
// Cluster donut markers
//
// MapLibre can't natively paint a pie/donut chart as a circle-layer
// paint property, so cluster bubbles are instead rendered as custom
// HTML elements (CSS conic-gradient for the slices) positioned with
// maplibregl.Marker. Slice proportions come from the g1..g8 sums
// MapLibre computes automatically via clusterProperties (see source
// definition below) - no extra per-cluster query needed. This mirrors
// the standard Mapbox/MapLibre "HTML cluster" pattern.
//===================================================================
function buildDonutMarkerEl(counts, totalCount, clusterId, sourceGetter) {
    const stops = [];
    let cumulative = 0;
    for (let g = 1; g <= 8; g++) {
        const val = counts[g] || 0;
        if (val === 0 || totalCount === 0) continue;
        const start = (cumulative / totalCount) * 360;
        cumulative += val;
        const end = (cumulative / totalCount) * 360;
        stops.push(`${GROUP_COLORS[g]} ${start}deg ${end}deg`);
    }
    const gradient = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : '#999999';

    const diameter = clusterRadiusForCount(totalCount) * 2;
    const holeDiameter = Math.round(diameter * 0.58);

    const el = document.createElement('div');
    el.className = 'cluster-donut';
    el.style.width = `${diameter}px`;
    el.style.height = `${diameter}px`;
    el.style.borderRadius = '50%';
    el.style.background = gradient;
    el.style.boxShadow = '0 0 0 2px #ffffff, 0 1px 4px rgba(0,0,0,0.25)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';

    const hole = document.createElement('div');
    hole.style.width = `${holeDiameter}px`;
    hole.style.height = `${holeDiameter}px`;
    hole.style.borderRadius = '50%';
    hole.style.background = '#ffffff';
    hole.style.display = 'flex';
    hole.style.alignItems = 'center';
    hole.style.justifyContent = 'center';
    hole.style.fontFamily = "'Open Sans', Arial, Helvetica, sans-serif";
    hole.style.fontSize = `${Math.max(9, Math.round(holeDiameter * 0.34))}px`;
    hole.style.fontWeight = '700';
    hole.style.color = '#333333';
    hole.textContent = totalCount >= 1000 ? `${(totalCount / 1000).toFixed(1)}k` : String(totalCount);

    el.appendChild(hole);

    el.addEventListener('click', () => {
        const source = sourceGetter();
        if (!source) return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({ center: el._lngLat, zoom });
        });
    });

    return el;
}

// clusterId -> maplibregl.Marker currently attached to the map
let clusterMarkersOnScreen = {};
let treesLayerVisible = true;

function updateClusterMarkers() {
    if (!map.getSource('o_trees')) return;

    // If the trees layer is toggled off, just clear every donut marker
    // and skip rebuilding them until it's turned back on.
    if (!treesLayerVisible) {
        for (const id in clusterMarkersOnScreen) clusterMarkersOnScreen[id].remove();
        clusterMarkersOnScreen = {};
        return;
    }

    const features = map.querySourceFeatures('o_trees', { filter: ['has', 'point_count'] });
    const newMarkers = {};

    for (const feature of features) {
        const props = feature.properties;
        const id = props.cluster_id;
        // querySourceFeatures can return the same cluster more than once
        // near tile boundaries - only build/keep one marker per cluster_id.
        if (newMarkers[id]) continue;

        let marker = clusterMarkersOnScreen[id];
        if (!marker) {
            const counts = {};
            for (let g = 1; g <= 8; g++) counts[g] = props[`g${g}`] || 0;
            const coords = feature.geometry.coordinates;
            const el = buildDonutMarkerEl(counts, props.point_count, id, () => map.getSource('o_trees'));
            el._lngLat = coords;
            marker = new maplibregl.Marker({ element: el }).setLngLat(coords);
        }
        newMarkers[id] = marker;
        if (!clusterMarkersOnScreen[id]) marker.addTo(map);
    }

    // Remove markers for clusters that are no longer on screen
    for (const id in clusterMarkersOnScreen) {
        if (!newMarkers[id]) clusterMarkersOnScreen[id].remove();
    }
    clusterMarkersOnScreen = newMarkers;
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
const PAGE_CONCURRENCY = 8; // browsers cap ~6 concurrent connections per host on HTTP/1.1;
                             // push higher only if your network panel shows requests actually
                             // running in parallel rather than queuing.

// Only request the fields actually used by the popup and filters, instead
// of outFields=* (which pulls back every field on the layer on every one
// of the ~300 pages - trimming this noticeably shrinks payload size).
const TREE_OUT_FIELDS = [
    'OBJECTID', 'TREEID', 'ADDSTR', 'WARD', 'OWNERSHIP', 'SPECIES', 'DBH',
    'TRUNCSTRCT', 'STATUS',
    'HSURFACE', 'SSUPPORT', 'TRGUARD', 'GRATE', 'PLANTER', 'STAKED', 'WTUBES'
].join(',');

async function fetchAllTrees(onPageLoaded) {
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

    let loadedCount = 0;
    let failedPages = 0;

    async function fetchPage(offset) {
        const url = `${TREE_QUERY_BASE}?where=1%3D1&outFields=${TREE_OUT_FIELDS}&f=geojson`
            + `&resultRecordCount=${PAGE_SIZE}&resultOffset=${offset}&orderByFields=OBJECTID`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            const feats = data.features || [];
            loadedCount += feats.length;
            // Stream this page's features to the caller immediately instead
            // of waiting for every page to finish, so the map can render
            // progressively.
            if (onPageLoaded) onPageLoaded(feats, loadedCount, total, failedPages);
        } catch (err) {
            failedPages += 1;
            console.warn(`Failed to load tree page at offset ${offset}:`, err);
            if (onPageLoaded) onPageLoaded([], loadedCount, total, failedPages);
        }
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
}

// Holds the complete dataset (grows progressively as pages arrive).
let allTreesData = { type: 'FeatureCollection', features: [] };
let stillLoadingTrees = true;

// Simple on-screen status line (loading progress, then result counts).
function setStatusText(text) {
    const el = document.getElementById('filter-result');
    if (el) el.textContent = text;
}

//===================================================================
// Ottawa Trees Layer (clustered)
//===================================================================
map.on('load', () => {
    mapStyleReady = true;

    // Start with an empty source; real data is streamed in progressively
    // as pagination pages arrive (see fetchAllTrees() call below).
    // clusterProperties asks MapLibre's clustering engine to sum, for
    // every cluster it builds, how many of its leaf points belong to
    // each of the 8 species groups. This comes for free as part of
    // clustering (no extra query per cluster) and is what lets the
    // donut markers below draw accurate pie slices without needing to
    // fetch each cluster's individual trees.
    const clusterProperties = {};
    for (let g = 1; g <= 8; g++) {
        clusterProperties[`g${g}`] = ['+', ['case', ['==', ['get', '_groupId'], g], 1, 0]];
    }

    map.addSource('o_trees', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        clusterProperties: clusterProperties
    });

    // NOTE: cluster bubbles are NOT a native circle layer here - MapLibre
    // can't natively paint pie/donut slices. Instead they're rendered as
    // custom HTML/CSS donut markers (see "Cluster donut markers" section
    // above), positioned using the same underlying cluster geometry.
    // Rebuilding on every 'render' event mirrors the standard Mapbox/
    // MapLibre HTML-cluster pattern - querySourceFeatures + diffing by
    // cluster_id keeps this cheap since existing marker elements are
    // reused rather than recreated when nothing has changed for them.
    map.on('render', updateClusterMarkers);

    // Individual (unclustered) trees - kept as layer id "o_trees"
    // so the existing click/popup handlers below don't need to change.
    // Using a circle layer instead of a symbol/icon layer is
    // cheaper to render, which matters once there are tens of
    // thousands of unclustered points visible at high zoom. Color is
    // driven by each tree's precomputed _groupId (see GROUP_COLOR_MATCH_EXPR).
    map.addLayer({
        id: 'o_trees',
        type: 'circle',
        source: 'o_trees',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': 5,
            'circle-color': GROUP_COLOR_MATCH_EXPR,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });

    // Render-throttling: as pages stream in we don't want to call
    // setData() up to ~300 times (once per page) - that has its own
    // overhead. Instead we batch pending pages into allTreesData and
    // schedule at most one render per animation frame.
    let renderScheduled = false;
    function scheduleRender() {
        if (renderScheduled) return;
        renderScheduled = true;
        requestAnimationFrame(() => {
            renderScheduled = false;
            updateFilters();
        });
    }

    setStatusText('Loading trees... 0 / ?');
    fetchAllTrees((newFeatures, loaded, total, failedPages) => {
        // Precompute each tree's species-group ID once, on arrival, so the
        // color paint expression can do a cheap numeric lookup instead of
        // re-running the word-matching logic every render/filter change.
        newFeatures.forEach((f) => {
            f.properties._groupId = computeSpeciesGroupId(f.properties.SPECIES);
        });
        allTreesData.features.push(...newFeatures);
        const failNote = failedPages > 0 ? ` (${failedPages} pages failed)` : '';
        setStatusText(`Loading trees... ${loaded} / ${total}${failNote}`);
        scheduleRender();
    })
        .then(() => {
            stillLoadingTrees = false;
            updateFilters(); // final render to guarantee the last page is reflected, now shows "Showing X of Y"
        })
        .catch((err) => {
            console.error('Failed to load tree inventory:', err);
            setStatusText('Error loading tree data - see browser console for details.');
        });
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

    const groupId = ottawatrees.properties._groupId;
    const groupLabel = groupId === 8 ? 'Other Species' : (speciesGroupKeys[groupId - 1] || 'Unknown');

    new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
            <h3>TREE ID: ${ottawatrees.properties.TREEID}</h3>
            <p><b>Address:</b> ${ottawatrees.properties.ADDSTR}</p>
            <p><b>Ottawa Ward:</b> ${ottawatrees.properties.WARD}</p>
            <p><b>Ownership:</b> ${ottawatrees.properties.OWNERSHIP}</p>
            <p><b>Species:</b> ${ottawatrees.properties.SPECIES}</p>
            <p><b>Group:</b> ${groupLabel}</p>
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
// Layer Management: Wards + Tree Equity Score (lazy-loaded, toggleable)
//===================================================================
function setLayerStatus(text) {
    const el = document.getElementById('layerStatus');
    if (el) el.textContent = text;
}

// Generic popup builder for layers whose exact field schema we haven't
// verified against the live service - lists every non-empty property
// instead of guessing specific field names that might not exist.
function buildGenericPopupHtml(title, properties) {
    let rows = '';
    for (const [k, v] of Object.entries(properties)) {
        if (v === null || v === undefined || v === '' || k.startsWith('_')) continue;
        rows += `<p><b>${k}:</b> ${v}</p>`;
    }
    return `<h3>${title}</h3>${rows}`;
}

// map.addLayer/addSource require the style to be loaded. The checkboxes
// exist in the DOM immediately, so a very fast click could in theory
// happen before that - this small gate makes sure we always wait for it
// rather than assuming it's already true.
let mapStyleReady = false;
function whenMapReady(fn) {
    if (mapStyleReady) fn();
    else map.once('load', fn);
}

// --- Ottawa Wards ---------------------------------------------------
// Small dataset (~24 wards) - a single request is enough, no pagination
// needed.
const WARDS_URL = 'https://services.arcgis.com/G6F8XLCl5KtAlZ2G/arcgis/rest/services/Wards_2022_2026/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
let wardsLoaded = false;

async function fetchWardsData() {
    const resp = await fetch(WARDS_URL);
    const data = await resp.json();
    if (data.exceededTransferLimit) {
        console.warn('Wards layer may be incomplete - server indicated exceededTransferLimit.');
    }
    return data;
}

function addWardsLayers(data) {
    map.addSource('wards', { type: 'geojson', data });
    map.addLayer({
        id: 'wards-fill',
        type: 'fill',
        source: 'wards',
        paint: { 'fill-color': '#3388ff', 'fill-opacity': 0.05 }
    });
    map.addLayer({
        id: 'wards-outline',
        type: 'line',
        source: 'wards',
        paint: { 'line-color': '#1565C0', 'line-width': 1.5 }
    });
    map.on('click', 'wards-fill', (ev) => {
        new maplibregl.Popup()
            .setLngLat(ev.lngLat)
            .setHTML(buildGenericPopupHtml('Ward', ev.features[0].properties))
            .addTo(map);
    });
    map.on('mouseenter', 'wards-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'wards-fill', () => { map.getCanvas().style.cursor = ''; });
}

const layerWardsToggle = document.getElementById('layerWardsToggle');
layerWardsToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    whenMapReady(async () => {
        if (checked) {
            if (!wardsLoaded) {
                setLayerStatus('Loading Ottawa Wards...');
                try {
                    const data = await fetchWardsData();
                    addWardsLayers(data);
                    wardsLoaded = true;
                    setLayerStatus('');
                } catch (err) {
                    console.error('Failed to load Wards layer:', err);
                    setLayerStatus('Error loading Wards layer - see console.');
                    layerWardsToggle.checked = false;
                    return;
                }
            }
            map.setLayoutProperty('wards-fill', 'visibility', 'visible');
            map.setLayoutProperty('wards-outline', 'visibility', 'visible');
        } else if (wardsLoaded) {
            map.setLayoutProperty('wards-fill', 'visibility', 'none');
            map.setLayoutProperty('wards-outline', 'visibility', 'none');
        }
    });
});

// --- Tree Equity Score 2025 (Downtown Core, Inner Urban, Outer Urban,
//     Suburban) - one checkbox controls all four together, not
//     individually, per the requirement. -----------------------------
const TREE_EQUITY_URLS = {
    'Suburban': 'https://services.arcgis.com/G6F8XLCl5KtAlZ2G/arcgis/rest/services/Tree_Equity_Score_2025___Suburban/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson',
    'Inner Urban': 'https://services.arcgis.com/G6F8XLCl5KtAlZ2G/arcgis/rest/services/Tree_Equity_Score_2025___Inner_Urban/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson',
    'Downtown Core': 'https://services.arcgis.com/G6F8XLCl5KtAlZ2G/arcgis/rest/services/Tree_Equity_Score_2025_Downtown_Core/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson',
    'Outer Urban': 'https://services.arcgis.com/G6F8XLCl5KtAlZ2G/arcgis/rest/services/Tree_Equity_Score_2025___Outer_Urban/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson'
};
let equityLoaded = false;

async function fetchTreeEquityData() {
    const entries = Object.entries(TREE_EQUITY_URLS);
    const results = await Promise.all(entries.map(async ([areaType, url]) => {
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            if (data.exceededTransferLimit) {
                console.warn(`Tree Equity (${areaType}) may be incomplete - server indicated exceededTransferLimit.`);
            }
            return (data.features || []).map((f) => {
                f.properties = { ...f.properties, _areaType: areaType };
                return f;
            });
        } catch (err) {
            console.warn(`Failed to load Tree Equity (${areaType}):`, err);
            return [];
        }
    }));
    return { type: 'FeatureCollection', features: results.flat() };
}

function addEquityLayers(data) {
    map.addSource('tree_equity', { type: 'geojson', data });
    map.addLayer({
        id: 'equity-fill',
        type: 'fill',
        source: 'tree_equity',
        paint: { 'fill-color': '#ff7043', 'fill-opacity': 0.35 }
    });
    map.addLayer({
        id: 'equity-outline',
        type: 'line',
        source: 'tree_equity',
        paint: { 'line-color': '#bf360c', 'line-width': 1 }
    });
    map.on('click', 'equity-fill', (ev) => {
        const areaType = ev.features[0].properties._areaType || '';
        new maplibregl.Popup()
            .setLngLat(ev.lngLat)
            .setHTML(buildGenericPopupHtml(`Tree Equity Score - ${areaType}`, ev.features[0].properties))
            .addTo(map);
    });
    map.on('mouseenter', 'equity-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'equity-fill', () => { map.getCanvas().style.cursor = ''; });
}

const layerEquityToggle = document.getElementById('layerEquityToggle');
layerEquityToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    whenMapReady(async () => {
        if (checked) {
            if (!equityLoaded) {
                setLayerStatus('Loading Tree Equity Score layers...');
                try {
                    const data = await fetchTreeEquityData();
                    addEquityLayers(data);
                    equityLoaded = true;
                    setLayerStatus('');
                } catch (err) {
                    console.error('Failed to load Tree Equity Score layers:', err);
                    setLayerStatus('Error loading Tree Equity Score layers - see console.');
                    layerEquityToggle.checked = false;
                    return;
                }
            }
            map.setLayoutProperty('equity-fill', 'visibility', 'visible');
            map.setLayoutProperty('equity-outline', 'visibility', 'visible');
        } else if (equityLoaded) {
            map.setLayoutProperty('equity-fill', 'visibility', 'none');
            map.setLayoutProperty('equity-outline', 'visibility', 'none');
        }
    });
});

// --- Ottawa Street Trees on/off (the existing clustered layer) ------
const layerTreesToggle = document.getElementById('layerTreesToggle');
layerTreesToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    whenMapReady(() => {
        // Individual unclustered points are still a real layer.
        if (map.getLayer('o_trees')) {
            map.setLayoutProperty('o_trees', 'visibility', checked ? 'visible' : 'none');
        }
        // Cluster donut bubbles are custom Markers, not a layer - toggle
        // via the flag updateClusterMarkers() checks on every render, and
        // trigger one immediate rebuild so the change is instant rather
        // than waiting for the next pan/zoom.
        treesLayerVisible = checked;
        updateClusterMarkers();
    });
});

//===================================================================
// Tab bar (Filters / Legend / Layers)
//===================================================================
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        tabPanels.forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

//===================================================================
// Legend tab content (built from the same GROUP_COLORS / speciesGroupKeys
// / buildDonutMarkerEl used elsewhere, so it can't drift out of sync
// with what's actually drawn on the map)
//===================================================================
const legendSpeciesGroupsEl = document.getElementById('legend-species-groups');
speciesGroupKeys.forEach((key, i) => {
    const row = document.createElement('div');
    row.className = 'legend-row';
    row.innerHTML = `<span class="legend-swatch round" style="background:${GROUP_COLORS[i + 1]};"></span> ${key}`;
    legendSpeciesGroupsEl.appendChild(row);
});
const otherRow = document.createElement('div');
otherRow.className = 'legend-row';
otherRow.innerHTML = `<span class="legend-swatch round" style="background:${GROUP_COLORS[8]};"></span> Other Species`;
legendSpeciesGroupsEl.appendChild(otherRow);

const legendClusterEl = document.getElementById('legend-cluster-density');

// Illustrative donut using a made-up mixed distribution, just to show
// what the real cluster markers on the map look like and how to read
// them - not tied to any real cluster.
const exampleCounts = { 1: 5, 2: 3, 3: 8, 4: 12, 5: 2, 6: 20, 7: 6, 8: 4 };
const exampleTotal = Object.values(exampleCounts).reduce((a, b) => a + b, 0);
const exampleDonut = buildDonutMarkerEl(exampleCounts, exampleTotal, null, () => null);
exampleDonut.style.cursor = 'default';
exampleDonut.style.pointerEvents = 'none';
exampleDonut.style.margin = '4px 0 10px';
legendClusterEl.appendChild(exampleDonut);

const clusterExplainer = document.createElement('div');
clusterExplainer.style.fontSize = '0.8rem';
clusterExplainer.style.color = '#333';
clusterExplainer.innerHTML = `
    <p style="margin:4px 0;">Each wedge is one Species Group - same colors as above.</p>
    <p style="margin:4px 0;">The number in the center is the total tree count in that cluster.</p>
    <p style="margin:4px 0;">Bubble size also grows with tree count (small: under 50, medium: 50–199, large: 200+).</p>
`;
legendClusterEl.appendChild(clusterExplainer);

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
let selectedDiameterClass = 'all'; // 'all' or a key from DIAMETER_CLASSES below

//===================================================================
// Diameter classes: equal-interval buckets instead of a single "up to"
// threshold. DIAMETER_CLASS_COUNT/DIAMETER_TYPICAL_MAX define 5 equal
// 30cm-wide bands from 0-150cm; an extra open-ended "151+ cm" band is
// appended so unusually large trees still fall into a bucket instead of
// being silently excluded. Adjust DIAMETER_CLASS_COUNT/DIAMETER_TYPICAL_MAX
// if you'd rather have more/narrower bands.
//===================================================================
const DIAMETER_CLASS_COUNT = 5;
const DIAMETER_TYPICAL_MAX = 150; // cm
const DIAMETER_CLASSES = (() => {
    const width = DIAMETER_TYPICAL_MAX / DIAMETER_CLASS_COUNT; // 30cm per band
    const classes = [];
    for (let i = 0; i < DIAMETER_CLASS_COUNT; i++) {
        const min = Math.round(i * width) + (i === 0 ? 0 : 1);
        const max = Math.round((i + 1) * width);
        classes.push({ key: `c${i}`, label: `${min}–${max} cm`, min, max: max === undefined ? Infinity : max });
    }
    // Open-ended overflow band for anything above the typical max
    classes.push({ key: 'overflow', label: `${DIAMETER_TYPICAL_MAX + 1}+ cm`, min: DIAMETER_TYPICAL_MAX + 1, max: Infinity });
    return classes;
})();

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

// Trees with no recorded diameter always pass (treated as "Unknown"),
// regardless of which class is selected.
function passesDiameterFilter(props) {
    if (selectedDiameterClass === 'all') return true;
    const val = props.DBH;
    if (val === null || val === undefined || val === '') return true;
    const cls = DIAMETER_CLASSES.find((c) => c.key === selectedDiameterClass);
    if (!cls) return true;
    const num = Number(val);
    return num >= cls.min && num <= cls.max;
}

function treePassesFilters(props) {
    return passesSpeciesFilter(props)
        && passesConditionFilter(props)
        && passesDiameterFilter(props);
}

function updateFilters() {
    const filteredFeatures = allTreesData.features.filter((f) => treePassesFilters(f.properties));

    const source = map.getSource('o_trees');
    if (source) {
        source.setData({ type: 'FeatureCollection', features: filteredFeatures });
    }

    // While pages are still streaming in, the loading-progress callback
    // owns the status text - don't fight it with a "Showing X of Y" line
    // that would just be stale a moment later.
    if (!stillLoadingTrees) {
        setStatusText(`Showing ${filteredFeatures.length.toLocaleString()} of ${allTreesData.features.length.toLocaleString()} trees`);
    }
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
// Diameter class dropdown
//===================================================================
const diameterClassSelect = document.getElementById('diameterClassSelect');
DIAMETER_CLASSES.forEach((cls) => {
    const opt = document.createElement('option');
    opt.value = cls.key;
    opt.textContent = cls.label;
    diameterClassSelect.appendChild(opt);
});

diameterClassSelect.addEventListener('change', (e) => {
    selectedDiameterClass = e.target.value;
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

    // Reset diameter class
    selectedDiameterClass = 'all';
    diameterClassSelect.value = 'all';

    updateFilters();
});

// Initialize condition state (filters themselves run once allTreesData loads)
updateSelectedConditions();
