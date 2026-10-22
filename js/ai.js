/**
 * =====================================================
 * AppChino — ai.js
 * Integración con Gemini API para análisis de oraciones,
 * retos de práctica, conversación interactiva y simulación de examen.
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
 * Builds the pedagogical system instruction for Taiwan Traditional Mandarin (TOCFL / MTC Dangdai).
 * @param {'es'|'en'} [langCode]
 * @returns {object} Gemini systemInstruction object
 */
const buildTaiwanSystemInstruction = (langCode = isAILangEnglish() ? 'en' : 'es') => {
    const text = langCode === 'en'
        ? `You are a senior professor of Taiwanese Traditional Mandarin (繁體中文 - Taiwan Ministry of Education standard) specialized in the TOCFL proficiency framework and the NTNU Mandarin Training Center curriculum "A Course in Contemporary Chinese" (當代中文課程).
Pedagogical & Linguistic Rules:
1. ALWAYS write Chinese strictly in Traditional Characters used in Taiwan (e.g., 臺灣/台灣, 裡, 麵, 點, 買, 學, 語, 請問). Never use Simplified Chinese characters.
2. ALWAYS use authentic Taiwanese Mandarin vocabulary, grammar, and phrasing (e.g., 捷運, 計程車, 腳踏車, 便當, 手機, 塊 for currency, 禮拜/星期, 服務生, 早安) rather than Mainland China terms.
3. Provide accurate Hanyu Pinyin with standard tone diacritics (e.g., nǐ hǎo, wǒmen, yí ge / yī gè).
4. Keep all meta-explanations, translations, and feedback in clear, concise English without nested double quotes inside JSON string values.`
        : `Eres un profesor titular de Chino Mandarín Tradicional de Taiwán (繁體中文 - estándar del Ministerio de Educación de Taiwán), especialista en el examen oficial TOCFL y el currículo "A Course in Contemporary Chinese" (當代中文課程) del Mandarin Training Center (NTNU).
Reglas Pedagógicas y Lingüísticas:
1. Escribe el chino SIEMPRE en caracteres tradicionales estándar de Taiwán (ej. 臺灣/台灣, 裡, 麵, 點, 買, 學, 語, 請問). Prohibido usar caracteres simplificados.
2. Utiliza SIEMPRE léxico, gramática y modismos propios de Taiwán (ej. 捷運, 計程車, 腳踏車, 便當, 手機, 塊 para moneda, 禮拜/星期, 服務生, 早安) en lugar de términos de China continental.
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

            // If proxy responded with error, extract meaningful error message
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
        let s = clean;
        s = s.replace(/,\s*([\]}])/g, '$1');
        s = s.replace(/}\s*\{/g, '}, {');
        s = s.replace(/]\s*\[/g, '], [');
        s = s.replace(/(?<=")\s*\n\s*(?="(?![\w\s]+":))/g, ',\n');
        s = s.replace(/("|\d+|true|false|null|\]|\})\s*\n\s*(?="[\w]+":)/g, '$1,\n');

        try {
            return JSON.parse(s);
        } catch (_) {}

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
 * Helper to format learned grammar structures with their real property names
 * (nombre, formula, ejemplo_tradicional, notas).
 * @param {Array<object>} structures
 * @param {number} [limit=30]
 * @returns {string}
 */
const formatStructuresForPrompt = (structures, limit = 30) => {
    if (!Array.isArray(structures) || structures.length === 0) {
        return 'Estructuras elementales de mandarín tradicional (S + 是 + O, S + 很 + Adj, S + 在 + Lugar + V).';
    }
    return structures
        .slice(0, limit)
        .map(s => {
            const name = s.nombre || s.patron || 'Estructura';
            const formula = s.formula ? `[Fórmula: ${s.formula}]` : '';
            const ex = s.ejemplo_tradicional ? `(Ej: ${s.ejemplo_tradicional})` : '';
            const note = s.notas || s.explicacion ? `— ${s.notas || s.explicacion}` : '';
            return `- ${name} ${formula} ${ex} ${note}`.trim();
        })
        .join('\n');
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
        ? `Evaluate the following sentence constructed by a student of Taiwanese Traditional Mandarin:
Sentence: "${sentence}"

Evaluation Checklist:
1. Word Order: Check Mandarin syntax (Subject + Time + Place + Adverb + Verb + Object / Complement).
2. Adjectives & Linking Verbs: Ensure predicative adjectives use a degree adverb like 很 instead of 是 (unless emphatic), and nouns use 是.
3. Measure Words (Classifiers): Verify that numerals/demonstratives (這, 那, 幾 + number) use the appropriate Taiwanese classifier (e.g. 個, 位, 本, 杯, 支, 家, 碗, 張).
4. Particles & Negation: Check proper usage of 的, 了, 嗎, 呢, 吧, and negation (不 vs 沒/沒有 with 有).

Rules for response fields:
- "correcta": true if grammatically sound and natural in Taiwan; false if it has syntax, classifier, or lexical errors.
- "explicacion": 1 concise pedagogical sentence in English (max 25 words) explaining why it is right or the exact grammar rule to fix. Do NOT use double quotes inside the string.
- "correccion": The best natural version in Traditional Chinese (identical to input if already perfect).
- "pinyin": Hanyu Pinyin with tone marks for "correccion".
- "traduccion": Natural English translation of the sentence.`
        : `Evalúa la siguiente oración construida por un estudiante de Mandarín Tradicional de Taiwán:
Oración: "${sentence}"

Criterios de evaluación:
1. Orden sintáctico: Verifica el orden en mandarín (Sujeto + Tiempo + Lugar + Adverbio + Verbo + Objeto / Complemento).
2. Adjetivos y verbo copulativo: Verifica que los adjetivos predicativos usen adverbio de grado (ej. 很) en lugar de 是, y que 是 se use para vincular sustantivos.
3. Clasificadores: Verifica que numerales y demostrativos (這, 那, 幾) lleven el clasificador taiwanés adecuado (個, 位, 本, 杯, 支, 家, 碗, 張).
4. Partículas y negación: Verifica el uso correcto de 的, 了, 嗎, 呢, 吧 y la diferencia entre 不 y 沒 (ej. 沒有).

Reglas de los campos de respuesta:
- "correcta": true si es gramaticalmente correcta y natural en Taiwán; false si presenta errores de orden, clasificador o vocabulario.
- "explicacion": 1 oración pedagógica concisa en ${langName} (máximo 25 palabras) explicando el acierto o la regla exacta a corregir. PROHIBIDO usar comillas dobles dentro del texto.
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

/**
 * 2. GENERADOR DE RETOS DE PRÁCTICA (5 oraciones basadas en estructuras y vocabulario)
 * 
 * @param {Array<string>} words - Focused list of traditional Chinese words known by the user
 * @param {Array<object>} structures - List of 5 structures ({ id, nombre, formula })
 * @returns {Promise<Array<object>>} 5 challenge objects
 */
const generatePracticeChallengesWithGemini = async (words, structures) => {
    const isEn = isAILangEnglish();
    const langName = getAILangName();

    const prompt = `Formulate exactly 5 translation challenges in natural ${langName} for the student to translate into Taiwanese Traditional Chinese (繁體中文).
Assign exactly one target structure from the list below to each challenge (preserving its exact "id" in "estructura_id").

Student's known vocabulary (use ONLY these words or elementary pronouns/numbers):
${words.join(', ')}

Target structures (1 per challenge):
${JSON.stringify(structures, null, 2)}

Pedagogical requirements:
1. Create 5 everyday Taiwanese scenarios (id: 1 to 5).
2. "instruccion_espanol" must be the natural sentence in ${langName} to translate into Chinese.
3. "pista" must be a brief grammatical hint in ${langName} reminding how to apply the formula.
4. "vocabulario_clave" must list 2 to 4 relevant Traditional Chinese words from the student's vocabulary.`;

    const body = {
        systemInstruction: buildTaiwanSystemInstruction(isEn ? 'en' : 'es'),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        id: { type: "INTEGER" },
                        estructura_id: { type: "STRING" },
                        instruccion_espanol: { type: "STRING" },
                        vocabulario_clave: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        },
                        pista: { type: "STRING" }
                    },
                    required: ["id", "estructura_id", "instruccion_espanol", "vocabulario_clave", "pista"]
                }
            },
            temperature: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.temperatures?.practiceGen) || 0.35,
            maxOutputTokens: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.maxTokens?.practiceGen) || 2048
        }
    };

    try {
        const candidate = await callGeminiAPI(body);
        return safeParseJSON(candidate);
    } catch (error) {
        console.error("Error generating practice challenges:", error);
        throw error;
    }
};

