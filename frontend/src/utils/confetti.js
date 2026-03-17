/**
 * confetti.js — Celebration effects using canvas-confetti
 *
 * Install: npm install canvas-confetti
 *
 * Exported functions:
 *   fireConfetti()          — standard win celebration (green/yellow burst)
 *   fireAchievementConfetti() — achievement unlock (side cannons)
 *   firePerfectScore()      — full screen celebration for 100% score
 */

let _confetti = null

async function getConfetti() {
    if (_confetti) return _confetti
    try {
        const mod = await import('canvas-confetti')
        _confetti = mod.default
        return _confetti
    } catch {
        return null // graceful degradation if package not installed
    }
}

/** Standard confetti burst — use after passing a test (score >= 70%) */
export async function fireConfetti() {
    const confetti = await getConfetti()
    if (!confetti) return

    const colors = ['#C6FF33', '#ffffff', '#a3e635', '#86efac']

    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors,
        startVelocity: 35,
        gravity: 0.9,
        scalar: 1.1,
    })
}

/** Side cannons — for achievement unlocks */
export async function fireAchievementConfetti() {
    const confetti = await getConfetti()
    if (!confetti) return

    const colors = ['#C6FF33', '#facc15', '#ffffff']

    // Left cannon
    confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        startVelocity: 45,
    })
    // Right cannon
    confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        startVelocity: 45,
    })
}

/** Full-screen celebration — for perfect scores or level-ups */
export async function firePerfectScore() {
    const confetti = await getConfetti()
    if (!confetti) return

    const colors = ['#C6FF33', '#facc15', '#f472b6', '#60a5fa', '#ffffff']
    const end = Date.now() + 2500

    const frame = () => {
        if (Date.now() > end) return
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
        })
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
        })
        requestAnimationFrame(frame)
    }

    frame()
}
