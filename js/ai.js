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
        return JSON.parse(candidate);
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
        return JSON.parse(candidate);
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
        return JSON.parse(candidate);
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
        return JSON.parse(candidate);
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
        return JSON.parse(candidate);
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
 * Helper to clean and parse JSON from LLM responses
 */
const safeParseJSON = (text) => {
    if (!text) return null;
    let clean = text.trim();
    if (clean.startsWith('```json')) {
        clean = clean.substring(7);
    } else if (clean.startsWith('```')) {
        clean = clean.substring(3);
    }
    if (clean.endsWith('```')) {
        clean = clean.substring(0, clean.length - 3);
    }
    clean = clean.trim();
    return JSON.parse(clean);
};

/**
 * Generates Phases 3, 4, 5, 6, and 7 of the Exam Simulation using Gemini.
 * Strictly adheres to known words and structures.
 * 
 * @param {Array<object>} wordsList - Known words
 * @param {Array<object>} structuresList - Known sentence structures
 * @returns {Promise<object>} Generated exam phases
 */
const generateExamAIData = async (wordsList, structuresList) => {
    const wordsSummary = wordsList.slice(0, 150).map(w => `${w.tradicional} (${w.pinyin || ''} - ${w.espanol || ''})`).join(', ');
    const structuresSummary = structuresList.slice(0, 25).map(s => `- ${s.titulo}: ${s.patron} (${s.explicacion})`).join('\n');

    const prompt = `Eres un profesor experto de chino mandarín tradicional de Taiwán (繁體中文).
Estás diseñando una "Simulación de Examen" rigurosa pero justa para un estudiante, compuesta por 5 fases específicas de evaluación.

REGLA ABSOLUTA DE VOCABULARIO Y GRAMÁTICA:
- Todas las oraciones, preguntas, opciones e historias deben construirse usando EXCLUSIVAMENTE el vocabulario conocido del estudiante y las estructuras gramaticales aprendidas a continuación (o vocabulario elemental de cortesía taiwanés indispensable).
- Usa caracteres tradicionales de Taiwán (繁體字).

VOCABULARIO CONOCIDO:
${wordsSummary}

ESTRUCTURAS GRAMATICALES APRENDIDAS:
${structuresSummary}

DEBES GENERAR LAS SIGUIENTES 5 FASES DEL EXAMEN:

1. FASE 3 (Completar espacios en blanco - 5 oraciones directas):
   - 5 oraciones simples o directas donde falta 1 palabra clave (carácter o término) que el alumno debe rellenar.
   - Marca el espacio faltante exactamente con "[ ___ ]".
   - Cada elemento debe tener:
     - "id": número 1 a 5
     - "oracion": oración con "[ ___ ]" (ej. "我 [ ___ ] 喝茶。")
     - "palabra_faltante": la palabra o caracter exacto faltante (ej. "想")
     - "pinyin_completo": pinyin con marcas de tono de la oración completa
     - "traduccion": traducción al español
     - "pista": breve pista en español si es necesario

2. FASE 4 (Opción múltiple con oraciones complejas - 10 oraciones):
   - 10 oraciones con partes faltantes en blanco "[ ___ ]", basadas en estructuras gramaticales más complejas o compuestas (ej. conectores como 因為...所以, 雖然...但是, clasificadores, adverbios o patrones modales).
   - Ofrece exactamente 3 opciones de respuesta (A, B, C) por oración.
   - Cada elemento debe tener:
     - "id": número 1 a 10
     - "oracion": oración con "[ ___ ]"
     - "opciones": array de exactamente 3 opciones en caracteres tradicionales (ej. ["但是", "因為", "所以"])
     - "opcion_correcta": string idéntico a una de las 3 opciones
     - "pinyin_completo": pinyin con tonos
     - "traduccion": traducción al español
     - "explicacion": explicación gramatical breve de por qué esa opción es la correcta

3. FASE 5 (Preguntas abiertas contextuales en 5 escenarios):
   - 5 escenarios realistas de la vida cotidiana en Taiwán (ej. pedir una bebida en una casa de té, consultar un precio en el mercado nocturno, hablar del clima, preguntar por el trabajo/estudio, presentarse).
   - Para cada escenario, 1 pregunta en chino tradicional para que el usuario responda con una oración simple.
   - Cada elemento debe tener:
     - "id": número 1 a 5
     - "escenario": descripción en español del contexto
     - "pregunta": pregunta en chino tradicional
     - "pinyin_pregunta": pinyin con tonos
     - "traduccion_pregunta": traducción de la pregunta al español
     - "ejemplo_respuesta": una respuesta modelo esperada acorde al nivel

4. FASE 6 (Uso forzado de banco de caracteres fijos):
   - Proporciona un banco de exactamente 5 caracteres fijos conocidos (ej. ["想", "很", "在", "不", "都"] u otros caracteres frecuentes de su biblioteca).
   - Genera 5 preguntas en chino tradicional. En cada pregunta, el alumno deberá responder con una oración que utilice obligatoriamente uno de los caracteres del banco (idealmente cubriendo los 5).
   - "banco_caracteres": array de 5 strings con los caracteres elegidos
   - "preguntas": array de 5 objetos con:
     - "id": número 1 a 5
     - "caracter_asignado": el carácter del banco que debe usar el estudiante en esta pregunta
     - "pregunta": pregunta en chino tradicional
     - "pinyin_pregunta": pinyin con tonos
     - "traduccion_pregunta": traducción al español
     - "ejemplo_respuesta": respuesta modelo usando el carácter asignado

5. FASE 7 (Comprensión lectora - Historia corta + 5 V/F + 5 Opción múltiple):
   - Una historia corta y coherente (aprox. 80-140 caracteres) escrita en chino tradicional taiwanés sobre una situación cotidiana usando las palabras y estructuras del estudiante.
   - 5 afirmaciones de Verdadero o Falso sobre la historia.
   - 5 preguntas de selección múltiple (A, B, C) con 3 opciones sobre la historia.
   - "historia": texto de la historia en caracteres tradicionales
   - "pinyin_historia": pinyin con tonos de toda la historia
   - "traduccion_historia": traducción completa al español
   - "verdadero_falso": array de 5 objetos:
     - "id": número 1 a 5
     - "afirmacion": afirmación en chino tradicional
     - "pinyin": pinyin con tonos
     - "traduccion": traducción al español
     - "es_verdadera": boolean (true o false)
     - "explicacion": por qué es verdadera o falsa según la historia
   - "opcion_multiple": array de 5 objetos:
     - "id": número 1 a 5
     - "pregunta": pregunta en chino tradicional
     - "pinyin": pinyin con tonos
     - "traduccion": traducción al español
     - "opciones": array de exactamente 3 opciones (strings)
     - "respuesta_correcta": string idéntico a una de las opciones
     - "explicacion": breve justificación

Devuelve ÚNICAMENTE un objeto JSON válido con las claves: "fase3", "fase4", "fase5", "fase6", "fase7".`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
            maxOutputTokens: 4000
        }
    };

    try {
        const candidate = await callGeminiAPI(body);
        const parsed = safeParseJSON(candidate);
        if (!parsed || !parsed.fase3 || !parsed.fase4 || !parsed.fase5 || !parsed.fase6 || !parsed.fase7) {
            throw new Error("El formato del examen generado por Gemini es incompleto.");
        }
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
            maxOutputTokens: 2000
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

