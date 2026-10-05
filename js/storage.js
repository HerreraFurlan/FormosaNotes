/**
 * =====================================================
 * AppChino — storage.js
 * Persistence layer: localStorage CRUD operations.
 * Designed to be swapped for SQLite/API calls later.
 * =====================================================
 */

const DB_KEY = 'appchino_db';

// --------------------------------------------------
// Core read/write
// --------------------------------------------------

const CLASSIFIER_MAPPING = {
    '個 gè': 'id_mtfhewfx_gtw3b',
    '個': 'id_mtfhewfx_gtw3b',
    '隻 zhī': 'id_mtfigeht_eqxfj',
    '隻': 'id_mtfigeht_eqxfj',
    '位': 'id_clf_wei',
    '位 wèi': 'id_clf_wei',
    '張 zhāng': 'id_mty004_zhang',
    '張': 'id_mty004_zhang',
    '本 běn': 'id_clf_ben',
    '本': 'id_clf_ben',
    '杯 / 瓶 / 壺': 'id_clf_bei',
    '杯 bēi': 'id_clf_bei',
    '杯': 'id_clf_bei',
    '瓶 píng': 'id_clf_ping',
    '瓶': 'id_clf_ping',
    '棟 dòng': 'id_clf_dong',
    '棟': 'id_clf_dong',
    '歲 suì': 'id_mtgn2mv8_7ji91',
    '歲': 'id_mtgn2mv8_7ji91',
    '顆 kē': 'id_clf_ke',
    '顆': 'id_clf_ke',
    '間 jiān': 'id_clf_jian',
    '間': 'id_clf_jian',
    '朵 duǒ': 'id_clf_duo',
    '朵': 'id_clf_duo',
    '門 mén': 'id_clf_men',
    '門': 'id_clf_men',
    '次 cì': 'id_clf_ci',
    '次': 'id_clf_ci',
    '點': 'id_clf_dian',
    '點 diǎn': 'id_clf_dian',
    '分': 'id_clf_fen',
    '分 fēn': 'id_clf_fen',
    '刻': 'id_clf_ke_time',
    '刻 kè': 'id_clf_ke_time',
    '日': 'id_clf_ri',
    '日 rì': 'id_clf_ri',
    '號': 'id_clf_hao',
    '號 hào': 'id_clf_hao',
    '些': 'id_clf_xie',
    '些 xiē': 'id_clf_xie',
};

/**
 * Sanitizes and migrates database data ensuring all 10 classifiers exist,
 * moving misplaced classifiers, and converting plain-text classifier strings to IDs.
 * @param {object} data
 * @returns {object}
 */
