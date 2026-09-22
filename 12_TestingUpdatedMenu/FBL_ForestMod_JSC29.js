const map = new maplibregl.Map({
    container: 'map',
    style:
        'https://api.maptiler.com/maps/470d6019-657f-4f7d-a018-6ec6ae0d0093/style.json?key=4xF6FrxAyNgBUQ4n4bUN',
    center: [-75.88367397233924, 45.26730028180128],
    zoom: 9
  });

//===================================================================
// ECOLOGICAL GROUPS + BUILDING GROUPS
//
// These are two SEPARATE classifications of the same 35 species,
// confirmed against "ECOLOGICAL - BUILDING GROUPS.pdf" (species lists
// for both, including each ecological group's abbreviation). Earlier
// versions of this app used the ecological grouping's species
// composition but labeled it with the building groups' names (e.g.
// "Light, soft, stable conifers" is actually a BUILDING group name,
// mistakenly applied to what was really ECOLOGICAL group 1, "Boreal
// Conifers") - that mislabeling is fixed here by giving each
// classification its own object, its own dropdown, and its own
// correct names. Only ecological groups have a short abbreviation
// (e.g. "CON-Bor") in the source PDF; dropdown labels for both use the
// same "Group N: Group Name" format per your request.
//
// Ottawa's Tree Inventory service (Forestry/MapServer/0) stores SPECIES
// as a coded value formatted "<Genus common name> <Descriptor>", e.g.
// "Fir Balsam" = Abies balsamea, "Fir White" = Abies concolor. That
// word order is confirmed from those two examples; the codes below for
// your species list are inferred from standard common names using that
// same pattern - they have NOT been confirmed against the live data.
//===================================================================
const ecologicalGroups = {
    "Group 1: Boreal Conifers": [
        { latin: "Abies balsamea",      words: ["fir", "balsam"] },
        { latin: "Tsuga canadensis",    words: ["hemlock"] },
        { latin: "Pinus strobus",       words: ["pine", "white"] },
        { latin: "Thuja occidentalis",  words: ["cedar"] },
        { latin: "Picea abies",         words: ["spruce", "norway"] },
        { latin: "Picea glauca",        words: ["spruce", "white"] },
        { latin: "Picea rubens",        words: ["spruce", "red"] },
        { latin: "Picea mariana",       words: ["spruce", "black"] }
    ],
    "Group 2: Pine Conifers": [
        { latin: "Pinus resinosa", words: ["pine", "red"] },
        { latin: "Pinus rigida",   words: ["pine", "pitch"] },
        { latin: "Pinus taeda",    words: ["pine", "loblolly"] }
    ],
    "Group 3: Northern Deciduous, Early Successional": [
        { latin: "Larix laricina",        words: ["tamarack"] },
        { latin: "Populus grandidentata",  words: ["aspen", "bigtooth"] },
        { latin: "Populus tremuloides",    words: ["aspen", "trembling"] }
    ],
    "Group 4: Northern Hardwood, Early Successional": [
        { latin: "Prunus serotina",       words: ["cherry", "black"] },
        { latin: "Betula populifolia",    words: ["birch", "gray"] },
        { latin: "Betula papyrifera",     words: ["birch", "paper"] },
        { latin: "Betula alleghaniensis", words: ["birch", "yellow"] },
        { latin: "Betula lenta",          words: ["birch", "sweet"] }
    ],
    "Group 5: Central Hardwood, Mid Successional": [
        { latin: "Juglans nigra",         words: ["walnut", "black"] },
        { latin: "Fraxinus americana",    words: ["ash", "white"] },
        { latin: "Liriodendron tulipifera", words: ["tulip"] },
        { latin: "Tilia americana",       words: ["basswood"] },
        { latin: "Carya cordiformis",     words: ["hickory", "bitternut"] }
    ],
    "Group 6: Northern Hardwood, Mid Successional": [
        { latin: "Acer rubrum",       words: ["maple", "red"] },
        { latin: "Ulmus americana",   words: ["elm", "american"] },
        { latin: "Acer saccharinum",  words: ["maple", "silver"] },
        { latin: "Acer saccharum",    words: ["maple", "sugar"] },
        { latin: "Fagus grandifolia", words: ["beech", "american"] }
    ],
    "Group 7: Central Hardwood, Drought-Tolerant": [
        { latin: "Quercus macrocarpa", words: ["oak", "bur"] },
        { latin: "Quercus alba",       words: ["oak", "white"] },
        { latin: "Quercus coccinea",   words: ["oak", "scarlet"] },
        { latin: "Quercus rubra",      words: ["oak", "red"] },
        { latin: "Quercus velutina",   words: ["oak", "black"] },
        { latin: "Carya glabra",       words: ["hickory", "pignut"] }
    ]
};

// Same 35 species, regrouped by BUILDING/construction-material
// characteristics rather than ecology. Note the composition genuinely
// differs from ecologicalGroups above - e.g. the 4 spruces move from
// Ecological Group 1 (Boreal Conifers) into Building Group 2 (Medium-
// density Spruces and Pines) alongside the 3 pines, which are a
// separate ecological group (Pine Conifers) but the same building
// group. This is a real, independent classification, not a renamed
// copy of the ecological one - reusing each species' {latin, words}
// entry from ecologicalGroups above (already confirmed word-matching
// pairs) but bucketed differently.
const buildingGroups = {
    "Group 1: Light, Soft, Stable Conifers": [
        { latin: "Abies balsamea",     words: ["fir", "balsam"] },
        { latin: "Tsuga canadensis",   words: ["hemlock"] },
        { latin: "Pinus strobus",      words: ["pine", "white"] },
        { latin: "Thuja occidentalis", words: ["cedar"] }
    ],
    "Group 2: Medium-density Spruces and Pines": [
        { latin: "Picea abies",   words: ["spruce", "norway"] },
        { latin: "Picea glauca",  words: ["spruce", "white"] },
        { latin: "Picea rubens",  words: ["spruce", "red"] },
        { latin: "Picea mariana", words: ["spruce", "black"] },
        { latin: "Pinus resinosa", words: ["pine", "red"] },
        { latin: "Pinus rigida",   words: ["pine", "pitch"] },
        { latin: "Pinus taeda",    words: ["pine", "loblolly"] }
    ],
    "Group 3: Fast-growing Hardwoods": [
        { latin: "Larix laricina",     words: ["tamarack"] },
        { latin: "Prunus serotina",    words: ["cherry", "black"] },
        { latin: "Betula populifolia", words: ["birch", "gray"] }
    ],
    "Group 4: Versatile Mid-Weight Woods": [
        { latin: "Betula papyrifera",  words: ["birch", "paper"] },
        { latin: "Juglans nigra",      words: ["walnut", "black"] },
        { latin: "Fraxinus americana", words: ["ash", "white"] },
        { latin: "Acer rubrum",        words: ["maple", "red"] },
        { latin: "Ulmus americana",    words: ["elm", "american"] }
    ],
    "Group 5: Soft, Fast-growing Hardwoods": [
        { latin: "Quercus macrocarpa",      words: ["oak", "bur"] },
        { latin: "Populus grandidentata",   words: ["aspen", "bigtooth"] },
        { latin: "Populus tremuloides",     words: ["aspen", "trembling"] },
        { latin: "Liriodendron tulipifera", words: ["tulip"] },
        { latin: "Tilia americana",         words: ["basswood"] }
    ],
    "Group 6: Strong, Heavy, Hardwoods": [
        { latin: "Acer saccharinum",  words: ["maple", "silver"] },
        { latin: "Acer saccharum",    words: ["maple", "sugar"] },
        { latin: "Fagus grandifolia", words: ["beech", "american"] },
        { latin: "Quercus alba",      words: ["oak", "white"] },
        { latin: "Quercus coccinea",  words: ["oak", "scarlet"] },
        { latin: "Quercus rubra",     words: ["oak", "red"] },
        { latin: "Quercus velutina",  words: ["oak", "black"] }
    ],
    "Group 7: Dense Hardwoods with Toughness": [
        { latin: "Betula alleghaniensis", words: ["birch", "yellow"] },
        { latin: "Betula lenta",          words: ["birch", "sweet"] },
        { latin: "Carya cordiformis",     words: ["hickory", "bitternut"] },
        { latin: "Carya glabra",          words: ["hickory", "pignut"] }
    ]
};

// Populate a group-select dropdown from a groups object (ecologicalGroups
// or buildingGroups), plus a catch-all "Other Species" option for
// anything that matches none of the seven defined groups. Shared by
// both dropdowns below so their population logic can't drift apart.
function populateGroupSelect(selectEl, groupsObj) {
    Object.keys(groupsObj).forEach((groupLabel) => {
        const opt = document.createElement('option');
        opt.value = groupLabel;
        opt.textContent = groupLabel;
        selectEl.appendChild(opt);
    });
    const otherOpt = document.createElement('option');
    otherOpt.value = '__other__';
    otherOpt.textContent = 'Other Species';
    selectEl.appendChild(otherOpt);
}

const ecoGroupSelect = document.getElementById('operator-eco-group');
populateGroupSelect(ecoGroupSelect, ecologicalGroups);

const buildingGroupSelect = document.getElementById('operator-building-group');
populateGroupSelect(buildingGroupSelect, buildingGroups);

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
// Stable ordered list of the 7 defined group keys (insertion order of the
// ecologicalGroups object above), used to assign each tree a numeric group ID
// (1-7 = defined groups, 8 = Other Species) and to look up its color.
const ecoGroupKeys = Object.keys(ecologicalGroups);

function computeEcoGroupId(speciesValue) {
    for (let i = 0; i < ecoGroupKeys.length; i++) {
        if (matchesGroup(speciesValue, ecologicalGroups[ecoGroupKeys[i]])) return i + 1;
    }
    return 8; // Other Species - matches none of the 7 defined groups
}

