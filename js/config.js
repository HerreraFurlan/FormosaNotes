/**
 * =====================================================
 * AppChino (Formosa Notes) — config.js
 * ÚNICA FUENTE DE VERDAD (Single Source of Truth)
 * 
 * Modifica este archivo para agregar, editar o reordenar:
 * 1. Categorías gramaticales de flashcards (colores, íconos, traducciones, colección DB)
 * 2. Lecciones (cantidad total o etiquetas personalizadas)
 * 3. Idiomas soportados y sus archivos de datos (Lazy Load)
 * 4. Fuentes tipográficas chinas
 * 5. Parámetros de UI (Lazy Rendering, Skeletons, PDF)
 * 6. Modelos y ajustes de IA Generativa (Gemini)
 * =====================================================
 */

const LESSON_COUNT = 8;

const APP_CONFIG = {
    app: {
        name: 'Formosa Notes',
        version: '3.25',
        dataVersion: '3.25',
    },

    // =====================================================
    // 1. IDIOMAS SOPORTADOS (Lazy Load de datasets)
    // =====================================================
    languages: {
        default: 'es',
        storageKey: 'appchino_lang',
        available: {
            es: {
                code: 'es',
                name: 'Español',
                flag: '🇪🇸',
                dataScript: 'js/data.js?v=3.25',
                globalVar: 'SEED_DATA',
                dbKey: 'appchino_db',
                aiLangName: 'español'
            },
            en: {
                code: 'en',
                name: 'English',
                flag: '🇺🇸',
                dataScript: 'js/data_en.js?v=3.25',
                globalVar: 'SEED_DATA_EN',
                dbKey: 'appchino_db_en',
                aiLangName: 'English'
            }
        }
    },

    // =====================================================
    // 2. LECCIONES (Modifica LESSON_COUNT arriba o personaliza items)
    // =====================================================
    lessons: {
        count: LESSON_COUNT,
        allFilterId: 'todas',
        allowUnassigned: true,
        unassignedFilterId: 'ninguna',
        unassignedSymbol: '/',
        items: Array.from({ length: LESSON_COUNT }, (_, idx) => {
            const num = idx + 1;
            return {
                id: String(num),
                number: num,
                shortLabel: `L${num}`,
                labels: {
                    es: `Lección ${num}`,
                    en: `Lesson ${num}`
                }
            };
        })
    },

    // =====================================================
    // 3. CATEGORÍAS DE FLASHCARDS
    // Agrega, elimina o modifica cualquier categoría aquí.
    // El orden del array define el orden de aparición en filtros y grillas.
    // =====================================================
    categories: [
        {
            id: 'pronombre',
            dbCollection: 'palabras',
            order: 1,
            icon: '🔘',
            cssVar: '--color-pronoun',
            cssLightVar: '--color-pronoun-light',
            color: '#6B7B8D',
            bgLight: '#E8ECF0',
            badgeTextColor: '#6B7B8D',
            pdfColor: '#6B7B8D',
            isClassifier: false,
            allowsClassifier: true,
            labels: {
                es: { singular: 'Pronombre', plural: 'Pronombres' },
                en: { singular: 'Pronoun', plural: 'Pronouns' }
            }
        },
        {
            id: 'sustantivo',
            dbCollection: 'palabras',
            order: 2,
            icon: '🔵',
            cssVar: '--color-noun',
            cssLightVar: '--color-noun-light',
            color: '#2E78B7',
            bgLight: '#D6EAF8',
            badgeTextColor: '#2E78B7',
            pdfColor: '#2E78B7',
            isClassifier: false,
            allowsClassifier: true,
            labels: {
                es: { singular: 'Sustantivo', plural: 'Sustantivos' },
                en: { singular: 'Noun', plural: 'Nouns' }
            }
        },
        {
            id: 'clasificador',
            dbCollection: 'clasificadores',
            order: 3,
            icon: '🟤',
            cssVar: '--color-classifier',
            cssLightVar: '--color-classifier-light',
            color: '#8D5B4C',
            bgLight: '#EFEBE9',
            badgeTextColor: '#8D5B4C',
            pdfColor: '#8D5B4C',
            isClassifier: true,
            allowsClassifier: false,
            labels: {
                es: { singular: 'Clasificador', plural: 'Clasificadores' },
                en: { singular: 'Classifier', plural: 'Classifiers' }
            }
        },
        {
            id: 'verbo',
            dbCollection: 'verbos',
            order: 4,
            icon: '🟠',
            cssVar: '--color-verb',
            cssLightVar: '--color-verb-light',
            color: '#D4760A',
            bgLight: '#FDEBD0',
            badgeTextColor: '#C2410C',
            pdfColor: '#D4760A',
            isClassifier: false,
            allowsClassifier: true,
            labels: {
                es: { singular: 'Verbo', plural: 'Verbos' },
                en: { singular: 'Verb', plural: 'Verbs' }
            }
        },
        {
            id: 'adverbio',
            dbCollection: 'adverbios',
            order: 5,
            icon: '🟢',
            cssVar: '--color-adverb',
            cssLightVar: '--color-adverb-light',
            color: '#1E8C5E',
            bgLight: '#D5F5E3',
            badgeTextColor: '#047857',
            pdfColor: '#1E8C5E',
            isClassifier: false,
            allowsClassifier: true,
            labels: {
                es: { singular: 'Adverbio', plural: 'Adverbios' },
                en: { singular: 'Adverb', plural: 'Adverbs' }
            }
        },
        {
            id: 'adjetivo',
            dbCollection: 'adjetivos',
            order: 6,
            icon: '🟡',
            cssVar: '--color-adjective',
            cssLightVar: '--color-adjective-light',
            color: '#C9971A',
            bgLight: '#FDF2D0',
            badgeTextColor: '#B45309',
            pdfColor: '#C9971A',
            isClassifier: false,
            allowsClassifier: true,
            labels: {
                es: { singular: 'Adjetivo', plural: 'Adjetivos' },
                en: { singular: 'Adjective', plural: 'Adjectives' }
            }
        },
        {
            id: 'expresion',
            dbCollection: 'expresiones',
            order: 7,
            icon: '🔴',
            cssVar: '--color-expression',
            cssLightVar: '--color-expression-light',
            color: '#C0392B',
            bgLight: '#FADBD8',
            badgeTextColor: '#B91C1C',
            pdfColor: '#C0392B',
            isClassifier: false,
            allowsClassifier: true,
            labels: {
                es: { singular: 'Expresión', plural: 'Expresiones' },
                en: { singular: 'Expression', plural: 'Expressions' }
            }
        },
        {
            id: 'particula',
            dbCollection: 'particulas',
            order: 8,
            icon: '🟣',
            cssVar: '--color-particle',
            cssLightVar: '--color-particle-light',
            color: '#7D54B5',
            bgLight: '#E8DAEF',
            badgeTextColor: '#7D54B5',
            pdfColor: '#7D54B5',
            isClassifier: false,
            allowsClassifier: true,
            labels: {
                es: { singular: 'Partícula', plural: 'Partículas' },
                en: { singular: 'Particle', plural: 'Particles' }
            }
        }
    ],

    // Meta-categorías adicionales (ej. estructuras gramaticales)
    metaCategories: {
        estructura: {
            id: 'estructura',
            cssVar: '--color-structure',
            cssLightVar: '--color-structure-light',
            color: '#C2527A',
            bgLight: '#F9E0EA',
            badgeTextColor: '#C2527A',
            pdfColor: '#C2527A',
            labels: {
                es: { singular: 'Estructura', plural: 'Estructuras' },
                en: { singular: 'Structure', plural: 'Structures' }
            }
        }
    },

    // =====================================================
    // 4. FUENTES DE CARACTERES CHINOS
    // =====================================================
    fonts: {
        default: 'kaiti',
        storageKey: 'appchino_chinese_font',
        stacks: {
            kaiti: "'DFKai-SB', '標楷體', 'BiauKai', 'BiauKai TC', 'KaiTi', 'STKaiti', serif",
            serif: "'Noto Serif TC', 'PMingLiU', '新細明體', serif",
            sans: "'Noto Sans TC', 'Microsoft JhengHei', '微軟正黑體', sans-serif"
        }
    },

    // =====================================================
    // 5. PARÁMETROS DE INTERFAZ Y LAZY RENDERING
    // =====================================================
    ui: {
        initialCardBatchSize: 36,
        scrollBatchSize: 24,
        skeletonCount: 12,
        miniSkeletonCount: 24,
        cardsPerPrintPage: 6,
        defaultCategoryId: 'sustantivo'
    },

    // =====================================================
    // 6. PARÁMETROS DE EXAMEN Y CONVERSACIÓN
    // =====================================================
    exam: {
        minWordsRequired: 10,
        defaultMaxLesson: LESSON_COUNT,
        totalPhases: 7,
        totalQuestions: 55
    },

    practice: {
        maxTargetStructures: 5,
        challengesCount: 5
    },

    // =====================================================
    // 7. CONFIGURACIÓN DE IA GENERATIVA (GEMINI)
    // =====================================================
    ai: {
        apiKeyStorageKey: 'appchino_gemini_key',
        models: [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-2.0-flash'
        ],
        temperatures: {
            sentenceCheck: 0.1,
            practiceGen: 0.35,
            practiceEval: 0.1,
            convoStart: 0.4,
            convoContinue: 0.25,
            examGen: 0.3,
            examEval: 0.15
        },
        maxTokens: {
            sentenceCheck: 1024,
            practiceGen: 2048,
            practiceEval: 2048,
            convoStart: 2048,
            convoContinue: 2560,
            examGen: 8192,
            examEval: 4096
        }
    },

    // =====================================================
    // 8. MAPEO DE CLASIFICADORES (Migración de texto a ID)
    // =====================================================
    classifierAliases: {
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
        '支': 'id_clf_zhi_phone',
        '支 zhī': 'id_clf_zhi_phone',
        '塊': 'id_clf_kuai',
        '塊 kuài': 'id_clf_kuai',
        '種': 'id_clf_zhong',
        '種 zhǒng': 'id_clf_zhong',
        '家': 'id_clf_jia_shop',
        '家 jiā': 'id_clf_jia_shop',
        '碗': 'id_clf_wan',
        '碗 wǎn': 'id_clf_wan'
    }
};