const sanitizeAndMigrateData = (data) => {
    if (!data) return data;
    if (!data.meta) data.meta = { version: '1.0', ultimaEdicion: new Date().toISOString().split('T')[0] };

    // 1. Ensure data.clasificadores exists and has all default classifiers
    if (!data.clasificadores || !Array.isArray(data.clasificadores) || data.clasificadores.length === 0) {
        data.clasificadores = JSON.parse(JSON.stringify(DEFAULT_CLASSIFIERS));
    } else {
        const existingIds = new Set(data.clasificadores.map(c => c.id));
        DEFAULT_CLASSIFIERS.forEach(defClf => {
            if (!existingIds.has(defClf.id)) {
                data.clasificadores.push(JSON.parse(JSON.stringify(defClf)));
            }
        });
    }

    // 2. Remove any classifiers that might be lingering in other category arrays
    const clfIds = new Set(data.clasificadores.map(c => c.id));
    for (const cat of ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas']) {
        if (Array.isArray(data[cat])) {
            data[cat] = data[cat].filter(w => !clfIds.has(w.id));
        }
    }

    // 3. Convert plain-text classifiers to IDs across all categories
    for (const cat of ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas', 'clasificadores']) {
        if (Array.isArray(data[cat])) {
            data[cat].forEach(w => {
                if (w.clasificador && CLASSIFIER_MAPPING[w.clasificador]) {
                    w.clasificador = CLASSIFIER_MAPPING[w.clasificador];
                }
            });
        }
    }

    // 4. Ensure no card references a classifier as a radical
    for (const cat of ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas', 'clasificadores']) {
        if (Array.isArray(data[cat])) {
            data[cat].forEach(w => {
                if (Array.isArray(w.radicales)) {
                    w.radicales = w.radicales.map(r => {
                        if (r && r.type === 'ref' && clfIds.has(r.id)) {
                            const clfCard = data.clasificadores.find(c => c.id === r.id);
                            const name = clfCard ? clfCard.tradicional : 'Radical';
                            return { type: 'text', value: name };
                        }
                        return r;
                    });
                }
            });
        }
    }

    // 5. Ensure all structure words are present
    if (typeof NEW_STRUCTURE_WORDS !== 'undefined' && Array.isArray(NEW_STRUCTURE_WORDS)) {
        const catMap = {
            sustantivo: 'palabras',
            pronombre: 'palabras',
            clasificador: 'clasificadores',
            verbo: 'verbos',
            adjetivo: 'adjetivos',
            adverbio: 'adverbios',
            expresion: 'expresiones',
            particula: 'particulas'
        };
        const existingWords = new Set();
        for (const cat of ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas', 'clasificadores']) {
            if (Array.isArray(data[cat])) {
                data[cat].forEach(w => existingWords.add(w.tradicional));
            }
        }
        NEW_STRUCTURE_WORDS.forEach(word => {
            if (!existingWords.has(word.tradicional)) {
                const targetKey = catMap[word.categoria] || 'palabras';
                if (!Array.isArray(data[targetKey])) data[targetKey] = [];
                data[targetKey].push(JSON.parse(JSON.stringify(word)));
                existingWords.add(word.tradicional);
            }
        });
    }

    // 6. Ensure all structures from SEED_DATA are present
    if (typeof SEED_DATA !== 'undefined' && Array.isArray(SEED_DATA.estructuras)) {
        if (!Array.isArray(data.estructuras)) data.estructuras = [];
        const existingStructIds = new Set(data.estructuras.map(s => s.id));
        SEED_DATA.estructuras.forEach(st => {
            if (!existingStructIds.has(st.id)) {
                data.estructuras.push(JSON.parse(JSON.stringify(st)));
                existingStructIds.add(st.id);
            }
        });
    }

    // 7. Sync updated concise mnemonics and standardized radicals from SEED_DATA
    if (typeof SEED_DATA !== 'undefined') {
        const seedMap = new Map();
        for (const cat of ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas', 'clasificadores']) {
            if (Array.isArray(SEED_DATA[cat])) {
                SEED_DATA[cat].forEach(w => seedMap.set(w.id, w));
            }
        }
        for (const cat of ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas', 'clasificadores']) {
            if (Array.isArray(data[cat])) {
                data[cat].forEach(w => {
                    const seedWord = seedMap.get(w.id);
                    if (seedWord) {
                        w.radicales = JSON.parse(JSON.stringify(seedWord.radicales));
                        w.notas = seedWord.notas;
                    }
                });
            }
        }
    }

    return data;
};

/**
 * Loads the full database from localStorage.
 * Seeds with SEED_DATA on first visit and migrates if needed.
 * @returns {object} The complete database object
 */
const loadDB = () => {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
        try {
            const data = JSON.parse(raw);
            if (!data.meta || data.meta.migratedWordsVersion !== '3.4' || !data.clasificadores || data.clasificadores.length === 0) {
                sanitizeAndMigrateData(data);
                data.meta = data.meta || {};
                data.meta.migratedWordsVersion = '3.4';
                saveDB(data);
            }
            return data;
        }
        catch (e) { console.error('Error parsing DB:', e); }
    }
    // First visit — seed with initial data
    const seeded = JSON.parse(JSON.stringify(SEED_DATA));
    sanitizeAndMigrateData(seeded);
    saveDB(seeded);
    return seeded;
};

/**
 * Persists the full database to localStorage.
 * @param {object} data - The complete database object
 */
