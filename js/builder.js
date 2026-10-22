/**
 * =====================================================
 * AppChino (Formosa Notes) — builder.js
 * Constructor de Oraciones con "Sintagmas Magnéticos":
 * - Átomos neutros con código POS (八大詞類 + 動詞分類: Vs, Vst, V-sep, Vaux...)
 * - Fusión automática en Cápsulas Sintácticas (Moléculas) con 0 ms de latencia
 * - Barra de Slots Canónicos SVO Chino en tiempo real
 * - Proyección de Slots Fantasma (Ghost Slots) al arrastrar o previsualizar fichas
 * - Evaluación Híbrida en 3 Niveles:
 *   Nivel 1: Resistencia visual y sacudida física en colisiones de orden SVO
 *   Nivel 2: Banner heurístico determinista con botón de auto-imantación en 1 clic
 *   Nivel 3: Validación semántica concisa con Gemini bajo demanda
 * =====================================================
 */

let bankObserver = null;
let bankSortableInstance = null;
let dropzoneSortableInstance = null;

// Estado reactivo del lienzo magnético (arreglo plano de tokens normalizados)
let builderTokens = [];
let activeGhostCandidate = null;
let lastOffendingIndices = new Set();
let formulaManuallyEdited = false;

/**
 * Sincroniza `builderTokens` a partir del orden actual de `.mini-card` en el DOM
 * (usado tras un reordenamiento manual con SortableJS).
 */
const syncTokensFromDOM = () => {
    const dropzone = document.getElementById('builder-dropzone');
    if (!dropzone) return;
    const domCards = Array.from(dropzone.querySelectorAll('.mini-card:not(.ghost-slot)'));
    const nextTokens = [];

    domCards.forEach((el, idx) => {
        const oldIdx = el.dataset.tokenIndex !== undefined && el.dataset.tokenIndex !== ''
            ? parseInt(el.dataset.tokenIndex, 10)
            : -1;
        if (oldIdx >= 0 && builderTokens[oldIdx]) {
            nextTokens.push(Object.assign({}, builderTokens[oldIdx], { index: idx }));
        } else {
            const wordId = el.dataset.id;
            const dbWord = (typeof getWordById === 'function' && wordId) ? getWordById(wordId) : null;
            const raw = dbWord || {
                id: wordId || ('anon_' + Date.now()),
                tradicional: el.dataset.tradicional || '',
                pinyin: el.dataset.pinyin || '',
                categoria: el.dataset.categoria || 'N',
                posSymbol: el.dataset.posSymbol || 'N'
            };
            nextTokens.push(SyntaxEngine.normalizeToken(raw, idx));
        }
    });

    builderTokens = nextTokens;
};

/**
 * Inserta una palabra o token en una posición específica del lienzo magnético.
 * @param {object} word
 * @param {number} [insertIndex]
 */
const insertTokenIntoBuilder = (word, insertIndex = builderTokens.length) => {
    if (!word) return;
    const normalized = SyntaxEngine.normalizeToken(word, insertIndex);
    const boundedIdx = Math.max(0, Math.min(builderTokens.length, insertIndex));
    builderTokens.splice(boundedIdx, 0, normalized);
    activeGhostCandidate = null;
    renderMagneticCanvas({ animateCollision: true });
};

/**
 * Elimina un token del lienzo magnético por su índice.
 * @param {number} index
 */
const removeTokenFromBuilder = (index) => {
    if (index < 0 || index >= builderTokens.length) return;
    builderTokens.splice(index, 1);
    renderMagneticCanvas({ animateCollision: false });
};

/**
 * Separa un verbo separable (`V-sep` / `Vs-sep` / `Vp-sep`) en sus 2 átomos (`唱` + `歌`).
 * @param {number} index
 */
const splitSeparableTokenInBuilder = (index) => {
    if (typeof SyntaxEngine === 'undefined' || !SyntaxEngine.expandSeparableVerbAt) return;
    builderTokens = SyntaxEngine.expandSeparableVerbAt(builderTokens, index);
    renderMagneticCanvas({ animateCollision: false });
    const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
    showToast(
        lang === 'en'
            ? 'Separable verb split! You can now drop particles (了, 過) or classifiers between its two parts.'
            : '¡Verbo separable dividido! Ahora puedes arrastrar partículas (了, 過) o clasificadores entre sus dos partes.',
        'info'
    );
};

/**
 * Asegura que existan los contenedores auxiliares del lienzo magnético
 * (Barra de Slots SVO arriba del dropzone y Banner Heurístico debajo).
 */
