/**
 * =====================================================
 * AppChino — app.js
 * Main controller: configurable UI generation, lazy rendering
 * (IntersectionObserver), skeleton loading states, navigation,
 * dialogs, event bindings, and application bootstrap.
 * =====================================================
 */

// ==========================================================
// CONFIGURACIÓN (SETTINGS) & FUENTES DESDE APP_CONFIG
// ==========================================================

const CHINESE_FONTS = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fonts?.stacks)
    ? APP_CONFIG.fonts.stacks
    : {
        kaiti: "'DFKai-SB', '標楷體', 'BiauKai', 'BiauKai TC', 'KaiTi', 'STKaiti', serif",
        serif: "'Noto Serif TC', 'PMingLiU', '新細明體', serif",
        sans: "'Noto Sans TC', 'Microsoft JhengHei', '微軟正黑體', sans-serif"
    };

const CHINESE_FONT_STORAGE_KEY = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fonts?.storageKey)
    ? APP_CONFIG.fonts.storageKey
    : 'appchino_chinese_font';

/**
 * Applies the selected Chinese font stack globally.
 */
const applyChineseFont = (fontKey) => {
    const defaultFont = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fonts?.default) || 'kaiti';
    const validKey = CHINESE_FONTS[fontKey] ? fontKey : defaultFont;
    const fontStack = CHINESE_FONTS[validKey];
    document.documentElement.style.setProperty('--font-chinese', fontStack);
    localStorage.setItem(CHINESE_FONT_STORAGE_KEY, validKey);

    document.querySelectorAll('.settings-font-card').forEach(card => {
        const val = card.dataset.font;
        const radio = card.querySelector('input[type="radio"]');
        const isActive = val === validKey;
        card.classList.toggle('active', isActive);
        if (radio) radio.checked = isActive;
    });
};

// Apply font immediately on script execution to avoid layout shift
try {
    const defaultFont = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fonts?.default) || 'kaiti';
    const savedFont = localStorage.getItem(CHINESE_FONT_STORAGE_KEY) || defaultFont;
    applyChineseFont(savedFont);
} catch (e) {
    console.warn("Could not load initial font preference:", e);
}

// ==========================================================
// FILTER & RENDERING STATE
// ==========================================================

let currentCategoriesFilter = ['todos'];
let currentLessonFilter = ['todas'];
let currentStructLessonFilter = ['todas'];
let currentSearch = '';
let currentPrintSearch = '';

let libraryGridObserver = null;
let exportGridObserver = null;

// Set of selected word IDs for PDF export (persists across lazy rendering batches)
const selectedExportIds = new Set();
window.selectedExportIds = selectedExportIds;

// Backward compatibility properties
Object.defineProperty(window, 'currentFilter', {
    get: () => currentCategoriesFilter[0] || 'todos',
    set: (val) => { currentCategoriesFilter = val ? [val] : ['todos']; }
});

// ==========================================================
// GENERADOR DE UI DINÁMICA DESDE APP_CONFIG
// ==========================================================

/**
 * Genera dinámicamente los chips de categorías, chips de lecciones,
 * opciones de <select id="w-categoria"> y píldoras de lecciones en el modal
 * a partir de APP_CONFIG (js/config.js).
 */
const renderConfigurableFiltersAndInputs = () => {
    if (typeof APP_CONFIG === 'undefined') return;

    const categories = APP_CONFIG.categories || [];
    const lessonsCfg = APP_CONFIG.lessons || { items: [], allowUnassigned: true, unassignedFilterId: 'ninguna', unassignedSymbol: '/', allFilterId: 'todas' };
    const lessonItems = lessonsCfg.items || [];

    const tFn = (key) => (typeof I18N !== 'undefined' ? I18N.t(key) : key);
    const getCatLbl = (id, plural) => (typeof I18N !== 'undefined' ? I18N.getCategoryLabel(id, plural) : id);

    // 1. Library Lesson Filter Chips (#library-lesson-chips)
    const libLessonEl = document.getElementById('library-lesson-chips');
    if (libLessonEl) {
        const allKey = lessonsCfg.allFilterId || 'todas';
        let html = `<button class="chip ${currentLessonFilter.includes(allKey) ? 'active' : ''}" data-lesson-filter="${allKey}" data-i18n="allLessons">${tFn('allLessons')}</button>`;
        lessonItems.forEach(item => {
            const isActive = currentLessonFilter.includes(String(item.id));
            html += `<button class="chip ${isActive ? 'active' : ''}" data-lesson-filter="${item.id}" data-lesson-label="${item.id}" data-lesson-short="true">${item.shortLabel || `L${item.number}`}</button>`;
        });
        if (lessonsCfg.allowUnassigned) {
            const unKey = lessonsCfg.unassignedFilterId || 'ninguna';
            const isActive = currentLessonFilter.includes(unKey);
            html += `<button class="chip ${isActive ? 'active' : ''}" data-lesson-filter="${unKey}" title="${tFn('unassignedLessonTitle')}">${lessonsCfg.unassignedSymbol || '/'}</button>`;
        }
        libLessonEl.innerHTML = html;
    }

    // 1b. Structures Lesson Filter Chips (#structures-lesson-chips)
    const structLessonEl = document.getElementById('structures-lesson-chips');
    if (structLessonEl) {
        const allKey = lessonsCfg.allFilterId || 'todas';
        let html = `<button class="chip ${currentStructLessonFilter.includes(allKey) ? 'active' : ''}" data-lesson-filter="${allKey}" data-i18n="allLessons">${tFn('allLessons')}</button>`;
        lessonItems.forEach(item => {
            const isActive = currentStructLessonFilter.includes(String(item.id));
            html += `<button class="chip ${isActive ? 'active' : ''}" data-lesson-filter="${item.id}" data-lesson-label="${item.id}" data-lesson-short="true">${item.shortLabel || `L${item.number}`}</button>`;
        });
        if (lessonsCfg.allowUnassigned) {
            const unKey = lessonsCfg.unassignedFilterId || 'ninguna';
            const isActive = currentStructLessonFilter.includes(unKey);
            html += `<button class="chip ${isActive ? 'active' : ''}" data-lesson-filter="${unKey}" title="${tFn('unassignedLessonTitle')}">${lessonsCfg.unassignedSymbol || '/'}</button>`;
        }
        structLessonEl.innerHTML = html;
    }

    // 2. Study Mode Lesson Filter Chips (#study-lesson-filters)
    const studyLessonEl = document.getElementById('study-lesson-filters');
    if (studyLessonEl) {
        const allKey = lessonsCfg.allFilterId || 'todas';
        let html = `<button class="chip active" data-lesson-filter="${allKey}" data-i18n="allLessons">${tFn('allLessons')}</button>`;
        lessonItems.forEach(item => {
            html += `<button class="chip" data-lesson-filter="${item.id}" data-lesson-label="${item.id}" data-lesson-short="true">${item.shortLabel || `L${item.number}`}</button>`;
        });
        if (lessonsCfg.allowUnassigned) {
            const unKey = lessonsCfg.unassignedFilterId || 'ninguna';
            html += `<button class="chip" data-lesson-filter="${unKey}" title="${tFn('unassignedLessonTitle')}">${lessonsCfg.unassignedSymbol || '/'}</button>`;
        }
        studyLessonEl.innerHTML = html;
    }

    // 3. Library Category Filter Chips (#filter-chips)
    const libCatEl = document.getElementById('filter-chips');
    if (libCatEl) {
        let html = `<button class="chip ${currentCategoriesFilter.includes('todos') ? 'active' : ''}" data-filter="todos" data-i18n="allCategories">${tFn('allCategories')}</button>`;
        categories.forEach(cat => {
            const isActive = currentCategoriesFilter.includes(cat.id);
            const iconHtml = cat.icon ? `${cat.icon} ` : '';
            html += `<button class="chip ${isActive ? 'active' : ''}" data-filter="${cat.id}">${iconHtml}<span data-cat-label="${cat.id}" data-cat-plural="true">${getCatLbl(cat.id, true)}</span></button>`;
        });
        libCatEl.innerHTML = html;
    }

    // 4. Builder Word Bank Category Filter Chips (#bank-filter-chips)
    const bankCatEl = document.getElementById('bank-filter-chips');
    if (bankCatEl) {
        const currentBankFilter = bankCatEl.querySelector('.chip.active')?.dataset.filter || 'todos';
        let html = `<button class="chip ${currentBankFilter === 'todos' ? 'active' : ''}" data-filter="todos" data-i18n="allCategories">${tFn('allCategories')}</button>`;
        categories.forEach(cat => {
            const isActive = currentBankFilter === cat.id;
            html += `<button class="chip ${isActive ? 'active' : ''}" data-filter="${cat.id}" data-cat-label="${cat.id}" data-cat-plural="true">${getCatLbl(cat.id, true)}</button>`;
        });
        bankCatEl.innerHTML = html;
    }

    // 5. Study Mode Category Filter Chips (#study-filters)
    const studyCatEl = document.getElementById('study-filters');
    if (studyCatEl) {
        let html = `<button class="chip active" data-filter="todos" data-i18n="allCategories">${tFn('allCategories')}</button>`;
        categories.forEach(cat => {
            html += `<button class="chip" data-filter="${cat.id}" data-cat-label="${cat.id}" data-cat-plural="true">${getCatLbl(cat.id, true)}</button>`;
        });
        studyCatEl.innerHTML = html;
    }

    // 6. Word Dialog Category Select (#w-categoria)
    const wordCatSelect = document.getElementById('w-categoria');
    if (wordCatSelect) {
        const prevVal = wordCatSelect.value || APP_CONFIG.ui?.defaultCategoryId || 'sustantivo';
        wordCatSelect.innerHTML = categories.map(cat => `
            <option value="${cat.id}" data-cat-label="${cat.id}" data-cat-plural="false">${getCatLbl(cat.id, false)}</option>
        `).join('');
        if (categories.some(c => c.id === prevVal)) {
            wordCatSelect.value = prevVal;
        }
    }

    // 7. Word Dialog Lesson Pill Group (#w-lesson-group)
    const wordLessonGroup = document.getElementById('w-lesson-group');
    if (wordLessonGroup) {
        const currentHiddenVal = document.getElementById('w-leccion')?.value || '';
        let html = '';
        if (lessonsCfg.allowUnassigned) {
            html += `<button type="button" class="btn-lesson-pill ${currentHiddenVal === '' ? 'active' : ''}" data-lesson="" title="${tFn('unassignedLessonTitle')}">${lessonsCfg.unassignedSymbol || '/'}</button>`;
        }
        lessonItems.forEach(item => {
            const isActive = String(currentHiddenVal) === String(item.id);
            const fullLbl = typeof I18N !== 'undefined' ? I18N.getLessonLabel(item.id, false) : `Lección ${item.number}`;
            html += `<button type="button" class="btn-lesson-pill ${isActive ? 'active' : ''}" data-lesson="${item.id}" title="${fullLbl}">${item.number}</button>`;
        });
        wordLessonGroup.innerHTML = html;
    }
};
window.renderConfigurableFiltersAndInputs = renderConfigurableFiltersAndInputs;

