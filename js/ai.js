/**
 * =====================================================
 * AppChino — ai.js
 * Integración con Gemini API para análisis de oraciones
 * en el Constructor y Simulación de Examen Personalizable
 * con compresión de contexto en 2 capas (Foco vs. Soporte).
 * Conectado a APP_CONFIG (js/config.js).
 * =====================================================
 */

// Helper to check active language for AI interactions
const isAILangEnglish = () => {
    return (typeof I18N !== 'undefined' && typeof I18N.getLanguage === 'function')
        ? I18N.getLanguage() === 'en'
        : (typeof localStorage !== 'undefined' && localStorage.getItem('appchino_lang') === 'en');
};

const getAILangName = () => {
    const isEn = isAILangEnglish();
    if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.languages?.available) {
        const code = isEn ? 'en' : 'es';
        return APP_CONFIG.languages.available[code]?.aiLangName || (isEn ? 'English' : 'español');
    }
    return isEn ? 'English' : 'español';
};

const GEMINI_API_KEY_STORAGE = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.apiKeyStorageKey)
    ? APP_CONFIG.ai.apiKeyStorageKey
    : 'appchino_gemini_key';

/**
 * Gets the stored Gemini API Key
 */
const getGeminiApiKey = () => {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE);
};

/**
 * Sets the Gemini API Key
 */
const setGeminiApiKey = (key) => {
    if (key) {
        localStorage.setItem(GEMINI_API_KEY_STORAGE, key);
    } else {
        localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    }
};

let clientCachedModel = null;

const getCandidateModels = () => {
    if (typeof APP_CONFIG !== 'undefined' && Array.isArray(APP_CONFIG.ai?.models) && APP_CONFIG.ai.models.length > 0) {
        return APP_CONFIG.ai.models;
    }
    return [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash'
    ];
};

/**
 * Builds the pedagogical system instruction for Taiwan Traditional Mandarin (TOCFL standard).
 * @param {'es'|'en'} [langCode]
 * @returns {object} Gemini systemInstruction object
 */
const buildTaiwanSystemInstruction = (langCode = isAILangEnglish() ? 'en' : 'es') => {
    const text = langCode === 'en'
        ? `You are a senior professor of Taiwanese Traditional Mandarin (繁體中文 - Taiwan Ministry of Education standard) specialized in the TOCFL proficiency framework.
Pedagogical & Linguistic Rules:
1. ALWAYS write Chinese strictly in Traditional Characters used in Taiwan (e.g., 臺灣/台灣, 裡, 麵, 點, 買, 學, 語, 請問). Never use Simplified Chinese characters.
2. ALWAYS use authentic Taiwanese Mandarin vocabulary, grammar, and phrasing (e.g., 捷運, 計程車, 公車, 機車, 便利商店, 手機, 塊 for currency, 禮拜/星期) rather than Mainland China terms.
3. Provide accurate Hanyu Pinyin with standard tone diacritics (e.g., nǐ hǎo, wǒmen, yí ge / yī gè).
4. Keep all meta-explanations, translations, and feedback in clear, concise English without nested double quotes inside JSON string values.`
        : `Eres un profesor titular de Chino Mandarín Tradicional de Taiwán (繁體中文 - estándar del Ministerio de Educación de Taiwán), especialista en el marco oficial TOCFL.
Reglas Pedagógicas y Lingüísticas:
1. Escribe el chino SIEMPRE en caracteres tradicionales estándar de Taiwán (ej. 臺灣/台灣, 裡, 麵, 點, 買, 學, 語, 請問). Prohibido usar caracteres simplificados.
2. Utiliza SIEMPRE léxico, gramática y modismos propios de Taiwán (ej. 捷運, 計程車, 公車, 機車, 便利商店, 手機, 塊 para moneda, 禮拜/星期) en lugar de términos de China continental.
3. Escribe el Hanyu Pinyin con marcas tonales diacríticas precisas (ej. nǐ hǎo, wǒmen).
4. Redacta todas las explicaciones, traducciones y retroalimentación en español claro y conciso, sin usar comillas dobles anidadas dentro de valores de texto JSON.`;

    return {
        parts: [{ text }]
    };
};

/**
 * Centralized caller for Gemini API.
 * Uses /api/gemini (serverless proxy on Vercel) if available to protect API key,
 * falling back to client-side localStorage key if running locally or standalone.
 * 
 * @param {object} body - Request payload with contents, systemInstruction and generationConfig
 * @param {string} [model] - Target Gemini model name
 * @returns {Promise<string>} The raw text response from the first candidate
 */
