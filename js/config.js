/**
 * =====================================================
 * AppChino (Formosa Notes) — config.js
 * ÚNICA FUENTE DE VERDAD (Single Source of Truth)
 * 
 * Basado en el estándar oficial de Taiwán (當代中文課程 / 詞類表):
 * 1. Ocho Categorías Gramaticales (八大詞類): N, V, Adv, Conj, Prep, M, Ptc, Det
 * 2. Subclasificación Verbal de 12 tipos (動詞分類): V, Vi, V-sep, Vs, Vst, Vs-attr, Vs-pred, Vs-sep, Vaux, Vp, Vpt, Vp-sep
 * 3. Configuración del Motor de Sintagmas Magnéticos y Slots Canónicos SVO Chino
 * 4. Lecciones, Idiomas (Lazy Load), Fuentes, Parámetros UI e IA Generativa
 * =====================================================
 */

const LESSON_COUNT = 8;

const APP_CONFIG = {
    app: {
        name: 'Formosa Notes',
        version: '4.1.4',
        dataVersion: '4.1.4',
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
                dataScript: 'js/data.js?v=4.1.0',
                globalVar: 'SEED_DATA',
                dbKey: 'appchino_db',
                aiLangName: 'español'
            },
            en: {
                code: 'en',
                name: 'English',
                flag: '🇺🇸',
                dataScript: 'js/data_en.js?v=4.1.0',
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
    // 3. OCHO CATEGORÍAS GRAMATICALES OFICIALES (N, V, Adv, Conj, Prep, M, Ptc, Det)
    // =====================================================
    categories: [
        {
            id: 'N',
            symbol: 'N',
            dbCollection: 'palabras',
            order: 1,
            icon: '🔵',
            cssVar: '--color-pos-n',
            cssLightVar: '--color-pos-n-light',
            color: '#2E78B7',
            bgLight: '#EBF3FA',
            badgeTextColor: '#1E5A8A',
            pdfColor: '#2E78B7',
            isClassifier: false,
            allowsClassifier: true,
            labels: {
                es: { singular: 'N · Sustantivo', plural: 'N · Sustantivos', short: 'N · Sustantivo' },
                en: { singular: 'N · Noun', plural: 'N · Nouns', short: 'N · Noun' }
            }
        },
        {
            id: 'V',
            symbol: 'V',
            dbCollection: 'verbos',
            order: 2,
            icon: '🟠',
            cssVar: '--color-pos-v',
            cssLightVar: '--color-pos-v-light',
            color: '#D4760A',
            bgLight: '#FDF2E4',
            badgeTextColor: '#B45309',
            pdfColor: '#D4760A',
            isClassifier: false,
            allowsClassifier: false,
            labels: {
                es: { singular: 'V · Verbo', plural: 'V · Verbos', short: 'V · Verbo' },
                en: { singular: 'V · Verb', plural: 'V · Verbs', short: 'V · Verb' }
            }
        },
        {
            id: 'Adv',
            symbol: 'Adv',
            dbCollection: 'adverbios',
            order: 3,
            icon: '🟢',
            cssVar: '--color-pos-adv',
            cssLightVar: '--color-pos-adv-light',
            color: '#1E8C5E',
            bgLight: '#E6F6EF',
            badgeTextColor: '#047857',
            pdfColor: '#1E8C5E',
            isClassifier: false,
            allowsClassifier: false,
            labels: {
                es: { singular: 'Adv · Adverbio', plural: 'Adv · Adverbios', short: 'Adv · Adverbio' },
                en: { singular: 'Adv · Adverb', plural: 'Adv · Adverbs', short: 'Adv · Adverb' }
            }
        },
        {
            id: 'Conj',
            symbol: 'Conj',
            dbCollection: 'conjunciones',
            order: 4,
            icon: '🩵',
            cssVar: '--color-pos-conj',
            cssLightVar: '--color-pos-conj-light',
            color: '#0E7490',
            bgLight: '#E6F4F8',
            badgeTextColor: '#0E7490',
            pdfColor: '#0E7490',
            isClassifier: false,
            allowsClassifier: false,
            labels: {
                es: { singular: 'Conj · Conjunción', plural: 'Conj · Conjunciones', short: 'Conj · Conjunción' },
                en: { singular: 'Conj · Conjunction', plural: 'Conj · Conjunctions', short: 'Conj · Conjunction' }
            }
        },
        {
            id: 'Prep',
            symbol: 'Prep',
            dbCollection: 'preposiciones',
            order: 5,
            icon: '🔷',
            cssVar: '--color-pos-prep',
            cssLightVar: '--color-pos-prep-light',
            color: '#4F46E5',
            bgLight: '#EEF2FF',
            badgeTextColor: '#4338CA',
            pdfColor: '#4F46E5',
            isClassifier: false,
            allowsClassifier: false,
            labels: {
                es: { singular: 'Prep · Preposición', plural: 'Prep · Preposiciones', short: 'Prep · Preposición' },
                en: { singular: 'Prep · Preposition', plural: 'Prep · Prepositions', short: 'Prep · Preposition' }
            }
        },
        {
            id: 'M',
            symbol: 'M',
            dbCollection: 'clasificadores',
            order: 6,
            icon: '🟤',
            cssVar: '--color-pos-m',
            cssLightVar: '--color-pos-m-light',
            color: '#8D5B4C',
            bgLight: '#F3ECEA',
            badgeTextColor: '#734638',
            pdfColor: '#8D5B4C',
            isClassifier: true,
            allowsClassifier: false,
            labels: {
                es: { singular: 'M · Clasificador', plural: 'M · Clasificadores', short: 'M · Clasificador' },
                en: { singular: 'M · Measure Word', plural: 'M · Measure Words', short: 'M · Measure Word' }
            }
        },
        {
            id: 'Ptc',
            symbol: 'Ptc',
            dbCollection: 'particulas',
            order: 7,
            icon: '🟣',
            cssVar: '--color-pos-ptc',
            cssLightVar: '--color-pos-ptc-light',
            color: '#7D54B5',
            bgLight: '#F2EBF9',
            badgeTextColor: '#6B3FA0',
            pdfColor: '#7D54B5',
            isClassifier: false,
            allowsClassifier: false,
            labels: {
                es: { singular: 'Ptc · Partícula', plural: 'Ptc · Partículas', short: 'Ptc · Partícula' },
                en: { singular: 'Ptc · Particle', plural: 'Ptc · Particles', short: 'Ptc · Particle' }
            }
        },
        {
            id: 'Det',
            symbol: 'Det',
            dbCollection: 'determinantes',
            order: 8,
            icon: '🟡',
            cssVar: '--color-pos-det',
            cssLightVar: '--color-pos-det-light',
            color: '#B45309',
            bgLight: '#FEF6E4',
            badgeTextColor: '#92400E',
            pdfColor: '#B45309',
            isClassifier: false,
            allowsClassifier: false,
            labels: {
                es: { singular: 'Det · Determinante', plural: 'Det · Determinantes', short: 'Det · Determinante' },
                en: { singular: 'Det · Determiner', plural: 'Det · Determiners', short: 'Det · Determiner' }
            }
        },
        {
            id: 'Phr',
            symbol: 'Phr',
            dbCollection: 'frases',
            order: 9,
            icon: '🔴',
            cssVar: '--color-pos-phr',
            cssLightVar: '--color-pos-phr-light',
            color: '#C83E3B',
            bgLight: '#FDECEC',
            badgeTextColor: '#A82825',
            pdfColor: '#C83E3B',
            isClassifier: false,
            allowsClassifier: false,
            labels: {
                es: { singular: 'Frase', plural: 'Frases', short: 'Frase' },
                en: { singular: 'Phrase', plural: 'Phrases', short: 'Phrase' }
            }
        }
    ],

    // =====================================================
    // 3B. SUBCLASIFICACIÓN DE VERBOS (12 Subtipos)
    // =====================================================
    verbSubtypes: {
        'V': {
            symbol: 'V',
            type: 'action',
            transitive: true,
            separable: false,
            takesDegreeAdv: false,
            color: '#D4760A',
            shortLabels: { es: 'Verbo', en: 'Verb' },
            labels: {
                es: 'Verbo de acción transitivo',
                en: 'Transitive action verb'
            }
        },
        'Vi': {
            symbol: 'Vi',
            type: 'action',
            transitive: false,
            separable: false,
            takesDegreeAdv: false,
            color: '#E07A1F',
            shortLabels: { es: 'Verbo intransitivo', en: 'Intransitive Verb' },
            labels: {
                es: 'Verbo de acción intransitivo',
                en: 'Intransitive action verb'
            }
        },
        'V-sep': {
            symbol: 'V-sep',
            type: 'action',
            transitive: false,
            separable: true,
            takesDegreeAdv: false,
            color: '#C2410C',
            shortLabels: { es: 'Verbo separable', en: 'Separable Verb' },
            labels: {
                es: 'Verbo de acción separable',
                en: 'Separable action verb'
            }
        },
        'Vs': {
            symbol: 'Vs',
            type: 'state',
            transitive: false,
            separable: false,
            takesDegreeAdv: true,
            color: '#C9971A',
            shortLabels: { es: 'Verbo de estado', en: 'State Verb' },
            labels: {
                es: 'Verbo de estado intransitivo',
                en: 'Intransitive state verb'
            }
        },
        'Vst': {
            symbol: 'Vst',
            type: 'state',
            transitive: true,
            separable: false,
            takesDegreeAdv: true,
            color: '#B45309',
            shortLabels: { es: 'Verbo de estado tr.', en: 'Trans. State Verb' },
            labels: {
                es: 'Verbo de estado transitivo',
                en: 'Transitive state verb'
            }
        },
        'Vs-attr': {
            symbol: 'Vs-attr',
            type: 'state',
            transitive: false,
            separable: false,
            attributiveOnly: true,
            takesDegreeAdv: false,
            color: '#A16207',
            shortLabels: { es: 'Estado atributivo', en: 'Attributive State' },
            labels: {
                es: 'Verbo de estado solo atributivo',
                en: 'Attributive-only state verb'
            }
        },
        'Vs-pred': {
            symbol: 'Vs-pred',
            type: 'state',
            transitive: false,
            separable: false,
            predicativeOnly: true,
            takesDegreeAdv: true,
            color: '#CA8A04',
            shortLabels: { es: 'Estado predicativo', en: 'Predicative State' },
            labels: {
                es: 'Verbo de estado solo predicativo',
                en: 'Predicative-only state verb'
            }
        },
        'Vs-sep': {
            symbol: 'Vs-sep',
            type: 'state',
            transitive: false,
            separable: true,
            takesDegreeAdv: true,
            color: '#9A3412',
            shortLabels: { es: 'Estado separable', en: 'Separable State' },
            labels: {
                es: 'Verbo de estado separable',
                en: 'Separable state verb'
            }
        },
        'Vaux': {
            symbol: 'Vaux',
            type: 'auxiliary',
            transitive: false,
            separable: false,
            takesDegreeAdv: true,
            color: '#0D9488',
            shortLabels: { es: 'Verbo auxiliar', en: 'Auxiliary Verb' },
            labels: {
                es: 'Verbo auxiliar / modal',
                en: 'Auxiliary / modal verb'
            }
        },
        'Vp': {
            symbol: 'Vp',
            type: 'process',
            transitive: false,
            separable: false,
            takesDegreeAdv: false,
            color: '#9333EA',
            shortLabels: { es: 'Verbo de proceso', en: 'Process Verb' },
            labels: {
                es: 'Verbo de proceso intransitivo',
                en: 'Intransitive process verb'
            }
        },
        'Vpt': {
            symbol: 'Vpt',
            type: 'process',
            transitive: true,
            separable: false,
            takesDegreeAdv: false,
            color: '#7E22CE',
            shortLabels: { es: 'Proceso transitivo', en: 'Trans. Process Verb' },
            labels: {
                es: 'Verbo de proceso transitivo',
                en: 'Transitive process verb'
            }
        },
        'Vp-sep': {
            symbol: 'Vp-sep',
            type: 'process',
            transitive: false,
            separable: true,
            takesDegreeAdv: false,
            color: '#6B21A8',
            shortLabels: { es: 'Proceso separable', en: 'Separable Process' },
            labels: {
                es: 'Verbo de proceso separable',
                en: 'Separable process verb'
            }
        }
    },

    // =====================================================
    // 3C. SLOTS CANÓNICOS SVO CHINO & SINTAGMAS MAGNÉTICOS
    // =====================================================
    canonicalSlots: [
        {
            id: 'TOPIC_SUBJ',
            order: 1,
            color: '#2E78B7',
            bgSoft: '#EEF5FB',
            labels: { es: 'QUIÉN / TÓPICO', en: 'WHO / TOPIC' },
            shortLabels: { es: 'Tópico / Sujeto', en: 'Topic / Subject' }
        },
        {
            id: 'TIME',
            order: 2,
            color: '#6366F1',
            bgSoft: '#EEF2FF',
            labels: { es: 'CUÁNDO', en: 'WHEN' },
            shortLabels: { es: 'Tiempo', en: 'Time' }
        },
        {
            id: 'COMPANY',
            order: 3,
            color: '#0E7490',
            bgSoft: '#ECFEFF',
            labels: { es: 'CON / A QUIÉN', en: 'WITH / TO WHOM' },
            shortLabels: { es: 'Ámbito (Prep)', en: 'Scope (Prep)' }
        },
        {
            id: 'PLACE',
            order: 4,
            color: '#3B6998',
            bgSoft: '#EBF3FA',
            labels: { es: 'DÓNDE', en: 'WHERE' },
            shortLabels: { es: 'Lugar (Prep+N)', en: 'Location (Prep+N)' }
        },
        {
            id: 'ADV_MODAL',
            order: 5,
            color: '#0D9488',
            bgSoft: '#F0FDFA',
            labels: { es: 'MODAL / NEG', en: 'MODAL / NEG' },
            shortLabels: { es: 'Negación / Modal', en: 'Neg / Modal' }
        },
        {
            id: 'VERB_STATE',
            order: 6,
            color: '#D4760A',
            bgSoft: '#FEF6EB',
            labels: { es: 'ACCIÓN / ESTADO', en: 'ACTION / STATE' },
            shortLabels: { es: 'Verbo / Estado (Vs)', en: 'Verb / State (Vs)' }
        },
        {
            id: 'OBJECT',
            order: 7,
            color: '#8D5B4C',
            bgSoft: '#F7F1EF',
            labels: { es: 'QUÉ / OBJETO', en: 'WHAT / OBJECT' },
            shortLabels: { es: 'Objeto / Compl.', en: 'Object / Comp.' }
        },
        {
            id: 'FINAL_PTC',
            order: 8,
            color: '#7D54B5',
            bgSoft: '#F5EFFB',
            labels: { es: 'PARTÍCULA FINAL', en: 'FINAL PARTICLE' },
            shortLabels: { es: 'Partícula (Ptc)', en: 'Particle (Ptc)' }
        }
    ],

    // Mapeo de compatibilidad para categorías antiguas
    legacyCategoryMap: {
        sustantivo: 'N',
        pronombre: 'N',
        verbo: 'V',
        adjetivo: 'V',
        adverbio: 'Adv',
        conjuncion: 'Conj',
        preposicion: 'Prep',
        clasificador: 'M',
        particula: 'Ptc',
        determinante: 'Det',
        expresion: 'Phr',
        frase: 'Phr'
    },

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
        defaultCategoryId: 'N'
    },

    // =====================================================
    // 6. PARÁMETROS DE EXAMEN Y CONVERSACIÓN
    // =====================================================
    exam: {
        minWordsRequired: 10,
        defaultMaxLesson: LESSON_COUNT,
        includeUnassignedByDefault: false,
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
            examGen: 0.35,
            examEval: 0.1
        }
    },

    // =====================================================
    // 8. MAPEO DE ALIAS DE CLASIFICADORES (MIGRACIÓN)
    // =====================================================
    classifierAliases: {
        '個': 'id_mtfhewfx_gtw3b',
        '个': 'id_mtfhewfx_gtw3b',
        '個 (gè)': 'id_mtfhewfx_gtw3b',
        '張': 'id_mty004_zhang',
        '张': 'id_mty004_zhang',
        '隻': 'id_mtfigeht_eqxfj',
        '只': 'id_mtfigeht_eqxfj',
        '隻 (zhī)': 'id_mtfigeht_eqxfj',
        '本': 'id_clf_ben',
        '杯': 'id_clf_bei',
        '杯 (bēi)': 'id_clf_bei',
        '位': 'id_clf_wei',
        '瓶': 'id_clf_ping',
        '棟': 'id_clf_dong',
        '栋': 'id_clf_dong',
        '歲': 'id_mtgn2mv8_7ji91',
        '岁': 'id_mtgn2mv8_7ji91',
        '顆': 'id_clf_ke',
        '颗': 'id_clf_ke',
        '間': 'id_clf_jian',
        '间': 'id_clf_jian',
        '朵': 'id_clf_duo',
        '門': 'id_clf_men',
        '门': 'id_clf_men',
        '次': 'id_clf_ci',
        '點': 'id_clf_dian',
        '点': 'id_clf_dian',
        '分': 'id_clf_fen',
        '刻': 'id_clf_ke_time',
        '日': 'id_clf_ri',
        '號': 'id_clf_hao',
        '号': 'id_clf_hao',
        '些': 'id_clf_xie',
        '支': 'id_clf_zhi_phone',
        '塊': 'id_clf_kuai',
        '块': 'id_clf_kuai',
        '種': 'id_clf_zhong',
        '种': 'id_clf_zhong',
        '家': 'id_clf_jia_shop',
        '碗': 'id_clf_wan'
    }
};