// ==========================================================
// BÚSQUEDA Y NORMALIZACIÓN FONÉTICA
// ==========================================================

/**
 * Strips tone marks from pinyin and standardizes string.
 */
const stripPinyinTones = (str) => {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[1-5]/g, '')
        .replace(/v/g, 'u')
        .toLowerCase()
        .trim();
};

/**
 * Strips tone marks from Zhuyin (Bopomofo) characters.
 */
const stripZhuyinTones = (str) => {
    if (!str) return '';
    return str
        .replace(/[ˇˊˋ˙ˉ·‧\u02c7\u02ca\u02cb\u02d9\u02c9\u00b7\u2027\u0300-\u036f1-5]/g, '')
        .trim();
};

/**
 * Enhanced search and sort for words.
 * Performs alike/fuzzy search across Hanzi, Pinyin, Zhuyin, and localized meaning (Spanish + English).
 *
 * @param {string} query - The search query
 * @param {Array|null} wordsList - Optional list of words (defaults to getAllWords())
 * @param {object} options - Search options (e.g. { includeChar: true })
 * @returns {Array} Sorted list of matched words
 */
window.searchAndSortWords = (query, wordsList = null, options = { includeChar: true }) => {
    if (!query || !query.trim()) return wordsList || getAllWords();

    const rawQ = query.trim();
    const qLower = rawQ.toLowerCase();
    const qPinyin = stripPinyinTones(rawQ);
    const qPinyinCompact = qPinyin.replace(/\s+/g, '');
    const qZhuyin = stripZhuyinTones(rawQ);
    const qZhuyinCompact = qZhuyin.replace(/\s+/g, '');
    const qMeaning = stripPinyinTones(rawQ);

    const hasZhuyinInQuery = /[\u3105-\u312F\u31A0-\u31BF]/.test(rawQ);
    const hasHanziInQuery = /[\u4e00-\u9fff]/.test(rawQ);

    const words = wordsList || getAllWords();
    const scoredWords = [];

    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        const trad = (w.tradicional || '').trim();
        const pinyinRaw = (w.pinyin || '').toLowerCase().trim();
        const pinyinNorm = stripPinyinTones(pinyinRaw);
        const pinyinCompact = pinyinNorm.replace(/\s+/g, '');
        const pinyinSyllables = pinyinNorm.split(/\s+/).filter(Boolean);

        const zhuyinRaw = (w.zhuyin || '').trim();
        const zhuyinNorm = stripZhuyinTones(zhuyinRaw);
        const zhuyinCompact = zhuyinNorm.replace(/\s+/g, '');
        const zhuyinSyllables = zhuyinNorm.split(/\s+/).filter(Boolean);

        const meaningActive = (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
        const combinedMeaningRaw = `${meaningActive} ${w.espanol || ''} ${w.english || ''}`.toLowerCase().trim();
        const meaningNorm = stripPinyinTones(combinedMeaningRaw);
        const activeMeaningNorm = stripPinyinTones(meaningActive.toLowerCase());
        const meaningWords = meaningNorm.split(/[\s,./\(\)\-—]+/).filter(Boolean);

        const charMatch = (options.includeChar !== false) && (trad.includes(rawQ) || trad.includes(qLower));
        const pinyinMatch = !!(qPinyin && (pinyinNorm.includes(qPinyin) || pinyinCompact.includes(qPinyinCompact)));
        const zhuyinMatch = !!(hasZhuyinInQuery && qZhuyin && (zhuyinNorm.includes(qZhuyin) || zhuyinCompact.includes(qZhuyinCompact)));
        const meaningMatch = !!(qMeaning && meaningNorm.includes(qMeaning));

        if (!charMatch && !pinyinMatch && !zhuyinMatch && !meaningMatch) {
            continue;
        }

        let score = 0;

        // Tier 1: Exact matches of entire word without tones
        if (hasHanziInQuery && trad === rawQ) {
            score = Math.max(score, 100000);
        }

        if (qPinyin && (pinyinNorm === qPinyin || pinyinCompact === qPinyinCompact)) {
            score = Math.max(score, 80000);
            if (pinyinRaw === qLower) {
                score += 5000;
            }
        }

        if (hasZhuyinInQuery && qZhuyin && (zhuyinNorm === qZhuyin || zhuyinCompact === qZhuyinCompact)) {
            score = Math.max(score, 80000);
            if (zhuyinRaw === rawQ) {
                score += 5000;
            }
        }

        if (qMeaning && (activeMeaningNorm === qMeaning || meaningWords.some(ew => ew === qMeaning))) {
            score = Math.max(score, 60000);
        }

        // Tier 2: Prefix exact syllable / word match
        if (score === 0) {
            if (qPinyin && pinyinSyllables.length > 0 && pinyinSyllables[0] === qPinyin) {
                score = Math.max(score, 40000);
            }
            if (hasZhuyinInQuery && qZhuyin && zhuyinSyllables.length > 0 && zhuyinSyllables[0] === qZhuyin) {
                score = Math.max(score, 40000);
            }
            if (hasHanziInQuery && trad.startsWith(rawQ)) {
                score = Math.max(score, 40000);
            }
            if (qMeaning && (activeMeaningNorm.startsWith(qMeaning) || meaningWords.some(ew => ew.startsWith(qMeaning)))) {
                score = Math.max(score, 30000);
            }
        }

        // Tier 3: Contains exact syllable anywhere in compound word
        if (score === 0) {
            if (qPinyin && pinyinSyllables.some(s => s === qPinyin)) {
                score = Math.max(score, 20000);
            }
            if (hasZhuyinInQuery && qZhuyin && zhuyinSyllables.some(s => s === qZhuyin)) {
                score = Math.max(score, 20000);
            }
        }

        // Tier 4: Prefix match of first syllable / pinyin
        if (score === 0) {
            if (qPinyin && (pinyinNorm.startsWith(qPinyin) || pinyinCompact.startsWith(qPinyinCompact))) {
                score = Math.max(score, 10000);
            }
            if (hasZhuyinInQuery && qZhuyin && (zhuyinNorm.startsWith(qZhuyin) || zhuyinCompact.startsWith(qZhuyinCompact))) {
                score = Math.max(score, 10000);
            }
        }

        // Tier 5: Any later syllable starts with query
        if (score === 0) {
            if (qPinyin && pinyinSyllables.some(s => s.startsWith(qPinyin))) {
                score = Math.max(score, 5000);
            }
            if (hasZhuyinInQuery && qZhuyin && zhuyinSyllables.some(s => s.startsWith(qZhuyin))) {
                score = Math.max(score, 5000);
            }
        }

        // Tier 6: Substring match in pinyin / zhuyin / hanzi
        if (score === 0) {
            if (pinyinMatch || zhuyinMatch || charMatch) {
                score = Math.max(score, 2000);
            }
        }

        // Tier 7: Substring match in meaning
        if (score === 0 && meaningMatch) {
            score = Math.max(score, 200);
        }

        score -= trad.length * 50;
        score -= pinyinNorm.length * 5;

        scoredWords.push({ word: w, score, index: i });
    }

    scoredWords.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        const aLen = (a.word.tradicional || '').length;
        const bLen = (b.word.tradicional || '').length;
        if (aLen !== bLen) {
            return aLen - bLen;
        }
        return a.index - b.index;
    });

    return scoredWords.map(sw => sw.word);
};