//===================================================================
// BOTANICAL-NAME (Latin) matching - used for Toronto trees
//
// Toronto's street tree data gives an unambiguous BOTANICAL_NAME
// ("Quercus bicolor"), but its human-readable COMMON_NAME uses a
// "Genus, descriptor" comma format ("Oak, swamp white") that is
// structurally different from Ottawa's "Genus Descriptor" format
// ("Oak White") the word-matching above (speciesWordsPresent /
// matchesGroup) was built around. Reusing that English word-matching
// against Toronto's COMMON_NAME would silently misclassify trees -
// e.g. "Oak, swamp white" contains both "oak" and "white", so it
// would incorrectly match Group 7's White Oak entry even though swamp
// white oak (Quercus bicolor) is a different species from white oak
// (Quercus alba).
//
// The fix: for any tree that HAS a botanical name, match ONLY against
// each group entry's own `latin` field (already present on every
// ecologicalGroups/UNG_TAPER_COEFFICIENTS entry) - genus+species,
// case-insensitive, ignoring anything after the second word (variety/
// cultivar qualifiers). If a botanical name is present but doesn't
// match any of the 7 defined groups, the tree is Other Species - it
// does NOT fall back to the English word list, since that fallback is
// exactly the path that caused the collision above. English word-
// matching is only used when a tree has no botanical name at all
// (Ottawa's normal case, since Ottawa's SPECIES field has no Latin
// name equivalent).
//===================================================================
function normalizeLatinBinomial(name) {
    if (!name) return '';
    const tokens = String(name).trim().toLowerCase().replace(/[.,]/g, '').split(/\s+/).filter(Boolean);
    return tokens.slice(0, 2).join(' '); // genus + species only, drop var./cultivar qualifiers
}
function matchesGroupByLatin(normalizedBotanicalName, groupEntries) {
    if (!normalizedBotanicalName) return false;
    return groupEntries.some((entry) => normalizeLatinBinomial(entry.latin) === normalizedBotanicalName);
}

// Unified species-group lookup: prefers a tree's botanical name
// (props._botanicalName, set for Toronto trees) when present, and
// only falls back to the English word-matching (computeEcoGroupId
// against props.SPECIES) when no botanical name exists at all.
function computeEcoGroupIdForTree(props) {
    if (props._botanicalName) {
        const norm = normalizeLatinBinomial(props._botanicalName);
        for (let i = 0; i < ecoGroupKeys.length; i++) {
            if (matchesGroupByLatin(norm, ecologicalGroups[ecoGroupKeys[i]])) return i + 1;
        }
        return 8; // botanical name present but matches none of the 7 groups - Other Species
    }
    return computeEcoGroupId(props.SPECIES);
}

// Same botanical-first / word-matching-fallback pattern as
// computeEcoGroupId(ForTree) above, applied to the independent
// Building Group classification.
const buildingGroupKeys = Object.keys(buildingGroups);

function computeBuildingGroupId(speciesValue) {
    for (let i = 0; i < buildingGroupKeys.length; i++) {
        if (matchesGroup(speciesValue, buildingGroups[buildingGroupKeys[i]])) return i + 1;
    }
    return 8; // Other Species
}

function computeBuildingGroupIdForTree(props) {
    if (props._botanicalName) {
        const norm = normalizeLatinBinomial(props._botanicalName);
        for (let i = 0; i < buildingGroupKeys.length; i++) {
            if (matchesGroupByLatin(norm, buildingGroups[buildingGroupKeys[i]])) return i + 1;
        }
        return 8;
    }
    return computeBuildingGroupId(props.SPECIES);
}

// Colors requested for each group (1-7 = defined groups, 8 = Other Species).
const ECO_GROUP_COLORS = {
    1: '#ADD8E6', // light blue
    2: '#ffa318', // light orange
    3: '#FDD835', // yellow
    4: '#4CAF50', // green
    5: '#F06292', // pink
    6: '#0D47A1', // dark blue
    7: '#E65100', // dark orange
    8: '#8E24AA'  // purple (Other Species)
};

// MapLibre "match" expression built from ECO_GROUP_COLORS above, used as the
// circle-color paint for the unclustered "o_trees" layer. Falls back to
// the old neutral green if a tree somehow has no _ecoGroupId set.
const ECO_GROUP_COLOR_MATCH_EXPR = [
    'match', ['get', '_ecoGroupId'],
    1, ECO_GROUP_COLORS[1],
    2, ECO_GROUP_COLORS[2],
    3, ECO_GROUP_COLORS[3],
    4, ECO_GROUP_COLORS[4],
    5, ECO_GROUP_COLORS[5],
    6, ECO_GROUP_COLORS[6],
    7, ECO_GROUP_COLORS[7],
    8, ECO_GROUP_COLORS[8],
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
        stops.push(`${ECO_GROUP_COLORS[g]} ${start}deg ${end}deg`);
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

//===================================================================
// PAGINATION: City of Toronto street tree data (CKAN DataStore)
//
// Toronto's Open Data Portal is a CKAN instance, not ArcGIS - a
// different API shape entirely. The live dataset (688,335 records at
// last check, resource_id confirmed via a direct datastore_search
// query) is paged the same way conceptually (limit/offset) but via
// CKAN's datastore_search action instead of ArcGIS's resultOffset/
// resultRecordCount query params. Confirmed field list: OBJECTID,
// STRUCTID, ADDRESS, STREETNAME, CROSSSTREET1, CROSSSTREET2, SUFFIX,
// UNIT_NUMBER, TREE_POSITION_NUMBER, SITE, WARD, BOTANICAL_NAME,
// COMMON_NAME, DBH_TRUNK, geometry (a JSON-ENCODED STRING, not a
// native object - must be JSON.parse()'d per record, see
// normalizeTorontoRecord below).
//===================================================================
const TORONTO_ACTION_BASE = 'https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search';
const TORONTO_RESOURCE_ID = '3dafa392-c6ab-4f37-9bf9-21ddf7308eaf';
const TORONTO_PAGE_SIZE = 1000;
const TORONTO_PAGE_CONCURRENCY = 6;

// CKAN's Action API (all GET endpoints, including datastore_search)
// supports JSONP via a `callback=` query parameter - a long-standing
// CKAN convention that predates CORS and exists specifically so
// portals that don't send Access-Control-Allow-Origin headers can
// still be queried from browser JS. Used below as an automatic
// fallback when a direct fetch() fails for what looks like a
// CORS/network reason (a bare "TypeError: Failed to fetch" with no
// HTTP status, which is exactly what a browser reports for a CORS
// rejection - a real server error like 404/500 instead surfaces as a
// resolved response with a non-ok status, which JSONP can't help with
// either, so that case is NOT retried this way).
function fetchTorontoJsonp(url) {
    return new Promise((resolve, reject) => {
        const callbackName = `_torontoCkanCb${Date.now()}${Math.floor(Math.random() * 100000)}`;
        const script = document.createElement('script');
        let settled = false;
        const cleanup = () => {
            delete window[callbackName];
            script.remove();
            clearTimeout(timeoutId);
        };
        window[callbackName] = (data) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(data);
        };
        script.onerror = () => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error('JSONP fallback request also failed to load.'));
        };
        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error('JSONP fallback request timed out.'));
        }, 20000);
        script.src = `${url}&callback=${callbackName}`;
        document.head.appendChild(script);
    });
}

// Tries a direct fetch() first (fast path, works whenever the server
// sends CORS headers); if that throws with no HTTP response at all
// (the browser's signature for a CORS or network-level rejection),
// falls back to the JSONP technique above instead of failing outright.
// Throws a specific, descriptive error either way so the actual cause
// ends up in the on-screen status text - not just the console - the
// next time this fails.
async function torontoFetchJson(url) {
    let resp;
    try {
        resp = await fetch(url);
    } catch (networkErr) {
        // fetch() itself threw - no HTTP response was ever received.
        // In a browser this is what a CORS rejection looks like (also
        // covers genuine offline/DNS failures).
        try {
            return await fetchTorontoJsonp(url);
        } catch (jsonpErr) {
            throw new Error(`Direct request blocked (likely CORS: "${networkErr.message}") and JSONP fallback also failed ("${jsonpErr.message}").`);
        }
    }
    if (!resp.ok) {
        throw new Error(`Toronto CKAN API responded with HTTP ${resp.status} ${resp.statusText}.`);
    }
    return resp.json();
}

async function fetchAllTorontoTrees(onPageLoaded) {
    // 1. First page also reports the total record count (result.total),
    // so no separate count-only request is needed the way Ottawa's
    // ArcGIS service requires.
    const firstUrl = `${TORONTO_ACTION_BASE}?resource_id=${TORONTO_RESOURCE_ID}&limit=${TORONTO_PAGE_SIZE}&offset=0`;
    const firstData = await torontoFetchJson(firstUrl);
    if (!firstData.success || !firstData.result) {
        throw new Error('Toronto CKAN datastore_search request returned an unsuccessful response.');
    }
    const total = firstData.result.total || 0;
    let loadedCount = firstData.result.records.length;
    let failedPages = 0;
    if (onPageLoaded) onPageLoaded(firstData.result.records, loadedCount, total, failedPages);

    if (loadedCount >= total) return;

    // 2. Remaining pages, same limited-concurrency worker-pool pattern
    // as fetchAllTrees() above.
    const numPages = Math.ceil(total / TORONTO_PAGE_SIZE);
    const offsets = [];
    for (let i = 1; i < numPages; i++) offsets.push(i * TORONTO_PAGE_SIZE);

    async function fetchPage(offset) {
        const url = `${TORONTO_ACTION_BASE}?resource_id=${TORONTO_RESOURCE_ID}&limit=${TORONTO_PAGE_SIZE}&offset=${offset}`;
        try {
            const data = await torontoFetchJson(url);
            const recs = (data.success && data.result && data.result.records) || [];
            loadedCount += recs.length;
            if (onPageLoaded) onPageLoaded(recs, loadedCount, total, failedPages);
        } catch (err) {
            failedPages += 1;
            console.warn(`Failed to load Toronto tree page at offset ${offset}:`, err);
            if (onPageLoaded) onPageLoaded([], loadedCount, total, failedPages);
        }
    }

    let nextIndex = 0;
    async function worker() {
        while (nextIndex < offsets.length) {
            const myOffset = offsets[nextIndex];
            nextIndex += 1;
            await fetchPage(myOffset);
        }
    }
    const workers = Array.from({ length: TORONTO_PAGE_CONCURRENCY }, () => worker());
    await Promise.all(workers);

    if (failedPages > 0) {
        console.warn(`${failedPages} of ${numPages - 1} Toronto pages failed to load - dataset may be incomplete.`);
    }
}