const ensureMagneticContainers = () => {
    const dropzone = document.getElementById('builder-dropzone');
    if (!dropzone || !dropzone.parentElement) return {};

    let slotBar = document.getElementById('builder-svo-slot-bar');
    if (!slotBar) {
        slotBar = document.createElement('div');
        slotBar.id = 'builder-svo-slot-bar';
        slotBar.className = 'svo-slot-bar';
        dropzone.parentElement.insertBefore(slotBar, dropzone);
    }

    let heuristicBanner = document.getElementById('builder-heuristic-banner');
    if (!heuristicBanner) {
        heuristicBanner = document.createElement('div');
        heuristicBanner.id = 'builder-heuristic-banner';
        heuristicBanner.className = 'magnetic-heuristic-banner';
        heuristicBanner.style.display = 'none';
        dropzone.insertAdjacentElement('afterend', heuristicBanner);
    }

    return { slotBar, heuristicBanner };
};

/**
 * Renderiza la barra superior de Arquitectura SVO China iluminando los slots activos.
 * @param {Array<string>} activeSlots
 * @param {Array<object>} ghostSlots
 */
const renderSVOSlotBar = (activeSlots = [], ghostSlots = []) => {
    const { slotBar } = ensureMagneticContainers();
    if (!slotBar || typeof APP_CONFIG === 'undefined' || !Array.isArray(APP_CONFIG.canonicalSlots)) return;

    const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
    const activeSet = new Set(activeSlots);
    const ghostSlotIds = new Set((ghostSlots || []).map(g => g.slotId));

    slotBar.innerHTML = APP_CONFIG.canonicalSlots.map((slot, idx) => {
        const isActive = activeSet.has(slot.id);
        const isGhostTarget = ghostSlotIds.has(slot.id);
        const label = (slot.shortLabels && slot.shortLabels[lang]) || slot.labels[lang] || slot.id;
        return `
            <div class="svo-slot-pill ${isActive ? 'is-active' : ''} ${isGhostTarget ? 'is-ghost-target' : ''}"
                 style="--slot-color: ${slot.color}; --slot-bg: ${slot.bgSoft};">
                <span class="svo-slot-num">${idx + 1}</span>
                <span class="svo-slot-name">${label}</span>
            </div>
            ${idx < APP_CONFIG.canonicalSlots.length - 1 ? '<span class="svo-slot-arrow">→</span>' : ''}
        `;
    }).join('');
};

/**
 * Renderiza el Banner Heurístico Determinista (Nivel 2) con el botón de auto-imantación.
 * @param {object} validationResult
 * @param {Array<object>} syntagmas
 */
const renderHeuristicBanner = (validationResult, syntagmas) => {
    const { heuristicBanner } = ensureMagneticContainers();
    if (!heuristicBanner) return;

    const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
    const issues = (validationResult && validationResult.issues) || [];

    if (builderTokens.length === 0) {
        heuristicBanner.style.display = 'none';
        heuristicBanner.innerHTML = '';
        return;
    }

    if (issues.length === 0) {
        const capsuleCount = (syntagmas || []).filter(s => s.isCapsule).length;
        if (capsuleCount > 0) {
            heuristicBanner.className = 'magnetic-heuristic-banner is-valid';
            heuristicBanner.style.display = 'flex';
            heuristicBanner.innerHTML = `
                <div class="heuristic-info">
                    <span class="heuristic-icon">🧲</span>
                    <div class="heuristic-text">
                        <strong>${lang === 'en' ? 'Valid Syntactic Geometry' : 'Geometría Sintáctica Válida'}</strong>
                        <span>${lang === 'en'
                            ? `${capsuleCount} magnetic syntagma${capsuleCount > 1 ? 's' : ''} fused following canonical Chinese SVO order.`
                            : `${capsuleCount} sintagma${capsuleCount > 1 ? 's' : ''} magnético${capsuleCount > 1 ? 's' : ''} fusionado${capsuleCount > 1 ? 's' : ''} en orden canónico SVO chino.`}</span>
                    </div>
                </div>
            `;
        } else {
            heuristicBanner.style.display = 'none';
            heuristicBanner.innerHTML = '';
        }
        return;
    }

    const primaryIssue = issues[0];
    heuristicBanner.className = `magnetic-heuristic-banner is-${primaryIssue.severity || 'error'}`;
    heuristicBanner.style.display = 'flex';
    heuristicBanner.innerHTML = `
        <div class="heuristic-info">
            <span class="heuristic-icon">${primaryIssue.severity === 'warning' ? '💡' : '⚠️'}</span>
            <div class="heuristic-text">
                <strong>${primaryIssue.title}</strong>
                <span>${primaryIssue.message}</span>
            </div>
        </div>
        ${primaryIssue.fixLabel && typeof primaryIssue.applyFix === 'function' ? `
            <button type="button" class="btn btn-sm heuristic-fix-btn" id="btn-apply-magnetic-fix">
                ${primaryIssue.fixLabel}
            </button>
        ` : ''}
    `;

    const fixBtn = heuristicBanner.querySelector('#btn-apply-magnetic-fix');
    if (fixBtn && typeof primaryIssue.applyFix === 'function') {
        fixBtn.addEventListener('click', () => {
            builderTokens = primaryIssue.applyFix(builderTokens);
            renderMagneticCanvas({ animateCollision: false });
        });
    }
};