// ==========================================================
// RENDERING CON LAZY LOADING (IntersectionObserver) & SKELETONS
// ==========================================================

/**
 * Renders the main flashcard grid (Library section) with progressive batch rendering.
 */
const renderGrid = () => {
    const gridEl = document.getElementById('card-grid');
    if (!gridEl) return;

    if (libraryGridObserver) {
        libraryGridObserver.disconnect();
        libraryGridObserver = null;
    }

    gridEl.innerHTML = '';

    // Show skeleton placeholders if language pack is currently loading
    if (typeof I18N !== 'undefined' && typeof I18N.isLanguageLoading === 'function' && I18N.isLanguageLoading()) {
        if (typeof createFlashcardSkeletons === 'function') {
            gridEl.appendChild(createFlashcardSkeletons());
        }
        return;
    }

    let words = getAllWords();

    // 1. Filter by category (stackable)
    if (!currentCategoriesFilter.includes('todos') && currentCategoriesFilter.length > 0) {
        words = words.filter(w => currentCategoriesFilter.includes(w.categoria));
    }

    // 2. Filter by lesson via APP_CONFIG (stackable)
    if (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.matchesLessonFilter === 'function') {
        words = words.filter(w => APP_CONFIG.matchesLessonFilter(w, currentLessonFilter));
    }

    if (currentSearch) {
        words = window.searchAndSortWords(currentSearch, words);
    }

    if (words.length === 0) {
        const emptyTitle = typeof I18N !== 'undefined' ? I18N.t('noCardsFound') : 'No se encontraron resultados';
        const emptySub = typeof I18N !== 'undefined' ? I18N.t('noCardsFoundSub') : 'Intenta con otro filtro o término de búsqueda.';
        gridEl.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3>${emptyTitle}</h3>
                <p>${emptySub}</p>
            </div>
        `;
        return;
    }

    const initialBatch = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.initialCardBatchSize) || 36;
    const scrollBatch = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.scrollBatchSize) || 24;
    let renderedCount = 0;

    const appendNextBatch = (batchSize) => {
        const slice = words.slice(renderedCount, renderedCount + batchSize);
        if (slice.length === 0) return;
        const frag = document.createDocumentFragment();
        slice.forEach(word => frag.appendChild(createFlashcard(word)));
        const sentinel = gridEl.querySelector('.grid-lazy-sentinel');
        if (sentinel) {
            gridEl.insertBefore(frag, sentinel);
        } else {
            gridEl.appendChild(frag);
        }
        renderedCount += slice.length;
    };

    appendNextBatch(initialBatch);

    if (renderedCount < words.length && typeof IntersectionObserver !== 'undefined') {
        const sentinel = document.createElement('div');
        sentinel.className = 'grid-lazy-sentinel';
        sentinel.style.gridColumn = '1 / -1';
        sentinel.style.height = '1px';
        gridEl.appendChild(sentinel);

        libraryGridObserver = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                appendNextBatch(scrollBatch);
                if (renderedCount >= words.length) {
                    sentinel.remove();
                    libraryGridObserver?.disconnect();
                }
            }
        }, { rootMargin: '320px' });

        libraryGridObserver.observe(sentinel);
    }
};

/**
 * Renders the structures list.
 */
const renderStructures = () => {
    const listEl = document.getElementById('structures-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    const db = loadDB();
    let structures = db.estructuras || [];
    if (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.matchesLessonFilter === 'function') {
        structures = structures.filter(s => APP_CONFIG.matchesLessonFilter(s, currentStructLessonFilter));
    }

    if (structures.length === 0) {
        const emptyTitle = typeof I18N !== 'undefined' ? I18N.t('structuresEmpty') : 'No hay estructuras registradas';
        const emptySub = typeof I18N !== 'undefined' ? I18N.t('structuresEmptySub') : 'Ve al Constructor para crear tu primera estructura de oración.';
        listEl.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <h3>${emptyTitle}</h3>
                <p>${emptySub}</p>
            </div>
        `;
        return;
    }

    const frag = document.createDocumentFragment();
    structures.forEach(s => frag.appendChild(createStructureCard(s)));
    listEl.appendChild(frag);
};

/**
 * Returns filtered words for the Export / Print view.
 */
const getFilteredExportWords = () => {
    let words = getAllWords();
    if (currentPrintSearch) {
        words = window.searchAndSortWords(currentPrintSearch, words);
    }
    return words;
};

/**
 * Renders the export grid with selectable flashcards and Lazy Rendering.
 */