/**
 * 3. EVALUADOR DE RETOS DE PRÁCTICA
 * 
 * @param {Array<object>} submissions - Array of objects with { id, instruccion_espanol, formula, respuesta_estudiante }
 * @returns {Promise<Array<object>>} Evaluation results
 */
const evaluatePracticeAnswersWithGemini = async (submissions) => {
    const isEn = isAILangEnglish();
    const langName = getAILangName();

    const prompt = `Evaluate the student's Traditional Chinese translations for the following exercises.
Verify both semantic accuracy against the prompt and adherence to the required grammar formula.

Exercises and student submissions:
${JSON.stringify(submissions, null, 2)}

For each submission (preserving the exact "id"):
- "correcta": true if accurate and uses the target structure properly, false otherwise.
- "explicacion": Constructive feedback in ${langName} (1-2 concise sentences).
- "correccion": Ideal sentence in Taiwanese Traditional Chinese.
- "pinyin": Hanyu Pinyin with tone marks.
- "traduccion": Translation in ${langName}.`;

    const body = {
        systemInstruction: buildTaiwanSystemInstruction(isEn ? 'en' : 'es'),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        id: { type: "INTEGER" },
                        correcta: { type: "BOOLEAN" },
                        explicacion: { type: "STRING" },
                        correccion: { type: "STRING" },
                        pinyin: { type: "STRING" },
                        traduccion: { type: "STRING" }
                    },
                    required: ["id", "correcta", "explicacion", "correccion", "pinyin", "traduccion"]
                }
            },
            temperature: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.temperatures?.practiceEval) || 0.1,
            maxOutputTokens: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.maxTokens?.practiceEval) || 2048
        }
    };

    try {
        const candidate = await callGeminiAPI(body);
        return safeParseJSON(candidate);
    } catch (error) {
        console.error("Error evaluating practice answers:", error);
        throw error;
    }
};

