/**
 * =====================================================
 * AppChino (Formosa Notes) — syntax-engine.js
 * Motor Determinista de Sintaxis China y "Sintagmas Magnéticos" (Latencia 0 ms)
 * 
 * Basado en la gramática pedagógica oficial de Taiwán (當代中文課程 / 詞類表):
 * - Ocho Categorías (八大詞類): N, V, Adv, Conj, Prep, M, Ptc, Det
 * - Subclasificación Verbal (動詞分類): V, Vi, V-sep, Vs, Vst, Vs-attr, Vs-pred, Vs-sep, Vaux, Vp, Vpt, Vp-sep
 * - Modelo Canónico de Slots (SVO Chino):
 *   [Tópico/Sujeto] → [Tiempo] → [Compañía/Ámbito (跟/給)] → [Lugar (在)] → [Modal/Neg] → [Verbo/Estado] → [Objeto] → [Partícula Final]
 * =====================================================
 */

const SyntaxEngine = (() => {

    // Mapa auxiliar de caracteres conocidos para enriquecer tokens anónimos o divididos
    const CHAR_FALLBACK_METADATA = {
        '在': { categoria: 'Prep', posSymbol: 'Prep', semanticTags: ['prepPlace', 'locativeVerb'], pinyin: 'zài', espanol: 'En / Estar en', english: 'At / In' },
        '跟': { categoria: 'Prep', posSymbol: 'Prep', semanticTags: ['prepCompany', 'nounLinker'], pinyin: 'gēn', espanol: 'Con', english: 'With' },
        '給': { categoria: 'Prep', posSymbol: 'Prep', semanticTags: ['prepRecipient', 'action'], pinyin: 'gěi', espanol: 'A / Para', english: 'To / For' },
        '從': { categoria: 'Prep', posSymbol: 'Prep', semanticTags: ['prepSource', 'prepTime'], pinyin: 'cóng', espanol: 'Desde', english: 'From' },
        '對': { categoria: 'Prep', posSymbol: 'Prep', semanticTags: ['prepTarget'], pinyin: 'duì', espanol: 'Hacia / Para', english: 'To / Towards' },
        '幫': { categoria: 'Prep', posSymbol: 'Prep', semanticTags: ['prepBeneficiary', 'action'], pinyin: 'bāng', espanol: 'Ayudar / Para', english: 'For / Help' },
        '不': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['negation'], pinyin: 'bù', espanol: 'No', english: 'Not' },
        '沒': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['negation', 'pastNegation'], pinyin: 'méi', espanol: 'No (pasado/tener)', english: 'Did not / Have not' },
        '很': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['degree'], pinyin: 'hěn', espanol: 'Muy', english: 'Very' },
        '也': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['scope', 'additive'], pinyin: 'yě', espanol: 'También', english: 'Also' },
        '都': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['scope', 'all'], pinyin: 'dōu', espanol: 'Todos / Ambos', english: 'All / Both' },
        '常': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['frequency'], pinyin: 'cháng', espanol: 'A menudo', english: 'Often' },
        '再': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['frequency', 'repetition'], pinyin: 'zài', espanol: 'De nuevo', english: 'Again' },
        '真': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['degree'], pinyin: 'zhēn', espanol: 'Realmente', english: 'Really' },
        '最': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['degree', 'superlative'], pinyin: 'zuì', espanol: 'El más', english: 'Most' },
        '的': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['structural', 'attributiveDe'], pinyin: 'de', espanol: '(Posesivo / Modificador)', english: '(Possessive / Modifier)' },
        '得': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['structural', 'complementDe'], pinyin: 'de', espanol: '(Complemento de grado)', english: '(Degree complement)' },
        '了': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['aspect', 'finalModal'], pinyin: 'le', espanol: '(Aspecto completado)', english: '(Completed aspect)' },
        '過': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['aspect', 'experiential'], pinyin: 'guò', espanol: '(Experiencia pasada)', english: '(Experiential aspect)' },
        '嗎': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['finalModal', 'question'], pinyin: 'ma', espanol: '(Pregunta Sí/No)', english: '(Yes/No question)' },
        '呢': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['finalModal', 'question'], pinyin: 'ne', espanol: '(¿Y...?)', english: '(And what about...?)' },
        '吧': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['finalModal', 'suggestion'], pinyin: 'ba', espanol: '(Sugerencia)', english: '(Suggestion)' },
        '啊': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['finalModal', 'emphasis'], pinyin: 'a', espanol: '(Énfasis)', english: '(Emphasis)' },
        '們': { categoria: 'Ptc', posSymbol: 'Ptc', semanticTags: ['pluralSuffix'], pinyin: 'men', espanol: '(Plural)', english: '(Plural)' },
        '這': { categoria: 'Det', posSymbol: 'Det', semanticTags: ['demonstrative'], pinyin: 'zhè', espanol: 'Este', english: 'This' },
        '那': { categoria: 'Det', posSymbol: 'Det', semanticTags: ['demonstrative'], pinyin: 'nà', espanol: 'Ese / Aquel', english: 'That' },
        '哪': { categoria: 'Det', posSymbol: 'Det', semanticTags: ['demonstrative', 'question'], pinyin: 'nǎ', espanol: 'Cuál', english: 'Which' },
        '幾': { categoria: 'Det', posSymbol: 'Det', semanticTags: ['numeral', 'question'], pinyin: 'jǐ', espanol: 'Cuántos', english: 'How many' },
        '個': { categoria: 'M', posSymbol: 'M', semanticTags: ['measure'], pinyin: 'ge', espanol: 'Clasificador general', english: 'General measure word' },
        '是': { categoria: 'V', posSymbol: 'Vst', verbSubtype: 'Vst', semanticTags: ['state', 'transitiveState', 'copula'], pinyin: 'shì', espanol: 'Ser', english: 'To be' },
        '有': { categoria: 'V', posSymbol: 'V', verbSubtype: 'V', semanticTags: ['action', 'possession', 'existential'], pinyin: 'yǒu', espanol: 'Tener / Haber', english: 'To have / There is' }
    };

    /**
     * Normaliza cualquier objeto palabra o token DOM a un Token sintáctico enriquecido.
     * @param {object} raw
     * @param {number} index
     * @returns {object}
     */
    const normalizeToken = (raw, index = 0) => {
        if (!raw) return null;
        // Buscar en la base de datos por ID o tradicional si le faltan metadatos
        let dbWord = null;
        if (typeof getWordById === 'function' && raw.id && !String(raw.id).startsWith('anon_') && !String(raw.id).startsWith('sep_')) {
            dbWord = getWordById(raw.id);
        }
        if (!dbWord && typeof getAllWords === 'function' && raw.tradicional) {
            const all = getAllWords();
            dbWord = all.find(w => w.tradicional === raw.tradicional);
        }

        const merged = Object.assign({}, CHAR_FALLBACK_METADATA[raw.tradicional] || {}, dbWord || {}, raw);
        const catId = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.normalizeCategoryId)
            ? APP_CONFIG.normalizeCategoryId(merged.categoria)
            : (merged.categoria || 'N');

        const verbSubtype = merged.verbSubtype || (catId === 'V' ? (merged.posSymbol && merged.posSymbol !== 'V' ? merged.posSymbol : 'V') : null);
        const posSymbol = merged.posSymbol || verbSubtype || catId;
        const semanticTags = Array.isArray(merged.semanticTags) ? [...merged.semanticTags] : [];

        // Inferir etiquetas semánticas adicionales si no están explícitas
        const hz = (merged.tradicional || '').trim();
        if (catId === 'N') {
            if (['今天', '明天', '昨天', '前天', '後天', '現在', '早上', '上午', '中午', '下午', '晚上', '半夜', '週末', '今年', '明年', '去年', '時間', '時候', '點', '分', '禮拜', '星期', '月', '年', '天', '什麼時候', '幾點'].some(t => hz.includes(t)) && !semanticTags.includes('time')) {
                semanticTags.push('time');
            }
            if (['學校', '家', '教室', '餐廳', '店', '台灣', '臺灣', '中國', '美國', '日本', '越南', '房子', '哪裡', '那裡', '這裡', '山上', '山', '海', '前面', '後面', '外面', '裡面', '旁邊', '附近', '樓下', '樓', '大樓', '地方', '花蓮', '商店', '宿舍', '圖書館', '游泳池'].includes(hz) && !semanticTags.includes('place')) {
                semanticTags.push('place');
            }
            if (['我', '你', '他', '她', '我們', '你們', '他們', '您', '妳', '誰', '自己'].includes(hz) && !semanticTags.includes('pronoun')) {
                semanticTags.push('pronoun', 'person');
            }
        }
        if (catId === 'Det' && ['一', '二', '兩', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '萬', '半', '幾', '多少'].includes(hz) && !semanticTags.includes('numeral')) {
            semanticTags.push('numeral');
        }
        if (catId === 'Det' && ['這', '那', '哪', '這些', '那些'].includes(hz) && !semanticTags.includes('demonstrative')) {
            semanticTags.push('demonstrative');
        }

        return {
            instanceId: raw.instanceId || (`tok_${index}_${raw.id || hz}`),
            id: merged.id || `anon_${hz}`,
            index,
            tradicional: hz,
            pinyin: merged.pinyin || '',
            zhuyin: merged.zhuyin || '',
            espanol: merged.espanol || '',
            english: merged.english || '',
            categoria: catId,
            posSymbol,
            verbSubtype,
            sepParts: merged.sepParts || null,
            isSplitVerbHead: !!raw.isSplitVerbHead,
            isSplitVerbObject: !!raw.isSplitVerbObject,
            parentSepWord: raw.parentSepWord || null,
            clasificador: merged.clasificador || '',
            semanticTags
        };
    };

    // Helpers de predicado sobre un token
    const isPOS = (tok, pos) => tok && tok.categoria === pos;
    const hasTag = (tok, tag) => tok && Array.isArray(tok.semanticTags) && tok.semanticTags.includes(tag);
    const isStateVerb = (tok) => tok && tok.categoria === 'V' && ['Vs', 'Vst', 'Vs-pred', 'Vs-attr', 'Vs-sep'].includes(tok.verbSubtype);
    const isActionOrProcessVerb = (tok) => tok && tok.categoria === 'V' && ['V', 'Vi', 'V-sep', 'Vp', 'Vpt', 'Vp-sep'].includes(tok.verbSubtype || 'V');
    const isAuxVerb = (tok) => tok && tok.categoria === 'V' && tok.verbSubtype === 'Vaux';
    const isSeparableVerb = (tok) => tok && tok.categoria === 'V' && ['V-sep', 'Vs-sep', 'Vp-sep'].includes(tok.verbSubtype);
    const isTimeToken = (tok) => tok && (hasTag(tok, 'time') || hasTag(tok, 'timeMeasure') || ['點', '分', '刻', '號', '日'].includes(tok.tradicional));
    const isPlaceToken = (tok) => tok && hasTag(tok, 'place');
    const isPersonOrPronoun = (tok) => tok && (hasTag(tok, 'person') || hasTag(tok, 'pronoun'));

    /**
     * Etiquetas bilingües de las Cápsulas Sintácticas (Moléculas).
     */
    const CAPSULE_META = {
        TIME_FRAME: {
            type: 'TIME_FRAME',
            canonicalSlot: 'TIME',
            slotOrder: 2,
            color: '#6366F1',
            bgSoft: 'rgba(99, 102, 241, 0.09)',
            borderColor: 'rgba(99, 102, 241, 0.42)',
            labels: { es: 'CUÁNDO · MARCO TEMPORAL', en: 'WHEN · TIME FRAME' },
            formulaTag: '[Tiempo]'
        },
        LOCATION: {
            type: 'LOCATION',
            canonicalSlot: 'PLACE',
            slotOrder: 4,
            color: '#3B6998',
            bgSoft: 'rgba(59, 105, 152, 0.10)',
            borderColor: 'rgba(59, 105, 152, 0.45)',
            labels: { es: 'DÓNDE · LUGAR (Prep+N)', en: 'WHERE · LOCATION (Prep+N)' },
            formulaTag: '[Prep(在) + Lugar]'
        },
        COMPANY_SCOPE: {
            type: 'COMPANY_SCOPE',
            canonicalSlot: 'COMPANY',
            slotOrder: 3,
            color: '#0E7490',
            bgSoft: 'rgba(14, 116, 144, 0.09)',
            borderColor: 'rgba(14, 116, 144, 0.42)',
            labels: { es: 'CON / A QUIÉN · ÁMBITO', en: 'WITH / TO WHOM · SCOPE' },
            formulaTag: '[Prep + N]'
        },
        NOUN_PHRASE: {
            type: 'NOUN_PHRASE',
            canonicalSlot: 'NOUN_PHRASE', // Resuelto contextualmente a TOPIC_SUBJ (1) u OBJECT (7)
            slotOrder: 1,
            color: '#8D5B4C',
            bgSoft: 'rgba(141, 91, 76, 0.09)',
            borderColor: 'rgba(141, 91, 76, 0.42)',
            labels: { es: 'SINTAGMA NOMINAL', en: 'NOUN PHRASE' },
            formulaTag: '[Det + M + N]'
        },
        VERBAL_COMPLEX: {
            type: 'VERBAL_COMPLEX',
            canonicalSlot: 'VERB_STATE',
            slotOrder: 6,
            color: '#D4760A',
            bgSoft: 'rgba(212, 118, 10, 0.10)',
            borderColor: 'rgba(212, 118, 10, 0.45)',
            labels: { es: 'ACCIÓN · COMPLEJO VERBAL', en: 'ACTION · VERBAL COMPLEX' },
            formulaTag: '[Aux/Adv + V]'
        },
        ASPECTUAL_STATE: {
            type: 'ASPECTUAL_STATE',
            canonicalSlot: 'VERB_STATE',
            slotOrder: 6,
            color: '#C2410C',
            bgSoft: 'rgba(194, 65, 12, 0.09)',
            borderColor: 'rgba(194, 65, 12, 0.42)',
            labels: { es: 'ACCIÓN · ESTADO ASPECTUAL', en: 'ACTION · ASPECTUAL STATE' },
            formulaTag: '[V + Ptc]'
        },
        STATE_DEGREE: {
            type: 'STATE_DEGREE',
            canonicalSlot: 'VERB_STATE',
            slotOrder: 6,
            color: '#1E8C5E',
            bgSoft: 'rgba(30, 140, 94, 0.09)',
            borderColor: 'rgba(30, 140, 94, 0.42)',
            labels: { es: 'ESTADO · GRADO (Adv+Vs)', en: 'STATE · DEGREE (Adv+Vs)' },
            formulaTag: '[Adv + Vs]'
        },
        SEPARABLE_EXPANDED: {
            type: 'SEPARABLE_EXPANDED',
            canonicalSlot: 'VERB_STATE',
            slotOrder: 6,
            color: '#9A3412',
            bgSoft: 'rgba(154, 52, 18, 0.09)',
            borderColor: 'rgba(154, 52, 18, 0.45)',
            labels: { es: 'V-sep · VERBO SEPARABLE', en: 'V-sep · SEPARABLE VERB' },
            formulaTag: '[V-sep expandido]'
        }
    };

    /**
     * Reductor de Fusión Inmediata (`detectSyntagmas(tokens)`):
     * Agrupa tokens contiguos válidos en Cápsulas Sintácticas (Moléculas).
     * @param {Array<object>} rawTokens
     * @param {string} [lang='es']
     * @returns {Array<object>} Lista de Syntagmas (cápsulas de >=2 tokens o átomos individuales)
     */
    const detectSyntagmas = (rawTokens, lang = 'es') => {
        const tokens = (rawTokens || []).map((t, idx) => normalizeToken(t, idx)).filter(Boolean);
        const syntagmas = [];
        let i = 0;

        const makeCapsule = (metaKey, slice, customSubformula = null, customLabel = null) => {
            const meta = CAPSULE_META[metaKey];
            const label = customLabel || (meta.labels[lang] || meta.labels.es);
            return {
                id: `cap_${metaKey}_${slice[0].index}_${slice[slice.length - 1].index}`,
                isCapsule: true,
                type: metaKey,
                canonicalSlot: meta.canonicalSlot,
                slotOrder: meta.slotOrder,
                color: meta.color,
                bgSoft: meta.bgSoft,
                borderColor: meta.borderColor,
                label,
                formulaTag: customSubformula || meta.formulaTag,
                tokens: slice,
                startIndex: slice[0].index,
                endIndex: slice[slice.length - 1].index,
                text: slice.map(t => t.tradicional).join(''),
                pinyin: slice.map(t => t.pinyin).join(' ')
            };
        };

        const makeAtom = (tok) => {
            const slotInfo = inferAtomicSlot(tok);
            return {
                id: `atom_${tok.index}_${tok.id}`,
                isCapsule: false,
                type: 'ATOM',
                canonicalSlot: slotInfo.slot,
                slotOrder: slotInfo.order,
                color: slotInfo.color,
                label: slotInfo.label[lang] || slotInfo.label.es,
                formulaTag: tok.posSymbol || tok.categoria,
                tokens: [tok],
                startIndex: tok.index,
                endIndex: tok.index,
                text: tok.tradicional,
                pinyin: tok.pinyin
            };
        };

        while (i < tokens.length) {
            const t0 = tokens[i];
            const t1 = tokens[i + 1];
            const t2 = tokens[i + 2];
            const t3 = tokens[i + 3];

            // ---------------------------------------------------------
            // 1. Prep(在/從) + Lugar / Tiempo -> Capsule[LOCATION] o Capsule[TIME_FRAME]
            // ---------------------------------------------------------
            if (isPOS(t0, 'Prep') && (t0.tradicional === '在' || t0.tradicional === '從') && t1) {
                // Caso: 從 + Tiempo
                if (t0.tradicional === '從' && isTimeToken(t1)) {
                    let end = i + 2;
                    while (end < tokens.length && isTimeToken(tokens[end])) end++;
                    syntagmas.push(makeCapsule('TIME_FRAME', tokens.slice(i, end), '[Prep(從) + Tiempo]'));
                    i = end;
                    continue;
                }
                // Caso: 在 + Pron/N + 的 + Lugar (ej. 在 + 我 + 的 + 學校)
                if (isPOS(t1, 'N') && t2 && t2.tradicional === '的' && t3 && isPOS(t3, 'N')) {
                    syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, i + 4), '[Prep(在) + N + 的 + Lugar]'));
                    i += 4;
                    continue;
                }
                // Caso: 在 + Pron + 家/學校 (ej. 在 + 我 + 家)
                if (hasTag(t1, 'pronoun') && t2 && isPlaceToken(t2)) {
                    syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, i + 3), '[Prep(在) + Pron + Lugar]'));
                    i += 3;
                    continue;
                }
                // Caso: 在 + Det + M + N (ej. 在 + 這 + 家 + 餐廳)
                if (isPOS(t1, 'Det') && t2 && isPOS(t2, 'M') && t3 && isPOS(t3, 'N')) {
                    syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, i + 4), '[Prep(在) + Det + M + Lugar]'));
                    i += 4;
                    continue;
                }
                // Caso directo: 在 + Lugar (ej. 在 + 學校, 在 + 台灣, 在 + 家, 在 + 哪裡)
                if (isPlaceToken(t1) || isPOS(t1, 'N')) {
                    syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, i + 2), '[Prep(在) + Lugar]'));
                    i += 2;
                    continue;
                }
            }

            // ---------------------------------------------------------
            // 2. Prep(跟/給/對/幫) + Persona/Sustantivo [+ 一起] -> Capsule[COMPANY_SCOPE]
            // ---------------------------------------------------------
            if (isPOS(t0, 'Prep') && ['跟', '給', '對', '幫'].includes(t0.tradicional) && t1) {
                // Caso: 跟 + 我 + 的 + 朋友 [+ 一起]
                if (isPOS(t1, 'N') && t2 && t2.tradicional === '的' && t3 && isPOS(t3, 'N')) {
                    let end = i + 4;
                    if (tokens[end] && tokens[end].tradicional === '一起') end++;
                    syntagmas.push(makeCapsule('COMPANY_SCOPE', tokens.slice(i, end), `[Prep(${t0.tradicional}) + N]`));
                    i = end;
                    continue;
                }
                // Caso: 跟 + 朋友 [+ 一起]
                if (isPOS(t1, 'N') || isPersonOrPronoun(t1)) {
                    let end = i + 2;
                    if (tokens[end] && tokens[end].tradicional === '一起') end++;
                    syntagmas.push(makeCapsule('COMPANY_SCOPE', tokens.slice(i, end), `[Prep(${t0.tradicional}) + N]`));
                    i = end;
                    continue;
                }
            }

            // ---------------------------------------------------------
            // 3. Marco Temporal: Num + 點 [+ Num + 分 / 半] o N[time] + N[time] (ej. 今天 + 早上, 八 + 點 + 半)
            // ---------------------------------------------------------
            if ((hasTag(t0, 'numeral') || t0.tradicional === '幾') && t1 && ['點', '分', '號', '日'].includes(t1.tradicional)) {
                let end = i + 2;
                while (end < tokens.length && (isTimeToken(tokens[end]) || hasTag(tokens[end], 'numeral') || tokens[end].tradicional === '半')) {
                    end++;
                }
                syntagmas.push(makeCapsule('TIME_FRAME', tokens.slice(i, end), '[Hora / Fecha]'));
                i = end;
                continue;
            }
            if (isTimeToken(t0) && t1 && isTimeToken(t1)) {
                let end = i + 2;
                while (end < tokens.length && isTimeToken(tokens[end])) end++;
                syntagmas.push(makeCapsule('TIME_FRAME', tokens.slice(i, end), '[Marco Temporal]'));
                i = end;
                continue;
            }
            // Det(這/那) + M(個) + N[time] (ej. 這 + 個 + 週末 / 禮拜 / 月)
            if (isPOS(t0, 'Det') && t1 && isPOS(t1, 'M') && t2 && isTimeToken(t2)) {
                let end = i + 3;
                while (end < tokens.length && isTimeToken(tokens[end])) end++;
                syntagmas.push(makeCapsule('TIME_FRAME', tokens.slice(i, end), '[Det + M + Tiempo]'));
                i = end;
                continue;
            }

            // ---------------------------------------------------------
            // 4. Verbo Separable Expandido: V-head + [Ptc/Det/M] + V-obj (ej. 唱 + 了 + 歌)
            // ---------------------------------------------------------
            if (t0.isSplitVerbHead && t1) {
                let objIdx = -1;
                for (let k = i + 1; k <= Math.min(tokens.length - 1, i + 4); k++) {
                    if (tokens[k].isSplitVerbObject && tokens[k].parentSepWord === t0.parentSepWord) {
                        objIdx = k;
                        break;
                    }
                }
                if (objIdx !== -1) {
                    syntagmas.push(makeCapsule('SEPARABLE_EXPANDED', tokens.slice(i, objIdx + 1), '[V + Compl. + Obj interno]'));
                    i = objIdx + 1;
                    continue;
                }
            }

            // ---------------------------------------------------------
            // 5. Sintagma Nominal: Det/Num + M + [Vs] + N (ej. 這 + 個 + 人, 兩 + 杯 + 茶)
            // ---------------------------------------------------------
            if (isPOS(t0, 'Det') && t1 && isPOS(t1, 'M')) {
                // Det + M + N
                if (t2 && isPOS(t2, 'N') && !isTimeToken(t2)) {
                    syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 3), '[Det + M + N]'));
                    i += 3;
                    continue;
                }
                // Det + M + Vs + (的) + N
                if (t2 && isStateVerb(t2) && t3 && isPOS(t3, 'N')) {
                    syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 4), '[Det + M + Vs + N]'));
                    i += 4;
                    continue;
                }
                // Det + M (cuantificador pronominal: 這一個, 兩杯)
                syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 2), '[Det + M]'));
                i += 2;
                continue;
            }

            // 5b. Pronombre pluralizado: 我/你/他 + 們
            if (hasTag(t0, 'pronoun') && t1 && t1.tradicional === '們') {
                if (t2 && t2.tradicional === '的' && t3 && isPOS(t3, 'N')) {
                    syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 4), '[Pron + 們 + 的 + N]'));
                    i += 4;
                    continue;
                }
                syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 2), '[Pron + 們]'));
                i += 2;
                continue;
            }

            // 5c. Modificador posesivo o atributivo con 的: (N/Pron/Vs) + 的 + N (ej. 我 + 的 + 書, 漂亮 + 的 + 衣服)
            if ((isPOS(t0, 'N') || isStateVerb(t0)) && t1 && t1.tradicional === '的' && t2 && isPOS(t2, 'N')) {
                syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 3), `[${t0.posSymbol} + 的 + N]`));
                i += 3;
                continue;
            }

            // 5d. Coordinación nominal con 和/跟: N + 和 + N (ej. 爸爸 + 和 + 媽媽, 茶 + 和 + 咖啡)
            if (isPOS(t0, 'N') && t1 && t1.tradicional === '和' && t2 && isPOS(t2, 'N')) {
                syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 3), '[N + 和 + N]'));
                i += 3;
                continue;
            }

            // ---------------------------------------------------------
            // 6. Estado Graduado: Adv(很/不/非常/真/最/也/都/太) + [Adv] + Vs/Vst (ej. 很 + 好, 非常 + 漂亮, 也 + 很 + 喜歡)
            // ---------------------------------------------------------
            if (isPOS(t0, 'Adv') && t1) {
                // Caso: Adv + Adv + Vs/Vst (ej. 也 + 很 + 好, 都 + 很 + 貴, 不 + 太 + 好)
                if (isPOS(t1, 'Adv') && t2 && isStateVerb(t2)) {
                    let end = i + 3;
                    if (tokens[end] && tokens[end].tradicional === '了') end++;
                    syntagmas.push(makeCapsule('STATE_DEGREE', tokens.slice(i, end), '[Adv + Adv + Vs]'));
                    i = end;
                    continue;
                }
                // Caso: Adv + Vs/Vst (ej. 很 + 漂亮, 不 + 貴, 非常 + 喜歡)
                if (isStateVerb(t1)) {
                    let end = i + 2;
                    if (tokens[end] && tokens[end].tradicional === '了') end++;
                    syntagmas.push(makeCapsule('STATE_DEGREE', tokens.slice(i, end), `[Adv(${t0.tradicional}) + ${t1.posSymbol}]`));
                    i = end;
                    continue;
                }
            }

            // ---------------------------------------------------------
            // 7. Complejo Verbal (Modal / Negación / Adverbio + Verbo):
            //    [Adv(不/沒/也/都/常)] + Vaux(想/要/能/可以/會) + V
            //    o Vaux + V (ej. 想 + 喝, 可以 + 去, 會 + 說)
            //    o Adv + V (ej. 不 + 吃, 常 + 看, 一起 + 去)
            // ---------------------------------------------------------
            if (isPOS(t0, 'Adv') && t1 && isAuxVerb(t1) && t2 && (isActionOrProcessVerb(t2) || isStateVerb(t2))) {
                let end = i + 3;
                if (tokens[end] && isPOS(tokens[end], 'Ptc') && hasTag(tokens[end], 'aspect')) end++;
                syntagmas.push(makeCapsule('VERBAL_COMPLEX', tokens.slice(i, end), `[Adv + Vaux(${t1.tradicional}) + V]`));
                i = end;
                continue;
            }

            if (isAuxVerb(t0) && t1) {
                // Vaux + Adv(不) + V o Vaux + V
                if (isPOS(t1, 'Adv') && t2 && isActionOrProcessVerb(t2)) {
                    syntagmas.push(makeCapsule('VERBAL_COMPLEX', tokens.slice(i, i + 3), `[Vaux(${t0.tradicional}) + Adv + V]`));
                    i += 3;
                    continue;
                }
                if (isActionOrProcessVerb(t1) || isStateVerb(t1)) {
                    let end = i + 2;
                    if (tokens[end] && isPOS(tokens[end], 'Ptc') && hasTag(tokens[end], 'aspect')) end++;
                    syntagmas.push(makeCapsule('VERBAL_COMPLEX', tokens.slice(i, end), `[Vaux(${t0.tradicional}) + ${t1.posSymbol}]`));
                    i = end;
                    continue;
                }
            }

            if (isPOS(t0, 'Adv') && t1 && !hasTag(t0, 'questionAdv')) {
                if (isPOS(t1, 'Adv') && t2 && isActionOrProcessVerb(t2)) {
                    let end = i + 3;
                    if (tokens[end] && isPOS(tokens[end], 'Ptc') && hasTag(tokens[end], 'aspect')) end++;
                    syntagmas.push(makeCapsule('VERBAL_COMPLEX', tokens.slice(i, end), '[Adv + Adv + V]'));
                    i = end;
                    continue;
                }
                if (isActionOrProcessVerb(t1)) {
                    let end = i + 2;
                    if (tokens[end] && isPOS(tokens[end], 'Ptc') && hasTag(tokens[end], 'aspect')) end++;
                    syntagmas.push(makeCapsule('VERBAL_COMPLEX', tokens.slice(i, end), `[Adv(${t0.tradicional}) + ${t1.posSymbol}]`));
                    i = end;
                    continue;
                }
            }

            // ---------------------------------------------------------
            // 8. Estado Aspectual o Complemento de Grado:
            //    V + Ptc(了/過) (ej. 吃 + 了, 去 + 過)
            //    V + Ptc(得) + [Adv(很)] + Vs (ej. 說 + 得 + 很 + 好)
            // ---------------------------------------------------------
            if (isActionOrProcessVerb(t0) && t1 && isPOS(t1, 'Ptc')) {
                if (t1.tradicional === '得' && t2) {
                    if (isPOS(t2, 'Adv') && t3 && isStateVerb(t3)) {
                        syntagmas.push(makeCapsule('ASPECTUAL_STATE', tokens.slice(i, i + 4), '[V + 得 + Adv + Vs]'));
                        i += 4;
                        continue;
                    }
                    if (isStateVerb(t2)) {
                        syntagmas.push(makeCapsule('ASPECTUAL_STATE', tokens.slice(i, i + 3), '[V + 得 + Vs]'));
                        i += 3;
                        continue;
                    }
                }
                if (hasTag(t1, 'aspect')) {
                    syntagmas.push(makeCapsule('ASPECTUAL_STATE', tokens.slice(i, i + 2), `[V + Ptc(${t1.tradicional})]`));
                    i += 2;
                    continue;
                }
            }

            // Si no forma cápsula con sus vecinos, se emite como Átomo individual
            syntagmas.push(makeAtom(t0));
            i++;
        }

        // Segunda pasada: asignar rol contextual (SUJETO vs OBJETO) a los Sintagmas Nominales y Sustantivos
        const firstVerbIdx = syntagmas.findIndex(s =>
            s.canonicalSlot === 'VERB_STATE' ||
            (s.tokens.length === 1 && s.tokens[0].categoria === 'V') ||
            (s.tokens.length === 1 && s.tokens[0].tradicional === '在' && !syntagmas.some((other, oIdx) => oIdx > 0 && other.canonicalSlot === 'VERB_STATE'))
        );

        const SLOT_COLOR_MAP = {
            TOPIC_SUBJ: '#2E78B7',
            TIME: '#6366F1',
            COMPANY: '#0E7490',
            PLACE: '#3B6998',
            ADV_MODAL: '#0D9488',
            VERB_STATE: '#D4760A',
            OBJECT: '#8D5B4C',
            FINAL_PTC: '#7D54B5'
        };

        syntagmas.forEach((syn, idx) => {
            if (syn.canonicalSlot === 'NOUN_PHRASE') {
                if (firstVerbIdx === -1 || idx < firstVerbIdx) {
                    syn.canonicalSlot = 'TOPIC_SUBJ';
                    syn.slotOrder = 1;
                    syn.color = SLOT_COLOR_MAP.TOPIC_SUBJ;
                    if (syn.isCapsule) {
                        syn.bgSoft = 'rgba(46, 120, 183, 0.09)';
                        syn.borderColor = 'rgba(46, 120, 183, 0.42)';
                        syn.label = lang === 'en' ? 'SUBJECT / TOPIC · NP' : 'SUJETO / TÓPICO · SN';
                    }
                } else {
                    syn.canonicalSlot = 'OBJECT';
                    syn.slotOrder = 7;
                    syn.color = SLOT_COLOR_MAP.OBJECT;
                    if (syn.isCapsule) {
                        syn.bgSoft = 'rgba(141, 91, 76, 0.09)';
                        syn.borderColor = 'rgba(141, 91, 76, 0.42)';
                        syn.label = lang === 'en' ? 'WHAT / OBJECT · NP' : 'QUÉ / OBJETO · SN';
                    }
                }
            }

            const defaultSlotColor = SLOT_COLOR_MAP[syn.canonicalSlot] || syn.color || '#2E78B7';
            syn.color = defaultSlotColor;
            (syn.tokens || []).forEach(tok => {
                if (syn.canonicalSlot === 'VERB_STATE' && (isPOS(tok, 'Adv') || isAuxVerb(tok))) {
                    tok.roleSlot = 'ADV_MODAL';
                    tok.roleColor = SLOT_COLOR_MAP.ADV_MODAL;
                } else {
                    tok.roleSlot = syn.canonicalSlot;
                    tok.roleColor = defaultSlotColor;
                }
            });
        });

        return syntagmas;
    };

    /**
     * Infiere el Slot Canónico SVO de un token atómico individual.
     */
    const inferAtomicSlot = (tok) => {
        if (!tok) {
            return { slot: 'TOPIC_SUBJ', order: 1, color: '#2E78B7', label: { es: 'TÓPICO', en: 'TOPIC' } };
        }
        if (isTimeToken(tok)) {
            return { slot: 'TIME', order: 2, color: '#6366F1', label: { es: 'CUÁNDO', en: 'WHEN' } };
        }
        if (isPOS(tok, 'Prep')) {
            if (tok.tradicional === '在') {
                return { slot: 'PLACE', order: 4, color: '#3B6998', label: { es: 'DÓNDE (在)', en: 'WHERE (在)' } };
            }
            return { slot: 'COMPANY', order: 3, color: '#0E7490', label: { es: 'PREPOSICIÓN', en: 'PREPOSITION' } };
        }
        if (isPOS(tok, 'Adv') || isAuxVerb(tok)) {
            return { slot: 'ADV_MODAL', order: 5, color: '#0D9488', label: { es: 'MODAL / ADV', en: 'MODAL / ADV' } };
        }
        if (isPOS(tok, 'V')) {
            if (isStateVerb(tok)) {
                return { slot: 'VERB_STATE', order: 6, color: '#C9971A', label: { es: `ESTADO (${tok.posSymbol})`, en: `STATE (${tok.posSymbol})` } };
            }
            return { slot: 'VERB_STATE', order: 6, color: '#D4760A', label: { es: `ACCIÓN (${tok.posSymbol})`, en: `ACTION (${tok.posSymbol})` } };
        }
        if (isPOS(tok, 'Ptc') && hasTag(tok, 'finalModal')) {
            return { slot: 'FINAL_PTC', order: 8, color: '#7D54B5', label: { es: 'PARTÍCULA FINAL', en: 'FINAL PARTICLE' } };
        }
        if (isPOS(tok, 'Det') || isPOS(tok, 'M')) {
            return { slot: 'NOUN_PHRASE', order: 1, color: '#B45309', label: { es: tok.posSymbol, en: tok.posSymbol } };
        }
        return { slot: 'NOUN_PHRASE', order: 1, color: '#2E78B7', label: { es: 'NOMINAL', en: 'NOMINAL' } };
    };

    /**
     * Valida el orden de Slots SVO Chino y reglas gramaticales de 詞類表 (Latencia 0 ms).
     * Devuelve diagnósticos heurísticos (Nivel 2) y acciones de auto-corrección magnética.
     * @param {Array<object>} syntagmas
     * @param {Array<object>} rawTokens
     * @param {string} [lang='es']
     * @returns {{ isValid: boolean, activeSlots: Array<string>, issues: Array<object> }}
     */
    const validateSlotOrder = (syntagmas, rawTokens, lang = 'es') => {
        const tokens = (rawTokens || []).map((t, idx) => normalizeToken(t, idx)).filter(Boolean);
        const issues = [];
        const activeSlotSet = new Set();
        syntagmas.forEach(s => {
            if (s.canonicalSlot) activeSlotSet.add(s.canonicalSlot);
            (s.tokens || []).forEach(t => { if (t.roleSlot) activeSlotSet.add(t.roleSlot); });
        });
        const activeSlots = Array.from(activeSlotSet);
        const isEn = lang === 'en';

        if (tokens.length === 0) {
            return { isValid: true, activeSlots: [], issues: [] };
        }

        // Localizar el verbo principal o predicado de estado
        const verbSynIdx = syntagmas.findIndex(s =>
            s.canonicalSlot === 'VERB_STATE' &&
            !s.tokens.every(t => isAuxVerb(t))
        );
        const mainVerbSyn = verbSynIdx !== -1 ? syntagmas[verbSynIdx] : null;
        const firstMainVerbTokenIdx = mainVerbSyn ? mainVerbSyn.startIndex : -1;

        // Localizar el primer bloque pre-verbal (Adv/Vaux/Prep/Verb) para insertar escenarios antes de él
        const preVerbalAnchorSynIdx = syntagmas.findIndex(s =>
            ['COMPANY', 'PLACE', 'ADV_MODAL', 'VERB_STATE'].includes(s.canonicalSlot)
        );
        const preVerbalTokenIdx = preVerbalAnchorSynIdx !== -1 ? syntagmas[preVerbalAnchorSynIdx].startIndex : 0;

        // -----------------------------------------------------------------
        // REGLA 1: Lugar (`在 + N`) colocado DESPUÉS del verbo principal
        // (Excepción: verbos locativos/direccionales como 坐, 住, 到, 來, 去)
        // -----------------------------------------------------------------
        syntagmas.forEach((syn, sIdx) => {
            if (syn.type === 'LOCATION' && verbSynIdx !== -1 && sIdx > verbSynIdx) {
                const mainVerbHz = mainVerbSyn.tokens.map(t => t.tradicional).join('');
                const allowsPostLocation = mainVerbSyn.tokens.some(t =>
                    hasTag(t, 'allowsPostPlace') || ['坐', '住', '放', '站', '寫', '生'].includes(t.tradicional)
                );
                if (!allowsPostLocation) {
                    issues.push({
                        code: 'PLACE_AFTER_VERB',
                        severity: 'error',
                        offendingTokenIndices: syn.tokens.map(t => t.index),
                        title: isEn ? 'Spatial Order: Location before Action' : 'Orden Espacial: El lugar va antes de la acción',
                        message: isEn
                            ? `In Chinese syntax, the setting [${syn.text}] must be established BEFORE the verb [${mainVerbHz}] (Subject + 在 + Place + Verb).`
                            : `En mandarín, el escenario de lugar «${syn.text}» se construye ANTES de la acción «${mainVerbHz}» (Sujeto + 在 + Lugar + Verbo).`,
                        fixLabel: isEn ? `🧲 Snap «${syn.text}» before «${mainVerbHz}»` : `🧲 Imantar «${syn.text}» antes de «${mainVerbHz}»`,
                        applyFix: (currentList) => moveTokenSlice(currentList, syn.startIndex, syn.endIndex, preVerbalTokenIdx)
                    });
                }
            }
        });

        // -----------------------------------------------------------------
        // REGLA 2: Marco Temporal (`[CUÁNDO]`) colocado DESPUÉS del verbo
        // (Salvo si es duración después del verbo como 分鐘 o predicado nominal con 是)
        // -----------------------------------------------------------------
        syntagmas.forEach((syn, sIdx) => {
            if (syn.canonicalSlot === 'TIME' && verbSynIdx !== -1 && sIdx > verbSynIdx) {
                const mainVerbHz = mainVerbSyn.tokens.map(t => t.tradicional).join('');
                const isCopulaOrNaming = mainVerbSyn.tokens.some(t => ['是', '有', '到', '差'].includes(t.tradicional));
                const isDuration = syn.tokens.some(t => ['分鐘', '天', '年'].includes(t.tradicional));
                if (!isCopulaOrNaming && !isDuration) {
                    issues.push({
                        code: 'TIME_AFTER_VERB',
                        severity: 'error',
                        offendingTokenIndices: syn.tokens.map(t => t.index),
                        title: isEn ? 'Temporal Order: Time Frame before Action' : 'Orden Temporal: El tiempo precede a la acción',
                        message: isEn
                            ? `Time expressions like «${syn.text}» never go at the end in Chinese. Place them right after the Subject or at the very beginning.`
                            : `En chino, el marco temporal «${syn.text}» nunca va al final tras el verbo «${mainVerbHz}». Se coloca al inicio o justo después del sujeto.`,
                        fixLabel: isEn ? `🧲 Move «${syn.text}» before «${mainVerbHz}»` : `🧲 Imantar «${syn.text}» antes de «${mainVerbHz}»`,
                        applyFix: (currentList) => moveTokenSlice(currentList, syn.startIndex, syn.endIndex, preVerbalTokenIdx)
                    });
                }
            }
        });

        // -----------------------------------------------------------------
        // REGLA 3: Compañía / Ámbito (`跟/給/對 + N`) colocado DESPUÉS del verbo
        // -----------------------------------------------------------------
        syntagmas.forEach((syn, sIdx) => {
            if (syn.canonicalSlot === 'COMPANY' && verbSynIdx !== -1 && sIdx > verbSynIdx) {
                const mainVerbHz = mainVerbSyn.tokens.map(t => t.tradicional).join('');
                issues.push({
                    code: 'COMPANY_AFTER_VERB',
                    severity: 'error',
                    offendingTokenIndices: syn.tokens.map(t => t.index),
                    title: isEn ? 'Prepositional Phrase before Verb' : 'Bloque con Preposición (介詞) antes del Verbo',
                    message: isEn
                        ? `Prepositional phrases like «${syn.text}» (with/to someone) must precede the main action «${mainVerbHz}».`
                        : `En chino, el complemento de compañía o destinatario «${syn.text}» se ubica ANTES del verbo principal «${mainVerbHz}».`,
                    fixLabel: isEn ? `🧲 Snap «${syn.text}» before «${mainVerbHz}»` : `🧲 Imantar «${syn.text}» antes de «${mainVerbHz}»`,
                    applyFix: (currentList) => moveTokenSlice(currentList, syn.startIndex, syn.endIndex, preVerbalTokenIdx)
                });
            }
        });

        // -----------------------------------------------------------------
        // REGLA 4: Error clásico `是 + Vs` (ej. 我是好 / 她是漂亮 / 咖啡是貴)
        // En chino los adjetivos son Verbos de Estado (Vs) y no usan 是, sino 很.
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            const afterNxt = tokens[k + 2];
            // Excluir la estructura enfática 是...的
            const hasFinalDe = tokens.slice(k + 2).some(t => t.tradicional === '的');
            if (cur.tradicional === '是' && isStateVerb(nxt) && !hasFinalDe && (!afterNxt || afterNxt.tradicional !== '的')) {
                issues.push({
                    code: 'COPULA_WITH_VS',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `State Verbs (Vs) do not use «是»` : `Los Verbos de Estado (Vs) no usan «是»`,
                    message: isEn
                        ? `«${nxt.tradicional}» is a State Verb (${nxt.posSymbol}: 不及物狀態動詞), so it already means "to be ${nxt.english || nxt.espanol}". Replace «是» with degree adverb «很».`
                        : `«${nxt.tradicional}» es un Verbo de Estado (${nxt.posSymbol}: 不及物狀態動詞) y ya incluye el verbo "ser/estar". En mandarín no se dice «是${nxt.tradicional}», sino «很${nxt.tradicional}».`,
                    fixLabel: isEn ? `🔄 Replace «是» with «很»` : `🔄 Reemplazar «是» por «很»`,
                    applyFix: (currentList) => {
                        const copy = [...currentList];
                        const henWord = findLibraryWordByHanzi('很') || CHAR_FALLBACK_METADATA['很'];
                        copy[k] = Object.assign({}, henWord, { id: henWord.id || 'id_mtjnbg7d_2ozn7', tradicional: '很' });
                        return copy;
                    }
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 5: Determinante o Numeral (`Det`) + Sustantivo (`N`) SIN Clasificador (`M`)
        // Ej: 這 + 人 -> 這 + 個 + 人; 三 + 書 -> 三 + 本 + 書
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            if (isPOS(cur, 'Det') && !hasTag(cur, 'hasMeasure') && !hasTag(cur, 'frequencyPhrase') && cur.tradicional !== '多少' && isPOS(nxt, 'N') && !isTimeToken(nxt) && !['國', '人'].every(ch => cur.tradicional === '哪' && nxt.tradicional === '國')) {
                const suggestedClf = resolvePreferredClassifier(nxt);
                issues.push({
                    code: 'DET_WITHOUT_MEASURE',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `Missing Measure Word (M · 量詞)` : `Falta el Clasificador (M · 量詞)`,
                    message: isEn
                        ? `Between determiner/number «${cur.tradicional}» (Det) and noun «${nxt.tradicional}» (N), Chinese requires a Measure Word (M), such as «${suggestedClf.tradicional}» (${cur.tradicional}${suggestedClf.tradicional}${nxt.tradicional}).`
                        : `Entre el determinante/numeral «${cur.tradicional}» (Det) y el sustantivo «${nxt.tradicional}» (N) es obligatorio un Clasificador (M · 量詞), como «${suggestedClf.tradicional}» (${cur.tradicional}${suggestedClf.tradicional}${nxt.tradicional}).`,
                    fixLabel: isEn
                        ? `➕ Insert classifier «${suggestedClf.tradicional}» (${suggestedClf.pinyin})`
                        : `➕ Insertar clasificador «${suggestedClf.tradicional}» (${suggestedClf.pinyin})`,
                    applyFix: (currentList) => {
                        const copy = [...currentList];
                        copy.splice(k + 1, 0, suggestedClf);
                        return copy;
                    }
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 6: Adverbio (`Adv`: 不, 沒, 也, 都, 很, 常, 一起) colocado DESPUÉS del verbo
        // -----------------------------------------------------------------
        for (let k = 1; k < tokens.length; k++) {
            const prev = tokens[k - 1];
            const cur = tokens[k];
            if (isPOS(cur, 'Adv') && isPOS(prev, 'V') && !isPOS(tokens[k + 1], 'V')) {
                issues.push({
                    code: 'ADV_AFTER_VERB',
                    severity: 'error',
                    offendingTokenIndices: [k - 1, k],
                    title: isEn ? `Adverb (Adv) must precede the Verb` : `El Adverbio (Adv · 副詞) siempre va antes del Verbo`,
                    message: isEn
                        ? `Adverb «${cur.tradicional}» cannot be placed after verb «${prev.tradicional}». In Chinese, adverbs always modify from the left: «${cur.tradicional}${prev.tradicional}».`
                        : `El adverbio «${cur.tradicional}» no puede ir después del verbo «${prev.tradicional}». En mandarín los adverbios siempre preceden a la acción o estado: «${cur.tradicional}${prev.tradicional}».`,
                    fixLabel: isEn ? `🧲 Move «${cur.tradicional}» before «${prev.tradicional}»` : `🧲 Imantar «${cur.tradicional}» antes de «${prev.tradicional}»`,
                    applyFix: (currentList) => moveTokenSlice(currentList, k, k, k - 1)
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 7: Verbo Separable (`V-sep` / `Vs-sep`: 唱歌, 上網, 游泳, 照相, 上課) seguido de objeto directo redundante
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            if (isSeparableVerb(cur) && !cur.isSplitVerbHead && isPOS(nxt, 'N') && !isTimeToken(nxt)) {
                const sepParts = cur.sepParts || [cur.tradicional[0], cur.tradicional.slice(1)];
                issues.push({
                    code: 'VSEP_WITH_EXTERNAL_OBJ',
                    severity: 'warning',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `Separable Verb (${cur.posSymbol} · 離合詞) already has an inner object` : `Verbo Separable (${cur.posSymbol} · 離合詞) con objeto interno`,
                    message: isEn
                        ? `«${cur.tradicional}» is an intransitive separable verb (${sepParts[0]} + ${sepParts[1]}) and cannot take a direct object right after it. Click ⇄ on «${cur.tradicional}» to split it or use a preposition.`
                        : `«${cur.tradicional}» es un verbo separable intransitivo (${sepParts[0]} + ${sepParts[1]}) y ya incluye su propio objeto interno («${sepParts[1]}»). Puedes dividirlo con el botón ⇄ o usar una preposición antes.`,
                    fixLabel: isEn ? `⇄ Split «${cur.tradicional}» into «${sepParts[0]} + ${sepParts[1]}»` : `⇄ Separar «${cur.tradicional}» en «${sepParts[0]} + ${sepParts[1]}»`,
                    applyFix: (currentList) => expandSeparableVerbAt(currentList, k)
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 8: Partícula Modal Final (`嗎`, `呢`, `吧`) colocada en medio de la oración
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            if (isPOS(cur, 'Ptc') && ['嗎', '呢', '吧'].includes(cur.tradicional)) {
                issues.push({
                    code: 'FINAL_PTC_MISPLACED',
                    severity: 'error',
                    offendingTokenIndices: [k],
                    title: isEn ? `Sentence-final Particle (Ptc) must go at the end` : `La partícula modal «${cur.tradicional}» va al final de la oración`,
                    message: isEn
                        ? `Modal particle «${cur.tradicional}» transforms the whole sentence and must be placed at the very end.`
                        : `La partícula modal «${cur.tradicional}» afecta a toda la oración y debe colocarse en el último slot al final.`,
                    fixLabel: isEn ? `🧲 Move «${cur.tradicional}» to the end` : `🧲 Imantar «${cur.tradicional}» al final`,
                    applyFix: (currentList) => moveTokenSlice(currentList, k, k, currentList.length)
                });
            }
        }

        const hasErrors = issues.some(iss => iss.severity === 'error');
        return {
            isValid: !hasErrors,
            activeSlots,
            issues
        };
    };

    /**
     * Proyecta los Slots Fantasma (Ghost Slots) recomendados para una ficha que el usuario está arrastrando o seleccionando.
     * @param {object} draggedWord
     * @param {Array<object>} currentRawTokens
     * @param {string} [lang='es']
     * @returns {Array<{ targetTokenIndex: number, slotId: string, label: string, color: string, reason: string }>}
     */
    const computeGhostSlots = (draggedWord, currentRawTokens, lang = 'es') => {
        if (!draggedWord) return [];
        const tok = normalizeToken(draggedWord, -1);
        const tokens = (currentRawTokens || []).map((t, idx) => normalizeToken(t, idx)).filter(Boolean);
        const syntagmas = detectSyntagmas(tokens, lang);
        const isEn = lang === 'en';
        const ghosts = [];

        const firstVerbSyn = syntagmas.find(s => s.canonicalSlot === 'VERB_STATE');
        const firstVerbTokenIdx = firstVerbSyn ? firstVerbSyn.startIndex : tokens.length;
        const firstSubjSyn = syntagmas.find(s => s.canonicalSlot === 'TOPIC_SUBJ');
        const afterSubjTokenIdx = firstSubjSyn ? firstSubjSyn.endIndex + 1 : 0;

        // 1. Tiempo (CUÁNDO): después del sujeto o al inicio (antes del verbo)
        if (isTimeToken(tok)) {
            ghosts.push({
                targetTokenIndex: afterSubjTokenIdx,
                slotId: 'TIME',
                label: isEn ? '+ WHEN (Before Action)' : '+ CUÁNDO (Antes del Verbo)',
                color: '#6366F1'
            });
            if (afterSubjTokenIdx > 0) {
                ghosts.push({
                    targetTokenIndex: 0,
                    slotId: 'TIME',
                    label: isEn ? '+ TOPIC TIME (Start)' : '+ TÓPICO TEMPORAL (Inicio)',
                    color: '#6366F1'
                });
            }
            return ghosts;
        }

        // 2. Preposición (在, 跟, 給, 從): antes del verbo
        if (isPOS(tok, 'Prep')) {
            const idx = Math.min(afterSubjTokenIdx, firstVerbTokenIdx);
            ghosts.push({
                targetTokenIndex: idx,
                slotId: tok.tradicional === '在' ? 'PLACE' : 'COMPANY',
                label: tok.tradicional === '在'
                    ? (isEn ? '+ WHERE (在 + Place)' : '+ DÓNDE (在 + Lugar)')
                    : (isEn ? `+ SCOPE (${tok.tradicional} + N)` : `+ ÁMBITO (${tok.tradicional} + N)`),
                color: tok.tradicional === '在' ? '#3B6998' : '#0E7490'
            });
            return ghosts;
        }

        // 3. Lugar (N[place]): si hay '在' sin objeto, justo después de '在'; si no, al final como destino de 去/來/在
        if (isPlaceToken(tok)) {
            const zaiIdx = tokens.findIndex(t => t.tradicional === '在');
            if (zaiIdx !== -1) {
                ghosts.push({
                    targetTokenIndex: zaiIdx + 1,
                    slotId: 'PLACE',
                    label: isEn ? '+ FUSE LOCATION (在 + Place)' : '+ FUSIONAR LUGAR (在 + Lugar)',
                    color: '#3B6998'
                });
            }
            ghosts.push({
                targetTokenIndex: tokens.length,
                slotId: firstVerbSyn ? 'OBJECT' : 'PLACE',
                label: isEn ? '+ DESTINATION / PLACE' : '+ DESTINO / LUGAR',
                color: firstVerbSyn ? '#8D5B4C' : '#3B6998'
            });
            return ghosts;
        }

        // 4. Clasificador (M): justo después de un Det/Numeral
        if (isPOS(tok, 'M')) {
            const detIdx = tokens.findIndex(t => isPOS(t, 'Det'));
            if (detIdx !== -1) {
                const isObjDet = firstVerbSyn && detIdx > firstVerbTokenIdx;
                ghosts.push({
                    targetTokenIndex: detIdx + 1,
                    slotId: isObjDet ? 'OBJECT' : 'TOPIC_SUBJ',
                    label: isEn ? '+ FUSE MEASURE (Det + M)' : '+ FUSIONAR CLASIFICADOR (Det + M)',
                    color: isObjDet ? '#8D5B4C' : '#2E78B7'
                });
            } else {
                ghosts.push({
                    targetTokenIndex: tokens.length,
                    slotId: firstVerbSyn ? 'OBJECT' : 'TOPIC_SUBJ',
                    label: isEn ? '+ MEASURE (M)' : '+ CLASIFICADOR (M)',
                    color: firstVerbSyn ? '#8D5B4C' : '#2E78B7'
                });
            }
            return ghosts;
        }

        // 5. Adverbio o Verbo Auxiliar (Adv / Vaux): justo antes del Verbo o Estado
        if (isPOS(tok, 'Adv') || isAuxVerb(tok)) {
            ghosts.push({
                targetTokenIndex: firstVerbTokenIdx,
                slotId: 'ADV_MODAL',
                label: isEn ? '+ MODIFY ACTION/STATE' : '+ MODIFICAR ACCIÓN / ESTADO',
                color: '#0D9488'
            });
            return ghosts;
        }

        // 6. Verbo o Verbo de Estado (V / Vs / Vst / V-sep): en el núcleo predicativo
        if (isPOS(tok, 'V')) {
            ghosts.push({
                targetTokenIndex: tokens.length,
                slotId: 'VERB_STATE',
                label: isStateVerb(tok)
                    ? (isEn ? `+ STATE (${tok.posSymbol})` : `+ ESTADO (${tok.posSymbol})`)
                    : (isEn ? `+ ACTION (${tok.posSymbol})` : `+ ACCIÓN (${tok.posSymbol})`),
                color: '#D4760A'
            });
            return ghosts;
        }

        // 7. Partícula (Ptc): al final o después del verbo/nombre
        if (isPOS(tok, 'Ptc')) {
            ghosts.push({
                targetTokenIndex: tokens.length,
                slotId: 'FINAL_PTC',
                label: isEn ? '+ PARTICLE (Ptc)' : '+ PARTÍCULA (Ptc)',
                color: '#7D54B5'
            });
            return ghosts;
        }

        // 8. Sustantivo / Pronombre / Determinante (N / Det):
        // Si no hay sujeto antes del verbo, ofrecer Slot Sujeto; si ya hay verbo, ofrecer Slot Objeto
        if (!firstSubjSyn) {
            ghosts.push({
                targetTokenIndex: 0,
                slotId: 'TOPIC_SUBJ',
                label: isEn ? '+ WHO / SUBJECT' : '+ QUIÉN / SUJETO',
                color: '#2E78B7'
            });
        }
        ghosts.push({
            targetTokenIndex: tokens.length,
            slotId: firstVerbSyn ? 'OBJECT' : 'TOPIC_SUBJ',
            label: firstVerbSyn
                ? (isEn ? '+ WHAT / OBJECT' : '+ QUÉ / OBJETO')
                : (isEn ? '+ SUBJECT / NOUN' : '+ SUJETO / SUSTANTIVO'),
            color: firstVerbSyn ? '#8D5B4C' : '#2E78B7'
        });
        return ghosts;
    };

    /**
     * Expande un verbo separable (`V-sep` / `Vs-sep`) en sus 2 átomos constituyentes (`唱` + `歌`)
     * para permitir insertar partículas aspectuales (`了`, `過`) o cuantificadores en medio.
     */
    const expandSeparableVerbAt = (tokenList, index) => {
        const copy = [...tokenList];
        const target = normalizeToken(copy[index], index);
        if (!target) return copy;
        const parts = (Array.isArray(target.sepParts) && target.sepParts.length === 2)
            ? target.sepParts
            : [target.tradicional.slice(0, 1), target.tradicional.slice(1)];

        const pyParts = (target.pinyin || '').trim().split(/\s+/);
        const pyHead = pyParts[0] || target.pinyin || '';
        const pyObj = pyParts.slice(1).join(' ') || '';

        const headAtom = {
            id: `sep_head_${target.id}_${Date.now()}`,
            tradicional: parts[0],
            pinyin: pyHead,
            espanol: `${target.espanol} (verbo)`,
            english: `${target.english || target.espanol} (verb)`,
            categoria: 'V',
            posSymbol: 'V',
            verbSubtype: 'V',
            isSplitVerbHead: true,
            parentSepWord: target.tradicional,
            semanticTags: ['action']
        };

        const objAtom = {
            id: `sep_obj_${target.id}_${Date.now()}`,
            tradicional: parts[1],
            pinyin: pyObj,
            espanol: `${target.espanol} (objeto interno)`,
            english: `${target.english || target.espanol} (inner object)`,
            categoria: 'N',
            posSymbol: 'N',
            isSplitVerbObject: true,
            parentSepWord: target.tradicional,
            semanticTags: ['object']
        };

        copy.splice(index, 1, headAtom, objAtom);
        return copy;
    };

    /**
     * Genera automáticamente la fórmula sintáctica legible a partir de las cápsulas actuales.
     */
    const generateStructureFormula = (syntagmas) => {
        if (!syntagmas || syntagmas.length === 0) return '';
        return syntagmas.map(syn => {
            if (syn.isCapsule) {
                return syn.formulaTag;
            }
            const t = syn.tokens[0];
            if (!t) return '';
            if (t.categoria === 'N' && hasTag(t, 'pronoun')) return 'N(Pron)';
            if (t.categoria === 'N' && hasTag(t, 'time')) return 'N(Tiempo)';
            if (t.categoria === 'N' && hasTag(t, 'place')) return 'N(Lugar)';
            if (t.categoria === 'V' && t.verbSubtype) return `${t.verbSubtype}(${t.tradicional})`;
            return `${t.posSymbol || t.categoria}(${t.tradicional})`;
        }).filter(Boolean).join(' + ');
    };

    // Helpers internos para manipular arreglos de tokens en acciones de auto-corrección
    function moveTokenSlice(list, startIdx, endIdx, targetInsertIdx) {
        const copy = [...list];
        const count = endIdx - startIdx + 1;
        const extracted = copy.splice(startIdx, count);
        const adjustedTarget = targetInsertIdx > startIdx ? Math.max(0, targetInsertIdx - count) : Math.max(0, targetInsertIdx);
        copy.splice(adjustedTarget, 0, ...extracted);
        return copy;
    }

    function findLibraryWordByHanzi(hanzi) {
        if (typeof getAllWords !== 'function') return null;
        return getAllWords().find(w => w.tradicional === hanzi) || null;
    }

    function resolvePreferredClassifier(nounToken) {
        if (nounToken && nounToken.clasificador && typeof getWordById === 'function') {
            const clf = getWordById(nounToken.clasificador);
            if (clf) return clf;
        }
        return findLibraryWordByHanzi('個') || CHAR_FALLBACK_METADATA['個'];
    }

    return {
        normalizeToken,
        detectSyntagmas,
        validateSlotOrder,
        computeGhostSlots,
        expandSeparableVerbAt,
        generateStructureFormula,
        CAPSULE_META
    };
})();

if (typeof window !== 'undefined') {
    window.SyntaxEngine = SyntaxEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyntaxEngine;
}
