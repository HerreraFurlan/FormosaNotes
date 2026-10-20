/**
 * =====================================================
 * AppChino — i18n.js
 * Internationalization module: Spanish / English.
 * =====================================================
 */

const I18N_DICT = {
    es: {
        appTitle: "Formosa Notes - Flashcards de Chino",
        appSubtitle: "Mandarín Tradicional",
        // Navigation
        navMain: "Principal",
        navLibrary: "Biblioteca",
        navBuilder: "Constructor",
        navStructures: "Estructuras",
        navStudyHeader: "Estudio",
        navStudy: "Modo Estudio",
        navPractice: "Práctica de oraciones",
        navExam: "Simulación de examen",
        navTools: "Herramientas",
        navExport: "Imprimir Flashcards",
        navSettings: "Configuración",
        navExportJson: "Exportar Datos",
        navImportJson: "Importar Datos",
        collapseMenu: "Colapsar menú",
        expandMenu: "Expandir menú",
        // Library
        searchPlaceholder: "Buscar tarjetas",
        newWordBtn: "Nueva Palabra",
        lessonLabel: "Lección:",
        categoryLabel: "Categoría:",
        allLessons: "Todas",
        allCategories: "Todos",
        noCardsFound: "No se encontraron tarjetas con los filtros actuales.",
        // Categories
        catNoun: "Sustantivos",
        catPronoun: "Pronombres",
        catClassifier: "Clasificadores",
        catVerb: "Verbos",
        catAdverb: "Adverbios",
        catAdjective: "Adjetivos",
        catExpression: "Expresiones",
        catParticle: "Partículas",
        catStructure: "Estructuras",
        // Singular category labels
        cat_sustantivo: "Sustantivo",
        cat_pronombre: "Pronombre",
        cat_clasificador: "Clasificador",
        cat_verbo: "Verbo",
        cat_adverbio: "Adverbio",
        cat_adjetivo: "Adjetivo",
        cat_expresion: "Expresión",
        cat_particula: "Partícula",
        cat_estructura: "Estructura",
        // Card back
        cardClassifier: "Clasificador",
        cardRadicals: "Radicales / Componentes",
        cardNotes: "Notas",
        cardEdit: "Editar",
        cardDelete: "Eliminar",
        cardSelectPrint: "Seleccionar para exportar",
        // Builder
        builderHeader: "Zona de Construcción",
        builderClear: "Limpiar zona",
        builderEmptyDropzone: "Arrastra palabras aquí o selecciónalas abajo",
        builderQuickInputPlaceholder: "Escribe los caracteres o buscalos por significado, pinyin o zhuyin",
        builderAdd: "Agregar",
        builderStructureName: "Nombre de la estructura",
        builderStructureNamePh: "Ej: Afirmación con 是",
        builderFormula: "Fórmula",
        builderFormulaPh: "Ej: S + 是 + N",
        builderTranslation: "Traducción al español",
        builderTranslationPh: "Ej: Yo soy una persona",
        builderExamineBtn: "🪄 Examinar Oración",
        builderSaveBtn: "Guardar Estructura",
        builderBankTitle: "Banco de Palabras",
        // Structures
        structuresEmpty: "No hay estructuras registradas",
        structFormula: "Fórmula",
        structExample: "Ejemplo",
        structTranslation: "Traducción",
        structNotes: "Notas",
        structUseInBuilder: "Usar en constructor",
        // Study mode
        studyShowCategory: "Mostrar categoría",
        studyShowNotes: "Mostrar notas (reverso)",
        studyShowRadicals: "Mostrar radicales (reverso)",
        studyCardOf: "Tarjeta {current} de {total}",
        studyPrev: "Anterior",
        studyFlip: "Voltear",
        studyNext: "Siguiente",
        studyShuffle: "Barajar",
        studyFlipHint: "Haz clic en la tarjeta o presiona Espacio para voltear",
        studyEmpty: "No hay tarjetas disponibles con estos filtros.",
        studyNoLessonCat: "Prueba seleccionando otras lecciones o categorías en la barra superior.",
        // Practice & Exam
        practiceTitle: "Práctica de oraciones",
        examTitle: "Simulación de examen",
        // Export / Print
        printSearchPlaceholder: "Buscar tarjetas",
        printSelectAll: "Seleccionar todas",
        printDeselectAll: "Deseleccionar todas",
        printSelectedCount: "{count} seleccionadas",
        printBtn: "Imprimir Flashcards",
        printPinyin: "Pinyin",
        printZhuyin: "Zhuyin",
        printCategory: "Categoría",
        // Dialogs
        wordDialogNewTitle: "Nueva Palabra",
        wordDialogEditTitle: "Editar Palabra",
        wordDialogMeaning: "Significado en español *",
        wordDialogMeaningPh: "Ej: Gato",
        wordDialogCategory: "Categoría *",
        wordDialogTrad: "Caracteres tradicionales *",
        wordDialogTradPh: "Ej: 貓",
        wordDialogPinyin: "Pinyin *",
        wordDialogPinyinPh: "Ej: māo",
        wordDialogPinyinHint: "Escribe tonos con números (ej: a2 → á, hao3 → hǎo)",
        wordDialogZhuyin: "Zhuyin (Bopomofo)",
        wordDialogZhuyinPh: "Ej: ㄇㄠ",
        wordDialogClassifier: "Clasificador",
        wordDialogNone: "Ninguno",
        wordDialogLesson: "Lección (1 a 8 o ninguna)",
        wordDialogRadicals: "Radicales / Componentes",
        wordDialogFreeText: "Texto Libre",
        wordDialogLibrary: "Biblioteca",
        wordDialogRadicalSearchPh: "Buscar tarjetas",
        wordDialogRadicalHint: "Agrega las partes que forman el carácter, en orden",
        wordDialogNotes: "Notas personales",
        wordDialogNotesPh: "Escribe cualquier regla mnemotécnica, contexto o anotación...",
        btnCancel: "Cancelar",
        btnSave: "Guardar",
        btnDelete: "Eliminar",
        btnOk: "Entendido",
        // Delete dialog
        deleteTitle: "Confirmar eliminación",
        deleteConfirmMsg: "¿Estás seguro de que deseas eliminar {name}?",
        deleteWarning: "Esta acción no se puede deshacer.",
        // AI Dialog
        aiTitle: "🪄 Resultado del Análisis",
        aiExplanation: "Explicación",
        aiSuggested: "Versión sugerida",
        aiTranslation: "Traducción",
        // Settings Dialog
        settingsTitle: "Configuración",
        settingsLanguageTitle: "Idioma de la aplicación",
        settingsLanguageSubtitle: "Selecciona el idioma de la interfaz y los datos de estudio:",
        settingsFontTitle: "Fuente de caracteres chinos",
        settingsFontSubtitle: "Selecciona cómo ver los caracteres en tarjetas, constructor, examen y estudio:",
        settingsFontKaitiName: "DFKai / 標楷體 · Trazos completos (楷體)",
        settingsFontKaitiBadge: "Recomendado",
        settingsFontKaitiDesc: "Tipografía oficial estándar de Taiwán (DFKai-SB / 標楷體). Proporciones clásicas nítidas, ideal para caracteres densos y complejos como 臺 y 灣.",
        settingsFontSerifName: "Con remates / Estilo libro (明體 · 宋體)",
        settingsFontSerifDesc: "Tipografía clásica impresa tradicional con remates estructurados (MingTi / SongTi).",
        settingsFontSansName: "Sin remates / Computadora (黑體)",
        settingsFontSansDesc: "Fuente estándar digital geométrica de pantalla (HeiTi / Noto Sans).",
        settingsGeminiTitle: "Clave API de Gemini (Opcional)",
        settingsGeminiSubtitle: "Para análisis pedagógico con IA y simulación de examen con Gemini",
        settingsSaveBtn: "Guardar Cambios",
        // Language Switcher
        langSpanish: "Español",
        langEnglish: "English",
        // Toasts
        toastWordSaved: "Palabra guardada correctamente",
        toastWordDeleted: "Palabra eliminada",
        toastStructureSaved: "Estructura guardada correctamente",
        toastStructureDeleted: "Estructura eliminada",
        toastDataExported: "Datos exportados correctamente",
        toastDataImported: "Datos importados correctamente",
        toastSettingsSaved: "Configuración guardada",
        toastLangChanged: "Idioma cambiado a Español"
    },
    en: {
        appTitle: "Formosa Notes - Chinese Flashcards",
        appSubtitle: "Traditional Mandarin",
        // Navigation
        navMain: "Main",
        navLibrary: "Library",
        navBuilder: "Builder",
        navStructures: "Structures",
        navStudyHeader: "Study",
        navStudy: "Study Mode",
        navPractice: "Sentence Practice",
        navExam: "Exam Simulation",
        navTools: "Tools",
        navExport: "Print Flashcards",
        navSettings: "Settings",
        navExportJson: "Export Data",
        navImportJson: "Import Data",
        collapseMenu: "Collapse menu",
        expandMenu: "Expand menu",
        // Library
        searchPlaceholder: "Search cards",
        newWordBtn: "New Word",
        lessonLabel: "Lesson:",
        categoryLabel: "Category:",
        allLessons: "All",
        allCategories: "All",
        noCardsFound: "No cards found with the current filters.",
        // Categories
        catNoun: "Nouns",
        catPronoun: "Pronouns",
        catClassifier: "Classifiers",
        catVerb: "Verbs",
        catAdverb: "Adverbs",
        catAdjective: "Adjectives",
        catExpression: "Expressions",
        catParticle: "Particles",
        catStructure: "Structures",
        // Singular category labels
        cat_sustantivo: "Noun",
        cat_pronombre: "Pronoun",
        cat_clasificador: "Classifier",
        cat_verbo: "Verb",
        cat_adverbio: "Adverb",
        cat_adjetivo: "Adjective",
        cat_expresion: "Expression",
        cat_particula: "Particle",
        cat_estructura: "Structure",
        // Card back
        cardClassifier: "Classifier",
        cardRadicals: "Radicals / Components",
        cardNotes: "Notes",
        cardEdit: "Edit",
        cardDelete: "Delete",
        cardSelectPrint: "Select to export",
        // Builder
        builderHeader: "Construction Zone",
        builderClear: "Clear area",
        builderEmptyDropzone: "Drag words here or select them below",
        builderQuickInputPlaceholder: "Type characters or search by meaning, pinyin or zhuyin",
        builderAdd: "Add",
        builderStructureName: "Structure name",
        builderStructureNamePh: "Ex: Affirmation with 是",
        builderFormula: "Formula",
        builderFormulaPh: "Ex: S + 是 + N",
        builderTranslation: "English translation",
        builderTranslationPh: "Ex: I am a person",
        builderExamineBtn: "🪄 Examine Sentence",
        builderSaveBtn: "Save Structure",
        builderBankTitle: "Word Bank",
        // Structures
        structuresEmpty: "No structures registered",
        structFormula: "Formula",
        structExample: "Example",
        structTranslation: "Translation",
        structNotes: "Notes",
        structUseInBuilder: "Use in builder",
        // Study mode
        studyShowCategory: "Show category",
        studyShowNotes: "Show notes (back)",
        studyShowRadicals: "Show radicals (back)",
        studyCardOf: "Card {current} of {total}",
        studyPrev: "Previous",
        studyFlip: "Flip",
        studyNext: "Next",
        studyShuffle: "Shuffle",
        studyFlipHint: "Click card or press Space to flip",
        studyEmpty: "No cards available with these filters.",
        studyNoLessonCat: "Try selecting other lessons or categories in the top bar.",
        // Practice & Exam
        practiceTitle: "Sentence Practice",
        examTitle: "Exam Simulation",
        // Export / Print
        printSearchPlaceholder: "Search cards",
        printSelectAll: "Select all",
        printDeselectAll: "Deselect all",
        printSelectedCount: "{count} selected",
        printBtn: "Print Flashcards",
        printPinyin: "Pinyin",
        printZhuyin: "Zhuyin",
        printCategory: "Category",
        // Dialogs
        wordDialogNewTitle: "New Word",
        wordDialogEditTitle: "Edit Word",
        wordDialogMeaning: "Meaning in English *",
        wordDialogMeaningPh: "Ex: Cat",
        wordDialogCategory: "Category *",
        wordDialogTrad: "Traditional characters *",
        wordDialogTradPh: "Ex: 貓",
        wordDialogPinyin: "Pinyin *",
        wordDialogPinyinPh: "Ex: māo",
        wordDialogPinyinHint: "Type tones with numbers (e.g. a2 → á, hao3 → hǎo)",
        wordDialogZhuyin: "Zhuyin (Bopomofo)",
        wordDialogZhuyinPh: "Ex: ㄇㄠ",
        wordDialogClassifier: "Classifier",
        wordDialogNone: "None",
        wordDialogLesson: "Lesson (1 to 8 or none)",
        wordDialogRadicals: "Radicals / Components",
        wordDialogFreeText: "Free Text",
        wordDialogLibrary: "Library",
        wordDialogRadicalSearchPh: "Search cards",
        wordDialogRadicalHint: "Add the parts that form the character, in order",
        wordDialogNotes: "Personal notes",
        wordDialogNotesPh: "Write any mnemonic rule, context or note...",
        btnCancel: "Cancel",
        btnSave: "Save",
        btnDelete: "Delete",
        btnOk: "Got it",
        // Delete dialog
        deleteTitle: "Confirm deletion",
        deleteConfirmMsg: "Are you sure you want to delete {name}?",
        deleteWarning: "This action cannot be undone.",
        // AI Dialog
        aiTitle: "🪄 Analysis Result",
        aiExplanation: "Explanation",
        aiSuggested: "Suggested version",
        aiTranslation: "Translation",
        // Settings Dialog
        settingsTitle: "Settings",
        settingsLanguageTitle: "Application Language",
        settingsLanguageSubtitle: "Select the language for the interface and study data:",
        settingsFontTitle: "Chinese Character Font",
        settingsFontSubtitle: "Select how characters appear in cards, builder, exam, and study:",
        settingsFontKaitiName: "DFKai / 標楷體 · Standard KaiTi (楷體)",
        settingsFontKaitiBadge: "Recommended",
        settingsFontKaitiDesc: "Official Taiwan standard typography (DFKai-SB / 標楷體). Crisp classical proportions, ideal for dense, complex characters like 臺 and 灣.",
        settingsFontSerifName: "Serif / Print Style (明體 · 宋體)",
        settingsFontSerifDesc: "Classical traditional printed typography with structured serifs (MingTi / SongTi).",
        settingsFontSansName: "Sans-Serif / Computer (黑體)",
        settingsFontSansDesc: "Standard digital geometric screen font (HeiTi / Noto Sans).",
        settingsGeminiTitle: "Gemini API Key (Optional)",
        settingsGeminiSubtitle: "For pedagogical AI analysis and Gemini-powered exam simulation",
        settingsSaveBtn: "Save Changes",
        // Language Switcher
        langSpanish: "Español",
        langEnglish: "English",
        // Toasts
        toastWordSaved: "Word saved successfully",
        toastWordDeleted: "Word deleted",
        toastStructureSaved: "Structure saved successfully",
        toastStructureDeleted: "Structure deleted",
        toastDataExported: "Data exported successfully",
        toastDataImported: "Data imported successfully",
        toastSettingsSaved: "Settings saved",
        toastLangChanged: "Language changed to English"
    }
};

