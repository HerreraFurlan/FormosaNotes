/**
 * =====================================================
 * AppChino — exam.js
 * Modo Examen Personalizable en 3 Niveles + Enfoque por Lección
 *
 * - Selección libre de Lecciones Foco (ej. solo Lección 8, o varias)
 *   usando las lecciones anteriores como soporte gramatical base.
 * - Nivel 1 (Áreas a evaluar):
 *     1. Vocabulario (Fase 1: Pinyin->Hanzi, Fase 2: Hanzi->Pinyin)
 *     2. Gramática (Fase 3: Completado de frases, Fase 4: Selección múltiple)
 *     3. Redacción (Fase 5: Respuestas libres, Fase 6: Redacción con directrices)
 *     4. Lectura (Fase 7: Verdadero/Falso + Opción múltiple)
 * - Nivel 2 (Cantidad de preguntas por tema): Corto (3), Medio (5), Largo (10)
 * - Nivel 3 (Dificultad / Longitud de frases): Básico, Estándar, Avanzado
 * =====================================================
 */

const EXAM_STORAGE_KEY = 'appchino_exam_state_v3';
const EXAM_PREFS_STORAGE_KEY = 'appchino_exam_prefs_v3';

const DEFAULT_EXAM_PREFS = {
    selectedLessons: [8],
    includeUnassigned: false,
    areas: {
        vocabulario: true,
        gramatica: true,
        redaccion: true,
        lectura: true
    },
    questionCount: 5, // 3 (Corto) | 5 (Medio) | 10 (Largo)
    difficulty: 'estandar' // 'basico' | 'estandar' | 'avanzado'
};

let examPrefs = JSON.parse(JSON.stringify(DEFAULT_EXAM_PREFS));

let examSession = {
    status: 'idle', // 'idle' | 'loading' | 'active' | 'evaluating' | 'completed'
    currentPhase: 1,
    activePhases: [1, 2, 3, 4, 5, 6, 7],
    config: JSON.parse(JSON.stringify(DEFAULT_EXAM_PREFS)),
    data: {
        phase1: [],
        phase2: [],
        phase3: [],
        phase4: [],
        phase5: [],
        phase6: { banco_caracteres: [], preguntas: [] },
        phase7: { historia: '', verdadero_falso: [], opcion_multiple: [] }
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
 * Carga preferencias de personalización del examen desde localStorage.
 */
const loadExamPrefs = () => {
    try {
        const raw = localStorage.getItem(EXAM_PREFS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed.selectedLessons) && parsed.selectedLessons.length > 0) {
                    examPrefs.selectedLessons = parsed.selectedLessons.map(Number).filter(n => n >= 1 && n <= 8);
                }
                if (typeof parsed.includeUnassigned === 'boolean') {
                    examPrefs.includeUnassigned = parsed.includeUnassigned;
                }
                if (parsed.areas && typeof parsed.areas === 'object') {
                    examPrefs.areas = {
                        vocabulario: parsed.areas.vocabulario !== false,
                        gramatica: parsed.areas.gramatica !== false,
                        redaccion: parsed.areas.redaccion !== false,
                        lectura: parsed.areas.lectura !== false
                    };
                    if (!Object.values(examPrefs.areas).some(Boolean)) {
                        examPrefs.areas.vocabulario = true;
                    }
                }
                if ([3, 5, 10].includes(Number(parsed.questionCount))) {
                    examPrefs.questionCount = Number(parsed.questionCount);
                }
                if (['basico', 'estandar', 'avanzado'].includes(parsed.difficulty)) {
                    examPrefs.difficulty = parsed.difficulty;
                }
            }
        }
    } catch (e) {
        console.warn("No se pudieron cargar las preferencias del examen:", e);
    }
};

/**
 * Guarda preferencias de personalización del examen en localStorage.
 */
const saveExamPrefs = () => {
    try {
        localStorage.setItem(EXAM_PREFS_STORAGE_KEY, JSON.stringify(examPrefs));
    } catch (e) {
        console.warn("No se pudieron guardar las preferencias del examen:", e);
    }
};

/**
 * Carga la sesión activa desde sessionStorage.
 */
const loadExamState = () => {
    loadExamPrefs();
    try {
        const raw = sessionStorage.getItem(EXAM_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.status) {
                examSession = parsed;
                if (!Array.isArray(examSession.activePhases) || examSession.activePhases.length === 0) {
                    examSession.activePhases = computeActivePhases(examSession.config?.areas || examPrefs.areas);
                }
            }
        }
    } catch (e) {
        console.warn("No se pudo cargar el estado del examen:", e);
    }
};

/**
 * Guarda la sesión activa en sessionStorage.
 */
const saveExamState = () => {
    try {
        sessionStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(examSession));
    } catch (e) {
        console.warn("No se pudo guardar el estado del examen:", e);
    }
};

/**
 * Determina qué fases numéricas (1..7) están activas según las áreas marcadas.
 */
const computeActivePhases = (areas = examPrefs.areas) => {
    const phases = [];
    if (areas.vocabulario) phases.push(1, 2);
    if (areas.gramatica) phases.push(3, 4);
    if (areas.redaccion) phases.push(5, 6);
    if (areas.lectura) phases.push(7);
    return phases.length > 0 ? phases : [1, 2];
};

/**
 * Obtiene los conjuntos de Vocabulario y Estructuras divididos en:
 * - FOCO (`focusWords`, `focusStructures`): pertenecen directamente a `selectedLessons`
 * - SOPORTE (`supportWords`, `supportStructures`): lecciones anteriores (`<= maxLesson`) para dar contexto
 */
const getExamPools = (prefs = examPrefs) => {
    const selectedSet = new Set((prefs.selectedLessons || [8]).map(Number));
    const maxSelectedLesson = selectedSet.size > 0 ? Math.max(...selectedSet) : 8;
    const allWords = getAllWords();
    const allStructs = getAllStructures();

    const focusWords = allWords.filter(w => {
        const lNum = Number(w.leccion);
        if (lNum && selectedSet.has(lNum)) return true;
        if (!w.leccion && prefs.includeUnassigned) return true;
        return false;
    });

    const supportWords = allWords.filter(w => {
        const lNum = Number(w.leccion);
        if (lNum && lNum <= maxSelectedLesson && !selectedSet.has(lNum)) return true;
        return false;
    });

    const focusStructures = allStructs.filter(s => {
        const lNum = Number(s.leccion);
        if (lNum && selectedSet.has(lNum)) return true;
        if (!s.leccion && prefs.includeUnassigned) return true;
        return false;
    });

    const supportStructures = allStructs.filter(s => {
        const lNum = Number(s.leccion);
        if (lNum && lNum <= maxSelectedLesson && !selectedSet.has(lNum)) return true;
        return false;
    });

    return {
        focusWords,
        supportWords,
        allAllowedWords: [...focusWords, ...supportWords],
        focusStructures: focusStructures.length > 0 ? focusStructures : supportStructures,
        supportStructures,
        maxSelectedLesson
    };
};

