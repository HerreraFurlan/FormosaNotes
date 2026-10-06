let cachedWorkingModel = null;

const CANDIDATE_MODELS = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash'
];

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

    // Determine initial model to try
    let requestedModel = (req.query && req.query.model) || '';
    if (requestedModel.includes('1.5') || requestedModel.includes('2.0') || requestedModel.includes('2.5-flash') && !requestedModel.includes('lite')) {
        requestedModel = '';
    }

    let modelToTry = cachedWorkingModel || requestedModel || 'gemini-3.8-flash';
    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    // Try candidates until success
    const modelsQueue = [modelToTry, ...CANDIDATE_MODELS.filter(m => m !== modelToTry)];

    for (const currentModel of modelsQueue) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload
            });

            const data = await response.json();

            if (response.ok) {
                cachedWorkingModel = currentModel;
                return res.status(200).json(data);
            }

            const errMsg = data.error?.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error || ''));

            // If Google explicitly suggests a model, try that suggested model next
            const match = errMsg.match(/use\s+models\/([\w\.\-]+)/i);
            if (match && match[1] && !modelsQueue.includes(match[1])) {
                console.log(`Google recommended model: ${match[1]}, adding to queue`);
                modelsQueue.splice(modelsQueue.indexOf(currentModel) + 1, 0, match[1]);
            }

            // If it's a model-not-found or deprecated error, loop continues to next candidate
            const isModelError = response.status === 404 || 
                                 errMsg.toLowerCase().includes('not found') || 
                                 errMsg.toLowerCase().includes('no longer available') ||
                                 errMsg.toLowerCase().includes('update your code');

            if (!isModelError) {
                // If it's quota, auth or syntax error, return it directly
                return res.status(response.status).json({ error: errMsg, details: data });
            }

            console.warn(`Model ${currentModel} failed (${errMsg}). Trying next candidate...`);
        } catch (err) {
            console.warn(`Network error with ${currentModel}:`, err.message);
        }
    }

    return res.status(500).json({ error: 'No se pudo conectar con ningún modelo de Gemini disponible.' });
};
