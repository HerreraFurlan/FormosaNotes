/**
 * =====================================================
 * AppChino — app.js
 * Main controller: navigation, rendering, dialogs,
 * event bindings, and application bootstrap.
 * =====================================================
 */

// ==========================================================
// CONFIGURACIÓN (SETTINGS) & FUENTES
// ==========================================================

const CHINESE_FONTS = {
    kaiti: "'DFKai-SB', '標楷體', 'BiauKai', 'BiauKai TC', 'KaiTi', 'STKaiti', serif",
    serif: "'Noto Serif TC', 'PMingLiU', '新細明體', serif",
    sans: "'Noto Sans TC', 'Microsoft JhengHei', '微軟正黑體', sans-serif"
};

const CHINESE_FONT_STORAGE_KEY = 'appchino_chinese_font';

/**
 * Applies the selected Chinese font stack globally.
 */
const applyChineseFont = (fontKey) => {
    const validKey = CHINESE_FONTS[fontKey] ? fontKey : 'kaiti';
    const fontStack = CHINESE_FONTS[validKey];
    document.documentElement.style.setProperty('--font-chinese', fontStack);
    localStorage.setItem(CHINESE_FONT_STORAGE_KEY, validKey);

    // Update settings dialog cards if present
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
    const savedFont = localStorage.getItem(CHINESE_FONT_STORAGE_KEY) || 'kaiti';
    applyChineseFont(savedFont);
} catch (e) {
    console.warn("Could not load initial font preference:", e);
}

// ==========================================================
// RENDERING
// ==========================================================

let currentCategoriesFilter = ['todos'];
let currentLessonFilter = ['todas'];
let currentSearch = '';