const callGeminiAPI = async (body, model) => {
    const candidates = getCandidateModels();
    const localKey = getGeminiApiKey();
    const isLocalFile = window.location.protocol === 'file:';
    const targetModel = clientCachedModel || model || candidates[0];

    // 1. If not running directly from a file:// URL, try the /api/gemini proxy first
    if (!isLocalFile) {
        try {
            const proxyHeaders = { 'Content-Type': 'application/json' };
            if (localKey) {
                proxyHeaders['x-gemini-key'] = localKey;
            }

            const response = await fetch(`/api/gemini?model=${encodeURIComponent(targetModel)}`, {
                method: 'POST',
                headers: proxyHeaders,
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data = await response.json();
                const parts = data.candidates?.[0]?.content?.parts || [];
                const text = parts.map(p => p.text || '').filter(Boolean).join('\n').trim();
                if (!text) {
                    throw new Error("Respuesta inválida o vacía de Gemini.");
                }
                return text;
            }

            const errData = await response.json().catch(() => ({}));
            const errMsg = typeof errData.error === 'object'
                ? (errData.error.message || JSON.stringify(errData.error))
                : (errData.error || `Error en la API de Gemini: ${response.status}`);

            if (!localKey) {
                throw new Error(errMsg);
            }
            console.warn("Proxy /api/gemini devolvió error, intentando con clave local:", errMsg);
        } catch (err) {
            if (!localKey) {
                throw err;
            }
            console.warn("Fallo en proxy /api/gemini, usando clave local:", err.message);
        }
    }

    // 2. Client-side direct fallback using localKey from localStorage
    if (!localKey) {
        throw new Error(
            isAILangEnglish()
                ? "No Gemini API key configured. Set GEMINI_API_KEY in Vercel or enter your key in Settings."
                : "No hay clave de API configurada. Configura la variable GEMINI_API_KEY en Vercel o ingresa tu clave en Configuración."
        );
    }

    let initialModel = clientCachedModel || targetModel;
    const clientQueue = [initialModel, ...candidates.filter(m => m !== initialModel)];

    for (const currentModel of clientQueue) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${localKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (response.ok) {
                const parts = data.candidates?.[0]?.content?.parts || [];
                const text = parts.map(p => p.text || '').filter(Boolean).join('\n').trim();
                if (!text) throw new Error("Respuesta inválida o vacía de Gemini.");
                clientCachedModel = currentModel;
                return text;
            }

            const errMsg = data.error?.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error || ''));
            const match = errMsg.match(/use\s+models\/([\w\.\-]+)/i);
            if (match && match[1] && !clientQueue.includes(match[1])) {
                clientQueue.splice(clientQueue.indexOf(currentModel) + 1, 0, match[1]);
            }

            const isModelError = response.status === 404 || 
                                 errMsg.toLowerCase().includes('not found') || 
                                 errMsg.toLowerCase().includes('no longer available') ||
                                 errMsg.toLowerCase().includes('update your code');

            if (!isModelError) {
                throw new Error(errMsg);
            }
        } catch (err) {
            if (!err.message.includes('not found') && !err.message.includes('available') && !err.message.includes('update your code')) {
                throw err;
            }
        }
    }

    throw new Error("No se pudo conectar con ningún modelo de Gemini disponible.");
};

/**
 * Clean helper to extract and parse JSON from LLM responses without mangling quotes.
 * 
 * @param {string} text - Raw output from LLM
 * @returns {object|Array|null} Parsed JSON object
 */
