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
// Two independent palettes - one per classification - since C30 lets the
// map dot color / cluster donuts / Legend tab represent EITHER
// classification, switched via the Cluster Group Type toggle (see that
// section further down). Both palettes share the same purple for
// "Other Species" (group 8) so that bucket reads consistently no matter
// which classification is currently selected.
const ECO_GROUP_COLORS = {
    1: '#6abbe8',
    2: '#e8a822',
    3: '#f1e655',
    4: '#19a780',
    5: '#d186b0',
    6: '#1a80ba',
    7: '#d96f27',
    8: '#8E24AA'  // purple (Other Species)
};

const BUILDING_GROUP_COLORS = {
    1: '#6abbe8',
    2: '#2c2cce',
    3: '#86c76b',
    4: '#e21f26',
    5: '#fbf49c',
    6: '#b15a28',
    7: '#f69999',
    8: '#8E24AA'  // purple (Other Species)
};

// Small helpers so any code that needs "the palette / group keys / id
// field / display label for whichever group type is currently active"
// can ask once instead of re-implementing an eco-vs-building branch
// every time. groupType is always the string 'eco' or 'building'.
function groupColorsForType(groupType) {
    return groupType === 'building' ? BUILDING_GROUP_COLORS : ECO_GROUP_COLORS;
}
function groupKeysForType(groupType) {
    return groupType === 'building' ? buildingGroupKeys : ecoGroupKeys;
}
function groupIdFieldForType(groupType) {
    return groupType === 'building' ? '_buildingGroupId' : '_ecoGroupId';
}
function groupLabelForType(groupType) {
    return groupType === 'building' ? 'Building Group' : 'Ecological Group';
}

// Builds the MapLibre "match" expression for the circle-color paint
// property of the unclustered "o_trees" layer, for whichever group type
// is passed in. Falls back to the old neutral green if a tree somehow
// has no id set for that field.
function buildGroupColorMatchExpr(groupType) {
    const colors = groupColorsForType(groupType);
    const idField = groupIdFieldForType(groupType);
    return [
        'match', ['get', idField],
        1, colors[1],
        2, colors[2],
        3, colors[3],
        4, colors[4],
        5, colors[5],
        6, colors[6],
        7, colors[7],
        8, colors[8],
        /* default */ '#647c64'
    ];
}

// Which classification the individual tree dot colors, cluster donuts,
// and the Legend tab currently represent - 'eco' or 'building'. Toggled
// via the Cluster Group Type switch below the city switcher (see that
// section further down, near the city switcher wiring). Independent of
// the Filters tab's two Group dropdowns, which still filter by either
// classification regardless of this toggle, and independent of city.
let selectedClusterGroupType = 'eco';

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
// maplibregl.Marker. Slice proportions come from the g1..g8 / bg1..bg8
// sums MapLibre computes automatically via clusterProperties (see
// source definition below) - no extra per-cluster query needed. This
// mirrors the standard Mapbox/MapLibre "HTML cluster" pattern. Takes an
// explicit `colors` palette (ECO_GROUP_COLORS or BUILDING_GROUP_COLORS)
// so the same builder works for whichever group type is selected.
//===================================================================
function buildDonutMarkerEl(counts, totalCount, clusterId, sourceGetter, colors = ECO_GROUP_COLORS) {
    const stops = [];
    let cumulative = 0;
    for (let g = 1; g <= 8; g++) {
        const val = counts[g] || 0;
        if (val === 0 || totalCount === 0) continue;
        const start = (cumulative / totalCount) * 360;
        cumulative += val;
        const end = (cumulative / totalCount) * 360;
        stops.push(`${colors[g]} ${start}deg ${end}deg`);
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

    // Which precomputed per-cluster sums to read (g1..g8 for Ecological
    // Group, bg1..bg8 for Building Group - both are always computed by
    // clusterProperties, see map.on('load') below) and which palette to
    // draw them with, for whichever group type is currently selected.
    const countPrefix = selectedClusterGroupType === 'building' ? 'bg' : 'g';
    const colors = groupColorsForType(selectedClusterGroupType);

    for (const feature of features) {
        const props = feature.properties;
        const id = props.cluster_id;
        // querySourceFeatures can return the same cluster more than once
        // near tile boundaries - only build/keep one marker per cluster_id.
        if (newMarkers[id]) continue;

        let marker = clusterMarkersOnScreen[id];
        if (!marker) {
            const counts = {};
            for (let g = 1; g <= 8; g++) counts[g] = props[`${countPrefix}${g}`] || 0;
            const coords = feature.geometry.coordinates;
            const el = buildDonutMarkerEl(counts, props.point_count, id, () => map.getSource('o_trees'), colors);
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

//-------------------------------------------------------------------
// Shared request helpers. A single failed request used to silently drop
// that whole page of trees (no timeout, no status check, no retry); now
// every request has a timeout, is checked for HTTP / service errors, and
// is retried with exponential backoff before a page is given up on.
//-------------------------------------------------------------------
const FETCH_TIMEOUT_MS = 30000;
const FETCH_MAX_ATTEMPTS = 3;
const FETCH_BACKOFF_MS = 600;

function sleepMs(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function withRetry(fn, attempts) {
    const max = attempts || FETCH_MAX_ATTEMPTS;
    let lastErr;
    for (let attempt = 1; attempt <= max; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            // A 4xx (other than timeout / rate-limit) will fail identically
            // every time - don't spend backoff time on it.
            if (err && err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429) break;
            if (attempt < max) await sleepMs(FETCH_BACKOFF_MS * Math.pow(2, attempt - 1) + Math.random() * 300);
        }
    }
    throw lastErr;
}

// fetch() + timeout + HTTP check + JSON parse. `validate(data)` may throw
// to reject an HTTP-200 response that is really an error payload (ArcGIS
// reports many failures that way).
async function fetchJsonChecked(url, validate) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const resp = await fetch(url, { signal: controller.signal });
        if (!resp.ok) {
            const httpErr = new Error(`HTTP ${resp.status} ${resp.statusText}`);
            httpErr.status = resp.status;
            throw httpErr;
        }
        const data = await resp.json();
        if (validate) validate(data);
        return data;
    } finally {
        clearTimeout(timer);
    }
}

// Runs `worker(offset)` over `offsets` with limited concurrency.
async function runPool(offsets, concurrency, worker) {
    let next = 0;
    const loop = async () => {
        while (next < offsets.length) {
            const myOffset = offsets[next];
            next += 1;
            await worker(myOffset);
        }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, offsets.length) || 1 }, loop));
}

async function fetchAllTrees(onPageLoaded) {
    // 1. Find out how many records exist in total.
    const countUrl = `${TREE_QUERY_BASE}?where=1%3D1&returnCountOnly=true&f=json`;
    const countData = await withRetry(() => fetchJsonChecked(countUrl, (d) => {
        if (d.error) throw new Error(d.error.message || 'service error');
    }));
    const total = countData.count;
    if (!total || total <= 0) {
        throw new Error('Could not determine tree count from the Ottawa Forestry service.');
    }

    // 2. Build the list of page offsets we need to fetch.
    const numPages = Math.ceil(total / PAGE_SIZE);
    const offsets = Array.from({ length: numPages }, (_, i) => i * PAGE_SIZE);

    let loadedCount = 0;
    let failedPages = 0;

    // geometryPrecision=6 trims every coordinate to 6 decimals (~11 cm), the
    // same precision the Excel export uses - noticeably smaller pages.
    async function fetchPage(offset) {
        const url = `${TREE_QUERY_BASE}?where=1%3D1&outFields=${TREE_OUT_FIELDS}&f=geojson`
            + `&geometryPrecision=6&resultRecordCount=${PAGE_SIZE}&resultOffset=${offset}&orderByFields=OBJECTID`;
        const data = await withRetry(() => fetchJsonChecked(url, (d) => {
            if (d.error) throw new Error(d.error.message || 'service error');
            if (!Array.isArray(d.features)) throw new Error('response had no features array');
        }));
        const feats = data.features;
        const expected = Math.min(PAGE_SIZE, total - offset);
        if (feats.length < expected) {
            console.warn(`Ottawa page at offset ${offset} returned ${feats.length} of ${expected} expected trees.`);
        }
        loadedCount += feats.length;
        // Stream this page's features to the caller immediately instead
        // of waiting for every page to finish, so the map can render
        // progressively.
        if (onPageLoaded) onPageLoaded(feats, loadedCount, total, failedPages);
    }

    // 3. Fetch pages with limited concurrency. A page that still fails after
    // its own retries is set aside and given one more, gentler pass at the
    // end (low concurrency) before being reported as failed.
    const deferred = [];
    await runPool(offsets, PAGE_CONCURRENCY, async (offset) => {
        try { await fetchPage(offset); } catch (err) {
            console.warn(`Tree page at offset ${offset} failed, will retry after the main pass:`, err);
            deferred.push(offset);
        }
    });
    if (deferred.length > 0) {
        await sleepMs(1500);
        await runPool(deferred, 2, async (offset) => {
            try { await fetchPage(offset); } catch (err) {
                failedPages += 1;
                console.warn(`Failed to load tree page at offset ${offset}:`, err);
                if (onPageLoaded) onPageLoaded([], loadedCount, total, failedPages);
            }
        });
    }

    if (failedPages > 0) {
        console.warn(`${failedPages} of ${numPages} pages failed to load - dataset may be incomplete.`);
    }
    return { failedPages };
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
        const httpErr = new Error(`Toronto CKAN API responded with HTTP ${resp.status} ${resp.statusText}.`);
        httpErr.status = resp.status;
        throw httpErr;
    }
    return resp.json();
}

// Only the columns normalizeTorontoRecord() actually reads - the full
// table carries ~a dozen more per row, ~688k rows. If the portal ever
// rejects the `fields` list, fetchAllTorontoTrees() falls back to
// requesting everything.
const TORONTO_FIELDS = ['OBJECTID', 'STRUCTID', 'ADDRESS', 'STREETNAME', 'WARD', 'BOTANICAL_NAME', 'COMMON_NAME', 'DBH_TRUNK', 'geometry'].join(',');