/**
 * 4. SIMULADOR DE CONVERSACIÓN EN VIVO — Inicio de Diálogo
 * 
 * @param {Array<string>} words - List of known traditional Chinese vocabulary
 * @param {Array<object>} structures - List of all structures ({ nombre, formula })
 * @param {Array<object>} [targetStructures=[]] - Specific target structures to practice (max 5)
 * @returns {Promise<object>} Initial conversation setup and opening message
 */
const startConversationWithGemini = async (words, structures, targetStructures = []) => {
    const isEn = isAILangEnglish();
    const langName = getAILangName();
    const structSummary = formatStructuresForPrompt(structures, 30);

    let targetSection = '';
    if (Array.isArray(targetStructures) && targetStructures.length > 0) {
        const targetList = targetStructures.map(s => `- ${s.nombre}: ${s.formula}`).join('\n');
        targetSection = `
PRIORITY TARGET STRUCTURES FOR THIS SESSION:
The student specifically selected these structures to practice:
${targetList}
Design the scenario and your opening line so the student is naturally invited to reply using one of these structures right away.`;
    }

    const prompt = `Design the start of an engaging, realistic everyday conversation in Taiwan (e.g., ordering at a tea shop, meeting a classmate at NTNU, asking directions at an MRT station, shopping at a night market).
Language for scenario context and user role: ${langName}.

STUDENT LEVEL & VOCABULARY:
Use ONLY words from the student's known vocabulary below (plus basic courtesy expressions like 請問, 你好, 謝謝):
${words.slice(0, 180).join(', ')}

LEARNED GRAMMAR STRUCTURES:
${structSummary}
${targetSection}

Requirements:
1. "contexto": Brief setting description in ${langName} (1-2 sentences).
2. "rol_usuario": Student's role in ${langName} (e.g., Estudiante de intercambio en Taipéi / Exchange student in Taipei).
3. "interlocutor": Taiwanese partner name + role (e.g., 陳美玲 (Compañera taiwanesa) or 林老闆 (Dueño de tienda de té)).
4. "inicia_ai": true.
5. "primer_mensaje":
   - "texto": Natural opening greeting and question in Traditional Chinese (繁體中文) adapted to the student's vocabulary.
   - "pinyin": Hanyu Pinyin with tone marks for "texto".`;

    const body = {
        systemInstruction: buildTaiwanSystemInstruction(isEn ? 'en' : 'es'),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    contexto: { type: "STRING" },
                    rol_usuario: { type: "STRING" },
                    interlocutor: { type: "STRING" },
                    inicia_ai: { type: "BOOLEAN" },
                    primer_mensaje: {
                        type: "OBJECT",
                        properties: {
                            texto: { type: "STRING" },
                            pinyin: { type: "STRING" }
                        },
                        required: ["texto", "pinyin"]
                    }
                },
                required: ["contexto", "rol_usuario", "interlocutor", "inicia_ai", "primer_mensaje"]
            },
            temperature: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.temperatures?.convoStart) || 0.4,
            maxOutputTokens: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.maxTokens?.convoStart) || 2048
        }
    };

    try {
        const candidate = await callGeminiAPI(body);
        return safeParseJSON(candidate);
    } catch (error) {
        console.error("Error starting conversation with Gemini:", error);
        throw error;
    }
};