// Converts one raw CKAN datastore record into a GeoJSON Feature shaped
// to match what the rest of this app expects (same property names used
// by the Ottawa popup/filters/carbon report), so downstream code mostly
// doesn't need to know which city a tree came from. Fields with no
// Toronto equivalent (OWNERSHIP, TRUNCSTRCT, STATUS, and all 7 planting
// condition flags) are set to null rather than guessed - see
// passesConditionFilter() below for what that implies for filtering.
function normalizeTorontoRecord(rec) {
    let coords = null;
    try {
        const geom = typeof rec.geometry === 'string' ? JSON.parse(rec.geometry) : rec.geometry;
        if (geom && Array.isArray(geom.coordinates)) coords = geom.coordinates;
    } catch (err) {
        // Malformed/unparseable geometry - skip this record (return null
        // below) rather than plotting it at a wrong or fabricated location.
    }
    if (!coords) return null;

    const streetAddress = [rec.ADDRESS, rec.STREETNAME].filter((v) => v !== null && v !== undefined && v !== '').join(' ').trim() || 'Unknown';

    return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coords },
        properties: {
            _city: 'toronto',
            TREEID: rec.STRUCTID || rec.OBJECTID,
            ADDSTR: streetAddress,
            WARD: (rec.WARD !== undefined && rec.WARD !== null && rec.WARD !== '') ? rec.WARD : null,
            OWNERSHIP: null,   // no Toronto equivalent - see field-mapping notes
            SPECIES: rec.COMMON_NAME || null, // English name - matching fallback + dropdown/display value
            _botanicalName: rec.BOTANICAL_NAME || null, // primary species-matching key (see computeEcoGroupIdForTree)
            DBH: (rec.DBH_TRUNK !== undefined && rec.DBH_TRUNK !== null && rec.DBH_TRUNK !== '') ? rec.DBH_TRUNK : null,
            TRUNCSTRCT: null,  // no Toronto equivalent
            STATUS: null,      // no Toronto equivalent
            HSURFACE: null, SSUPPORT: null, TRGUARD: null, GRATE: null,
            PLANTER: null, STAKED: null, WTUBES: null // no Toronto equivalent
        }
    };
}

// Holds the complete dataset (grows progressively as pages arrive) for
// whichever city is currently selected.
let allTreesData = { type: 'FeatureCollection', features: [] };
let stillLoadingTrees = true;
let currentCity = 'ottawa';
// Incremented every time loadTreesForCity() starts a load. Pages that
// arrive after the user has switched city again (an abandoned, still
// in-flight load) carry the OLD generation number and are dropped
// instead of being appended to the new city's dataset.
let loadGeneration = 0;

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
        clusterProperties[`g${g}`] = ['+', ['case', ['==', ['get', '_ecoGroupId'], g], 1, 0]];
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
    //
    // Rebuilt on 'moveend' (once a pan/zoom/fly gesture settles) rather
    // than on every 'render' frame. querySourceFeatures() + the diff loop
    // are real work, and 'render' fires up to ~60x/sec during any camera
    // movement - that per-frame cost was the actual cause of the lag, not
    // the marker's DOM complexity. Each maplibregl.Marker already
    // repositions itself smoothly during the gesture on its own (that's
    // built into the Marker class), so we don't need to touch anything
    // mid-gesture just to keep existing bubbles tracking correctly -
    // moveend only needs to catch clusters that appeared/disappeared
    // because the visible area changed. A 'sourcedata' listener below
    // catches the other trigger: filter changes, which call setData()
    // and re-cluster asynchronously in a worker, so we can't just call
    // updateClusterMarkers() synchronously right after setData() - it
    // has to wait for MapLibre to signal the new data is actually ready.
    map.on('moveend', updateClusterMarkers);
    map.on('sourcedata', (e) => {
        if (e.sourceId === 'o_trees' && e.isSourceLoaded) updateClusterMarkers();
    });

    // Individual (unclustered) trees - kept as layer id "o_trees"
    // so the existing click/popup handlers below don't need to change.
    // Using a circle layer instead of a symbol/icon layer is
    // cheaper to render, which matters once there are tens of
    // thousands of unclustered points visible at high zoom. Color is
    // driven by each tree's precomputed _ecoGroupId (see ECO_GROUP_COLOR_MATCH_EXPR).
    map.addLayer({
        id: 'o_trees',
        type: 'circle',
        source: 'o_trees',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': 5,
            'circle-color': ECO_GROUP_COLOR_MATCH_EXPR,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });

    // Initial load - Ottawa is the default city on page load.
    loadTreesForCity('ottawa');
});

// Render-throttling: as pages stream in we must NOT call setData() on
// every page arrival. setData() on a *clustered* GeoJSON source
// discards the old clustering and rebuilds it from scratch for the
// ENTIRE dataset (in a worker) every time it's called - it has no
// incremental/partial mode. Coalescing calls within a single animation
// frame (~16ms) is nowhere near enough: with several concurrent
// workers, dozens of pages can resolve over the course of a several-
// second load, each one triggering a full re-cluster of an ever-
// growing array. That repeated full-dataset reclustering - not the raw
// data size alone - is what crashed the page around ~100k points in an
// earlier version. This instead enforces a minimum time gap between
// renders (RENDER_THROTTLE_MS), so the map still fills in progressively
// but only re-clusters a bounded number of times total, with a
// trailing call guaranteeing the final state is never dropped. Kept at
// module scope (not inside map.on('load')) so loadTreesForCity() can
// reset it cleanly on every city switch, not just on first load.
const RENDER_THROTTLE_MS = 750;
let lastRenderTime = 0;
let trailingRenderTimeout = null;
function scheduleRender() {
    const now = performance.now();
    const elapsed = now - lastRenderTime;
    if (elapsed >= RENDER_THROTTLE_MS) {
        lastRenderTime = now;
        updateFilters();
    } else if (!trailingRenderTimeout) {
        trailingRenderTimeout = setTimeout(() => {
            trailingRenderTimeout = null;
            lastRenderTime = performance.now();
            updateFilters();
        }, RENDER_THROTTLE_MS - elapsed);
    }
}

// Loads (or reloads) the full tree inventory for `city` ('ottawa' or
// 'toronto') into allTreesData, replacing whatever was there before.
// This is the "city switcher" - only one city's trees are ever in
// memory/on the map at a time, never merged. Safe to call again before
// a previous call has finished (loadGeneration guards against a stale,
// abandoned load's pages corrupting the newly-selected city's data).
function loadTreesForCity(city) {
    loadGeneration += 1;
    const myGeneration = loadGeneration;

    allTreesData = { type: 'FeatureCollection', features: [] };
    knownSpeciesSet = new Set();
    selectedIndividualSpecies.clear();
    stillLoadingTrees = true;
    lastRenderTime = 0;
    if (trailingRenderTimeout) {
        clearTimeout(trailingRenderTimeout);
        trailingRenderTimeout = null;
    }

    // Clear the map immediately rather than waiting for the first new
    // page, so the previous city's trees don't linger on screen.
    const source = map.getSource('o_trees');
    if (source) source.setData({ type: 'FeatureCollection', features: [] });
    updateClusterMarkers();

    const cityLabel = city === 'toronto' ? 'Toronto' : 'Ottawa';
    setStatusText(`Loading ${cityLabel} trees... 0 / ?`);

    function handlePage(rawItems, loaded, total, failedPages) {
        if (myGeneration !== loadGeneration) return; // abandoned load - ignore

        // Ottawa's ArcGIS response already yields GeoJSON Features;
        // Toronto's CKAN response yields raw table rows that need
        // normalizing (including parsing the JSON-string geometry
        // field) into the same GeoJSON Feature shape.
        const newFeatures = city === 'toronto'
            ? rawItems.map(normalizeTorontoRecord).filter(Boolean)
            : rawItems;

        // Precompute each tree's species-group ID once, on arrival, so
        // the color paint expression can do a cheap numeric lookup
        // instead of re-running the word-matching logic every render/
        // filter change. Also track every distinct SPECIES value seen,
        // for the Individual Species dropdown below.
        newFeatures.forEach((f) => {
            f.properties._ecoGroupId = computeEcoGroupIdForTree(f.properties);
            f.properties._buildingGroupId = computeBuildingGroupIdForTree(f.properties);
            if (f.properties.SPECIES) knownSpeciesSet.add(f.properties.SPECIES);
        });
        allTreesData.features.push(...newFeatures);
        const failNote = failedPages > 0 ? ` (${failedPages} pages failed)` : '';
        setStatusText(`Loading ${cityLabel} trees... ${loaded} / ${total}${failNote}`);
        scheduleRender();
    }

    const fetchFn = city === 'toronto' ? fetchAllTorontoTrees : fetchAllTrees;

    fetchFn(handlePage)
        .then(() => {
            if (myGeneration !== loadGeneration) return;
            stillLoadingTrees = false;
            renderSpeciesCheckboxList(); // ensure the dropdown reflects the complete species list
            if (trailingRenderTimeout) {
                clearTimeout(trailingRenderTimeout);
                trailingRenderTimeout = null;
            }
            updateFilters(); // final render to guarantee the last page is reflected, now shows "Showing X of Y"
        })
        .catch((err) => {
            if (myGeneration !== loadGeneration) return;
            console.error(`Failed to load ${cityLabel} tree inventory:`, err);
            // Surface the actual error message on-screen (not just the
            // console) so the real cause - CORS, a bad response, a
            // timeout - is visible without opening devtools.
            setStatusText(`Error loading ${cityLabel} trees: ${err && err.message ? err.message : err}`);
        });
}

//===================================================================
// Ottawa Trees Pop Ups
//===================================================================
map.on('click', 'o_trees', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const ottawatrees = e.features[0];

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const props = ottawatrees.properties;
    const ecoGroupId = props._ecoGroupId;
    const ecoGroupLabel = ecoGroupId === 8 ? 'Other Species' : (ecoGroupKeys[ecoGroupId - 1] || 'Unknown');
    const buildingGroupId = props._buildingGroupId;
    const buildingGroupLabel = buildingGroupId === 8 ? 'Other Species' : (buildingGroupKeys[buildingGroupId - 1] || 'Unknown');

    // Toronto trees carry no Ownership/Trunk Structure/Status data and
    // have a separate Botanical Name field worth surfacing (it's what
    // actually drove the group matches, per computeEcoGroupIdForTree /
    // computeBuildingGroupIdForTree).
    const popupHtml = props._city === 'toronto'
        ? `
            <h3>TREE ID: ${props.TREEID}</h3>
            <p><b>Address:</b> ${props.ADDSTR}</p>
            <p><b>Toronto Ward:</b> ${props.WARD}</p>
            <p><b>Common Name:</b> ${props.SPECIES || 'Unknown'}</p>
            <p><b>Botanical Name:</b> ${props._botanicalName || 'Unknown'}</p>
            <p><b>Ecological Group:</b> ${ecoGroupLabel}</p>
            <p><b>Building Group:</b> ${buildingGroupLabel}</p>
            <p><b>Diameter (cm):</b> ${props.DBH !== null && props.DBH !== undefined ? props.DBH : 'Unknown'}</p>
            `
        : `
            <h3>TREE ID: ${props.TREEID}</h3>
            <p><b>Address:</b> ${props.ADDSTR}</p>
            <p><b>Ottawa Ward:</b> ${props.WARD}</p>
            <p><b>Ownership:</b> ${props.OWNERSHIP}</p>
            <p><b>Species:</b> ${props.SPECIES}</p>
            <p><b>Ecological Group:</b> ${ecoGroupLabel}</p>
            <p><b>Building Group:</b> ${buildingGroupLabel}</p>
            <p><b>Diameter (cm):</b> ${props.DBH}</p>
            <p><b>Trunk Structure:</b> ${props.TRUNCSTRCT}</p>
            <p><b>Status:</b> ${props.STATUS}</p>
            `;

    new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupHtml)
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

