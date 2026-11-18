/**
 * =====================================================
 * AppChino — study.js
 * Redesigned Study Mode:
 * Three distinct modalities:
 * 1. "caracteres": Study seeing characters (front: Hanzi [+cat]; back: meaning, pinyin, zhuyin [+cat, notes, rads])
 * 2. "pronunciacion": Study seeing pronunciation (front: Pinyin & Zhuyin [+cat]; back: meaning & Hanzi [+cat, notes, rads])
 * 3. "definicion": Study seeing definition (front: meaning [+cat]; back: Hanzi, Pinyin & Zhuyin [+cat, notes, rads])
 * =====================================================
 */

const STUDY_MODE_STORAGE_KEY = 'appchino_study_mode_v2';
const STUDY_SHOW_CAT_KEY = 'appchino_study_show_cat_v2';
const STUDY_SHOW_NOTES_KEY = 'appchino_study_show_notes_v2';
const STUDY_SHOW_RADS_KEY = 'appchino_study_show_rads_v2';
const STUDY_LESSON_FILTER_KEY = 'appchino_study_lesson_filters_v2';
const STUDY_PROGRESS_STORAGE_KEY = 'appchino_study_progress_v1';
const STUDY_UNMASTERED_FILTER_KEY = 'appchino_study_only_unmastered_v1';

let studyDeck = [];
let studyIndex = 0;
let currentStudyLessons = ['todas'];
let studyOnlyUnmastered = false;
let studyProgress = {}; // { [wordId]: 'known' | 'unknown' }

// Backward compatibility properties
Object.defineProperty(window, 'currentStudyFilter', {
    get: () => 'todos',
    set: () => {}
});
Object.defineProperty(window, 'currentStudyLessonFilter', {
    get: () => currentStudyLessons[0] || 'todas',
    set: (val) => { currentStudyLessons = val ? [val] : ['todas']; }
});

// Modes: 'caracteres' | 'pronunciacion' | 'definicion'
let currentStudyMode = 'caracteres';
let studyShowCategory = true;
let studyShowNotes = true;
let studyShowRadicals = true;

/**
 * Loads card study status map from localStorage.
 */
const loadStudyProgress = () => {
    try {
        const raw = localStorage.getItem(STUDY_PROGRESS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                studyProgress = parsed;
            }
        }
    } catch (e) {
        console.warn("No se pudo cargar el progreso de estudio:", e);
    }
};

/**
 * Saves card study status map to localStorage.
 */
const saveStudyProgress = () => {
    try {
        localStorage.setItem(STUDY_PROGRESS_STORAGE_KEY, JSON.stringify(studyProgress));
    } catch (e) {
        console.warn("No se pudo guardar el progreso de estudio:", e);
    }
};

/**
 * Returns the study status of a word ('known' | 'unknown' | null).
 * @param {string} wordId
 * @returns {'known'|'unknown'|null}
 */
const getCardStudyStatus = (wordId) => {
    if (!wordId) return null;
    const val = studyProgress[wordId];
    return (val === 'known' || val === 'unknown') ? val : null;
};

/**
 * Returns all words matching the currently selected lessons.
 */
const getLessonFilteredStudyWords = () => {
    let words = getAllWords();
    if (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.matchesLessonFilter === 'function') {
        words = words.filter(w => APP_CONFIG.matchesLessonFilter(w, currentStudyLessons));
    }
    return words;
};

/**
 * Computes known/unknown counts within the active lesson filter.
 */
const getStudyProgressCounts = () => {
    const words = getLessonFilteredStudyWords();
    let known = 0;
    let unknown = 0;
    words.forEach(w => {
        const st = getCardStudyStatus(w.id);
        if (st === 'known') known++;
        else if (st === 'unknown') unknown++;
    });
    return { known, unknown, total: words.length };
};

/**
 * Loads preferences from localStorage.
 */
