"""
Shared XP/level calculation utilities.
Single source of truth used by both database.py (User.add_xp) and users_admin.py.
"""


def xp_per_level(level: int) -> int:
    """
    XP required to advance from `level` to `level+1`.
    Mirrors User.get_next_level_xp() exactly.
      Levels  1-5 :   800 XP
      Levels  6-10:  1500 XP
      Levels 11-15:  2500 XP
      Levels 16-19:  4000 XP
      Level  20   :  cap (99999)
    """
    if level <= 5:  return 800
    if level <= 10: return 1500
    if level <= 15: return 2500
    if level <= 19: return 4000
    return 99999


def total_xp_to_level(target_level: int) -> int:
    """Total accumulated XP needed to reach target_level from level 1."""
    total = 0
    for lvl in range(1, min(target_level, 20)):
        total += xp_per_level(lvl)
    return total


def compute_level_from_total_xp(total_xp: int) -> tuple[int, int]:
    """
    Given total accumulated XP, return (level, xp_in_current_level).
    Used by admin panel to set XP → auto-compute level.
    """
    remaining = max(0, total_xp)
    level = 1
    while level < 20:
        needed = xp_per_level(level)
        if remaining >= needed:
            remaining -= needed
            level += 1
        else:
            break
    return min(level, 20), remaining if level < 20 else 0
