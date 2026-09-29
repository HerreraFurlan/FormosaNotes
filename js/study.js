/**
 * =====================================================
 * AppChino — study.js
 * Study mode: interactive flashcard quiz with shuffle.
 * =====================================================
 */

let studyDeck = [];
let studyIndex = 0;

/**
 * Initializes the study deck with a shuffled set of words.
 * @param {string} filter - Category filter ('todos' or a category key)
 */
const initStudyMode = (filter = 'todos') => {
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
    renderStudyCard();
};

/**
 * Renders the current study card and navigation controls.
 */
const renderStudyCard = () => {
    const container = document.getElementById('study-container');

    if (studyDeck.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <h3>No hay palabras para estudiar</h3>
                <p>Registra algunas palabras primero en la Biblioteca.</p>
            </div>
        `;
        return;
    }

    const word = studyDeck[studyIndex];
    const color = CATEGORY_COLORS[word.categoria] || 'var(--color-noun)';

    let backDetails = `
        <div class="detail-row"><span class="detail-label">Pinyin</span><span class="detail-value">${word.pinyin}</span></div>
        <div class="detail-row"><span class="detail-label">Zhuyin</span><span class="detail-value zhuyin-val">${word.zhuyin || '—'}</span></div>
    `;
    if (word.clasificador) {
        const clf = getAllWords().find(w => w.id === word.clasificador);
        const clfDisplay = clf
            ? `<span class="radical-ref" data-ref-id="${clf.id}" data-level="0">${clf.tradicional} (${clf.pinyin})</span>`
            : word.clasificador;
        backDetails += `<div class="detail-row"><span class="detail-label">Clasificador</span><span class="detail-value">${clfDisplay}</span></div>`;
    }
    if (word.radicales) {
        let radHtml = '';
        if (Array.isArray(word.radicales)) {
            radHtml = word.radicales.map(rad => {
                if (rad.type === 'text') return rad.value;
                if (rad.type === 'ref') {
                    const refWord = getAllWords().find(w => w.id === rad.id);
                    return refWord ? `<span class="radical-ref" data-ref-id="${rad.id}" data-level="0">${refWord.tradicional} (${refWord.espanol})</span>` : '';
                }
                return '';
            }).join(' + ');
        } else {
            radHtml = word.radicales;
        }
        if (radHtml) backDetails += `<div class="detail-row"><span class="detail-label">Radicales</span><span class="detail-value">${radHtml}</span></div>`;
    }

    const charLen = (word.tradicional || '').length;
    const lenClass = charLen <= 1 ? 'len-1' : charLen === 2 ? 'len-2' : charLen === 3 ? 'len-3' : charLen === 4 ? 'len-4' : charLen === 5 ? 'len-5' : charLen === 6 ? 'len-6' : 'len-long';
    const pinyinLenClass = (word.pinyin || '').length > 16 ? 'pinyin-long' : '';

    container.innerHTML = `
        <div class="study-progress">${studyIndex + 1} / ${studyDeck.length}</div>
        <div class="study-card-wrapper" style="--card-color: ${color};">
            <div class="study-card" id="study-card">
                <!-- Front face -->
                <div class="card-face card-front" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%; box-sizing: border-box; padding: 2rem 1.5rem;">
                    ${word.zhuyin ? `<span class="zhuyin-corner">${word.zhuyin}</span>` : ''}
                    <div class="chinese-char ${lenClass}" style="margin-bottom: 1rem; width: 100%; text-align: center;">${word.tradicional}</div>
                    <div class="pinyin-label ${pinyinLenClass}" style="font-weight: 600; color: var(--card-color); width: 100%; text-align: center;">${word.pinyin}</div>
                    <span class="card-category-badge badge badge-${word.categoria}">${CATEGORY_LABELS[word.categoria] || word.categoria}</span>
                </div>
                <!-- Back face -->
                <div class="card-face card-back" style="display: flex; flex-direction: column;">
                    <div class="spanish-meaning" style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1rem; text-align: center;">${word.espanol}</div>
                    <div class="details-list" style="width: 100%;">${backDetails}</div>
                    ${word.notas ? `<div style="font-size:0.85rem;font-weight:500;color:var(--text-muted);text-align:center;margin-top:auto;padding-top:1rem;line-height:1.3;">${word.notas}</div>` : ''}
                </div>
            </div>
        </div>
        <div class="study-controls">
            <button class="btn btn-secondary" id="study-prev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
                Anterior
            </button>
            <button class="btn btn-primary" id="study-flip">Voltear</button>
            <button class="btn btn-secondary" id="study-next">
                Siguiente
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
        </div>
        <button class="btn btn-secondary btn-sm" id="study-shuffle" style="margin-top:0.5rem;">
            🔀 Mezclar de nuevo
        </button>
    `;

    // Bind events
    const studyCard = document.getElementById('study-card');
    const studyWrapper = container.querySelector('.study-card-wrapper');

    studyWrapper.addEventListener('click', () => studyCard.classList.toggle('is-flipped'));
    document.getElementById('study-flip').addEventListener('click', () => studyCard.classList.toggle('is-flipped'));

    document.getElementById('study-prev').addEventListener('click', () => {
        if (studyIndex > 0) { studyIndex--; renderStudyCard(); }
    });

    document.getElementById('study-next').addEventListener('click', () => {
        studyIndex = (studyIndex + 1) % studyDeck.length;
        renderStudyCard();
    });

    document.getElementById('study-shuffle').addEventListener('click', () => {
        for (let i = studyDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [studyDeck[i], studyDeck[j]] = [studyDeck[j], studyDeck[i]];
        }
        studyIndex = 0;
        renderStudyCard();
        showToast('Mazo mezclado', 'success');
    });
};
