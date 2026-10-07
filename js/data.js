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
 * Seed data — loaded on first visit or synced to refresh database.
 * Contains 277 curated cards across all categories and 45 structures.
 */
const SEED_DATA = {
    "palabras": [
        {
            "id": "n1",
            "espanol": "Papá",
            "tradicional": "爸爸",
            "pinyin": "bàba",
            "zhuyin": "ㄅㄚˋ ㄅㄚ˙",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "父 (fù - padre)"
                },
                {
                    "type": "text",
                    "value": "巴 (bā - serpiente)"
                }
            ],
            "notas": "Compuesto por 父 (padre) y 巴 (fonético bā). Formal: 父親 (fùqīn).",
            "ejemplos": [
                "他是我的爸爸 — Él es mi papá",
                "我爸爸愛喝烏龍茶 — A mi papá le encanta tomar té Oolong"
            ],
            "leccion": 2
        },
        {
            "id": "n2",
            "espanol": "Mamá",
            "tradicional": "媽媽",
            "pinyin": "māma",
            "zhuyin": "ㄇㄚ ㄇㄚ˙",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                },
                {
                    "type": "text",
                    "value": "馬 (mǎ - caballo)"
                }
            ],
            "notas": "Compuesto por el semántico 女 (mujer) y el fonético 馬 (mǎ → mā). Formal: 母親 (mǔqīn).",
            "ejemplos": [
                "她是我的媽媽 — Ella es mi mamá",
                "我媽媽很漂亮 — Mi mamá es muy hermosa"
            ],
            "leccion": 2
        },
        {
            "id": "n3",
            "espanol": "Hijo",
            "tradicional": "兒子",
            "pinyin": "érzi",
            "zhuyin": "ㄦˊ ㄗ˙",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "兒 (ér - niño)"
                },
                {
                    "type": "text",
                    "value": "子 (zǐ - hijo)"
                }
            ],
            "notas": "儿 representa a un infante con la fontanela abierta sobre sus piernas, junto a 子 (hijo).",
            "ejemplos": [
                "他是我的兒子 — Él es mi hijo",
                "李先生有一個兒子 — El señor Li tiene un hijo"
            ]
        },
        {
            "id": "n4",
            "espanol": "Hija",
            "tradicional": "女兒",
            "pinyin": "nǚ'ér",
            "zhuyin": "ㄋㄩˇ ㄦˊ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                },
                {
                    "type": "text",
                    "value": "兒 (ér - niño)"
                }
            ],
            "notas": "Compuesto por 女 (mujer) y 兒 (infante / hijo).",
            "ejemplos": [
                "她是我的女兒 — Ella es mi hija",
                "陳小姐有兩個女兒 — La señorita Chen tiene dos hijas"
            ]
        },
        {
            "id": "n5",
            "espanol": "China",
            "tradicional": "中國",
            "pinyin": "Zhōngguó",
            "zhuyin": "ㄓㄨㄥ ㄍㄨㄛˊ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjn2p70_9qg74"
                },
                {
                    "type": "text",
                    "value": "國 (guó - país)"
                }
            ],
            "notas": "Literalmente 'El País del Centro'. 中 representa el centro y 國 el territorio amurallado.",
            "ejemplos": [
                "他是中國人 — Él es chino",
                "我不是中國人 — Yo no soy chino"
            ]
        },
        {
            "id": "n6",
            "espanol": "Estados Unidos",
            "tradicional": "美國",
            "pinyin": "Měiguó",
            "zhuyin": "ㄇㄟˇ ㄍㄨㄛˊ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "美 (měi - bello)"
                },
                {
                    "type": "text",
                    "value": "國 (guó - país)"
                }
            ],
            "notas": "Literalmente 'País Hermoso'. Préstamo fonético de 'América' que eligió el auspicioso carácter 美.",
            "ejemplos": [
                "他是美國人 — Él es estadounidense",
                "王開文是美國人 — Wang Kaiwen es de EE.UU."
            ],
            "leccion": 1
        },
        {
            "id": "n7",
            "espanol": "Persona",
            "tradicional": "人",
            "pinyin": "rén",
            "zhuyin": "ㄖㄣˊ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                }
            ],
            "notas": "Pictograma de una persona de pie de perfil. Como radical lateral se comprime en 亻.",
            "ejemplos": [
                "他是好人 — Él es buena persona",
                "你是哪國人？ — ¿De qué país eres?"
            ],
            "leccion": 1
        },
        {
            "id": "n8",
            "espanol": "Gato",
            "tradicional": "貓",
            "pinyin": "māo",
            "zhuyin": "ㄇㄠ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfigeht_eqxfj",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n9"
                },
                {
                    "type": "text",
                    "value": "苗 (miáo - brote)"
                }
            ],
            "notas": "Lleva el radical animal 犭 y 苗 (miáo), que aporta la pronunciación onomatopéyica del maullido.",
            "ejemplos": [
                "我愛貓 — Yo amo a los gatos",
                "這隻貓很漂亮 — Este gato es muy lindo"
            ]
        },
        {
            "id": "n9",
            "espanol": "Perro",
            "tradicional": "狗",
            "pinyin": "gǒu",
            "zhuyin": "ㄍㄡˇ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfigeht_eqxfj",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n9"
                },
                {
                    "type": "text",
                    "value": "句 (jù - frase)"
                }
            ],
            "notas": "Lleva el radical animal 犭 y 句 (jù) como componente fonético.",
            "ejemplos": [
                "他愛狗 — Él ama a los perros",
                "我家有一隻狗 — En mi casa hay un perro"
            ]
        },
        {
            "id": "p1",
            "espanol": "Yo",
            "tradicional": "我",
            "pinyin": "wǒ",
            "zhuyin": "ㄨㄛˇ",
            "categoria": "pronombre",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "手 (shǒu - mano)"
                },
                {
                    "type": "text",
                    "value": "戈 (gē - alabarda)"
                }
            ],
            "notas": "Representa una mano empuñando un arma con filo simbolizando el guerrero defensor de sí mismo.",
            "ejemplos": [
                "我是人 — Yo soy una persona",
                "我是臺灣人 — Soy taiwanés/a"
            ],
            "leccion": 1
        },
        {
            "id": "p2",
            "espanol": "Tú",
            "tradicional": "你",
            "pinyin": "nǐ",
            "zhuyin": "ㄋㄧˇ",
            "categoria": "pronombre",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "尔 (ěr - tú)"
                }
            ],
            "notas": "Persona 亻 junto a 尔 (tú). Registro de respeto y cortesía con mayores: 您 (nín).",
            "ejemplos": [
                "你好 — Hola",
                "你要喝茶嗎？ — ¿Quieres tomar té?"
            ],
            "leccion": 1
        },
        {
            "id": "p3",
            "espanol": "Él",
            "tradicional": "他",
            "pinyin": "tā",
            "zhuyin": "ㄊㄚ",
            "categoria": "pronombre",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "ref",
                    "id": "id_msk0pp4g_bdeqd"
                }
            ],
            "notas": "Persona 亻 junto a 也 (fonético). En lengua hablada 他 (él) y 她 (ella) suenan idénticos (tā).",
            "ejemplos": [
                "他是我的爸爸 — Él es mi papá",
                "他是美國人 — Él es estadounidense"
            ],
            "leccion": 1
        },
        {
            "espanol": "Hermano mayor",
            "tradicional": "哥哥",
            "pinyin": "gēge",
            "zhuyin": "ㄍㄜ ˙ㄍㄜ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "可 (kě - poder)"
                },
                {
                    "type": "text",
                    "value": "可 (kě - poder)"
                }
            ],
            "notas": "Duplicación de 可 (cantar/aprobación) representando la autoridad del hermano mayor.",
            "ejemplos": [
                "他是我哥哥 — Él es mi hermano mayor",
                "我有兩個哥哥 — Tengo dos hermanos mayores"
            ],
            "id": "id_msik39qn_a7u9l",
            "fechaCreacion": "2026-08-07",
            "leccion": 2
        },
        {
            "espanol": "Hermano menor",
            "tradicional": "弟弟",
            "pinyin": "dìdi",
            "zhuyin": "ㄉㄧˋ ㄉㄧ˙",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "弓 (gōng - arco)"
                },
                {
                    "type": "text",
                    "value": "丨 (gǔn - línea vertical)"
                }
            ],
            "notas": "Representa una cuerda enrollada alrededor de un eje central que va descendiendo.",
            "ejemplos": [
                "這是我弟弟 — Este es mi hermano menor",
                "我弟弟愛喝咖啡 — A mi hermano menor le encanta el café"
            ],
            "id": "id_msik5odg_jbtys",
            "fechaCreacion": "2026-08-07"
        },
        {
            "espanol": "Hermana mayor",
            "tradicional": "姐姐",
            "pinyin": "jiějie",
            "zhuyin": "ㄐㄧㄝˇ ˙ㄐㄧㄝ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                },
                {
                    "type": "text",
                    "value": "且 (qiě - pedestal)"
                }
            ],
            "notas": "Compuesto por 女 (mujer) y 且 (pedestal con ofrenda ceremonial).",
            "ejemplos": [
                "我姐姐很漂亮 — Mi hermana mayor es muy hermosa",
                "她是我姐姐 — Ella es mi hermana mayor"
            ],
            "id": "id_msik8oqu_qbhis",
            "fechaCreacion": "2026-08-07",
            "leccion": 2
        },
        {
            "espanol": "Hermana menor",
            "tradicional": "妹妹",
            "pinyin": "mèimei",
            "zhuyin": "ㄇㄟˋ ˙ㄇㄟ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                },
                {
                    "type": "text",
                    "value": "未 (wèi - aún no)"
                }
            ],
            "notas": "Compuesto por 女 (mujer) y 未 (árbol aún joven cuyas ramas no han terminado de brotar).",
            "ejemplos": [
                "我妹妹愛吃麵包 — A mi hermana menor le encanta comer pan",
                "他沒有妹妹 — Él no tiene hermanas menores"
            ],
            "id": "id_msikblio_cwfgf",
            "fechaCreacion": "2026-08-07",
            "leccion": 2
        },
        {
            "espanol": "Panda",
            "tradicional": "熊貓",
            "pinyin": "xióngmāo",
            "zhuyin": "ㄒㄩㄥˊ ㄇㄠ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_msk03o1q_bn3lq"
                },
                {
                    "type": "ref",
                    "id": "n8"
                }
            ],
            "notas": "En Taiwán se le denomina formalmente 貓熊 (māoxióng = oso con cara felina).",
            "ejemplos": [
                "臺灣有熊貓 — En Taiwán hay osos panda",
                "熊貓很可愛 — Los osos panda son muy lindos"
            ],
            "id": "id_msk017n8_4gul2",
            "fechaCreacion": "2026-08-08"
        },
        {
            "espanol": "Oso",
            "tradicional": "熊",
            "pinyin": "xióng",
            "zhuyin": "ㄒㄩㄥˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "能 (néng - poder/oso)"
                },
                {
                    "type": "ref",
                    "id": "id_msk0536g_z9es3"
                }
            ],
            "notas": "Oso arcaico 能 con cuatro puntos de fuego 灬 en la base que representan sus patas.",
            "ejemplos": [
                "山上有熊 — En la montaña hay osos"
            ],
            "id": "id_msk03o1q_bn3lq",
            "fechaCreacion": "2026-08-08"
        },
        {
            "espanol": "Fuego",
            "tradicional": "火",
            "pinyin": "huǒ",
            "zhuyin": "ㄏㄨㄛˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "火 (huǒ - fuego)"
                }
            ],
            "notas": "Pictograma de llamas ascendentes. En la base de otros caracteres se convierte en cuatro puntos 灬.",
            "ejemplos": [
                "小心火 — Cuidado con el fuego"
            ],
            "id": "id_msk0536g_z9es3",
            "fechaCreacion": "2026-08-08"
        },
        {
            "espanol": "Cerdo",
            "tradicional": "豬",
            "pinyin": "zhū",
            "zhuyin": "ㄓㄨ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n9"
                },
                {
                    "type": "text",
                    "value": "者 (zhě - persona)"
                }
            ],
            "notas": "Lleva el radical animal 犭 y 者 (zhě) como apoyo fonético.",
            "ejemplos": [
                "他不吃豬肉 — Él no come carne de cerdo"
            ],
            "id": "id_msk1t99s_rmiqu",
            "fechaCreacion": "2026-08-08"
        },
        {
            "espanol": "Vaca",
            "tradicional": "牛",
            "pinyin": "niú",
            "zhuyin": "ㄋㄧㄡˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "牛 (niú - buey/vaca)"
                }
            ],
            "notas": "Pictograma frontal de la cabeza de un vacuno con sus dos cuernos curvados hacia arriba.",
            "id": "id_msm92gg0_0itxa",
            "fechaCreacion": "2026-08-09",
            "ejemplos": [
                "我不吃牛肉 — No como carne de res",
                "那是一頭牛 — Eso es una vaca"
            ]
        },
        {
            "espanol": "Oveja",
            "tradicional": "羊",
            "pinyin": "yáng",
            "zhuyin": "ㄧㄤˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "羊 (yáng - oveja)"
                }
            ],
            "notas": "Cabeza de carnero con cuernos. Símbolo tradicional de bondad y belleza (base de 美 y 善).",
            "id": "id_msm94o21_akw2l",
            "fechaCreacion": "2026-08-09",
            "ejemplos": [
                "草原上有很多羊 — En la pradera hay muchas ovejas"
            ]
        },
        {
            "espanol": "Pez",
            "tradicional": "魚",
            "pinyin": "yú",
            "zhuyin": "ㄩˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "魚 (yú - pez)"
                }
            ],
            "notas": "Pictograma de un pez: cabeza ⺈, cuerpo con escamas 田 y cola o aletas 灬.",
            "id": "id_msm9k01h_l204m",
            "fechaCreacion": "2026-08-09",
            "ejemplos": [
                "貓愛吃魚 — A los gatos les encanta comer pescado"
            ]
        },
        {
            "espanol": "Gallina / Gallo",
            "tradicional": "雞",
            "pinyin": "jī",
            "zhuyin": "ㄐㄧ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "奚 (xī - sirviente)"
                },
                {
                    "type": "text",
                    "value": "隹 (zhuī - ave)"
                }
            ],
            "notas": "Lleva 隹 (ave de cola corta) a la derecha y 奚 como soporte fonético.",
            "id": "id_msm9pack_0z89c",
            "fechaCreacion": "2026-08-09",
            "ejemplos": [
                "他喜歡吃雞肉 — A él le gusta comer carne de pollo"
            ]
        },
        {
            "espanol": "Pájaro",
            "tradicional": "鳥",
            "pinyin": "niǎo",
            "zhuyin": "ㄋㄧㄠˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "鳥 (niǎo - pájaro)"
                }
            ],
            "notas": "Pictograma de un ave de perfil con ojo, pico, plumaje y garras. Especialmente aves de cola larga.",
            "id": "id_msm9v3ja_lt8zj",
            "fechaCreacion": "2026-08-09",
            "ejemplos": [
                "這隻鳥很漂亮 — Este pájaro es muy hermoso"
            ]
        },
        {
            "espanol": "Ella",
            "tradicional": "她",
            "pinyin": "tā",
            "zhuyin": "ㄊㄚ",
            "categoria": "pronombre",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                },
                {
                    "type": "ref",
                    "id": "id_msk0pp4g_bdeqd"
                }
            ],
            "notas": "Lleva el radical de mujer 女 a la izquierda. Suena exactamente igual que 他 (tā).",
            "id": "id_mso0qqz5_dsqug",
            "fechaCreacion": "2026-08-11",
            "ejemplos": [
                "她是我的媽媽 — Ella es mi mamá",
                "她是陳月美 — Ella es Chen Yuemei"
            ]
        },
        {
            "espanol": "Carne",
            "tradicional": "肉",
            "pinyin": "ròu",
            "zhuyin": "ㄖㄡˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "肉 (ròu - carne)"
                }
            ],
            "notas": "Pictograma de una pieza de carne fresca con sus vetas y costillas. Como radical lateral se escribe 月.",
            "id": "id_mspmf6ea_rlqzs",
            "fechaCreacion": "2026-08-12",
            "ejemplos": [
                "你吃肉嗎？ — ¿Comes carne?",
                "牛肉很好吃 — La carne de res es muy rica"
            ]
        },
        {
            "espanol": "Pan",
            "tradicional": "麵包",
            "pinyin": "miànbāo",
            "zhuyin": "ㄇㄧㄢˋ ㄅㄠ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "麵 (miàn - harina)"
                },
                {
                    "type": "text",
                    "value": "包 (bāo - envolver)"
                }
            ],
            "notas": "Compuesto por 麵 (harina de trigo) y 包 (envolver).",
            "id": "id_mspmi8yb_9hq62",
            "fechaCreacion": "2026-08-12",
            "ejemplos": [
                "我早餐吃麵包 — Desayuno pan",
                "這個麵包很好吃 — Este pan es muy sabroso"
            ]
        },
        {
            "espanol": "Verduras",
            "tradicional": "蔬菜",
            "pinyin": "shūcài",
            "zhuyin": "ㄕㄨ ㄘㄞˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "蔬 (shū - hortaliza)"
                },
                {
                    "type": "text",
                    "value": "菜 (cài - verdura)"
                }
            ],
            "notas": "Ambos caracteres llevan el radical superior de hierba 艹 (cǎozìtóu).",
            "id": "id_mspmlm3v_ima5f",
            "fechaCreacion": "2026-08-12",
            "ejemplos": [
                "多吃蔬菜很好 — Comer muchas verduras es muy bueno"
            ]
        },
        {
            "espanol": "Café",
            "tradicional": "咖啡",
            "pinyin": "kāfēi",
            "zhuyin": "ㄎㄚ ㄈㄟ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "咖 (kā - café)"
                },
                {
                    "type": "text",
                    "value": "啡 (fēi - café)"
                }
            ],
            "notas": "Préstamo fonético internacional con radical de boca 口 para indicar bebida ingerida.",
            "id": "id_msr3f6bq_8lytq",
            "fechaCreacion": "2026-08-13",
            "ejemplos": [
                "你要喝咖啡嗎？ — ¿Quieres tomar café?",
                "臺灣的咖啡很好喝 — El café de Taiwán es muy rico"
            ],
            "leccion": 1
        },
        {
            "espanol": "Licor",
            "tradicional": "酒",
            "pinyin": "jiǔ",
            "zhuyin": "ㄐㄧㄡˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_agua_1786603351443"
                },
                {
                    "type": "text",
                    "value": "酉 (yǒu - vasija)"
                }
            ],
            "notas": "Agua 氵 junto a una vasija o ánfora ceremonial de fermentación 酉.",
            "id": "id_msr3ohuy_nkysq",
            "fechaCreacion": "2026-08-13",
            "ejemplos": [
                "我不喝酒 — Yo no bebo alcohol"
            ]
        },
        {
            "espanol": "Jugo de frutas (Zumo)",
            "tradicional": "果汁",
            "pinyin": "guǒzhī",
            "zhuyin": "ㄍㄨㄛˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "果 (guǒ - fruta)"
                },
                {
                    "type": "ref",
                    "id": "rad_agua_1786603351443"
                },
                {
                    "type": "ref",
                    "id": "id_mtfikvkd_74gu4"
                }
            ],
            "notas": "汁 combina agua 氵 con el número diez 十 (todo el líquido concentrado).",
            "id": "id_msr3ttke_nrbsn",
            "fechaCreacion": "2026-08-13",
            "ejemplos": [
                "請給我一杯果汁 — Por favor deme un vaso de zumo de frutas"
            ]
        },
        {
            "espanol": "Cola (refresco)",
            "tradicional": "可樂",
            "pinyin": "kělè",
            "zhuyin": "ㄎㄜˇ ㄌㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "可 (kě - poder)"
                },
                {
                    "type": "text",
                    "value": "樂 (lè - alegría)"
                }
            ],
            "notas": "Abreviatura de 可口可樂 (kěkǒu kělè = delicioso y que da alegría).",
            "id": "id_msr402cu_y0b6d",
            "fechaCreacion": "2026-08-13",
            "ejemplos": [
                "你要喝可樂嗎？ — ¿Quieres tomar refresco de cola?"
            ]
        },
        {
            "id": "rad_mujer_1786603351443",
            "espanol": "Mujer",
            "tradicional": "女",
            "pinyin": "nǚ",
            "zhuyin": "ㄋㄩˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "女 (nǚ - mujer)"
                }
            ],
            "notas": "Pictograma de una mujer de rodillas con las manos cruzadas. Radical de 媽媽, 她, 姐, 妹, 好, 安.",
            "ejemplos": [
                "女性 — Mujer / género femenino",
                "她是一位女老師 — Ella es una profesora"
            ]
        },
        {
            "id": "rad_agua_1786603351443",
            "espanol": "Agua",
            "tradicional": "水",
            "pinyin": "shuǐ",
            "zhuyin": "ㄕㄨㄟˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "水 (shuǐ - agua)"
                }
            ],
            "notas": "Corriente de agua que fluye. Como radical lateral izquierdo adopta la forma de tres gotas 氵.",
            "ejemplos": [
                "請喝水 — Por favor toma agua",
                "我要喝水 — Quiero beber agua"
            ]
        },
        {
            "espanol": "Nombre",
            "tradicional": "名字",
            "pinyin": "míngzì",
            "zhuyin": "ㄇㄧㄥˊ ㄗˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "名 (míng - nombre)"
                },
                {
                    "type": "text",
                    "value": "字 (zì - carácter)"
                }
            ],
            "notas": "名 es gritar por la boca 口 de noche 夕 para identificarse; 字 es criar niños 子 bajo techo 宀.",
            "id": "id_mtfh6c1j_t4fct",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "你叫什麼名字？ — ¿Cómo te llamas?",
                "我的名字是陳月美 — Mi nombre es Chen Yuemei"
            ],
            "leccion": 2
        },
        {
            "espanol": "Uno",
            "tradicional": "一",
            "pinyin": "yī",
            "zhuyin": "ㄧ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "一 (yī - uno)"
                }
            ],
            "notas": "Cambia a 4º tono (yì) ante tonos 1, 2 y 3; y cambia a 2º tono (yí) ante otro 4º tono (一個 yí ge).",
            "id": "id_mtfhl7d1_9g4op",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "一個人 — Una persona",
                "一張照片 — Una foto"
            ]
        },
        {
            "espanol": "Dos",
            "tradicional": "二",
            "pinyin": "èr",
            "zhuyin": "ㄦˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "二 (èr - dos)"
                }
            ],
            "notas": "Para contar o números abstractos (二月, 第二). Para cantidades con clasificador se usa 兩 (liǎng).",
            "id": "id_mtfhmm38_dxhfq",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "第二課 — Lección dos",
                "二月 — Febrero"
            ]
        },
        {
            "espanol": "Dos",
            "tradicional": "兩",
            "pinyin": "liǎng",
            "zhuyin": "ㄌㄧㄤˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtfhl7d1_9g4op"
                },
                {
                    "type": "text",
                    "value": "兩 (liǎng - dos)"
                }
            ],
            "notas": "Balanza de dos pesas en equilibrio. Se usa obligatoriamente antes de clasificadores: 兩個人, 兩張照片.",
            "id": "id_mtfhneyq_qzbbd",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "我有兩個兄弟 — Tengo dos hermanos varones",
                "請給我兩杯茶 — Por favor deme dos tazas de té"
            ],
            "leccion": 2
        },
        {
            "espanol": "Tres",
            "tradicional": "三",
            "pinyin": "sān",
            "zhuyin": "ㄙㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "三 (sān - tres)"
                }
            ],
            "notas": "Representa la tríada tradicional china: Cielo (arriba), Hombre (centro) y Tierra (abajo).",
            "id": "id_mtfho0pr_vvcsx",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "三個家人 — Tres familiares",
                "三本書 — Tres libros"
            ]
        },
        {
            "espanol": "Cuatro",
            "tradicional": "四",
            "pinyin": "sì",
            "zhuyin": "ㄙˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "四 (sì - cuatro)"
                }
            ],
            "notas": "Aliento 八 que escapa dentro de un recinto cerrado 囗.",
            "id": "id_mtfhola6_hpc0l",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "我家有四個人 — En mi casa hay cuatro personas"
            ]
        },
        {
            "espanol": "Cinco",
            "tradicional": "五",
            "pinyin": "wǔ",
            "zhuyin": "ㄨˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtfhmm38_dxhfq"
                },
                {
                    "type": "text",
                    "value": "乂 (yì - cruce)"
                }
            ],
            "notas": "Las dos líneas 二 representan cielo y tierra, y 乂 el cruce armónico de los 5 elementos.",
            "id": "id_mtfhp4rg_j765n",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "五本書 — Cinco libros",
                "我有五個家人 — En mi familia somos cinco personas"
            ],
            "leccion": 2
        },
        {
            "espanol": "Seis",
            "tradicional": "六",
            "pinyin": "liù",
            "zhuyin": "ㄌㄧㄡˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "六 (liù - seis)"
                }
            ],
            "notas": "Número de gran fortuna en la cultura china porque suena parecido a 流 (liú = fluir suavemente).",
            "id": "id_mtfhppx6_xkjcv",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "六本書 — Seis libros",
                "六個人 — Seis personas"
            ]
        },
        {
            "espanol": "Siete",
            "tradicional": "七",
            "pinyin": "qī",
            "zhuyin": "ㄑㄧ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "七 (qī - siete)"
                }
            ],
            "notas": "Pictograma arcaico de un corte transversal con una espada.",
            "id": "id_mtfhql3k_jx2ub",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "七天 — Siete días",
                "七杯茶 — Siete tazas de té"
            ]
        },
        {
            "espanol": "Ocho",
            "tradicional": "八",
            "pinyin": "bā",
            "zhuyin": "ㄅㄚ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "八 (bā - ocho)"
                }
            ],
            "notas": "Dos trazos que se abren. Número de máxima prosperidad porque 八 (bā) suena similar a 發 (fā = prosperar).",
            "id": "id_mtfhr3n5_6xcbj",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "八張照片 — Ocho fotos",
                "八個人 — Ocho personas"
            ]
        },
        {
            "espanol": "Nueve",
            "tradicional": "九",
            "pinyin": "jiǔ",
            "zhuyin": "ㄐㄧㄡˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "九 (jiǔ - nueve)"
                }
            ],
            "notas": "Brazo doblado con fuerza. Asociado a la longevidad y al emperador porque suena igual que 久 (jiǔ = duradero).",
            "id": "id_mtfhrrgs_bcgj8",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "九本書 — Nueve libros",
                "九個月 — Nueve meses"
            ]
        },
        {
            "espanol": "Diez",
            "tradicional": "十",
            "pinyin": "shí",
            "zhuyin": "ㄕˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "十 (shí - diez)"
                }
            ],
            "notas": "Cruce perfecto de la línea horizontal y vertical simbolizando la plenitud y totalidad.",
            "id": "id_mtfikvkd_74gu4",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "十個人 — Diez personas",
                "十本書 — Diez libros"
            ]
        },
        {
            "espanol": "Cien",
            "tradicional": "百",
            "pinyin": "bǎi",
            "zhuyin": "ㄅㄞˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtfhl7d1_9g4op"
                },
                {
                    "type": "text",
                    "value": "白 (bái - blanco)"
                }
            ],
            "notas": "Compuesto por 一 (uno) y 白 (bái = hablar claro / blanco).",
            "id": "id_mtfimiho_d6pa7",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "一百 — Cien",
                "一百塊 — Cien dólares / monedas"
            ],
            "leccion": 4
        },
        {
            "espanol": "Mil",
            "tradicional": "千",
            "pinyin": "qiān",
            "zhuyin": "ㄑㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtfikvkd_74gu4"
                },
                {
                    "type": "text",
                    "value": "丿 (piě - trazo)"
                }
            ],
            "notas": "Compuesto por 十 (diez) con un trazo oblicuo superior 丿 que multiplica la cifra.",
            "id": "id_mtfiof0b_eq6u5",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "一千 — Mil",
                "兩千 — Dos mil"
            ],
            "leccion": 4
        },
        {
            "espanol": "Estudiante",
            "tradicional": "學生",
            "pinyin": "xuéshēng",
            "zhuyin": "ㄒㄩㄝˊ ㄕㄥ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "text",
                    "value": "學 (xué - estudiar)"
                },
                {
                    "type": "text",
                    "value": "生 (shēng - nacer)"
                }
            ],
            "notas": "Literalmente 'aprendiz que nace al conocimiento'. 學 (estudiar) + 生 (nacer).",
            "id": "id_mtjm882n_ocqu8",
            "fechaCreacion": "2026-09-02",
            "ejemplos": [
                "我們都是學生 — Todos nosotros somos estudiantes",
                "他是中文學生 — Él es estudiante de chino"
            ]
        },
        {
            "espanol": "Corazón",
            "tradicional": "心",
            "pinyin": "xīn",
            "zhuyin": "ㄒㄧㄣ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_ke",
            "radicales": [
                {
                    "type": "text",
                    "value": "心 (xīn - corazón)"
                }
            ],
            "notas": "Centro del pensamiento y las emociones. En la base aparece en 愛, 您, 想; a la izquierda como 忄.",
            "id": "id_mtlt07kj_ddod0",
            "fechaCreacion": "2026-09-03",
            "ejemplos": [
                "小心 — Cuidado (lit. \"pequeño corazón / corazón atento\")",
                "好心 — Buen corazón / bondadoso"
            ]
        },
        {
            "espanol": "Maestro",
            "tradicional": "老師",
            "pinyin": "lǎoshī",
            "zhuyin": "ㄌㄠˇ ㄕ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "text",
                    "value": "老 (lǎo - anciano)"
                },
                {
                    "type": "text",
                    "value": "師 (shī - maestro)"
                }
            ],
            "notas": "El sabio anciano que guía. En chino el título va siempre tras el apellido: 王老師 (Profesor Wang).",
            "id": "id_mto9fp6y_kejd4",
            "fechaCreacion": "2026-09-05",
            "ejemplos": [
                "老師好！ — ¡Buenos días, profesor!",
                "他是我們的老師 — Él es nuestro profesor"
            ],
            "leccion": 2
        },
        {
            "espanol": "Señorita",
            "tradicional": "小姐",
            "pinyin": "xiǎojiě",
            "zhuyin": "ㄒㄧㄠˇ ㄐㄧㄝˇ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjn1fxk_bdhc0"
                },
                {
                    "type": "ref",
                    "id": "id_msik8oqu_qbhis"
                }
            ],
            "notas": "Trato formal respetuoso para mujeres jóvenes en Taiwán. Se pospone al apellido: 陳小姐.",
            "id": "id_mtvfka7n_09ee8",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "陳月美小姐是越南人 — La señorita Chen Yuemei es de Vietnam",
                "小姐，請喝茶 — Señorita, tome té por favor"
            ],
            "leccion": 1
        },
        {
            "espanol": "Señor",
            "tradicional": "先生",
            "pinyin": "xiānsheng",
            "zhuyin": "ㄒㄧㄢ ㄕㄥ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "先 (xiān - primero)"
                },
                {
                    "type": "text",
                    "value": "生 (shēng - nacer)"
                }
            ],
            "notas": "Literalmente 'nacido antes', simbolizando respeto. Se pospone al apellido: 王先生. Coloquial: esposo.",
            "id": "id_mtvg65wr_t275m",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "李明華先生是臺灣人 — El señor Li Minghua es taiwanés",
                "先生，請進 — Señor, adelante por favor"
            ],
            "leccion": 1
        },
        {
            "espanol": "Apellido",
            "tradicional": "姓",
            "pinyin": "xìng",
            "zhuyin": "ㄒㄧㄥˋ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                }
            ],
            "notas": "Funciona como verbo ('apellidarse'): 我姓李 (Mi apellido es Li). Pregunta de cortesía: 您貴姓？",
            "id": "id_mtvgdcy9_754wt",
            "fechaCreacion": "2026-09-10",
            "leccion": 1
        },
        {
            "espanol": "Plataforma",
            "tradicional": "臺 / 台",
            "pinyin": "tái",
            "zhuyin": "ㄊㄞˊ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "至 (zhì - llegar)"
                },
                {
                    "type": "text",
                    "value": "士 (shì - erudito)"
                },
                {
                    "type": "text",
                    "value": "冖 (mì - cubierta)"
                },
                {
                    "type": "text",
                    "value": "口 (kǒu - boca)"
                }
            ],
            "notas": "Plataforma o pedestal elevado. Carácter histórico de 臺灣, 台北, 台中. En uso diario se escribe 台.",
            "id": "id_mtvgjyyx_mz8uu",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "臺北 — Taipéi",
                "在臺南 — En Tainan"
            ],
            "leccion": 1
        },
        {
            "espanol": "Bahía",
            "tradicional": "灣",
            "pinyin": "wān",
            "zhuyin": "ㄨㄢ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_agua_1786603351443"
                },
                {
                    "type": "text",
                    "value": "彎 (wān - curva)"
                }
            ],
            "notas": "Bahía donde el agua 氵 se curva (彎).",
            "id": "id_mtvgqtnc_k29b9",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "臺灣 — Taiwán",
                "海灣 — Bahía marítima"
            ]
        },
        {
            "espanol": "Té",
            "tradicional": "茶",
            "pinyin": "chá",
            "zhuyin": "ㄔㄚˊ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_bei",
            "radicales": [
                {
                    "type": "text",
                    "value": "艹 (cǎo - hierba)"
                },
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "木 (mù - árbol)"
                }
            ],
            "notas": "Hierba 艹 arriba, hombre 人 en el centro y madera 木 en la base: el ser humano en armonía con la naturaleza.",
            "id": "id_mtvh97ru_97ysy",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "請喝茶 — Por favor toma té",
                "臺灣茶很好喝 — El té de Taiwán es muy sabroso"
            ],
            "leccion": 1
        },
        {
            "id": "id_mty013_wulongcha",
            "espanol": "Té Oolong",
            "tradicional": "烏龍茶",
            "pinyin": "wūlóngchá",
            "zhuyin": "ㄨ ㄌㄨㄥˊ ㄔㄚˊ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_bei",
            "radicales": [
                {
                    "type": "text",
                    "value": "烏 (wū - cuervo)"
                },
                {
                    "type": "text",
                    "value": "龍 (lóng - dragón)"
                },
                {
                    "type": "ref",
                    "id": "id_mtvh97ru_97ysy"
                }
            ],
            "notas": "Literalmente 'Té del dragón negro'. Té semifermentado emblemático de las montañas de Taiwán.",
            "ejemplos": [
                "烏龍茶很好喝 — El té Oolong es muy rico",
                "你要喝烏龍茶嗎？ — ¿Quieres tomar té Oolong?"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty015_chenyuemei",
            "espanol": "Chen Yuemei (persona: mujer de Vietnam)",
            "tradicional": "陳月美",
            "pinyin": "Chén Yuèměi",
            "zhuyin": "ㄔㄣˊ ㄩㄝˋ ㄇㄟˇ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "text",
                    "value": "陳 (Chén - apellido)"
                },
                {
                    "type": "text",
                    "value": "月 (yuè - luna/mes)"
                },
                {
                    "type": "text",
                    "value": "美 (měi - bello)"
                }
            ],
            "notas": "Personaje del libro de texto MTC, estudiante originaria de Vietnam.",
            "ejemplos": [
                "她是陳月美 — Ella es Chen Yuemei"
            ],
            "fechaCreacion": "2026-09-26"
        },
        {
            "id": "id_mty016_liminghua",
            "espanol": "Li Minghua (persona: hombre de Taiwán)",
            "tradicional": "李明華",
            "pinyin": "Lǐ Mínghuá",
            "zhuyin": "ㄌㄧˇ ㄇㄧㄥˊ ㄏㄨㄚˊ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "text",
                    "value": "李 (lǐ - ciruela)"
                },
                {
                    "type": "text",
                    "value": "明 (míng - brillante)"
                },
                {
                    "type": "text",
                    "value": "華 (huá - floreciente)"
                }
            ],
            "notas": "Personaje del libro de texto MTC, estudiante taiwanés.",
            "ejemplos": [
                "李明華是臺灣人 — Li Minghua es taiwanés"
            ],
            "fechaCreacion": "2026-09-26"
        },
        {
            "id": "id_mty017_wangkaiwen",
            "espanol": "Wang Kaiwen (persona: hombre de EE.UU.)",
            "tradicional": "王開文",
            "pinyin": "Wáng Kāiwén",
            "zhuyin": "ㄨㄤˊ ㄎㄞ ㄨㄣˊ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "text",
                    "value": "王 (wáng - rey)"
                },
                {
                    "type": "text",
                    "value": "開 (kāi - abrir)"
                },
                {
                    "type": "text",
                    "value": "文 (wén - texto)"
                }
            ],
            "notas": "Personaje del libro de texto MTC, estudiante originario de Estados Unidos.",
            "ejemplos": [
                "王開文是美國人 — Wang Kaiwen es estadounidense"
            ],
            "fechaCreacion": "2026-09-26"
        },
        {
            "id": "id_mty005_women",
            "espanol": "Nosotros / Nosotras",
            "tradicional": "我們",
            "pinyin": "wǒmen",
            "zhuyin": "ㄨㄛˇ ㄇㄣ˙",
            "categoria": "pronombre",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "p1"
                },
                {
                    "type": "ref",
                    "id": "pt1"
                }
            ],
            "notas": "Pronombre de 1ª persona plural: 我 (yo) + 們 (sufijo plural).",
            "ejemplos": [
                "我們都是學生 — Todos nosotros somos estudiantes",
                "我們都喝茶 — Todos nosotros tomamos té"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty006_nimen",
            "espanol": "Ustedes / Vosotros",
            "tradicional": "你們",
            "pinyin": "nǐmen",
            "zhuyin": "ㄋㄧˇ ㄇㄣ˙",
            "categoria": "pronombre",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "p2"
                },
                {
                    "type": "ref",
                    "id": "pt1"
                }
            ],
            "notas": "Pronombre de 2ª persona plural: 你 (tú) + 們 (sufijo plural).",
            "ejemplos": [
                "你們好 — Hola a todos / Hola a ustedes",
                "你們要喝咖啡嗎？ — ¿Quieren tomar café?"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty007_taiwan",
            "espanol": "Taiwán",
            "tradicional": "臺灣",
            "pinyin": "Táiwān",
            "zhuyin": "ㄊㄞˊ ㄨㄢ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtvgjyyx_mz8uu"
                },
                {
                    "type": "ref",
                    "id": "id_mtvgqtnc_k29b9"
                }
            ],
            "notas": "Nombre oficial de la isla. También se escribe comúnmente 台灣.",
            "ejemplos": [
                "歡迎你來臺灣！ — ¡Bienvenido a Taiwán!",
                "我是臺灣人 — Soy taiwanés/a"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty011_riben",
            "espanol": "Japón",
            "tradicional": "日本",
            "pinyin": "Rìběn",
            "zhuyin": "ㄖˋ ㄅㄣˇ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "日 (rì - sol)"
                },
                {
                    "type": "text",
                    "value": "本 (běn - raíz)"
                }
            ],
            "notas": "Literalmente 'el origen del sol' (日 sol + 本 raíz), de donde proviene la expresión 'país del sol naciente'.",
            "ejemplos": [
                "他是日本人 — Él es japonés",
                "我不是日本人 — Yo no soy japonés"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty018_zhangyijun",
            "espanol": "Zhang Yijun (persona: mujer de Taiwán)",
            "tradicional": "張怡君",
            "pinyin": "Zhāng Yíjūn",
            "zhuyin": "ㄓㄤ ㄧˊ ㄐㄩㄣ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "text",
                    "value": "張 (zhāng - arco)"
                },
                {
                    "type": "ref",
                    "id": "id_mtlt07kj_ddod0"
                },
                {
                    "type": "ref",
                    "id": "id_mtvgjyyx_mz8uu"
                },
                {
                    "type": "text",
                    "value": "君 (jūn - señor)"
                }
            ],
            "notas": "Personaje del libro de texto MTC. 怡 contiene corazón 忄 y significa alegría serena.",
            "ejemplos": [
                "張怡君是臺灣人 — Zhang Yijun es de Taiwán",
                "張怡君請馬安同喝茶 — Zhang Yijun invita a Ma Antong a tomar té"
            ],
            "fechaCreacion": "2026-09-26"
        },
        {
            "id": "id_mty019_maantong",
            "espanol": "Ma Antong (persona: hombre de Honduras)",
            "tradicional": "馬安同",
            "pinyin": "Mǎ Āntóng",
            "zhuyin": "ㄇㄚˇ ㄢ ㄊㄨㄥˊ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "text",
                    "value": "馬 (mǎ - caballo)"
                },
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                },
                {
                    "type": "text",
                    "value": "同 (tóng - mismo)"
                }
            ],
            "notas": "Personaje del libro MTC, estudiante de Honduras. 安 es una mujer 女 bajo un techo 宀 (paz en el hogar).",
            "ejemplos": [
                "馬安同是宏都拉斯人 — Ma Antong es hondureño",
                "馬安同來臺灣學中文 — Ma Antong viene a Taiwán a estudiar chino"
            ],
            "fechaCreacion": "2026-09-26"
        },
        {
            "id": "id_mty003_jia",
            "espanol": "Casa / Hogar / Familia",
            "tradicional": "家",
            "pinyin": "jiā",
            "zhuyin": "ㄐㄧㄚ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "宀 (mián - techo)"
                },
                {
                    "type": "text",
                    "value": "豕 (shǐ - cerdo)"
                }
            ],
            "notas": "Un cerdo 豕 bajo un techo 宀: símbolo tradicional de prosperidad, sustento y hogar en la China arcaica.",
            "ejemplos": [
                "這是我家 — Esta es mi casa",
                "我家在臺灣 — Mi hogar está en Taiwán"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty020_jiaren",
            "espanol": "Familia / Miembros de la familia",
            "tradicional": "家人",
            "pinyin": "jiārén",
            "zhuyin": "ㄐㄧㄚ ㄖㄣˊ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mty003_jia"
                },
                {
                    "type": "ref",
                    "id": "n7"
                }
            ],
            "notas": "Literalmente 'personas de la casa'. Se refiere a los miembros del núcleo familiar cercano.",
            "ejemplos": [
                "這是我的家人 — Esta es mi familia",
                "你有幾個家人？ — ¿Cuántos miembros son en tu familia?"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty024_zhaopian",
            "espanol": "Foto / Fotografía",
            "tradicional": "照片",
            "pinyin": "zhàopiàn",
            "zhuyin": "ㄓㄠˋ ㄆㄧㄢˋ",
            "categoria": "sustantivo",
            "clasificador": "id_mty004_zhang",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_msk0536g_z9es3"
                },
                {
                    "type": "text",
                    "value": "照 (zhào - iluminar)"
                },
                {
                    "type": "text",
                    "value": "片 (piàn - lámina)"
                }
            ],
            "notas": "照 lleva fuego 灬 (luz) y 片 es una rebanada o lámina delgada. Clasificador: 張 (zhāng).",
            "ejemplos": [
                "這是一張照片 — Esta es una foto",
                "你的照片很漂亮 — Tu foto es muy linda"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty028_tianzhong",
            "espanol": "Tanaka Seiichi (persona: hombre de Japón)",
            "tradicional": "田中誠一",
            "pinyin": "Tiánzhōng Chéngyī",
            "zhuyin": "ㄊㄧㄢˊ ㄓㄨㄥ ㄔㄥˊ ㄧ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "text",
                    "value": "田 (tián - campo)"
                },
                {
                    "type": "ref",
                    "id": "id_mtjn2p70_9qg74"
                },
                {
                    "type": "text",
                    "value": "誠 (chéng - sincero)"
                },
                {
                    "type": "ref",
                    "id": "id_mtfhl7d1_9g4op"
                }
            ],
            "notas": "Personaje del libro de texto MTC, estudiante japonés.",
            "ejemplos": [
                "田中誠一是日本人 — Tanaka Seiichi es japonés"
            ],
            "fechaCreacion": "2026-09-26"
        },
        {
            "id": "id_mty029_bomu",
            "espanol": "Tía / Señora (madre de un amigo/a)",
            "tradicional": "伯母",
            "pinyin": "bómǔ",
            "zhuyin": "ㄅㄛˊ ㄇㄨˇ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_wei",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "白 (bái - blanco)"
                },
                {
                    "type": "text",
                    "value": "母 (mǔ - madre)"
                }
            ],
            "notas": "Tratamiento respetuoso y afectuoso para la madre de un amigo, sin importar la edad.",
            "ejemplos": [
                "伯母好！ — ¡Buenos días, señora!",
                "她是王開文的伯母 — Ella es la tía/madre de amigo de Wang Kaiwen"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty030_nin",
            "espanol": "Usted (pronombre honorífico)",
            "tradicional": "您",
            "pinyin": "nín",
            "zhuyin": "ㄋㄧㄣˊ",
            "categoria": "pronombre",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "p2"
                },
                {
                    "type": "ref",
                    "id": "id_mtlt07kj_ddod0"
                }
            ],
            "notas": "Representa tener a la persona 你 en el corazón 心. Registro de cortesía con mayores o figuras de respeto.",
            "ejemplos": [
                "您好！ — ¡Hola! (formal / con respeto)",
                "伯母，您好嗎？ — Señora, ¿cómo está usted?"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty002_shu",
            "espanol": "Libro",
            "tradicional": "書",
            "pinyin": "shū",
            "zhuyin": "ㄕㄨ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_ben",
            "radicales": [
                {
                    "type": "text",
                    "value": "聿 (yù - pincel)"
                },
                {
                    "type": "text",
                    "value": "日 (rì - sol)"
                },
                {
                    "type": "ref",
                    "id": "id_mtfhl7d1_9g4op"
                }
            ],
            "notas": "Una mano sosteniendo un pincel 聿 sobre un soporte de papel 日. Clasificador: 本 (běn).",
            "ejemplos": [
                "這是一本書 — Este es un libro",
                "我有很多中文書 — Tengo muchos libros en chino"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty033_xiongdi",
            "espanol": "Hermanos (varones)",
            "tradicional": "兄弟",
            "pinyin": "xiōngdì",
            "zhuyin": "ㄒㄩㄥ ㄉㄧˋ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "兄 (xiōng - hermano mayor)"
                },
                {
                    "type": "ref",
                    "id": "id_msik5odg_jbtys"
                }
            ],
            "notas": "Término colectivo para hermanos varones (hermano mayor y menor).",
            "ejemplos": [
                "你有幾個兄弟？ — ¿Cuántos hermanos varones tienes?",
                "我有兩個兄弟 — Tengo dos hermanos varones"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty034_jiemei",
            "espanol": "Hermanas (mujeres)",
            "tradicional": "姐妹",
            "pinyin": "jiěmèi",
            "zhuyin": "ㄐㄧㄝˇ ㄇㄟˋ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_msik8oqu_qbhis"
                },
                {
                    "type": "ref",
                    "id": "id_msikblio_cwfgf"
                }
            ],
            "notas": "Término colectivo para hermanas mujeres (hermana mayor y menor).",
            "ejemplos": [
                "你有幾個姐妹？ — ¿Cuántas hermanas tienes?",
                "我沒有姐妹 — No tengo hermanas"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty035_fangzi",
            "espanol": "Casa / Edificio / Vivienda",
            "tradicional": "房子",
            "pinyin": "fángzi",
            "zhuyin": "ㄈㄤˊ ㄗ˙",
            "categoria": "sustantivo",
            "clasificador": "id_clf_dong",
            "radicales": [
                {
                    "type": "text",
                    "value": "房 (fáng - casa)"
                },
                {
                    "type": "text",
                    "value": "子 (zǐ - hijo)"
                }
            ],
            "notas": "Se refiere a la edificación física de una vivienda. Clasificador arquitectónico: 棟 (dòng).",
            "ejemplos": [
                "這棟房子很漂亮 — Esta casa es muy bonita",
                "那是他的房子 — Esa es su casa"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_voc_shijian",
            "espanol": "Tiempo / Hora",
            "tradicional": "時間",
            "pinyin": "shíjiān",
            "zhuyin": "ㄕˊ ㄐㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "日 (rì - sol)"
                },
                {
                    "type": "text",
                    "value": "寸 (cùn - pulgada)"
                },
                {
                    "type": "text",
                    "value": "門 (mén - puerta)"
                },
                {
                    "type": "text",
                    "value": "日 (rì - sol)"
                }
            ],
            "notas": "Concepto abstracto de tiempo disponible o duración (有時間). No confundir con 點 (hora de reloj).",
            "ejemplos": [
                "你明天有時間嗎？ — ¿Tienes tiempo mañana?",
                "時間過得真快 — El tiempo pasa verdaderamente rápido"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_jiaoshi",
            "espanol": "Salón de clases / Aula",
            "tradicional": "教室",
            "pinyin": "jiàoshì",
            "zhuyin": "ㄐㄧㄠˋ ㄕˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_jian",
            "radicales": [
                {
                    "type": "text",
                    "value": "教 (jiào - enseñar)"
                },
                {
                    "type": "text",
                    "value": "室 (shì - sala)"
                }
            ],
            "notas": "Espacio 至 bajo techo 宀 donde se imparte la enseñanza 教. Clasificador: 間 (jiān).",
            "ejemplos": [
                "教室在哪裡？ — ¿Dónde está el salón de clases?",
                "學生們都在教室裡 — Los estudiantes están todos dentro del salón de clases"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_wenti",
            "espanol": "Pregunta / Problema",
            "tradicional": "問題",
            "pinyin": "wèntí",
            "zhuyin": "ㄨㄣˋ ㄊㄧˊ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "問 (wèn - preguntar)"
                },
                {
                    "type": "text",
                    "value": "題 (tí - tema)"
                }
            ],
            "notas": "Una boca en la puerta 問 que plantea dudas o problemas 題 (沒問題 = no hay problema).",
            "ejemplos": [
                "老師，我要問問題 — Profesor, quiero hacer una pregunta",
                "這不是問題 — Esto no es un problema / No hay problema"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_ke",
            "espanol": "Clase / Lección / Asignatura",
            "tradicional": "課",
            "pinyin": "kè",
            "zhuyin": "ㄎㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_men",
            "radicales": [
                {
                    "type": "text",
                    "value": "言 (yán - palabra)"
                },
                {
                    "type": "text",
                    "value": "果 (guǒ - fruta)"
                }
            ],
            "notas": "Palabras 言 que dan fruto 果. Rige 上課 (entrar a clase) y 下課 (salir de clase). Clasificador: 門 (mén).",
            "ejemplos": [
                "你今天有幾門課？ — ¿Cuántas asignaturas tienes hoy?",
                "我們去上課吧 — Vamos a clase"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xuanxiuke",
            "espanol": "Clases electivas / Asignatura optativa",
            "tradicional": "選修課",
            "pinyin": "xuǎnxiūkè",
            "zhuyin": "ㄒㄩㄢˇ ㄒㄧㄡ ㄎㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_men",
            "radicales": [
                {
                    "type": "text",
                    "value": "選 (xuǎn - elegir)"
                },
                {
                    "type": "text",
                    "value": "修 (xiū - cursar)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Materia académica optativa que el alumno elige libremente. Antónimo: 必修課 (obligatoria).",
            "ejemplos": [
                "這門選修課很有意思 — Esta materia optativa es sumamente interesante",
                "你選修了什麼課？ — ¿Qué materias optativas elegiste?"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_yufake",
            "espanol": "Clase de gramática",
            "tradicional": "語法課",
            "pinyin": "yǔfǎkè",
            "zhuyin": "ㄩˇ ㄈㄚˇ ㄎㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_men",
            "radicales": [
                {
                    "type": "text",
                    "value": "語 (yǔ - lengua)"
                },
                {
                    "type": "text",
                    "value": "法 (fǎ - ley/método)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Clase dedicada a los patrones y estructuras de la lengua 語 y sus normas 法.",
            "ejemplos": [
                "明天上午我們有語法課 — Mañana por la mañana tenemos clase de gramática",
                "語法課的作業很多 — Hay mucha tarea en la clase de gramática"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_fayinke",
            "espanol": "Clase de pronunciación",
            "tradicional": "發音課",
            "pinyin": "fāyīnkè",
            "zhuyin": "ㄈㄚ ㄧㄣ ㄎㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_men",
            "radicales": [
                {
                    "type": "text",
                    "value": "發 (fā - emitir)"
                },
                {
                    "type": "text",
                    "value": "音 (yīn - sonido)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Clase enfocada en la emisión correcta de sonidos 音 y tonos del mandarín.",
            "ejemplos": [
                "發音課對外國學生很有幫助 — La clase de pronunciación ayuda mucho a los alumnos extranjeros",
                "今天發音課練習漢語拼音 — Hoy en la clase de pronunciación practicamos Hanyu Pinyin"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_hanzike",
            "espanol": "Clase de caracteres chinos",
            "tradicional": "漢字課",
            "pinyin": "hànzìkè",
            "zhuyin": "ㄏㄢˋ ㄗˋ ㄎㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_men",
            "radicales": [
                {
                    "type": "text",
                    "value": "漢 (hàn - chino)"
                },
                {
                    "type": "text",
                    "value": "字 (zì - carácter)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Clase centrada en los caracteres chinos tradicionales 漢字, sus trazos y radicales.",
            "ejemplos": [
                "漢字課很有挑戰性 — La clase de caracteres chinos es muy desafiante",
                "我在漢字課學了五十個字 — En la clase de caracteres aprendí cincuenta caracteres"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_huihuake",
            "espanol": "Clase de conversación",
            "tradicional": "會話課",
            "pinyin": "huìhuàkè",
            "zhuyin": "ㄏㄨㄟˋ ㄏㄨㄚˋ ㄎㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_men",
            "radicales": [
                {
                    "type": "text",
                    "value": "會 (huì - reunirse)"
                },
                {
                    "type": "text",
                    "value": "話 (huà - palabras)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Clase de práctica oral y conversación cotidiana en chino.",
            "ejemplos": [
                "我們在會話課都說中文 — En la clase de conversación todos hablamos en chino",
                "會話課老師很幽默 — El profesor de la clase de conversación es muy gracioso"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_shufake",
            "espanol": "Clase de caligrafía china",
            "tradicional": "書法課",
            "pinyin": "shūfǎkè",
            "zhuyin": "ㄕㄨ ㄈㄚˇ ㄎㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_men",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mty002_shu"
                },
                {
                    "type": "text",
                    "value": "法 (fǎ - arte/método)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Arte tradicional de la caligrafía con pincel 毛筆 y tinta sobre papel de arroz.",
            "ejemplos": [
                "我下午上書法課 — En la tarde tomo la clase de caligrafía",
                "書法課要買毛筆和墨汁 — Para la clase de caligrafía hay que comprar pincel y tinta"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_guohuake",
            "espanol": "Clase de pintura tradicional china",
            "tradicional": "國畫課",
            "pinyin": "guóhuàkè",
            "zhuyin": "ㄍㄨㄛˊ ㄏㄨㄚˋ ㄎㄜˋ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_men",
            "radicales": [
                {
                    "type": "text",
                    "value": "國 (guó - país)"
                },
                {
                    "type": "text",
                    "value": "畫 (huà - pintura)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Pintura tradicional china (lit. 'pintura nacional') con tinta y pigmentos minerales.",
            "ejemplos": [
                "他很喜歡上國畫課 — A él le gusta mucho tomar clases de pintura tradicional china",
                "國畫課的作品非常美麗 — Las obras de la clase de pintura tradicional china son bellísimas"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_wushu",
            "espanol": "Artes marciales / Kung fu",
            "tradicional": "武術",
            "pinyin": "wǔshù",
            "zhuyin": "ㄨˇ ㄕㄨˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "武 (wǔ - marcial)"
                },
                {
                    "type": "text",
                    "value": "術 (shù - arte/técnica)"
                }
            ],
            "notas": "Etimología mnemotécnica de 武: detener 止 la lanza 戈 para preservar la paz.",
            "ejemplos": [
                "他在臺灣學中國武術 — Él aprende artes marciales chinas en Taiwán",
                "武術對身體很好 — Las artes marciales son muy buenas para el cuerpo"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_hua",
            "espanol": "Flor",
            "tradicional": "花",
            "pinyin": "huā",
            "zhuyin": "ㄏㄨㄚ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_duo",
            "radicales": [
                {
                    "type": "text",
                    "value": "艹 (cǎo - hierba)"
                },
                {
                    "type": "text",
                    "value": "化 (huà - transformar)"
                }
            ],
            "notas": "Hierba 艹 que se transforma 化 en flor abierta. Clasificador botánico: 朵 (duǒ).",
            "ejemplos": [
                "公園裡有很多漂亮的花 — En el parque hay muchas flores hermosas",
                "這朵花真香 — Esta flor tiene un aroma verdaderamente agradable"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_banye",
            "espanol": "Madrugada (medianoche profunda)",
            "tradicional": "半夜",
            "pinyin": "bànyè",
            "zhuyin": "ㄅㄢˋ ㄧㄝˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "半 (bàn - mitad)"
                },
                {
                    "type": "text",
                    "value": "夜 (yè - noche)"
                }
            ],
            "notas": "Período más profundo de la noche (aprox. 00:00 a 04:00).",
            "ejemplos": [
                "半夜十二點 — Las doce de la noche (medianoche)",
                "他常常半夜看書 — A menudo él lee libros en plena madrugada"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_zaoshang",
            "espanol": "Mañana (temprano)",
            "tradicional": "早上",
            "pinyin": "zǎoshàng",
            "zhuyin": "ㄗㄠˇ ㄕㄤˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "早 (zǎo - temprano)"
                },
                {
                    "type": "text",
                    "value": "上 (shàng - arriba)"
                }
            ],
            "notas": "El sol 日 que asoma temprano sobre la línea del horizonte. Saludo: 早上好 (¡buenos días!).",
            "ejemplos": [
                "我早上七點吃早飯 — Desayuno a las siete de la mañana",
                "早上空氣真好 — El aire de la mañana temprano es verdaderamente agradable"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 3
        },
        {
            "id": "id_voc_shangwu",
            "espanol": "Mañana (media mañana, antes de las 12:00)",
            "tradicional": "上午",
            "pinyin": "shàngwǔ",
            "zhuyin": "ㄕㄤˋ ㄨˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "上 (shàng - arriba)"
                },
                {
                    "type": "text",
                    "value": "午 (wǔ - mediodía)"
                }
            ],
            "notas": "Intervalo previo al mediodía (aprox. 09:00 a 12:00, equivalente al A.M.).",
            "ejemplos": [
                "我們上午十點有漢字課 — A las diez de la mañana tenemos clase de caracteres chinos",
                "今天上午我不去學校 — Esta mañana no voy a la escuela"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_zhongwu",
            "espanol": "Mediodía (12:00 a 13:00)",
            "tradicional": "中午",
            "pinyin": "zhōngwǔ",
            "zhuyin": "ㄓㄨㄥ ㄨˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjn2p70_9qg74"
                },
                {
                    "type": "text",
                    "value": "午 (wǔ - mediodía)"
                }
            ],
            "notas": "Punto medio exacto del día (alrededor de las 12:00), hora tradicional del almuerzo.",
            "ejemplos": [
                "中午十二點我們一起吃午飯 — A las doce del mediodía almorzamos juntos",
                "中午請在教室休息 — Al mediodía por favor descansa en el aula"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xiawu",
            "espanol": "Tarde (después de las 12:00 hasta el atardecer)",
            "tradicional": "下午",
            "pinyin": "xiàwǔ",
            "zhuyin": "ㄒㄧㄚˋ ㄨˇ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "下 (xià - abajo)"
                },
                {
                    "type": "text",
                    "value": "午 (wǔ - mediodía)"
                }
            ],
            "notas": "Intervalo posterior al mediodía hasta la puesta de sol (equivalente al P.M.). Saludo: 下午好.",
            "ejemplos": [
                "下午兩點在教室上課 — A las dos de la tarde tenemos clase en el aula",
                "你今天下午有時間嗎？ — ¿Tienes tiempo esta tarde?"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_wanshang",
            "espanol": "Noche",
            "tradicional": "晚上",
            "pinyin": "wǎnshàng",
            "zhuyin": "ㄨㄢˇ ㄕㄤˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "晚 (wǎn - noche)"
                },
                {
                    "type": "text",
                    "value": "上 (shàng - arriba)"
                }
            ],
            "notas": "Período nocturno a partir del anochecer. Saludo: 晚上好 (¡buenas noches!).",
            "ejemplos": [
                "今天晚上我們去吃中國菜 — Esta noche vamos a comer comida china",
                "晚上請早點休息 — Por favor descansa temprano en la noche"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 3
        },
        {
            "id": "id_voc_nian",
            "espanol": "Año",
            "tradicional": "年",
            "pinyin": "nián",
            "zhuyin": "ㄋㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "年 (nián - año)"
                }
            ],
            "notas": "Pictograma arcaico de una persona cargando una espiga de cereal cosechada tras un ciclo anual.",
            "ejemplos": [
                "一年有十二個月 — Un año tiene doce meses",
                "今年是2026年 — Este año es el 2026"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_daqiannian",
            "espanol": "Año anteantepasado (hace 3 años)",
            "tradicional": "大前年",
            "pinyin": "dàqiánnián",
            "zhuyin": "ㄉㄚˋ ㄑㄧㄢˊ ㄋㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjn41m4_7ohc2"
                },
                {
                    "type": "text",
                    "value": "前 (qián - anterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_nian"
                }
            ],
            "notas": "Tres años antes del año en curso.",
            "ejemplos": [
                "大前年我來臺灣學中文 — Hace tres años vine a Taiwán a estudiar chino",
                "大前年他還沒上大學 — Hace tres años él todavía no entraba a la universidad"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_qiannian",
            "espanol": "Año antepasado (hace 2 años)",
            "tradicional": "前年",
            "pinyin": "qiánnián",
            "zhuyin": "ㄑㄧㄢˊ ㄋㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "前 (qián - anterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_nian"
                }
            ],
            "notas": "Dos años antes del año en curso.",
            "ejemplos": [
                "前年買的書 — Libro comprado el año antepasado",
                "前年我們全家去旅行 — El año antepasado toda nuestra familia fue de viaje"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_qunian",
            "espanol": "Año pasado",
            "tradicional": "去年",
            "pinyin": "qùnián",
            "zhuyin": "ㄑㄩˋ ㄋㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "去 (qù - ir)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_nian"
                }
            ],
            "notas": "Literalmente 'el año ido/partido': el año inmediatamente anterior al actual.",
            "ejemplos": [
                "我去年開始學書法 — El año pasado comencé a estudiar caligrafía",
                "去年九月我們見過面 — En septiembre del año pasado nos vimos"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_jinnian",
            "espanol": "Este año",
            "tradicional": "今年",
            "pinyin": "jīnnián",
            "zhuyin": "ㄐㄧㄣ ㄋㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "今 (jīn - presente)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_nian"
                }
            ],
            "notas": "El año en curso actual.",
            "ejemplos": [
                "今年你幾歲？ — ¿Cuántos años cumples/tienes este año?",
                "今年我選了四門課 — Este año tomé cuatro asignaturas"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_mingnian",
            "espanol": "El próximo año",
            "tradicional": "明年",
            "pinyin": "míngnián",
            "zhuyin": "ㄇㄧㄥˊ ㄋㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "明 (míng - brillante)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_nian"
                }
            ],
            "notas": "Literalmente 'el año brillante/venidero': el próximo año.",
            "ejemplos": [
                "明年我想去臺灣旅行 — El próximo año quiero viajar a Taiwán",
                "明年我們再見 — Nos vemos el próximo año"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_hounian",
            "espanol": "El año subsiguiente (en 2 años)",
            "tradicional": "後年",
            "pinyin": "hòunián",
            "zhuyin": "ㄏㄡˋ ㄋㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "後 (hòu - después)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_nian"
                }
            ],
            "notas": "Dos años después del año actual.",
            "ejemplos": [
                "後年他要大學畢業 — En dos años él se graduará de la universidad",
                "後年見！ — ¡Nos vemos en dos años!"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_dahounian",
            "espanol": "En 3 años (año posterior al subsiguiente)",
            "tradicional": "大後年",
            "pinyin": "dàhòunián",
            "zhuyin": "ㄉㄚˋ ㄏㄡˋ ㄋㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjn41m4_7ohc2"
                },
                {
                    "type": "text",
                    "value": "後 (hòu - posterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_nian"
                }
            ],
            "notas": "Tres años después del año actual.",
            "ejemplos": [
                "大後年我們學校有一百週年校慶 — En tres años nuestra escuela celebra su centenario",
                "這棟樓大後年完工 — Este edificio se terminará en tres años"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_yue",
            "espanol": "Mes / Luna",
            "tradicional": "月",
            "pinyin": "yuè",
            "zhuyin": "ㄩㄝˋ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "月 (yuè - luna/mes)"
                }
            ],
            "notas": "Mes del calendario. Para períodos requiere clasificador: 三個月 (tres meses); para nombres: 三月 (marzo).",
            "ejemplos": [
                "一年有十二個月 — Un año tiene doce meses",
                "九月開學 — Las clases inician en septiembre"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_shangshanggeyue",
            "espanol": "El mes antepasado",
            "tradicional": "上上個月",
            "pinyin": "shàng shàng ge yuè",
            "zhuyin": "ㄕㄤˋ ㄕㄤˋ ˙ㄍㄜ ㄩㄝˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "上 (shàng - anterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_yue"
                }
            ],
            "notas": "Dos meses antes del mes actual.",
            "ejemplos": [
                "這本書是我上上個月買的 — Este libro lo compré el mes antepasado",
                "上上個月天氣非常熱 — El mes antepasado el clima estuvo sumamente caluroso"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_shanggeyue",
            "espanol": "El mes pasado",
            "tradicional": "上個月",
            "pinyin": "shàng ge yuè",
            "zhuyin": "ㄕㄤˋ ˙ㄍㄜ ㄩㄝˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "上 (shàng - anterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_yue"
                }
            ],
            "notas": "El mes inmediatamente anterior al actual.",
            "ejemplos": [
                "上個月我看了三本書 — El mes pasado leí tres libros",
                "上個月的考試很難 — El examen del mes pasado fue muy difícil"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_zhegeyue",
            "espanol": "Este mes",
            "tradicional": "這個月",
            "pinyin": "zhè ge yuè",
            "zhuyin": "ㄓㄜˋ ˙ㄍㄜ ㄩㄝˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_msk0jitk_kr6cx"
                },
                {
                    "type": "ref",
                    "id": "id_voc_yue"
                }
            ],
            "notas": "El mes en curso.",
            "ejemplos": [
                "這個月有選修課 — Este mes hay materias optativas",
                "這個月我很忙 — Este mes estoy muy ocupado"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xiageyue",
            "espanol": "El próximo mes",
            "tradicional": "下個月",
            "pinyin": "xià ge yuè",
            "zhuyin": "ㄒㄧㄚˋ ˙ㄍㄜ ㄩㄝˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "下 (xià - posterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_yue"
                }
            ],
            "notas": "El mes inmediatamente posterior al actual.",
            "ejemplos": [
                "下個月我們要去臺灣 — El próximo mes iremos a Taiwán",
                "下個月有書法課 — El próximo mes hay clase de caligrafía"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xiaxiageyue",
            "espanol": "El mes subsiguiente (en 2 meses)",
            "tradicional": "下下個月",
            "pinyin": "xià xià ge yuè",
            "zhuyin": "ㄒㄧㄚˋ ㄒㄧㄚˋ ˙ㄍㄜ ㄩㄝˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "下 (xià - posterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_yue"
                }
            ],
            "notas": "Dos meses después del mes actual.",
            "ejemplos": [
                "下下個月就要放假了 — En dos meses ya comienzan las vacaciones",
                "這門課下下個月才開始 — Esta asignatura recién comienza en dos meses"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xingqi",
            "espanol": "Semana",
            "tradicional": "星期",
            "pinyin": "xīngqī",
            "zhuyin": "ㄒㄧㄥ ㄑㄧ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "星 (xīng - estrella)"
                },
                {
                    "type": "text",
                    "value": "期 (qī - período)"
                }
            ],
            "notas": "Período de siete días gobernado por las fases estelares y lunares. Sinónimo en Taiwán: 禮拜 (lǐbài).",
            "ejemplos": [
                "一個星期有七天 — Una semana tiene siete días",
                "你這個星期忙不忙？ — ¿Estás ocupado esta semana?"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_shangshanggexingqi",
            "espanol": "La semana antepasada",
            "tradicional": "上上個星期",
            "pinyin": "shàng shàng ge xīngqī",
            "zhuyin": "ㄕㄤˋ ㄕㄤˋ ˙ㄍㄜ ㄒㄧㄥ ㄑㄧ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "上 (shàng - anterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_xingqi"
                }
            ],
            "notas": "Dos semanas atrás en relación a la semana actual.",
            "ejemplos": [
                "上上個星期我們沒有上課 — La semana antepasada no tuvimos clases",
                "這是我上上個星期借的書 — Este es el libro que pedí prestado la semana antepasada"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_shanggexingqi",
            "espanol": "La semana pasada",
            "tradicional": "上個星期",
            "pinyin": "shàng ge xīngqī",
            "zhuyin": "ㄕㄤˋ ˙ㄍㄜ ㄒㄧㄥ ㄑㄧ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "上 (shàng - anterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_xingqi"
                }
            ],
            "notas": "La semana inmediatamente anterior a la actual.",
            "ejemplos": [
                "上個星期我們見過面 — Nos vimos la semana pasada",
                "上個星期的功課很多 — La semana pasada hubo mucha tarea"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_zhegexingqi",
            "espanol": "Esta semana",
            "tradicional": "這個星期",
            "pinyin": "zhè ge xīngqī",
            "zhuyin": "ㄓㄜˋ ˙ㄍㄜ ㄒㄧㄥ ㄑㄧ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_msk0jitk_kr6cx"
                },
                {
                    "type": "ref",
                    "id": "id_voc_xingqi"
                }
            ],
            "notas": "La semana en curso.",
            "ejemplos": [
                "這個星期五有漢字考試 — Este viernes hay examen de caracteres",
                "這個星期每天都有課 — Esta semana tengo clases todos los días"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xiagexingqi",
            "espanol": "La próxima semana",
            "tradicional": "下個星期",
            "pinyin": "xià ge xīngqī",
            "zhuyin": "ㄒㄧㄚˋ ˙ㄍㄜ ㄒㄧㄥ ㄑㄧ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "下 (xià - posterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_xingqi"
                }
            ],
            "notas": "La semana inmediatamente siguiente a la actual.",
            "ejemplos": [
                "下個星期見！ — ¡Nos vemos la próxima semana!",
                "下個星期我們開始學語法 — La próxima semana comenzamos a estudiar gramática"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xiaxiagexingqi",
            "espanol": "La semana subsiguiente (en 2 semanas)",
            "tradicional": "下下個星期",
            "pinyin": "xià xià ge xīngqī",
            "zhuyin": "ㄒㄧㄚˋ ㄒㄧㄚˋ ˙ㄍㄜ ㄒㄧㄥ ㄑㄧ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "下 (xià - posterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_xingqi"
                }
            ],
            "notas": "Dos semanas hacia adelante respecto a la semana actual.",
            "ejemplos": [
                "下下個星期一放假 — El lunes subsiguiente es feriado / no hay clases",
                "下下個星期我們要交報告 — En dos semanas tenemos que entregar el informe"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_tian",
            "espanol": "Día / Cielo",
            "tradicional": "天",
            "pinyin": "tiān",
            "zhuyin": "ㄊㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtfhl7d1_9g4op"
                },
                {
                    "type": "ref",
                    "id": "id_mtjn41m4_7ohc2"
                }
            ],
            "notas": "Cielo y cómputo diario. Actúa como clasificador directo de tiempo (三天 = tres días), no usa 個.",
            "ejemplos": [
                "一個星期有七天 — Una semana tiene siete días",
                "天天開心 — Feliz todos los días"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_daqiantian",
            "espanol": "Anteanteayer (hace 3 días)",
            "tradicional": "大前天",
            "pinyin": "dàqiántiān",
            "zhuyin": "ㄉㄚˋ ㄑㄧㄢˊ ㄊㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjn41m4_7ohc2"
                },
                {
                    "type": "text",
                    "value": "前 (qián - anterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_tian"
                }
            ],
            "notas": "Tres días antes de hoy.",
            "ejemplos": [
                "大前天我買了一本新書 — Hace tres días compré un libro nuevo",
                "大前天下午很冷 — Anteanteayer por la tarde estuvo muy frío"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_qiantian",
            "espanol": "Anteayer",
            "tradicional": "前天",
            "pinyin": "qiántiān",
            "zhuyin": "ㄑㄧㄢˊ ㄊㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "前 (qián - anterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_tian"
                }
            ],
            "notas": "Dos días antes de hoy (anteayer).",
            "ejemplos": [
                "前天你去哪裡？ — ¿A dónde fuiste anteayer?",
                "前天我們上書法課 — Anteayer tuvimos clase de caligrafía"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_zuotian",
            "espanol": "Ayer",
            "tradicional": "昨天",
            "pinyin": "zuótiān",
            "zhuyin": "ㄗㄨㄛˊ ㄊㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "昨 (zuó - ayer)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_tian"
                }
            ],
            "notas": "El día de ayer.",
            "ejemplos": [
                "昨天下午你在家嗎？ — ¿Estabas en casa ayer por la tarde?",
                "昨天的漢字課很有意思 — La clase de caracteres de ayer fue muy interesante"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_jintian",
            "espanol": "Hoy",
            "tradicional": "今天",
            "pinyin": "jīntiān",
            "zhuyin": "ㄐㄧㄣ ㄊㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "今 (jīn - presente)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_tian"
                }
            ],
            "notas": "El día de hoy.",
            "ejemplos": [
                "今天是幾月幾日？ — ¿Qué fecha es hoy?",
                "今天天氣真好 — Hoy el clima está verdaderamente bueno"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 3
        },
        {
            "id": "id_voc_mingtian",
            "espanol": "Mañana (día siguiente)",
            "tradicional": "明天",
            "pinyin": "míngtiān",
            "zhuyin": "ㄇㄧㄥˊ ㄊㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "明 (míng - brillante)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_tian"
                }
            ],
            "notas": "El día de mañana. Despedida habitual: 明天見 (nos vemos mañana).",
            "ejemplos": [
                "明天見！ — ¡Nos vemos mañana!",
                "明天上午我有選修課 — Mañana por la mañana tengo materia electiva"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 3
        },
        {
            "id": "id_voc_houtian",
            "espanol": "Pasado mañana",
            "tradicional": "後天",
            "pinyin": "hòutiān",
            "zhuyin": "ㄏㄡˋ ㄊㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "後 (hòu - posterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_tian"
                }
            ],
            "notas": "Pasado mañana (en 2 días).",
            "ejemplos": [
                "後天我們去買書 — Pasado mañana vamos a comprar libros",
                "後天你有空嗎？ — ¿Tienes tiempo libre pasado mañana?"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_dahoutian",
            "espanol": "En 3 días (día posterior a pasado mañana)",
            "tradicional": "大後天",
            "pinyin": "dàhòutiān",
            "zhuyin": "ㄉㄚˋ ㄏㄡˋ ㄊㄧㄢ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjn41m4_7ohc2"
                },
                {
                    "type": "text",
                    "value": "後 (hòu - posterior)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_tian"
                }
            ],
            "notas": "En 3 días a partir de hoy.",
            "ejemplos": [
                "大後天我們在學校見面 — En tres días nos vemos en la escuela",
                "大後天下午下課以後去喝茶 — En tres días por la tarde después de clase vamos a tomar té"
            ],
            "fechaCreacion": "2026-09-27"
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
                    "value": "時 (shí - tiempo)"
                },
                {
                    "type": "text",
                    "value": "候 (hòu - esperar)"
                }
            ],
            "notas": "Muy frecuente en la estructura '...的時候' (...de shíhòu = cuando / en el momento de...).",
            "ejemplos": [
                "吃飯的時候不要說話 — Al momento de comer no hables",
                "小的時候我很喜歡貓 — Cuando era pequeño me gustaban mucho los gatos"
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
                    "value": "鐘 (zhōng - reloj)"
                }
            ],
            "notas": "Duración medida en minutos (休息十分鐘 = descanso de 10 minutos).",
            "ejemplos": [
                "下課休息十分鐘 — El receso de clase dura diez minutos",
                "請等我五分鐘 — Por favor espérame cinco minutos"
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
                    "value": "民 (mín - pueblo)"
                },
                {
                    "type": "ref",
                    "id": "n5"
                }
            ],
            "notas": "Calendario republicano oficial de Taiwán (año 1 = 1912). Se resta 1911 al año gregoriano: 2026 = 民國115年.",
            "ejemplos": [
                "今年是民國115年 — Este año es el 115 de la República de China",
                "民國115年9月27日 — 27 de septiembre del año 115 de la República de China"
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
                    "value": "禮 (lǐ - rito/cortesía)"
                },
                {
                    "type": "text",
                    "value": "拜 (bài - venerar)"
                }
            ],
            "notas": "Término sumamente arraigado y coloquial en Taiwán equivalente a 星期 (semana): 下個禮拜.",
            "ejemplos": [
                "下個禮拜見 — Nos vemos la próxima semana",
                "一個禮拜有七天 — Una semana tiene siete días"
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
                    "value": "學 (xué - estudiar)"
                },
                {
                    "type": "text",
                    "value": "校 (xiào - escuela)"
                }
            ],
            "notas": "Centro de enseñanza y estudio: 學 (aprender) + 校 (institución).",
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
                    "value": "哪 (nǎ - cuál)"
                },
                {
                    "type": "text",
                    "value": "里 (lǐ - pueblo)"
                }
            ],
            "notas": "Pronombre interrogativo de lugar predominante en Taiwán: 教室在哪裡？ También réplica de modesta cortesía.",
            "ejemplos": [
                "教室在哪裡？ — ¿Dónde está el salón de clases?",
                "你要去哪裡？ — ¿A dónde vas?"
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
                    "value": "些 (xiē - unos pocos)"
                }
            ],
            "notas": "Demostrativo plural cercano: 這些書 (estos libros).",
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
                    "value": "些 (xiē - unos pocos)"
                }
            ],
            "notas": "Demostrativo plural lejano: 那些人 (aquellas personas).",
            "ejemplos": [
                "那些花非常漂亮 — Aquellas flores son extremadamente hermosas",
                "那些不是我的書 — Esos no son mis libros"
            ],
            "fechaCreacion": "2026-09-28"
        },
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
                    "value": "周 (zhōu - ciclo)"
                },
                {
                    "type": "text",
                    "value": "末 (mò - final)"
                }
            ],
            "notas": "周 (ciclo/semana) + 末 (extremo/fin). Suele abrir la oración como marco temporal.",
            "ejemplos": [
                "我週末常運動 — Los fines de semana suelo hacer ejercicio",
                "明天是週末，你要不要來我家？ — Mañana es fin de semana, ¿quieres venir a mi casa?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "音 (yīn - sonido)"
                },
                {
                    "type": "text",
                    "value": "樂 (yuè - música)"
                }
            ],
            "notas": "音 (sonido) + 樂 (melodía/música). Nótese que 樂 se lee yuè para música y lè para alegría (快樂).",
            "ejemplos": [
                "我媽媽喜歡聽日本音樂 — A mi mamá le gusta escuchar música japonesa",
                "你喜歡聽音樂嗎？ — ¿Te gusta escuchar música?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "網 (wǎng - red)"
                },
                {
                    "type": "text",
                    "value": "球 (qiú - pelota)"
                }
            ],
            "notas": "Literalmente 'pelota de red' (網 red + 球 pelota). Verbo acompañante: 打 (dǎ wǎngqiú).",
            "ejemplos": [
                "我姐姐週末常打網球 — Mi hermana mayor suele jugar al tenis los fines de semana",
                "我不喜歡打網球 — No me gusta jugar al tenis"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "棒 (bàng - palo/bate)"
                },
                {
                    "type": "text",
                    "value": "球 (qiú - pelota)"
                }
            ],
            "notas": "Literalmente 'pelota de bate'. Es el deporte rey tradicional y más popular de Taiwán. Verbo: 打.",
            "ejemplos": [
                "網球、棒球，我都喜歡 — Me gustan tanto el tenis como el béisbol",
                "田中喜歡打棒球 — A Tanaka le gusta jugar al béisbol"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "籃 (lán - canasta)"
                },
                {
                    "type": "text",
                    "value": "球 (qiú - pelota)"
                }
            ],
            "notas": "Literalmente 'pelota de canasta' (con radical de bambú 竹 por las cestas antiguas). Verbo: 打.",
            "ejemplos": [
                "安同常打籃球 — Antong juega a menudo al baloncesto",
                "我們週末去打籃球，怎麼樣？ — ¿Qué te parece si vamos a jugar al baloncesto el fin de semana?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "球 (qiú - pelota)"
                }
            ],
            "notas": "Literalmente 'pelota de pie' (足 pie + 球 pelota). Verbo acompañante: 踢 (tī zúqiú).",
            "ejemplos": [
                "我覺得踢足球很好玩 — Pienso que jugar al fútbol es muy divertido",
                "我們早上去踢足球，怎麼樣？ — ¿Qué tal si vamos a jugar al fútbol por la mañana?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "白 (bái - blanco)"
                },
                {
                    "type": "text",
                    "value": "如 (rú - como)"
                },
                {
                    "type": "text",
                    "value": "玉 (yù - jade)"
                }
            ],
            "notas": "Personaje del libro MTC. Su nombre significa poéticamente 'pura y blanca como el jade'.",
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
                    "value": "電 (diàn - electricidad)"
                },
                {
                    "type": "text",
                    "value": "影 (yǐng - sombra)"
                }
            ],
            "notas": "Literalmente 'sombras eléctricas'. Acción verbal principal: 看電影 (ver una película). Clasificador: 部 (bù).",
            "ejemplos": [
                "今天晚上我們去看電影，好不好？ — Vamos al cine esta noche, ¿te parece bien?",
                "臺灣電影和美國電影都很好看 — Tanto las películas taiwanesas como las estadounidenses son muy buenas"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "女 (nǚ - mujer)"
                },
                {
                    "type": "text",
                    "value": "尔 (ěr - tú)"
                }
            ],
            "notas": "Variante gráfica femenina de 你 con radical de mujer 女. De uso común en cartas y mensajería escrita.",
            "ejemplos": [
                "請問妳是王小姐嗎？ — Disculpe, ¿usted es la señorita Wang?",
                "妳想看美國電影還是臺灣電影？ — ¿Quieres ver una película estadounidense o una taiwanesa?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "中 (zhōng - centro)"
                },
                {
                    "type": "text",
                    "value": "文 (wén - texto)"
                }
            ],
            "notas": "Lengua y escritura china. En Taiwán también se denomina habitualmente 國語 (Guóyǔ) o 華語 (Huáyǔ).",
            "ejemplos": [
                "我覺得中文很好玩 — Pienso que el idioma chino es muy divertido y ameno",
                "看電影可以學中文 — Ver películas sirve para aprender chino"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "晚 (wǎn - noche)"
                },
                {
                    "type": "text",
                    "value": "飯 (fàn - comida)"
                }
            ],
            "notas": "晚 (noche) + 飯 (comida/arroz). Comparar con 早飯 (desayuno) y 午飯 (almuerzo). Verbo: 吃晚飯.",
            "ejemplos": [
                "我們今天一起吃晚飯，怎麼樣？ — ¿Qué te parece si cenamos juntos hoy?",
                "晚上要不要一起吃晚飯？ — ¿Cenamos juntos esta noche?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "艹 (cǎo - hierba)"
                },
                {
                    "type": "text",
                    "value": "采 (cǎi - cosechar)"
                }
            ],
            "notas": "Abarca: 1) Cocina de un país (臺灣菜, 越南菜), 2) Plato servido en mesa, 3) Hortalizas.",
            "ejemplos": [
                "今天晚上我們吃越南菜吧！ — ¡Cenemos comida vietnamita esta noche!",
                "妳喜歡吃哪國菜？ — ¿La comida de qué país te gusta?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "越 (yuè - cruzar)"
                },
                {
                    "type": "text",
                    "value": "南 (nán - sur)"
                }
            ],
            "notas": "País con estrechos lazos culturales y gastronómicos en Taiwán. Chen Yuemei en el método es vietnamita.",
            "ejemplos": [
                "陳月美是越南人 — Chen Yuemei es vietnamita",
                "我很喜歡吃越南菜 — Me gusta mucho comer comida vietnamita"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
        },
        {
            "id": "id_l4_qian",
            "espanol": "Dinero",
            "tradicional": "錢",
            "pinyin": "qián",
            "zhuyin": "ㄑㄧㄢˊ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "金 / 釒(jīn - metal/oro)"
                },
                {
                    "type": "text",
                    "value": "戔 (jiān - pequeño/lanzas)"
                }
            ],
            "notas": "Dinero o moneda. Con radical de metal (釒). Forma base de preguntas de precio: 多少錢？ (¿Cuánto cuesta?).",
            "ejemplos": [
                "我沒有很多錢。 — No tengo mucho dinero.",
                "這支手機要多少錢？ — ¿Cuánto dinero cuesta este teléfono celular?"
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_laoban",
            "espanol": "Dueño / Jefe / Propietario de tienda",
            "tradicional": "老闆",
            "pinyin": "lǎobǎn",
            "zhuyin": "ㄌㄠˇ ㄅㄢˇ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "老 (lǎo - viejo/respetado)"
                },
                {
                    "type": "text",
                    "value": "木 (mù - madera)"
                },
                {
                    "type": "text",
                    "value": "反 (fǎn - opuesto)"
                }
            ],
            "notas": "Dueño o encargado de un negocio o puesto. Tratamiento cotidiano y amable al dirigirse al dependiente en Taiwán.",
            "ejemplos": [
                "老闆，我要一杯烏龍茶！ — ¡Jefe, quiero un té Oolong!",
                "那個老闆人很好，常請我們吃東西。 — Ese dueño es muy amable, a menudo nos invita a comer algo."
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_wan",
            "espanol": "Diez mil (10.000)",
            "tradicional": "萬",
            "pinyin": "wàn",
            "zhuyin": "ㄨㄢˋ",
            "categoria": "sustantivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "艹 (cǎo - hierba)"
                },
                {
                    "type": "text",
                    "value": "禸 (róu - huella)"
                }
            ],
            "notas": "Unidad numérica china fundamental: diez mil (10.000). En chino los números grandes se agrupan en múltiplos de cuatro ceros (一萬 = 10.000).",
            "ejemplos": [
                "這支新手機要一萬塊。 — Este celular nuevo cuesta diez mil dólares.",
                "那間房子要兩千萬。 — Esa casa cuesta veinte millones."
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_shouji",
            "espanol": "Teléfono celular / Móvil",
            "tradicional": "手機",
            "pinyin": "shǒujī",
            "zhuyin": "ㄕㄡˇ ㄐㄧ",
            "categoria": "sustantivo",
            "clasificador": "id_clf_zhi_phone",
            "radicales": [
                {
                    "type": "text",
                    "value": "手 (shǒu - mano)"
                },
                {
                    "type": "text",
                    "value": "木 (mù - madera)"
                },
                {
                    "type": "text",
                    "value": "幾 (jī - máquina/mesa)"
                }
            ],
            "notas": "Literalmente 'máquina de mano': teléfono celular o smartphone. Su clasificador habitual es 支 (zhī).",
            "ejemplos": [
                "我的手機很舊，我想買新的。 — Mi teléfono móvil es muy viejo, quiero comprar uno nuevo.",
                "這支手機能不能上網？ — ¿Puede este teléfono conectarse a internet?"
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_baozi",
            "espanol": "Baozi (bollo al vapor relleno)",
            "tradicional": "包子",
            "pinyin": "bāozi",
            "zhuyin": "ㄅㄠ ˙ㄗ",
            "categoria": "sustantivo",
            "clasificador": "id_mtfhewfx_gtw3b",
            "radicales": [
                {
                    "type": "text",
                    "value": "勹 (bāo - envolver)"
                },
                {
                    "type": "text",
                    "value": "巳 (sì - serpiente)"
                },
                {
                    "type": "text",
                    "value": "子 (zǐ - semilla/niño)"
                }
            ],
            "notas": "Bollo al vapor esponjoso relleno de carne o verduras. Desayuno o merienda clásica y muy popular en Taiwán.",
            "ejemplos": [
                "老闆，我要買三個熱包子。 — Jefe, quiero comprar tres baozis calientes.",
                "這家店的包子非常好吃。 — Los baozis de este local son riquísimos."
            ],
            "leccion": 4
        }
    ],
    "verbos": [
        {
            "id": "v1",
            "espanol": "Ser / Estar",
            "tradicional": "是",
            "pinyin": "shì",
            "zhuyin": "ㄕˋ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "日 (rì - sol)"
                },
                {
                    "type": "text",
                    "value": "正 (zhèng - recto)"
                }
            ],
            "notas": "El sol en el cenit como símbolo de verdad y rectitud. Copulativo 'ser'. Nunca une sujeto con adjetivo calificativo simple.",
            "ejemplos": [
                "我是學生 — Soy estudiante",
                "他不是美國人 — Él no es estadounidense"
            ],
            "leccion": 1
        },
        {
            "id": "v2",
            "espanol": "Amar",
            "tradicional": "愛",
            "pinyin": "ài",
            "zhuyin": "ㄞˋ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "爫 (zhǎo - garra)"
                },
                {
                    "type": "text",
                    "value": "冖 (mì - cubierta)"
                },
                {
                    "type": "ref",
                    "id": "id_mtlt07kj_ddod0"
                },
                {
                    "type": "text",
                    "value": "友 (yǒu - amigo)"
                }
            ],
            "notas": "En la grafía tradicional cobija un corazón 心 en su centro (el amor nace del corazón y se comparte con afecto).",
            "ejemplos": [
                "我愛你 — Te amo / Te quiero",
                "我們都愛臺灣 — Todos amamos Taiwán"
            ]
        },
        {
            "espanol": "Tener, haber",
            "tradicional": "有",
            "pinyin": "yǒu",
            "zhuyin": "ㄧㄡˇ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "𠂇 (yòu - mano)"
                },
                {
                    "type": "text",
                    "value": "月 (ròu - carne)"
                }
            ],
            "notas": "Una mano sosteniendo una porción de carne como provisión. Su negación es invariablemente 沒有 (méiyǒu), nunca 不有.",
            "ejemplos": [
                "我有三張照片 — Tengo tres fotos",
                "你有沒有兄弟？ — ¿Tienes hermanos varones?"
            ],
            "id": "id_msikgc9s_g7seh",
            "fechaCreacion": "2026-08-07",
            "leccion": 2
        },
        {
            "espanol": "No tener",
            "tradicional": "沒有",
            "pinyin": "méiyǒu",
            "zhuyin": "ㄇㄟˊ ㄧㄡˇ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mty032_mei"
                },
                {
                    "type": "ref",
                    "id": "id_msikgc9s_g7seh"
                }
            ],
            "notas": "Negación obligatoria de 有 ('no tener' o 'no haber'). Se usa también como respuesta breve: 沒有 (todavía no / no).",
            "ejemplos": [
                "我沒有書 — No tengo libros",
                "他沒有兄弟姐妹 — Él no tiene hermanos ni hermanas"
            ],
            "id": "id_msikk3ee_c6734",
            "fechaCreacion": "2026-08-07"
        },
        {
            "espanol": "Comer",
            "tradicional": "吃",
            "pinyin": "chī",
            "zhuyin": "ㄔ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "口 (kǒu - boca)"
                },
                {
                    "type": "text",
                    "value": "乞 (qǐ - pedir)"
                }
            ],
            "notas": "La boca 口 abierta esperando el alimento. Verbo básico para ingerir comida sólida.",
            "id": "id_mspmonrk_kj3kn",
            "fechaCreacion": "2026-08-12",
            "ejemplos": [
                "你吃牛肉嗎？ — ¿Comes carne de res?",
                "我不吃肉 — No como carne"
            ],
            "leccion": 3
        },
        {
            "espanol": "Beber",
            "tradicional": "喝",
            "pinyin": "hē",
            "zhuyin": "ㄏㄜ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "口 (kǒu - boca)"
                },
                {
                    "type": "text",
                    "value": "曷 (hé - sed)"
                }
            ],
            "notas": "La boca 口 que busca saciar la sed 曷. Verbo exclusivo para ingerir bebidas y líquidos (agua, té, café).",
            "id": "id_msr421dy_83jqz",
            "fechaCreacion": "2026-08-13",
            "ejemplos": [
                "請喝茶 — Por favor toma té",
                "你要喝咖啡嗎？ — ¿Quieres tomar café?"
            ],
            "leccion": 1
        },
        {
            "espanol": "Gustar",
            "tradicional": "喜歡",
            "pinyin": "xǐhuān",
            "zhuyin": "ㄒㄧˇ ㄏㄨㄢ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "喜 (xǐ - alegría)"
                },
                {
                    "type": "text",
                    "value": "歡 (huān - regocijo)"
                }
            ],
            "notas": "Doble expresión de júbilo y celebración. Acepta tanto sustantivos (喜歡茶) como cláusulas verbales (喜歡看電影).",
            "id": "id_msr45d21_4cgg5",
            "fechaCreacion": "2026-08-13",
            "ejemplos": [
                "我喜歡喝臺灣茶 — Me gusta tomar té de Taiwán",
                "他喜歡看書 — A él le gusta leer"
            ],
            "leccion": 1
        },
        {
            "espanol": "Llegar",
            "tradicional": "來",
            "pinyin": "lái",
            "zhuyin": "ㄌㄞˊ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "木 (mù - árbol)"
                }
            ],
            "notas": "Pictograma arcaico de una espiga de trigo que llegó de tierras lejanas. Verbo de desplazamiento hacia donde está el hablante.",
            "id": "id_mtvfh8aa_8aaax",
            "fechaCreacion": "2026-09-10",
            "leccion": 1
        },
        {
            "espanol": "Llamarse",
            "tradicional": "叫",
            "pinyin": "jiào",
            "zhuyin": "ㄐㄧㄠˋ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "口 (kǒu - boca)"
                },
                {
                    "type": "text",
                    "value": "丩 (jiū - sonido)"
                }
            ],
            "notas": "Emitir la voz por la boca para llamar o nombrar. Se usa para nombres de pila o completos (no para apellidos solos, que usan 姓).",
            "id": "id_mtvggz7s_l22ll",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "請問，你叫什麼名字？ — Disculpe, ¿cómo se llama usted?",
                "我叫王開文 — Me llamo Wang Kaiwen"
            ],
            "leccion": 1
        },
        {
            "espanol": "Bienvenida",
            "tradicional": "歡迎",
            "pinyin": "huānyíng",
            "zhuyin": "ㄏㄨㄢ ㄧㄥˊ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "歡 (huān - alegre)"
                },
                {
                    "type": "text",
                    "value": "迎 (yíng - recibir)"
                }
            ],
            "notas": "Salir al encuentro con alegría. Fórmula de acogida: 歡迎 + Sujeto + 來 + Lugar (ej. 歡迎你來臺灣！).",
            "id": "id_mtvgtotw_2spn1",
            "fechaCreacion": "2026-09-10",
            "leccion": 1
        },
        {
            "espanol": "Invitar / Por favor",
            "tradicional": "請",
            "pinyin": "qǐng",
            "zhuyin": "ㄑㄧㄥˇ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "言 (yán - palabra)"
                },
                {
                    "type": "text",
                    "value": "青 (qīng - verde)"
                }
            ],
            "notas": "Palabras amables y diáfanas. Ante un verbo denota cortesía (請坐 = siéntese); seguido de persona denota invitar (我請你).",
            "id": "id_mtvh6q8e_qg8ox",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "請進，請坐 — Por favor pase, tome asiento",
                "請喝烏龍茶 — Por favor tome té Oolong"
            ],
            "leccion": 1
        },
        {
            "espanol": "Querer",
            "tradicional": "要",
            "pinyin": "yào",
            "zhuyin": "ㄧㄠˋ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "覀 (yà - cubrir)"
                },
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                }
            ],
            "notas": "Pictograma de una mujer con las manos en la cintura señalando lo esencial. Expresa voluntad o futuro inmediato; negación: 不要.",
            "id": "id_mtvifgj8_j51mk",
            "fechaCreacion": "2026-09-10",
            "leccion": 1
        },
        {
            "id": "id_mty001_kan",
            "espanol": "Ver / Mirar / Leer",
            "tradicional": "看",
            "pinyin": "kàn",
            "zhuyin": "ㄎㄢˋ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "手 (shǒu - mano)"
                },
                {
                    "type": "text",
                    "value": "目 (mù - ojo)"
                }
            ],
            "notas": "Una mano 手 puesta sobre el ojo 目 a modo de visera para otear a la distancia. Abarca ver, mirar y leer (看書).",
            "ejemplos": [
                "你看！ — ¡Mira!",
                "我看書 — Yo leo un libro",
                "我看書法展覽 — Miro la exposición de caligrafía"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 3
        },
        {
            "id": "id_mty022_zuo",
            "espanol": "Sentarse",
            "tradicional": "坐",
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
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "土 (tǔ - tierra)"
                }
            ],
            "notas": "Ideograma explícito: dos personas 人 sentadas frente a frente sobre la tierra 土 conversando amistosamente.",
            "ejemplos": [
                "請坐 — Por favor, tome asiento / siéntese",
                "請進，請坐 — Por favor pase, tome asiento"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty025_zhaoxiang",
            "espanol": "Tomar fotos / Fotografiar",
            "tradicional": "照相",
            "pinyin": "zhàoxiàng",
            "zhuyin": "ㄓㄠˋ ㄒㄧㄤˋ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_msk0536g_z9es3"
                },
                {
                    "type": "text",
                    "value": "相 (xiàng - apariencia)"
                }
            ],
            "notas": "Iluminar con fuego 灬 la apariencia 相 de las cosas. Verbo separable (V-O): al cuantificar se separa (照一張相).",
            "ejemplos": [
                "我們要照相 — Queremos tomarnos fotos",
                "照一張相 — Tomar una foto"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty031_kanshu",
            "espanol": "Leer / Leer un libro",
            "tradicional": "看書",
            "pinyin": "kànshū",
            "zhuyin": "ㄎㄢˋ ㄕㄨ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mty001_kan"
                },
                {
                    "type": "ref",
                    "id": "id_mty002_shu"
                }
            ],
            "notas": "Mirar 看 caracteres impresos en un libro 書. Estructura separable: 看一本好書 (leer un buen libro).",
            "ejemplos": [
                "我喜歡看書 — Me gusta leer",
                "他在家看書 — Él lee libros en casa"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "espanol": "Recoger / Recibir (a una persona)",
            "tradicional": "接",
            "pinyin": "jiē",
            "zhuyin": "ㄐㄧㄝ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "扌 (shǒu - mano)"
                },
                {
                    "type": "text",
                    "value": "妾 (qiè - doncella)"
                }
            ],
            "notas": "Extender la mano para recibir a quien llega. Frecuente al acudir al aeropuerto o estación a recoger a alguien.",
            "id": "id_mtvfxlqp_7ey6d",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "我去機場接李先生 — Voy al aeropuerto a recoger al señor Li",
                "謝謝你來接我 — Gracias por venir a recibirme"
            ],
            "leccion": 1
        },
        {
            "id": "id_voc_xiuxi",
            "espanol": "Descansar / Descanso / Receso",
            "tradicional": "休息",
            "pinyin": "xiūxí",
            "zhuyin": "ㄒㄧㄡ ㄒㄧˊ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "休 (xiū - descansar)"
                },
                {
                    "type": "text",
                    "value": "息 (xí - aliento)"
                }
            ],
            "notas": "Una persona recostada a la sombra de un árbol 木 mientras su corazón 心 y respiración recobran la calma.",
            "ejemplos": [
                "我們休息十分鐘 — Descansamos diez minutos",
                "請好好休息 — Por favor descansa bien"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xiake",
            "espanol": "Terminar la clase / Salir de clase / Receso",
            "tradicional": "下課",
            "pinyin": "xiàkè",
            "zhuyin": "ㄒㄧㄚˋ ㄎㄜˋ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "下 (xià - bajar)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Verbo separable que indica concluir la lección o salir al recreo. Antónimo directo: 上課 (shàngkè).",
            "ejemplos": [
                "我們中午十二點下課 — Salimos de clase a las doce del mediodía",
                "下課了，大家再見！ — ¡Terminó la clase, nos vemos todos!"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_shuo",
            "espanol": "Hablar / Decir",
            "tradicional": "說",
            "pinyin": "shuō",
            "zhuyin": "ㄕㄨㄛ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "言 (yán - palabra)"
                },
                {
                    "type": "text",
                    "value": "兌 (duì - comunicar)"
                }
            ],
            "notas": "Palabras 言 que abren el entendimiento 兌 de quien escucha. Verbo nuclear para emitir lenguaje: 說中文, 請再說一次.",
            "ejemplos": [
                "請說中文 — Por favor hable en chino",
                "他說得很清楚 — Él lo dice muy claramente"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_mai",
            "espanol": "Comprar",
            "tradicional": "買",
            "pinyin": "mǎi",
            "zhuyin": "ㄇㄞˇ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "罒 (wǎng - red)"
                },
                {
                    "type": "text",
                    "value": "貝 (bèi - concha/moneda)"
                }
            ],
            "notas": "Una red que recoge conchas monetarias 貝. Tono 3 (mǎi). No confundir con 賣 (mài, tono 4, vender).",
            "ejemplos": [
                "你要買什麼？ — ¿Qué deseas comprar?",
                "我在書店買了一本漢字書 — Compré un libro de caracteres chinos en la librería"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 4
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
                    "value": "故 (gù - causa)"
                }
            ],
            "notas": "Una persona en actividad práctica transformando las cosas. Verbo nuclear para realizar o elaborar: 做菜, 做作業.",
            "ejemplos": [
                "他在做什麼？ — ¿Qué está haciendo él?",
                "我喜歡做菜 — Me gusta cocinar / preparar comida"
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
                    "value": "羊 (yáng - oveja)"
                },
                {
                    "type": "text",
                    "value": "工 (gōng - trabajo)"
                }
            ],
            "notas": "Discrepancia o falta en una medida. En la hora indica los minutos que faltan para la hora siguiente: 差五分八點 (7:55).",
            "ejemplos": [
                "差十分兩點 — Diez para las dos (1:50)",
                "這兩個東西差不多 — Estas dos cosas son casi iguales"
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
                    "value": "目 (mù - ojo)"
                },
                {
                    "type": "ref",
                    "id": "n7"
                }
            ],
            "notas": "Un ojo 目 prominente sobre piernas 儿 en marcha. Verbo de contacto visual y encuentro; clave en despedidas: 明天見.",
            "ejemplos": [
                "明天見！ — ¡Nos vemos mañana!",
                "下個禮拜見 — Nos vemos la próxima semana"
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
                    "value": "口 (kǒu - boca)"
                }
            ],
            "notas": "Una boca 口 que asoma por una puerta 門 para indagar. Aparece en la fórmula cortés 請問 y en 問問題.",
            "ejemplos": [
                "我要問問題 — Quiero hacer una pregunta",
                "請問洗手間在哪裡？ — Disculpe, ¿dónde está el baño?"
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
                    "value": "土 (tǔ - tierra)"
                },
                {
                    "type": "text",
                    "value": "厶 (sī - privado)"
                }
            ],
            "notas": "Una persona que se aleja de su morada en la tierra. Verbo de movimiento que se aleja del punto del hablante hacia un destino.",
            "ejemplos": [
                "你去教室做什麼？ — ¿A qué vas al salón de clases?",
                "我明天去臺灣 — Mañana voy a Taiwán"
            ],
            "fechaCreacion": "2026-09-28",
            "leccion": 3
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
                    "value": "𠂇 (yòu - mano)"
                },
                {
                    "type": "text",
                    "value": "土 (tǔ - tierra)"
                }
            ],
            "notas": "Estar presente y arraigado en la tierra 土. Estructura locativa estándar: Sujeto + 在 + Lugar.",
            "ejemplos": [
                "老師在教室裡 — El profesor está en el salón de clases",
                "你在哪裡？ — ¿Dónde estás?"
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
            "notas": "Construcción de acción 吃 y resultado 飽 (saciado). Da origen al saludo más emblemático de Taiwán: 你吃飽了嗎？",
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
                    "value": "上 (shàng - arriba)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_ke"
                }
            ],
            "notas": "Acudir a la tarima escolar a recibir la enseñanza. Antónimo exacto de 下課 (terminar la clase).",
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
                    "value": "卜 (bǔ - adivinar)"
                }
            ],
            "notas": "Un trazo vertical situado por encima de una línea de referencia. Como verbo denota subir o asistir a clase (上書法課).",
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
                    "value": "卜 (bǔ - adivinar)"
                }
            ],
            "notas": "Un trazo situado por debajo de la línea horizontal. Como verbo denota descender o finalizar una sesión lectiva (下課).",
            "ejemplos": [
                "我們十二點下課 — Terminamos la clase a las 12:00",
                "下星期見 — Nos vemos la próxima semana"
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
                    "value": "見 (jiàn - percibir)"
                },
                {
                    "type": "text",
                    "value": "彳 (chì - paso)"
                }
            ],
            "notas": "Verbo de valoración y juicio personal: Sujeto + 覺得 + Opinión (ej. 我覺得很好; 你覺得怎麼樣？).",
            "ejemplos": [
                "我覺得中文很有意思 — Pienso que el idioma chino es muy interesante",
                "你覺得這本書怎麼樣？ — ¿Qué te parece este libro?",
                "我覺得今天很冷 — Siento / pienso que hoy hace mucho frío"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "耳 (ěr - oreja)"
                },
                {
                    "type": "text",
                    "value": "心 (xīn - corazón)"
                }
            ],
            "notas": "Escuchar con el oído 耳 atento y con el corazón 心 presente. Acción principal de percepción auditiva: 聽音樂 (escuchar música).",
            "ejemplos": [
                "田中不喜歡聽音樂 — A Tanaka no le gusta escuchar música",
                "我喜歡聽音樂和打網球 — Me gusta escuchar música y jugar al tenis"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "運 (yùn - mover)"
                },
                {
                    "type": "text",
                    "value": "動 (dòng - acción)"
                }
            ],
            "notas": "Mover y transportar la energía del cuerpo con fuerza y vigor. Funciona como verbo ('ejercitarse') y como sustantivo ('el deporte').",
            "ejemplos": [
                "我爸爸、媽媽都不喜歡運動 — A mi papá y a mi mamá no les gusta hacer ejercicio",
                "我今天要去運動，不去你家 — Hoy voy a hacer ejercicio, no iré a tu casa"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "丁 (dīng - clavo)"
                }
            ],
            "notas": "Una mano en acción motriz. En deportes de pelota se aplica a disciplinas jugadas con manos, palos o raquetas (打網球, 打棒球).",
            "ejemplos": [
                "田中喜歡打棒球 — A Tanaka le gusta jugar al béisbol",
                "你喜歡打網球嗎？ — ¿Te gusta jugar al tenis?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "游 (yóu - nadar)"
                },
                {
                    "type": "text",
                    "value": "泳 (yǒng - nado)"
                }
            ],
            "notas": "Ambos caracteres portan el radical de agua 氵. Verbo separable (V-O): 游個泳 (darse un baño de natación).",
            "ejemplos": [
                "我想學游泳，也想學打網球 — Quiero aprender a nadar y también aprender a jugar al tenis",
                "你喜歡不喜歡游泳？ — ¿Te gusta nadar?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "足 (zú - pie)"
                },
                {
                    "type": "text",
                    "value": "易 (yì - ágil)"
                }
            ],
            "notas": "Movimiento ágil del pie 足. Verbo asignado de manera casi universal al fútbol: 踢足球.",
            "ejemplos": [
                "他喜歡踢足球 — A él le gusta jugar al fútbol",
                "李明華不常踢足球 — Li Minghua no juega al fútbol muy seguido"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "相 (xiāng - imagen)"
                },
                {
                    "type": "text",
                    "value": "心 (xīn - corazón)"
                }
            ],
            "notas": "Contemplar una imagen en el corazón y desearla. Como auxiliar modal (想 + V) expresa intención voluntaria ('tener ganas de').",
            "ejemplos": [
                "今天晚上我想吃越南菜 — Esta noche tengo ganas de comer comida vietnamita",
                "美國電影、臺灣電影，我都想看 — Quiero ver tanto películas estadounidenses como taiwanesas"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "可 (kě - poder)"
                },
                {
                    "type": "text",
                    "value": "以 (yǐ - mediante)"
                }
            ],
            "notas": "Auxiliar modal de viabilidad y permiso: Sujeto + 可以 + Verbo ('se puede'). Negación prohibitiva: 不可以.",
            "ejemplos": [
                "看電影可以學中文 — Ver películas sirve para aprender chino / se puede aprender chino viendo cine",
                "月美覺得看臺灣電影可以學中文 — Yuemei piensa que viendo películas taiwanesas se puede aprender chino"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "𦥯 (xué - estudio)"
                },
                {
                    "type": "text",
                    "value": "子 (zǐ - hijo)"
                }
            ],
            "notas": "Un niño 子 bajo un techo escolar asimilando el conocimiento. Rige destrezas y materias: 學中文, 學游泳.",
            "ejemplos": [
                "我想學游泳，也想學打網球 — Quiero aprender a nadar y también aprender a jugar al tenis",
                "看電影可以學中文 — Ver películas ayuda a aprender chino"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
        },
        {
            "id": "id_l4_neng",
            "espanol": "Poder / Ser capaz de (capacidad física o circunstancial)",
            "tradicional": "能",
            "pinyin": "néng",
            "zhuyin": "ㄋㄥˊ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "月 (ròu - carne)"
                },
                {
                    "type": "text",
                    "value": "匕 (bǐ - cuchara/cuchillo)"
                }
            ],
            "notas": "Verbo modal que denota capacidad física intrínseca o posibilidad por circunstancias externas (distinto a 會 que indica destreza aprendida).",
            "ejemplos": [
                "這支舊手機不能上網。 — Este celular viejo no puede navegar por internet.",
                "你能幫我買一杯熱咖啡嗎？ — ¿Puedes ayudarme comprándome una taza de café caliente?"
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_shangwang",
            "espanol": "Navegar por internet / Conectarse a internet",
            "tradicional": "上網",
            "pinyin": "shàngwǎng",
            "zhuyin": "ㄕㄤˋ ㄨㄤˇ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "上 (shàng - arriba/subir)"
                },
                {
                    "type": "text",
                    "value": "網 (wǎng - red/malla)"
                }
            ],
            "notas": "Literalmente 'subir a la red'. Verbo separable que describe la acción de entrar o navegar en internet.",
            "ejemplos": [
                "我想上網買東西。 — Quiero conectarme a internet para comprar cosas.",
                "他的手機可以在這裡上網。 — Su celular puede conectarse a internet aquí."
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_mai_vender",
            "espanol": "Vender",
            "tradicional": "賣",
            "pinyin": "mài",
            "zhuyin": "ㄇㄞˋ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "士 (shì - erudito/caballero)"
                },
                {
                    "type": "text",
                    "value": "貝 (bèi - concha/dinero antiguo)"
                }
            ],
            "notas": "Vender (tono 4: mài). Tiene una cruz/erudito arriba. No confundir con 買 (mǎi - tono 3, comprar).",
            "ejemplos": [
                "請問你們賣熱咖啡嗎？ — Disculpe, ¿ustedes venden café caliente?",
                "這家店賣的手機很便宜。 — Los teléfonos que vende esta tienda son muy económicos."
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_bang",
            "espanol": "Ayudar / En favor de (por alguien)",
            "tradicional": "幫",
            "pinyin": "bāng",
            "zhuyin": "ㄅㄤ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "巾 (jīn - tela/paño)"
                },
                {
                    "type": "text",
                    "value": "邦 (bāng - nación/estado)"
                }
            ],
            "notas": "Significa ayudar a alguien o actuar como preposición de servicio: 幫 + Persona + Verbo (hacer algo por o en lugar de alguien).",
            "ejemplos": [
                "請幫我微波這個包子。 — Por favor ayúdame calentando este baozi en el microondas.",
                "他常幫朋友買好喝的茶。 — Él suele ayudar a sus amigos comprándoles té delicioso."
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_weibo",
            "espanol": "Calentar en microondas / Microondas",
            "tradicional": "微波",
            "pinyin": "wéibō",
            "zhuyin": "ㄨㄟˊ ㄅㄛ",
            "categoria": "verbo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "彳 (chì - paso)"
                },
                {
                    "type": "text",
                    "value": "氵 (shuǐ - agua)"
                },
                {
                    "type": "text",
                    "value": "皮 (pí - piel)"
                }
            ],
            "notas": "Microondas o calentar con microondas. En las tiendas de conveniencia taiwanesas (7-Eleven, FamilyMart) es la frase reina: '要微波嗎？'.",
            "ejemplos": [
                "老闆，請幫我微波一下。 — Jefe, por favor caliéntemelo un momento en el microondas.",
                "這個便當需要微波。 — Este bento necesita calentarse en microondas."
            ],
            "leccion": 4
        }
    ],
    "adverbios": [
        {
            "id": "a1",
            "espanol": "No (negación)",
            "tradicional": "不",
            "pinyin": "bù",
            "zhuyin": "ㄅㄨˋ",
            "categoria": "adverbio",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "不 (bù - negación)"
                }
            ],
            "notas": "Pictograma de una semilla bajo tierra que aún no brota. Cambia a 2º tono (bú) antes de otro 4º tono (不是 bú shì). Para negar 有 se usa 沒.",
            "ejemplos": [
                "我不是美國人 — Yo no soy estadounidense",
                "他不喝咖啡 — Él no toma café"
            ],
            "leccion": 1
        },
        {
            "id": "a2",
            "espanol": "Todos / Ambos",
            "tradicional": "都",
            "pinyin": "dōu",
            "zhuyin": "ㄉㄡ",
            "categoria": "adverbio",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "者 (zhě - persona)"
                },
                {
                    "type": "text",
                    "value": "阝 (yì - ciudad)"
                }
            ],
            "notas": "Representa a los habitantes reunidos en la ciudad. Se coloca siempre entre el sujeto plural y el verbo: Sujeto + 都 + Verbo.",
            "ejemplos": [
                "我們都愛臺灣 — Todos nosotros amamos Taiwán",
                "他們都不喝咖啡 — Ninguno de ellos toma café"
            ],
            "leccion": 2
        },
        {
            "espanol": "También",
            "tradicional": "也",
            "pinyin": "yě",
            "zhuyin": "ㄧㄝˇ",
            "categoria": "adverbio",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "乙 (yǐ - brote)"
                }
            ],
            "notas": "Representa un brote curvo que añade una rama. Siempre va tras el sujeto y antes del verbo: 我也是 (yo también soy). Si se combina con 都, va primero: 也都.",
            "ejemplos": [
                "我也是學生 — Yo también soy estudiante",
                "他也愛喝茶 — A él también le encanta tomar té"
            ],
            "id": "id_msk0pp4g_bdeqd",
            "fechaCreacion": "2026-08-08",
            "leccion": 3
        },
        {
            "espanol": "Muy / [Estabilizador predicativo para adjetivos]",
            "tradicional": "很",
            "pinyin": "hěn",
            "zhuyin": "ㄏㄣˇ",
            "categoria": "adverbio",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "彳 (chì - paso)"
                },
                {
                    "type": "text",
                    "value": "艮 (gèn - detener)"
                }
            ],
            "notas": "En Sujeto + 很 + Adjetivo actúa como estabilizador predicativo neutro obligatorio, sin implicar necesariamente grado superlativo.",
            "id": "id_mtjnbg7d_2ozn7",
            "fechaCreacion": "2026-09-02",
            "ejemplos": [
                "他很好 — Él está muy bien / es bueno",
                "這張照片很漂亮 — Esta foto es muy linda",
                "這本書很貴 — Este libro es muy caro"
            ],
            "leccion": 1
        },
        {
            "id": "id_mty032_mei",
            "espanol": "No (negación de haber/tener o pasado)",
            "tradicional": "沒",
            "pinyin": "méi",
            "zhuyin": "ㄇㄟˊ",
            "categoria": "adverbio",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_agua_1786603351443"
                },
                {
                    "type": "text",
                    "value": "殳 (shū - arma)"
                }
            ],
            "notas": "Representa sumergirse y desaparecer en el agua. Negación obligatoria del verbo 有 (沒有 = no tener/haber) y de acciones completadas.",
            "ejemplos": [
                "我沒有書 — No tengo libros",
                "他沒有照片 — Él no tiene fotos"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_voc_feichang",
            "espanol": "Extremadamente / Muy muy / Extraordinario",
            "tradicional": "非常",
            "pinyin": "fēicháng",
            "zhuyin": "ㄈㄟ ㄔㄤˊ",
            "categoria": "adverbio",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "非 (fēi - no)"
                },
                {
                    "type": "text",
                    "value": "常 (cháng - común)"
                }
            ],
            "notas": "Etimológicamente 'fuera de lo común'. Adverbio de grado intenso superior a 很, colocado antes de adjetivos o verbos psicológicos.",
            "ejemplos": [
                "國畫課非常有趣 — La clase de pintura tradicional china es sumamente divertida",
                "他非常想去臺灣學中文 — Él desea enormemente ir a Taiwán a estudiar chino"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_henduo",
            "espanol": "Muchos / Muchas / Abundante (很多 + N)",
            "tradicional": "很多",
            "pinyin": "hěn duō",
            "zhuyin": "ㄏㄣˇ ㄉㄨㄛ",
            "categoria": "adverbio",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjnbg7d_2ozn7"
                },
                {
                    "type": "ref",
                    "id": "id_mty023_duo"
                }
            ],
            "notas": "Frase cuantitativa que antecede directamente al sustantivo sin requerir clasificador intermedio: 很多人, 很多問題.",
            "ejemplos": [
                "我們學校有很多外國學生 — Nuestra escuela tiene muchos alumnos extranjeros",
                "他有很多漂亮的照片 — Él tiene muchas fotos hermosas"
            ],
            "fechaCreacion": "2026-09-27"
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
                    "value": "現 (xiàn - presente)"
                },
                {
                    "type": "text",
                    "value": "在 (zài - estar)"
                }
            ],
            "notas": "Jade que brilla y se hace visible en el presente. Marco temporal para 'en este momento', colocado antes del verbo.",
            "ejemplos": [
                "現在幾點？ — ¿Qué hora es ahora?",
                "我現在要去教室 — Ahora voy al salón de clases"
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
                    "value": "再 (zài - otra vez)"
                }
            ],
            "notas": "Simboliza una segunda estructura superpuesta. Expresa la repetición de una acción hacia el futuro: 請再說一次 (dilo otra vez).",
            "ejemplos": [
                "請再說一次 — Por favor repítalo una vez más",
                "歡迎再來 — Bienvenidos nuevamente"
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
                    "value": "怎 (zěn - cómo)"
                },
                {
                    "type": "text",
                    "value": "麼 (me - sufijo)"
                }
            ],
            "notas": "Interroga el método, modo o instrumento para ejecutar una acción: S + 怎麼 + Verbo (ej. 怎麼去 = ¿cómo ir?).",
            "ejemplos": [
                "請問，怎麼去圖書館？ — Disculpe, ¿cómo se va a la biblioteca?",
                "你怎麼來學校？ — ¿Cómo vienes a la escuela?"
            ],
            "fechaCreacion": "2026-09-28"
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
                    "value": "巾 (jīn - tela)"
                },
                {
                    "type": "text",
                    "value": "尚 (shàng - noble)"
                }
            ],
            "notas": "Una vestidura usada con regularidad. Adverbio preverbal de hábito o frecuencia (S + 常 + V). Su negación es 不常 (rara vez).",
            "ejemplos": [
                "我常打籃球，也常踢足球 — A menudo juego al baloncesto y también suelo jugar al fútbol",
                "王開文常喝茶 — Kaiwen Wang bebe té a menudo"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "起 (qǐ - levantarse)"
                }
            ],
            "notas": "Levantarse y ponerse en marcha como una sola unidad. Se coloca antes del verbo para indicar acción compartida: 我們一起看書.",
            "ejemplos": [
                "晚上要不要一起吃晚飯？ — ¿Quieres que cenemos juntos esta noche?",
                "週末我們要不要一起看書？ — ¿Leemos libros juntos el fin de semana?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
        },
        {
            "id": "id_l4_yigong",
            "espanol": "En total / En conjunto",
            "tradicional": "一共",
            "pinyin": "yígòng",
            "zhuyin": "ㄧˊ ㄍㄨㄥˋ",
            "categoria": "adverbio",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "一 (yī - uno)"
                },
                {
                    "type": "text",
                    "value": "共 (gòng - juntos/común)"
                }
            ],
            "notas": "Indica suma global o total acumulado. Imprescindible para pedir la cuenta o calcular compras (一共多少錢？).",
            "ejemplos": [
                "三杯熱茶一共一百五十塊。 — Tres tazas de té caliente son en total ciento cincuenta dólares.",
                "我們一共五個人去看電影。 — En total fuimos cinco personas a ver la película."
            ],
            "leccion": 4
        }
    ],
    "expresiones": [
        {
            "id": "e1",
            "espanol": "Hola",
            "tradicional": "你好",
            "pinyin": "nǐhǎo",
            "zhuyin": "ㄋㄧˇ ㄏㄠˇ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "p2"
                },
                {
                    "type": "ref",
                    "id": "id_mtvg8jtu_74jmp"
                }
            ],
            "notas": "Por sandhi tonal, cuando dos 3º tonos se unen, 你 cambia a 2º tono (ní hǎo). Registro respetuoso: 您好.",
            "ejemplos": [
                "你好！我是陳月美 — ¡Hola! Soy Chen Yuemei",
                "你好，很高興認識你 — Hola, encantado de conocerte"
            ],
            "leccion": 1
        },
        {
            "id": "e2",
            "espanol": "Adiós",
            "tradicional": "再見",
            "pinyin": "zàijiàn",
            "zhuyin": "ㄗㄞˋ ㄐㄧㄢˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "再 (zài - otra vez)"
                },
                {
                    "type": "text",
                    "value": "見 (jiàn - ver)"
                }
            ],
            "notas": "Etimológicamente 'vernos de nuevo'. Despedida general por excelencia en mandarín.",
            "ejemplos": [
                "老師，再見！ — ¡Profesor, hasta luego!",
                "大家再見！ — ¡Adiós a todos!"
            ]
        },
        {
            "espanol": "Y",
            "tradicional": "和",
            "pinyin": "hé",
            "zhuyin": "ㄏㄢˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "禾 (hé - cereal)"
                },
                {
                    "type": "text",
                    "value": "口 (kǒu - boca)"
                }
            ],
            "notas": "Conjunción copulativa que SOLO enlaza sustantivos o pronombres (我和你). Nunca conecta verbos ni oraciones completas.",
            "id": "id_mspmr8gz_rjl1e",
            "fechaCreacion": "2026-08-12",
            "ejemplos": [
                "我和你 — Tú y yo",
                "我有貓和狗 — Tengo gato y perro"
            ],
            "leccion": 3
        },
        {
            "espanol": "Qué",
            "tradicional": "什麼",
            "pinyin": "shénme",
            "zhuyin": "ㄕㄣˊ ㄇㄜ˙",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "ref",
                    "id": "id_mtfikvkd_74gu4"
                },
                {
                    "type": "text",
                    "value": "麼 (me - sufijo)"
                }
            ],
            "notas": "Pronombre interrogativo ('qué'). En la oración ocupa exactamente el lugar sintáctico donde iría la respuesta: 你喝什麼？",
            "id": "id_msr4dv0n_cd6pn",
            "fechaCreacion": "2026-08-13",
            "ejemplos": [
                "你要喝什麼？ — ¿Qué quieres beber?",
                "你叫什麼名字？ — ¿Cómo te llamas?"
            ],
            "leccion": 1
        },
        {
            "espanol": "Quién",
            "tradicional": "誰",
            "pinyin": "shéi",
            "zhuyin": "ㄕㄟˊ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "言 (yán - palabra)"
                },
                {
                    "type": "text",
                    "value": "隹 (zhuī - ave)"
                }
            ],
            "notas": "Pronombre interrogativo ('quién'). En habla formal también se pronuncia shuí. Ocupa el puesto de sujeto u objeto: 他是誰？",
            "id": "id_mtffp8dh_iku4e",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "他是誰？ — ¿Quién es él?",
                "那是誰的書？ — ¿De quién es ese libro?"
            ],
            "leccion": 2
        },
        {
            "espanol": "Cuál",
            "tradicional": "哪",
            "pinyin": "nǎ",
            "zhuyin": "ㄋㄚˇ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "口 (kǒu - boca)"
                },
                {
                    "type": "ref",
                    "id": "id_msk0mdne_r4neq"
                }
            ],
            "notas": "Lleva boca 口 interrogativa junto a 那. Ante clasificador se pronuncia comúnmente něi: 哪本書？, 哪國人？",
            "id": "id_mtfgbr1v_3z8nx",
            "fechaCreacion": "2026-08-30",
            "ejemplos": [
                "你是哪國人？ — ¿De qué país eres?",
                "哪張照片是你的？ — ¿Cuál foto es tuya?"
            ],
            "leccion": 1
        },
        {
            "espanol": "Cuántos (Menor a 10 unidades)",
            "tradicional": "幾",
            "pinyin": "jǐ",
            "zhuyin": "ㄐㄧˇ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "幺 (yāo - hilo)"
                },
                {
                    "type": "text",
                    "value": "戈 (gē - lanza)"
                }
            ],
            "notas": "Pregunta por cantidades reducidas (habitualmente menos de 10). Estructura obligatoria: 幾 + Clasificador + Sustantivo.",
            "id": "id_mtgn0eti_2z3vp",
            "fechaCreacion": "2026-08-31",
            "ejemplos": [
                "你有幾張照片？ — ¿Cuántas fotos tienes?",
                "你有幾個兄弟？ — ¿Cuántos hermanos varones tienes?"
            ],
            "leccion": 2
        },
        {
            "espanol": "Gracias",
            "tradicional": "謝謝",
            "pinyin": "xièxie",
            "zhuyin": "ㄒㄧㄝˋ ˙ㄒㄧㄝ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "言 (yán - palabra)"
                },
                {
                    "type": "text",
                    "value": "射 (shè - disparar)"
                }
            ],
            "notas": "Palabras de gratitud proyectadas hacia el otro. La duplicación atenúa el tono; el segundo carácter es neutro (xièxie).",
            "id": "id_mth0xr8v_bdnhu",
            "fechaCreacion": "2026-08-31",
            "ejemplos": [
                "謝謝你的茶 — Gracias por tu té",
                "謝謝大家 — Gracias a todos"
            ],
            "leccion": 1
        },
        {
            "espanol": "De nada",
            "tradicional": "不客氣",
            "pinyin": "bù kèqì",
            "zhuyin": "ㄅㄨˊ ㄎㄜˋ ㄑㄧˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "a1"
                },
                {
                    "type": "text",
                    "value": "客 (kè - huésped)"
                },
                {
                    "type": "text",
                    "value": "氣 (qì - modales)"
                }
            ],
            "notas": "Literalmente 'no actúes ceremonioso como un huésped'. Respuesta cortés estándar ante 謝謝.",
            "id": "id_mth0z0bf_1gpqj",
            "fechaCreacion": "2026-08-31",
            "ejemplos": [
                "謝謝你！ — 不客氣！ — ¡Muchas gracias! — ¡De nada!"
            ],
            "leccion": 1
        },
        {
            "espanol": "¿Puedo preguntar?",
            "tradicional": "請問",
            "pinyin": "qǐngwèn",
            "zhuyin": "ㄑㄧㄥˇ ㄨㄣˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtvh6q8e_qg8ox"
                },
                {
                    "type": "text",
                    "value": "問 (wèn - preguntar)"
                }
            ],
            "notas": "Fórmula de máxima cortesía al inicio de una consulta: 'Disculpe, ¿puedo preguntar...?': 請問，你姓什麼？",
            "id": "id_mtvh2939_yzopt",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "請問，你是哪國人？ — Disculpe, ¿de qué país es usted?",
                "請問，這張照片是誰的？ — Disculpe, ¿de quién es esta foto?"
            ],
            "leccion": 1
        },
        {
            "espanol": "Correcto",
            "tradicional": "對",
            "pinyin": "duì",
            "zhuyin": "ㄉㄨㄟˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "丵 (zhuó - hierba)"
                },
                {
                    "type": "text",
                    "value": "寸 (cùn - pulgada)"
                }
            ],
            "notas": "Medir con la regla 寸 para asegurar exactitud. Interjección de conformidad: '¡correcto!' / '¡así es!'. Negación: 不對.",
            "id": "id_mtviiuc4_o7je6",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "對，我是學生 — Correcto, soy estudiante",
                "你說得對 — Dices la verdad / Tienes razón"
            ]
        },
        {
            "id": "id_mty014_duibuqi",
            "espanol": "Lo siento / Disculpa / Perdón",
            "tradicional": "對不起",
            "pinyin": "duìbùqǐ",
            "zhuyin": "ㄉㄨㄟˋ ㄅㄨˋ ㄑㄧˇ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtviiuc4_o7je6"
                },
                {
                    "type": "ref",
                    "id": "a1"
                },
                {
                    "type": "text",
                    "value": "起 (qǐ - levantar)"
                }
            ],
            "notas": "Literalmente 'no puedo mirarte cara a cara con rectitud'. Disculpa común; respuesta habitual: 沒關係 (méi guānxi).",
            "ejemplos": [
                "對不起，我不喝咖啡 — Lo siento, no tomo café"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty008_shide",
            "espanol": "Sí / Así es",
            "tradicional": "是的",
            "pinyin": "shìde",
            "zhuyin": "ㄕˋ ㄉㄜ˙",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "v1"
                },
                {
                    "type": "ref",
                    "id": "id_msk1glsh_kfv6m"
                }
            ],
            "notas": "Fórmula afirmativa de ratificación cortés: 'sí, ciertamente es así'.",
            "ejemplos": [
                "是的，我是學生 — Sí, soy estudiante",
                "是的，他是王先生 — Sí, él es el señor Wang"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty012_naguo",
            "espanol": "¿Qué país? / ¿De qué país?",
            "tradicional": "哪國",
            "pinyin": "nǎguó",
            "zhuyin": "ㄋㄚˇ ㄍㄨㄛˊ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtfgbr1v_3z8nx"
                },
                {
                    "type": "text",
                    "value": "國 (guó - país)"
                }
            ],
            "notas": "Construcción interrogativa fija para consultar procedencia y nacionalidad: 你是哪國人？ (¿De qué país eres?).",
            "ejemplos": [
                "你是哪國人？ — ¿De qué país eres?",
                "他是哪國人？ — ¿De qué país es él?"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty027_qingjin",
            "espanol": "¡Adelante! / ¡Pase, por favor!",
            "tradicional": "請進",
            "pinyin": "qǐngjìn",
            "zhuyin": "ㄑㄧㄥˇ ㄐㄧㄣˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtvh6q8e_qg8ox"
                },
                {
                    "type": "text",
                    "value": "進 (jìn - entrar)"
                }
            ],
            "notas": "Hospitalidad tradicional para franquear el paso a un visitante: '¡adelante, pase por favor!'.",
            "ejemplos": [
                "請進，請坐 — Por favor pase, tome asiento"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_voc_woyaowenwenti",
            "espanol": "Quiero hacer una pregunta",
            "tradicional": "我要問問題",
            "pinyin": "wǒ yào wèn wèntí",
            "zhuyin": "ㄨㄛˇ ㄧㄠˋ ㄨㄣˋ ㄨㄣˋ ㄊㄧˊ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "p1"
                },
                {
                    "type": "ref",
                    "id": "id_mtvifgj8_j51mk"
                },
                {
                    "type": "ref",
                    "id": "id_voc_wenti"
                }
            ],
            "notas": "Frase formal de aula para solicitar el turno de palabra al docente o en conferencia.",
            "ejemplos": [
                "老師，我要問問題 — Profesor, quiero hacer una pregunta",
                "請問，我要問一個問題 — Disculpe, quisiera hacer una pregunta"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_haolema",
            "espanol": "¿Estás listo? / ¿Ya está listo?",
            "tradicional": "好了嗎？",
            "pinyin": "hǎo le ma?",
            "zhuyin": "ㄏㄠˇ ˙ㄌㄜ ˙ㄇㄚ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtvg8jtu_74jmp"
                },
                {
                    "type": "text",
                    "value": "了 (le - culminación)"
                },
                {
                    "type": "ref",
                    "id": "id_msm98kaa_25bw4"
                }
            ],
            "notas": "Pregunta coloquial para verificar si el interlocutor ha concluido una tarea o está preparado para comenzar.",
            "ejemplos": [
                "大家都好了嗎？ — ¿Ya están todos listos?",
                "好了嗎？我們要出發了 — ¿Estás listo? Ya vamos a salir"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_qingzaishuoyici",
            "espanol": "Por favor repítalo una vez más",
            "tradicional": "請再說一次",
            "pinyin": "qǐng zài shuō yí cì",
            "zhuyin": "ㄑㄧㄥˇ ㄗㄞˋ ㄕㄨㄛ ㄧˊ ㄘˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtvh6q8e_qg8ox"
                },
                {
                    "type": "text",
                    "value": "再 (zài - otra vez)"
                },
                {
                    "type": "ref",
                    "id": "id_voc_shuo"
                },
                {
                    "type": "ref",
                    "id": "id_mtfhl7d1_9g4op"
                }
            ],
            "notas": "Petición cortés indispensable para solicitar que se repita una frase no comprendida con claridad.",
            "ejemplos": [
                "對不起，請再說一次 — Disculpe, por favor dígalo una vez más",
                "老師，請再說一次好嗎？ — Profesor, ¿podría por favor repetirlo una vez más?"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xiagelibaijian",
            "espanol": "Nos vemos la próxima semana",
            "tradicional": "下個禮拜見",
            "pinyin": "xià ge lǐbài jiàn",
            "zhuyin": "ㄒㄧㄚˋ ˙ㄍㄜ ㄌㄧˇ ㄅㄞˋ ㄐㄧㄢˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "下 (xià - posterior)"
                },
                {
                    "type": "text",
                    "value": "見 (jiàn - ver)"
                }
            ],
            "notas": "Despedida habitual de los viernes o al cerrar el ciclo semanal de lecciones.",
            "ejemplos": [
                "老師再見，下個禮拜見！ — ¡Adiós profesor, nos vemos la próxima semana!",
                "下個禮拜見，週末愉快 — Nos vemos la próxima semana, ¡buen fin de semana!"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_mingtianjian",
            "espanol": "Nos vemos mañana",
            "tradicional": "明天見",
            "pinyin": "míngtiān jiàn",
            "zhuyin": "ㄇㄧㄥˊ ㄊㄧㄢ ㄐㄧㄢˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_voc_mingtian"
                },
                {
                    "type": "text",
                    "value": "見 (jiàn - ver)"
                }
            ],
            "notas": "Despedida estándar cuando el reencuentro ocurrirá al día siguiente.",
            "ejemplos": [
                "下課了，明天見！ — ¡Terminó la clase, nos vemos mañana!",
                "明天見，晚安 — Nos vemos mañana, ¡buenas noches!"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_chibaolema",
            "espanol": "¿Ya comiste? / ¿Quedaste satisfecho? (saludo)",
            "tradicional": "吃飽了嗎？",
            "pinyin": "chī bǎo le ma?",
            "zhuyin": "ㄔ ㄅㄠˇ ˙ㄌㄜ ˙ㄇㄚ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mspmonrk_kj3kn"
                },
                {
                    "type": "text",
                    "value": "飽 (bǎo - lleno)"
                },
                {
                    "type": "ref",
                    "id": "id_msm98kaa_25bw4"
                }
            ],
            "notas": "Saludo tradicional de afecto y cortesía en Taiwán equivalente a interesarse por el bienestar del otro. Respuesta: 吃了.",
            "ejemplos": [
                "張先生，吃飽了嗎？ — Señor Zhang, ¿ya comió?",
                "你吃飽了嗎？我們一起去散步 — ¿Ya terminaste de comer? Vamos a caminar juntos"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_nichilema",
            "espanol": "¿Ya comiste? (saludo)",
            "tradicional": "你吃了嗎？",
            "pinyin": "nǐ chī le ma?",
            "zhuyin": "ㄋㄧˇ ㄔ ˙ㄌㄜ ˙ㄇㄚ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "p2"
                },
                {
                    "type": "ref",
                    "id": "id_mspmonrk_kj3kn"
                },
                {
                    "type": "ref",
                    "id": "id_msm98kaa_25bw4"
                }
            ],
            "notas": "Variante directa y cercana del saludo tradicional sobre la comida entre amigos y compañeros.",
            "ejemplos": [
                "李小姐，你吃了嗎？ — Señorita Li, ¿ya comió?",
                "你吃了嗎？還沒的話我們一起吃 — ¿Ya comiste? Si todavía no, comamos juntos"
            ],
            "fechaCreacion": "2026-09-27"
        },
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
                    "value": "故 (gù - causa)"
                },
                {
                    "type": "ref",
                    "id": "id_msr4m3d5_07106"
                }
            ],
            "notas": "Pregunta por la actividad o motivo de una acción: 你去教室做什麼？ (¿A qué vas al aula?).",
            "ejemplos": [
                "你去教室做什麼？ — ¿A qué vas al salón de clases?",
                "你在做什麼？ — ¿Qué estás haciendo?"
            ],
            "fechaCreacion": "2026-09-28",
            "leccion": 3
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
                    "value": "時 (shí - tiempo)"
                },
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "矢 (shǐ - flecha)"
                }
            ],
            "notas": "Fórmula interrogativa temporal que se sitúa antes del verbo: 你什麼時候下課？ (¿Cuándo terminas la clase?).",
            "ejemplos": [
                "你什麼時候下課？ — ¿Cuándo sales de clase?",
                "你們什麼時候去學校？ — ¿Cuándo van a la escuela?"
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
            "notas": "Pregunta directa para consultar la hora en punto del reloj: 現在幾點？ (¿Qué hora es ahora?).",
            "ejemplos": [
                "請問，現在幾點？ — Disculpe, ¿qué hora es ahora?",
                "你幾點去學校？ — ¿A qué hora vas a la escuela?"
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
            "notas": "Estructura de verbo y objeto cognado (preguntar preguntas) para plantear dudas en clase.",
            "ejemplos": [
                "老師，我要問問題 — Profesor/a, quiero hacer una pregunta",
                "有問題可以問老師 — Si tienen dudas pueden preguntarle al profesor"
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
                    "value": "一 (yī - uno)"
                },
                {
                    "type": "ref",
                    "id": "id_clf_ci"
                }
            ],
            "notas": "Complemento de frecuencia que se pospone al verbo: 請再說一次 (dilo una vez más); 一天一次 (una vez al día).",
            "ejemplos": [
                "請再說一次 — Por favor repítalo una vez más",
                "我一天吃一次蘋果 — Como manzana una vez al día"
            ],
            "fechaCreacion": "2026-09-28"
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
                    "value": "怎 (zěn - cómo)"
                },
                {
                    "type": "text",
                    "value": "麼 (me - sufijo)"
                },
                {
                    "type": "text",
                    "value": "樣 (yàng - aspecto)"
                }
            ],
            "notas": "Al cierre de una propuesta recaba la conformidad del interlocutor ('¿qué tal? / ¿qué te parece?').",
            "ejemplos": [
                "我們週末去打籃球，怎麼樣？ — ¿Qué tal si vamos a jugar al baloncesto el fin de semana?",
                "你覺得這張照片怎麼樣？ — ¿Qué te parece esta foto?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "好 (hǎo - bueno)"
                }
            ],
            "notas": "Aceptación cordial y entusiasta ante una propuesta o invitación cotidiana: '¡vale!' / '¡por supuesto!'.",
            "ejemplos": [
                "我們看臺灣電影吧！好啊！ — ¡Veamos cine taiwanés! ¡Claro que sí!",
                "晚上要不要一起吃晚飯？好啊！ — ¿Cenamos juntos esta noche? ¡De acuerdo!"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "好 (hǎo - bueno)"
                }
            ],
            "notas": "Fórmula disyuntiva afirmativa-negativa colocada al final para buscar consenso amable sobre un plan.",
            "ejemplos": [
                "今天晚上我們去看電影，好不好？ — Vamos al cine esta noche, ¿te parece bien?",
                "我們週末晚上去看電影，好不好？ — ¿Vamos al cine el fin de semana por la noche, qué tal?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
        },
        {
            "id": "id_l4_haode",
            "espanol": "De acuerdo / Está bien / Vale",
            "tradicional": "好的",
            "pinyin": "hǎo de",
            "zhuyin": "ㄏㄠˇ ˙ㄉㄜ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "好 (hǎo - bueno)"
                },
                {
                    "type": "text",
                    "value": "的 (de - posesión/afirmación)"
                }
            ],
            "notas": "Respuesta cotidiana cortés de confirmación y conformidad ('Muy bien', 'De acuerdo', 'Entendido').",
            "ejemplos": [
                "好的，馬上為您準備。 — De acuerdo, enseguida se lo preparo.",
                "好的，我們明天早上見。 — Muy bien, nos vemos mañana por la mañana."
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_duoshao",
            "espanol": "¿Cuánto? / ¿Cuántos?",
            "tradicional": "多少",
            "pinyin": "duōshǎo",
            "zhuyin": "ㄉㄨㄛ ㄕㄠˇ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "多 (duō - mucho)"
                },
                {
                    "type": "text",
                    "value": "少 (shǎo - poco)"
                }
            ],
            "notas": "Palabra interrogativa para cantidades indefinidas o mayores a 10. Especialmente usada con 錢: 多少錢？ (¿Cuánto cuesta?).",
            "ejemplos": [
                "老闆，這支手機多少錢？ — Jefe, ¿cuánto cuesta este celular?",
                "請問一共多少錢？ — Disculpe, ¿cuánto es en total?"
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_waidai",
            "espanol": "Para llevar (comida o bebida)",
            "tradicional": "外帶",
            "pinyin": "wàidài",
            "zhuyin": "ㄨㄞˋ ㄉㄞˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "外 (wài - afuera/exterior)"
                },
                {
                    "type": "text",
                    "value": "帶 (dài - llevar/cinturón)"
                }
            ],
            "notas": "Para llevar. Pregunta típica en todos los comercios gastronómicos taiwaneses: '內用還是外帶？' (¿Para aquí o para llevar?).",
            "ejemplos": [
                "我要外帶兩杯大杯熱咖啡。 — Quiero dos tazas grandes de café caliente para llevar.",
                "老闆，這三個包子外帶，謝謝！ — ¡Jefe, estos tres baozis para llevar, gracias!"
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_neiyong",
            "espanol": "Para comer aquí / Consumir en el local",
            "tradicional": "內用",
            "pinyin": "nèiyòng",
            "zhuyin": "ㄋㄟˋ ㄩㄥˋ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "內 (nèi - dentro/interior)"
                },
                {
                    "type": "text",
                    "value": "用 (yòng - usar/consumir)"
                }
            ],
            "notas": "Consumir dentro del restaurante o cafetería. Contraparte directa de 外帶 (para llevar).",
            "ejemplos": [
                "我們兩個人要內用。 — Nosotros dos vamos a comer aquí en el local.",
                "請問您要內用還是外帶？ — ¿Desea consumir en el local o para llevar?"
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_weishenme",
            "espanol": "¿Por qué?",
            "tradicional": "為什麼",
            "pinyin": "wèishénme",
            "zhuyin": "ㄨㄟˋ ㄕㄣˊ ˙ㄇㄜ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "為 (wèi - por/causa)"
                },
                {
                    "type": "text",
                    "value": "什 (shén - qué)"
                },
                {
                    "type": "text",
                    "value": "麼 (me - sufijo interrogativo)"
                }
            ],
            "notas": "Pronombre interrogativo que pregunta la causa o motivo. Se responde generalmente con 因為... (porque...).",
            "ejemplos": [
                "你為什麼想買那支新手機？ — ¿Por qué quieres comprar ese teléfono nuevo?",
                "你為什麼不喜歡喝烏龍茶？ — ¿Por qué no te gusta tomar té Oolong?"
            ],
            "leccion": 4
        },
        {
            "id": "id_l4_tai_le",
            "espanol": "Demasiado... / Extremadamente...",
            "tradicional": "太…了",
            "pinyin": "tài...le",
            "zhuyin": "ㄊㄞˋ ... ˙ㄌㄜ",
            "categoria": "expresion",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "大 (dà - grande)"
                },
                {
                    "type": "text",
                    "value": "丶 (diǎn - punto)"
                },
                {
                    "type": "text",
                    "value": "了 (le - partícula de cambio/exceso)"
                }
            ],
            "notas": "Patrón enfático de grado superlativo o exceso: 太 + Adjetivo + 了 (ej. 太貴了 = demasiado caro; 太好了 = ¡fantástico!).",
            "ejemplos": [
                "這支手機太貴了，我不想買。 — Este teléfono móvil es demasiado caro, no quiero comprarlo.",
                "太好了！明天我們一起去游泳。 — ¡Qué bien / genial! Mañana vamos a nadar juntos."
            ],
            "leccion": 4
        }
    ],
    "particulas": [
        {
            "id": "pt1",
            "espanol": "(sufijo plural)",
            "tradicional": "們",
            "pinyin": "men",
            "zhuyin": "ㄇㄣ˙",
            "categoria": "particula",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "門 (mén - puerta)"
                }
            ],
            "notas": "Persona 亻 junto a una puerta 門 que congrega a la multitud. Sufijo de plural para pronombres (我們, 你們, 他們) y personas.",
            "ejemplos": [
                "我們都是學生 — Todos nosotros somos estudiantes",
                "你們要喝什麼？ — ¿Qué quieren beber ustedes?"
            ]
        },
        {
            "espanol": "(sufijo de posesión)",
            "tradicional": "的",
            "pinyin": "de",
            "zhuyin": "ㄉㄜ˙",
            "categoria": "particula",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "白 (bái - blanco)"
                },
                {
                    "type": "text",
                    "value": "勺 (sháo - cuchara)"
                }
            ],
            "notas": "El blanco al centro de una diana. Partícula estructural de posesión (Poseedor + 的 + Sustantivo) y modificador adjetival en tono neutro.",
            "ejemplos": [
                "這是我的家 — Esta es mi casa",
                "那是我爸爸的照片 — Aquella es la foto de mi papá"
            ],
            "id": "id_msk1glsh_kfv6m",
            "fechaCreacion": "2026-08-08",
            "leccion": 2
        },
        {
            "espanol": "(modificador de pregunta)",
            "tradicional": "嗎",
            "pinyin": "ma",
            "zhuyin": "ㄇㄚ˙",
            "categoria": "particula",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "口 (kǒu - boca)"
                },
                {
                    "type": "text",
                    "value": "馬 (mǎ - caballo)"
                }
            ],
            "notas": "La boca pregunta y 馬 aporta el sonido ma. Se añade al final de cualquier afirmación para convertirla en pregunta de sí o no.",
            "id": "id_msm98kaa_25bw4",
            "fechaCreacion": "2026-08-09",
            "ejemplos": [
                "你好嗎？ — ¿Cómo estás?",
                "你要喝咖啡嗎？ — ¿Quieres tomar café?"
            ],
            "leccion": 1
        },
        {
            "id": "id_mty010_ne",
            "espanol": "¿Y...? / Partícula modal de rebote",
            "tradicional": "呢",
            "pinyin": "ne",
            "zhuyin": "ㄋㄜ˙",
            "categoria": "particula",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "口 (kǒu - boca)"
                },
                {
                    "type": "text",
                    "value": "尼 (ní - monja)"
                }
            ],
            "notas": "Partícula modal elíptica de rebote en tono neutro para devolver la pregunta en curso: 你呢？ (¿Y tú?).",
            "ejemplos": [
                "我是老師，你呢？ — Yo soy profesor, ¿y tú?",
                "他呢？ — ¿Y él?"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
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
                    "value": "阿 (ē - colina)"
                }
            ],
            "notas": "Partícula final en tono neutro que aporta calidez, entusiasmo o suavidad al enunciado (好啊！ = ¡claro que sí!).",
            "ejemplos": [
                "好啊！ — ¡Claro que sí! / ¡De acuerdo!",
                "這是什麼茶？烏龍茶啊！ — ¿Qué té es este? ¡Pues té Oolong!"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "還 (hái - aún)"
                },
                {
                    "type": "text",
                    "value": "是 (shì - ser)"
                }
            ],
            "notas": "Conjunción disyuntiva ('¿o?') exclusiva para preguntas con alternativas (¿A 還是 B?). En afirmaciones se utiliza 或者 (huòzhě).",
            "ejemplos": [
                "妳想看美國電影還是臺灣電影？ — ¿Quieres ver una película estadounidense o una taiwanesa?",
                "今天晚上我們吃越南菜還是臺灣菜？ — ¿Esta noche comemos comida vietnamita o comida taiwanesa?"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
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
                    "value": "巴 (bā - serpiente)"
                }
            ],
            "notas": "Partícula final en tono neutro que convierte una idea en sugerencia amable o invitación compartida: 我們走吧 (vamos).",
            "ejemplos": [
                "我們看臺灣電影吧！ — ¡Veamos una película taiwanesa!",
                "今天晚上我們吃越南菜吧！ — ¡Cenemos comida vietnamita esta noche!"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
        }
    ],
    "estructuras": [
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
        },
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
    "meta": {
        "version": "2.4.0",
        "ultimaEdicion": "2026-09-27"
    },
    "adjetivos": [
        {
            "espanol": "Este / Esto / Esta",
            "tradicional": "這",
            "pinyin": "zhè",
            "zhuyin": "ㄓㄜˋ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "辶 (chuò - caminar)"
                },
                {
                    "type": "text",
                    "value": "言 (yán - palabra)"
                }
            ],
            "notas": "Demostrativo de proximidad. Ante clasificadores se pronuncia frecuentemente zhèi en habla coloquial: 這個人, 這張照片.",
            "ejemplos": [
                "這是我的家 — Esta es mi casa",
                "這張照片很漂亮 — Esta foto es muy hermosa"
            ],
            "id": "id_msk0jitk_kr6cx",
            "fechaCreacion": "2026-08-08",
            "leccion": 1
        },
        {
            "espanol": "Ese / Esa / Eso",
            "tradicional": "那",
            "pinyin": "nà",
            "zhuyin": "ㄋㄚˋ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "冉 (rǎn - barba)"
                },
                {
                    "type": "text",
                    "value": "阝 (yì - ciudad)"
                }
            ],
            "notas": "Demostrativo de lejanía. Ante clasificadores se pronuncia comúnmente nèi en el habla cotidiana: 那個人, 那本書.",
            "ejemplos": [
                "那是他的房子 — Aquella es su casa",
                "那是誰的照片？ — ¿De quién es esa foto?"
            ],
            "id": "id_msk0mdne_r4neq",
            "fechaCreacion": "2026-08-08",
            "leccion": 4
        },
        {
            "espanol": "Pequeño",
            "tradicional": "小",
            "pinyin": "xiǎo",
            "zhuyin": "ㄒㄧㄠˇ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "小 (xiǎo - pequeño)"
                }
            ],
            "notas": "Pictograma de tres diminutas partículas divididas. Antónimo directo de 大 (dà).",
            "id": "id_mtjn1fxk_bdhc0",
            "fechaCreacion": "2026-09-02",
            "ejemplos": [
                "那隻貓很小 — Ese gato es muy pequeño",
                "小心！ — ¡Cuidado!",
                "那間教室很小 — Aquella aula es muy pequeña"
            ],
            "leccion": 4
        },
        {
            "espanol": "Grande",
            "tradicional": "大",
            "pinyin": "dà",
            "zhuyin": "ㄉㄚˋ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "大 (dà - grande)"
                }
            ],
            "notas": "Pictograma frontal de un ser humano con brazos y piernas abiertos ocupando espacio. Antónimo de 小 (xiǎo).",
            "id": "id_mtjn41m4_7ohc2",
            "fechaCreacion": "2026-09-02",
            "ejemplos": [
                "這棟房子很大 — Esta casa es muy grande",
                "大人 — Adulto",
                "這間教室很大 — Esta aula es muy grande"
            ],
            "leccion": 4
        },
        {
            "espanol": "Mediano / Centro",
            "tradicional": "中",
            "pinyin": "zhōng",
            "zhuyin": "ㄓㄨㄥ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "中 (zhōng - centro)"
                }
            ],
            "notas": "Pictograma de una flecha clavada en el centro exacto de un blanco. Base de 中國 (China) y 中文 (idioma chino).",
            "id": "id_mtjn2p70_9qg74",
            "fechaCreacion": "2026-09-02",
            "ejemplos": [
                "中國 — China",
                "中午 — Mediodía"
            ],
            "leccion": 4
        },
        {
            "espanol": "Cuidado",
            "tradicional": "小心",
            "pinyin": "xiǎoxīn",
            "zhuyin": "ㄒㄧㄠˇ ㄒㄧㄣ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtjn1fxk_bdhc0"
                },
                {
                    "type": "ref",
                    "id": "id_mtlt07kj_ddod0"
                }
            ],
            "notas": "Mnemotecnia: mantener el corazón atento a los pequeños detalles para no tropezar. Expresión habitual: 請小心 (ten cuidado).",
            "id": "id_mtlt4lvg_tyx86",
            "fechaCreacion": "2026-09-03"
        },
        {
            "espanol": "Bueno",
            "tradicional": "好",
            "pinyin": "hǎo",
            "zhuyin": "ㄏㄠˇ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_mujer_1786603351443"
                },
                {
                    "type": "text",
                    "value": "子 (zǐ - hijo)"
                }
            ],
            "notas": "Una madre 女 con su hijo 子 en brazos simbolizando armonía. Ante verbos denota placer sensorial: 好看 (lindo), 好吃 (rico).",
            "id": "id_mtvg8jtu_74jmp",
            "fechaCreacion": "2026-09-10",
            "ejemplos": [
                "你好 — Hola",
                "烏龍茶很好喝 — El té Oolong es muy rico",
                "好，我們走 — Bien, vámonos"
            ],
            "leccion": 1
        },
        {
            "id": "id_mty009_haohe",
            "espanol": "Rico / Sabroso (para bebidas)",
            "tradicional": "好喝",
            "pinyin": "hǎohē",
            "zhuyin": "ㄏㄠˇ ㄏㄜ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtvg8jtu_74jmp"
                },
                {
                    "type": "ref",
                    "id": "id_msr421dy_83jqz"
                }
            ],
            "notas": "Compuesto por 好 (bueno) y 喝 (beber). Se aplica exclusivamente al sabor agradable de líquidos y bebidas (té, café, zumos).",
            "ejemplos": [
                "臺灣烏龍茶很好喝 — El té Oolong de Taiwán es muy rico",
                "咖啡好喝嗎？ — ¿El café está rico?"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 1
        },
        {
            "id": "id_mty021_piaoliang",
            "espanol": "Bonito/a / Hermoso/a / Lindo/a",
            "tradicional": "漂亮",
            "pinyin": "piàoliang",
            "zhuyin": "ㄆㄧㄠˋ ㄌㄧㄤ˙",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "rad_agua_1786603351443"
                },
                {
                    "type": "text",
                    "value": "票 (piào - billete)"
                },
                {
                    "type": "text",
                    "value": "亮 (liàng - brillante)"
                }
            ],
            "notas": "Originalmente agua que fluye brillante y clara. Adjetivo habitual para personas, ropa, paisajes o fotos atractivas.",
            "ejemplos": [
                "你家很漂亮 — Tu casa es muy linda",
                "這張照片很漂亮 — Esta foto es muy hermosa"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty023_duo",
            "espanol": "Mucho / Muchos / Numeroso",
            "tradicional": "多",
            "pinyin": "duō",
            "zhuyin": "ㄉㄨㄛ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "夕 (xī - tarde/luna)"
                },
                {
                    "type": "text",
                    "value": "夕 (xī - tarde/luna)"
                }
            ],
            "notas": "Dos cuartos crecientes de luna superpuestos simbolizando acumulación y abundancia. Antónimo de 少 (shǎo).",
            "ejemplos": [
                "他有很多書 — Él tiene muchos libros",
                "這裡人很多 — Aquí hay mucha gente"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_mty026_haokan",
            "espanol": "Bonito / De buen ver / Atractivo",
            "tradicional": "好看",
            "pinyin": "hǎokàn",
            "zhuyin": "ㄏㄠˇ ㄎㄢˋ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "id_mtvg8jtu_74jmp"
                },
                {
                    "type": "ref",
                    "id": "id_mty001_kan"
                }
            ],
            "notas": "Compuesto por 好 (bueno) y 看 (mirar). Se aplica a películas entretenidas, ropa atractiva o personas de buen ver.",
            "ejemplos": [
                "這張照片很好看 — Esta foto es muy linda",
                "這本書很好看 — Este libro es muy bueno/interesante"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
        },
        {
            "id": "id_voc_keai",
            "espanol": "Tierno / Lindo / Adorable",
            "tradicional": "可愛",
            "pinyin": "kě'ài",
            "zhuyin": "ㄎㄜˇ ㄞˋ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "可 (kě - poder)"
                },
                {
                    "type": "ref",
                    "id": "v2"
                }
            ],
            "notas": "Literalmente 'merecedor de ser amado'. Describe ternura y encanto en mascotas, niños o gestos afectuosos.",
            "ejemplos": [
                "這隻小貓真可愛 — Este gatito es verdaderamente adorable",
                "她笑起來很可愛 — Ella es muy tierna al sonreír"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_gui",
            "espanol": "Caro / Costoso (很貴)",
            "tradicional": "貴",
            "pinyin": "guì",
            "zhuyin": "ㄍㄨㄟˋ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "中 (zhōng - centro)"
                },
                {
                    "type": "text",
                    "value": "貝 (bèi - concha/moneda)"
                }
            ],
            "notas": "Conchas monetarias guardadas en un cofre. Además de precio alto, denota nobleza en fórmulas de cortesía: 您貴姓？",
            "ejemplos": [
                "這本書很貴 — Este libro es muy caro",
                "這棟房子太貴了 — Esta casa es demasiado costosa"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 4
        },
        {
            "id": "id_voc_pianyi",
            "espanol": "Barato / Económico",
            "tradicional": "便宜",
            "pinyin": "piányí",
            "zhuyin": "ㄆㄧㄢˊ ㄧˊ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "ref",
                    "id": "n7"
                },
                {
                    "type": "text",
                    "value": "便 (biàn - conveniente)"
                },
                {
                    "type": "text",
                    "value": "宜 (yí - adecuado)"
                }
            ],
            "notas": "Una transacción conveniente para la persona. Nótese que 便 se pronuncia pián en tono 2 (en fāngbiàn se pronuncia biàn).",
            "ejemplos": [
                "這杯茶很便宜 — Esta taza de té es muy barata",
                "臺灣的水果又好吃又便宜 — Las frutas de Taiwán son ricas y además económicas"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 4
        },
        {
            "id": "id_voc_gao",
            "espanol": "Alto (estatura / altura) (很高)",
            "tradicional": "高",
            "pinyin": "gāo",
            "zhuyin": "ㄍㄠ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "高 (gāo - alto)"
                }
            ],
            "notas": "Pictograma de una torre o mirador elevado con techo y base. Antónimo para estatura humana: 矮 (ǎi); para objetos: 低 (dī).",
            "ejemplos": [
                "他的哥哥很高 — Su hermano mayor es muy alto",
                "這棟樓真高 — Este edificio es sumamente alto"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_ai",
            "espanol": "Bajo (de estatura) (很矮)",
            "tradicional": "矮",
            "pinyin": "ǎi",
            "zhuyin": "ㄞˇ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "矢 (shǐ - flecha)"
                },
                {
                    "type": "text",
                    "value": "委 (wěi - ceder)"
                }
            ],
            "notas": "La longitud corta de una flecha 矢 junto a una mujer inclinada 委. Antónimo exclusivo de 高 para estatura de personas o muebles.",
            "ejemplos": [
                "弟弟比哥哥矮一點 — El hermano menor es un poco más bajo que el mayor",
                "這張桌子太矮了 — Esta mesa es demasiado baja"
            ],
            "fechaCreacion": "2026-09-27"
        },
        {
            "id": "id_voc_xin",
            "espanol": "Nuevo (很新)",
            "tradicional": "新",
            "pinyin": "xīn",
            "zhuyin": "ㄒㄧㄣ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "亲 (qīn - árbol)"
                },
                {
                    "type": "text",
                    "value": "斤 (jīn - hacha)"
                }
            ],
            "notas": "Cortar madera fresca del bosque con un hacha 斤. Antónimo directo para objetos usados o ropa: 舊 (jiù).",
            "ejemplos": [
                "這是一本新書 — Este es un libro nuevo",
                "我們學校的教室都很新 — Las aulas de nuestra escuela son todas muy nuevas"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 4
        },
        {
            "id": "id_voc_jiu",
            "espanol": "Viejo / Usado (para objetos) (很舊)",
            "tradicional": "舊",
            "pinyin": "jiù",
            "zhuyin": "ㄐㄧㄡˋ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "臼 (jiù - mortero)"
                },
                {
                    "type": "text",
                    "value": "隹 (zhuī - ave)"
                }
            ],
            "notas": "Mortero desgastado por el tiempo. Exclusivo para objetos inanimados; para personas ancianas se debe usar 老 (lǎo), nunca 舊.",
            "ejemplos": [
                "這本書很舊，但是很有意思 — Este libro es viejo/usado, pero muy interesante",
                "那棟舊房子在學校後面 — Aquella casa vieja está detrás de la escuela"
            ],
            "fechaCreacion": "2026-09-27",
            "leccion": 4
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
                    "value": "八 (bā - dividir)"
                },
                {
                    "type": "text",
                    "value": "干 (gān - escudo)"
                }
            ],
            "notas": "Dividir una res a la mitad. Tras 點 marca la media hora (九點半 = 9:30); como adjetivo indica mitad (半天 = medio día).",
            "ejemplos": [
                "我們早上八點半上課 — Tomamos clase a las 8:30 de la mañana",
                "我要半個西瓜 — Quiero media sandía"
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
                    "value": "飠(shí - comida)"
                },
                {
                    "type": "text",
                    "value": "包 (bāo - envolver)"
                }
            ],
            "notas": "El estómago envuelto y repleto de comida. Forma el saludo habitual de cortesía en Taiwán: 吃飽了嗎？",
            "ejemplos": [
                "我吃得很飽 — Quedé muy satisfecho / comí muy bien",
                "你飽了嗎？ — ¿Quedaste satisfecho?"
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
                    "value": "丿 (piě - trazo)"
                }
            ],
            "notas": "Un trazo oblicuo que resta aún más a lo pequeño 小. Antónimo de 多 (duō).",
            "ejemplos": [
                "今天教室裡的學生很少 — Hoy hay pocos estudiantes en el salón",
                "你喝很少茶 — Bebes muy poco té"
            ],
            "fechaCreacion": "2026-09-28"
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
                    "value": "好 (hǎo - bueno)"
                },
                {
                    "type": "text",
                    "value": "玩 (wán - jugar)"
                }
            ],
            "notas": "Compuesto por 好 (bueno) y 玩 (jugar). Se predica con 很 para calificar actividades o experiencias entretenidas: 很好玩.",
            "ejemplos": [
                "打棒球和踢足球都很好玩 — Tanto el béisbol como el fútbol son muy divertidos",
                "我覺得中文很好玩 — Pienso que el idioma chino es muy divertido y entretenido"
            ],
            "fechaCreacion": "2026-09-30",
            "leccion": 3
        },
        {
            "id": "id_l4_re",
            "espanol": "Caliente (temperatura de alimentos o clima)",
            "tradicional": "熱",
            "pinyin": "rè",
            "zhuyin": "ㄖㄜˋ",
            "categoria": "adjetivo",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "灬 (huǒ - fuego en base)"
                },
                {
                    "type": "text",
                    "value": "執 (zhí - sostener/ejecutar)"
                }
            ],
            "notas": "Caliente. Se usa tanto para clima (天氣很熱) como para bebidas y comida (熱咖啡, 熱茶, 熱包子). Opuesto a 冷 (lěng) o 冰 (bīng).",
            "ejemplos": [
                "我喜歡喝熱茶，不喜歡喝冰咖啡。 — Me gusta tomar té caliente, no me gusta tomar café helado.",
                "今天的熱包子真好吃！ — ¡Los baozis calientes de hoy están verdaderamente ricos!"
            ],
            "leccion": 4
        }
    ],
    "clasificadores": [
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
                    "value": "固 (gù - sólido)"
                }
            ],
            "notas": "Clasificador universal para personas y objetos generales sin clasificador específico. Se pronuncia en tono neutro leve (ge) o cuarto (gè).",
            "ejemplos": [
                "我有三個家人 — Tengo tres familiares en mi casa",
                "這個人是老師 — Esta persona es profesor",
                "一個學生 — Un estudiante"
            ],
            "fechaCreacion": "2026-08-30",
            "leccion": 2
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
            "notas": "Mnemotecnia: tensar un arco largo. Clasificador para objetos delgados y con superficie plana (fotos, hojas, mesas, billetes).",
            "ejemplos": [
                "一張照片 — Una foto",
                "你有幾張照片？ — ¿Cuántas fotos tienes?",
                "請給我一張紙 — Por favor dame una hoja de papel"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 2
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
                    "value": "隹 (zhuī - ave)"
                },
                {
                    "type": "text",
                    "value": "又 (yòu - mano)"
                }
            ],
            "notas": "Pictograma de una mano sosteniendo un ave. Clasificador para animales y para un elemento de un par natural (una mano, un zapato).",
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
                    "value": "木 (mù - árbol)"
                },
                {
                    "type": "text",
                    "value": "一 (yī - uno)"
                }
            ],
            "notas": "El trazo inferior marca la raíz o base del árbol. Clasificador para volúmenes encuadernados: libros, cuadernos y diccionarios.",
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
                    "value": "木 (mù - madera)"
                },
                {
                    "type": "ref",
                    "id": "a1"
                }
            ],
            "notas": "Antiguamente las copas eran de madera 木 con 不 como elemento fonético. Clasificador para bebidas servidas en tazas o vasos.",
            "ejemplos": [
                "請給我一杯茶 — Por favor dame una taza de té",
                "我喝了一杯烏龍茶 — Tomé una taza de té Oolong",
                "你要喝幾杯咖啡？ — ¿Cuántas tazas de café quieres tomar?"
            ],
            "fechaCreacion": "2026-09-26",
            "leccion": 4
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
                    "value": "立 (lì - erguido)"
                }
            ],
            "notas": "Una persona de pie en su puesto oficial. Clasificador de cortesía para personas respetables (profesores, clientes). Nunca se usa para uno mismo.",
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
                    "value": "并 (bìng - juntar)"
                },
                {
                    "type": "text",
                    "value": "瓦 (wǎ - vasija)"
                }
            ],
            "notas": "Alude a vasijas cerámicas unidas. Clasificador de recipiente para botellas de agua, vino, cerveza o refrescos.",
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
                    "value": "東 (dōng - oriente)"
                }
            ],
            "notas": "Representa la viga cumbrera de madera que sostiene el techo. Clasificador arquitectónico para casas o edificios enteros.",
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
                    "value": "止 (zhǐ - pie)"
                },
                {
                    "type": "text",
                    "value": "戌 (xū - hacha)"
                },
                {
                    "type": "text",
                    "value": "步 (bù - paso)"
                }
            ],
            "notas": "Alude al paso del tiempo marcado por el ciclo de Júpiter. En chino la edad se expresa directamente con el número y 歲, sin verbo 'tener'.",
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
                    "value": "果 (guǒ - fruta)"
                },
                {
                    "type": "text",
                    "value": "頁 (yè - cabeza)"
                }
            ],
            "notas": "Compuesto por fruta redonda y cabeza. Clasificador para objetos esféricos o pequeños: semillas, perlas, dientes y el corazón (一顆心).",
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
                {
                    "type": "text",
                    "value": "門 (mén - puerta)"
                },
                {
                    "type": "text",
                    "value": "日 (rì - sol)"
                }
            ],
            "notas": "Pictograma del sol brillando a través de la rendija de una puerta. Clasificador para habitaciones, aulas y tiendas.",
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
                {
                    "type": "text",
                    "value": "几 (jī - soporte)"
                },
                {
                    "type": "text",
                    "value": "木 (mù - madera)"
                }
            ],
            "notas": "Representa flores colgando de una rama. Clasificador botánico para flores individuales y para nubes flotantes (一朵雲).",
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
                {
                    "type": "text",
                    "value": "門 (mén - puerta)"
                }
            ],
            "notas": "Pictograma de las dos hojas de una puerta de entrada al saber. Clasificador para asignaturas académicas y cursos escolares.",
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
                {
                    "type": "text",
                    "value": "冫 (bīng - hielo)"
                },
                {
                    "type": "text",
                    "value": "欠 (qiàn - aliento)"
                }
            ],
            "notas": "Indica orden sucesivo o repetición. Clasificador verbal pospuesto al verbo para señalar número de veces: 去過三次, 一天兩次.",
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
                    "value": "黑 (hēi - negro)"
                },
                {
                    "type": "text",
                    "value": "占 (zhān - adivinar)"
                }
            ],
            "notas": "Pictograma de gotas negras de hollín. Clasificador para las horas puntuales del reloj (三點 = las tres) y verbo para pedir comida (點菜).",
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
                    "value": "八 (bā - dividir)"
                },
                {
                    "type": "text",
                    "value": "刀 (dāo - cuchillo)"
                }
            ],
            "notas": "Un cuchillo que divide algo en dos partes. Clasificador numeral para minutos de reloj y puntos de calificación.",
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
                    "value": "亥 (hài - jabalí)"
                },
                {
                    "type": "text",
                    "value": "刂 (dāo - cuchillo)"
                }
            ],
            "notas": "Una marca grabada con cuchillo en el cuadrante de un reloj de sol. Clasificador tradicional para cuartos de hora (15 minutos).",
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
                    "value": "日 (rì - sol)"
                }
            ],
            "notas": "Pictograma directo del disco solar. Clasificador formal y escrito para el día del mes (en lenguaje oral cotidiano se usa 號).",
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
                    "value": "口 (kǒu - boca)"
                },
                {
                    "type": "text",
                    "value": "虎 (hǔ - tigre)"
                }
            ],
            "notas": "Gritar o proclamar una marca distintiva. Clasificador oral habitual en Taiwán para el día de la fecha y números identificativos.",
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
                    "value": "此 (cǐ - este)"
                },
                {
                    "type": "text",
                    "value": "二 (èr - dos)"
                }
            ],
            "notas": "Compuesto por 'este' y 'dos' simbolizando multiplicidad. Clasificador plural indefinido para cantidades pequeñas: 一些, 這些, 那些.",
            "ejemplos": [
                "我想買一些花 — Quiero comprar algunas flores",
                "這些書都很新 — Estos libros son muy nuevos"
            ],
            "fechaCreacion": "2026-09-28"
        },
        {
            "id": "id_clf_zhi_phone",
            "espanol": "Clasificador para teléfonos celulares, bolígrafos y objetos delgados",
            "tradicional": "支",
            "pinyin": "zhī",
            "zhuyin": "ㄓ",
            "categoria": "clasificador",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "十 (shí - diez)"
                },
                {
                    "type": "text",
                    "value": "又 (yòu - mano/otra vez)"
                }
            ],
            "notas": "Clasificador fundamental en Taiwán para teléfonos móviles (手機), bolígrafos (筆) y botellas cilíndricas.",
            "ejemplos": [
                "我想買一支新手機。 — Quiero comprar un teléfono celular nuevo.",
                "這支手機要多少錢？ — ¿Cuánto cuesta este teléfono móvil?"
            ],
            "leccion": 4
        },
        {
            "id": "id_clf_kuai",
            "espanol": "Clasificador coloquial de dinero (yuan / NT$) y trozos / pedazos",
            "tradicional": "塊",
            "pinyin": "kuài",
            "zhuyin": "ㄎㄨㄞˋ",
            "categoria": "clasificador",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "土 (tǔ - tierra)"
                },
                {
                    "type": "text",
                    "value": "鬼 (guǐ - fantasma/espíritu)"
                }
            ],
            "notas": "Clasificador por excelencia de la moneda hablada en Taiwán (equivalente a NT$ / dólares / pesos), y para trozos o pedazos (una porción de pastel: 一塊蛋糕).",
            "ejemplos": [
                "一杯熱茶三十五塊。 — Una taza de té caliente cuesta treinta y cinco dólares.",
                "這本書兩百塊錢。 — Este libro cuesta doscientos dólares."
            ],
            "leccion": 4
        },
        {
            "id": "id_clf_zhong",
            "espanol": "Clasificador para tipos, clases, especies o variedades",
            "tradicional": "種",
            "pinyin": "zhǒng",
            "zhuyin": "ㄓㄨㄥˇ",
            "categoria": "clasificador",
            "clasificador": "",
            "radicales": [
                {
                    "type": "text",
                    "value": "禾 (hé - cereal/grano)"
                },
                {
                    "type": "text",
                    "value": "重 (zhòng - pesado)"
                }
            ],
            "notas": "Clasificador para indicar tipos o clases de cosas o personas: 這種類 (este tipo), 很多種 (muchos tipos).",
            "ejemplos": [
                "這家咖啡店有五種茶。 — Esta cafetería tiene cinco tipos de té.",
                "那種手機賣得非常好。 — Ese tipo de teléfono se vende muy bien."
            ],
            "leccion": 4
        }
    ]
};

/**
 * Default classifiers for migration and validation.
 */
const DEFAULT_CLASSIFIERS = SEED_DATA.clasificadores;

/**
 * Structure words for auto-migration.
 */
const NEW_STRUCTURE_WORDS = [
    ...(SEED_DATA.palabras || []),
    ...(SEED_DATA.verbos || []),
    ...(SEED_DATA.adjetivos || []),
    ...(SEED_DATA.adverbios || []),
    ...(SEED_DATA.expresiones || []),
    ...(SEED_DATA.particulas || []),
    ...(SEED_DATA.clasificadores || []),
];