/**
 * Normaliza pinyin para comparación justa.
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
 * Mezcla aleatoria (Fisher-Yates).
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
 * Fase 1 Local: Reconocer caracteres dado el Pinyin y Zhuyin (`count` preguntas).
 * Prioriza 100% las palabras de las lecciones FOCO.
 */
const generatePhase1Local = (focusWords, supportWords, count = 5) => {
    const validFocus = focusWords.filter(w => w.tradicional && (w.pinyin || w.zhuyin));
    const validSupport = supportWords.filter(w => w.tradicional && (w.pinyin || w.zhuyin));
    const combinedPool = [...validFocus, ...validSupport];

    if (combinedPool.length === 0) return [];

    let targetWords = shuffleArray(validFocus).slice(0, count);
    if (targetWords.length < count) {
        const extra = shuffleArray(validSupport).slice(0, count - targetWords.length);
        targetWords = [...targetWords, ...extra];
    }

    return targetWords.map((target, idx) => {
        // Priorizar distractores de las mismas lecciones foco
        const focusDistractors = validFocus
            .filter(w => w.tradicional !== target.tradicional)
            .map(w => w.tradicional);
        const supportDistractors = validSupport
            .filter(w => w.tradicional !== target.tradicional)
            .map(w => w.tradicional);

        const uniqueDistractors = Array.from(new Set([...shuffleArray(focusDistractors), ...shuffleArray(supportDistractors)]));
        const selectedDistractors = uniqueDistractors.slice(0, 9);
        const options = shuffleArray([target.tradicional, ...selectedDistractors]);

        return {
            id: idx + 1,
            pinyin: target.pinyin || '',
            zhuyin: target.zhuyin || '',
            espanol: target.espanol || '',
            correctHanzi: target.tradicional,
            options
        };
    });
};

/**
 * Fase 2 Local: Reconocer y escribir el Pinyin con tonos dado el carácter (`count` preguntas).
 * Prioriza 100% las palabras de las lecciones FOCO.
 */
const generatePhase2Local = (focusWords, supportWords, count = 5) => {
    const validFocus = focusWords.filter(w => w.tradicional && w.pinyin);
    const validSupport = supportWords.filter(w => w.tradicional && w.pinyin);

    let selected = shuffleArray(validFocus).slice(0, count);
    if (selected.length < count) {
        const extra = shuffleArray(validSupport).slice(0, count - selected.length);
        selected = [...selected, ...extra];
    }

    return selected.map((w, idx) => ({
        id: idx + 1,
        hanzi: w.tradicional,
        pinyin: w.pinyin,
        zhuyin: w.zhuyin || '',
        categoria: w.categoria || ''
    }));
};

/**
 * Construye en local las `count` directrices para la Fase 6 (Redacción con directrices),
 * combinando palabras clave y estructuras gramaticales de las lecciones FOCO.
 */
const buildLocalDirectivesBank = (focusWords, focusStructures, count = 5) => {
    const directives = [];

    // 1. Tomar hasta la mitad de directrices de estructuras gramaticales foco (ej. "比 (A + 比 + B + Vs)")
    const structCount = Math.min(focusStructures.length, Math.ceil(count / 2));
    const pickedStructs = shuffleArray(focusStructures).slice(0, structCount);
    pickedStructs.forEach(s => {
        const shortFormula = (s.formula || '').split('|')[0].replace(/^Afirm\.:\s*/i, '').trim();
        directives.push({
            tipo: 'estructura',
            valor: shortFormula || s.nombre
        });
    });

    // 2. Completar el resto con palabras versátiles del vocabulario foco (V, Vs, Adv, Prep, Conj, Phr, N)
    const priorityWords = focusWords.filter(w =>
        ['V', 'Adv', 'Prep', 'Conj', 'Phr', 'N'].includes(w.categoria) && w.tradicional
    );
    const wordPool = priorityWords.length >= (count - directives.length) ? priorityWords : focusWords;
    const pickedWords = shuffleArray(wordPool).slice(0, count - directives.length);

    pickedWords.forEach(w => {
        directives.push({
            tipo: 'palabra',
            valor: w.tradicional
        });
    });

    return shuffleArray(directives).slice(0, count);
};

const verifyPhase1Answer = (targetHanzi, userAnswer) => {
    if (!targetHanzi || !userAnswer) return false;
    return userAnswer.trim() === targetHanzi.trim();
};

const verifyPhase2Answer = (expectedPinyin, userAnswer) => {
    const normUser = normalizePinyinComparison((userAnswer || '').trim());
    if (!normUser) return false;
    const alternatives = (expectedPinyin || '').split('/').map(a => normalizePinyinComparison(a));
    return alternatives.includes(normUser);
};

/**
 * Inicia y genera un nuevo examen personalizado.
 */
const startNewExam = async () => {
    loadExamPrefs();
    const pools = getExamPools(examPrefs);
    const activePhases = computeActivePhases(examPrefs.areas);
    const qCount = examPrefs.questionCount || 5;

    if (pools.focusWords.length < 3) {
        showToast("Selecciona al menos una lección con vocabulario disponible.", "warning");
        return;
    }

    examSession.config = JSON.parse(JSON.stringify(examPrefs));
    examSession.activePhases = activePhases;
    examSession.currentPhase = activePhases[0];
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

    const needsAI = examPrefs.areas.gramatica || examPrefs.areas.redaccion || examPrefs.areas.lectura;

    if (needsAI) {
        examSession.status = 'loading';
        examSession.loadingMessage = `Diseñando examen enfocado en L${examPrefs.selectedLessons.join(', L')} (${qCount} preguntas por subfase)...`;
        saveExamState();
        renderExam();
    }

    try {
        // 1. Fases locales de Vocabulario (si el área Vocabulario está activa)
        const p1 = examPrefs.areas.vocabulario
            ? generatePhase1Local(pools.focusWords, pools.supportWords, qCount)
            : [];
        const p2 = examPrefs.areas.vocabulario
            ? generatePhase2Local(pools.focusWords, pools.supportWords, qCount)
            : [];

        // 2. Fases con IA (solo si Gramática, Redacción o Lectura están activas)
        let aiData = { fase3: [], fase4: [], fase5: [], fase6: { banco_caracteres: [], preguntas: [] }, fase7: { historia: '', verdadero_falso: [], opcion_multiple: [] } };
        if (needsAI) {
            const directivesBank = examPrefs.areas.redaccion
                ? buildLocalDirectivesBank(pools.focusWords, pools.focusStructures, qCount)
                : [];

            aiData = await generateExamAIData({
                focusWords: pools.focusWords,
                supportWords: pools.supportWords,
                focusStructures: pools.focusStructures,
                supportStructures: pools.supportStructures,
                selectedLessons: examPrefs.selectedLessons,
                areas: examPrefs.areas,
                questionCount: qCount,
                difficulty: examPrefs.difficulty,
                directivesBank
            });
        }

        examSession.data = {
            phase1: p1,
            phase2: p2,
            phase3: (aiData.fase3 || []).slice(0, qCount),
            phase4: (aiData.fase4 || []).slice(0, qCount),
            phase5: (aiData.fase5 || []).slice(0, qCount),
            phase6: {
                banco_caracteres: aiData.fase6?.banco_caracteres || [],
                preguntas: (aiData.fase6?.preguntas || []).slice(0, qCount)
            },
            phase7: {
                historia: aiData.fase7?.historia || '',
                verdadero_falso: (aiData.fase7?.verdadero_falso || []).slice(0, qCount),
                opcion_multiple: (aiData.fase7?.opcion_multiple || []).slice(0, qCount)
            }
        };

        examSession.status = 'active';
        examSession.currentPhase = activePhases[0];
        saveExamState();
        renderExam();
        showToast("¡Examen listo! Mucho éxito.", "success");
    } catch (err) {
        console.error("Error al iniciar el examen:", err);
        examSession.status = 'idle';
        saveExamState();
        renderExam();
        showToast("Error al generar el examen con IA: " + (err.message || "Intenta nuevamente"), "error");
    }
};

