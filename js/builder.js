/**
 * =====================================================
 * AppChino — builder.js
 * Sentence builder: drag & drop + save as structure.
 * Connected to APP_CONFIG, O(1) lookups & Lazy Rendering.
 * =====================================================
 */

let bankObserver = null;
let bankSortableInstance = null;

/**
 * Updates the live preview of the constructed sentence.
 * Shows/hides the preview and save row based on dropzone contents.
 */
const updateBuilderPreview = () => {
    const dropzone = document.getElementById('builder-dropzone');
    if (!dropzone) return;
    const cards = dropzone.querySelectorAll('.mini-card');
    const previewEl = document.getElementById('builder-preview');
    const saveRow = document.getElementById('builder-save-row');
    const clearBtn = document.getElementById('btn-clear-builder');

    if (cards.length === 0) {
        dropzone.classList.add('is-empty');
        previewEl.style.display = 'none';
        saveRow.style.display = 'none';
        if (clearBtn) clearBtn.disabled = true;
        return;
    }

    dropzone.classList.remove('is-empty');
    previewEl.style.display = 'flex';
    saveRow.style.display = 'flex';
    if (clearBtn) clearBtn.disabled = false;

    const chinese = Array.from(cards).map(c => c.dataset.tradicional).join('');
    const pinyin  = Array.from(cards).map(c => c.dataset.pinyin).join(' ');

    document.getElementById('preview-chinese').textContent = chinese;
    document.getElementById('preview-pinyin').textContent = pinyin;
};

/**
 * Initializes the sentence builder: Sortable instances + save handler.
 */