// =====================================================
// FUNCIONES HELPER GLOBALES DERIVADAS DE APP_CONFIG
// =====================================================

/**
 * Normaliza una clave de categoría (case-insensitive y convierte claves antiguas como 'sustantivo' -> 'N').
 * @param {string} catId
 * @returns {string}
 */
APP_CONFIG.normalizeCategoryId = (catId) => {
    if (!catId) return 'N';
    const str = String(catId).trim();
    const match = APP_CONFIG.categories.find(c => c.id.toLowerCase() === str.toLowerCase());
    if (match) return match.id;
    return APP_CONFIG.legacyCategoryMap[str.toLowerCase()] || 'N';
};

/**
 * Genera un ID único para nuevas entradas.
 * @returns {string}
 */
const generateId = () => 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);

/**
 * Obtiene la definición de una categoría por su ID.
 * @param {string} catId
 * @returns {object|null}
 */
APP_CONFIG.getCategory = (catId) => {
    const norm = APP_CONFIG.normalizeCategoryId(catId);
    return APP_CONFIG.categories.find(c => c.id === norm) || APP_CONFIG.metaCategories[catId] || null;
};

/**
 * Obtiene la definición de un subtipo verbal (V, Vi, V-sep, Vs, Vst, Vaux, Vp, etc.).
 * @param {string} subtype
 * @returns {object|null}
 */
