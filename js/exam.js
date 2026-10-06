/**
 * =====================================================
 * AppChino — exam.js
 * Comprehensive Exam Simulation Mode (7 Phases)
 * 
 * 1. Character Recognition (Pinyin & Zhuyin -> 10 options, 10 rounds)
 * 2. Pinyin Typing (10 words -> Live Tone Engine 1-5 input)
 * 3. Fill in the Blank (5 direct sentences)
 * 4. Complex Sentence Multiple Choice (10 sentences -> 3 options A, B, C)
 * 5. Contextual Scenarios (5 scenarios -> Simple sentence answers evaluated by AI)
 * 6. Fixed Character Bank (Bank of 5 fixed characters -> 5 questions forced usage)
 * 7. Reading Comprehension (Short story -> 5 T/F + 5 Multiple Choice)
 * =====================================================
 */

const EXAM_STORAGE_KEY = 'appchino_exam_state_v2';

let examSession = {
    status: 'idle', // 'idle' | 'loading' | 'active' | 'evaluating' | 'completed'
    currentPhase: 1, // 1 to 7
    data: {
        phase1: [],
        phase2: [],
        phase3: [],
        phase4: [],
        phase5: [],
        phase6: { banco_caracteres: [], preguntas: [] },
        phase7: { historia: '', pinyin_historia: '', traduccion_historia: '', verdadero_falso: [], opcion_multiple: [] }
    },
    userAnswers: {
        phase1: {},
        phase2: {},
        phase3: {},
        phase4: {},
        phase5: {},
        phase6: {},
        phase7_vf: {},
        phase7_mcq: {}
    },
    results: null,
    loadingMessage: ''
};

/**
 * Loads cached exam session from sessionStorage.
 */
const loadExamState = () => {
    try {
        const raw = sessionStorage.getItem(EXAM_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.status) {
                examSession = parsed;
            }
        }
    } catch (e) {
        console.warn("No se pudo cargar el estado del examen:", e);
    }
};

/**
 * Saves current exam session to sessionStorage.
 */
const saveExamState = () => {
    try {
        sessionStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(examSession));
    } catch (e) {
        console.warn("No se pudo guardar el estado del examen:", e);
    }
};

// ==========================================================
// EXAM LESSON CONFIGURATION (Cumulative / Retroactive)
// ==========================================================
const EXAM_MAX_LESSON_KEY = 'appchino_exam_max_lesson_v1';
const EXAM_INC_UNASSIGNED_KEY = 'appchino_exam_inc_unassigned_v1';

let examMaxLesson = 8;
let examIncludeUnassigned = false;

const loadExamLessonPrefs = () => {
    try {
        const saved = localStorage.getItem(EXAM_MAX_LESSON_KEY);
        if (saved !== null) {
            examMaxLesson = parseInt(saved, 10);
        }
        const savedInc = localStorage.getItem(EXAM_INC_UNASSIGNED_KEY);
        if (savedInc !== null) {
            examIncludeUnassigned = savedInc === 'true';
        } else {
            const allWords = getAllWords();
            const hasAnyTagged = allWords.some(w => !!w.leccion);
            if (!hasAnyTagged) {
                examIncludeUnassigned = true;
            }
        }
    } catch (e) {
        console.warn("No se pudieron cargar las preferencias de lecciones para el examen:", e);
    }
};

const saveExamLessonPrefs = () => {
    try {
        localStorage.setItem(EXAM_MAX_LESSON_KEY, String(examMaxLesson));
        localStorage.setItem(EXAM_INC_UNASSIGNED_KEY, String(examIncludeUnassigned));
    } catch (e) {
        console.warn("No se pudieron guardar las preferencias de lecciones para el examen:", e);
    }
};

/**
 * Returns the pool of words matching current cumulative lesson selection.
 * @returns {Array<object>}
 */
const getWordsForExam = () => {
    const allWords = getAllWords();
    return allWords.filter(w => {
        if (w.leccion && Number(w.leccion) <= examMaxLesson) {
            return true;
        }
        if (examIncludeUnassigned && !w.leccion) {
            return true;
        }
        return false;
    });
};

/**
 * Normalizes pinyin string for fair comparison (lowercase, trimmed, space collapsed).
 */
