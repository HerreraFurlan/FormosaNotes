/**
 * =====================================================
 * AppChino — practice.js
 * Practice Mode:
 * 1. Sentence Construction Challenges (5 exercises generated
 *    from known vocabulary and random structures).
 * 2. Interactive Real-life Conversation Simulator (turn-by-turn
 *    dialogue in Taiwan contexts with immediate sentence evaluation).
 * =====================================================
 */

const PRACTICE_STORAGE_KEY = 'appchino_practice_state_v1';
const CONVERSATION_STORAGE_KEY = 'appchino_conversation_state_v1';
const PRACTICE_TAB_KEY = 'appchino_practice_tab_v1';
const CONVO_MODE_KEY = 'appchino_convo_mode_v1';
const CONVO_TARGET_STRUCTS_KEY = 'appchino_convo_target_structs_v1';

// Tab state: 'retos' | 'conversacion'
let activePracticeTab = 'retos';

// ------------------------------------------------------
// State: Sentence Challenges
// ------------------------------------------------------
let practiceChallenges = [];
let practiceAnswers = {};
let practiceEvaluations = {};
let isPracticeGenerating = false;
let isPracticeEvaluating = false;

// ------------------------------------------------------
// State: Interactive Conversation
// ------------------------------------------------------
let convoTargetMode = 'libre'; // 'libre' | 'especifico'
let selectedTargetStructureIds = []; // max 5
let structFilterSearch = '';

let conversationSession = {
    active: false,
    contexto: '',
    rol_usuario: '',
    interlocutor: '',
    history: [],
    currentPrompt: '',
    targetStructures: [],
    terminada: false,
    evaluacion_final: null
};
let isConversationLoading = false;

/**
 * Loads cached practice and conversation sessions from sessionStorage.
 */
const loadPracticeState = () => {
    try {
        const savedTab = sessionStorage.getItem(PRACTICE_TAB_KEY);
        if (savedTab === 'conversacion' || savedTab === 'retos') {
            activePracticeTab = savedTab;
        }

        const savedMode = sessionStorage.getItem(CONVO_MODE_KEY);
        if (savedMode === 'libre' || savedMode === 'especifico') {
            convoTargetMode = savedMode;
        }

        const savedStructs = sessionStorage.getItem(CONVO_TARGET_STRUCTS_KEY);
        if (savedStructs) {
            selectedTargetStructureIds = JSON.parse(savedStructs) || [];
        }

        const savedChallenges = sessionStorage.getItem(PRACTICE_STORAGE_KEY);
        if (savedChallenges) {
            const data = JSON.parse(savedChallenges);
            practiceChallenges = data.challenges || [];
            practiceAnswers = data.answers || {};
            practiceEvaluations = data.evaluations || {};
        }

        const savedConvo = sessionStorage.getItem(CONVERSATION_STORAGE_KEY);
        if (savedConvo) {
            conversationSession = JSON.parse(savedConvo);
        }
    } catch (e) {
        console.warn("No se pudo cargar el estado de práctica:", e);
    }
};

const saveConvoSettings = () => {
    try {
        sessionStorage.setItem(CONVO_MODE_KEY, convoTargetMode);
        sessionStorage.setItem(CONVO_TARGET_STRUCTS_KEY, JSON.stringify(selectedTargetStructureIds));
    } catch (e) {
        console.warn("No se pudo guardar la configuración de conversación:", e);
    }
};

/**
 * Saves sentence challenges session to sessionStorage.
 */
const savePracticeState = () => {
    try {
        sessionStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify({
            challenges: practiceChallenges,
            answers: practiceAnswers,
            evaluations: practiceEvaluations
        }));
    } catch (e) {
        console.warn("No se pudo guardar el estado de retos:", e);
    }
};

/**
 * Saves conversation session to sessionStorage.
 */
const saveConversationState = () => {
    try {
        sessionStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversationSession));
    } catch (e) {
        console.warn("No se pudo guardar el estado de conversación:", e);
    }
};

/**
 * Saves active tab choice.
 */
const saveActiveTab = (tab) => {
    activePracticeTab = tab;
    try {
        sessionStorage.setItem(PRACTICE_TAB_KEY, tab);
    } catch (e) {
        console.warn("No se pudo guardar la pestaña activa:", e);
    }
};

/**
 * Initializes the practice section.
 * Called when navigating to the 'practica' section.
 */
const initPracticeMode = () => {
    loadPracticeState();
    renderPracticeUI();
};

/**
 * Helper to auto-scroll chat to the bottom.
 */
const scrollChatToBottom = () => {
    setTimeout(() => {
        const chatMsgs = document.getElementById('chat-messages');
        if (chatMsgs) {
            chatMsgs.scrollTop = chatMsgs.scrollHeight;
        }
    }, 50);
};

// ======================================================
// 1. SENTENCE CHALLENGES LOGIC
// ======================================================

