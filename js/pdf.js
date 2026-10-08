/**
 * =====================================================
 * AppChino — pdf.js (Native Print Version)
 * PDF generation via the browser's native print engine.
 *
 * Layout per sheet:
 *   - 6 cards per page (2 columns × 3 rows)
 *   - Page N: FRONT faces (character + pinyin + zhuyin)
 *   - Page N+1: BACK faces (spanish + details), columns
 *     mirrored per row for long-edge duplex printing
 * =====================================================
 */

const CARDS_PER_PAGE = 6;

/**
 * Gets active Chinese font stack for PDF rendering
 */
const getPdfChineseFont = () => {
    return getComputedStyle(document.documentElement).getPropertyValue('--font-chinese').trim() || "'DFKai-SB', '標楷體', 'BiauKai', 'KaiTi', serif";
};

/**
 * Builds a single front-side PDF card as an HTML string.
 */
const buildFrontCard = (word, showPinyin = true, showZhuyin = true, showCategory = true) => {
    const color = showCategory ? (PDF_COLORS[word.categoria] || '#999') : '#94A3B8';
    const charLen = (word.tradicional || '').length;
    const pdfCharSize = charLen <= 1 ? '3.5rem' : charLen === 2 ? '2.8rem' : charLen === 3 ? '2.2rem' : charLen === 4 ? '1.75rem' : '1.4rem';
    const pdfPinyinSize = (word.pinyin || '').length > 16 ? '0.9rem' : '1.1rem';
    const chineseFont = getPdfChineseFont();
    return `
        <div style="
            border: 2px solid #D1D5DB;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            position: relative;
            overflow: hidden;
            background: #fff;
            box-sizing: border-box;
            height: 100%;
            text-align: center;
        ">
            <div style="position:absolute;top:0;left:0;right:0;height:6px;background:${color};border-radius:12px 12px 0 0;-webkit-print-color-adjust: exact;print-color-adjust: exact;"></div>
            <div style="font-family:${chineseFont};font-size:${pdfCharSize};font-weight:700;color:#0F172A;line-height:1.2;margin-bottom:8px;text-align:center;width:100%;word-break:break-word;">
                ${word.tradicional}
            </div>
            ${showPinyin ? `
            <div style="font-size:${pdfPinyinSize};color:${color};font-weight:600;text-align:center;width:100%;word-break:break-word;-webkit-print-color-adjust: exact;print-color-adjust: exact;">
                ${word.pinyin}
            </div>
            ` : ''}
            ${showZhuyin && word.zhuyin ? `
            <div style="font-family:${chineseFont};font-size:0.85rem;color:#94A3B8;margin-top:4px;text-align:center;">
                ${word.zhuyin}
            </div>
            ` : ''}
        </div>
    `;
};

/**
 * Builds a single back-side PDF card as an HTML string.
 */
const buildBackCard = (word, showCategory = true) => {
    const color = showCategory ? (PDF_COLORS[word.categoria] || '#999') : '#94A3B8';
    
    let clfText = '';
    if (word.clasificador) {
        const clf = getAllWords().find(w => w.id === word.clasificador);
        clfText = clf ? `${clf.tradicional} (${clf.pinyin})` : word.clasificador;
    }

    let radText = '';
    if (word.radicales) {
        if (Array.isArray(word.radicales)) {
            radText = word.radicales.map(rad => {
                if (rad.type === 'text') return rad.value;
                if (rad.type === 'ref') {
                    const refWord = getAllWords().find(w => w.id === rad.id);
                    return refWord ? `${refWord.tradicional} (${refWord.espanol})` : '';
                }
                return '';
            }).filter(Boolean).join(' + ');
        } else {
            radText = word.radicales;
        }
    }

    const chineseFont = getPdfChineseFont();
    return `
        <div style="
            border: 2px solid #D1D5DB;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            position: relative;
            overflow: hidden;
            background: #fff;
            box-sizing: border-box;
            height: 100%;
            text-align: center;
        ">
            <div style="position:absolute;top:0;left:0;right:0;height:6px;background:${color};border-radius:12px 12px 0 0;-webkit-print-color-adjust: exact;print-color-adjust: exact;"></div>
            
            <div style="margin: auto 0; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
                <div style="font-size: 1.35rem; font-weight: 800; color: #0F172A; text-align: center; line-height: 1.25; word-break: break-word;">
                    ${word.espanol}
                </div>
                
                <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2px;">
                    <div style="font-size: 1.15rem; font-weight: 700; color: ${color}; line-height: 1.2; word-break: break-word; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                        ${word.pinyin}
                    </div>
                    ${word.zhuyin ? `
                    <div style="font-family: ${chineseFont}; font-size: 0.85rem; color: #64748B; line-height: 1.2;">
                        ${word.zhuyin}
                    </div>
                    ` : ''}
                </div>

                ${(clfText || radText) ? `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; margin-top: 4px; font-size: 0.82rem; text-align: center; width: 100%;">
                    ${clfText ? `<div style="font-weight: 600; color: #334155;">${clfText}</div>` : ''}
                    ${radText ? `<div style="font-family: ${chineseFont}; color: #64748B; font-size: 0.8rem;">${radText}</div>` : ''}
                </div>
                ` : ''}
            </div>

            ${word.notas ? `
            <div style="font-size: 0.78rem; color: #64748B; text-align: center; margin-top: auto; padding: 6px 8px; line-height: 1.3; font-weight: 500; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; width: 100%; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                ${word.notas}
            </div>
            ` : ''}
        </div>
    `;
};