const loadStudyPreferences = () => {
    try {
        const savedMode = localStorage.getItem(STUDY_MODE_STORAGE_KEY);
        if (savedMode === 'caracteres' || savedMode === 'pronunciacion' || savedMode === 'definicion') {
            currentStudyMode = savedMode;
        }

        const savedCat = localStorage.getItem(STUDY_SHOW_CAT_KEY);
        if (savedCat !== null) {
            studyShowCategory = savedCat === 'true';
        }

        const savedNotes = localStorage.getItem(STUDY_SHOW_NOTES_KEY);
        if (savedNotes !== null) {
            studyShowNotes = savedNotes === 'true';
        }

        const savedRads = localStorage.getItem(STUDY_SHOW_RADS_KEY);
        if (savedRads !== null) {
            studyShowRadicals = savedRads === 'true';
        }

        const savedLessons = localStorage.getItem(STUDY_LESSON_FILTER_KEY) || localStorage.getItem('appchino_study_lesson_filter_v1');
        if (savedLessons) {
            try {
                const parsed = JSON.parse(savedLessons);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    currentStudyLessons = parsed;
                } else if (typeof parsed === 'string' && parsed) {
                    currentStudyLessons = [parsed];
                }
            } catch {
                currentStudyLessons = [savedLessons];
            }
        }

        const savedUnmastered = localStorage.getItem(STUDY_UNMASTERED_FILTER_KEY);
        if (savedUnmastered !== null) {
            studyOnlyUnmastered = savedUnmastered === 'true';
        }

        loadStudyProgress();
    } catch (e) {
        console.warn("No se pudieron cargar las preferencias de estudio:", e);
    }
};

/**
 * Saves preferences to localStorage.
 */
const saveStudyPreferences = () => {
    try {
        localStorage.setItem(STUDY_MODE_STORAGE_KEY, currentStudyMode);
        localStorage.setItem(STUDY_SHOW_CAT_KEY, String(studyShowCategory));
        localStorage.setItem(STUDY_SHOW_NOTES_KEY, String(studyShowNotes));
        localStorage.setItem(STUDY_SHOW_RADS_KEY, String(studyShowRadicals));
        localStorage.setItem(STUDY_LESSON_FILTER_KEY, JSON.stringify(currentStudyLessons));
        localStorage.setItem(STUDY_UNMASTERED_FILTER_KEY, String(studyOnlyUnmastered));
    } catch (e) {
        console.warn("No se pudieron guardar las preferencias de estudio:", e);
    }
};

/**
 * Initializes the study deck with filtered and shuffled words.
 * @param {string|Array<string>} [lessonsArg] - Lesson filter(s)
 */
const initStudyMode = (lessonsArg, legacyLessonsArg) => {
    loadStudyPreferences();
    const resolvedLessons = legacyLessonsArg !== undefined ? legacyLessonsArg : lessonsArg;
    if (resolvedLessons !== undefined) {
        currentStudyLessons = Array.isArray(resolvedLessons) ? [...resolvedLessons] : [resolvedLessons];
    }
    if (!currentStudyLessons || currentStudyLessons.length === 0) currentStudyLessons = ['todas'];
    saveStudyPreferences();

    let words = getLessonFilteredStudyWords();

    // Filter out known cards when "Por estudiar" pill is active
    if (studyOnlyUnmastered) {
        words = words.filter(w => getCardStudyStatus(w.id) !== 'known');
    }

    // Fisher-Yates shuffle
    studyDeck = [...words];
    for (let i = studyDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [studyDeck[i], studyDeck[j]] = [studyDeck[j], studyDeck[i]];
    }

    studyIndex = 0;
    updateStudyToolbarUI();
    renderStudyCard();
};

/**
 * Switches the study modality ('caracteres' | 'pronunciacion' | 'definicion').
 * @param {string} mode
 */
const setStudyMode = (mode) => {
    if (['caracteres', 'pronunciacion', 'definicion'].includes(mode)) {
        currentStudyMode = mode;
        saveStudyPreferences();
        updateStudyToolbarUI();
        renderStudyCard();
    }
};

/**
 * Updates UI active states on the top toolbar without full re-render.
 */
