/**
 * =====================================================
 * AppChino — data.js
 * Constants, category mappings, and initial seed data.
 * =====================================================
 */

/**
 * Generates a unique identifier for new database entries.
 * @returns {string} A short unique ID string
 */
const generateId = () => 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);

/**
 * Maps each word category to its CSS variable color.
 * Used throughout the UI for dynamic styling.
 */
const CATEGORY_COLORS = {
    sustantivo:   'var(--color-noun)',
    pronombre:    'var(--color-pronoun)',
    clasificador: 'var(--color-classifier)',
    verbo:        'var(--color-verb)',
    adjetivo:     'var(--color-adjective)',
    adverbio:     'var(--color-adverb)',
    expresion:    'var(--color-expression)',
    particula:    'var(--color-particle)',
    estructura:   'var(--color-structure)',
};

/**
 * Human-readable labels for each category (Spanish).
 */
const CATEGORY_LABELS = {
    sustantivo:   'Sustantivo',
    pronombre:    'Pronombre',
    clasificador: 'Clasificador',
    verbo:        'Verbo',
    adjetivo:     'Adjetivo',
    adverbio:     'Adverbio',
    expresion:    'Expresión',
    particula:    'Partícula',
    estructura:   'Estructura',
};

/**
 * Resolved HEX colors per category — used for PDF generation
 * where CSS variables may not be reliably captured by html2canvas.
 */
const PDF_COLORS = {
    sustantivo:   '#2E78B7',
    pronombre:    '#6B7B8D',
    clasificador: '#8D5B4C',
    verbo:        '#D4760A',
    adjetivo:     '#C9971A',
    adverbio:     '#1E8C5E',
    expresion:    '#C0392B',
    particula:    '#7D54B5',
    estructura:   '#C2527A',
};

/**
 * Initial seed data — loaded on first visit only (no existing localStorage).
 * All 19 words the user currently knows, with Traditional characters,
 * Pinyin, Zhuyin (Bopomofo), radicals, and example sentences.
 */

/**
 * All known classifiers (量詞) in Traditional Chinese (Taiwan MTC Dangdai).
 * Used for database auto-migration and initial seed.
 */
const DEFAULT_CLASSIFIERS = [
    {
        "id": "id_mtfhewfx_gtw3b",
        "espanol": "Clasificador universal (personas, objetos generales)",
        "tradicional": "個",
        "pinyin": "ge",
        "zhuyin": "ㄍㄜ˙",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "n7"
            },
            {
                "type": "text",
                "value": "固 (gù - sólido / individual: 囗 recinto + 古 antiguo)"
            }
        ],
        "notas": "Clasificador universal y más frecuente en chino. Se emplea para personas y objetos generales que no tienen un clasificador específico: 一個人 (una persona), 三個家人 (tres familiares). Se suele pronunciar en tono neutro ligero (ge) o cuarto tono (gè).",
        "ejemplos": [
            "我有三個家人 — Tengo tres familiares en mi casa",
            "這個人是老師 — Esta persona es profesor",
            "一個學生 — Un estudiante"
        ],
        "fechaCreacion": "2026-08-30"
    },
    {
        "id": "id_mty004_zhang",
        "espanol": "Clasificador para objetos planos (fotos, hojas, mesas, billetes)",
        "tradicional": "張",
        "pinyin": "zhāng",
        "zhuyin": "ㄓㄤ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "弓 (gōng - arco)"
            },
            {
                "type": "text",
                "value": "長 (cháng - largo)"
            }
        ],
        "notas": "Clasificador para objetos delgados y con superficie plana: 一張照片 (una foto), 一張紙 (una hoja de papel), 一張桌子 (una mesa). También es un apellido muy extendido en el mundo sinohablante.",
        "ejemplos": [
            "一張照片 — Una foto",
            "你有幾張照片？ — ¿Cuántas fotos tienes?",
            "請給我一張紙 — Por favor dame una hoja de papel"
        ],
        "fechaCreacion": "2026-09-26"
    },
    {
        "id": "id_mtfigeht_eqxfj",
        "espanol": "Clasificador para animales y objetos en pares",
        "tradicional": "隻",
        "pinyin": "zhī",
        "zhuyin": "ㄓ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "隹 (zhuī - ave de cola corta)"
            },
            {
                "type": "text",
                "value": "又 (yòu - mano que atrapa o sujeta)"
            }
        ],
        "notas": "Clasificador numeral para la mayoría de los animales: 一隻貓 (un gato), 兩隻狗 (dos perros), 一隻鳥 (un pájaro). También se usa para un solo elemento de un par natural (una mano, un zapato). Pictograma de una mano sosteniendo un pájaro.",
        "ejemplos": [
            "我家有一隻貓和一隻狗 — En mi casa hay un gato y un perro",
            "那一隻貓很可愛 — Ese gato es muy tierno",
            "這隻狗是誰的？ — ¿De quién es este perro?"
        ],
        "fechaCreacion": "2026-08-30"
    },
    {
        "id": "id_clf_ben",
        "espanol": "Clasificador para libros, cuadernos y tomos encuadernados",
        "tradicional": "本",
        "pinyin": "běn",
        "zhuyin": "ㄅㄣˇ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "木 (mù - madera / árbol)"
            },
            {
                "type": "text",
                "value": "一 (marca en la raíz del árbol indicando base u origen)"
            }
        ],
        "notas": "Clasificador específico para volúmenes encuadernados: libros (書), diccionarios, revistas, cuadernos. Deriva etimológicamente de la raíz o base de un árbol.",
        "ejemplos": [
            "一本書 — Un libro",
            "這本書是我的 — Este libro es mío",
            "你有幾本書？ — ¿Cuántos libros tienes?"
        ],
        "fechaCreacion": "2026-09-26"
    },
    {
        "id": "id_clf_bei",
        "espanol": "Clasificador para tazas o vasos de líquido (té, café, agua)",
        "tradicional": "杯",
        "pinyin": "bēi",
        "zhuyin": "ㄅㄟ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "木 (mù - madera / materia prima)"
            },
            {
                "type": "ref",
                "id": "a1"
            }
        ],
        "notas": "Clasificador de medida/recipiente para líquidos contenidos en tazas, pocillos o vasos: 一杯茶 (una taza de té), 一杯烏龍茶 (una taza de té Oolong), 一杯咖啡 (una taza de café), 一杯水 (un vaso de agua).",
        "ejemplos": [
            "請給我一杯茶 — Por favor dame una taza de té",
            "我喝了一杯烏龍茶 — Tomé una taza de té Oolong",
            "你要喝幾杯咖啡？ — ¿Cuántas tazas de café quieres tomar?"
        ],
        "fechaCreacion": "2026-09-26"
    },
    {
        "id": "id_clf_wei",
        "espanol": "Clasificador cortés / formal para personas",
        "tradicional": "位",
        "pinyin": "wèi",
        "zhuyin": "ㄨㄟˋ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "n7"
            },
            {
                "type": "text",
                "value": "立 (lì - erguido / de pie)"
            }
        ],
        "notas": "Clasificador respetuoso para personas de estatus o respeto (profesores, clientes, invitados, señores, señoritas): 一位老師 (un profesor), 一位先生 (un señor), 一位小姐 (una señorita). En restaurantes se usa '幾位？' para preguntar cuántos comensales son. Nunca se usa para referirse a uno mismo.",
        "ejemplos": [
            "幾位？ — ¿Cuántas personas son?",
            "這幾位是我的朋友 — Estas personas son mis amigos",
            "他是一位好老師 — Él es un buen profesor"
        ],
        "fechaCreacion": "2026-09-26"
    },
    {
        "id": "id_clf_ping",
        "espanol": "Clasificador para botellas de líquido",
        "tradicional": "瓶",
        "pinyin": "píng",
        "zhuyin": "ㄆㄧㄥˊ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "并 (bìng - combinar / alinear)"
            },
            {
                "type": "text",
                "value": "瓦 (wǎ - vasija de arcilla / terracota)"
            }
        ],
        "notas": "Clasificador de recipiente para botellas de cerveza (啤酒), agua mineral (水), gaseosas, vino o bebidas embotelladas: 一瓶水 (una botella de agua), 兩瓶啤酒 (dos botellas de cerveza).",
        "ejemplos": [
            "請給我一瓶水 — Por favor dame una botella de agua",
            "他買了三瓶烏龍茶 — Él compró tres botellas de té Oolong",
            "你想喝一瓶啤酒嗎？ — ¿Quieres tomar una botella de cerveza?"
        ],
        "fechaCreacion": "2026-09-26"
    },
    {
        "id": "id_clf_dong",
        "espanol": "Clasificador para edificios, construcciones y casas",
        "tradicional": "棟",
        "pinyin": "dòng",
        "zhuyin": "ㄉㄨㄥˋ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "木 (mù - madera)"
            },
            {
                "type": "text",
                "value": "東 (dōng - oriente / viga principal atada)"
            }
        ],
        "notas": "Clasificador arquitectónico para edificios completos o viviendas: 一棟房子 (una casa / vivienda), 那棟大樓 (ese edificio). El carácter hace alusión a la cumbrera o viga maestra de una casa.",
        "ejemplos": [
            "我們家有一棟老房子 — Mi familia tiene una casa antigua",
            "那棟大樓很漂亮 — Ese edificio es muy bonito",
            "這棟房子是誰的？ — ¿De quién es esta casa?"
        ],
        "fechaCreacion": "2026-09-26"
    },
    {
        "id": "id_mtgn2mv8_7ji91",
        "espanol": "Años de edad (clasificador de edad)",
        "tradicional": "歲",
        "pinyin": "suì",
        "zhuyin": "ㄙㄨㄟˋ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "止 (parar / pie)"
            },
            {
                "type": "text",
                "value": "戌 (hacha de guerra)"
            },
            {
                "type": "text",
                "value": "步 (paso)"
            }
        ],
        "notas": "Clasificador para expresar la edad en años: 我二十歲 (Tengo 20 años). En chino NO se usa el verbo 有 para expresar la edad (no se dice \"tengo X años\"), sino que se coloca directamente el número seguido de 歲.",
        "ejemplos": [
            "你幾歲？ — ¿Cuántos años tienes?",
            "我二十歲 — Tengo 20 años",
            "她十八歲 — Ella tiene 18 años"
        ],
        "fechaCreacion": "2026-08-31"
    },
    {
        "id": "id_clf_ke",
        "espanol": "Clasificador para objetos pequeños y redondos (perlas, semillas, dientes, corazón)",
        "tradicional": "顆",
        "pinyin": "kē",
        "zhuyin": "ㄎㄜ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "果 (guǒ - fruto redondo)"
            },
            {
                "type": "text",
                "value": "頁 (yè - cabeza / faz)"
            }
        ],
        "notas": "Clasificador para objetos esféricos, granulares o pequeños: corazón (一顆心), estrellas (一顆星星), dientes (一顆牙齒), dulces o perlas. Compuesto por 果 (fruta redonda) y 頁 (cabeza).",
        "ejemplos": [
            "一顆心 — Un corazón",
            "一顆糖 — Un caramelo",
            "天上有一顆很亮的星星 — En el cielo hay una estrella muy brillante"
        ],
        "fechaCreacion": "2026-09-26"
    },
    {
        "id": "id_clf_jian",
        "espanol": "Clasificador para habitaciones, aulas y tiendas",
        "tradicional": "間",
        "pinyin": "jiān",
        "zhuyin": "ㄐㄧㄢ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            { "type": "text", "value": "門 (puerta)" },
            { "type": "text", "value": "日 (sol)" }
        ],
        "notas": "Clasificador específico para espacios habitacionales, aulas, salones y locales comerciales: 一間教室 (un salón de clases), 兩間房間 (dos habitaciones).",
        "ejemplos": [
            "我們學校有三十間教室 — Nuestra escuela tiene 30 aulas",
            "那間商店很大 — Esa tienda es muy grande"
        ],
        "fechaCreacion": "2026-09-27"
    },
    {
        "id": "id_clf_duo",
        "espanol": "Clasificador para flores y nubes",
        "tradicional": "朵",
        "pinyin": "duǒ",
        "zhuyin": "ㄉㄨㄛˇ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            { "type": "text", "value": "几 (jī - banco/soporte)" },
            { "type": "text", "value": "木 (mù - madera/árbol)" }
        ],
        "notas": "Clasificador botánico tradicional para flores individuales (一朵花) y elementos esponjosos flotantes como nubes (一朵雲).",
        "ejemplos": [
            "這朵花真漂亮 — Esta flor es verdaderamente hermosa",
            "他買了一朵花送媽媽 — Él compró una flor para mamá"
        ],
        "fechaCreacion": "2026-09-27"
    },
    {
        "id": "id_clf_men",
        "espanol": "Clasificador para asignaturas, materias académicas y cursos",
        "tradicional": "門",
        "pinyin": "mén",
        "zhuyin": "ㄇㄣˊ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            { "type": "text", "value": "門 (puerta / pórtico del conocimiento)" }
        ],
        "notas": "Clasificador académico para materias y asignaturas cursadas: 一門課 (una asignatura), 兩門選修課 (dos materias electivas).",
        "ejemplos": [
            "這個學期我選了四門課 — Este semestre elegí cuatro materias",
            "這是一門很有意思的選修課 — Esta es una materia electiva muy interesante"
        ],
        "fechaCreacion": "2026-09-27"
    },
    {
        "id": "id_clf_ci",
        "espanol": "Clasificador verbal de frecuencia (veces / repeticiones)",
        "tradicional": "次",
        "pinyin": "cì",
        "zhuyin": "ㄘˋ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            { "type": "text", "value": "冫 (hielo/secundario)" },
            { "type": "text", "value": "欠 (bostezo/aliento)" }
        ],
        "notas": "Clasificador verbal de orden y frecuencia. Se coloca tras el verbo para señalar el número de veces que se reitera un evento o acción: 去過三次 (haber ido tres veces), 一天兩次 (dos veces al día).",
        "ejemplos": [
            "請再說一次 — Por favor repítalo una vez más",
            "我一天喝三次茶 — Tomo té tres veces al día"
        ],
        "fechaCreacion": "2026-09-27"
    },
    {
        "id": "id_clf_dian",
        "espanol": "Clasificador de horas (hora en punto) / punto / pedir comida",
        "tradicional": "點",
        "pinyin": "diǎn",
        "zhuyin": "ㄉㄧㄢˇ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "黑 (negro)"
            },
            {
                "type": "text",
                "value": "占 (zhān - adivinar/ocupar)"
            }
        ],
        "notas": "Clasificador numeral indispensable para las horas del reloj: 現在三點 (ahora son las tres), 八點半 (ocho y media). Como verbo significa ordenar o pedir platos (點菜).",
        "ejemplos": [
            "現在幾點？現在十點 — ¿Qué hora es ahora? Son las diez",
            "我們早上八點半上課 — Empezamos la clase a las 8:30 de la mañana"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_clf_fen",
        "espanol": "Clasificador de minutos / dividir / punto (calificación)",
        "tradicional": "分",
        "pinyin": "fēn",
        "zhuyin": "ㄈㄣ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "八 (dividir / separar)"
            },
            {
                "type": "text",
                "value": "刀 (cuchillo)"
            }
        ],
        "notas": "Clasificador para indicar los minutos en la hora: 兩點十分 (las dos y diez), 三點十五分 (las tres y cuarto).",
        "ejemplos": [
            "現在是三點十五分 — Ahora son las tres con quince minutos",
            "差五分八點 — Cinco para las ocho (7:55)"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_clf_ke_time",
        "espanol": "Clasificador de cuarto de hora (15 minutos)",
        "tradicional": "刻",
        "pinyin": "kè",
        "zhuyin": "ㄎㄜˋ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "亥"
            },
            {
                "type": "text",
                "value": "刂 (cuchillo)"
            }
        ],
        "notas": "Clasificador tradicional para cuartos de hora: 一刻 = 15 minutos, 三刻 = 45 minutos. Ejemplo: 十點一刻 (las diez y cuarto).",
        "ejemplos": [
            "現在是十點一刻 — Ahora son las diez y cuarto (10:15)",
            "差一刻十二點 — Falta un cuarto para las doce (11:45)"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_clf_ri",
        "espanol": "Clasificador de día (calendario formal y escrito) / sol",
        "tradicional": "日",
        "pinyin": "rì",
        "zhuyin": "ㄖˋ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "日 (radical pictográfico del sol)"
            }
        ],
        "notas": "Clasificador escrito y formal para el día de la fecha: 9月27日. En lenguaje oral cotidiano se sustituye por 號 (hào).",
        "ejemplos": [
            "今天是九月二十七日 — Hoy es 27 de septiembre",
            "十月十日是國慶日 — El 10 de octubre es el Día Nacional"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_clf_hao",
        "espanol": "Clasificador de día del mes (lenguaje hablado) / número",
        "tradicional": "號",
        "pinyin": "hào",
        "zhuyin": "ㄏㄠˋ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "口 (boca)"
            },
            {
                "type": "text",
                "value": "虎 (tigre)"
            }
        ],
        "notas": "Clasificador oral estándar en Taiwán para el día de la fecha: 今天是幾號？ (¿A cuántos estamos hoy?), 五號 (el día 5).",
        "ejemplos": [
            "明天是幾號？明天是五號 — ¿Qué día es mañana? Mañana es cinco",
            "你的手機號碼是幾號？ — ¿Cuál es tu número de teléfono?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_clf_xie",
        "espanol": "Clasificador de plural indefinido (algunos / unos pocos)",
        "tradicional": "些",
        "pinyin": "xiē",
        "zhuyin": "ㄒㄧㄝ",
        "categoria": "clasificador",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "此 (cǐ)"
            },
            {
                "type": "text",
                "value": "二 (dos)"
            }
        ],
        "notas": "Clasificador plural indefinido: 一些 (algunos/as), 這些 (estos), 那些 (aquellos).",
        "ejemplos": [
            "我想買一些花 — Quiero comprar algunas flores",
            "這些書都很新 — Estos libros son muy nuevos"
        ],
        "fechaCreacion": "2026-09-28"
    }
];