const renderExportGrid = () => {
    const gridEl = document.getElementById('export-grid');
    if (!gridEl) return;

    if (exportGridObserver) {
        exportGridObserver.disconnect();
        exportGridObserver = null;
    }

    gridEl.innerHTML = '';

    if (typeof I18N !== 'undefined' && typeof I18N.isLanguageLoading === 'function' && I18N.isLanguageLoading()) {
        if (typeof createFlashcardSkeletons === 'function') {
            gridEl.appendChild(createFlashcardSkeletons(6));
        }
        return;
    }

    const words = getFilteredExportWords();
    const initialBatch = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.initialCardBatchSize) || 36;
    const scrollBatch = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.scrollBatchSize) || 24;
    let renderedCount = 0;

    const handleCardSelectToggle = (wordId, isChecked) => {
        if (isChecked) {
            selectedExportIds.add(wordId);
        } else {
            selectedExportIds.delete(wordId);
        }
        updateExportCount();
    };

    const appendNextBatch = (batchSize) => {
        const slice = words.slice(renderedCount, renderedCount + batchSize);
        if (slice.length === 0) return;
        const frag = document.createDocumentFragment();
        slice.forEach(word => {
            frag.appendChild(createFlashcard(word, {
                showSelect: true,
                showActions: false,
                isSelected: selectedExportIds.has(word.id),
                onSelectToggle: handleCardSelectToggle
            }));
        });
        const sentinel = gridEl.querySelector('.grid-lazy-sentinel');
        if (sentinel) {
            gridEl.insertBefore(frag, sentinel);
        } else {
            gridEl.appendChild(frag);
        }
        renderedCount += slice.length;
    };

    appendNextBatch(initialBatch);

    if (renderedCount < words.length && typeof IntersectionObserver !== 'undefined') {
        const sentinel = document.createElement('div');
        sentinel.className = 'grid-lazy-sentinel';
        sentinel.style.gridColumn = '1 / -1';
        sentinel.style.height = '1px';
        gridEl.appendChild(sentinel);

        exportGridObserver = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                appendNextBatch(scrollBatch);
                if (renderedCount >= words.length) {
                    sentinel.remove();
                    exportGridObserver?.disconnect();
                }
            }
        }, { rootMargin: '320px' });

        exportGridObserver.observe(sentinel);
    }

    updateExportCount();
};

const updateExportCount = () => {
    const countEl = document.getElementById('export-count');
    if (!countEl) return;
    const count = selectedExportIds.size;
    countEl.textContent = typeof I18N !== 'undefined'
        ? I18N.t('printSelectedCount', { count })
        : `${count} seleccionadas`;
};

/**
 * Refreshes all visible data across sections.
 */
const refreshAll = () => {
    renderGrid();
    renderStructures();
    renderExportGrid();
};

// ==========================================================
// DIALOGS — Add / Edit / Delete
// ==========================================================

let editingWordId = null;
let deletingItemId = null;
let deletingItemType = 'palabra';

const wordDialog   = document.getElementById('word-dialog');
const wordForm     = document.getElementById('word-form');
const deleteDialog = document.getElementById('delete-dialog');

// ==========================================================
// RADICAL BUILDER LOGIC - STATE & RENDER
// ==========================================================
let currentRadicals = [];

const renderRadicalChips = () => {
    const container = document.getElementById('radical-chips-container');
    if (!container) return;
    container.innerHTML = '';
    const lookup = (id) => (typeof getWordById === 'function' ? getWordById(id) : getAllWords().find(w => w.id === id));
    const getMeaning = (w) => (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
    const unknownTxt = (window.I18N && window.I18N.t) ? window.I18N.t('unknownRadical') : 'Desconocido';

    currentRadicals.forEach((rad, index) => {
        const chip = document.createElement('div');
        chip.className = 'radical-chip' + (rad.type === 'ref' ? ' chip-ref' : '');
        
        if (rad.type === 'text') {
            chip.innerHTML = `<span>${rad.value}</span>`;
        } else if (rad.type === 'ref') {
            const word = lookup(rad.id);
            if (word) {
                const color = CATEGORY_COLORS[word.categoria] || 'var(--accent)';
                chip.style.setProperty('--chip-color', color);
                chip.innerHTML = `<span class="sug-char">${word.tradicional}</span> <span class="sug-spanish">(${getMeaning(word)})</span>`;
            } else {
                chip.innerHTML = `<span>${unknownTxt}</span>`;
            }
        }
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'chip-remove';
        removeBtn.innerHTML = '✕';
        removeBtn.addEventListener('click', () => {
            currentRadicals.splice(index, 1);
            renderRadicalChips();
        });
        chip.appendChild(removeBtn);
        container.appendChild(chip);
    });
};

let sortableRadicals = null;
const initSortableRadicals = () => {
    const container = document.getElementById('radical-chips-container');
    if (container && !sortableRadicals) {
        if (typeof Sortable !== 'undefined') {
            sortableRadicals = new Sortable(container, {
                animation: 150,
                onEnd: function (evt) {
                    const newIndex = evt.newIndex;
                    const oldIndex = evt.oldIndex;
                    if (newIndex === oldIndex) return;
                    
                    const [movedItem] = currentRadicals.splice(oldIndex, 1);
                    currentRadicals.splice(newIndex, 0, movedItem);
                    renderRadicalChips();
                }
            });
        }
    }
};

const formatClassifierShort = (c) => {
    let desc = (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(c) : (c.espanol || '');
    desc = desc.replace(/^(Clasificador|Classifier)\s+(para\s+|de\s+|numeral\s+para\s+|universal\s+|for\s+|of\s+)?/i, '');
    desc = desc.replace(/^verbal\s+(de\s+|for\s+)?/i, '');
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    if (desc.length > 28) desc = desc.slice(0, 26) + '...';
    return `${c.tradicional} (${c.pinyin}) — ${desc}`;
};

/**
 * Populates the classifier select dropdown with all registered classifiers.
 * @param {string} selectedId
 */
const populateClassifierSelect = (selectedId = '') => {
    const clfSelect = document.getElementById('w-clasificador');
    if (!clfSelect) return;
    const classifiers = getAllClassifiers();
    const noneLabel = typeof I18N !== 'undefined' ? I18N.t('wordDialogNone') : 'Ninguno';
    const getMeaning = (w) => (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
    clfSelect.innerHTML = `<option value="" data-i18n="wordDialogNone">${noneLabel}</option>`;
    classifiers.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = formatClassifierShort(c);
        opt.title = `${c.tradicional} (${c.pinyin}) - ${getMeaning(c)}`;
        if (c.id === selectedId) {
            opt.selected = true;
        }
        clfSelect.appendChild(opt);
    });
};

// ==========================================================
// PINYIN TONE NUMBER CONVERTER (Field #w-pinyin)
// ==========================================================

const PINYIN_UNACCENT_MAP = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
    'Ā': 'A', 'Á': 'A', 'Ǎ': 'A', 'À': 'A',
    'Ē': 'E', 'É': 'E', 'Ě': 'E', 'È': 'E',
    'Ī': 'I', 'Í': 'I', 'Ǐ': 'I', 'Ì': 'I',
    'Ō': 'O', 'Ó': 'O', 'Ǒ': 'O', 'Ò': 'O',
    'Ū': 'U', 'Ú': 'U', 'Ǔ': 'U', 'Ù': 'U',
    'Ǖ': 'Ü', 'Ǘ': 'Ü', 'Ǚ': 'Ü', 'Ǜ': 'Ü'
};

const PINYIN_TONE_MAP = {
    'a': ['ā', 'á', 'ǎ', 'à'],
    'e': ['ē', 'é', 'ě', 'è'],
    'i': ['ī', 'í', 'ǐ', 'ì'],
    'o': ['ō', 'ó', 'ǒ', 'ò'],
    'u': ['ū', 'ú', 'ǔ', 'ù'],
    'v': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    'A': ['Ā', 'Á', 'Ǎ', 'À'],
    'E': ['Ē', 'É', 'Ě', 'È'],
    'I': ['Ī', 'Í', 'Ǐ', 'Ì'],
    'O': ['Ō', 'Ó', 'Ǒ', 'Ò'],
    'U': ['Ū', 'Ú', 'Ǔ', 'Ù'],
    'V': ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ'],
    'Ü': ['Ǖ', 'Ǘ', 'Ǚ', 'Ǜ']
};