/**
 * Renderiza el lienzo de Sintagmas Magnéticos:
 * - Agrupa tokens en Cápsulas Sintácticas (`.syntagma-capsule`)
 * - Dibuja Slots Fantasma (`.ghost-slot`) si hay una ficha candidata activa
 * - Aplica resistencia física (`.has-collision-shake`) en colisiones sintácticas
 * - Actualiza la vista previa y la fórmula gramatical automática
 */
const renderMagneticCanvas = (options = {}) => {
    const { animateCollision = true } = options;
    const dropzone = document.getElementById('builder-dropzone');
    if (!dropzone || typeof SyntaxEngine === 'undefined') return;

    const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';

    // Re-normalizar índices
    builderTokens = builderTokens.map((t, idx) => SyntaxEngine.normalizeToken(t, idx)).filter(Boolean);

    // 1. Detectar Sintagmas Magnéticos (Moléculas) y Validar Slots SVO (0 ms)
    const syntagmas = SyntaxEngine.detectSyntagmas(builderTokens, lang);
    const validation = SyntaxEngine.validateSlotOrder(syntagmas, builderTokens, lang);
    const ghostSlots = activeGhostCandidate
        ? SyntaxEngine.computeGhostSlots(activeGhostCandidate, builderTokens, lang)
        : [];

    const offendingSet = new Set();
    validation.issues.forEach(iss => {
        (iss.offendingTokenIndices || []).forEach(idx => offendingSet.add(idx));
    });
    lastOffendingIndices = offendingSet;

    // 2. Actualizar Barra SVO y Banner Heurístico
    renderSVOSlotBar(validation.activeSlots, ghostSlots);
    renderHeuristicBanner(validation, syntagmas);

    // 3. Construir el DOM del lienzo con Cápsulas, Átomos y Ghost Slots
    dropzone.innerHTML = '';

    const createGhostElement = (ghost) => {
        const ghostEl = document.createElement('button');
        ghostEl.type = 'button';
        ghostEl.className = 'ghost-slot';
        ghostEl.style.setProperty('--ghost-color', ghost.color || '#2E78B7');
        ghostEl.dataset.targetIndex = String(ghost.targetTokenIndex);
        ghostEl.innerHTML = `
            <span class="ghost-slot-char">${activeGhostCandidate ? activeGhostCandidate.tradicional : '+'}</span>
            <span class="ghost-slot-label">${ghost.label}</span>
        `;
        ghostEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeGhostCandidate) {
                insertTokenIntoBuilder(activeGhostCandidate, ghost.targetTokenIndex);
            }
        });
        return ghostEl;
    };

    // Ghost slots al inicio (índice 0)
    ghostSlots.filter(g => g.targetTokenIndex === 0).forEach(g => {
        dropzone.appendChild(createGhostElement(g));
    });

    syntagmas.forEach((syn) => {
        const hasSynCollision = syn.tokens.some(t => offendingSet.has(t.index));

        if (syn.isCapsule && syn.tokens.length >= 2) {
            const capsuleEl = document.createElement('div');
            capsuleEl.className = `syntagma-capsule capsule-${syn.type.toLowerCase()} ${hasSynCollision ? 'has-collision' : ''} ${(hasSynCollision && animateCollision) ? 'has-collision-shake' : ''}`;
            capsuleEl.style.setProperty('--capsule-color', syn.color);
            capsuleEl.style.setProperty('--capsule-bg', syn.bgSoft);
            capsuleEl.style.setProperty('--capsule-border', syn.borderColor);

            const headerEl = document.createElement('div');
            headerEl.className = 'syntagma-capsule-header';
            headerEl.innerHTML = `
                <span class="capsule-magnet-icon">🧲</span>
                <span class="capsule-slot-label">[ ${syn.label} ]</span>
            `;
            capsuleEl.appendChild(headerEl);

            const bodyEl = document.createElement('div');
            bodyEl.className = 'syntagma-capsule-tokens';

            syn.tokens.forEach((tok, tokPosInCap) => {
                const tokenCard = createBuilderMiniCard(tok, {
                    onRemove: removeTokenFromBuilder,
                    onSplitSeparable: splitSeparableTokenInBuilder
                });
                if (offendingSet.has(tok.index)) {
                    tokenCard.classList.add('has-token-collision');
                }
                bodyEl.appendChild(tokenCard);

                if (tokPosInCap < syn.tokens.length - 1) {
                    const bondEl = document.createElement('span');
                    bondEl.className = 'syntagma-bond-link';
                    bondEl.textContent = '•';
                    bodyEl.appendChild(bondEl);
                }

                // Ghost slots que apuntan justo dentro de esta cápsula (ej. insertar clasificador M tras Det)
                ghostSlots
                    .filter(g => g.targetTokenIndex === tok.index + 1 && g.targetTokenIndex <= syn.endIndex)
                    .forEach(g => bodyEl.appendChild(createGhostElement(g)));
            });

            capsuleEl.appendChild(bodyEl);
            dropzone.appendChild(capsuleEl);
        } else {
            const tok = syn.tokens[0];
            const tokenCard = createBuilderMiniCard(tok, {
                onRemove: removeTokenFromBuilder,
                onSplitSeparable: splitSeparableTokenInBuilder
            });
            tokenCard.classList.add('standalone-atom');
            if (hasSynCollision) {
                tokenCard.classList.add('has-token-collision');
                if (animateCollision) tokenCard.classList.add('has-collision-shake');
            }
            dropzone.appendChild(tokenCard);
        }

        // Ghost slots inmediatamente después de este sintagma/átomo
        ghostSlots
            .filter(g => g.targetTokenIndex === syn.endIndex + 1 && g.targetTokenIndex > 0)
            .forEach(g => dropzone.appendChild(createGhostElement(g)));
    });

    // 4. Re-inicializar Sortable en el lienzo permitiendo arrastrar cualquier `.mini-card`
    initDropzoneSortable(dropzone);

    // 5. Actualizar vista previa y fórmula automática
    updateBuilderPreview(syntagmas);
};