/**
 * Returns the currently active language ('es' or 'en').
 * @returns {'es'|'en'}
 */
const getLanguage = () => {
    return localStorage.getItem('appchino_lang') === 'en' ? 'en' : 'es';
};

/**
 * Retrieves a translated string by key, with optional interpolation params.
 * @param {string} key
 * @param {object} params
 * @returns {string}
 */
const t = (key, params = {}) => {
    const lang = getLanguage();
    let str = I18N_DICT[lang]?.[key] || I18N_DICT['es']?.[key] || key;
    for (const [paramKey, paramVal] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
    }
    return str;
};

/**
 * Updates global CATEGORY_LABELS based on active language.
 */
const updateCategoryLabels = () => {
    const lang = getLanguage();
    if (typeof CATEGORY_LABELS !== 'undefined') {
        const dict = I18N_DICT[lang];
        CATEGORY_LABELS.sustantivo   = dict.cat_sustantivo;
        CATEGORY_LABELS.pronombre    = dict.cat_pronombre;
        CATEGORY_LABELS.clasificador = dict.cat_clasificador;
        CATEGORY_LABELS.verbo        = dict.cat_verbo;
        CATEGORY_LABELS.adjetivo     = dict.cat_adjetivo;
        CATEGORY_LABELS.adverbio     = dict.cat_adverbio;
        CATEGORY_LABELS.expresion    = dict.cat_expresion;
        CATEGORY_LABELS.particula    = dict.cat_particula;
        CATEGORY_LABELS.estructura   = dict.cat_estructura;
    }
};

