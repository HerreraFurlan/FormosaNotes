/**
 * =====================================================
 * AppChino — study.js
 * Redesigned Study Mode:
 * Three distinct modalities:
 * 1. "caracteres": Study seeing characters (front: Hanzi [+cat]; back: meaning, pinyin, zhuyin [+cat, notes, rads])
 * 2. "pronunciacion": Study seeing pronunciation (front: Pinyin & Zhuyin [+cat]; back: meaning & Hanzi [+cat, notes, rads])
 * 3. "definicion": Study seeing definition (front: Spanish meaning [+cat]; back: Hanzi, Pinyin & Zhuyin [+cat, notes, rads])
 * 
 * Configurable options:
 * - Category badge toggle (front & back)
 * - Notes toggle (back)
 * - Radicals toggle (back)
 * =====================================================
 */

const STUDY_MODE_STORAGE_KEY = 'appchino_study_mode_v2';
const STUDY_SHOW_CAT_KEY = 'appchino_study_show_cat_v2';
const STUDY_SHOW_NOTES_KEY = 'appchino_study_show_notes_v2';
const STUDY_SHOW_RADS_KEY = 'appchino_study_show_rads_v2';

let studyDeck = [];
let studyIndex = 0;
let currentStudyFilter = 'todos';

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
    } catch (e) {
        console.warn("No se pudieron guardar las preferencias de estudio:", e);
    }
};

/**
 * Initializes the study deck with filtered and shuffled words.
 * @param {string} filter - Category filter ('todos' or specific category)
 */