const convertPinyinSyllable = (syllable, toneNum) => {
    if (!syllable) return null;

    let base = '';
    for (const ch of syllable) {
        base += PINYIN_UNACCENT_MAP[ch] || ch;
    }

    if (toneNum === 0 || toneNum === 5) {
        return base.replace(/v/g, 'ü').replace(/V/g, 'Ü');
    }

    if (toneNum < 1 || toneNum > 4) return null;

    let idx = -1;
    let m = base.search(/[aA]/);
    if (m !== -1) {
        idx = m;
    } else {
        m = base.search(/[eE]/);
        if (m !== -1) {
            idx = m;
        } else {
            m = base.search(/[oO][uU]/);
            if (m !== -1) {
                idx = m;
            } else {
                const vowelRegex = /[iIuUvVüÜoO]/g;
                let match;
                while ((match = vowelRegex.exec(base)) !== null) {
                    idx = match.index;
                }
            }
        }
    }

    if (idx === -1) return null;

    const targetChar = base[idx];
    const tonedChar = PINYIN_TONE_MAP[targetChar] ? PINYIN_TONE_MAP[targetChar][toneNum - 1] : targetChar;
    const res = base.slice(0, idx) + tonedChar + base.slice(idx + 1);
    return res.replace(/v/g, 'ü').replace(/V/g, 'Ü');
};

const isPinyinVowel = (ch) => {
    if (!ch) return false;
    const base = PINYIN_UNACCENT_MAP[ch] || ch;
    return /[aeiouüvAEIOUÜV]/.test(base);
};

const isPinyinConsonant = (ch) => {
    if (!ch) return false;
    return /[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]/.test(ch) && ch.toLowerCase() !== 'v';
};

const extractLastPinyinSyllable = (textBefore) => {
    if (!textBefore || textBefore.length === 0) return null;

    let endIdx = textBefore.length - 1;
    const lastChar = textBefore[endIdx];
    if (!isPinyinVowel(lastChar) && !isPinyinConsonant(lastChar)) {
        return null;
    }

    let i = endIdx;

    if (i >= 2 && textBefore.slice(i - 1, i + 1).toLowerCase() === 'ng' && isPinyinVowel(textBefore[i - 2])) {
        i -= 2;
    } else if (i >= 1 && textBefore[i].toLowerCase() === 'n' && isPinyinVowel(textBefore[i - 1])) {
        i -= 1;
    } else if (i >= 1 && textBefore[i].toLowerCase() === 'r' && isPinyinVowel(textBefore[i - 1])) {
        i -= 1;
    }

    const vowelEnd = i;
    while (i >= 0 && isPinyinVowel(textBefore[i])) {
        i--;
    }
    const vowelStart = i + 1;

    if (vowelStart > vowelEnd) {
        return null;
    }

    let onsetStart = vowelStart;
    if (i >= 1) {
        const twoChar = textBefore.slice(i - 1, i + 1).toLowerCase();
        if (twoChar === 'zh' || twoChar === 'ch' || twoChar === 'sh') {
            onsetStart = i - 1;
        } else if (isPinyinConsonant(textBefore[i])) {
            onsetStart = i;
        }
    } else if (i === 0 && isPinyinConsonant(textBefore[0])) {
        onsetStart = 0;
    }

    const syllable = textBefore.slice(onsetStart);
    const prefix = textBefore.slice(0, onsetStart);

    return { syllable, prefix };
};

const attachPinyinToneInput = (input) => {
    if (!input) return;

    input.addEventListener('keydown', (e) => {
        let toneNum = null;
        if (['1', '2', '3', '4', '5'].includes(e.key)) {
            toneNum = parseInt(e.key, 10);
        } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5'].includes(e.code)) {
            const digitMatch = e.code.match(/[1-5]/);
            if (digitMatch) toneNum = parseInt(digitMatch[0], 10);
        }

        if (toneNum === null) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        const cursorPos = input.selectionStart;
        const selEnd = input.selectionEnd;
        const val = input.value;

        const textBefore = val.slice(0, cursorPos);
        const textAfter = val.slice(selEnd);

        const extracted = extractLastPinyinSyllable(textBefore);
        if (!extracted) return;

        const { syllable, prefix } = extracted;
        const converted = convertPinyinSyllable(syllable, toneNum);
        if (!converted) return;

        e.preventDefault();

        const newTextBefore = prefix + converted;
        input.value = newTextBefore + textAfter;

        const newPos = newTextBefore.length;
        input.setSelectionRange(newPos, newPos);

        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
};
window.attachPinyinToneInput = attachPinyinToneInput;
window.convertPinyinSyllable = convertPinyinSyllable;
window.extractLastPinyinSyllable = extractLastPinyinSyllable;

const initPinyinToneInput = () => {
    const input = document.getElementById('w-pinyin');
    if (!input) return;
    attachPinyinToneInput(input);
};

/**
 * Sets the active lesson pill in the Word Dialog.
 * @param {string|number|null} lessonVal
 */
const setWordDialogLesson = (lessonVal) => {
    const valStr = lessonVal ? String(lessonVal).trim() : '';
    const hiddenInput = document.getElementById('w-leccion');
    if (hiddenInput) {
        hiddenInput.value = valStr;
    }
    document.querySelectorAll('#w-lesson-group .btn-lesson-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lesson === valStr);
    });
};

/**
 * Opens the Add Word dialog.
 */
const openAddDialog = () => {
    editingWordId = null;
    document.getElementById('word-dialog-title').textContent = typeof I18N !== 'undefined' ? I18N.t('wordDialogNewTitle') : 'Nueva Palabra';
    wordForm.reset();
    setWordDialogLesson('');
    populateClassifierSelect('');
    const clfSelect = document.getElementById('w-clasificador');
    if (clfSelect) clfSelect.disabled = false;
    
    currentRadicals = [];
    renderRadicalChips();
    initSortableRadicals();
    document.querySelector('.radical-tab[data-type="text"]')?.click();
    
    wordDialog.showModal();
};

/**
 * Opens the Edit Word dialog, pre-populated with existing data.
 * @param {string} id - Word ID
 */
const openEditDialog = (id) => {
    editingWordId = id;
    const word = (typeof getWordById === 'function')
        ? getWordById(id)
        : getAllWords().find(w => w.id === id);
    if (!word) return;

    const getMeaning = (w) => (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
    const getNotes = (w) => (window.I18N && window.I18N.getWordNotes) ? window.I18N.getWordNotes(w) : (w.notas || '');
    const defaultCat = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.defaultCategoryId) || 'sustantivo';

    document.getElementById('word-dialog-title').textContent = typeof I18N !== 'undefined' ? I18N.t('wordDialogEditTitle') : 'Editar Palabra';
    document.getElementById('w-espanol').value      = getMeaning(word);
    document.getElementById('w-categoria').value    = word.categoria || defaultCat;
    document.getElementById('w-tradicional').value  = word.tradicional || '';
    document.getElementById('w-pinyin').value       = word.pinyin || '';
    document.getElementById('w-zhuyin').value       = word.zhuyin || '';
    setWordDialogLesson(word.leccion || '');
    populateClassifierSelect(word.clasificador || '');
    const clfSelect = document.getElementById('w-clasificador');
    if (clfSelect) {
        const catDef = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.getCategory(word.categoria) : null;
        clfSelect.disabled = catDef ? (catDef.allowsClassifier === false) : (word.categoria === 'clasificador');
    }
    document.getElementById('w-notas').value        = getNotes(word);

    if (typeof word.radicales === 'string' && word.radicales.trim() !== '') {
        currentRadicals = [{ type: 'text', value: word.radicales }];
    } else if (Array.isArray(word.radicales)) {
        currentRadicals = [...word.radicales];
    } else {
        currentRadicals = [];
    }
    renderRadicalChips();
    initSortableRadicals();
    document.querySelector('.radical-tab[data-type="text"]')?.click();

    wordDialog.showModal();
};

/**
 * Opens the delete confirmation dialog.
 * @param {string} id
 * @param {string} name - Display name for confirmation message
 * @param {string} type - 'palabra' or 'estructura'
 */
