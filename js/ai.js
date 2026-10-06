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
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
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
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
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
 * Robust helper to clean, repair, and parse JSON from LLM responses.
 * Handles:
 * - Markdown fences (```json ... ```) or conversational commentary
 * - Unescaped literal control characters (newlines, carriage returns, tabs) inside strings
 * - Invalid backslash escapes (e.g. \[ or \] or \ )
 * - Unescaped double quotes inside string values (e.g. "pista": "Usa la palabra "我"...")
 * - Trailing commas before closing brackets or braces
 * - Truncated JSON recovery (automatically closes open quotes, brackets, and braces)
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

    // Attempt 1: Direct JSON.parse
    try {
        return JSON.parse(clean);
    } catch (err1) {
        console.warn("safeParseJSON: Intento directo falló, aplicando reparaciones:", err1.message);
    }

    // Attempt 2: Fix control characters inside strings & invalid backslash escapes
    const repairedChars = [];
    let inString = false;
    let isEscaped = false;
    let i = 0;
    while (i < clean.length) {
        const c = clean[i];
        if (c === '"' && !isEscaped) {
            inString = !inString;
            repairedChars.push(c);
        } else if (inString) {
            if (c === '\\') {
                if (i + 1 < clean.length) {
                    const nextC = clean[i + 1];
                    // Valid JSON escape characters: " \ / b f n r t u
                    if (['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'].includes(nextC)) {
                        repairedChars.push(c);
                        repairedChars.push(nextC);
                        i += 2;
                        continue;
                    } else {
                        // Invalid escape sequence like \[ or \] - drop backslash
                        repairedChars.push(nextC);
                        i += 2;
                        continue;
                    }
                }
            } else if (c === '\n') {
                repairedChars.push('\\n');
            } else if (c === '\r') {
                repairedChars.push('\\r');
            } else if (c === '\t') {
                repairedChars.push('\\t');
            } else {
                repairedChars.push(c);
            }
        } else {
            repairedChars.push(c);
        }
        isEscaped = (c === '\\' && !isEscaped);
        i++;
    }

    let cleanStep2 = repairedChars.join('');
    // Remove trailing commas: ,] or ,}
    cleanStep2 = cleanStep2.replace(/,\s*([\]}])/g, '$1');

    try {
        return JSON.parse(cleanStep2);
    } catch (err2) {
        console.warn("safeParseJSON: Intento 2 (escapes/saltos) falló:", err2.message);
    }

    // Attempt 3: Fix unescaped inner quotes on property lines
    // Example: "pista": "Usa la palabra "我" para esto",
    const lines = cleanStep2.split('\n');
    const fixedLines = lines.map(line => {
        const propMatch = line.match(/^(\s*"[^"]+"\s*:\s*")(.*)("\s*,?\s*)$/);
        if (propMatch) {
            const prefix = propMatch[1];
            const inner = propMatch[2];
            const suffix = propMatch[3];
            // Replace any unescaped double quote inside inner with single quote
            const fixedInner = inner.replace(/(?<!\\)"/g, "'");
            return prefix + fixedInner + suffix;
        }
        return line;
    });

    let cleanStep3 = fixedLines.join('\n');
    cleanStep3 = cleanStep3.replace(/,\s*([\]}])/g, '$1');

    try {
        return JSON.parse(cleanStep3);
    } catch (err3) {
        console.warn("safeParseJSON: Intento 3 (comillas internas) falló:", err3.message);
    }

    // Attempt 4: Truncated JSON recovery (close unclosed quotes, brackets, braces)
    let cleanStep4 = cleanStep3.trim();
    if (cleanStep4.endsWith(',')) {
        cleanStep4 = cleanStep4.slice(0, -1).trim();
    }
    const quoteMatches = cleanStep4.match(/(?<!\\)"/g) || [];
    if (quoteMatches.length % 2 !== 0) {
        cleanStep4 += '"';
    }
    const openBrackets = (cleanStep4.match(/\[/g) || []).length - (cleanStep4.match(/\]/g) || []).length;
    const openBraces = (cleanStep4.match(/\{/g) || []).length - (cleanStep4.match(/\}/g) || []).length;
    cleanStep4 += ']'.repeat(Math.max(0, openBrackets));
    cleanStep4 += '}'.repeat(Math.max(0, openBraces));
    cleanStep4 = cleanStep4.replace(/,\s*([\]}])/g, '$1');

    try {
        return JSON.parse(cleanStep4);
    } catch (err4) {
        console.error("safeParseJSON: Fallaron todos los intentos de parseo y reparación.", err4.message, "\nTexto recibido:", text);
        throw err4;
    }
};

