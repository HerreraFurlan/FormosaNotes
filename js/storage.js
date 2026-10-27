/**
 * =====================================================
 * AppChino — storage.js
 * Capa de persistencia (localStorage CRUD) con caché en memoria
 * e indexación O(1) por ID, alimentada desde APP_CONFIG (js/config.js).
 * =====================================================
 */

const DB_KEY = 'appchino_db';

// Caché en memoria por clave de base de datos para evitar JSON.parse masivos (O(N²))
const memoryDBCache = {};
const cachedWordsList = {};
const cachedWordsByIdMap = {};

/**
 * Invalida la caché en memoria para un idioma específico o todos.
 * @param {string} [specificKey]
 */
const invalidateStorageCache = (specificKey = null) => {
    if (specificKey) {
        delete memoryDBCache[specificKey];
        delete cachedWordsList[specificKey];
        delete cachedWordsByIdMap[specificKey];
    } else {
        Object.keys(memoryDBCache).forEach(k => delete memoryDBCache[k]);
        Object.keys(cachedWordsList).forEach(k => delete cachedWordsList[k]);
        Object.keys(cachedWordsByIdMap).forEach(k => delete cachedWordsByIdMap[k]);
    }
};
if (typeof window !== 'undefined') {
    window.invalidateStorageCache = invalidateStorageCache;
}

/**
 * Obtiene la lista de colecciones de palabras desde APP_CONFIG.
 * @returns {Array<string>}
 */
const getStorageCollections = () => {
    if (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.getDBCollections === 'function') {
        return APP_CONFIG.getDBCollections();
    }
    return ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas', 'clasificadores'];
};

/**
 * Obtiene las colecciones que no son clasificadores.
 * @returns {Array<string>}
 */
const getNonClassifierCollections = () => {
    if (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.getNonClassifierCollections === 'function') {
        return APP_CONFIG.getNonClassifierCollections();
    }
    return ['palabras', 'verbos', 'adjetivos', 'adverbios', 'expresiones', 'particulas'];
};

/**
 * Resolves the active database key in localStorage based on selected language and APP_CONFIG.
 * @returns {string}
 */
const getActiveDBKey = () => {
    const lang = (typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage)
        ? window.I18N.getLanguage()
        : (localStorage.getItem('appchino_lang') === 'en' ? 'en' : 'es');

    if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.languages?.available?.[lang]?.dbKey) {
        return APP_CONFIG.languages.available[lang].dbKey;
    }
    return lang === 'en' ? 'appchino_db_en' : 'appchino_db';
};

/**
 * Resolves the active SEED_DATA based on selected language and APP_CONFIG.
 * @returns {object|null}
 */
const getActiveSeedData = () => {
    const lang = (typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage)
        ? window.I18N.getLanguage()
        : (localStorage.getItem('appchino_lang') === 'en' ? 'en' : 'es');

    if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.languages?.available?.[lang]) {
        const globalVar = APP_CONFIG.languages.available[lang].globalVar;
        if (typeof window !== 'undefined' && window[globalVar]) {
            return window[globalVar];
        }
    }

    if (lang === 'en' && typeof SEED_DATA_EN !== 'undefined') {
        return SEED_DATA_EN;
    }
    if (typeof SEED_DATA !== 'undefined') {
        return SEED_DATA;
    }
    return null;
};

/**
 * Maps a user-facing category to its storage key in the database via APP_CONFIG.
 * @param {string} categoria
 * @returns {string}
 */
const getCategoryKey = (categoria) => {
    if (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.getCategoryToDBMap === 'function') {
        const map = APP_CONFIG.getCategoryToDBMap();
        if (map[categoria]) return map[categoria];
    }
    const fallbackMap = {
        sustantivo:   'palabras',
        pronombre:    'palabras',
        clasificador: 'clasificadores',
        verbo:        'verbos',
        adjetivo:     'adjetivos',
        adverbio:     'adverbios',
        expresion:    'expresiones',
        particula:    'particulas',
    };
    return fallbackMap[categoria] || 'palabras';
};