async function fetchAllTorontoTrees(onPageLoaded) {
    const validate = (d) => {
        if (!d || !d.success || !d.result || !Array.isArray(d.result.records)) {
            throw new Error('Toronto CKAN datastore_search request returned an unsuccessful response.');
        }
    };
    const pageUrl = (offset, useFields) => `${TORONTO_ACTION_BASE}?resource_id=${TORONTO_RESOURCE_ID}&limit=${TORONTO_PAGE_SIZE}&offset=${offset}`
        + (useFields ? `&fields=${encodeURIComponent(TORONTO_FIELDS)}` : '');
    const getPage = async (offset, useFields) => {
        const data = await withRetry(() => torontoFetchJson(pageUrl(offset, useFields)));
        validate(data);
        return data;
    };

    // 1. First page also reports the total record count (result.total),
    // so no separate count-only request is needed the way Ottawa's
    // ArcGIS service requires. Tries the trimmed column list first.
    let useFields = true;
    let firstData;
    try {
        firstData = await getPage(0, true);
    } catch (err) {
        console.warn('Toronto request with a trimmed column list failed; retrying with all columns:', err);
        useFields = false;
        firstData = await getPage(0, false);
    }
    const total = firstData.result.total || 0;
    let loadedCount = firstData.result.records.length;
    let failedPages = 0;
    if (onPageLoaded) onPageLoaded(firstData.result.records, loadedCount, total, failedPages);

    if (loadedCount >= total) return { failedPages: 0 };

    // 2. Remaining pages, same pool + deferred-retry pattern as Ottawa.
    const numPages = Math.ceil(total / TORONTO_PAGE_SIZE);
    const offsets = [];
    for (let i = 1; i < numPages; i++) offsets.push(i * TORONTO_PAGE_SIZE);

    async function fetchPage(offset) {
        const data = await getPage(offset, useFields);
        const recs = data.result.records;
        loadedCount += recs.length;
        if (onPageLoaded) onPageLoaded(recs, loadedCount, total, failedPages);
    }

    const deferred = [];
    await runPool(offsets, TORONTO_PAGE_CONCURRENCY, async (offset) => {
        try { await fetchPage(offset); } catch (err) {
            console.warn(`Toronto tree page at offset ${offset} failed, will retry after the main pass:`, err);
            deferred.push(offset);
        }
    });
    if (deferred.length > 0) {
        await sleepMs(1500);
        await runPool(deferred, 2, async (offset) => {
            try { await fetchPage(offset); } catch (err) {
                failedPages += 1;
                console.warn(`Failed to load Toronto tree page at offset ${offset}:`, err);
                if (onPageLoaded) onPageLoaded([], loadedCount, total, failedPages);
            }
        });
    }

    if (failedPages > 0) {
        console.warn(`${failedPages} of ${numPages - 1} Toronto pages failed to load - dataset may be incomplete.`);
    }
    return { failedPages };
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
// Set when a finished load still had pages that failed every retry, so the
// "Showing X of Y" line can't quietly imply the dataset is complete.
let loadWarning = '';
function setStatusText(text) {
    const el = document.getElementById('filter-result');
    if (el) el.textContent = text + (loadWarning && !stillLoadingTrees ? ` ⚠ ${loadWarning}` : '');
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
    // each of the 8 species groups - for BOTH classifications (g1..g8
    // for Ecological Group, bg1..bg8 for Building Group), so the
    // cluster donuts can switch between them instantly via the Cluster
    // Group Type toggle without needing to re-cluster. This comes for
    // free as part of clustering (no extra query per cluster).
    const clusterProperties = {};
    for (let g = 1; g <= 8; g++) {
        clusterProperties[`g${g}`] = ['+', ['case', ['==', ['get', '_ecoGroupId'], g], 1, 0]];
        clusterProperties[`bg${g}`] = ['+', ['case', ['==', ['get', '_buildingGroupId'], g], 1, 0]];
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
    // driven by whichever classification is currently selected (see
    // buildGroupColorMatchExpr / selectedClusterGroupType above) - kept
    // in sync with the cluster donuts and Legend tab.
    map.addLayer({
        id: 'o_trees',
        type: 'circle',
        source: 'o_trees',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-radius': 5,
            'circle-color': buildGroupColorMatchExpr(selectedClusterGroupType),
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
const RENDER_THROTTLE_MAX_MS = 6000;
let lastRenderTime = 0;
let trailingRenderTimeout = null;
// The cost of each re-cluster grows with the number of trees loaded so
// far, so the gap between renders grows with it too (about 1 ms per 100
// trees: ~750 ms early on, ~3 s at 300k, capped at 6 s). Early pages still
// appear almost immediately; late in a big load the map stops thrashing,
// and the final render is guaranteed when the load completes.
function currentRenderInterval() {
    return Math.min(RENDER_THROTTLE_MAX_MS, Math.max(RENDER_THROTTLE_MS, allTreesData.features.length / 100));
}
function scheduleRender() {
    const now = performance.now();
    const elapsed = now - lastRenderTime;
    const interval = currentRenderInterval();
    if (elapsed >= interval) {
        lastRenderTime = now;
        updateFilters();
    } else if (!trailingRenderTimeout) {
        trailingRenderTimeout = setTimeout(() => {
            trailingRenderTimeout = null;
            lastRenderTime = performance.now();
            updateFilters();
        }, interval - elapsed);
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
    loadWarning = '';
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
        const pctDone = total > 0 ? ` (${Math.min(100, Math.floor((loaded / total) * 100))}%)` : '';
        setStatusText(`Loading ${cityLabel} trees... ${loaded.toLocaleString()} / ${total.toLocaleString()}${pctDone}${failNote}`);
        scheduleRender();
    }

    const fetchFn = city === 'toronto' ? fetchAllTorontoTrees : fetchAllTrees;

    fetchFn(handlePage)
        .then((outcome) => {
            if (myGeneration !== loadGeneration) return;
            stillLoadingTrees = false;
            const failed = outcome && outcome.failedPages ? outcome.failedPages : 0;
            loadWarning = failed > 0
                ? `${failed} page${failed === 1 ? '' : 's'} of trees (up to ${(failed * PAGE_SIZE).toLocaleString()}) could not be loaded - reload to retry.`
                : '';
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

// Caches each city's fetched district FeatureCollection (raw, before
// it's handed to the map source) so the ONE fetch is reused both by the
// visual Districts layer (addDistrictsLayers/ensureDistrictsLoadedForCity
// below) and by the tree-to-district spatial join used for the Results
// Summary CSV export (findDistrictForPoint, further below) - the two no
// longer trigger separate network requests for the same city's wards.
// Each cached feature also gets a precomputed `_bbox` (see
// computeGeometryBbox) so the spatial join can cheaply skip most
// polygons before running the exact point-in-polygon test.
const districtsDataCache = {};

async function getDistrictsData(city) {
    if (districtsDataCache[city]) return districtsDataCache[city];
    const data = city === 'toronto' ? await fetchTorontoDistricts() : await fetchOttawaDistricts();
    data.features.forEach((f, i) => {
        f.properties._bbox = computeGeometryBbox(f.geometry);
        // _districtKey = this ward's index in the FeatureCollection. It's
        // the feature id the choropleth shades by (the 'districts' map
        // source uses promoteId: '_districtKey' so setFeatureState can
        // address a ward without re-uploading the polygons), and it's the
        // value cached on each tree as _wardIdx by the per-district stats
        // engine below.
        f.properties._districtKey = i;
        f.properties._areaKm2 = computeGeometryAreaKm2(f.geometry);
    });
    districtsDataCache[city] = data;
    // Self-check for whoever loads the app: the wards' summed polygon area
    // should land close to the per-city land area in CITY_LAND_AREA_HECTARES
    // (those figures came from dissolving these same boundaries in QGIS).
    const summedKm2 = data.features.reduce((sum, f) => sum + f.properties._areaKm2, 0);
    const expectedHa = CITY_LAND_AREA_HECTARES[city];
    console.info(`[districts] ${city}: ${data.features.length} wards, summed polygon area ${summedKm2.toFixed(1)} km2`
        + (expectedHa ? ` (CITY_LAND_AREA_HECTARES says ${(expectedHa / 100).toFixed(1)} km2)` : ''));
    return data;
}

//===================================================================
// Tree -> District spatial join (point-in-polygon)
//
// The Districts layer above only ever attached _districtName/
// _districtNumber to the WARD POLYGON features themselves - individual
// TREE features never got a district assigned, so any report or export
// that tried to read a tree's props._districtName found nothing. This
// section does the actual point-in-polygon test needed to answer "which
// district does this tree fall inside", using a small hand-rolled
// ray-casting implementation rather than pulling in a geometry library
// (turf.js etc.) for one function - it correctly handles both Polygon
// and MultiPolygon ward shapes, including polygons with holes.
//===================================================================

// Standard ray-casting point-in-ring test (even-odd rule). `ring` is an
// array of [lng, lat] pairs (a GeoJSON linear ring); `point` is [lng, lat].
function rayCastingPointInRing(point, ring) {
    // Detailed rings (real ward boundaries run to thousands of vertices)
    // use a y-bucket edge index so a test scans only the edges that can
    // cross the ray instead of every edge - same result, ~100x less work.
    if (ring.length > RING_INDEX_MIN_VERTICES) return pointInIndexedRing(point, getRingIndex(ring));
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];
        const intersects = ((yi > point[1]) !== (yj > point[1]))
            && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
        if (intersects) inside = !inside;
    }
    return inside;
}

// --- y-bucket edge index for large rings ------------------------------
// The ray cast horizontally from the point only ever crosses edges whose
// y-range straddles the point's y, so edges are pre-sorted into horizontal
// bands and a lookup reads just one band. Built lazily the first time a
// ring is tested and cached against the ring array itself (WeakMap).
const RING_INDEX_MIN_VERTICES = 64;
const ringIndexCache = new WeakMap();

function getRingIndex(ring) {
    let idx = ringIndexCache.get(ring);
    if (!idx) {
        idx = buildRingIndex(ring);
        ringIndexCache.set(ring, idx);
    }
    return idx;
}

function buildRingIndex(ring) {
    const n = ring.length;
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) {
        if (ring[i][1] < minY) minY = ring[i][1];
        if (ring[i][1] > maxY) maxY = ring[i][1];
    }
    const bandCount = Math.max(1, Math.min(1024, Math.floor(n / 4)));
    const bandH = (maxY - minY) / bandCount || 1;
    const bands = Array.from({ length: bandCount }, () => []);
    for (let i = 0; i < n; i++) {
        const a = ring[i], b = ring[(i + 1) % n];
        const lo = Math.min(a[1], b[1]), hi = Math.max(a[1], b[1]);
        const k0 = Math.max(0, Math.min(bandCount - 1, Math.floor((lo - minY) / bandH)));
        const k1 = Math.max(0, Math.min(bandCount - 1, Math.floor((hi - minY) / bandH)));
        for (let k = k0; k <= k1; k++) bands[k].push(i);
    }
    return { ring, n, minY, maxY, bandH, bandCount, bands };
}

function pointInIndexedRing(point, idx) {
    const x = point[0], y = point[1];
    if (y < idx.minY || y > idx.maxY) return false; // ray can't cross anything
    const k = Math.max(0, Math.min(idx.bandCount - 1, Math.floor((y - idx.minY) / idx.bandH)));
    const band = idx.bands[k];
    const ring = idx.ring, n = idx.n;
    let inside = false;
    for (let b = 0; b < band.length; b++) {
        const i = band[b];
        const a = ring[i], c = ring[(i + 1) % n];
        const yi = a[1], yj = c[1];
        if ((yi > y) !== (yj > y) && x < (c[0] - a[0]) * (y - yi) / (yj - yi) + a[0]) inside = !inside;
    }
    return inside;
}

// A GeoJSON Polygon's `coordinates` is an array of rings: the first is
// the outer boundary, any further rings are holes cut out of it. A
// point counts as inside the polygon only if it's inside the outer ring
// AND not inside any hole.
function pointInPolygonCoords(point, polygonCoords) {
    if (!polygonCoords || polygonCoords.length === 0) return false;
    if (!rayCastingPointInRing(point, polygonCoords[0])) return false;
    for (let i = 1; i < polygonCoords.length; i++) {
        if (rayCastingPointInRing(point, polygonCoords[i])) return false;
    }
    return true;
}

// Handles both Polygon and MultiPolygon ward geometries (Toronto's city
// wards, like the tree data, come back as either shape).
function pointInGeometry(point, geometry) {
    if (!geometry) return false;
    if (geometry.type === 'Polygon') return pointInPolygonCoords(point, geometry.coordinates);
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some((polyCoords) => pointInPolygonCoords(point, polyCoords));
    }
    return false;
}

// Cheap [minLng, minLat, maxLng, maxLat] bounding box for a Polygon or
// MultiPolygon, computed once per district and cached on the feature
// (see getDistrictsData) so the join below can reject most wards with a
// handful of comparisons instead of a full ray-casting pass.
function computeGeometryBbox(geometry) {
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    const visitRing = (ring) => {
        ring.forEach(([lng, lat]) => {
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
        });
    };
    if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach(visitRing);
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((poly) => poly.forEach(visitRing));
    }
    return [minLng, minLat, maxLng, maxLat];
}
function pointInBbox(lng, lat, bbox) {
    return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

// Returns { name, number } for whichever district (if any) contains
// [lng, lat], or null if the point falls outside every district polygon
// (e.g. a tree just outside the municipal boundary, or a small gap
// between ward shapes). `districtsData` is a FeatureCollection from
// getDistrictsData(), whose features already carry a cached `_bbox`.
function findDistrictForPoint(lng, lat, districtsData) {
    const idx = findDistrictIndexForPoint(lng, lat, districtsData);
    if (idx < 0) return null;
    const f = districtsData.features[idx];
    return { name: f.properties._districtName, number: f.properties._districtNumber };
}

// Same search, but returns the ward's index in districtsData.features
// (-1 = outside every ward). `hintIdx` is an optional ward to try FIRST -
// consecutive trees tend to sit in the same ward, so trying the last hit
// first skips most of the polygon scan on a spatially-coherent stream.
function findDistrictIndexForPoint(lng, lat, districtsData, hintIdx) {
    if (!districtsData) return -1;
    const feats = districtsData.features;
    if (hintIdx !== undefined && hintIdx >= 0 && hintIdx < feats.length) {
        const h = feats[hintIdx];
        if (pointInBbox(lng, lat, h.properties._bbox) && pointInGeometry([lng, lat], h.geometry)) return hintIdx;
    }
    for (let i = 0; i < feats.length; i++) {
        if (i === hintIdx) continue; // already tested above
        const f = feats[i];
        if (!pointInBbox(lng, lat, f.properties._bbox)) continue;
        if (pointInGeometry([lng, lat], f.geometry)) return i;
    }
    return -1;
}

//===================================================================
// Per-district statistics engine (pure logic - no DOM, no map)
//
// Powers the District Choropleth, the "By District" section of the
// Results Summary, the ward-click popup, and the Excel "By District"
// sheet. One pass over the currently-filtered trees produces, for every
// ward: tree count, wood volume, embodied carbon, and the count/volume
// split by Ecological Group and Building Group, species counts, and
// diameter-class counts. Trees falling outside every ward polygon land in
// a separate "Outside districts" bucket so the ward totals always
// reconcile with the Results Summary's overall figures.
//
// Two per-tree values are cached directly on tree.properties the first
// time they're needed, so repeat runs (every filter change, with the
// choropleth live) cost a cheap loop rather than ~300k point-in-polygon
// tests and taper integrations:
//   _wardIdx  - index of the containing ward (-1 = outside all wards)
//   _volM3    - stem volume in m3 (null = no usable DBH)
// Both are properties of the tree + the city's fixed ward polygons, so
// they never go stale (allTreesData is rebuilt on a city switch).
//===================================================================

const EARTH_RADIUS_M = 6371008.8;

// Spherical ring area in m2 (Chamberlain & Duquette). `ring` is a GeoJSON
// linear ring of [lng, lat] pairs; works whether or not it's closed.
function ringAreaM2(ring) {
    const n = ring.length;
    if (n < 3) return 0;
    const toRad = Math.PI / 180;
    let total = 0;
    for (let i = 0; i < n; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % n];
        total += (b[0] - a[0]) * toRad * (2 + Math.sin(a[1] * toRad) + Math.sin(b[1] * toRad));
    }
    return Math.abs(total * EARTH_RADIUS_M * EARTH_RADIUS_M / 2);
}

// Polygon area = outer ring minus any holes; MultiPolygon = sum of parts.
function computeGeometryAreaKm2(geometry) {
    const polygonArea = (rings) => rings.reduce((sum, ring, i) => sum + (i === 0 ? 1 : -1) * ringAreaM2(ring), 0);
    let m2 = 0;
    if (geometry.type === 'Polygon') {
        m2 = polygonArea(geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
        m2 = geometry.coordinates.reduce((sum, poly) => sum + polygonArea(poly), 0);
    }
    return m2 / 1e6;
}

// Embodied carbon is linear in volume (volume x density x factor), so
// per-ward carbon is derived from per-ward volume - identical to what
// computeEmbodiedCarbonEstimate() does for the whole selection.
function carbonKgFromVolume(volumeM3) {
    return volumeM3 * ASSUMED_WOOD_DENSITY_KG_PER_M3 * TIMBER_CARBON_FACTOR_KG_CO2E_PER_KG;
}

function getCachedTreeVolumeM3(props) {
    if (props._volM3 === undefined) {
        const r = computeTreeVolumeM3(props);
        props._volM3 = r ? r.volumeM3 : null;
    }
    return props._volM3;
}

// Diameter bucket key for a DBH value ('unknown' when missing/non-numeric),
// using the same DIAMETER_CLASSES the Diameter filter and report use.
function diameterClassKeyFor(dbh) {
    if (dbh === null || dbh === undefined || dbh === '' || isNaN(Number(dbh))) return 'unknown';
    const num = Number(dbh);
    const cls = DIAMETER_CLASSES.find((c) => num >= c.min && num <= c.max);
    return cls ? cls.key : 'unknown';
}

function newWardStats(idx, name, number, areaKm2) {
    const zeroGroups = () => { const o = {}; for (let g = 1; g <= 8; g++) o[g] = 0; return o; };
    return {
        idx, name, number, areaKm2,
        count: 0,
        volumeM3: 0,
        treesWithVolume: 0,
        ecoCount: zeroGroups(), bldCount: zeroGroups(),
        ecoVol: zeroGroups(), bldVol: zeroGroups(),
        species: {},
        diameter: {}
    };
}

// Resolves after the browser has had a chance to paint/handle input -
// lets the chunked loops below keep the page responsive.
function yieldToBrowser() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

let districtStatsRunId = 0;

// Aggregates `features` (already filtered) per ward. Async + chunked so
// the first run over a whole city (which pays for the one-time tree->ward
// assignment) doesn't freeze the page; `onProgress(0..1)` is optional.
// Returns null if a newer call started while this one was yielding (the
// caller should just drop the stale result).
async function computeDistrictStats(features, districtsData, onProgress) {
    districtStatsRunId += 1;
    const myRun = districtStatsRunId;
    const wards = districtsData.features.map((f, i) =>
        newWardStats(i, f.properties._districtName, f.properties._districtNumber, f.properties._areaKm2));
    const outside = newWardStats(-1, 'Outside districts', null, null);

    const CHUNK = 20000;
    let hint;
    for (let start = 0; start < features.length; start += CHUNK) {
        const end = Math.min(start + CHUNK, features.length);
        for (let i = start; i < end; i++) {
            const props = features[i].properties;
            let idx = props._wardIdx;
            if (idx === undefined) {
                const c = features[i].geometry && features[i].geometry.coordinates;
                idx = (c && typeof c[0] === 'number' && typeof c[1] === 'number')
                    ? findDistrictIndexForPoint(c[0], c[1], districtsData, hint)
                    : -1;
                props._wardIdx = idx;
            }
            if (idx >= 0) hint = idx;
            const s = idx >= 0 ? wards[idx] : outside;

            s.count += 1;
            const eco = props._ecoGroupId || 8;
            const bld = props._buildingGroupId || 8;
            s.ecoCount[eco] += 1;
            s.bldCount[bld] += 1;
            const vol = getCachedTreeVolumeM3(props);
            if (vol !== null) {
                s.volumeM3 += vol;
                s.treesWithVolume += 1;
                s.ecoVol[eco] += vol;
                s.bldVol[bld] += vol;
            }
            const sp = props.SPECIES || 'Unknown';
            s.species[sp] = (s.species[sp] || 0) + 1;
            const dk = diameterClassKeyFor(props.DBH);
            s.diameter[dk] = (s.diameter[dk] || 0) + 1;
        }
        if (end < features.length) {
            if (onProgress) onProgress(end / features.length);
            await yieldToBrowser();
            if (myRun !== districtStatsRunId) return null; // superseded
        }
    }
    return { wards, outside, total: features.length };
}

// Choropleth scale options (shading only). 'total' = raw district totals;
// the others divide by the district's area in that unit. Areas are stored in
// km2 (w.areaKm2), so km2PerUnit converts: 1 km2 = 1 km2, 1 ha = 0.01 km2.
const DISTRICT_SCALES = {
    total:  { label: 'District totals', km2PerUnit: null, titleSuffix: '',        unitSuffix: '' },
    perkm2: { label: 'Per km²',         km2PerUnit: 1,    titleSuffix: ' per km²', unitSuffix: '/km²' },
    perha:  { label: 'Per hectare',     km2PerUnit: 0.01, titleSuffix: ' per ha',  unitSuffix: '/ha' }
};
function districtScaleInfo(scale) {
    return DISTRICT_SCALES[scale] || DISTRICT_SCALES.total;
}

// Value of `metric` ('count' | 'volume' | 'carbon') for one ward's stats,
// optionally divided by the ward's area in the chosen scale's unit
// ('perkm2' | 'perha'; 'total' or omitted = raw total). Wards without a
// usable area return null when normalizing so they can be shown as "n/a".
function districtMetricValue(w, metric, scale) {
    let v = metric === 'volume' ? w.volumeM3
        : metric === 'carbon' ? carbonKgFromVolume(w.volumeM3)
        : w.count;
    const s = districtScaleInfo(scale);
    if (s.km2PerUnit) {
        if (!(w.areaKm2 > 0)) return null;
        v = v / (w.areaKm2 / s.km2PerUnit);
    }
    return v;
}

// Quantile class breaks over the POSITIVE values (zero/null wards get a
// separate "none" class). Returns up to k-1 ascending thresholds; a value
// v falls in class = number of thresholds <= v. Quantiles rather than
// equal-interval steps because ward totals are heavily skewed (a few big
// or tree-dense wards would otherwise turn everything else the same pale
// shade).
function computeQuantileBreaks(values, k) {
    const pos = values.filter((v) => v !== null && v > 0).sort((a, b) => a - b);
    if (pos.length === 0) return [];
    const breaks = [];
    for (let i = 1; i < k; i++) {
        const b = pos[Math.floor((i * pos.length) / k)];
        if (b > pos[0] && (breaks.length === 0 || b > breaks[breaks.length - 1])) breaks.push(b);
    }
    return breaks;
}

// Class index for a value: -1 = none (zero/null), else 0..breaks.length.
function choroplethClassFor(v, breaks) {
    if (v === null || v === undefined || !(v > 0)) return -1;
    let c = 0;
    while (c < breaks.length && v >= breaks[c]) c++;
    return c;
}

// Tracks which city's data is currently loaded into the 'districts'
// source (null = not loaded yet). Re-fetches and swaps the source's
// data via setData() whenever the requested city differs from what's
// already loaded - e.g. the Districts checkbox was already on and the
// user then switched cities.
let districtsLoadedCity = null;
let districtsSourceAdded = false;

function addDistrictsLayers(data) {
    // promoteId makes each ward's _districtKey (its index, set in
    // getDistrictsData) its feature id, which is what lets the choropleth
    // shade wards through setFeatureState instead of re-uploading the
    // polygons on every filter change.
    map.addSource('districts', { type: 'geojson', data, promoteId: '_districtKey' });
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
    // Popup shows the district name, with its number below it, then (filled
    // in asynchronously once the per-district stats are ready) that
    // district's own figures for the trees currently matching the filters.
    map.on('click', 'districts-fill', (ev) => {
        const props = ev.features[0].properties;
        const districtName = props._districtName || 'Unknown District';
        const districtNumber = props._districtNumber;
        const numberLine = (districtNumber !== null && districtNumber !== undefined && districtNumber !== '')
            ? `<p><b>District Number:</b> ${districtNumber}</p>` : '';
        const popup = new maplibregl.Popup()
            .setLngLat(ev.lngLat)
            .setHTML(`<h3>${districtName}</h3>${numberLine}<div class="ward-popup-stats">Calculating...</div>`)
            .addTo(map);
        fillWardPopupStats(popup, Number(props._districtKey));
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
    const data = await getDistrictsData(city);
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
        }
        // Shows/hides the polygons for the combined state of this checkbox
        // and the District Choropleth checkbox (the choropleth needs the
        // polygons visible even when plain Districts is off).
        applyDistrictLayerStyle();
    });
});

//===================================================================
// District stats state + District Choropleth
//
// The choropleth shades each ward by one of three metrics (tree count,
// wood volume, embodied carbon) over the trees currently matching the
// filters, and re-shades whenever the filters change. Shading goes
// through map feature-state on the existing 'districts' source (ids come
// from promoteId: '_districtKey'), so a refresh updates ~25 small state
// objects instead of re-uploading polygon geometry.
//
// Colors: ONE hue (green, matching the report's bar color), light -> dark,
// 5 quantile classes. Lightness steps down monotonically so order reads
// without the legend; quantile (not equal-interval) classes because ward
// totals are heavily skewed. Wards with a zero/n-a value get a separate
// neutral grey so "none" is never confused with "lowest".
//===================================================================
const DISTRICT_METRICS = {
    count:  { label: 'Tree count',      unit: 'trees' },
    volume: { label: 'Wood volume',     unit: 'm³' },
    carbon: { label: 'Embodied carbon', unit: 'kgCO2e' }
};
let districtMetric = 'count';      // shared by the Layers-tab and Results Summary controls
let districtNormalize = 'total';   // 'total' | 'perkm2' | 'perha' (see DISTRICT_SCALES) - choropleth shading only
let choroplethEnabled = false;

const CHOROPLETH_RAMP = ['#e8f1ea', '#bfd8c5', '#8fbb9b', '#5a9672', '#2c6b4a'];
const CHOROPLETH_NONE_COLOR = '#ececec';
const CHOROPLETH_FILL_OPACITY = 0.72;

const layerChoroplethToggle = document.getElementById('layerChoroplethToggle');
const choroplethControlsEl = document.getElementById('choroplethControls');
const choroplethMetricSelect = document.getElementById('choroplethMetric');
const choroplethNormalizeSelect = document.getElementById('choroplethNormalize');
const choroplethLegendEl = document.getElementById('choroplethLegend');
const choroplethStatusEl = document.getElementById('choroplethStatus');

function setChoroplethStatus(text) {
    choroplethStatusEl.textContent = text || '';
}

// Formats a metric value for legends / bars. Per-area values (per km2 / per
// hectare) are small and fractional, so they get 3 significant figures;
// totals are whole numbers (count, carbon) or 1 decimal (volume), as in the
// Results Summary.
function formatDistrictValue(v, metric, scale) {
    if (v === null || v === undefined) return 'n/a';
    const perArea = !!districtScaleInfo(scale).km2PerUnit;
    if (!perArea && metric === 'volume') return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (!perArea) return Math.round(v).toLocaleString();
    return Number(v.toPrecision(3)).toLocaleString(undefined, { maximumFractionDigits: 8 });
}

// --- Shared, filter-aware cache of the per-district stats ---------------
// Anything that needs the numbers (choropleth, report section, ward popup,
// Excel sheet) asks here. A cached result is reused only while nothing it
// depends on has changed: the selected city, which load generation's
// trees are in memory, how many trees have streamed in, and
// districtFilterStamp (bumped by every updateFilters() call).
let districtFilterStamp = 0;
let latestDistrictStats = null;    // { key, city, result, districtsData }
let districtStatsInflight = null;  // { key, promise } - share one run between callers

function currentDistrictStatsKey() {
    return `${currentCity}|${loadGeneration}|${districtFilterStamp}|${allTreesData.features.length}`;
}

// Resolves to a { key, city, result, districtsData } entry, or null if a
// newer run superseded this one (callers just retry or drop it).
// `force` skips the cache - used by the Results Summary and Excel export,
// which must agree exactly with the totals they compute themselves.
function getFreshDistrictStats(onProgress, force) {
    const key = currentDistrictStatsKey();
    if (!force) {
        if (latestDistrictStats && latestDistrictStats.key === key) return Promise.resolve(latestDistrictStats);
        if (districtStatsInflight && districtStatsInflight.key === key) return districtStatsInflight.promise;
    }
    const city = currentCity;
    const gen = loadGeneration;
    const promise = (async () => {
        const districtsData = await getDistrictsData(city);
        const filtered = allTreesData.features.filter((f) => treePassesFilters(f.properties));
        const result = await computeDistrictStats(filtered, districtsData, onProgress);
        if (!result || city !== currentCity || gen !== loadGeneration) return null;
        const entry = { key, city, result, districtsData };
        latestDistrictStats = entry;
        return entry;
    })();
    if (!force) {
        districtStatsInflight = { key, promise };
        const clear = () => { if (districtStatsInflight && districtStatsInflight.promise === promise) districtStatsInflight = null; };
        promise.then(clear, clear);
    }
    return promise;
}

// --- Map layer styling ----------------------------------------------------
// One place decides how the 'districts' layers look, from the combined
// state of the Districts and District Choropleth checkboxes.
function applyDistrictLayerStyle() {
    if (!districtsSourceAdded) return;
    const vis = (layerDistrictsToggle.checked || choroplethEnabled) ? 'visible' : 'none';
    map.setLayoutProperty('districts-fill', 'visibility', vis);
    map.setLayoutProperty('districts-outline', 'visibility', vis);
    if (choroplethEnabled) {
        map.setPaintProperty('districts-fill', 'fill-color',
            ['to-color', ['coalesce', ['feature-state', 'fill'], CHOROPLETH_NONE_COLOR]]);
        map.setPaintProperty('districts-fill', 'fill-opacity', CHOROPLETH_FILL_OPACITY);
    } else {
        map.setPaintProperty('districts-fill', 'fill-color', '#9e9e9e');
        map.setPaintProperty('districts-fill', 'fill-opacity', 0.08);
    }
}

function clearChoroplethState() {
    if (!districtsSourceAdded) return;
    try { map.removeFeatureState({ source: 'districts' }); } catch (err) { /* source not ready yet - nothing to clear */ }
}

function paintChoropleth(entry) {
    const wards = entry.result.wards;
    const values = wards.map((w) => districtMetricValue(w, districtMetric, districtNormalize));
    const breaks = computeQuantileBreaks(values, CHOROPLETH_RAMP.length);
    wards.forEach((w, i) => {
        const c = choroplethClassFor(values[i], breaks);
        map.setFeatureState({ source: 'districts', id: i }, {
            fill: c < 0 ? CHOROPLETH_NONE_COLOR : CHOROPLETH_RAMP[c],
            value: values[i]
        });
    });
    renderChoroplethLegend(values, breaks);
}

function renderChoroplethLegend(values, breaks) {
    fillChoroplethLegend(choroplethLegendEl, values, breaks, districtMetric, districtNormalize);
}

// Builds the class legend (title, swatches, note) into `host`. Shared by the
// Layers-tab legend and the Results Summary map so they can't diverge.
function fillChoroplethLegend(host, values, breaks, metric, scale) {
    const m = DISTRICT_METRICS[metric];
    const s = districtScaleInfo(scale);
    const perArea = !!s.km2PerUnit;
    const classes = CHOROPLETH_RAMP.map(() => ({ min: Infinity, max: -Infinity, n: 0 }));
    let noneCount = 0;
    values.forEach((v) => {
        const c = choroplethClassFor(v, breaks);
        if (c < 0) { noneCount += 1; return; }
        classes[c].n += 1;
        if (v < classes[c].min) classes[c].min = v;
        if (v > classes[c].max) classes[c].max = v;
    });

    host.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'choropleth-legend-title';
    title.textContent = `${m.label}${s.titleSuffix} (${m.unit}${s.unitSuffix})`;
    host.appendChild(title);

    const addRow = (color, text) => {
        const row = document.createElement('div');
        row.className = 'legend-row';
        row.style.margin = '3px 0';
        const sw = document.createElement('span');
        sw.className = 'legend-swatch';
        sw.style.background = color;
        const label = document.createElement('span');
        label.textContent = text;
        row.appendChild(sw);
        row.appendChild(label);
        host.appendChild(row);
    };
    // Highest class first, so the legend reads dark-to-light top-down.
    for (let c = classes.length - 1; c >= 0; c--) {
        if (classes[c].n === 0) continue;
        const lo = formatDistrictValue(classes[c].min, metric, scale);
        const hi = formatDistrictValue(classes[c].max, metric, scale);
        addRow(CHOROPLETH_RAMP[c], lo === hi ? lo : `${lo} – ${hi}`);
    }
    if (noneCount > 0) addRow(CHOROPLETH_NONE_COLOR, perArea ? 'None / n/a' : 'None (0)');

    const note = document.createElement('div');
    note.className = 'choropleth-legend-note';
    const scaleNote = scale === 'perha'
        ? 'Per hectare of each district’s area (1 ha = 0.01 km²), so large and small districts compare fairly. '
        : scale === 'perkm2'
            ? 'Per km² of each district’s area, so large and small districts compare fairly. '
            : 'District totals largely reflect district size - switch Scale to per km² or per hectare to compare density. ';
    note.textContent = scaleNote + 'Classes hold roughly equal numbers of districts.';
    host.appendChild(note);
}

let choroplethRefreshTimer = null;
function scheduleChoroplethRefresh(delayMs) {
    if (!choroplethEnabled) return;
    if (choroplethRefreshTimer) clearTimeout(choroplethRefreshTimer);
    choroplethRefreshTimer = setTimeout(() => {
        choroplethRefreshTimer = null;
        refreshChoropleth();
    }, delayMs === undefined ? 200 : delayMs);
}

async function refreshChoropleth() {
    if (!choroplethEnabled) return;
    if (stillLoadingTrees) {
        setChoroplethStatus('Waiting for trees to finish loading...');
        return;
    }
    setChoroplethStatus('Calculating district figures...');
    try {
        await ensureDistrictsLoadedForCity(currentCity);
        applyDistrictLayerStyle();
        const entry = await getFreshDistrictStats((p) => {
            if (choroplethEnabled) setChoroplethStatus(`Assigning trees to districts... ${Math.round(p * 100)}%`);
        });
        if (!entry || !choroplethEnabled || entry.city !== currentCity) return; // superseded - a newer refresh is on its way
        paintChoropleth(entry);
        setChoroplethStatus('');
    } catch (err) {
        console.error('District Choropleth failed:', err);
        setChoroplethStatus(`Could not shade districts: ${err.message}`);
    }
}

layerChoroplethToggle.addEventListener('change', (e) => {
    choroplethEnabled = e.target.checked;
    choroplethControlsEl.style.display = choroplethEnabled ? 'block' : 'none';
    whenMapReady(() => {
        if (choroplethEnabled) {
            refreshChoropleth();
        } else {
            if (choroplethRefreshTimer) { clearTimeout(choroplethRefreshTimer); choroplethRefreshTimer = null; }
            clearChoroplethState();
            applyDistrictLayerStyle();
            setChoroplethStatus('');
        }
    });
});

choroplethMetricSelect.addEventListener('change', (e) => setDistrictMetric(e.target.value));
choroplethNormalizeSelect.addEventListener('change', (e) => setDistrictNormalize(e.target.value));

// Re-shades from the already-computed stats when only the metric/scale
// changed (no recount needed); falls back to a full refresh if they're
// stale.
function repaintChoroplethFromCache() {
    if (!choroplethEnabled) return;
    if (latestDistrictStats && latestDistrictStats.key === currentDistrictStatsKey() && latestDistrictStats.city === currentCity) {
        paintChoropleth(latestDistrictStats);
    } else {
        scheduleChoroplethRefresh(0);
    }
}

// The metric is one shared setting: the Layers-tab select, the Results
// Summary "By District" select, the choropleth and the ranked bars all
// follow it.
function setDistrictMetric(metric) {
    if (!DISTRICT_METRICS[metric]) return;
    districtMetric = metric;
    choroplethMetricSelect.value = metric;
    const reportSelect = document.getElementById('reportDistrictMetric');
    if (reportSelect) reportSelect.value = metric;
    repaintChoroplethFromCache();
    if (reportDistrictState && reportDistrictState.container.isConnected) {
        renderDistrictReportSection(reportDistrictState.container, reportDistrictState.entry);
    }
}

// The Total / Per km2 / Per hectare scale is likewise shared: Layers-tab choropleth and
// the Results Summary map follow the same setting (shading only - bars,
// popups and Excel figures always stay raw totals).
function setDistrictNormalize(value) {
    if (!DISTRICT_SCALES[value]) return;
    districtNormalize = value;
    choroplethNormalizeSelect.value = value;
    const reportSelect = document.getElementById('reportDistrictNormalize');
    if (reportSelect) reportSelect.value = value;
    repaintChoroplethFromCache();
    if (reportDistrictState && reportDistrictState.container.isConnected) {
        renderDistrictReportSection(reportDistrictState.container, reportDistrictState.entry);
    }
}

//===================================================================
// Ward-click popup: compact per-district figures
//===================================================================
// The groups of `groupType` present in ward `w`, as [{label, count, color}]
// sorted largest first.
function wardGroupEntries(w, groupType) {
    const keys = groupKeysForType(groupType).concat(['Other Species']);
    const colors = groupColorsForType(groupType);
    const counts = groupType === 'building' ? w.bldCount : w.ecoCount;
    return keys
        .map((label, i) => ({ label, count: counts[i + 1] || 0, color: colors[i + 1] }))
        .filter((g) => g.count > 0)
        .sort((a, b) => b.count - a.count);
}

function wardTopSpecies(w, n) {
    return Object.entries(w.species).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function buildWardPopupStatsHTML(w, result, partial) {
    const pctOfAll = result.total > 0 ? ` (${((w.count / result.total) * 100).toFixed(1)}% of matching trees)` : '';
    const carbonKg = carbonKgFromVolume(w.volumeM3);
    const rows = (entries, denom) => '<table>' + entries.map(([label, count]) =>
        `<tr><td>${escapeHtml(label)}</td><td>${count.toLocaleString()} (${((count / denom) * 100).toFixed(0)}%)</td></tr>`).join('') + '</table>';

    let html = '';
    if (partial) html += '<p style="color:#b26a00;margin:4px 0;">Trees are still loading - figures are partial.</p>';
    if (w.count === 0) {
        return html + '<p style="margin:4px 0;">No trees matching the current filters in this district.</p>';
    }
    html += `<table>
        <tr><td>Trees matching filters</td><td>${w.count.toLocaleString()}</td></tr>
        <tr><td colspan="2" style="color:#888;font-size:0.7rem;">${pctOfAll.trim()}</td></tr>
        <tr><td>Wood volume</td><td>${w.volumeM3.toLocaleString(undefined, { maximumFractionDigits: 1 })} m&sup3;</td></tr>
        <tr><td>Embodied carbon</td><td>${Math.round(carbonKg).toLocaleString()} kgCO2e</td></tr>
    </table>`;
    html += '<div class="ward-popup-sub">Top species</div>' + rows(wardTopSpecies(w, 5), w.count);
    html += '<div class="ward-popup-sub">Ecological group</div>'
        + rows(wardGroupEntries(w, 'eco').slice(0, 3).map((g) => [g.label, g.count]), w.count);
    html += '<div class="ward-popup-sub">Building group</div>'
        + rows(wardGroupEntries(w, 'building').slice(0, 3).map((g) => [g.label, g.count]), w.count);
    return html;
}

async function fillWardPopupStats(popup, wardKey) {
    const getHost = () => { const el = popup.getElement(); return el ? el.querySelector('.ward-popup-stats') : null; };
    try {
        let entry = await getFreshDistrictStats();
        if (!entry) entry = await getFreshDistrictStats();
        const host = getHost();
        if (!host) return; // popup was closed meanwhile
        const w = entry && entry.result.wards[wardKey];
        host.innerHTML = w ? buildWardPopupStatsHTML(w, entry.result, stillLoadingTrees) : '';
    } catch (err) {
        const host = getHost();
        if (host) host.textContent = 'District figures are unavailable right now.';
        console.warn('Ward popup stats failed:', err);
    }
}

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
    // The previous city's per-district stats and shading are meaningless
    // now - drop them right away rather than leaving them on screen until
    // the new city's trees finish loading.
    latestDistrictStats = null;
    districtStatsInflight = null;
    clearChoroplethState();
    if (choroplethEnabled) {
        choroplethLegendEl.innerHTML = '';
        setChoroplethStatus('Waiting for trees to finish loading...');
    }

    if (layerDistrictsToggle.checked || choroplethEnabled) {
        setLayerStatus('Loading Districts...');
        whenMapReady(async () => {
            try {
                await ensureDistrictsLoadedForCity(city);
                setLayerStatus('');
                applyDistrictLayerStyle();
                // Shades once the new city's trees are loaded (updateFilters
                // fires at the end of the load); if they already are, now.
                if (!stillLoadingTrees) scheduleChoroplethRefresh();
            } catch (err) {
                console.error('Failed to load Districts layer:', err);
                setLayerStatus(`Error loading Districts: ${err.message}`);
                layerDistrictsToggle.checked = false;
                layerChoroplethToggle.checked = false;
                choroplethEnabled = false;
                choroplethControlsEl.style.display = 'none';
                applyDistrictLayerStyle();
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
// Cluster Group Type toggle (Ecological Group vs Building Group)
//
// A second segmented control directly below the city switcher. Selects
// which classification the individual tree dot colors, cluster donuts,
// and the Legend tab all currently represent - independent of the two
// Group dropdowns under the Filters tab (those keep filtering by either
// classification no matter what this is set to) and independent of the
// city switcher above it.
//===================================================================
const clusterGroupButtons = document.querySelectorAll('.cluster-group-btn');

function setClusterGroupType(groupType) {
    if (groupType === selectedClusterGroupType) return;
    selectedClusterGroupType = groupType;

    clusterGroupButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.group === groupType);
    });

    whenMapReady(() => {
        if (map.getLayer('o_trees')) {
            map.setPaintProperty('o_trees', 'circle-color', buildGroupColorMatchExpr(groupType));
        }
        // Every cached donut marker was built with the old palette/count
        // fields - clear them all so updateClusterMarkers() rebuilds
        // every visible cluster from scratch with the new ones, instead
        // of reusing stale-colored DOM elements (the normal moveend/
        // sourcedata path only rebuilds markers that are new or gone).
        for (const id in clusterMarkersOnScreen) clusterMarkersOnScreen[id].remove();
        clusterMarkersOnScreen = {};
        updateClusterMarkers();
    });

    renderLegend();
}

clusterGroupButtons.forEach((btn) => {
    btn.addEventListener('click', () => setClusterGroupType(btn.dataset.group));
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
// Legend tab content
//
// Rebuilt (not just re-colored) by renderLegend() below, both at page
// load and every time the Cluster Group Type toggle changes, so it
// always shows whichever classification (Ecological or Building Group)
// is currently selected - same keys/colors used for the cluster donuts
// and individual tree dots, so it can't drift out of sync with what's
// actually drawn on the map.
//===================================================================
function renderLegend() {
    const legendEcoGroupsEl = document.getElementById('legend-eco-groups');
    const legendGroupTypeLabel = document.getElementById('legendGroupTypeLabel');
    const keys = groupKeysForType(selectedClusterGroupType);
    const colors = groupColorsForType(selectedClusterGroupType);
    const label = groupLabelForType(selectedClusterGroupType);

    if (legendGroupTypeLabel) legendGroupTypeLabel.textContent = `${label}s`;

    legendEcoGroupsEl.innerHTML = '';
    keys.forEach((key, i) => {
        const row = document.createElement('div');
        row.className = 'legend-row';
        row.innerHTML = `<span class="legend-swatch round" style="background:${colors[i + 1]};"></span> ${key}`;
        legendEcoGroupsEl.appendChild(row);
    });
    const otherRow = document.createElement('div');
    otherRow.className = 'legend-row';
    otherRow.innerHTML = `<span class="legend-swatch round" style="background:${colors[8]};"></span> Other Species`;
    legendEcoGroupsEl.appendChild(otherRow);

    const legendClusterEl = document.getElementById('legend-cluster-density');
    legendClusterEl.innerHTML = '';

    // Illustrative donut using a made-up mixed distribution, just to show
    // what the real cluster markers on the map look like and how to read
    // them - not tied to any real cluster. Rebuilt with the current
    // palette every time this function runs.
    const exampleCounts = { 1: 5, 2: 3, 3: 8, 4: 12, 5: 2, 6: 20, 7: 6, 8: 4 };
    const exampleTotal = Object.values(exampleCounts).reduce((a, b) => a + b, 0);
    const exampleDonut = buildDonutMarkerEl(exampleCounts, exampleTotal, null, () => null, colors);
    exampleDonut.style.cursor = 'default';
    exampleDonut.style.pointerEvents = 'none';
    exampleDonut.style.margin = '4px 0 10px';
    legendClusterEl.appendChild(exampleDonut);

    const clusterExplainer = document.createElement('div');
    clusterExplainer.style.fontSize = '0.8rem';
    clusterExplainer.style.color = '#333';
    clusterExplainer.innerHTML = `
        <p style="margin:4px 0;">Each wedge is one ${label} - same colors as above.</p>
        <p style="margin:4px 0;">The number in the center is the total tree count in that cluster.</p>
        <p style="margin:4px 0;">Bubble size also grows with tree count (small: under 50, medium: 50–199, large: 200+).</p>
    `;
    legendClusterEl.appendChild(clusterExplainer);
}

renderLegend();

//===================================================================
// Filter State
//===================================================================
// Group filters are multi-select: sets of group ids (1-7 = the seven
// defined groups in object order, 8 = Other Species), matching each tree's
// precomputed _ecoGroupId / _buildingGroupId. Empty set = no filtering.
const selectedEcoGroupIds = new Set();
const selectedBuildingGroupIds = new Set();
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
    if (selectedEcoGroupIds.size === 0) return true;
    return selectedEcoGroupIds.has(props._ecoGroupId);
}

// Same pattern as passesEcoGroupFilter, against the independent
// Building Group classification (props._buildingGroupId). Combined
// with the ecological filter via AND, same as every other filter here.
function passesBuildingGroupFilter(props) {
    if (selectedBuildingGroupIds.size === 0) return true;
    return selectedBuildingGroupIds.has(props._buildingGroupId);
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
    // Invalidates the cached per-district stats (see getFreshDistrictStats)
    // and, if the District Choropleth is on, re-shades it. While tree pages
    // are still streaming in, the refresh waits for the load to finish.
    districtFilterStamp += 1;
    if (choroplethEnabled && !stillLoadingTrees) scheduleChoroplethRefresh();

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
// Ecological Group / Building Group multi-select dropdowns
// (same checkbox-dropdown component as Individual Species below, minus
// the search box - there are only eight entries). One factory builds
// both so their behaviour can't drift apart.
//===================================================================
// Close every open checkbox dropdown (optionally keeping one open), so only
// one panel is expanded at a time.
function closeAllCustomDropdowns(exceptEl) {
    document.querySelectorAll('.custom-dropdown.open').forEach((el) => {
        if (el !== exceptEl) el.classList.remove('open');
    });
}

function setupGroupMultiSelect(prefix, groupsObj, selectedSet) {
    const root = document.getElementById(prefix + 'Dropdown');
    const toggle = document.getElementById(prefix + 'DropdownToggle');
    const labelEl = document.getElementById(prefix + 'DropdownLabel');
    const panel = document.getElementById(prefix + 'DropdownPanel');
    const listEl = document.getElementById(prefix + 'CheckboxList');
    const clearBtn = document.getElementById(prefix + 'ClearSelection');

    // Groups 1-7 in object order, then the catch-all "Other Species" (id 8)
    const options = Object.keys(groupsObj).map((label, i) => ({ id: i + 1, label }));
    options.push({ id: 8, label: 'Other Species' });

    function updateLabel() {
        const n = selectedSet.size;
        if (n === 0) {
            labelEl.textContent = 'Show all';
        } else if (n === 1) {
            labelEl.textContent = options.find((o) => o.id === [...selectedSet][0]).label;
        } else {
            labelEl.textContent = `${n} groups selected`;
        }
    }

    function renderList() {
        listEl.innerHTML = '';
        options.forEach((opt) => {
            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = String(opt.id);
            cb.checked = selectedSet.has(opt.id);
            cb.addEventListener('change', () => {
                if (cb.checked) selectedSet.add(opt.id);
                else selectedSet.delete(opt.id);
                updateLabel();
                updateFilters();
            });
            label.appendChild(cb);
            label.appendChild(document.createTextNode(opt.label));
            listEl.appendChild(label);
        });
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !root.classList.contains('open');
        closeAllCustomDropdowns(willOpen ? root : null);
        root.classList.toggle('open', willOpen);
    });
    // Clicks inside the panel must not bubble to the document listener
    // (which closes dropdowns) or ticking a box would collapse the panel.
    panel.addEventListener('click', (e) => e.stopPropagation());

    clearBtn.addEventListener('click', () => {
        selectedSet.clear();
        updateLabel();
        renderList();
        updateFilters();
    });

    renderList();
    updateLabel();

    return {
        // Used by resetAllFilters(); does not call updateFilters() itself.
        reset() {
            selectedSet.clear();
            updateLabel();
            root.classList.remove('open');
            renderList();
        }
    };
}

const ecoGroupMultiSelect = setupGroupMultiSelect('ecoGroup', ecologicalGroups, selectedEcoGroupIds);
const buildingGroupMultiSelect = setupGroupMultiSelect('buildingGroup', buildingGroups, selectedBuildingGroupIds);

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
        closeAllCustomDropdowns(speciesDropdown);
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
    closeAllCustomDropdowns(null);
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
    // Reset ecological group and building group selections
    ecoGroupMultiSelect.reset();
    buildingGroupMultiSelect.reset();

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

// Per-tree stem volume (m^3), using the same taper-model-first /
// cylinder-fallback logic as the aggregate estimate below. Returns
// null when the tree has no usable DBH (excluded from any volume
// figure, individual or aggregate). Returns { volumeM3, usedTaperModel }
// otherwise. Factored out of computeEmbodiedCarbonEstimate() so the
// per-tree Excel export (downloadResultsWorkbook()) computes each tree's
// volume with the exact same logic the aggregate report uses, rather
// than a second, potentially-drifting copy of it.
function computeTreeVolumeM3(props) {
    const dbhCm = props.DBH;
    if (dbhCm === null || dbhCm === undefined || dbhCm === '' || isNaN(Number(dbhCm)) || Number(dbhCm) <= 0) {
        return null;
    }
    const coeffs = getUngTaperCoefficientsForTree(props);
    if (coeffs) {
        return { volumeM3: ungTaperVolumeM3(dbhCm, coeffs), usedTaperModel: true };
    }
    // Fallback: flat-cylinder approximation.
    const radiusM = (Number(dbhCm) / 100) / 2;
    return { volumeM3: Math.PI * radiusM * radiusM * FALLBACK_ASSUMED_TREE_HEIGHT_M, usedTaperModel: false };
}

// Returns { totalKgCO2e, treesUsed, treesExcludedNoDBH, treesTaperModel, treesFallback }
function computeEmbodiedCarbonEstimate(features) {
    let totalVolumeM3 = 0;
    let treesUsed = 0;
    let treesExcludedNoDBH = 0;
    let treesTaperModel = 0;
    let treesFallback = 0;

    features.forEach((f) => {
        const result = computeTreeVolumeM3(f.properties);
        if (!result) {
            treesExcludedNoDBH += 1;
            return;
        }
        totalVolumeM3 += result.volumeM3;
        if (result.usedTaperModel) {
            treesTaperModel += 1;
        } else {
            treesFallback += 1;
        }
        treesUsed += 1;
    });

    const totalMassKg = totalVolumeM3 * ASSUMED_WOOD_DENSITY_KG_PER_M3;
    const totalKgCO2e = totalMassKg * TIMBER_CARBON_FACTOR_KG_CO2E_PER_KG;

    return { totalKgCO2e, totalVolumeM3, treesUsed, treesExcludedNoDBH, treesTaperModel, treesFallback };
}

// Total municipal land area (hectares) for each city, used as the fixed
// denominator for "wood volume per hectare" in the Results Summary -
// deliberately the WHOLE city's area, not the bounding box of whatever
// trees currently match the filters. A per-filter bounding box was tried
// first (C31) and rejected: it made the figure incomparable across
// different filter selections (a tightly clustered filter reads
// artificially dense, a citywide filter reads artificially sparse,
// purely from how spread out the matches happen to be) rather than a
// stable measure of "how much usable wood per hectare of the city".
// Values supplied directly by the user, calculated from the dissolved
// boundaries of this app's own Ward/District layers (see
// fetchOttawaDistricts/fetchTorontoDistricts above): Ottawa 2,894 km²
// (289,442 ha), Toronto 643 km² (64,276 ha).
const CITY_LAND_AREA_HECTARES = {
    ottawa: 289442,
    toronto: 64276
};

// Formats a wood-volume-per-hectare figure for display. This metric is
// often naturally small (street trees are sparse relative to a whole
// city's land area, unlike a continuous forest stand), so a fixed
// 1-2 decimal display would frequently round down to a flat "0" and
// look broken - toPrecision(3) instead shows 3 significant figures
// (e.g. 0.0157, or 0.000342 for a narrow filter), so a real non-zero
// value never silently disappears.
function formatVolumePerHectare(value) {
    if (value === null || value === undefined) return 'N/A';
    if (value === 0) return '0 m&sup3;/ha';
    return `${value.toPrecision(3)} m&sup3;/ha`;
}

// A larger, static (non-interactive) version of the cluster donut, sized
// for the report rather than for a map marker. Deliberately separate
// from buildDonutMarkerEl(), which is tightly coupled to cluster-marker
// sizing thresholds and click-to-zoom behavior that don't apply here.
// Takes an explicit `colors` palette (ECO_GROUP_COLORS or
// BUILDING_GROUP_COLORS) so the same builder works for whichever group
// type the report's donut section is currently showing.
function buildReportDonutSVG(counts, totalCount, diameterPx, colors = ECO_GROUP_COLORS) {
    const stops = [];
    let cumulative = 0;
    for (let g = 1; g <= 8; g++) {
        const val = counts[g] || 0;
        if (val === 0 || totalCount === 0) continue;
        const start = (cumulative / totalCount) * 360;
        cumulative += val;
        const end = (cumulative / totalCount) * 360;
        stops.push(`${colors[g]} ${start}deg ${end}deg`);
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

// Counts how many of `features` fall into each of the 8 group ids
// (1-7 = defined groups, 8 = Other Species) for the given classification
// ('eco' or 'building'). Shared by both the donut and bar-chart section
// builders below so they can never disagree on the underlying numbers.
function computeGroupCounts(features, groupType) {
    const idField = groupIdFieldForType(groupType);
    const counts = {};
    for (let g = 1; g <= 8; g++) counts[g] = 0;
    features.forEach((f) => {
        const gid = f.properties[idField] || 8;
        counts[gid] = (counts[gid] || 0) + 1;
    });
    return counts;
}

// Builds the "<Group Type> Distribution" section as a donut chart + color-
// keyed legend (same visual pattern the report has always used for
// Ecological Group) - now generic over which classification (`groupType`,
// 'eco' or 'building') is passed in, so it can render whichever one the
// Cluster Group Type toggle currently has selected.
function buildGroupDistributionDonutSection(features, total, groupType) {
    const keys = groupKeysForType(groupType);
    const colors = groupColorsForType(groupType);
    const label = groupLabelForType(groupType);
    const counts = computeGroupCounts(features, groupType);

    const section = document.createDocumentFragment();

    const title = document.createElement('div');
    title.className = 'report-section-title';
    title.textContent = `${label} Distribution`;
    section.appendChild(title);

    const donutRow = document.createElement('div');
    donutRow.className = 'report-donut-row';
    const donut = buildReportDonutSVG(counts, total, 110, colors);
    donutRow.appendChild(donut);

    const legend = document.createElement('div');
    legend.className = 'report-group-legend';
    keys.concat(['Other Species']).forEach((rowLabel, i) => {
        const groupId = i + 1;
        const count = counts[groupId] || 0;
        if (count === 0) return;
        const pct = ((count / total) * 100).toFixed(1);
        const row = document.createElement('div');
        row.className = 'legend-row';
        row.style.margin = '2px 0';
        row.innerHTML = `<span class="legend-swatch round" style="background:${colors[groupId]};"></span> ${escapeHtml(rowLabel)} <span style="color:#999; margin-left:auto; flex-shrink:0; white-space:nowrap;">${count} (${pct}%)</span>`;
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '6px';
        legend.appendChild(row);
    });
    donutRow.appendChild(legend);
    section.appendChild(donutRow);

    return section;
}

//===================================================================
// Results Summary: "By District" section
//
// Ranked horizontal bars, one per district, sized by the shared metric
// (tree count / wood volume / embodied carbon - see setDistrictMetric)
// and split into segments by whichever group type the Cluster Group Type
// toggle has selected, so a Building Group filter reads as a single-color
// bar per ward and an unfiltered view shows each ward's group mix. Clicking
// a row expands that district's full breakdown (species, both group types,
// diameter) inline. The segment group type (Ecological / Building) has its own
// toggle above the legend. Bars always show raw district totals; the per-km2 and
// per-hectare scales are choropleth-only options.
//===================================================================
let reportDistrictState = null; // { container, entry } - lets a metric change redraw the section in place
// Which group classification ('eco' | 'building') the district bars are split
// by. Starts from the menu rail's Cluster Group Type each time the report is
// opened, then is controlled by the toggle above the bars' legend - changing
// it there does NOT change the map/rail setting.
let reportDistrictGroupType = 'eco';

function setReportDistrictGroupType(groupType) {
    if (groupType !== 'eco' && groupType !== 'building') return;
    reportDistrictGroupType = groupType;
    if (reportDistrictState && reportDistrictState.container.isConnected) {
        renderDistrictReportSection(reportDistrictState.container, reportDistrictState.entry);
    }
}

// One horizontal bar row in the report's existing style.
function makeReportBarRow(label, count, denom, maxCount, color) {
    const pct = denom > 0 ? ((count / denom) * 100).toFixed(1) : '0.0';
    const barPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
    const row = document.createElement('div');
    row.className = 'report-bar-row';
    row.innerHTML = `
        <span class="report-bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
        <span class="report-bar-track"><span class="report-bar-fill" style="width:${barPct}%; background:${color};"></span></span>
        <span class="report-bar-value">${count.toLocaleString()} (${pct}%)</span>
    `;
    return row;
}

function makeReportSubTitle(text) {
    const t = document.createElement('div');
    t.className = 'report-section-title';
    t.textContent = text;
    return t;
}

// The expandable per-district detail: headline figures, both group
// distributions and the diameter breakdown (all as counts, with
// percentages of THIS district's trees). Species is deliberately NOT
// repeated here - it stays in the report's main summary above.
function buildDistrictDetailContent(w) {
    const el = document.createElement('div');
    if (w.count === 0) {
        el.innerHTML = '<p style="margin:0; font-size:0.78rem; color:#777;">No trees matching the current filters in this district.</p>';
        return el;
    }
    const carbonKg = carbonKgFromVolume(w.volumeM3);
    const stats = document.createElement('div');
    stats.className = 'report-stat-row';
    stats.innerHTML = `
        <div class="report-stat"><div class="value">${w.count.toLocaleString()}</div><div class="label">Trees</div></div>
        <div class="report-stat"><div class="value">${w.volumeM3.toLocaleString(undefined, { maximumFractionDigits: 1 })} m&sup3;</div><div class="label">Wood volume</div></div>
        <div class="report-stat"><div class="value">${Math.round(carbonKg).toLocaleString()}</div><div class="label">kgCO2e embodied carbon</div></div>
    `;
    el.appendChild(stats);
    if (w.treesWithVolume < w.count) {
        const note = document.createElement('p');
        note.className = 'report-district-note';
        note.textContent = `${(w.count - w.treesWithVolume).toLocaleString()} of these trees have no recorded diameter and are excluded from volume and carbon.`;
        el.appendChild(note);
    }

    ['eco', 'building'].forEach((gt) => {
        const entries = wardGroupEntries(w, gt);
        const max = entries.length ? entries[0].count : 1;
        el.appendChild(makeReportSubTitle(`${groupLabelForType(gt)} Distribution`));
        entries.forEach((g) => el.appendChild(makeReportBarRow(g.label, g.count, w.count, max, '#647c64')));
    });

    el.appendChild(makeReportSubTitle('Diameter Breakdown'));
    const dEntries = DIAMETER_CLASSES.map((c) => [c.label, w.diameter[c.key] || 0]);
    if (w.diameter.unknown) dEntries.push(['Unknown', w.diameter.unknown]);
    const maxD = Math.max(...dEntries.map(([, c]) => c), 1);
    dEntries.filter(([, c]) => c > 0).forEach(([label, c]) =>
        el.appendChild(makeReportBarRow(label, c, w.count, maxD, label === 'Unknown' ? '#aab3aa' : '#647c64')));
    return el;
}

//===================================================================
// Results Summary choropleth map (static inline SVG)
//
// A plain SVG rather than a second MapLibre map: it prints/exports with
// the report, needs no WebGL, and the report is a snapshot anyway. Ward
// outlines are projected (equirectangular, scaled by cos(mid-latitude) so
// shapes aren't stretched) and thinned with Douglas-Peucker - ward
// polygons from the open-data services carry far more vertices than a
// ~600px-wide picture can show. Computed once per loaded boundary set.
//===================================================================
const REPORT_MAP_WIDTH = 800;
const REPORT_MAP_MAX_HEIGHT = 760;
const REPORT_MAP_TOLERANCE = 0.7; // viewBox units (~0.1% of width)
const districtSvgCache = new WeakMap();

function simplifyRingDP(pts, tol) {
    const n = pts.length;
    if (n <= 4) return pts;
    const keep = new Uint8Array(n);
    keep[0] = 1; keep[n - 1] = 1;
    const stack = [[0, n - 1]];
    const tol2 = tol * tol;
    while (stack.length) {
        const [lo, hi] = stack.pop();
        let maxD = 0, idx = -1;
        const [x1, y1] = pts[lo], [x2, y2] = pts[hi];
        const dx = x2 - x1, dy = y2 - y1;
        const len2 = dx * dx + dy * dy;
        for (let i = lo + 1; i < hi; i++) {
            const [px, py] = pts[i];
            let d2;
            if (len2 === 0) {
                d2 = (px - x1) * (px - x1) + (py - y1) * (py - y1);
            } else {
                let t = ((px - x1) * dx + (py - y1) * dy) / len2;
                t = t < 0 ? 0 : t > 1 ? 1 : t;
                const qx = x1 + t * dx, qy = y1 + t * dy;
                d2 = (px - qx) * (px - qx) + (py - qy) * (py - qy);
            }
            if (d2 > maxD) { maxD = d2; idx = i; }
        }
        if (idx > -1 && maxD > tol2) {
            keep[idx] = 1;
            stack.push([lo, idx], [idx, hi]);
        }
    }
    return pts.filter((_, i) => keep[i]);
}

// { width, height, paths: [svgPathD per feature index] } for a boundary set.
function getDistrictSvgGeometry(districtsData) {
    const cached = districtSvgCache.get(districtsData);
    if (cached) return cached;

    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    districtsData.features.forEach((f) => {
        const b = f.properties._bbox || computeGeometryBbox(f.geometry);
        if (b[0] < minLng) minLng = b[0];
        if (b[1] < minLat) minLat = b[1];
        if (b[2] > maxLng) maxLng = b[2];
        if (b[3] > maxLat) maxLat = b[3];
    });
    const cosLat = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
    const spanX = Math.max((maxLng - minLng) * cosLat, 1e-9);
    const spanY = Math.max(maxLat - minLat, 1e-9);
    // Fit inside WIDTH x MAX_HEIGHT preserving aspect ratio.
    const scale = Math.min(REPORT_MAP_WIDTH / spanX, REPORT_MAP_MAX_HEIGHT / spanY);
    const width = Math.ceil(spanX * scale), height = Math.ceil(spanY * scale);
    const project = ([lng, lat]) => [(lng - minLng) * cosLat * scale, (maxLat - lat) * scale];

    // Projected bounds of each district's own outline (used to frame the
    // small per-district outline shown beside an expanded district's results).
    const bounds = [];
    const ringToPath = (ring, b) => {
        const pts = simplifyRingDP(ring.map(project), REPORT_MAP_TOLERANCE);
        if (pts.length < 3) return '';
        pts.forEach(([x, y]) => {
            if (x < b[0]) b[0] = x;
            if (y < b[1]) b[1] = y;
            if (x > b[2]) b[2] = x;
            if (y > b[3]) b[3] = y;
        });
        return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';
    };
    const paths = districtsData.features.map((f) => {
        const g = f.geometry;
        const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
        const b = [Infinity, Infinity, -Infinity, -Infinity];
        const d = polys.map((poly) => poly.map((ring) => ringToPath(ring, b)).join('')).join('');
        bounds.push(b);
        return d;
    });
    const result = { width, height, paths, bounds };
    districtSvgCache.set(districtsData, result);
    return result;
}

// Builds the map block (title, SVG, legend) for the current metric/scale.
// `onSelectWard(w)` is called when a district is clicked.
function buildDistrictMapEl(entry, onSelectWard) {
    const wards = entry.result.wards;
    const metric = districtMetric;
    const scale = districtNormalize;
    const sInfo = districtScaleInfo(scale);
    const perArea = !!sInfo.km2PerUnit;
    const m = DISTRICT_METRICS[metric];
    const geo = getDistrictSvgGeometry(entry.districtsData);

    const values = wards.map((w) => districtMetricValue(w, metric, scale));
    const breaks = computeQuantileBreaks(values, CHOROPLETH_RAMP.length);
    const totalVal = wards.reduce((s, w) => s + districtMetricValue(w, metric, 'total'), 0);

    const wrap = document.createElement('div');
    wrap.className = 'report-district-map';
    const fillByWard = new Map(); // ward index -> shade, reused by the per-district outlines
    wrap.fillByWard = fillByWard;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${geo.width} ${geo.height}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Choropleth map of ${m.label.toLowerCase()}${sInfo.titleSuffix} by district`);
    wards.forEach((w, i) => {
        const d = geo.paths[w.idx];
        if (!d) return;
        const c = choroplethClassFor(values[i], breaks);
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', d);
        const fillColor = c < 0 ? CHOROPLETH_NONE_COLOR : CHOROPLETH_RAMP[c];
        fillByWard.set(w.idx, fillColor);
        path.setAttribute('fill', fillColor);
        path.setAttribute('fill-rule', 'evenodd');
        path.setAttribute('class', 'report-district-shape');
        path.setAttribute('tabindex', '0');
        path.setAttribute('role', 'button');
        const label = `${w.number !== null && w.number !== undefined && w.number !== '' ? w.number + ' · ' : ''}${w.name}`;
        const shown = formatDistrictValue(values[i], metric, scale);
        const raw = districtMetricValue(w, metric, 'total');
        const share = totalVal > 0 ? ((raw / totalVal) * 100).toFixed(1) : '0.0';
        const tip = document.createElementNS(svgNS, 'title');
        tip.textContent = `${label}\n${m.label}${sInfo.titleSuffix}: ${shown}${metric === 'count' && !perArea ? '' : ' ' + m.unit + sInfo.unitSuffix}`
            + `\n${w.count.toLocaleString()} trees · ${share}% of the ${m.label.toLowerCase()} shown`;
        path.appendChild(tip);
        const select = () => onSelectWard && onSelectWard(w);
        path.addEventListener('click', select);
        path.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
        svg.appendChild(path);
    });
    wrap.appendChild(svg);

    const legend = document.createElement('div');
    legend.className = 'report-district-map-legend';
    fillChoroplethLegend(legend, values, breaks, metric, scale);
    wrap.appendChild(legend);
    return wrap;
}

// Small outline of one district (framed to its own bounds, filled with the
// shade it has on the map) shown beside its expanded results.
function buildWardOutlineEl(w, ctx) {
    const d = ctx && ctx.geo.paths[w.idx];
    const b = ctx && ctx.geo.bounds[w.idx];
    if (w.idx < 0 || !d || !b || !isFinite(b[0])) return null;
    const pad = Math.max(b[2] - b[0], b[3] - b[1]) * 0.05;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `${b[0] - pad} ${b[1] - pad} ${(b[2] - b[0]) + 2 * pad} ${(b[3] - b[1]) + 2 * pad}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Outline of ${w.name}`);
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', (ctx.fillByWard && ctx.fillByWard.get(w.idx)) || CHOROPLETH_RAMP[2]);
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('stroke', '#2c3a2c');
    path.setAttribute('stroke-width', '1.4');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(path);
    const wrap = document.createElement('div');
    wrap.className = 'report-district-outline';
    wrap.appendChild(svg);
    return wrap;
}

function buildDistrictDetailEl(w, ctx) {
    const wrap = document.createElement('div');
    wrap.className = 'report-district-detail-body';
    const main = buildDistrictDetailContent(w);
    main.classList.add('report-district-detail-main');
    wrap.appendChild(main);
    const outline = buildWardOutlineEl(w, ctx);
    if (outline) wrap.appendChild(outline);
    return wrap;
}

// Draws (or redraws) the whole section into `container` from a stats entry.
function renderDistrictReportSection(container, entry) {
    const { wards, outside, total } = entry.result;
    const metric = districtMetric;
    const m = DISTRICT_METRICS[metric];
    const groupType = reportDistrictGroupType;
    const colors = groupColorsForType(groupType);
    const keys = groupKeysForType(groupType).concat(['Other Species']);
    const valueOf = (w) => districtMetricValue(w, metric, 'total');

    // The methodology notes live in this section's left column while it is
    // drawn; rescue them before the section is cleared and redrawn.
    const methodologyEl = reportDistrictState && reportDistrictState.container === container ? reportDistrictState.methodologyEl : null;
    if (methodologyEl && container.contains(methodologyEl)) container.after(methodologyEl);

    container.innerHTML = '';
    container.appendChild(makeReportSubTitle('By District'));

    // Controls row (hidden when printing) - the metric select is the same
    // shared setting as the Layers-tab choropleth's.
    const controls = document.createElement('div');
    controls.className = 'report-district-controls';
    controls.innerHTML = `<label for="reportDistrictMetric">Size bars by</label>
        <select id="reportDistrictMetric">
            ${Object.entries(DISTRICT_METRICS).map(([k, v]) =>
                `<option value="${k}"${k === metric ? ' selected' : ''}>${v.label}</option>`).join('')}
        </select>`;
    controls.querySelector('select').addEventListener('change', (e) => setDistrictMetric(e.target.value));
    const scaleLabel = document.createElement('label');
    scaleLabel.setAttribute('for', 'reportDistrictNormalize');
    scaleLabel.textContent = 'Map scale';
    const scaleSelect = document.createElement('select');
    scaleSelect.id = 'reportDistrictNormalize';
    scaleSelect.innerHTML = `<option value="total"${districtNormalize === 'total' ? ' selected' : ''}>District totals</option>
        <option value="perkm2"${districtNormalize === 'perkm2' ? ' selected' : ''}>Per km&sup2;</option>
        <option value="perha"${districtNormalize === 'perha' ? ' selected' : ''}>Per hectare</option>`;
    scaleSelect.addEventListener('change', (e) => setDistrictNormalize(e.target.value));
    controls.appendChild(scaleLabel);
    controls.appendChild(scaleSelect);
    container.appendChild(controls);

    // Choropleth map of the same figures (clicking a district opens its row below).
    const rowByWard = new Map();
    const mapEl = buildDistrictMapEl(entry, (w) => {
        const row = rowByWard.get(w.idx);
        if (!row) return;
        if (!row.classList.contains('open')) row.querySelector('.report-district-head').click();
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    const detailCtx = { geo: getDistrictSvgGeometry(entry.districtsData), fillByWard: mapEl.fillByWard };

    // Two-column layout: map (+ methodology notes underneath) on the left,
    // the all-districts bar chart on the right.
    const layout = document.createElement('div');
    layout.className = 'report-district-layout';
    const mapArea = document.createElement('div');
    mapArea.className = 'report-district-area-map';
    mapArea.appendChild(mapEl);
    const barsArea = document.createElement('div');
    barsArea.className = 'report-district-area-bars';
    const methodArea = document.createElement('div');
    methodArea.className = 'report-district-area-method';
    layout.appendChild(mapArea);
    layout.appendChild(barsArea);
    layout.appendChild(methodArea);
    container.appendChild(layout);
    if (methodologyEl) methodArea.appendChild(methodologyEl);

    const ranked = wards.slice().sort((a, b) =>
        (valueOf(b) - valueOf(a)) || String(a.name).localeCompare(String(b.name)));
    if (outside.count > 0) ranked.push(outside);
    const maxVal = Math.max(...ranked.map(valueOf), 0) || 1;
    const totalVal = ranked.reduce((s, w) => s + valueOf(w), 0);

    // Group-type toggle, directly above the legend: which classification the
    // bar segments (and this legend) show. Independent of the menu rail.
    const groupToggle = document.createElement('div');
    groupToggle.className = 'report-district-grouptoggle';
    groupToggle.setAttribute('role', 'group');
    groupToggle.setAttribute('aria-label', 'Group type shown in the district breakdown');
    [['eco', 'Ecological Groups'], ['building', 'Building Groups']].forEach(([type, text]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'report-grouptoggle-btn' + (type === groupType ? ' active' : '');
        btn.dataset.group = type;
        btn.setAttribute('aria-pressed', type === groupType ? 'true' : 'false');
        btn.textContent = text;
        btn.addEventListener('click', () => setReportDistrictGroupType(type));
        groupToggle.appendChild(btn);
    });
    barsArea.appendChild(groupToggle);

    // Legend for the stacked segments (only groups present somewhere).
    const groupArrKey = (w) => metric === 'count'
        ? (groupType === 'building' ? w.bldCount : w.ecoCount)
        : (groupType === 'building' ? w.bldVol : w.ecoVol);
    const present = new Set();
    ranked.forEach((w) => { for (let g = 1; g <= 8; g++) if (groupArrKey(w)[g] > 0) present.add(g); });
    const legend = document.createElement('div');
    legend.className = 'report-district-legend';
    keys.forEach((label, i) => {
        if (!present.has(i + 1)) return;
        const item = document.createElement('span');
        item.className = 'item';
        item.innerHTML = `<span class="legend-swatch round" style="background:${colors[i + 1]}; width:10px; height:10px;"></span>${escapeHtml(label)}`;
        legend.appendChild(item);
    });
    barsArea.appendChild(legend);

    ranked.forEach((w) => {
        const val = valueOf(w);
        const stackPct = (val / maxVal) * 100;
        const groupVals = groupArrKey(w);
        const groupSum = Object.values(groupVals).reduce((s, v) => s + v, 0);
        const segments = groupSum > 0
            ? keys.map((label, i) => {
                const gv = groupVals[i + 1] || 0;
                return gv > 0
                    ? `<span style="width:${(gv / groupSum) * 100}%; background:${colors[i + 1]};" title="${escapeHtml(label)}"></span>`
                    : '';
            }).join('')
            : '';
        const share = totalVal > 0 ? ((val / totalVal) * 100).toFixed(1) : '0.0';
        const label = w.idx < 0 ? w.name : `${w.number !== null && w.number !== undefined && w.number !== '' ? w.number + ' · ' : ''}${w.name}`;
        const carbonKg = carbonKgFromVolume(w.volumeM3);

        const row = document.createElement('div');
        row.className = 'report-district-row' + (w.idx < 0 ? ' is-outside' : '');
        const head = document.createElement('div');
        head.className = 'report-district-head';
        head.setAttribute('role', 'button');
        head.setAttribute('tabindex', '0');
        head.setAttribute('aria-expanded', 'false');
        head.title = `${w.count.toLocaleString()} trees · ${w.volumeM3.toLocaleString(undefined, { maximumFractionDigits: 1 })} m³ · ${Math.round(carbonKg).toLocaleString()} kgCO2e`;
        head.innerHTML = `
            <span class="caret">&#9654;</span>
            <span class="report-bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
            <span class="report-bar-track"><span class="report-district-stack" style="width:${stackPct}%;">${segments}</span></span>
            <span class="report-bar-value">${formatDistrictValue(val, metric, 'total')}${metric === 'count' ? '' : ' ' + m.unit} (${share}%)</span>
        `;
        const detail = document.createElement('div');
        detail.className = 'report-district-detail';
        const toggle = () => {
            const open = row.classList.toggle('open');
            head.setAttribute('aria-expanded', String(open));
            if (open && !detail.dataset.built) {
                detail.appendChild(buildDistrictDetailEl(w, detailCtx));
                detail.dataset.built = '1';
            }
        };
        head.addEventListener('click', toggle);
        head.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
        row.appendChild(head);
        row.appendChild(detail);
        barsArea.appendChild(row);
        if (w.idx >= 0) rowByWard.set(w.idx, row);
    });

    const note = document.createElement('p');
    note.className = 'report-district-note';
    note.textContent = `Bars show each district's ${m.label.toLowerCase()} (district totals, ranked high to low); `
        + `segments split it by ${groupLabelForType(groupType)}. Click a district (on the map or in the list) for its full breakdown. `
        + 'The map shades districts by the same figure; its per-area scale options (per km² / per hectare) affect shading only.'
        + (outside.count > 0 ? ' "Outside districts" are trees whose location falls beyond every district boundary.' : '');
    barsArea.appendChild(note);
}

// Fills the placeholder container the report leaves for this section.
// Async because the first run over a city pays a one-time tree->district
// assignment; the rest of the report is already on screen by then.
async function fillDistrictReportSection(container, methodologyEl) {
    reportDistrictGroupType = selectedClusterGroupType; // each new report starts from the rail's setting
    container.innerHTML = '';
    container.appendChild(makeReportSubTitle('By District'));
    const status = document.createElement('p');
    status.className = 'report-district-note';
    status.textContent = 'Assigning trees to districts...';
    container.appendChild(status);
    try {
        // force: always recount here so this section can never disagree
        // with the totals the rest of this report just computed.
        let entry = await getFreshDistrictStats((p) => {
            status.textContent = `Assigning trees to districts... ${Math.round(p * 100)}%`;
        }, true);
        if (!entry) entry = await getFreshDistrictStats(null, true);
        if (!container.isConnected || !entry) return; // report was regenerated/closed meanwhile
        reportDistrictState = { container, entry, methodologyEl: methodologyEl || null };
        renderDistrictReportSection(container, entry);
    } catch (err) {
        console.warn('District breakdown unavailable:', err);
        if (container.isConnected) status.textContent = 'District boundaries could not be loaded, so the district breakdown is unavailable.';
    }
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

    // --- Group distributions: BOTH classifications as donuts side by
    // side, regardless of the Cluster Group Type toggle. ------------------
    const donutGrid = document.createElement('div');
    donutGrid.className = 'report-two-col';
    ['eco', 'building'].forEach((gt) => {
        const col = document.createElement('div');
        col.className = 'report-col';
        col.appendChild(buildGroupDistributionDonutSection(filteredFeatures, total, gt));
        donutGrid.appendChild(col);
    });
    body.appendChild(donutGrid);

    // --- Species and diameter side by side ------------------------------
    const speciesDiameterGrid = document.createElement('div');
    speciesDiameterGrid.className = 'report-two-col';
    const colSpecies = document.createElement('div');
    colSpecies.className = 'report-col';
    const colDiameter = document.createElement('div');
    colDiameter.className = 'report-col';
    speciesDiameterGrid.appendChild(colSpecies);
    speciesDiameterGrid.appendChild(colDiameter);
    body.appendChild(speciesDiameterGrid);

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
    colSpecies.appendChild(speciesTitle);

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
    colSpecies.appendChild(speciesList);

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
    colDiameter.appendChild(diameterTitle);

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
    colDiameter.appendChild(diameterList);

    // --- Wood volume + embodied carbon estimate -----------------------
    const carbon = computeEmbodiedCarbonEstimate(filteredFeatures);
    const cityHectares = CITY_LAND_AREA_HECTARES[currentCity] || null;
    const volumePerHectare = cityHectares ? carbon.totalVolumeM3 / cityHectares : null;
    const cityLabel = currentCity === 'toronto' ? 'Toronto' : 'Ottawa';

    const carbonTitle = document.createElement('div');
    carbonTitle.className = 'report-section-title';
    carbonTitle.textContent = 'Estimated Wood Volume & Embodied Carbon';
    body.appendChild(carbonTitle);

    const volumeStatRow = document.createElement('div');
    volumeStatRow.className = 'report-stat-row';
    const perHectareLabel = cityHectares
        ? `Per hectare of ${cityLabel}'s ${cityHectares.toLocaleString()} ha total land area`
        : 'Per hectare (city land area unknown)';
    volumeStatRow.innerHTML = `
        <div class="report-stat">
            <div class="value">${carbon.totalVolumeM3.toLocaleString(undefined, { maximumFractionDigits: 1 })} m&sup3;</div>
            <div class="label">Total wood volume</div>
        </div>
        <div class="report-stat">
            <div class="value">${formatVolumePerHectare(volumePerHectare)}</div>
            <div class="label">${perHectareLabel}</div>
        </div>
    `;
    body.appendChild(volumeStatRow);

    const carbonStatRow = document.createElement('div');
    carbonStatRow.className = 'report-stat-row';
    const tonnes = carbon.totalKgCO2e / 1000;
    carbonStatRow.innerHTML = `
        <div class="report-stat">
            <div class="value">${carbon.totalKgCO2e.toLocaleString(undefined, { maximumFractionDigits: 0 })} kgCO2e</div>
            <div class="label">${tonnes.toFixed(1)} tonnes CO2e</div>
        </div>
    `;
    volumeStatRow.appendChild(carbonStatRow.firstElementChild); // one row: volume | per hectare | carbon

    const excludedNote = carbon.treesExcludedNoDBH > 0
        ? `<p>${carbon.treesExcludedNoDBH.toLocaleString()} of ${total.toLocaleString()} trees have no recorded diameter and were excluded from this estimate.</p>`
        : '';
    const taperPct = carbon.treesUsed > 0 ? ((carbon.treesTaperModel / carbon.treesUsed) * 100) : 0;
    const fallbackPct = carbon.treesUsed > 0 ? ((carbon.treesFallback / carbon.treesUsed) * 100) : 0;

    // --- Volume-flow Sankey (only while a group filter is active) ---
    if (selectedEcoGroupIds.size > 0 || selectedBuildingGroupIds.size > 0) {
        body.appendChild(buildGroupVolumeSankeySection(filteredFeatures));
    }

    // --- By District (filled in asynchronously; see fillDistrictReportSection) ---
    const districtContainer = document.createElement('div');
    districtContainer.className = 'report-district-section';
    body.appendChild(districtContainer);

    const methodology = document.createElement('div');
    methodology.className = 'report-methodology';
    methodology.innerHTML = `
        <p><b>Methodology:</b></p>
        <p><b>${carbon.treesTaperModel.toLocaleString()} of ${carbon.treesUsed.toLocaleString()} trees (${taperPct.toFixed(1)}%)</b> use real per-species stem volume from Ung, Guo &amp; Fortin (2013), "Canadian national taper models" (<i>The Forestry Chronicle</i>, 89(2), 211&ndash;224) - the published model underlying Natural Resources Canada's own <a href="https://apps-scf-cfs.rncan.gc.ca/calc/en/volume-calculator" target="_blank" rel="noopener">Forest Volume Calculator</a>. From DBH alone, this predicts total height (H = &beta;&#8320; &times; DBH<sup>&beta;&#8321;</sup>) and integrates the tree's actual tapering stem shape (not a uniform cylinder) via Smalian's formula, the same numerical method the paper itself uses. Random effects requiring site-specific calibration data are omitted, consistent with the paper's own framing of the fixed-effects-only model as appropriate for national-level estimates without local stand data.</p>
        <p><b>${carbon.treesFallback.toLocaleString()} tree${carbon.treesFallback === 1 ? '' : 's'} (${fallbackPct.toFixed(1)}%)</b> ${carbon.treesFallback === 1 ? 'has' : 'have'} a species not among the paper's 34 covered species, and fall back to a simple cylinder (DBH &times; one assumed ${FALLBACK_ASSUMED_TREE_HEIGHT_M}m height for every tree) rather than a fabricated "average species" taper curve, which would not be statistically meaningful given how differently each species' coefficients behave.</p>
        <p>For every tree, volume &times; an assumed wood density of ${ASSUMED_WOOD_DENSITY_KG_PER_M3} kg/m&sup3; gives mass; mass &times; ${TIMBER_CARBON_FACTOR_KG_CO2E_PER_KG} kgCO2e/kg gives embodied carbon. Carbon factor source: ICE (Inventory of Carbon &amp; Energy) database - "Timber, average of all data, no carbon storage". <b>Wood density is still an unresolved rough placeholder</b> - ICE's own documentation gives a wide range (350&ndash;800 kg/m&sup3;) rather than one fixed figure for this general category, unaffected by the taper-model upgrade above.</p>
        <p><b>Wood volume per hectare</b> divides the same total volume by ${cityLabel}'s total municipal land area (${cityHectares ? cityHectares.toLocaleString() : 'unknown'} ha) - fixed per city, not the area covered by the trees currently matching your filters, so the figure stays comparable across different filter selections within the same city rather than swinging with how spread out a given filter's matches happen to be. Because street trees are sparse relative to a whole city's land area (unlike a continuous forest stand), this number is often well under 1 m&sup3;/ha - shown to 3 significant figures rather than a fixed decimal count so a real small value doesn't display as a misleading flat "0".</p>
        <p><b>District figures</b> (the "By District" section, the District Choropleth and the Excel "By District" sheet) assign each tree to the ward polygon that contains its location (a point-in-polygon test against the same Ottawa Wards / Toronto City Wards boundaries as the Districts layer), then total that ward's trees, volume and carbon with exactly the methods above. Trees located outside every ward boundary appear as "Outside districts", so the district figures always add back up to the totals above. The district map shades each ward by five quantile classes (roughly equal numbers of districts per shade); its outlines are simplified for display only and never affect any figure.</p>
        ${excludedNote}
        <p>This is an illustrative estimate, not a substitute for a certified carbon assessment.</p>
    `;
    // Fallback position (under the district section); once the district
    // section is drawn it moves the notes into its left column.
    body.appendChild(methodology);
    fillDistrictReportSection(districtContainer, methodology);

    openResultsModal();
}

//===================================================================
// Results Summary: volume-flow Sankey (Ecological Group -> Building Group)
//
// Shown only while at least one Ecological or Building Group is ticked in
// the Filters tab. Every tree belongs to exactly one ecological group and
// one building group, so the wood volume of the filtered trees can be laid
// out as a bipartite flow: left nodes = ecological groups, right nodes =
// building groups, and each ribbon's width = the summed stem volume (m3) of
// the trees that are in BOTH groups. Volumes come from the same
// getCachedTreeVolumeM3() the report totals and the district stats use, so
// the diagram's grand total equals "Total wood volume" above it (trees with
// no usable diameter have no volume and are not in it). Drawn as static
// inline SVG (like the district map) so it prints with the report.
//===================================================================
const SANKEY_VIEW_WIDTH = 1100;
const SANKEY_LABEL_MARGIN = 330;   // room for node labels either side
const SANKEY_NODE_WIDTH = 16;
const SANKEY_PLOT_HEIGHT = 360;
const SANKEY_NODE_GAP = 12;
const SANKEY_HEADER_HEIGHT = 30;

// matrix[e][b] = volume (m3) of filtered trees with ecological group e and
// building group b (ids 1-8). Also returns how many trees had no volume.
function computeGroupVolumeMatrix(features) {
    const matrix = Array.from({ length: 9 }, () => new Array(9).fill(0));
    let total = 0;
    let treesWithVolume = 0;
    let treesWithoutVolume = 0;
    features.forEach((f) => {
        const p = f.properties;
        const v = getCachedTreeVolumeM3(p);
        if (v === null || v === undefined) { treesWithoutVolume += 1; return; }
        const e = p._ecoGroupId >= 1 && p._ecoGroupId <= 8 ? p._ecoGroupId : 8;
        const b = p._buildingGroupId >= 1 && p._buildingGroupId <= 8 ? p._buildingGroupId : 8;
        matrix[e][b] += v;
        total += v;
        treesWithVolume += 1;
    });
    return { matrix, total, treesWithVolume, treesWithoutVolume };
}

// Greedy word wrap to at most two lines of ~maxChars characters.
function wrapSankeyLabel(text, maxChars) {
    if (text.length <= maxChars) return [text];
    const words = text.split(' ');
    let first = '';
    let i = 0;
    while (i < words.length && (first + ' ' + words[i]).trim().length <= maxChars) {
        first = (first + ' ' + words[i]).trim();
        i += 1;
    }
    if (!first) { first = words[0]; i = 1; }
    return [first, words.slice(i).join(' ')].filter(Boolean);
}

// Push label centres apart so adjacent (small) nodes don't overprint.
function spreadSankeyLabels(items, top, bottom, gap) {
    items.sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i++) {
        const minY = items[i - 1].y + items[i - 1].h / 2 + items[i].h / 2 + gap;
        if (items[i].y < minY) items[i].y = minY;
    }
    const last = items[items.length - 1];
    if (last && last.y + last.h / 2 > bottom) {
        last.y = bottom - last.h / 2;
        for (let i = items.length - 2; i >= 0; i--) {
            const maxY = items[i + 1].y - items[i + 1].h / 2 - items[i].h / 2 - gap;
            if (items[i].y > maxY) items[i].y = maxY;
        }
    }
    const first = items[0];
    if (first && first.y - first.h / 2 < top) first.y = top + first.h / 2;
}

function buildGroupVolumeSankeySection(features) {
    const wrap = document.createElement('div');
    wrap.className = 'report-sankey-section';
    wrap.appendChild(makeReportSubTitle('Volume Flow Between Group Types'));

    const { matrix, total, treesWithVolume, treesWithoutVolume } = computeGroupVolumeMatrix(features);

    const note = document.createElement('p');
    note.className = 'report-district-note';
    note.textContent = 'Each ribbon is the wood volume (m³) of the filtered trees that belong to both an ecological group (left) '
        + 'and a building group (right); ribbon width is proportional to volume. Shown because an ecological or building group '
        + 'filter is selected.'
        + (treesWithoutVolume > 0
            ? ` ${treesWithoutVolume.toLocaleString()} filtered tree${treesWithoutVolume === 1 ? ' has' : 's have'} no recorded diameter, so no volume estimate, and ${treesWithoutVolume === 1 ? 'is' : 'are'} not included.`
            : '');
    wrap.appendChild(note);

    if (!(total > 0)) {
        const empty = document.createElement('p');
        empty.className = 'report-district-note';
        empty.textContent = 'No volume estimate is available for the selected trees, so there is nothing to draw.';
        wrap.appendChild(empty);
        return wrap;
    }

    const ecoKeys = ecoGroupKeys.concat(['Other Species']);
    const bldKeys = buildingGroupKeys.concat(['Other Species']);
    const ecoColors = groupColorsForType('eco');
    const bldColors = groupColorsForType('building');
    const fmtV = (v) => v.toLocaleString(undefined, { maximumFractionDigits: 1 });

    // Nodes: only groups with volume, in group order.
    const left = [];
    const right = [];
    for (let g = 1; g <= 8; g++) {
        const lv = matrix[g].reduce((s, v) => s + v, 0);
        if (lv > 0) left.push({ id: g, label: ecoKeys[g - 1], value: lv, color: ecoColors[g] });
        let rv = 0;
        for (let e = 1; e <= 8; e++) rv += matrix[e][g];
        if (rv > 0) right.push({ id: g, label: bldKeys[g - 1], value: rv, color: bldColors[g] });
    }

    // One shared vertical scale so ribbon widths match at both ends.
    const scaleFor = (n) => (SANKEY_PLOT_HEIGHT - SANKEY_NODE_GAP * (n - 1)) / total;
    const k = Math.min(scaleFor(left.length), scaleFor(right.length));
    const colHeight = (nodes) => nodes.length * 0 + total * k + SANKEY_NODE_GAP * (nodes.length - 1);
    const placeColumn = (nodes) => {
        let y = SANKEY_HEADER_HEIGHT + (SANKEY_PLOT_HEIGHT - colHeight(nodes)) / 2;
        nodes.forEach((n) => { n.y = y; n.h = n.value * k; y += n.h + SANKEY_NODE_GAP; n.outOff = 0; n.inOff = 0; });
    };
    placeColumn(left);
    placeColumn(right);

    const xL = SANKEY_LABEL_MARGIN;
    const xR = SANKEY_VIEW_WIDTH - SANKEY_LABEL_MARGIN - SANKEY_NODE_WIDTH;
    const xMid = (xL + SANKEY_NODE_WIDTH + xR) / 2;

    // Links, ordered to limit crossings: each node stacks its ribbons in the
    // order of the node at the other end.
    const links = [];
    left.forEach((ln) => right.forEach((rn) => {
        const v = matrix[ln.id][rn.id];
        if (v > 0) links.push({ ln, rn, v });
    }));
    const byIdx = (arr) => new Map(arr.map((n, i) => [n.id, i]));
    const rIdx = byIdx(right);
    const lIdx = byIdx(left);
    links.sort((a, b) => (lIdx.get(a.ln.id) - lIdx.get(b.ln.id)) || (rIdx.get(a.rn.id) - rIdx.get(b.rn.id)));
    links.forEach((l) => { l.sy = l.ln.y + l.ln.outOff; l.ln.outOff += l.v * k; });
    links.slice().sort((a, b) => (rIdx.get(a.rn.id) - rIdx.get(b.rn.id)) || (lIdx.get(a.ln.id) - lIdx.get(b.ln.id)))
        .forEach((l) => { l.ty = l.rn.y + l.rn.inOff; l.rn.inOff += l.v * k; l.w = l.v * k; });

    const svgNS = 'http://www.w3.org/2000/svg';
    const svgHeight = SANKEY_HEADER_HEIGHT + SANKEY_PLOT_HEIGHT + 14;
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${SANKEY_VIEW_WIDTH} ${svgHeight}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Sankey diagram of wood volume flowing from ${left.length} ecological group${left.length === 1 ? '' : 's'} to ${right.length} building group${right.length === 1 ? '' : 's'}; total ${fmtV(total)} cubic metres`);
    const el = (name, attrs, text) => {
        const e = document.createElementNS(svgNS, name);
        Object.entries(attrs).forEach(([a, v]) => e.setAttribute(a, v));
        if (text !== undefined) e.textContent = text;
        return e;
    };

    // Column headings
    svg.appendChild(el('text', { x: xL + SANKEY_NODE_WIDTH / 2, y: 16, 'text-anchor': 'middle', class: 'sankey-heading' }, 'Ecological Groups'));
    svg.appendChild(el('text', { x: xR + SANKEY_NODE_WIDTH / 2, y: 16, 'text-anchor': 'middle', class: 'sankey-heading' }, 'Building Groups'));

    // Ribbons first (under the nodes)
    const linkLayer = el('g', {});
    links.forEach((l) => {
        const x0 = xL + SANKEY_NODE_WIDTH;
        const x1 = xR;
        const d = `M${x0},${l.sy} C${xMid},${l.sy} ${xMid},${l.ty} ${x1},${l.ty} `
            + `L${x1},${l.ty + l.w} C${xMid},${l.ty + l.w} ${xMid},${l.sy + l.w} ${x0},${l.sy + l.w} Z`;
        const p = el('path', { d, fill: l.ln.color, class: 'sankey-link' });
        p.appendChild(el('title', {},
            `${l.ln.label} (ecological) → ${l.rn.label} (building)\n${fmtV(l.v)} m³ · ${((l.v / total) * 100).toFixed(1)}% of the total volume`
            + `\n${((l.v / l.ln.value) * 100).toFixed(1)}% of this ecological group · ${((l.v / l.rn.value) * 100).toFixed(1)}% of this building group`));
        linkLayer.appendChild(p);
    });
    svg.appendChild(linkLayer);

    // Nodes + labels
    const drawColumn = (nodes, xNode, side) => {
        nodes.forEach((n) => {
            const r = el('rect', { x: xNode, y: n.y, width: SANKEY_NODE_WIDTH, height: Math.max(n.h, 1.5), fill: n.color, class: 'sankey-node' });
            r.appendChild(el('title', {}, `${n.label} (${side === 'left' ? 'ecological' : 'building'})\n${fmtV(n.value)} m³ · ${((n.value / total) * 100).toFixed(1)}% of the total volume`));
            svg.appendChild(r);
        });
        const labels = nodes.map((n) => {
            const lines = wrapSankeyLabel(n.label, 38);
            return { n, lines, y: n.y + n.h / 2, h: (lines.length + 1) * 14 };
        });
        spreadSankeyLabels(labels, SANKEY_HEADER_HEIGHT - 4, SANKEY_HEADER_HEIGHT + SANKEY_PLOT_HEIGHT + 10, 4);
        labels.forEach((L) => {
            const x = side === 'left' ? xNode - 8 : xNode + SANKEY_NODE_WIDTH + 8;
            const anchor = side === 'left' ? 'end' : 'start';
            const top = L.y - L.h / 2 + 11;
            L.lines.forEach((line, i) => svg.appendChild(el('text', { x, y: top + i * 14, 'text-anchor': anchor, class: 'sankey-label' }, line)));
            svg.appendChild(el('text', { x, y: top + L.lines.length * 14, 'text-anchor': anchor, class: 'sankey-value' },
                `${fmtV(L.n.value)} m³ · ${((L.n.value / total) * 100).toFixed(1)}%`));
        });
    };
    drawColumn(left, xL, 'left');
    drawColumn(right, xR, 'right');

    const chart = document.createElement('div');
    chart.className = 'report-sankey';
    chart.appendChild(svg);
    wrap.appendChild(chart);
    wrap.sankeyData = { matrix, total, treesWithVolume, treesWithoutVolume, left, right, links };
    return wrap;
}

//===================================================================
// Results Summary: downloadable Excel workbook (.xlsx, via SheetJS)
//
// The print button (above) hands the person a formatted, visual copy
// of the Results Summary panel. This button gives the same information
// as an actual Excel workbook instead, with two sheets:
//   - "Tree Data": one row per tree currently matching the active
//     filters - the underlying records, for further analysis in
//     Excel/GIS.
//   - "Results Summary": the same aggregate figures the visual report
//     itself shows (group/species/diameter distributions, wood volume,
//     embodied carbon), as plain tables rather than charts.
// A true multi-sheet file needs the .xlsx format itself - a CSV has no
// concept of a second sheet - so this replaced the earlier plain-CSV
// export. SheetJS (the `XLSX` global, loaded via a normal <script> tag
// in the HTML head, same trusted unpkg CDN already used for
// maplibre-gl) builds the workbook and triggers the download; no server
// round-trip, everything happens in the browser.
//===================================================================

// Builds the "Tree Data" sheet as an array-of-arrays (row 0 = headers).
//
// District is filled in via a point-in-polygon spatial join
// (findDistrictForPoint) against that city's ward boundaries, run only
// over the filtered rows going into this export (not the full ~300k-tree
// dataset) - a tree's props never carried a district on their own (that
// property only ever existed on the ward POLYGON features), so this is
// computed fresh each export rather than read off the tree.
//
// Latin Name is Toronto's real sourced BOTANICAL_NAME where the source
// data provides one, and 'NULL' for Ottawa - Ottawa's tree dataset has
// no botanical/Latin name field at all, and per the user's explicit
// choice this export does not fill that gap with an inferred value
// (derived from the same word-matching used for group assignment),
// since that would present a guess as if it were sourced data; 'NULL'
// marks it as genuinely absent rather than an empty cell that could
// read as an oversight.
//
// Longitude/Latitude are rounded to 6 decimal places (~11cm of
// precision at these latitudes - far finer than a single tree's actual
// footprint) and written as real numbers, not strings. The raw
// coordinates carry 15-17 significant digits, which is beyond Excel's
// 15-significant-digit numeric precision; Excel responds to that by
// silently storing the value as TEXT with a leading apostrophe marker
// (visible in a plain viewer, hidden in Excel's own grid) rather than a
// plain number. Rounding removes the excess digits so the cell is just
// a normal number, with no apostrophe and no precision loss that
// matters at tree scale.
function buildTreeDataSheetRows(filteredFeatures, districtsData, cityLabel) {
    const headers = [
        'Tree ID', 'City', 'Species', 'Latin Name', 'Diameter (cm)',
        'Ecological Group', 'Building Group', 'District',
        'Estimated Wood Volume (m3)', 'Longitude', 'Latitude'
    ];
    const COORD_DECIMALS = 6;
    const rows = filteredFeatures.map((f) => {
        const props = f.properties;
        const coords = (f.geometry && f.geometry.coordinates) || [null, null];
        const ecoLabel = props._ecoGroupId ? (ecoGroupKeys[props._ecoGroupId - 1] || 'Other Species') : 'Unknown';
        const buildingLabel = props._buildingGroupId ? (buildingGroupKeys[props._buildingGroupId - 1] || 'Other Species') : 'Unknown';
        const volumeResult = computeTreeVolumeM3(props);
        const hasCoords = coords[0] !== null && coords[0] !== undefined && coords[1] !== null && coords[1] !== undefined;
        const district = hasCoords ? findDistrictForPoint(coords[0], coords[1], districtsData) : null;
        return [
            props.TREEID !== undefined && props.TREEID !== null ? props.TREEID : 'NULL',
            cityLabel,
            props.SPECIES || 'Unknown',
            props._botanicalName || 'NULL',
            props.DBH !== null && props.DBH !== undefined ? Number(props.DBH) : 'NULL',
            ecoLabel,
            buildingLabel,
            district ? district.name : 'Unknown',
            volumeResult ? Number(volumeResult.volumeM3.toFixed(3)) : 'NULL',
            hasCoords ? Number(coords[0].toFixed(COORD_DECIMALS)) : 'NULL',
            hasCoords ? Number(coords[1].toFixed(COORD_DECIMALS)) : 'NULL'
        ];
    });
    return [headers, ...rows];
}

// Builds the "Results Summary" sheet as an array-of-arrays, mirroring
// the same sections (and the same underlying computations -
// computeGroupCounts, DIAMETER_CLASSES, computeEmbodiedCarbonEstimate)
// as generateResultsSummary() itself, so the sheet can't disagree with
// what the visual report shows. Stacked tables with a blank row and a
// bold-ish section title between them, rather than separate sheets per
// section, keeps it to one scrollable sheet a person can read top to
// bottom the same way they'd read the report.
function buildSummarySheetRows(filteredFeatures, total, cityLabel) {
    const rows = [];
    const pct = (count) => `${((count / total) * 100).toFixed(1)}%`;

    rows.push(['Results Summary']);
    rows.push(['City', cityLabel]);
    rows.push(['Trees matching current filters', total]);
    rows.push([]);

    // --- Group distributions (both classifications - the sheet is a
    // data export, not a screenshot, so it lists both regardless of
    // which one the Cluster Group Type toggle currently has selected
    // for the donut/bar visuals). ---------------------------------
    ['eco', 'building'].forEach((groupType) => {
        const keys = groupKeysForType(groupType);
        const label = groupLabelForType(groupType);
        const counts = computeGroupCounts(filteredFeatures, groupType);
        rows.push([`${label} Distribution`]);
        rows.push(['Group', 'Count', 'Percent']);
        keys.concat(['Other Species']).forEach((rowLabel, i) => {
            const groupId = i + 1;
            const count = counts[groupId] || 0;
            if (count === 0) return;
            rows.push([rowLabel, count, pct(count)]);
        });
        rows.push([]);
    });

    // --- Species distribution (top 8 + Other, same as the report) ---
    const speciesCounts = {};
    filteredFeatures.forEach((f) => {
        const sp = f.properties.SPECIES || 'Unknown';
        speciesCounts[sp] = (speciesCounts[sp] || 0) + 1;
    });
    const sortedSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]);
    const TOP_N = 8;
    const topSpecies = sortedSpecies.slice(0, TOP_N);
    const otherSpeciesCount = sortedSpecies.slice(TOP_N).reduce((sum, [, c]) => sum + c, 0);
    rows.push([sortedSpecies.length > TOP_N ? `Species Distribution (top ${TOP_N})` : 'Species Distribution']);
    rows.push(['Species', 'Count', 'Percent']);
    topSpecies.forEach(([species, count]) => rows.push([species, count, pct(count)]));
    if (otherSpeciesCount > 0) {
        rows.push([`Other (${sortedSpecies.length - TOP_N} species)`, otherSpeciesCount, pct(otherSpeciesCount)]);
    }
    rows.push([]);

    // --- Diameter breakdown (same DIAMETER_CLASSES buckets as the
    // report and the Diameter filter dropdown) -----------------------
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
    rows.push(['Diameter Breakdown']);
    rows.push(['Diameter Class', 'Count', 'Percent']);
    DIAMETER_CLASSES.forEach((cls) => {
        const count = diameterCounts[cls.key];
        if (count === 0) return;
        rows.push([cls.label, count, pct(count)]);
    });
    if (unknownDiameterCount > 0) {
        rows.push(['Unknown', unknownDiameterCount, pct(unknownDiameterCount)]);
    }
    rows.push([]);

    // --- Wood volume + embodied carbon (same figures/methodology as
    // the report's "Estimated Wood Volume & Embodied Carbon" section) ---
    const carbon = computeEmbodiedCarbonEstimate(filteredFeatures);
    const cityHectares = CITY_LAND_AREA_HECTARES[currentCity] || null;
    const volumePerHectare = cityHectares ? carbon.totalVolumeM3 / cityHectares : null;
    const tonnes = carbon.totalKgCO2e / 1000;
    const taperPct = carbon.treesUsed > 0 ? ((carbon.treesTaperModel / carbon.treesUsed) * 100) : 0;
    const fallbackPct = carbon.treesUsed > 0 ? ((carbon.treesFallback / carbon.treesUsed) * 100) : 0;

    rows.push(['Estimated Wood Volume & Embodied Carbon']);
    rows.push(['Total Wood Volume (m3)', Number(carbon.totalVolumeM3.toFixed(2))]);
    rows.push(['Wood Volume per Hectare', formatVolumePerHectare(volumePerHectare).replace(/&sup3;/g, '3')]);
    rows.push(['Hectare Basis', cityHectares ? `${cityLabel}'s ${cityHectares.toLocaleString()} ha total land area` : 'Unknown']);
    rows.push(['Total Embodied Carbon (kgCO2e)', Number(carbon.totalKgCO2e.toFixed(0))]);
    rows.push(['Total Embodied Carbon (tonnes CO2e)', Number(tonnes.toFixed(1))]);
    rows.push(['Trees Used in Volume Estimate', carbon.treesUsed]);
    rows.push(['Trees Excluded (No Diameter Recorded)', carbon.treesExcludedNoDBH]);
    rows.push(['Trees Using Real Per-Species Taper Model', carbon.treesTaperModel, `${taperPct.toFixed(1)}%`]);
    rows.push(['Trees Using Fallback Cylinder Estimate', carbon.treesFallback, `${fallbackPct.toFixed(1)}%`]);

    return rows;
}

// Builds the "By District" sheet from a computeDistrictStats() result, as
// an array-of-arrays with two stacked tables:
//   1. One row per district: tree count, wood volume, embodied carbon,
//      Ecological and Building Group counts, diameter-class counts, plus a
//      Total row (which equals the Results Summary's overall figures).
//   2. Species x district tree counts (rows = species, columns = districts)
//      - the full species detail that's too wide for the on-screen chart.
// Trees outside every ward boundary get their own "Outside districts" row/
// column (only when there are any) so every total reconciles.
function buildDistrictSheetRows(result, cityLabel) {
    const { wards, outside, total } = result;
    const rowsOf = wards.slice().sort((a, b) =>
        String(a.number !== null && a.number !== undefined && a.number !== '' ? a.number : a.name)
            .localeCompare(String(b.number !== null && b.number !== undefined && b.number !== '' ? b.number : b.name), undefined, { numeric: true }));
    if (outside.count > 0) rowsOf.push(outside);

    const ecoKeys = groupKeysForType('eco').concat(['Other Species']);
    const bldKeys = groupKeysForType('building').concat(['Other Species']);
    const pct = (n) => (total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0.0%');

    const rows = [];
    rows.push([`Results by District - ${cityLabel}`]);
    rows.push(['Trees matching current filters', total]);
    rows.push([]);
    rows.push([
        'District', 'District Number', 'Area (km2)', 'Tree Count', 'Share of Trees',
        'Wood Volume (m3)', 'Embodied Carbon (kgCO2e)', 'Embodied Carbon (tonnes CO2e)', 'Trees With Volume Estimate',
        ...ecoKeys.map((k) => `Ecological: ${k}`),
        ...bldKeys.map((k) => `Building: ${k}`),
        ...DIAMETER_CLASSES.map((c) => `Diameter ${c.label}`), 'Diameter Unknown'
    ]);

    const rowFor = (w) => {
        const carbonKg = carbonKgFromVolume(w.volumeM3);
        return [
            w.name,
            w.number !== null && w.number !== undefined && w.number !== '' ? w.number : 'NULL',
            w.areaKm2 !== null && w.areaKm2 !== undefined ? Number(w.areaKm2.toFixed(2)) : 'NULL',
            w.count, pct(w.count),
            Number(w.volumeM3.toFixed(2)), Math.round(carbonKg), Number((carbonKg / 1000).toFixed(2)), w.treesWithVolume,
            ...ecoKeys.map((_, i) => w.ecoCount[i + 1] || 0),
            ...bldKeys.map((_, i) => w.bldCount[i + 1] || 0),
            ...DIAMETER_CLASSES.map((c) => w.diameter[c.key] || 0), w.diameter.unknown || 0
        ];
    };
    rowsOf.forEach((w) => rows.push(rowFor(w)));

    // Total row. Volume/carbon are summed from the UNROUNDED per-district
    // values (not from the rounded cells above) so the total matches the
    // Results Summary's overall figure exactly; counts are plain sums.
    const dataRows = rowsOf.map(rowFor);
    const totalRow = new Array(dataRows.length ? dataRows[0].length : 0).fill(0);
    for (let c = 9; c < totalRow.length; c++) totalRow[c] = dataRows.reduce((s, r) => s + (r[c] || 0), 0);
    const totalVolume = rowsOf.reduce((s, w) => s + w.volumeM3, 0);
    const totalCarbonKg = carbonKgFromVolume(totalVolume);
    totalRow[0] = 'Total';
    totalRow[1] = '';
    totalRow[2] = '';
    totalRow[3] = rowsOf.reduce((s, w) => s + w.count, 0);
    totalRow[4] = pct(totalRow[3]);
    totalRow[5] = Number(totalVolume.toFixed(2));
    totalRow[6] = Math.round(totalCarbonKg);
    totalRow[7] = Number((totalCarbonKg / 1000).toFixed(2));
    totalRow[8] = rowsOf.reduce((s, w) => s + w.treesWithVolume, 0);
    rows.push(totalRow);

    // --- Species x district matrix --------------------------------------
    rows.push([]);
    rows.push(['Species by District (tree counts)']);
    rows.push(['Species', ...rowsOf.map((w) => w.name), 'Total']);
    const speciesTotals = {};
    rowsOf.forEach((w) => Object.entries(w.species).forEach(([sp, c]) => { speciesTotals[sp] = (speciesTotals[sp] || 0) + c; }));
    Object.entries(speciesTotals)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .forEach(([sp, tot]) => rows.push([sp, ...rowsOf.map((w) => w.species[sp] || 0), tot]));
    return rows;
}

// Builds and triggers download of an .xlsx workbook covering every tree
// currently matching the active filters - the exact same set the
// Results Summary panel itself summarizes (both call treePassesFilters()
// the same way), so nothing here can drift out of sync with the visual
// report. XLSX.writeFile() (SheetJS) handles the file's binary encoding
// and the browser download trigger - no manual Blob/anchor plumbing
// needed for this format.
async function downloadResultsWorkbook() {
    const filteredFeatures = allTreesData.features.filter((f) => treePassesFilters(f.properties));
    if (filteredFeatures.length === 0) return; // button is unreachable with 0 results (modal shows "nothing to summarize" instead), but guard anyway

    setStatusText('Preparing Excel file...');
    let districtsData = null;
    try {
        districtsData = await getDistrictsData(currentCity);
    } catch (err) {
        console.warn('Could not load district boundaries for the export - District column will show "Unknown".', err);
    }

    const cityLabel = currentCity === 'toronto' ? 'Toronto' : 'Ottawa';
    const treeRows = buildTreeDataSheetRows(filteredFeatures, districtsData, cityLabel);
    const summaryRows = buildSummarySheetRows(filteredFeatures, filteredFeatures.length, cityLabel);

    // Per-district stats for the third sheet. force: recount from the same
    // filtered set the other two sheets use. If the ward boundaries can't be
    // loaded, the workbook still downloads - just without that sheet.
    let districtEntry = null;
    try {
        districtEntry = await getFreshDistrictStats((p) => setStatusText(`Assigning trees to districts... ${Math.round(p * 100)}%`), true);
        if (!districtEntry) districtEntry = await getFreshDistrictStats(null, true);
    } catch (err) {
        console.warn('Could not build the By District sheet - exporting without it.', err);
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(treeRows), 'Tree Data');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), 'Results Summary');
    if (districtEntry) {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(buildDistrictSheetRows(districtEntry.result, cityLabel)), 'By District');
    }

    const dateStamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `${currentCity}_tree_results_${dateStamp}.xlsx`);
    setStatusText('');
}

//===================================================================
// Results Summary modal open/close wiring
//===================================================================
const resultsModalBackdrop = document.getElementById('resultsModalBackdrop');
const resultsModalClose = document.getElementById('resultsModalClose');
const resultsModalPrint = document.getElementById('resultsModalPrint');
const resultsModalDownloadExcel = document.getElementById('resultsModalDownloadExcel');
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
resultsModalDownloadExcel.addEventListener('click', downloadResultsWorkbook);
// Click on the dark backdrop (not the modal card itself) closes it.
resultsModalBackdrop.addEventListener('click', (e) => {
    if (e.target === resultsModalBackdrop) closeResultsModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resultsModalBackdrop.classList.contains('open')) closeResultsModal();
});