/**
 * Califica todas las áreas activas del examen.
 */
const finishAndEvaluateExam = async () => {
    const missingPhases = checkIncompletePhases();
    if (missingPhases.length > 0) {
        const confirmMsg = `Tienes preguntas sin responder en: ${missingPhases.join(', ')}. ¿Deseas calificar y finalizar el examen de todos modos?`;
        if (!confirm(confirmMsg)) {
            return;
        }
    }

    const activePhases = examSession.activePhases || [1, 2, 3, 4, 5, 6, 7];
    const hasWriting = activePhases.includes(5) || activePhases.includes(6);

    if (hasWriting) {
        examSession.status = 'evaluating';
        examSession.loadingMessage = 'El profesor IA está evaluando tu redacción y calculando tu puntuación...';
        saveExamState();
        renderExam();
    }

    try {
        // 1. Fase 1
        let scoreP1 = 0;
        const p1Details = (examSession.data.phase1 || []).map(q => {
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

        // 2. Fase 2
        let scoreP2 = 0;
        const p2Details = (examSession.data.phase2 || []).map(q => {
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

        // 3. Fase 3
        let scoreP3 = 0;
        const p3Details = (examSession.data.phase3 || []).map(q => {
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

        // 4. Fase 4
        let scoreP4 = 0;
        const p4Details = (examSession.data.phase4 || []).map(q => {
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

        // 5. Fase 7 (Lectura)
        let scoreP7_vf = 0;
        const p7_vfDetails = (examSession.data.phase7?.verdadero_falso || []).map(q => {
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
        const p7_mcqDetails = (examSession.data.phase7?.opcion_multiple || []).map(q => {
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

        const scoreP7 = scoreP7_vf + scoreP7_mcq;

        // 6. Evaluación con IA para Redacción (Fases 5 y 6) solo si están activas
        let scoreP5 = 0;
        let scoreP6 = 0;
        let p5Details = [];
        let p6Details = [];
        let aiSummary = '¡Excelente práctica enfocada en las lecciones seleccionadas!';

        if (hasWriting) {
            const p5Submissions = (examSession.data.phase5 || []).map(q => ({
                id: q.id,
                escenario: q.escenario,
                pregunta: q.pregunta,
                ejemplo_respuesta: q.ejemplo_respuesta || '',
                respuesta_usuario: examSession.userAnswers.phase5[q.id] || ''
            }));

            const p6Submissions = (examSession.data.phase6?.preguntas || []).map(q => ({
                id: q.id,
                caracter_asignado: q.caracter_asignado,
                pregunta: q.pregunta,
                ejemplo_respuesta: q.ejemplo_respuesta || '',
                respuesta_usuario: examSession.userAnswers.phase6[q.id] || ''
            }));

            let aiEvaluation = null;
            try {
                aiEvaluation = await evaluateExamAIAnswers(p5Submissions, p6Submissions);
            } catch (evalErr) {
                console.warn("Fallo al contactar IA para evaluar Fases 5 y 6, usando fallback:", evalErr);
                aiEvaluation = {
                    fase5_evaluacion: p5Submissions.map(s => ({
                        id: s.id,
                        es_correcta: s.respuesta_usuario.trim().length > 1,
                        puntaje: s.respuesta_usuario.trim().length > 1 ? 1.0 : 0.0,
                        comentario: s.respuesta_usuario.trim().length > 1 ? "Respuesta registrada." : "No se ingresó respuesta.",
                        correccion_sugerida: s.ejemplo_respuesta || "",
                        pinyin_correccion: ""
                    })),
                    fase6_evaluacion: p6Submissions.map(s => {
                        const hasReply = s.respuesta_usuario.trim().length > 1;
                        return {
                            id: s.id,
                            es_correcta: hasReply,
                            uso_caracter_banco: hasReply,
                            puntaje: hasReply ? 1.0 : 0.0,
                            comentario: hasReply ? "Respuesta registrada." : "No se ingresó respuesta.",
                            correccion_sugerida: s.ejemplo_respuesta || "",
                            pinyin_correccion: ""
                        };
                    }),
                    resumen_general: "Examen completado."
                };
            }

            const p5EvalMap = new Map((aiEvaluation.fase5_evaluacion || []).map(item => [item.id, item]));
            p5Details = (examSession.data.phase5 || []).map(q => {
                const ev = p5EvalMap.get(q.id) || { puntaje: 0, es_correcta: false, comentario: '' };
                scoreP5 += (ev.puntaje || 0);
                return {
                    id: q.id,
                    escenario: q.escenario,
                    pregunta: q.pregunta,
                    userAnswer: examSession.userAnswers.phase5[q.id] || '(Sin respuesta)',
                    eval: ev
                };
            });

            const p6EvalMap = new Map((aiEvaluation.fase6_evaluacion || []).map(item => [item.id, item]));
            p6Details = (examSession.data.phase6?.preguntas || []).map(q => {
                const ev = p6EvalMap.get(q.id) || { puntaje: 0, es_correcta: false, comentario: '' };
                scoreP6 += (ev.puntaje || 0);
                return {
                    id: q.id,
                    caracter_asignado: q.caracter_asignado,
                    pregunta: q.pregunta,
                    userAnswer: examSession.userAnswers.phase6[q.id] || '(Sin respuesta)',
                    eval: ev
                };
            });

            if (aiEvaluation.resumen_general) {
                aiSummary = aiEvaluation.resumen_general;
            }
        }

        const maxByPhase = {
            1: (examSession.data.phase1 || []).length,
            2: (examSession.data.phase2 || []).length,
            3: (examSession.data.phase3 || []).length,
            4: (examSession.data.phase4 || []).length,
            5: (examSession.data.phase5 || []).length,
            6: (examSession.data.phase6?.preguntas || []).length,
            7: (examSession.data.phase7?.verdadero_falso || []).length + (examSession.data.phase7?.opcion_multiple || []).length
        };

        const scoreByPhase = {
            1: scoreP1,
            2: scoreP2,
            3: scoreP3,
            4: scoreP4,
            5: scoreP5,
            6: scoreP6,
            7: scoreP7
        };

        let totalPoints = 0;
        let maxPoints = 0;
        activePhases.forEach(p => {
            totalPoints += (scoreByPhase[p] || 0);
            maxPoints += (maxByPhase[p] || 0);
        });
        totalPoints = Math.round(totalPoints * 10) / 10;
        const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

        examSession.results = {
            scores: {
                phase1: scoreP1,
                phase2: scoreP2,
                phase3: scoreP3,
                phase4: scoreP4,
                phase5: scoreP5,
                phase6: scoreP6,
                phase7: scoreP7,
                maxByPhase,
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
            aiSummary
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
 * Verifica preguntas incompletas únicamente en las fases activas.
 */
const checkIncompletePhases = () => {
    const incomplete = [];
    const activePhases = examSession.activePhases || [1, 2, 3, 4, 5, 6, 7];

    activePhases.forEach(p => {
        const status = getPhaseAnsweredStatus(p);
        if (!status.completed) {
            incomplete.push(`Fase ${p} (${status.label})`);
        }
    });

    return incomplete;
};

/**
 * Cambia a una fase activa del examen.
 */
const setExamPhase = (phaseNumber) => {
    const activePhases = examSession.activePhases || [1, 2, 3, 4, 5, 6, 7];
    if (!activePhases.includes(phaseNumber)) return;
    examSession.currentPhase = phaseNumber;
    saveExamState();
    renderExam();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Abandona el examen actual y vuelve a la pantalla de configuración.
 */
const resetExam = () => {
    if (confirm("¿Estás seguro de que deseas salir del examen actual? Se perderán las respuestas no guardadas.")) {
        examSession.status = 'idle';
        examSession.results = null;
        saveExamState();
        renderExam();
    }
};

/**
 * Renderizador principal del modo examen.
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
 * Calcula el total de preguntas estimado según las preferencias seleccionadas.
 */
const getEstimatedTotalQuestions = (prefs = examPrefs) => {
    const n = prefs.questionCount || 5;
    let total = 0;
    if (prefs.areas.vocabulario) total += n * 2; // Fases 1 y 2
    if (prefs.areas.gramatica) total += n * 2;   // Fases 3 y 4
    if (prefs.areas.redaccion) total += n * 2;   // Fases 5 y 6
    if (prefs.areas.lectura) total += n * 2;     // Fase 7 (N V/F + N MCQ)
    return total;
};

/**
 * Pantalla de bienvenida y configuración en 3 niveles + selector libre de lecciones.
 */
const renderExamWelcome = (container) => {
    loadExamPrefs();
    const pools = getExamPools(examPrefs);
    const totalQuestions = getEstimatedTotalQuestions(examPrefs);
    const activePhases = computeActivePhases(examPrefs.areas);
    const qCount = examPrefs.questionCount;

    const lessonNumbers = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.lessons && APP_CONFIG.lessons.items)
        ? APP_CONFIG.lessons.items.map(l => l.number)
        : [1, 2, 3, 4, 5, 6, 7, 8];
    const maxLessonNum = Math.max(...lessonNumbers);

    container.innerHTML = `
        <div class="exam-welcome-card">
            <div class="exam-welcome-header">
                <div class="exam-badge">Simulador Oficial TOCFL · Personalizable</div>
                <h1 class="exam-title">Simulación de Examen</h1>
                <p class="exam-subtitle">Configura las lecciones foco que vas a presentar y personaliza las áreas, la extensión y la complejidad de las frases.</p>
                <div class="exam-stats-pills" id="exam-header-pills">
                    <span class="exam-pill">🎯 Foco: L${examPrefs.selectedLessons.slice().sort((a,b)=>a-b).join(', L')} (${pools.focusWords.length} palabras · ${pools.focusStructures.length} estructuras)</span>
                    <span class="exam-pill">🧱 Soporte base: ${pools.supportWords.length} palabras previas</span>
                    <span class="exam-pill">📝 ${totalQuestions} preguntas (${activePhases.length} subfases)</span>
                </div>
            </div>

            <!-- PASO 0: Selector libre de Lecciones Foco -->
            <div class="exam-lesson-selector-card">
                <div class="exam-section-header-row">
                    <div class="exam-lesson-selector-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <span>Lecciones a evaluar (Enfoque directo)</span>
                    </div>
                    <div class="exam-quick-lesson-btns">
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-exam-only-latest" title="Enfocar únicamente en la última lección">
                            🎯 Solo L${maxLessonNum}
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-exam-all-lessons" title="Seleccionar todas las lecciones">
                            📚 Todas (L1–L${maxLessonNum})
                        </button>
                    </div>
                </div>
                <p class="exam-lesson-hint">
                    Selecciona <strong>cualquier combinación de lecciones</strong> para que el examen evalúe sus palabras y estructuras. Las lecciones anteriores se usarán únicamente como base gramatical de soporte.
                </p>
                <div class="exam-lesson-checkboxes" id="exam-lesson-checkboxes">
                    ${lessonNumbers.map(num => {
                        const isChecked = examPrefs.selectedLessons.includes(num);
                        return `
                            <label class="exam-lesson-cb-card ${isChecked ? 'active' : ''}">
                                <input type="checkbox" data-lesson="${num}" ${isChecked ? 'checked' : ''}>
                                <span class="cb-label">Lección ${num}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
                <div class="exam-lesson-extra">
                    <label class="exam-unassigned-checkbox-label">
                        <input type="checkbox" id="exam-toggle-unassigned" ${examPrefs.includeUnassigned ? 'checked' : ''}>
                        <span>Incluir tarjetas sin lección asignada (/)</span>
                    </label>
                    <span class="exam-word-count-badge" id="exam-word-count-badge">
                        🎯 ${pools.focusWords.length} palabras foco · ${pools.focusStructures.length} estructuras foco
                    </span>
                </div>
            </div>

            <!-- NIVEL 1: Áreas a Evaluar -->
            <div class="exam-custom-section">
                <div class="exam-custom-title">1. Áreas a evaluar</div>
                <div class="exam-areas-grid" id="exam-areas-grid">
                    <label class="exam-area-card ${examPrefs.areas.vocabulario ? 'active' : ''}">
                        <input type="checkbox" data-area="vocabulario" ${examPrefs.areas.vocabulario ? 'checked' : ''}>
                        <div class="exam-area-body">
                            <div class="exam-area-title">📖 Vocabulario <span class="exam-area-tag">Fases 1–2</span></div>
                            <p class="exam-area-desc">Reconocer caracteres dado el Pinyin y escribir el Pinyin con tonos dado el carácter (${qCount * 2} reactivos).</p>
                        </div>
                    </label>

                    <label class="exam-area-card ${examPrefs.areas.gramatica ? 'active' : ''}">
                        <input type="checkbox" data-area="gramatica" ${examPrefs.areas.gramatica ? 'checked' : ''}>
                        <div class="exam-area-body">
                            <div class="exam-area-title">🧩 Gramática <span class="exam-area-tag">Fases 3–4</span></div>
                            <p class="exam-area-desc">Completado de frases (<code>[ ___ ]</code>) y selección múltiple (A, B, C) sobre las estructuras foco (${qCount * 2} reactivos).</p>
                        </div>
                    </label>

                    <label class="exam-area-card ${examPrefs.areas.redaccion ? 'active' : ''}">
                        <input type="checkbox" data-area="redaccion" ${examPrefs.areas.redaccion ? 'checked' : ''}>
                        <div class="exam-area-body">
                            <div class="exam-area-title">✍️ Redacción <span class="exam-area-tag">Fases 5–6</span></div>
                            <p class="exam-area-desc">Respuestas a preguntas libres y redacción con directrices (usar palabra o estructura específica) (${qCount * 2} reactivos).</p>
                        </div>
                    </label>

                    <label class="exam-area-card ${examPrefs.areas.lectura ? 'active' : ''}">
                        <input type="checkbox" data-area="lectura" ${examPrefs.areas.lectura ? 'checked' : ''}>
                        <div class="exam-area-body">
                            <div class="exam-area-title">📜 Lectura <span class="exam-area-tag">Fase 7</span></div>
                            <p class="exam-area-desc">Relato en chino tradicional con preguntas de Verdadero/Falso y Opción Múltiple (${qCount * 2} reactivos).</p>
                        </div>
                    </label>
                </div>
            </div>

            <!-- NIVEL 2 Y NIVEL 3 EN FILA -->
            <div class="exam-custom-row-2col">
                <!-- NIVEL 2: Cantidad de preguntas por tema -->
                <div class="exam-custom-section">
                    <div class="exam-custom-title">2. Cantidad de preguntas por tema</div>
                    <div class="exam-segmented-group" id="exam-count-group">
                        <button type="button" class="exam-seg-btn ${examPrefs.questionCount === 3 ? 'active' : ''}" data-count="3">
                            <strong>⚡ Corto (3)</strong>
                            <small>3 por subfase</small>
                        </button>
                        <button type="button" class="exam-seg-btn ${examPrefs.questionCount === 5 ? 'active' : ''}" data-count="5">
                            <strong>⚖️ Medio (5)</strong>
                            <small>5 por subfase</small>
                        </button>
                        <button type="button" class="exam-seg-btn ${examPrefs.questionCount === 10 ? 'active' : ''}" data-count="10">
                            <strong>🏆 Largo (10)</strong>
                            <small>10 por subfase</small>
                        </button>
                    </div>
                </div>

                <!-- NIVEL 3: Dificultad (Longitud de frases) -->
                <div class="exam-custom-section">
                    <div class="exam-custom-title">3. Dificultad (Longitud de frases)</div>
                    <div class="exam-segmented-group" id="exam-difficulty-group">
                        <button type="button" class="exam-seg-btn ${examPrefs.difficulty === 'basico' ? 'active' : ''}" data-diff="basico">
                            <strong>🟢 Básico</strong>
                            <small>Frases cortas (6–10 caract.)</small>
                        </button>
                        <button type="button" class="exam-seg-btn ${examPrefs.difficulty === 'estandar' ? 'active' : ''}" data-diff="estandar">
                            <strong>🟡 Estándar</strong>
                            <small>Nivel examen (10–16 caract.)</small>
                        </button>
                        <button type="button" class="exam-seg-btn ${examPrefs.difficulty === 'avanzado' ? 'active' : ''}" data-diff="avanzado">
                            <strong>🔴 Avanzado</strong>
                            <small>Compuestas (16–25 caract.)</small>
                        </button>
                    </div>
                </div>
            </div>

            <div class="exam-welcome-actions">
                <button class="btn btn-primary btn-lg" id="btn-start-exam">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Comenzar Examen (${totalQuestions} preguntas)
                </button>
            </div>
        </div>
    `;

    // Eventos de Lecciones individuales
    const cbContainer = container.querySelector('#exam-lesson-checkboxes');
    if (cbContainer) {
        cbContainer.addEventListener('change', (e) => {
            const target = e.target;
            if (!target.matches('input[type="checkbox"]')) return;
            const num = parseInt(target.dataset.lesson, 10);
            if (target.checked) {
                if (!examPrefs.selectedLessons.includes(num)) {
                    examPrefs.selectedLessons.push(num);
                }
            } else {
                if (examPrefs.selectedLessons.length <= 1) {
                    target.checked = true;
                    showToast("Debe haber al menos 1 lección seleccionada.", "warning");
                    return;
                }
                examPrefs.selectedLessons = examPrefs.selectedLessons.filter(n => n !== num);
            }
            saveExamPrefs();
            renderExamWelcome(container);
        });
    }

    container.querySelector('#btn-exam-only-latest')?.addEventListener('click', () => {
        examPrefs.selectedLessons = [maxLessonNum];
        saveExamPrefs();
        renderExamWelcome(container);
    });

    container.querySelector('#btn-exam-all-lessons')?.addEventListener('click', () => {
        examPrefs.selectedLessons = [...lessonNumbers];
        saveExamPrefs();
        renderExamWelcome(container);
    });

    container.querySelector('#exam-toggle-unassigned')?.addEventListener('change', (e) => {
        examPrefs.includeUnassigned = e.target.checked;
        saveExamPrefs();
        renderExamWelcome(container);
    });

    // Eventos Nivel 1: Áreas
    container.querySelector('#exam-areas-grid')?.addEventListener('change', (e) => {
        const input = e.target;
        if (!input.matches('input[data-area]')) return;
        const areaKey = input.dataset.area;
        examPrefs.areas[areaKey] = input.checked;
        if (!Object.values(examPrefs.areas).some(Boolean)) {
            examPrefs.areas[areaKey] = true;
            input.checked = true;
            showToast("Selecciona al menos un área a evaluar.", "warning");
            return;
        }
        saveExamPrefs();
        renderExamWelcome(container);
    });

    // Eventos Nivel 2: Cantidad de preguntas
    container.querySelectorAll('#exam-count-group .exam-seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            examPrefs.questionCount = parseInt(btn.dataset.count, 10);
            saveExamPrefs();
            renderExamWelcome(container);
        });
    });

    // Eventos Nivel 3: Dificultad
    container.querySelectorAll('#exam-difficulty-group .exam-seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            examPrefs.difficulty = btn.dataset.diff;
            saveExamPrefs();
            renderExamWelcome(container);
        });
    });

    document.getElementById('btn-start-exam')?.addEventListener('click', startNewExam);
};

/**
 * Pantalla de carga / evaluación.
 */
const renderExamLoading = (container) => {
    const isEvaluating = examSession.status === 'evaluating';
    const title = isEvaluating ? "Evaluando Examen" : "Preparando Examen Personalizado";
    const message = examSession.loadingMessage || (isEvaluating
        ? "El profesor IA está evaluando tus respuestas..."
        : "Generando reactivos enfocados en las lecciones seleccionadas...");

    container.innerHTML = `
        <div class="exam-loading-card">
            <div class="exam-spinner"></div>
            <h2 class="exam-loading-title">${title}</h2>
            <p class="exam-loading-text">${message}</p>
            <div class="exam-loading-tips">
                <p>💡 <em>Tip: En la Fase 2 (Pinyin), presiona 1, 2, 3 o 4 después de cada sílaba para poner los tonos automáticamente (ej: hao3 → hǎo).</em></p>
            </div>
        </div>
    `;
};

const PHASE_NAMES = {
    1: "1. Reconocer Caracteres",
    2: "2. Escribir Pinyin",
    3: "3. Completar Frases",
    4: "4. Opción Múltiple Gramatical",
    5: "5. Respuestas Libres",
    6: "6. Redacción con Directriz",
    7: "7. Comprensión Lectora"
};

/**
 * Pantalla de Examen Activo (con Stepper dinámico solo para las fases seleccionadas).
 */
const renderExamActive = (container) => {
    const activePhases = examSession.activePhases || [1, 2, 3, 4, 5, 6, 7];
    const currentPhase = activePhases.includes(examSession.currentPhase) ? examSession.currentPhase : activePhases[0];
    examSession.currentPhase = currentPhase;

    const currentIdx = activePhases.indexOf(currentPhase);
    const prevPhase = currentIdx > 0 ? activePhases[currentIdx - 1] : null;
    const nextPhase = currentIdx < activePhases.length - 1 ? activePhases[currentIdx + 1] : null;
    const focusedLessons = (examSession.config?.selectedLessons || [8]).join(', L');

    container.innerHTML = `
        <div class="exam-active-layout">
            <div class="exam-active-header">
                <div class="exam-header-top">
                    <div class="exam-active-title">
                        <h2>Examen · Lección L${focusedLessons}</h2>
                        <span class="exam-phase-indicator">Paso ${currentIdx + 1} de ${activePhases.length}: ${PHASE_NAMES[currentPhase]}</span>
                    </div>
                    <div class="exam-header-actions">
                        <button class="btn btn-secondary btn-sm" id="btn-cancel-exam" title="Salir del examen">
                            Abandonar
                        </button>
                    </div>
                </div>

                <!-- Stepper dinámico -->
                <div class="exam-stepper">
                    ${activePhases.map(num => {
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

            <div class="exam-phase-content" id="exam-phase-content">
                ${renderPhaseBody(currentPhase)}
            </div>

            <div class="exam-active-footer">
                <button class="btn btn-secondary" id="btn-prev-phase" ${prevPhase === null ? 'disabled' : ''}>
                    &larr; Anterior
                </button>
                <div class="exam-footer-info">
                    <span>${getPhaseProgressSummary(currentPhase)}</span>
                </div>
                ${nextPhase !== null ? `
                    <button class="btn btn-primary" id="btn-next-phase">
                        Siguiente &rarr;
                    </button>
                ` : `
                    <button class="btn btn-primary btn-submit-exam" id="btn-finish-exam">
                        Finalizar y Calificar Examen
                    </button>
                `}
            </div>
        </div>
    `;

    container.querySelectorAll('.exam-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const phase = parseInt(btn.dataset.phase, 10);
            setExamPhase(phase);
        });
    });

    document.getElementById('btn-cancel-exam')?.addEventListener('click', resetExam);
    if (prevPhase !== null) {
        document.getElementById('btn-prev-phase')?.addEventListener('click', () => setExamPhase(prevPhase));
    }
    if (nextPhase !== null) {
        document.getElementById('btn-next-phase')?.addEventListener('click', () => setExamPhase(nextPhase));
    }
    document.getElementById('btn-finish-exam')?.addEventListener('click', finishAndEvaluateExam);

    initPhaseSpecificListeners(currentPhase, container);
};

/**
 * Calcula cuántas preguntas se han respondido en una fase respecto al total real de esa fase.
 */
const getPhaseAnsweredStatus = (phaseNum) => {
    switch (phaseNum) {
        case 1: {
            const total = (examSession.data.phase1 || []).length;
            const count = Object.keys(examSession.userAnswers.phase1).length;
            return { completed: total > 0 && count >= total, label: `${count}/${total}` };
        }
        case 2: {
            const total = (examSession.data.phase2 || []).length;
            const count = Object.values(examSession.userAnswers.phase2).filter(v => v && v.trim()).length;
            return { completed: total > 0 && count >= total, label: `${count}/${total}` };
        }
        case 3: {
            const total = (examSession.data.phase3 || []).length;
            const count = Object.values(examSession.userAnswers.phase3).filter(v => v && v.trim()).length;
            return { completed: total > 0 && count >= total, label: `${count}/${total}` };
        }
        case 4: {
            const total = (examSession.data.phase4 || []).length;
            const count = Object.keys(examSession.userAnswers.phase4).length;
            return { completed: total > 0 && count >= total, label: `${count}/${total}` };
        }
        case 5: {
            const total = (examSession.data.phase5 || []).length;
            const count = Object.values(examSession.userAnswers.phase5).filter(v => v && v.trim()).length;
            return { completed: total > 0 && count >= total, label: `${count}/${total}` };
        }
        case 6: {
            const total = (examSession.data.phase6?.preguntas || []).length;
            const count = Object.values(examSession.userAnswers.phase6).filter(v => v && v.trim()).length;
            return { completed: total > 0 && count >= total, label: `${count}/${total}` };
        }
        case 7: {
            const total = (examSession.data.phase7?.verdadero_falso || []).length + (examSession.data.phase7?.opcion_multiple || []).length;
            const vf = Object.keys(examSession.userAnswers.phase7_vf).length;
            const mcq = Object.keys(examSession.userAnswers.phase7_mcq).length;
            const count = vf + mcq;
            return { completed: total > 0 && count >= total, label: `${count}/${total}` };
        }
        default:
            return { completed: false, label: '0/0' };
    }
};

const getPhaseProgressSummary = (phaseNum) => {
    const status = getPhaseAnsweredStatus(phaseNum);
    return `Respondidas: ${status.label} preguntas`;
};

const renderPhaseBody = (phaseNum) => {
    switch (phaseNum) {
        case 1: return renderPhase1();
        case 2: return renderPhase2();
        case 3: return renderPhase3();
        case 4: return renderPhase4();
        case 5: return renderPhase5();
        case 6: return renderPhase6();
        case 7: return renderPhase7();
        default: return '';
    }
};

// --------------------------------------------------------------------------
// FASE 1: Reconocer Caracteres dado el Pinyin/Zhuyin
// --------------------------------------------------------------------------
const renderPhase1 = () => {
    const questions = examSession.data.phase1 || [];
    return `
        <div class="phase-container phase-1-container">
            <div class="phase-header-banner">
                <h3>Fase 1: Reconocimiento de Caracteres (Vocabulario)</h3>
                <p>Selecciona la palabra en caracteres tradicionales que corresponde al Pinyin y Zhuyin mostrados.</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const selected = examSession.userAnswers.phase1[q.id];
                    return `
                        <div class="exam-question-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">Pregunta ${idx + 1} de ${questions.length}</span>
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
// FASE 2: Reconocer Pinyin dado el Carácter
// --------------------------------------------------------------------------
const renderPhase2 = () => {
    const questions = examSession.data.phase2 || [];
    return `
        <div class="phase-container phase-2-container">
            <div class="phase-header-banner">
                <h3>Fase 2: Reconocer el Pinyin dado el Carácter (Vocabulario)</h3>
                <p>Escribe el Pinyin con tonos para cada palabra (usa las teclas 1 a 5 para colocar tildes tonales).</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const typed = examSession.userAnswers.phase2[q.id] || '';
                    return `
                        <div class="exam-question-card phase2-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">Término ${idx + 1} de ${questions.length}</span>
                                ${q.categoria ? `<span class="q-badge-cat">${(window.getCategoryLabel ? window.getCategoryLabel(q.categoria) : q.categoria)}</span>` : ''}
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
// FASE 3: Gramática — Completado de Frases
// --------------------------------------------------------------------------
const renderPhase3 = () => {
    const questions = examSession.data.phase3 || [];
    return `
        <div class="phase-container phase-3-container">
            <div class="phase-header-banner">
                <h3>Fase 3: 填空題 · Completado de Frases (Gramática)</h3>
                <p>Lee las siguientes ${questions.length} oraciones y escribe en el espacio <code>[ ___ ]</code> la palabra adecuada.</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const typed = examSession.userAnswers.phase3[q.id] || '';
                    return `
                        <div class="exam-question-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">第 ${idx + 1} 題（共 ${questions.length} 題）</span>
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
// FASE 4: Gramática — Selección Múltiple
// --------------------------------------------------------------------------
const renderPhase4 = () => {
    const questions = examSession.data.phase4 || [];
    return `
        <div class="phase-container phase-4-container">
            <div class="phase-header-banner">
                <h3>Fase 4: 文法與句型選擇題 · Selección Múltiple (Gramática)</h3>
                <p>Elige la opción correcta (A, B o C) que completa gramaticalmente cada oración.</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const selected = examSession.userAnswers.phase4[q.id];
                    return `
                        <div class="exam-question-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">第 ${idx + 1} 題（共 ${questions.length} 題）</span>
                            </div>
                            <div class="phase4-sentence-box">
                                <div class="phase4-chinese-text">${q.oracion}</div>
                            </div>
                            <div class="phase4-options-list">
                                ${(q.opciones || []).map((opt, optIdx) => {
                                    const letter = String.fromCharCode(65 + optIdx);
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
// FASE 5: Redacción — Respuestas a Frases Libres
// --------------------------------------------------------------------------
const renderPhase5 = () => {
    const questions = examSession.data.phase5 || [];
    return `
        <div class="phase-container phase-5-container">
            <div class="phase-header-banner">
                <h3>Fase 5: 情境問答 · Respuestas a Frases Libres (Redacción)</h3>
                <p>Responde en chino tradicional a cada pregunta según el escenario planteado.</p>
            </div>
            <div class="phase-questions-list">
                ${questions.map((q, idx) => {
                    const typed = examSession.userAnswers.phase5[q.id] || '';
                    return `
                        <div class="exam-question-card phase5-card" data-q-id="${q.id}">
                            <div class="q-header">
                                <span class="q-number">情境 ${idx + 1}（共 ${questions.length} 題）</span>
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
// FASE 6: Redacción con Directrices (Palabra o Estructura obligatoria)
// --------------------------------------------------------------------------
const renderPhase6 = () => {
    const bank = examSession.data.phase6?.banco_caracteres || [];
    const questions = examSession.data.phase6?.preguntas || [];
    return `
        <div class="phase-container phase-6-container">
            <div class="phase-header-banner">
                <h3>Fase 6: 指定詞語與句型造句 · Redacción con Directrices</h3>
                <p>Responde a cada pregunta utilizando obligatoriamente la palabra o estructura gramatical indicada.</p>
            </div>

            <div class="phase6-bank-panel">
                <div class="phase6-bank-title">🏷️ Directrices obligatorias de esta sección:</div>
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
                                <span class="q-number">第 ${idx + 1} 題（共 ${questions.length} 題）</span>
                                <span class="q-badge-required">Directriz obligatoria: <strong>${q.caracter_asignado}</strong></span>
                            </div>
                            <div class="phase6-q-box">
                                <div class="phase6-chinese-q">${q.pregunta}</div>
                            </div>
                            <div class="phase6-input-box">
                                <label for="p6-input-${q.id}">Tu respuesta (usando «${q.caracter_asignado}»):</label>
                                <input type="text" 
                                       class="form-control phase6-input" 
                                       id="p6-input-${q.id}" 
                                       data-q-id="${q.id}" 
                                       placeholder="Escribe una oración completa aplicando «${q.caracter_asignado}»..." 
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
// FASE 7: Lectura (Verdadero/Falso + Opción Múltiple)
// --------------------------------------------------------------------------
const renderPhase7 = () => {
    const p7 = examSession.data.phase7 || {};
    const story = p7.historia || '';
    const vfList = p7.verdadero_falso || [];
    const mcqList = p7.opcion_multiple || [];

    return `
        <div class="phase-container phase-7-container">
            <div class="phase-header-banner">
                <h3>Fase 7: 閱讀理解 · Comprensión Lectora</h3>
                <p>Lee el texto y responde las preguntas de Verdadero/Falso (${vfList.length}) y Opción Múltiple (${mcqList.length}).</p>
            </div>

            <div class="phase7-story-card">
                <div class="phase7-story-header">
                    <h4>📖 短文閱讀</h4>
                </div>
                <div class="phase7-story-body">
                    <p class="phase7-story-chinese">${story}</p>
                </div>
            </div>

            <div class="phase7-sub-section">
                <div class="phase7-sub-title">第一部分：是非題（Verdadero / Falso — ${vfList.length} 題）</div>
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
                                        ✓ 是 (Verdadero)
                                    </button>
                                    <button type="button" 
                                            class="btn-vf ${chosen === false ? 'selected-false' : ''}" 
                                            data-vf-id="${q.id}" 
                                            data-val="false">
                                        ✗ 否 (Falso)
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="phase7-sub-section">
                <div class="phase7-sub-title">第二部分：單選題（Opción Múltiple — ${mcqList.length} 題）</div>
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

const initPhaseSpecificListeners = (phaseNum, container) => {
    if (phaseNum === 1) {
        container.querySelectorAll('.option-btn-10').forEach(btn => {
            btn.addEventListener('click', () => {
                const qId = parseInt(btn.dataset.qId, 10);
                const opt = btn.dataset.option;
                examSession.userAnswers.phase1[qId] = opt;
                saveExamState();

                const card = btn.closest('.exam-question-card');
                card.querySelectorAll('.option-btn-10').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updateStepperIndicators();
            });
        });
    } else if (phaseNum === 2) {
        container.querySelectorAll('.phase2-pinyin-input').forEach(input => {
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

const updateStepperIndicators = () => {
    document.querySelectorAll('.exam-step-btn').forEach(btn => {
        const num = parseInt(btn.dataset.phase, 10);
        const status = getPhaseAnsweredStatus(num);
        const labelEl = btn.querySelector('.step-label');
        if (labelEl) labelEl.textContent = status.label;
        btn.classList.toggle('completed', status.completed);
    });

    const footerSpan = document.querySelector('.exam-footer-info span');
    if (footerSpan) {
        footerSpan.textContent = getPhaseProgressSummary(examSession.currentPhase);
    }
};

// --------------------------------------------------------------------------
// PANTALLA DE RESULTADOS (Solo muestra las fases que estuvieron activas)
// --------------------------------------------------------------------------
const renderExamResults = (container) => {
    const res = examSession.results;
    if (!res) {
        container.innerHTML = `<p>No hay resultados disponibles.</p>`;
        return;
    }

    const { scores, details, aiSummary } = res;
    const activePhases = examSession.activePhases || [1, 2, 3, 4, 5, 6, 7];
    const isPassing = scores.percentage >= 60;
    const firstReviewPhase = activePhases[0] || 1;

    container.innerHTML = `
        <div class="exam-results-container">
            <div class="exam-score-hero ${isPassing ? 'passing' : 'failing'}">
                <div class="score-badge">${isPassing ? "¡Examen Aprobado!" : "Requiere Refuerzo"}</div>
                <div class="score-circle">
                    <span class="score-number">${scores.percentage}%</span>
                    <span class="score-points">${scores.totalPoints} / ${scores.maxPoints} pts</span>
                </div>
                <p class="score-feedback-text">${aiSummary}</p>
                <div class="results-actions">
                    <button class="btn btn-primary" id="btn-configure-new-exam">
                        Configurar / Nuevo Examen
                    </button>
                    <button class="btn btn-secondary" id="btn-review-library">
                        Ir a la Biblioteca
                    </button>
                </div>
            </div>

            <div class="exam-breakdown-cards">
                ${activePhases.map(num => {
                    const sc = scores[`phase${num}`] || 0;
                    const mx = scores.maxByPhase?.[num] || 0;
                    return `
                        <div class="breakdown-card">
                            <div class="b-phase">${PHASE_NAMES[num]}</div>
                            <div class="b-score">${sc} / ${mx} pts</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="exam-review-section">
                <h3 class="review-title">Revisión Detallada de Respuestas</h3>
                <div class="review-tabs">
                    ${activePhases.map((num, idx) => `
                        <button class="review-tab-btn ${idx === 0 ? 'active' : ''}" data-review-phase="${num}">
                            Fase ${num}
                        </button>
                    `).join('')}
                </div>
                <div class="review-phase-details" id="review-phase-details">
                    ${renderReviewPhaseContent(firstReviewPhase, details)}
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-configure-new-exam')?.addEventListener('click', () => {
        examSession.status = 'idle';
        examSession.results = null;
        saveExamState();
        renderExam();
    });
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

const renderReviewPhaseContent = (phaseNum, details) => {
    switch (phaseNum) {
        case 1:
            return (details.phase1 || []).map((item, idx) => `
                <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>Pregunta ${idx + 1} (${item.pinyin} ${item.zhuyin ? `/ ${item.zhuyin}` : ''})</span>
                        <span class="review-status">${item.isCorrect ? "✓ Correcto (+1 pt)" : "✗ Incorrecto (0 pts)"}</span>
                    </div>
                    <div class="review-content-row">
                        <div>Tu respuesta: <strong>${item.userAnswer}</strong></div>
                        <div>Respuesta correcta: <strong>${item.correctAnswer}</strong></div>
                    </div>
                </div>
            `).join('');

        case 2:
            return (details.phase2 || []).map((item) => `
                <div class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>Carácter: <strong style="font-size:1.2rem; font-family:'Noto Sans TC';">${item.hanzi}</strong></span>
                        <span class="review-status">${item.isCorrect ? "✓ Correcto (+1 pt)" : "✗ Incorrecto (0 pts)"}</span>
                    </div>
                    <div class="review-content-row">
                        <div>Tu Pinyin: <code>${item.userAnswer}</code></div>
                        <div>Pinyin esperado: <code>${item.correctAnswer}</code></div>
                    </div>
                </div>
            `).join('');

        case 3:
            return (details.phase3 || []).map((item) => `
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
            return (details.phase4 || []).map((item) => `
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
            return (details.phase5 || []).map((item, idx) => `
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
            return (details.phase6 || []).map((item) => `
                <div class="review-item ${item.eval.puntaje >= 1 ? 'correct' : item.eval.puntaje > 0 ? 'partial' : 'incorrect'}">
                    <div class="review-item-header">
                        <span>Directriz: <strong style="color:var(--accent); font-size:1.1rem;">${item.caracter_asignado}</strong></span>
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
            const vfHtml = (details.phase7_vf || []).map((item, idx) => `
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

            const mcqHtml = (details.phase7_mcq || []).map((item, idx) => `
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

const initExamMode = () => {
    loadExamState();
    renderExam();
};

window.initExamMode = initExamMode;
window.renderExam = renderExam;