const updateStudyToolbarUI = () => {
    document.querySelectorAll('.study-mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.studyMode === currentStudyMode);
    });

    const toggleCat = document.getElementById('study-toggle-categoria');
    if (toggleCat) toggleCat.checked = studyShowCategory;

    const toggleNotes = document.getElementById('study-toggle-notas');
    if (toggleNotes) toggleNotes.checked = studyShowNotes;

    const toggleRads = document.getElementById('study-toggle-radicales');
    if (toggleRads) toggleRads.checked = studyShowRadicals;

    document.querySelectorAll('#study-lesson-filters .chip').forEach(chip => {
        const lessonVal = chip.dataset.lessonFilter;
        chip.classList.toggle('active', currentStudyLessons.includes(lessonVal));
    });

    const unmasteredPill = document.getElementById('study-unmastered-pill');
    if (unmasteredPill) {
        unmasteredPill.classList.toggle('active', studyOnlyUnmastered);
        unmasteredPill.setAttribute('aria-pressed', String(studyOnlyUnmastered));
    }
};

/**
 * Updates the active visual state of the mark buttons and tracker summary in place.
 */
const updateStudyMarkButtonsUI = () => {
    const word = studyDeck[studyIndex];
    const status = word ? getCardStudyStatus(word.id) : null;

    const btnKnown = document.getElementById('study-mark-known');
    if (btnKnown) {
        const isKnown = status === 'known';
        btnKnown.classList.toggle('is-marked-known', isKnown);
        btnKnown.setAttribute('aria-pressed', String(isKnown));
    }

    const btnUnknown = document.getElementById('study-mark-unknown');
    if (btnUnknown) {
        const isUnknown = status === 'unknown';
        btnUnknown.classList.toggle('is-marked-unknown', isUnknown);
        btnUnknown.setAttribute('aria-pressed', String(isUnknown));
    }

    const counts = getStudyProgressCounts();
    const knownEl = document.getElementById('study-known-count');
    if (knownEl) knownEl.textContent = String(counts.known);
    const unknownEl = document.getElementById('study-unknown-count');
    if (unknownEl) unknownEl.textContent = String(counts.unknown);
};

/**
 * Toggles the study status ('known' | 'unknown') for the currently displayed card.
 * @param {'known'|'unknown'} targetStatus
 */
const toggleCurrentCardStudyStatus = (targetStatus) => {
    if (!studyDeck.length || !studyDeck[studyIndex]) return;
    const word = studyDeck[studyIndex];
    if (studyProgress[word.id] === targetStatus) {
        delete studyProgress[word.id];
    } else {
        studyProgress[word.id] = targetStatus;
    }
    saveStudyProgress();
    updateStudyMarkButtonsUI();
};

/**
 * Helper to build radicals HTML display using O(1) getWordById.
 */