/**
 * 5. SIMULADOR DE CONVERSACIÓN EN VIVO — Continuación y Evaluación por Turno
 */
const continueConversationWithGemini = async (contexto, history, userReply, words, structures, targetStructures = []) => {
    const isEn = isAILangEnglish();
    const langName = getAILangName();
    const structSummary = formatStructuresForPrompt(structures, 25);

    const userTurnsCount = Array.isArray(history)
        ? history.filter(h => h.emisor === 'Estudiante').length
        : 1;

    let targetContinueSection = '';
    if (Array.isArray(targetStructures) && targetStructures.length > 0) {
        const targetList = targetStructures.map(s => `- ${s.nombre} (${s.formula})`).join('\n');
        targetContinueSection = `
TARGET STRUCTURES SELECTED BY STUDENT:
${targetList}
Check which of these structures the student has already practiced in the history, and steer your next question naturally so they can practice any remaining ones before concluding.`;
    }

    const prompt = `Continue the interactive Taiwanese Mandarin conversation and evaluate the student's latest message.
Language for feedback and summary: ${langName}.

Scenario context: ${contexto}
Completed student turns so far: ${userTurnsCount}

Recent dialogue history:
${JSON.stringify(history.slice(-8), null, 2)}

Student's latest message to evaluate:
"${userReply}"

Student's known vocabulary:
${words.slice(0, 180).join(', ')}

Learned grammar structures:
${structSummary}
${targetContinueSection}

Instructions:
1. Evaluate the student's latest message in "evaluacion_usuario":
   - "correcta": true if grammatically valid and contextually coherent, false if it has errors.
   - "estado":
     * "correcta" if natural and grammatically accurate.
     * "mejorable" if understandable and coherent, but slightly unnatural or missing a minor nuance/classifier.
     * "error" if grammatically broken, off-topic, or not in Chinese.
   - "comentario": Specific, encouraging feedback in ${langName} (1-2 sentences) explaining grammar/vocabulary usage.
   - "correccion": Best natural phrasing in Traditional Chinese for what the student wanted to say.
   - "pinyin": Hanyu Pinyin with tone marks for "correccion".
2. Decide whether the conversation should conclude ("terminada": true or false):
   - Keep "terminada": false for the first 3 student turns.
   - Set "terminada": true after 4 to 5 student turns (or once all target structures have been practiced and the dialogue reaches a natural closing).
3. In "respuesta_interlocutor":
   - If "terminada" is false: reply naturally in Traditional Chinese + Pinyin, asking a follow-up question that keeps the dialogue flowing within the student's vocabulary.
   - If "terminada" is true: give a warm, natural farewell in Traditional Chinese + Pinyin, and populate "evaluacion_final" with "puntuacion" (e.g. "9/10"), "resumen", "puntos_fuertes" (2 items), and "consejos" (1-2 actionable tips) in ${langName}.`;

    const body = {
        systemInstruction: buildTaiwanSystemInstruction(isEn ? 'en' : 'es'),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    evaluacion_usuario: {
                        type: "OBJECT",
                        properties: {
                            correcta: { type: "BOOLEAN" },
                            estado: { type: "STRING", enum: ["correcta", "mejorable", "error"] },
                            comentario: { type: "STRING" },
                            correccion: { type: "STRING" },
                            pinyin: { type: "STRING" }
                        },
                        required: ["correcta", "estado", "comentario", "correccion", "pinyin"]
                    },
                    terminada: { type: "BOOLEAN" },
                    respuesta_interlocutor: {
                        type: "OBJECT",
                        properties: {
                            texto: { type: "STRING" },
                            pinyin: { type: "STRING" }
                        },
                        required: ["texto", "pinyin"]
                    },
                    evaluacion_final: {
                        type: "OBJECT",
                        nullable: true,
                        properties: {
                            puntuacion: { type: "STRING" },
                            resumen: { type: "STRING" },
                            puntos_fuertes: { type: "ARRAY", items: { type: "STRING" } },
                            consejos: { type: "ARRAY", items: { type: "STRING" } }
                        },
                        required: ["puntuacion", "resumen", "puntos_fuertes", "consejos"]
                    }
                },
                required: ["evaluacion_usuario", "terminada", "respuesta_interlocutor"]
            },
            temperature: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.temperatures?.convoContinue) || 0.25,
            maxOutputTokens: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.maxTokens?.convoContinue) || 2560
        }
    };

    try {
        const candidate = await callGeminiAPI(body);
        return safeParseJSON(candidate);
    } catch (error) {
        console.error("Error continuing conversation with Gemini:", error);
        throw error;
    }
};