const generatePracticeChallenges = async () => {
    if (isPracticeGenerating) return;

    const words = [...new Set(getAllWords().map(w => w.tradicional).filter(Boolean))];
    const allStructures = getAllStructures();

    if (words.length === 0) {
        showToast('No tienes palabras en tu biblioteca para practicar', 'error');
        return;
    }

    if (allStructures.length === 0) {
        showToast('No tienes estructuras gramaticales registradas', 'error');
        return;
    }

    const shuffled = [...allStructures].sort(() => 0.5 - Math.random());
    const selectedStructures = shuffled.slice(0, 5).map(s => ({
        id: s.id,
        nombre: s.nombre,
        formula: s.formula
    }));

    isPracticeGenerating = true;
    renderPracticeUI();

    try {
        const challenges = await generatePracticeChallengesWithGemini(words, selectedStructures);
        if (!Array.isArray(challenges) || challenges.length === 0) {
            throw new Error("No se recibieron retos válidos de la IA.");
        }

        practiceChallenges = challenges.map(ch => {
            const matchedStruct = selectedStructures.find(s => s.id === ch.estructura_id) || {};
            return {
                ...ch,
                formula: ch.formula || matchedStruct.formula || '',
                nombre_estructura: ch.nombre_estructura || matchedStruct.nombre || ''
            };
        });
        practiceAnswers = {};
        practiceEvaluations = {};
        savePracticeState();
        showToast('¡5 retos generados! Listo para practicar', 'success');
    } catch (error) {
        console.error("Error al generar práctica:", error);
        showToast(error.message || 'Error al conectar con la IA', 'error');
    } finally {
        isPracticeGenerating = false;
        renderPracticeUI();
    }
};