const saveDB = (data) => {
    if (!data.meta) data.meta = { version: '1.0' };
    data.meta.ultimaEdicion = new Date().toISOString().split('T')[0];
    localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// --------------------------------------------------
// Query helpers
// --------------------------------------------------

/**
 * Returns a flat array of ALL words across every category.
 * @returns {Array<object>}
 */
const getAllWords = () => {
    const db = loadDB();
    const words = [
        ...(db.palabras || []),
        ...(db.verbos || []),
        ...(db.adjetivos || []),
        ...(db.adverbios || []),
        ...(db.expresiones || []),
        ...(db.particulas || []),
        ...(db.clasificadores || []),
    ];

    const order = {
        pronombre: 1,
        sustantivo: 2,
        clasificador: 3,
        verbo: 4,
        adverbio: 5,
        adjetivo: 6,
        expresion: 7,
        particula: 8
    };

    return words.sort((a, b) => {
        const orderA = order[a.categoria] || 99;
        const orderB = order[b.categoria] || 99;
        return orderA - orderB;
    });
};

/**
 * Returns all registered classifiers in the database.
 * @returns {Array<object>}
 */
const getAllClassifiers = () => {
    const db = loadDB();
    return db.clasificadores || [];
};

/**
 * Returns all sentence structures in the database.
 * @returns {Array<object>}
 */
const getAllStructures = () => {
    const db = loadDB();
    return db.estructuras || [];
};

/**
 * Maps a user-facing category to its storage key in the database.
 * @param {string} categoria
 * @returns {string}
 */
const getCategoryKey = (categoria) => {
    const map = {
        sustantivo:   'palabras',
        pronombre:    'palabras',
        clasificador: 'clasificadores',
        verbo:        'verbos',
        adjetivo:     'adjetivos',
        adverbio:     'adverbios',
        expresion:    'expresiones',
        particula:    'particulas',
    };
    return map[categoria] || 'palabras';
};

// --------------------------------------------------
// CRUD — Words
// --------------------------------------------------

/**
 * Creates a new word entry in the database.
 * @param {object} wordData - Word fields (espanol, tradicional, etc.)
 * @returns {object} The created word with generated id
 */
const addWord = (wordData) => {
    const db = loadDB();
    const key = getCategoryKey(wordData.categoria);
    if (!db[key]) db[key] = [];
    wordData.id = generateId();
    wordData.fechaCreacion = new Date().toISOString().split('T')[0];
    db[key].push(wordData);
    saveDB(db);
    return wordData;
};

/**
 * Updates an existing word by ID.
 * Handles category changes (moves entry between arrays).
 * @param {string} id - The word's ID
 * @param {object} updatedData - New field values
 * @returns {boolean} True if found and updated
 */
const updateWord = (id, updatedData) => {
    const db = loadDB();
    const keys = ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas', 'clasificadores'];

    for (const key of keys) {
        if (!db[key]) continue;
        const idx = db[key].findIndex(w => w.id === id);
        if (idx === -1) continue;

        const oldEntry = db[key][idx];
        const newKey = getCategoryKey(updatedData.categoria);

        if (key !== newKey) {
            // Category changed — move to new array
            db[key].splice(idx, 1);
            if (!db[newKey]) db[newKey] = [];
            db[newKey].push({ ...oldEntry, ...updatedData, id });
        } else {
            db[key][idx] = { ...oldEntry, ...updatedData };
        }

        saveDB(db);
        return true;
    }
    return false;
};

/**
 * Deletes a word by ID.
 * @param {string} id
 * @returns {boolean} True if found and deleted
 */
const deleteWord = (id) => {
    const db = loadDB();
    for (const key of ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas', 'clasificadores']) {
        if (!db[key]) continue;
        const idx = db[key].findIndex(w => w.id === id);
        if (idx !== -1) {
            db[key].splice(idx, 1);
            saveDB(db);
            return true;
        }
    }
    return false;
};

// --------------------------------------------------
// CRUD — Structures
// --------------------------------------------------

/**
 * Creates a new sentence structure entry.
 * @param {object} structData
 * @returns {object} The created structure
 */
const addStructure = (structData) => {
    const db = loadDB();
    if (!db.estructuras) db.estructuras = [];
    structData.id = generateId();
    db.estructuras.push(structData);
    saveDB(db);
    return structData;
};

/**
 * Deletes a sentence structure by ID.
 * @param {string} id
 * @returns {boolean}
 */
const deleteStructure = (id) => {
    const db = loadDB();
    if (!db.estructuras) return false;
    const idx = db.estructuras.findIndex(s => s.id === id);
    if (idx !== -1) {
        db.estructuras.splice(idx, 1);
        saveDB(db);
        return true;
    }
    return false;
};

// --------------------------------------------------
// Import / Export helpers (pure data, no UI)
// --------------------------------------------------

/**
 * Returns the full database as a JSON string for export.
 * @returns {string}
 */
const getExportData = () => {
    return JSON.stringify(loadDB(), null, 2);
};

/**
 * Validates and imports a JSON string as the new database.
 * @param {string} jsonString
 * @returns {boolean} True if valid and imported
 */
const importData = (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        if (data.meta && data.meta.version) {
            sanitizeAndMigrateData(data);
            saveDB(data);
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};
