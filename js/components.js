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
// Structure card helpers & component
// --------------------------------------------------

/**
 * Escapes special HTML characters.
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Parses formula into variant patterns (e.g. Afirmativa, Negativa, Pregunta, Patrón 1/2).
 * @param {string} rawFormula
 * @returns {Array<{label: string, badgeType: string, expr: string}>}
 */
const parseFormulaVariants = (rawFormula) => {
    if (!rawFormula) return [];
    const trimmed = rawFormula.trim();
    let parts = [];

    if (trimmed.includes(' | ')) {
        parts = trimmed.split(/\s*\|\s*/).filter(Boolean);
    } else if (/\s*\/\s*(?=(?:\d+\)|[A-Z][a-záéíóúA-Z\s]+:))/.test(trimmed)) {
        parts = trimmed.split(/\s*\/\s*(?=(?:\d+\)|[A-Z][a-záéíóúA-Z\s]+:))/).filter(Boolean);
    } else if (/^1\)/.test(trimmed) && /\s+2\)/.test(trimmed)) {
        parts = trimmed.split(/\s+(?=\d+\))/).filter(Boolean);
    } else if (trimmed.includes(' / ')) {
        const sub = trimmed.split(' / ');
        if (sub.length === 2 && (sub[1].startsWith('S +') || sub[1].startsWith('[Tiempo] + S'))) {
            parts = sub;
        } else {
            parts = [trimmed];
        }
    } else {
        parts = [trimmed];
    }

    return parts.map(part => {
        let label = '';
        let badgeType = 'info';
        let expr = part;

        const prefixMatch = part.match(/^((?:Afirm\.|Neg\.|Preg\.|Total|Parcial|Completa|Breve|Estándar|Taiwán|Prohibición|\d+\))\s*:?)\s*(.*)/i);
        if (prefixMatch) {
            label = prefixMatch[1].replace(/:$/, '').trim();
            expr = prefixMatch[2].trim();

            const lower = label.toLowerCase();
            if (lower.startsWith('afirm')) badgeType = 'afirm';
            else if (lower.startsWith('neg') || lower.includes('prohib')) badgeType = 'neg';
            else if (lower.startsWith('preg')) badgeType = 'preg';
            else badgeType = 'info';
        }

        return { label, badgeType, expr };
    });
};

/**
 * Tokenizes and renders a visual formula blueprint.
 * @param {string} rawFormula
 * @returns {string} HTML
 */
const renderFormulaBlueprint = (rawFormula) => {
    const variants = parseFormulaVariants(rawFormula);
    let html = '<div class="struct-variants-list">';

    variants.forEach(v => {
        html += '<div class="struct-variant-row">';
        if (v.label) {
            html += `<span class="pattern-badge pattern-badge-${v.badgeType}">${escapeHtml(v.label)}</span>`;
        }

        // Parenthesis-aware tokenization by +, ,, ?, !, vs.
        const tokens = [];
        let cur = '';
        let depth = 0;
        const s = v.expr;
        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (ch === '(' || ch === '[' || ch === '（' || ch === '【') depth++;
            else if (ch === ')' || ch === ']' || ch === '）' || ch === '】') depth--;

            if (depth === 0 && (ch === '+' || ch === '，' || ch === ',' || ch === '？' || ch === '?' || ch === '！' || ch === '!')) {
                if (cur.trim()) tokens.push({ type: 'slot', text: cur.trim() });
                tokens.push({ type: 'op', text: ch });
                cur = '';
                continue;
            }
            cur += ch;
        }
        if (cur.trim()) tokens.push({ type: 'slot', text: cur.trim() });

        html += '<div class="blueprint-chain">';
        tokens.forEach(tok => {
            if (tok.type === 'op') {
                html += `<span class="blueprint-op">${escapeHtml(tok.text)}</span>`;
            } else {
                const t = tok.text;
                const isOptional = /^\(.*\)$/.test(t) || /^\[.*\]$/.test(t);
                const hasChinese = /[\u4e00-\u9fa5]/.test(t);

                let roleClass = 'blueprint-slot-generic';
                if (/^S\d*(\s|$)/.test(t) || t === 'S' || t === 'Sujeto') roleClass = 'blueprint-slot-subject';
                else if (/^(?:V[Pstaux0-9]*|Verbo)(\s|$)/.test(t)) roleClass = 'blueprint-slot-verb';
                else if (/^O\d*(\s|$)/.test(t) || t === 'O' || t === 'Objeto') roleClass = 'blueprint-slot-object';
                else if (/^Adv(\s|$)/.test(t)) roleClass = 'blueprint-slot-adverb';
                else if (/^M(\s|$)/.test(t) || /Clasificador/.test(t)) roleClass = 'blueprint-slot-clf';
                else if (/^(?:Num|Número|幾)(\s|$)/.test(t)) roleClass = 'blueprint-slot-num';
                else if (/^Det(\s|$)/.test(t)) roleClass = 'blueprint-slot-det';
                else if (/Tiempo|Período|Año|Mes|Día/.test(t)) roleClass = 'blueprint-slot-time';
                else if (/Lugar|Destino|Ubicación/.test(t)) roleClass = 'blueprint-slot-place';
                else if (/Tópico|Comentario|Beneficiario|Persona|Poseedor/.test(t)) roleClass = 'blueprint-slot-role';
                else if (hasChinese && t.length <= 6) roleClass = 'blueprint-slot-hanzi';

                const extraClass = isOptional ? ' blueprint-slot-optional' : '';
                html += `<span class="blueprint-slot ${roleClass}${extraClass}">${escapeHtml(t)}</span>`;
            }
        });
        html += '</div></div>';
    });

    html += '</div>';
    return html;
};