/**
 * Builds an empty placeholder card (for pages with < 6 cards).
 */
const buildEmptyCard = () => {
    return `<div style="border:2px dashed #E5E7EB;border-radius:12px;background:#FAFAFA;-webkit-print-color-adjust: exact;print-color-adjust: exact;height: 100%;"></div>`;
};

/**
 * Creates a full PDF page element.
 * Contains a 2×3 grid of card HTML strings.
 * @param {string[]} cardHTMLs - Array of 6 card HTML strings
 * @returns {string} HTML for one page
 */
const buildPage = (cardHTMLs) => {
    // Ensure exactly 6 slots
    while (cardHTMLs.length < CARDS_PER_PAGE) {
        cardHTMLs.push(buildEmptyCard());
    }

    return `
        <div class="print-page" style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr;
            gap: 20px;
            width: 100%;
            height: 100vh;
        ">
            ${cardHTMLs.join('')}
        </div>
    `;
};

/**
 * Main export function using window.print()
 */
const exportPDF = () => {
    const checked = document.querySelectorAll('#export-grid input[type="checkbox"]:checked');
    if (checked.length === 0) {
        showToast('Selecciona al menos una flashcard para exportar', 'error');
        return;
    }

    const selectedIds = Array.from(checked).map(cb => cb.dataset.id);
    const words = getAllWords().filter(w => selectedIds.includes(w.id));

    // Chunk words into groups of 6
    const chunks = [];
    for (let i = 0; i < words.length; i += CARDS_PER_PAGE) {
        chunks.push(words.slice(i, i + CARDS_PER_PAGE));
    }

    const showPinyin = document.getElementById('print-toggle-pinyin').checked;
    const showZhuyin = document.getElementById('print-toggle-zhuyin').checked;
    const showCategory = document.getElementById('print-toggle-categoria').checked;

    let pagesHTML = '';
    chunks.forEach(chunk => {
        // --- FRONT PAGE ---
        const frontCards = chunk.map(w => buildFrontCard(w, showPinyin, showZhuyin, showCategory));
        pagesHTML += buildPage([...frontCards]);

        // --- BACK PAGE (columns mirrored per row for duplex printing) ---
        const backCards = [];
        for (let row = 0; row < 3; row++) {
            const left = chunk[row * 2];
            const right = chunk[row * 2 + 1];
            backCards.push(right ? buildBackCard(right, showCategory) : buildEmptyCard());
            backCards.push(left ? buildBackCard(left, showCategory) : buildEmptyCard());
        }
        pagesHTML += buildPage(backCards);
    });

    // Create the print container
    let printArea = document.getElementById('print-area');
    if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'print-area';
        printArea.style.display = 'none';
        document.body.appendChild(printArea);
    }

    printArea.innerHTML = pagesHTML;

    // Remove event listener if previously attached to avoid duplicates
    window.onafterprint = null;

    // Listen for print completion/cancellation to clean up
    window.onafterprint = () => {
        printArea.innerHTML = '';
        showToast(`Proceso completado`, 'success');
    };

    // Give the browser a moment to render the DOM changes before opening print dialog
    setTimeout(() => {
        window.print();
    }, 100);
};