// Alias map from APP_CONFIG
const CLASSIFIER_MAPPING = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.classifierAliases)
    ? APP_CONFIG.classifierAliases
    : {};

/**
 * Sanitizes and migrates database data ensuring all classifiers exist,
 * moving misplaced classifiers, and converting plain-text classifier strings to IDs.
 * @param {object} data
 * @param {object} [seedSource]
 * @returns {object}
 */
const sanitizeAndMigrateData = (data, seedSource) => {
    if (!data) return data;
    const activeSeed = seedSource || getActiveSeedData();
    const fallbackClf = (typeof DEFAULT_CLASSIFIERS !== 'undefined' ? DEFAULT_CLASSIFIERS : []);
    const activeDefaultClf = (activeSeed && Array.isArray(activeSeed.clasificadores) && activeSeed.clasificadores.length > 0)
        ? activeSeed.clasificadores
        : fallbackClf;

    const allCollections = getStorageCollections();
    const nonClfCollections = getNonClassifierCollections();

    if (!data.meta) data.meta = { version: '1.0', ultimaEdicion: new Date().toISOString().split('T')[0] };

    // 1. Ensure data.clasificadores exists and has all default classifiers
    if (activeDefaultClf.length > 0) {
        if (!data.clasificadores || !Array.isArray(data.clasificadores) || data.clasificadores.length === 0) {
            data.clasificadores = JSON.parse(JSON.stringify(activeDefaultClf));
        } else {
            const existingIds = new Set(data.clasificadores.map(c => c.id));
            activeDefaultClf.forEach(defClf => {
                if (!existingIds.has(defClf.id)) {
                    data.clasificadores.push(JSON.parse(JSON.stringify(defClf)));
                }
            });
        }
    } else if (!Array.isArray(data.clasificadores)) {
        data.clasificadores = [];
    }

    // 2. Remove any classifiers that might be lingering in other category arrays
    const clfIds = new Set((data.clasificadores || []).map(c => c.id));
    for (const cat of nonClfCollections) {
        if (Array.isArray(data[cat])) {
            data[cat] = data[cat].filter(w => !clfIds.has(w.id));
        }
    }

    // 3. Convert plain-text classifiers to IDs across all categories
    for (const cat of allCollections) {
        if (Array.isArray(data[cat])) {
            data[cat].forEach(w => {
                if (w.clasificador && CLASSIFIER_MAPPING[w.clasificador]) {
                    w.clasificador = CLASSIFIER_MAPPING[w.clasificador];
                }
            });
        }
    }

    // 4. Ensure no card references a classifier as a radical
    for (const cat of allCollections) {
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
        const existingWords = new Set();
        for (const cat of allCollections) {
            if (Array.isArray(data[cat])) {
                data[cat].forEach(w => existingWords.add(w.tradicional));
            }
        }
        NEW_STRUCTURE_WORDS.forEach(word => {
            if (!existingWords.has(word.tradicional)) {
                const targetKey = getCategoryKey(word.categoria);
                if (!Array.isArray(data[targetKey])) data[targetKey] = [];
                data[targetKey].push(JSON.parse(JSON.stringify(word)));
                existingWords.add(word.tradicional);
            }
        });
    }

    // 6. Sync structures from activeSeed (preserving Lesson assignments from APP_CONFIG)
    if (activeSeed && Array.isArray(activeSeed.estructuras)) {
        data.estructuras = activeSeed.estructuras.map(st => ({ ...st }));
    }

    // 7. Sync updated definitions, mnemonics, radicals, leccion, and examples from activeSeed
    if (activeSeed) {
        const seedMap = new Map();
        for (const cat of allCollections) {
            if (Array.isArray(activeSeed[cat])) {
                activeSeed[cat].forEach(w => {
                    seedMap.set(w.id, w);
                    if (w.tradicional) {
                        seedMap.set(w.tradicional + '_' + (w.categoria || cat), w);
                        if (!seedMap.has(w.tradicional)) {
                            seedMap.set(w.tradicional, w);
                        }
                    }
                });
            }
        }
        // 7. Sync updated POS categories (八大詞類), verbSubtypes (動詞分類), semanticTags, definitions, mnemonics, radicals, leccion from activeSeed
        const legacyAndCurrentCols = Array.from(new Set([...allCollections, 'adjetivos', 'expresiones']));
        for (const cat of legacyAndCurrentCols) {
            if (Array.isArray(data[cat])) {
                data[cat].forEach(w => {
                    const seedWord = seedMap.get(w.id) || seedMap.get(w.tradicional + '_' + (w.categoria || cat)) || seedMap.get(w.tradicional);
                    if (seedWord) {
                        w.categoria = seedWord.categoria;
                        if (seedWord.pinyin) w.pinyin = seedWord.pinyin;
                        if (seedWord.zhuyin) w.zhuyin = seedWord.zhuyin;
                        w.posSymbol = seedWord.posSymbol || seedWord.categoria;
                        if (seedWord.verbSubtype) w.verbSubtype = seedWord.verbSubtype;
                        else delete w.verbSubtype;
                        if (seedWord.sepParts) w.sepParts = seedWord.sepParts.slice();
                        else delete w.sepParts;
                        if (seedWord.semanticTags) w.semanticTags = seedWord.semanticTags.slice();
                        w.radicales = Array.isArray(seedWord.radicales) ? seedWord.radicales.map(r => ({ ...r })) : [];
                        w.notas = seedWord.notas;
                        delete w.notas_en;
                        if (seedWord.espanol) w.espanol = seedWord.espanol;
                        delete w.english;
                        if (seedWord.ejemplos) w.ejemplos = seedWord.ejemplos.slice();
                        delete w.ejemplos_en;
                        if (seedWord.leccion !== undefined) {
                            w.leccion = seedWord.leccion;
                        }
                    } else if (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.normalizeCategoryId === 'function') {
                        w.categoria = APP_CONFIG.normalizeCategoryId(w.categoria);
                        w.posSymbol = w.posSymbol || w.categoria;
                    }
                });
            }
        }

        // 7b. Re-bucket any cards whose collection changed (e.g. from legacy adjetivos/expresiones to verbos/determinantes/conjunciones/preposiciones)
        const bucketed = {};
        allCollections.forEach(c => { bucketed[c] = []; });
        const seenIds = new Set();
        for (const col of legacyAndCurrentCols) {
            if (Array.isArray(data[col])) {
                for (const w of data[col]) {
                    if (!w || !w.id || seenIds.has(w.id)) continue;
                    seenIds.add(w.id);
                    const targetCol = getCategoryKey(w.categoria);
                    if (!bucketed[targetCol]) bucketed[targetCol] = [];
                    bucketed[targetCol].push(w);
                }
            }
        }
        allCollections.forEach(c => { data[c] = bucketed[c] || []; });
        delete data.adjetivos;
        delete data.expresiones;

        // 8. Ensure all cards from activeSeed exist in data (including new Prep/Ptc/V-sep cards)
        for (const cat of allCollections) {
            if (Array.isArray(activeSeed[cat])) {
                if (!Array.isArray(data[cat])) data[cat] = [];
                const existingIds = new Set(data[cat].map(w => w.id));
                activeSeed[cat].forEach(seedWord => {
                    if (!existingIds.has(seedWord.id)) {
                        data[cat].push(JSON.parse(JSON.stringify(seedWord)));
                        existingIds.add(seedWord.id);
                    }
                });
            }
        }
    }

    return data;
};