/**
 * Formats grammar usage notes with prominent typography, numbered points, and badges.
 * @param {string} rawNotes
 * @returns {string} HTML
 */
const formatStructureUsage = (rawNotes) => {
    if (!rawNotes) return '';
    let text = escapeHtml(rawNotes.trim());

    // Highlight agrammatical patterns (*...)
    text = text.replace(/(\*[^\s\(\),，。]+)/g, '<span class="struct-bad-usage" title="Uso agramatical o incorrecto">$1</span>');

    // Highlight rule labels
    text = text.replace(/\b((?:Regla[^:]*|Contraste[^:]*|Excepción[^:]*|Restricciones|Uso[^:]*|Función|Interrogación|Prohibición[^:]*):)/gi, '<strong class="struct-rule-label">$1</strong>');

    // Highlight strong directives
    text = text.replace(/\b(SIEMPRE|NUNCA|JAMÁS|ÚNICAMENTE|OBLIGATORIO|SOLO|NUNCA MÁS)\b/g, '<span class="struct-emphasis">$1</span>');

    // Highlight Chinese characters inside parentheses or quotes
    text = text.replace(/([（\(][\u4e00-\u9fa5\s\?？，、！!a-zA-Z0-9·«»“”\*\-=\/]+[）\)])/g, (match) => {
        if (match.includes('class=')) return match;
        return `<span class="struct-hanzi-inline">${match}</span>`;
    });

    // Check for numbered points: "1) ... 2) ..."
    if (/\b1\)\s+/.test(text)) {
        const parts = text.split(/\s*(?=\b\d+\)\s+)/);
        const intro = parts[0].trim();
        const numberedItems = parts.slice(1);

        let html = '';
        if (intro && !/^\d+\)/.test(intro)) {
            html += `<p class="struct-usage-lead">${intro}</p>`;
        } else if (intro && /^\d+\)/.test(intro)) {
            numberedItems.unshift(intro);
        }

        html += '<div class="struct-rule-list">';
        numberedItems.forEach(item => {
            const m = item.match(/^(\d+)\)\s*(.*)/s);
            if (m) {
                html += `
                    <div class="struct-rule-item">
                        <span class="struct-rule-num">${m[1]}</span>
                        <div class="struct-rule-body">${m[2]}</div>
                    </div>`;
            } else {
                html += `<div class="struct-rule-item"><div class="struct-rule-body">${item}</div></div>`;
            }
        });
        html += '</div>';
        return html;
    }

    // Check for bullet points •
    if (text.includes('•')) {
        const parts = text.split(/\s*•\s*/);
        const intro = parts[0].trim();
        const bullets = parts.slice(1);
        let html = '';
        if (intro) html += `<p class="struct-usage-lead">${intro}</p>`;
        html += '<ul class="struct-bullet-list">';
        bullets.forEach(b => {
            if (b.trim()) html += `<li>${b.trim()}</li>`;
        });
        html += '</ul>';
        return html;
    }

    return `<p class="struct-usage-lead">${text}</p>`;
};