const getRadicalsHtml = (word) => {
    if (!word || !word.radicales) return '';
    const lookup = (id) => (typeof getWordById === 'function' ? getWordById(id) : getAllWords().find(w => w.id === id));
    const getMeaning = (w) => (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');

    if (Array.isArray(word.radicales)) {
        return word.radicales.map(rad => {
            if (rad.type === 'text') return rad.value;
            if (rad.type === 'ref') {
                const refWord = lookup(rad.id);
                return refWord ? `<span class="radical-ref" data-ref-id="${rad.id}" data-level="0">${refWord.tradicional} (${getMeaning(refWord)})</span>` : '';
            }
            return '';
        }).filter(Boolean).join(' + ');
    }
    return String(word.radicales);
};

/**
 * Helper to build classifier HTML display using O(1) getWordById.
 */
const getClassifierHtml = (word) => {
    if (!word || !word.clasificador) return '';
    const clf = (typeof getWordById === 'function')
        ? getWordById(word.clasificador)
        : getAllWords().find(w => w.id === word.clasificador);
    if (clf) {
        return `<span class="radical-ref" data-ref-id="${clf.id}" data-level="0">${clf.tradicional} (${clf.pinyin})</span>`;
    }
    return word.clasificador;
};

/**
 * Renders the front and back faces based on current study mode.
 */
const buildCardFacesHtml = (word) => {
    const charLen = (word.tradicional || '').length;
    const lenClass = charLen <= 1 ? 'len-1' : charLen === 2 ? 'len-2' : charLen === 3 ? 'len-3' : charLen === 4 ? 'len-4' : charLen === 5 ? 'len-5' : charLen === 6 ? 'len-6' : 'len-long';
    const pinyinLenClass = (word.pinyin || '').length > 16 ? 'pinyin-long' : '';

    const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
    const posBadge = (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.getWordPOSBadgeInfo === 'function')
        ? APP_CONFIG.getWordPOSBadgeInfo(word, lang)
        : { label: window.getCategoryLabel ? window.getCategoryLabel(word.categoria) : (CATEGORY_LABELS[word.categoria] || word.categoria), tooltip: '' };
    const lessonShort = word.leccion
        ? ((window.I18N && window.I18N.getLessonLabel) ? window.I18N.getLessonLabel(word.leccion, true) : `L${word.leccion}`)
        : '';

    const categoryBadge = studyShowCategory ? `
        <span class="card-category-badge badge badge-${word.categoria}" title="${posBadge.tooltip || ''}">
            ${posBadge.label}${lessonShort ? ` · ${lessonShort}` : ''}
        </span>
    ` : '';

    const classifierHtml = getClassifierHtml(word);
    const radicalsHtml = getRadicalsHtml(word);

    let extraComponentsHtml = '';
    if ((studyShowCategory && classifierHtml) || (studyShowRadicals && radicalsHtml)) {
        extraComponentsHtml = `
            <div class="card-components-block" style="margin-top:0.5rem; text-align:center;">
                ${(studyShowCategory && classifierHtml) ? `<div class="card-clf-val">${classifierHtml}</div>` : ''}
                ${(studyShowRadicals && radicalsHtml) ? `<div class="card-rad-val">${radicalsHtml}</div>` : ''}
            </div>
        `;
    }

    const meaningText = (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(word) : (word.espanol || '');
    const notesText = (window.I18N && window.I18N.getWordNotes) ? window.I18N.getWordNotes(word) : (word.notas || '');

    const notesHtml = (studyShowNotes && notesText) ? `
        <div class="study-card-notes" title="${(window.I18N && window.I18N.t) ? window.I18N.t('cardNotes') : 'Notas'}">
            ${notesText}
        </div>
    ` : '';

    const flipHint = (typeof window !== 'undefined' && window.I18N)
        ? window.I18N.t('studyFlipHint')
        : 'Toca o presiona espacio para voltear';

    if (currentStudyMode === 'caracteres') {
        const frontHtml = `
            <div class="card-face card-front study-mode-caracteres-front">
                ${categoryBadge}
                <div class="study-card-body">
                    <div class="chinese-char ${lenClass}">${word.tradicional}</div>
                </div>
                <div class="study-flip-hint">${flipHint}</div>
            </div>
        `;

        const backHtml = `
            <div class="card-face card-back study-mode-caracteres-back">
                ${categoryBadge}
                <div class="study-card-body">
                    <div class="spanish-meaning">${meaningText}</div>
                    <div class="study-pronunciation-block">
                        <div class="pinyin-label ${pinyinLenClass}">${word.pinyin}</div>
                        ${word.zhuyin ? `<div class="zhuyin-label">${word.zhuyin}</div>` : ''}
                    </div>
                    ${extraComponentsHtml}
                </div>
                ${notesHtml}
            </div>
        `;
        return { frontHtml, backHtml };
    }

    if (currentStudyMode === 'pronunciacion') {
        const frontHtml = `
            <div class="card-face card-front study-mode-pronunciacion-front">
                ${categoryBadge}
                <div class="study-card-body">
                    <div class="study-prompt-pinyin ${pinyinLenClass}">${word.pinyin}</div>
                    ${word.zhuyin ? `<div class="study-prompt-zhuyin">${word.zhuyin}</div>` : ''}
                </div>
                <div class="study-flip-hint">${flipHint}</div>
            </div>
        `;

        const backHtml = `
            <div class="card-face card-back study-mode-pronunciacion-back">
                ${categoryBadge}
                <div class="study-card-body">
                    <div class="chinese-char ${lenClass}" style="margin-bottom:0.4rem;">${word.tradicional}</div>
                    <div class="spanish-meaning">${meaningText}</div>
                    ${extraComponentsHtml}
                </div>
                ${notesHtml}
            </div>
        `;
        return { frontHtml, backHtml };
    }

    if (currentStudyMode === 'definicion') {
        const frontHtml = `
            <div class="card-face card-front study-mode-definicion-front">
                ${categoryBadge}
                <div class="study-card-body">
                    <div class="study-prompt-definition">${meaningText}</div>
                </div>
                <div class="study-flip-hint">${flipHint}</div>
            </div>
        `;

        const backHtml = `
            <div class="card-face card-back study-mode-definicion-back">
                ${categoryBadge}
                <div class="study-card-body">
                    <div class="chinese-char ${lenClass}" style="margin-bottom:0.35rem;">${word.tradicional}</div>
                    <div class="study-pronunciation-block">
                        <div class="pinyin-label ${pinyinLenClass}">${word.pinyin}</div>
                        ${word.zhuyin ? `<div class="zhuyin-label">${word.zhuyin}</div>` : ''}
                    </div>
                    ${extraComponentsHtml}
                </div>
                ${notesHtml}
            </div>
        `;
        return { frontHtml, backHtml };
    }

    return { frontHtml: '', backHtml: '' };
};

/**
 * Renders the current study card and navigation controls.
 */
const renderStudyCard = () => {
    const container = document.getElementById('study-container');
    if (!container) return;

    const tFn = (key, params) => (typeof window !== 'undefined' && window.I18N && window.I18N.t) ? window.I18N.t(key, params) : null;

    if (studyDeck.length === 0) {
        const hasLessonWords = getLessonFilteredStudyWords().length > 0;
        const isAllMastered = studyOnlyUnmastered && hasLessonWords;
        const emptyTitle = isAllMastered
            ? (tFn('studyAllMastered') || '¡Todas las tarjetas están conocidas!')
            : (tFn('studyEmpty') || 'No hay palabras para estudiar con estos filtros');
        const emptySub = isAllMastered
            ? (tFn('studyAllMasteredSub') || 'Todas las tarjetas de este filtro están marcadas como conocidas (✓). Desactiva «Por estudiar» o elige otras lecciones.')
            : (tFn('studyNoLesson') || 'Prueba seleccionando otras lecciones en la barra superior.');
        const iconSvg = isAllMastered
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="#1E8C5E" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
        container.innerHTML = `
            <div class="empty-state">
                ${iconSvg}
                <h3>${emptyTitle}</h3>
                <p>${emptySub}</p>
            </div>
        `;
        return;
    }

    const word = studyDeck[studyIndex];
    const cardStatus = getCardStudyStatus(word.id);
    const counts = getStudyProgressCounts();
    const color = studyShowCategory
        ? ((typeof CATEGORY_COLORS !== 'undefined' && CATEGORY_COLORS[word.categoria]) || 'var(--accent)')
        : '#9E948A';
    const { frontHtml, backHtml } = buildCardFacesHtml(word);

    const progressHtml = tFn('studyCardOf', { current: `<strong>${studyIndex + 1}</strong>`, total: `<strong>${studyDeck.length}</strong>` })
        || `Tarjeta <strong>${studyIndex + 1}</strong> de <strong>${studyDeck.length}</strong>`;

    const prevLabel = tFn('studyPrev') || 'Anterior';
    const flipLabel = tFn('studyFlip') || 'Voltear';
    const nextLabel = tFn('studyNext') || 'Siguiente';
    const shuffleLabel = tFn('studyShuffle') || 'Mezclar';
    const markKnownTitle = tFn('studyMarkKnownTitle') || 'Marcar como conocida (Atajo: ↑ Flecha arriba)';
    const markUnknownTitle = tFn('studyMarkUnknownTitle') || 'Marcar como no conocida (Atajo: ↓ Flecha abajo)';
    const trackerSummaryTitle = tFn('studyTrackerSummaryTitle') || 'Tarjetas marcadas en las lecciones seleccionadas (✓ conocidas · ✕ no conocidas)';

    const tabChars = tFn('studyTabChars') || 'Ver Caracteres';
    const tabPron = tFn('studyTabPron') || 'Ver Pronunciación';
    const tabDef = tFn('studyTabDef') || 'Ver Definición';

    container.innerHTML = `
        <div class="study-card-meta-bar">
            <div class="study-progress">
                ${progressHtml}
            </div>
            <div class="study-meta-right">
                <div class="study-tracker-summary" id="study-tracker-summary" title="${trackerSummaryTitle}">
                    <span class="tracker-known">✓ <strong id="study-known-count">${counts.known}</strong></span>
                    <span class="tracker-sep">·</span>
                    <span class="tracker-unknown">✕ <strong id="study-unknown-count">${counts.unknown}</strong></span>
                </div>
                <div class="study-mode-badge-indicator">
                    ${currentStudyMode === 'caracteres' ? '🀄 ' + tabChars : currentStudyMode === 'pronunciacion' ? '🗣️ ' + tabPron : '📖 ' + tabDef}
                </div>
            </div>
        </div>

        <div class="study-card-wrapper" id="study-card-wrapper" style="--card-color: ${color};">
            <div class="study-card" id="study-card">
                ${frontHtml}
                ${backHtml}
            </div>
        </div>

        <div class="study-controls">
            <button class="btn btn-secondary" id="study-prev" ${studyIndex === 0 ? 'disabled' : ''} title="${prevLabel}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
                ${prevLabel}
            </button>
            <button class="btn study-mark-btn study-mark-unknown ${cardStatus === 'unknown' ? 'is-marked-unknown' : ''}" id="study-mark-unknown" title="${markUnknownTitle}" aria-label="${markUnknownTitle}" aria-pressed="${cardStatus === 'unknown' ? 'true' : 'false'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            <button class="btn btn-primary" id="study-flip" title="${flipLabel}">
                🔄 ${flipLabel}
            </button>
            <button class="btn study-mark-btn study-mark-known ${cardStatus === 'known' ? 'is-marked-known' : ''}" id="study-mark-known" title="${markKnownTitle}" aria-label="${markKnownTitle}" aria-pressed="${cardStatus === 'known' ? 'true' : 'false'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </button>
            <button class="btn btn-secondary" id="study-next" title="${nextLabel}">
                ${nextLabel}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
        </div>

        <div class="study-bottom-bar">
            <div class="study-modes-tabs">
                <button class="study-mode-tab ${currentStudyMode === 'caracteres' ? 'active' : ''}" data-study-mode="caracteres">
                    <span class="tab-icon">🀄</span>
                    <span class="tab-text">${tabChars}</span>
                </button>
                <button class="study-mode-tab ${currentStudyMode === 'pronunciacion' ? 'active' : ''}" data-study-mode="pronunciacion">
                    <span class="tab-icon">🗣️</span>
                    <span class="tab-text">${tabPron}</span>
                </button>
                <button class="study-mode-tab ${currentStudyMode === 'definicion' ? 'active' : ''}" data-study-mode="definicion">
                    <span class="tab-icon">📖</span>
                    <span class="tab-text">${tabDef}</span>
                </button>
            </div>
            <button class="btn btn-secondary btn-sm" id="study-shuffle" title="${shuffleLabel}">
                🔀 ${shuffleLabel}
            </button>
        </div>
    `;

    const studyCard = document.getElementById('study-card');
    const studyWrapper = document.getElementById('study-card-wrapper');

    const toggleFlip = () => {
        if (studyCard) studyCard.classList.toggle('is-flipped');
    };

    studyWrapper?.addEventListener('click', toggleFlip);
    document.getElementById('study-flip')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFlip();
    });

    document.getElementById('study-mark-unknown')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCurrentCardStudyStatus('unknown');
    });

    document.getElementById('study-mark-known')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCurrentCardStudyStatus('known');
    });

    document.getElementById('study-prev')?.addEventListener('click', () => {
        if (studyIndex > 0) {
            studyIndex--;
            renderStudyCard();
        }
    });

    document.getElementById('study-next')?.addEventListener('click', () => {
        studyIndex = (studyIndex + 1) % studyDeck.length;
        renderStudyCard();
    });

    container.querySelectorAll('.study-bottom-bar .study-mode-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.studyMode;
            if (mode) setStudyMode(mode);
        });
    });

    document.getElementById('study-shuffle')?.addEventListener('click', () => {
        if (studyOnlyUnmastered) {
            studyDeck = getLessonFilteredStudyWords().filter(w => getCardStudyStatus(w.id) !== 'known');
        }
        for (let i = studyDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [studyDeck[i], studyDeck[j]] = [studyDeck[j], studyDeck[i]];
        }
        studyIndex = 0;
        renderStudyCard();
        showToast(typeof I18N !== 'undefined' ? I18N.t('studyToastShuffled') : 'Mazo mezclado aleatoriamente', 'success');
    });
};