/**
 * Loads the full database from memory cache or localStorage.
 * Seeds with active SEED_DATA on first visit and migrates if needed.
 * @returns {object} The complete database object
 */
const loadDB = () => {
    const key = getActiveDBKey();
    const targetDataVersion = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.app?.dataVersion)
        ? APP_CONFIG.app.dataVersion
        : '3.25';

    if (memoryDBCache[key]) {
        return memoryDBCache[key];
    }

    const seed = getActiveSeedData();
    const raw = localStorage.getItem(key);

    if (raw) {
        try {
            const data = JSON.parse(raw);
            const hasSeedLoaded = seed && Object.keys(seed).length > 0;
            if (hasSeedLoaded && (!data.meta || data.meta.migratedWordsVersion !== targetDataVersion || !data.clasificadores || data.clasificadores.length === 0)) {
                sanitizeAndMigrateData(data, seed);
                data.meta = data.meta || {};
                data.meta.migratedWordsVersion = targetDataVersion;
                saveDB(data);
            } else {
                memoryDBCache[key] = data;
            }
            return data;
        } catch (e) {
            console.error('Error parsing DB:', e);
        }
    }

    // If seed data is not yet loaded (during initial lazy load), return a temporary empty structure without overwriting localStorage
    if (!seed || Object.keys(seed).length === 0) {
        return { meta: { version: '1.0' }, palabras: [], clasificadores: [], verbos: [], adjetivos: [], adverbios: [], expresiones: [], particulas: [], estructuras: [] };
    }

    // First visit with pre-normalized seed ready — skip heavy migration loop
    const seeded = { ...seed, meta: { version: targetDataVersion, migratedWordsVersion: targetDataVersion } };
    saveDB(seeded);
    return seeded;
};