// =====================================================
// HELPERS DERIVADOS DE APP_CONFIG (Compatibilidad Global)
// =====================================================

/**
 * Genera un identificador único para nuevas entradas.
 * @returns {string}
 */
const generateId = () => 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);

/**
 * Obtiene la definición de una categoría por su ID.
 * @param {string} catId
 * @returns {object|null}
 */
APP_CONFIG.getCategory = (catId) => {
    if (!catId) return null;
    const found = APP_CONFIG.categories.find(c => c.id === catId);
    if (found) return found;
    return APP_CONFIG.metaCategories[catId] || null;
};

/**
 * Devuelve la lista única de claves de colección en la base de datos
 * (ej. ['palabras', 'clasificadores', 'verbos', ...]).
 * @returns {Array<string>}
 */
APP_CONFIG.getDBCollections = () => {
    const set = new Set();
    APP_CONFIG.categories.forEach(c => {
        if (c.dbCollection) set.add(c.dbCollection);
    });
    return Array.from(set);
};

/**
 * Devuelve las colecciones que NO son clasificadores.
 * @returns {Array<string>}
 */
APP_CONFIG.getNonClassifierCollections = () => {
    const clfCollections = new Set(
        APP_CONFIG.categories.filter(c => c.isClassifier).map(c => c.dbCollection)
    );
    return APP_CONFIG.getDBCollections().filter(col => !clfCollections.has(col));
};