/**
 * Configura SortableJS en el dropzone soportando cápsulas y átomos.
 */
const initDropzoneSortable = (dropzone) => {
    if (dropzoneSortableInstance) {
        dropzoneSortableInstance.destroy();
    }
    dropzoneSortableInstance = new Sortable(dropzone, {
        group: 'builder',
        draggable: '.mini-card, .syntagma-capsule',
        animation: 180,
        ghostClass: 'magnetic-sortable-ghost',
        onAdd: function (evt) {
            const el = evt.item;
            const wordId = el.dataset.id;
            const word = (typeof getWordById === 'function' && wordId)
                ? getWordById(wordId)
                : getAllWords().find(w => w.id === wordId);
            if (!word) {
                el.remove();
                return;
            }
            // Reemplazar temporalmente por un mini-card con sus datos para que syncTokensFromDOM lo lea en la posición exacta
            const tempCard = createMiniCard(word);
            el.replaceWith(tempCard);
            activeGhostCandidate = null;
            syncTokensFromDOM();
            renderMagneticCanvas({ animateCollision: true });
        },
        onUpdate: function () {
            syncTokensFromDOM();
            renderMagneticCanvas({ animateCollision: true });
        }
    });
};

/**
 * Actualiza la vista previa en vivo de la oración y autocompleta la fórmula gramatical.
 * @param {Array<object>} [precomputedSyntagmas]
 */