const safeParseJSON = (text) => {
    if (!text || typeof text !== 'string') return null;

    let clean = text.trim();

    // 1. Strip markdown fences if present
    const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
        clean = fenceMatch[1].trim();
    } else {
        clean = clean.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    }

    // 2. Extract outermost JSON structure: from first { or [ to last } or ]
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
        startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        startIdx = firstBrace;
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
    }

    const lastBrace = clean.lastIndexOf('}');
    const lastBracket = clean.lastIndexOf(']');
    const endIdx = Math.max(lastBrace, lastBracket);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        clean = clean.substring(startIdx, endIdx + 1);
    }

    // 3. Direct JSON.parse
    try {
        return JSON.parse(clean);
    } catch (err1) {
        // Helper to escape unescaped double quotes inside JSON string values
        const escapeInnerQuotes = (rawStr) => {
            let out = '';
            let inStr = false;
            let escaped = false;
            for (let i = 0; i < rawStr.length; i++) {
                const ch = rawStr[i];
                if (escaped) {
                    out += ch;
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    out += ch;
                    escaped = true;
                    continue;
                }
                if (ch === '"') {
                    if (!inStr) {
                        inStr = true;
                        out += ch;
                    } else {
                        const rest = rawStr.slice(i + 1);
                        if (/^\s*(?:[:,}\]]|$)/.test(rest)) {
                            inStr = false;
                            out += ch;
                        } else {
                            out += '\\"';
                        }
                    }
                    continue;
                }
                if (inStr && (ch === '\n' || ch === '\r')) {
                    out += ' ';
                    continue;
                }
                out += ch;
            }
            return out;
        };

        let s = clean;
        s = s.replace(/,\s*([\]}])/g, '$1');
        s = s.replace(/}\s*\{/g, '}, {');
        s = s.replace(/]\s*\[/g, '], [');
        s = s.replace(/(?<=")\s*\n\s*(?="(?![\w\s]+":))/g, ',\n');
        s = s.replace(/("|\d+|true|false|null|\]|\})\s*\n\s*(?="[\w]+":)/g, '$1,\n');

        try {
            return JSON.parse(s);
        } catch (_) {}

        try {
            return JSON.parse(escapeInnerQuotes(s));
        } catch (_) {}

        s = escapeInnerQuotes(s);
        let openBraces = (s.match(/\{/g) || []).length - (s.match(/\}/g) || []).length;
        let openBrackets = (s.match(/\[/g) || []).length - (s.match(/\]/g) || []).length;

        const quotes = (s.match(/(?<!\\)"/g) || []).length;
        if (quotes % 2 !== 0) {
            s += '"';
        }

        while (openBrackets > 0) {
            s += ']';
            openBrackets--;
        }
        while (openBraces > 0) {
            s += '}';
            openBraces--;
        }
        s = s.replace(/,\s*([\]}])/g, '$1');

        try {
            return JSON.parse(s);
        } catch (errFinal) {
            console.warn("safeParseJSON no pudo reparar el JSON:", errFinal.message);
            throw errFinal;
        }
    }
};

const parseSentenceCheckFallback = (rawText, defaultSentence = '') => {
    if (!rawText || typeof rawText !== 'string') return null;
    try {
        const text = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

        const correctaMatch = text.match(/"correcta"\s*:\s*(true|false)/i);
        const correcta = correctaMatch ? correctaMatch[1].toLowerCase() === 'true' : false;

        const extractField = (fieldName) => {
            const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"\\r\\n]+)"`, 'i');
            const match = text.match(regex);
            if (match) return match[1].trim();
            return '';
        };

        const explicacion = extractField('explicacion');
        const correccion = extractField('correccion');
        const pinyin = extractField('pinyin');
        const traduccion = extractField('traduccion');

        if (explicacion || correccion) {
            return {
                correcta,
                explicacion: explicacion || (correcta ? 'La oración es sintácticamente correcta.' : 'Requiere revisión o ajuste.'),
                correccion: correccion || defaultSentence,
                pinyin: pinyin || '',
                traduccion: traduccion || ''
            };
        }
    } catch (e) {
        console.warn("parseSentenceCheckFallback error:", e);
    }
    return null;
};

/**
 * 1. ANALIZADOR DE ORACIONES (Constructor)
 * Evalúa sintaxis (S + Tiempo + Lugar + V + O), uso de clasificadores, partículas,
 * adverbios (很, 都, 也, 不, 沒) y naturalidad en el mandarín de Taiwán.
 * 
 * @param {string} sentence - The traditional Chinese sentence to check
 * @returns {Promise<Object>} The parsed JSON result
 */
const checkSentenceWithGemini = async (sentence) => {
    const isEn = isAILangEnglish();
    const langName = getAILangName();

    const prompt = isEn
        ? `Evaluate the following sentence constructed by a student of Taiwanese Traditional Mandarin (Level 3 Semantic & Contextual Fallback):
Sentence: "${sentence}"

Evaluation Checklist (Taiwan TOCFL / 詞類表 standard):
1. Canonical SVO Slots: [Topic/Subject] -> [Time] -> [Company (跟)] -> [Location (在)] -> [Modal/Neg (Vaux/Adv)] -> [Verb/State (V/Vs)] -> [Object].
2. State Verbs (Vs / Vst) & Separable Verbs (V-sep 離合詞): Ensure Vs use degree adverbs (很) instead of 是, and V-sep (e.g. 唱歌, 上網, 游泳, 照相) handle inner objects properly.
3. Measure Words (M 量詞) & Aspect/Modal Particles (Ptc 助詞: 了, 過, 的, 得, 嗎, 呢, 吧): Check semantic coherence, Taiwanese usage, and aspect placement.

Rules for response fields:
- "correcta": true if grammatically and semantically natural in Taiwan; false if it needs adjustment.
- "explicacion": Maximum 2 concise pedagogical sentences in English explaining semantic naturalness or the exact rule (Vs, V-sep, M, Ptc, or slot order). Do NOT use double quotes inside the string.
- "correccion": The best natural version in Traditional Chinese (identical to input if already perfect).
- "pinyin": Hanyu Pinyin with tone marks for "correccion".
- "traduccion": Natural English translation of the sentence.`
        : `Evalúa la siguiente oración construida por un estudiante de Mandarín Tradicional de Taiwán (Nivel 3: Validación Semántica y Contextual):
Oración: "${sentence}"

Criterios de evaluación (Estándar oficial TOCFL / 詞類表):
1. Slots Canónicos SVO: [Tópico/Sujeto] -> [Tiempo] -> [Compañía (跟)] -> [Lugar (在)] -> [Modal/Neg (Vaux/Adv)] -> [Verbo/Estado (V/Vs)] -> [Objeto].
2. Verbos de Estado (Vs / Vst) y Verbos Separables (V-sep 離合詞): Verifica que los Vs usen adverbio de grado (很) en vez de 是, y que los V-sep (唱歌, 上網, 游泳, 照相) manejen bien su objeto interno.
3. Clasificadores (M 量詞) y Partículas (Ptc 助詞: 了, 過, 的, 得, 嗎, 呢, 吧): Verifica coherencia semántica, colocación aspectual y naturalidad en Taiwán.

Reglas de los campos de respuesta:
- "correcta": true si es gramatical y semánticamente natural en Taiwán; false si requiere ajuste.
- "explicacion": Máximo 2 oraciones pedagógicas concisas en ${langName} explicando la naturalidad semántica o la regla exacta (Vs, V-sep, M, Ptc u orden de slots). PROHIBIDO usar comillas dobles dentro del texto.
- "correccion": La versión más natural en chino tradicional (igual a la original si ya es perfecta).
- "pinyin": Pinyin con marcas tonales de la versión corregida.
- "traduccion": Traducción natural al ${langName}.`;

    const body = {
        systemInstruction: buildTaiwanSystemInstruction(isEn ? 'en' : 'es'),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    correcta: { type: "BOOLEAN" },
                    explicacion: { type: "STRING" },
                    correccion: { type: "STRING" },
                    pinyin: { type: "STRING" },
                    traduccion: { type: "STRING" }
                },
                required: ["correcta", "explicacion", "correccion", "pinyin", "traduccion"]
            },
            temperature: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.temperatures?.sentenceCheck) || 0.1,
            maxOutputTokens: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.maxTokens?.sentenceCheck) || 1024
        }
    };

    try {
        const candidate = await callGeminiAPI(body);
        let parsed = null;
        try {
            parsed = safeParseJSON(candidate);
        } catch (parseErr) {
            console.warn("safeParseJSON falló, usando extractor directo:", parseErr);
            parsed = parseSentenceCheckFallback(candidate, sentence);
            if (!parsed) throw parseErr;
        }

        if (!parsed || typeof parsed !== 'object') {
            parsed = parseSentenceCheckFallback(candidate, sentence) || {
                correcta: false,
                explicacion: isEn ? 'Could not evaluate the sentence in detail.' : 'No se pudo evaluar detalladamente la oración.',
                correccion: sentence,
                pinyin: '',
                traduccion: ''
            };
        }

        return parsed;
    } catch (error) {
        console.error("Error checking sentence:", error);
        throw error;
    }
};

// =========================================================================
// 2. COMPRESIÓN ULTRA-EFICIENTE DE CONTEXTO PARA EXAMEN (2 CAPAS)
//    - Reduce en ~75% el uso de tokens de entrada
//    - Incluye el 100% del vocabulario y estructuras sin truncar nada
//    - Separa claramente FOCO DE EVALUACIÓN vs. SOPORTE PERMITIDO
// =========================================================================

/**
 * Construye una representación compacta en 2 niveles del vocabulario:
 * - Nivel FOCO: Agrupado por categoría POS (`N: 火車,高鐵 | V: 坐,參觀...`) -> ~40-90 tokens
 * - Nivel SOPORTE: Línea continua de Hanzi separados por espacio -> ~180-250 tokens para todo el diccionario previo
 */
const buildCompactVocabularyContext = (focusWords = [], supportWords = []) => {
    const focusByPos = {};
    const focusSet = new Set();

    focusWords.forEach(w => {
        const hz = (w?.tradicional || '').trim();
        if (!hz) return;
        focusSet.add(hz);
        const pos = w.posSymbol || w.verbSubtype || w.categoria || 'N';
        if (!focusByPos[pos]) focusByPos[pos] = [];
        if (!focusByPos[pos].includes(hz)) {
            focusByPos[pos].push(hz);
        }
    });

    const focusStr = Object.entries(focusByPos)
        .map(([pos, list]) => `${pos}: ${list.join(',')}`)
        .join(' | ');

    const supportHz = [];
    const seenSupport = new Set();
    supportWords.forEach(w => {
        const hz = (w?.tradicional || '').trim();
        if (!hz || focusSet.has(hz) || seenSupport.has(hz)) return;
        seenSupport.add(hz);
        supportHz.push(hz);
    });

    return {
        focusVocabLine: focusStr || '(Sin palabras foco)',
        supportVocabLine: supportHz.length > 0 ? supportHz.join(' ') : '(Ninguno adicional; usa solo el vocabulario foco)'
    };
};

/**
 * Construye una representación compacta en 2 niveles de las estructuras gramaticales
 * OMITIENDO los párrafos largos de `notas` (~4,500 tokens ahorrados):
 * - Nivel FOCO: `[L8] Nombre | Fórmula | 1 Ejemplo corto`
 * - Nivel SOPORTE: `L1: Fórmula 1 ; Fórmula 2`
 */
const buildCompactStructuresContext = (focusStructures = [], supportStructures = []) => {
    const isEn = isAILangEnglish();
    const focusIds = new Set();
    const focusLines = focusStructures.map(s => {
        if (s.id) focusIds.add(s.id);
        const lTag = s.leccion ? `[L${s.leccion}] ` : '';
        const name = (s.nombre || (isEn ? 'Structure' : 'Estructura'))
            .replace(/^[I|V|X]+\.?[A-Z]?\s*·\s*/, '')
            .replace(/"/g, "'")
            .trim();
        const cleanFormula = (s.formula || '').replace(/"/g, "'").trim();
        const firstEx = (s.ejemplo_tradicional || '').split('/')[0].trim();
        return `- ${lTag}${name} => ${isEn ? 'Formula' : 'Fórmula'}: ${cleanFormula}${firstEx ? ` (${isEn ? 'Ex' : 'Ej'}: ${firstEx})` : ''}`;
    });

    const supportByLesson = {};
    supportStructures.forEach(s => {
        if (s.id && focusIds.has(s.id)) return;
        const lKey = s.leccion ? `L${s.leccion}` : 'Base';
        if (!supportByLesson[lKey]) supportByLesson[lKey] = [];
        if (s.formula) {
            const shortFormula = s.formula.split('|')[0].replace(/"/g, "'").trim();
            supportByLesson[lKey].push(shortFormula);
        }
    });

    const supportLines = Object.entries(supportByLesson)
        .map(([lKey, list]) => `${lKey}: ${list.join(' ; ')}`)
        .join('\n');

    return {
        focusStructsBlock: focusLines.length > 0
            ? focusLines.join('\n')
            : (isEn ? '- Basic SVO structures (S + Time + Location + V + O)' : '- Estructuras básicas SVO (S + Tiempo + Lugar + V + O)'),
        supportStructsBlock: supportLines || (isEn ? '(Only focus structures)' : '(Solo estructuras foco)')
    };
};

/**
 * 3. GENERADOR DE SIMULACIÓN DE EXAMEN PERSONALIZABLE (Prompt y Schema Dinámicos)
 * Solo solicita a Gemini las áreas activas (`gramatica`, `redaccion`, `lectura`),
 * ajusta el número de reactivos (`questionCount`: 3, 5 o 10) y la longitud/complejidad (`difficulty`).
 * Soporta tanto Español como Inglés según el idioma activo.
 *
 * @param {object} configPayload
 * @returns {Promise<object>}
 */
const generateExamAIData = async (configPayload) => {
    const {
        focusWords = [],
        supportWords = [],
        focusStructures = [],
        supportStructures = [],
        selectedLessons = [8],
        areas = { gramatica: true, redaccion: true, lectura: true },
        questionCount = 5,
        difficulty = 'estandar',
        directivesBank = []
    } = configPayload || {};

    const isEn = isAILangEnglish();
    const needGrammar = !!areas.gramatica;
    const needWriting = !!areas.redaccion;
    const needReading = !!areas.lectura;

    // Si ninguna fase de IA está activa (ej. solo Vocabulario), retornamos vacío sin gastar API
    if (!needGrammar && !needWriting && !needReading) {
        return { fase3: [], fase4: [], fase5: [], fase6: { banco_caracteres: [], preguntas: [] }, fase7: { historia: '', verdadero_falso: [], opcion_multiple: [] } };
    }

    const { focusVocabLine, supportVocabLine } = buildCompactVocabularyContext(focusWords, supportWords);
    const { focusStructsBlock, supportStructsBlock } = buildCompactStructuresContext(focusStructures, supportStructures);

    // Reglas de longitud según nivel de dificultad (Nivel 3 de personalización)
    const difficultyRulesMap = isEn
        ? {
            basico: {
                label: 'BASIC (Short, direct sentences)',
                sentenceLen: '6 to 10 Chinese characters per sentence (1 simple direct clause)',
                storyLen: '60 to 90 Chinese characters in total (short paragraph, simple sentences)'
            },
            estandar: {
                label: 'STANDARD (Official classroom exam level)',
                sentenceLen: '10 to 16 Chinese characters per sentence (combining subject, time/location, and predicate)',
                storyLen: '110 to 150 Chinese characters in total (natural, fluent Taiwanese story)'
            },
            avanzado: {
                label: 'ADVANCED (Long, compound sentences)',
                sentenceLen: '16 to 25 Chinese characters per sentence (2 connected clauses or full contrast)',
                storyLen: '170 to 230 Chinese characters in total (detailed passage with multiple events and comparisons)'
            }
        }
        : {
            basico: {
                label: 'BÁSICO (Oraciones cortas y directas)',
                sentenceLen: '6 a 10 caracteres chinos por oración (1 sola cláusula directa y sencilla)',
                storyLen: '60 a 90 caracteres chinos en total (párrafo breve, oraciones simples)'
            },
            estandar: {
                label: 'ESTÁNDAR (Nivel examen oficial de clase)',
                sentenceLen: '10 a 16 caracteres chinos por oración (combinando sujeto, tiempo/lugar y predicado)',
                storyLen: '110 a 150 caracteres chinos en total (relato fluido y natural en Taiwán)'
            },
            avanzado: {
                label: 'AVANZADO (Oraciones largas y compuestas)',
                sentenceLen: '16 a 25 caracteres chinos por oración (2 cláusulas conectadas o contraste completo)',
                storyLen: '170 a 230 caracteres chinos en total (relato detallado con múltiples eventos y comparaciones)'
            }
        };
    const diffSpec = difficultyRulesMap[difficulty] || difficultyRulesMap.estandar;

    // Construcción dinámica de instrucciones de fases y schema JSON (solo lo activo)
    const phaseInstructions = [];
    const schemaProperties = {};
    const schemaRequired = [];

    if (needGrammar) {
        phaseInstructions.push(isEn ? `
1. GRAMMAR AREA ("fase3" and "fase4" — exactly ${questionCount} items each, id: 1..${questionCount}):
   - "fase3" (Fill in the blank):
     * ${questionCount} sentences in Traditional Chinese (${diffSpec.sentenceLen}) where exactly 1 word or particle from FOCUS VOCABULARY (Lessons ${selectedLessons.join(', ')}) is replaced by "[ ___ ]".
     * The sentence context must make the missing word ("palabra_faltante") unambiguous.
   - "fase4" (Grammar Multiple Choice):
     * ${questionCount} sentences in Traditional Chinese with "[ ___ ]" (${diffSpec.sentenceLen}) directly testing the FOCUS STRUCTURES listed below.
     * "opciones": array of 3 options in Traditional Chinese. Only 1 ("opcion_correcta") is grammatically valid; the 2 distractors must violate the target grammar rule.` : `
1. ÁREA GRAMÁTICA ("fase3" y "fase4" — exactamente ${questionCount} reactivos cada una, id: 1..${questionCount}):
   - "fase3" (Completado de frases):
     * ${questionCount} oraciones de longitud ${diffSpec.sentenceLen} donde falta exactamente 1 palabra o partícula del VOCABULARIO FOCO (Lecciones ${selectedLessons.join(', ')}), representada por "[ ___ ]".
     * El contexto de la oración debe hacer inequívoca la palabra faltante ("palabra_faltante").
   - "fase4" (Selección múltiple gramatical):
     * ${questionCount} oraciones con "[ ___ ]" (${diffSpec.sentenceLen}) que evalúen directamente las ESTRUCTURAS FOCO listadas abajo.
     * "opciones": array de exactamente 3 opciones en caracteres tradicionales. Solo 1 ("opcion_correcta") es gramatical y semánticamente válida; los 2 distractores deben violar la regla de la estructura evaluada.`);

        schemaProperties.fase3 = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    id: { type: "INTEGER" },
                    oracion: { type: "STRING" },
                    palabra_faltante: { type: "STRING" }
                },
                required: ["id", "oracion", "palabra_faltante"]
            }
        };
        schemaProperties.fase4 = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    id: { type: "INTEGER" },
                    oracion: { type: "STRING" },
                    opciones: { type: "ARRAY", items: { type: "STRING" } },
                    opcion_correcta: { type: "STRING" }
                },
                required: ["id", "oracion", "opciones", "opcion_correcta"]
            }
        };
        schemaRequired.push("fase3", "fase4");
    }

    if (needWriting) {
        const directivesText = directivesBank.map((d, idx) =>
            `   #${idx + 1}: [${d.tipo === 'estructura' ? (isEn ? 'STRUCTURE' : 'ESTRUCTURA') : (isEn ? 'WORD' : 'PALABRA')}] 「${String(d.valor || '').replace(/"/g, "'")}」`
        ).join('\n');

        phaseInstructions.push(isEn ? `
2. WRITING AREA ("fase5" and "fase6" — exactly ${questionCount} items each, id: 1..${questionCount}):
   - "fase5" (Free response to situational questions):
     * ${questionCount} everyday scenarios in Taiwan ("escenario", written in Traditional Chinese) with a question ("pregunta", ${diffSpec.sentenceLen}) in Traditional Chinese prompting the student to answer using vocabulary and grammar from Lessons ${selectedLessons.join(', ')}. Include a valid "ejemplo_respuesta" in Traditional Chinese.
   - "fase6" (Guided writing with mandatory directive — specific word or grammar pattern):
     * Set "banco_caracteres" to the array of ${questionCount} directive strings below.
     * Use EXACTLY these ${questionCount} preselected directives in order (id: 1..${questionCount}) as "caracter_asignado":
${directivesText}
     * For each directive, write a natural question or prompt in Traditional Chinese ("pregunta") that requires the student to answer in a complete sentence applying "caracter_asignado", and provide a valid "ejemplo_respuesta" in Traditional Chinese.` : `
2. ÁREA REDACCIÓN ("fase5" y "fase6" — exactamente ${questionCount} reactivos cada una, id: 1..${questionCount}):
   - "fase5" (Respuesta libre a preguntas situacionales):
     * ${questionCount} escenarios cotidianos en Taiwán ("escenario", en chino tradicional) con una "pregunta" en chino tradicional (${diffSpec.sentenceLen}) que invite al alumno a responder usando el vocabulario y estructuras de las Lecciones ${selectedLessons.join(', ')}. Incluye "ejemplo_respuesta".
   - "fase6" (Redacción con directrices obligatorias: usar palabra o estructura específica):
     * Usa EXACTAMENTE estas ${questionCount} directrices preseleccionadas en orden (id: 1..${questionCount}) para "caracter_asignado":
${directivesText}
     * Para cada directriz, redacta una pregunta o instrucción en chino tradicional ("pregunta") que obligue naturalmente al alumno a responder en una oración completa usando ese "caracter_asignado" (palabra o estructura), y provee un "ejemplo_respuesta" válido.`);

        schemaProperties.fase5 = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    id: { type: "INTEGER" },
                    escenario: { type: "STRING" },
                    pregunta: { type: "STRING" },
                    ejemplo_respuesta: { type: "STRING" }
                },
                required: ["id", "escenario", "pregunta", "ejemplo_respuesta"]
            }
        };
        schemaProperties.fase6 = {
            type: "OBJECT",
            properties: {
                banco_caracteres: { type: "ARRAY", items: { type: "STRING" } },
                preguntas: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "INTEGER" },
                            caracter_asignado: { type: "STRING" },
                            pregunta: { type: "STRING" },
                            ejemplo_respuesta: { type: "STRING" }
                        },
                        required: ["id", "caracter_asignado", "pregunta", "ejemplo_respuesta"]
                    }
                }
            },
            required: ["banco_caracteres", "preguntas"]
        };
        schemaRequired.push("fase5", "fase6");
    }

    if (needReading) {
        phaseInstructions.push(isEn ? `
3. READING AREA ("fase7" — 1 story + ${questionCount} True/False + ${questionCount} Multiple Choice):
   - "historia": A cohesive story in Traditional Chinese (${diffSpec.storyLen}) set in Taiwan (do NOT use textbook character names), heavily integrating the FOCUS VOCABULARY and FOCUS STRUCTURES.
   - "verdadero_falso": exactly ${questionCount} statements (id: 1..${questionCount}) in Traditional Chinese about the story ("es_verdadera": true/false).
   - "opcion_multiple": exactly ${questionCount} questions (id: 1..${questionCount}) in Traditional Chinese about the story, each with 3 "opciones" and "respuesta_correcta" matching one of the 3 options.` : `
3. ÁREA LECTURA ("fase7" — 1 historia + ${questionCount} Verdadero/Falso + ${questionCount} Opción Múltiple):
   - "historia": Relato en chino tradicional de ${diffSpec.storyLen}, protagonizado por estudiantes o amigos en Taiwán (sin usar nombres de libros de texto), integrando intensivamente el VOCABULARIO FOCO y las ESTRUCTURAS FOCO.
   - "verdadero_falso": exactamente ${questionCount} afirmaciones (id: 1..${questionCount}) en chino tradicional sobre la historia ("es_verdadera": true/false).
   - "opcion_multiple": exactamente ${questionCount} preguntas (id: 1..${questionCount}) en chino tradicional sobre la historia, cada una con 3 "opciones" y "respuesta_correcta" idéntica a una de las 3 opciones.`);

        schemaProperties.fase7 = {
            type: "OBJECT",
            properties: {
                historia: { type: "STRING" },
                verdadero_falso: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "INTEGER" },
                            afirmacion: { type: "STRING" },
                            es_verdadera: { type: "BOOLEAN" }
                        },
                        required: ["id", "afirmacion", "es_verdadera"]
                    }
                },
                opcion_multiple: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "INTEGER" },
                            pregunta: { type: "STRING" },
                            opciones: { type: "ARRAY", items: { type: "STRING" } },
                            respuesta_correcta: { type: "STRING" }
                        },
                        required: ["id", "pregunta", "opciones", "respuesta_correcta"]
                    }
                }
            },
            required: ["historia", "verdadero_falso", "opcion_multiple"]
        };
        schemaRequired.push("fase7");
    }

    const prompt = isEn
        ? `Design an Official Taiwanese Traditional Mandarin (TOCFL) Exam focused on Lessons: ${selectedLessons.join(', ')}.
DIFFICULTY & LENGTH LEVEL: ${diffSpec.label}
- Sentence length: ${diffSpec.sentenceLen}.
- 100% immersion in Traditional Chinese characters (繁體中文), with NO Pinyin and NO English inside sentences, scenarios, or options.
- NEVER use double quotes (") inside JSON string values; use corner brackets 「...」 or single quotes '...' if needed.

STRICT CONTEXT CONTROL RULE (ZERO UNSEEN WORDS OR GRAMMAR):
1. MANDATORY EVALUATION FOCUS (Lessons ${selectedLessons.join(', ')}):
   All target answers, blanks, grammar questions, and core themes MUST directly test this vocabulary and these grammar structures:
   [FOCUS_VOCABULARY]:
   ${focusVocabLine}

   [FOCUS_STRUCTURES]:
${focusStructsBlock}

2. ALLOWED SUPPORT BASE (Earlier lessons):
   You may use words and patterns from this support list ONLY as scaffolding to build sentences, and it is STRICTLY FORBIDDEN to use any Chinese words or grammar structures not present in FOCUS or SUPPORT:
   [SUPPORT_VOCABULARY]:
   ${supportVocabLine}

   [SUPPORT_STRUCTURES]:
${supportStructsBlock}

REQUESTED SECTIONS:
${phaseInstructions.join('\n')}`
        : `Diseña un Examen Oficial de Chino Tradicional de Taiwán (TOCFL) enfocado en las Lecciones: ${selectedLessons.join(', ')}.
NIVEL DE DIFICULTAD Y LONGITUD: ${diffSpec.label}
- Longitud de oraciones: ${diffSpec.sentenceLen}.
- Inmersión 100% en caracteres tradicionales (繁體中文), sin pinyin ni español dentro de las oraciones u opciones.
- PROHIBIDO usar comillas dobles (") dentro de los valores de texto JSON; usa 「...」 o comillas simples '...' si necesitas citar algo.

REGLA ESTRICTA DE CONTROL DE CONTEXTO (CERO PALABRAS O ESTRUCTURAS NO VISTAS):
1. FOCO DE EVALUACIÓN OBLIGATORIO (Lecciones ${selectedLessons.join(', ')}):
   Todas las respuestas objetivo, huecos, preguntas de gramática y temas principales DEBEN evaluar este vocabulario y estructuras:
   [VOCABULARIO_FOCO]:
   ${focusVocabLine}

   [ESTRUCTURAS_FOCO]:
${focusStructsBlock}

2. BASE DE SOPORTE PERMITIDA (Lecciones anteriores):
   Puedes usar palabras y moldes de esta lista SOLO como soporte para armar las oraciones, pero ESTÁ ESTRICTAMENTE PROHIBIDO usar caracteres, palabras o estructuras gramaticales que no estén en FOCO ni en SOPORTE:
   [VOCABULARIO_SOPORTE]:
   ${supportVocabLine}

   [ESTRUCTURAS_SOPORTE]:
${supportStructsBlock}

SECCIONES SOLICITADAS:
${phaseInstructions.join('\n')}`;

    const body = {
        systemInstruction: buildTaiwanSystemInstruction(isEn ? 'en' : 'es'),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: schemaProperties,
                required: schemaRequired
            },
            temperature: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.temperatures?.examGen) || 0.25,
            maxOutputTokens: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.maxTokens?.examGen) || 6144
        }
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const candidate = await callGeminiAPI(body);
            const parsed = safeParseJSON(candidate);
            if (!parsed || typeof parsed !== 'object') {
                throw new Error(isEn ? "Invalid exam format returned by Gemini." : "El formato del examen generado por Gemini es inválido.");
            }
            return {
                fase3: Array.isArray(parsed.fase3) ? parsed.fase3 : [],
                fase4: Array.isArray(parsed.fase4) ? parsed.fase4 : [],
                fase5: Array.isArray(parsed.fase5) ? parsed.fase5 : [],
                fase6: parsed.fase6 && Array.isArray(parsed.fase6.preguntas)
                    ? parsed.fase6
                    : { banco_caracteres: directivesBank.map(d => d.valor), preguntas: [] },
                fase7: parsed.fase7 && Array.isArray(parsed.fase7.verdadero_falso)
                    ? parsed.fase7
                    : { historia: '', verdadero_falso: [], opcion_multiple: [] }
            };
        } catch (error) {
            console.warn(`Intento ${attempt} de generación de examen con Gemini falló:`, error.message);
            if (attempt === 2) {
                console.error("Error definitivo generando examen con Gemini:", error);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 700));
        }
    }
};