const initStudyMode = (filter = currentStudyFilter) => {
    loadStudyPreferences();
    currentStudyFilter = filter;

    let words = getAllWords();
    if (filter !== 'todos') {
        words = words.filter(w => w.categoria === filter);
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
    // Mode tabs
    document.querySelectorAll('.study-mode-tab').forEach(tab => {
        if (tab.dataset.studyMode === currentStudyMode) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Option switches
    const toggleCat = document.getElementById('study-toggle-categoria');
    if (toggleCat) toggleCat.checked = studyShowCategory;

    const toggleNotes = document.getElementById('study-toggle-notas');
    if (toggleNotes) toggleNotes.checked = studyShowNotes;

    const toggleRads = document.getElementById('study-toggle-radicales');
    if (toggleRads) toggleRads.checked = studyShowRadicals;

    // Filter chips
    document.querySelectorAll('#study-filters .chip').forEach(chip => {
        if (chip.dataset.filter === currentStudyFilter) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
};

/**
 * Helper to build radicals HTML display.
 */
const getRadicalsHtml = (word) => {
    if (!word || !word.radicales) return '';
    if (Array.isArray(word.radicales)) {
        return word.radicales.map(rad => {
            if (rad.type === 'text') return rad.value;
            if (rad.type === 'ref') {
                const refWord = getAllWords().find(w => w.id === rad.id);
                return refWord ? `<span class="radical-ref" data-ref-id="${rad.id}" data-level="0">${refWord.tradicional} (${refWord.espanol})</span>` : '';
            }
            return '';
        }).filter(Boolean).join(' + ');
    }
    return String(word.radicales);
};

/**
 * Helper to build classifier HTML display.
 */
const getClassifierHtml = (word) => {
    if (!word || !word.clasificador) return '';
    const clf = getAllWords().find(w => w.id === word.clasificador);
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

    const categoryBadge = studyShowCategory ? `
        <span class="card-category-badge badge badge-${word.categoria}">
            ${CATEGORY_LABELS[word.categoria] || word.categoria}
        </span>
    ` : '';

    const classifierHtml = getClassifierHtml(word);
    const radicalsHtml = getRadicalsHtml(word);

    // Common extra details for back of the card
    let extraRowsHtml = '';
    if (studyShowCategory && classifierHtml) {
        extraRowsHtml += `<div class="detail-row"><span class="detail-label">Clasificador</span><span class="detail-value">${classifierHtml}</span></div>`;
    }
    if (studyShowRadicals && radicalsHtml) {
        extraRowsHtml += `<div class="detail-row"><span class="detail-label">Radicales</span><span class="detail-value">${radicalsHtml}</span></div>`;
    }

    const notesHtml = (studyShowNotes && word.notas) ? `
        <div class="study-card-notes" title="Notas de estudio">
            <span class="notes-icon">📝</span> ${word.notas}
        </div>
    ` : '';

    // =========================================================================
    // MODALIDAD 1: ESTUDIAR VIENDO CARACTERES
    // Frente: solo el caracter (+ categoría opcional)
    // Reverso: significado en español, pinyin y zhuyin (+ opcionales)
    // =========================================================================
    if (currentStudyMode === 'caracteres') {
        const frontHtml = `
            <div class="card-face card-front study-mode-caracteres-front">
                ${categoryBadge}
                <div class="study-main-display">
                    <div class="chinese-char ${lenClass}">${word.tradicional}</div>
                </div>
                <div class="study-flip-hint">Toca o presiona espacio para voltear</div>
            </div>
        `;

        const backHtml = `
            <div class="card-face card-back study-mode-caracteres-back">
                ${categoryBadge}
                <div class="spanish-meaning">${word.espanol}</div>
                <div class="study-pronunciation-block">
                    <div class="pinyin-label ${pinyinLenClass}">${word.pinyin}</div>
                    ${word.zhuyin ? `<div class="zhuyin-label">${word.zhuyin}</div>` : ''}
                </div>
                ${extraRowsHtml ? `<div class="details-list">${extraRowsHtml}</div>` : ''}
                ${notesHtml}
            </div>
        `;
        return { frontHtml, backHtml };
    }

    // =========================================================================
    // MODALIDAD 2: ESTUDIAR VIENDO PRONUNCIACIÓN
    // Frente: pinyin y zhuyin (+ categoría opcional)
    // Reverso: definición (español) y caracter (+ opcionales)
    // =========================================================================
    if (currentStudyMode === 'pronunciacion') {
        const frontHtml = `
            <div class="card-face card-front study-mode-pronunciacion-front">
                ${categoryBadge}
                <div class="study-main-display">
                    <div class="study-prompt-pinyin ${pinyinLenClass}">${word.pinyin}</div>
                    ${word.zhuyin ? `<div class="study-prompt-zhuyin">${word.zhuyin}</div>` : ''}
                </div>
                <div class="study-flip-hint">Toca o presiona espacio para ver carácter y significado</div>
            </div>
        `;

        const backHtml = `
            <div class="card-face card-back study-mode-pronunciacion-back">
                ${categoryBadge}
                <div class="chinese-char ${lenClass}" style="margin-bottom:0.75rem;">${word.tradicional}</div>
                <div class="spanish-meaning">${word.espanol}</div>
                ${extraRowsHtml ? `<div class="details-list" style="margin-top:0.75rem;">${extraRowsHtml}</div>` : ''}
                ${notesHtml}
            </div>
        `;
        return { frontHtml, backHtml };
    }

    // =========================================================================
    // MODALIDAD 3: ESTUDIAR VIENDO DEFINICIÓN
    // Frente: definición en español (+ categoría opcional)
    // Reverso: caracter, pinyin y zhuyin (+ opcionales)
    // =========================================================================
    if (currentStudyMode === 'definicion') {
        const frontHtml = `
            <div class="card-face card-front study-mode-definicion-front">
                ${categoryBadge}
                <div class="study-main-display">
                    <div class="study-prompt-definition">${word.espanol}</div>
                </div>
                <div class="study-flip-hint">Toca o presiona espacio para ver carácter y pronunciación</div>
            </div>
        `;

        const backHtml = `
            <div class="card-face card-back study-mode-definicion-back">
                ${categoryBadge}
                <div class="chinese-char ${lenClass}" style="margin-bottom:0.5rem;">${word.tradicional}</div>
                <div class="study-pronunciation-block">
                    <div class="pinyin-label ${pinyinLenClass}">${word.pinyin}</div>
                    ${word.zhuyin ? `<div class="zhuyin-label">${word.zhuyin}</div>` : ''}
                </div>
                ${extraRowsHtml ? `<div class="details-list">${extraRowsHtml}</div>` : ''}
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
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h3>No hay palabras para estudiar en esta categoría</h3>
                <p>Elige otra categoría o registra más palabras en la Biblioteca.</p>
            </div>
        `;
        return;
    }

    const word = studyDeck[studyIndex];
    const color = (typeof CATEGORY_COLORS !== 'undefined' && CATEGORY_COLORS[word.categoria]) || 'var(--accent)';
    const { frontHtml, backHtml } = buildCardFacesHtml(word);

    container.innerHTML = `
        <div class="study-card-meta-bar">
            <div class="study-progress">
                Tarjeta <strong>${studyIndex + 1}</strong> de <strong>${studyDeck.length}</strong>
            </div>
            <div class="study-mode-badge-indicator">
                ${currentStudyMode === 'caracteres' ? '🀄 Viendo Caracteres' : currentStudyMode === 'pronunciacion' ? '🗣️ Viendo Pronunciación' : '📖 Viendo Definición'}
            </div>
        </div>

        <div class="study-card-wrapper" id="study-card-wrapper" style="--card-color: ${color};">
            <div class="study-card" id="study-card">
                ${frontHtml}
                ${backHtml}
            </div>
        </div>

        <div class="study-controls">
            <button class="btn btn-secondary" id="study-prev" ${studyIndex === 0 ? 'disabled' : ''} title="Anterior (Flecha izquierda)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
                Anterior
            </button>
            <button class="btn btn-primary" id="study-flip" title="Voltear tarjeta (Espacio)">
                🔄 Voltear
            </button>
            <button class="btn btn-secondary" id="study-next" title="Siguiente (Flecha derecha)">
                Siguiente
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
        </div>

        <div class="study-actions-secondary">
            <button class="btn btn-secondary btn-sm" id="study-shuffle" title="Mezclar tarjetas aleatoriamente">
                🔀 Mezclar mazo
            </button>
        </div>
    `;

    // Flip handlers
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

    // Navigation handlers
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

    document.getElementById('study-shuffle')?.addEventListener('click', () => {
        for (let i = studyDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [studyDeck[i], studyDeck[j]] = [studyDeck[j], studyDeck[i]];
        }
        studyIndex = 0;
        renderStudyCard();
        showToast('Mazo mezclado aleatoriamente', 'success');
    });
};

/**
 * Initializes listeners for study mode controls (called once).
 */
const initStudyEventListeners = () => {
    // Mode tabs
    document.querySelectorAll('.study-mode-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.studyMode;
            if (mode) setStudyMode(mode);
        });
    });

    // Option switches
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

    // Category filter chips
    const filtersContainer = document.getElementById('study-filters');
    if (filtersContainer) {
        filtersContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            const filter = chip.dataset.filter || 'todos';
            initStudyMode(filter);
        });
    }

    // Keyboard navigation (Space/Enter: flip; ArrowLeft: prev; ArrowRight: next)
    window.addEventListener('keydown', (e) => {
        const studySection = document.getElementById('section-estudio');
        if (!studySection || !studySection.classList.contains('active')) return;

        // Ignore if user is typing in an input or textarea
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

// Initialize listeners on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudyEventListeners);
} else {
    initStudyEventListeners();
}

window.initStudyMode = initStudyMode;
window.setStudyMode = setStudyMode;