// --- Districts (Ottawa Wards / Toronto City Wards) -------------------
// A generic "administrative boundary" layer that works for whichever
// city is currently selected, rather than an Ottawa-only "Wards"
// layer. Both cities' source datasets are small (~24-25 polygons) -
// a single request is enough for either, no pagination needed. Each
// city's raw records are normalized at load time into the same two
// properties (_districtName, _districtNumber) so the layer's paint,
// popup and toggle logic never need to know which city they came from.
const OTTAWA_WARDS_URL = 'https://services.arcgis.com/G6F8XLCl5KtAlZ2G/arcgis/rest/services/Wards_2022_2026/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
// Confirmed via a live datastore_search: City of Toronto's "City Wards"
// dataset (https://open.toronto.ca/dataset/city-wards/), current
// 25-ward model. AREA_NAME holds the ward name, AREA_SHORT_CODE the
// ward number; geometry is a JSON-encoded string exactly like the
// Toronto street tree data (see normalizeTorontoRecord).
const TORONTO_WARDS_RESOURCE_ID = '7672dac5-b383-4d7c-90ec-291dc69d37bf';

// Ottawa's field names ("name"/"ward") looked up case-insensitively as
// a defensive measure - if direct lowercase access was returning
// "Unknown District" in testing, a casing mismatch in the actual
// GeoJSON (e.g. "Name" or "NAME") is the most likely cause, and this
// works regardless of which casing the service actually uses.
function getPropCaseInsensitive(props, key) {
    if (props[key] !== undefined && props[key] !== null && props[key] !== '') return props[key];
    const lowerKey = key.toLowerCase();
    for (const k in props) {
        if (k.toLowerCase() === lowerKey && props[k] !== null && props[k] !== '') return props[k];
    }
    return undefined;
}

async function fetchOttawaDistricts() {
    const resp = await fetch(OTTAWA_WARDS_URL);
    if (!resp.ok) throw new Error(`Ottawa Wards service responded with HTTP ${resp.status} ${resp.statusText}.`);
    const data = await resp.json();
    if (data.exceededTransferLimit) {
        console.warn('Districts layer may be incomplete - server indicated exceededTransferLimit.');
    }
    data.features.forEach((f) => {
        const nameVal = getPropCaseInsensitive(f.properties, 'name');
        const numberVal = getPropCaseInsensitive(f.properties, 'ward');
        f.properties._districtName = nameVal !== undefined ? nameVal : 'Unknown District';
        f.properties._districtNumber = numberVal !== undefined ? numberVal : null;
    });
    return data;
}

async function fetchTorontoDistricts() {
    const url = `${TORONTO_ACTION_BASE}?resource_id=${TORONTO_WARDS_RESOURCE_ID}&limit=100`;
    const data = await torontoFetchJson(url);
    if (!data.success || !data.result) {
        throw new Error('Toronto city-wards datastore_search request returned an unsuccessful response.');
    }
    const features = data.result.records.map((rec) => {
        let geom = null;
        try {
            geom = typeof rec.geometry === 'string' ? JSON.parse(rec.geometry) : rec.geometry;
        } catch (err) {
            return null; // malformed geometry - skip rather than guess
        }
        if (!geom || !geom.type || !geom.coordinates) return null;
        return {
            type: 'Feature',
            geometry: geom, // Polygon or MultiPolygon - MapLibre's fill/line layers accept either
            properties: {
                _districtName: rec.AREA_NAME || 'Unknown District',
                _districtNumber: rec.AREA_SHORT_CODE || null
            }
        };
    }).filter(Boolean);
    return { type: 'FeatureCollection', features };
}

// Tracks which city's data is currently loaded into the 'districts'
// source (null = not loaded yet). Re-fetches and swaps the source's
// data via setData() whenever the requested city differs from what's
// already loaded - e.g. the Districts checkbox was already on and the
// user then switched cities.
let districtsLoadedCity = null;
let districtsSourceAdded = false;

function addDistrictsLayers(data) {
    map.addSource('districts', { type: 'geojson', data });
    // Grayscale styling, deliberately city-agnostic.
    // 'o_trees' as the beforeId inserts these layers immediately below
    // the trees layer in the render stack, so trees always draw on top
    // of district polygons instead of being hidden underneath them.
    map.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'districts',
        paint: { 'fill-color': '#9e9e9e', 'fill-opacity': 0.08 }
    }, 'o_trees');
    map.addLayer({
        id: 'districts-outline',
        type: 'line',
        source: 'districts',
        paint: { 'line-color': '#4d4d4d', 'line-width': 1.2 }
    }, 'o_trees');
    // Popup shows the district name, with its number below it.
    map.on('click', 'districts-fill', (ev) => {
        const props = ev.features[0].properties;
        const districtName = props._districtName || 'Unknown District';
        const districtNumber = props._districtNumber;
        const numberLine = (districtNumber !== null && districtNumber !== undefined && districtNumber !== '')
            ? `<p><b>District Number:</b> ${districtNumber}</p>` : '';
        new maplibregl.Popup()
            .setLngLat(ev.lngLat)
            .setHTML(`<h3>${districtName}</h3>${numberLine}`)
            .addTo(map);
    });
    map.on('mouseenter', 'districts-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'districts-fill', () => { map.getCanvas().style.cursor = ''; });
    districtsSourceAdded = true;
}

// Ensures the 'districts' source holds `city`'s district data, fetching
// and adding/replacing it only if it doesn't already. Safe to call
// repeatedly (e.g. every time the checkbox is ticked or the city
// changes) - a no-op if the right data is already loaded.
async function ensureDistrictsLoadedForCity(city) {
    if (districtsLoadedCity === city && districtsSourceAdded) return;
    const data = city === 'toronto' ? await fetchTorontoDistricts() : await fetchOttawaDistricts();
    if (districtsSourceAdded) {
        map.getSource('districts').setData(data);
    } else {
        addDistrictsLayers(data);
    }
    districtsLoadedCity = city;
}

const layerDistrictsToggle = document.getElementById('layerDistrictsToggle');
layerDistrictsToggle.addEventListener('change', (e) => {
    const checked = e.target.checked;
    whenMapReady(async () => {
        if (checked) {
            setLayerStatus('Loading Districts...');
            try {
                await ensureDistrictsLoadedForCity(currentCity);
                setLayerStatus('');
            } catch (err) {
                console.error('Failed to load Districts layer:', err);
                setLayerStatus(`Error loading Districts: ${err.message}`);
                layerDistrictsToggle.checked = false;
                return;
            }
            map.setLayoutProperty('districts-fill', 'visibility', 'visible');
            map.setLayoutProperty('districts-outline', 'visibility', 'visible');
        } else if (districtsSourceAdded) {
            map.setLayoutProperty('districts-fill', 'visibility', 'none');
            map.setLayoutProperty('districts-outline', 'visibility', 'none');
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

// Confirmed field name: "TES_R" holds the 0-100 Tree Equity Score.
const TREE_EQUITY_SCORE_EXPR = ['coalesce', ['get', 'TES_R'], 50];

function addEquityLayers(data) {
    map.addSource('tree_equity', { type: 'geojson', data });
    // Green sequential choropleth (ColorBrewer "Greens") keyed on the
    // 0-100 Tree Equity Score - pale/low green = greater need (score
    // near 0), deep green = well-served (score near 100).
    // 'o_trees' as the beforeId keeps trees drawn on top of this layer
    // too, same reasoning as the wards layers above.
    map.addLayer({
        id: 'equity-fill',
        type: 'fill',
        source: 'tree_equity',
        paint: {
            'fill-color': [
                'interpolate', ['linear'], TREE_EQUITY_SCORE_EXPR,
                0, '#f7fcf5',
                20, '#c7e9c0',
                40, '#74c476',
                60, '#41ab5d',
                80, '#238b45',
                100, '#00441b'
            ],
            'fill-opacity': 0.7
        }
    }, 'o_trees');
    map.addLayer({
        id: 'equity-outline',
        type: 'line',
        source: 'tree_equity',
        paint: { 'line-color': '#00441b', 'line-width': 0.75, 'line-opacity': 0.5 }
    }, 'o_trees');
    // Text label showing the Tree Equity Score value, hovering above each
    // polygon (MapLibre places symbol labels at a representative point of
    // the polygon automatically) - replaces the old click popup.
    map.addLayer({
        id: 'equity-labels',
        type: 'symbol',
        source: 'tree_equity',
        layout: {
            'text-field': ['to-string', ['round', TREE_EQUITY_SCORE_EXPR]],
            'text-size': 12
        },
        paint: {
            'text-color': '#00441b',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5
        }
    }, 'o_trees');
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
            map.setLayoutProperty('equity-labels', 'visibility', 'visible');
        } else if (equityLoaded) {
            map.setLayoutProperty('equity-fill', 'visibility', 'none');
            map.setLayoutProperty('equity-outline', 'visibility', 'none');
            map.setLayoutProperty('equity-labels', 'visibility', 'none');
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
// City Switcher (Ottawa / Toronto)
//
// Mutually exclusive - picking a city discards the other city's trees
// entirely rather than merging or layering them, per the chosen
// architecture. Ottawa-only reference layers (Wards, Tree Equity Score)
// have no Toronto equivalent yet, so their checkboxes are disabled and
// forced off while Toronto is selected, and re-enabled when switching
// back to Ottawa (their loaded data, if any, is left in the map source
// but hidden - no need to re-fetch if the user switches back).
//===================================================================
const cityButtons = document.querySelectorAll('.city-btn');
const layerEquityLabel = document.getElementById('layerEquityLabel');
const infoDataSourceNote = document.getElementById('infoDataSourceNote');
const layersDataSourceNote = document.getElementById('layersDataSourceNote');

// Map view to fly to on switching to each city - Ottawa's matches the
// map's own initial center/zoom (see the maplibregl.Map constructor at
// the top of this file); Toronto's is a similar city-scale framing.
const CITY_MAP_VIEWS = {
    ottawa: { center: [-75.67580482586735, 45.40584450123107], zoom: 10 },
    toronto: { center: [-79.3832, 43.6532], zoom: 10 }
};

const CITY_INFO_TEXT = {
    ottawa: 'Open Data Ottawa (Forestry, Wards 2022&ndash;2026), Tree Equity Score 2025 (American Forests / ArcGIS Online)',
    toronto: "City of Toronto Open Data Portal &ndash; Street Tree Data (CKAN DataStore)"
};
const CITY_LAYERS_TEXT = {
    ottawa: 'Open Data Ottawa',
    toronto: 'City of Toronto Open Data Portal'
};

// Tree Equity Score has no Toronto equivalent yet (Districts, unlike
// Equity, now works for both cities - see ensureDistrictsLoadedForCity
// above), so it's the only remaining Ottawa-only layer.
function setEquityLayerEnabled(enabled) {
    layerEquityToggle.disabled = !enabled;
    if (layerEquityLabel) layerEquityLabel.classList.toggle('layer-disabled', !enabled);

    if (!enabled && layerEquityToggle.checked) {
        // Force off and visually hidden - it stays loaded in the map's
        // source (no need to re-fetch on switching back to Ottawa) but
        // shouldn't render while Toronto is selected.
        layerEquityToggle.checked = false;
        if (equityLoaded) {
            map.setLayoutProperty('equity-fill', 'visibility', 'none');
            map.setLayoutProperty('equity-outline', 'visibility', 'none');
            map.setLayoutProperty('equity-labels', 'visibility', 'none');
        }
    }
}

function switchCity(city) {
    if (city === currentCity) return;
    currentCity = city;

    cityButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.city === city);
    });

    setEquityLayerEnabled(city === 'ottawa');

    // Districts works for both cities, but the source only ever holds
    // one city's polygons at a time - if it's currently switched on,
    // reload it for the newly-selected city rather than leaving the
    // old city's boundaries showing.
    if (layerDistrictsToggle.checked) {
        setLayerStatus('Loading Districts...');
        whenMapReady(async () => {
            try {
                await ensureDistrictsLoadedForCity(city);
                setLayerStatus('');
            } catch (err) {
                console.error('Failed to load Districts layer:', err);
                setLayerStatus(`Error loading Districts: ${err.message}`);
                layerDistrictsToggle.checked = false;
                if (districtsSourceAdded) {
                    map.setLayoutProperty('districts-fill', 'visibility', 'none');
                    map.setLayoutProperty('districts-outline', 'visibility', 'none');
                }
            }
        });
    }

    // Fly to the newly-selected city's extent - whenMapReady guards
    // against calling this before the style has finished loading (the
    // buttons are clickable immediately, the map may not be ready yet
    // on a very fast click right after page load).
    const view = CITY_MAP_VIEWS[city];
    if (view) {
        whenMapReady(() => map.flyTo({ center: view.center, zoom: view.zoom }));
    }

    if (infoDataSourceNote) infoDataSourceNote.innerHTML = `<b>Data Source(s):</b><br>${CITY_INFO_TEXT[city]}`;
    if (layersDataSourceNote) layersDataSourceNote.innerHTML = `<b>Data Source(s):</b><br>${CITY_LAYERS_TEXT[city]}`;

    // Switching cities invalidates every current filter selection
    // (Toronto has no Ownership/Trunk Structure/Status/Planting
    // Conditions data, and neither city's exact SPECIES/species-group
    // mix carries over meaningfully) - reset filters to a clean slate
    // rather than silently keeping a stale selection.
    resetAllFilters();

    whenMapReady(() => loadTreesForCity(city));
}

cityButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchCity(btn.dataset.city));
});