APP_CONFIG.getVerbSubtypeInfo = (subtype) => {
    if (!subtype) return null;
    return APP_CONFIG.verbSubtypes[subtype] || null;
};

/**
 * Obtiene la etiqueta traducida de una categoría.
 * @param {string} catId
 * @param {string} [lang='es']
 * @param {boolean} [plural=false]
 * @returns {string}
 */
APP_CONFIG.getCategoryLabel = (catId, lang = 'es', plural = false) => {
    const cat = APP_CONFIG.getCategory(catId);
    if (!cat || !cat.labels) return catId;
    const langLabels = cat.labels[lang] || cat.labels[APP_CONFIG.languages.default] || {};
    return plural ? (langLabels.plural || langLabels.singular || catId) : (langLabels.short || langLabels.singular || catId);
};

/**
 * Obtiene la etiqueta corta para la insignia de la tarjeta (ej. "Vs · Verbo de estado" o "N · Sustantivo").
 * @param {object} word
 * @param {string} [lang='es']
 * @returns {{ code: string, label: string, shortLabel: string, tooltip: string, color: string }}
 */
APP_CONFIG.getWordPOSBadgeInfo = (word, lang = 'es') => {
    if (!word) return { code: 'N', label: 'N', shortLabel: 'N', tooltip: '', color: '#2E78B7' };
    const catId = APP_CONFIG.normalizeCategoryId(word.categoria);
    const cat = APP_CONFIG.getCategory(catId) || APP_CONFIG.categories[0];

    if (catId === 'V' && word.verbSubtype && APP_CONFIG.verbSubtypes[word.verbSubtype]) {
        const sub = APP_CONFIG.verbSubtypes[word.verbSubtype];
        const shortName = (sub.shortLabels && sub.shortLabels[lang]) || (sub.labels && sub.labels[lang]) || sub.symbol;
        const tooltip = (sub.labels && sub.labels[lang]) || shortName;
        return {
            code: sub.symbol,
            label: `${sub.symbol} · ${shortName}`,
            shortLabel: sub.symbol,
            tooltip: `${sub.symbol}: ${tooltip}`,
            color: sub.color || cat.color,
            isSeparable: !!sub.separable
        };
    }

    const shortText = cat.labels?.[lang]?.short || cat.labels?.[lang]?.singular || cat.symbol;
    return {
        code: word.posSymbol || cat.symbol,
        label: shortText,
        shortLabel: word.posSymbol || cat.symbol,
        tooltip: shortText,
        color: cat.color,
        isSeparable: false
    };
};