const initBuilder = () => {
    const dropzone = document.getElementById('builder-dropzone');
    if (!dropzone) return;

    // Dropzone — accepts dragged words
    new Sortable(dropzone, {
        group: 'builder',
        animation: 150,
        onAdd: function(evt) {
            const el = evt.item;
            const wordId = el.dataset.id;
            const word = (typeof getWordById === 'function')
                ? getWordById(wordId)
                : getAllWords().find(w => w.id === wordId);
            if (!word) return;

            const builderCard = createBuilderMiniCard(word);
            el.replaceWith(builderCard);
            updateBuilderPreview();
        },
        onSort: function() {
            updateBuilderPreview();
        }
    });

    // Examine sentence button
    document.getElementById('btn-examine-sentence').addEventListener('click', async () => {
        const cards = dropzone.querySelectorAll('.mini-card');
        if (cards.length === 0) {
            showToast(typeof I18N !== 'undefined' ? I18N.t('builderToastEmpty') : 'Agrega al menos una palabra al constructor', 'error');
            return;
        }

        const chinese = Array.from(cards).map(c => c.dataset.tradicional).join('');
        
        const btn = document.getElementById('btn-examine-sentence');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> ${typeof I18N !== "undefined" ? I18N.t("builderExamining") : "Examinando..."}`;
        btn.disabled = true;

        try {
            const result = await checkSentenceWithGemini(chinese);
            
            const verdictEl = document.getElementById('ai-verdict');
            if (result.correcta) {
                verdictEl.innerHTML = typeof I18N !== "undefined" ? I18N.t("builderVerdictCorrect") : "✅ ¡Oración Correcta!";
                verdictEl.style.backgroundColor = 'var(--success)';
                verdictEl.style.color = '#fff';
            } else {
                verdictEl.innerHTML = typeof I18N !== "undefined" ? I18N.t("builderVerdictIncorrect") : "❌ Necesita Corrección";
                verdictEl.style.backgroundColor = 'var(--danger)';
                verdictEl.style.color = '#fff';
            }

            document.getElementById('ai-explanation').textContent = result.explicacion || '';
            const corrEl = document.getElementById('ai-correction');
            if (result.pinyin) {
                corrEl.innerHTML = `<div>${result.correccion || ''}</div><div style="font-size:0.95rem; font-family:var(--font-main); color:var(--text-secondary); margin-top:0.2rem;">${result.pinyin}</div>`;
            } else {
                corrEl.textContent = result.correccion || '';
            }
            document.getElementById('ai-translation').textContent = result.traduccion || '';

            document.getElementById('ai-result-dialog').showModal();

        } catch (error) {
            showToast(error.message || 'Error al comunicarse con la IA', 'error');
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    });

    // Save structure button
    document.getElementById('btn-save-structure').addEventListener('click', () => {
        const cards = dropzone.querySelectorAll('.mini-card');
        if (cards.length === 0) {
            showToast(typeof I18N !== 'undefined' ? I18N.t('builderToastEmpty') : 'Agrega al menos una palabra al constructor', 'error');
            return;
        }

        const nombre  = document.getElementById('structure-name').value.trim();
        const formula = document.getElementById('structure-formula').value.trim();
        const spanish = document.getElementById('structure-spanish').value.trim();

        if (!nombre || !formula) {
            showToast(typeof I18N !== 'undefined' ? I18N.t('builderToastIncomplete') : 'Completa al menos el nombre y la fórmula', 'error');
            return;
        }

        const chinese = Array.from(cards).map(c => c.dataset.tradicional).join('');
        const pinyin  = Array.from(cards).map(c => c.dataset.pinyin).join(' ');

        addStructure({
            nombre,
            formula,
            ejemplo_tradicional: chinese,
            ejemplo_pinyin: pinyin,
            ejemplo_espanol: spanish,
            notas: '',
        });

        showToast(typeof I18N !== 'undefined' ? I18N.t('toastStructureSaved') : 'Estructura guardada correctamente', 'success');

        dropzone.innerHTML = '';
        document.getElementById('structure-name').value = '';
        document.getElementById('structure-formula').value = '';
        document.getElementById('structure-spanish').value = '';
        updateBuilderPreview();
        refreshAll();
    });

    // AI dialog bindings
    const aiDialog = document.getElementById('ai-result-dialog');
    document.getElementById('ai-dialog-close').addEventListener('click', () => aiDialog.close());
    document.getElementById('ai-dialog-ok').addEventListener('click', () => aiDialog.close());

    // -------------------------------------------------------
    // Pinyin quick-input with autocomplete
    // -------------------------------------------------------
    const pinyinInput = document.getElementById('pinyin-quick-input');
    const suggestionsEl = document.getElementById('pinyin-suggestions');
    const addPinyinBtn = document.getElementById('btn-add-pinyin');
    let pinyinQueue = [];
    let highlightedIdx = -1;

    const searchByPinyin = (query) => {
        if (!query || query.length < 1) return [];
        try {
            return window.searchAndSortWords(query, null, { includeChar: true }).slice(0, 12);
        } catch (e) {
            console.error("Error en searchByPinyin:", e);
            return [];
        }
    };

    const renderSuggestions = (results) => {
        if (results.length === 0) {
            suggestionsEl.classList.remove('visible');
            suggestionsEl.innerHTML = '';
            highlightedIdx = -1;
            return;
        }

        highlightedIdx = -1;
        suggestionsEl.innerHTML = results.map((w, i) => {
            const color = CATEGORY_COLORS[w.categoria] || 'var(--text-muted)';
            const label = (window.getCategoryLabel ? window.getCategoryLabel(w.categoria) : (CATEGORY_LABELS[w.categoria] || w.categoria));
            const meaning = (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
            return `
                <div class="pinyin-suggestion-item" data-index="${i}">
                    <span class="sug-char">${w.tradicional}</span>
                    <div class="sug-info">
                        <span class="sug-pinyin">${w.pinyin}</span>
                        <span class="sug-spanish">${meaning}</span>
                    </div>
                    <span class="sug-badge" style="background: ${color}20; color: ${color};">${label}</span>
                </div>
            `;
        }).join('');
        suggestionsEl.classList.add('visible');
    };

    const getQueuePrefix = () => pinyinQueue.map(w => w.tradicional).join('');

    const selectSuggestion = (word) => {
        pinyinQueue.push(word);
        pinyinInput.value = getQueuePrefix();
        suggestionsEl.classList.remove('visible');
        suggestionsEl.innerHTML = '';
        addPinyinBtn.disabled = false;
        pinyinInput.focus();
    };

    pinyinInput.addEventListener('input', () => {
        const prefix = getQueuePrefix();
        const fullValue = pinyinInput.value;

        if (!fullValue.startsWith(prefix)) {
            if (pinyinQueue.length > 0 && fullValue.length < prefix.length) {
                pinyinQueue.pop();
                const newPrefix = getQueuePrefix();
                pinyinInput.value = newPrefix;
            }
            addPinyinBtn.disabled = pinyinInput.value.trim().length === 0;
            suggestionsEl.classList.remove('visible');
            suggestionsEl.innerHTML = '';
            return;
        }

        const query = fullValue.slice(prefix.length).trim();
        addPinyinBtn.disabled = fullValue.trim().length === 0;
        if (query.length === 0) {
            suggestionsEl.classList.remove('visible');
            suggestionsEl.innerHTML = '';
            return;
        }
        const results = searchByPinyin(query);
        renderSuggestions(results);
    });

    suggestionsEl.addEventListener('click', (e) => {
        const item = e.target.closest('.pinyin-suggestion-item');
        if (!item) return;
        const idx = parseInt(item.dataset.index, 10);
        const prefix = getQueuePrefix();
        const query = pinyinInput.value.slice(prefix.length).trim();
        const results = searchByPinyin(query);
        if (results[idx]) {
            selectSuggestion(results[idx]);
        }
    });

    pinyinInput.addEventListener('keydown', (e) => {
        const items = suggestionsEl.querySelectorAll('.pinyin-suggestion-item');
        if (items.length === 0) {
            if (e.key === 'Enter' && pinyinQueue.length > 0) {
                e.preventDefault();
                addPinyinBtn.click();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedIdx = Math.min(highlightedIdx + 1, items.length - 1);
            items.forEach((el, i) => el.classList.toggle('highlighted', i === highlightedIdx));
            items[highlightedIdx]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedIdx = Math.max(highlightedIdx - 1, 0);
            items.forEach((el, i) => el.classList.toggle('highlighted', i === highlightedIdx));
            items[highlightedIdx]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIdx >= 0 && highlightedIdx < items.length) {
                items[highlightedIdx].click();
            } else if (items.length > 0) {
                items[0].click();
            }
        } else if (e.key === 'Escape') {
            suggestionsEl.classList.remove('visible');
            suggestionsEl.innerHTML = '';
            highlightedIdx = -1;
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.pinyin-input-wrapper')) {
            suggestionsEl.classList.remove('visible');
        }
    });

    addPinyinBtn.addEventListener('click', () => {
        const fullValue = pinyinInput.value.trim();
        if (fullValue.length === 0) return;

        pinyinQueue.forEach(word => {
            const card = createBuilderMiniCard(word);
            dropzone.appendChild(card);
        });

        const prefix = getQueuePrefix();
        if (fullValue.startsWith(prefix) && fullValue.length > prefix.length) {
            const remaining = fullValue.slice(prefix.length).trim();
            Array.from(remaining).forEach(char => {
                if (char.trim() === '') return;
                const anonWord = {
                    id: 'anon_' + Date.now() + Math.random().toString(36).slice(2, 7),
                    tradicional: char,
                    pinyin: '',
                    zhuyin: '',
                    espanol: '',
                    categoria: 'anonimo'
                };
                dropzone.appendChild(createBuilderMiniCard(anonWord));
            });
        }

        pinyinQueue = [];
        pinyinInput.value = '';
        pinyinInput.placeholder = typeof I18N !== 'undefined' ? I18N.t('builderQuickInputPlaceholder') : 'Escribe los caracteres o buscalos por significado, pinyin o zhuyin';
        addPinyinBtn.disabled = true;
        dropzone.classList.remove('is-empty');
        updateBuilderPreview();
        showToast(typeof I18N !== 'undefined' ? I18N.t('builderToastAdded') : 'Caracteres agregados al constructor', 'success');
    });

    const clearBtn = document.getElementById('btn-clear-builder');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const cards = dropzone.querySelectorAll('.mini-card');
            if (cards.length === 0 && pinyinQueue.length === 0 && (!pinyinInput || !pinyinInput.value)) return;

            dropzone.innerHTML = '';
            pinyinQueue = [];
            if (pinyinInput) {
                pinyinInput.value = '';
                pinyinInput.placeholder = typeof I18N !== 'undefined' ? I18N.t('builderQuickInputPlaceholder') : 'Escribe los caracteres o buscalos por significado, pinyin o zhuyin';
            }
            if (addPinyinBtn) addPinyinBtn.disabled = true;
            if (suggestionsEl) {
                suggestionsEl.classList.remove('visible');
                suggestionsEl.innerHTML = '';
            }
            updateBuilderPreview();
            showToast(typeof I18N !== 'undefined' ? I18N.t('builderToastCleared') : 'Zona de construcción vaciada', 'info');
        });
    }

    updateBuilderPreview();
};

/**
 * Renders the word bank grid with Lazy Rendering (IntersectionObserver) and Sortable instance.
 * @param {string} filter - Category filter ('todos' or a category key)
 */
const renderWordBank = (filter = 'todos') => {
    const bankEl = document.getElementById('word-bank-grid');
    if (!bankEl) return;

    if (bankObserver) {
        bankObserver.disconnect();
        bankObserver = null;
    }

    bankEl.innerHTML = '';

    // Show skeletons if language pack is currently loading
    if (typeof I18N !== 'undefined' && typeof I18N.isLanguageLoading === 'function' && I18N.isLanguageLoading()) {
        if (typeof createMiniCardSkeletons === 'function') {
            bankEl.appendChild(createMiniCardSkeletons());
        }
        return;
    }

    let words = getAllWords();
    if (filter !== 'todos') {
        words = words.filter(w => w.categoria === filter);
    }

    const initialBatch = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.initialCardBatchSize)
        ? APP_CONFIG.ui.initialCardBatchSize * 2
        : 72;
    const scrollBatch = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.ui?.scrollBatchSize)
        ? APP_CONFIG.ui.scrollBatchSize * 2
        : 48;

    let renderedCount = 0;

    const appendNextBatch = (batchSize) => {
        const slice = words.slice(renderedCount, renderedCount + batchSize);
        if (slice.length === 0) return;
        const frag = document.createDocumentFragment();
        slice.forEach(word => frag.appendChild(createMiniCard(word)));
        const sentinel = bankEl.querySelector('.grid-lazy-sentinel');
        if (sentinel) {
            bankEl.insertBefore(frag, sentinel);
        } else {
            bankEl.appendChild(frag);
        }
        renderedCount += slice.length;
    };

    appendNextBatch(initialBatch);

    if (renderedCount < words.length && typeof IntersectionObserver !== 'undefined') {
        const sentinel = document.createElement('div');
        sentinel.className = 'grid-lazy-sentinel';
        sentinel.style.gridColumn = '1 / -1';
        sentinel.style.height = '1px';
        bankEl.appendChild(sentinel);

        bankObserver = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                appendNextBatch(scrollBatch);
                if (renderedCount >= words.length) {
                    sentinel.remove();
                    bankObserver?.disconnect();
                }
            }
        }, { rootMargin: '250px' });

        bankObserver.observe(sentinel);
    }

    if (bankSortableInstance) {
        bankSortableInstance.destroy();
    }
    bankSortableInstance = new Sortable(bankEl, {
        group: { name: 'builder', pull: 'clone', put: false },
        draggable: '.mini-card:not(.mini-card-skeleton)',
        sort: false,
        animation: 150,
    });
};