/**
 * Mapa de categoría -> colección en la base de datos.
 * @returns {Record<string, string>}
 */
APP_CONFIG.getCategoryToDBMap = () => {
    const map = {};
    APP_CONFIG.categories.forEach(c => {
        map[c.id] = c.dbCollection;
    });
    return map;
};

/**
 * Mapa de categoría -> orden numérico.
 * @returns {Record<string, number>}
 */
APP_CONFIG.getCategoryOrderMap = () => {
    const order = {};
    APP_CONFIG.categories.forEach((c, idx) => {
        order[c.id] = c.order !== undefined ? c.order : idx + 1;
    });
    return order;
};

/**
 * Construye los objetos globales CATEGORY_COLORS, CATEGORY_LABELS y PDF_COLORS
 * a partir de APP_CONFIG.categories.
 */
const CATEGORY_COLORS = {};
const CATEGORY_LABELS = {};
const PDF_COLORS = {};

APP_CONFIG.categories.forEach(cat => {
    CATEGORY_COLORS[cat.id] = cat.cssVar ? `var(${cat.cssVar}, ${cat.color})` : cat.color;
    CATEGORY_LABELS[cat.id] = cat.labels?.es?.singular || cat.id;
    PDF_COLORS[cat.id] = cat.pdfColor || cat.color;
});

