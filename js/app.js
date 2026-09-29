/**
 * =====================================================
 * AppChino — app.js
 * Main controller: navigation, rendering, dialogs,
 * event bindings, and application bootstrap.
 * =====================================================
 */

// ==========================================================
// RENDERING
// ==========================================================

let currentFilter = 'todos';
let currentSearch = '';

window.searchAndSortWords = (query, wordsList = null, options = { includeChar: true }) => {
    if (!query) return wordsList || getAllWords();
    const q = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const words = wordsList || getAllWords();
    
    const filtered = words.filter(w => {
        const wPinyin = (w.pinyin || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const wEspanol = (w.espanol || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const wTrad = w.tradicional || '';
        const wZhuyin = w.zhuyin || '';
        
        const pinyinMatch = wPinyin.startsWith(q) || wPinyin.split(' ').some(syl => syl.startsWith(q)) || wPinyin.includes(q);
        const charMatch = options.includeChar ? (wTrad.includes(query) || wTrad.includes(q)) : false;
        const zhuyinMatch = wZhuyin && (wZhuyin.includes(query) || wZhuyin.includes(q));
        const espanolMatch = wEspanol.includes(q);
        
        return pinyinMatch || charMatch || zhuyinMatch || espanolMatch;
    });

    return filtered.sort((a, b) => {
        const aEspanol = (a.espanol || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const bEspanol = (b.espanol || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const aPinyin = (a.pinyin || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const bPinyin = (b.pinyin || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const aTrad = a.tradicional || '';
        const bTrad = b.tradicional || '';
        const aZh = a.zhuyin || '';
        const bZh = b.zhuyin || '';
        
        const aHasPinyin = aPinyin.includes(q) || aTrad.includes(query) || aTrad.includes(q) || (aZh && (aZh.includes(query) || aZh.includes(q)));
        const bHasPinyin = bPinyin.includes(q) || bTrad.includes(query) || bTrad.includes(q) || (bZh && (bZh.includes(query) || bZh.includes(q)));
        
        const aOnlyEspanol = aEspanol.includes(q) && !aHasPinyin;
        const bOnlyEspanol = bEspanol.includes(q) && !bHasPinyin;

        if (!aOnlyEspanol && bOnlyEspanol) return -1;
        if (aOnlyEspanol && !bOnlyEspanol) return 1;
        return 0;
    });
};



/**
 * Renders the main flashcard grid (Library section).
 */
const renderGrid = () => {
    const gridEl = document.getElementById('card-grid');
    gridEl.innerHTML = '';
    let words = getAllWords();

    if (currentFilter !== 'todos') {
        words = words.filter(w => w.categoria === currentFilter);
    }

    if (currentSearch) {
        words = window.searchAndSortWords(currentSearch, words);
    }

    if (words.length === 0) {
        gridEl.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otro filtro o término de búsqueda.</p>
            </div>
        `;
        return;
    }

    words.forEach(word => gridEl.appendChild(createFlashcard(word)));
};

/**
 * Renders the structures list.
 */
const renderStructures = () => {
    const listEl = document.getElementById('structures-list');
    listEl.innerHTML = '';
    const db = loadDB();
    const structures = db.estructuras || [];

    if (structures.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <h3>No hay estructuras registradas</h3>
                <p>Ve al Constructor para crear tu primera estructura de oración.</p>
            </div>
        `;
        return;
    }

    structures.forEach(s => listEl.appendChild(createStructureCard(s)));
};

let currentPrintSearch = '';

/**
 * Renders the export grid with selectable flashcards.
 */
const renderExportGrid = () => {
    const gridEl = document.getElementById('export-grid');
    gridEl.innerHTML = '';
    
    let words = getAllWords();
    
    if (currentPrintSearch) {
        words = window.searchAndSortWords(currentPrintSearch, words);
    }

    words.forEach(word => {
        gridEl.appendChild(createFlashcard(word, { showSelect: true, showActions: false }));
    });
    updateExportCount();
};

const updateExportCount = () => {
    const checked = document.querySelectorAll('#export-grid input[type="checkbox"]:checked');
    document.getElementById('export-count').textContent = `${checked.length} seleccionadas`;
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
    if(!container) return;
    container.innerHTML = '';
    currentRadicals.forEach((rad, index) => {
        const chip = document.createElement('div');
        chip.className = 'radical-chip' + (rad.type === 'ref' ? ' chip-ref' : '');
        
        if (rad.type === 'text') {
            chip.innerHTML = `<span>${rad.value}</span>`;
        } else if (rad.type === 'ref') {
            const word = getAllWords().find(w => w.id === rad.id);
            if (word) {
                const color = CATEGORY_COLORS[word.categoria] || 'var(--accent)';
                chip.style.setProperty('--chip-color', color);
                chip.innerHTML = `<span class="sug-char">${word.tradicional}</span> <span class="sug-spanish">(${word.espanol})</span>`;
            } else {
                chip.innerHTML = `<span>Desconocido</span>`;
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
        // We assume Sortable is globally available (loaded in index.html)
        if (typeof Sortable !== 'undefined') {
            sortableRadicals = new Sortable(container, {
                animation: 150,
                onEnd: function (evt) {
                    const newIndex = evt.newIndex;
                    const oldIndex = evt.oldIndex;
                    if (newIndex === oldIndex) return;
                    
                    const [movedItem] = currentRadicals.splice(oldIndex, 1);
                    currentRadicals.splice(newIndex, 0, movedItem);
                    
                    // Re-render immediately to update index closures in delete buttons
                    renderRadicalChips();
                }
            });
        }
    }
};


const formatClassifierShort = (c) => {
    let desc = c.espanol || '';
    desc = desc.replace(/^Clasificador\s+(para\s+|de\s+|numeral\s+para\s+|universal\s+)?/i, '');
    desc = desc.replace(/^verbal\s+de\s+/i, '');
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
    clfSelect.innerHTML = '<option value="">Ninguno</option>';
    classifiers.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = formatClassifierShort(c);
        opt.title = `${c.tradicional} (${c.pinyin}) - ${c.espanol}`;
        if (c.id === selectedId) {
            opt.selected = true;
        }
        clfSelect.appendChild(opt);
    });
};

// ==========================================================
// PINYIN TONE NUMBER CONVERTER (Field #w-pinyin)
// Converts tone numbers (1-5) into proper diacritic marks:
// e.g. a2 -> á, hao3 -> hǎo, jue2 -> jué, lv4 -> lǜ
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

/**
 * Converts a pinyin syllable (or single vowel) + tone number (1-5) into accented Pinyin.
 * Adheres to standard Hanyu Pinyin tone placement rules:
 * 1. 'a' or 'e' always takes the tone mark.
 * 2. In 'ou', 'o' takes the tone mark.
 * 3. In other vowel pairs (ui, iu), the last vowel takes the tone mark.
 * 4. Single vowels take the tone mark.
 * @param {string} syllable
 * @param {number} toneNum (1..5)
 * @returns {string|null}
 */
const convertPinyinSyllable = (syllable, toneNum) => {
    if (!syllable) return null;

    let base = '';
    for (const ch of syllable) {
        base += PINYIN_UNACCENT_MAP[ch] || ch;
    }

    // Tone 5 or 0: neutral tone (removes tone marks and normalizes v to ü)
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

/**
 * Attaches the number-to-tone converter exclusively to the #w-pinyin input.
 */
const initPinyinToneInput = () => {
    const input = document.getElementById('w-pinyin');
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

        // Slice text before selection
        const textBefore = val.slice(0, cursorPos);
        const textAfter = val.slice(selEnd);

        // Find trailing syllable or letters right before the cursor
        const match = textBefore.match(/([a-zA-ZüÜvVāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ]+)$/);
        if (!match) return;

        const syllable = match[1];
        const converted = convertPinyinSyllable(syllable, toneNum);
        if (!converted) return;

        e.preventDefault();

        const prefix = textBefore.slice(0, textBefore.length - syllable.length);
        const newTextBefore = prefix + converted;
        input.value = newTextBefore + textAfter;

        const newPos = newTextBefore.length;
        input.setSelectionRange(newPos, newPos);

        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
};

/**
 * Opens the Add Word dialog.
 */
const openAddDialog = () => {
    editingWordId = null;
    document.getElementById('word-dialog-title').textContent = 'Nueva Palabra';
    wordForm.reset();
    populateClassifierSelect('');
    const clfSelect = document.getElementById('w-clasificador');
    if (clfSelect) clfSelect.disabled = false;
    
    // Reset radicals
    currentRadicals = [];
    renderRadicalChips();
    initSortableRadicals();
    document.querySelector('.radical-tab[data-type="text"]').click();
    
    wordDialog.showModal();
};

/**
 * Opens the Edit Word dialog, pre-populated with existing data.
 * @param {string} id - Word ID
 */
const openEditDialog = (id) => {
    editingWordId = id;
    const word = getAllWords().find(w => w.id === id);
    if (!word) return;

    document.getElementById('word-dialog-title').textContent = 'Editar Palabra';
    document.getElementById('w-espanol').value      = word.espanol || '';
    document.getElementById('w-categoria').value    = word.categoria || 'sustantivo';
    document.getElementById('w-tradicional').value  = word.tradicional || '';
    document.getElementById('w-pinyin').value       = word.pinyin || '';
    document.getElementById('w-zhuyin').value       = word.zhuyin || '';
    populateClassifierSelect(word.clasificador || '');
    const clfSelect = document.getElementById('w-clasificador');
    if (clfSelect) {
        clfSelect.disabled = (word.categoria === 'clasificador');
    }
    document.getElementById('w-notas').value        = word.notas || '';

    // Load radicals
    if (typeof word.radicales === 'string' && word.radicales.trim() !== '') {
        currentRadicals = [{ type: 'text', value: word.radicales }];
    } else if (Array.isArray(word.radicales)) {
        currentRadicals = [...word.radicales];
    } else {
        currentRadicals = [];
    }
    renderRadicalChips();
    initSortableRadicals();
    document.querySelector('.radical-tab[data-type="text"]').click();

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
 * Navigates to a section by name. Handles visibility toggling
 * and section-specific initialization.
 * @param {string} sectionName
 */
const navigateTo = (sectionName) => {
    // Toggle section visibility
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${sectionName}`);
    if (target) target.classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.nav-item[data-section]').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
    if (navItem) navItem.classList.add('active');

    // Section-specific init
    if (sectionName === 'constructor') {
        renderWordBank();
    } else if (sectionName === 'estudio') {
        initStudyMode();
    } else if (sectionName === 'practica') {
        initPracticeMode();
    } else if (sectionName === 'exportar') {
        renderExportGrid();
    } else if (sectionName === 'estructuras') {
        renderStructures();
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
};

// ==========================================================
// IMPORT / EXPORT JSON (UI wrappers around storage functions)
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
    showToast('Datos exportados correctamente', 'success');
};

const handleImportJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (importData(e.target.result)) {
            showToast('Datos importados correctamente. Recargando...', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast('Archivo JSON inválido: falta la estructura esperada.', 'error');
        }
    };
    reader.onerror = () => showToast('Error al leer el archivo.', 'error');
    reader.readAsText(file);
};

// ==========================================================
// BOOTSTRAP — DOMContentLoaded
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Gemini API Key from localStorage if available
    setGeminiApiKey(localStorage.getItem('appchino_gemini_key'));
    window.setGeminiApiKey = setGeminiApiKey;


    // --- Sidebar navigation ---
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.section));
    });

    // --- Collapsible sidebar ---
    const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
    const brandIcon = document.querySelector('.sidebar-brand .brand-icon');

    const updateSidebarTooltip = (isCollapsed) => {
        if (sidebarCollapseBtn) {
            const label = isCollapsed ? 'Expandir menú' : 'Colapsar menú';
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

    // --- Mobile sidebar ---
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('open');
    });
    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
    });

    // --- Add word ---
    document.getElementById('btn-add-word').addEventListener('click', openAddDialog);
    initPinyinToneInput();

    // --- Search ---
    document.getElementById('search-input').addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderGrid();
    });

    // --- Library filter chips ---
    document.getElementById('filter-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#filter-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        renderGrid();
    });

    // --- Builder bank filter chips ---
    document.getElementById('bank-filter-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#bank-filter-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderWordBank(chip.dataset.filter);
    });

    // --- Study mode filter chips ---
    document.getElementById('study-filters').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#study-filters .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        initStudyMode(chip.dataset.filter);
    });

    // --- Study Pinyin Toggle ---
    const studyPinyinToggle = document.getElementById('study-toggle-pinyin');
    if (studyPinyinToggle) {
        studyPinyinToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('hide-pinyin-study');
            } else {
                document.body.classList.add('hide-pinyin-study');
            }
        });
    }

    const studyZhuyinToggle = document.getElementById('study-toggle-zhuyin');
    if (studyZhuyinToggle) {
        studyZhuyinToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('hide-zhuyin-study');
            } else {
                document.body.classList.add('hide-zhuyin-study');
            }
        });
    }

    const studyCategoriaToggle = document.getElementById('study-toggle-categoria');
    if (studyCategoriaToggle) {
        studyCategoriaToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('hide-categoria-study');
            } else {
                document.body.classList.add('hide-categoria-study');
            }
        });
    }

    // --- Category change listener (Word Dialog) ---
    const catSelect = document.getElementById('w-categoria');
    const clfSelect = document.getElementById('w-clasificador');
    if (catSelect && clfSelect) {
        catSelect.addEventListener('change', (e) => {
            if (e.target.value === 'clasificador') {
                clfSelect.value = '';
                clfSelect.disabled = true;
            } else {
                clfSelect.disabled = false;
            }
        });
    }

    // Tabs logic
    document.querySelectorAll('.radical-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.radical-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const type = e.target.dataset.type;
            document.getElementById('radical-text-area').style.display = type === 'text' ? 'block' : 'none';
            document.getElementById('radical-library-area').style.display = type === 'library' ? 'block' : 'none';
        });
    });

    // Add text radical
    const btnAddText = document.getElementById('btn-add-radical-text');
    if(btnAddText) {
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

    // Library radical search
    const radSearchInput = document.getElementById('w-radicales-search');
    const radSuggestions = document.getElementById('radical-suggestions');
    let radHighlightedIdx = -1;

    const stripTonesRad = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const searchLibraryRadicals = (query) => {
        if (!query || query.length < 1) return [];
        return window.searchAndSortWords(query).filter(w => w.categoria !== 'clasificador').slice(0, 8);
    };

    const renderRadSuggestions = (results) => {
        if (results.length === 0) {
            radSuggestions.classList.remove('visible');
            radSuggestions.innerHTML = '';
            radHighlightedIdx = -1;
            return;
        }
        radHighlightedIdx = -1;
        radSuggestions.innerHTML = results.map((w, i) => {
            const color = CATEGORY_COLORS[w.categoria] || 'var(--text-muted)';
            return `
                <div class="pinyin-suggestion-item" data-index="${i}">
                    <span class="sug-char" style="color: ${color}">${w.tradicional}</span>
                    <span class="sug-pinyin">${w.pinyin}</span>
                    <span class="sug-spanish">(${w.espanol})</span>
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

    if(radSearchInput) {
        radSearchInput.addEventListener('input', (e) => {
            const results = searchLibraryRadicals(e.target.value);
            renderRadSuggestions(results);
        });
    }
    
    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (radSuggestions && !e.target.closest('#radical-library-area')) {
            radSuggestions.classList.remove('visible');
        }
    });

    // ==========================================================
    // NESTED HOVERS LOGIC
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
        // Clear timeout if hovering over any popover or radical ref
        if (e.target.closest('.radical-ref') || e.target.closest('.radical-popover')) {
            clearTimeout(hoverTimeout);
        }

        const refEl = e.target.closest('.radical-ref');
        if (refEl) {
            const refId = refEl.dataset.refId;
            const popoverLevel = parseInt(refEl.dataset.level || '0', 10);
            
            // If this exact popover is already open at this level, do nothing
            if (currentPopovers[popoverLevel] && currentPopovers[popoverLevel].dataset.refId === refId) {
                return;
            }
            
            // If we hover over a lower level ref, close higher level popovers
            closePopoversFrom(popoverLevel);
            
            // Render the popover
            const word = getAllWords().find(w => w.id === refId);
            if (!word) return;

            const popover = document.createElement('div');
            popover.className = 'radical-popover';
            popover.dataset.refId = refId;
            
            // We use the logic from createFlashcard's back face
            let details = `
                <div class="detail-row"><span class="detail-label">Pinyin</span><span class="detail-value">${word.pinyin}</span></div>
                <div class="detail-row"><span class="detail-label">Zhuyin</span><span class="detail-value zhuyin-val">${word.zhuyin || '—'}</span></div>
            `;
            if (word.clasificador) {
                const clf = getAllWords().find(w => w.id === word.clasificador);
                const clfDisplay = clf
                    ? `<span class="radical-ref" data-ref-id="${clf.id}" data-level="${popoverLevel + 1}">${clf.tradicional} (${clf.pinyin})</span>`
                    : word.clasificador;
                details += `<div class="detail-row"><span class="detail-label">Clasificador</span><span class="detail-value">${clfDisplay}</span></div>`;
            }
            
            // Custom radicals rendering for popover
            let radHtml = '';
            if (word.radicales) {
                if (Array.isArray(word.radicales)) {
                    radHtml = word.radicales.map(rad => {
                        if (rad.type === 'text') return rad.value;
                        if (rad.type === 'ref') {
                            const refWord = getAllWords().find(w => w.id === rad.id);
                            return refWord ? `<span class="radical-ref" data-ref-id="${rad.id}" data-level="${popoverLevel + 1}">${refWord.tradicional} (${refWord.espanol})</span>` : '';
                        }
                        return '';
                    }).join(' + ');
                } else {
                    radHtml = word.radicales;
                }
            }
            if (radHtml) details += `<div class="detail-row"><span class="detail-label">Radicales</span><span class="detail-value">${radHtml}</span></div>`;

            popover.innerHTML = `
                <div class="card-back">
                    <div class="spanish-meaning">${word.espanol}</div>
                    <div class="chinese-char" style="font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem; color: ${CATEGORY_COLORS[word.categoria] || 'var(--accent)'}">${word.tradicional}</div>
                    <div class="details-list">${details}</div>
                </div>
            `;
            
            // Append to body
            document.body.appendChild(popover);
            currentPopovers.push(popover);
            
            // Position it
            const rect = refEl.getBoundingClientRect();
            // Try to position to the right, if not enough space, to the left. If no space, below.
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
        const data = {
            espanol:      document.getElementById('w-espanol').value.trim(),
            tradicional:  document.getElementById('w-tradicional').value.trim(),
            pinyin:       document.getElementById('w-pinyin').value.trim(),
            zhuyin:       document.getElementById('w-zhuyin').value.trim(),
            categoria:    document.getElementById('w-categoria').value,
            clasificador: document.getElementById('w-clasificador').value.trim(),
            radicales:    currentRadicals.length > 0 ? currentRadicals : '',
            notas:        document.getElementById('w-notas').value.trim()
        };

        if (editingWordId) {
            updateWord(editingWordId, data);
            showToast(`"${data.tradicional}" actualizado correctamente`, 'success');
        } else {
            addWord(data);
            showToast(`"${data.tradicional}" agregado a tu biblioteca`, 'success');
        }

        wordDialog.close();
        refreshAll();
    });

    // --- Delete confirm ---
    document.getElementById('delete-dialog-confirm').addEventListener('click', () => {
        if (deletingItemType === 'estructura') {
            deleteStructure(deletingItemId);
            showToast('Estructura eliminada', 'success');
        } else {
            deleteWord(deletingItemId);
            showToast('Palabra eliminada', 'success');
        }
        deleteDialog.close();
        refreshAll();
    });

    // --- Dialog close buttons ---
    document.getElementById('word-dialog-close').addEventListener('click',  () => wordDialog.close());
    document.getElementById('word-dialog-cancel').addEventListener('click', () => wordDialog.close());
    document.getElementById('delete-dialog-close').addEventListener('click',  () => deleteDialog.close());
    document.getElementById('delete-dialog-cancel').addEventListener('click', () => deleteDialog.close());

    // --- Export controls ---
    document.getElementById('print-search-input').addEventListener('input', (e) => {
        currentPrintSearch = e.target.value;
        renderExportGrid();
    });
    const printPinyinToggle = document.getElementById('print-toggle-pinyin');
    if (printPinyinToggle) {
        printPinyinToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('hide-pinyin-print');
            } else {
                document.body.classList.add('hide-pinyin-print');
            }
        });
    }

    const printZhuyinToggle = document.getElementById('print-toggle-zhuyin');
    if (printZhuyinToggle) {
        printZhuyinToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('hide-zhuyin-print');
            } else {
                document.body.classList.add('hide-zhuyin-print');
            }
        });
    }

    const printCategoriaToggle = document.getElementById('print-toggle-categoria');
    if (printCategoriaToggle) {
        printCategoriaToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('hide-categoria-print');
            } else {
                document.body.classList.add('hide-categoria-print');
            }
        });
    }
    document.getElementById('btn-select-all').addEventListener('click', () => {
        document.querySelectorAll('#export-grid input[type="checkbox"]').forEach(cb => cb.checked = true);
        updateExportCount();
    });
    document.getElementById('btn-deselect-all').addEventListener('click', () => {
        document.querySelectorAll('#export-grid input[type="checkbox"]').forEach(cb => cb.checked = false);
        updateExportCount();
    });
    document.getElementById('export-grid').addEventListener('change', updateExportCount);
    document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

    // --- JSON import/export ---
    document.getElementById('btn-export-json').addEventListener('click', handleExportJSON);
    document.getElementById('btn-import-json').addEventListener('click', () => {
        document.getElementById('json-file-input').click();
    });
    document.getElementById('json-file-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImportJSON(e.target.files[0]);
    });

    // --- Initialize ---
    refreshAll();
    initBuilder();
});