/**
 * Persists the full database to localStorage and updates in-memory cache.
 * @param {object} data - The complete database object
 */
const saveDB = (data) => {
    const key = getActiveDBKey();
    if (!data.meta) data.meta = { version: '1.0' };
    data.meta.ultimaEdicion = new Date().toISOString().split('T')[0];
    localStorage.setItem(key, JSON.stringify(data));
    memoryDBCache[key] = data;
    delete cachedWordsList[key];
    delete cachedWordsByIdMap[key];
};

// --------------------------------------------------
// Query helpers (O(1) cached)
// --------------------------------------------------

/**
 * Returns a flat, sorted array of ALL words across every category.
 * Cached in memory per language key until DB mutates.
 * @returns {Array<object>}
 */
const getAllWords = () => {
    const key = getActiveDBKey();
    if (cachedWordsList[key]) {
        return cachedWordsList[key];
    }

    const db = loadDB();
    const collections = getStorageCollections();
    const words = [];

    collections.forEach(col => {
        if (Array.isArray(db[col])) {
            words.push(...db[col]);
        }
    });

    const order = (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.getCategoryOrderMap === 'function')
        ? APP_CONFIG.getCategoryOrderMap()
        : {
            pronombre: 1,
            sustantivo: 2,
            clasificador: 3,
            verbo: 4,
            adverbio: 5,
            adjetivo: 6,
            expresion: 7,
            particula: 8
        };

    words.sort((a, b) => {
        const orderA = order[a.categoria] || 99;
        const orderB = order[b.categoria] || 99;
        return orderA - orderB;
    });

    // Only cache if DB was hydrated
    if (memoryDBCache[key]) {
        cachedWordsList[key] = words;
        const idMap = new Map();
        words.forEach(w => idMap.set(w.id, w));
        cachedWordsByIdMap[key] = idMap;
    }

    return words;
};

/**
 * Fast O(1) lookup of a word by ID using the cached Map.
 * @param {string} id
 * @returns {object|undefined}
 */
const getWordById = (id) => {
    if (!id) return undefined;
    const key = getActiveDBKey();
    if (!cachedWordsByIdMap[key]) {
        getAllWords();
    }
    if (cachedWordsByIdMap[key]) {
        return cachedWordsByIdMap[key].get(id);
    }
    return getAllWords().find(w => w.id === id);
};
if (typeof window !== 'undefined') {
    window.getWordById = getWordById;
}

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
    const keys = getStorageCollections();

    for (const key of keys) {
        if (!db[key]) continue;
        const idx = db[key].findIndex(w => w.id === id);
        if (idx === -1) continue;

        const oldEntry = db[key][idx];
        const newKey = getCategoryKey(updatedData.categoria);

        if (key !== newKey) {
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
    const keys = getStorageCollections();
    for (const key of keys) {
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