const normalizePinyinComparison = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[,.?!/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Fisher-Yates shuffle array helper.
 */
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/**
 * Generates Phase 1: 10 items (Pinyin + Zhuyin -> pick 1 of 10 Hanzi options).
 */
const generatePhase1Local = (allWords) => {
    const validWords = allWords.filter(w => w.tradicional && (w.pinyin || w.zhuyin));
    if (validWords.length < 10) return [];

    const shuffled = shuffleArray(validWords);
    const targetWords = shuffled.slice(0, 10);
    const questions = [];

    targetWords.forEach((target, idx) => {
        // Collect 9 distractors that don't share the same Hanzi
        const distractors = validWords
            .filter(w => w.tradicional !== target.tradicional)
            .map(w => w.tradicional);
        
        const uniqueDistractors = Array.from(new Set(distractors));
        const selectedDistractors = shuffleArray(uniqueDistractors).slice(0, 9);
        
        const options = shuffleArray([target.tradicional, ...selectedDistractors]);

        questions.push({
            id: idx + 1,
            pinyin: target.pinyin || '',
            zhuyin: target.zhuyin || '',
            espanol: target.espanol || '',
            correctHanzi: target.tradicional,
            options: options
        });
    });

    return questions;
};

/**
 * Generates Phase 2: 10 items (Hanzi -> type Pinyin with tones).
 * Fully mechanized locally without AI.
 */
const generatePhase2Local = (allWords) => {
    const validWords = allWords.filter(w => w.tradicional && w.pinyin);
    if (validWords.length < 10) return [];

    const shuffled = shuffleArray(validWords);
    const selected = shuffled.slice(0, 10);

    return selected.map((w, idx) => ({
        id: idx + 1,
        hanzi: w.tradicional,
        pinyin: w.pinyin,
        zhuyin: w.zhuyin || '',
        categoria: w.categoria || ''
    }));
};

/**
 * Mechanically verifies Phase 1 answer (exact Hanzi match).
 */
const verifyPhase1Answer = (targetHanzi, userAnswer) => {
    if (!targetHanzi || !userAnswer) return false;
    return userAnswer.trim() === targetHanzi.trim();
};

/**
 * Mechanically verifies Phase 2 answer (normalized tone-marked pinyin).
 */
const verifyPhase2Answer = (expectedPinyin, userAnswer) => {
    const normUser = normalizePinyinComparison((userAnswer || '').trim());
    if (!normUser) return false;
    const alternatives = (expectedPinyin || '').split('/').map(a => normalizePinyinComparison(a));
    return alternatives.includes(normUser);
};

/**
 * Initializes and starts generating a new Exam.
 */
const startNewExam = async () => {
    loadExamLessonPrefs();
    const examWords = getWordsForExam();
    const allStructures = getAllStructures();

    if (!examWords || examWords.length < 10) {
        showToast(`Se necesitan al menos 10 palabras dentro de las lecciones seleccionadas para realizar el examen (actualmente seleccionadas: ${examWords ? examWords.length : 0}).`, "warning");
        return;
    }

    examSession.status = 'loading';
    examSession.loadingMessage = 'Diseñando tu examen con Gemini basado en tus flashcards y estructuras...';
    examSession.currentPhase = 1;
    examSession.userAnswers = {
        phase1: {},
        phase2: {},
        phase3: {},
        phase4: {},
        phase5: {},
        phase6: {},
        phase7_vf: {},
        phase7_mcq: {}
    };
    examSession.results = null;
    saveExamState();
    renderExam();

    try {
        // 1. Generate local phases 1 & 2
        const p1 = generatePhase1Local(examWords);
        const p2 = generatePhase2Local(examWords);

        // 2. Generate AI phases (3, 4, 5, 6, 7)
        const aiData = await generateExamAIData(examWords, allStructures);

        examSession.data = {
            phase1: p1,
            phase2: p2,
            phase3: aiData.fase3 || [],
            phase4: aiData.fase4 || [],
            phase5: aiData.fase5 || [],
            phase6: aiData.fase6 || { banco_caracteres: [], preguntas: [] },
            phase7: aiData.fase7 || { historia: '', verdadero_falso: [], opcion_multiple: [] }
        };

        examSession.status = 'active';
        examSession.currentPhase = 1;
        saveExamState();
        renderExam();
        showToast("¡Examen generado exitosamente! Mucho éxito.", "success");
    } catch (err) {
        console.error("Error al iniciar el examen:", err);
        examSession.status = 'idle';
        saveExamState();
        renderExam();
        showToast("Error al generar el examen con IA: " + (err.message || "Intenta nuevamente"), "error");
    }
};

/**
 * Finishes and evaluates the entire exam.
 */
const finishAndEvaluateExam = async () => {
    const missingPhases = checkIncompletePhases();
    if (missingPhases.length > 0) {
        const confirmMsg = `Tienes preguntas sin responder en: ${missingPhases.join(', ')}. ¿Deseas calificar y finalizar el examen de todos modos?`;
        if (!confirm(confirmMsg)) {
            return;
        }
    }

    examSession.status = 'evaluating';
    examSession.loadingMessage = 'El profesor IA está evaluando tus respuestas y calculando tu puntuación...';
    saveExamState();
    renderExam();

    try {
        // 1. Calculate local score for Phase 1 (10 pts)
        let scoreP1 = 0;
        const p1Details = examSession.data.phase1.map(q => {
            const userAns = examSession.userAnswers.phase1[q.id];
            const isCorrect = verifyPhase1Answer(q.correctHanzi, userAns);
            if (isCorrect) scoreP1 += 1;
            return {
                id: q.id,
                pinyin: q.pinyin,
                zhuyin: q.zhuyin,
                userAnswer: userAns || '(Sin respuesta)',
                correctAnswer: q.correctHanzi,
                isCorrect
            };
        });

        // 2. Calculate local score for Phase 2 (10 pts)
        let scoreP2 = 0;
        const p2Details = examSession.data.phase2.map(q => {
            const userAns = (examSession.userAnswers.phase2[q.id] || '').trim();
            const expected = q.pinyin;
            const isCorrect = verifyPhase2Answer(expected, userAns);
            if (isCorrect) scoreP2 += 1;

            return {
                id: q.id,
                hanzi: q.hanzi,
                userAnswer: userAns || '(Sin respuesta)',
                correctAnswer: expected,
                isCorrect
            };
        });

        // 3. Calculate local score for Phase 3 (5 pts)
        let scoreP3 = 0;
        const p3Details = examSession.data.phase3.map(q => {
            const userAns = (examSession.userAnswers.phase3[q.id] || '').trim();
            const expected = (q.palabra_faltante || '').trim();
            const isCorrect = userAns.toLowerCase() === expected.toLowerCase();
            if (isCorrect) scoreP3 += 1;
            return {
                id: q.id,
                oracion: q.oracion,
                userAnswer: userAns || '(Sin respuesta)',
                correctAnswer: expected,
                isCorrect
            };
        });

        // 4. Calculate local score for Phase 4 (10 pts)
        let scoreP4 = 0;
        const p4Details = examSession.data.phase4.map(q => {
            const userAns = examSession.userAnswers.phase4[q.id];
            const expected = q.opcion_correcta;
            const isCorrect = userAns === expected;
            if (isCorrect) scoreP4 += 1;
            return {
                id: q.id,
                oracion: q.oracion,
                userAnswer: userAns || '(Sin respuesta)',
                correctAnswer: expected,
                isCorrect
            };
        });

        // 5. Calculate local score for Phase 7 (10 pts: 5 V/F + 5 MCQ)
        let scoreP7_vf = 0;
        const p7_vfDetails = (examSession.data.phase7.verdadero_falso || []).map(q => {
            const userAns = examSession.userAnswers.phase7_vf[q.id];
            const expected = q.es_verdadera;
            const isCorrect = userAns === expected;
            if (isCorrect) scoreP7_vf += 1;
            return {
                id: q.id,
                afirmacion: q.afirmacion,
                userAnswer: userAns === undefined ? '(Sin respuesta)' : (userAns ? 'Verdadero' : 'Falso'),
                correctAnswer: expected ? 'Verdadero' : 'Falso',
                isCorrect
            };
        });

        let scoreP7_mcq = 0;
        const p7_mcqDetails = (examSession.data.phase7.opcion_multiple || []).map(q => {
            const userAns = examSession.userAnswers.phase7_mcq[q.id];
            const expected = q.respuesta_correcta;
            const isCorrect = userAns === expected;
            if (isCorrect) scoreP7_mcq += 1;
            return {
                id: q.id,
                pregunta: q.pregunta,
                userAnswer: userAns || '(Sin respuesta)',
                correctAnswer: expected,
                isCorrect
            };
        });

        const scoreP7 = scoreP7_vf + scoreP7_mcq; // out of 10

        // 6. AI Evaluation for Phase 5 and Phase 6
        const p5Submissions = examSession.data.phase5.map(q => ({
            id: q.id,
            escenario: q.escenario,
            pregunta: q.pregunta,
            respuesta_usuario: examSession.userAnswers.phase5[q.id] || ''
        }));

        const p6Submissions = (examSession.data.phase6.preguntas || []).map(q => ({
            id: q.id,
            caracter_asignado: q.caracter_asignado,
            pregunta: q.pregunta,
            respuesta_usuario: examSession.userAnswers.phase6[q.id] || ''
        }));

        let aiEvaluation = null;
        try {
            aiEvaluation = await evaluateExamAIAnswers(p5Submissions, p6Submissions);
        } catch (evalErr) {
            console.warn("Fallo al contactar AI para evaluar Fases 5 y 6, usando fallback automático:", evalErr);
            // Graceful fallback
            aiEvaluation = {
                fase5_evaluacion: p5Submissions.map(s => ({
                    id: s.id,
                    es_correcta: s.respuesta_usuario.trim().length > 1,
                    puntaje: s.respuesta_usuario.trim().length > 1 ? 1.0 : 0.0,
                    comentario: s.respuesta_usuario.trim().length > 1 ? "Respuesta registrada." : "No se ingresó respuesta.",
                    correccion_sugerida: "",
                    pinyin_correccion: ""
                })),
                fase6_evaluacion: p6Submissions.map(s => {
                    const hasChar = s.respuesta_usuario.includes(s.caracter_asignado);
                    return {
                        id: s.id,
                        es_correcta: hasChar,
                        uso_caracter_banco: hasChar,
                        puntaje: hasChar ? 1.0 : 0.0,
                        comentario: hasChar ? `Excelente uso del carácter ${s.caracter_asignado}.` : `Faltó incorporar el carácter asignado: ${s.caracter_asignado}.`,
                        correccion_sugerida: "",
                        pinyin_correccion: ""
                    };
                }),
                resumen_general: "Examen completado."
            };
        }

        // Calculate scores for Phase 5 and 6 from AI feedback
        let scoreP5 = 0;
        const p5EvalMap = new Map((aiEvaluation.fase5_evaluacion || []).map(item => [item.id, item]));
        const p5Details = examSession.data.phase5.map(q => {
            const ev = p5EvalMap.get(q.id) || { puntaje: 0, es_correcta: false, comentario: '' };
            scoreP5 += (ev.puntaje || 0);
            return {
                id: q.id,
                escenario: q.escenario,
                pregunta: q.pregunta,
                pinyin_pregunta: q.pinyin_pregunta,
                traduccion_pregunta: q.traduccion_pregunta,
                userAnswer: examSession.userAnswers.phase5[q.id] || '(Sin respuesta)',
                eval: ev
            };
        });

        let scoreP6 = 0;
        const p6EvalMap = new Map((aiEvaluation.fase6_evaluacion || []).map(item => [item.id, item]));
        const p6Details = (examSession.data.phase6.preguntas || []).map(q => {
            const ev = p6EvalMap.get(q.id) || { puntaje: 0, es_correcta: false, comentario: '' };
            scoreP6 += (ev.puntaje || 0);
            return {
                id: q.id,
                caracter_asignado: q.caracter_asignado,
                pregunta: q.pregunta,
                pinyin_pregunta: q.pinyin_pregunta,
                traduccion_pregunta: q.traduccion_pregunta,
                userAnswer: examSession.userAnswers.phase6[q.id] || '(Sin respuesta)',
                eval: ev
            };
        });

        // Total score calculation
        // Total maximum: P1(10) + P2(10) + P3(5) + P4(10) + P5(5) + P6(5) + P7(10) = 55 points
        const totalPoints = Math.round((scoreP1 + scoreP2 + scoreP3 + scoreP4 + scoreP5 + scoreP6 + scoreP7) * 10) / 10;
        const maxPoints = 55;
        const percentage = Math.round((totalPoints / maxPoints) * 100);

        examSession.results = {
            scores: {
                phase1: scoreP1,
                phase2: scoreP2,
                phase3: scoreP3,
                phase4: scoreP4,
                phase5: scoreP5,
                phase6: scoreP6,
                phase7: scoreP7,
                totalPoints,
                maxPoints,
                percentage
            },
            details: {
                phase1: p1Details,
                phase2: p2Details,
                phase3: p3Details,
                phase4: p4Details,
                phase5: p5Details,
                phase6: p6Details,
                phase7_vf: p7_vfDetails,
                phase7_mcq: p7_mcqDetails
            },
            aiSummary: aiEvaluation.resumen_general || 'Buen desempeño general en la simulación.'
        };

        examSession.status = 'completed';
        saveExamState();
        renderExam();
        showToast("¡Examen evaluado exitosamente!", "success");
    } catch (error) {
        console.error("Error durante la evaluación del examen:", error);
        examSession.status = 'active';
        saveExamState();
        renderExam();
        showToast("Ocurrió un error al evaluar el examen: " + error.message, "error");
    }
};

/**
 * Checks for incomplete questions in any of the 7 phases.
 */
const checkIncompletePhases = () => {
    const incomplete = [];
    const p1Count = Object.keys(examSession.userAnswers.phase1).length;
    if (p1Count < 10) incomplete.push(`Fase 1 (${p1Count}/10)`);

    const p2Count = Object.values(examSession.userAnswers.phase2).filter(v => v && v.trim()).length;
    if (p2Count < 10) incomplete.push(`Fase 2 (${p2Count}/10)`);

    const p3Count = Object.values(examSession.userAnswers.phase3).filter(v => v && v.trim()).length;
    if (p3Count < 5) incomplete.push(`Fase 3 (${p3Count}/5)`);

    const p4Count = Object.keys(examSession.userAnswers.phase4).length;
    if (p4Count < 10) incomplete.push(`Fase 4 (${p4Count}/10)`);

    const p5Count = Object.values(examSession.userAnswers.phase5).filter(v => v && v.trim()).length;
    if (p5Count < 5) incomplete.push(`Fase 5 (${p5Count}/5)`);

    const p6Count = Object.values(examSession.userAnswers.phase6).filter(v => v && v.trim()).length;
    if (p6Count < 5) incomplete.push(`Fase 6 (${p6Count}/5)`);

    const p7VfCount = Object.keys(examSession.userAnswers.phase7_vf).length;
    const p7McqCount = Object.keys(examSession.userAnswers.phase7_mcq).length;
    if (p7VfCount + p7McqCount < 10) incomplete.push(`Fase 7 (${p7VfCount + p7McqCount}/10)`);

    return incomplete;
};

/**
 * Changes active phase in the exam.
 */
const setExamPhase = (phaseNumber) => {
    if (phaseNumber < 1 || phaseNumber > 7) return;
    examSession.currentPhase = phaseNumber;
    saveExamState();
    renderExam();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Clears exam state and returns to idle welcome screen.
 */
const resetExam = () => {
    if (confirm("¿Estás seguro de que deseas salir del examen actual? Se perderán las respuestas no guardadas.")) {
        examSession = {
            status: 'idle',
            currentPhase: 1,
            data: { phase1: [], phase2: [], phase3: [], phase4: [], phase5: [], phase6: { banco_caracteres: [], preguntas: [] }, phase7: { historia: '', verdadero_falso: [], opcion_multiple: [] } },
            userAnswers: { phase1: {}, phase2: {}, phase3: {}, phase4: {}, phase5: {}, phase6: {}, phase7_vf: {}, phase7_mcq: {} },
            results: null,
            loadingMessage: ''
        };
        saveExamState();
        renderExam();
    }
};

/**
 * Main render function for the Exam view.
 */
const renderExam = () => {
    const container = document.getElementById('exam-container');
    if (!container) return;

    if (examSession.status === 'idle') {
        renderExamWelcome(container);
    } else if (examSession.status === 'loading' || examSession.status === 'evaluating') {
        renderExamLoading(container);
    } else if (examSession.status === 'active') {
        renderExamActive(container);
    } else if (examSession.status === 'completed') {
        renderExamResults(container);
    }
};

/**
 * Renders Welcome / Hero screen.
 */
const renderExamWelcome = (container) => {
    loadExamLessonPrefs();
    const allWords = getAllWords();
    const wordCount = allWords.length;
    const allStructs = getAllStructures();
    const structCount = allStructs.length;
    const examWords = getWordsForExam();

    container.innerHTML = `
        <div class="exam-welcome-card">
            <div class="exam-welcome-header">
                <div class="exam-badge">Evaluación Oficial Adaptativa</div>
                <h1 class="exam-title">Simulación de Examen</h1>
                <p class="exam-subtitle">
                    Pon a prueba tus conocimientos de mandarín tradicional taiwanés con una prueba estandarizada completa de 7 fases, 
                    generada dinámicamente con IA utilizando exclusivamente las palabras y estructuras de tu biblioteca personal.
                </p>
                <div class="exam-stats-pills">
                    <span class="exam-pill">📚 ${wordCount} palabras registradas</span>
                    <span class="exam-pill">🧩 ${structCount} estructuras gramaticales</span>
                    <span class="exam-pill">🎯 55 preguntas en 7 fases</span>
                </div>
            </div>

            <!-- Selector de Lecciones (Retroactivo / Acumulativo) -->
            <div class="exam-lesson-selector-card">
                <div class="exam-lesson-selector-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span>Lecciones a evaluar en el examen</span>
                </div>
                <p class="exam-lesson-hint">
                    <strong>Evaluación retroactiva y acumulativa:</strong> Al marcar una lección, se evalúa <em>hasta</em> esa lección (incluyendo el conocimiento previo de las lecciones anteriores).
                </p>
                <div class="exam-lesson-checkboxes" id="exam-lesson-checkboxes">
                    ${[1, 2, 3, 4, 5, 6, 7, 8].map(num => `
                        <label class="exam-lesson-cb-card ${num <= examMaxLesson ? 'active' : ''}">
                            <input type="checkbox" data-lesson="${num}" ${num <= examMaxLesson ? 'checked' : ''}>
                            <span class="cb-label">Lección ${num}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="exam-lesson-extra">
                    <label class="exam-unassigned-checkbox-label">
                        <input type="checkbox" id="exam-toggle-unassigned" ${examIncludeUnassigned ? 'checked' : ''}>
                        <span>Incluir tarjetas sin lección asignada (/)</span>
                    </label>
                    <span class="exam-word-count-badge ${examWords.length < 10 ? 'warning' : ''}" id="exam-word-count-badge">
                        ${examWords.length} palabras seleccionadas para el examen
                    </span>
                </div>
            </div>

            <div class="exam-phases-preview">
                <div class="preview-phase-item">
                    <div class="preview-phase-num">1</div>
                    <div class="preview-phase-info">
                        <h4>Reconocimiento de Caracteres</h4>
                        <p>10 preguntas: Identifica el Hanzi correcto a partir de su Pinyin y Zhuyin entre 10 opciones.</p>
                    </div>
                </div>
                <div class="preview-phase-item">
                    <div class="preview-phase-num">2</div>
                    <div class="preview-phase-info">
                        <h4>Escritura de Pinyin con Tonos</h4>
                        <p>10 preguntas: Escribe el Pinyin exacto con diacríticos tonales mediante el teclado numérico (1-5).</p>
                    </div>
                </div>
                <div class="preview-phase-item">
                    <div class="preview-phase-num">3</div>
                    <div class="preview-phase-info">
                        <h4>Rellenar Espacios en Blanco</h4>
                        <p>5 oraciones: Deduce y escribe el carácter o término faltante en oraciones directas.</p>
                    </div>
                </div>
                <div class="preview-phase-item">
                    <div class="preview-phase-num">4</div>
                    <div class="preview-phase-info">
                        <h4>Gramática y Estructuras Complejas</h4>
                        <p>10 oraciones: Completa patrones avanzados con selección múltiple de 3 opciones (A, B, C).</p>
                    </div>
                </div>
                <div class="preview-phase-item">
                    <div class="preview-phase-num">5</div>
                    <div class="preview-phase-info">
                        <h4>Respuestas en Situaciones Reales</h4>
                        <p>5 escenarios: Responde a preguntas cotidianas en Taiwán con oraciones libres evaluadas por IA.</p>
                    </div>
                </div>
                <div class="preview-phase-item">
                    <div class="preview-phase-num">6</div>
                    <div class="preview-phase-info">
                        <h4>Desafío de Banco de Caracteres</h4>
                        <p>5 preguntas: Formula oraciones incorporando obligatoriamente los 5 caracteres asignados.</p>
                    </div>
                </div>
                <div class="preview-phase-item">
                    <div class="preview-phase-num">7</div>
                    <div class="preview-phase-info">
                        <h4>Comprensión Lectora Integral</h4>
                        <p>Historia corta inédita: 5 afirmaciones de Verdadero/Falso + 5 preguntas de opción múltiple.</p>
                    </div>
                </div>
            </div>

            <div class="exam-welcome-actions">
                <button class="btn btn-primary btn-lg" id="btn-start-exam">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Comenzar Simulación de Examen
                </button>
            </div>
        </div>
    `;

    const updateExamLessonUI = () => {
        container.querySelectorAll('#exam-lesson-checkboxes input[type="checkbox"]').forEach(input => {
            const num = parseInt(input.dataset.lesson, 10);
            const isChecked = num <= examMaxLesson;
            input.checked = isChecked;
            const card = input.closest('.exam-lesson-cb-card');
            if (card) {
                card.classList.toggle('active', isChecked);
            }
        });

        const unassignedInput = container.querySelector('#exam-toggle-unassigned');
        if (unassignedInput) {
            unassignedInput.checked = examIncludeUnassigned;
        }

        const currentExamWords = getWordsForExam();
        const countBadge = container.querySelector('#exam-word-count-badge');
        if (countBadge) {
            countBadge.textContent = `${currentExamWords.length} palabras seleccionadas para el examen`;
            countBadge.classList.toggle('warning', currentExamWords.length < 10);
        }
    };

    const cbContainer = container.querySelector('#exam-lesson-checkboxes');
    if (cbContainer) {
        cbContainer.addEventListener('change', (e) => {
            const target = e.target;
            if (!target.matches('input[type="checkbox"]')) return;
            const clickedNum = parseInt(target.dataset.lesson, 10);
            if (target.checked) {
                examMaxLesson = clickedNum;
            } else {
                examMaxLesson = clickedNum > 1 ? clickedNum - 1 : 0;
            }
            saveExamLessonPrefs();
            updateExamLessonUI();
        });
    }

    const unassignedToggle = container.querySelector('#exam-toggle-unassigned');
    if (unassignedToggle) {
        unassignedToggle.addEventListener('change', (e) => {
            examIncludeUnassigned = e.target.checked;
            saveExamLessonPrefs();
            updateExamLessonUI();
        });
    }

    document.getElementById('btn-start-exam')?.addEventListener('click', startNewExam);
};

/**
 * Renders Loading / Generating screen.
 */
const renderExamLoading = (container) => {
    container.innerHTML = `
        <div class="exam-loading-card">
            <div class="exam-spinner"></div>
            <h2 class="exam-loading-title">Preparando Examen</h2>
            <p class="exam-loading-text">${examSession.loadingMessage || 'Generando contenido con IA...'}</p>
            <div class="exam-loading-tips">
                <p>💡 <em>Tip: En la Fase 2, recuerda presionar 1, 2, 3 o 4 después de cada sílaba para colocar las tildes tonales automáticamente (ej: <code>hao3</code> &rarr; <code>hǎo</code>).</em></p>
            </div>
        </div>
    `;
};

/**
 * Renders Active Exam screen with Top Stepper and Current Phase Content.
 */
const renderExamActive = (container) => {
    const currentPhase = examSession.currentPhase;
    const phaseNames = [
        "1. Hanzi (10 opciones)",
        "2. Pinyin con Tonos",
        "3. Rellenar Espacios",
        "4. Gramática Compleja",
        "5. Escenarios Abiertos",
        "6. Banco de Caracteres",
        "7. Comprensión Lectora"
    ];

    container.innerHTML = `
        <div class="exam-active-layout">
            <!-- Header bar with stepper -->
            <div class="exam-active-header">
                <div class="exam-header-top">
                    <div class="exam-active-title">
                        <h2>Simulación de Examen Oficial</h2>
                        <span class="exam-phase-indicator">Fase ${currentPhase} de 7: ${phaseNames[currentPhase - 1]}</span>
                    </div>
                    <div class="exam-header-actions">
                        <button class="btn btn-secondary btn-sm" id="btn-cancel-exam" title="Salir del examen">
                            Abandonar
                        </button>
                    </div>
                </div>

                <!-- Stepper buttons -->
                <div class="exam-stepper">
                    ${[1, 2, 3, 4, 5, 6, 7].map(num => {
                        const isCurrent = num === currentPhase;
                        const answeredStatus = getPhaseAnsweredStatus(num);
                        return `
                            <button class="exam-step-btn ${isCurrent ? 'active' : ''} ${answeredStatus.completed ? 'completed' : ''}" 
                                    data-phase="${num}">
                                <span class="step-num">${num}</span>
                                <span class="step-label">${answeredStatus.label}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Phase Content Area -->
            <div class="exam-phase-content" id="exam-phase-content">
                ${renderPhaseBody(currentPhase)}
            </div>

            <!-- Footer Navigation Bar -->
            <div class="exam-active-footer">
                <button class="btn btn-secondary" id="btn-prev-phase" ${currentPhase === 1 ? 'disabled' : ''}>
                    &larr; Fase Anterior
                </button>
                <div class="exam-footer-info">
                    <span>${getPhaseProgressSummary(currentPhase)}</span>
                </div>
                ${currentPhase < 7 ? `
                    <button class="btn btn-primary" id="btn-next-phase">
                        Siguiente Fase &rarr;
                    </button>
                ` : `
                    <button class="btn btn-primary btn-submit-exam" id="btn-finish-exam">
                        Finalizar y Evaluar Examen
                    </button>
                `}
            </div>
        </div>
    `;

    // Hook Stepper events
    container.querySelectorAll('.exam-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const phase = parseInt(btn.dataset.phase, 10);
            setExamPhase(phase);
        });
    });

    document.getElementById('btn-cancel-exam')?.addEventListener('click', resetExam);
    document.getElementById('btn-prev-phase')?.addEventListener('click', () => setExamPhase(currentPhase - 1));
    document.getElementById('btn-next-phase')?.addEventListener('click', () => setExamPhase(currentPhase + 1));
    document.getElementById('btn-finish-exam')?.addEventListener('click', finishAndEvaluateExam);

    // Initialize phase-specific listeners
    initPhaseSpecificListeners(currentPhase, container);
};

/**
 * Returns label and completed boolean for stepper pill.
 */
const getPhaseAnsweredStatus = (phaseNum) => {
    switch (phaseNum) {
        case 1: {
            const count = Object.keys(examSession.userAnswers.phase1).length;
            return { completed: count === 10, label: `${count}/10` };
        }
        case 2: {
            const count = Object.values(examSession.userAnswers.phase2).filter(v => v && v.trim()).length;
            return { completed: count === 10, label: `${count}/10` };
        }
        case 3: {
            const count = Object.values(examSession.userAnswers.phase3).filter(v => v && v.trim()).length;
            return { completed: count === 5, label: `${count}/5` };
        }
        case 4: {
            const count = Object.keys(examSession.userAnswers.phase4).length;
            return { completed: count === 10, label: `${count}/10` };
        }
        case 5: {
            const count = Object.values(examSession.userAnswers.phase5).filter(v => v && v.trim()).length;
            return { completed: count === 5, label: `${count}/5` };
        }
        case 6: {
            const count = Object.values(examSession.userAnswers.phase6).filter(v => v && v.trim()).length;
            return { completed: count === 5, label: `${count}/5` };
        }
        case 7: {
            const vf = Object.keys(examSession.userAnswers.phase7_vf).length;
            const mcq = Object.keys(examSession.userAnswers.phase7_mcq).length;
            const total = vf + mcq;
            return { completed: total === 10, label: `${total}/10` };
        }
        default:
            return { completed: false, label: '' };
    }
};

/**
 * Returns human readable progress text for current phase footer.
 */
const getPhaseProgressSummary = (phaseNum) => {
    const status = getPhaseAnsweredStatus(phaseNum);
    return `Respondidas: ${status.label} preguntas`;
};

/**
 * Renders the body corresponding to the active phase.
 */
const renderPhaseBody = (phaseNum) => {
    switch (phaseNum) {
        case 1:
            return renderPhase1();
        case 2:
            return renderPhase2();
        case 3:
            return renderPhase3();
        case 4:
            return renderPhase4();
        case 5:
            return renderPhase5();
        case 6:
            return renderPhase6();
        case 7:
            return renderPhase7();
        default:
            return '';
    }
};

// --------------------------------------------------------------------------
// PHASE 1: Hanzi Recognition (Pinyin + Zhuyin -> 10 options)
// --------------------------------------------------------------------------
const renderPhase1 = () => {
    const questions = examSession.data.phase1 || [];
    return `
        <div class="phase-container phase-1-container">
            <div class="phase-header-banner">
                <h3>Fase 1: Reconocimiento de Caracteres</h3>
                <p>Observa la pronunciación (Pinyin con tonos y Zhuyin) y selecciona el carácter tradicional correcto entre las 10 opciones disponibles.</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const selected = examSession.userAnswers.phase1[q.id];
                    return `
                        <div class="exam-question-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">Pregunta ${idx + 1} de 10</span>
                            </div>
                            <div class="q-prompt-center">
                                <div class="q-pinyin-display">${q.pinyin}</div>
                                ${q.zhuyin ? `<div class="q-zhuyin-display">${q.zhuyin}</div>` : ''}
                            </div>
                            <div class="q-options-grid-10">
                                ${q.options.map((opt) => `
                                    <button type="button" 
                                            class="option-btn-10 ${selected === opt ? 'selected' : ''}" 
                                            data-q-id="${q.id}" 
                                            data-option="${opt}">
                                        ${opt}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};

// --------------------------------------------------------------------------
// PHASE 2: Pinyin Typing with Tone Engine
// --------------------------------------------------------------------------
const renderPhase2 = () => {
    const questions = examSession.data.phase2 || [];
    return `
        <div class="phase-container phase-2-container">
            <div class="phase-header-banner">
                <h3>Fase 2: Escritura de Pinyin con Tonos</h3>
                <p>Escribe el Pinyin exacto para cada uno de los siguientes 10 caracteres o términos. Usa las teclas numéricas <code>1</code>, <code>2</code>, <code>3</code>, <code>4</code> o <code>5</code> para convertir los diacríticos tonales automáticamente.</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const typed = examSession.userAnswers.phase2[q.id] || '';
                    return `
                        <div class="exam-question-card phase2-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">Término ${idx + 1} de 10</span>
                                ${q.categoria ? `<span class="q-badge-cat">${q.categoria}</span>` : ''}
                            </div>
                            <div class="phase2-hanzi-banner">
                                <div class="phase2-hanzi">${q.hanzi}</div>
                            </div>
                            <div class="phase2-input-wrapper">
                                <label for="p2-input-${q.id}">Ingresa el Pinyin con tonos:</label>
                                <input type="text" 
                                       class="form-control phase2-pinyin-input" 
                                       id="p2-input-${q.id}" 
                                       data-q-id="${q.id}" 
                                       placeholder="Ej: nǐ hǎo" 
                                       value="${typed}" 
                                       autocomplete="off" 
                                       spellcheck="false">
                                <div class="phase2-tone-helper">
                                    <span>Tono 1: a1&rarr;ā</span>
                                    <span>Tono 2: a2&rarr;á</span>
                                    <span>Tono 3: a3&rarr;ǎ</span>
                                    <span>Tono 4: a4&rarr;à</span>
                                    <span>Neutro: a5&rarr;a</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};

// --------------------------------------------------------------------------
// PHASE 3: Fill in the Blank (5 direct sentences - 100% Traditional Chinese)
// --------------------------------------------------------------------------
const renderPhase3 = () => {
    const questions = examSession.data.phase3 || [];
    return `
        <div class="phase-container phase-3-container">
            <div class="phase-header-banner">
                <h3>Fase 3: 填空題 (Completar Espacios en Blanco)</h3>
                <p>請閱讀以下 5 個句子，並在空格 <code>[ ___ ]</code> 填入適當的漢字詞語。</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const typed = examSession.userAnswers.phase3[q.id] || '';
                    return `
                        <div class="exam-question-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">第 ${idx + 1} 題（共 5 題）</span>
                            </div>
                            <div class="phase3-sentence-box">
                                <div class="phase3-chinese-text">${q.oracion}</div>
                            </div>
                            <div class="phase3-input-box">
                                <label for="p3-input-${q.id}">請輸入缺少的字詞：</label>
                                <div style="display:flex; gap:0.5rem; max-width: 300px;">
                                    <input type="text" 
                                           class="form-control phase3-fill-input" 
                                           id="p3-input-${q.id}" 
                                           data-q-id="${q.id}" 
                                           placeholder="請輸入漢字..." 
                                           value="${typed}">
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};

// --------------------------------------------------------------------------
// PHASE 4: Complex Sentences (10 sentences -> 3 options A, B, C - 100% Traditional Chinese)
// --------------------------------------------------------------------------
const renderPhase4 = () => {
    const questions = examSession.data.phase4 || [];
    return `
        <div class="phase-container phase-4-container">
            <div class="phase-header-banner">
                <h3>Fase 4: 文法與句型選擇題 (Estructuras Complejas)</h3>
                <p>請閱讀以下 10 個句子，並從 3 個選項中選出最合適的答案完成句子。</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const selected = examSession.userAnswers.phase4[q.id];
                    return `
                        <div class="exam-question-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">第 ${idx + 1} 題（共 10 題）</span>
                            </div>
                            <div class="phase4-sentence-box">
                                <div class="phase4-chinese-text">${q.oracion}</div>
                            </div>
                            <div class="phase4-options-list">
                                ${q.opciones.map((opt, optIdx) => {
                                    const letter = String.fromCharCode(65 + optIdx); // A, B, C
                                    const isChosen = selected === opt;
                                    return `
                                        <button type="button" 
                                                class="phase4-opt-btn ${isChosen ? 'selected' : ''}" 
                                                data-q-id="${q.id}" 
                                                data-option="${opt}">
                                            <span class="opt-letter">${letter}</span>
                                            <span class="opt-text">${opt}</span>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};

// --------------------------------------------------------------------------
// PHASE 5: Contextual Scenarios (5 open questions - 100% Traditional Chinese)
// --------------------------------------------------------------------------
const renderPhase5 = () => {
    const questions = examSession.data.phase5 || [];
    return `
        <div class="phase-container phase-5-container">
            <div class="phase-header-banner">
                <h3>Fase 5: 情境問答 (Situaciones Cotidianas)</h3>
                <p>請根據各題情境，用完整的繁體中文句子回答問題。</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const typed = examSession.userAnswers.phase5[q.id] || '';
                    return `
                        <div class="exam-question-card phase5-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">情境 ${idx + 1}（共 5 題）</span>
                            </div>
                            <div class="phase5-scenario-desc">
                                <strong>📍 情境：</strong> ${q.escenario}
                            </div>
                            <div class="phase5-question-box">
                                <div class="phase5-chinese-q">${q.pregunta}</div>
                            </div>
                            <div class="phase5-input-box">
                                <label for="p5-input-${q.id}">請用繁體中文回答：</label>
                                <textarea class="form-control phase5-textarea" 
                                          id="p5-input-${q.id}" 
                                          data-q-id="${q.id}" 
                                          rows="2" 
                                          placeholder="請在此輸入你的中文回答...">${typed}</textarea>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};

// --------------------------------------------------------------------------
// PHASE 6: Fixed Character Bank (Bank of 5 -> 5 questions forced usage - 100% Chinese)
// --------------------------------------------------------------------------
const renderPhase6 = () => {
    const bank = examSession.data.phase6.banco_caracteres || [];
    const questions = examSession.data.phase6.preguntas || [];
    return `
        <div class="phase-container phase-6-container">
            <div class="phase-header-banner">
                <h3>Fase 6: 指定字造句問答 (Banco de Caracteres Fijos)</h3>
                <p>請使用指定的漢字回答以下問題，造句中必須包含該指定漢字。</p>
            </div>

            <!-- Fixed Character Bank Display -->
            <div class="phase6-bank-panel">
                <div class="phase6-bank-title">🏷️ 本測驗指定字庫：</div>
                <div class="phase6-bank-pills">
                    ${bank.map(char => `
                        <div class="bank-pill-char">${char}</div>
                    `).join('')}
                </div>
            </div>

            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const typed = examSession.userAnswers.phase6[q.id] || '';
                    return `
                        <div class="exam-question-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">第 ${idx + 1} 題（共 5 題）</span>
                                <span class="q-badge-required">必須包含漢字：<strong>${q.caracter_asignado}</strong></span>
                            </div>
                            <div class="phase6-q-box">
                                <div class="phase6-chinese-q">${q.pregunta}</div>
                            </div>
                            <div class="phase6-input-box">
                                <label for="p6-input-${q.id}">你的回答（造句必須使用「${q.caracter_asignado}」）：</label>
                                <input type="text" 
                                       class="form-control phase6-input" 
                                       id="p6-input-${q.id}" 
                                       data-q-id="${q.id}" 
                                       placeholder="請用「${q.caracter_asignado}」寫出完整的句子..." 
                                       value="${typed}">
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};

// --------------------------------------------------------------------------
// PHASE 7: Reading Comprehension (Story + 5 T/F + 5 MCQ - 100% Traditional Chinese)
// --------------------------------------------------------------------------
const renderPhase7 = () => {
    const p7 = examSession.data.phase7 || {};
    const story = p7.historia || '';
    const vfList = p7.verdadero_falso || [];
    const mcqList = p7.opcion_multiple || [];

    return `
        <div class="phase-container phase-7-container">
            <div class="phase-header-banner">
                <h3>Fase 7: 閱讀理解測驗 (Comprensión Lectora)</h3>
                <p>請仔細閱讀以下短文，並完成是非題與單選題。</p>
            </div>

            <!-- Story Card -->
            <div class="phase7-story-card">
                <div class="phase7-story-header">
                    <h4>📖 短文閱讀</h4>
                </div>
                <div class="phase7-story-body">
                    <p class="phase7-story-chinese">${story}</p>
                </div>
            </div>

            <!-- Part A: 是非題 (Verdadero o Falso) -->
            <div class="phase7-sub-section">
                <div class="phase7-sub-title">第一部分：是非題（請判斷是否符合短文內容，共 5 題）</div>
                <div class="phase-questions-list">
                    ${vfList.map((q, idx) => {
                        const chosen = examSession.userAnswers.phase7_vf[q.id];
                        return `
                            <div class="exam-question-card" data-vf-id="${q.id}">
                                <div class="q-header">
                                    <span class="q-number">第 ${idx + 1} 題</span>
                                </div>
                                <div class="phase7-statement-text">${q.afirmacion}</div>
                                <div class="phase7-vf-buttons">
                                    <button type="button" 
                                            class="btn-vf ${chosen === true ? 'selected-true' : ''}" 
                                            data-vf-id="${q.id}" 
                                            data-val="true">
                                        ✓ 是 (正確)
                                    </button>
                                    <button type="button" 
                                            class="btn-vf ${chosen === false ? 'selected-false' : ''}" 
                                            data-vf-id="${q.id}" 
                                            data-val="false">
                                        ✗ 否 (錯誤)
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Part B: 單選題 (Selección Múltiple) -->
            <div class="phase7-sub-section">
                <div class="phase7-sub-title">第二部分：單選題（根據短文選出最佳答案，共 5 題）</div>
                <div class="phase-questions-list">
                    ${mcqList.map((q, idx) => {
                        const chosen = examSession.userAnswers.phase7_mcq[q.id];
                        return `
                            <div class="exam-question-card" data-mcq-id="${q.id}">
                                <div class="q-header">
                                    <span class="q-number">第 ${idx + 1} 題</span>
                                </div>
                                <div class="phase7-mcq-prompt">${q.pregunta}</div>
                                <div class="phase4-options-list">
                                    ${(q.opciones || []).map((opt, optIdx) => {
                                        const letter = String.fromCharCode(65 + optIdx);
                                        const isChosen = chosen === opt;
                                        return `
                                            <button type="button" 
                                                    class="phase4-opt-btn ${isChosen ? 'selected' : ''}" 
                                                    data-mcq-id="${q.id}" 
                                                    data-option="${opt}">
                                                <span class="opt-letter">${letter}</span>
                                                <span class="opt-text">${opt}</span>
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
};

// --------------------------------------------------------------------------
// EVENT LISTENERS INITIALIZATION PER PHASE
// --------------------------------------------------------------------------
const initPhaseSpecificListeners = (phaseNum, container) => {
    if (phaseNum === 1) {
        container.querySelectorAll('.option-btn-10').forEach(btn => {
            btn.addEventListener('click', () => {
                const qId = parseInt(btn.dataset.qId, 10);
                const opt = btn.dataset.option;
                examSession.userAnswers.phase1[qId] = opt;
                saveExamState();
                
                // Update selection UI instantly
                const card = btn.closest('.exam-question-card');
                card.querySelectorAll('.option-btn-10').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updateStepperIndicators();
            });
        });
    } else if (phaseNum === 2) {
        container.querySelectorAll('.phase2-pinyin-input').forEach(input => {
            // Attach Tone Engine (1..5 keys to diacritics)
            if (typeof window.attachPinyinToneInput === 'function') {
                window.attachPinyinToneInput(input);
            }
            input.addEventListener('input', (e) => {
                const qId = parseInt(input.dataset.qId, 10);
                examSession.userAnswers.phase2[qId] = e.target.value;
                saveExamState();
                updateStepperIndicators();
            });
        });
    } else if (phaseNum === 3) {
        container.querySelectorAll('.phase3-fill-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const qId = parseInt(input.dataset.qId, 10);
                examSession.userAnswers.phase3[qId] = e.target.value;
                saveExamState();
                updateStepperIndicators();
            });
        });
    } else if (phaseNum === 4) {
        container.querySelectorAll('.phase4-opt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const qId = parseInt(btn.dataset.qId, 10);
                const opt = btn.dataset.option;
                examSession.userAnswers.phase4[qId] = opt;
                saveExamState();

                const card = btn.closest('.exam-question-card');
                card.querySelectorAll('.phase4-opt-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updateStepperIndicators();
            });
        });
    } else if (phaseNum === 5) {
        container.querySelectorAll('.phase5-textarea').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const qId = parseInt(textarea.dataset.qId, 10);
                examSession.userAnswers.phase5[qId] = e.target.value;
                saveExamState();
                updateStepperIndicators();
            });
        });
    } else if (phaseNum === 6) {
        container.querySelectorAll('.phase6-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const qId = parseInt(input.dataset.qId, 10);
                examSession.userAnswers.phase6[qId] = e.target.value;
                saveExamState();
                updateStepperIndicators();
            });
        });
    } else if (phaseNum === 7) {
        // True/False buttons
        container.querySelectorAll('.btn-vf').forEach(btn => {
            btn.addEventListener('click', () => {
                const vfId = parseInt(btn.dataset.vfId, 10);
                const val = btn.dataset.val === 'true';
                examSession.userAnswers.phase7_vf[vfId] = val;
                saveExamState();

                const card = btn.closest('.exam-question-card');
                card.querySelectorAll('.btn-vf').forEach(b => {
                    b.classList.remove('selected-true', 'selected-false');
                });
                btn.classList.add(val ? 'selected-true' : 'selected-false');
                updateStepperIndicators();
            });
        });

        // MCQ buttons
        container.querySelectorAll('.phase4-opt-btn[data-mcq-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const mcqId = parseInt(btn.dataset.mcqId, 10);
                const opt = btn.dataset.option;
                examSession.userAnswers.phase7_mcq[mcqId] = opt;
                saveExamState();

                const card = btn.closest('.exam-question-card');
                card.querySelectorAll('.phase4-opt-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updateStepperIndicators();
            });
        });
    }
};