/**
 * Obtiene todas las colecciones únicas en la base de datos.
 * Incluye tanto las colecciones nuevas como las históricas para migración limpia.
 * @returns {Array<string>}
 */
/**
 * Obtiene la definición de una lección desde APP_CONFIG.lessons.items.
 * @param {string|number} lessonIdOrNum
 * @returns {object|null}
 */
APP_CONFIG.getLessonItem = (lessonIdOrNum) => {
    if (lessonIdOrNum === undefined || lessonIdOrNum === null || lessonIdOrNum === '') return null;
    const str = String(lessonIdOrNum).trim();
    const num = Number(str);
    return (APP_CONFIG.lessons?.items || []).find(
        item => String(item.id) === str || (!Number.isNaN(num) && Number(item.number) === num)
    ) || null;
};

/**
 * Devuelve la etiqueta corta de la lección (ej. "L1") o el símbolo de sin asignar ("/").
 * @param {string|number} lessonIdOrNum
 * @returns {string}
 */
APP_CONFIG.getLessonShortLabel = (lessonIdOrNum) => {
    const found = APP_CONFIG.getLessonItem(lessonIdOrNum);
    if (found) return found.shortLabel || `L${found.number}`;
    return APP_CONFIG.lessons?.unassignedSymbol || '/';
};