const evaluateSingleChallenge = async (challengeId) => {
    const challenge = practiceChallenges.find(c => String(c.id) === String(challengeId));
    if (!challenge) return;

    const answer = (practiceAnswers[challengeId] || '').trim();
    if (!answer) {
        showToast('Escribe tu respuesta en chino antes de revisar', 'error');
        return;
    }

    const singleSubmission = [{
        id: challenge.id,
        instruccion_espanol: challenge.instruccion_espanol,
        formula: challenge.formula,
        respuesta_estudiante: answer
    }];

    const card = document.querySelector(`.practice-card[data-id="${challengeId}"]`);
    const btn = card ? card.querySelector('.btn-eval-single') : null;
    let originalHtml = '';
    if (btn) {
        originalHtml = btn.innerHTML;
        btn.innerHTML = `<svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Revisando...`;
        btn.disabled = true;
    }

    try {
        const results = await evaluatePracticeAnswersWithGemini(singleSubmission);
        if (Array.isArray(results) && results.length > 0) {
            practiceEvaluations[challengeId] = results[0];
            savePracticeState();
            renderPracticeUI();
            showToast('Reto evaluado con éxito', 'success');
        }
    } catch (error) {
        console.error("Error al evaluar reto:", error);
        showToast(error.message || 'Error al evaluar con la IA', 'error');
        if (btn) {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    }
};

const evaluateAllChallenges = async () => {
    if (isPracticeEvaluating || practiceChallenges.length === 0) return;

    const submissions = practiceChallenges.map(c => ({
        id: c.id,
        instruccion_espanol: c.instruccion_espanol,
        formula: c.formula,
        respuesta_estudiante: (practiceAnswers[c.id] || '').trim()
    }));

    const hasAnyAnswer = submissions.some(s => s.respuesta_estudiante.length > 0);
    if (!hasAnyAnswer) {
        showToast('Escribe al menos una respuesta antes de evaluar', 'error');
        return;
    }

    isPracticeEvaluating = true;
    renderPracticeUI();

    try {
        const results = await evaluatePracticeAnswersWithGemini(submissions);
        if (Array.isArray(results)) {
            results.forEach(res => {
                practiceEvaluations[res.id] = res;
            });
            savePracticeState();

            const total = practiceChallenges.length;
            const correctCount = results.filter(r => r.correcta).length;
            showToast(`¡Evaluación completada! ${correctCount}/${total} correctas`, correctCount === total ? 'success' : 'info');
        }
    } catch (error) {
        console.error("Error al evaluar práctica completa:", error);
        showToast(error.message || 'Error al evaluar respuestas', 'error');
    } finally {
        isPracticeEvaluating = false;
        renderPracticeUI();
    }
};

const resetPracticeSession = () => {
    practiceChallenges = [];
    practiceAnswers = {};
    practiceEvaluations = {};
    savePracticeState();
    renderPracticeUI();
};

// ======================================================
// 2. INTERACTIVE CONVERSATION LOGIC
// ======================================================

/**
 * Starts a new interactive conversation session with Gemini.
 */
const startInteractiveConversation = async () => {
    if (isConversationLoading) return;

    const words = [...new Set(getAllWords().map(w => w.tradicional).filter(Boolean))];
    const allStructures = getAllStructures();

    if (words.length === 0) {
        showToast('No tienes palabras en tu biblioteca para practicar', 'error');
        return;
    }

    if (allStructures.length === 0) {
        showToast('No tienes estructuras registradas para practicar', 'error');
        return;
    }

    let targetStructures = [];
    if (convoTargetMode === 'especifico') {
        if (selectedTargetStructureIds.length === 0) {
            showToast('Selecciona entre 1 y 5 estructuras o cambia a Modo Libre', 'warning');
            return;
        }
        targetStructures = allStructures
            .filter(s => selectedTargetStructureIds.includes(String(s.id)))
            .slice(0, 5)
            .map(s => ({
                id: s.id,
                nombre: s.nombre,
                formula: s.formula
            }));
    }

    isConversationLoading = true;
    conversationSession = {
        active: true,
        contexto: '',
        rol_usuario: '',
        interlocutor: '',
        history: [],
        currentPrompt: '',
        targetStructures: targetStructures,
        terminada: false,
        evaluacion_final: null
    };
    renderPracticeUI();

    try {
        const setup = await startConversationWithGemini(words, allStructures, targetStructures);
        if (!setup || !setup.contexto) {
            throw new Error("No se pudo iniciar la conversación con la IA.");
        }

        conversationSession.contexto = setup.contexto;
        conversationSession.rol_usuario = setup.rol_usuario || 'Estudiante de intercambio';
        conversationSession.interlocutor = setup.interlocutor || 'Amigo local';
        conversationSession.history = [];

        if (setup.inicia_ai && setup.primer_mensaje && setup.primer_mensaje.texto) {
            conversationSession.history.push({
                sender: 'ai',
                texto: setup.primer_mensaje.texto,
                pinyin: setup.primer_mensaje.pinyin || '',
                traduccion: setup.primer_mensaje.traduccion || '',
                instruccion_usuario: setup.primer_mensaje.instruccion_usuario || ''
            });
            conversationSession.currentPrompt = setup.primer_mensaje.instruccion_usuario || '';
        } else {
            conversationSession.currentPrompt = setup.instruccion_inicial || 'Inicia la conversación saludando a tu interlocutor.';
        }

        saveConversationState();
        showToast(`¡Conversación iniciada con ${conversationSession.interlocutor}!`, 'success');
    } catch (error) {
        console.error("Error al iniciar conversación:", error);
        showToast(error.message || 'Error al conectar con la IA', 'error');
        conversationSession.active = false;
        saveConversationState();
    } finally {
        isConversationLoading = false;
        renderPracticeUI();
        scrollChatToBottom();
    }
};

/**
 * Handles sending a student reply in the active conversation.
 */
const handleSendChatMessage = async () => {
    if (isConversationLoading || !conversationSession.active || conversationSession.terminada) return;

    const input = document.getElementById('chat-user-input');
    if (!input) return;
    const userText = input.value.trim();
    if (!userText) {
        showToast('Escribe tu mensaje en chino antes de enviar', 'error');
        return;
    }

    input.value = '';

    // Add user message to history
    const userMsg = {
        sender: 'user',
        texto: userText,
        evaluacion: null
    };
    conversationSession.history.push(userMsg);
    isConversationLoading = true;
    renderPracticeUI();
    scrollChatToBottom();

    try {
        const words = [...new Set(getAllWords().map(w => w.tradicional).filter(Boolean))];
        const allStructures = getAllStructures();

        const historyForApi = conversationSession.history.map(m => ({
            emisor: m.sender === 'ai' ? conversationSession.interlocutor : 'Estudiante',
            mensaje: m.texto
        }));

        const result = await continueConversationWithGemini(
            conversationSession.contexto,
            historyForApi,
            userText,
            words,
            allStructures,
            conversationSession.targetStructures || []
        );

        if (!result) {
            throw new Error("No se recibió respuesta de la IA.");
        }

        // Attach turn evaluation to user's message
        if (result.evaluacion_usuario) {
            userMsg.evaluacion = result.evaluacion_usuario;
        }

        if (result.terminada) {
            conversationSession.terminada = true;
            conversationSession.evaluacion_final = result.evaluacion_final;

            if (result.respuesta_interlocutor && result.respuesta_interlocutor.texto) {
                conversationSession.history.push({
                    sender: 'ai',
                    texto: result.respuesta_interlocutor.texto,
                    pinyin: result.respuesta_interlocutor.pinyin || '',
                    traduccion: result.respuesta_interlocutor.traduccion || '',
                    instruccion_usuario: ''
                });
            }
            conversationSession.currentPrompt = '';
            showToast('¡Has concluido la conversación!', 'success');
        } else {
            if (result.respuesta_interlocutor && result.respuesta_interlocutor.texto) {
                conversationSession.history.push({
                    sender: 'ai',
                    texto: result.respuesta_interlocutor.texto,
                    pinyin: result.respuesta_interlocutor.pinyin || '',
                    traduccion: result.respuesta_interlocutor.traduccion || '',
                    instruccion_usuario: result.respuesta_interlocutor.instruccion_usuario || ''
                });
                conversationSession.currentPrompt = result.respuesta_interlocutor.instruccion_usuario || '';
            }
        }

        saveConversationState();
    } catch (error) {
        console.error("Error al continuar conversación:", error);
        showToast(error.message || 'Error al comunicarse con la IA', 'error');
    } finally {
        isConversationLoading = false;
        renderPracticeUI();
        scrollChatToBottom();
        const nextInput = document.getElementById('chat-user-input');
        if (nextInput && !conversationSession.terminada) {
            nextInput.focus();
        }
    }
};

/**
 * Resets the interactive conversation session.
 */
const resetConversationSession = () => {
    conversationSession = {
        active: false,
        contexto: '',
        rol_usuario: '',
        interlocutor: '',
        history: [],
        currentPrompt: '',
        targetStructures: [],
        terminada: false,
        evaluacion_final: null
    };
    saveConversationState();
    renderPracticeUI();
};

// ======================================================
// 3. UI RENDERING
// ======================================================

/**
 * Main rendering routine for the practice section.
 */
const renderPracticeUI = () => {
    const container = document.getElementById('practice-container');
    if (!container) return;

    // Navigation Tabs Header
    const tabsHtml = `
        <div class="practice-nav-tabs">
            <button class="practice-tab-btn ${activePracticeTab === 'retos' ? 'active' : ''}" data-tab="retos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                </svg>
                Retos de oraciones
            </button>
            <button class="practice-tab-btn ${activePracticeTab === 'conversacion' ? 'active' : ''}" data-tab="conversacion">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Conversación en vivo
                ${conversationSession.active && !conversationSession.terminada ? '<span class="practice-tab-dot"></span>' : ''}
            </button>
        </div>
        <div class="practice-body-content" id="practice-body-content"></div>
    `;

    container.innerHTML = tabsHtml;

    // Attach Tab switching listeners
    container.querySelectorAll('.practice-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab !== activePracticeTab) {
                saveActiveTab(tab);
                renderPracticeUI();
            }
        });
    });

    const bodyContent = document.getElementById('practice-body-content');
    if (!bodyContent) return;

    if (activePracticeTab === 'retos') {
        renderChallengesView(bodyContent);
    } else {
        renderConversationView(bodyContent);
    }
};