/**
 * Updates stepper counters without full re-render.
 */
const updateStepperIndicators = () => {
    document.querySelectorAll('.exam-step-btn').forEach(btn => {
        const num = parseInt(btn.dataset.phase, 10);
        const status = getPhaseAnsweredStatus(num);
        const labelEl = btn.querySelector('.step-label');
        if (labelEl) labelEl.textContent = status.label;
        if (status.completed) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
    });

    const footerSpan = document.querySelector('.exam-footer-info span');
    if (footerSpan) {
        footerSpan.textContent = getPhaseProgressSummary(examSession.currentPhase);
    }
};

// --------------------------------------------------------------------------
// RESULTS SCREEN: Detailed Breakdown & Scoring
// --------------------------------------------------------------------------
const renderExamResults = (container) => {
    const res = examSession.results;
    if (!res) {
        container.innerHTML = `<p>No hay resultados disponibles.</p>`;
        return;
    }

    const { scores, details, aiSummary } = res;
    const isPassing = scores.percentage >= 60;

    container.innerHTML = `
        <div class="exam-results-container">
            <!-- Score Card Header -->
            <div class="exam-score-hero ${isPassing ? 'passing' : 'failing'}">
                <div class="score-badge">${isPassing ? '¡Examen Aprobado!' : 'Requiere Refuerzo'}</div>
                <div class="score-circle">
                    <span class="score-number">${scores.percentage}%</span>
                    <span class="score-points">${scores.totalPoints} / ${scores.maxPoints} pts</span>
                </div>
                <p class="score-feedback-text">${aiSummary}</p>
                <div class="results-actions">
                    <button class="btn btn-primary" id="btn-restart-exam">
                        Realizar Nuevo Examen
                    </button>
                    <button class="btn btn-secondary" id="btn-review-library">
                        Ir a la Biblioteca
                    </button>
                </div>
            </div>

            <!-- Breakdown by Phase -->
            <div class="exam-breakdown-cards">
                <div class="breakdown-card">
                    <div class="b-phase">Fase 1: Reconocimiento</div>
                    <div class="b-score">${scores.phase1} / 10 pts</div>
                </div>
                <div class="breakdown-card">
                    <div class="b-phase">Fase 2: Escritura Pinyin</div>
                    <div class="b-score">${scores.phase2} / 10 pts</div>
                </div>
                <div class="breakdown-card">
                    <div class="b-phase">Fase 3: Espacios en Blanco</div>
                    <div class="b-score">${scores.phase3} / 5 pts</div>
                </div>
                <div class="breakdown-card">
                    <div class="b-phase">Fase 4: Gramática Compleja</div>
                    <div class="b-score">${scores.phase4} / 10 pts</div>
                </div>
                <div class="breakdown-card">
                    <div class="b-phase">Fase 5: Escenarios Abiertos</div>
                    <div class="b-score">${scores.phase5} / 5 pts</div>
                </div>
                <div class="breakdown-card">
                    <div class="b-phase">Fase 6: Banco de Caracteres</div>
                    <div class="b-score">${scores.phase6} / 5 pts</div>
                </div>
                <div class="breakdown-card">
                    <div class="b-phase">Fase 7: Comprensión Lectora</div>
                    <div class="b-score">${scores.phase7} / 10 pts</div>
                </div>
            </div>

            <!-- Detailed Accordion / Review section -->
            <div class="exam-review-section">
                <h3 class="review-title">Revisión Detallada de Respuestas</h3>
                
                <!-- Tab bar for review -->
                <div class="review-tabs">
                    ${[1, 2, 3, 4, 5, 6, 7].map(num => `
                        <button class="review-tab-btn ${num === 1 ? 'active' : ''}" data-review-phase="${num}">
                            Fase ${num}
                        </button>
                    `).join('')}
                </div>

                <div class="review-phase-details" id="review-phase-details">
                    ${renderReviewPhaseContent(1, details)}
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-restart-exam')?.addEventListener('click', startNewExam);
    document.getElementById('btn-review-library')?.addEventListener('click', () => {
        navigateTo('biblioteca');
    });

    container.querySelectorAll('.review-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.review-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const phase = parseInt(btn.dataset.reviewPhase, 10);
            const reviewContainer = document.getElementById('review-phase-details');
            if (reviewContainer) {
                reviewContainer.innerHTML = renderReviewPhaseContent(phase, details);
            }
        });
    });
};

/**
 * Renders individual phase detail review cards.
 */
const renderReviewPhaseContent = (phaseNum, details) => {
    switch (phaseNum) {
        case 1:
            return details.phase1.map((item, idx) => `
                <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>Pregunta ${idx + 1} (${item.pinyin} ${item.zhuyin ? `/ ${item.zhuyin}` : ''})</span>
                        <span class="review-status">${item.isCorrect ? '✓ Correcto (+1 pt)' : '✗ Incorrecto (0 pts)'}</span>
                    </div>
                    <div class="review-content-row">
                        <div>Tu respuesta: <strong>${item.userAnswer}</strong></div>
                        <div>Respuesta correcta: <strong>${item.correctAnswer}</strong></div>
                    </div>
                </div>
            `).join('');

        case 2:
            return details.phase2.map((item, idx) => `
                <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>Carácter: <strong style="font-size:1.2rem; font-family:'Noto Sans TC';">${item.hanzi}</strong></span>
                        <span class="review-status">${item.isCorrect ? '✓ Correcto (+1 pt)' : '✗ Incorrecto (0 pts)'}</span>
                    </div>
                    <div class="review-content-row">
                        <div>Tu Pinyin: <code>${item.userAnswer}</code></div>
                        <div>Pinyin esperado: <code>${item.correctAnswer}</code></div>
                    </div>
                </div>
            `).join('');

        case 3:
            return details.phase3.map((item, idx) => `
                <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>題目：${item.oracion}</span>
                        <span class="review-status">${item.isCorrect ? '✓ 正確 (+1 pt)' : '✗ 錯誤 (0 pts)'}</span>
                    </div>
                    <div class="review-content-row">
                        <div>你的答案：<strong>${item.userAnswer}</strong></div>
                        <div>正確答案：<strong style="color:var(--accent);">${item.correctAnswer}</strong></div>
                    </div>
                </div>
            `).join('');

        case 4:
            return details.phase4.map((item, idx) => `
                <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>題目：${item.oracion}</span>
                        <span class="review-status">${item.isCorrect ? '✓ 正確 (+1 pt)' : '✗ 錯誤 (0 pts)'}</span>
                    </div>
                    <div class="review-content-row">
                        <div>你的選擇：<strong>${item.userAnswer}</strong></div>
                        <div>正確選項：<strong style="color:var(--accent);">${item.correctAnswer}</strong></div>
                    </div>
                </div>
            `).join('');

        case 5:
            return details.phase5.map((item, idx) => `
                <div class="review-item ${item.eval.puntaje >= 1 ? 'correct' : item.eval.puntaje > 0 ? 'partial' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>情境 ${idx + 1}：${item.escenario}</span>
                        <span class="review-status">${item.eval.puntaje} / 1 pt</span>
                    </div>
                    <div class="review-q-prompt">
                        <strong>問題：</strong> ${item.pregunta}
                    </div>
                    <div class="review-content-row">
                        <div>你的回答：<strong style="font-family:'Noto Sans TC';">${item.userAnswer}</strong></div>
                    </div>
                    <div class="review-ai-feedback">
                        <p><strong>教師評語：</strong> ${item.eval.comentario || '已完成評估。'}</p>
                        ${item.eval.correccion_sugerida ? `
                            <p><strong>建議範例：</strong> <span style="font-family:'Noto Sans TC'; font-size:1.05rem;">${item.eval.correccion_sugerida}</span></p>
                        ` : ''}
                    </div>
                </div>
            `).join('');

        case 6:
            return details.phase6.map((item, idx) => `
                <div class="review-item ${item.eval.puntaje >= 1 ? 'correct' : item.eval.puntaje > 0 ? 'partial' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>指定漢字：<strong style="color:var(--accent); font-size:1.15rem;">${item.caracter_asignado}</strong></span>
                        <span class="review-status">${item.eval.puntaje} / 1 pt</span>
                    </div>
                    <div class="review-q-prompt">
                        <strong>問題：</strong> ${item.pregunta}
                    </div>
                    <div class="review-content-row">
                        <div>你的造句：<strong style="font-family:'Noto Sans TC';">${item.userAnswer}</strong></div>
                    </div>
                    <div class="review-ai-feedback">
                        <p><strong>教師評語：</strong> ${item.eval.comentario || '已完成評估。'}</p>
                        ${item.eval.correccion_sugerida ? `
                            <p><strong>建議範例：</strong> <span style="font-family:'Noto Sans TC'; font-size:1.05rem;">${item.eval.correccion_sugerida}</span></p>
                        ` : ''}
                    </div>
                </div>
            `).join('');

        case 7: {
            const vfHtml = details.phase7_vf.map((item, idx) => `
                <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>是非題 ${idx + 1}：${item.afirmacion}</span>
                        <span class="review-status">${item.isCorrect ? '✓ 正確 (+1 pt)' : '✗ 錯誤 (0 pts)'}</span>
                    </div>
                    <div class="review-content-row">
                        <div>你的答案：<strong>${item.userAnswer}</strong></div>
                        <div>正確答案：<strong>${item.correctAnswer}</strong></div>
                    </div>
                </div>
            `).join('');

            const mcqHtml = details.phase7_mcq.map((item, idx) => `
                <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>單選題 ${idx + 1}：${item.pregunta}</span>
                        <span class="review-status">${item.isCorrect ? '✓ 正確 (+1 pt)' : '✗ 錯誤 (0 pts)'}</span>
                    </div>
                    <div class="review-content-row">
                        <div>你的選項：<strong>${item.userAnswer}</strong></div>
                        <div>正確選項：<strong>${item.correctAnswer}</strong></div>
                    </div>
                </div>
            `).join('');

            return `
                <div style="margin-bottom:1.5rem;">
                    <h4 style="margin-bottom:0.75rem; color:var(--text-secondary);">第一部分：是非題</h4>
                    ${vfHtml}
                </div>
                <div>
                    <h4 style="margin-bottom:0.75rem; color:var(--text-secondary);">第二部分：單選題</h4>
                    ${mcqHtml}
                </div>
            `;
        }

        default:
            return '';
    }
};

/**
 * Initializes Exam mode when navigating to the section.
 */
const initExamMode = () => {
    loadExamState();
    renderExam();
};

window.initExamMode = initExamMode;
