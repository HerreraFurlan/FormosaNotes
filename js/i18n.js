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
        navPractice: "Conversación",
        navLiveConversation: "Conversación",
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
        toastLangChanged: "Idioma cambiado a Español",

        // Practice - sentence challenges
        practiceRetosTab: "Retos de oraciones",
        practiceConvoTab: "Conversación",
        practiceGeneratingTitle: "Formulando 5 retos con Inteligencia Artificial...",
        practiceGeneratingDesc: "Gemini está seleccionando tus estructuras gramaticales y combinándolas con tu vocabulario para crear oraciones personalizadas.",
        practiceWelcomeTitle: "Práctica Diaria de Oraciones con IA",
        practiceWelcomeDesc: "Pon a prueba tu dominio del mandarín tradicional. La IA seleccionará <strong>5 estructuras gramaticales</strong> al azar y usará únicamente las <strong>palabras que ya tienes en tu biblioteca</strong> para proponerte 5 oraciones en español. ¡Escríbelas en caracteres tradicionales y recibe retroalimentación inmediata!",
        practiceWordsAvail: "Palabras disponibles",
        practiceStructsAvail: "Estructuras disponibles",
        practiceBtnGenerate: "Generar 5 retos nuevos",
        practiceToolbarTitle: "Práctica activa: 5 retos",
        practiceScoreBadge: "{correct} / {total} correctas",
        practiceStatusHint: "Escribe tus respuestas y revísalas individualmente o en conjunto.",
        practiceBtnReset: "Reiniciar",
        practiceBtnRegenerate: "Otros 5 retos",
        practiceBtnEvalAll: "Evaluar todo",
        practiceBtnEvaluating: "Evaluando con IA...",
        practiceFeedbackCorrect: "✅ ¡Oración Correcta!",
        practiceFeedbackWrong: "❌ Necesita Corrección",
        practiceCardChallenge: "Reto {n} de {total}",
        practiceStructureToUse: "Estructura a utilizar",
        practiceInstructionTranslate: "Traduce o construye en chino:",
        practiceHintLabel: "Pista:",
        practiceKeyVocabLabel: "Vocabulario clave:",
        practiceInputPlaceholder: "Escribe la oración aquí en caracteres tradicionales...",
        practiceBtnCheckSingle: "Revisar",
        practiceBtnChecking: "Revisando...",

        // Practice - conversation mode
        convoSetupTitle: "Conversación Interactiva con IA",
        convoSetupDesc: "Practica situaciones cotidianas en Taiwán. La IA iniciará un diálogo adaptado a tu progreso, evaluará cada frase que envíes en caracteres tradicionales y te dará retroalimentación pedagógica al instante.",
        convoModeSectionLabel: "Elige la modalidad de práctica:",
        convoModeFreeTitle: "Modo Libre",
        convoModeFreeDesc: "Practica cualquier estructura de tu biblioteca",
        convoModeFocusTitle: "Modo Enfocado",
        convoModeFocusDesc: "Elige hasta 5 estructuras obligatorias",
        convoRequiredStructs: "Estructuras obligatorias:",
        convoSelectedCount: "{count} / 5 seleccionadas",
        convoSearchPlaceholder: "Filtrar por nombre o fórmula...",
        convoBtnUnmark: "Desmarcar",
        convoPickerHint: "💡 Selecciona entre 1 y 5 estructuras. La IA conducirá el diálogo para que debas practicar cada una de ellas al menos una vez.",
        convoKnownWords: "Palabras conocidas",
        convoAvailStructs: "Estructuras disponibles",
        convoConnectingPartner: "Conectando con interlocutor...",
        convoSelectStructsHint: "Selecciona entre 1 y 5 estructuras",
        convoStartBtnText: "Iniciar conversación ({count} estructura{plural})",
        convoStartFreeBtnText: "Iniciar conversación libre",
        convoTurnOpening: "🎯 Tu turno para iniciar el diálogo",
        convoGoalNow: "🎯 Tu objetivo ahora:",
        convoStatusCorrect: "✅ Expresión correcta",
        convoStatusWarning: "💡 Comprensible pero mejorable",
        convoStatusWrong: "❌ Corrección requerida",
        convoRecommendedPhrasing: "Forma recomendada:",
        convoUserLabel: "Tú ({role})",
        convoTypingLabel: "Evaluando tu frase y respondiendo...",
        convoCompletedBadge: "🎉 ¡Conversación Completada!",
        convoScoreLabel: "Puntuación: <strong>{score}</strong>",
        convoHighlightsSubtitle: "✨ Aciertos y puntos fuertes:",
        convoSuggestionsSubtitle: "💡 Sugerencias para continuar mejorando:",
        convoBtnAnotherConvo: "Practicar otra conversación",
        convoConcludedNote: "Diálogo finalizado. ¡Excelente práctica!",
        convoRestartBarBtn: "Nueva conversación",
        convoInputPlaceholder: "Escribe tu mensaje en caracteres tradicionales...",
        convoSendBtn: "Enviar",
        convoTuRol: "Tu rol: {role}",

        // Exam Mode
        examBadgeText: "Evaluación Oficial Adaptativa",
        examMainTitle: "Simulación de Examen",
        examMainSubtitle: "Pon a prueba tus conocimientos de mandarín tradicional taiwanés con una prueba estandarizada completa de 7 fases, generada dinámicamente con IA utilizando exclusivamente las palabras y estructuras de tu biblioteca personal.",
        examPillWords: "📚 {count} palabras registradas",
        examPillStructs: "🧩 {count} estructuras gramaticales",
        examPillQuestions: "🎯 55 preguntas en 7 fases",
        examSelectorTitle: "Lecciones a evaluar en el examen",
        examSelectorHint: "<strong>Evaluación retroactiva y acumulativa:</strong> Al marcar una lección, se evalúa <em>hasta</em> esa lección (incluyendo el conocimiento previo de las lecciones anteriores).",
        examLessonLabel: "Lección {num}",
        examIncludeUnassigned: "Incluir tarjetas sin lección asignada (/)",
        examSelectedWordsBadge: "{count} palabras seleccionadas para el examen",
        examBtnStartExam: "Comenzar Simulación de Examen",
        examGeneratingTitle: "Generando tu Simulación de Examen Oficial...",
        examGeneratingDesc: "La IA está diseñando un examen personalizado con 7 fases de evaluación (55 reactivos en total) adaptado a tu vocabulario registrado.",
        examGeneratingTip: "💡 <em>Tip: En la Fase 2, recuerda presionar 1, 2, 3 o 4 después de cada sílaba para colocar las tildes tonales automáticamente (ej: <code>hao3</code> &rarr; <code>hǎo</code>).</em>",
        examActiveTitle: "Simulación de Examen Oficial",
        examActivePhaseInd: "Fase {phase} de 7: {name}",
        examBtnAbandon: "Abandonar",
        examBtnPrevPhase: "← Fase Anterior",
        examBtnNextPhase: "Siguiente Fase →",
        examBtnSubmitExam: "Finalizar y Evaluar Examen",
        examProgressSummary: "Respondidas: {label} preguntas",
        examResultsHeroPassed: "¡Examen Aprobado!",
        examResultsHeroFailed: "Requiere Refuerzo",
        examResultsRestartBtn: "Realizar Nuevo Examen",
        examResultsGoLibrary: "Ir a la Biblioteca",
        examReviewTitle: "Revisión Detallada de Respuestas",
        examReviewPhaseBtn: "Fase {phase}",
        examReviewQuestionNum: "Pregunta {num} de 10",
        examReviewTermNum: "Término {num} de 10",
        examReviewYourAnswer: "Tu respuesta:",
        examReviewCorrectAnswer: "Respuesta correcta:",
        examReviewYourPinyin: "Tu Pinyin:",
        examReviewExpectedPinyin: "Pinyin esperado:",
        examReviewStatusCorrect: "✓ Correcto (+1 pt)",
        examReviewStatusIncorrect: "✗ Incorrecto (0 pts)",
        examReviewP2InputLabel: "Ingresa el Pinyin con tonos:",
        examReviewP2Placeholder: "Ej: nǐ hǎo",
        examToneHelpT1: "Tono 1: a1→ā",
        examToneHelpT2: "Tono 2: a2→á",
        examToneHelpT3: "Tono 3: a3→ǎ",
        examToneHelpT4: "Tono 4: a4→à",
        examToneHelpT5: "Neutro: a5→a",

        // Phase names in active exam
        examPhaseName1: "1. Hanzi (10 opciones)",
        examPhaseName2: "2. Pinyin con Tonos",
        examPhaseName3: "3. Rellenar Espacios",
        examPhaseName4: "4. Gramática Compleja",
        examPhaseName5: "5. Escenarios Abiertos",
        examPhaseName6: "6. Banco de Caracteres",
        examPhaseName7: "7. Comprensión Lectora",

        // Breakdown card names
        examBreakdownP1: "Fase 1: Reconocimiento",
        examBreakdownP2: "Fase 2: Escritura Pinyin",
        examBreakdownP3: "Fase 3: Espacios en Blanco",
        examBreakdownP4: "Fase 4: Gramática Compleja",
        examBreakdownP5: "Fase 5: Escenarios Abiertos",
        examBreakdownP6: "Fase 6: Banco de Caracteres",
        examBreakdownP7: "Fase 7: Comprensión Lectora",

        // Additional toasts
        builderToastEmpty: "Agrega al menos una palabra al constructor",
        builderToastIncomplete: "Completa al menos el nombre y la fórmula",
        builderToastCleared: "Zona de construcción vaciada",
        builderToastAdded: "Caracteres agregados al constructor",
        printToastNoSelection: "Selecciona al menos una flashcard para exportar",
        printToastComplete: "Proceso completado",
        builderVerdictCorrect: "✅ ¡Oración Correcta!",
        builderVerdictIncorrect: "❌ Necesita Corrección",
        builderExamining: "Examinando...",
        examPreviewP1Title: "Reconocimiento de Caracteres",
        examPreviewP1Desc: "10 preguntas: Identifica el Hanzi correcto a partir de su Pinyin y Zhuyin entre 10 opciones.",
        examPreviewP2Title: "Escritura de Pinyin con Tonos",
        examPreviewP2Desc: "10 preguntas: Escribe el Pinyin exacto con diacríticos tonales mediante el teclado numérico (1-5).",
        examPreviewP3Title: "Rellenar Espacios en Blanco",
        examPreviewP3Desc: "5 oraciones: Deduce y escribe el carácter o término faltante en oraciones directas.",
        examPreviewP4Title: "Gramática y Estructuras Complejas",
        examPreviewP4Desc: "10 oraciones: Completa patrones avanzados con selección múltiple de 3 opciones (A, B, C).",
        examPreviewP5Title: "Respuestas en Situaciones Reales",
        examPreviewP5Desc: "5 escenarios: Responde a preguntas cotidianas en Taiwán con oraciones libres evaluadas por IA.",
        examPreviewP6Title: "Desafío de Banco de Caracteres",
        examPreviewP6Desc: "5 preguntas: Formula oraciones incorporando obligatoriamente los 5 caracteres asignados.",
        examPreviewP7Title: "Comprensión Lectora Integral",
        examPreviewP7Desc: "Historia corta inédita: 5 afirmaciones de Verdadero/Falso + 5 preguntas de opción múltiple.",
        examBtnTrue: "✓ Verdadero (正確)",
        examBtnFalse: "✗ Falso (錯誤)",
        examRequiredChar: "必須包含漢字：",
        convoToastSelectStructs: "Selecciona entre 1 y 5 estructuras o cambia a Modo Libre",
        convoToastStarted: "¡Conversación iniciada con {name}!",
        convoToastEmptyMessage: "Escribe tu mensaje en chino antes de enviar",
        convoToastConcluded: "¡Has concluido la conversación!",
        convoToastMaxStructs: "Puedes elegir como máximo 5 estructuras para enfocar la conversación",
        convoScenarioLabel: "Escenario:",
        convoBtnRestart: "Reiniciar",
        convoResetTitle: "Finalizar e iniciar otra",
        convoConfirmReset: "¿Deseas finalizar la conversación actual e iniciar una nueva?",
        convoTargetStructuresHeader: "Estructuras a practicar en esta sesión ({count}):",
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
        navPractice: "Live Conversation",
        navLiveConversation: "Live Conversation",
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
        toastLangChanged: "Language changed to English",

        // Practice - sentence challenges
        practiceRetosTab: "Sentence challenges",
        practiceConvoTab: "Live conversation",
        practiceGeneratingTitle: "Formulating 5 challenges with Artificial Intelligence...",
        practiceGeneratingDesc: "Gemini is selecting your grammatical structures and combining them with your vocabulary to create personalized sentences.",
        practiceWelcomeTitle: "Daily AI Sentence Practice",
        practiceWelcomeDesc: "Test your mastery of Traditional Mandarin. AI will randomly select <strong>5 grammatical structures</strong> and use exclusively the <strong>words in your library</strong> to propose 5 sentences. Write them in traditional characters and get immediate feedback!",
        practiceWordsAvail: "Available words",
        practiceStructsAvail: "Available structures",
        practiceBtnGenerate: "Generate 5 new challenges",
        practiceToolbarTitle: "Active practice: 5 challenges",
        practiceScoreBadge: "{correct} / {total} correct",
        practiceStatusHint: "Type your answers and check them individually or all at once.",
        practiceBtnReset: "Reset",
        practiceBtnRegenerate: "Another 5 challenges",
        practiceBtnEvalAll: "Evaluate all",
        practiceBtnEvaluating: "Evaluating with AI...",
        practiceFeedbackCorrect: "✅ Correct Sentence!",
        practiceFeedbackWrong: "❌ Needs Correction",
        practiceCardChallenge: "Challenge {n} of {total}",
        practiceStructureToUse: "Structure to use",
        practiceInstructionTranslate: "Translate or construct in Chinese:",
        practiceHintLabel: "Hint:",
        practiceKeyVocabLabel: "Key vocabulary:",
        practiceInputPlaceholder: "Type the sentence here in traditional characters...",
        practiceBtnCheckSingle: "Check",
        practiceBtnChecking: "Checking...",

        // Practice - conversation mode
        convoSetupTitle: "Interactive AI Conversation",
        convoSetupDesc: "Practice everyday situations in Taiwan. AI will start a dialogue tailored to your progress, evaluate each phrase you send in traditional characters, and provide instant pedagogical feedback.",
        convoModeSectionLabel: "Choose practice mode:",
        convoModeFreeTitle: "Free Mode",
        convoModeFreeDesc: "Practice any structure from your library",
        convoModeFocusTitle: "Focused Mode",
        convoModeFocusDesc: "Choose up to 5 target structures",
        convoRequiredStructs: "Target structures:",
        convoSelectedCount: "{count} / 5 selected",
        convoSearchPlaceholder: "Filter by name or formula...",
        convoBtnUnmark: "Clear",
        convoPickerHint: "💡 Select between 1 and 5 structures. AI will guide the conversation so you practice each one at least once.",
        convoKnownWords: "Known words",
        convoAvailStructs: "Available structures",
        convoConnectingPartner: "Connecting with conversation partner...",
        convoSelectStructsHint: "Select between 1 and 5 structures",
        convoStartBtnText: "Start conversation ({count} structure{plural})",
        convoStartFreeBtnText: "Start free conversation",
        convoTurnOpening: "🎯 Your turn to start the dialogue",
        convoGoalNow: "🎯 Your goal now:",
        convoStatusCorrect: "✅ Correct expression",
        convoStatusWarning: "💡 Understandable but could be improved",
        convoStatusWrong: "❌ Correction needed",
        convoRecommendedPhrasing: "Recommended phrasing:",
        convoUserLabel: "You ({role})",
        convoTypingLabel: "Evaluating your sentence and replying...",
        convoCompletedBadge: "🎉 Conversation Completed!",
        convoScoreLabel: "Score: <strong>{score}</strong>",
        convoHighlightsSubtitle: "✨ Strengths and highlights:",
        convoSuggestionsSubtitle: "💡 Suggestions for continued improvement:",
        convoBtnAnotherConvo: "Practice another conversation",
        convoConcludedNote: "Dialogue finished. Excellent practice!",
        convoRestartBarBtn: "New conversation",
        convoInputPlaceholder: "Type your message in traditional characters...",
        convoSendBtn: "Send",
        convoTuRol: "Your role: {role}",

        // Exam Mode
        examBadgeText: "Official Adaptive Assessment",
        examMainTitle: "Exam Simulation",
        examMainSubtitle: "Test your Taiwanese Traditional Mandarin skills with a comprehensive 7-phase standardized test, dynamically generated by AI using exclusively words and structures from your personal library.",
        examPillWords: "📚 {count} words registered",
        examPillStructs: "🧩 {count} grammatical structures",
        examPillQuestions: "🎯 55 questions in 7 phases",
        examSelectorTitle: "Lessons to assess in the exam",
        examSelectorHint: "<strong>Cumulative evaluation:</strong> Selecting a lesson includes all prior lessons up to that point.",
        examLessonLabel: "Lesson {num}",
        examIncludeUnassigned: "Include cards without assigned lesson (/)",
        examSelectedWordsBadge: "{count} words selected for the exam",
        examBtnStartExam: "Start Exam Simulation",
        examGeneratingTitle: "Generating your Official Exam Simulation...",
        examGeneratingDesc: "AI is crafting a personalized exam with 7 evaluation phases (55 total questions) tailored to your registered vocabulary.",
        examGeneratingTip: "💡 <em>Tip: In Phase 2, remember to type 1, 2, 3, or 4 after each syllable to automatically place tone marks (e.g. <code>hao3</code> &rarr; <code>hǎo</code>).</em>",
        examActiveTitle: "Official Exam Simulation",
        examActivePhaseInd: "Phase {phase} of 7: {name}",
        examBtnAbandon: "Leave",
        examBtnPrevPhase: "← Previous Phase",
        examBtnNextPhase: "Next Phase →",
        examBtnSubmitExam: "Submit and Grade Exam",
        examProgressSummary: "Answered: {label} questions",
        examResultsHeroPassed: "Exam Passed!",
        examResultsHeroFailed: "Needs Practice",
        examResultsRestartBtn: "Take New Exam",
        examResultsGoLibrary: "Go to Library",
        examReviewTitle: "Detailed Answer Review",
        examReviewPhaseBtn: "Phase {phase}",
        examReviewQuestionNum: "Question {num} of 10",
        examReviewTermNum: "Term {num} of 10",
        examReviewYourAnswer: "Your answer:",
        examReviewCorrectAnswer: "Correct answer:",
        examReviewYourPinyin: "Your Pinyin:",
        examReviewExpectedPinyin: "Expected Pinyin:",
        examReviewStatusCorrect: "✓ Correct (+1 pt)",
        examReviewStatusIncorrect: "✗ Incorrect (0 pts)",
        examReviewP2InputLabel: "Enter Pinyin with tones:",
        examReviewP2Placeholder: "Ex: nǐ hǎo",
        examToneHelpT1: "Tone 1: a1→ā",
        examToneHelpT2: "Tone 2: a2→á",
        examToneHelpT3: "Tone 3: a3→ǎ",
        examToneHelpT4: "Tone 4: a4→à",
        examToneHelpT5: "Neutral: a5→a",

        // Phase names in active exam
        examPhaseName1: "1. Hanzi (10 options)",
        examPhaseName2: "2. Pinyin with Tones",
        examPhaseName3: "3. Fill in Blanks",
        examPhaseName4: "4. Complex Grammar",
        examPhaseName5: "5. Open Scenarios",
        examPhaseName6: "6. Character Bank",
        examPhaseName7: "7. Reading Comprehension",

        // Breakdown card names
        examBreakdownP1: "Phase 1: Recognition",
        examBreakdownP2: "Phase 2: Pinyin Writing",
        examBreakdownP3: "Phase 3: Fill in Blanks",
        examBreakdownP4: "Phase 4: Complex Grammar",
        examBreakdownP5: "Phase 5: Open Scenarios",
        examBreakdownP6: "Phase 6: Character Bank",
        examBreakdownP7: "Phase 7: Reading Comprehension",

        // Additional toasts
        builderToastEmpty: "Add at least one word to the builder",
        builderToastIncomplete: "Complete at least the name and formula",
        builderToastCleared: "Construction zone cleared",
        builderToastAdded: "Characters added to builder",
        printToastNoSelection: "Select at least one flashcard to export",
        printToastComplete: "Process completed",
        builderVerdictCorrect: "✅ Correct Sentence!",
        builderVerdictIncorrect: "❌ Needs Correction",
        builderExamining: "Examining...",
        examPreviewP1Title: "Character Recognition",
        examPreviewP1Desc: "10 questions: Identify the correct Hanzi from its Pinyin and Zhuyin among 10 options.",
        examPreviewP2Title: "Writing Pinyin with Tones",
        examPreviewP2Desc: "10 questions: Type the exact Pinyin with tone diacritics using numeric keys (1-5).",
        examPreviewP3Title: "Fill in the Blanks",
        examPreviewP3Desc: "5 sentences: Deduce and type the missing character or term in direct sentences.",
        examPreviewP4Title: "Complex Grammar & Structures",
        examPreviewP4Desc: "10 sentences: Complete advanced patterns with 3-option multiple choice (A, B, C).",
        examPreviewP5Title: "Real-life Situational Answers",
        examPreviewP5Desc: "5 scenarios: Answer everyday questions in Taiwan with open sentences evaluated by AI.",
        examPreviewP6Title: "Character Bank Challenge",
        examPreviewP6Desc: "5 questions: Formulate sentences mandatory incorporating the 5 assigned characters.",
        examPreviewP7Title: "Comprehensive Reading",
        examPreviewP7Desc: "Original short story: 5 True/False statements + 5 multiple choice questions.",
        examBtnTrue: "✓ True (正確)",
        examBtnFalse: "✗ False (錯誤)",
        examRequiredChar: "Must include character: ",
        convoToastSelectStructs: "Select between 1 and 5 structures or switch to Free Mode",
        convoToastStarted: "Conversation started with {name}!",
        convoToastEmptyMessage: "Type your message in Chinese before sending",
        convoToastConcluded: "You have completed the conversation!",
        convoToastMaxStructs: "You can select at most 5 structures to focus the conversation",
        convoScenarioLabel: "Scenario:",
        convoBtnRestart: "Restart",
        convoResetTitle: "Finish and start another",
        convoConfirmReset: "Do you want to end the current conversation and start a new one?",
        convoTargetStructuresHeader: "Target structures to practice in this session ({count}):",
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
    if (typeof renderExam === 'function') renderExam();

    if (typeof showToast === 'function') {
        showToast(t('toastLangChanged'));
    }
};

/**
 * Resolves category label according to active language.
 * @param {string} cat
 * @returns {string}
 */
const getCategoryLabel = (cat) => {
    if (!cat) return '';
    const lang = getLanguage();
    const dict = I18N_DICT[lang] || I18N_DICT['es'];
    const key = 'cat_' + String(cat).toLowerCase();
    if (dict && dict[key]) {
        return dict[key];
    }
    if (typeof CATEGORY_LABELS !== 'undefined' && CATEGORY_LABELS[cat]) {
        return CATEGORY_LABELS[cat];
    }
    return cat;
};
window.getCategoryLabel = getCategoryLabel;

// Global export
window.I18N = {
    getLanguage,
    setLanguage,
    t,
    updateCategoryLabels,
    applyI18nToDOM,
    getCategoryLabel,
    TRANSLATIONS: I18N_DICT
};

// Initial setup on script load
updateCategoryLabels();
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyI18nToDOM());
    } else {
        applyI18nToDOM();
    }
}
