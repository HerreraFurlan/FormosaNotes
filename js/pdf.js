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
 * Builds a single front-side PDF card as an HTML string.
 */
const buildFrontCard = (word, showPinyin = true, showZhuyin = true, showCategory = true) => {
    const color = showCategory ? (PDF_COLORS[word.categoria] || '#999') : '#94A3B8';
    const charLen = (word.tradicional || '').length;
    const pdfCharSize = charLen <= 1 ? '3.5rem' : charLen === 2 ? '2.8rem' : charLen === 3 ? '2.2rem' : charLen === 4 ? '1.75rem' : '1.4rem';
    const pdfPinyinSize = (word.pinyin || '').length > 16 ? '0.9rem' : '1.1rem';
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
            <div style="font-family:'Noto Sans TC',sans-serif;font-size:${pdfCharSize};font-weight:700;color:#0F172A;line-height:1.2;margin-bottom:8px;text-align:center;width:100%;word-break:break-word;">
                ${word.tradicional}
            </div>
            ${showPinyin ? `
            <div style="font-size:${pdfPinyinSize};color:${color};font-weight:600;text-align:center;width:100%;word-break:break-word;-webkit-print-color-adjust: exact;print-color-adjust: exact;">
                ${word.pinyin}
            </div>
            ` : ''}
            ${showZhuyin && word.zhuyin ? `
            <div style="font-family:'Noto Sans TC',sans-serif;font-size:0.85rem;color:#94A3B8;margin-top:4px;text-align:center;">
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
    let detailRows = '';

    detailRows += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #E5E7EB;font-size:0.8rem;">
        <span style="color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Pinyin</span>
        <span style="font-weight:600;color:#0F172A;">${word.pinyin}</span>
    </div>`;

    detailRows += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #E5E7EB;font-size:0.8rem;">
        <span style="color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Zhuyin</span>
        <span style="font-weight:600;color:#0F172A;font-family:'Noto Sans TC',sans-serif;">${word.zhuyin || '—'}</span>
    </div>`;

    if (word.clasificador) {
        const clf = getAllWords().find(w => w.id === word.clasificador);
        const clfText = clf ? `${clf.tradicional} ${clf.pinyin}` : word.clasificador;
        detailRows += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #E5E7EB;font-size:0.8rem;">
            <span style="color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Clasificador</span>
            <span style="font-weight:600;color:#0F172A;">${clfText}</span>
        </div>`;
    }

    if (word.radicales) {
        let radText = '';
        if (Array.isArray(word.radicales)) {
            radText = word.radicales.map(rad => {
                if (rad.type === 'text') return rad.value;
                if (rad.type === 'ref') {
                    const refWord = getAllWords().find(w => w.id === rad.id);
                    return refWord ? `${refWord.tradicional} (${refWord.espanol})` : '';
                }
                return '';
            }).join(' + ');
        } else {
            radText = word.radicales;
        }
        if (radText) {
            detailRows += `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.8rem;">
                <span style="color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Radical</span>
                <span style="font-weight:600;color:#0F172A;">${radText}</span>
            </div>`;
        }
    }

    return `
        <div style="
            border: 2px solid #D1D5DB;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 20px 20px;
            position: relative;
            overflow: hidden;
            background: #fff;
            box-sizing: border-box;
            gap: 8px;
            height: 100%;
        ">
            <div style="position:absolute;top:0;left:0;right:0;height:6px;background:${color};border-radius:12px 12px 0 0;-webkit-print-color-adjust: exact;print-color-adjust: exact;"></div>
            <div style="font-family:'Noto Sans TC',sans-serif;font-size:1.8rem;font-weight:700;color:#94A3B8;margin-bottom:0px;margin-top:16px;line-height:1;">
                ${word.tradicional}
            </div>
            <div style="font-size:1.25rem;font-weight:800;color:#0F172A;margin-bottom:8px;text-align:center;">
                ${word.espanol}
            </div>
            <div style="width:100%;display:flex;flex-direction:column;gap:4px;">
                ${detailRows}
            </div>
            ${word.notas ? `
            <div style="font-size:0.85rem;color:#94A3B8;text-align:center;margin-top:auto;padding-top:8px;line-height:1.3;font-weight:500;">
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