/**
 * Evalúa si un elemento (palabra o estructura gramatical) coincide con los filtros de lección activos.
 * Consume directamente APP_CONFIG.lessons (allFilterId, unassignedFilterId, items).
 * @param {object} item - Objeto con propiedad opcional `leccion`
 * @param {Array<string>} activeFilterIds - Lista de IDs de filtro activos
 * @returns {boolean}
 */
APP_CONFIG.matchesLessonFilter = (item, activeFilterIds) => {
    const allKey = APP_CONFIG.lessons?.allFilterId || 'todas';
    const unassignedKey = APP_CONFIG.lessons?.unassignedFilterId || 'ninguna';
    if (!Array.isArray(activeFilterIds) || activeFilterIds.length === 0 || activeFilterIds.includes(allKey)) {
        return true;
    }
    const foundLesson = APP_CONFIG.getLessonItem(item?.leccion);
    if (!foundLesson) {
        return activeFilterIds.includes(unassignedKey);
    }
    return activeFilterIds.includes(String(foundLesson.id)) || activeFilterIds.includes(String(foundLesson.number));
};

/**
 * Evalúa si un elemento (palabra o estructura gramatical) entra en el rango acumulativo de examen.
 * @param {object} item - Objeto con propiedad opcional `leccion`
 * @param {number} maxLesson - Lección máxima seleccionada
 * @param {boolean} includeUnassigned - Incluir elementos sin lección asignada
 * @returns {boolean}
 */