/**
 * Updates all DOM elements with data-i18n attributes.
 */
const applyI18nToDOM = () => {
    const lang = getLanguage();
    document.documentElement.lang = lang;
    document.title = t('appTitle');

    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.dataset.i18nPh;
        el.placeholder = t(key);
    });

    // Titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.dataset.i18nTitle;
        el.title = t(key);
    });

    // Tooltips
    document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
        const key = el.dataset.i18nTooltip;
        el.dataset.tooltip = t(key);
        el.title = t(key);
    });

    // Language toggle text in sidebar
    const langToggleText = document.getElementById('lang-toggle-text');
    if (langToggleText) {
        langToggleText.textContent = lang === 'en' ? 'English' : 'Español';
    }

    // Language pills / active states in settings or sidebar
    document.querySelectorAll('.lang-choice-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
};

/**
 * Changes active language, saves to localStorage, updates UI, and refreshes active view.
 * @param {'es'|'en'} newLang
 */
const setLanguage = (newLang) => {
    if (newLang !== 'es' && newLang !== 'en') return;
    localStorage.setItem('appchino_lang', newLang);
    updateCategoryLabels();
    applyI18nToDOM();

    // Trigger UI refresh across modules if loaded
    if (typeof refreshAll === 'function') refreshAll();
    if (typeof renderGrid === 'function') renderGrid();
    if (typeof renderStructures === 'function') renderStructures();
    if (typeof renderStructuresList === 'function') renderStructuresList();
    if (typeof updateStudyToolbarUI === 'function') updateStudyToolbarUI();
    if (typeof initStudyDeck === 'function') initStudyDeck();
    if (typeof renderStudyCard === 'function') renderStudyCard();
    if (typeof renderWordBank === 'function') renderWordBank();
    if (typeof renderExportGrid === 'function') renderExportGrid();
    if (typeof updateExportCount === 'function') updateExportCount();
    if (typeof renderPracticeUI === 'function') renderPracticeUI();

    if (typeof showToast === 'function') {
        showToast(t('toastLangChanged'));
    }
};

// Global export
window.I18N = {
    getLanguage,
    setLanguage,
    t,
    updateCategoryLabels,
    applyI18nToDOM,
    TRANSLATIONS: I18N_DICT
};

// Initial setup on script load
updateCategoryLabels();