/**
 * 6. GENERADOR DE SIMULACIÓN DE EXAMEN OFICIAL (Fases 3 a 7)
 * Inmersión 100% en Chino Tradicional de Taiwán (estilo TOCFL Band A).
 */
const generateExamAIData = async (wordsList, structuresList) => {
    const wordsByCat = {};
    wordsList.slice(0, 180).forEach(w => {
        if (!w || !w.tradicional) return;
        const cat = w.categoria || 'vocabulario';
        if (!wordsByCat[cat]) wordsByCat[cat] = [];
        wordsByCat[cat].push(w.tradicional);
    });

    const wordsSummary = Object.entries(wordsByCat)
        .map(([cat, list]) => `- ${cat}: ${list.join(', ')}`)
        .join('\n');

    const structuresSummary = formatStructuresForPrompt(structuresList, 30);

    const prompt = `Diseña las Fases 3, 4, 5, 6 y 7 de un Examen Oficial Adaptativo estilo TOCFL (Test of Chinese as a Foreign Language - Taiwán).

REGLAS ESTRICTAS DE INMERSIÓN Y VOCABULARIO:
1. INMERSIÓN 100% EN CHINO TRADICIONAL (繁體中文):
   - Todas las oraciones, opciones, escenarios, preguntas e historia deben estar escritas ÚNICAMENTE en caracteres tradicionales de Taiwán.
   - NO incluyas pinyin ni traducciones dentro de las oraciones ni opciones del examen.
2. RESTRICCIÓN LÉXICA ESTRICTA:
   - Usa EXCLUSIVAMENTE las palabras del vocabulario del estudiante listadas abajo y las estructuras gramaticales aprendidas.

VOCABULARIO CONOCIDO DEL ESTUDIANTE (Agrupado por categoría):
${wordsSummary}

ESTRUCTURAS GRAMATICALES APRENDIDAS:
${structuresSummary}

ESPECIFICACIÓN DE CADA FASE A GENERAR:

- "fase3" (Completar espacios en blanco — exactamente 5 reactivos, id: 1..5):
  * 5 oraciones cotidianas en Taiwán donde falta exactamente 1 palabra clave del vocabulario del alumno, representada por "[ ___ ]".
  * IMPORTANTE: El contexto de la oración debe hacer inequívoca la palabra faltante (ej. si falta "喝", acompaña con "珍珠奶茶" o "烏龍茶"; si falta un clasificador como "碗", acompaña con "一 [ ___ ] 牛肉麵").
  * "palabra_faltante" debe ser exactamente la palabra o carácter que va en "[ ___ ]".

- "fase4" (Gramática y estructuras complejas — exactamente 10 reactivos, id: 1..10):
  * 10 oraciones con "[ ___ ]" que evalúen las estructuras gramaticales aprendidas (orden sintáctico, partículas 的/了/嗎/呢, clasificadores, ubicación con 在, negación 不 vs 沒, conectores o modales).
  * "opciones": array de exactamente 3 opciones en caracteres tradicionales.
  * IMPORTANTE: Solo 1 opción ("opcion_correcta") debe ser gramatical y semánticamente válida en esa oración; los otros 2 distractores deben ser claramente incorrectos en ese contexto para evitar ambigüedad.

- "fase5" (Preguntas abiertas en escenarios reales en Taiwán — exactamente 5 reactivos, id: 1..5):
  * 5 situaciones cotidianas en Taiwán ("escenario", ej. "在台北捷運站", "在夜市飲料店", "在大學教室", "在茶藝館", "跟台灣朋友聊天").
  * "pregunta": pregunta natural en chino tradicional dirigida al alumno.
  * "ejemplo_respuesta": oración completa modelo en chino tradicional que responde a la pregunta usando el vocabulario del alumno.

- "fase6" (Banco de 5 caracteres obligatorios — exactamente 5 preguntas, id: 1..5):
  * "banco_caracteres": selecciona 5 palabras/caracteres versátiles del vocabulario del alumno (ej. verbos, adverbios o partículas como 想, 很, 在, 有, 買, 去, 都, 喜歡).
  * "preguntas": 5 preguntas en chino tradicional (id: 1..5), cada una asignando uno de los 5 caracteres en "caracter_asignado" y su "ejemplo_respuesta".

- "fase7" (Comprensión lectora integral — Historia + 5 V/F + 5 Opción múltiple):
  * "historia": Un relato corto coherente e interesante de 90 a 150 caracteres en chino tradicional sobre la vida de un estudiante o familia en Taiwán, empleando el vocabulario y estructuras conocidas.
  * "verdadero_falso": 5 afirmaciones (id: 1..5) en chino tradicional basadas directamente en detalles de la historia ("es_verdadera": true o false, balanceando verdaderas y falsas).
  * "opcion_multiple": 5 preguntas de comprensión (id: 1..5) en chino tradicional sobre la historia, cada una con 3 "opciones" y su "respuesta_correcta" idéntica a una de las 3 opciones.`;

    const body = {
        systemInstruction: buildTaiwanSystemInstruction('es'),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    fase3: {
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
                    },
                    fase4: {
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
                    },
                    fase5: {
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
                    },
                    fase6: {
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
                    },
                    fase7: {
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
                    }
                },
                required: ["fase3", "fase4", "fase5", "fase6", "fase7"]
            },
            temperature: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.temperatures?.examGen) || 0.3,
            maxOutputTokens: (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ai?.maxTokens?.examGen) || 8192
        }
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const candidate = await callGeminiAPI(body);
            const parsed = safeParseJSON(candidate);
            if (!parsed || !parsed.fase3 || !parsed.fase4) {
                throw new Error("El formato del examen generado por Gemini es incompleto.");
            }
            parsed.fase3 = Array.isArray(parsed.fase3) ? parsed.fase3 : [];
            parsed.fase4 = Array.isArray(parsed.fase4) ? parsed.fase4 : [];
            parsed.fase5 = Array.isArray(parsed.fase5) ? parsed.fase5 : [];
            parsed.fase6 = parsed.fase6 && Array.isArray(parsed.fase6.preguntas) ? parsed.fase6 : { banco_caracteres: [], preguntas: [] };
            parsed.fase7 = parsed.fase7 && Array.isArray(parsed.fase7.verdadero_falso) ? parsed.fase7 : { historia: '', verdadero_falso: [], opcion_multiple: [] };

            return parsed;
        } catch (error) {
            console.warn(`Intento ${attempt} de generación de examen con Gemini falló:`, error.message);
            if (attempt === 2) {
                console.error("Error definitivo generando examen con Gemini:", error);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }
};

