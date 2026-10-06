/**
 * Vercel Serverless Function — Proxy para la API de Google Gemini
 * Permite ejecutar la IA de forma segura inyectando la variable de entorno GEMINI_API_KEY.
 */

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

    let model = (req.query && req.query.model) || 'gemini-2.0-flash';
    // Normalize or fallback if invalid model name was passed
    if (model.includes('3.1') || model.includes('lite')) {
        model = 'gemini-2.0-flash';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });

        // If 2.0-flash is not available, fallback to 1.5-flash
        if (!response.ok && response.status === 404 && model !== 'gemini-1.5-flash') {
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            response = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload
            });
        }

        const data = await response.json();
        if (!response.ok) {
            const errMsg = data.error?.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error || 'Error en Gemini API'));
            return res.status(response.status).json({ error: errMsg, details: data });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error('Error in /api/gemini proxy:', err);
        return res.status(500).json({ error: err.message || 'Error de conexión con la API de Gemini' });
    }
};
