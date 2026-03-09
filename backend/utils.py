"""
utils.py — Funciones de utilidad compartidas por todos los routers.

Centralizar aquí evita duplicaciones y garantiza coherencia.
"""


def get_rank_name(level: int) -> str:
    """
    Devuelve el nombre de rango según el nivel del usuario.
    Fuente de verdad única — importar desde aquí en todos los routers.

    Niveles:  1–4  → Estudiante ASIR
              5–9  → Informático Nerd
             10–14 → Técnico Junior
             15–17 → Técnico L3
             18–19 → Admin Senior
                20 → SysAdmin Dios
    """
    rank_map = {
        1:  "🥉 Estudiante ASIR",
        2:  "🥉 Estudiante ASIR",
        3:  "🥉 Estudiante ASIR",
        4:  "🥉 Estudiante ASIR",
        5:  "🥈 Informático Nerd",
        6:  "🥈 Informático Nerd",
        7:  "🥈 Informático Nerd",
        8:  "🥈 Informático Nerd",
        9:  "🥈 Informático Nerd",
        10: "🥇 Técnico Junior",
        11: "🥇 Técnico Junior",
        12: "🥇 Técnico Junior",
        13: "🥇 Técnico Junior",
        14: "🥇 Técnico Junior",
        15: "⚔️ Técnico L3",
        16: "⚔️ Técnico L3",
        17: "⚔️ Técnico L3",
        18: "🛡️ Admin Senior",
        19: "🛡️ Admin Senior",
        20: "👑 SysAdmin Dios",
    }
    if level < 1:
        return "🥉 Estudiante ASIR"
    if level > 20:
        return "👑 SysAdmin Dios"
    return rank_map[level]