const openDeleteDialog = (id, name, type = 'palabra') => {
    deletingItemId = id;
    deletingItemType = type;
    document.getElementById('delete-item-name').textContent = `"${name}"`;
    deleteDialog.showModal();
};

// ==========================================================
// NAVIGATION
// ==========================================================

/**
 * Navigates to a section by name.
 * @param {string} sectionName
 */
const navigateTo = (sectionName) => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${sectionName}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item[data-section]').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
    if (navItem) navItem.classList.add('active');

    if (sectionName === 'constructor') {
        const activeBankChip = document.querySelector('#bank-filter-chips .chip.active');
        renderWordBank(activeBankChip ? activeBankChip.dataset.filter : 'todos');
    } else if (sectionName === 'estudio') {
        initStudyMode();
    } else if (sectionName === 'practica') {
        initPracticeMode();
    } else if (sectionName === 'exam') {
        if (typeof initExamMode === 'function') initExamMode();
    } else if (sectionName === 'exportar') {
        renderExportGrid();
    } else if (sectionName === 'estructuras') {
        renderStructures();
    }

    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
};

// ==========================================================
// IMPORT / EXPORT JSON
// ==========================================================

const handleExportJSON = () => {
    const data = getExportData();
    const db = loadDB();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appchino-datos-${db.meta.ultimaEdicion}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(typeof I18N !== 'undefined' ? I18N.t('toastDataExported') : 'Datos exportados correctamente', 'success');
};

const handleImportJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (importData(e.target.result)) {
            showToast(typeof I18N !== 'undefined' ? I18N.t('toastDataImported') : 'Datos importados correctamente. Recargando...', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast(typeof I18N !== 'undefined' ? I18N.t('toastDataImportInvalid') : 'Archivo JSON inválido: falta la estructura esperada.', 'error');
        }
    };
    reader.onerror = () => showToast(typeof I18N !== 'undefined' ? I18N.t('toastDataImportError') : 'Error al leer el archivo.', 'error');
    reader.readAsText(file);
};