/**
 * Calls Gemini to analyze a sentence.
 * Enforces JSON mode for structured output.
 * 
 * @param {string} sentence - The traditional Chinese sentence to check
 * @returns {Promise<Object>} The parsed JSON result
 */
const checkSentenceWithGemini = async (sentence) => {
    const prompt = `Eres un profesor experto de chino mandarín tradicional (Taiwán). Revisa esta oración: "${sentence}"

    Devuelve ÚNICAMENTE un objeto JSON válido con las siguientes claves:
    - "correcta": un booleano (true o false) indicando si la sintaxis y gramática son naturales y correctas.
    - "explicacion": una cadena breve (máximo 2 oraciones) explicando por qué es correcta o qué errores tiene.
    - "correccion": si es incorrecta o poco natural, proporciona la versión correcta en chino tradicional. Si es correcta, devuelve la misma oración original o una versión ligeramente más natural.
    - "traduccion": la traducción al español.

    No incluyas comillas dobles sin escapar dentro de las explicaciones; si necesitas citar palabras usa comillas simples (' ').
    No incluyas formato markdown \`\`\`json, solo devuelve el objeto crudo.`;

    const body = {
        contents: [
            {
                parts: [{ text: prompt }]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 500
        }
    };

    try {
        const candidate = await callGeminiAPI(body);
        return safeParseJSON(candidate);
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
    const prompt = `Profesor de chino mandarín tradicional (Taiwán - estándar pedagógico MTC Dangdai).
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
            maxOutputTokens: 700
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
    const prompt = `Profesor de chino mandarín tradicional (Taiwán - estándar pedagógico MTC Dangdai).
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
            maxOutputTokens: 900
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
    const structSummary = Array.isArray(structures) && structures.length > 0
        ? structures.map(s => `${s.nombre || ''}: ${s.formula || ''}`).filter(Boolean).join(' | ')
        : 'Estructuras elementales de mandarín';

    let targetSection = '';
    if (Array.isArray(targetStructures) && targetStructures.length > 0) {
        const targetList = targetStructures.map(s => `- ${s.nombre}: ${s.formula}`).join('\n');
        targetSection = `
ESTRUCTURAS OBJETIVO QUE EL ESTUDIANTE DEBE PRACTICAR OBLIGATORIAMENTE:
El estudiante ha seleccionado estas ${targetStructures.length} estructuras específicas para esta sesión:
${targetList}

MISIÓN DE FLUJO:
Conduce la conversación cotidiana de forma natural para que el estudiante deba emplear CADA UNA de estas ${targetStructures.length} estructuras al menos una vez durante el diálogo.
En este primer turno, diseña tu primer mensaje o tu "instruccion_usuario" para orientar al estudiante a usar la primera de estas estructuras.
`;
    } else {
        targetSection = `
MODO LIBRE:
El estudiante practicará de forma libre utilizando cualquiera de las estructuras gramaticales aprendidas.
`;
    }

    const prompt = `Eres un tutor y compañero de conversación de chino mandarín tradicional (Taiwán - estándar pedagógico MTC Dangdai).
Crea el inicio de una simulación de conversación cotidiana realista y dinámica para un estudiante.

NIVEL ADAPTATIVO DEL ESTUDIANTE:
El nivel del estudiante es DINÁMICO y se define estrictamente por su biblioteca actual: el vocabulario conocido y las estructuras gramaticales aprendidas listadas abajo. A medida que el estudiante incorpore nuevas palabras y estructuras a su biblioteca, su nivel de diálogo se adaptará automáticamente a sus nuevos conocimientos.

REGLAS DE ADAPTABILIDAD:
1. Vocabulario:
   - Prioridad máxima a las palabras conocidas del estudiante.
   - Tienes libertad para incorporar términos cotidianos adicionales únicamente si son indispensables para la naturalidad de la situación (máximo 1 término extra por turno), pero SIEMPRE que una idea se pueda expresar con el vocabulario ya registrado, ES OBLIGATORIO usar lo ya aprendido.
2. Gramática:
   - Limita el diálogo y tus construcciones a las estructuras gramaticales aprendidas por el estudiante (o estructuras elementales derivadas directamente de ellas).
   - NUNCA introduzcas construcciones gramaticales complejas o avanzadas que no figuren entre las estructuras conocidas ni se puedan deducir de su biblioteca actual.
   - Mantén las oraciones del interlocutor claras, naturales y de longitud moderada, acordes al repertorio actual del estudiante.
3. Instrucciones guiadas:
   - Da instrucciones claras y alcanzables al estudiante basadas en el vocabulario y estructuras que domina.
${targetSection}
Vocabulario conocido por el estudiante:
${words.join(', ')}

Estructuras gramaticales aprendidas por el estudiante:
${structSummary}

Tu tarea:
1. Diseña un escenario cotidiano verosímil y aleatorio en Taiwán (ej. en una cafetería, en la universidad, hablando de planes para el fin de semana, en un restaurante, etc.).
2. Define el nombre del interlocutor (ej. 安同, 田中, 白如玉, o un amigo local).
3. Decide si el interlocutor abre la conversación (inicia_ai: true) o si el usuario debe iniciar (inicia_ai: false).
4. Si inicia_ai es true:
   - Proporciona el primer mensaje del interlocutor en caracteres tradicionales, pinyin con tonos y traducción al español, respetando las palabras y estructuras aprendidas.
   - Da una instrucción clara y concisa al estudiante en español indicando qué debe responder o preguntar a continuación.
5. Si inicia_ai es false:
   - Da una instrucción inicial en español al estudiante para que comience el diálogo.

Devuelve ÚNICAMENTE un objeto JSON válido con este formato:
{
  "contexto": "Descripción concisa del escenario en español",
  "rol_usuario": "Tu rol (ej. Estudiante de intercambio)",
  "interlocutor": "Nombre del interlocutor",
  "inicia_ai": true,
  "primer_mensaje": {
    "texto": "Mensaje en chino tradicional",
    "pinyin": "Pinyin con tonos",
    "traduccion": "Traducción al español",
    "instruccion_usuario": "Instrucción específica en español de lo que debe responder o preguntar el estudiante"
  },
  "instruccion_inicial": ""
}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 600
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
 * Continues an ongoing dialogue: evaluates the user's sentence and generates the partner's reply.
 * Optionally guides the student to practice specific target structures.
 * 
 * @param {string} contexto - Description of the scenario
 * @param {Array<object>} history - Prior messages in the conversation
 * @param {string} userReply - The student's latest Chinese sentence
 * @param {Array<string>} words - List of known words
 * @param {Array<object>} structures - List of known structures
 * @param {Array<object>} [targetStructures=[]] - Target structures to practice (max 5)
 * @returns {Promise<object>} Turn evaluation, next reply, and termination status
 */
const continueConversationWithGemini = async (contexto, history, userReply, words, structures, targetStructures = []) => {
    const structSummary = Array.isArray(structures) && structures.length > 0
        ? structures.map(s => `${s.nombre || ''}: ${s.formula || ''}`).filter(Boolean).join(' | ')
        : 'Estructuras elementales de mandarín';

    let targetContinueSection = '';
    if (Array.isArray(targetStructures) && targetStructures.length > 0) {
        const targetList = targetStructures.map(s => `- ${s.nombre}: ${s.formula}`).join('\n');
        targetContinueSection = `
ESTRUCTURAS OBJETIVO A PRACTICAR EN ESTA SESIÓN (EL ESTUDIANTE DEBE PRACTICAR CADA UNA AL MENOS UNA VEZ):
${targetList}

Instrucción de flujo:
- Conduce la conversación y diseña la siguiente "instruccion_usuario" para que el estudiante ponga en práctica las estructuras objetivo que aún no haya utilizado.
- En "evaluacion_usuario", confirma amablemente si el estudiante logró emplear la estructura objetivo solicitada.
- La conversación NO debe terminar ("terminada": false) hasta que el estudiante haya tenido la oportunidad de practicar las ${targetStructures.length} estructuras objetivo seleccionadas.
`;
    } else {
        targetContinueSection = `
MODO LIBRE:
La conversación debe durar entre 3 y 5 intercambios del estudiante y llegar a una conclusión natural.
`;
    }

    const prompt = `Eres el interlocutor y tutor de chino mandarín tradicional (Taiwán - estándar MTC Dangdai).
Estás en una conversación cotidiana con un estudiante.

NIVEL ADAPTATIVO DEL ESTUDIANTE:
El nivel del estudiante es DINÁMICO y se define estrictamente por su biblioteca actual: el vocabulario conocido y las estructuras gramaticales aprendidas listadas abajo. A medida que el estudiante incorpore nuevas palabras y estructuras a su biblioteca, su nivel de diálogo se adaptará automáticamente a sus nuevos conocimientos.

REGLAS DE ADAPTABILIDAD:
1. Vocabulario:
   - Prioridad máxima a las palabras conocidas del estudiante.
   - Tienes libertad para incorporar términos cotidianos adicionales únicamente si son indispensables para la naturalidad de la situación (máximo 1 término extra por turno), pero SIEMPRE que una idea se pueda expresar con el vocabulario ya registrado, ES OBLIGATORIO usar lo ya aprendido.
2. Gramática:
   - Limita tus respuestas, réplicas y construcciones a las estructuras gramaticales aprendidas por el estudiante (o estructuras elementales derivadas directamente de ellas).
   - NUNCA introduzcas construcciones gramaticales complejas o avanzadas que no figuren entre las estructuras conocidas ni se puedan deducir de su biblioteca actual.
   - Mantén las oraciones del interlocutor claras, naturales y de longitud moderada, acordes al repertorio actual del estudiante.
3. Correcciones pedagógicas adaptativas:
   - En "correccion": ofrece una versión natural y correcta basada en las palabras y estructuras que el estudiante ya domina o tiene en su biblioteca. NO corrijas introduciendo conectores o gramática desconocida a menos que sea estrictamente necesario, priorizando fórmulas y conectores ya registrados.
${targetContinueSection}
Escenario:
${contexto}

Historial de la conversación:
${JSON.stringify(history, null, 2)}

Último mensaje recibido del estudiante:
"${userReply}"

Vocabulario conocido por el estudiante:
${words.join(', ')}

Estructuras gramaticales aprendidas por el estudiante:
${structSummary}

Tareas:
1. Evalúa el mensaje del estudiante:
   - "correcta": boolean (true si es comprensible y gramaticalmente correcta acorde a su nivel).
   - "estado": "correcta" | "mejorable" | "error".
   - "comentario": Feedback pedagógico breve en español (1-2 oraciones).
   - "correccion": Oración en chino tradicional correcta y natural adaptada a su biblioteca.
   - "pinyin": Pinyin de la corrección.
   - "traduccion": Traducción de la corrección al español.
2. Decide si la conversación debe terminar ("terminada": true o false):
   - Marca "terminada": true cuando el diálogo llegue a una conclusión natural y se hayan cubierto las estructuras objetivo.
3. Si "terminada" es false:
   - Genera la respuesta del interlocutor en caracteres tradicionales, su pinyin y traducción, respetando las palabras y estructuras aprendidas.
   - Proporciona la siguiente "instruccion_usuario" en español, indicando qué debe responder o preguntar el estudiante basándose en su repertorio.
4. Si "terminada" es true:
   - Genera la despedida final del interlocutor en chino tradicional, pinyin y traducción.
   - Proporciona una "evaluacion_final" de toda la conversación:
     - "puntuacion": ej. "9/10" o "Excelente"
     - "resumen": 2 oraciones de balance general sobre la conversación.
     - "puntos_fuertes": lista de 2-3 aciertos.
     - "consejos": 1-2 sugerencias para mejorar.

Devuelve ÚNICAMENTE un objeto JSON válido:
{
  "evaluacion_usuario": {
    "correcta": true,
    "estado": "correcta",
    "comentario": "...",
    "correccion": "...",
    "pinyin": "...",
    "traduccion": "..."
  },
  "terminada": false,
  "respuesta_interlocutor": {
    "texto": "...",
    "pinyin": "...",
    "traduccion": "...",
    "instruccion_usuario": "..."
  },
  "evaluacion_final": null
}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 700
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
 * ==========================================================
 * SIMULACIÓN DE EXAMEN — AI GENERATION & EVALUATION
 * ==========================================================
 */

/**
 * Generates Phases 3, 4, 5, 6, and 7 of the Exam Simulation using Gemini.
 * Strictly adheres to known words and structures.
 * 
 * @param {Array<object>} wordsList - Known words
 * @param {Array<object>} structuresList - Known sentence structures
 * @returns {Promise<object>} Generated exam phases
 */
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
2. DENTRO DE LOS TEXTOS:
   - NUNCA uses comillas dobles (") para citar palabras o caracteres chinos. Si necesitas citar, usa comillas simples (' ') o comillas angulares (« »).
   - NUNCA escapes corchetes con barras invertidas (usa exactamente [ ___ ], NUNCA \\[ ___ \\]).
   - NO insertes saltos de línea literales dentro de las cadenas.
3. Asegúrate de que todas las propiedades, llaves y corchetes estén perfectamente cerrados.`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 8192
        }
    };

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
        console.error("Error generating exam data with Gemini:", error);
        throw error;
    }
};

/**
 * Evaluates the user's free-form answers for Phase 5 and Phase 6 using Gemini.
 * 
 * @param {Array<object>} phase5Submissions - Array of { id, escenario, pregunta, respuesta_usuario }
 * @param {Array<object>} phase6Submissions - Array of { id, caracter_asignado, pregunta, respuesta_usuario }
 * @returns {Promise<object>} Evaluation results with scores and pedagogical comments
 */
const evaluateExamAIAnswers = async (phase5Submissions, phase6Submissions) => {
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
      "comentario": "Feedback constructivo en español (1-2 oraciones)",
      "correccion_sugerida": "Oración en caracteres tradicionales",
      "pinyin_correccion": "Pinyin con tonos",
      "traduccion_correccion": "Traducción al español"
    }
  ],
  "fase6_evaluacion": [
    {
      "id": 1,
      "es_correcta": true,
      "uso_caracter_banco": true,
      "puntaje": 1.0,
      "comentario": "Feedback constructivo en español",
      "correccion_sugerida": "Oración en caracteres tradicionales",
      "pinyin_correccion": "Pinyin con tonos",
      "traduccion_correccion": "Traducción al español"
    }
  ],
  "resumen_general": "Breve balance pedagógico general (2 oraciones)"
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