Object.values(APP_CONFIG.metaCategories || {}).forEach(metaCat => {
    CATEGORY_COLORS[metaCat.id] = metaCat.cssVar ? `var(${metaCat.cssVar}, ${metaCat.color})` : metaCat.color;
    CATEGORY_LABELS[metaCat.id] = metaCat.labels?.es?.singular || metaCat.id;
    PDF_COLORS[metaCat.id] = metaCat.pdfColor || metaCat.color;
});

/**
 * Inyecta dinámicamente las variables CSS y reglas `.badge-<id>` para todas las
 * categorías configuradas en APP_CONFIG, de modo que agregar una categoría nueva
 * no requiera editar css/styles.css.
 */
const injectDynamicCategoryStyles = () => {
    if (typeof document === 'undefined') return;
    let styleEl = document.getElementById('app-config-dynamic-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'app-config-dynamic-styles';
        document.head.appendChild(styleEl);
    }

    const rootVars = [];
    const badgeRules = [];

    const allCats = [
        ...APP_CONFIG.categories,
        ...Object.values(APP_CONFIG.metaCategories || {})
    ];

    allCats.forEach(cat => {
        if (cat.cssVar && cat.color) {
            rootVars.push(`${cat.cssVar}: ${cat.color};`);
        }
        if (cat.cssLightVar && cat.bgLight) {
            rootVars.push(`${cat.cssLightVar}: ${cat.bgLight};`);
        }
        const bg = cat.cssLightVar ? `var(${cat.cssLightVar}, ${cat.bgLight})` : (cat.bgLight || '#F1F5F9');
        const fg = cat.badgeTextColor || (cat.cssVar ? `var(${cat.cssVar}, ${cat.color})` : (cat.color || '#334155'));
        badgeRules.push(`
            .badge-${cat.id} {
                background: ${bg};
                color: ${fg};
            }
        `);
    });

    styleEl.textContent = `
        :root {
            ${rootVars.join('\n            ')}
        }
        ${badgeRules.join('\n')}
    `;
};

if (typeof document !== 'undefined') {
    injectDynamicCategoryStyles();
}

// Exposición global
window.APP_CONFIG = APP_CONFIG;
window.generateId = generateId;
window.CATEGORY_COLORS = CATEGORY_COLORS;
window.CATEGORY_LABELS = CATEGORY_LABELS;
window.PDF_COLORS = PDF_COLORS;
window.injectDynamicCategoryStyles = injectDynamicCategoryStyles;