/**
 * Renders the 5-challenge sentence construction view.
 */
const renderChallengesView = (bodyContent) => {
    // 1. Loading State while generating challenges
    if (isPracticeGenerating) {
        bodyContent.innerHTML = `
            <div class="practice-empty-state">
                <div class="practice-loading-spinner">
                    <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                    </svg>
                </div>
                <h3>Formulando 5 retos con Inteligencia Artificial...</h3>
                <p>Gemini está seleccionando tus estructuras gramaticales y combinándolas con tu vocabulario para crear oraciones personalizadas.</p>
            </div>
        `;
        return;
    }

    // 2. Empty / Welcome State
    if (!practiceChallenges || practiceChallenges.length === 0) {
        const totalWords = getAllWords().length;
        const totalStructs = getAllStructures().length;

        bodyContent.innerHTML = `
            <div class="practice-empty-state">
                <div class="practice-icon-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </div>
                <h2>Práctica Diaria de Oraciones con IA</h2>
                <p>
                    Pon a prueba tu dominio del mandarín tradicional. La IA seleccionará <strong>5 estructuras gramaticales</strong> al azar
                    y usará únicamente las <strong>palabras que ya tienes en tu biblioteca</strong> para proponerte 5 oraciones en español.
                    ¡Escríbelas en caracteres tradicionales y recibe retroalimentación inmediata!
                </p>
                <div class="practice-stats-bar">
                    <div class="stat-pill">
                        <span class="stat-number">${totalWords}</span>
                        <span class="stat-label">Palabras disponibles</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-number">${totalStructs}</span>
                        <span class="stat-label">Estructuras disponibles</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-lg" id="btn-generate-practice">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Generar 5 retos nuevos
                </button>
            </div>
        `;

        const btnGen = document.getElementById('btn-generate-practice');
        if (btnGen) {
            btnGen.addEventListener('click', generatePracticeChallenges);
        }
        return;
    }

    // 3. Active Practice UI with 5 Challenges
    const evaluatedList = Object.values(practiceEvaluations);
    const hasEvaluations = evaluatedList.length > 0;
    const correctCount = evaluatedList.filter(e => e.correcta).length;

    let toolbarHtml = `
        <div class="practice-toolbar">
            <div class="practice-toolbar-info">
                <h3>Práctica activa: 5 retos</h3>
                ${hasEvaluations ? `
                    <span class="practice-score-badge ${correctCount === practiceChallenges.length ? 'all-correct' : ''}">
                        ${correctCount} / ${practiceChallenges.length} correctas
                    </span>
                ` : `
                    <span class="practice-status-hint">Escribe tus respuestas y revísalas individualmente o en conjunto.</span>
                `}
            </div>
            <div class="practice-toolbar-actions">
                <button class="btn btn-secondary btn-sm" id="btn-reset-practice" title="Reiniciar sesión de práctica">
                    Reiniciar
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-regenerate-practice" ${isPracticeEvaluating ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Otros 5 retos
                </button>
                <button class="btn btn-primary" id="btn-evaluate-all-practice" ${isPracticeEvaluating ? 'disabled' : ''}>
                    ${isPracticeEvaluating ? `
                        <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg> Evaluando con IA...
                    ` : `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg> Evaluar todo
                    `}
                </button>
            </div>
        </div>
    `;

    let cardsHtml = practiceChallenges.map((ch, index) => {
        const userAnswer = practiceAnswers[ch.id] || '';
        const evaluation = practiceEvaluations[ch.id];

        let feedbackHtml = '';
        if (evaluation) {
            const isCorrect = evaluation.correcta;
            feedbackHtml = `
                <div class="practice-feedback-box ${isCorrect ? 'is-correct' : 'is-wrong'}">
                    <div class="practice-feedback-verdict">
                        ${isCorrect ? '✅ ¡Oración Correcta!' : '❌ Necesita Corrección'}
                    </div>

                    <div class="practice-feedback-section">
                        <div class="practice-feedback-label">Explicación</div>
                        <p class="practice-feedback-text">${evaluation.explicacion || ''}</p>
                    </div>

                    <div class="practice-feedback-section">
                        <div class="practice-feedback-label">Versión sugerida</div>
                        <div class="practice-feedback-chinese">${evaluation.correccion || ''}</div>
                    </div>

                    ${evaluation.pinyin ? `
                        <div class="practice-feedback-section">
                            <div class="practice-feedback-label">Pinyin</div>
                            <div class="practice-feedback-pinyin">${evaluation.pinyin}</div>
                        </div>
                    ` : ''}

                    <div class="practice-feedback-section">
                        <div class="practice-feedback-label">Traducción</div>
                        <div class="practice-feedback-trans">${evaluation.traduccion || ''}</div>
                    </div>
                </div>
            `;
        }

        let vocabPills = '';
        if (Array.isArray(ch.vocabulario_clave) && ch.vocabulario_clave.length > 0) {
            vocabPills = `
                <div class="practice-vocab-wrap">
                    <span class="practice-vocab-title">Vocabulario clave:</span>
                    ${ch.vocabulario_clave.map(v => `<span class="practice-pill">${v}</span>`).join('')}
                </div>
            `;
        }

        return `
            <div class="practice-card ${evaluation ? (evaluation.correcta ? 'card-success' : 'card-warning') : ''}" data-id="${ch.id}">
                <div class="practice-card-header">
                    <div class="practice-card-badge">Reto ${index + 1} de 5</div>
                    <div class="practice-formula-tag" title="Estructura a utilizar">
                        ${ch.formula || ch.nombre_estructura}
                    </div>
                </div>

                <div class="practice-instruction">
                    <div class="practice-instruction-label">Traduce o construye en chino:</div>
                    <div class="practice-instruction-text">"${ch.instruccion_espanol}"</div>
                </div>

                ${ch.pista ? `
                    <div class="practice-hint">
                        <span class="practice-hint-icon">💡</span>
                        <span><strong>Pista:</strong> ${ch.pista}</span>
                    </div>
                ` : ''}

                ${vocabPills}

                <div class="practice-input-container">
                    <textarea 
                        class="practice-input" 
                        data-id="${ch.id}" 
                        rows="2" 
                        placeholder="Escribe la oración aquí en caracteres tradicionales...">${userAnswer}</textarea>
                    
                    <div class="practice-card-actions">
                        <button class="btn btn-secondary btn-sm btn-eval-single" data-id="${ch.id}" ${isPracticeEvaluating ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            Revisar este reto
                        </button>
                    </div>
                </div>

                ${feedbackHtml}
            </div>
        `;
    }).join('');

    bodyContent.innerHTML = `
        ${toolbarHtml}
        <div class="practice-cards-list">
            ${cardsHtml}
        </div>
        <div class="practice-footer-actions">
            <button class="btn btn-primary btn-lg" id="btn-footer-evaluate-all" ${isPracticeEvaluating ? 'disabled' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Evaluar todas las respuestas
            </button>
        </div>
    `;

    // Event listeners for challenges
    bodyContent.querySelectorAll('.practice-input').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
            const id = e.target.dataset.id;
            practiceAnswers[id] = e.target.value;
            savePracticeState();
        });
    });

    bodyContent.querySelectorAll('.btn-eval-single').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            evaluateSingleChallenge(id);
        });
    });

    const btnEvalAll = document.getElementById('btn-evaluate-all-practice');
    if (btnEvalAll) {
        btnEvalAll.addEventListener('click', evaluateAllChallenges);
    }

    const btnFooterEvalAll = document.getElementById('btn-footer-evaluate-all');
    if (btnFooterEvalAll) {
        btnFooterEvalAll.addEventListener('click', evaluateAllChallenges);
    }

    const btnRegen = document.getElementById('btn-regenerate-practice');
    if (btnRegen) {
        btnRegen.addEventListener('click', generatePracticeChallenges);
    }

    const btnReset = document.getElementById('btn-reset-practice');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm('¿Deseas reiniciar la práctica actual y borrar tus respuestas?')) {
                resetPracticeSession();
            }
        });
    }
};