// Backward compatibility properties
Object.defineProperty(window, 'currentFilter', {
    get: () => currentCategoriesFilter[0] || 'todos',
    set: (val) => { currentCategoriesFilter = val ? [val] : ['todos']; }
});

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
 * Performs alike/fuzzy search across Hanzi, Pinyin, Zhuyin, and Spanish,
 * but strongly prioritizes EXACT matches without tones (Pinyin & Zhuyin),
 * prefix syllable matches, and shorter words before longer compound words.
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
    const qEspanol = stripPinyinTones(rawQ);

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

        const espanolRaw = (w.espanol || '').toLowerCase().trim();
        const espanolNorm = stripPinyinTones(espanolRaw);
        const espanolWords = espanolNorm.split(/[\s,./\(\)\-—]+/).filter(Boolean);

        const charMatch = (options.includeChar !== false) && (trad.includes(rawQ) || trad.includes(qLower));
        const pinyinMatch = !!(qPinyin && (pinyinNorm.includes(qPinyin) || pinyinCompact.includes(qPinyinCompact)));
        const zhuyinMatch = !!(hasZhuyinInQuery && qZhuyin && (zhuyinNorm.includes(qZhuyin) || zhuyinCompact.includes(qZhuyinCompact)));
        const espanolMatch = !!(qEspanol && espanolNorm.includes(qEspanol));

        if (!charMatch && !pinyinMatch && !zhuyinMatch && !espanolMatch) {
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
                score += 5000; // Bonus for exact tone match
            }
        }

        if (hasZhuyinInQuery && qZhuyin && (zhuyinNorm === qZhuyin || zhuyinCompact === qZhuyinCompact)) {
            score = Math.max(score, 80000);
            if (zhuyinRaw === rawQ) {
                score += 5000; // Bonus for exact tone match
            }
        }

        if (qEspanol && (espanolNorm === qEspanol || espanolWords.some(ew => ew === qEspanol))) {
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
            if (qEspanol && (espanolNorm.startsWith(qEspanol) || espanolWords.some(ew => ew.startsWith(qEspanol)))) {
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

        // Tier 7: Only Spanish arbitrary substring match
        if (score === 0 && espanolMatch) {
            score = Math.max(score, 200);
        }

        // Tie-breaker penalty for length: shorter traditional Hanzi and shorter pinyin rank first
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



/**
 * Renders the main flashcard grid (Library section).
 */
const renderGrid = () => {
    const gridEl = document.getElementById('card-grid');
    gridEl.innerHTML = '';
    let words = getAllWords();

    // 1. Filter by category (stackable)
    if (!currentCategoriesFilter.includes('todos') && currentCategoriesFilter.length > 0) {
        words = words.filter(w => currentCategoriesFilter.includes(w.categoria));
    }

    // 2. Filter by lesson (stackable)
    if (!currentLessonFilter.includes('todas') && currentLessonFilter.length > 0) {
        words = words.filter(w => {
            if (!w.leccion) {
                return currentLessonFilter.includes('ninguna');
            }
            return currentLessonFilter.includes(String(w.leccion));
        });
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

const isPinyinVowel = (ch) => {
    if (!ch) return false;
    const base = PINYIN_UNACCENT_MAP[ch] || ch;
    return /[aeiouüvAEIOUÜV]/.test(base);
};

const isPinyinConsonant = (ch) => {
    if (!ch) return false;
    return /[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]/.test(ch) && ch.toLowerCase() !== 'v';
};

/**
 * Extracts the single trailing pinyin syllable immediately preceding the cursor.
 * Correctly boundaries contiguous words (like 'shangke' -> 'ke', 'shàngke' -> 'ke', 'taibei' -> 'bei')
 * by tracing backwards from the cursor to find the syllable's coda, vowel nucleus, and onset consonant,
 * preventing tone marks from being placed on preceding syllables in a connected chain.
 * 
 * @param {string} textBefore - Text before cursor
 * @returns {{ syllable: string, prefix: string } | null}
 */
const extractLastPinyinSyllable = (textBefore) => {
    if (!textBefore || textBefore.length === 0) return null;

    let endIdx = textBefore.length - 1;
    const lastChar = textBefore[endIdx];
    if (!isPinyinVowel(lastChar) && !isPinyinConsonant(lastChar)) {
        return null;
    }

    let i = endIdx;

    // 1. Check optional coda at the end: 'ng', 'n', or 'r'
    if (i >= 2 && textBefore.slice(i - 1, i + 1).toLowerCase() === 'ng' && isPinyinVowel(textBefore[i - 2])) {
        i -= 2;
    } else if (i >= 1 && textBefore[i].toLowerCase() === 'n' && isPinyinVowel(textBefore[i - 1])) {
        i -= 1;
    } else if (i >= 1 && textBefore[i].toLowerCase() === 'r' && isPinyinVowel(textBefore[i - 1])) {
        i -= 1;
    }

    // 2. Collect 1 to 3 vowels (nucleus)
    const vowelEnd = i;
    while (i >= 0 && isPinyinVowel(textBefore[i])) {
        i--;
    }
    const vowelStart = i + 1;

    // Must contain at least one vowel to be toneable
    if (vowelStart > vowelEnd) {
        return null;
    }

    // 3. Check optional initial consonant(s) (onset) immediately before vowels
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

/**
 * Attaches the number-to-tone converter to any input element.
 * @param {HTMLInputElement} input
 */
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

        // Slice text before selection
        const textBefore = val.slice(0, cursorPos);
        const textAfter = val.slice(selEnd);

        // Find trailing syllable right before the cursor
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

/**
 * Attaches the number-to-tone converter exclusively to the #w-pinyin input.
 */
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
        if (btn.dataset.lesson === valStr) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
};

/**
 * Opens the Add Word dialog.
 */
const openAddDialog = () => {
    editingWordId = null;
    document.getElementById('word-dialog-title').textContent = 'Nueva Palabra';
    wordForm.reset();
    setWordDialogLesson('');
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
    setWordDialogLesson(word.leccion || '');
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
    } else if (sectionName === 'exam') {
        if (typeof initExamMode === 'function') initExamMode();
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

    // --- Library lesson filter chips (stackable multi-selection) ---
    const libraryLessonChips = document.getElementById('library-lesson-chips');
    if (libraryLessonChips) {
        libraryLessonChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            const lessonVal = chip.dataset.lessonFilter || 'todas';

            if (lessonVal === 'todas') {
                currentLessonFilter = ['todas'];
            } else {
                let lessons = currentLessonFilter.filter(l => l !== 'todas');
                if (lessons.includes(lessonVal)) {
                    lessons = lessons.filter(l => l !== lessonVal);
                } else {
                    lessons.push(lessonVal);
                }
                if (lessons.length === 0) {
                    lessons = ['todas'];
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

    // --- Library category filter chips (stackable multi-selection) ---
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

    // --- Builder bank filter chips ---
    document.getElementById('bank-filter-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#bank-filter-chips .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderWordBank(chip.dataset.filter);
    });

    // --- Study mode filter chips handled in study.js ---

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

    // --- Lesson picker pills listener (Word Dialog) ---
    const lessonGroup = document.getElementById('w-lesson-group');
    if (lessonGroup) {
        lessonGroup.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-lesson-pill');
            if (!btn) return;
            setWordDialogLesson(btn.dataset.lesson);
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
            
            let clfDisplay = '';
            if (word.clasificador) {
                const clf = getAllWords().find(w => w.id === word.clasificador);
                clfDisplay = clf
                    ? `<span class="radical-ref" data-ref-id="${clf.id}" data-level="${popoverLevel + 1}">${clf.tradicional} (${clf.pinyin})</span>`
                    : word.clasificador;
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
                    }).filter(Boolean).join(' + ');
                } else {
                    radHtml = word.radicales;
                }
            }

            const popoverCatColor = CATEGORY_COLORS[word.categoria] || 'var(--accent)';

            popover.innerHTML = `
                <div class="card-back" style="padding: 1.25rem; min-width: 220px;">
                    <div class="card-back-body" style="margin: auto 0; text-align: center;">
                        <div class="spanish-meaning" style="margin-bottom: 0.5rem;">${word.espanol}</div>
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
                    ${word.notas ? `
                    <div class="card-notes-block" style="margin-top: 0.5rem;">
                        ${word.notas}
                    </div>
                    ` : ''}
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
        const leccionRaw = document.getElementById('w-leccion')?.value?.trim();
        const data = {
            espanol:      document.getElementById('w-espanol').value.trim(),
            tradicional:  document.getElementById('w-tradicional').value.trim(),
            pinyin:       document.getElementById('w-pinyin').value.trim(),
            zhuyin:       document.getElementById('w-zhuyin').value.trim(),
            categoria:    document.getElementById('w-categoria').value,
            clasificador: document.getElementById('w-clasificador').value.trim(),
            leccion:      leccionRaw ? parseInt(leccionRaw, 10) : null,
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

    // --- Settings initialization ---
    initSettings();

    // --- Initialize ---
    refreshAll();
    initBuilder();
});

/**
 * Initializes settings dialog and font preferences.
 */
const initSettings = () => {
    const savedFont = localStorage.getItem(CHINESE_FONT_STORAGE_KEY) || 'kaiti';
    applyChineseFont(savedFont);

    const settingsDialog = document.getElementById('settings-dialog');
    const openSettingsBtn = document.getElementById('btn-open-settings');
    const closeSettingsBtn = document.getElementById('settings-dialog-close');
    const cancelSettingsBtn = document.getElementById('settings-dialog-cancel');
    const saveSettingsBtn = document.getElementById('settings-dialog-save');
    const geminiKeyInput = document.getElementById('settings-gemini-key');
    const toggleGeminiKeyBtn = document.getElementById('btn-toggle-gemini-key');

    if (!settingsDialog) return;

    // Open settings
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
            const currentFont = localStorage.getItem(CHINESE_FONT_STORAGE_KEY) || 'kaiti';
            applyChineseFont(currentFont);

            if (geminiKeyInput && typeof getGeminiApiKey === 'function') {
                geminiKeyInput.value = getGeminiApiKey() || '';
            }

            settingsDialog.showModal();
        });
    }

    // Close / Cancel
    const closeDialog = () => {
        const savedFont = localStorage.getItem(CHINESE_FONT_STORAGE_KEY) || 'kaiti';
        applyChineseFont(savedFont);
        settingsDialog.close();
    };

    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeDialog);
    if (cancelSettingsBtn) cancelSettingsBtn.addEventListener('click', closeDialog);

    // Font card selection in dialog
    document.querySelectorAll('.settings-font-card').forEach(card => {
        card.addEventListener('click', () => {
            const fontKey = card.dataset.font;
            if (fontKey) {
                applyChineseFont(fontKey);
            }
        });
    });

    // Toggle password visibility
    if (toggleGeminiKeyBtn && geminiKeyInput) {
        toggleGeminiKeyBtn.addEventListener('click', () => {
            geminiKeyInput.type = geminiKeyInput.type === 'password' ? 'text' : 'password';
        });
    }

    // Save changes
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const selectedRadio = document.querySelector('input[name="chinese-font-choice"]:checked');
            const fontKey = selectedRadio ? selectedRadio.value : 'kaiti';
            applyChineseFont(fontKey);

            if (geminiKeyInput && typeof setGeminiApiKey === 'function') {
                const newKey = geminiKeyInput.value.trim();
                setGeminiApiKey(newKey);
            }

            showToast('Configuración guardada correctamente', 'success');
            settingsDialog.close();
        });
    }
};