const NEW_STRUCTURE_WORDS = [
    {
        "id": "id_voc_zuoshenme",
        "espanol": "¿Qué hacer? / ¿A qué? / ¿Para qué?",
        "tradicional": "做什麼",
        "pinyin": "zuò shénme",
        "zhuyin": "ㄗㄨㄛˋ ㄕㄣˊ ㄇㄜ˙",
        "categoria": "expresion",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "n7"
            },
            {
                "type": "text",
                "value": "故"
            },
            {
                "type": "ref",
                "id": "id_msr4m3d5_07106"
            }
        ],
        "notas": "Expresión interrogativa fundamental para preguntar el propósito o la actividad que se realiza: 你去教室做什麼？ (¿A qué vas al salón de clases?).",
        "ejemplos": [
            "你去教室做什麼？ — ¿A qué vas al salón de clases?",
            "你在做什麼？ — ¿Qué estás haciendo?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_zuo",
        "espanol": "Hacer / elaborar / dedicarse a",
        "tradicional": "做",
        "pinyin": "zuò",
        "zhuyin": "ㄗㄨㄛˋ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "n7"
            },
            {
                "type": "text",
                "value": "故 (gù - causa/antiguo: 夂 + 古)"
            }
        ],
        "notas": "Verbo activo esencial para realizar, fabricar o desempeñar tareas: 做菜 (cocinar), 做作業 (hacer la tarea), 做什麼 (hacer qué).",
        "ejemplos": [
            "他在做什麼？ — ¿Qué está haciendo él?",
            "我喜歡做菜 — Me gusta cocinar / preparar comida"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_shenmeshihou",
        "espanol": "¿Cuándo? / ¿En qué momento?",
        "tradicional": "什麼時候",
        "pinyin": "shénme shíhòu",
        "zhuyin": "ㄕㄣˊ ㄇㄜ˙ ㄕˊ ㄏㄡˋ",
        "categoria": "expresion",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_msr4m3d5_07106"
            },
            {
                "type": "text",
                "value": "時 (日 + 寺)"
            },
            {
                "type": "ref",
                "id": "n7"
            },
            {
                "type": "text",
                "value": "矢"
            }
        ],
        "notas": "Fórmula interrogativa de tiempo. En la gramática china se coloca siempre ANTES del verbo principal: 你什麼時候下課？ (¿Cuándo sales de clase?).",
        "ejemplos": [
            "你什麼時候下課？ — ¿Cuándo sales de clase?",
            "你們什麼時候去學校？ — ¿Cuándo van a la escuela?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_shihou",
        "espanol": "Momento / tiempo / ocasión / cuando...",
        "tradicional": "時候",
        "pinyin": "shíhòu",
        "zhuyin": "ㄕˊ ㄏㄡˋ",
        "categoria": "sustantivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "時 (tiempo: 日 + 寺)"
            },
            {
                "type": "text",
                "value": "候 (esperar/clima: 亻+ 矢)"
            }
        ],
        "notas": "Sustantivo temporal. Muy productivo en la estructura '...的時候' (...de shíhòu = cuando / al momento de...): 上課的時候 (en el momento de la clase).",
        "ejemplos": [
            "吃飯的時候不要說話 — Al momento de comer no hables",
            "小的時候我很喜歡貓 — Cuando era pequeño me gustaban mucho los gatos"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_jidian",
        "espanol": "¿Qué hora? / ¿A qué hora?",
        "tradicional": "幾點",
        "pinyin": "jǐ diǎn",
        "zhuyin": "ㄐㄧˇ ㄉㄧㄢˇ",
        "categoria": "expresion",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_msr4k90m_ji"
            },
            {
                "type": "ref",
                "id": "id_clf_dian"
            }
        ],
        "notas": "Pregunta interrogativa cotidiana para consultar la hora en el reloj: 現在幾點？ (¿Qué hora es ahora?).",
        "ejemplos": [
            "請問，現在幾點？ — Disculpe, ¿qué hora es ahora?",
            "你幾點去學校？ — ¿A qué hora vas a la escuela?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_fenzhong",
        "espanol": "Minuto (duración o lapso de tiempo)",
        "tradicional": "分鐘",
        "pinyin": "fēnzhōng",
        "zhuyin": "ㄈㄣ ㄓㄨㄥ",
        "categoria": "sustantivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_clf_fen"
            },
            {
                "type": "text",
                "value": "鐘 (reloj: 金 + 童)"
            }
        ],
        "notas": "Indica la duración o intervalo medible de minutos: 休息十分鐘 (descanso de diez minutos).",
        "ejemplos": [
            "下課休息十分鐘 — El receso de clase dura diez minutos",
            "請等我五分鐘 — Por favor espérame cinco minutos"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_ban",
        "espanol": "Y media (en horas) / mitad / medio",
        "tradicional": "半",
        "pinyin": "bàn",
        "zhuyin": "ㄅㄢˋ",
        "categoria": "adjetivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "八 (dividir)"
            },
            {
                "type": "text",
                "value": "干 / 十"
            }
        ],
        "notas": "Se coloca tras 點 para indicar la media hora: 九點半 (las nueve y media). También actúa como adjetivo de mitad: 半天 (medio día).",
        "ejemplos": [
            "我們早上八點半上課 — Tomamos clase a las 8:30 de la mañana",
            "我要半個西瓜 — Quiero media sandía"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_cha",
        "espanol": "Faltar (para la hora) / deficiente / menos",
        "tradicional": "差",
        "pinyin": "chà",
        "zhuyin": "ㄔㄚ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "羊 (oveja)"
            },
            {
                "type": "text",
                "value": "工 (trabajo)"
            }
        ],
        "notas": "Se usa al decir la hora para indicar los minutos que faltan para la hora siguiente: 差五分八點 = faltan 5 para las 8 (7:55).",
        "ejemplos": [
            "差十分兩點 — Diez para las dos (1:50)",
            "這兩個東西差不多 — Estas dos cosas son casi iguales"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_xianzai",
        "espanol": "Ahora / en este momento / en la actualidad",
        "tradicional": "現在",
        "pinyin": "xiànzài",
        "zhuyin": "ㄒㄧㄢˋ ㄗㄞˋ",
        "categoria": "adverbio",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "王 (jade) + 見"
            },
            {
                "type": "text",
                "value": "土 + 𠂇"
            }
        ],
        "notas": "Palabra temporal clave para el presente: 現在幾點？ (¿Qué hora es ahora?). Se ubica antes del predicado verbal.",
        "ejemplos": [
            "現在幾點？ — ¿Qué hora es ahora?",
            "我現在要去教室 — Ahora voy al salón de clases"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_minguo",
        "espanol": "República de China (calendario Minguo de Taiwán)",
        "tradicional": "民國",
        "pinyin": "Mínguó",
        "zhuyin": "ㄇㄧㄣˊ ㄍㄨㄛˊ",
        "categoria": "sustantivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "民 (pueblo)"
            },
            {
                "type": "ref",
                "id": "n5"
            }
        ],
        "notas": "Era oficial de Taiwán (año 1 = 1912). Para calcular el año Minguo se resta 1911 al año gregoriano: 2026 - 1911 = 民國115年.",
        "ejemplos": [
            "今年是民國115年 — Este año es el 115 de la República de China",
            "民國115年9月27日 — 27 de septiembre del año 115 de la República de China"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_jian_see",
        "espanol": "Ver / encontrarse con / verse",
        "tradicional": "見",
        "pinyin": "jiàn",
        "zhuyin": "ㄐㄧㄢˋ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "目 (ojo)"
            },
            {
                "type": "ref",
                "id": "n7"
            }
        ],
        "notas": "Verbo de visión y encuentro. Frecuente en fórmulas de despedida: 明天見 (nos vemos mañana), 下個禮拜見 (nos vemos la próxima semana).",
        "ejemplos": [
            "明天見！ — ¡Nos vemos mañana!",
            "下個禮拜見 — Nos vemos la próxima semana"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_libai",
        "espanol": "Semana (coloquial en Taiwán) / culto",
        "tradicional": "禮拜",
        "pinyin": "lǐbài",
        "zhuyin": "ㄌㄧˇ ㄅㄞˋ",
        "categoria": "sustantivo",
        "clasificador": "id_mtfhewfx_gtw3b",
        "radicales": [
            {
                "type": "text",
                "value": "示 + 豊"
            },
            {
                "type": "text",
                "value": "手 + 拜"
            }
        ],
        "notas": "Sinónimo muy extendido en Taiwán de 星期 (xīngqī): 下個禮拜 (la próxima semana), 禮拜天 (domingo).",
        "ejemplos": [
            "下個禮拜見 — Nos vemos la próxima semana",
            "一個禮拜有七天 — Una semana tiene siete días"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_zai_again",
        "espanol": "Otra vez / de nuevo / volver a (hacia el futuro)",
        "tradicional": "再",
        "pinyin": "zài",
        "zhuyin": "ㄗㄞˋ",
        "categoria": "adverbio",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "一 + 冂 + 土"
            }
        ],
        "notas": "Adverbio para acciones que se repetirán hacia el futuro: 請再說一次 (por favor repítalo una vez más), 再見 (adiós / lit. vernos de nuevo).",
        "ejemplos": [
            "請再說一次 — Por favor repítalo una vez más",
            "歡迎再來 — Bienvenidos nuevamente"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_wen",
        "espanol": "Preguntar / consultar",
        "tradicional": "問",
        "pinyin": "wèn",
        "zhuyin": "ㄨㄣˋ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_clf_men"
            },
            {
                "type": "text",
                "value": "口 (boca)"
            }
        ],
        "notas": "La boca (口) en la puerta (門) formulando una pregunta. Aparece en 請問 (disculpe / con permiso) y en 問問題 (hacer una pregunta).",
        "ejemplos": [
            "我要問問題 — Quiero hacer una pregunta",
            "請問洗手間在哪裡？ — Disculpe, ¿dónde está el baño?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_wenwenti",
        "espanol": "Hacer una pregunta / formular dudas",
        "tradicional": "問問題",
        "pinyin": "wèn wèntí",
        "zhuyin": "ㄨㄣˋ ㄨㄣˋ ㄊㄧˊ",
        "categoria": "expresion",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_voc_wen"
            },
            {
                "type": "ref",
                "id": "id_voc_wenti"
            }
        ],
        "notas": "Frase de aula para pedir el turno de duda: 老師，我要問問題 (profesor/a, quiero hacer una pregunta).",
        "ejemplos": [
            "老師，我要問問題 — Profesor/a, quiero hacer una pregunta",
            "有問題可以問老師 — Si tienen dudas pueden preguntarle al profesor"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_xuexiao",
        "espanol": "Escuela / colegio / centro educativo",
        "tradicional": "學校",
        "pinyin": "xuéxiào",
        "zhuyin": "ㄒㄩㄝˊ ㄒㄧㄠˋ",
        "categoria": "sustantivo",
        "clasificador": "id_clf_dong",
        "radicales": [
            {
                "type": "text",
                "value": "學 (子 - niño bajo el techo del saber)"
            },
            {
                "type": "text",
                "value": "校 (木 + 交)"
            }
        ],
        "notas": "Centro de enseñanza y aprendizaje: 我們學校有很多外國學生 (nuestra escuela tiene muchos alumnos extranjeros).",
        "ejemplos": [
            "我們學校很大 — Nuestra escuela es grande",
            "你怎麼去學校？ — ¿Cómo vas a la escuela?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_nali",
        "espanol": "¿Dónde? / ¿Adónde? / En qué lugar",
        "tradicional": "哪裡",
        "pinyin": "nǎlǐ",
        "zhuyin": "ㄋㄚˇ ㄌㄧˇ",
        "categoria": "pronombre",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "口 + 那"
            },
            {
                "type": "text",
                "value": "里 (pueblo/interior)"
            }
        ],
        "notas": "Pronombre interrogativo de lugar predominante en Taiwán: 教室在哪裡？ (¿Dónde está el aula?). También se usa como modesta réplica de cortesía.",
        "ejemplos": [
            "教室在哪裡？ — ¿Dónde está el salón de clases?",
            "你要去哪裡？ — ¿A dónde vas?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_zenme",
        "espanol": "¿Cómo? / ¿De qué manera? / ¿Por qué?",
        "tradicional": "怎麼",
        "pinyin": "zěnme",
        "zhuyin": "ㄗㄣˇ ㄇㄜ˙",
        "categoria": "adverbio",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "乍 + 心"
            },
            {
                "type": "text",
                "value": "麼"
            }
        ],
        "notas": "Interroga el modo de realizar una acción o medio de transporte: S + 怎麼 + 去 + [Lugar]？ (¿Cómo va S a [Lugar]?).",
        "ejemplos": [
            "請問，怎麼去圖書館？ — Disculpe, ¿cómo se va a la biblioteca?",
            "你怎麼來學校？ — ¿Cómo vienes a la escuela?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_qu",
        "espanol": "Ir / dirigirse hacia",
        "tradicional": "去",
        "pinyin": "qù",
        "zhuyin": "ㄑㄩˋ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "土 (tierra)"
            },
            {
                "type": "text",
                "value": "厶 (privado)"
            }
        ],
        "notas": "Verbo de desplazamiento hacia un lugar o destino: 去教室 (ir al salón), 去做什麼？ (¿a qué vas?).",
        "ejemplos": [
            "你去教室做什麼？ — ¿A qué vas al salón de clases?",
            "我明天去臺灣 — Mañana voy a Taiwán"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_zai_loc",
        "espanol": "Estar en / en (ubicación espacial o temporal)",
        "tradicional": "在",
        "pinyin": "zài",
        "zhuyin": "ㄗㄞˋ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "𠂇"
            },
            {
                "type": "text",
                "value": "土 (tierra)"
            }
        ],
        "notas": "Indica localización espacial o permanencia: S + 在 + [Lugar]. También actúa como preposición locativa.",
        "ejemplos": [
            "老師在教室裡 — El profesor está en el salón de clases",
            "你在哪裡？ — ¿Dónde estás?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_zhexie",
        "espanol": "Estos / estas",
        "tradicional": "這些",
        "pinyin": "zhèxiē",
        "zhuyin": "ㄓㄜˋ ㄒㄧㄝ",
        "categoria": "pronombre",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_msr4oeq7_zhe"
            },
            {
                "type": "text",
                "value": "些"
            }
        ],
        "notas": "Pronombre demostrativo plural cercano: 這些書都很貴 (todos estos libros son caros).",
        "ejemplos": [
            "這些書都不貴 — Ninguno de estos libros es caro",
            "這些是我的照片 — Estas son mis fotos"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_naxie",
        "espanol": "Esos / esas / aquellos / aquellas",
        "tradicional": "那些",
        "pinyin": "nàxiē",
        "zhuyin": "ㄋㄚˋ ㄒㄧㄝ",
        "categoria": "pronombre",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_msr4qdf2_na"
            },
            {
                "type": "text",
                "value": "些"
            }
        ],
        "notas": "Pronombre demostrativo plural lejano: 那些人是誰？ (¿Quiénes son aquellas personas?).",
        "ejemplos": [
            "那些花非常漂亮 — Aquellas flores son extremadamente hermosas",
            "那些不是我的書 — Esos no son mis libros"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_bao",
        "espanol": "Lleno / saciado / satisfecho (de comida)",
        "tradicional": "飽",
        "pinyin": "bǎo",
        "zhuyin": "ㄅㄠˇ",
        "categoria": "adjetivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "飠(comida)"
            },
            {
                "type": "text",
                "value": "包 (envolver)"
            }
        ],
        "notas": "Verbo de estado de saciedad: 我飽了 (estoy lleno/a). Forma el saludo tradicional: 吃飽了嗎？.",
        "ejemplos": [
            "我吃得很飽 — Quedé muy satisfecho / comí muy bien",
            "你飽了嗎？ — ¿Quedaste satisfecho?"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_chibao",
        "espanol": "Comer hasta llenarse / quedar satisfecho",
        "tradicional": "吃飽",
        "pinyin": "chī bǎo",
        "zhuyin": "ㄔ ㄅㄠˇ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_mspmonrk_kj3kn"
            },
            {
                "type": "ref",
                "id": "id_voc_bao"
            }
        ],
        "notas": "Estructura de acción y resultado. Saludo tradicional afectuoso en Taiwán: 你吃飽了嗎？ (¿Ya comiste?).",
        "ejemplos": [
            "你吃飽了嗎？ — ¿Ya comiste? / ¿Quedaste satisfecho?",
            "大家都吃飽了 — Todos ya comieron y quedaron satisfechos"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_shangke",
        "espanol": "Asistir a clase / tener clase / empezar la clase",
        "tradicional": "上課",
        "pinyin": "shàngkè",
        "zhuyin": "ㄕㄤˋ ㄎㄜˋ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "上"
            },
            {
                "type": "ref",
                "id": "id_voc_ke"
            }
        ],
        "notas": "Verbo de acudir o tener clase. Antónimo de 下課 (terminar la clase).",
        "ejemplos": [
            "我們早上八點半上課 — Empezamos la clase a las 8:30 de la mañana",
            "我要去上書法課 — Voy a tomar clase de caligrafía"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_shang",
        "espanol": "Tomar / cursar (clase) / subir / anterior / arriba",
        "tradicional": "上",
        "pinyin": "shàng",
        "zhuyin": "ㄕㄤˋ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "一 + 卜"
            }
        ],
        "notas": "En la estructura S + 上 + [Materia] (課) actúa como cursar o tomar clase: 我上書法課. También se usa en 上個月 (el mes pasado).",
        "ejemplos": [
            "他上兩門選修課 — Él cursa dos materias electivas",
            "我們上課了 — Empezamos la clase"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_xia",
        "espanol": "Terminar (clase) / bajar / siguiente / abajo",
        "tradicional": "下",
        "pinyin": "xià",
        "zhuyin": "ㄒㄧㄚˋ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "一 + 卜"
            }
        ],
        "notas": "Opuesto a 上. Usado en 下課 (terminar clase) y 下個禮拜 (la próxima semana).",
        "ejemplos": [
            "我們十二點下課 — Terminamos la clase a las 12:00",
            "下星期見 — Nos vemos la próxima semana"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_yici",
        "espanol": "Una vez",
        "tradicional": "一次",
        "pinyin": "yí cì",
        "zhuyin": "ㄧˊ ㄘˋ",
        "categoria": "expresion",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "一"
            },
            {
                "type": "ref",
                "id": "id_clf_ci"
            }
        ],
        "notas": "Complemento cuantitativo verbal de frecuencia: 請再說一次 (por favor repítalo una vez más), 一天一次 (una vez al día).",
        "ejemplos": [
            "請再說一次 — Por favor repítalo una vez más",
            "我一天吃一次蘋果 — Como manzana una vez al día"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_shao",
        "espanol": "Poco / pocos / escaso",
        "tradicional": "少",
        "pinyin": "shǎo",
        "zhuyin": "ㄕㄠˇ",
        "categoria": "adjetivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "ref",
                "id": "id_mtjn1fxk_bdhc0"
            },
            {
                "type": "text",
                "value": "丿"
            }
        ],
        "notas": "Antónimo de 多 (mucho). Indica poca cantidad o número reducido: 人很少 (hay poca gente).",
        "ejemplos": [
            "今天教室裡的學生很少 — Hoy hay pocos estudiantes en el salón",
            "你喝很少茶 — Bebes muy poco té"
        ],
        "fechaCreacion": "2026-09-28"
    },
    {
        "id": "id_voc_juede",
        "espanol": "Pensar que algo es / creer / parecer / sentir",
        "tradicional": "覺得",
        "pinyin": "juéde",
        "zhuyin": "ㄐㄩㄝˊ ˙ㄉㄜ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "見 (jiàn - ver / percibir / opinión)"
            },
            {
                "type": "text",
                "value": "彳 (chì - paso / acción: 得 obtener)"
            }
        ],
        "notas": "Verbo cognitivo y de opinión fundamental en mandarín para expresar juicios, impresiones o valoraciones personales ('pensar que...', 'creer que...', 'parecerle a uno que...'). Estructura común: S + 覺得 + [Cláusula / VS] (ej. 我覺得很好 — Pienso que está muy bien; 你覺得怎麼樣？ — ¿Qué te parece? / ¿Qué opinas?).",
        "ejemplos": [
            "我覺得中文很有意思 — Pienso que el idioma chino es muy interesante",
            "你覺得這本書怎麼樣？ — ¿Qué te parece este libro?",
            "我覺得今天很冷 — Siento / pienso que hoy hace mucho frío"
        ],
        "fechaCreacion": "2026-09-30"
    }
