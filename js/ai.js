// Helper to check active language for AI interactions
const isAILangEnglish = () => {
    return (typeof I18N !== 'undefined' && typeof I18N.getLanguage === 'function')
        ? I18N.getLanguage() === 'en'
        : (typeof localStorage !== 'undefined' && localStorage.getItem('appchino_lang') === 'en');
};

/**
 * =====================================================
 * AppChino — ai.js
 * LLM Integration with Gemini API for sentence checking.
 * =====================================================
 */

const GEMINI_API_KEY_STORAGE = 'appchino_gemini_key';

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

/**
 * Centralized caller for Gemini API.
 * Uses /api/gemini (serverless proxy on Vercel) if available to protect API key,
 * falling back to client-side localStorage key if running locally or standalone.
 * 
 * @param {object} body - Request payload with contents and generationConfig
 * @param {string} model - Target Gemini model name
 * @returns {Promise<string>} The raw text response from the first candidate
 */
let clientCachedModel = null;

const CLIENT_CANDIDATE_MODELS = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite'
];

const callGeminiAPI = async (body, model = 'gemini-3.8-flash') => {
    const localKey = getGeminiApiKey();
    const isLocalFile = window.location.protocol === 'file:';
    const targetModel = clientCachedModel || model;

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
        throw new Error("No hay clave de API configurada. Configura la variable GEMINI_API_KEY en Vercel o en tu navegador.");
    }

    let initialModel = clientCachedModel || targetModel;
    const clientQueue = [initialModel, ...CLIENT_CANDIDATE_MODELS.filter(m => m !== initialModel)];

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
 * Removes markdown code fences, isolates outer JSON bounds, and handles trailing commas.
 * 
 * @param {string} text - Raw output from LLM
 * @returns {object|null} Parsed JSON object
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
        // Multi-stage auto-repair for Gemini formatting defects
        let s = clean;

        // Stage A: Remove trailing commas before closing braces or brackets
        s = s.replace(/,\s*([\]}])/g, '$1');

        // Stage B: Missing commas between adjacent objects: } { -> }, {
        s = s.replace(/}\s*\{/g, '}, {');

        // Stage C: Missing commas between adjacent arrays: ] [ -> ], [
        s = s.replace(/]\s*\[/g, '], [');

        // Stage D: Missing commas between strings in array: "A"\n"B" (not a key followed by :)
        s = s.replace(/(?<=")\s*\n\s*(?="(?![\w\s]+":))/g, ',\n');

        // Stage E: Missing comma after property value before next property key
        s = s.replace(/("|\d+|true|false|null|\]|\})\s*\n\s*(?="[\w]+":)/g, '$1,\n');

        try {
            return JSON.parse(s);
        } catch (_) {}

        // Stage F: Balance unclosed braces or brackets in case of token boundary truncation
        let openBraces = (s.match(/\{/g) || []).length - (s.match(/\}/g) || []).length;
        let openBrackets = (s.match(/\[/g) || []).length - (s.match(/\]/g) || []).length;

        // If an odd number of unescaped quotes, close the open string
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
        const traduccion = extractField('traduccion');

        if (explicacion || correccion) {
            return {
                correcta,
                explicacion: explicacion || (correcta ? 'La oración es sintácticamente correcta.' : 'Requiere revisión o ajuste.'),
                correccion: correccion || defaultSentence,
                traduccion: traduccion || ''
            };
        }
    } catch (e) {
        console.warn("parseSentenceCheckFallback error:", e);
    }
    return null;
};

/**
 * Calls Gemini to analyze a sentence.
 * Constrained with responseSchema, strict quote rules, and tight token limit (200 tokens)
 * to deliver ultra-short, deterministic explanations without syntax breakage.
 * 
 * @param {string} sentence - The traditional Chinese sentence to check
 * @returns {Promise<Object>} The parsed JSON result
 */
const checkSentenceWithGemini = async (sentence) => {
    const isEn = isAILangEnglish();
    const prompt = isEn ? `Traditional Mandarin Chinese teacher (Taiwan). Briefly evaluate this sentence: "${sentence}"

Your response must be EXCLUSIVELY the JSON object with nothing before or after.
Start directly with the character { and end with }. NEVER include introductory text (such as 'Here is the JSON') or markdown formatting.

Required format:
{
  "correcta": true or false,
  "explicacion": "A single short sentence in English",
  "correccion": "Corrected sentence in traditional Chinese",
  "traduccion": "English translation"
}

STRICT RULES:
1. FORBIDDEN to use quotation marks (neither double " nor single ') inside text values. Mention words or characters directly without quotes (example: The word 你 is unnecessary here).
2. "explicacion" MUST be ONE short sentence in English (maximum 15 words).
3. "traduccion" MUST be in English.
4. Return only the JSON object with nothing else.` : `Profesor de chino mandarín tradicional (Taiwán). Evalúa brevemente esta oración: "${sentence}"

Tu respuesta debe ser EXCLUSIVAMENTE el objeto JSON sin nada antes ni después.
Comienza directamente con el carácter { y termina con }. NUNCA incluyas frases introductorias (como 'Here is the JSON') ni formato markdown.

Formato requerido:
{
  "correcta": true o false,
  "explicacion": "Una sola oración breve",
  "correccion": "Oración en caracteres tradicionales",
  "traduccion": "Traducción en español"
}

REGLAS ESTRICTAS:
1. PROHIBIDO usar comillas (ni dobles " ni simples ') dentro de los valores de texto. Para mencionar palabras o caracteres escríbelos directamente sin comillas (ejemplo: La palabra 你 es innecesaria aquí).
2. "explicacion" DEBE ser de UNA SOLA oración corta (máximo 15 palabras).
3. Devuelve únicamente el objeto JSON sin nada más.`;

    const body = {
        contents: [
            {
                parts: [{ text: prompt }]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    correcta: { type: "BOOLEAN" },
                    explicacion: { type: "STRING", description: isEn ? "Single brief sentence in English of max 15 words, without quotes." : "Una sola oración breve de máximo 15 palabras, sin comillas." },
                    correccion: { type: "STRING", description: "Oración corregida en chino tradicional." },
                    traduccion: { type: "STRING", description: isEn ? "English translation." : "Traducción en español." }
                },
                required: ["correcta", "explicacion", "correccion", "traduccion"]
            },
            temperature: 0.1,
            maxOutputTokens: 2048
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
                explicacion: 'No se pudo evaluar detalladamente la oración.',
                correccion: sentence,
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
 * Generates 5 sentence challenges in Spanish based strictly on provided Chinese vocabulary
 * and 5 target structures.
 * 
 * @param {Array<string>} words - Focused list of traditional Chinese words known by the user
 * @param {Array<object>} structures - List of 5 structures ({ id, nombre, formula })
 * @returns {Promise<Array<object>>} 5 challenge objects
 */
const generatePracticeChallengesWithGemini = async (words, structures) => {
    const isEn = isAILangEnglish();
    const prompt = isEn ? `Traditional Mandarin Chinese teacher (Taiwan - MTC Dangdai pedagogical standard).
Formulate exactly 5 brief translation challenges in natural English to be written in traditional Chinese, assigning exactly one structure to each challenge.

Student reference vocabulary:
${words.join(', ')}

Target structures:
${JSON.stringify(structures, null, 2)}

Requirements:
1. Exactly 5 challenges (id: 1 to 5).
2. Each challenge must be a sentence in natural everyday English requiring the assigned structure.
3. "pista" must be a brief syntactic hint in English.
4. "vocabulario_clave" must be a list of 2 to 4 key words in traditional Chinese.

Return ONLY a JSON array with the 5 objects:
[
  {
    "id": 1,
    "estructura_id": "id_structure",
    "instruccion_espanol": "Sentence in English",
    "vocabulario_clave": ["詞1", "詞2"],
    "pista": "Brief hint in English"
  }
]` : `Profesor de chino mandarín tradicional (Taiwán - estándar pedagógico MTC Dangdai).
Formula exactamente 5 retos breves de traducción al español para escribir en chino tradicional, asignando exactamente una estructura a cada reto.

Vocabulario de referencia del alumno:
${words.join(', ')}

Estructuras objetivo:
${JSON.stringify(structures, null, 2)}

Requisitos:
1. Exactamente 5 retos (id: 1 al 5).
2. Cada reto debe ser una oración en español natural y cotidiana que requiera la estructura asignada.
3. "pista" debe ser un recordatorio sintáctico breve.
4. "vocabulario_clave" debe ser una lista de 2 a 4 palabras clave en chino tradicional.

Devuelve ÚNICAMENTE un array JSON con los 5 objetos:
[
  {
    "id": 1,
    "estructura_id": "id_estructura",
    "instruccion_espanol": "Oración en español",
    "vocabulario_clave": ["詞1", "詞2"],
    "pista": "Pista breve"
  }
]`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 2048
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
 * Evaluates student answers for sentence practice challenges.
 * 
 * @param {Array<object>} submissions - Array of objects with { id, instruccion_espanol, formula, respuesta_estudiante }
 * @returns {Promise<Array<object>>} Evaluation results
 */
const evaluatePracticeAnswersWithGemini = async (submissions) => {
    const isEn = isAILangEnglish();
    const prompt = isEn ? `Traditional Mandarin Chinese teacher (Taiwan - MTC Dangdai pedagogical standard).
Evaluate the answers for the following sentence construction/translation exercises. Be concise and direct (maximum 1-2 sentences in explanation).

Exercises and submitted answers:
${JSON.stringify(submissions, null, 2)}

Return ONLY a JSON array with evaluation objects (one for each submitted item, preserving the same "id"):
[
  {
    "id": 1,
    "correcta": true,
    "explicacion": "Concise explanation in English (1-2 sentences maximum)",
    "correccion": "In traditional Chinese characters",
    "pinyin": "Pinyin with tone marks",
    "traduccion": "English translation"
  }
]` : `Profesor de chino mandarín tradicional (Taiwán - estándar pedagógico MTC Dangdai).
Evalúa las respuestas de los siguientes ejercicios de construcción/traducción. Sé conciso y directo al grano (máximo 1-2 oraciones en explicación).

Ejercicios y respuestas entregadas:
${JSON.stringify(submissions, null, 2)}

Devuelve ÚNICAMENTE un array JSON con los objetos de evaluación (uno por cada elemento entregado, conservando el mismo "id"):
[
  {
    "id": 1,
    "correcta": true,
    "explicacion": "Explicación concisa (1-2 oraciones máximo)",
    "correccion": "En caracteres tradicionales",
    "pinyin": "Pinyin con marcas de tono",
    "traduccion": "Traducción al español"
  }
]`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 2048
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
 * Initiates an interactive real-life Chinese dialogue simulation tailored to known words and structures.
 * Optionally focuses on specific target structures (up to 5) that must be practiced during the dialogue.
 * 
 * @param {Array<string>} words - List of known traditional Chinese vocabulary
 * @param {Array<object>} structures - List of all structures ({ nombre, formula })
 * @param {Array<object>} [targetStructures=[]] - Specific target structures to practice (max 5)
 * @returns {Promise<object>} Initial conversation setup and opening message
 */
const startConversationWithGemini = async (words, structures, targetStructures = []) => {
    const isEn = isAILangEnglish();
    const langName = isEn ? 'English' : 'español';
    const structSummary = Array.isArray(structures) && structures.length > 0
        ? structures.map(s => `${s.nombre || ''}: ${s.formula || ''}`).filter(Boolean).join(' | ')
        : 'Estructuras elementales de mandarín';

    let targetSection = '';
    if (Array.isArray(targetStructures) && targetStructures.length > 0) {
        const targetList = targetStructures.map(s => `- ${s.nombre}: ${s.formula}`).join('\n');
        targetSection = `
TARGET STRUCTURES TO GUIDE THE CONVERSATION (NATURAL INVITATION):
The student aims to practice these structures during this session:
${targetList}
Lead the conversation naturally so the student can use them spontaneously.
`;
    }

    const prompt = `You are a conversational partner and tutor in Traditional Chinese (Taiwan - MTC Dangdai pedagogical standard).
Create the start of a realistic, natural everyday conversation in Taiwan.
Language for pedagogical notes/context: ${langName}.

STUDENT ADAPTIVE LEVEL:
The student's level is defined by their known vocabulary and learned grammar structures listed below.
Known words:
${words.join(', ')}

Learned grammar structures:
${structSummary}
${targetSection}

RULES:
1. Speak only in natural Traditional Chinese (繁體中文) appropriate for the student's level.
2. Keep sentences clear, authentic, and of moderate length.
3. This is a plain, natural conversation. Do NOT generate translations or turn goals.
4. The interlocutor opens the dialogue with a natural first message (greeting or situation opener in Traditional Chinese + pinyin).

Return ONLY a valid JSON object:
{
  "contexto": "Concise scenario description in ${langName}",
  "rol_usuario": "User role in ${langName} (e.g. Exchange student)",
  "interlocutor": "Partner name (e.g. 安同, 美玲)",
  "inicia_ai": true,
  "primer_mensaje": {
    "texto": "Opening greeting / sentence in Traditional Chinese",
    "pinyin": "Pinyin with tones"
  }
}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 2048
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

const continueConversationWithGemini = async (contexto, history, userReply, words, structures, targetStructures = []) => {
    const isEn = isAILangEnglish();
    const langName = isEn ? 'English' : 'español';
    const structSummary = Array.isArray(structures) && structures.length > 0
        ? structures.map(s => `${s.nombre || ''}: ${s.formula || ''}`).filter(Boolean).join(' | ')
        : 'Estructuras elementales de mandarín';

    let targetContinueSection = '';
    if (Array.isArray(targetStructures) && targetStructures.length > 0) {
        const targetList = targetStructures.map(s => `- ${s.nombre}: ${s.formula}`).join('\n');
        targetContinueSection = `
TARGET STRUCTURES:
${targetList}
Guide the dialogue naturally so remaining structures can be practiced.
`;
    }

    const prompt = `You are a conversational partner and tutor in Traditional Chinese (Taiwan - MTC Dangdai standard).
You are in a natural, plain everyday conversation with a student.
Language for comments and feedback: ${langName}.

Context:
${contexto}

Recent conversation history:
${JSON.stringify(history.slice(-8), null, 2)}

Latest message received from student:
"${userReply}"

Student vocabulary:
${words.join(', ')}

Student grammar structures:
${structSummary}
${targetContinueSection}

Tasks:
1. Evaluate student's message:
   - "correcta": boolean
   - "estado": "correcta" | "mejorable" | "error"
   - "comentario": brief constructive feedback in ${langName} (1-2 sentences)
   - "correccion": natural Traditional Chinese sentence adapted to their level (same text if already correct)
   - "pinyin": pinyin with tones for the correction
2. Decide if the conversation should conclude ("terminada": true or false, after 3-5 user turns or when reaching a natural conclusion).
3. If terminada is false:
   - "respuesta_interlocutor": { "texto": "natural reply in Traditional Chinese", "pinyin": "pinyin with tones" }
   - Plain conversation: NO translation, NO user goals/instructions.
4. If terminada is true:
   - "respuesta_interlocutor": { "texto": "farewell in Traditional Chinese", "pinyin": "pinyin with tones" }
   - "evaluacion_final": {
       "puntuacion": "Score (e.g. 9/10)",
       "resumen": "Brief overall summary in ${langName}",
       "puntos_fuertes": ["Strength 1 in ${langName}", "Strength 2 in ${langName}"],
       "consejos": ["Suggestion in ${langName}"]
     }

Return ONLY a valid JSON object:
{
  "evaluacion_usuario": {
    "correcta": true,
    "estado": "correcta",
    "comentario": "...",
    "correccion": "...",
    "pinyin": "..."
  },
  "terminada": false,
  "respuesta_interlocutor": {
    "texto": "...",
    "pinyin": "..."
  },
  "evaluacion_final": null
}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 2048
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

const generateExamAIData = async (wordsList, structuresList) => {
    const wordsSummary = wordsList.slice(0, 150).map(w => w.tradicional).join(', ');
    const structuresSummary = structuresList.slice(0, 25).map(s => `- ${s.patron} (${s.explicacion})`).join('\n');

    const prompt = `Eres un profesor experto de chino mandarín tradicional de Taiwán (繁體中文).
Estás diseñando una "Simulación de Examen" rigurosa pero justa para un estudiante, compuesta por 5 fases de evaluación.

REGLAS ABSOLUTAS DE IDIOMA Y CONTENIDO:
1. IDIOMA 100% EN CHINO TRADICIONAL (繁體中文):
   - NO incluyas pinyin ni traducciones al español en ninguna de las oraciones, opciones, preguntas, historias o escenarios.
   - El examen es de inmersión total en chino tradicional de Taiwán (繁體字), exactamente como un examen oficial (TOCFL).
2. VOCABULARIO Y ESTRUCTURAS:
   - Todas las oraciones, preguntas e historias deben construirse usando EXCLUSIVAMENTE el vocabulario conocido del estudiante y las estructuras aprendidas a continuación (o vocabulario elemental indispensable de cortesía en Taiwán).

VOCABULARIO CONOCIDO:
${wordsSummary}

ESTRUCTURAS GRAMATICALES APRENDIDAS:
${structuresSummary}

DEBES GENERAR LAS SIGUIENTES 5 FASES DEL EXAMEN (TODO EXCLUSIVAMENTE EN CHINO TRADICIONAL, SIN PINYIN Y SIN ESPAÑOL):

1. FASE 3 (Completar espacios en blanco - 5 oraciones directas):
   - 5 oraciones directas donde falta 1 palabra o carácter clave que el alumno debe escribir.
   - Marca el espacio faltante exactamente con "[ ___ ]".
   - Cada elemento debe tener:
     - "id": número 1 a 5
     - "oracion": oración en chino tradicional con "[ ___ ]" (ej. "我想去夜市 [ ___ ] 珍珠奶茶。")
     - "palabra_faltante": el carácter o palabra exacta faltante en chino tradicional (ej. "買")

2. FASE 4 (Opción múltiple con oraciones complejas - 10 oraciones):
   - 10 oraciones con "[ ___ ]", basadas en estructuras gramaticales más complejas o compuestas (ej. 因為...所以, 雖然...但是, clasificadores, adverbios o modales).
   - Ofrece exactamente 3 opciones de respuesta en caracteres tradicionales (A, B, C) por oración.
   - Cada elemento debe tener:
     - "id": número 1 a 10
     - "oracion": oración en chino tradicional con "[ ___ ]"
     - "opciones": array de exactamente 3 opciones en caracteres tradicionales (ej. ["但是", "因為", "所以"])
     - "opcion_correcta": string idéntico a una de las 3 opciones

3. FASE 5 (Preguntas abiertas contextuales en 5 escenarios cotidianos):
   - 5 escenarios realistas de la vida cotidiana en Taiwán descritos brevemente en chino tradicional, y 1 pregunta en chino tradicional para que el usuario responda con una oración simple en chino tradicional.
   - Cada elemento debe tener:
     - "id": número 1 a 5
     - "escenario": contexto breve en chino tradicional (ej. "在夜市飲料攤", "在茶藝館買茶", "在餐廳點菜", "跟朋友約週末時間", "在捷運站問路")
     - "pregunta": pregunta en chino tradicional (ej. "請問你想喝冰的還是溫的？")
     - "ejemplo_respuesta": respuesta modelo esperada en chino tradicional (ej. "我想喝冰的珍珠奶茶。")

4. FASE 6 (Uso forzado de banco de 5 caracteres fijos):
   - Proporciona un banco de exactamente 5 caracteres fijos conocidos (ej. ["想", "很", "在", "不", "都"]).
   - Genera 5 preguntas en chino tradicional. En cada pregunta, el alumno deberá responder con una oración en chino tradicional que utilice obligatoriamente el carácter asignado.
   - "banco_caracteres": array de 5 strings con los caracteres elegidos
   - "preguntas": array de 5 objetos con:
     - "id": número 1 a 5
     - "caracter_asignado": el carácter del banco que debe usar el estudiante
     - "pregunta": pregunta en chino tradicional
     - "ejemplo_respuesta": respuesta modelo en chino tradicional usando el carácter asignado

5. FASE 7 (Comprensión lectora - Historia corta + 5 V/F + 5 Opción múltiple):
   - Una historia corta y coherente (aprox. 80-140 caracteres) escrita en chino tradicional taiwanés sobre una situación cotidiana usando las palabras y estructuras del estudiante.
   - 5 afirmaciones de Verdadero o Falso en chino tradicional.
   - 5 preguntas de selección múltiple (A, B, C) con 3 opciones en caracteres tradicionales.
   - "historia": texto de la historia en caracteres tradicionales
   - "verdadero_falso": array de 5 objetos:
     - "id": número 1 a 5
     - "afirmacion": afirmación en chino tradicional
     - "es_verdadera": boolean (true o false)
   - "opcion_multiple": array de 5 objetos:
     - "id": número 1 a 5
     - "pregunta": pregunta en chino tradicional
     - "opciones": array de exactamente 3 opciones en caracteres tradicionales
     - "respuesta_correcta": string idéntico a una de las opciones

Devuelve ÚNICAMENTE un objeto JSON válido con las claves: "fase3", "fase4", "fase5", "fase6", "fase7".

REGLAS OBLIGATORIAS DE FORMATO JSON:
1. Devuelve EXCLUSIVAMENTE el objeto JSON crudo, sin bloques de código markdown (\`\`\`json) ni texto introductorio o final.
2. SINTAXIS JSON VÁLIDA Y COMAS OBLIGATORIAS:
   - CADA elemento dentro de arrays DEBE estar separado obligatoriamente por una coma (,). Ejemplo: ["A", "B", "C"].
   - CADA objeto dentro de arrays DEBE estar separado por una coma obligatoria (,). Ejemplo: [{"id": 1}, {"id": 2}].
3. DENTRO DE LOS TEXTOS EN CHINO:
   - NUNCA uses comillas dobles inglesas (") dentro de oraciones, afirmaciones o preguntas. Si necesitas citar, usa OBLIGATORIAMENTE comillas de esquina tradicionales (« » o 「 」) o comillas simples (' ').
   - NUNCA escapes corchetes con barras invertidas (usa exactamente [ ___ ], NUNCA \\[ ___ \\]).
   - NO insertes saltos de línea literales dentro de las cadenas.
4. Asegúrate de que todas las propiedades, llaves y corchetes estén perfectamente cerrados.`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 8192
        }
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const candidate = await callGeminiAPI(body);
            const parsed = safeParseJSON(candidate);
            if (!parsed || !parsed.fase3 || !parsed.fase4) {
                throw new Error("El formato del examen generado por Gemini es incompleto.");
            }
            // Normalize phases to ensure safe defaults
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
            // Pequeña pausa antes del reintento automático
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }
};

/**
 * Evaluates the user's free-form answers for Phase 5 and Phase 6 using Gemini.
 */
const evaluateExamAIAnswers = async (phase5Submissions, phase6Submissions) => {
    const isEn = isAILangEnglish();
    const langName = isEn ? 'English' : 'español';
    const prompt = `Eres un profesor evaluador de chino mandarín tradicional de Taiwán (繁體中文).
Debes evaluar las respuestas escritas por el alumno en dos fases abiertas de su examen.

CRITERIOS DE CALIFICACIÓN:
- Fase 5 (Respuestas simples en contexto):
  - Verifica si la oración responde coherentemente a la pregunta del escenario.
  - Verifica si es gramaticalmente correcta y natural en mandarín tradicional.
  - Puntaje: 1.0 (correcta), 0.5 (comprensible pero con pequeños errores léxicos/gramaticales), 0.0 (ininteligible, incorrecta o no responde).

- Fase 6 (Uso forzado de carácter del banco):
  - Verifica si la oración responde coherentemente a la pregunta.
  - OBLIGATORIO: Verifica si el estudiante incluyó y usó correctamente el "caracter_asignado".
  - Puntaje: 1.0 (responde y usa correctamente el caracter asignado), 0.5 (responde pero olvidó el caracter o lo usó con error menor), 0.0 (no responde o totalmente incorrecta).

ENTRADAS A EVALUAR:

Fase 5 (Escenarios cotidianos):
${JSON.stringify(phase5Submissions, null, 2)}

Fase 6 (Uso de caracteres del banco):
${JSON.stringify(phase6Submissions, null, 2)}

TAREAS:
1. Evalúa cada respuesta de la Fase 5.
2. Evalúa cada respuesta de la Fase 6.
3. Proporciona un breve balance general del desempeño del estudiante.

REGLAS DE FORMATO JSON:
- Devuelve únicamente el objeto JSON válido.
- En comentarios o correcciones, nunca uses comillas dobles dentro del texto; usa comillas simples (' ').
- No uses saltos de línea literales dentro de strings.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "fase5_evaluacion": [
    {
      "id": 1,
      "es_correcta": true,
      "puntaje": 1.0,
      "comentario": "Feedback constructivo en " + langName + " (1-2 sentences)",
      "correccion_sugerida": "Oración en caracteres tradicionales",
      "pinyin_correccion": "Pinyin con tonos",
      "traduccion_correccion": "Traducción / Translation in " + langName
    }
  ],
  "fase6_evaluacion": [
    {
      "id": 1,
      "es_correcta": true,
      "uso_caracter_banco": true,
      "puntaje": 1.0,
      "comentario": "Feedback constructivo en " + langName,
      "correccion_sugerida": "Oración en caracteres tradicionales",
      "pinyin_correccion": "Pinyin con tonos",
      "traduccion_correccion": "Traducción / Translation in " + langName
    }
  ],
  "resumen_general": "Breve balance pedagógico general en " + langName + " (2 sentences)"
}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 4000
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