// ==========================================================
// BOOTSTRAP — DOMContentLoaded (Async Lazy Load + Skeletons)
// ==========================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inject dynamic category CSS variables and badge rules from APP_CONFIG
    if (typeof injectDynamicCategoryStyles === 'function') {
        injectDynamicCategoryStyles();
    }

    // 2. Build dynamic filters and inputs from APP_CONFIG
    renderConfigurableFiltersAndInputs();

    // 3. Initialize Gemini API Key from localStorage if available
    setGeminiApiKey(localStorage.getItem(GEMINI_API_KEY_STORAGE));
    window.setGeminiApiKey = setGeminiApiKey;

    // 4. Sidebar navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.section));
    });

    // 5. Collapsible sidebar
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
    const brandIcon = document.querySelector('.sidebar-brand .brand-icon');

    const updateSidebarTooltip = (isCollapsed) => {
        if (sidebarCollapseBtn) {
            const label = typeof I18N !== 'undefined'
                ? I18N.t(isCollapsed ? 'expandMenu' : 'collapseMenu')
                : (isCollapsed ? 'Expandir menú' : 'Colapsar menú');
            sidebarCollapseBtn.setAttribute('data-tooltip', label);
            sidebarCollapseBtn.setAttribute('title', label);
            sidebarCollapseBtn.setAttribute('aria-label', label);
        }
    };

    const isSidebarCollapsed = localStorage.getItem('appchino_sidebar_collapsed') === 'true';
    if (isSidebarCollapsed && window.innerWidth > 768) {
        document.body.classList.add('sidebar-collapsed');
        updateSidebarTooltip(true);
    } else {
        updateSidebarTooltip(false);
    }

    if (sidebarCollapseBtn) {
        sidebarCollapseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const collapsed = document.body.classList.toggle('sidebar-collapsed');
            localStorage.setItem('appchino_sidebar_collapsed', collapsed ? 'true' : 'false');
            updateSidebarTooltip(collapsed);
        });
    }

    if (brandIcon) {
        brandIcon.addEventListener('click', () => {
            if (document.body.classList.contains('sidebar-collapsed')) {
                document.body.classList.remove('sidebar-collapsed');
                localStorage.setItem('appchino_sidebar_collapsed', 'false');
                updateSidebarTooltip(false);
            }
        });
    }

    // 6. Mobile sidebar
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('open');
    });
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
    });

    // 7. Add word & Pinyin input
    document.getElementById('btn-add-word').addEventListener('click', openAddDialog);
    initPinyinToneInput();

    // 8. Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderGrid();
    });

    // 9. Library lesson filter chips (stackable multi-selection)
    const libraryLessonChips = document.getElementById('library-lesson-chips');
    if (libraryLessonChips) {
        libraryLessonChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            const allKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.lessons?.allFilterId) || 'todas';
            const lessonVal = chip.dataset.lessonFilter || allKey;

            if (lessonVal === allKey) {
                currentLessonFilter = [allKey];
            } else {
                let lessons = currentLessonFilter.filter(l => l !== allKey);
                if (lessons.includes(lessonVal)) {
                    lessons = lessons.filter(l => l !== lessonVal);
                } else {
                    lessons.push(lessonVal);
                }
                if (lessons.length === 0) {
                    lessons = [allKey];
                }
                currentLessonFilter = lessons;
            }

            document.querySelectorAll('#library-lesson-chips .chip').forEach(c => {
                const val = c.dataset.lessonFilter;
                c.classList.toggle('active', currentLessonFilter.includes(val));
            });

            renderGrid();
        });
    }

    // 9b. Structures lesson filter chips (stackable multi-selection from APP_CONFIG)
    const structLessonChips = document.getElementById('structures-lesson-chips');
    if (structLessonChips) {
        structLessonChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            const allKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.lessons?.allFilterId) || 'todas';
            const lessonVal = chip.dataset.lessonFilter || allKey;

            if (lessonVal === allKey) {
                currentStructLessonFilter = [allKey];
            } else {
                let lessons = currentStructLessonFilter.filter(l => l !== allKey);
                if (lessons.includes(lessonVal)) {
                    lessons = lessons.filter(l => l !== lessonVal);
                } else {
                    lessons.push(lessonVal);
                }
                if (lessons.length === 0) {
                    lessons = [allKey];
                }
                currentStructLessonFilter = lessons;
            }

            document.querySelectorAll('#structures-lesson-chips .chip').forEach(c => {
                const val = c.dataset.lessonFilter;
                c.classList.toggle('active', currentStructLessonFilter.includes(val));
            });

            renderStructures();
        });
    }

    // 10. Library category filter chips (stackable multi-selection)
    const libraryCatChips = document.getElementById('filter-chips');
    if (libraryCatChips) {
        libraryCatChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            const catVal = chip.dataset.filter || 'todos';

            if (catVal === 'todos') {
                currentCategoriesFilter = ['todos'];
            } else {
                let cats = currentCategoriesFilter.filter(c => c !== 'todos');
                if (cats.includes(catVal)) {
                    cats = cats.filter(c => c !== catVal);
                } else {
                    cats.push(catVal);
                }
                if (cats.length === 0) {
                    cats = ['todos'];
                }
                currentCategoriesFilter = cats;
            }

            document.querySelectorAll('#filter-chips .chip').forEach(c => {
                const val = c.dataset.filter;
                c.classList.toggle('active', currentCategoriesFilter.includes(val));
            });

            renderGrid();
        });
    }

    // 11. Builder bank filter chips
    document.getElementById('bank-filter-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#bank-filter-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderWordBank(chip.dataset.filter);
    });

    // 12. Category change listener (Word Dialog)
    const catSelect = document.getElementById('w-categoria');
    const clfSelect = document.getElementById('w-clasificador');
    if (catSelect && clfSelect) {
        catSelect.addEventListener('change', (e) => {
            const catDef = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.getCategory(e.target.value) : null;
            const disableClf = catDef ? (catDef.allowsClassifier === false) : (e.target.value === 'clasificador');
            if (disableClf) {
                clfSelect.value = '';
                clfSelect.disabled = true;
            } else {
                clfSelect.disabled = false;
            }
        });
    }

    // 13. Lesson picker pills listener (Word Dialog)
    const lessonGroup = document.getElementById('w-lesson-group');
    if (lessonGroup) {
        lessonGroup.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-lesson-pill');
            if (!btn) return;
            setWordDialogLesson(btn.dataset.lesson);
        });
    }

    // 14. Radical builder tabs & inputs
    document.querySelectorAll('.radical-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.radical-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const type = e.target.dataset.type;
            document.getElementById('radical-text-area').style.display = type === 'text' ? 'block' : 'none';
            document.getElementById('radical-library-area').style.display = type === 'library' ? 'block' : 'none';
        });
    });

    const btnAddText = document.getElementById('btn-add-radical-text');
    if (btnAddText) {
        btnAddText.addEventListener('click', () => {
            const input = document.getElementById('w-radicales-text');
            const val = input.value.trim();
            if (val) {
                currentRadicals.push({ type: 'text', value: val });
                input.value = '';
                renderRadicalChips();
            }
        });
    }

    const radSearchInput = document.getElementById('w-radicales-search');
    const radSuggestions = document.getElementById('radical-suggestions');

    const searchLibraryRadicals = (query) => {
        if (!query || query.length < 1) return [];
        return window.searchAndSortWords(query).filter(w => {
            const catDef = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.getCategory(w.categoria) : null;
            return catDef ? !catDef.isClassifier : w.categoria !== 'clasificador';
        }).slice(0, 8);
    };

    const renderRadSuggestions = (results) => {
        if (results.length === 0) {
            radSuggestions.classList.remove('visible');
            radSuggestions.innerHTML = '';
            return;
        }
        const getMeaning = (w) => (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
        radSuggestions.innerHTML = results.map((w, i) => {
            const color = CATEGORY_COLORS[w.categoria] || 'var(--text-muted)';
            return `
                <div class="pinyin-suggestion-item" data-index="${i}">
                    <span class="sug-char" style="color: ${color}">${w.tradicional}</span>
                    <span class="sug-pinyin">${w.pinyin}</span>
                    <span class="sug-spanish">(${getMeaning(w)})</span>
                </div>
            `;
        }).join('');
        radSuggestions.classList.add('visible');

        radSuggestions.querySelectorAll('.pinyin-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index, 10);
                const w = results[idx];
                currentRadicals.push({ type: 'ref', id: w.id });
                renderRadicalChips();
                radSearchInput.value = '';
                radSuggestions.classList.remove('visible');
            });
        });
    };

    if (radSearchInput) {
        radSearchInput.addEventListener('input', (e) => {
            const results = searchLibraryRadicals(e.target.value);
            renderRadSuggestions(results);
        });
    }

    document.addEventListener('click', (e) => {
        if (radSuggestions && !e.target.closest('#radical-library-area')) {
            radSuggestions.classList.remove('visible');
        }
    });

    // ==========================================================
    // NESTED HOVERS LOGIC (O(1) getWordById)
    // ==========================================================
    let hoverTimeout;
    let currentPopovers = [];

    const closePopoversFrom = (index) => {
        while (currentPopovers.length > index) {
            const pop = currentPopovers.pop();
            pop.remove();
        }
    };

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.radical-ref') || e.target.closest('.radical-popover')) {
            clearTimeout(hoverTimeout);
        }

        const refEl = e.target.closest('.radical-ref');
        if (refEl) {
            const refId = refEl.dataset.refId;
            const popoverLevel = parseInt(refEl.dataset.level || '0', 10);
            
            if (currentPopovers[popoverLevel] && currentPopovers[popoverLevel].dataset.refId === refId) {
                return;
            }
            
            closePopoversFrom(popoverLevel);
            
            const lookup = (id) => (typeof getWordById === 'function' ? getWordById(id) : getAllWords().find(w => w.id === id));
            const getMeaning = (w) => (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
            const getNotes = (w) => (window.I18N && window.I18N.getWordNotes) ? window.I18N.getWordNotes(w) : (w.notas || '');

            const word = lookup(refId);
            if (!word) return;

            const popover = document.createElement('div');
            popover.className = 'radical-popover';
            popover.dataset.refId = refId;
            
            let clfDisplay = '';
            if (word.clasificador) {
                const clf = lookup(word.clasificador);
                clfDisplay = clf
                    ? `<span class="radical-ref" data-ref-id="${clf.id}" data-level="${popoverLevel + 1}">${clf.tradicional} (${clf.pinyin})</span>`
                    : word.clasificador;
            }
            
            let radHtml = '';
            if (word.radicales) {
                if (Array.isArray(word.radicales)) {
                    radHtml = word.radicales.map(rad => {
                        if (rad.type === 'text') return rad.value;
                        if (rad.type === 'ref') {
                            const refWord = lookup(rad.id);
                            return refWord ? `<span class="radical-ref" data-ref-id="${rad.id}" data-level="${popoverLevel + 1}">${refWord.tradicional} (${getMeaning(refWord)})</span>` : '';
                        }
                        return '';
                    }).filter(Boolean).join(' + ');
                } else {
                    radHtml = word.radicales;
                }
            }

            const popoverCatColor = CATEGORY_COLORS[word.categoria] || 'var(--accent)';
            const wordNotes = getNotes(word);

            popover.innerHTML = `
                <div class="card-back" style="padding: 1.25rem; min-width: 220px;">
                    <div class="card-back-body" style="margin: auto 0; text-align: center;">
                        <div class="spanish-meaning" style="margin-bottom: 0.5rem;">${getMeaning(word)}</div>
                        <div class="chinese-char" style="font-size: 2.2rem; line-height: 1.1; margin-bottom: 0.5rem; color: ${popoverCatColor};">${word.tradicional}</div>
                        <div class="card-pronunciation-block" style="margin-bottom: 0.5rem;">
                            <div class="pinyin-label">${word.pinyin}</div>
                            ${word.zhuyin ? `<div class="zhuyin-label">${word.zhuyin}</div>` : ''}
                        </div>
                        ${(clfDisplay || radHtml) ? `
                        <div class="card-components-block" style="font-size: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 0.4rem;">
                            ${clfDisplay ? `<div class="card-clf-val">${clfDisplay}</div>` : ''}
                            ${radHtml ? `<div class="card-rad-val">${radHtml}</div>` : ''}
                        </div>
                        ` : ''}
                    </div>
                    ${wordNotes ? `
                    <div class="card-notes-block" style="margin-top: 0.5rem;">
                        ${wordNotes}
                    </div>
                    ` : ''}
                </div>
            `;
            
            document.body.appendChild(popover);
            currentPopovers.push(popover);
            
            const rect = refEl.getBoundingClientRect();
            let left = rect.right + 10;
            let top = rect.top;
            
            if (left + 260 > window.innerWidth) {
                left = rect.left - 260 - 10;
            }
            if (top + popover.offsetHeight > window.innerHeight) {
                top = window.innerHeight - popover.offsetHeight - 10;
            }
            
            popover.style.left = left + 'px';
            popover.style.top = top + 'px';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.radical-ref') || e.target.closest('.radical-popover')) {
            hoverTimeout = setTimeout(() => closePopoversFrom(0), 300);
        }
    });

    // --- Word form submit ---
    wordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const leccionRaw = document.getElementById('w-leccion')?.value?.trim();
        const meaningVal = document.getElementById('w-espanol').value.trim();
        const isEn = typeof I18N !== 'undefined' && I18N.getLanguage() === 'en';
        const data = {
            espanol:      meaningVal,
            tradicional:  document.getElementById('w-tradicional').value.trim(),
            pinyin:       document.getElementById('w-pinyin').value.trim(),
            zhuyin:       document.getElementById('w-zhuyin').value.trim(),
            categoria:    document.getElementById('w-categoria').value,
            clasificador: document.getElementById('w-clasificador').value.trim(),
            leccion:      leccionRaw ? parseInt(leccionRaw, 10) : null,
            radicales:    currentRadicals.length > 0 ? currentRadicals : '',
            notas:        document.getElementById('w-notas').value.trim()
        };
        if (isEn) {
            data.english = meaningVal;
            data.notas_en = data.notas;
        }

        if (editingWordId) {
            updateWord(editingWordId, data);
            showToast(typeof I18N !== 'undefined' ? I18N.t('toastWordUpdated', { word: data.tradicional }) : `"${data.tradicional}" actualizado correctamente`, 'success');
        } else {
            addWord(data);
            showToast(typeof I18N !== 'undefined' ? I18N.t('toastWordAdded', { word: data.tradicional }) : `"${data.tradicional}" agregado a tu biblioteca`, 'success');
        }

        wordDialog.close();
        refreshAll();
    });

    // --- Delete confirm ---
    document.getElementById('delete-dialog-confirm').addEventListener('click', () => {
        if (deletingItemType === 'estructura') {
            deleteStructure(deletingItemId);
            showToast(typeof I18N !== 'undefined' ? I18N.t('toastStructureDeleted') : 'Estructura eliminada', 'success');
        } else {
            deleteWord(deletingItemId);
            selectedExportIds.delete(deletingItemId);
            showToast(typeof I18N !== 'undefined' ? I18N.t('toastWordDeleted') : 'Palabra eliminada', 'success');
        }
        deleteDialog.close();
        refreshAll();
    });

    // --- Dialog close buttons ---
    document.getElementById('word-dialog-close').addEventListener('click',  () => wordDialog.close());
    document.getElementById('word-dialog-cancel').addEventListener('click', () => wordDialog.close());
    document.getElementById('delete-dialog-close').addEventListener('click',  () => deleteDialog.close());
    document.getElementById('delete-dialog-cancel').addEventListener('click', () => deleteDialog.close());

    // --- Export controls (compatible with Lazy Rendering) ---
    document.getElementById('print-search-input').addEventListener('input', (e) => {
        currentPrintSearch = e.target.value;
        renderExportGrid();
    });

    const printPinyinToggle = document.getElementById('print-toggle-pinyin');
    if (printPinyinToggle) {
        printPinyinToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('hide-pinyin-print', !e.target.checked);
        });
    }

    const printZhuyinToggle = document.getElementById('print-toggle-zhuyin');
    if (printZhuyinToggle) {
        printZhuyinToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('hide-zhuyin-print', !e.target.checked);
        });
    }

    const printCategoriaToggle = document.getElementById('print-toggle-categoria');
    if (printCategoriaToggle) {
        printCategoriaToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('hide-categoria-print', !e.target.checked);
        });
    }

    document.getElementById('btn-select-all').addEventListener('click', () => {
        const filteredWords = getFilteredExportWords();
        filteredWords.forEach(w => selectedExportIds.add(w.id));
        document.querySelectorAll('#export-grid input[type="checkbox"]').forEach(cb => cb.checked = true);
        updateExportCount();
    });

    document.getElementById('btn-deselect-all').addEventListener('click', () => {
        selectedExportIds.clear();
        document.querySelectorAll('#export-grid input[type="checkbox"]').forEach(cb => cb.checked = false);
        updateExportCount();
    });

    document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

    // --- JSON import/export ---
    document.getElementById('btn-export-json')?.addEventListener('click', handleExportJSON);
    document.getElementById('btn-import-json')?.addEventListener('click', () => {
        document.getElementById('json-file-input')?.click();
    });
    document.getElementById('json-file-input')?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImportJSON(e.target.files[0]);
    });

    // --- Settings initialization ---
    initSettings();

    // --- Apply active language translations to DOM ---
    if (typeof I18N !== 'undefined') {
        I18N.applyI18nToDOM();
    }

    // --- Show Skeleton Placeholders and Lazy Load active language dataset ---
    if (typeof showLanguageSkeletonState === 'function') {
        showLanguageSkeletonState();
    }

    if (typeof I18N !== 'undefined' && typeof I18N.ensureLanguageDataLoaded === 'function') {
        try {
            await I18N.ensureLanguageDataLoaded();
        } catch (err) {
            console.error("Failed to lazy-load initial language pack:", err);
        }
    }

    if (typeof invalidateStorageCache === 'function') {
        invalidateStorageCache();
    }

    // --- Initialize views after language pack is hydrated ---
    refreshAll();
    initBuilder();
});

