let cachedWorkingModel = null;

const discoverWorkingModel = async (apiKey) => {
    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const res = await fetch(listUrl);
        if (!res.ok) return null;
        const data = await res.json();
        const available = (data.models || []).filter(m => 
            Array.isArray(m.supportedGenerationMethods) && 
            m.supportedGenerationMethods.includes('generateContent')
        );

        if (available.length === 0) return null;

        // Priority 1: Flash models (gemini-2.5-flash, gemini-3, etc.)
        const flashModel = available.find(m => m.name.includes('flash') && !m.name.includes('1.5') && !m.name.includes('2.0'));
        if (flashModel) return flashModel.name.replace(/^models\//, '');

        // Priority 2: Any flash model
        const anyFlash = available.find(m => m.name.includes('flash'));
        if (anyFlash) return anyFlash.name.replace(/^models\//, '');

        // Priority 3: First available model that supports generateContent
        return available[0].name.replace(/^models\//, '');
    } catch (e) {
        console.warn('Failed to query ListModels:', e);
        return null;
    }
};

module.exports = async (req, res) => {
    // Cabeceras CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-key'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-key'];
    if (!apiKey) {
        return res.status(500).json({
            error: 'Clave de Gemini no configurada en el servidor. Agrega la variable de entorno GEMINI_API_KEY en los ajustes de Vercel.'
        });
    }

    let model = cachedWorkingModel || (req.query && req.query.model) || 'gemini-2.5-flash';
    // If client sent an older/invalid model, default to 2.5-flash
    if (model.includes('1.5') || model.includes('2.0') || model.includes('3.1') || model.includes('lite')) {
        model = cachedWorkingModel || 'gemini-2.5-flash';
    }

    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    try {
        let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });

        // If the model was not found (404), discover the active supported models from Google
        if (!response.ok && response.status === 404) {
            console.log(`Model ${model} returned 404. Querying active models for this API key...`);
            const discovered = await discoverWorkingModel(apiKey);
            if (discovered && discovered !== model) {
                console.log(`Discovered active model: ${discovered}. Retrying...`);
                cachedWorkingModel = discovered;
                model = discovered;
                url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload
                });
            }
        }

        const data = await response.json();
        if (!response.ok) {
            const errMsg = data.error?.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error || 'Error en Gemini API'));
            return res.status(response.status).json({ error: errMsg, details: data });
        }

        // Cache the working model if it succeeded
        cachedWorkingModel = model;
        return res.status(200).json(data);
    } catch (err) {
        console.error('Error in /api/gemini proxy:', err);
        return res.status(500).json({ error: err.message || 'Error de conexión con la API de Gemini' });
    }
};