/**
 * Initializes listeners for study mode controls (called once).
 */
const initStudyEventListeners = () => {
    document.addEventListener('click', (e) => {
        const tab = e.target.closest('.study-mode-tab');
        if (tab && tab.dataset.studyMode) {
            setStudyMode(tab.dataset.studyMode);
        }
    });

    const toggleCat = document.getElementById('study-toggle-categoria');
    if (toggleCat) {
        toggleCat.addEventListener('change', (e) => {
            studyShowCategory = e.target.checked;
            saveStudyPreferences();
            renderStudyCard();
        });
    }

    const toggleNotes = document.getElementById('study-toggle-notas');
    if (toggleNotes) {
        toggleNotes.addEventListener('change', (e) => {
            studyShowNotes = e.target.checked;
            saveStudyPreferences();
            renderStudyCard();
        });
    }

    const toggleRads = document.getElementById('study-toggle-radicales');
    if (toggleRads) {
        toggleRads.addEventListener('change', (e) => {
            studyShowRadicals = e.target.checked;
            saveStudyPreferences();
            renderStudyCard();
        });
    }

    const lessonFiltersContainer = document.getElementById('study-lesson-filters');
    if (lessonFiltersContainer) {
        lessonFiltersContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            const lessonFilter = chip.dataset.lessonFilter || 'todas';

            if (lessonFilter === 'todas') {
                currentStudyLessons = ['todas'];
            } else {
                let lessons = currentStudyLessons.filter(l => l !== 'todas');
                if (lessons.includes(lessonFilter)) {
                    lessons = lessons.filter(l => l !== lessonFilter);
                } else {
                    lessons.push(lessonFilter);
                }
                if (lessons.length === 0) {
                    lessons = ['todas'];
                }
                currentStudyLessons = lessons;
            }
            initStudyMode(currentStudyLessons);
        });
    }

    const unmasteredPill = document.getElementById('study-unmastered-pill');
    if (unmasteredPill) {
        unmasteredPill.addEventListener('click', () => {
            studyOnlyUnmastered = !studyOnlyUnmastered;
            saveStudyPreferences();
            initStudyMode(currentStudyLessons);
        });
    }

    window.addEventListener('keydown', (e) => {
        const studySection = document.getElementById('section-estudio');
        if (!studySection || !studySection.classList.contains('active')) return;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            const card = document.getElementById('study-card');
            if (card) card.classList.toggle('is-flipped');
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            if (studyIndex > 0) {
                studyIndex--;
                renderStudyCard();
            }
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            if (studyDeck.length > 0) {
                studyIndex = (studyIndex + 1) % studyDeck.length;
                renderStudyCard();
            }
        } else if (e.code === 'ArrowUp') {
            e.preventDefault();
            toggleCurrentCardStudyStatus('known');
        } else if (e.code === 'ArrowDown') {
            e.preventDefault();
            toggleCurrentCardStudyStatus('unknown');
        }
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudyEventListeners);
} else {
    initStudyEventListeners();
}

window.initStudyMode = initStudyMode;
window.setStudyMode = setStudyMode;
window.updateStudyToolbarUI = updateStudyToolbarUI;
