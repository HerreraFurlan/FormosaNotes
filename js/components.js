/**
 * =====================================================
 * AppChino — components.js
 * Reusable UI component factory functions + Skeleton Placeholders.
 * Each function returns a DOM element — no side effects.
 * =====================================================
 */

// --------------------------------------------------
// Toast notification
// --------------------------------------------------

/**
 * Displays a temporary notification toast.
 * @param {string} message - Text to display
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 */
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : (type === 'info' ? 'ℹ' : '⚠');
    toast.innerHTML = `${icon} ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// --------------------------------------------------
// Skeleton Placeholders (Language & Lazy Load UI)
// --------------------------------------------------

/**
 * Creates a DocumentFragment containing skeleton placeholder flashcards.
 * @param {number} [count=12]
 * @returns {DocumentFragment}
 */
const createFlashcardSkeletons = (count = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.skeletonCount) || 12) => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const skel = document.createElement('div');
        skel.className = 'flashcard-wrapper flashcard-skeleton';
        skel.setAttribute('aria-hidden', 'true');
        skel.innerHTML = `
            <div class="skeleton-card-surface">
                <div class="skeleton-line skeleton-corner"></div>
                <div class="skeleton-block skeleton-hanzi"></div>
                <div class="skeleton-line skeleton-pinyin"></div>
                <div class="skeleton-pill skeleton-badge"></div>
            </div>
        `;
        frag.appendChild(skel);
    }
    return frag;
};

/**
 * Creates a DocumentFragment containing skeleton placeholder mini-cards for the Word Bank.
 * @param {number} [count=24]
 * @returns {DocumentFragment}
 */
const createMiniCardSkeletons = (count = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.miniSkeletonCount) || 24) => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const skel = document.createElement('div');
        skel.className = 'mini-card mini-card-skeleton';
        skel.setAttribute('aria-hidden', 'true');
        skel.innerHTML = `
            <span class="skeleton-block skeleton-mini-char"></span>
            <span class="skeleton-line skeleton-mini-pinyin"></span>
        `;
        frag.appendChild(skel);
    }
    return frag;
};

/**
 * Displays skeleton placeholder state across main grids while language data is loading.
 */
const showLanguageSkeletonState = () => {
    const cardGrid = document.getElementById('card-grid');
    if (cardGrid) {
        cardGrid.innerHTML = '';
        cardGrid.appendChild(createFlashcardSkeletons());
    }

    const exportGrid = document.getElementById('export-grid');
    if (exportGrid) {
        exportGrid.innerHTML = '';
        exportGrid.appendChild(createFlashcardSkeletons(6));
    }

    const bankGrid = document.getElementById('word-bank-grid');
    if (bankGrid) {
        bankGrid.innerHTML = '';
        bankGrid.appendChild(createMiniCardSkeletons());
    }
};

if (typeof window !== 'undefined') {
    window.createFlashcardSkeletons = createFlashcardSkeletons;
    window.createMiniCardSkeletons = createMiniCardSkeletons;
    window.showLanguageSkeletonState = showLanguageSkeletonState;
}

// --------------------------------------------------
// Flashcard (library & export grid)
// --------------------------------------------------

/**
 * Creates a full flashcard element with front/back flip.
 * Uses O(1) getWordById lookup for classifiers and radicals.
 * @param {object} word - Word data object
 * @param {object} options - { showSelect: boolean, showActions: boolean, isSelected: boolean, onSelectToggle: Function }
 * @returns {HTMLElement}
 */
const createFlashcard = (word, options = {}) => {
    const { showSelect = false, showActions = false, isSelected = false, onSelectToggle = null } = options;
    const color = CATEGORY_COLORS[word.categoria] || 'var(--color-noun)';

    const wrapper = document.createElement('div');
    wrapper.className = 'flashcard-wrapper';
    wrapper.dataset.id = word.id;
    wrapper.dataset.categoria = word.categoria;
    wrapper.style.setProperty('--card-color', color);

    // Selection checkbox (PDF export view)
    if (showSelect) {
        const selectDiv = document.createElement('div');
        selectDiv.className = 'card-select';
        const selectTitle = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('cardSelectPrint') : 'Seleccionar para exportar';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.id = word.id;
        input.title = selectTitle;
        input.checked = Boolean(isSelected);
        if (typeof onSelectToggle === 'function') {
            input.addEventListener('change', (e) => onSelectToggle(word.id, e.target.checked));
        }
        selectDiv.appendChild(input);
        selectDiv.addEventListener('click', (e) => e.stopPropagation());
        wrapper.appendChild(selectDiv);
    }

    // Edit/Delete action buttons
    if (showActions) {
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        const editTitle = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('cardEdit') : 'Editar';
        const deleteTitle = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('cardDelete') : 'Eliminar';
        actions.innerHTML = `
            <button class="edit-btn" title="${editTitle}" data-id="${word.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="delete-btn" title="${deleteTitle}" data-id="${word.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        `;
        actions.addEventListener('click', (e) => e.stopPropagation());
        actions.querySelector('.edit-btn').addEventListener('click', () => openEditDialog(word.id));
        actions.querySelector('.delete-btn').addEventListener('click', () => openDeleteDialog(word.id, word.tradicional));
        wrapper.appendChild(actions);
    }

    // The flipping card container
    const card = document.createElement('div');
    card.className = 'flashcard';
    card.addEventListener('click', () => card.classList.toggle('is-flipped'));

    // --- FRONT FACE ---
    const charLen = (word.tradicional || '').length;
    const lenClass = charLen <= 1 ? 'len-1' : charLen === 2 ? 'len-2' : charLen === 3 ? 'len-3' : charLen === 4 ? 'len-4' : charLen === 5 ? 'len-5' : charLen === 6 ? 'len-6' : 'len-long';
    const pinyinLenClass = (word.pinyin || '').length > 16 ? 'pinyin-long' : '';

    const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
    const posBadge = (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.getWordPOSBadgeInfo === 'function')
        ? APP_CONFIG.getWordPOSBadgeInfo(word, lang)
        : { code: word.posSymbol || word.categoria, label: word.categoria, tooltip: '', color };
    const lessonShort = word.leccion
        ? ((window.I18N && window.I18N.getLessonLabel) ? window.I18N.getLessonLabel(word.leccion, true) : `L${word.leccion}`)
        : '';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.innerHTML = `
        ${word.zhuyin ? `<span class="zhuyin-corner">${word.zhuyin}</span>` : ''}
        <div class="chinese-char ${lenClass}">${word.tradicional}</div>
        <div class="pinyin-label ${pinyinLenClass}">${word.pinyin}</div>
        <span class="card-category-badge badge badge-${word.categoria}" title="${posBadge.tooltip}">${posBadge.label}${lessonShort ? ` · ${lessonShort}` : ''}</span>
    `;

    // --- BACK FACE ---
    const back = document.createElement('div');
    back.className = 'card-face card-back';

    const lookupWord = (id) => (typeof getWordById === 'function' ? getWordById(id) : getAllWords().find(w => w.id === id));
    const getMeaning = (w) => (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
    const getNotes = (w) => (window.I18N && window.I18N.getWordNotes) ? window.I18N.getWordNotes(w) : (w.notas || '');

    let clfDisplay = '';
    if (word.clasificador) {
        const clf = lookupWord(word.clasificador);
        clfDisplay = clf
            ? `<span class="radical-ref" data-ref-id="${clf.id}" data-level="0">${clf.tradicional} (${clf.pinyin})</span>`
            : word.clasificador;
    }

    let radHtml = '';
    if (word.radicales) {
        if (Array.isArray(word.radicales)) {
            radHtml = word.radicales.map(rad => {
                if (rad.type === 'text') return rad.value;
                if (rad.type === 'ref') {
                    const refWord = lookupWord(rad.id);
                    return refWord ? `<span class="radical-ref" data-ref-id="${rad.id}" data-level="0">${refWord.tradicional} (${getMeaning(refWord)})</span>` : '';
                }
                return '';
            }).filter(Boolean).join(' + ');
        } else {
            radHtml = word.radicales;
        }
    }

    const meaningText = getMeaning(word);
    const notesText = getNotes(word);

    back.innerHTML = `
        <div class="card-back-body">
            <div class="spanish-meaning">${meaningText}</div>
            <div class="card-pronunciation-block">
                <div class="pinyin-label ${pinyinLenClass}">${word.pinyin}</div>
                ${word.zhuyin ? `<div class="zhuyin-label">${word.zhuyin}</div>` : ''}
            </div>
            ${(clfDisplay || radHtml) ? `
                <div class="card-components-block">
                    ${clfDisplay ? `<div class="card-clf-val" title="${(typeof window !== 'undefined' && window.I18N) ? window.I18N.t('cardClassifier') : 'Clasificador'}">${clfDisplay}</div>` : ''}
                    ${radHtml ? `<div class="card-rad-val" title="${(typeof window !== 'undefined' && window.I18N) ? window.I18N.t('cardRadicals') : 'Radicales / Componentes'}">${radHtml}</div>` : ''}
                </div>
            ` : ''}
        </div>
        ${notesText ? `
            <div class="card-notes-block" title="${(typeof window !== 'undefined' && window.I18N) ? window.I18N.t('cardNotes') : 'Notas'}">
                ${notesText}
            </div>
        ` : ''}
    `;

    card.appendChild(front);
    card.appendChild(back);
    wrapper.appendChild(card);
    return wrapper;
};

// --------------------------------------------------
// Mini card (word bank — Atomic Token style)
// --------------------------------------------------

/**
 * Creates a small draggable atomic word card for the word bank.
 * Neutral rice-paper background with a subtle POS dot and symbol (N, Vs, Vaux, V-sep, Prep, M, Det, Adv, Ptc).
 * @param {object} word
 * @returns {HTMLElement}
 */
const createMiniCard = (word) => {
    const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
    const posBadge = (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.getWordPOSBadgeInfo === 'function')
        ? APP_CONFIG.getWordPOSBadgeInfo(word, lang)
        : { code: word.posSymbol || word.categoria, shortLabel: word.posSymbol || word.categoria, tooltip: '', color: CATEGORY_COLORS[word.categoria] || 'var(--color-pos-n)' };
    const color = posBadge.color || CATEGORY_COLORS[word.categoria] || 'var(--color-pos-n)';
    const meaning = (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(word) : (word.espanol || '');

    const div = document.createElement('div');
    div.className = 'mini-card atomic-token';
    div.dataset.id = word.id;
    div.dataset.tradicional = word.tradicional;
    div.dataset.pinyin = word.pinyin;
    div.dataset.categoria = word.categoria;
    div.dataset.posSymbol = posBadge.shortLabel || posBadge.code;
    div.title = `${word.tradicional} (${word.pinyin}) — ${meaning}\n${posBadge.tooltip}`;
    div.dataset.origColor = color;
    div.style.setProperty('--card-color', color);
    div.innerHTML = `
        <span class="mini-char">${word.tradicional}</span>
        <span class="mini-pinyin">${word.pinyin}</span>
        <span class="atomic-pos-tag">
            <span class="atomic-pos-dot" style="background:${color}"></span>
            <span>${posBadge.shortLabel || posBadge.code}</span>
        </span>
    `;
    return div;
};

/**
 * Creates an interactive atomic token for the Magnetic Syntagma builder dropzone.
 * Includes remove button (✕) and separable verb split button (⇄) for V-sep / Vs-sep / Vp-sep.
 * @param {object} token
 * @param {object} [handlers]
 * @returns {HTMLElement}
 */
const createBuilderMiniCard = (token, handlers = {}) => {
    const card = createMiniCard(token);
    card.dataset.tokenIndex = token.index !== undefined ? String(token.index) : '';
    if (token.roleColor) {
        card.style.setProperty('--card-color', token.roleColor);
        card.dataset.roleSlot = token.roleSlot || '';
    }

    // Separable verb split button (⇄) for V-sep / Vs-sep / Vp-sep
    const isSeparable = ['V-sep', 'Vs-sep', 'Vp-sep'].includes(token.verbSubtype || token.posSymbol) && !token.isSplitVerbHead && (token.tradicional || '').length >= 2;
    if (isSeparable && typeof handlers.onSplitSeparable === 'function') {
        const splitBtn = document.createElement('button');
        splitBtn.type = 'button';
        splitBtn.className = 'mini-split-btn';
        splitBtn.innerHTML = '⇄';
        splitBtn.title = (window.I18N && window.I18N.getLanguage && window.I18N.getLanguage() === 'en')
            ? `Split separable verb (${token.posSymbol}) to insert particles/classifiers inside`
            : `Separar verbo (${token.posSymbol}) para insertar partículas o clasificadores en medio`;
        splitBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handlers.onSplitSeparable(token.index);
        });
        card.appendChild(splitBtn);
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'mini-remove';
    removeBtn.innerHTML = '✕';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof handlers.onRemove === 'function') {
            handlers.onRemove(token.index);
        } else {
            card.remove();
            if (typeof updateBuilderPreview === 'function') updateBuilderPreview();
        }
    });
    card.appendChild(removeBtn);
    return card;
};

// --------------------------------------------------
// Structure card
// --------------------------------------------------

/**
 * Creates a structure card element for the Structures section.
 * @param {object} struct
 * @returns {HTMLElement}
 */
const createStructureCard = (struct) => {
    const div = document.createElement('div');
    div.className = 'structure-card';
    div.dataset.id = struct.id;
    const deleteTitle = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('cardDelete') : 'Eliminar';
    const exLabel = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('structExample') : 'Ejemplo';
    const transLabel = (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('structTranslation') : 'Traducción';
    const transValue = (typeof window !== 'undefined' && window.I18N && window.I18N.getStructureTranslation)
        ? window.I18N.getStructureTranslation(struct)
        : (struct.ejemplo_espanol || struct.ejemplo_english || '');

    div.innerHTML = `
        <div class="structure-actions">
            <button class="btn-ghost btn-icon delete-btn" title="${deleteTitle}" data-id="${struct.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </div>
        <h4>${struct.nombre}</h4>
        <div class="formula">${struct.formula}</div>
        <div class="example-row">
            <div>
                <span class="ex-label">${exLabel}</span>
                <span class="ex-value chinese">${struct.ejemplo_tradicional}</span>
            </div>
            <div>
                <span class="ex-label">Pinyin</span>
                <span class="ex-value">${struct.ejemplo_pinyin}</span>
            </div>
            <div>
                <span class="ex-label">${transLabel}</span>
                <span class="ex-value">${transValue}</span>
            </div>
        </div>
        ${struct.notas ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.75rem;">💡 ${struct.notas}</p>` : ''}
    `;
    div.querySelector('.delete-btn').addEventListener('click', () => {
        openDeleteDialog(struct.id, struct.nombre, 'estructura');
    });
    return div;
};
