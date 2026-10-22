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
const STUDY_CAT_FILTER_KEY = 'appchino_study_cat_filters_v2';

let studyDeck = [];
let studyIndex = 0;
let currentStudyCategories = ['todos'];
let currentStudyLessons = ['todas'];

// Backward compatibility properties
Object.defineProperty(window, 'currentStudyFilter', {
    get: () => currentStudyCategories[0] || 'todos',
    set: (val) => { currentStudyCategories = val ? [val] : ['todos']; }
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

        const savedCats = localStorage.getItem(STUDY_CAT_FILTER_KEY);
        if (savedCats) {
            try {
                const parsed = JSON.parse(savedCats);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    currentStudyCategories = parsed;
                } else if (typeof parsed === 'string' && parsed) {
                    currentStudyCategories = [parsed];
                }
            } catch {
                currentStudyCategories = [savedCats];
            }
        }
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
        localStorage.setItem(STUDY_CAT_FILTER_KEY, JSON.stringify(currentStudyCategories));
    } catch (e) {
        console.warn("No se pudieron guardar las preferencias de estudio:", e);
    }
};

/**
 * Initializes the study deck with filtered and shuffled words.
 * @param {string|Array<string>} categories - Category filter(s)
 * @param {string|Array<string>} lessons - Lesson filter(s)
 */
const initStudyMode = (categories = currentStudyCategories, lessons = currentStudyLessons) => {
    loadStudyPreferences();
    if (categories !== undefined) {
        currentStudyCategories = Array.isArray(categories) ? [...categories] : [categories];
    }
    if (lessons !== undefined) {
        currentStudyLessons = Array.isArray(lessons) ? [...lessons] : [lessons];
    }
    if (!currentStudyCategories || currentStudyCategories.length === 0) currentStudyCategories = ['todos'];
    if (!currentStudyLessons || currentStudyLessons.length === 0) currentStudyLessons = ['todas'];
    saveStudyPreferences();

    let words = getAllWords();

    // 1. Filter by categories (stackable)
    if (!currentStudyCategories.includes('todos') && currentStudyCategories.length > 0) {
        words = words.filter(w => currentStudyCategories.includes(w.categoria));
    }

    // 2. Filter by lessons (stackable)
    const unassignedKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.lessons?.unassignedFilterId) || 'ninguna';
    if (!currentStudyLessons.includes('todas') && currentStudyLessons.length > 0) {
        words = words.filter(w => {
            if (!w.leccion) {
                return currentStudyLessons.includes(unassignedKey);
            }
            return currentStudyLessons.includes(String(w.leccion));
        });
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

    document.querySelectorAll('#study-filters .chip').forEach(chip => {
        const filterVal = chip.dataset.filter;
        chip.classList.toggle('active', currentStudyCategories.includes(filterVal));
    });

    document.querySelectorAll('#study-lesson-filters .chip').forEach(chip => {
        const lessonVal = chip.dataset.lessonFilter;
        chip.classList.toggle('active', currentStudyLessons.includes(lessonVal));
    });
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

    const catLabel = window.getCategoryLabel ? window.getCategoryLabel(word.categoria) : (CATEGORY_LABELS[word.categoria] || word.categoria);
    const lessonShort = word.leccion
        ? ((window.I18N && window.I18N.getLessonLabel) ? window.I18N.getLessonLabel(word.leccion, true) : `L${word.leccion}`)
        : '';

    const categoryBadge = studyShowCategory ? `
        <span class="card-category-badge badge badge-${word.categoria}">
            ${catLabel}${lessonShort ? ` · ${lessonShort}` : ''}
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

    if (studyDeck.length === 0) {
        const emptyTitle = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyEmpty') : 'No hay palabras para estudiar con estos filtros';
        const emptySub = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyNoLessonCat') : 'Prueba seleccionando otras lecciones o categorías en la barra superior.';
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h3>${emptyTitle}</h3>
                <p>${emptySub}</p>
            </div>
        `;
        return;
    }

    const word = studyDeck[studyIndex];
    const color = studyShowCategory
        ? ((typeof CATEGORY_COLORS !== 'undefined' && CATEGORY_COLORS[word.categoria]) || 'var(--accent)')
        : '#9E948A';
    const { frontHtml, backHtml } = buildCardFacesHtml(word);

    const progressHtml = (typeof window !== 'undefined' && window.I18N)
        ? window.I18N.t('studyCardOf', { current: `<strong>${studyIndex + 1}</strong>`, total: `<strong>${studyDeck.length}</strong>` })
        : `Tarjeta <strong>${studyIndex + 1}</strong> de <strong>${studyDeck.length}</strong>`;

    const prevLabel = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyPrev') : 'Anterior';
    const flipLabel = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyFlip') : 'Voltear';
    const nextLabel = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyNext') : 'Siguiente';
    const shuffleLabel = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyShuffle') : 'Mezclar';

    const tabChars = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyTabChars') : 'Ver Caracteres';
    const tabPron = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyTabPron') : 'Ver Pronunciación';
    const tabDef = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('studyTabDef') : 'Ver Definición';

    container.innerHTML = `
        <div class="study-card-meta-bar">
            <div class="study-progress">
                ${progressHtml}
            </div>
            <div class="study-mode-badge-indicator">
                ${currentStudyMode === 'caracteres' ? '🀄 ' + tabChars : currentStudyMode === 'pronunciacion' ? '🗣️ ' + tabPron : '📖 ' + tabDef}
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
            <button class="btn btn-primary" id="study-flip" title="${flipLabel}">
                🔄 ${flipLabel}
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

    const filtersContainer = document.getElementById('study-filters');
    if (filtersContainer) {
        filtersContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            const filter = chip.dataset.filter || 'todos';

            if (filter === 'todos') {
                currentStudyCategories = ['todos'];
            } else {
                let cats = currentStudyCategories.filter(c => c !== 'todos');
                if (cats.includes(filter)) {
                    cats = cats.filter(c => c !== filter);
                } else {
                    cats.push(filter);
                }
                if (cats.length === 0) {
                    cats = ['todos'];
                }
                currentStudyCategories = cats;
            }
            initStudyMode(currentStudyCategories, currentStudyLessons);
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
            initStudyMode(currentStudyCategories, currentStudyLessons);
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