APP_CONFIG.matchesCumulativeLesson = (item, maxLesson, includeUnassigned = false) => {
    const foundLesson = APP_CONFIG.getLessonItem(item?.leccion);
    if (foundLesson) {
        return Number(foundLesson.number) <= Number(maxLesson);
    }
    return !!includeUnassigned;
};

APP_CONFIG.getDBCollections = () => {
    const cols = new Set();
    APP_CONFIG.categories.forEach(c => {
        if (c.dbCollection) cols.add(c.dbCollection);
    });
    return Array.from(cols);
};

/**
 * Obtiene las colecciones de la base de datos que NO son clasificadores.
 * @returns {Array<string>}
 */
APP_CONFIG.getNonClassifierCollections = () => {
    const cols = new Set();
    APP_CONFIG.categories.forEach(c => {
        if (!c.isClassifier && c.dbCollection) cols.add(c.dbCollection);
    });
    return Array.from(cols);
};

/**
 * Mapa de categoría -> orden de visualización.
 * @returns {Object<string, number>}
 */
APP_CONFIG.getCategoryOrderMap = () => {
    const map = {};
    APP_CONFIG.categories.forEach((c, idx) => {
        map[c.id] = c.order || (idx + 1);
    });
    Object.entries(APP_CONFIG.legacyCategoryMap).forEach(([oldKey, newId]) => {
        if (map[newId]) map[oldKey] = map[newId];
    });
    return map;
};