/**
 * Parses slash-separated example sentences into aligned pairs.
 * @param {string} tradStr
 * @param {string} pinStr
 * @param {string} transStr
 * @returns {Array<{chinese: string, pinyin: string, translation: string}>}
 */
const parseStructureExamples = (tradStr, pinStr, transStr) => {
    const trads = (tradStr || '').split(/\s*\/\s*/).map(x => x.trim()).filter(Boolean);
    const pins = (pinStr || '').split(/\s*\/\s*/).map(x => x.trim()).filter(Boolean);
    const trans = (transStr || '').split(/\s*\/\s*/).map(x => x.trim()).filter(Boolean);

    const count = Math.max(trads.length, pins.length, 1);
    const result = [];

    for (let i = 0; i < count; i++) {
        const chinese = trads[i] || trads[0] || '';
        const pinyin = pins[i] || (trads.length === 1 ? pins.join(' / ') : '');

        let translation = '';
        if (trans.length === count) {
            translation = trans[i];
        } else if (trans.length > count && i === count - 1) {
            translation = trans.slice(i).join(' / ');
        } else if (trans.length < count) {
            translation = trans[i] || trans[trans.length - 1] || '';
        } else {
            translation = trans[i] || '';
        }

        result.push({ chinese, pinyin, translation });
    }
    return result;
};

/**
 * Creates a redesigned structure card element with prominent usage rules,
 * visual sentence blueprint, and compact space-saving examples.
 * @param {object} struct
 * @returns {HTMLElement}
 */
