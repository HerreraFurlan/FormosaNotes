/**
 * =====================================================
 * AppChino (Formosa Notes) — syntax-engine.js
 * Motor Determinista de Sintaxis China y "Sintagmas Magnéticos" (Latencia 0 ms)
 * 
 * Basado en la gramática pedagógica estándar de Taiwán (TOCFL / 詞類表):
 * - Categorías Gramaticales: N, V, Adv, Conj, Prep, M, Ptc, Det, Num, Phr
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
        '到': { categoria: 'Prep', posSymbol: 'Prep', semanticTags: ['prepPlace', 'prepTime', 'allowsPostPlace'], pinyin: 'dào', espanol: 'Hasta / A', english: 'To / Until' },
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
        '太': { categoria: 'Adv', posSymbol: 'Adv', semanticTags: ['degree', 'excessive'], pinyin: 'tài', espanol: 'Demasiado', english: 'Too' },
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
        '每': { categoria: 'Det', posSymbol: 'Det', semanticTags: ['demonstrative', 'distributive'], pinyin: 'měi', espanol: 'Cada', english: 'Every / Each' },
        '第': { categoria: 'Det', posSymbol: 'Det', semanticTags: ['ordinalPrefix'], pinyin: 'dì', espanol: '(Prefijo ordinal)', english: '(Ordinal prefix)' },
        '一': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'yī', espanol: 'Uno', english: 'One' },
        '二': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'èr', espanol: 'Dos (conteo)', english: 'Two (counting)' },
        '兩': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'liǎng', espanol: 'Dos (con clasificador)', english: 'Two (with measure word)' },
        '三': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'sān', espanol: 'Tres', english: 'Three' },
        '四': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'sì', espanol: 'Cuatro', english: 'Four' },
        '五': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'wǔ', espanol: 'Cinco', english: 'Five' },
        '六': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'liù', espanol: 'Seis', english: 'Six' },
        '七': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'qī', espanol: 'Siete', english: 'Seven' },
        '八': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'bā', espanol: 'Ocho', english: 'Eight' },
        '九': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'jiǔ', espanol: 'Nueve', english: 'Nine' },
        '十': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'shí', espanol: 'Diez', english: 'Ten' },
        '百': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'bǎi', espanol: 'Cien', english: 'Hundred' },
        '千': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'qiān', espanol: 'Mil', english: 'Thousand' },
        '萬': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'wàn', espanol: 'Diez mil', english: 'Ten thousand' },
        '半': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral'], pinyin: 'bàn', espanol: 'Medio / Mitad', english: 'Half' },
        '幾': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral', 'question'], pinyin: 'jǐ', espanol: 'Cuántos', english: 'How many' },
        '多少': { categoria: 'Num', posSymbol: 'Num', semanticTags: ['numeral', 'question'], pinyin: 'duōshǎo', espanol: 'Cuánto / Cuántos', english: 'How much / How many' },
        '個': { categoria: 'M', posSymbol: 'M', semanticTags: ['measure'], pinyin: 'ge', espanol: 'Clasificador general', english: 'General measure word' },
        '是': { categoria: 'V', posSymbol: 'Vst', verbSubtype: 'Vst', semanticTags: ['state', 'transitiveState', 'copula'], pinyin: 'shì', espanol: 'Ser', english: 'To be' },
        '有': { categoria: 'V', posSymbol: 'V', verbSubtype: 'V', semanticTags: ['action', 'possession', 'existential'], pinyin: 'yǒu', espanol: 'Tener / Haber', english: 'To have / There is' },
        '臭': { categoria: 'V', posSymbol: 'Vs', verbSubtype: 'Vs', semanticTags: ['state', 'hasDegree'], pinyin: 'chòu', espanol: 'Oler mal / Apestoso', english: 'Smelly / Stinky' }
    };

    // Listas cerradas y patrones seguros para evitar contaminación por subcadena (ej. 甜點)
    const EXACT_TIME_WORDS = new Set([
        '今天', '明天', '昨天', '前天', '後天', '現在', '早上', '上午', '中午', '下午', '晚上', '半夜',
        '週末', '今年', '明年', '去年', '什麼時候', '幾點', '以前', '以後', '從前', '最近', '有時候',
        '點', '點鐘', '分', '分鐘', '刻', '號', '日', '年', '月', '天', '禮拜', '星期', '小時', '鐘頭',
        '禮拜一', '禮拜二', '禮拜三', '禮拜四', '禮拜五', '禮拜六', '禮拜日', '禮拜天', '禮拜幾',
        '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日', '星期天', '星期幾'
    ]);
    const SAFE_TIME_REGEX = /^(禮拜[一二三四五六日天幾]|星期[一二三四五六日天幾]|(上|下|這)個?(禮拜|星期|月|週末)|[一二三四五六七八九十]+月|[一二三四五六七八九十零〇兩千]+年|[一二三四五六七八九十兩幾半]+(點|點鐘|分|分鐘|刻|天|號|日|個?月|個?禮拜|個?星期|個?小時|個?鐘頭))$/;

    const EXACT_PLACE_WORDS = new Set([
        '學校', '家', '教室', '餐廳', '店', '台灣', '臺灣', '中國', '美國', '日本', '越南', '英國', '法國', '德國', '韓國', '泰國',
        '房子', '哪裡', '那裡', '這裡', '山上', '山', '海', '海邊', '前面', '後面', '外面', '裡面', '旁邊', '附近', '樓下', '樓上',
        '樓', '一樓', '二樓', '三樓', '大樓', '地方', '花蓮', '台北', '臺北', '高雄', '台南', '臺南', '台中', '臺中', '台東', '臺東', '墾丁', '故宮', '夜市',
        '商店', '書店', '宿舍', '圖書館', '游泳池', '銀行', '郵局', '超市', 'KTV', '飯館', '咖啡店', '洗手間', '公園', '電影院', '捷運站', '火車站'
    ]);

    const NUMERAL_WORDS = new Set([
        '零', '〇', '一', '二', '兩', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '萬', '半', '幾', '多少', '一次'
    ]);

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

        const isAnon = !raw.id || String(raw.id).startsWith('anon_');
        const fallbackMeta = CHAR_FALLBACK_METADATA[raw.tradicional] || {};
        const merged = isAnon && !dbWord
            ? Object.assign({}, raw, fallbackMeta)
            : Object.assign({}, fallbackMeta, dbWord || {}, raw);
        const hz = (merged.tradicional || '').trim();
        let catId = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.normalizeCategoryId)
            ? APP_CONFIG.normalizeCategoryId(merged.categoria)
            : (merged.categoria || 'N');

        // Asegurar que los numerales puros tengan categoría Num incluso si vienen de cachés antiguas
        if (NUMERAL_WORDS.has(hz) && (catId === 'Det' || !merged.categoria)) {
            catId = 'Num';
        }

        let verbSubtype = merged.verbSubtype || (catId === 'V' ? (merged.posSymbol && merged.posSymbol !== 'V' ? merged.posSymbol : 'V') : null);
        if (verbSubtype === 'Va') verbSubtype = 'Vs';
        const posSymbol = (catId === 'Num') ? 'Num' : (merged.posSymbol === 'Va' ? 'Vs' : (merged.posSymbol || verbSubtype || catId));
        const semanticTags = Array.isArray(merged.semanticTags) ? [...merged.semanticTags] : [];

        // Inferir etiquetas semánticas sin contaminación por subcadena
        if (catId === 'N' || catId === 'M') {
            if ((EXACT_TIME_WORDS.has(hz) || SAFE_TIME_REGEX.test(hz)) && !semanticTags.includes('time')) {
                semanticTags.push('time');
            }
            if (EXACT_PLACE_WORDS.has(hz) && !semanticTags.includes('place')) {
                semanticTags.push('place');
            }
            if (['我', '你', '他', '她', '我們', '你們', '他們', '您', '妳', '誰', '自己', '大家'].includes(hz) && !semanticTags.includes('pronoun')) {
                semanticTags.push('pronoun', 'person');
            }
        }
        if ((catId === 'Num' || catId === 'Det') && (NUMERAL_WORDS.has(hz) || /^[一二兩三四五六七八九十百千萬零〇半幾]+$/.test(hz)) && !semanticTags.includes('numeral')) {
            semanticTags.push('numeral');
        }
        if (catId === 'Det' && ['這', '那', '哪', '每', '這些', '那些'].includes(hz) && !semanticTags.includes('demonstrative')) {
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
            splitGroupId: raw.splitGroupId || null,
            parentSepWord: raw.parentSepWord || null,
            clasificador: merged.clasificador || '',
            semanticTags
        };
    };

    // Helpers de predicado sobre un token
    const isPOS = (tok, pos) => tok && tok.categoria === pos;
    const hasTag = (tok, tag) => tok && Array.isArray(tok.semanticTags) && tok.semanticTags.includes(tag);
    const isNominalToken = (tok) => tok && (tok.categoria === 'N' || (tok.categoria === 'Phr' && (hasTag(tok, 'object') || hasTag(tok, 'place')) && !hasTag(tok, 'conversationalExpression')));
    const isNumeral = (tok) => tok && (tok.categoria === 'Num' || hasTag(tok, 'numeral'));
    const isDetOrNum = (tok) => tok && (tok.categoria === 'Det' || isNumeral(tok));
    const isStateVerb = (tok) => tok && ((tok.categoria === 'V' && ['Vs', 'Vst', 'Vs-pred', 'Vs-attr', 'Vs-sep'].includes(tok.verbSubtype)) || (tok.categoria === 'Phr' && (tok.verbSubtype === 'Vs' || hasTag(tok, 'state')) && !hasTag(tok, 'conversationalExpression')));
    const isActionOrProcessVerb = (tok) => tok && tok.categoria === 'V' && ['V', 'Vi', 'V-sep', 'Vp', 'Vpt', 'Vp-sep'].includes(tok.verbSubtype || 'V');
    const isAuxVerb = (tok) => tok && tok.categoria === 'V' && tok.verbSubtype === 'Vaux';
    const isSeparableVerb = (tok) => tok && tok.categoria === 'V' && ['V-sep', 'Vs-sep', 'Vp-sep'].includes(tok.verbSubtype);
    const isTimeToken = (tok) => tok && (hasTag(tok, 'time') || hasTag(tok, 'timeMeasure') || EXACT_TIME_WORDS.has(tok.tradicional) || SAFE_TIME_REGEX.test(tok.tradicional));
    const isPlaceToken = (tok) => tok && (hasTag(tok, 'place') || EXACT_PLACE_WORDS.has(tok.tradicional));
    const isPersonOrPronoun = (tok) => tok && (hasTag(tok, 'person') || hasTag(tok, 'pronoun'));

    /**
     * Desambiguador contextual de homógrafos (Latencia 0 ms):
     * Resuelve colisiones entre palabras que comparten el mismo Hanzi (家, 得, 點, 在, 要, 到, 照/做/唱).
     * @param {Array<object>} normalizedTokens
     * @returns {Array<object>}
     */
    const resolveContextualHomographs = (normalizedTokens) => {
        const list = (normalizedTokens || []).map((t, idx) => Object.assign({}, t, { index: idx }));
        for (let i = 0; i < list.length; i++) {
            const cur = list[i];
            const prev = list[i - 1] || null;
            const nxt = list[i + 1] || null;
            const nxt2 = list[i + 2] || null;
            const hz = cur.tradicional;

            // 1. 家: Clasificador M (這家餐廳 / 兩家書店) vs Sustantivo N (在家 / 我家 / 回家)
            if (hz === '家') {
                const precededByQuantifier = prev && (isPOS(prev, 'Det') || isNumeral(prev) || prev.tradicional === '幾');
                const followedByPossessiveOrPlace = prev && (hasTag(prev, 'pronoun') || prev.tradicional === '在' || prev.tradicional === '回' || prev.tradicional === '去' || prev.tradicional === '到' || prev.tradicional === '的');
                if (precededByQuantifier && !followedByPossessiveOrPlace) {
                    cur.id = 'id_clf_jia_shop';
                    cur.categoria = 'M';
                    cur.posSymbol = 'M';
                    cur.verbSubtype = null;
                    cur.semanticTags = ['measure'];
                    cur.espanol = 'Clasificador para tiendas, restaurantes, empresas';
                } else {
                    cur.id = 'id_mty003_jia';
                    cur.categoria = 'N';
                    cur.posSymbol = 'N';
                    cur.verbSubtype = null;
                    cur.semanticTags = ['noun', 'place'];
                    cur.espanol = 'Casa / Familia / Hogar';
                }
            }

            // 2. 得: Partícula de complemento de grado Ptc (說得很好) vs Verbo auxiliar Vaux děi (得去上課)
            if (hz === '得') {
                const precededByVerb = prev && (isPOS(prev, 'V') || ['說', '做', '唱', '寫', '照', '跳', '過', '吃', '喝', '看', '學', '走', '跑', '睡'].includes(prev.tradicional));
                if (precededByVerb) {
                    cur.id = 'id_l5_de';
                    cur.categoria = 'Ptc';
                    cur.posSymbol = 'Ptc';
                    cur.verbSubtype = null;
                    cur.pinyin = 'de';
                    cur.semanticTags = ['structural', 'complementDe'];
                    cur.espanol = 'Partícula de complemento de grado';
                } else {
                    cur.id = 'id_l7_dei';
                    cur.categoria = 'V';
                    cur.posSymbol = 'Vaux';
                    cur.verbSubtype = 'Vaux';
                    cur.pinyin = 'děi';
                    cur.semanticTags = ['auxiliary', 'modal'];
                    cur.espanol = 'Tener que / Deber (obligación)';
                }
            }

            // 3. 點: Clasificador de hora M (八點半 / 幾點) vs Verbo V (點菜 / 點牛肉麵)
            if (hz === '點') {
                const isClockContext = (prev && (isNumeral(prev) || prev.tradicional === '幾' || prev.tradicional === '兩')) ||
                    (nxt && ['分', '半', '刻', '鐘'].includes(nxt.tradicional));
                if (isClockContext) {
                    cur.id = 'id_clf_dian';
                    cur.categoria = 'M';
                    cur.posSymbol = 'M';
                    cur.verbSubtype = null;
                    cur.semanticTags = ['measure', 'timeMeasure', 'time'];
                    cur.espanol = 'Punto / Hora en punto';
                } else {
                    cur.id = 'id_v_dian_order';
                    cur.categoria = 'V';
                    cur.posSymbol = 'V';
                    cur.verbSubtype = 'V';
                    cur.semanticTags = ['action'];
                    cur.espanol = 'Pedir / Ordenar (comida)';
                }
            }

            // 4. 在: Verbo progresivo Vs (在看書) vs Preposición Prep (在家看書) vs Verbo locativo Vst (我在家 / 在哪裡)
            if (hz === '在') {
                const followedDirectlyByVerb = nxt && (isActionOrProcessVerb(nxt) || ['忙', '看', '吃', '喝', '做', '寫', '說', '聽', '學', '上', '玩', '唱', '跳', '游', '睡'].includes(nxt.tradicional));
                if (followedDirectlyByVerb) {
                    cur.id = 'id_l7_zai_va';
                    cur.categoria = 'V';
                    cur.posSymbol = 'Vs';
                    cur.verbSubtype = 'Vs';
                    cur.semanticTags = ['aspect', 'progressive', 'state'];
                    cur.espanol = 'Estar... (haciendo algo / progresivo)';
                } else {
                    // Verificar si después del sintagma de lugar hay otro verbo predicativo en la misma cláusula
                    let hasSubsequentVerb = false;
                    for (let m = i + 2; m < list.length; m++) {
                        const tokM = list[m];
                        if (['，', ',', '。', '？', '！', '；'].includes(tokM.tradicional)) break;
                        // Ignorar elDe atributivo (在我的學校看書)
                        if (tokM.tradicional === '的') continue;
                        if (isPOS(tokM, 'V') || isAuxVerb(tokM) || ['看', '吃', '喝', '做', '寫', '說', '聽', '學', '買', '賣', '玩', '上', '等', '工作', '讀', '教'].includes(tokM.tradicional)) {
                            hasSubsequentVerb = true;
                            break;
                        }
                    }
                    if (hasSubsequentVerb) {
                        cur.id = 'id_voc_zai_loc';
                        cur.categoria = 'Prep';
                        cur.posSymbol = 'Prep';
                        cur.verbSubtype = null;
                        cur.semanticTags = ['prepPlace'];
                        cur.espanol = 'En (preposición de lugar)';
                    } else {
                        cur.id = 'id_l6_zai_vst';
                        cur.categoria = 'V';
                        cur.posSymbol = 'Vst';
                        cur.verbSubtype = 'Vst';
                        cur.semanticTags = ['state', 'transitiveState', 'locativeVerb', 'allowsPostPlace'];
                        cur.espanol = 'Estar en / Quedar en (verbo locativo)';
                    }
                }
            }

            // 5. 到: Preposición espacial/temporal (到學校去 / 從早到晚) vs Verbo de llegada (幾點到花蓮)
            if (hz === '到') {
                const hasFromBefore = list.slice(0, i).some(t => t.tradicional === '從');
                let hasDirectionalOrActionAfter = false;
                for (let m = i + 2; m < list.length; m++) {
                    if (isPOS(list[m], 'V') || ['去', '來', '玩', '看', '買', '吃', '學', '游泳'].includes(list[m].tradicional)) {
                        hasDirectionalOrActionAfter = true;
                        break;
                    }
                }
                if (hasFromBefore || hasDirectionalOrActionAfter) {
                    cur.categoria = 'Prep';
                    cur.posSymbol = 'Prep';
                    cur.verbSubtype = null;
                    cur.semanticTags = ['prepPlace', 'prepTime', 'allowsPostPlace'];
                } else {
                    cur.categoria = 'V';
                    cur.posSymbol = 'V';
                    cur.verbSubtype = 'V';
                    cur.semanticTags = ['action', 'allowsPostPlace'];
                }
            }

            // 6. 要: Verbo auxiliar Vaux (要去 / 要買 / 要跟朋友吃) vs Verbo transitivo V (要一杯茶)
            if (hz === '要') {
                const followedByVerbOrPrep = nxt && (isPOS(nxt, 'V') || isPOS(nxt, 'Prep') || isPOS(nxt, 'Adv'));
                if (followedByVerbOrPrep) {
                    cur.id = 'id_l4_yao_vaux';
                    cur.categoria = 'V';
                    cur.posSymbol = 'Vaux';
                    cur.verbSubtype = 'Vaux';
                    cur.semanticTags = ['auxiliary', 'modal'];
                } else {
                    cur.id = 'id_mth2f1b2_9x8z1';
                    cur.categoria = 'V';
                    cur.posSymbol = 'V';
                    cur.verbSubtype = 'V';
                    cur.semanticTags = ['action'];
                }
            }

            // 7. Verbo copiado antes de 得 tras verbo separable o V+O (ej. 照相 + 照 + 得 + 很 + 好 / 做飯 + 做 + 得 + 很 + 好)
            if (nxt && nxt.tradicional === '得' && !isPOS(cur, 'V') && !isPersonOrPronoun(cur)) {
                const matchesPrevVerbHead = prev && ((isSeparableVerb(prev) && cur.tradicional === prev.tradicional[0]) ||
                    (i >= 2 && isPOS(list[i - 2], 'V') && cur.tradicional === list[i - 2].tradicional));
                if (matchesPrevVerbHead || ['照', '做', '唱', '跳', '寫', '說', '走', '跑', '睡', '考'].includes(cur.tradicional)) {
                    cur.categoria = 'V';
                    cur.posSymbol = 'V';
                    cur.verbSubtype = 'V';
                    if (!cur.semanticTags.includes('action')) cur.semanticTags.push('action');
                }
            }

            // 8. 多 aproximado después de Numeral o Clasificador (一百多個人 / 三個多月)
            if (hz === '多' && prev && (isNumeral(prev) || isPOS(prev, 'M')) && nxt && (isPOS(nxt, 'M') || isNominalToken(nxt))) {
                cur.categoria = 'Num';
                cur.posSymbol = 'Num';
                cur.verbSubtype = null;
                cur.semanticTags = ['numeral', 'approximative'];
            }

            // 9. 坐: Verbo transitivo V (坐火車 / 坐捷運 / 坐公車 / 坐計程車) vs intransitivo Vi (請坐 / 坐在這裡)
            if (hz === '坐') {
                const VEHICLES = ['火車', '高鐵', '捷運', '公車', '公共汽車', '計程車', '車', '飛機', '船'];
                const followedByVehicle = nxt && (VEHICLES.includes(nxt.tradicional) ||
                    (isDetOrNum(nxt) && list.slice(i + 1, i + 5).some(t => VEHICLES.includes(t.tradicional))));
                if (followedByVehicle) {
                    cur.id = 'id_l8_zuo_v';
                    cur.categoria = 'V';
                    cur.posSymbol = 'V';
                    cur.verbSubtype = 'V';
                    cur.semanticTags = ['action', 'allowsPostPlace'];
                } else {
                    cur.id = 'id_l6_zuo';
                    cur.categoria = 'V';
                    cur.posSymbol = 'Vi';
                    cur.verbSubtype = 'Vi';
                    cur.semanticTags = ['action', 'intransitive', 'allowsPostPlace'];
                }
            }
        }
        return list;
    };

    /**
     * Avanza el índice mientras haya una secuencia contigua de Numerales (ej. 三 + 萬 + 四 + 千 / 一 + 百 + 五 + 十 + 多).
     */
    const consumeNumeralRun = (tokens, startIdx) => {
        let k = startIdx;
        while (k < tokens.length && isNumeral(tokens[k]) && tokens[k].tradicional !== '一次') {
            k++;
        }
        return k;
    };

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
            formulaTag: '[Det + Num + M + N]'
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
     * Soporta consistentemente la cadena Det + Num + M + N.
     * @param {Array<object>} rawTokens
     * @param {string} [lang='es']
     * @returns {Array<object>} Lista de Syntagmas (cápsulas de >=2 tokens o átomos individuales)
     */
    const detectSyntagmas = (rawTokens, lang = 'es') => {
        const rawNorm = (rawTokens || []).map((t, idx) => normalizeToken(t, idx)).filter(Boolean);
        const tokens = resolveContextualHomographs(rawNorm);
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
            // 1. Prep(在/從/到) + Lugar / Tiempo -> Capsule[LOCATION] o Capsule[TIME_FRAME]
            // ---------------------------------------------------------
            if (isPOS(t0, 'Prep') && ['在', '從', '到'].includes(t0.tradicional) && t1) {
                // Caso A: Estructura 從 + A + 到 + B (ej. 從早上到晚上, 從台北到高雄)
                if (t0.tradicional === '從') {
                    let daoIdx = -1;
                    for (let m = i + 2; m <= Math.min(tokens.length - 2, i + 6); m++) {
                        if (tokens[m].tradicional === '到') {
                            daoIdx = m;
                            break;
                        }
                    }
                    if (daoIdx !== -1) {
                        let end = daoIdx + 2;
                        while (end < tokens.length && (isTimeToken(tokens[end]) || isNumeral(tokens[end]))) end++;
                        const isTemporalRange = isTimeToken(t1) || isNumeral(t1);
                        syntagmas.push(makeCapsule(
                            isTemporalRange ? 'TIME_FRAME' : 'LOCATION',
                            tokens.slice(i, end),
                            isTemporalRange ? '[從 + Tiempo + 到 + Tiempo]' : '[從 + Lugar + 到 + Lugar]'
                        ));
                        i = end;
                        continue;
                    }
                    if (isTimeToken(t1) || isNumeral(t1)) {
                        let end = i + 2;
                        while (end < tokens.length && (isTimeToken(tokens[end]) || isNumeral(tokens[end]))) end++;
                        syntagmas.push(makeCapsule('TIME_FRAME', tokens.slice(i, end), '[Prep(從) + Tiempo]'));
                        i = end;
                        continue;
                    }
                }

                // Caso B: 在/到 + Pron/N + 的 + Lugar (ej. 在 + 我 + 的 + 學校)
                if (isNominalToken(t1) && t2 && t2.tradicional === '的' && t3 && isNominalToken(t3)) {
                    syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, i + 4), `[Prep(${t0.tradicional}) + N + 的 + Lugar]`));
                    i += 4;
                    continue;
                }
                // Caso C: 在/到 + Pron + 家/學校 (ej. 在 + 我 + 家, 到 + 我 + 家)
                if (hasTag(t1, 'pronoun') && t2 && isPlaceToken(t2)) {
                    syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, i + 3), `[Prep(${t0.tradicional}) + Pron + Lugar]`));
                    i += 3;
                    continue;
                }
                // Caso D: 在/到 + [Det] + [Num] + M + N (ej. 在 + 這 + 家 + 餐廳) o 在/到 + Num + 樓 (ej. 在 + 二 + 樓)
                if (isDetOrNum(t1)) {
                    let curIdx = i + 1;
                    if (isPOS(tokens[curIdx], 'Det')) curIdx++;
                    curIdx = consumeNumeralRun(tokens, curIdx);
                    if (tokens[curIdx] && ['樓', '號'].includes(tokens[curIdx].tradicional)) {
                        syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, curIdx + 1), `[Prep(${t0.tradicional}) + Lugar]`));
                        i = curIdx + 1;
                        continue;
                    }
                    if (tokens[curIdx] && isPOS(tokens[curIdx], 'M') && tokens[curIdx + 1] && isNominalToken(tokens[curIdx + 1])) {
                        syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, curIdx + 2), `[Prep(${t0.tradicional}) + Det/Num + M + Lugar]`));
                        i = curIdx + 2;
                        continue;
                    }
                }
                // Caso E: 在/到 + Lugar [+ 旁邊/裡面/外面/前面/後面/附近/樓下]
                if (isPlaceToken(t1) || isNominalToken(t1)) {
                    let end = i + 2;
                    if (tokens[end] && ['旁邊', '裡面', '外面', '前面', '後面', '附近', '樓下', '樓上', '上', '裡'].includes(tokens[end].tradicional)) {
                        end++;
                    }
                    syntagmas.push(makeCapsule('LOCATION', tokens.slice(i, end), `[Prep(${t0.tradicional}) + Lugar]`));
                    i = end;
                    continue;
                }
            }

            // ---------------------------------------------------------
            // 2. Prep(跟/給/對/幫/比) + Persona/Sustantivo [+ 一起] -> Capsule[COMPANY_SCOPE]
            // ---------------------------------------------------------
            if (isPOS(t0, 'Prep') && ['跟', '給', '對', '幫', '比'].includes(t0.tradicional) && t1) {
                if (isNominalToken(t1) && t2 && t2.tradicional === '的' && t3 && isNominalToken(t3)) {
                    let end = i + 4;
                    if (tokens[end] && tokens[end].tradicional === '一起') end++;
                    syntagmas.push(makeCapsule('COMPANY_SCOPE', tokens.slice(i, end), `[Prep(${t0.tradicional}) + N]`));
                    i = end;
                    continue;
                }
                if (isNominalToken(t1) || isPersonOrPronoun(t1)) {
                    let end = i + 2;
                    if (tokens[end] && tokens[end].tradicional === '一起') end++;
                    syntagmas.push(makeCapsule('COMPANY_SCOPE', tokens.slice(i, end), `[Prep(${t0.tradicional}) + N]`));
                    i = end;
                    continue;
                }
            }

            // ---------------------------------------------------------
            // 3. Marco Temporal: Num + 點/分/號/日/月/年 o N[time] + N[time]
            //    o [Det] + [Num] + M + N[time] (ej. 這 + 個 + 週末, 三 + 個 + 月)
            // ---------------------------------------------------------
            if (isNumeral(t0)) {
                const afterNumIdx = consumeNumeralRun(tokens, i);
                const unitTok = tokens[afterNumIdx];
                if (unitTok && ['點', '點鐘', '分', '分鐘', '刻', '號', '日', '月', '年', '天'].includes(unitTok.tradicional)) {
                    let end = afterNumIdx + 1;
                    while (end < tokens.length && (isTimeToken(tokens[end]) || isNumeral(tokens[end]) || ['點', '分', '半', '刻', '號', '日', '月', '年'].includes(tokens[end].tradicional))) {
                        end++;
                    }
                    syntagmas.push(makeCapsule('TIME_FRAME', tokens.slice(i, end), '[Num + Tiempo]'));
                    i = end;
                    continue;
                }
            }
            if (isTimeToken(t0) && t1 && (isTimeToken(t1) || (isNumeral(t1) && t2 && ['點', '分', '號', '日'].includes(t2.tradicional)))) {
                let end = i + 2;
                while (end < tokens.length && (isTimeToken(tokens[end]) || (isNumeral(tokens[end]) && tokens[end + 1] && ['點', '分', '半', '刻', '號', '日'].includes(tokens[end + 1].tradicional)) || ['點', '分', '半', '刻'].includes(tokens[end].tradicional))) {
                    end++;
                }
                syntagmas.push(makeCapsule('TIME_FRAME', tokens.slice(i, end), '[Marco Temporal]'));
                i = end;
                continue;
            }

            // ---------------------------------------------------------
            // 4. Verbo Separable Expandido: V-head + [Ptc/Det/Num/M] + V-obj (ej. 唱 + 了 + 歌)
            // ---------------------------------------------------------
            if (t0.isSplitVerbHead && t1) {
                let objIdx = -1;
                for (let k = i + 1; k <= Math.min(tokens.length - 1, i + 5); k++) {
                    const matchGroup = t0.splitGroupId
                        ? tokens[k].splitGroupId === t0.splitGroupId
                        : tokens[k].parentSepWord === t0.parentSepWord;
                    if (tokens[k].isSplitVerbObject && matchGroup) {
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
            // 5. Sintagma Nominal Completo: [Det] + [Num] + M + [Adv] + [Vs] + [的] + [N]
            //    Soporta:
            //    - Det + Num + M + N (這 + 兩 + 杯 + 茶)
            //    - Det + M + N (這 + 個 + 人)
            //    - Num + M + N (三 + 本 + 書, 一百 + 多 + 個 + 人, 三 + 個 + 多 + 月)
            //    - Det + Num + M / Num + M / Det + M (cuantificadores pronominales)
            //    - 第 + Num + [M/課/樓] (第 + 二 + 課, 二 + 樓)
            // ---------------------------------------------------------
            if (isDetOrNum(t0)) {
                let ptr = i;
                const hasDet = isPOS(tokens[ptr], 'Det');
                if (hasDet) ptr++;

                const numStart = ptr;
                ptr = consumeNumeralRun(tokens, ptr);
                const hasNum = ptr > numStart;

                // Caso especial: 第 + Num + 課/樓/次/天 o Num + 樓/課/歲/天/年
                if ((t0.tradicional === '第' && hasNum && tokens[ptr] && ['課', '樓', '次', '天', '年', '個', '家', '本'].includes(tokens[ptr].tradicional)) ||
                    (!hasDet && hasNum && tokens[ptr] && ['樓', '課', '歲'].includes(tokens[ptr].tradicional))) {
                    const end = ptr + 1;
                    const tag = hasDet ? '[Det(第) + Num + N]' : '[Num + N]';
                    syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, end), tag));
                    i = end;
                    continue;
                }

                // Verificar presencia de Clasificador (M)
                if (tokens[ptr] && isPOS(tokens[ptr], 'M')) {
                    ptr++; // Consumir M
                    // Soportar "多" o "半" post-clasificador (ej. 三 + 個 + 多 + 月 / 兩 + 個 + 半 + 小時)
                    if (tokens[ptr] && ['多', '半'].includes(tokens[ptr].tradicional)) {
                        ptr++;
                    }
                    // Soportar modificador adjetival opcional [Adv] + Vs + [的] antes del sustantivo
                    let modPtr = ptr;
                    if (tokens[modPtr] && isPOS(tokens[modPtr], 'Adv') && tokens[modPtr + 1] && isStateVerb(tokens[modPtr + 1])) {
                        modPtr += 2;
                        if (tokens[modPtr] && tokens[modPtr].tradicional === '的') modPtr++;
                    } else if (tokens[modPtr] && isStateVerb(tokens[modPtr])) {
                        modPtr += 1;
                        if (tokens[modPtr] && tokens[modPtr].tradicional === '的') modPtr++;
                    }

                    let hasNoun = false;
                    if (tokens[modPtr] && isNominalToken(tokens[modPtr])) {
                        ptr = modPtr + 1;
                        hasNoun = true;
                    }

                    const slice = tokens.slice(i, ptr);
                    const lastTok = slice[slice.length - 1];
                    const isTemporalNP = hasNoun && isTimeToken(lastTok) && !['時間', '時候', '生日'].includes(lastTok.tradicional);

                    const tagParts = [];
                    if (hasDet) tagParts.push('Det');
                    if (hasNum) tagParts.push('Num');
                    tagParts.push('M');
                    if (hasNoun) tagParts.push(isTemporalNP ? 'Tiempo' : 'N');
                    const formulaStr = `[${tagParts.join(' + ')}]`;

                    syntagmas.push(makeCapsule(isTemporalNP ? 'TIME_FRAME' : 'NOUN_PHRASE', slice, formulaStr));
                    i = ptr;
                    continue;
                }

                // Caso: Numeral compuesto sin M ni N todavía (ej. 二 + 十, 一 + 百 + 五 + 十)
                if (!hasDet && ptr - i >= 2) {
                    syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, ptr), '[Num compuesto]'));
                    i = ptr;
                    continue;
                }
            }

            // 5b. Pronombre pluralizado: 我/你/他 + 們 [+ 的 + N]
            if (hasTag(t0, 'pronoun') && t1 && t1.tradicional === '們') {
                if (t2 && t2.tradicional === '的' && t3 && isNominalToken(t3)) {
                    syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 4), '[Pron + 們 + 的 + N]'));
                    i += 4;
                    continue;
                }
                syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 2), '[Pron + 們]'));
                i += 2;
                continue;
            }

            // 5c. Modificador posesivo o atributivo con 的: (N/Pron/[Adv]+Vs) + 的 + N (ej. 我 + 的 + 書, 很 + 好 + 的 + 朋友)
            if (isPOS(t0, 'Adv') && t1 && isStateVerb(t1) && t2 && t2.tradicional === '的' && t3 && isNominalToken(t3)) {
                syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 4), '[Adv + Vs + 的 + N]'));
                i += 4;
                continue;
            }
            if ((isNominalToken(t0) || isStateVerb(t0)) && t1 && t1.tradicional === '的' && t2 && isNominalToken(t2)) {
                syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 3), `[${t0.posSymbol} + 的 + N]`));
                i += 3;
                continue;
            }

            // 5d. Coordinación nominal con 和/跟: N + 和 + N (ej. 爸爸 + 和 + 媽媽, 茶 + 和 + 咖啡)
            if (isNominalToken(t0) && t1 && t1.tradicional === '和' && t2 && isNominalToken(t2)) {
                syntagmas.push(makeCapsule('NOUN_PHRASE', tokens.slice(i, i + 3), '[N + 和 + N]'));
                i += 3;
                continue;
            }

            // ---------------------------------------------------------
            // 6. Estado Graduado: Adv(很/不/非常/真/最/也/都/太/有一點) + [Adv] + Vs/Vst
            // ---------------------------------------------------------
            if (isPOS(t0, 'Adv') && t1) {
                if (isPOS(t1, 'Adv') && t2 && isStateVerb(t2)) {
                    let end = i + 3;
                    if (tokens[end] && tokens[end].tradicional === '了') end++;
                    syntagmas.push(makeCapsule('STATE_DEGREE', tokens.slice(i, end), '[Adv + Adv + Vs]'));
                    i = end;
                    continue;
                }
                if (isStateVerb(t1)) {
                    // Si es 在 progresivo (ej. 不 + 在 + 看書 o 沒 + 在 + 看書), dejar que el bloque 7 lo fusione con el verbo de acción
                    if (t1.tradicional === '在' && hasTag(t1, 'progressive') && t2 && isPOS(t2, 'V')) {
                        let end = i + 3;
                        if (tokens[end] && isPOS(tokens[end], 'Ptc') && hasTag(tokens[end], 'aspect')) end++;
                        syntagmas.push(makeCapsule('VERBAL_COMPLEX', tokens.slice(i, end), `[Adv + 在(Vs) + V]`));
                        i = end;
                        continue;
                    }
                    let end = i + 2;
                    if (tokens[end] && tokens[end].tradicional === '了') end++;
                    syntagmas.push(makeCapsule('STATE_DEGREE', tokens.slice(i, end), `[Adv(${t0.tradicional}) + ${t1.posSymbol}]`));
                    i = end;
                    continue;
                }
            }

            // 6b. Progresivo con 在 (Vs aspectual): 在 + V (ej. 在 + 看書, 在 + 游泳, 在 + 吃)
            if (t0.tradicional === '在' && hasTag(t0, 'progressive') && t1 && isPOS(t1, 'V')) {
                let end = i + 2;
                if (tokens[end] && isPOS(tokens[end], 'Ptc') && hasTag(tokens[end], 'aspect')) end++;
                syntagmas.push(makeCapsule('VERBAL_COMPLEX', tokens.slice(i, end), `[在(Vs) + ${t1.posSymbol}]`));
                i = end;
                continue;
            }

            // ---------------------------------------------------------
            // 7. Complejo Verbal (Modal / Negación / Adverbio + Verbo)
            // ---------------------------------------------------------
            if (isPOS(t0, 'Adv') && t1 && isAuxVerb(t1) && t2 && (isActionOrProcessVerb(t2) || isStateVerb(t2))) {
                let end = i + 3;
                if (tokens[end] && isPOS(tokens[end], 'Ptc') && hasTag(tokens[end], 'aspect')) end++;
                syntagmas.push(makeCapsule('VERBAL_COMPLEX', tokens.slice(i, end), `[Adv + Vaux(${t1.tradicional}) + V]`));
                i = end;
                continue;
            }

            if (isAuxVerb(t0) && t1) {
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
            //    V + Ptc(得) + [Adv(很/真/太)] + Vs (ej. 說 + 得 + 很 + 好)
            // ---------------------------------------------------------
            if (isPOS(t0, 'V') && t1 && isPOS(t1, 'Ptc')) {
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
            (s.tokens.length === 1 && s.tokens[0].categoria === 'V')
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
            if (tok.tradicional === '在' || tok.tradicional === '到') {
                return { slot: 'PLACE', order: 4, color: '#3B6998', label: { es: `DÓNDE (${tok.tradicional})`, en: `WHERE (${tok.tradicional})` } };
            }
            return { slot: 'COMPANY', order: 3, color: '#0E7490', label: { es: 'PREPOSICIÓN', en: 'PREPOSITION' } };
        }
        if (isPOS(tok, 'Adv') || isAuxVerb(tok)) {
            return { slot: 'ADV_MODAL', order: 5, color: '#0D9488', label: { es: 'MODAL / ADV', en: 'MODAL / ADV' } };
        }
        if (isPOS(tok, 'V') || isStateVerb(tok)) {
            if (isStateVerb(tok)) {
                return { slot: 'VERB_STATE', order: 6, color: '#C9971A', label: { es: `ESTADO (${tok.posSymbol})`, en: `STATE (${tok.posSymbol})` } };
            }
            return { slot: 'VERB_STATE', order: 6, color: '#D4760A', label: { es: `ACCIÓN (${tok.posSymbol})`, en: `ACTION (${tok.posSymbol})` } };
        }
        if (isPlaceToken(tok)) {
            return { slot: 'PLACE', order: 4, color: '#3B6998', label: { es: 'LUGAR', en: 'PLACE' } };
        }
        if (isPOS(tok, 'Ptc') && hasTag(tok, 'finalModal')) {
            return { slot: 'FINAL_PTC', order: 8, color: '#7D54B5', label: { es: 'PARTÍCULA FINAL', en: 'FINAL PARTICLE' } };
        }
        if (isPOS(tok, 'Det') || isPOS(tok, 'Num') || isPOS(tok, 'M')) {
            return { slot: 'NOUN_PHRASE', order: 1, color: '#B45309', label: { es: tok.posSymbol, en: tok.posSymbol } };
        }
        return { slot: 'NOUN_PHRASE', order: 1, color: '#2E78B7', label: { es: 'NOMINAL', en: 'NOMINAL' } };
    };

    /**
     * Jerarquía de unidades temporales para validar el principio Mayor -> Menor.
     */
    const getTimeHierarchyRank = (tok) => {
        if (!tok) return 0;
        const hz = tok.tradicional;
        if (['今年', '明年', '去年'].includes(hz) || /^[一二三四五六七八九十零〇兩千]+年$/.test(hz)) return 1;
        if (['這個月', '上個月', '下個月'].includes(hz) || /^[一二三四五六七八九十]+月$/.test(hz)) return 2;
        if (['今天', '明天', '昨天', '前天', '後天', '週末', '這個週末'].includes(hz) ||
            /^(禮拜|星期)[一二三四五六日天幾]$/.test(hz) ||
            /^(上|下|這)個?(禮拜|星期)/.test(hz) ||
            /^[一二三四五六七八九十]+(號|日)$/.test(hz)) return 3;
        if (['早上', '上午', '中午', '下午', '晚上', '半夜'].includes(hz)) return 4;
        if (hz === '幾點' || /^[一二兩三四五六七八九十]+點/.test(hz)) return 5;
        return 0;
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
        const rawNorm = (rawTokens || []).map((t, idx) => normalizeToken(t, idx)).filter(Boolean);
        const tokens = resolveContextualHomographs(rawNorm);
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

        // Verbos introductorios / de cortesía / de reporte que introducen cláusulas subordinadas
        const MATRIX_OR_COURTESY_VERBS = new Set(['請', '請問', '覺得', '說', '聽說', '知道', '問', '希望', '想', '要', '是', '有', '祝']);

        // Localizar el verbo de acción/estado principal (saltando verbos introductorios si hay otro verbo después)
        const allVerbSynIndices = [];
        syntagmas.forEach((s, idx) => {
            if (s.canonicalSlot === 'VERB_STATE' && !s.tokens.every(t => isAuxVerb(t))) {
                allVerbSynIndices.push(idx);
            }
        });

        let verbSynIdx = allVerbSynIndices.length > 0 ? allVerbSynIndices[0] : -1;
        if (allVerbSynIndices.length > 1) {
            const nonMatrixIdx = allVerbSynIndices.find(idx =>
                !syntagmas[idx].tokens.some(t => MATRIX_OR_COURTESY_VERBS.has(t.tradicional))
            );
            if (nonMatrixIdx !== undefined) {
                verbSynIdx = nonMatrixIdx;
            }
        }
        const mainVerbSyn = verbSynIdx !== -1 ? syntagmas[verbSynIdx] : null;

        // Verificar si la oración es una construcción de foco con 是 / 不是 (ej. 這支手機不是從日本來的)
        const hasCopulaFocus = tokens.some(t => t.tradicional === '是');

        // Localizar el primer bloque pre-verbal del predicado principal para imantar complementos antes de él
        const preVerbalAnchorSynIdx = syntagmas.findIndex((s, idx) =>
            idx >= (verbSynIdx > 0 && syntagmas[0].tokens.some(t => MATRIX_OR_COURTESY_VERBS.has(t.tradicional)) ? 1 : 0) &&
            ['COMPANY', 'PLACE', 'ADV_MODAL', 'VERB_STATE'].includes(s.canonicalSlot) &&
            !s.tokens.some(t => ['請', '請問', '覺得', '說', '聽說', '知道'].includes(t.tradicional))
        );
        const preVerbalTokenIdx = preVerbalAnchorSynIdx !== -1 ? syntagmas[preVerbalAnchorSynIdx].startIndex : 0;

        // -----------------------------------------------------------------
        // REGLA 1: Lugar (`在 + N`) colocado DESPUÉS del verbo principal
        // (Excepción: verbos locativos/direccionales como 坐, 住, 到, 來, 去 o comparaciones con 比)
        // -----------------------------------------------------------------
        syntagmas.forEach((syn, sIdx) => {
            if (syn.type === 'LOCATION' && verbSynIdx !== -1 && sIdx > verbSynIdx && !hasCopulaFocus) {
                const mainVerbHz = mainVerbSyn.tokens.map(t => t.tradicional).join('');
                const isPartOfBiComparison = tokens.slice(0, syn.startIndex).some(t => t.tradicional === '比');
                const allowsPostLocation = mainVerbSyn.tokens.some(t =>
                    hasTag(t, 'allowsPostPlace') || ['坐', '住', '放', '站', '寫', '生', '在', '到', '來', '去', '回'].includes(t.tradicional)
                ) || syn.tokens[0]?.tradicional === '到' || isPartOfBiComparison;
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
        // (Salvo si es duración después del verbo como 分鐘/天/年 o predicado nominal con 是/有)
        // -----------------------------------------------------------------
        syntagmas.forEach((syn, sIdx) => {
            if (syn.canonicalSlot === 'TIME' && verbSynIdx !== -1 && sIdx > verbSynIdx && !hasCopulaFocus) {
                const mainVerbHz = mainVerbSyn.tokens.map(t => t.tradicional).join('');
                const isCopulaOrNaming = mainVerbSyn.tokens.some(t => MATRIX_OR_COURTESY_VERBS.has(t.tradicional) || ['到', '差', '過'].includes(t.tradicional));
                const isDuration = syn.tokens.some(t => ['分鐘', '天', '年', '月', '小時', '鐘頭', '禮拜', '星期'].includes(t.tradicional)) &&
                    !syn.tokens.some(t => ['今天', '明天', '昨天', '現在', '早上', '下午', '晚上', '週末'].includes(t.tradicional));
                // Si después del tiempo hay otro verbo (cláusula subordinada), no es un error
                const hasVerbAfterTime = syntagmas.slice(sIdx + 1).some(later => later.canonicalSlot === 'VERB_STATE');
                if (!isCopulaOrNaming && !isDuration && !hasVerbAfterTime) {
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
            if (syn.canonicalSlot === 'COMPANY' && verbSynIdx !== -1 && sIdx > verbSynIdx && !hasCopulaFocus) {
                const mainVerbHz = mainVerbSyn.tokens.map(t => t.tradicional).join('');
                const hasVerbAfterCompany = syntagmas.slice(sIdx + 1).some(later => later.canonicalSlot === 'VERB_STATE');
                if (!hasVerbAfterCompany) {
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
            }
        });

        // -----------------------------------------------------------------
        // REGLA 4: Error clásico `是 + Vs` (ej. 我是好 / 她是漂亮 / 咖啡是貴)
        // Excluye: `不是 + Vs` (L6), `不是 + 在` (L7) y `是...的`
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const prev = tokens[k - 1];
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            const afterNxt = tokens[k + 2];
            const hasFinalDe = tokens.slice(k + 2).some(t => t.tradicional === '的');
            const isNegatedCopula = prev && prev.tradicional === '不';
            if (cur.tradicional === '是' && !isNegatedCopula && isStateVerb(nxt) && nxt.tradicional !== '在' && !hasFinalDe && (!afterNxt || afterNxt.tradicional !== '的')) {
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
        // REGLA 5: Determinante (`Det`) o Numeral (`Num`) + Sustantivo (`N`) SIN Clasificador (`M`)
        // Ej: 這 + 人 -> 這 + 個 + 人; 三 + 書 -> 三 + 本 + 書; 這 + 兩 + 茶 -> 這 + 兩 + 杯 + 茶
        // -----------------------------------------------------------------
        const MEASURELESS_NOUNS = new Set(['天', '年', '月', '日', '號', '課', '樓', '歲', '次', '點', '分', '刻', '倍']);
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            const isQuantifier = (isPOS(cur, 'Det') || isNumeral(cur)) &&
                !hasTag(cur, 'hasMeasure') &&
                !hasTag(cur, 'frequencyPhrase') &&
                !['多少', '一次', '這些', '那些'].includes(cur.tradicional);
            const isDirectNoun = isNominalToken(nxt) &&
                !isTimeToken(nxt) &&
                !MEASURELESS_NOUNS.has(nxt.tradicional) &&
                !(cur.tradicional === '哪' && ['國', '裡'].includes(nxt.tradicional));

            if (isQuantifier && isDirectNoun) {
                const suggestedClf = resolvePreferredClassifier(nxt);
                const posLabel = isPOS(cur, 'Num') ? 'Num · Numeral' : 'Det · Determinante';
                issues.push({
                    code: 'DET_WITHOUT_MEASURE',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `Missing Measure Word (M · 量詞)` : `Falta el Clasificador (M · 量詞)`,
                    message: isEn
                        ? `Between «${cur.tradicional}» (${cur.posSymbol}) and noun «${nxt.tradicional}» (N), Chinese requires a Measure Word (M) following the [Det + Num + M + N] structure, such as «${suggestedClf.tradicional}» (${cur.tradicional}${suggestedClf.tradicional}${nxt.tradicional}).`
                        : `Entre «${cur.tradicional}» (${posLabel}) y el sustantivo «${nxt.tradicional}» (N) es obligatorio un Clasificador (M · 量詞) según la estructura [Det + Num + M + N], como «${suggestedClf.tradicional}» (${cur.tradicional}${suggestedClf.tradicional}${nxt.tradicional}).`,
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
        // (No se dispara si el adverbio modifica a un segundo verbo/predicado que viene a la derecha)
        // -----------------------------------------------------------------
        for (let k = 1; k < tokens.length; k++) {
            const prev = tokens[k - 1];
            const cur = tokens[k];
            const modifiesFollowingPredicate = tokens.slice(k + 1).some(t => isPOS(t, 'V'));
            if (isPOS(cur, 'Adv') && isPOS(prev, 'V') && !modifiesFollowingPredicate) {
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
            const hasAnotherVerbAfterNxt = tokens.slice(k + 2).some(t => isPOS(t, 'V'));
            if (isSeparableVerb(cur) && !cur.isSplitVerbHead && isPOS(nxt, 'N') && !isTimeToken(nxt) && !hasAnotherVerbAfterNxt) {
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

        // -----------------------------------------------------------------
        // REGLA 9: Error `*不 + 有` -> `有` siempre se niega con `沒` (`沒有`)
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            if (cur.tradicional === '不' && (nxt.tradicional === '有' || nxt.tradicional.startsWith('有'))) {
                issues.push({
                    code: 'BU_WITH_YOU',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `«有» is never negated with «不»` : `El verbo «有» nunca se niega con «不»`,
                    message: isEn
                        ? `In Mandarin, possession/existence «${nxt.tradicional}» is always negated with «沒» (沒有), never «*不${nxt.tradicional}».`
                        : `En mandarín, el verbo «${nxt.tradicional}» se niega exclusivamente con «沒» («沒有»), nunca con «*不${nxt.tradicional}».`,
                    fixLabel: isEn ? `🔄 Replace «不» with «沒»` : `🔄 Reemplazar «不» por «沒»`,
                    applyFix: (currentList) => {
                        const copy = [...currentList];
                        const meiWord = findLibraryWordByHanzi('沒') || CHAR_FALLBACK_METADATA['沒'];
                        copy[k] = Object.assign({}, meiWord, { id: meiWord.id || 'id_l6_mei', tradicional: '沒' });
                        return copy;
                    }
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 10: Error `*二 + Clasificador (M)` -> Uso obligatorio de `兩 + M`
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const prev = tokens[k - 1];
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            const isCompoundNumber = prev && ['十', '百', '千', '萬', '第'].includes(prev.tradicional);
            const isOrdinalOrCalendarUnit = ['月', '號', '日', '樓', '課'].includes(nxt.tradicional);
            if (cur.tradicional === '二' && isPOS(nxt, 'M') && !isCompoundNumber && !isOrdinalOrCalendarUnit) {
                issues.push({
                    code: 'ER_BEFORE_MEASURE',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `Use «兩» instead of «二» before Measure Words` : `Usa «兩» en lugar de «二» ante Clasificadores (M)`,
                    message: isEn
                        ? `Before a Measure Word like «${nxt.tradicional}», the quantity 2 must be «兩» («兩${nxt.tradicional}»), not «*二${nxt.tradicional}».`
                        : `Delante de un clasificador como «${nxt.tradicional}» (M), la cantidad 2 se expresa siempre con «兩» («兩${nxt.tradicional}»), nunca «*二${nxt.tradicional}».`,
                    fixLabel: isEn ? `🔄 Replace «二» with «兩»` : `🔄 Reemplazar «二» por «兩»`,
                    applyFix: (currentList) => {
                        const copy = [...currentList];
                        const liangWord = findLibraryWordByHanzi('兩') || CHAR_FALLBACK_METADATA['兩'];
                        copy[k] = Object.assign({}, liangWord, { id: liangWord.id || 'id_l4_liang', tradicional: '兩' });
                        return copy;
                    }
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 11: Alcance de `都` (`*都 + Sujeto`) y orden jerárquico de adverbios (`*都也`, `*不也`, `*沒也`)
        // -----------------------------------------------------------------
        if (tokens.length >= 2 && tokens[0].tradicional === '都' && (isPOS(tokens[1], 'N') || isPersonOrPronoun(tokens[1]))) {
            issues.push({
                code: 'DOU_BEFORE_SUBJECT',
                severity: 'error',
                offendingTokenIndices: [0, 1],
                title: isEn ? `Scope Adverb «都» must follow the Subject` : `El adverbio «都» debe ir después del Sujeto`,
                message: isEn
                    ? `«都» (all/both) totalizes the element to its LEFT. Place the subject «${tokens[1].tradicional}» before «都» («${tokens[1].tradicional}都...»).`
                    : `«都» (todos/ambos) cuantifica a los elementos que están a su IZQUIERDA. Coloca el sujeto «${tokens[1].tradicional}» antes de «都» («${tokens[1].tradicional}都...»).`,
                fixLabel: isEn ? `🧲 Move «都» after «${tokens[1].tradicional}»` : `🧲 Imantar «都» después de «${tokens[1].tradicional}»`,
                applyFix: (currentList) => moveTokenSlice(currentList, 0, 0, 2)
            });
        }
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            if ((cur.tradicional === '都' && nxt.tradicional === '也') ||
                (['不', '沒'].includes(cur.tradicional) && ['也', '都', '常'].includes(nxt.tradicional))) {
                issues.push({
                    code: 'ADVERB_ORDER_ERROR',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `Adverb Hierarchy: «${nxt.tradicional}» precedes «${cur.tradicional}»` : `Jerarquía Adverbial: «${nxt.tradicional}» va antes que «${cur.tradicional}»`,
                    message: isEn
                        ? `In Mandarin adverbial order, «${nxt.tradicional}» must precede «${cur.tradicional}» («${nxt.tradicional}${cur.tradicional}», not «*${cur.tradicional}${nxt.tradicional}»).`
                        : `En la jerarquía de adverbios del mandarín, «${nxt.tradicional}» siempre precede a «${cur.tradicional}» («${nxt.tradicional}${cur.tradicional}», nunca «*${cur.tradicional}${nxt.tradicional}»).`,
                    fixLabel: isEn ? `🔄 Swap to «${nxt.tradicional}${cur.tradicional}»` : `🔄 Invertir a «${nxt.tradicional}${cur.tradicional}»`,
                    applyFix: (currentList) => moveTokenSlice(currentList, k + 1, k + 1, k)
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 12: Duplicación interrogativa `*A-not-A + 嗎` (ej. *你是不是台灣人嗎？)
        // -----------------------------------------------------------------
        const lastTok = tokens[tokens.length - 1];
        if (lastTok && lastTok.tradicional === '嗎') {
            let aNotAIndices = null;
            for (let k = 0; k < tokens.length - 1; k++) {
                const hz = tokens[k].tradicional;
                if (['是不是', '要不要', '有沒有', '好不好', '對不對', '可不可以'].includes(hz)) {
                    aNotAIndices = [k, tokens.length - 1];
                    break;
                }
                if (k + 2 < tokens.length && ['不', '沒'].includes(tokens[k + 1].tradicional) && tokens[k].tradicional === tokens[k + 2].tradicional) {
                    aNotAIndices = [k, k + 1, k + 2, tokens.length - 1];
                    break;
                }
            }
            if (aNotAIndices) {
                issues.push({
                    code: 'A_NOT_A_WITH_MA',
                    severity: 'error',
                    offendingTokenIndices: aNotAIndices,
                    title: isEn ? `Redundant Question: Do not combine A-not-A with «嗎»` : `Doble pregunta: No combines A-not-A con «嗎»`,
                    message: isEn
                        ? `An A-not-A structure (like «是不是» or «V不V») is already a question and cannot take final particle «嗎».`
                        : `La estructura A-not-A (como «是不是», «要不要» o «V不V») ya es una pregunta por sí misma y no admite la partícula «嗎» al final.`,
                    fixLabel: isEn ? `🗑️ Remove redundant «嗎»` : `🗑️ Eliminar «嗎» redundante`,
                    applyFix: (currentList) => currentList.slice(0, -1)
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 13: Conjunción `和` uniendo verbos (`*我吃飯和喝茶`)
        // -----------------------------------------------------------------
        for (let k = 1; k < tokens.length - 1; k++) {
            const prev = tokens[k - 1];
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            const prevIsVerbal = isPOS(prev, 'V') || prev.isSplitVerbObject || (k >= 2 && isPOS(tokens[k - 2], 'V') && isPOS(prev, 'N'));
            const nxtIsVerbal = isPOS(nxt, 'V') || isAuxVerb(nxt);
            if (cur.tradicional === '和' && prevIsVerbal && nxtIsVerbal) {
                issues.push({
                    code: 'HE_LINKING_VERBS',
                    severity: 'error',
                    offendingTokenIndices: [k],
                    title: isEn ? `Conjunction «和» only links Nouns, never Verbs` : `La conjunción «和» solo une sustantivos, nunca verbos`,
                    message: isEn
                        ? `In Chinese, «和» can only connect nouns/pronouns (A 和 B). To link two verb phrases, use adverb «也» before the second verb.`
                        : `En mandarín, «和» solo conecta sustantivos o pronombres. Para unir dos acciones o predicados verbales, usa el adverbio «也» antes del segundo verbo.`,
                    fixLabel: isEn ? `🔄 Replace «和» with «也»` : `🔄 Reemplazar «和» por «也»`,
                    applyFix: (currentList) => {
                        const copy = [...currentList];
                        const yeWord = findLibraryWordByHanzi('也') || CHAR_FALLBACK_METADATA['也'];
                        copy[k] = Object.assign({}, yeWord, { id: yeWord.id || 'id_mtfia47l_k3g42', tradicional: '也' });
                        return copy;
                    }
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 14: Progresivo `*在 + Verbo de Estado (Vs)` (ej. *手機在貴 / *天氣在熱)
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            if (cur.tradicional === '在' && isStateVerb(nxt) && !['忙', '一起', '在'].includes(nxt.tradicional)) {
                issues.push({
                    code: 'PROGRESSIVE_ZAI_WITH_VS',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `Progressive «在» cannot modify State Verbs (Vs)` : `El progresivo «在» no se usa con Verbos de Estado (Vs)`,
                    message: isEn
                        ? `State verb «${nxt.tradicional}» (${nxt.posSymbol}) describes a quality/state, not an ongoing action. Use degree adverb «很» instead of «在».`
                        : `«${nxt.tradicional}» (${nxt.posSymbol}) es un verbo de estado estático, no una acción en progreso. Usa «很${nxt.tradicional}» en lugar de «*在${nxt.tradicional}».`,
                    fixLabel: isEn ? `🔄 Replace «在» with «很»` : `🔄 Reemplazar «在» por «很»`,
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
        // REGLA 15: Jerarquía Temporal Invertida `Menor → Mayor` (ej. *晚上明天 / *八點早上)
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            const r1 = getTimeHierarchyRank(cur);
            const r2 = getTimeHierarchyRank(nxt);
            if (r1 > 0 && r2 > 0 && r1 > r2) {
                issues.push({
                    code: 'REVERSED_TIME_HIERARCHY',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `Time Hierarchy: Larger unit must precede smaller unit` : `Jerarquía Temporal: De la unidad mayor a la menor`,
                    message: isEn
                        ? `Chinese time expressions strictly follow the Macro-to-Micro order: «${nxt.tradicional}» (larger) must come before «${cur.tradicional}» (smaller).`
                        : `En chino el tiempo sigue estrictamente el orden Mayor → Menor: «${nxt.tradicional}» debe ir antes que «${cur.tradicional}» («${nxt.tradicional}${cur.tradicional}»).`,
                    fixLabel: isEn ? `🔄 Swap to «${nxt.tradicional}${cur.tradicional}»` : `🔄 Ordenar como «${nxt.tradicional}${cur.tradicional}»`,
                    applyFix: (currentList) => moveTokenSlice(currentList, k + 1, k + 1, k)
                });
            }
        }

        // -----------------------------------------------------------------
        // REGLA 16: Comparación con `比` + Adverbio de grado absoluto (`*比 + B + 很/非常/真/太 + Vs`) (L8)
        // -----------------------------------------------------------------
        const biIdx = tokens.findIndex(t => t.tradicional === '比');
        if (biIdx !== -1) {
            for (let k = biIdx + 1; k < tokens.length - 1; k++) {
                const cur = tokens[k];
                const nxt = tokens[k + 1];
                if (['很', '非常', '真', '太'].includes(cur.tradicional) && isStateVerb(nxt)) {
                    issues.push({
                        code: 'BI_WITH_DEGREE_ADV',
                        severity: 'error',
                        offendingTokenIndices: [k, k + 1],
                        title: isEn ? `Do not use «${cur.tradicional}» in «比» comparisons` : `No uses «${cur.tradicional}» en comparaciones con «比»`,
                        message: isEn
                            ? `In a «比» comparison (A 比 B + Vs), degree adverbs like «${cur.tradicional}» cannot precede «${nxt.tradicional}». Use «${nxt.tradicional}» directly or «${nxt.tradicional}得多 / ${nxt.tradicional}一點».`
                            : `En la estructura comparativa «A 比 B + Vs», no se colocan adverbios de grado absoluto como «${cur.tradicional}» antes de «${nxt.tradicional}». Usa «${nxt.tradicional}» directamente.`,
                        fixLabel: isEn ? `🗑️ Remove «${cur.tradicional}»` : `🗑️ Eliminar «${cur.tradicional}»`,
                        applyFix: (currentList) => currentList.filter((_, idx) => idx !== k)
                    });
                }
            }
        }

        // -----------------------------------------------------------------
        // REGLA 17: Negación mal colocada con `比較` (`*不比較 + Vs` -> `比較不 + Vs`) (L8)
        // -----------------------------------------------------------------
        for (let k = 0; k < tokens.length - 1; k++) {
            const cur = tokens[k];
            const nxt = tokens[k + 1];
            if (['不', '沒'].includes(cur.tradicional) && nxt.tradicional === '比較') {
                issues.push({
                    code: 'BU_BEFORE_BIJIAO',
                    severity: 'error',
                    offendingTokenIndices: [k, k + 1],
                    title: isEn ? `Order with «比較»: «比較${cur.tradicional}», not «*${cur.tradicional}比較»` : `Orden con «比較»: se dice «比較${cur.tradicional}», no «*${cur.tradicional}比較»`,
                    message: isEn
                        ? `When negating a «比較» comparison, «比較» precedes the negation: «比較${cur.tradicional} + Vs» (relatively not...), never «*${cur.tradicional}比較».`
                        : `Al negar con el adverbio comparativo «比較», éste siempre precede a la negación: «比較${cur.tradicional}...», nunca «*${cur.tradicional}比較».`,
                    fixLabel: isEn ? `🔄 Swap to «比較${cur.tradicional}»` : `🔄 Invertir a «比較${cur.tradicional}»`,
                    applyFix: (currentList) => moveTokenSlice(currentList, k + 1, k + 1, k)
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
     * Soporta el flujo completo Det + Num + M + N.
     * @param {object} draggedWord
     * @param {Array<object>} currentRawTokens
     * @param {string} [lang='es']
     * @returns {Array<{ targetTokenIndex: number, slotId: string, label: string, color: string, reason: string }>}
     */
    const computeGhostSlots = (draggedWord, currentRawTokens, lang = 'es') => {
        if (!draggedWord) return [];
        const tok = normalizeToken(draggedWord, -1);
        const rawNorm = (currentRawTokens || []).map((t, idx) => normalizeToken(t, idx)).filter(Boolean);
        const tokens = resolveContextualHomographs(rawNorm);
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

        // 2. Preposición (在, 跟, 給, 從, 到): antes del verbo
        if (isPOS(tok, 'Prep')) {
            const idx = Math.min(afterSubjTokenIdx, firstVerbTokenIdx);
            ghosts.push({
                targetTokenIndex: idx,
                slotId: (tok.tradicional === '在' || tok.tradicional === '到') ? 'PLACE' : 'COMPANY',
                label: (tok.tradicional === '在' || tok.tradicional === '到')
                    ? (isEn ? `+ WHERE (${tok.tradicional} + Place)` : `+ DÓNDE (${tok.tradicional} + Lugar)`)
                    : (isEn ? `+ SCOPE (${tok.tradicional} + N)` : `+ ÁMBITO (${tok.tradicional} + N)`),
                color: (tok.tradicional === '在' || tok.tradicional === '到') ? '#3B6998' : '#0E7490'
            });
            return ghosts;
        }

        // 3. Lugar (N[place]): si hay '在'/'到' sin objeto, justo después; si no, al final como destino
        if (isPlaceToken(tok)) {
            const zaiIdx = tokens.findIndex(t => t.tradicional === '在' || t.tradicional === '到');
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

        // 4. Numeral (Num): justo después de un Determinante (Det) o antes de un Clasificador (M)
        if (isPOS(tok, 'Num')) {
            const detIdx = tokens.findIndex(t => isPOS(t, 'Det'));
            if (detIdx !== -1) {
                const isObj = firstVerbSyn && detIdx > firstVerbTokenIdx;
                ghosts.push({
                    targetTokenIndex: detIdx + 1,
                    slotId: isObj ? 'OBJECT' : 'TOPIC_SUBJ',
                    label: isEn ? '+ FUSE NUMERAL (Det + Num)' : '+ FUSIONAR NUMERAL (Det + Num)',
                    color: '#D97706'
                });
            }
            const mIdx = tokens.findIndex(t => isPOS(t, 'M'));
            if (mIdx !== -1 && (detIdx === -1 || mIdx !== detIdx + 1)) {
                ghosts.push({
                    targetTokenIndex: mIdx,
                    slotId: firstVerbSyn && mIdx > firstVerbTokenIdx ? 'OBJECT' : 'TOPIC_SUBJ',
                    label: isEn ? '+ QUANTITY BEFORE M (Num + M)' : '+ CANTIDAD ANTES DE M (Num + M)',
                    color: '#D97706'
                });
            }
            ghosts.push({
                targetTokenIndex: tokens.length,
                slotId: firstVerbSyn ? 'OBJECT' : 'TOPIC_SUBJ',
                label: isEn ? '+ NUMERAL (Num)' : '+ NUMERAL (Num)',
                color: '#D97706'
            });
            return ghosts;
        }

        // 5. Clasificador (M): justo después de un Numeral (Num) o Determinante (Det)
        if (isPOS(tok, 'M')) {
            let quantIdx = -1;
            for (let k = tokens.length - 1; k >= 0; k--) {
                if (isNumeral(tokens[k]) || isPOS(tokens[k], 'Det')) {
                    quantIdx = k;
                    break;
                }
            }
            if (quantIdx !== -1) {
                const isObj = firstVerbSyn && quantIdx > firstVerbTokenIdx;
                ghosts.push({
                    targetTokenIndex: quantIdx + 1,
                    slotId: isObj ? 'OBJECT' : 'TOPIC_SUBJ',
                    label: isEn ? '+ FUSE MEASURE (Det/Num + M)' : '+ FUSIONAR CLASIFICADOR (Det/Num + M)',
                    color: isObj ? '#8D5B4C' : '#2E78B7'
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

        // 6. Adverbio o Verbo Auxiliar (Adv / Vaux): justo antes del Verbo o Estado
        if (isPOS(tok, 'Adv') || isAuxVerb(tok)) {
            ghosts.push({
                targetTokenIndex: firstVerbTokenIdx,
                slotId: 'ADV_MODAL',
                label: isEn ? '+ MODIFY ACTION/STATE' : '+ MODIFICAR ACCIÓN / ESTADO',
                color: '#0D9488'
            });
            return ghosts;
        }

        // 7. Verbo o Verbo de Estado (V / Vs / Vst / V-sep): en el núcleo predicativo
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

        // 8. Partícula (Ptc): al final o después del verbo/nombre
        if (isPOS(tok, 'Ptc')) {
            ghosts.push({
                targetTokenIndex: tokens.length,
                slotId: 'FINAL_PTC',
                label: isEn ? '+ PARTICLE (Ptc)' : '+ PARTÍCULA (Ptc)',
                color: '#7D54B5'
            });
            return ghosts;
        }

        // 9. Sustantivo / Pronombre / Determinante (N / Det):
        // Si hay un Clasificador (M) sin sustantivo, ofrecer fusionar Det + Num + M + N
        let lastMeasureIdx = -1;
        for (let k = tokens.length - 1; k >= 0; k--) {
            if (isPOS(tokens[k], 'M') && (!tokens[k + 1] || !isPOS(tokens[k + 1], 'N'))) {
                lastMeasureIdx = k;
                break;
            }
        }
        if (isPOS(tok, 'N') && lastMeasureIdx !== -1) {
            const isObj = firstVerbSyn && lastMeasureIdx > firstVerbTokenIdx;
            ghosts.push({
                targetTokenIndex: lastMeasureIdx + 1,
                slotId: isObj ? 'OBJECT' : 'TOPIC_SUBJ',
                label: isEn ? '+ COMPLETE NP ([Det+Num+M] + N)' : '+ COMPLETAR SN ([Det+Num+M] + N)',
                color: isObj ? '#8D5B4C' : '#2E78B7'
            });
        }

        if (!firstSubjSyn) {
            ghosts.push({
                targetTokenIndex: 0,
                slotId: 'TOPIC_SUBJ',
                label: isEn ? '+ WHO / SUBJECT' : '+ QUIÉN / SUJETO',
                color: '#2E78B7'
            });
        }
        if (lastMeasureIdx === -1 || lastMeasureIdx + 1 !== tokens.length) {
            ghosts.push({
                targetTokenIndex: tokens.length,
                slotId: firstVerbSyn ? 'OBJECT' : 'TOPIC_SUBJ',
                label: firstVerbSyn
                    ? (isEn ? '+ WHAT / OBJECT' : '+ QUÉ / OBJETO')
                    : (isEn ? '+ SUBJECT / NOUN' : '+ SUJETO / SUSTANTIVO'),
                color: firstVerbSyn ? '#8D5B4C' : '#2E78B7'
            });
        }
        return ghosts;
    };

    /**
     * Expande un verbo separable (`V-sep` / `Vs-sep`) en sus 2 átomos constituyentes (`唱` + `歌`)
     * con un `splitGroupId` único por operación para evitar colisiones entre múltiples verbos separables.
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
        const splitGroupId = `split_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        const headAtom = {
            id: `sep_head_${target.id}_${splitGroupId}`,
            tradicional: parts[0],
            pinyin: pyHead,
            espanol: `${target.espanol} (verbo)`,
            english: `${target.english || target.espanol} (verb)`,
            categoria: 'V',
            posSymbol: 'V',
            verbSubtype: 'V',
            isSplitVerbHead: true,
            splitGroupId,
            parentSepWord: target.tradicional,
            semanticTags: ['action']
        };

        const objAtom = {
            id: `sep_obj_${target.id}_${splitGroupId}`,
            tradicional: parts[1],
            pinyin: pyObj,
            espanol: `${target.espanol} (objeto interno)`,
            english: `${target.english || target.espanol} (inner object)`,
            categoria: 'N',
            posSymbol: 'N',
            isSplitVerbObject: true,
            splitGroupId,
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

    function findLibraryWordByHanzi(hanzi, preferredCategory = null) {
        if (typeof getAllWords !== 'function') return null;
        const all = getAllWords();
        if (preferredCategory) {
            const exact = all.find(w => w.tradicional === hanzi && w.categoria === preferredCategory);
            if (exact) return exact;
        }
        return all.find(w => w.tradicional === hanzi) || null;
    }

    function resolvePreferredClassifier(nounToken) {
        if (nounToken && nounToken.clasificador && typeof getWordById === 'function') {
            const clf = getWordById(nounToken.clasificador);
            if (clf) return clf;
        }
        return findLibraryWordByHanzi('個', 'M') || CHAR_FALLBACK_METADATA['個'];
    }

    return {
        normalizeToken,
        resolveContextualHomographs,
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
