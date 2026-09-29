/**
 * =====================================================
 * AppChino — components.js
 * Reusable UI component factory functions.
 * Each function returns a DOM element — no side effects.
 * =====================================================
 */

// --------------------------------------------------
// Toast notification
// --------------------------------------------------

/**
 * Displays a temporary notification toast.
 * @param {string} message - Text to display
 * @param {'success'|'error'} type - Toast type
 */
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${type === 'success' ? '✓' : '⚠'} ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// --------------------------------------------------
// Flashcard (library grid)
// --------------------------------------------------

/**
 * Creates a full flashcard element with front/back flip.
 * @param {object} word - Word data object
 * @param {object} options - { showSelect: boolean, showActions: boolean }
 * @returns {HTMLElement}
 */
const createFlashcard = (word, options = {}) => {
    const { showSelect = false, showActions = true } = options;
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
        selectDiv.innerHTML = `<input type="checkbox" data-id="${word.id}" title="Seleccionar para exportar">`;
        selectDiv.addEventListener('click', (e) => e.stopPropagation());
        wrapper.appendChild(selectDiv);
    }

    // Edit/Delete action buttons
    if (showActions) {
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        actions.innerHTML = `
            <button class="edit-btn" title="Editar" data-id="${word.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="delete-btn" title="Eliminar" data-id="${word.id}">
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

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.innerHTML = `
        ${word.zhuyin ? `<span class="zhuyin-corner">${word.zhuyin}</span>` : ''}
        <div class="chinese-char ${lenClass}">${word.tradicional}</div>
        <div class="pinyin-label ${pinyinLenClass}">${word.pinyin}</div>
        <span class="card-category-badge badge badge-${word.categoria}">${CATEGORY_LABELS[word.categoria] || word.categoria}</span>
    `;

    // --- BACK FACE ---
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    let details = `
        <div class="detail-row"><span class="detail-label">Pinyin</span><span class="detail-value">${word.pinyin}</span></div>
        <div class="detail-row"><span class="detail-label">Zhuyin</span><span class="detail-value zhuyin-val">${word.zhuyin || '—'}</span></div>
    `;
    if (word.clasificador) {
        const clf = getAllWords().find(w => w.id === word.clasificador);
        const clfDisplay = clf
            ? `<span class="radical-ref" data-ref-id="${clf.id}" data-level="0">${clf.tradicional} (${clf.pinyin})</span>`
            : word.clasificador;
        details += `<div class="detail-row"><span class="detail-label">Clasificador</span><span class="detail-value">${clfDisplay}</span></div>`;
    }
    let radHtml = '';
    if (word.radicales) {
        if (Array.isArray(word.radicales)) {
            radHtml = word.radicales.map(rad => {
                if (rad.type === 'text') return rad.value;
                if (rad.type === 'ref') {
                    const refWord = getAllWords().find(w => w.id === rad.id);
                    return refWord ? `<span class="radical-ref" data-ref-id="${rad.id}" data-level="0">${refWord.tradicional} (${refWord.espanol})</span>` : '';
                }
                return '';
            }).filter(Boolean).join(' + ');
        } else {
            radHtml = word.radicales;
        }
    }
    if (radHtml) details += `<div class="detail-row"><span class="detail-label">Radicales</span><span class="detail-value">${radHtml}</span></div>`;

    back.innerHTML = `
        <div class="spanish-meaning">${word.espanol}</div>
        <div class="details-list">${details}</div>
        ${word.notas ? `<div style="font-size:0.8rem;color:var(--text-muted);text-align:center;margin-top:auto;padding-top:0.5rem;line-height:1.3;">${word.notas}</div>` : ''}
    `;

    card.appendChild(front);
    card.appendChild(back);
    wrapper.appendChild(card);
    return wrapper;
};

// --------------------------------------------------
// Mini card (word bank)
// --------------------------------------------------

/**
 * Creates a small draggable word card for the word bank.
 * @param {object} word
 * @returns {HTMLElement}
 */
const createMiniCard = (word) => {
    const color = CATEGORY_COLORS[word.categoria] || 'var(--color-noun)';
    const div = document.createElement('div');
    div.className = 'mini-card';
    div.dataset.id = word.id;
    div.dataset.tradicional = word.tradicional;
    div.dataset.pinyin = word.pinyin;
    div.dataset.categoria = word.categoria;
    div.style.setProperty('--card-color', color);
    div.innerHTML = `
        <span class="mini-char">${word.tradicional}</span>
        <span class="mini-pinyin">${word.pinyin}</span>
    `;
    return div;
};

/**
 * Creates a mini card for the builder dropzone (includes remove button).
 * @param {object} word
 * @returns {HTMLElement}
 */
const createBuilderMiniCard = (word) => {
    const card = createMiniCard(word);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'mini-remove';
    removeBtn.innerHTML = '✕';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.style.transform = 'scale(0)';
        card.style.opacity = '0';
        setTimeout(() => {
            card.remove();
            updateBuilderPreview(); // defined in builder.js
        }, 200);
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
    div.innerHTML = `
        <div class="structure-actions">
            <button class="btn-ghost btn-icon delete-btn" title="Eliminar" data-id="${struct.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </div>
        <h4>${struct.nombre}</h4>
        <div class="formula">${struct.formula}</div>
        <div class="example-row">
            <div>
                <span class="ex-label">Ejemplo</span>
                <span class="ex-value chinese">${struct.ejemplo_tradicional}</span>
            </div>
            <div>
                <span class="ex-label">Pinyin</span>
                <span class="ex-value">${struct.ejemplo_pinyin}</span>
            </div>
            <div>
                <span class="ex-label">Español</span>
                <span class="ex-value">${struct.ejemplo_espanol}</span>
            </div>
        </div>
        ${struct.notas ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.75rem;">💡 ${struct.notas}</p>` : ''}
    `;
    div.querySelector('.delete-btn').addEventListener('click', () => {
        openDeleteDialog(struct.id, struct.nombre, 'estructura');
    });
    return div;
};