const updateBuilderPreview = (precomputedSyntagmas = null) => {
    const dropzone = document.getElementById('builder-dropzone');
    if (!dropzone) return;

    const previewEl = document.getElementById('builder-preview');
    const saveRow = document.getElementById('builder-save-row');
    const clearBtn = document.getElementById('btn-clear-builder');
    const formulaInput = document.getElementById('structure-formula');

    if (builderTokens.length === 0) {
        dropzone.classList.toggle('is-empty', !activeGhostCandidate);
        if (previewEl) previewEl.style.display = 'none';
        if (saveRow) saveRow.style.display = 'none';
        if (clearBtn) clearBtn.disabled = true;
        formulaManuallyEdited = false;
        return;
    }

    dropzone.classList.remove('is-empty');
    if (previewEl) previewEl.style.display = 'flex';
    if (saveRow) saveRow.style.display = 'flex';
    if (clearBtn) clearBtn.disabled = false;

    const chinese = builderTokens.map(t => t.tradicional).join('');
    const pinyin = builderTokens.map(t => t.pinyin).filter(Boolean).join(' ');

    const chEl = document.getElementById('preview-chinese');
    const pyEl = document.getElementById('preview-pinyin');
    if (chEl) chEl.textContent = chinese;
    if (pyEl) pyEl.textContent = pinyin;


};

/**
 * Inicializa el Constructor de Sintagmas Magnéticos.
 */