/**
 * Initializes settings dialog and font preferences.
 */
const initSettings = () => {
    const defaultFont = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.fonts?.default) || 'kaiti';
    const savedFont = localStorage.getItem(CHINESE_FONT_STORAGE_KEY) || defaultFont;
    applyChineseFont(savedFont);

    const settingsDialog = document.getElementById('settings-dialog');
    const openSettingsBtn = document.getElementById('btn-open-settings');
    const closeSettingsBtn = document.getElementById('settings-dialog-close');
    const cancelSettingsBtn = document.getElementById('settings-dialog-cancel');
    const saveSettingsBtn = document.getElementById('settings-dialog-save');
    const geminiKeyInput = document.getElementById('settings-gemini-key');
    const toggleGeminiKeyBtn = document.getElementById('btn-toggle-gemini-key');
    const toggleLangBtn = document.getElementById('btn-toggle-lang');

    // Sidebar quick language toggle button
    if (toggleLangBtn) {
        toggleLangBtn.addEventListener('click', () => {
            if (typeof I18N !== 'undefined') {
                const avail = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.languages?.available)
                    ? Object.keys(APP_CONFIG.languages.available)
                    : ['es', 'en'];
                const current = I18N.getLanguage();
                const nextIdx = (avail.indexOf(current) + 1) % avail.length;
                I18N.setLanguage(avail[nextIdx]);
            }
        });
    }

    // Language pills inside settings dialog
    document.querySelectorAll('.lang-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chosenLang = btn.dataset.lang;
            if (chosenLang && typeof I18N !== 'undefined') {
                I18N.setLanguage(chosenLang);
            }
        });
    });

    if (!settingsDialog) return;

    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
            const currentFont = localStorage.getItem(CHINESE_FONT_STORAGE_KEY) || defaultFont;
            applyChineseFont(currentFont);

            if (geminiKeyInput && typeof getGeminiApiKey === 'function') {
                geminiKeyInput.value = getGeminiApiKey() || '';
            }

            if (typeof I18N !== 'undefined') {
                const curLang = I18N.getLanguage();
                document.querySelectorAll('.lang-choice-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.lang === curLang);
                });
            }

            settingsDialog.showModal();
        });
    }

    const closeDialog = () => {
        const currentSavedFont = localStorage.getItem(CHINESE_FONT_STORAGE_KEY) || defaultFont;
        applyChineseFont(currentSavedFont);
        settingsDialog.close();
    };

    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeDialog);
    if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', closeDialog);

    document.querySelectorAll('.settings-font-card').forEach(card => {
        card.addEventListener('click', () => {
            const fontKey = card.dataset.font;
            if (fontKey) {
                applyChineseFont(fontKey);
            }
        });
    });

    if (toggleGeminiKeyBtn && geminiKeyInput) {
        toggleGeminiKeyBtn.addEventListener('click', () => {
            geminiKeyInput.type = geminiKeyInput.type === 'password' ? 'text' : 'password';
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const selectedRadio = document.querySelector('input[name="chinese-font-choice"]:checked');
            const fontKey = selectedRadio ? selectedRadio.value : defaultFont;
            applyChineseFont(fontKey);

            if (geminiKeyInput && typeof setGeminiApiKey === 'function') {
                const newKey = geminiKeyInput.value.trim();
                setGeminiApiKey(newKey);
            }

            showToast(typeof I18N !== 'undefined' ? I18N.t('toastSettingsSaved') : 'Configuración guardada correctamente', 'success');
            settingsDialog.close();
        });
    }
};