,
    {
        "id": "id_l3_zhoumo",
        "espanol": "Fin de semana",
        "tradicional": "週末",
        "pinyin": "zhōumò",
        "zhuyin": "ㄓㄡ ㄇㄛˋ",
        "categoria": "sustantivo",
        "clasificador": "id_mtfhewfx_gtw3b",
        "radicales": [
            {
                "type": "text",
                "value": "周 (zhōu - ciclo / semana: 冂 + 土 + 口)"
            },
            {
                "type": "text",
                "value": "末 (mò - extremo / final: 木 con trazo superior largo)"
            }
        ],
        "notas": "Sustantivo temporal compuesto por 周 (ciclo/semana) y 末 (extremo/fin). Frecuente al inicio de oración o tras el sujeto como marco temporal.",
        "ejemplos": [
            "我週末常運動 — Los fines de semana suelo hacer ejercicio",
            "明天是週末，你要不要來我家？ — Mañana es fin de semana, ¿quieres venir a mi casa?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_ting",
        "espanol": "Escuchar / oír",
        "tradicional": "聽",
        "pinyin": "tīng",
        "zhuyin": "ㄊㄧㄥ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "耳 (ěr - oreja / oído)"
            },
            {
                "type": "text",
                "value": "𡈼 + 十 + 四 + 一 + 心 (atención plena con oído y corazón)"
            }
        ],
        "notas": "Verbo de percepción auditiva. Carácter tradicional formado por 耳 (oreja/oído) junto a diez, cuatro, uno y corazón (escuchar con todos los sentidos y el corazón).",
        "ejemplos": [
            "田中不喜歡聽音樂 — A Tanaka no le gusta escuchar música",
            "我喜歡聽音樂和打網球 — Me gusta escuchar música y jugar al tenis"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_yinyue",
        "espanol": "Música",
        "tradicional": "音樂",
        "pinyin": "yīnyuè",
        "zhuyin": "ㄧㄣ ㄩㄝˋ",
        "categoria": "sustantivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "音 (yīn - sonido: 立 + 日)"
            },
            {
                "type": "text",
                "value": "樂 (yuè - música / melodía: 白 + 幺 + 木)"
            }
        ],
        "notas": "音 aporta la noción de sonido y 樂 la de melodía. Nótese que 樂 se lee yuè para música y lè para alegría/felicidad (快樂 kuàilè).",
        "ejemplos": [
            "我媽媽喜歡聽日本音樂 — A mi mamá le gusta escuchar música japonesa",
            "你喜歡聽音樂嗎？ — ¿Te gusta escuchar música?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_yundong",
        "espanol": "Hacer ejercicio / deporte / ejercitarse",
        "tradicional": "運動",
        "pinyin": "yùndòng",
        "zhuyin": "ㄩㄣˋ ㄉㄨㄥˋ",
        "categoria": "verbo",
        "clasificador": "id_clf_ci",
        "radicales": [
            {
                "type": "text",
                "value": "辶 (chuò - movimiento) + 軍 (ejército) -> 運"
            },
            {
                "type": "text",
                "value": "重 (pesado) + 力 (lì - fuerza) -> 動"
            }
        ],
        "notas": "Funciona tanto como verbo intransitivo ('hacer ejercicio / practicar deportes') como sustantivo ('el deporte / la actividad física').",
        "ejemplos": [
            "我爸爸、媽媽都不喜歡運動 — A mi papá y a mi mamá no les gusta hacer ejercicio",
            "我今天要去運動，不去你家 — Hoy voy a hacer ejercicio, no iré a tu casa"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_da",
        "espanol": "Jugar (deportes de pelota con manos) / golpear",
        "tradicional": "打",
        "pinyin": "dǎ",
        "zhuyin": "ㄉㄚˇ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "扌 (shǒu - mano)"
            },
            {
                "type": "text",
                "value": "丁 (dīng - clavo / componente fonético)"
            }
        ],
        "notas": "Verbo dinámico con radical de mano 扌. En deportes, se emplea para todas las disciplinas de pelota jugadas con manos, raquetas o bates: 打網球, 打棒球, 打籃球.",
        "ejemplos": [
            "田中喜歡打棒球 — A Tanaka le gusta jugar al béisbol",
            "你喜歡打網球嗎？ — ¿Te gusta jugar al tenis?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_wangqiu",
        "espanol": "Tenis",
        "tradicional": "網球",
        "pinyin": "wǎngqiú",
        "zhuyin": "ㄨㄤˇ ㄑㄧㄡˊ",
        "categoria": "sustantivo",
        "clasificador": "id_clf_ke",
        "radicales": [
            {
                "type": "text",
                "value": "糸 (seda/hilo) + 罔 -> 網 (wǎng - red)"
            },
            {
                "type": "text",
                "value": "王 (yù - jade) + 求 -> 球 (qiú - pelota)"
            }
        ],
        "notas": "Literalmente 'pelota de red' (網 red + 球 pelota). Verbo acompañante: 打 (dǎ wǎngqiú).",
        "ejemplos": [
            "我姐姐週末常打網球 — Mi hermana mayor suele jugar al tenis los fines de semana",
            "我不喜歡打網球 — No me gusta jugar al tenis"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_bangqiu",
        "espanol": "Béisbol",
        "tradicional": "棒球",
        "pinyin": "bàngqiú",
        "zhuyin": "ㄅㄤˋ ㄑㄧㄡˊ",
        "categoria": "sustantivo",
        "clasificador": "id_clf_ke",
        "radicales": [
            {
                "type": "text",
                "value": "木 (árbol/madera) + 奉 -> 棒 (bàng - bate / palo)"
            },
            {
                "type": "text",
                "value": "王 (jade) + 求 -> 球 (qiú - pelota)"
            }
        ],
        "notas": "Literalmente 'pelota de bate'. Es el deporte nacional con mayor arraigo cultural y profesional en Taiwán. Verbo: 打 (dǎ bàngqiú).",
        "ejemplos": [
            "網球、棒球，我都喜歡 — Me gustan tanto el tenis como el béisbol",
            "田中喜歡打棒球 — A Tanaka le gusta jugar al béisbol"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_youyong",
        "espanol": "Nadar / natación",
        "tradicional": "游泳",
        "pinyin": "yóuyǒng",
        "zhuyin": "ㄧㄡˊ ㄩㄥˇ",
        "categoria": "verbo",
        "clasificador": "id_clf_ci",
        "radicales": [
            {
                "type": "text",
                "value": "氵 (shuǐ - agua) + 斿 -> 游 (nadar / desplazarse)"
            },
            {
                "type": "text",
                "value": "氵 (shuǐ - agua) + 永 (eterno) -> 泳 (buceo / nado)"
            }
        ],
        "notas": "Verbo separable (V-sep): 游個泳. Ambos caracteres llevan el radical de agua 氵.",
        "ejemplos": [
            "我想學游泳，也想學打網球 — Quiero aprender a nadar y también aprender a jugar al tenis",
            "你喜歡不喜歡游泳？ — ¿Te gusta nadar?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_chang",
        "espanol": "A menudo / frecuentemente / seguido",
        "tradicional": "常",
        "pinyin": "cháng",
        "zhuyin": "ㄔㄤˊ",
        "categoria": "adverbio",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "巾 (jīn - tela / paño)"
            },
            {
                "type": "text",
                "value": "尚 (shàng - noble / estimar)"
            }
        ],
        "notas": "Adverbio preverbal de frecuencia habitual: S + 常 + V. Negación: 不常 (rara vez / poco frecuente). Suma de hábitos: 也常 (también suelo).",
        "ejemplos": [
            "我常打籃球，也常踢足球 — A menudo juego al baloncesto y también suelo jugar al fútbol",
            "王開文常喝茶 — Kaiwen Wang bebe té a menudo"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_lanqiu",
        "espanol": "Baloncesto / básquetbol",
        "tradicional": "籃球",
        "pinyin": "lánqiú",
        "zhuyin": "ㄌㄢˊ ㄑㄧㄡˊ",
        "categoria": "sustantivo",
        "clasificador": "id_clf_ke",
        "radicales": [
            {
                "type": "text",
                "value": "竹 (zhú - bambú) + 監 -> 籃 (canasta de bambú)"
            },
            {
                "type": "text",
                "value": "王 (jade) + 求 -> 球 (pelota)"
            }
        ],
        "notas": "Literalmente 'pelota de canasta' (con radical de bambú 竹 por las antiguas canastas). Verbo: 打 (dǎ lánqiú).",
        "ejemplos": [
            "安同常打籃球 — Antong juega a menudo al baloncesto",
            "我們週末去打籃球，怎麼樣？ — ¿Qué te parece si vamos a jugar al baloncesto el fin de semana?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_ti",
        "espanol": "Patear / jugar (fútbol)",
        "tradicional": "踢",
        "pinyin": "tī",
        "zhuyin": "ㄊㄧ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "足 (zú - pie / pierna)"
            },
            {
                "type": "text",
                "value": "易 (yì - fácil / cambio)"
            }
        ],
        "notas": "Verbo de acción corporal con radical de pie 足. Se emplea principalmente para el fútbol: 踢足球 (tī zúqiú).",
        "ejemplos": [
            "他喜歡踢足球 — A él le gusta jugar al fútbol",
            "李明華不常踢足球 — Li Minghua no juega al fútbol muy seguido"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_zuqiu",
        "espanol": "Fútbol",
        "tradicional": "足球",
        "pinyin": "zúqiú",
        "zhuyin": "ㄗㄨˊ ㄑㄧㄡˊ",
        "categoria": "sustantivo",
        "clasificador": "id_clf_ke",
        "radicales": [
            {
                "type": "text",
                "value": "足 (zú - pie)"
            },
            {
                "type": "text",
                "value": "王 (jade) + 求 -> 球 (pelota)"
            }
        ],
        "notas": "Literalmente 'pelota de pie' (足 pie + 球 pelota). Verbo: 踢 (tī zúqiú).",
        "ejemplos": [
            "我覺得踢足球很好玩 — Pienso que jugar al fútbol es muy divertido",
            "我們早上去踢足球，怎麼樣？ — ¿Qué tal si vamos a jugar al fútbol por la mañana?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_haowan",
        "espanol": "Divertido / entretenido / interesante",
        "tradicional": "好玩",
        "pinyin": "hǎowán",
        "zhuyin": "ㄏㄠˇ ㄨㄢˊ",
        "categoria": "adjetivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "女 + 子 -> 好 (bueno)"
            },
            {
                "type": "text",
                "value": "王 (jade) + 元 -> 玩 (jugar / entretenerse)"
            }
        ],
        "notas": "Verbo de estado / adjetivo muy común (好 bueno de + 玩 jugar). Precedido frecuentemente por 很: 很好玩.",
        "ejemplos": [
            "打棒球和踢足球都很好玩 — Tanto el béisbol como el fútbol son muy divertidos",
            "我覺得中文很好玩 — Pienso que el idioma chino es muy divertido y entretenido"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_zenmeyang",
        "espanol": "¿Qué tal? / ¿Qué te parece? / ¿Cómo está?",
        "tradicional": "怎麼樣",
        "pinyin": "zěnmeyàng",
        "zhuyin": "ㄗㄣˇ ˙ㄇㄜ ㄧㄤˋ",
        "categoria": "expresion",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "心 (corazón) + 乍 -> 怎"
            },
            {
                "type": "text",
                "value": "麻 + 毛 -> 麼"
            },
            {
                "type": "text",
                "value": "木 (árbol) + 羊 -> 樣 (apariencia / modo)"
            }
        ],
        "notas": "Expresión interrogativa. Al final de una propuesta funciona como '¿qué te parece? / ¿cómo ves?'. Para evaluar algo: 你覺得這本書怎麼樣？",
        "ejemplos": [
            "我們週末去打籃球，怎麼樣？ — ¿Qué tal si vamos a jugar al baloncesto el fin de semana?",
            "你覺得這張照片怎麼樣？ — ¿Qué te parece esta foto?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_a",
        "espanol": "Partícula final enfática / de afirmación o acuerdo",
        "tradicional": "啊",
        "pinyin": "a",
        "zhuyin": "˙ㄚ",
        "categoria": "particula",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "口 (kǒu - boca)"
            },
            {
                "type": "text",
                "value": "阿 (阝 colina + 可)"
            }
        ],
        "notas": "Partícula modal en tono neutro. Suaviza el tono, da calidez, afirma entusiasmo (好啊！) o aclara lo evidente (烏龍茶啊！).",
        "ejemplos": [
            "好啊！ — ¡Claro que sí! / ¡De acuerdo!",
            "這是什麼茶？烏龍茶啊！ — ¿Qué té es este? ¡Pues té Oolong!"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_hao_a",
        "espanol": "¡De acuerdo! / ¡Está bien! / ¡Por supuesto! / ¡Vale!",
        "tradicional": "好啊",
        "pinyin": "hǎo a",
        "zhuyin": "ㄏㄠˇ ˙ㄚ",
        "categoria": "expresion",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "好 (bueno) + 啊 (partícula enfática)"
            }
        ],
        "notas": "Fórmula cordial y entusiasta para aceptar invitaciones, propuestas o sugerencias en la conversación cotidiana.",
        "ejemplos": [
            "我們看臺灣電影吧！好啊！ — ¡Veamos cine taiwanés! ¡Claro que sí!",
            "晚上要不要一起吃晚飯？好啊！ — ¿Cenamos juntos esta noche? ¡De acuerdo!"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_bairuyu",
        "espanol": "Bai Ruyu (nombre propio: mujer de EE.UU.)",
        "tradicional": "白如玉",
        "pinyin": "Bái Rúyù",
        "zhuyin": "ㄅㄞˊ ㄖㄨˊ ㄩˋ",
        "categoria": "sustantivo",
        "clasificador": "id_clf_wei",
        "radicales": [
            {
                "type": "text",
                "value": "白 (bái - blanco / apellido Bai)"
            },
            {
                "type": "text",
                "value": "如 (rú - como / igual a: 女 + 口)"
            },
            {
                "type": "text",
                "value": "玉 (yù - jade)"
            }
        ],
        "notas": "Personaje estadounidense del método 当代中文课程 1. Su nombre significa poéticamente 'blanca como el jade'.",
        "ejemplos": [
            "白如玉是美國人 — Bai Ruyu es estadounidense",
            "白如玉想看臺灣電影 — Bai Ruyu quiere ver una película taiwanesa"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_dianying",
        "espanol": "Película / cine",
        "tradicional": "電影",
        "pinyin": "diànyǐng",
        "zhuyin": "ㄉㄧㄢˋ ㄧㄥˇ",
        "categoria": "sustantivo",
        "clasificador": "id_mtfhewfx_gtw3b",
        "radicales": [
            {
                "type": "text",
                "value": "雨 (lluvia) + 申 -> 電 (electricidad)"
            },
            {
                "type": "text",
                "value": "景 (paisaje) + 彡 -> 影 (sombra / imagen)"
            }
        ],
        "notas": "Literalmente 'sombras eléctricas'. Acción verbal principal: 看電影 (ver una película / ir al cine). Clasificador formal: 部 (bù) o 個 (gè).",
        "ejemplos": [
            "今天晚上我們去看電影，好不好？ — Vamos al cine esta noche, ¿te parece bien?",
            "臺灣電影和美國電影都很好看 — Tanto las películas taiwanesas como las estadounidenses son muy buenas"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_ni_fem",
        "espanol": "Tú / usted (femenino)",
        "tradicional": "妳",
        "pinyin": "nǐ",
        "zhuyin": "ㄋㄧˇ",
        "categoria": "pronombre",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "女 (nǚ - mujer, radical 38)"
            },
            {
                "type": "text",
                "value": "尔 (ěr - tú / componente fonético)"
            }
        ],
        "notas": "Variante gráfica femenina de 你. Se usa en textos escritos y mensajes para dirigirse a una mujer.",
        "ejemplos": [
            "請問妳是王小姐嗎？ — Disculpe, ¿usted es la señorita Wang?",
            "妳想看美國電影還是臺灣電影？ — ¿Quieres ver una película estadounidense o una taiwanesa?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_xiang",
        "espanol": "Querer / tener ganas de / desear / pensar",
        "tradicional": "想",
        "pinyin": "xiǎng",
        "zhuyin": "ㄒㄧㄤˇ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "相 (xiāng - apariencia: 木 árbol + 目 ojo)"
            },
            {
                "type": "text",
                "value": "心 (xīn - corazón / mente, radical 61)"
            }
        ],
        "notas": "Como verbo auxiliar modal (想 + V) denota intención, deseo o ganas voluntarias ('tener ganas de'). Negación: 不想. Como verbo principal: pensar o extrañar a alguien.",
        "ejemplos": [
            "今天晚上我想吃越南菜 — Esta noche tengo ganas de comer comida vietnamita",
            "美國電影、臺灣電影，我都想看 — Quiero ver tanto películas estadounidenses como taiwanesas"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_haishi",
        "espanol": "¿O? (en preguntas alternativas disyuntivas)",
        "tradicional": "還是",
        "pinyin": "háishì",
        "zhuyin": "ㄏㄞˊ ㄕˋ",
        "categoria": "particula",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "辶 + 睘 -> 還 (hái - aún / todavía)"
            },
            {
                "type": "text",
                "value": "日 + 正 -> 是 (shì - ser)"
            }
        ],
        "notas": "Conjunción disyuntiva que se emplea ÚNICAMENTE en oraciones interrogativas para ofrecer alternativas (A 還是 B？). Para afirmaciones se usa 或者 (huòzhě).",
        "ejemplos": [
            "妳想看美國電影還是臺灣電影？ — ¿Quieres ver una película estadounidense o una taiwanesa?",
            "今天晚上我們吃越南菜還是臺灣菜？ — ¿Esta noche comemos comida vietnamita o comida taiwanesa?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_ba",
        "espanol": "Partícula final de sugerencia / propuesta / exhortación",
        "tradicional": "吧",
        "pinyin": "ba",
        "zhuyin": "˙ㄅㄚ",
        "categoria": "particula",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "口 (kǒu - boca)"
            },
            {
                "type": "text",
                "value": "巴 (bā - serpiente / fonético)"
            }
        ],
        "notas": "Partícula modal de tono neutro. Al final de la oración convierte una idea en propuesta compartida amable ('¡vamos a...!', '¡hagámoslo!'): 我們走吧 (vamos).",
        "ejemplos": [
            "我們看臺灣電影吧！ — ¡Veamos una película taiwanesa!",
            "今天晚上我們吃越南菜吧！ — ¡Cenemos comida vietnamita esta noche!"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_keyi",
        "espanol": "Poder / ser posible / poderse (posibilidad o permiso)",
        "tradicional": "可以",
        "pinyin": "kěyǐ",
        "zhuyin": "ㄎㄜˇ ㄧˇ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "丁 + 口 -> 可 (kě - poder / apto)"
            },
            {
                "type": "text",
                "value": "匕 + 丶 + 人 -> 以 (yǐ - mediante / por)"
            }
        ],
        "notas": "Verbo auxiliar modal: S + 可以 + V. Expresa que algo es factible, viable o está permitido. Negación: 不可以 (prohibido / no se puede).",
        "ejemplos": [
            "看電影可以學中文 — Ver películas sirve para aprender chino / se puede aprender chino viendo cine",
            "月美覺得看臺灣電影可以學中文 — Yuemei piensa que viendo películas taiwanesas se puede aprender chino"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_xue",
        "espanol": "Aprender / estudiar",
        "tradicional": "學",
        "pinyin": "xué",
        "zhuyin": "ㄒㄩㄝˊ",
        "categoria": "verbo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "𦥯 (techo escolar con cruces de aprendizaje)"
            },
            {
                "type": "text",
                "value": "子 (zǐ - niño / alumno en la base)"
            }
        ],
        "notas": "Carácter tradicional con el niño 子 abajo recibiendo instrucción. Acompaña objetos de estudio o habilidades: 學中文, 學游泳, 學打網球.",
        "ejemplos": [
            "我想學游泳，也想學打網球 — Quiero aprender a nadar y también aprender a jugar al tenis",
            "看電影可以學中文 — Ver películas ayuda a aprender chino"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_zhongwen",
        "espanol": "Idioma chino / lengua china",
        "tradicional": "中文",
        "pinyin": "Zhōngwén",
        "zhuyin": "ㄓㄨㄥ ㄨㄣˊ",
        "categoria": "sustantivo",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "中 (zhōng - centro / China)"
            },
            {
                "type": "text",
                "value": "文 (wén - texto / cultura / lengua)"
            }
        ],
        "notas": "Término que abarca el idioma chino en su totalidad (oral y escrito). En Taiwán también se denomina 華語 (Huáyǔ) o 國語 (Guóyǔ).",
        "ejemplos": [
            "我覺得中文很好玩 — Pienso que el idioma chino es muy divertido y ameno",
            "看電影可以學中文 — Ver películas sirve para aprender chino"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_yiqi",
        "espanol": "Juntos / conjuntamente",
        "tradicional": "一起",
        "pinyin": "yìqǐ",
        "zhuyin": "ㄧˋ ㄑㄧˇ",
        "categoria": "adverbio",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "一 (yī - uno)"
            },
            {
                "type": "text",
                "value": "走 (caminar) + 己 (uno mismo) -> 起 (levantarse)"
            }
        ],
        "notas": "Adverbio de compañía colocado antes del predicado verbal: S + 一起 + V + O. Expresa realizar la acción de manera compartida en grupo.",
        "ejemplos": [
            "晚上要不要一起吃晚飯？ — ¿Quieres que cenemos juntos esta noche?",
            "週末我們要不要一起看書？ — ¿Leemos libros juntos el fin de semana?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_wanfan",
        "espanol": "Cena",
        "tradicional": "晚飯",
        "pinyin": "wǎnfàn",
        "zhuyin": "ㄨㄢˇ ㄈㄢˋ",
        "categoria": "sustantivo",
        "clasificador": "id_mtfhewfx_gtw3b",
        "radicales": [
            {
                "type": "text",
                "value": "日 (sol) + 免 -> 晚 (wǎn - noche / tarde)"
            },
            {
                "type": "text",
                "value": "飠(comida) + 反 -> 飯 (fàn - arroz / comida)"
            }
        ],
        "notas": "Comida de la noche (晚 noche + 飯 arroz/comida). Verbo: 吃晚飯 (cenar). Comparar con 早飯 (desayuno) y 午飯 (almuerzo).",
        "ejemplos": [
            "我們今天一起吃晚飯，怎麼樣？ — ¿Qué te parece si cenamos juntos hoy?",
            "晚上要不要一起吃晚飯？ — ¿Cenamos juntos esta noche?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_cai",
        "espanol": "Comida / platillo / cocina (de un país) / verdura",
        "tradicional": "菜",
        "pinyin": "cài",
        "zhuyin": "ㄘㄞˋ",
        "categoria": "sustantivo",
        "clasificador": "id_mtfhewfx_gtw3b",
        "radicales": [
            {
                "type": "text",
                "value": "艹 (cǎo - hierba / vegetal)"
            },
            {
                "type": "text",
                "value": "采 (cǎi - recolectar: 爫 + 木)"
            }
        ],
        "notas": "Palabra fundamental: 1) Cocina nacional: 臺灣菜 (comida taiwanesa), 越南菜 (comida vietnamita), 日本菜 (comida japonesa), 2) Plato servido en la mesa, 3) Verduras.",
        "ejemplos": [
            "今天晚上我們吃越南菜吧！ — ¡Cenemos comida vietnamita esta noche!",
            "妳喜歡吃哪國菜？ — ¿La comida de qué país te gusta?"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_yuenan",
        "espanol": "Vietnam",
        "tradicional": "越南",
        "pinyin": "Yuènán",
        "zhuyin": "ㄩㄝˋ ㄋㄢˊ",
        "categoria": "sustantivo",
        "clasificador": "id_mtfhewfx_gtw3b",
        "radicales": [
            {
                "type": "text",
                "value": "走 (caminar) + 戉 -> 越 (yuè - cruzar / superar / Yue)"
            },
            {
                "type": "text",
                "value": "十 + 冂 + 羊 -> 南 (nán - sur)"
            }
        ],
        "notas": "País del sudeste asiático con una vibrante presencia en Taiwán. Su gastronomía (越南菜) es sumamente apreciada. Chen Yuemei en el libro es vietnamita.",
        "ejemplos": [
            "陳月美是越南人 — Chen Yuemei es vietnamita",
            "我很喜歡吃越南菜 — Me gusta mucho comer comida vietnamita"
        ],
        "fechaCreacion": "2026-09-30"
    },
    {
        "id": "id_l3_haobuhao",
        "espanol": "¿Te parece bien? / ¿De acuerdo? / ¿Qué tal si...?",
        "tradicional": "好不好",
        "pinyin": "hǎo bù hǎo",
        "zhuyin": "ㄏㄠˇ ㄅㄨˋ ㄏㄠˇ",
        "categoria": "expresion",
        "clasificador": "",
        "radicales": [
            {
                "type": "text",
                "value": "好 (bueno) + 不 (no) + 好 (bueno)"
            }
        ],
        "notas": "Fórmula interrogativa afirmativa-negativa (V-not-V) aplicada a 好. Añadida tras una propuesta busca la conformidad entusiasta del interlocutor.",
        "ejemplos": [
            "今天晚上我們去看電影，好不好？ — Vamos al cine esta noche, ¿te parece bien?",
            "我們週末晚上去看電影，好不好？ — ¿Vamos al cine el fin de semana por la noche, qué tal?"
        ],
        "fechaCreacion": "2026-09-30"
    }
];

const SEED_DATA = {
    clasificadores: JSON.parse(JSON.stringify(DEFAULT_CLASSIFIERS)),
    palabras: [
        { id: 'n1', espanol: 'Papá', tradicional: '爸爸', pinyin: 'bàba', zhuyin: 'ㄅㄚˋ ㄅㄚ˙', categoria: 'sustantivo', clasificador: 'id_mtfhewfx_gtw3b', radicales: '父 + 巴', notas: '', ejemplos: ['他是我的爸爸 — Él es mi papá'] },
        { id: 'n2', espanol: 'Mamá', tradicional: '媽媽', pinyin: 'māma', zhuyin: 'ㄇㄚ ㄇㄚ˙', categoria: 'sustantivo', clasificador: 'id_mtfhewfx_gtw3b', radicales: '女 + 馬', notas: 'El radical 女 (mujer) aparece en muchos caracteres femeninos.', ejemplos: ['她是我的媽媽 — Ella es mi mamá'] },
        { id: 'n3', espanol: 'Hijo', tradicional: '兒子', pinyin: 'érzi', zhuyin: 'ㄦˊ ㄗ˙', categoria: 'sustantivo', clasificador: 'id_mtfhewfx_gtw3b', radicales: '兒 + 子', notas: '', ejemplos: ['他是我的兒子 — Él es mi hijo'] },
        { id: 'n4', espanol: 'Hija', tradicional: '女兒', pinyin: "nǚ'ér", zhuyin: 'ㄋㄩˇ ㄦˊ', categoria: 'sustantivo', clasificador: 'id_mtfhewfx_gtw3b', radicales: '女 + 兒', notas: '', ejemplos: ['她是我的女兒 — Ella es mi hija'] },
        { id: 'n5', espanol: 'China', tradicional: '中國', pinyin: 'Zhōngguó', zhuyin: 'ㄓㄨㄥ ㄍㄨㄛˊ', categoria: 'sustantivo', clasificador: 'id_mtfhewfx_gtw3b', radicales: '中 (centro) + 國 (país)', notas: 'Literalmente "País del Centro"', ejemplos: ['我是中國人 — Soy chino/a'] },
        { id: 'n6', espanol: 'Estados Unidos', tradicional: '美國', pinyin: 'Měiguó', zhuyin: 'ㄇㄟˇ ㄍㄨㄛˊ', categoria: 'sustantivo', clasificador: 'id_mtfhewfx_gtw3b', radicales: '美 (bello) + 國 (país)', notas: 'Literalmente "País Hermoso"', ejemplos: ['他是美國人 — Él es estadounidense'] },
        { id: 'n7', espanol: 'Persona', tradicional: '人', pinyin: 'rén', zhuyin: 'ㄖㄣˊ', categoria: 'sustantivo', clasificador: 'id_mtfhewfx_gtw3b', radicales: '人 (radical independiente)', notas: 'Uno de los radicales más comunes. Aparece como 亻 en otros caracteres.', ejemplos: ['他是好人 — Él es buena persona'] },
        { id: 'n8', espanol: 'Gato', tradicional: '貓', pinyin: 'māo', zhuyin: 'ㄇㄠ', categoria: 'sustantivo', clasificador: 'id_mtfigeht_eqxfj', radicales: '犭(animal) + 苗', notas: 'El radical 犭 indica que es un animal.', ejemplos: ['我愛貓 — Yo amo a los gatos'] },
        { id: 'n9', espanol: 'Perro', tradicional: '狗', pinyin: 'gǒu', zhuyin: 'ㄍㄡˇ', categoria: 'sustantivo', clasificador: 'id_mtfigeht_eqxfj', radicales: '犭(animal) + 句', notas: 'Mismo radical animal 犭 que 貓.', ejemplos: ['他愛狗 — Él ama a los perros'] },
        // --- Pronombres ---
        { id: 'p1', espanol: 'Yo', tradicional: '我', pinyin: 'wǒ', zhuyin: 'ㄨㄛˇ', categoria: 'pronombre', clasificador: '', radicales: '', notas: '', ejemplos: ['我是人 — Yo soy una persona'] },
        { id: 'p2', espanol: 'Tú', tradicional: '你', pinyin: 'nǐ', zhuyin: 'ㄋㄧˇ', categoria: 'pronombre', clasificador: '', radicales: '亻+ 尔', notas: '', ejemplos: ['你好 — Hola (lit. "tú bien")'] },
        { id: 'p3', espanol: 'Él / Ella', tradicional: '他 / 她', pinyin: 'tā', zhuyin: 'ㄊㄚ', categoria: 'pronombre', clasificador: '', radicales: '亻+ 也 / 女 + 也', notas: '他 es masculino, 她 es femenino. Mismo sonido.', ejemplos: ['他是我的爸爸 — Él es mi papá'] },
    ],
    verbos: [
        { id: 'v1', espanol: 'Ser / Estar', tradicional: '是', pinyin: 'shì', zhuyin: 'ㄕˋ', categoria: 'verbo', clasificador: '', radicales: '日 + 正', notas: 'Verbo copulativo. Se usa para identificar: A 是 B = "A es B".', ejemplos: ['我是人 — Yo soy una persona', '他是美國人 — Él es estadounidense'] },
        { id: 'v2', espanol: 'Amar', tradicional: '愛', pinyin: 'ài', zhuyin: 'ㄞˋ', categoria: 'verbo', clasificador: '', radicales: '爫 + 冖 + 心 + 友', notas: 'El componente 心 (corazón) está en la base.', ejemplos: ['我愛你 — Yo te amo', '我愛貓 — Yo amo a los gatos'] },
        { id: 'id_voc_juede', espanol: 'Pensar que algo es / creer / parecer / sentir', tradicional: '覺得', pinyin: 'juéde', zhuyin: 'ㄐㄩㄝˊ ˙ㄉㄜ', categoria: 'verbo', clasificador: '', radicales: '見 + 彳', notas: 'Verbo cognitivo y de opinión: S + 覺得 + [Cláusula / VS].', ejemplos: ['我覺得中文很有意思 — Pienso que el idioma chino es muy interesante', '你覺得這本書怎麼樣？ — ¿Qué te parece este libro?'] },
    ],
    adverbios: [
        { id: 'a1', espanol: 'No (negación)', tradicional: '不', pinyin: 'bù', zhuyin: 'ㄅㄨˋ', categoria: 'adverbio', clasificador: '', radicales: '', notas: 'Negación general. Va antes del verbo. Cambia a "bú" antes de 4to tono.', ejemplos: ['我不是貓 — Yo no soy un gato', '我不愛狗 — Yo no amo a los perros'] },
        { id: 'a2', espanol: 'Todos / Ambos', tradicional: '都', pinyin: 'dōu', zhuyin: 'ㄉㄡ', categoria: 'adverbio', clasificador: '', radicales: '阝+ 者', notas: 'Adverbio que indica totalidad. Va ANTES del verbo.', ejemplos: ['我們都愛貓 — Todos amamos a los gatos'] },
    ],
    expresiones: [
        { id: 'e1', espanol: 'Hola', tradicional: '你好', pinyin: 'nǐhǎo', zhuyin: 'ㄋㄧˇ ㄏㄠˇ', categoria: 'expresion', clasificador: '', radicales: '你 + 好', notas: 'Literalmente "tú bien". Saludo universal.', ejemplos: [] },
        { id: 'e2', espanol: 'Adiós', tradicional: '再見', pinyin: 'zàijiàn', zhuyin: 'ㄗㄞˋ ㄐㄧㄢˋ', categoria: 'expresion', clasificador: '', radicales: '再 (otra vez) + 見 (ver)', notas: 'Literalmente "nos vemos otra vez".', ejemplos: [] },
    ],
    particulas: [
        { id: 'pt1', espanol: '(sufijo plural)', tradicional: '們', pinyin: 'men', zhuyin: 'ㄇㄣ˙', categoria: 'particula', clasificador: '', radicales: '亻+ 門', notas: 'Convierte pronombres singulares en plurales: 我們 (nosotros), 你們 (ustedes), 他們 (ellos).', ejemplos: ['我們都愛貓 — Todos amamos a los gatos'] },
    ],
    estructuras: [
        {
                "id": "s1",
                "nombre": "Afirmación con 是",
                "formula": "S + 是 + N",
                "ejemplo_tradicional": "我是人",
                "ejemplo_pinyin": "wǒ shì rén",
                "ejemplo_espanol": "Yo soy una persona",
                "notas": "La estructura más básica para identificar. \"A es B\"."
        },
        {
                "id": "s2",
                "nombre": "Negación con 是",
                "formula": "S + 不是 + N",
                "ejemplo_tradicional": "他不是貓",
                "ejemplo_pinyin": "tā bú shì māo",
                "ejemplo_espanol": "Él no es un gato",
                "notas": "不 va antes de 是 para negar."
        },
        {
                "id": "s3",
                "nombre": "Sujeto + Verbo + Objeto",
                "formula": "S + V + O",
                "ejemplo_tradicional": "我愛你",
                "ejemplo_pinyin": "wǒ ài nǐ",
                "ejemplo_espanol": "Yo te amo",
                "notas": "Estructura SVO, similar al español. El orden natural del chino."
        },
        {
                "id": "s4",
                "nombre": "Negación de verbo",
                "formula": "S + 不 + V",
                "ejemplo_tradicional": "我不愛",
                "ejemplo_pinyin": "wǒ bú ài",
                "ejemplo_espanol": "Yo no amo",
                "notas": "不 siempre va antes del verbo para negarlo."
        },
        {
                "id": "s5",
                "nombre": "Uso de 都 (totalidad)",
                "formula": "S + 都 + V + O",
                "ejemplo_tradicional": "我們都愛貓",
                "ejemplo_pinyin": "wǒmen dōu ài māo",
                "ejemplo_espanol": "Todos amamos a los gatos",
                "notas": "都 va después del sujeto y antes del verbo. Indica \"todos/ambos\"."
        },
        {
                "nombre": "Pregunta en formato \"¿no?\"",
                "formula": "S + 是不是",
                "ejemplo_tradicional": "你是不是中國人",
                "ejemplo_pinyin": "nǐ shì bù shì Zhōngguó rén",
                "ejemplo_espanol": "¿Eres chino, no?",
                "notas": "",
                "id": "id_mso0kj7n_gx2ii"
        },
        {
                "nombre": "Pregunta en formato \"¿no?\"",
                "formula": "S + 有沒有",
                "ejemplo_tradicional": "你有沒有兒子",
                "ejemplo_pinyin": "nǐ yǒu méiyǒu érzi",
                "ejemplo_espanol": "¿Tienes hijos, no?",
                "notas": "",
                "id": "id_mso0n3vf_1s4fb"
        },
        {
                "nombre": "Pregunta con \"ma\" (嗎)",
                "formula": "S + V + O + 嗎?",
                "ejemplo_tradicional": "他們有兒子嗎",
                "ejemplo_pinyin": "tā men yǒu érzi ma",
                "ejemplo_espanol": "¿Ellos tienen hijos?",
                "notas": "",
                "id": "id_mso0s7vt_bqmgm"
        },
        {
                "nombre": "Pregunta \"Qué\" o \"Cuál\"",
                "formula": "S + V + 什麼 + S (opcional) + ?",
                "ejemplo_tradicional": "你喜歡什麼蔬菜",
                "ejemplo_pinyin": "nǐ xǐhuān shénme shūcài",
                "ejemplo_espanol": "¿Qué verduras te gustan?",
                "notas": "",
                "id": "id_msr4k90m_ibxqy"
        },
        {
                "nombre": "Pregunta sobre identidad",
                "formula": "S + 是 + 誰",
                "ejemplo_tradicional": "你是誰?",
                "ejemplo_pinyin": "nǐ shì shéi ",
                "ejemplo_espanol": "¿Quién eres?",
                "notas": "",
                "id": "id_mtfg4big_16w0x"
        },
        {
                "id": "s_l1_xing",
                "nombre": "Preguntar y responder el apellido (姓)",
                "formula": "請問，S + 姓什麼？ → S + 姓 + [Apellido]",
                "ejemplo_tradicional": "請問，你姓什麼？我姓王。",
                "ejemplo_pinyin": "qǐngwèn, nǐ xìng shénme? wǒ xìng Wáng.",
                "ejemplo_espanol": "Disculpe, ¿cuál es su apellido? — Mi apellido es Wang.",
                "notas": "姓 funciona como verbo en chino (\"apellidarse\"). De forma muy cortés se dice: 您貴姓？ (Nín guìxìng?)."
        },
        {
                "id": "s_l1_ne",
                "nombre": "Pregunta de seguimiento / rebote con 呢",
                "formula": "S1 + Predicado，S2 + 呢？",
                "ejemplo_tradicional": "我是臺灣人，你呢？",
                "ejemplo_pinyin": "wǒ shì Táiwān rén, nǐ ne?",
                "ejemplo_espanol": "Yo soy taiwanés, ¿y tú?",
                "notas": "呢 devuelve la pregunta previa al nuevo sujeto sin necesidad de repetir toda la frase."
        },
        {
                "id": "s_l2_ji",
                "nombre": "Pregunta de cantidad con 幾 (menor a 10)",
                "formula": "S + 有 + 幾 + Clasificador + N？",
                "ejemplo_tradicional": "你有幾張照片？",
                "ejemplo_pinyin": "nǐ yǒu jǐ zhāng zhàopiàn?",
                "ejemplo_espanol": "¿Cuántas fotos tienes?",
                "notas": "幾 siempre requiere su clasificador correspondiente antes del sustantivo (幾張, 幾個, 幾本)."
        },
        {
                "id": "struct_shangke",
                "nombre": "Tomar / llevar una clase (上...課)",
                "formula": "S + 上 + [Materia] (課)",
                "ejemplo_tradicional": "我上書法課",
                "ejemplo_pinyin": "wǒ shàng shūfǎkè",
                "ejemplo_espanol": "Tomo la clase de caligrafía",
                "notas": "上 (shàng) actúa como verbo para indicar asistir o cursar una materia. Puede usarse con el nombre completo de la asignatura (上書法課) o de forma general: 上課 (entrar a clase / tener clase)."
        },
        {
                "id": "struct_qing_v",
                "nombre": "Petición cortés con 請 (Por favor + V)",
                "formula": "請 + V (+ O)",
                "ejemplo_tradicional": "請喝茶",
                "ejemplo_pinyin": "qǐng hē chá",
                "ejemplo_espanol": "Por favor tome té",
                "notas": "請 (qǐng) se antepone directamente al verbo para expresar cortesía, amabilidad o invitación: 請進 (adelante/pase), 請坐 (siéntese), 請說 (hable por favor)."
        },
        {
                "id": "struct_wenwenti",
                "nombre": "Hacer una pregunta (我要問問題)",
                "formula": "S + 要 + 問問題",
                "ejemplo_tradicional": "老師，我要問問題",
                "ejemplo_pinyin": "lǎoshī, wǒ yào wèn wèntí",
                "ejemplo_espanol": "Profesor/a, quiero hacer una pregunta",
                "notas": "問 (wèn) es el verbo preguntar y 問題 (wèntí) es el sustantivo pregunta o problema. En chino se utiliza el objeto cognado 'preguntar una pregunta' (問問題)."
        },
        {
                "id": "struct_haolema",
                "nombre": "Preguntar si está listo / completado (好了嗎？)",
                "formula": "(S +) 好了嗎？",
                "ejemplo_tradicional": "你們好了嗎？",
                "ejemplo_pinyin": "nǐmen hǎo le ma?",
                "ejemplo_espanol": "¿Están listos ustedes? / ¿Ya está listo?",
                "notas": "好 funciona como complemento de resultado para indicar que una preparación o acción ha finalizado con éxito. Se responde afirmativamente con 好了 (¡listo!) o con 還沒 (todavía no)."
        },
        {
                "id": "struct_zaishuoyici",
                "nombre": "Pedir repetición (請再說一次)",
                "formula": "請 + 再 + V + 一次",
                "ejemplo_tradicional": "請再說一次",
                "ejemplo_pinyin": "qǐng zài shuō yí cì",
                "ejemplo_espanol": "Por favor repítalo una vez más",
                "notas": "再 (zài) señala la repetición de una acción hacia el futuro ('otra vez'). 一次 (yí cì) significa 'una vez'."
        },
        {
                "id": "struct_xiagelibaijian",
                "nombre": "Despedida con marco temporal (下個禮拜見)",
                "formula": "[Tiempo] + 見",
                "ejemplo_tradicional": "下個禮拜見",
                "ejemplo_pinyin": "xià ge lǐbài jiàn",
                "ejemplo_espanol": "Nos vemos la próxima semana",
                "notas": "禮拜 (lǐbài) se usa coloquialmente en Taiwán como sinónimo exacto de 星期 (xīngqī, semana). 見 significa verse o encontrarse."
        },
        {
                "id": "struct_mingtianjian",
                "nombre": "Despedida para el día siguiente (明天見)",
                "formula": "明天 + 見",
                "ejemplo_tradicional": "明天見",
                "ejemplo_pinyin": "míngtiān jiàn",
                "ejemplo_espanol": "Nos vemos mañana",
                "notas": "Fórmula fija de despedida cotidiana en chino que especifica cuándo se volverán a encontrar."
        },
        {
                "id": "struct_henduo_n",
                "nombre": "Cantidad indefinida con 很多 (Muchos + Sustantivo)",
                "formula": "(S + 有 +) 很多 + N",
                "ejemplo_tradicional": "我們學校有很多學生",
                "ejemplo_pinyin": "wǒmen xuéxiào yǒu hěn duō xuéshēng",
                "ejemplo_espanol": "Nuestra escuela tiene muchos estudiantes",
                "notas": "很多 (hěn duō) modifica sustantivos directamente sin necesidad de intercalar un clasificador (很多書 = muchos libros, 很多人 = mucha gente)."
        },
        {
                "id": "struct_zainali",
                "nombre": "Preguntar ubicación con 在哪裡 (¿Dónde está S?)",
                "formula": "S + 在哪裡？",
                "ejemplo_tradicional": "教室在哪裡？",
                "ejemplo_pinyin": "jiàoshì zài nǎlǐ?",
                "ejemplo_espanol": "¿Dónde está el salón de clases?",
                "notas": "在 (zài) expresa ubicación espacial ('estar en') y 哪裡 (nǎlǐ) es el pronombre interrogativo de lugar ('dónde')."
        },
        {
                "id": "struct_fecha_minguo",
                "nombre": "Fecha en calendario republicano de Taiwán (民國紀年)",
                "formula": "民國 + [Año] + 年 + [Mes] + 月 + [Día] + 日 (號)",
                "ejemplo_tradicional": "今天是民國115年9月27日",
                "ejemplo_pinyin": "jīntiān shì Mínguó yībǎi yīshíliù nián jiǔ yuè èrshíqī rì",
                "ejemplo_espanol": "Hoy es 27 de septiembre del año 115 de la República de China",
                "notas": "El calendario de la República de China (Minguo) comienza en 1912 (año 1). Año Minguo = Año gregoriano - 1911 (ej: 2026 - 1911 = 115). En el habla cotidiana oral suele preferirse 號 (hào) en vez de 日 (rì)."
        },
        {
                "id": "struct_fecha_estandar",
                "nombre": "Fecha estándar gregoriana (Año-Mes-Día)",
                "formula": "[Año] + 年 + [Mes] + 月 + [Día] + 日 (號)",
                "ejemplo_tradicional": "今天是2026年9月27日",
                "ejemplo_pinyin": "jīntiān shì èrlíng'èrliù nián jiǔ yuè èrshíqī rì",
                "ejemplo_espanol": "Hoy es 27 de septiembre de 2026",
                "notas": "El orden temporal en chino va siempre de mayor a menor: 年 (año) → 月 (mes) → 日/號 (día). Los años se leen dígito por dígito."
        },
        {
                "id": "struct_shenmeshihou",
                "nombre": "Preguntar el momento con 什麼時候 (¿Cuándo?)",
                "formula": "S + 什麼時候 + V (+ O)？",
                "ejemplo_tradicional": "你什麼時候下課？",
                "ejemplo_pinyin": "nǐ shénme shíhòu xiàkè?",
                "ejemplo_espanol": "¿Cuándo sales de clase?",
                "notas": "En la gramática china, la pregunta de tiempo 什麼時候 se coloca siempre ANTES del verbo, nunca al final de la oración."
        },
        {
                "id": "struct_zenmequ_do",
                "nombre": "Preguntar medio de transporte y propósito (怎麼去...做...)",
                "formula": "S + 怎麼 + 去 + [Lugar] + V (+ O)？",
                "ejemplo_tradicional": "你怎麼去學校上課？",
                "ejemplo_pinyin": "nǐ zěnme qù xuéxiào shàngkè?",
                "ejemplo_espanol": "¿Cómo vas a la escuela a tomar clases?",
                "notas": "怎麼 (zěnme) interroga el modo o medio de transporte. Va antes de 去 (qù - ir), y el verbo de propósito (上課) se ubica al final."
        },
        {
                "id": "struct_zenmequ_place",
                "nombre": "Preguntar cómo llegar a un lugar (怎麼去...)",
                "formula": "S + 怎麼 + 去 + [Lugar]？",
                "ejemplo_tradicional": "請問，怎麼去教室？",
                "ejemplo_pinyin": "qǐngwèn, zěnme qù jiàoshì?",
                "ejemplo_espanol": "Disculpe, ¿cómo se va al salón de clases?",
                "notas": "Patrón esencial para solicitar direcciones y rutas hacia un punto específico de destino."
        },
        {
                "id": "struct_frecuencia_ci",
                "nombre": "Frecuencia temporal de acciones (Período + V + No. + 次)",
                "formula": "S + [Período] + V + [Número] + 次",
                "ejemplo_tradicional": "我一天喝三次茶",
                "ejemplo_pinyin": "wǒ yì tiān hē sān cì chá",
                "ejemplo_espanol": "Tomo té tres veces al día",
                "notas": "次 (cì) actúa como clasificador verbal de veces/repeticiones. El marco de tiempo (一天 = un día) antecede al verbo, y el complemento cuantitativo verbal ([No.] 次) le sigue."
        },
        {
                "id": "struct_adj_de_n",
                "nombre": "Modificación de sustantivo con adjetivo y 的",
                "formula": "(很 +) VS/Adj + 的 + N",
                "ejemplo_tradicional": "很貴的茶",
                "ejemplo_pinyin": "hěn guì de chá",
                "ejemplo_espanol": "Té muy caro / Té costoso",
                "notas": "Cuando un adjetivo o verbo de estado (VS) califica a un sustantivo, se utiliza la partícula 的 (de) como nexo atributivo obligatorio."
        },
        {
                "id": "struct_dou_vs",
                "nombre": "Predicación total de cualidad con 都 (Todos son...)",
                "formula": "S (plural) + 都 + (很 +) VS",
                "ejemplo_tradicional": "這些書都很貴",
                "ejemplo_pinyin": "zhèxiē shū dōu hěn guì",
                "ejemplo_espanol": "Todos estos libros son caros",
                "notas": "都 (dōu) abarca sin excepción a la totalidad del sujeto plural y se antepone a la frase adjetival o verbo de estado."
        },
        {
                "id": "struct_dou_bu_vs",
                "nombre": "Negación total con 都不 (Ninguno es...)",
                "formula": "S (plural) + 都不 + VS",
                "ejemplo_tradicional": "這些書都不貴",
                "ejemplo_pinyin": "zhèxiē shū dōu bú guì",
                "ejemplo_espanol": "Ninguno de estos libros es caro",
                "notas": "都 + 不 = 'todos no / ninguno'. Se niega la cualidad o acción en un 100% de los elementos que integran el sujeto."
        },
        {
                "id": "struct_bu_dou_vs",
                "nombre": "Negación parcial con 不都 (No todos son...)",
                "formula": "S (plural) + 不都 + VS",
                "ejemplo_tradicional": "這些書不都貴",
                "ejemplo_pinyin": "zhèxiē shū bù dōu guì",
                "ejemplo_espanol": "No todos estos libros son caros (algunos sí y otros no)",
                "notas": "不 + 都 = negación parcial. Indica que solo una parte del conjunto posee la propiedad descripta."
        },
        {
                "id": "struct_qu_place_zuoshenme",
                "nombre": "Preguntar propósito de visita (去...做什麼？)",
                "formula": "S + 去 + [Lugar] + 做什麼？",
                "ejemplo_tradicional": "你去教室做什麼？",
                "ejemplo_pinyin": "nǐ qù jiàoshì zuò shénme?",
                "ejemplo_espanol": "¿A qué vas al salón de clases? / ¿Qué vas a hacer al salón?",
                "notas": "做什麼 (zuò shénme) significa 'hacer qué'. Se ubica al final de la construcción de movimiento serial para averiguar el fin o motivo."
        },
        {
                "id": "struct_chibaolema",
                "nombre": "Saludo tradicional sobre comida (吃飽了嗎？)",
                "formula": "(你 +) 吃飽了嗎？",
                "ejemplo_tradicional": "你吃飽了嗎？",
                "ejemplo_pinyin": "nǐ chī bǎo le ma?",
                "ejemplo_espanol": "¿Ya comiste? / ¿Quedaste satisfecho?",
                "notas": "飽 (bǎo) expresa estar saciado. En la cultura tradicional taiwanesa y china, preguntar si alguien comió o quedó satisfecho es un saludo afectuoso de cortesía y cercanía."
        },
        {
                "id": "struct_nichilema",
                "nombre": "Saludo cotidiano de comida (你吃了嗎？)",
                "formula": "你 + 吃了嗎？",
                "ejemplo_tradicional": "你吃了嗎？",
                "ejemplo_pinyin": "nǐ chī le ma?",
                "ejemplo_espanol": "¿Ya comiste?",
                "notas": "Fórmula coloquial común que funciona de modo similar a '¿qué tal?' o '¿cómo estás?' en momentos cercanos al almuerzo o a la cena."
        }
,
        {
            "id": "struct_l3_xihuan",
            "nombre": "Expresar gustos y aficiones con 喜歡 (Xǐhuān)",
            "formula": "S + 喜歡 (+ 不喜歡) + (V +) O",
            "ejemplo_tradicional": "我喜歡聽音樂，不喜歡運動",
            "ejemplo_pinyin": "wǒ xǐhuān tīng yīnyuè, bù xǐhuān yùndòng",
            "ejemplo_espanol": "Me gusta escuchar música, no me gusta hacer ejercicio",
            "notas": "喜歡 se emplea tanto con sustantivos directos como con frases verbales completas. Para preguntar se puede usar 嗎 (你喜歡聽音樂嗎？) o la forma V-no-V (你喜歡不喜歡游泳？)."
},
        {
            "id": "struct_l3_da_ti_deportes",
            "nombre": "Deportes de manos (打) vs. deportes de pies (踢)",
            "formula": "打 + [Deporte con manos / bate] / 踢 + [Deporte con pies]",
            "ejemplo_tradicional": "他喜歡打網球和踢足球",
            "ejemplo_pinyin": "tā xǐhuān dǎ wǎngqiú hàn tī zúqiú",
            "ejemplo_espanol": "A él le gusta jugar al tenis y jugar al fútbol",
            "notas": "En mandarín los deportes de pelota se diferencian por el verbo de acción corporal: 打 (dǎ) para manos/raqueta/bate (打棒球, 打網球, 打籃球) y 踢 (tī) para los pies (踢足球)."
},
        {
            "id": "struct_l3_haishi_pregunta",
            "nombre": "Pregunta alternativa disyuntiva con 還是 (¿Opción A o B?)",
            "formula": "S + V + Opción A + 還是 (+ V) + Opción B？",
            "ejemplo_tradicional": "妳想看美國電影還是臺灣電影？",
            "ejemplo_pinyin": "nǐ xiǎng kàn Měiguó diànyǐng háishì Táiwān diànyǐng?",
            "ejemplo_espanol": "¿Quieres ver una película estadounidense o una película taiwanesa?",
            "notas": "還是 (háishì) se utiliza EXCLUSIVAMENTE en preguntas con opciones excluyentes ('¿A o B?'). Nunca se debe usar 還是 en oraciones afirmativas (para las cuales se usa 或者 huòzhě)."
},
        {
            "id": "struct_l3_propuesta_zenmeyang",
            "nombre": "Hacer propuestas y consultar opinión con ...，怎麼樣？",
            "formula": "[Plan / Propuesta temporal y de acción]，怎麼樣？",
            "ejemplo_tradicional": "明天是週末，我們早上去踢足球，怎麼樣？",
            "ejemplo_pinyin": "míngtiān shì zhōumò, wǒmen zǎoshàng qù tī zúqiú, zěnmeyàng?",
            "ejemplo_espanol": "Mañana es fin de semana, ¿qué tal si vamos a jugar al fútbol por la mañana?",
            "notas": "Se plantea primero la propuesta completa (a menudo con sujeto nosotros 我們 y marco temporal) y se cierra con 怎麼樣？ para solicitar de forma cortés el parecer del interlocutor."
},
        {
            "id": "struct_l3_propuesta_haobuhao",
            "nombre": "Invitaciones y búsqueda de acuerdo con ...，好不好？",
            "formula": "[Plan / Propuesta de acción]，好不好？",
            "ejemplo_tradicional": "今天晚上我們去看電影，好不好？",
            "ejemplo_pinyin": "jīntiān wǎnshàng wǒmen qù kàn diànyǐng, hǎo bù hǎo?",
            "ejemplo_espanol": "Vamos al cine esta noche, ¿te parece bien?",
            "notas": "Es una invitación directa mediante la fórmula V-not-V aplicada a 好 (bueno). La respuesta afirmativa natural y entusiasta es 好啊！ (¡De acuerdo!)."
},
        {
            "id": "struct_l3_particula_ba",
            "nombre": "Sugerencia y propuesta exhortativa con la partícula 吧",
            "formula": "S + V (+ O) + 吧！",
            "ejemplo_tradicional": "我們看臺灣電影吧！",
            "ejemplo_pinyin": "wǒmen kàn Táiwān diànyǐng ba!",
            "ejemplo_espanol": "¡Veamos una película taiwanesa!",
            "notas": "La partícula final 吧 atenúa la imposición, convirtiendo una afirmación en una sugerencia compartida ('vamos a...', '¡hagámoslo!'). Muy común para tomar una decisión en grupo tras debatir opciones."
},
        {
            "id": "struct_l3_xiang_deseo",
            "nombre": "Verbo auxiliar de deseo / intención con 想 (Querer + V)",
            "formula": "S + 想 (+ 不想) + V + O",
            "ejemplo_tradicional": "今天晚上我想吃越南菜",
            "ejemplo_pinyin": "jīntiān wǎnshàng wǒ xiǎng chī Yuènán cài",
            "ejemplo_espanol": "Esta noche tengo ganas de comer comida vietnamita / quiero comer comida vietnamita",
            "notas": "想 colocado antes de un verbo principal funciona como auxiliar modal de deseo voluntario o ganas ('tener ganas de'). Su negación es 不想 (no tener ganas)."
},
        {
            "id": "struct_l3_keyi_posibilidad",
            "nombre": "Posibilidad y capacidad con el auxiliar 可以 (Poder + V)",
            "formula": "S + 可以 + V + O",
            "ejemplo_tradicional": "看電影可以學中文",
            "ejemplo_pinyin": "kàn diànyǐng kěyǐ xué Zhōngwén",
            "ejemplo_espanol": "Viendo películas se puede aprender chino / ver películas sirve para aprender chino",
            "notas": "可以 indica que la circunstancia permite realizar la acción, o que una acción facilita un beneficio o resultado."
},
        {
            "id": "struct_l3_yiqi_juntos",
            "nombre": "Acción conjunta en compañía con 一起 (Juntos + V)",
            "formula": "S + 一起 + V + O",
            "ejemplo_tradicional": "晚上要不要一起吃晚飯？",
            "ejemplo_pinyin": "wǎnshàng yào bú yào yìqǐ chī wǎnfàn?",
            "ejemplo_espanol": "¿Cenamos juntos esta noche? / ¿Quieres que comamos la cena juntos?",
            "notas": "El adverbio 一起 (yìqǐ) precede inmediatamente a la frase verbal y expresa que los sujetos llevan a cabo la acción de manera compartida."
},
        {
            "id": "struct_l3_chang_ye",
            "nombre": "Frecuencia habitual acumulativa con 常 y 也常",
            "formula": "S + 常 + V1 (+ O1)，也常 + V2 (+ O2)",
            "ejemplo_tradicional": "我常打籃球，也常踢足球",
            "ejemplo_pinyin": "wǒ cháng dǎ lánqiú, yě cháng tī zúqiú",
            "ejemplo_espanol": "Juego seguido al baloncesto y también suelo jugar al fútbol",
            "notas": "常 expresa habitualidad positiva ('a menudo / con frecuencia'). Cuando se suman dos actividades habituales se combina con 也 (también): 也常. Su opuesto es 不常 (rara vez / no muy seguido)."
}
],
    meta: {
        version: '1.0',
        ultimaEdicion: new Date().toISOString().split('T')[0]
    }
};
