/**
 * characterAssets.js — Fuente única de los sprites del personaje por nivel.
 *
 * Importar desde aquí en cualquier componente que muestre el avatar del jugador.
 * Esto evita duplicar los 20+ imports en CharacterProfile, Leaderboard, etc.
 *
 * Uso:
 *   import { PJ_ASSETS, getCharacterImage } from '../constants/characterAssets'
 *
 *   const src = getCharacterImage(user.level)  // imagen exacta para ese nivel
 */

import pj1  from '../assets/pj_lvl_1.png'
import pj2  from '../assets/pj_lvl_2.png'
import pj3  from '../assets/pj_lvl_3.png'
import pj4  from '../assets/pj_lvl_4.png'
import pj5  from '../assets/pj_lvl_5.png'
import pj6  from '../assets/pj_lvl_6.png'
import pj7  from '../assets/pj_lvl_7.png'
import pj8  from '../assets/pj_lvl_8.png'
import pj9  from '../assets/pj_lvl_9.png'
import pj10 from '../assets/pj_lvl_10.png'
import pj11 from '../assets/pj_lvl_11.png'
import pj12 from '../assets/pj_lvl_12.png'
import pj13 from '../assets/pj_lvl_13.png'
import pj14 from '../assets/pj_lvl_14.png'
import pj15 from '../assets/pj_lvl_15.png'
import pj16 from '../assets/pj_lvl_16.png'
import pj17 from '../assets/pj_lvl_17.png'
import pj18 from '../assets/pj_lvl_18.png'
import pj19 from '../assets/pj_lvl_19.png'
import pj20 from '../assets/pj_lvl_20.png'
import newSkinPj20 from '../assets/new_skin_pj_lvl20.png'

/** Mapa nivel → asset importado (Vite hash incluido en build de producción). */
export const PJ_ASSETS = {
    1: pj1,   2: pj2,   3: pj3,   4: pj4,   5: pj5,
    6: pj6,   7: pj7,   8: pj8,   9: pj9,  10: pj10,
   11: pj11, 12: pj12, 13: pj13, 14: pj14, 15: pj15,
   16: pj16, 17: pj17, 18: pj18, 19: pj19, 20: pj20,
}

/** Skin especial del nivel 20, exportada por separado para usos específicos. */
export { newSkinPj20 }

/**
 * Devuelve el asset correcto para el nivel dado.
 * - Nivel 20 → skin especial newSkinPj20
 * - Cualquier otro → PJ_ASSETS[level]
 * - Fuera de rango → fallback pj1
 */
export function getCharacterImage(level) {
    const l = Math.max(1, Math.min(20, level || 1))
    if (l === 20) return newSkinPj20
    return PJ_ASSETS[l] || pj1
}
