/**
 * =====================================================
 * AppChino — builder.js
 * Sentence builder: drag & drop + save as structure.
 * =====================================================
 */

/**
 * Updates the live preview of the constructed sentence.
 * Shows/hides the preview and save row based on dropzone contents.
 */
const updateBuilderPreview = () => {
    const dropzone = document.getElementById('builder-dropzone');
    const cards = dropzone.querySelectorAll('.mini-card');
    const previewEl = document.getElementById('builder-preview');
    const saveRow = document.getElementById('builder-save-row');

    if (cards.length === 0) {
        dropzone.classList.add('is-empty');
        previewEl.style.display = 'none';
        saveRow.style.display = 'none';
        return;
    }

    dropzone.classList.remove('is-empty');
    previewEl.style.display = 'flex';
    saveRow.style.display = 'flex';

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

    // Dropzone — accepts dragged words
    new Sortable(dropzone, {
        group: 'builder',
        animation: 150,
        onAdd: function(evt) {
            const el = evt.item;
            const wordId = el.dataset.id;
            const word = getAllWords().find(w => w.id === wordId);
            if (!word) return;

            // Replace the cloned bank card with a proper builder card (has remove button)
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
            showToast('Agrega al menos una palabra al constructor', 'error');
            return;
        }

        const chinese = Array.from(cards).map(c => c.dataset.tradicional).join('');
        
        const btn = document.getElementById('btn-examine-sentence');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Examinando...`;
        btn.disabled = true;

        try {
            const result = await checkSentenceWithGemini(chinese);
            
            // Populate modal
            const verdictEl = document.getElementById('ai-verdict');
            if (result.correcta) {
                verdictEl.innerHTML = '✅ ¡Oración Correcta!';
                verdictEl.style.backgroundColor = 'var(--success)';
                verdictEl.style.color = '#fff';
            } else {
                verdictEl.innerHTML = '❌ Necesita Corrección';
                verdictEl.style.backgroundColor = 'var(--danger)';
                verdictEl.style.color = '#fff';
            }

            document.getElementById('ai-explanation').textContent = result.explicacion || '';
            document.getElementById('ai-correction').textContent = result.correccion || '';
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
            showToast('Agrega al menos una palabra al constructor', 'error');
            return;
        }

        const nombre  = document.getElementById('structure-name').value.trim();
        const formula = document.getElementById('structure-formula').value.trim();
        const spanish = document.getElementById('structure-spanish').value.trim();

        if (!nombre || !formula) {
            showToast('Completa al menos el nombre y la fórmula', 'error');
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

        showToast('Estructura guardada como flashcard', 'success');

        // Clear the builder
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
    let pinyinQueue = []; // words selected from suggestions, waiting to be added
    let highlightedIdx = -1;

    /**
     * Strips tone marks from pinyin to allow flexible matching.
     * e.g. "māo" → "mao", "nǐhǎo" → "nihao"
     */
    const stripTones = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    };

    /**
     * Searches the user's word database by pinyin.
     * Matches if any word's pinyin starts with the query (tone-insensitive).
     */
    const searchByPinyin = (query) => {
        if (!query || query.length < 1) return [];
        try {
            return window.searchAndSortWords(query, null, { includeChar: false }).slice(0, 12);
        } catch (e) {
            console.error("Error en searchByPinyin:", e);
            return [];
        }
    };

    /**
     * Renders the suggestion dropdown items.
     */
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
            const label = CATEGORY_LABELS[w.categoria] || w.categoria;
            return `
                <div class="pinyin-suggestion-item" data-index="${i}">
                    <span class="sug-char">${w.tradicional}</span>
                    <div class="sug-info">
                        <span class="sug-pinyin">${w.pinyin}</span>
                        <span class="sug-spanish">${w.espanol}</span>
                    </div>
                    <span class="sug-badge" style="background: ${color}20; color: ${color};">${label}</span>
                </div>
            `;
        }).join('');
        suggestionsEl.classList.add('visible');
    };

    /**
     * Returns the Chinese prefix string from the current queue.
     */
    const getQueuePrefix = () => pinyinQueue.map(w => w.tradicional).join('');

    /**
     * Selects a word from suggestions, adds it to the queue,
     * and shows the accumulated characters as real text in the input.
     */
    const selectSuggestion = (word) => {
        pinyinQueue.push(word);
        // Show selected characters as real text in the input
        pinyinInput.value = getQueuePrefix();
        suggestionsEl.classList.remove('visible');
        suggestionsEl.innerHTML = '';
        addPinyinBtn.disabled = false;
        pinyinInput.focus();
    };

    // Input event — search as user types (only the part after the Chinese prefix)
    pinyinInput.addEventListener('input', () => {
        const prefix = getQueuePrefix();
        const fullValue = pinyinInput.value;

        // If user deleted some of the prefix, sync the queue
        if (!fullValue.startsWith(prefix)) {
            // User backspaced into the Chinese characters — remove last queued word
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

        // Extract only the pinyin part (after the Chinese prefix)
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

    // Click on a suggestion
    suggestionsEl.addEventListener('click', (e) => {
        const item = e.target.closest('.pinyin-suggestion-item');
        if (!item) return;
        const idx = parseInt(item.dataset.index);
        const prefix = getQueuePrefix();
        const query = pinyinInput.value.slice(prefix.length).trim();
        const results = searchByPinyin(query);
        if (results[idx]) {
            selectSuggestion(results[idx]);
        }
    });

    // Keyboard navigation (Up/Down/Enter/Escape)
    pinyinInput.addEventListener('keydown', (e) => {
        const items = suggestionsEl.querySelectorAll('.pinyin-suggestion-item');
        if (items.length === 0) {
            // Enter with queue and no suggestions = add to dropzone
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
                items[0].click(); // Select first result
            }
        } else if (e.key === 'Escape') {
            suggestionsEl.classList.remove('visible');
            suggestionsEl.innerHTML = '';
            highlightedIdx = -1;
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.pinyin-input-wrapper')) {
            suggestionsEl.classList.remove('visible');
        }
    });

    // "Agregar" button — push queued words into dropzone as mini-cards
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
            // Create an anonymous card for each remaining character
            Array.from(remaining).forEach(char => {
                if (char.trim() === '') return;
                const anonWord = {
                    id: 'anon_' + Date.now() + Math.random().toString(36).substr(2, 5),
                    tradicional: char,
                    pinyin: '',
                    zhuyin: '',
                    espanol: '',
                    categoria: 'anonimo'
                };
                dropzone.appendChild(createBuilderMiniCard(anonWord));
            });
        }

        // Reset
        pinyinQueue = [];
        pinyinInput.value = '';
        pinyinInput.placeholder = 'Escribe los caracteres o buscalos por significado, pinyin o zhuyin';
        addPinyinBtn.disabled = true;
        dropzone.classList.remove('is-empty');
        updateBuilderPreview();
        showToast('Caracteres agregados al constructor', 'success');
    });
};

/**
 * Renders the word bank grid and initializes its Sortable instance.
 * @param {string} filter - Category filter ('todos' or a category key)
 */
const renderWordBank = (filter = 'todos') => {
    const bankEl = document.getElementById('word-bank-grid');
    bankEl.innerHTML = '';

    let words = getAllWords();
    if (filter !== 'todos') {
        words = words.filter(w => w.categoria === filter);
    }
    words.forEach(word => bankEl.appendChild(createMiniCard(word)));

    // Initialize Sortable on the (re-rendered) bank
    new Sortable(bankEl, {
        group: { name: 'builder', pull: 'clone', put: false },
        sort: false,
        animation: 150,
    });
};