//===================================================================
// Menu: icon rail + ONE unified scrollable panel (Info / Layers /
// Legend / Filters as collapsible sections inside it)
//
// Sections open independently - opening one doesn't collapse another,
// so e.g. Info and Layers can both stay expanded while Building Group
// stays collapsed. The whole card pins to the actual left edge of the
// screen and expands to full viewport height the moment anything is
// open (see updateMenuPinnedState() and .menu-card.pinned in the CSS) -
// same icons/fonts/card styling as the floating default, just anchored
// differently once "activated". Each section's own header (icon + label
// + chevron, all one row) is both the toggle trigger and the icon - no
// separate rail element anymore - so there's a single click path through
// toggleSection()/openPanel()/closePanel().
//===================================================================
const sectionHeaders = document.querySelectorAll('.section-header');
const menuCardEl = document.getElementById('menuCard');

function updateMenuPinnedState() {
    const anyOpen = document.querySelector('.panel-section.active') !== null;
    menuCardEl.classList.toggle('pinned', anyOpen);
}

function openPanel(tabName) {
    const panel = document.getElementById(`panel-${tabName}`);
    if (panel) panel.classList.add('active');
    updateMenuPinnedState();
}

function closePanel(tabName) {
    const panel = document.getElementById(`panel-${tabName}`);
    if (panel) panel.classList.remove('active');
    // Collapse the Individual Species dropdown when Filters itself closes,
    // so it doesn't appear pre-opened next time Filters is reopened.
    if (tabName === 'filters' && typeof speciesDropdown !== 'undefined') {
        speciesDropdown.classList.remove('open');
    }
    updateMenuPinnedState();
}

function toggleSection(tabName) {
    const panel = document.getElementById(`panel-${tabName}`);
    if (panel && panel.classList.contains('active')) {
        closePanel(tabName);
    } else {
        openPanel(tabName);
    }
}

// Clicking a section's header (icon + label + chevron) toggles it.
sectionHeaders.forEach((header) => {
    header.addEventListener('click', () => toggleSection(header.dataset.tab));
});

// Starts fully collapsed (compact floating card, no panel open) to match
// the prototype's default/idle state.

//===================================================================
// Legend tab content (built from the same ECO_GROUP_COLORS / ecoGroupKeys
// / buildDonutMarkerEl used elsewhere, so it can't drift out of sync
// with what's actually drawn on the map)
//===================================================================
const legendEcoGroupsEl = document.getElementById('legend-eco-groups');
ecoGroupKeys.forEach((key, i) => {
    const row = document.createElement('div');
    row.className = 'legend-row';
    row.innerHTML = `<span class="legend-swatch round" style="background:${ECO_GROUP_COLORS[i + 1]};"></span> ${key}`;
    legendEcoGroupsEl.appendChild(row);
});
const otherRow = document.createElement('div');
otherRow.className = 'legend-row';
otherRow.innerHTML = `<span class="legend-swatch round" style="background:${ECO_GROUP_COLORS[8]};"></span> Other Species`;
legendEcoGroupsEl.appendChild(otherRow);

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
    <p style="margin:4px 0;">Each wedge is one Ecological Group - same colors as above.</p>
    <p style="margin:4px 0;">The number in the center is the total tree count in that cluster.</p>
    <p style="margin:4px 0;">Bubble size also grows with tree count (small: under 50, medium: 50–199, large: 200+).</p>