/**
 * Renders the Interactive Conversation Simulator view.
 */
const renderConversationView = (bodyContent) => {
    // 1. Initial / Not Active State
    if (!conversationSession.active) {
        const totalWords = getAllWords().length;
        const allStructures = getAllStructures();
        const totalStructs = allStructures.length;

        let pickerHtml = '';
        if (convoTargetMode === 'especifico') {
            const cardsHtml = allStructures.map(s => {
                const isSelected = selectedTargetStructureIds.includes(String(s.id));
                const searchText = `${s.nombre || ''} ${s.formula || ''} ${s.espanol || ''}`.toLowerCase();
                return `
                    <div class="convo-struct-card ${isSelected ? 'selected' : ''}" data-id="${s.id}" data-search="${searchText}">
                        <div class="convo-struct-card-check">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <div class="convo-struct-card-info">
                            <div class="convo-struct-name" title="${s.nombre}">${s.nombre}</div>
                            <div class="convo-struct-formula" title="${s.formula}">${s.formula}</div>
                        </div>
                    </div>
                `;
            }).join('');

            pickerHtml = `
                <div class="convo-struct-picker-panel">
                    <div class="convo-picker-header">
                        <div class="convo-picker-title">
                            <span>Estructuras obligatorias:</span>
                            <span class="convo-count-badge ${selectedTargetStructureIds.length === 5 ? 'max' : ''}" id="convo-count-badge">
                                ${selectedTargetStructureIds.length} / 5 seleccionadas
                            </span>
                        </div>
                        <div class="convo-picker-controls">
                            <div class="convo-search-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input type="text" id="convo-struct-search-input" class="convo-search-input" placeholder="Filtrar por nombre o fórmula...">
                            </div>
                            ${selectedTargetStructureIds.length > 0 ? `
                                <button type="button" class="btn btn-secondary btn-sm" id="btn-convo-clear-structs">Desmarcar</button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="convo-struct-cards-grid" id="convo-struct-grid">
                        ${cardsHtml}
                    </div>
                    <div class="convo-picker-hint">
                        💡 Selecciona entre 1 y 5 estructuras. La IA conducirá el diálogo para que debas practicar cada una de ellas al menos una vez.
                    </div>
                </div>
            `;
        }

        bodyContent.innerHTML = `
            <div class="practice-empty-state convo-setup-state">
                <div class="practice-icon-badge convo-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <h2>Conversación Interactiva con IA</h2>
                <p>
                    Practica situaciones cotidianas en Taiwán. La IA iniciará un diálogo adaptado a tu progreso,
                    evaluará cada frase que envíes en caracteres tradicionales y te dará retroalimentación pedagógica al instante.
                </p>

                <!-- Mode Selector -->
                <div class="convo-mode-section">
                    <div class="convo-mode-label">Elige la modalidad de práctica:</div>
                    <div class="convo-mode-toggle">
                        <button type="button" class="convo-mode-btn ${convoTargetMode === 'libre' ? 'active' : ''}" data-mode="libre">
                            <span class="convo-mode-icon">🌐</span>
                            <div class="convo-mode-meta">
                                <strong>Modo Libre</strong>
                                <small>Practica cualquier estructura de tu biblioteca</small>
                            </div>
                        </button>
                        <button type="button" class="convo-mode-btn ${convoTargetMode === 'especifico' ? 'active' : ''}" data-mode="especifico">
                            <span class="convo-mode-icon">🎯</span>
                            <div class="convo-mode-meta">
                                <strong>Modo Enfocado</strong>
                                <small>Elige hasta 5 estructuras obligatorias</small>
                            </div>
                        </button>
                    </div>
                </div>

                ${pickerHtml}

                <div class="practice-stats-bar">
                    <div class="stat-pill">
                        <span class="stat-number">${totalWords}</span>
                        <span class="stat-label">Palabras conocidas</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-number">${totalStructs}</span>
                        <span class="stat-label">Estructuras disponibles</span>
                    </div>
                </div>

                <button class="btn btn-primary btn-lg" id="btn-start-convo" ${isConversationLoading || (convoTargetMode === 'especifico' && selectedTargetStructureIds.length === 0) ? 'disabled' : ''}>
                    ${isConversationLoading ? `
                        <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                        </svg>
                        Conectando con interlocutor...
                    ` : (convoTargetMode === 'especifico' ? `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        ${selectedTargetStructureIds.length === 0 ? 'Selecciona entre 1 y 5 estructuras' : `Iniciar conversación (${selectedTargetStructureIds.length} estructura${selectedTargetStructureIds.length > 1 ? 's' : ''})`}
                    ` : `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Iniciar conversación libre
                    `)}
                </button>
            </div>
        `;

        // Attach event listeners for Mode Selector
        bodyContent.querySelectorAll('.convo-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (mode !== convoTargetMode) {
                    convoTargetMode = mode;
                    saveConvoSettings();
                    renderPracticeUI();
                }
            });
        });

        // Search in structure picker
        const searchInput = document.getElementById('convo-struct-search-input');
        const grid = document.getElementById('convo-struct-grid');
        if (searchInput && grid) {
            searchInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                const cards = grid.querySelectorAll('.convo-struct-card');
                cards.forEach(card => {
                    const searchData = card.dataset.search || '';
                    card.style.display = searchData.includes(q) ? '' : 'none';
                });
            });
        }

        // Clear all structures selection
        const btnClear = document.getElementById('btn-convo-clear-structs');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                selectedTargetStructureIds = [];
                saveConvoSettings();
                renderPracticeUI();
            });
        }

        // Structure card selection clicks
        if (grid) {
            grid.querySelectorAll('.convo-struct-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = String(card.dataset.id);
                    const idx = selectedTargetStructureIds.indexOf(id);
                    if (idx !== -1) {
                        selectedTargetStructureIds.splice(idx, 1);
                        card.classList.remove('selected');
                    } else {
                        if (selectedTargetStructureIds.length >= 5) {
                            showToast('Puedes elegir como máximo 5 estructuras para enfocar la conversación', 'warning');
                            return;
                        }
                        selectedTargetStructureIds.push(id);
                        card.classList.add('selected');
                    }
                    saveConvoSettings();

                    // Update live badge
                    const badge = document.getElementById('convo-count-badge');
                    if (badge) {
                        badge.textContent = `${selectedTargetStructureIds.length} / 5 seleccionadas`;
                        badge.classList.toggle('max', selectedTargetStructureIds.length === 5);
                    }

                    // Update start button
                    const startBtn = document.getElementById('btn-start-convo');
                    if (startBtn && convoTargetMode === 'especifico') {
                        if (selectedTargetStructureIds.length === 0) {
                            startBtn.disabled = true;
                            startBtn.innerHTML = `
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                Selecciona entre 1 y 5 estructuras
                            `;
                        } else {
                            startBtn.disabled = false;
                            startBtn.innerHTML = `
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                                Iniciar conversación (${selectedTargetStructureIds.length} estructura${selectedTargetStructureIds.length > 1 ? 's' : ''})
                            `;
                        }
                    }
                });
            });
        }

        const btnStart = document.getElementById('btn-start-convo');
        if (btnStart) {
            btnStart.addEventListener('click', startInteractiveConversation);
        }
        return;
    }

    // 2. Active Chat Stream
    const interlocutorName = conversationSession.interlocutor || 'Interlocutor';
    const userRole = conversationSession.rol_usuario || 'Estudiante';
    const scenario = conversationSession.contexto || 'Situación cotidiana';

    // Build messages list HTML
    let messagesHtml = '';

    // If starting with AI waiting for user's opening message
    if (conversationSession.history.length === 0 && conversationSession.currentPrompt) {
        messagesHtml += `
            <div class="chat-prompt-card-opening">
                <div class="chat-prompt-badge">🎯 Tu turno para iniciar el diálogo</div>
                <div class="chat-prompt-text">${conversationSession.currentPrompt}</div>
            </div>
        `;
    }

    conversationSession.history.forEach((msg, idx) => {
        if (msg.sender === 'ai') {
            const isLastAi = (idx === conversationSession.history.length - 1) || 
                             (idx === conversationSession.history.length - 2 && conversationSession.history[conversationSession.history.length - 1].sender === 'user');

            messagesHtml += `
                <div class="chat-msg chat-msg-ai">
                    <div class="chat-msg-header">
                        <span class="chat-msg-avatar">🗣️</span>
                        <span class="chat-msg-name">${interlocutorName}</span>
                    </div>
                    <div class="chat-bubble chat-bubble-ai">
                        <div class="chat-chinese">${msg.texto}</div>
                        ${msg.pinyin ? `<div class="chat-pinyin">${msg.pinyin}</div>` : ''}
                        ${msg.traduccion ? `<div class="chat-trans">${msg.traduccion}</div>` : ''}
                    </div>
                    ${msg.instruccion_usuario && !conversationSession.terminada ? `
                        <div class="chat-prompt-callout">
                            <span class="chat-prompt-tag">🎯 Tu objetivo ahora:</span>
                            <span class="chat-prompt-instruction">${msg.instruccion_usuario}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            // User message
            const evalData = msg.evaluacion;
            let evalHtml = '';

            if (evalData) {
                const isCorrect = evalData.correcta;
                const statusType = isCorrect ? 'correct' : (evalData.estado === 'mejorable' ? 'warning' : 'wrong');
                const statusLabel = isCorrect ? '✅ Expresión correcta' : (evalData.estado === 'mejorable' ? '💡 Comprensible pero mejorable' : '❌ Corrección requerida');

                evalHtml = `
                    <div class="chat-eval-box ${statusType}">
                        <div class="chat-eval-status">${statusLabel}</div>
                        ${evalData.comentario ? `<div class="chat-eval-comment">${evalData.comentario}</div>` : ''}
                        ${evalData.correccion && (!isCorrect || evalData.correccion !== msg.texto) ? `
                            <div class="chat-eval-suggestion">
                                <span class="chat-eval-sugg-title">Forma recomendada:</span>
                                <div class="chat-eval-chinese">${evalData.correccion}</div>
                                ${evalData.pinyin ? `<div class="chat-eval-pinyin">${evalData.pinyin}</div>` : ''}
                                ${evalData.traduccion ? `<div class="chat-eval-trans">"${evalData.traduccion}"</div>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            messagesHtml += `
                <div class="chat-msg chat-msg-user">
                    <div class="chat-msg-header">
                        <span class="chat-msg-name">Tú (${userRole})</span>
                        <span class="chat-msg-avatar">👤</span>
                    </div>
                    <div class="chat-bubble chat-bubble-user">
                        <div class="chat-chinese">${msg.texto}</div>
                    </div>
                    ${evalHtml}
                </div>
            `;
        }
    });

    // Loading indicator when waiting for AI
    if (isConversationLoading) {
        messagesHtml += `
            <div class="chat-msg chat-msg-ai">
                <div class="chat-msg-header">
                    <span class="chat-msg-avatar">🗣️</span>
                    <span class="chat-msg-name">${interlocutorName}</span>
                </div>
                <div class="chat-bubble chat-bubble-ai chat-typing-bubble">
                    <div class="chat-typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <span class="chat-typing-label">Evaluando tu frase y respondiendo...</span>
                </div>
            </div>
        `;
    }

    // Final Evaluation Card when conversation is finished
    let finalCardHtml = '';
    if (conversationSession.terminada && conversationSession.evaluacion_final) {
        const finalEval = conversationSession.evaluacion_final;
        finalCardHtml = `
            <div class="chat-final-card">
                <div class="chat-final-header">
                    <div class="chat-final-badge">🎉 ¡Conversación Completada!</div>
                    <div class="chat-final-score">Puntuación: <strong>${finalEval.puntuacion || 'Excelente'}</strong></div>
                </div>
                <div class="chat-final-body">
                    <p class="chat-final-summary">${finalEval.resumen || ''}</p>
                    
                    ${Array.isArray(finalEval.puntos_fuertes) && finalEval.puntos_fuertes.length > 0 ? `
                        <div class="chat-final-block">
                            <div class="chat-final-subtitle">✨ Aciertos y puntos fuertes:</div>
                            <ul class="chat-final-list">
                                ${finalEval.puntos_fuertes.map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${Array.isArray(finalEval.consejos) && finalEval.consejos.length > 0 ? `
                        <div class="chat-final-block">
                            <div class="chat-final-subtitle">💡 Sugerencias para continuar mejorando:</div>
                            <ul class="chat-final-list">
                                ${finalEval.consejos.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                <div class="chat-final-footer">
                    <button class="btn btn-primary btn-lg" id="btn-final-new-convo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Practicar otra conversación
                    </button>
                </div>
            </div>
        `;
    }

    // Bottom input bar
    let inputBarHtml = '';
    if (conversationSession.terminada) {
        inputBarHtml = `
            <div class="chat-input-bar is-concluded">
                <span class="chat-concluded-note">Diálogo finalizado. ¡Excelente práctica!</span>
                <button class="btn btn-primary btn-sm" id="btn-convo-restart-bar">
                    Nueva conversación
                </button>
            </div>
        `;
    } else {
        inputBarHtml = `
            <div class="chat-input-bar">
                <input 
                    type="text" 
                    class="chat-input" 
                    id="chat-user-input" 
                    placeholder="Escribe tu mensaje en caracteres tradicionales..." 
                    ${isConversationLoading ? 'disabled' : ''} 
                    autocomplete="off" />
                <button class="btn btn-primary chat-btn-send" id="btn-chat-send" ${isConversationLoading ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    <span>Enviar</span>
                </button>
            </div>
        `;
    }

    bodyContent.innerHTML = `
        <div class="chat-container">
            <!-- Scenario & Partner Header -->
            <div class="chat-top-header">
                <div class="chat-partner-info">
                    <div class="chat-avatar-large">🗣️</div>
                    <div class="chat-partner-meta">
                        <div class="chat-partner-name">${interlocutorName}</div>
                        <div class="chat-user-role-badge">Tu rol: ${userRole}</div>
                    </div>
                </div>
                <div class="chat-top-actions">
                    <button class="btn btn-secondary btn-sm" id="btn-reset-convo" title="Finalizar e iniciar otra">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Reiniciar
                    </button>
                </div>
            </div>

            <div class="chat-scenario-card">
                <div class="chat-scenario-label">📍 Escenario:</div>
                <div class="chat-scenario-description">${scenario}</div>
            </div>

            ${Array.isArray(conversationSession.targetStructures) && conversationSession.targetStructures.length > 0 ? `
                <div class="chat-target-banner">
                    <div class="chat-target-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        <span>Estructuras a practicar en esta sesión (${conversationSession.targetStructures.length}):</span>
                    </div>
                    <div class="chat-target-pills">
                        ${conversationSession.targetStructures.map(s => `
                            <span class="chat-target-pill" title="${s.formula}">
                                <span class="pill-name">${s.nombre}</span>
                                <span class="pill-formula">${s.formula}</span>
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Messages Stream -->
            <div class="chat-messages" id="chat-messages">
                ${messagesHtml}
                ${finalCardHtml}
            </div>

            <!-- Simple Input Field -->
            ${inputBarHtml}
        </div>
    `;

    // Attach event listeners
    const inputEl = document.getElementById('chat-user-input');
    const sendBtn = document.getElementById('btn-chat-send');

    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendChatMessage);
    }

    if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                e.preventDefault();
                handleSendChatMessage();
            }
        });
        // Auto-focus input if active
        if (!isConversationLoading && !conversationSession.terminada) {
            inputEl.focus();
        }
    }

    const btnResetConvo = document.getElementById('btn-reset-convo');
    if (btnResetConvo) {
        btnResetConvo.addEventListener('click', () => {
            if (confirm('¿Deseas finalizar la conversación actual e iniciar una nueva?')) {
                resetConversationSession();
            }
        });
    }

    const btnFinalNew = document.getElementById('btn-final-new-convo');
    if (btnFinalNew) {
        btnFinalNew.addEventListener('click', startInteractiveConversation);
    }

    const btnConvoRestartBar = document.getElementById('btn-convo-restart-bar');
    if (btnConvoRestartBar) {
        btnConvoRestartBar.addEventListener('click', startInteractiveConversation);
    }

    scrollChatToBottom();
};
