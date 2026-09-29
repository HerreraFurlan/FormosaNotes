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
 * Calls Gemini 1.5 Flash to analyze a sentence.
 * Enforces JSON mode for structured output.
 * 
 * @param {string} sentence - The traditional Chinese sentence to check
 * @returns {Promise<Object>} The parsed JSON result
 */
const checkSentenceWithGemini = async (sentence) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("No hay clave de API configurada. Por favor, configura tu clave de Gemini.");
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

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
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Error en la API de Gemini: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract the text content from Gemini's response
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!candidate) {
            throw new Error("Respuesta inválida o vacía de Gemini.");
        }

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
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("No hay clave de API configurada. Por favor, configura tu clave de Gemini.");
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

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
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Error en la API de Gemini: ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidate) {
            throw new Error("Respuesta inválida o vacía de Gemini.");
        }

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
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("No hay clave de API configurada. Por favor, configura tu clave de Gemini.");
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

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
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Error en la API de Gemini: ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidate) {
            throw new Error("Respuesta inválida o vacía de Gemini.");
        }

        return JSON.parse(candidate);
    } catch (error) {
        console.error("Error evaluating practice answers:", error);
        throw error;
    }
};

/**
 * Initiates an interactive real-life Chinese dialogue simulation tailored to known words and structures.
 * 
 * @param {Array<string>} words - List of known traditional Chinese vocabulary
 * @param {Array<object>} structures - List of structures ({ nombre, formula })
 * @returns {Promise<object>} Initial conversation setup and opening message
 */
const startConversationWithGemini = async (words, structures) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("No hay clave de API configurada. Por favor, configura tu clave de Gemini.");
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `Eres un tutor experto de chino mandarín tradicional (Taiwán - estándar pedagógico MTC Dangdai).
Crea el inicio de una simulación de conversación interactiva cotidiana realista para un estudiante principiante.

Vocabulario y conceptos conocidos por el estudiante:
${words.join(', ')}

Estructuras gramaticales conocidas:
${JSON.stringify(structures.slice(0, 15).map(s => ({ nombre: s.nombre, formula: s.formula })))}

Tu tarea:
1. Diseña un escenario cotidiano verosímil y aleatorio en Taiwán (ej. en una cafetería, en la universidad, hablando de planes para el fin de semana, en un restaurante, etc.).
2. Define el nombre del interlocutor (ej. 安同, 田中, 白如玉, o un amigo local).
3. Decide si el interlocutor abre la conversación (inicia_ai: true) o si el usuario debe iniciar (inicia_ai: false).
4. Si inicia_ai es true:
   - Proporciona el primer mensaje del interlocutor en caracteres tradicionales, pinyin con tonos y traducción al español.
   - Da una instrucción clara y concisa al estudiante en español indicando qué debe responder o preguntar a continuación, sugiriendo alguna estructura o palabra clave.
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
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Error en la API de Gemini: ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidate) {
            throw new Error("Respuesta inválida o vacía de Gemini.");
        }

        return JSON.parse(candidate);
    } catch (error) {
        console.error("Error starting conversation with Gemini:", error);
        throw error;
    }
};

/**
 * Continues an ongoing dialogue: evaluates the user's sentence and generates the partner's reply.
 * 
 * @param {string} contexto - Description of the scenario
 * @param {Array<object>} history - Prior messages in the conversation
 * @param {string} userReply - The student's latest Chinese sentence
 * @param {Array<string>} words - List of known words
 * @param {Array<object>} structures - List of known structures
 * @returns {Promise<object>} Turn evaluation, next reply, and termination status
 */
const continueConversationWithGemini = async (contexto, history, userReply, words, structures) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error("No hay clave de API configurada. Por favor, configura tu clave de Gemini.");
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `Eres el interlocutor y tutor de chino mandarín tradicional (Taiwán - estándar MTC Dangdai).
Estás en una conversación cotidiana con un estudiante.

Escenario:
${contexto}

Historial de la conversación:
${JSON.stringify(history, null, 2)}

Último mensaje recibido del estudiante:
"${userReply}"

Vocabulario de referencia del estudiante:
${words.join(', ')}

Tareas:
1. Evalúa el mensaje del estudiante:
   - "correcta": boolean (true si es comprensible y gramaticalmente correcta).
   - "estado": "correcta" | "mejorable" | "error".
   - "comentario": Feedback pedagógico breve en español (1-2 oraciones).
   - "correccion": Oración en chino tradicional correcta o más natural.
   - "pinyin": Pinyin de la corrección.
   - "traduccion": Traducción de la corrección al español.
2. Decide si la conversación debe terminar ("terminada": true o false):
   - La conversación debe durar entre 3 y 5 intercambios del estudiante.
   - Marca "terminada": true cuando el diálogo llegue a una conclusión natural (ej. acuerdo en los planes, despedida cordial como 明天見, etc.).
3. Si "terminada" es false:
   - Genera la respuesta del interlocutor en caracteres tradicionales, su pinyin y traducción.
   - Proporciona la siguiente "instruccion_usuario" en español, indicando qué debe responder o preguntar el estudiante.
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
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Error en la API de Gemini: ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidate) {
            throw new Error("Respuesta inválida o vacía de Gemini.");
        }

        return JSON.parse(candidate);
    } catch (error) {
        console.error("Error continuing conversation with Gemini:", error);
        throw error;
    }
};