/**
 * 7. EVALUADOR DE RESPUESTAS ABIERTAS DEL EXAMEN (Fases 5 y 6)
 */
const evaluateExamAIAnswers = async (phase5Submissions, phase6Submissions) => {
    const isEn = isAILangEnglish();
    const langName = getAILangName();

    const prompt = `Evaluate the student's open-ended Traditional Chinese responses for Phase 5 and Phase 6 of the official exam.
Write all comments, translations, and the general summary in ${langName}.

GRADING RUBRIC:
- Phase 5 (Contextual Scenarios):
  * 1.0 pt ("es_correcta": true): Coherently answers the scenario question in grammatically valid Traditional Chinese.
  * 0.5 pts ("es_correcta": false): Understandable and relevant to the question, but contains minor grammar, word-order, or character errors.
  * 0.0 pts ("es_correcta": false): Blank, unrelated to the question, or not written in Chinese.
- Phase 6 (Forced Character Bank):
  * 1.0 pt ("es_correcta": true, "uso_caracter_banco": true): Coherently answers the question AND properly uses "caracter_asignado".
  * 0.5 pts ("es_correcta": false): Either answers the question well without "caracter_asignado", OR uses "caracter_asignado" with minor grammatical flaws.
  * 0.0 pts ("es_correcta": false): Blank, off-topic, or unintelligible.

SUBMISSIONS TO GRADE:
Phase 5 (Scenarios):
${JSON.stringify(phase5Submissions, null, 2)}

Phase 6 (Character Bank):
${JSON.stringify(phase6Submissions, null, 2)}

Provide for each item:
- Constructive pedagogical feedback in "comentario" (${langName}, 1-2 sentences).
- "correccion_sugerida" in Taiwanese Traditional Chinese (if the student's answer was empty, provide a model answer based on "ejemplo_respuesta").
- "pinyin_correccion" with tone marks.
- "traduccion_correccion" in ${langName}.`;

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