/**
 * 4. EVALUADOR DE RESPUESTAS ABIERTAS DEL EXAMEN (Área Redacción: Fases 5 y 6)
 */
const evaluateExamAIAnswers = async (phase5Submissions, phase6Submissions) => {
    const isEn = isAILangEnglish();
    const langName = getAILangName();

    const prompt = isEn
        ? `Evaluate the student's open-ended Taiwanese Traditional Chinese responses for the Writing section (Phase 5: Free Situational Answers and Phase 6: Guided Writing with Mandatory Directive).
Write all feedback comments ("comentario"), translations ("traduccion_correccion"), and the overall summary ("resumen_general") in ${langName}. Do NOT use double quotes (") inside JSON string values.

GRADING RUBRIC:
- Phase 5 (Free situational answers):
  * 1.0 pt ("es_correcta": true): Answers the question coherently with accurate Traditional Chinese grammar.
  * 0.5 pts ("es_correcta": false): Understandable and relevant, but with minor word order, measure word, or character errors.
  * 0.0 pts ("es_correcta": false): Blank, unrelated, or not written in Chinese.
- Phase 6 (Guided writing with mandatory directive in "caracter_asignado"):
  * 1.0 pt ("es_correcta": true, "uso_caracter_banco": true): Answers the prompt while properly applying the required word or grammar structure in "caracter_asignado".
  * 0.5 pts ("es_correcta": false): Either answers well without applying the directive "caracter_asignado", or applies the directive with minor grammar errors.
  * 0.0 pts ("es_correcta": false): Blank or unintelligible.

SUBMISSIONS TO EVALUATE:
Phase 5:
${JSON.stringify(phase5Submissions, null, 2)}

Phase 6:
${JSON.stringify(phase6Submissions, null, 2)}

For each item include:
- "comentario": brief pedagogical feedback in ${langName} (1-2 sentences, no double quotes).
- "correccion_sugerida": ideal model sentence in Taiwanese Traditional Chinese.
- "pinyin_correccion": Hanyu Pinyin with tone marks.
- "traduccion_correccion": natural translation in ${langName}.`
        : `Evalúa las respuestas abiertas en Chino Tradicional de Taiwán del estudiante para la sección de Redacción (Fase 5: Respuestas libres y Fase 6: Redacción con directriz obligatoria).
Redacta todos los comentarios, traducciones y el resumen general en ${langName}. PROHIBIDO usar comillas dobles (") dentro de valores de texto JSON.

RÚBRICA DE CALIFICACIÓN:
- Fase 5 (Respuestas a preguntas libres):
  * 1.0 pt ("es_correcta": true): Responde coherentemente a la pregunta con gramática correcta en chino tradicional.
  * 0.5 pts ("es_correcta": false): Comprensible y relevante, pero con errores menores de orden sintáctico, clasificador o carácter.
  * 0.0 pts ("es_correcta": false): En blanco, sin relación o no escrito en chino.
- Fase 6 (Redacción con directriz obligatoria — palabra o estructura asignada en "caracter_asignado"):
  * 1.0 pt ("es_correcta": true, "uso_caracter_banco": true): Responde a la pregunta aplicando correctamente la palabra o estructura indicada en "caracter_asignado".
  * 0.5 pts ("es_correcta": false): O bien responde bien sin aplicar la directriz "caracter_asignado", o bien aplica la directriz con errores gramaticales leves.
  * 0.0 pts ("es_correcta": false): En blanco o ininteligible.

RESPUESTAS A EVALUAR:
Fase 5:
${JSON.stringify(phase5Submissions, null, 2)}

Fase 6:
${JSON.stringify(phase6Submissions, null, 2)}

Para cada reactivo incluye:
- "comentario": retroalimentación pedagógica breve en ${langName} (1-2 oraciones).
- "correccion_sugerida": oración modelo en chino tradicional de Taiwán.
- "pinyin_correccion": Pinyin con tonos.
- "traduccion_correccion": traducción en ${langName}.`;

    const body = {
        systemInstruction: buildTaiwanSystemInstruction(isEn ? 'en' : 'es'),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    fase5_evaluacion: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                id: { type: "INTEGER" },
                                es_correcta: { type: "BOOLEAN" },
                                puntaje: { type: "NUMBER" },
                                comentario: { type: "STRING" },
                                correccion_sugerida: { type: "STRING" },
                                pinyin_correccion: { type: "STRING" },
                                traduccion_correccion: { type: "STRING" }
                            },
                            required: ["id", "es_correcta", "puntaje", "comentario", "correccion_sugerida", "pinyin_correccion", "traduccion_correccion"]
                        }
                    },
                    fase6_evaluacion: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                id: { type: "INTEGER" },
                                es_correcta: { type: "BOOLEAN" },
                                uso_caracter_banco: { type: "BOOLEAN" },
                                puntaje: { type: "NUMBER" },
                                comentario: { type: "STRING" },
                                correccion_sugerida: { type: "STRING" },
                                pinyin_correccion: { type: "STRING" },
                                traduccion_correccion: { type: "STRING" }
                            },
                            required: ["id", "es_correcta", "uso_caracter_banco", "puntaje", "comentario", "correccion_sugerida", "pinyin_correccion", "traduccion_correccion"]
                        }
                    },
                    resumen_general: { type: "STRING" }
                },
                required: ["fase5_evaluacion", "fase6_evaluacion", "resumen_general"]
            },
            temperature: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.temperatures?.examEval) || 0.15,
            maxOutputTokens: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.maxTokens?.examEval) || 4096
        }
    };

    try {
        const candidate = await callGeminiAPI(body);
        const parsed = safeParseJSON(candidate);
        if (!parsed || !parsed.fase5_evaluacion || !parsed.fase6_evaluacion) {
            throw new Error("Respuesta incompleta de evaluación por Gemini.");
        }
        return parsed;
    } catch (error) {
        console.error("Error evaluating exam with Gemini:", error);
        throw error;
    }
};