`;
legendClusterEl.appendChild(clusterExplainer);

//===================================================================
// Filter State
//===================================================================
let selectedEcoGroup = 'all';
let selectedBuildingGroup = 'all';
let selectedConditions = [];       // e.g. ['HSURFACE', 'GRATE']
let selectedDiameterClass = 'all'; // 'all' or a key from DIAMETER_CLASSES below
let selectedIndividualSpecies = new Set(); // exact SPECIES values, from the custom dropdown below

// Distinct SPECIES values seen in the loaded data so far - populated
// progressively as tree pages arrive (see fetchAllTrees callback above).
let knownSpeciesSet = new Set();

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
// Uses each tree's precomputed _ecoGroupId (set via computeEcoGroupIdForTree
// at load time - botanical-name-first for Toronto, English word-matching
// for Ottawa) rather than re-matching SPECIES text here, so this filter
// can never disagree with what _ecoGroupId already decided (map color,
// legend, carbon report).
function passesEcoGroupFilter(props) {
    if (selectedEcoGroup === '__other__') {
        return props._ecoGroupId === 8;
    }
    if (selectedEcoGroup === 'all') return true;
    const idx = ecoGroupKeys.indexOf(selectedEcoGroup);
    return props._ecoGroupId === idx + 1;
}

// Same pattern as passesEcoGroupFilter, against the independent
// Building Group classification (props._buildingGroupId). Combined
// with the ecological filter via AND, same as every other filter here.
function passesBuildingGroupFilter(props) {
    if (selectedBuildingGroup === '__other__') {
        return props._buildingGroupId === 8;
    }
    if (selectedBuildingGroup === 'all') return true;
    const idx = buildingGroupKeys.indexOf(selectedBuildingGroup);
    return props._buildingGroupId === idx + 1;
}

// Toronto trees have no data for any of these 7 fields (all normalized
// to null - see normalizeTorontoRecord). null === -1 is always false,
// so this naturally implements "Toronto trees are always excluded
// whenever any Planting Conditions filter is active" without needing a
// separate _city check here.
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

// Exact-match multi-select, independent of (and combined with, via AND)
// the coarser Ecological/Building Group filters above. Empty selection = no filtering.
function passesIndividualSpeciesFilter(props) {
    if (selectedIndividualSpecies.size === 0) return true;
    return selectedIndividualSpecies.has(props.SPECIES);
}

function treePassesFilters(props) {
    return passesEcoGroupFilter(props)
        && passesBuildingGroupFilter(props)
        && passesIndividualSpeciesFilter(props)
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
// Ecological Group / Building Group dropdown listeners
//===================================================================
ecoGroupSelect.addEventListener('change', (e) => {
    selectedEcoGroup = e.target.value;
    updateFilters();
});

buildingGroupSelect.addEventListener('change', (e) => {
    selectedBuildingGroup = e.target.value;
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
// Individual Species dropdown (custom, multi-select via checkboxes,
// with a search box - built dynamically from knownSpeciesSet rather
// than a fixed list, since we don't have the full ~170-species domain
// table, only whatever's actually present in the loaded data).
//===================================================================
const speciesDropdown = document.getElementById('speciesDropdown');
const speciesDropdownToggle = document.getElementById('speciesDropdownToggle');
const speciesDropdownLabel = document.getElementById('speciesDropdownLabel');
const speciesSearchInput = document.getElementById('speciesSearchInput');
const speciesCheckboxList = document.getElementById('speciesCheckboxList');
const speciesClearSelectionBtn = document.getElementById('speciesClearSelection');

function updateSpeciesDropdownLabel() {
    const n = selectedIndividualSpecies.size;
    if (n === 0) {
        speciesDropdownLabel.textContent = 'Show all';
    } else if (n === 1) {
        speciesDropdownLabel.textContent = [...selectedIndividualSpecies][0];
    } else {
        speciesDropdownLabel.textContent = `${n} species selected`;
    }
}

function renderSpeciesCheckboxList() {
    const searchTerm = speciesSearchInput.value.trim().toLowerCase();
    const allSpecies = [...knownSpeciesSet].sort((a, b) => a.localeCompare(b));
    const filtered = searchTerm
        ? allSpecies.filter((s) => s.toLowerCase().includes(searchTerm))
        : allSpecies;

    speciesCheckboxList.innerHTML = '';
    if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'no-matches';
        empty.textContent = allSpecies.length === 0 ? 'Loading species...' : 'No matching species';
        speciesCheckboxList.appendChild(empty);
        return;
    }
    filtered.forEach((species) => {
        const label = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = species;
        cb.checked = selectedIndividualSpecies.has(species);
        cb.addEventListener('change', () => {
            if (cb.checked) selectedIndividualSpecies.add(species);
            else selectedIndividualSpecies.delete(species);
            updateSpeciesDropdownLabel();
            updateFilters();
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(species));
        speciesCheckboxList.appendChild(label);
    });
}

speciesDropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = speciesDropdown.classList.contains('open');
    if (isOpen) {
        speciesDropdown.classList.remove('open');
    } else {
        speciesDropdown.classList.add('open');
        speciesSearchInput.value = '';
        renderSpeciesCheckboxList();
        speciesSearchInput.focus();
    }
});

speciesSearchInput.addEventListener('input', renderSpeciesCheckboxList);
// Prevent clicks inside the panel (search box, checkboxes) from bubbling
// to the document listener below and closing the dropdown immediately.
document.getElementById('speciesDropdownPanel').addEventListener('click', (e) => e.stopPropagation());

speciesClearSelectionBtn.addEventListener('click', () => {
    selectedIndividualSpecies.clear();
    updateSpeciesDropdownLabel();
    renderSpeciesCheckboxList();
    updateFilters();
});

// Close the dropdown when clicking anywhere outside it.
document.addEventListener('click', () => {
    speciesDropdown.classList.remove('open');
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
// Factored out of the button's click handler so switchCity() (see City
// Switcher section above) can also reset every filter to a clean slate
// when the selected city changes.
function resetAllFilters() {
    // Reset ecological group
    selectedEcoGroup = 'all';
    ecoGroupSelect.value = 'all';

    // Reset building group
    selectedBuildingGroup = 'all';
    buildingGroupSelect.value = 'all';

    // Reset planting condition checkboxes
    selectedConditions = [];
    document.querySelectorAll('#filtersPlantingConditions input[type=checkbox]').forEach((cb) => {
        cb.checked = false;
    });

    // Reset individual species selection
    selectedIndividualSpecies.clear();
    updateSpeciesDropdownLabel();
    speciesDropdown.classList.remove('open');
    renderSpeciesCheckboxList();

    // Reset diameter class
    selectedDiameterClass = 'all';
    diameterClassSelect.value = 'all';

    updateFilters();
}

const resetBtn = document.getElementById('reset-filters');
resetBtn.addEventListener('click', resetAllFilters);

// Initialize condition state (filters themselves run once allTreesData loads)
updateSelectedConditions();

//===================================================================
// Output Results Summary
//
// Summarizes whatever the CURRENT filters (Ecological Group, Building
// Group, Individual Species, Planting Conditions, Diameter) produce - it reuses
// treePassesFilters() directly so the report can never drift out of
// sync with what's actually shown on the map. Ward is a separate
// boundary/reference layer, not a tree filter, so it has no effect
// on this report.
//===================================================================

// --- Embodied carbon: volume via Ung, Guo & Fortin (2013) national
// taper models --------------------------------------------------------
// Source: Ung, C.-H., Guo, X.J., & Fortin, M. (2013). "Canadian
// national taper models." The Forestry Chronicle, 89(2), 211-224.
// This is the published model underlying Natural Resources Canada's
// own Forest Volume Calculator (https://apps-scf-cfs.rncan.gc.ca/calc/en/volume-calculator).
//
// The paper's eq. 4b gives a taper model usable from DBH alone (no
// measured height needed), fit per species with three fixed-effect
// parameters (Table 6): beta0, beta1, beta2. Ignoring the paper's
// random effects (which require plot/site calibration data we don't
// have - the paper explicitly frames the fixed-effects-only version as
// appropriate for exactly this "no local data available" national-
// level context), the model reduces to:
//
//   H = beta0 * DBH^beta1                              [predicted total height, m]
//   d(h)^2 = DBH^2 * [(H-h)/(H-1.3)] * (h/1.3)^(2-beta2)  [diameter^2 at height h, cm^2]
//   (two factors multiplied - the linear term tapers diameter to zero at
//   the tip, the power term produces the butt-swell flare near the stump)
//
// Stem volume is then the taper profile integrated from stump height
// to the tip (H, where d -> 0) via Smalian's formula, the same
// numerical method as the paper's own eq. 7 - NOT a uniform cylinder.
// This deliberately integrates the FULL stem (stump to tip) rather
// than the paper's merchantable-limit convention (min. ~9cm top
// diameter), since a whole-tree carbon estimate shouldn't exclude the
// upper stem/crown-adjacent wood the way a sawlog-volume estimate
// would.
//
// Table 6 covers 34 species by common name. Ottawa's raw SPECIES codes
// were never confirmed against the live service (same caveat as the
// species-group matching elsewhere in this file), so matching here
// reuses the same word-matching approach as ecologicalGroups, just against
// this paper's specific species list. Trees whose species don't match
// any of the 34 fall back to the previous flat-cylinder approximation -
// see UNG_TAPER_COEFFICIENTS below and the match/fallback counts
// surfaced in the report itself.
const UNG_TAPER_STUMP_HEIGHT_M = 0.3; // matches most provinces' convention in the paper
const UNG_TAPER_INTEGRATION_STEP_M = 0.2; // numerical integration step for Smalian's formula
const UNG_TAPER_MIN_HEIGHT_M = 2; // safety floor - guards against degenerate H for extreme DBH outside the fitted range, or species with negative beta1
const UNG_TAPER_MAX_HEIGHT_M = 45; // safety ceiling, generous for Canadian species

const UNG_TAPER_COEFFICIENTS = [
    // { latin, words, beta0, beta1, beta2 } - beta0/beta1/beta2 are Table 6's
    // fixed-effect estimates (population-averaged, no random effects)
    { latin: 'Abies lasiocarpa', words: ['fir', 'alpine'], beta0: 4.8689, beta1: 0.3822, beta2: 2.1805 },
    { latin: 'Abies balsamea', words: ['fir', 'balsam'], beta0: 10.4602, beta1: 0.2401, beta2: 2.211 },
    { latin: 'Populus balsamifera', words: ['poplar', 'balsam'], beta0: 6.0469, beta1: 0.3672, beta2: 2.1855 },
    { latin: 'Tilia americana', words: ['basswood'], beta0: 10.1134, beta1: 0.1957, beta2: 2.1507 },
    { latin: 'Fagus grandifolia', words: ['beech', 'american'], beta0: 10.8759, beta1: 0.239, beta2: 2.1514 },
    { latin: 'Fraxinus nigra', words: ['ash', 'black'], beta0: 9.3651, beta1: 0.3037, beta2: 2.1589 },
    { latin: 'Prunus serotina', words: ['cherry', 'black'], beta0: 204.8406, beta1: -0.7245, beta2: 2.1872 },
    { latin: 'Populus nigra', words: ['poplar', 'black'], beta0: 2.9195, beta1: 0.5727, beta2: 2.2118 },
    { latin: 'Picea mariana', words: ['spruce', 'black'], beta0: 15.7745, beta1: 0.15, beta2: 2.2548 },
    { latin: 'Pseudotsuga menziesii', words: ['douglas'], beta0: 504.288, beta1: -0.7858, beta2: 2.1973 },
    { latin: 'Tsuga canadensis', words: ['hemlock'], beta0: 5.9068, beta1: 0.3675, beta2: 2.1633 },
    { latin: 'Thuja occidentalis', words: ['cedar'], beta0: 10.6555, beta1: 0.1222, beta2: 2.2283 },
    { latin: 'Pinus strobus', words: ['pine', 'white'], beta0: 13.0372, beta1: 0.1932, beta2: 2.2333 },
    { latin: 'Picea engelmannii', words: ['spruce', 'engelmann'], beta0: 1.9517, beta1: 0.7223, beta2: 2.1812 },
    { latin: 'Carya spp.', words: ['hickory'], beta0: 6.227, beta1: 0.3651, beta2: 2.2766 }, // genus-level - paper doesn't split by hickory species
    { latin: 'Pinus banksiana', words: ['pine', 'jack'], beta0: 15.5003, beta1: 0.0654, beta2: 2.1485 },
    { latin: 'Populus grandidentata', words: ['aspen', 'bigtooth'], beta0: 10.3104, beta1: 0.2124, beta2: 2.0805 },
    { latin: 'Pinus contorta', words: ['pine', 'lodgepole'], beta0: 11.8367, beta1: 0.246, beta2: 2.1264 },
    { latin: 'Acer negundo', words: ['maple', 'manitoba'], beta0: 5.6077, beta1: 0.2909, beta2: 2.137 },
    { latin: 'Fraxinus pennsylvanica', words: ['ash', 'red'], beta0: 26.6285, beta1: -0.0106, beta2: 2.1971 },
    { latin: 'Acer rubrum', words: ['maple', 'red'], beta0: 7.8918, beta1: 0.254, beta2: 2.1212 },
    { latin: 'Quercus rubra', words: ['oak', 'red'], beta0: 44.7444, beta1: -0.2235, beta2: 2.2605 },
    { latin: 'Pinus resinosa', words: ['pine', 'red'], beta0: 20.296, beta1: -0.0353, beta2: 2.1781 },
    { latin: 'Picea rubens', words: ['spruce', 'red'], beta0: 20.6225, beta1: 0.0091, beta2: 2.1352 },
    { latin: 'Acer saccharinum', words: ['maple', 'silver'], beta0: 201.2468, beta1: -0.5842, beta2: 2.3036 },
    { latin: 'Acer saccharum', words: ['maple', 'sugar'], beta0: 9.7271, beta1: 0.2095, beta2: 2.1706 },
    { latin: 'Larix laricina', words: ['tamarack'], beta0: 59.2599, beta1: -0.3284, beta2: 2.2219 },
    { latin: 'Populus tremuloides', words: ['aspen', 'trembling'], beta0: 6.7233, beta1: 0.4554, beta2: 2.1583 },
    { latin: 'Fraxinus americana', words: ['ash', 'white'], beta0: 71.2866, beta1: -0.3535, beta2: 2.2328 },
    { latin: 'Betula papyrifera', words: ['birch', 'paper'], beta0: 22.143, beta1: 0.0233, beta2: 2.2069 },
    { latin: 'Ulmus americana', words: ['elm', 'american'], beta0: 2.3524, beta1: 0.5602, beta2: 2.2465 },
    { latin: 'Quercus alba', words: ['oak', 'white'], beta0: 10.3196, beta1: 0.0802, beta2: 2.2391 },
    { latin: 'Picea glauca', words: ['spruce', 'white'], beta0: 5.7006, beta1: 0.4099, beta2: 2.1581 },
    { latin: 'Betula alleghaniensis', words: ['birch', 'yellow'], beta0: 30.7651, beta1: -0.003, beta2: 2.3058 }
];

// Returns the first matching coefficient entry, or null if this SPECIES
// value doesn't match any of the paper's 34 species (case-insensitive,
// same "contains all words" logic used elsewhere in this file).
function getUngTaperCoefficients(speciesValue) {
    if (!speciesValue) return null;
    for (const entry of UNG_TAPER_COEFFICIENTS) {
        if (speciesWordsPresent(speciesValue, entry.words)) return entry;
    }
    return null;
}

// Same botanical-name-first / no-English-fallback logic as
// computeEcoGroupIdForTree above, applied to the taper-coefficient
// lookup. Toronto's BOTANICAL_NAME is actually a BETTER match key here
// than Ottawa's inferred SPECIES codes, since it's an unambiguous Latin
// binomial rather than a guessed word-order mapping.
function getUngTaperCoefficientsForTree(props) {
    if (props._botanicalName) {
        const norm = normalizeLatinBinomial(props._botanicalName);
        const found = UNG_TAPER_COEFFICIENTS.find((entry) => normalizeLatinBinomial(entry.latin) === norm);
        return found || null; // no fallback to English word-matching - see comment above computeEcoGroupIdForTree
    }
    return getUngTaperCoefficients(props.SPECIES);
}

// Real taper-integrated stem volume (m^3) for one tree, via Smalian's
// formula - the same numerical method as the paper's own eq. 7.
function ungTaperVolumeM3(dbhCm, coeffs) {
    const dbh = Number(dbhCm);
    let H = coeffs.beta0 * Math.pow(dbh, coeffs.beta1);
    H = Math.min(Math.max(H, UNG_TAPER_MIN_HEIGHT_M), UNG_TAPER_MAX_HEIGHT_M);

    // Eq. 1: d^2 = dbh^2 * [(H-h)/(H-1.3)] * (h/1.3)^(2-beta2) - TWO factors
    // multiplied together, not one factor raised to a power. The linear
    // term drives diameter to zero at the tip (h=H); the power term
    // produces the butt-swell flare near the stump. Both are required -
    // dropping either one breaks the taper shape (an earlier version of
    // this code had diameter *increasing* toward the treetop, which is
    // physically backwards, from mistakenly implementing only one term).
    const exponent = 2 - coeffs.beta2;
    function diameterSquaredAt(h) {
        if (h >= H) return 0;
        const linearFactor = (H - h) / (H - 1.3);
        const powerFactor = Math.pow(h / 1.3, exponent);
        return dbh * dbh * linearFactor * powerFactor;
    }

    let volume = 0;
    let h = UNG_TAPER_STUMP_HEIGHT_M;
    let dLowSq = diameterSquaredAt(h);
    while (h < H) {
        const hNext = Math.min(h + UNG_TAPER_INTEGRATION_STEP_M, H);
        const dHighSq = diameterSquaredAt(hNext);
        // Smalian's formula: V = (pi/80000) * (d_low^2 + d_high^2) * segment_length,
        // matching eq. 7's units exactly (d in cm, h in m, V in m^3).
        volume += (Math.PI / 80000) * (dLowSq + dHighSq) * (hNext - h);
        h = hNext;
        dLowSq = dHighSq;
    }
    return volume;
}

// --- Fallback assumptions for species NOT in the paper's 34-species
// table (see the match/fallback counts surfaced in the report) -------
const TIMBER_CARBON_FACTOR_KG_CO2E_PER_KG = 0.493; // ICE database, "Timber, average of all data, no carbon storage"
// ICE's own summary notes state timber density varies widely
// (350-800 kg/m3) rather than giving one fixed figure for the
// average/general category - 500 kg/m3 here is a reasonable
// midpoint-ish placeholder, not a precise ICE-sourced value. This is
// unchanged by the taper-model upgrade below - it's a separate,
// still-unresolved assumption. Adjust if you have a more specific
// density in mind.
const ASSUMED_WOOD_DENSITY_KG_PER_M3 = 500;
// Only used for trees whose species has no match in UNG_TAPER_COEFFICIENTS.
const FALLBACK_ASSUMED_TREE_HEIGHT_M = 10;

// Returns { totalKgCO2e, treesUsed, treesExcludedNoDBH, treesTaperModel, treesFallback }
function computeEmbodiedCarbonEstimate(features) {
    let totalVolumeM3 = 0;
    let treesUsed = 0;
    let treesExcludedNoDBH = 0;
    let treesTaperModel = 0;
    let treesFallback = 0;

    features.forEach((f) => {
        const dbhCm = f.properties.DBH;
        if (dbhCm === null || dbhCm === undefined || dbhCm === '' || isNaN(Number(dbhCm)) || Number(dbhCm) <= 0) {
            treesExcludedNoDBH += 1;
            return;
        }

        const coeffs = getUngTaperCoefficientsForTree(f.properties);
        if (coeffs) {
            totalVolumeM3 += ungTaperVolumeM3(dbhCm, coeffs);
            treesTaperModel += 1;
        } else {
            // Fallback: previous flat-cylinder approximation.
            const radiusM = (Number(dbhCm) / 100) / 2;
            totalVolumeM3 += Math.PI * radiusM * radiusM * FALLBACK_ASSUMED_TREE_HEIGHT_M;
            treesFallback += 1;
        }
        treesUsed += 1;
    });

    const totalMassKg = totalVolumeM3 * ASSUMED_WOOD_DENSITY_KG_PER_M3;
    const totalKgCO2e = totalMassKg * TIMBER_CARBON_FACTOR_KG_CO2E_PER_KG;

    return { totalKgCO2e, treesUsed, treesExcludedNoDBH, treesTaperModel, treesFallback };
}

// A larger, static (non-interactive) version of the cluster donut, sized
// for the report rather than for a map marker. Deliberately separate
// from buildDonutMarkerEl(), which is tightly coupled to cluster-marker
// sizing thresholds and click-to-zoom behavior that don't apply here.
function buildReportDonutSVG(counts, totalCount, diameterPx) {
    const stops = [];
    let cumulative = 0;
    for (let g = 1; g <= 8; g++) {
        const val = counts[g] || 0;
        if (val === 0 || totalCount === 0) continue;
        const start = (cumulative / totalCount) * 360;
        cumulative += val;
        const end = (cumulative / totalCount) * 360;
        stops.push(`${ECO_GROUP_COLORS[g]} ${start}deg ${end}deg`);
    }
    const gradient = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : '#eef0f4';
    const holeDiameter = Math.round(diameterPx * 0.6);

    const el = document.createElement('div');
    el.style.width = `${diameterPx}px`;
    el.style.height = `${diameterPx}px`;
    el.style.borderRadius = '50%';
    el.style.background = gradient;
    el.style.flexShrink = '0';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.boxShadow = '0 0 0 1px #e5e8f1';

    const hole = document.createElement('div');
    hole.style.width = `${holeDiameter}px`;
    hole.style.height = `${holeDiameter}px`;
    hole.style.borderRadius = '50%';
    hole.style.background = '#ffffff';
    hole.style.display = 'flex';
    hole.style.alignItems = 'center';
    hole.style.justifyContent = 'center';
    hole.style.fontSize = `${Math.max(10, Math.round(holeDiameter * 0.16))}px`;
    hole.style.fontWeight = '700';
    hole.style.color = '#333333';
    hole.textContent = totalCount.toLocaleString();
    el.appendChild(hole);

    return el;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function generateResultsSummary() {
    const filteredFeatures = allTreesData.features.filter((f) => treePassesFilters(f.properties));
    const total = filteredFeatures.length;
    const body = document.getElementById('resultsModalBody');
    body.innerHTML = '';

    if (total === 0) {
        body.innerHTML = '<p style="color:#777; font-size:0.85rem;">No trees match the current filters - nothing to summarize.</p>';
        openResultsModal();
        return;
    }

    // --- Total count stat -------------------------------------------
    const statRow = document.createElement('div');
    statRow.className = 'report-stat-row';
    statRow.innerHTML = `
        <div class="report-stat">
            <div class="value">${total.toLocaleString()}</div>
            <div class="label">Trees matching current filters</div>
        </div>
    `;
    body.appendChild(statRow);

    // --- Ecological Group distribution (donut, reusing map colors) --
    // (This section was previously mislabeled "Building Group
    // Distribution" - it has always reflected the ECOLOGICAL grouping,
    // since that's what _ecoGroupId / the map's colors are keyed to.)
    const ecoGroupCounts = {};
    for (let g = 1; g <= 8; g++) ecoGroupCounts[g] = 0;
    filteredFeatures.forEach((f) => {
        const gid = f.properties._ecoGroupId || 8;
        ecoGroupCounts[gid] = (ecoGroupCounts[gid] || 0) + 1;
    });

    const ecoGroupTitle = document.createElement('div');
    ecoGroupTitle.className = 'report-section-title';
    ecoGroupTitle.textContent = 'Ecological Group Distribution';
    body.appendChild(ecoGroupTitle);

    const donutRow = document.createElement('div');
    donutRow.className = 'report-donut-row';
    const donut = buildReportDonutSVG(ecoGroupCounts, total, 110);
    donutRow.appendChild(donut);

    const ecoGroupLegend = document.createElement('div');
    ecoGroupLegend.className = 'report-group-legend';
    ecoGroupKeys.concat(['Other Species']).forEach((label, i) => {
        const groupId = i + 1;
        const count = ecoGroupCounts[groupId] || 0;
        if (count === 0) return;
        const pct = ((count / total) * 100).toFixed(1);
        const row = document.createElement('div');
        row.className = 'legend-row';
        row.style.margin = '2px 0';
        row.innerHTML = `<span class="legend-swatch round" style="background:${ECO_GROUP_COLORS[groupId]};"></span> ${escapeHtml(label)} <span style="color:#999; margin-left:auto; flex-shrink:0; white-space:nowrap;">${count} (${pct}%)</span>`;
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '6px';
        ecoGroupLegend.appendChild(row);
    });
    donutRow.appendChild(ecoGroupLegend);
    body.appendChild(donutRow);

    // --- Building Group distribution (horizontal bars - no donut here
    // since Building Group has no map-color palette of its own; it's a
    // filter-only classification, see the Filters panel) -------------
    const buildingGroupCounts = {};
    for (let g = 1; g <= 8; g++) buildingGroupCounts[g] = 0;
    filteredFeatures.forEach((f) => {
        const gid = f.properties._buildingGroupId || 8;
        buildingGroupCounts[gid] = (buildingGroupCounts[gid] || 0) + 1;
    });

    const buildingGroupTitle = document.createElement('div');
    buildingGroupTitle.className = 'report-section-title';
    buildingGroupTitle.textContent = 'Building Group Distribution';
    body.appendChild(buildingGroupTitle);

    const buildingGroupMaxCount = Math.max(...Object.values(buildingGroupCounts), 1);
    const buildingGroupList = document.createElement('div');
    buildingGroupKeys.concat(['Other Species']).forEach((label, i) => {
        const groupId = i + 1;
        const count = buildingGroupCounts[groupId] || 0;
        if (count === 0) return;
        const pct = ((count / total) * 100).toFixed(1);
        const barPct = (count / buildingGroupMaxCount) * 100;
        const row = document.createElement('div');
        row.className = 'report-bar-row';
        row.innerHTML = `
            <span class="report-bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
            <span class="report-bar-track"><span class="report-bar-fill" style="width:${barPct}%; background:#647c64;"></span></span>
            <span class="report-bar-value">${count} (${pct}%)</span>
        `;
        buildingGroupList.appendChild(row);
    });
    body.appendChild(buildingGroupList);

    // --- Species distribution (top 8 + Other, horizontal bars) ------
    const speciesCounts = {};
    filteredFeatures.forEach((f) => {
        const sp = f.properties.SPECIES || 'Unknown';
        speciesCounts[sp] = (speciesCounts[sp] || 0) + 1;
    });
    const sortedSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]);
    const TOP_N = 8;
    const topSpecies = sortedSpecies.slice(0, TOP_N);
    const otherCount = sortedSpecies.slice(TOP_N).reduce((sum, [, c]) => sum + c, 0);

    const speciesTitle = document.createElement('div');
    speciesTitle.className = 'report-section-title';
    speciesTitle.textContent = sortedSpecies.length > TOP_N ? `Species Distribution (top ${TOP_N})` : 'Species Distribution';
    body.appendChild(speciesTitle);

    const maxCount = topSpecies.length > 0 ? topSpecies[0][1] : 1;
    const speciesList = document.createElement('div');
    topSpecies.forEach(([species, count]) => {
        const pct = ((count / total) * 100).toFixed(1);
        const barPct = (count / maxCount) * 100;
        const row = document.createElement('div');
        row.className = 'report-bar-row';
        row.innerHTML = `
            <span class="report-bar-label" title="${escapeHtml(species)}">${escapeHtml(species)}</span>
            <span class="report-bar-track"><span class="report-bar-fill" style="width:${barPct}%; background:#647c64;"></span></span>
            <span class="report-bar-value">${count} (${pct}%)</span>
        `;
        speciesList.appendChild(row);
    });
    if (otherCount > 0) {
        const pct = ((otherCount / total) * 100).toFixed(1);
        const barPct = (otherCount / maxCount) * 100;
        const row = document.createElement('div');
        row.className = 'report-bar-row';
        row.innerHTML = `
            <span class="report-bar-label">Other (${sortedSpecies.length - TOP_N} species)</span>
            <span class="report-bar-track"><span class="report-bar-fill" style="width:${Math.min(barPct, 100)}%; background:#aab3aa;"></span></span>
            <span class="report-bar-value">${otherCount} (${pct}%)</span>
        `;
        speciesList.appendChild(row);
    }
    body.appendChild(speciesList);

    // --- Diameter breakdown (reuses the same DIAMETER_CLASSES buckets
    // as the Diameter filter dropdown, so labels always match) --------
    const diameterCounts = {};
    DIAMETER_CLASSES.forEach((cls) => { diameterCounts[cls.key] = 0; });
    let unknownDiameterCount = 0;
    filteredFeatures.forEach((f) => {
        const val = f.properties.DBH;
        if (val === null || val === undefined || val === '' || isNaN(Number(val))) {
            unknownDiameterCount += 1;
            return;
        }
        const num = Number(val);
        const cls = DIAMETER_CLASSES.find((c) => num >= c.min && num <= c.max);
        if (cls) diameterCounts[cls.key] += 1;
    });

    const diameterTitle = document.createElement('div');
    diameterTitle.className = 'report-section-title';
    diameterTitle.textContent = 'Diameter Breakdown';
    body.appendChild(diameterTitle);

    const diameterMaxCount = Math.max(...Object.values(diameterCounts), unknownDiameterCount, 1);
    const diameterList = document.createElement('div');
    DIAMETER_CLASSES.forEach((cls) => {
        const count = diameterCounts[cls.key];
        if (count === 0) return;
        const pct = ((count / total) * 100).toFixed(1);
        const barPct = (count / diameterMaxCount) * 100;
        const row = document.createElement('div');
        row.className = 'report-bar-row';
        row.innerHTML = `
            <span class="report-bar-label">${escapeHtml(cls.label)}</span>
            <span class="report-bar-track"><span class="report-bar-fill" style="width:${barPct}%; background:#647c64;"></span></span>
            <span class="report-bar-value">${count} (${pct}%)</span>
        `;
        diameterList.appendChild(row);
    });
    if (unknownDiameterCount > 0) {
        const pct = ((unknownDiameterCount / total) * 100).toFixed(1);
        const barPct = (unknownDiameterCount / diameterMaxCount) * 100;
        const row = document.createElement('div');
        row.className = 'report-bar-row';
        row.innerHTML = `
            <span class="report-bar-label">Unknown</span>
            <span class="report-bar-track"><span class="report-bar-fill" style="width:${barPct}%; background:#aab3aa;"></span></span>
            <span class="report-bar-value">${unknownDiameterCount} (${pct}%)</span>
        `;
        diameterList.appendChild(row);
    }
    body.appendChild(diameterList);

    // --- Embodied carbon estimate ------------------------------------
    const carbon = computeEmbodiedCarbonEstimate(filteredFeatures);
    const carbonTitle = document.createElement('div');
    carbonTitle.className = 'report-section-title';
    carbonTitle.textContent = 'Estimated Embodied Carbon';
    body.appendChild(carbonTitle);

    const carbonStatRow = document.createElement('div');
    carbonStatRow.className = 'report-stat-row';
    const tonnes = carbon.totalKgCO2e / 1000;
    carbonStatRow.innerHTML = `
        <div class="report-stat">
            <div class="value">${carbon.totalKgCO2e.toLocaleString(undefined, { maximumFractionDigits: 0 })} kgCO2e</div>
            <div class="label">${tonnes.toFixed(1)} tonnes CO2e</div>
        </div>
    `;
    body.appendChild(carbonStatRow);

    const excludedNote = carbon.treesExcludedNoDBH > 0
        ? `<p>${carbon.treesExcludedNoDBH.toLocaleString()} of ${total.toLocaleString()} trees have no recorded diameter and were excluded from this estimate.</p>`
        : '';
    const taperPct = carbon.treesUsed > 0 ? ((carbon.treesTaperModel / carbon.treesUsed) * 100) : 0;
    const fallbackPct = carbon.treesUsed > 0 ? ((carbon.treesFallback / carbon.treesUsed) * 100) : 0;

    const methodology = document.createElement('div');
    methodology.className = 'report-methodology';
    methodology.innerHTML = `
        <p><b>Methodology:</b></p>
        <p><b>${carbon.treesTaperModel.toLocaleString()} of ${carbon.treesUsed.toLocaleString()} trees (${taperPct.toFixed(1)}%)</b> use real per-species stem volume from Ung, Guo &amp; Fortin (2013), "Canadian national taper models" (<i>The Forestry Chronicle</i>, 89(2), 211&ndash;224) - the published model underlying Natural Resources Canada's own <a href="https://apps-scf-cfs.rncan.gc.ca/calc/en/volume-calculator" target="_blank" rel="noopener">Forest Volume Calculator</a>. From DBH alone, this predicts total height (H = &beta;&#8320; &times; DBH<sup>&beta;&#8321;</sup>) and integrates the tree's actual tapering stem shape (not a uniform cylinder) via Smalian's formula, the same numerical method the paper itself uses. Random effects requiring site-specific calibration data are omitted, consistent with the paper's own framing of the fixed-effects-only model as appropriate for national-level estimates without local stand data.</p>
        <p><b>${carbon.treesFallback.toLocaleString()} tree${carbon.treesFallback === 1 ? '' : 's'} (${fallbackPct.toFixed(1)}%)</b> ${carbon.treesFallback === 1 ? 'has' : 'have'} a species not among the paper's 34 covered species, and fall back to a simple cylinder (DBH &times; one assumed ${FALLBACK_ASSUMED_TREE_HEIGHT_M}m height for every tree) rather than a fabricated "average species" taper curve, which would not be statistically meaningful given how differently each species' coefficients behave.</p>
        <p>For every tree, volume &times; an assumed wood density of ${ASSUMED_WOOD_DENSITY_KG_PER_M3} kg/m&sup3; gives mass; mass &times; ${TIMBER_CARBON_FACTOR_KG_CO2E_PER_KG} kgCO2e/kg gives embodied carbon. Carbon factor source: ICE (Inventory of Carbon &amp; Energy) database - "Timber, average of all data, no carbon storage". <b>Wood density is still an unresolved rough placeholder</b> - ICE's own documentation gives a wide range (350&ndash;800 kg/m&sup3;) rather than one fixed figure for this general category, unaffected by the taper-model upgrade above.</p>
        ${excludedNote}
        <p>This is an illustrative estimate, not a substitute for a certified carbon assessment.</p>
    `;
    body.appendChild(methodology);

    openResultsModal();
}

//===================================================================
// Results Summary modal open/close wiring
//===================================================================
const resultsModalBackdrop = document.getElementById('resultsModalBackdrop');
const resultsModalClose = document.getElementById('resultsModalClose');
const resultsModalPrint = document.getElementById('resultsModalPrint');
const outputResultsSummaryBtn = document.getElementById('output-results-summary');

function openResultsModal() {
    resultsModalBackdrop.classList.add('open');
}
function closeResultsModal() {
    resultsModalBackdrop.classList.remove('open');
}

outputResultsSummaryBtn.addEventListener('click', generateResultsSummary);
resultsModalClose.addEventListener('click', closeResultsModal);
resultsModalPrint.addEventListener('click', () => window.print());
// Click on the dark backdrop (not the modal card itself) closes it.
resultsModalBackdrop.addEventListener('click', (e) => {
    if (e.target === resultsModalBackdrop) closeResultsModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resultsModalBackdrop.classList.contains('open')) closeResultsModal();
});