/**
 * Mapa de categoría -> nombre de colección en localStorage/SEED_DATA.
 * @returns {Object<string, string>}
 */
APP_CONFIG.getCategoryToDBMap = () => {
    const map = {};
    APP_CONFIG.categories.forEach(c => {
        map[c.id] = c.dbCollection;
    });
    // Compatibilidad con claves antiguas
    Object.entries(APP_CONFIG.legacyCategoryMap).forEach(([oldKey, newId]) => {
        const cat = APP_CONFIG.categories.find(c => c.id === newId);
        if (cat) map[oldKey] = cat.dbCollection;
    });
    return map;
};

/**
 * Mapas globales de compatibilidad (`CATEGORY_COLORS`, `CATEGORY_LABELS`, `PDF_COLORS`).
 */
const CATEGORY_COLORS = {};
const CATEGORY_LABELS = {};
const PDF_COLORS = {};

APP_CONFIG.categories.forEach(cat => {
    CATEGORY_COLORS[cat.id] = `var(${cat.cssVar}, ${cat.color})`;
    CATEGORY_LABELS[cat.id] = cat.labels.es.short || cat.labels.es.singular;
    PDF_COLORS[cat.id] = cat.pdfColor || cat.color;
});

Object.entries(APP_CONFIG.legacyCategoryMap).forEach(([oldKey, newId]) => {
    const cat = APP_CONFIG.categories.find(c => c.id === newId);
    if (cat) {
        CATEGORY_COLORS[oldKey] = `var(${cat.cssVar}, ${cat.color})`;
        CATEGORY_LABELS[oldKey] = cat.labels.es.short || cat.labels.es.singular;
        PDF_COLORS[oldKey] = cat.pdfColor || cat.color;
    }
});

Object.values(APP_CONFIG.metaCategories).forEach(meta => {
    CATEGORY_COLORS[meta.id] = `var(${meta.cssVar}, ${meta.color})`;
    CATEGORY_LABELS[meta.id] = meta.labels.es.singular;
    PDF_COLORS[meta.id] = meta.pdfColor || meta.color;
});

/**
 * Inyecta dinámicamente las variables CSS y clases de categoría en el documento.
 */
APP_CONFIG.injectDynamicCategoryStyles = () => {
    if (typeof document === 'undefined') return;
    let styleEl = document.getElementById('app-config-dynamic-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'app-config-dynamic-styles';
        document.head.appendChild(styleEl);
    }

    const rootVars = [];
    const rules = [];

    APP_CONFIG.categories.forEach(cat => {
        rootVars.push(`${cat.cssVar}: ${cat.color};`);
        rootVars.push(`${cat.cssLightVar}: ${cat.bgLight};`);

        rules.push(`
            .badge-${cat.id} {
                background: var(${cat.cssLightVar}, ${cat.bgLight});
                color: ${cat.badgeTextColor || cat.color};
            }
            .flashcard-wrapper[data-category="${cat.id}"],
            .mini-card[data-categoria="${cat.id}"] {
                --card-color: var(${cat.cssVar}, ${cat.color});
                --card-color-light: var(${cat.cssLightVar}, ${cat.bgLight});
            }
        `);
    });

    Object.values(APP_CONFIG.metaCategories).forEach(meta => {
        rootVars.push(`${meta.cssVar}: ${meta.color};`);
        rootVars.push(`${meta.cssLightVar}: ${meta.bgLight};`);
    });

    styleEl.textContent = `:root {\n    ${rootVars.join('\n    ')}\n}\n${rules.join('\n')}`;
};

if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
    window.generateId = generateId;
    window.CATEGORY_COLORS = CATEGORY_COLORS;
    window.CATEGORY_LABELS = CATEGORY_LABELS;
    window.PDF_COLORS = PDF_COLORS;
}