const initBuilder = () => {
    const dropzone = document.getElementById('builder-dropzone');
    if (!dropzone) return;

    ensureMagneticContainers();

    const formulaInput = document.getElementById('structure-formula');
    if (formulaInput) {
        formulaInput.addEventListener('input', () => {
            formulaManuallyEdited = formulaInput.value.trim().length > 0;
        });
    }

    // Nivel 3: Validación Semántica con IA (Gemini Fallback bajo demanda)
    document.getElementById('btn-examine-sentence').addEventListener('click', async () => {
        if (builderTokens.length === 0) {
            showToast(typeof I18N !== 'undefined' ? I18N.t('builderToastEmpty') : 'Agrega al menos una palabra al constructor', 'error');
            return;
        }

        const chinese = builderTokens.map(t => t.tradicional).join('');
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

    // AI dialog bindings
    const aiDialog = document.getElementById('ai-result-dialog');
    document.getElementById('ai-dialog-close').addEventListener('click', () => aiDialog.close());
    document.getElementById('ai-dialog-ok').addEventListener('click', () => aiDialog.close());

    // -------------------------------------------------------
    // Pinyin / Hanzi quick-input con autocompletado y POS badge
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

        const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
        highlightedIdx = -1;
        suggestionsEl.innerHTML = results.map((w, i) => {
            const posBadge = (typeof APP_CONFIG !== 'undefined' && typeof APP_CONFIG.getWordPOSBadgeInfo === 'function')
                ? APP_CONFIG.getWordPOSBadgeInfo(w, lang)
                : { code: w.posSymbol || w.categoria, label: w.categoria, color: CATEGORY_COLORS[w.categoria] || 'var(--text-muted)' };
            const meaning = (window.I18N && window.I18N.getWordMeaning) ? window.I18N.getWordMeaning(w) : (w.espanol || '');
            return `
                <div class="pinyin-suggestion-item" data-index="${i}">
                    <span class="sug-char">${w.tradicional}</span>
                    <div class="sug-info">
                        <span class="sug-pinyin">${w.pinyin}</span>
                        <span class="sug-spanish">${meaning}</span>
                    </div>
                    <span class="sug-badge" style="background: ${posBadge.color}18; color: ${posBadge.color};">${posBadge.label}</span>
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
            if (e.key === 'Enter' && pinyinInput.value.trim().length > 0) {
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
            builderTokens.push(SyntaxEngine.normalizeToken(word, builderTokens.length));
        });

        const prefix = getQueuePrefix();
        if (fullValue.startsWith(prefix) && fullValue.length > prefix.length) {
            const remaining = fullValue.slice(prefix.length).trim();
            // Intentar emparejar palabras completas de la biblioteca primero antes de dividir por carácter
            let cursor = 0;
            const allWords = getAllWords();
            while (cursor < remaining.length) {
                const sub = remaining.slice(cursor);
                if (!sub[0].trim()) {
                    cursor++;
                    continue;
                }
                let matchedWord = null;
                for (let len = Math.min(4, sub.length); len >= 1; len--) {
                    const chunk = sub.slice(0, len);
                    matchedWord = allWords.find(w => w.tradicional === chunk);
                    if (matchedWord) {
                        builderTokens.push(SyntaxEngine.normalizeToken(matchedWord, builderTokens.length));
                        cursor += len;
                        break;
                    }
                }
                if (!matchedWord) {
                    const char = sub[0];
                    builderTokens.push(SyntaxEngine.normalizeToken({
                        id: 'anon_' + Date.now() + '_' + cursor,
                        tradicional: char,
                        pinyin: '',
                        categoria: 'N'
                    }, builderTokens.length));
                    cursor++;
                }
            }
        }

        pinyinQueue = [];
        pinyinInput.value = '';
        pinyinInput.placeholder = typeof I18N !== 'undefined' ? I18N.t('builderQuickInputPlaceholder') : 'Escribe los caracteres o buscalos por significado, pinyin o zhuyin';
        addPinyinBtn.disabled = true;
        activeGhostCandidate = null;
        renderMagneticCanvas({ animateCollision: true });
    });

    const clearBtn = document.getElementById('btn-clear-builder');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (builderTokens.length === 0 && pinyinQueue.length === 0 && (!pinyinInput || !pinyinInput.value)) return;

            builderTokens = [];
            activeGhostCandidate = null;
            formulaManuallyEdited = false;
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
            const fInput = document.getElementById('structure-formula');
            if (fInput) fInput.value = '';
            renderMagneticCanvas({ animateCollision: false });
            showToast(typeof I18N !== 'undefined' ? I18N.t('builderToastCleared') : 'Zona de construcción vaciada', 'info');
        });
    }

    renderMagneticCanvas({ animateCollision: false });
};

/**
 * Renderiza el Banco de Palabras con Lazy Rendering (IntersectionObserver),
 * soporte de clic rápido para insertar o proyectar Ghost Slots al arrastrar.
 * @param {string} filter - Filtro de categoría ('todos' o una de las 8 categorías: N, V, Adv, Conj, Prep, M, Ptc, Det)
 */
const renderWordBank = (filter = 'todos') => {
    const bankEl = document.getElementById('word-bank-grid');
    if (!bankEl) return;

    if (bankObserver) {
        bankObserver.disconnect();
        bankObserver = null;
    }

    bankEl.innerHTML = '';

    // Mostrar skeletons si el paquete de idioma se está cargando
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

    const attachBankCardEvents = (cardEl, word) => {
        // Clic directo: agrega la palabra al lienzo magnético
        cardEl.addEventListener('click', () => {
            insertTokenIntoBuilder(word);
        });
        // Hover: ilumina su Slot Canónico en la barra SVO
        cardEl.addEventListener('mouseenter', () => {
            if (typeof SyntaxEngine !== 'undefined') {
                const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
                const syns = SyntaxEngine.detectSyntagmas(builderTokens, lang);
                const val = SyntaxEngine.validateSlotOrder(syns, builderTokens, lang);
                const ghosts = SyntaxEngine.computeGhostSlots(word, builderTokens, lang);
                renderSVOSlotBar(val.activeSlots, ghosts);
            }
        });
        cardEl.addEventListener('mouseleave', () => {
            if (typeof SyntaxEngine !== 'undefined' && !activeGhostCandidate) {
                const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
                const syns = SyntaxEngine.detectSyntagmas(builderTokens, lang);
                const val = SyntaxEngine.validateSlotOrder(syns, builderTokens, lang);
                renderSVOSlotBar(val.activeSlots, []);
            }
        });
    };

    const appendNextBatch = (batchSize) => {
        const slice = words.slice(renderedCount, renderedCount + batchSize);
        if (slice.length === 0) return;
        const frag = document.createDocumentFragment();
        slice.forEach(word => {
            const cardEl = createMiniCard(word);
            attachBankCardEvents(cardEl, word);
            frag.appendChild(cardEl);
        });
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
        onStart: function (evt) {
            const wordId = evt.item.dataset.id;
            const word = (typeof getWordById === 'function' && wordId) ? getWordById(wordId) : null;
            if (word) {
                activeGhostCandidate = word;
                const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
                const syns = SyntaxEngine.detectSyntagmas(builderTokens, lang);
                const val = SyntaxEngine.validateSlotOrder(syns, builderTokens, lang);
                const ghosts = SyntaxEngine.computeGhostSlots(word, builderTokens, lang);
                renderSVOSlotBar(val.activeSlots, ghosts);
            }
        },
        onEnd: function () {
            activeGhostCandidate = null;
            const lang = (window.I18N && window.I18N.getLanguage) ? window.I18N.getLanguage() : 'es';
            const syns = SyntaxEngine.detectSyntagmas(builderTokens, lang);
            const val = SyntaxEngine.validateSlotOrder(syns, builderTokens, lang);
            renderSVOSlotBar(val.activeSlots, []);
        }
    });
};