const createStructureCard = (struct) => {
    const div = document.createElement('div');
    div.className = 'structure-card';
    div.dataset.id = struct.id;

    const t = (key, fallback) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(key) : fallback;
    const deleteTitle = t('cardDelete', 'Eliminar');
    const copyTitle = t('structCopyFormula', 'Copiar fórmula');
    const copiedToast = t('structFormulaCopied', 'Fórmula copiada al portapapeles');
    const blueprintTitle = t('structBlueprintTitle', 'Estructura de la Oración');
    const usageTitle = t('structUsageTitle', 'Uso y Reglas Gramaticales');
    const examplesTitle = t('structExamplesTitle', 'Ejemplos de Aplicación');
    const showAllTemplate = t('structShowAll', 'Ver todos ({count}) ▾');
    const showCompactText = t('structShowCompact', 'Modo compacto ▴');

    const transValue = (typeof window !== 'undefined' && window.I18N && window.I18N.getStructureTranslation)
        ? window.I18N.getStructureTranslation(struct)
        : (struct.ejemplo_espanol || struct.ejemplo_english || '');

    const examples = parseStructureExamples(struct.ejemplo_tradicional, struct.ejemplo_pinyin, transValue);
    const hasMultipleExamples = examples.length > 1;

    const lessonBadgeText = typeof APP_CONFIG !== 'undefined' && APP_CONFIG.getLessonShortLabel
        ? APP_CONFIG.getLessonShortLabel(struct.leccion)
        : (struct.leccion ? 'L' + struct.leccion : '/');

    const lessonBadgeTitle = struct.leccion
        ? (typeof I18N !== 'undefined' ? I18N.getLessonLabel(struct.leccion, false) : 'Lección ' + struct.leccion)
        : (typeof I18N !== 'undefined' ? I18N.t('unassignedLessonTitle') : 'Sin lección asignada');

    // 1. Header
    let html = `
        <div class="structure-card-header">
            <div class="structure-title-row">
                <span class="lesson-badge ${struct.leccion ? '' : 'lesson-badge-empty'}" title="${lessonBadgeTitle}">${lessonBadgeText}</span>
                <h4>${escapeHtml(struct.nombre)}</h4>
            </div>
            <div class="structure-actions">
                <button class="btn-ghost btn-icon copy-formula-btn" title="${copyTitle}" aria-label="${copyTitle}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                </button>
                <button class="btn-ghost btn-icon delete-btn" title="${deleteTitle}" data-id="${struct.id}" aria-label="${deleteTitle}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
            </div>
        </div>
    `;

    // 2. Blueprint (Sentence Structure)
    html += `
        <div class="struct-blueprint-section">
            <div class="struct-subhead">
                <span class="subhead-icon">📐</span>
                <span>${blueprintTitle}</span>
            </div>
            ${renderFormulaBlueprint(struct.formula)}
        </div>
    `;

    // 3. Usage & Rules (Prominent Grammar Description)
    if (struct.notas) {
        html += `
            <div class="struct-usage-section">
                <div class="struct-subhead">
                    <span class="subhead-icon">💡</span>
                    <span>${usageTitle}</span>
                </div>
                ${formatStructureUsage(struct.notas)}
            </div>
        `;
    }

    // 4. Compact Application Examples
    html += `
        <div class="struct-examples-section">
            <div class="struct-examples-header-row">
                <div class="struct-subhead" style="margin-bottom:0;">
                    <span class="subhead-icon">💬</span>
                    <span>${examplesTitle}</span>
                    <span class="pattern-badge pattern-badge-info" style="font-size:0.68rem;padding:0.1rem 0.45rem;">${examples.length}</span>
                </div>
    `;

    if (hasMultipleExamples) {
        html += `
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <div class="struct-examples-pills">
                        ${examples.map((_, idx) => `<button class="struct-ex-pill ${idx === 0 ? 'active' : ''}" data-idx="${idx}">${idx + 1}</button>`).join('')}
                    </div>
                    <button class="struct-toggle-all-btn">${showAllTemplate.replace('{count}', examples.length)}</button>
                </div>
        `;
    }

    html += `
            </div>
            <div class="struct-examples-display">
    `;

    // Render examples markup
    examples.forEach((ex, idx) => {
        const isHidden = hasMultipleExamples && idx !== 0;
        html += `
            <div class="struct-example-item" data-idx="${idx}" style="${isHidden ? 'display: none;' : ''}">
                <div class="struct-example-chinese-line">
                    <span class="struct-example-chinese">${escapeHtml(ex.chinese)}</span>
                    <span class="struct-example-pinyin">${escapeHtml(ex.pinyin)}</span>
                </div>
                <div class="struct-example-translation">${escapeHtml(ex.translation)}</div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    div.innerHTML = html;

    // Attach listeners
    // 1. Delete
    div.querySelector('.delete-btn').addEventListener('click', () => {
        openDeleteDialog(struct.id, struct.nombre, 'estructura');
    });

    // 2. Copy formula
    div.querySelector('.copy-formula-btn').addEventListener('click', () => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(struct.formula).then(() => {
                if (typeof showToast === 'function') showToast(copiedToast, 'success');
            }).catch(() => {
                if (typeof showToast === 'function') showToast(struct.formula, 'info');
            });
        }
    });

    // 3. Examples interactivity (pills & toggle all)
    if (hasMultipleExamples) {
        let isExpanded = false;
        let activeIdx = 0;
        const pills = div.querySelectorAll('.struct-ex-pill');
        const items = div.querySelectorAll('.struct-example-item');
        const toggleBtn = div.querySelector('.struct-toggle-all-btn');

        const updateView = () => {
            if (isExpanded) {
                items.forEach(item => item.style.display = '');
                pills.forEach(p => p.classList.remove('active'));
                if (toggleBtn) toggleBtn.textContent = showCompactText;
            } else {
                items.forEach((item, idx) => {
                    item.style.display = (idx === activeIdx) ? '' : 'none';
                });
                pills.forEach((p, idx) => {
                    p.classList.toggle('active', idx === activeIdx);
                });
                if (toggleBtn) toggleBtn.textContent = showAllTemplate.replace('{count}', examples.length);
            }
        };

        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                isExpanded = false;
                activeIdx = parseInt(pill.dataset.idx, 10);
                updateView();
            });
        });

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                isExpanded = !isExpanded;
                updateView();
            });
        }
    }

    return div;
};
